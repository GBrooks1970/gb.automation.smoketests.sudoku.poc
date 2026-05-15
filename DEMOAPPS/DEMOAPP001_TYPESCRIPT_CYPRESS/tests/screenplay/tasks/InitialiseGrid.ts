import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { GRID_SIZE, EMPTY_CELL } from '../../../app_src/constants';

/**
 * Task: InitialiseGrid
 *
 * Factory functions returning Interactions that create a new SudokuSolver
 * in various starting states. Each method maps to a specific Gherkin Given variant.
 */
export const InitialiseGrid = {
  empty: () =>
    Interaction.where('#actor initialises an empty Sudoku grid', async actor => {
      UseSudokuSolver.as(actor).initialise('test');
    }),

  withRowValues: (options: { row: number; values: number[] }) => {
    const grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(EMPTY_CELL)
    );
    grid[options.row] = [...options.values];
    return Interaction.where(
      `#actor initialises a grid with row ${options.row} set`,
      async actor => {
        UseSudokuSolver.as(actor).initialise('test', grid);
      }
    );
  },

  fromPuzzle: (puzzle: { name: string; grid: number[][] }) =>
    Interaction.where(`#actor initialises a grid from puzzle "${puzzle.name}"`, async actor => {
      UseSudokuSolver.as(actor).initialise(puzzle.name, puzzle.grid);
    }),

  withGrid: (name: string, grid: number[][]) =>
    Interaction.where(`#actor initialises a grid from provided values`, async actor => {
      UseSudokuSolver.as(actor).initialise(name, grid);
    }),

  withCompleteGrid: (grid: number[][]) =>
    Interaction.where(`#actor initialises a completed Sudoku grid`, async actor => {
      UseSudokuSolver.as(actor).initialise('complete', grid);
    }),

  withDuplicateInRow: (rowIndex: number, value: number) =>
    Interaction.where(
      `#actor initialises a grid with duplicate ${value} in row ${rowIndex}`,
      async actor => {
        UseSudokuSolver.as(actor).setupWithDuplicateInRow(rowIndex, value);
      }
    ),
};
