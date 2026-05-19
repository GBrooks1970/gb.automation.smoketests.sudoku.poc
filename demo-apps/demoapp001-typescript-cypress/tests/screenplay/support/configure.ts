import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SudokuActors } from '../actors/SudokuActors';

/**
 * Serenity/JS configuration for the DEMOAPP001 Stack.
 *
 * Loaded by Cucumber via the `require` array in cucumber.js, after ts-node is
 * registered via requireModule and the Serenity/JS formatter is configured.
 *
 * Configures the Cast so that actorCalled(SOLVER_ACTOR) in step definitions
 * receives UseSudokuSolver and LoadPuzzles abilities automatically, and
 * records Serenity BDD JSON reports for living documentation generation.
 */
configure({
  crew: [
    ['@serenity-js/serenity-bdd', {
      specDirectory: './tests/features',
    }],
    ArtifactArchiver.storingArtifactsAt('.results/serenity'),
  ],
  actors: SudokuActors,
});
