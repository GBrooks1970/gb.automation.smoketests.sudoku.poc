import * as assert from 'assert';
import request from 'supertest';
import { createApp } from '../../app_src/server/app';
import { EMPTY_CELL, GRID_SIZE } from '../../app_src/constants';

const app = createApp();

async function run(): Promise<void> {
  await healthCheck();
  await puzzleEndpoints();
  await validateEndpoint();
  await techniqueEndpoints();
  await solveEndpoint();
  await visualiseEndpoint();

  console.log('API integration tests: PASS');
}

async function healthCheck(): Promise<void> {
  const response = await request(app).get('/health').expect(200);
  assert.strictEqual(response.body.status, 'ok');
}

async function puzzleEndpoints(): Promise<void> {
  const listResponse = await request(app).get('/api/puzzles').expect(200);
  assert.strictEqual(listResponse.body.count, 5);
  assert.ok(
    listResponse.body.puzzles.some((puzzle: { name: string }) => puzzle.name === 'Easy Scan Grid')
  );

  const puzzleResponse = await request(app).get('/api/puzzles/Easy%20Scan%20Grid').expect(200);
  assert.strictEqual(puzzleResponse.body.name, 'Easy Scan Grid');
  assert.strictEqual(puzzleResponse.body.grid.length, GRID_SIZE);

  const missingResponse = await request(app).get('/api/puzzles/Unknown').expect(404);
  assert.strictEqual(missingResponse.body.error, 'PUZZLE_NOT_FOUND');
}

async function validateEndpoint(): Promise<void> {
  const validResponse = await request(app)
    .post('/api/validate')
    .send({ grid: emptyGrid() })
    .expect(200);
  assert.strictEqual(validResponse.body.valid, true);
  assert.strictEqual(validResponse.body.emptyCells, 81);

  const invalidGrid = emptyGrid();
  invalidGrid[0][0] = 5;
  invalidGrid[0][1] = 5;
  const invalidResponse = await request(app)
    .post('/api/validate')
    .send({ grid: invalidGrid })
    .expect(200);
  assert.strictEqual(invalidResponse.body.valid, false);
  assert.ok(
    invalidResponse.body.conflicts.some(
      (conflict: { type: string; row?: number }) =>
        conflict.type === 'duplicate_in_row' && conflict.row === 0
    )
  );

  const formatResponse = await request(app)
    .post('/api/techniques/unit-completion')
    .send({ grid: [[1, 2, 3]] })
    .expect(400);
  assert.strictEqual(formatResponse.body.error, 'INVALID_GRID_FORMAT');
}

async function techniqueEndpoints(): Promise<void> {
  const unitResponse = await request(app)
    .post('/api/techniques/unit-completion')
    .send({ grid: rowCompletionGrid() })
    .expect(200);
  assert.strictEqual(unitResponse.body.technique, 'UnitCompletion');
  assert.strictEqual(unitResponse.body.changed, true);
  assert.strictEqual(unitResponse.body.gridAfter[0][2], 3);

  const hiddenResponse = await request(app)
    .post('/api/techniques/hidden-singles')
    .send({ grid: hiddenSingleRowGrid(), targetNumber: 6 })
    .expect(200);
  assert.strictEqual(hiddenResponse.body.technique, 'HiddenSingles');
  assert.strictEqual(hiddenResponse.body.targetNumber, 6);
  assert.strictEqual(hiddenResponse.body.changed, true);
  assert.ok(hiddenResponse.body.gridAfter[3].includes(6));

  const targetError = await request(app)
    .post('/api/techniques/hidden-singles')
    .send({ grid: emptyGrid(), targetNumber: 10 })
    .expect(422);
  assert.strictEqual(targetError.body.error, 'INVALID_TARGET_NUMBER');

  const nakedResponse = await request(app)
    .post('/api/techniques/naked-singles')
    .send({ grid: nakedSingleGrid() })
    .expect(200);
  assert.strictEqual(nakedResponse.body.technique, 'NakedSingles');
  assert.strictEqual(nakedResponse.body.changed, true);
  assert.strictEqual(nakedResponse.body.gridAfter[4][4], 9);
}

async function solveEndpoint(): Promise<void> {
  const puzzleResponse = await request(app).get('/api/puzzles/Easy%20Scan%20Grid').expect(200);
  const solveResponse = await request(app)
    .post('/api/solve')
    .send({
      grid: puzzleResponse.body.grid,
      options: { includeIterationHistory: true },
    })
    .expect(200);

  assert.strictEqual(solveResponse.body.success, true);
  assert.strictEqual(solveResponse.body.status, 'SOLVED');
  assert.ok(solveResponse.body.totalChanges > 0);
  assert.ok(solveResponse.body.iterations > 0);
  assert.ok(Array.isArray(solveResponse.body.events));
}

async function visualiseEndpoint(): Promise<void> {
  const pageResponse = await request(app).get('/').expect(200);
  assert.match(pageResponse.text, /Sudoku Solver Visualisation/);

  const visualiseResponse = await request(app).get('/api/visualise/Easy%20Scan%20Grid').expect(200);
  assert.strictEqual(visualiseResponse.body.puzzleName, 'Easy Scan Grid');
  assert.strictEqual(visualiseResponse.body.status, 'SOLVED');
  assert.strictEqual(visualiseResponse.body.initialGrid.length, GRID_SIZE);
  assert.strictEqual(visualiseResponse.body.finalGrid.length, GRID_SIZE);
  assert.ok(Array.isArray(visualiseResponse.body.steps));
  assert.ok(visualiseResponse.body.steps.length > 0);
  assert.strictEqual(
    visualiseResponse.body.statistics.totalSteps,
    visualiseResponse.body.steps.length
  );

  const firstStep = visualiseResponse.body.steps[0];
  assert.strictEqual(firstStep.stepNumber, 1);
  assert.ok(['UnitCompletion', 'HiddenSingles', 'NakedSingles'].includes(firstStep.algorithm));
  assert.strictEqual(typeof firstStep.cell.row, 'number');
  assert.strictEqual(typeof firstStep.cell.col, 'number');

  const { unitCompletion, hiddenSingles, nakedSingles } =
    visualiseResponse.body.statistics.stepsByAlgorithm;
  assert.strictEqual(
    unitCompletion + hiddenSingles + nakedSingles,
    visualiseResponse.body.steps.length
  );

  const missingResponse = await request(app).get('/api/visualise/Unknown').expect(404);
  assert.strictEqual(missingResponse.body.error, 'PUZZLE_NOT_FOUND');
}

function emptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(EMPTY_CELL));
}

function rowCompletionGrid(): number[][] {
  const grid = emptyGrid();
  grid[0] = [1, 2, EMPTY_CELL, 4, 5, 6, 7, 8, 9];
  return grid;
}

function hiddenSingleRowGrid(): number[][] {
  const grid = emptyGrid();
  grid[3] = [1, 2, 3, 4, EMPTY_CELL, 5, 7, 8, 9];
  return grid;
}

function nakedSingleGrid(): number[][] {
  const grid = emptyGrid();
  grid[4][4] = EMPTY_CELL;
  grid[4][0] = 1;
  grid[4][1] = 2;
  grid[4][2] = 3;
  grid[0][4] = 4;
  grid[1][4] = 5;
  grid[2][4] = 6;
  grid[3][3] = 7;
  grid[3][5] = 8;
  return grid;
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
