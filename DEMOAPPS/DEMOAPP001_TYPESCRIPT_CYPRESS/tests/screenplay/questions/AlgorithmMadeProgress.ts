import { Question, notes } from '@serenity-js/core';
import { ALGORITHM_PROGRESS, SudokuNotes } from '../support/memory-keys';

/**
 * Question: AlgorithmMadeProgress
 *
 * Reads ALGORITHM_PROGRESS from Actor Memory — written by ApplyAlgorithm tasks (MIG-04).
 * Returns true if the most recently applied algorithm changed at least one cell.
 */
export const AlgorithmMadeProgress = {
  afterLastCall: () =>
    Question.about('whether the algorithm made progress', async actor => {
      const progress = await actor.answer(notes<SudokuNotes>().get(ALGORITHM_PROGRESS));
      return progress ?? false;
    }),
};
