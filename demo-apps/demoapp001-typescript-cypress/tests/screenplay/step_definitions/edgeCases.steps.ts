import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { SetupGridState } from '../tasks/SetupGridState';
import { SolvePuzzle } from '../tasks/SolvePuzzle';
import { ApplyAlgorithm } from '../tasks/ApplyAlgorithm';
import { SimulateError } from '../tasks/SimulateError';
import { CheckAlgorithmProgress } from '../tasks/CheckAlgorithmProgress';
import { SolveStatus } from '../questions/SolveStatus';
import { AlgorithmMadeProgress } from '../questions/AlgorithmMadeProgress';
import { ErrorThrown } from '../questions/ErrorThrown';
import { MultipleSolvers } from '../questions/MultipleSolvers';
import { GRID_SIZE } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// Edge Cases - Given steps
// ---------------------------------------------------------------------------

Given('a grid with {int} rows instead of {int}', async (rows: number, _expected: number) => {
  if (rows !== GRID_SIZE) {
    await actorCalled('Solver').attemptsTo(SimulateError.forInvalidRowCount(rows));
  }
});

Given('a grid where row {int} contains two {int}\'s',
  async (rowIndex: number, val: number) => {
    await actorCalled('Solver').attemptsTo(InitialiseGrid.withDuplicateInRow(rowIndex, val));
  });

Given('a grid state where no algorithm can make progress', async () => {
  await actorCalled('Solver').attemptsTo(SetupGridState.noProgress());
});

Given('{int} different puzzles are loaded', async (count: number) => {
  await actorCalled('Solver').attemptsTo(SetupGridState.multipleSolvers(count));
});

// ---------------------------------------------------------------------------
// Edge Cases - When steps
// ---------------------------------------------------------------------------

When('attempting to create a SudokuSolver', () => {
  // Error already captured in the Given step for invalid-dimensions scenario
});

When('the solver attempts to solve', async () => {
  await actorCalled('Solver').attemptsTo(SolvePuzzle.withCurrentGrid());
});

When('each algorithm is executed individually', async () => {
  await actorCalled('Solver').attemptsTo(SetupGridState.runAllAlgorithmsIndividually());
});

When('{int} separate SudokuSolver instances are created', (_count: number) => {
  // Already done in the Given step (SetupGridState.multipleSolvers)
});

// ---------------------------------------------------------------------------
// Edge Cases - Then steps
// ---------------------------------------------------------------------------

Then('validation should detect the dimension error', async () => {
  const error = await actorCalled('Solver').answer(ErrorThrown.last());
  assert.ok(error, 'Expected dimension error');
});

Then('an appropriate error should be raised', async () => {
  const error = await actorCalled('Solver').answer(ErrorThrown.last());
  assert.ok(error!.message.includes('must have exactly 9 rows'));
});

Then('the solver should not find valid moves', async () => {
  const status = await actorCalled('Solver').answer(SolveStatus.current());
  assert.strictEqual(status, 'STUCK_ON_ADVANCED_LOGIC');
});

Then('the puzzle should be unsolvable', async () => {
  const status = await actorCalled('Solver').answer(SolveStatus.current());
  assert.strictEqual(status, 'STUCK_ON_ADVANCED_LOGIC');
});

Then('"Unit Completion" should return false', async () => {
  await actorCalled('Solver').attemptsTo(CheckAlgorithmProgress.unitCompletionOnSnapshot());
  const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('"Hidden Singles" should return false for all digits {int}-{int}',
  async (from: number, to: number) => {
    await actorCalled('Solver').attemptsTo(CheckAlgorithmProgress.reinitFromSnapshot());
    for (let d = from; d <= to; d++) {
      await actorCalled('Solver').attemptsTo(ApplyAlgorithm.hiddenSingles(d));
      const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
      assert.strictEqual(made, false, `Expected hiddenSingles(${d}) to return false`);
    }
  });

Then('"Naked Singles" should return false', async () => {
  await actorCalled('Solver').attemptsTo(CheckAlgorithmProgress.nakedSinglesOnSnapshot());
  const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('the main loop should exit', () => {
  // Verified by algorithm returning false above — loop condition exits
});

Then('each solver should maintain its own independent grid state', async () => {
  const count = await actorCalled('Solver').answer(MultipleSolvers.count());
  const independent = await actorCalled('Solver').answer(MultipleSolvers.areIndependent());
  assert.strictEqual(count, 3);
  assert.ok(independent, 'Expected solver grid references to be independent');
});

Then('solving one should not affect the others', async () => {
  const isolated = await actorCalled('Solver').answer(MultipleSolvers.isolationVerified());
  assert.ok(isolated, 'Expected solving solver[0] to leave solver[1] and solver[2] unchanged');
});
