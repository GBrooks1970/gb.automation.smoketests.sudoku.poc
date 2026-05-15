import { Question } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Question: SolveStatus
 *
 * Returns the string result of the most recent solve attempt:
 *   "SOLVED" | "STUCK_ON_ADVANCED_LOGIC"
 */
export const SolveStatus = {
  current: () =>
    Question.about('the solve status', actor =>
      UseSudokuSolver.as(actor).result
    ),
};
