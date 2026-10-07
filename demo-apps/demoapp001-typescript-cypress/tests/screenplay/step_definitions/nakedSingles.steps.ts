import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import * as assert from 'assert';
import { SetupGridState } from '../tasks/SetupGridState';
import { AlgorithmMadeProgress } from '../questions/AlgorithmMadeProgress';
import { GridCell } from '../questions/GridCell';
import { TargetCell } from '../questions/TargetCell';
import { GridSnapshot } from '../questions/GridSnapshot';
import { assertCellTransition, assertPreparedPlacement } from '../support/grid-assertions';
import { EMPTY_CELL, GRID_SIZE } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// Naked Singles - Given steps
// ---------------------------------------------------------------------------

Given('an empty cell at row {int}, column {int}', async (row: number, col: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.targetCell(row, col));
});

Given(
  'the numbers {int}, {int}, {int} are in the same row',
  async (a: number, b: number, c: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.valuesInRow([a, b, c]));
  }
);

Given(
  'the numbers {int}, {int}, {int} are in the same column',
  async (a: number, b: number, c: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.valuesInColumn([a, b, c]));
  }
);

Given('the numbers {int}, {int} are in the same 3x3 block', async (a: number, b: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.valuesInBlock([a, b]));
});

Given(
  'an empty cell has {int} possible candidates: {string}',
  async (_count: number, _candidatesStr: string) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.threeCandidates());
  }
);

Given('{int} empty cells each have exactly one possible value', async (_count: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.threeNakedSingles());
});

// ---------------------------------------------------------------------------
// Naked Singles - When steps (shared with unitCompletion.steps.ts via 'algorithm is executed')
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Naked Singles - Then steps
// ---------------------------------------------------------------------------

Then('the system should determine the only possible value is {int}', async (value: number) => {
  const actor = actorCalled(SOLVER_ACTOR);
  const made = await actor.answer(AlgorithmMadeProgress.afterLastCall());
  assert.ok(made, 'Expected nakedSingles to return true');
  await assertPreparedPlacement(actor, value);
});

Then(
  'the cell at row {int}, column {int} should be updated to {int}',
  async (row: number, col: number, value: number) => {
    await assertPreparedPlacement(actorCalled(SOLVER_ACTOR), value, { row, col });
  }
);

Then('the cell should not be filled', async () => {
  const actor = actorCalled(SOLVER_ACTOR);
  const { row, col } = await actor.answer(TargetCell.current());
  const cellValue = await actor.answer(GridCell.at(row, col));
  assert.strictEqual(cellValue, EMPTY_CELL);
});

Then('the algorithm should continue to other cells', async () => {
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('all {int} cells should be filled with their respective values', async (count: number) => {
  const actor = actorCalled(SOLVER_ACTOR);
  const placements = [
    { row: 0, col: 0, value: 5 },
    { row: 4, col: 4, value: 5 },
    { row: 8, col: 8, value: 9 },
  ];
  assert.strictEqual(count, placements.length, 'Expected the stated number of fixture placements');
  const snapshot = await actor.answer(GridSnapshot.current());
  assert.strictEqual(snapshot.length, GRID_SIZE, 'Expected a pre-operation fixture snapshot');
  assert.strictEqual(snapshot.flat().filter((value) => value === EMPTY_CELL).length, count);
  const made = await actor.answer(AlgorithmMadeProgress.afterLastCall());
  assert.ok(made, 'Expected nakedSingles to return true');
  for (const { row, col, value } of placements) {
    await assertCellTransition(actor, row, col, value);
  }
});

Then('the algorithm should return true', async () => {
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.ok(made);
});
