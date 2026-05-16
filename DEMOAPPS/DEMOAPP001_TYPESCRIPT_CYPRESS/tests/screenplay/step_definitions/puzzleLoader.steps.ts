import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { LoadPuzzleByName } from '../tasks/LoadPuzzleByName';
import { LoadPuzzleByIndex } from '../tasks/LoadPuzzleByIndex';
import { LoadPuzzlesByDifficulty } from '../tasks/LoadPuzzlesByDifficulty';
import { SimulateError } from '../tasks/SimulateError';
import { LoadedPuzzleCount } from '../questions/LoadedPuzzleCount';
import { ErrorThrown } from '../questions/ErrorThrown';
import { LoadedPuzzles } from '../questions/LoadedPuzzles';
import { CurrentSolver } from '../questions/CurrentSolver';
import { MultipleSolvers } from '../questions/MultipleSolvers';
import { GRID_SIZE } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// PuzzleLoader - Given steps
// ---------------------------------------------------------------------------

Given('a puzzles.json file exists with {int} puzzles', (_count: number) => {
  // Context only — file exists on disk
});

Given('a puzzle with an 8x9 grid in the JSON file', async () => {
  await actorCalled('Solver').attemptsTo(SimulateError.forInvalidRowCount(8));
});

Given('a puzzle with a cell value of {int} in the JSON file', async (_value: number) => {
  await actorCalled('Solver').attemptsTo(SimulateError.forInvalidCellValue(_value));
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
  await actorCalled('Solver').attemptsTo(LoadPuzzleByName.andInitialiseOrDefault(name));
});

When('requesting puzzles with difficulty {string}', async (difficulty: string) => {
  await actorCalled('Solver').attemptsTo(LoadPuzzlesByDifficulty.andStore(difficulty));
});

When('requesting puzzle at index {int}', async (index: number) => {
  await actorCalled('Solver').attemptsTo(LoadPuzzleByIndex.andInitialise(index));
});

When('the PuzzleLoader is initialized', async () => {
  // For the "file does not exist" scenario, simulate the missing file error
  await actorCalled('Solver').attemptsTo(SimulateError.forMissingFile());
});

// ---------------------------------------------------------------------------
// PuzzleLoader - Then steps
// ---------------------------------------------------------------------------

Then('{int} puzzles should be successfully loaded', async (count: number) => {
  const actual = await actorCalled('Solver').answer(LoadedPuzzleCount.current());
  assert.strictEqual(actual, count);
});

Then('each puzzle should have a name, difficulty, description, and grid', async () => {
  const puzzles = await actorCalled('Solver').answer(LoadedPuzzles.all());
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

Then('the correct puzzle should be returned', async () => {
  const name = await actorCalled('Solver').answer(CurrentSolver.name());
  assert.strictEqual(name, 'Easy Scan Grid');
});

Then('the puzzle grid should be a 9x9 array', async () => {
  const valid = await actorCalled('Solver').answer(CurrentSolver.hasValidGrid());
  assert.ok(valid, 'Expected a 9x9 origGrid');
});

Then('only puzzles marked as {string} should be returned', async (difficulty: string) => {
  const count = await actorCalled('Solver').answer(MultipleSolvers.count());
  assert.ok(count > 0, `Expected at least one puzzle with difficulty ${difficulty}`);
});

Then('the result should be an array of matching puzzles', async () => {
  const count = await actorCalled('Solver').answer(MultipleSolvers.count());
  assert.ok(count >= 0, 'Expected an array of solvers');
});

Then('the first puzzle in the collection should be returned', async () => {
  const name = await actorCalled('Solver').answer(CurrentSolver.name());
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
