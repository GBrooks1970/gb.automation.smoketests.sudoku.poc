import { Question } from '@serenity-js/core';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { Puzzle } from '../../../app_src/PuzzleLoader';

/**
 * Question: LoadedPuzzles
 *
 * Returns puzzle data from the LoadPuzzles ability without step definitions
 * importing the Ability directly (MIG-05).
 */
export const LoadedPuzzles = {
  all: () =>
    Question.about('all loaded puzzles', actor =>
      LoadPuzzles.as(actor).getAll() as Puzzle[]
    ),
};
