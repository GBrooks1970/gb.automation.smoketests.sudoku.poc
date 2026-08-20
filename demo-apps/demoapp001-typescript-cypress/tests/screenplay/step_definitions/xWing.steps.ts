import { Given } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import { SetupGridState } from '../tasks/SetupGridState';

// ---------------------------------------------------------------------------
// X-Wing - Given steps
// ---------------------------------------------------------------------------

Given(
  'rows {int} and {int} have candidate {int} only in columns {int} and {int}',
  async (_r1: number, _r2: number, _digit: number, _c1: number, _c2: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.xWingRow());
  }
);

Given(
  'columns {int} and {int} have candidate {int} only in rows {int} and {int}',
  async (_c1: number, _c2: number, _digit: number, _r1: number, _r2: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.xWingColumn());
  }
);

Given(
  'another cell at row {int}, column {int} has candidates {string}',
  async (_row: number, _col: number, _candidates: string) => {
    // Already configured by setupXWingRow / setupXWingColumn
  }
);

Given('a grid state where no X-Wing pattern exists', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.noXWing());
});
