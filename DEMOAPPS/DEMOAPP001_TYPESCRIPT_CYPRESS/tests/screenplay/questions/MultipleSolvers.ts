import { Question, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { ALGORITHM_PROGRESS, SudokuNotes } from '../support/memory-keys';

/**
 * Question: MultipleSolvers
 *
 * Observes state across the independent solver instances stored on the
 * UseSudokuSolver ability. Used by edge-case scenarios that verify solver
 * isolation without step definitions accessing the Ability directly (MIG-05).
 */
export const MultipleSolvers = {
  count: () =>
    Question.about('the number of independent solver instances', actor =>
      UseSudokuSolver.as(actor).multipleSolvers.length
    ),

  areIndependent: () =>
    Question.about('whether solver instances have independent grid references', actor => {
      const solvers = UseSudokuSolver.as(actor).multipleSolvers;
      if (solvers.length < 2) return true;
      for (let i = 0; i < solvers.length - 1; i++) {
        if (solvers[i].grid === solvers[i + 1].grid) return false;
      }
      return true;
    }),

  isolationVerified: () =>
    Question.about('whether solving one solver left the others unchanged', async actor => {
      const isolated = UseSudokuSolver.as(actor).solveFirstAndCheckIsolation();
      await notes<SudokuNotes>().set(ALGORITHM_PROGRESS, false).performAs(actor);
      return isolated;
    }),
};
