import { Question } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Question: PlacementValidity
 *
 * Returns the validation result for the most recent AttemptPlacement task:
 *   "VALID" | "INVALID"
 */
export const PlacementValidity = {
  ofLastAttempt: () =>
    Question.about('the placement validity result', actor =>
      UseSudokuSolver.as(actor).validationResult
    ),
};
