import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Task: LoadPuzzleByName
 *
 * Loads a named puzzle and initialises the solver — does NOT run solving.
 * Use for orchestration and integration scenarios where the solve step is separate.
 */
export const LoadPuzzleByName = {
  andInitialise: (name: string) =>
    Interaction.where(`#actor loads puzzle "${name}" and initialises the solver`, async actor => {
      const puzzle = LoadPuzzles.as(actor).getByName(name);
      if (!puzzle) throw new Error(`Puzzle not found: "${name}"`);
      UseSudokuSolver.as(actor).initialise(puzzle.name, puzzle.grid);
    }),

  andInitialiseOrDefault: (name: string) =>
    Interaction.where(`#actor loads puzzle "${name}" or initialises an empty solver if not found`, async actor => {
      const puzzle = LoadPuzzles.as(actor).getByName(name);
      const ability = UseSudokuSolver.as(actor);
      if (puzzle) {
        ability.initialise(puzzle.name, puzzle.grid);
      } else {
        ability.initialise('notfound');
      }
    }),
};
