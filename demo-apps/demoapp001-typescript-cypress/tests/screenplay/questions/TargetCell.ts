import { Question, notes } from '@serenity-js/core';
import { TARGET_CELL, SudokuNotes } from '../support/memory-keys';

/**
 * Question: TargetCell
 *
 * Reads TARGET_CELL from Actor Memory — written by SetupGridState.targetCell()
 * and SetupGridState.threeCandidates() (MIG-04/05).
 */
export const TargetCell = {
  current: () =>
    Question.about('the current target cell coordinates', async (actor) => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      return tc ?? { row: 0, col: 0 };
    }),
};
