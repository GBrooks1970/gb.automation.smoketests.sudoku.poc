import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Task: SolvePuzzle
 *
 * Loads a named puzzle from JSON and runs the full solving orchestration in one step.
 * Used by integration scenarios that load-and-solve in a single Given step.
 */
export const SolvePuzzle = {
  named: (puzzleName: string) =>
    Interaction.where(`#actor solves puzzle "${puzzleName}"`, async actor => {
      const puzzle = LoadPuzzles.as(actor).getByName(puzzleName);
      if (!puzzle) throw new Error(`Puzzle not found: "${puzzleName}"`);
      const ability = UseSudokuSolver.as(actor);
      ability.initialise(puzzle.name, puzzle.grid);
      ability.solvePuzzle();
    }),
};
