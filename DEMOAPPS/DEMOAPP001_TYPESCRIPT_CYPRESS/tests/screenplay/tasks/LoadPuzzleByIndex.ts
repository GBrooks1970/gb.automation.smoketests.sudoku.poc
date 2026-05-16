import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Task: LoadPuzzleByIndex
 *
 * Loads a puzzle by its position in the collection and initialises the solver.
 * If the index is out of range the solver is initialised as "notfound" (empty grid).
 */
export const LoadPuzzleByIndex = {
  andInitialise: (index: number) =>
    Interaction.where(`#actor loads puzzle at index ${index} and initialises the solver`, async actor => {
      const puzzle = LoadPuzzles.as(actor).getByIndex(index);
      const ability = UseSudokuSolver.as(actor);
      if (puzzle) {
        ability.initialise(puzzle.name, puzzle.grid);
      } else {
        ability.initialise('notfound');
      }
    }),
};
