import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import * as assert from 'assert';
import { ApplyAlgorithm } from '../tasks/ApplyAlgorithm';
import { SetupGridState } from '../tasks/SetupGridState';
import { AlgorithmMadeProgress } from '../questions/AlgorithmMadeProgress';
import { GridCell } from '../questions/GridCell';

// ---------------------------------------------------------------------------
// Hidden Singles - Given steps
// ---------------------------------------------------------------------------

Given('row {int} is missing the number {int}', async (rowIndex: number, target: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(
    SetupGridState.rowMissingDigit(rowIndex, target)
  );
});

Given('{int} cells in row {int} cannot contain {int} due to column or block constraints',
  async (count: number, rowIndex: number, target: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(
      SetupGridState.rowColumnConstraints(count, rowIndex, target)
    );
  });

Given('column {int} is missing the number {int}', async (colIndex: number, target: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(
    SetupGridState.columnMissingDigit(colIndex, target)
  );
});

Given('{int} cells in column {int} cannot contain {int} due to row or block constraints',
  async (count: number, colIndex: number, target: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(
      SetupGridState.columnRowConstraints(count, colIndex, target)
    );
  });

Given('a 3x3 block has four empty cells', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.blockFourEmpties());
});

Given('the number {int} is present in rows that intersect three of those empty cells',
  async (target: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(
      SetupGridState.hiddenSingleInBlock(target)
    );
  });

Given('row {int} already contains the digit {int}', async (rowIndex: number, digit: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(
    SetupGridState.digitInRow(rowIndex, digit)
  );
});

Given('the number {int} can be placed in multiple locations within a unit',
  async (_target: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.withMultipleCandidates());
  });

// ---------------------------------------------------------------------------
// Hidden Singles - When steps
// ---------------------------------------------------------------------------

When('the {string} algorithm is executed for value {int}',
  async (_algorithm: string, value: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(ApplyAlgorithm.hiddenSingles(value));
  });

// ---------------------------------------------------------------------------
// Hidden Singles - Then steps
// ---------------------------------------------------------------------------

Then('the system should place {int} in the only valid cell in row {int}',
  async (value: number, rowIndex: number) => {
    const placed = await actorCalled(SOLVER_ACTOR).answer(GridCell.inRow(rowIndex, value));
    assert.ok(placed, `Expected ${value} to be placed in row ${rowIndex}`);
  });

Then('the grid should reflect the new value', async () => {
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.ok(made, 'Expected algorithm to return true (grid was changed)');
});

Then('the system should place {int} in the only valid cell in column {int}',
  async (value: number, colIndex: number) => {
    const placed = await actorCalled(SOLVER_ACTOR).answer(GridCell.inColumn(colIndex, value));
    assert.ok(placed, `Expected ${value} to be placed in column ${colIndex}`);
  });

Then('the system should place {int} in the one remaining valid cell of that block',
  async (value: number) => {
    const found = await actorCalled(SOLVER_ACTOR).answer(GridCell.containsValue(value));
    assert.ok(found, `Expected ${value} to be placed in the block`);
  });

Then('the algorithm should skip row {int}', async (_rowIndex: number) => {
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false, 'Expected hiddenSingles to return false');
});

Then('no cells in row {int} should be modified', async (_rowIndex: number) => {
  const matches = await actorCalled(SOLVER_ACTOR).answer(GridCell.matchesSnapshot());
  assert.ok(matches, 'Expected no cells in row to be modified');
});
