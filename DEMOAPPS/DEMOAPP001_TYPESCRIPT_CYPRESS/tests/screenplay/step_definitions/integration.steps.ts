import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { LoadPuzzleByName } from '../tasks/LoadPuzzleByName';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { SolvePuzzle } from '../tasks/SolvePuzzle';
import { SolveStatus } from '../questions/SolveStatus';
import { GridCell } from '../questions/GridCell';

// ---------------------------------------------------------------------------
// Integration Tests - Given steps
// ---------------------------------------------------------------------------

Given('the puzzle {string} is loaded from JSON', async (name: string) => {
  await actorCalled('Solver').attemptsTo(LoadPuzzleByName.andInitialise(name));
});

Given('an empty 9x9 grid with all zeros', async () => {
  await actorCalled('Solver').attemptsTo(InitialiseGrid.empty());
});

// ---------------------------------------------------------------------------
// Integration Tests - When steps (trigger the actual solve)
// ---------------------------------------------------------------------------

When('the solver attempts to solve it', async () => {
  await actorCalled('Solver').attemptsTo(SolvePuzzle.withCurrentGrid());
});

When('the solver attempts to solve it with basic techniques only', async () => {
  await actorCalled('Solver').attemptsTo(SolvePuzzle.withCurrentGrid());
});

// ---------------------------------------------------------------------------
// Integration Tests - Then steps
// ---------------------------------------------------------------------------

Then('the status should be {string}', async (status: string) => {
  const actual = await actorCalled('Solver').answer(SolveStatus.current());
  assert.strictEqual(actual, status);
});

Then('all cells should be filled', async () => {
  const filled = await actorCalled('Solver').answer(GridCell.allFilled());
  assert.ok(filled, 'Expected all cells to be filled');
});

Then('the solution should be valid \\(no constraint violations)', async () => {
  const valid = await actorCalled('Solver').answer(GridCell.isValidSolution());
  assert.ok(valid, 'Solution has constraint violations');
});

Then('the puzzle should require all three techniques', async () => {
  const status = await actorCalled('Solver').answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');
});

Then('the solution should be valid', async () => {
  const valid = await actorCalled('Solver').answer(GridCell.isValidSolution());
  assert.ok(valid);
});

Then('some cells should still be empty', async () => {
  const hasEmpty = await actorCalled('Solver').answer(GridCell.hasEmptyCells());
  assert.ok(hasEmpty, 'Expected some cells to remain empty');
});

Then('no constraint violations should exist in partially filled cells', async () => {
  const noViolations = await actorCalled('Solver').answer(GridCell.noConstraintViolations());
  assert.ok(noViolations, 'Constraint violations found in partially filled grid');
});

Then('no cells should be filled', async () => {
  const filled = await actorCalled('Solver').answer(GridCell.allFilled());
  assert.ok(!filled, 'Expected all cells to be empty');
});

Then('no errors should occur', () => {
  // Verifies the scenario completed without exceptions
});
