import { configure } from '@serenity-js/core';
import { SudokuActors } from '../actors/SudokuActors';

/**
 * Serenity/JS configuration for the DEMOAPP001 Stack.
 *
 * Loaded by Cucumber via the `require` array in cucumber.js, after ts-node
 * and @serenity-js/cucumber are registered via requireModule.
 *
 * Configures the Cast so that actorCalled('Solver') in step definitions
 * receives UseSudokuSolver and LoadPuzzles abilities automatically.
 */
configure({
  crew: [],
  actors: SudokuActors,
});
