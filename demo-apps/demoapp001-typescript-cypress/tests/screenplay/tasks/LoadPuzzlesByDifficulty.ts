import { Interaction } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Task: LoadPuzzlesByDifficulty
 *
 * Retrieves all puzzles matching a difficulty label and stores them as
 * independent solver instances on the actor's UseSudokuSolver ability.
 */
export const LoadPuzzlesByDifficulty = {
  andStore: (difficulty: string) =>
    Interaction.where(`#actor loads all "${difficulty}" puzzles as independent solvers`, async actor => {
      const puzzles = LoadPuzzles.as(actor).getByDifficulty(difficulty);
      UseSudokuSolver.as(actor).storeSolversFromPuzzles(puzzles);
    }),
};
