import { Question } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Question: AlgorithmMadeProgress
 *
 * Returns true if the most recently applied algorithm changed at least one cell.
 * Maps to the boolean return value of unitCompletion() / hiddenSingles() / nakedSingles().
 */
export const AlgorithmMadeProgress = {
  afterLastCall: () =>
    Question.about('whether the algorithm made progress', actor =>
      UseSudokuSolver.as(actor).algorithmMadeProgress
    ),
};
