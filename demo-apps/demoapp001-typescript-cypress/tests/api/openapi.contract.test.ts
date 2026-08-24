import * as assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import addFormats from 'ajv-formats';
import OpenAPIBackend from 'openapi-backend';
import request, { Response } from 'supertest';
import { createApp } from '../../app_src/server/app';
import { SudokuApiService } from '../../app_src/server/SudokuApiService';

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
