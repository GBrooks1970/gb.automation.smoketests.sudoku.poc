import { Question, notes } from '@serenity-js/core';
import { GRID_SNAPSHOT, SudokuNotes } from '../support/memory-keys';

/**
 * Question: GridSnapshot
 *
 * Reads GRID_SNAPSHOT from Actor Memory — written by InitialiseGrid.fromPuzzleNamed().
 * Used by steps that need the original grid for a subsequent initialisation
 * without accessing the Ability directly (MIG-05).
 */
export const GridSnapshot = {
  current: () =>
    Question.about('the stored grid snapshot', async (actor) => {
      const snap = await actor.answer(notes<SudokuNotes>().get(GRID_SNAPSHOT));
      return (snap ?? []) as number[][];
    }),
};
