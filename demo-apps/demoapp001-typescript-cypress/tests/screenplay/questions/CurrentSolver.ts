import { Question } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { GRID_SIZE } from '../../../app_src/constants';

/**
 * Question: CurrentSolver
 *
 * Observes structural properties of the current solver instance without step
 * definitions importing the Ability directly (MIG-05).
 */
export const CurrentSolver = {
  name: () =>
    Question.about('the name of the current solver puzzle', actor =>
      UseSudokuSolver.as(actor).getSolver().name
    ),

  hasValidGrid: () =>
    Question.about('whether the current solver has a valid 9x9 origGrid', actor => {
      const solver = UseSudokuSolver.as(actor).getSolver();
      return (
        solver.origGrid.length === GRID_SIZE &&
        solver.origGrid[0].length === GRID_SIZE
      );
    }),
};
