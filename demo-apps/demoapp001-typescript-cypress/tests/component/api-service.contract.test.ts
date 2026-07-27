import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { SudokuApiService } from '../../app_src/server/SudokuApiService';
import { ApiError } from '../../app_src/server/errors';
import {
  buildValidationResponse,
  parseGridRequest,
  parseHiddenSinglesRequest,
} from '../../app_src/server/validation';

const REQUEST_OPTIONS = {
  includeReason: true,
  returnGridSnapshot: true,
};
const SOLVE_OPTIONS = {
  ...REQUEST_OPTIONS,
  includeIterationHistory: false,
};
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

test('request validation maps missing and malformed grids to 400 API errors', () => {
  assertApiError(() => parseGridRequest({}), 400, 'MISSING_GRID');

  const booleanGrid: unknown[][] = emptyGrid();
  booleanGrid[0][0] = true;
  assertApiError(() => parseGridRequest({ grid: booleanGrid }), 400, 'INVALID_GRID_FORMAT');
});

test('Hidden Singles target validation maps out-of-range digits to 422', () => {
  assertApiError(
    () => parseHiddenSinglesRequest({ grid: emptyGrid(), targetNumber: 10 }),
    422,
    'INVALID_TARGET_NUMBER'
  );
});

test('validation responses distinguish clean grids from conflicts', () => {
  assert.equal(buildValidationResponse(emptyGrid()).valid, true);

  const duplicateGrid = emptyGrid();
  duplicateGrid[0][0] = 5;
  duplicateGrid[0][1] = 5;
  const response = buildValidationResponse(duplicateGrid);

  assert.equal(response.valid, false);
  assert.ok(response.conflicts.some((conflict) => conflict.type === 'duplicate_in_row'));
});

test('API solve responses map complete and no-progress grids to public statuses', () => {
  const service = new SudokuApiService();

  const solved = service.executeSolve(SOLVED_GRID, SOLVE_OPTIONS);
  const stuck = service.executeSolve(emptyGrid(), SOLVE_OPTIONS);

  assert.equal(solved.status, 'SOLVED');
  assert.equal(solved.emptyCells, undefined);
  assert.equal(stuck.status, 'STUCK_ON_ADVANCED_LOGIC');
  assert.equal(stuck.emptyCells, 81);
});

test('API puzzle lookup maps unknown names to a 404 API error', () => {
  const service = new SudokuApiService();

  assertApiError(() => service.getPuzzleByName('Unknown'), 404, 'PUZZLE_NOT_FOUND');
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
