import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { VALIDATION_RESULT, SudokuNotes } from '../support/memory-keys';

/**
 * Task: AttemptPlacement
 *
 * Stores a target value and immediately validates the placement at the actor's
 * current target cell. Writes VALIDATION_RESULT to Actor Memory (RA §3.3, MIG-04).
 */
export const AttemptPlacement = {
  ofValue: (value: number) =>
    Interaction.where(`#actor attempts to place ${value} at the target cell`, async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.setTargetValue(value);
      const { row, col } = ability.targetCell;
      ability.validateAndStore(row, col, value);
      await notes<SudokuNotes>().set(VALIDATION_RESULT, ability.validationResult).performAs(actor);
    }),
};
