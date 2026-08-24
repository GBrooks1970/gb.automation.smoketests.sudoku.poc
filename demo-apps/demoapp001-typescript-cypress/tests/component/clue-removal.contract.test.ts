import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generateCompleteSolution,
  isValidPartialGrid,
  reduceToClues,
  UniquenessOracle,
} from '../../app_src/generator';
import { parseGridRequest } from '../../app_src/server/validation';

const KNOWN_UNIQUE_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const KNOWN_NON_UNIQUE_PUZZLE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const CONFLICTING_INVALID_GRID = [
  [5, 5, 0, 0, 7, 0, 0, 0, 0], // Row duplicate 5
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

test('UniquenessOracle correctly evaluates solution count boundaries', () => {
  const uniqueCount = UniquenessOracle.countSolutions(KNOWN_UNIQUE_PUZZLE);
  assert.equal(uniqueCount, 1);

  const nonUniqueCount = UniquenessOracle.countSolutions(KNOWN_NON_UNIQUE_PUZZLE);
  assert.equal(nonUniqueCount, 2); // Early exits at limit 2

  const invalidCount = UniquenessOracle.countSolutions(CONFLICTING_INVALID_GRID);
  assert.equal(invalidCount, 0);
});

test('reduceToClues produces a uniquely solvable Sudoku puzzle grid', () => {
  const solution = generateCompleteSolution(12345);
  const result = reduceToClues(solution, 32, 12345, true);

  assert.ok(result.clueCount <= 36);
  assert.equal(UniquenessOracle.countSolutions(result.grid, 2), 1);
});

test('reduceToClues produces 180-degree rotationally symmetric clue grids when requested', () => {
  const solution = generateCompleteSolution(9999);
  const result = reduceToClues(solution, 34, 9999, true);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const isClue1 = result.grid[r][c] !== 0;
      const isClue2 = result.grid[8 - r][8 - c] !== 0;
      assert.equal(
        isClue1,
        isClue2,
        `Symmetry violation at cell (${r},${c}) vs (${8 - r},${8 - c})`
      );
    }
  }
});

test('reduceToClues supports non-symmetrical clue reduction', () => {
  const solution = generateCompleteSolution(7777);
  const result = reduceToClues(solution, 30, 7777, false);

  assert.ok(result.clueCount <= 34);
  assert.equal(UniquenessOracle.countSolutions(result.grid, 2), 1);
});

test('emitted puzzle grid passes structure, constraint, and API schema validation', () => {
  const solution = generateCompleteSolution(8888);
  const result = reduceToClues(solution, 32, 8888, true);

  assert.equal(isValidPartialGrid(result.grid), true);

  const parsed = parseGridRequest({ grid: result.grid });
  assert.deepEqual(parsed.grid, result.grid);
});

test('clue reduction completes within performance budget (< 150ms total)', () => {
  const startTime = Date.now();

  const solution = generateCompleteSolution(5555);
  const result = reduceToClues(solution, 32, 5555, true);

  const totalTimeMs = Date.now() - startTime;

  assert.ok(totalTimeMs < 150, `Clue reduction time (${totalTimeMs}ms) exceeded 150ms budget.`);
  assert.equal(UniquenessOracle.countSolutions(result.grid, 2), 1);
});
