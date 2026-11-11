import * as assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import addFormats from 'ajv-formats';
import OpenAPIBackend from 'openapi-backend';
import request, { Response } from 'supertest';
import { createApp } from '../../app_src/server/app';
import { SudokuApiService } from '../../app_src/server/SudokuApiService';
import {
  GeneratorExhaustedError,
  GeneratorTimeoutError,
  PuzzleGeneratorService,
} from '../../app_src/generator';

const app = createApp();
const contract = new OpenAPIBackend({
  definition: path.resolve(__dirname, '../../docs/openapi.yaml'),
  strict: true,
  validate: true,
  customizeAjv: (ajv) => {
    addFormats(ajv);
    return ajv;
  },
});
const contractReady = contract.init();

test('OpenAPI accepts representative success responses from the Express app', async () => {
  const health = await request(app).get('/health').expect(200);
  await assertContractResponse('getHealth', health);

  const technique = await request(app)
    .post('/api/techniques/unit-completion')
    .send({ grid: rowCompletionGrid() })
    .expect(200);
  await assertContractResponse('postUnitCompletion', technique);

  const solve = await request(app).post('/api/solve').send({ grid: solvedGrid() }).expect(200);
  await assertContractResponse('postSolve', solve);

  const hint = await request(app)
    .post('/api/tutor/hint')
    .send({ grid: rowCompletionGrid() })
    .expect(200);
  await assertContractResponse('postTutorHint', hint);

  const generate = await request(app)
    .post('/api/generator/generate')
    .send({ seed: 'openapi-test' })
    .expect(200);
  await assertContractResponse('postGeneratePuzzle', generate);
});

test('OpenAPI accepts representative client-error responses from the Express app', async () => {
  const badRequest = await request(app).post('/api/validate').send({}).expect(400);
  await assertContractResponse('postValidate', badRequest);

  const unprocessable = await request(app)
    .post('/api/techniques/hidden-singles')
    .send({ grid: emptyGrid(), targetNumber: 10 })
    .expect(422);
  await assertContractResponse('postHiddenSingles', unprocessable);

  const notFound = await request(app).get('/api/puzzles/Unknown').expect(404);
  await assertContractResponse('getPuzzleByName', notFound);
});

test('OpenAPI accepts the implemented unexpected-error response', async () => {
  const failingApp = createApp(new FailingPuzzleService());
  const response = await request(failingApp).get('/api/puzzles').expect(500);

  await assertContractResponse('getPuzzles', response);
});

test('OpenAPI accepts a real exhausted-generator response with no puzzle payload', async () => {
  const response = await request(app)
    .post('/api/generator/generate')
    .send({ difficulty: 'Expert', clueCount: 81, seed: 'review-proof' })
    .expect(422);
  const { requestId, ...body } = response.body;
  assert.equal(typeof requestId, 'string');
  assert.deepEqual(body, {
    success: false,
    error: 'GENERATOR_EXHAUSTED',
    message:
      "Could not generate a solvable Expert Sudoku puzzle within 5 attempts for seed 'review-proof'.",
    details: { seed: 'review-proof', targetDifficulty: 'Expert', attempts: 5 },
  });
  await assertContractResponse('postGeneratePuzzle', response);
});

test('error-mapping seam: untargeted exhaustion omits targetDifficulty from API details', async (context) => {
  // Controlled domain-error seam; native bounded exhaustion is covered above.
  context.mock.method(PuzzleGeneratorService.prototype, 'generatePuzzle', (): never => {
    throw new GeneratorExhaustedError('untargeted-error-seam', undefined, 5);
  });
  const response = await request(app)
    .post('/api/generator/generate')
    .send({ seed: 'untargeted-error-seam' })
    .expect(422);

  assert.equal(response.body.success, false);
  assert.equal(response.body.error, 'GENERATOR_EXHAUSTED');
  assert.deepEqual(response.body.details, { seed: 'untargeted-error-seam', attempts: 5 });
  assert.equal('grid' in response.body, false);
  assert.equal('solution' in response.body, false);
  await assertContractResponse('postGeneratePuzzle', response);
});

test('error-mapping seam: construction timeout remains a separate documented 422 failure', async (context) => {
  context.mock.method(PuzzleGeneratorService.prototype, 'generatePuzzle', (): never => {
    throw new GeneratorTimeoutError(10001, 10000);
  });
  const response = await request(app)
    .post('/api/generator/generate')
    .send({ seed: 'construction-timeout-seam' })
    .expect(422);

  assert.equal(response.body.success, false);
  assert.equal(response.body.error, 'GENERATOR_TIMEOUT');
  assert.equal('details' in response.body, false);
  assert.equal('grid' in response.body, false);
  await assertContractResponse('postGeneratePuzzle', response);
});

test('error-mapping seam: unexpected generator failures retain the documented 500 response', async (context) => {
  context.mock.method(PuzzleGeneratorService.prototype, 'generatePuzzle', (): never => {
    throw new Error('controlled unexpected generator failure');
  });
  const response = await request(app)
    .post('/api/generator/generate')
    .send({ seed: 'unexpected-error-seam' })
    .expect(500);
  const { requestId, ...body } = response.body;
  assert.equal(typeof requestId, 'string');
  assert.deepEqual(body, {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
  await assertContractResponse('postGeneratePuzzle', response);
});

test('OpenAPI rejects an intentionally drifted response', async () => {
  const response = await request(app).get('/health').expect(200);
  const driftedBody: Record<string, unknown> = { ...response.body };
  delete driftedBody.timestamp;

  const validation = await validateResponse('getHealth', response.status, driftedBody);

  assert.equal(validation.valid, false, 'missing required timestamp was accepted');
  assert.ok(validation.errors?.some((error) => error.keyword === 'required'));
});

test('OpenAPI validates generator request schemas for string/numeric seeds and invalid options', async () => {
  await contractReady;

  const validString = await validateRequest('postGeneratePuzzle', { seed: 'string-seed' });
  assert.equal(validString.valid, true);

  const validNumeric = await validateRequest('postGeneratePuzzle', { seed: 12345 });
  assert.equal(validNumeric.valid, true);

  const validFull = await validateRequest('postGeneratePuzzle', {
    difficulty: 'Hard',
    seed: 99999,
    symmetrical: false,
    clueCount: 28,
  });
  assert.equal(validFull.valid, true);

  const invalidSeedType = await validateRequest('postGeneratePuzzle', { seed: true });
  assert.equal(invalidSeedType.valid, false);

  const invalidDifficulty = await validateRequest('postGeneratePuzzle', { difficulty: 'Extreme' });
  assert.equal(invalidDifficulty.valid, false);

  const invalidClueCount = await validateRequest('postGeneratePuzzle', { clueCount: 10 });
  assert.equal(invalidClueCount.valid, false);
});

test('OpenAPI accepts a real generated-puzzle response using a numeric seed', async () => {
  const response = await request(app)
    .post('/api/generator/generate')
    .send({ seed: 424242, difficulty: 'Easy' })
    .expect(200);

  assert.equal(typeof response.body.seed, 'string');
  assert.equal(response.body.difficulty, 'Easy');
  await assertContractResponse('postGeneratePuzzle', response);
});

test('OpenAPI accepts all generator validation error codes (400) from the Express app', async () => {
  // INVALID_DIFFICULTY
  const invalidDiff = await request(app)
    .post('/api/generator/generate')
    .send({ difficulty: 'Impossible' })
    .expect(400);
  assert.equal(invalidDiff.body.error, 'INVALID_DIFFICULTY');
  await assertContractResponse('postGeneratePuzzle', invalidDiff);

  // INVALID_CLUE_COUNT
  const invalidClues = await request(app)
    .post('/api/generator/generate')
    .send({ clueCount: 10 })
    .expect(400);
  assert.equal(invalidClues.body.error, 'INVALID_CLUE_COUNT');
  await assertContractResponse('postGeneratePuzzle', invalidClues);

  // INVALID_SYMMETRICAL_OPTION
  const invalidSymm = await request(app)
    .post('/api/generator/generate')
    .send({ symmetrical: 'yes' })
    .expect(400);
  assert.equal(invalidSymm.body.error, 'INVALID_SYMMETRICAL_OPTION');
  await assertContractResponse('postGeneratePuzzle', invalidSymm);

  // INVALID_SEED
  const invalidSeed = await request(app)
    .post('/api/generator/generate')
    .send({ seed: { nested: 'bad' } })
    .expect(400);
  assert.equal(invalidSeed.body.error, 'INVALID_SEED');
  await assertContractResponse('postGeneratePuzzle', invalidSeed);
});

test('OpenAPI accepts 400 INVALID_URL_ENCODING for malformed percent-escapes and preserves 500 for internal URIError', async () => {
  const puzzleMalformed = await request(app).get('/api/puzzles/%ZZ').expect(400);
  assert.equal(puzzleMalformed.body.success, false);
  assert.equal(puzzleMalformed.body.error, 'INVALID_URL_ENCODING');
  assert.equal(typeof puzzleMalformed.body.requestId, 'string');
  await assertContractResponse('getPuzzleByName', puzzleMalformed);

  const visualiseMalformed = await request(app).get('/api/visualise/%ZZ').expect(400);
  assert.equal(visualiseMalformed.body.success, false);
  assert.equal(visualiseMalformed.body.error, 'INVALID_URL_ENCODING');
  assert.equal(typeof visualiseMalformed.body.requestId, 'string');
  await assertContractResponse('getVisualise', visualiseMalformed);

  const failingUriApp = createApp(new UnexpectedUriErrorPuzzleService());
  const internalUriFailure = await request(failingUriApp)
    .get('/api/puzzles/Easy%20Scan%20Grid')
    .expect(500);
  assert.equal(internalUriFailure.body.success, false);
  assert.equal(internalUriFailure.body.error, 'INTERNAL_SERVER_ERROR');
  await assertContractResponse('getPuzzleByName', internalUriFailure);
});

async function validateRequest(_operationId: string, body: unknown) {
  await contractReady;
  return contract.validateRequest({
    path: '/api/generator/generate',
    method: 'post',
    body,
    headers: {},
  });
}

async function assertContractResponse(operationId: string, response: Response): Promise<void> {
  const validation = await validateResponse(operationId, response.status, response.body);
  assert.equal(
    validation.valid,
    true,
    `${operationId} ${response.status} response drifted from OpenAPI:\n${JSON.stringify(
      validation.errors,
      null,
      2
    )}`
  );
}

async function validateResponse(operationId: string, status: number, body: unknown) {
  await contractReady;
  return contract.validateResponse(body, operationId, status);
}

class FailingPuzzleService extends SudokuApiService {
  override listPuzzles(): never {
    throw new Error('intentional contract-test failure');
  }
}

class UnexpectedUriErrorPuzzleService extends SudokuApiService {
  override getPuzzleByName(): never {
    throw new URIError('intentional internal URIError failure');
  }
}

function emptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function rowCompletionGrid(): number[][] {
  const grid = emptyGrid();
  grid[0] = [1, 2, 0, 4, 5, 6, 7, 8, 9];
  return grid;
}

function solvedGrid(): number[][] {
  return [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
}
