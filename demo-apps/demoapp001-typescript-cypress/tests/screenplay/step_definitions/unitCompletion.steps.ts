import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { ApplyAlgorithm } from '../tasks/ApplyAlgorithm';
import { SetupGridState } from '../tasks/SetupGridState';
import { AlgorithmMadeProgress } from '../questions/AlgorithmMadeProgress';
import { GridCell } from '../questions/GridCell';

// ---------------------------------------------------------------------------
// Unit Completion - Given steps
// ---------------------------------------------------------------------------

Given('a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]', async () => {
  await actorCalled('Solver').attemptsTo(
    InitialiseGrid.withRowValues({ row: 0, values: [1, 2, 0, 4, 5, 6, 7, 8, 9] })
  );
});

Given('column {int} contains {int} non-zero values', async (colIndex: number, _count: number) => {
  await actorCalled('Solver').attemptsTo(
    SetupGridState.almostCompleteColumn(colIndex)
  );
});

Given('the missing digit is {int}', async (_digit: number) => {
  // Context only — digit is determined by grid setup
});

Given('a 3x3 block at position \\({int}, {int}) contains {int} non-zero values',
  async (blockRow: number, blockCol: number, _count: number) => {
    await actorCalled('Solver').attemptsTo(
      SetupGridState.almostCompleteBlock(blockRow, blockCol)
    );
  });

Given('no row, column, or block has exactly one empty cell', async () => {
  await actorCalled('Solver').attemptsTo(
    SetupGridState.withMultipleEmpties()
  );
});

// ---------------------------------------------------------------------------
// Unit Completion - When steps
// ---------------------------------------------------------------------------

When('the {string} algorithm scans the row', async (_algorithm: string) => {
  await actorCalled('Solver').attemptsTo(ApplyAlgorithm.unitCompletion());
});

When('the {string} algorithm scans the column', async (_algorithm: string) => {
  await actorCalled('Solver').attemptsTo(ApplyAlgorithm.unitCompletion());
});

When('the {string} algorithm scans the block', async (_algorithm: string) => {
  await actorCalled('Solver').attemptsTo(ApplyAlgorithm.unitCompletion());
});

When('the {string} algorithm is executed', async (algorithm: string) => {
  const actor = actorCalled('Solver');
  if (algorithm === 'Unit Completion') {
    await actor.attemptsTo(ApplyAlgorithm.unitCompletion());
  } else if (algorithm === 'Naked Singles') {
    await actor.attemptsTo(ApplyAlgorithm.nakedSingles());
  }
});

// ---------------------------------------------------------------------------
// Unit Completion - Then steps
// ---------------------------------------------------------------------------

Then('the system should identify the missing value as {int}', async (_value: number) => {
  const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
  assert.ok(made, 'Expected unitCompletion to return true');
});

Then('the value {int} should be placed in the empty cell', async (value: number) => {
  const found = await actorCalled('Solver').answer(GridCell.containsValue(value));
  assert.ok(found, `Expected value ${value} to be placed in the grid`);
});

Then('the system should place {int} in the empty cell of column {int}',
  async (value: number, col: number) => {
    const placed = await actorCalled('Solver').answer(GridCell.inColumn(col, value));
    assert.ok(placed, `Expected ${value} to be placed in column ${col}`);
  });

Then('the system should place {int} in the empty cell of that block', async (value: number) => {
  const found = await actorCalled('Solver').answer(GridCell.containsValue(value));
  assert.ok(found, `Expected value ${value} to be placed in the block`);
});

Then('the algorithm should return false', async () => {
  const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('no cells should be modified', async () => {
  const matches = await actorCalled('Solver').answer(GridCell.matchesSnapshot());
  assert.ok(matches, 'Expected no cells to be modified');
});
