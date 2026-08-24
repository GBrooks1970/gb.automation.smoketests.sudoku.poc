import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  gradePuzzle,
  isValidPartialGrid,
  PuzzleGeneratorService,
  UniquenessOracle,
} from '../../app_src/generator';

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

const EASY_PUZZLE = [
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

test('gradePuzzle evaluates difficulty and technique metadata for solved and partial grids', () => {
  const solvedGrade = gradePuzzle(SOLVED_GRID);
  assert.equal(solvedGrade.isSolvable, true);
  assert.equal(solvedGrade.difficulty, 'Easy');

  const easyGrade = gradePuzzle(EASY_PUZZLE);
  assert.equal(easyGrade.isSolvable, true);
  assert.ok(['Easy', 'Medium', 'Hard', 'Expert'].includes(easyGrade.difficulty));
});

test('PuzzleGeneratorService generates complete governed puzzle with valid schema', () => {
  const service = new PuzzleGeneratorService();
  const puzzle = service.generatePuzzle({ seed: 12345, symmetrical: true });

  assert.equal(puzzle.seed, '12345');
  assert.equal(puzzle.symmetrical, true);
  assert.ok(puzzle.clueCount >= 17 && puzzle.clueCount <= 81);
  assert.ok(['Easy', 'Medium', 'Hard', 'Expert'].includes(puzzle.difficulty));

  assert.equal(isValidPartialGrid(puzzle.grid), true);
  assert.equal(UniquenessOracle.countSolutions(puzzle.grid, 2), 1);
});

test('PuzzleGeneratorService is 100% seed-deterministic across consecutive executions', () => {
  const service = new PuzzleGeneratorService();
  const puzzle1 = service.generatePuzzle({ seed: 'portfolio-demo-seed', clueCount: 34 });
  const puzzle2 = service.generatePuzzle({ seed: 'portfolio-demo-seed', clueCount: 34 });

  assert.deepEqual(puzzle1, puzzle2);
});

test('PuzzleGeneratorService generates rotationally symmetric puzzles when requested', () => {
  const service = new PuzzleGeneratorService();
  const puzzle = service.generatePuzzle({ seed: 8888, symmetrical: true });

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const isClue1 = puzzle.grid[r][c] !== 0;
      const isClue2 = puzzle.grid[8 - r][8 - c] !== 0;
      assert.equal(isClue1, isClue2);
    }
  }
});
