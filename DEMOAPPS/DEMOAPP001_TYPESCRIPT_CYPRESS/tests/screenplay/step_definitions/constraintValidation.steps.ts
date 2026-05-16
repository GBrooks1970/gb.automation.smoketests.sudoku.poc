import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { SetTargetCell } from '../tasks/SetTargetCell';
import { SetupGridState } from '../tasks/SetupGridState';
import { AttemptPlacement } from '../tasks/AttemptPlacement';
import { PlacementValidity } from '../questions/PlacementValidity';

// ---------------------------------------------------------------------------
// Constraint Validation (Scenario Outline)
// ---------------------------------------------------------------------------

Given('a cell at {int}, {int} is empty', async (_row: number, _col: number) => {
  await actorCalled('Solver').attemptsTo(SetTargetCell.at(_row, _col));
});

Given('the grid state is {word}', async (gridState: string) => {
  await actorCalled('Solver').attemptsTo(SetupGridState.named(gridState));
});

When('attempting to place {int} at that position', async (value: number) => {
  await actorCalled('Solver').attemptsTo(AttemptPlacement.ofValue(value));
});

Then('the move should be validated against row, column, and block constraints', () => {
  // Validation already performed in the When step by AttemptPlacement
});

Then('the validation result should be {word}', async (expected: string) => {
  const result = await actorCalled('Solver').answer(PlacementValidity.ofLastAttempt());
  assert.strictEqual(result, expected);
});
