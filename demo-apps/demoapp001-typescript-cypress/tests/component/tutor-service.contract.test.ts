import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { SudokuTutorService } from '../../app_src/server/SudokuTutorService';
import { ApiError } from '../../app_src/server/errors';
import { buildValidationResponse, parseTutorHintRequest } from '../../app_src/server/validation';

const SOLVED_GRID = [
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

const SOLVED_EXCEPT_ONE = [
  [5, 3, 4, 6, 7, 8, 9, 1, 0],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

test('SudokuTutorService returns UnitCompletion hint on a unit with 8 filled cells', () => {
  const service = new SudokuTutorService();
  const hint = service.getHint(SOLVED_EXCEPT_ONE);

  assert.equal(hint.success, true);
  assert.equal(hint.status, 'HINT_AVAILABLE');
  assert.equal(hint.technique, 'UnitCompletion');
  assert.ok(hint.move !== null);
  assert.equal(hint.move.cell.row, 0);
  assert.equal(hint.move.cell.col, 8);
  assert.equal(hint.move.digit, 2);
  assert.ok(hint.rationale.includes('Row 1'));
  assert.ok(hint.rationale.includes('2'));
  assert.deepEqual(hint.highlightCells, [{ row: 0, col: 8 }]);
});

test('SudokuTutorService returns HiddenSingles hint when a single digit is forced in a unit', () => {
  const service = new SudokuTutorService();
  const grid = emptyGrid();
  grid[3] = [1, 2, 3, 4, 0, 5, 7, 8, 9];

  const hint = service.getHint(grid);
  assert.equal(hint.success, true);
  assert.equal(hint.status, 'HINT_AVAILABLE');
  assert.ok(hint.move !== null);
  assert.equal(hint.move.cell.row, 3);
  assert.equal(hint.move.cell.col, 4);
  assert.equal(hint.move.digit, 6);
});

test('SudokuTutorService returns NakedSingles hint when only 1 candidate remains in a cell', () => {
  const service = new SudokuTutorService();
  const grid = emptyGrid();
  grid[4][0] = 1;
  grid[4][1] = 2;
  grid[4][2] = 3;
  grid[0][4] = 4;
  grid[1][4] = 5;
  grid[2][4] = 6;
  grid[3][3] = 7;
  grid[3][5] = 8;

  const hint = service.getHint(grid);
  assert.equal(hint.success, true);
  assert.equal(hint.status, 'HINT_AVAILABLE');
  assert.equal(hint.technique, 'NakedSingles');
  assert.ok(hint.move !== null);
  assert.equal(hint.move.cell.row, 4);
  assert.equal(hint.move.cell.col, 4);
  assert.equal(hint.move.digit, 9);
  assert.ok(hint.rationale.includes('candidate remaining: 9'));
});

test('SudokuTutorService returns NakedPairs hint when a naked pair unlocks a cell', () => {
  const service = new SudokuTutorService();
  const grid = emptyGrid();
  grid[0] = [0, 0, 0, 0, 0, 6, 7, 8, 9];

  grid[4][0] = 3;
  grid[5][0] = 4;
  grid[6][0] = 5;

  grid[7][1] = 3;
  grid[8][1] = 4;
  grid[2][1] = 5;

  grid[7][2] = 1;
  grid[1][2] = 3;
  grid[3][2] = 5;

  grid[8][3] = 5;
  grid[1][4] = 5;

  const hint = service.getHint(grid);
  assert.equal(hint.success, true);
  assert.equal(hint.status, 'HINT_AVAILABLE');
  assert.equal(hint.technique, 'NakedPairs');
  assert.ok(hint.move !== null);
  assert.equal(hint.move.cell.row, 0);
  assert.equal(hint.move.cell.col, 2);
  assert.equal(hint.move.digit, 4);
  assert.ok(hint.rationale.includes('Naked Pair'));
});

test('SudokuTutorService returns X-Wing hint when an X-Wing fish pattern unlocks a cell', () => {
  const service = new SudokuTutorService();
  const grid = emptyGrid();

  grid[1][0] = 1;
  grid[1][2] = 2;
  grid[1][4] = 5;
  grid[1][5] = 6;
  grid[1][6] = 8;
  grid[1][8] = 9;

  grid[4][0] = 9;
  grid[4][2] = 8;
  grid[4][4] = 3;
  grid[4][5] = 5;
  grid[4][6] = 2;
  grid[4][8] = 1;

  grid[8][3] = 7;

  grid[7][0] = 8;
  grid[7][2] = 9;
  grid[7][3] = 5;
  grid[7][4] = 2;
  grid[7][5] = 4;
  grid[7][6] = 1;
  grid[7][8] = 6;

  const hint = service.getHint(grid);
  assert.equal(hint.success, true);
  assert.equal(hint.status, 'HINT_AVAILABLE');
  assert.equal(hint.technique, 'XWing');
  assert.ok(hint.move !== null);
  assert.equal(hint.move.cell.row, 7);
  assert.equal(hint.move.cell.col, 1);
  assert.equal(hint.move.digit, 3);
  assert.ok(hint.rationale.includes('X-Wing'));
});

test('SudokuTutorService classifies already-solved grid as SOLVED', () => {
  const service = new SudokuTutorService();
  const hint = service.getHint(SOLVED_GRID);

  assert.equal(hint.success, true);
  assert.equal(hint.status, 'SOLVED');
  assert.equal(hint.technique, 'None');
  assert.equal(hint.move, null);
  assert.deepEqual(hint.highlightCells, []);
  assert.ok(hint.rationale.includes('completely and correctly solved'));
});

test('SudokuTutorService classifies empty / stuck grid as STUCK_ON_ADVANCED_LOGIC', () => {
  const service = new SudokuTutorService();
  const hint = service.getHint(emptyGrid());

  assert.equal(hint.success, true);
  assert.equal(hint.status, 'STUCK_ON_ADVANCED_LOGIC');
  assert.equal(hint.technique, 'None');
  assert.equal(hint.move, null);
  assert.ok(hint.rationale.includes('No further progress'));
});

test('SudokuTutorService classifies conflicting duplicate digits as INVALID_GRID', () => {
  const service = new SudokuTutorService();
  const duplicateGrid = emptyGrid();
  duplicateGrid[0][0] = 5;
  duplicateGrid[0][1] = 5;

  const hint = service.getHint(duplicateGrid);
  assert.equal(hint.success, true);
  assert.equal(hint.status, 'INVALID_GRID');
  assert.equal(hint.technique, 'None');
  assert.equal(hint.move, null);
  assert.ok(hint.highlightCells.length >= 2);
});

test('SudokuTutorService preserves input grid immutability without mutation', () => {
  const service = new SudokuTutorService();
  const inputGrid = SOLVED_EXCEPT_ONE.map((row) => [...row]);
  const copyBefore = JSON.stringify(inputGrid);

  service.getHint(inputGrid);

  assert.equal(JSON.stringify(inputGrid), copyBefore, 'input grid was mutated');
});

test('parseTutorHintRequest validates missing and malformed payloads', () => {
  assertApiError(() => parseTutorHintRequest({}), 400, 'MISSING_GRID');

  const booleanGrid: unknown[][] = emptyGrid();
  booleanGrid[0][0] = true;
  assertApiError(() => parseTutorHintRequest({ grid: booleanGrid }), 400, 'INVALID_GRID_FORMAT');
});

function assertApiError(action: () => unknown, statusCode: number, code: string): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.statusCode, statusCode);
    assert.equal(error.code, code);
    return true;
  });
}

function emptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}
