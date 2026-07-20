import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { SOLVE_RESULT, SudokuNotes } from '../support/memory-keys';

/**
 * Task: SolvePuzzle
 *
 * Runs the full solving orchestration loop.
 * Writes SOLVE_RESULT to Actor Memory after the run (RA §3.3, MIG-04).
 */
export const SolvePuzzle = {
  named: (puzzleName: string) =>
    Interaction.where(`#actor solves puzzle "${puzzleName}"`, async (actor) => {
      const puzzle = LoadPuzzles.as(actor).getByName(puzzleName);
      if (!puzzle) throw new Error(`Puzzle not found: "${puzzleName}"`);
      const ability = UseSudokuSolver.as(actor);
      ability.initialise(puzzle.name, puzzle.grid);
      ability.solvePuzzle();
      await notes<SudokuNotes>().set(SOLVE_RESULT, ability.result).performAs(actor);
    }),

  withCurrentGrid: () =>
    Interaction.where('#actor runs the solving loop on the current grid', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.solvePuzzle();
      await notes<SudokuNotes>().set(SOLVE_RESULT, ability.result).performAs(actor);
    }),

  // SUD-20 / BACKLOG-051: same solve, but always captures the audit event sequence so
  // orchestration Then-steps can assert real algorithm ordering / no-execution counts.
  withCurrentGridTrackingOrder: () =>
    Interaction.where(
      '#actor runs the solving loop on the current grid, tracking algorithm order',
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.solvePuzzleTrackingOrder();
        await notes<SudokuNotes>().set(SOLVE_RESULT, ability.result).performAs(actor);
      }
    ),
};
