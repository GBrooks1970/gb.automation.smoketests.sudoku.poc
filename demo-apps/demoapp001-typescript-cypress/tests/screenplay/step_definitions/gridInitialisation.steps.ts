import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import * as assert from 'assert';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { SetupGridState } from '../tasks/SetupGridState';
import { SolvePuzzle } from '../tasks/SolvePuzzle';
import { GridCell } from '../questions/GridCell';
import { GridSnapshot } from '../questions/GridSnapshot';

// ---------------------------------------------------------------------------
// Grid Initialization - Given steps
// ---------------------------------------------------------------------------

const SPECIFIC_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

Given('a puzzle grid with specific values', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.fromSpecificGrid(SPECIFIC_GRID));
});

Given('a SudokuSolver is created with a puzzle grid', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(InitialiseGrid.fromPuzzleNamed('Easy Scan Grid'));
});

// ---------------------------------------------------------------------------
// Grid Initialization - When steps
// ---------------------------------------------------------------------------

When('a SudokuSolver is created with that grid', async () => {
  const snapshot = await actorCalled(SOLVER_ACTOR).answer(GridSnapshot.current());
  await actorCalled(SOLVER_ACTOR).attemptsTo(InitialiseGrid.withGrid('testPuzzle', snapshot));
});

When('the solver modifies cells during solving', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGrid());
});

// ---------------------------------------------------------------------------
// Grid Initialization - Then steps
// ---------------------------------------------------------------------------

Then("the solver's working grid should contain a deep copy of the puzzle", async () => {
  const actor = actorCalled(SOLVER_ACTOR);
  const isDeepCopy = await actor.answer(GridCell.isDeepCopy());
  assert.ok(
    isDeepCopy,
    'Expected working grid to be a deep copy of the snapshot (same values, different reference)'
  );
});

Then('the original grid should remain unchanged', async () => {
  const preserved = await actorCalled(SOLVER_ACTOR).answer(GridCell.origMatchesSnapshot());
  assert.ok(preserved, 'origGrid changed unexpectedly');
});

Then('the origGrid property should remain unchanged', async () => {
  const preserved = await actorCalled(SOLVER_ACTOR).answer(GridCell.origMatchesSnapshot());
  assert.ok(preserved, 'Expected origGrid to remain unchanged');
});

Then('the working grid should reflect all modifications', async () => {
  const differs = await actorCalled(SOLVER_ACTOR).answer(GridCell.workingDiffersFromOrig());
  assert.ok(differs, 'Expected working grid to differ from origGrid after solving');
});
