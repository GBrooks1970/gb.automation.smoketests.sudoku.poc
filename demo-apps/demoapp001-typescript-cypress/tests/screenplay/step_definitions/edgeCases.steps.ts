import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
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
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { GRID_SIZE } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// Edge Cases - Given steps
// ---------------------------------------------------------------------------

Given('a grid with {int} rows instead of {int}', async (rows: number, _expected: number) => {
  if (rows !== GRID_SIZE) {
    await actorCalled(SOLVER_ACTOR).attemptsTo(SimulateError.forInvalidRowCount(rows));
  }
});

Given("a grid where row {int} contains two {int}'s", async (rowIndex: number, val: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(InitialiseGrid.withDuplicateInRow(rowIndex, val));
});

Given('a grid state where no algorithm can make progress', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.noProgress());
});

Given('{int} different puzzles are loaded', async (count: number) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.multipleSolvers(count));
});

// ---------------------------------------------------------------------------
// Edge Cases - When steps
// ---------------------------------------------------------------------------

When('attempting to create a SudokuSolver', async () => {
  const error = await actorCalled(SOLVER_ACTOR).answer(ErrorThrown.last());
  assert.ok(
    error,
    'Expected an error to be captured when attempting to create a solver with invalid dimensions'
  );
});

When('the solver attempts to solve', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGrid());
});

When('each algorithm is executed individually', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.runAllAlgorithmsIndividually());
});

When('{int} separate SudokuSolver instances are created', (_count: number) => {
  // Already done in the Given step (SetupGridState.multipleSolvers)
});

// ---------------------------------------------------------------------------
// Edge Cases - Then steps
// ---------------------------------------------------------------------------

Then('validation should detect the dimension error', async () => {
  const error = await actorCalled(SOLVER_ACTOR).answer(ErrorThrown.last());
  assert.ok(error, 'Expected dimension error');
});

Then('an appropriate error should be raised', async () => {
  const error = await actorCalled(SOLVER_ACTOR).answer(ErrorThrown.last());
  assert.ok(error!.message.includes('must have exactly 9 rows'));
});

Then('the solver should not find valid moves', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'STUCK_ON_ADVANCED_LOGIC');
});

Then('the puzzle should be unsolvable', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'STUCK_ON_ADVANCED_LOGIC');
});

Then('"Unit Completion" should return false', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(CheckAlgorithmProgress.unitCompletionOnSnapshot());
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then(
  '"Hidden Singles" should return false for all digits {int}-{int}',
  async (from: number, to: number) => {
    await actorCalled(SOLVER_ACTOR).attemptsTo(CheckAlgorithmProgress.reinitFromSnapshot());
    for (let d = from; d <= to; d++) {
      await actorCalled(SOLVER_ACTOR).attemptsTo(ApplyAlgorithm.hiddenSingles(d));
      const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
      assert.strictEqual(made, false, `Expected hiddenSingles(${d}) to return false`);
    }
  }
);

Then('"Naked Singles" should return false', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(CheckAlgorithmProgress.nakedSinglesOnSnapshot());
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('"Naked Pairs" should return false', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(CheckAlgorithmProgress.nakedPairsOnSnapshot());
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('"X-Wing" should return false', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(CheckAlgorithmProgress.xWingOnSnapshot());
  const made = await actorCalled(SOLVER_ACTOR).answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('the main loop should exit', () => {
  const ability = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR));
  ability.reinitialiseFromSnapshot();
  ability.solvePuzzle();
  const events = ability.lastAttemptEvents;
  assert.ok(events && events.length > 0, 'Expected attempt events from orchestrator loop');
  assert.strictEqual(
    ability.lastAttemptIterations,
    1,
    'Expected main loop to exit after 1 iteration'
  );
  assert.ok(
    events.every((e) => !e.changed),
    'Expected all technique attempts to have made no changes'
  );
  assert.strictEqual(ability.result, 'STUCK_ON_ADVANCED_LOGIC');
});

Then('each solver should maintain its own independent grid state', async () => {
  const count = await actorCalled(SOLVER_ACTOR).answer(MultipleSolvers.count());
  const independent = await actorCalled(SOLVER_ACTOR).answer(MultipleSolvers.areIndependent());
  assert.strictEqual(count, 3);
  assert.ok(independent, 'Expected solver grid references to be independent');
});

Then('solving one should not affect the others', async () => {
  const isolated = await actorCalled(SOLVER_ACTOR).answer(MultipleSolvers.isolationVerified());
  assert.ok(isolated, 'Expected solving solver[0] to leave solver[1] and solver[2] unchanged');
});
