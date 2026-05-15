import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { SetupGridState } from '../tasks/SetupGridState';
import { GridCell } from '../questions/GridCell';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { GRID_SIZE } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// Grid Initialization - Given steps
// ---------------------------------------------------------------------------

const SPECIFIC_GRID = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

Given('a puzzle grid with specific values', async () => {
  await actorCalled('Solver').attemptsTo(SetupGridState.fromSpecificGrid(SPECIFIC_GRID));
});

Given('a SudokuSolver is created with a puzzle grid', () => {
  const actor = actorCalled('Solver');
  const puzzle = LoadPuzzles.as(actor).getByName('Easy Scan Grid')!;
  const ability = UseSudokuSolver.as(actor);
  ability.initialise(puzzle.name, puzzle.grid);
  // Snapshot origGrid so origMatchesSnapshot() can verify it later
  ability.storeSnapshot(ability.getSolver().origGrid);
});

// ---------------------------------------------------------------------------
// Grid Initialization - When steps
// ---------------------------------------------------------------------------

When('a SudokuSolver is created with that grid', async () => {
  const snapshot = UseSudokuSolver.as(actorCalled('Solver')).gridSnapshot;
  await actorCalled('Solver').attemptsTo(InitialiseGrid.withGrid('testPuzzle', snapshot));
});

When('the solver modifies cells during solving', () => {
  UseSudokuSolver.as(actorCalled('Solver')).solvePuzzle();
});

// ---------------------------------------------------------------------------
// Grid Initialization - Then steps
// ---------------------------------------------------------------------------

Then("the solver's working grid should contain a deep copy of the puzzle", async () => {
  const actor = actorCalled('Solver');
  const matches = await actor.answer(GridCell.matchesSnapshot());
  assert.ok(matches, 'Expected working grid to match the snapshot');
  // Verify deep copy — different reference
  const ability = UseSudokuSolver.as(actor);
  assert.notStrictEqual(ability.getSolver().grid, ability.gridSnapshot,
    'Expected grid to be a deep copy, not the same reference');
});

Then('the original grid should remain unchanged', () => {
  const ability = UseSudokuSolver.as(actorCalled('Solver'));
  const solver = ability.getSolver();
  const snapshot = ability.gridSnapshot;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      assert.strictEqual(solver.origGrid[r][c], snapshot[r][c],
        `origGrid[${r}][${c}] changed unexpectedly`);
    }
  }
});

Then('the origGrid property should remain unchanged', async () => {
  const preserved = await actorCalled('Solver').answer(GridCell.origMatchesSnapshot());
  assert.ok(preserved, 'Expected origGrid to remain unchanged');
});

Then('the working grid should reflect all modifications', async () => {
  const differs = await actorCalled('Solver').answer(GridCell.workingDiffersFromOrig());
  assert.ok(differs, 'Expected working grid to differ from origGrid after solving');
});
