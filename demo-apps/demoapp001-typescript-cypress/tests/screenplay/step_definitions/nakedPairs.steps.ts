import { Given, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import * as assert from 'assert';
import { SetupGridState } from '../tasks/SetupGridState';
import { GridCell } from '../questions/GridCell';

// ---------------------------------------------------------------------------
// Naked Pairs - Given steps
// ---------------------------------------------------------------------------

Given(
  'row {int} contains exactly two cells sharing candidate pair {string}',
  async (_row: number, _candidates: string) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.nakedPairRow());
  }
);

Given(
  'another cell in row {int} has candidates {string}',
  async (_row: number, _candidates: string) => {
    // Already configured by setupNakedPairRow
  }
);

Given(
  'column {int} contains exactly two cells sharing candidate pair {string}',
  async (_col: number, _candidates: string) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.nakedPairColumn());
  }
);

Given(
  'another cell in column {int} has candidates {string}',
  async (_col: number, _candidates: string) => {
    // Already configured by setupNakedPairColumn
  }
);

Given(
  'a 3x3 block at position \\({int}, {int}\\) contains exactly two cells sharing candidate pair {string}',
  async (_br: number, _bc: number, _candidates: string) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.nakedPairBlock());
  }
);

Given('another cell in that block has candidates {string}', async (_candidates: string) => {
  // Already configured by setupNakedPairBlock
});

Given('a grid state where no unit contains a naked pair', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.noNakedPairs());
});

// ---------------------------------------------------------------------------
// Naked Pairs - Then steps
// ---------------------------------------------------------------------------

Then(
  'the cell in row {int} with candidates {string} should be updated to {int}',
  async (row: number, _candidates: string, val: number) => {
    const cellVal = await actorCalled(SOLVER_ACTOR).answer(GridCell.at(row, 2));
    assert.strictEqual(cellVal, val);
  }
);

Then(
  'the cell in column {int} with candidates {string} should be updated to {int}',
  async (col: number, _candidates: string, val: number) => {
    const cellVal = await actorCalled(SOLVER_ACTOR).answer(GridCell.at(2, col));
    assert.strictEqual(cellVal, val);
  }
);

Then(
  'the cell in block \\({int}, {int}\\) with candidates {string} should be updated to {int}',
  async (_br: number, _bc: number, _candidates: string, val: number) => {
    const cellVal = await actorCalled(SOLVER_ACTOR).answer(GridCell.at(0, 2));
    assert.strictEqual(cellVal, val);
  }
);
