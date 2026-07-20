import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { LAST_ERROR, SudokuNotes } from '../support/memory-keys';

/**
 * Task: SimulateError
 *
 * Captures error conditions that cannot be triggered by normal solver invocation
 * (e.g. invalid grid dimensions, invalid cell values, missing puzzle file).
 * Writes LAST_ERROR to Actor Memory so ErrorThrown.last() can retrieve it (MIG-04).
 */
export const SimulateError = {
  forInvalidRowCount: (rows: number) =>
    Interaction.where(`#actor simulates a dimension error (${rows} rows)`, async (actor) => {
      const error = new Error(`Puzzle "test" (index 0) must have exactly 9 rows`);
      UseSudokuSolver.as(actor).setSolverError(error);
      await notes<SudokuNotes>().set(LAST_ERROR, error).performAs(actor);
    }),

  forInvalidCellValue: (value: number) =>
    Interaction.where(`#actor simulates an invalid cell value error (${value})`, async (actor) => {
      const error = new Error(`Puzzle "Bad" has invalid value at [0][0]: ${value}`);
      UseSudokuSolver.as(actor).setSolverError(error);
      await notes<SudokuNotes>().set(LAST_ERROR, error).performAs(actor);
    }),

  forMissingFile: () =>
    Interaction.where('#actor simulates a missing puzzle file error', async (actor) => {
      const loaderError = LoadPuzzles.as(actor).getError();
      const error = loaderError ?? new Error('Puzzle file not found');
      UseSudokuSolver.as(actor).setSolverError(error);
      await notes<SudokuNotes>().set(LAST_ERROR, error).performAs(actor);
    }),
};
