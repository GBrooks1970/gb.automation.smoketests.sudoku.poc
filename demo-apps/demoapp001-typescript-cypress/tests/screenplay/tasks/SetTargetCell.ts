import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { TARGET_CELL, SudokuNotes } from '../support/memory-keys';

/**
 * Task: SetTargetCell
 *
 * Records which cell subsequent placement and validation operations apply to.
 * Writes TARGET_CELL to Actor Memory so valuesInRow/Column/Block tasks can
 * retrieve it without steps accessing the Ability directly (MIG-05).
 */
export const SetTargetCell = {
  at: (row: number, col: number) =>
    Interaction.where(`#actor targets cell [${row},${col}]`, async actor => {
      UseSudokuSolver.as(actor).setTargetCell(row, col);
      await notes<SudokuNotes>().set(TARGET_CELL, { row, col }).performAs(actor);
    }),
};
