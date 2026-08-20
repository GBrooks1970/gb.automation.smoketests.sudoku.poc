import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { SudokuSolver } from '../../app_src/SudokuSolver';

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

test('Unit Completion fills a single missing cell', () => {
  const solver = new SudokuSolver('unit completion', SOLVED_EXCEPT_ONE);

  assert.equal(solver.unitCompletion(), true);
  assert.equal(solver.getGrid()[0][8], 2);
});

test('Hidden Singles places a digit at its only row candidate', () => {
  const grid = emptyGrid();
  grid[3] = [1, 2, 3, 4, 0, 5, 7, 8, 9];
  const solver = new SudokuSolver('hidden single', grid);

  assert.equal(solver.hiddenSingles(6), true);
  assert.equal(solver.getGrid()[3][4], 6);
});

test('Naked Singles fills a cell with one remaining candidate', () => {
  const grid = emptyGrid();
  grid[4][0] = 1;
  grid[4][1] = 2;
  grid[4][2] = 3;
  grid[0][4] = 4;
  grid[1][4] = 5;
  grid[2][4] = 6;
  grid[3][3] = 7;
  grid[3][5] = 8;
  const solver = new SudokuSolver('naked single', grid);

  assert.equal(solver.nakedSingles(), true);
  assert.equal(solver.getGrid()[4][4], 9);
});

test('Naked Pairs eliminates candidates in a row to place a single', () => {
  const grid = emptyGrid();
  grid[0] = [0, 0, 0, 1, 3, 5, 6, 8, 9];
  grid[4][0] = 4;
  grid[5][1] = 4;
  const solver = new SudokuSolver('naked pair row', grid);

  assert.equal(solver.nakedPairs(), true);
  assert.equal(solver.getGrid()[0][2], 4);
});

test('Naked Pairs returns false when no naked pairs exist', () => {
  const grid = emptyGrid();
  const solver = new SudokuSolver('no naked pairs', grid);

  assert.equal(solver.nakedPairs(), false);
});

function emptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}
