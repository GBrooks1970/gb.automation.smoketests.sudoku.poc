import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Task: AttemptPlacement
 *
 * Stores a target value and immediately validates the placement at the actor's
 * current target cell. The result is stored in the Ability for PlacementValidity to read.
 */
export const AttemptPlacement = {
  ofValue: (value: number) =>
    Interaction.where(`#actor attempts to place ${value} at the target cell`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.setTargetValue(value);
      const { row, col } = ability.targetCell;
      ability.validateAndStore(row, col, value);
    }),
};
