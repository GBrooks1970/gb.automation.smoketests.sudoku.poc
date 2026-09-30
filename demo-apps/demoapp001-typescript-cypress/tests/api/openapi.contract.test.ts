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
