import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Task: ApplyAlgorithm
 *
 * Factory functions returning Interactions that invoke one of the three
 * basic solving algorithms on the current grid.
 */
export const ApplyAlgorithm = {
  unitCompletion: () =>
    Interaction.where('#actor applies the Unit Completion algorithm', async actor => {
      UseSudokuSolver.as(actor).applyUnitCompletion();
    }),

  hiddenSingles: (forDigit: number) =>
    Interaction.where(
      `#actor applies the Hidden Singles algorithm for digit ${forDigit}`,
      async actor => {
        UseSudokuSolver.as(actor).applyHiddenSingles(forDigit);
      }
    ),

  nakedSingles: () =>
    Interaction.where('#actor applies the Naked Singles algorithm', async actor => {
      UseSudokuSolver.as(actor).applyNakedSingles();
    }),
};
