import { Question } from '@serenity-js/core';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Question: LoadedPuzzleCount
 *
 * Returns the number of puzzles available from the LoadPuzzles ability.
 */
export const LoadedPuzzleCount = {
  current: () =>
    Question.about('the number of loaded puzzles', (actor) => LoadPuzzles.as(actor).getCount()),
};
