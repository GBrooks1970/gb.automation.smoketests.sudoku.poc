import { Given } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import { InitialiseGrid } from '../tasks/InitialiseGrid';

Given('a standard 9x9 Sudoku grid is initialized', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(InitialiseGrid.empty());
});
