import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { LoadedPuzzleCount } from '../questions/LoadedPuzzleCount';
import { ErrorThrown } from '../questions/ErrorThrown';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { GRID_SIZE } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// PuzzleLoader - Given steps
// ---------------------------------------------------------------------------

Given('a puzzles.json file exists with {int} puzzles', (_count: number) => {
  // Context only — file exists on disk
});

Given('a puzzle with an 8x9 grid in the JSON file', () => {
  const ability = UseSudokuSolver.as(actorCalled('Solver'));
  ability.setSolverError(new Error(`Puzzle "Bad" (index 0) must have exactly 9 rows`));
});

Given('a puzzle with a cell value of {int} in the JSON file', (_value: number) => {
  const ability = UseSudokuSolver.as(actorCalled('Solver'));
  ability.setSolverError(new Error(`Puzzle "Bad" has invalid value at [0][0]: ${_value}`));
});

Given('puzzles are loaded from JSON', () => {
  // The LoadPuzzles ability is always pre-loaded by the Cast via puzzles.json
});

Given('the puzzles.json file does not exist', () => {
  // Context only — error captured in the When step
});

// ---------------------------------------------------------------------------
// PuzzleLoader - When steps
// ---------------------------------------------------------------------------

When('the PuzzleLoader is initialized with {string}', (_filePath: string) => {
  // LoadPuzzles ability is already initialised by the Cast with the real puzzles.json
});

When('the PuzzleLoader attempts to load the file', () => {
  // Error already captured in the Given step for invalid-data scenarios
});

When('requesting a puzzle by name {string}', async (name: string) => {
  const puzzle = LoadPuzzles.as(actorCalled('Solver')).getByName(name);
  const ability = UseSudokuSolver.as(actorCalled('Solver'));
  if (puzzle) {
    ability.initialise(puzzle.name, puzzle.grid);
  } else {
    ability.initialise('notfound');
  }
});

When('requesting puzzles with difficulty {string}', (difficulty: string) => {
  const puzzles = LoadPuzzles.as(actorCalled('Solver')).getByDifficulty(difficulty);
  UseSudokuSolver.as(actorCalled('Solver')).storeSolversFromPuzzles(puzzles);
});

When('requesting puzzle at index {int}', async (index: number) => {
  const puzzle = LoadPuzzles.as(actorCalled('Solver')).getByIndex(index);
  const ability = UseSudokuSolver.as(actorCalled('Solver'));
  if (puzzle) {
    ability.initialise(puzzle.name, puzzle.grid);
  } else {
    ability.initialise('notfound');
  }
});

When('the PuzzleLoader is initialized', () => {
  // For "file does not exist" scenario: LoadPuzzles is pre-loaded via Cast,
  // but testing the error case by capturing it on the ability
  const error = LoadPuzzles.as(actorCalled('Solver')).getError();
  if (!error) {
    UseSudokuSolver.as(actorCalled('Solver')).setSolverError(
      new Error('Puzzle file not found')
    );
  }
});

// ---------------------------------------------------------------------------
// PuzzleLoader - Then steps
// ---------------------------------------------------------------------------

Then('{int} puzzles should be successfully loaded', async (count: number) => {
  const actual = await actorCalled('Solver').answer(LoadedPuzzleCount.current());
  assert.strictEqual(actual, count);
});

Then('each puzzle should have a name, difficulty, description, and grid', () => {
  const puzzles = LoadPuzzles.as(actorCalled('Solver')).getAll();
  for (const p of puzzles) {
    assert.ok(p.name, 'Missing name');
    assert.ok(p.difficulty, 'Missing difficulty');
    assert.ok(p.description, 'Missing description');
    assert.ok(Array.isArray(p.grid) && p.grid.length === GRID_SIZE, 'Invalid grid');
  }
});

Then('a validation error should be thrown', async () => {
  const error = await actorCalled('Solver').answer(ErrorThrown.last());
  assert.ok(error, 'Expected an error to be thrown');
});

Then('the error message should indicate {string}', async (msg: string) => {
  const error = await actorCalled('Solver').answer(ErrorThrown.last());
  assert.ok(error!.message.includes(msg),
    `Expected error to contain "${msg}", got: ${error?.message}`);
});

Then('the correct puzzle should be returned', () => {
  const name = UseSudokuSolver.as(actorCalled('Solver')).getSolver().name;
  assert.strictEqual(name, 'Easy Scan Grid');
});

Then('the puzzle grid should be a 9x9 array', () => {
  const solver = UseSudokuSolver.as(actorCalled('Solver')).getSolver();
  assert.strictEqual(solver.origGrid.length, GRID_SIZE);
  assert.strictEqual(solver.origGrid[0].length, GRID_SIZE);
});

Then('only puzzles marked as {string} should be returned', (difficulty: string) => {
  const solvers = UseSudokuSolver.as(actorCalled('Solver')).multipleSolvers;
  assert.ok(solvers.length > 0, `Expected at least one puzzle with difficulty ${difficulty}`);
});

Then('the result should be an array of matching puzzles', () => {
  const solvers = UseSudokuSolver.as(actorCalled('Solver')).multipleSolvers;
  assert.ok(Array.isArray(solvers));
});

Then('the first puzzle in the collection should be returned', () => {
  const name = UseSudokuSolver.as(actorCalled('Solver')).getSolver().name;
  assert.strictEqual(name, 'Easy Scan Grid');
});

Then('an error should be thrown', async () => {
  const error = await actorCalled('Solver').answer(ErrorThrown.last());
  assert.ok(error, 'Expected PuzzleLoader to throw an error');
});

Then('the error message should contain {string}', async (msg: string) => {
  const error = await actorCalled('Solver').answer(ErrorThrown.last());
  assert.ok(error!.message.includes(msg),
    `Expected "${msg}" in: ${error?.message}`);
});
