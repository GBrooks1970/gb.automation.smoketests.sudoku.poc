import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { ALGORITHM_PROGRESS, SudokuNotes } from '../support/memory-keys';

/**
 * Task: CheckAlgorithmProgress
 *
 * Re-initialises the solver from the stored grid snapshot then applies a specific
 * algorithm. Used by edge-case Then steps that verify algorithms make no progress
 * on a stuck grid, without those steps accessing the Ability directly (MIG-05).
 * Writes ALGORITHM_PROGRESS to Actor Memory after each run.
 */
export const CheckAlgorithmProgress = {
  unitCompletionOnSnapshot: () =>
    Interaction.where(
      '#actor re-initialises from snapshot and applies Unit Completion',
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.reinitialiseFromSnapshot();
        ability.applyUnitCompletion();
        await notes<SudokuNotes>()
          .set(ALGORITHM_PROGRESS, ability.algorithmMadeProgress)
          .performAs(actor);
      }
    ),

  nakedSinglesOnSnapshot: () =>
    Interaction.where(
      '#actor re-initialises from snapshot and applies Naked Singles',
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.reinitialiseFromSnapshot();
        ability.applyNakedSingles();
        await notes<SudokuNotes>()
          .set(ALGORITHM_PROGRESS, ability.algorithmMadeProgress)
          .performAs(actor);
      }
    ),

  reinitFromSnapshot: () =>
    Interaction.where(
      '#actor re-initialises solver from the stored grid snapshot',
      async (actor) => {
        UseSudokuSolver.as(actor).reinitialiseFromSnapshot();
      }
    ),
};
