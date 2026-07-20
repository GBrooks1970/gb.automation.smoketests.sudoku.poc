import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { ALGORITHM_PROGRESS, SudokuNotes } from '../support/memory-keys';

/**
 * Task: ApplyAlgorithm
 *
 * Factory functions returning Interactions that invoke one of the three
 * basic solving algorithms on the current grid.
 * Writes ALGORITHM_PROGRESS to Actor Memory after each call (RA §3.3, MIG-04).
 */
export const ApplyAlgorithm = {
  unitCompletion: () =>
    Interaction.where('#actor applies the Unit Completion algorithm', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.applyUnitCompletion();
      await notes<SudokuNotes>()
        .set(ALGORITHM_PROGRESS, ability.algorithmMadeProgress)
        .performAs(actor);
    }),

  hiddenSingles: (forDigit: number) =>
    Interaction.where(
      `#actor applies the Hidden Singles algorithm for digit ${forDigit}`,
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.applyHiddenSingles(forDigit);
        await notes<SudokuNotes>()
          .set(ALGORITHM_PROGRESS, ability.algorithmMadeProgress)
          .performAs(actor);
      }
    ),

  nakedSingles: () =>
    Interaction.where('#actor applies the Naked Singles algorithm', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.applyNakedSingles();
      await notes<SudokuNotes>()
        .set(ALGORITHM_PROGRESS, ability.algorithmMadeProgress)
        .performAs(actor);
    }),
};
