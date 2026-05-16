import { Question, notes } from '@serenity-js/core';
import { SOLVE_RESULT, SudokuNotes } from '../support/memory-keys';

/**
 * Question: SolveStatus
 *
 * Reads SOLVE_RESULT from Actor Memory — written by SolvePuzzle tasks (MIG-04).
 * Returns "SOLVED" | "STUCK_ON_ADVANCED_LOGIC".
 */
export const SolveStatus = {
  current: () =>
    Question.about('the solve status', async actor => {
      const status = await actor.answer(notes<SudokuNotes>().get(SOLVE_RESULT));
      return status ?? '';
    }),
};
