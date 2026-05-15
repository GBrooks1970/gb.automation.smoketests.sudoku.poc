import { Question } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Question: ErrorThrown
 *
 * Returns the last Error captured during a setup or interaction step,
 * or null if no error was thrown. Checks solver error first, then puzzle-loader error.
 */
export const ErrorThrown = {
  last: () =>
    Question.about('the last error thrown', actor =>
      UseSudokuSolver.as(actor).solverError ??
      LoadPuzzles.as(actor).getError()
    ),
};
