import { Question, notes } from '@serenity-js/core';
import { LAST_ERROR, SudokuNotes } from '../support/memory-keys';

/**
 * Question: ErrorThrown
 *
 * Reads LAST_ERROR from Actor Memory — written by SimulateError tasks (MIG-04).
 * Returns the Error instance or null if no error was captured in this scenario.
 */
export const ErrorThrown = {
  last: () =>
    Question.about('the last error thrown', async (actor) => {
      const error = await actor.answer(notes<SudokuNotes>().get(LAST_ERROR));
      return error ?? null;
    }),
};
