import { Question, notes } from '@serenity-js/core';
import { VALIDATION_RESULT, SudokuNotes } from '../support/memory-keys';

/**
 * Question: PlacementValidity
 *
 * Reads VALIDATION_RESULT from Actor Memory — written by AttemptPlacement (MIG-04).
 * Returns "VALID" | "INVALID".
 */
export const PlacementValidity = {
  ofLastAttempt: () =>
    Question.about('the placement validity result', async (actor) => {
      const result = await actor.answer(notes<SudokuNotes>().get(VALIDATION_RESULT));
      return result ?? '';
    }),
};
