import { Question } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { EMPTY_CELL, GRID_SIZE } from '../../../app_src/constants';

/**
 * Question: GridCell
 *
 * Provides various read-only views of the current solver grid.
 * All factory functions return side-effect-free Questions.
 */
export const GridCell = {
  at: (row: number, col: number) =>
    Question.about(`grid cell [${row},${col}]`, actor =>
      UseSudokuSolver.as(actor).getSolver().grid[row][col]
    ),

  containsValue: (value: number) =>
    Question.about(`grid contains ${value}`, actor =>
      UseSudokuSolver.as(actor).getSolver().grid.some(r => r.includes(value))
    ),

  allFilled: () =>
    Question.about('all cells filled', actor =>
      UseSudokuSolver.as(actor).getSolver().grid.every(r => r.every(c => c !== EMPTY_CELL))
    ),

  inRow: (row: number, value: number) =>
    Question.about(`${value} in row ${row}`, actor =>
      UseSudokuSolver.as(actor).getSolver().grid[row].includes(value)
    ),

  inColumn: (col: number, value: number) =>
    Question.about(`${value} in column ${col}`, actor =>
      UseSudokuSolver.as(actor).getSolver().grid.some(r => r[col] === value)
    ),

  matchesSnapshot: () =>
    Question.about('grid matches stored snapshot', actor => {
      const ability = UseSudokuSolver.as(actor);
      const grid = ability.getSolver().grid;
      const snapshot = ability.gridSnapshot;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (grid[r][c] !== snapshot[r][c]) return false;
        }
      }
      return true;
    }),

  origMatchesSnapshot: () =>
    Question.about('origGrid matches stored snapshot', actor => {
      const ability = UseSudokuSolver.as(actor);
      const orig = ability.getSolver().origGrid;
      const snapshot = ability.gridSnapshot;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (orig[r][c] !== snapshot[r][c]) return false;
        }
      }
      return true;
    }),

  workingDiffersFromOrig: () =>
    Question.about('working grid differs from origGrid', actor => {
      const solver = UseSudokuSolver.as(actor).getSolver();
      return solver.grid.some((row, r) =>
        row.some((cell, c) => cell !== solver.origGrid[r][c])
      );
    }),

  isValidSolution: () =>
    Question.about('solution is valid (no constraint violations)', actor =>
      UseSudokuSolver.as(actor).isValidSolution()
    ),

  hasEmptyCells: () =>
    Question.about('grid has empty cells', actor =>
      UseSudokuSolver.as(actor).getSolver().grid.some(r => r.some(c => c === EMPTY_CELL))
    ),

  isGridFull: () =>
    Question.about('grid is full', actor =>
      UseSudokuSolver.as(actor).isGridFull()
    ),

  noConstraintViolations: () =>
    Question.about('no constraint violations in filled cells', actor =>
      UseSudokuSolver.as(actor).noConstraintViolations()
    ),
};
