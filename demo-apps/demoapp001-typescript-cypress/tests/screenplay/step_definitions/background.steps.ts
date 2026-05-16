import { Given } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { InitialiseGrid } from '../tasks/InitialiseGrid';

Given('a standard 9x9 Sudoku grid is initialized', async () => {
  await actorCalled('Solver').attemptsTo(InitialiseGrid.empty());
});
