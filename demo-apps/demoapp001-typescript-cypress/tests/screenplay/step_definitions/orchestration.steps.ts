import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import * as assert from 'assert';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { LoadPuzzleByName } from '../tasks/LoadPuzzleByName';
import { SolvePuzzle } from '../tasks/SolvePuzzle';
import { SolveStatus } from '../questions/SolveStatus';
import { GridCell } from '../questions/GridCell';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { AttemptEvent } from '../../../app_src/orchestration/AttemptTypes';

// ---------------------------------------------------------------------------
// Orchestration - attempt helpers (SUD-22 / BACKLOG-061)
// ---------------------------------------------------------------------------

function attemptEvents(): ReadonlyArray<AttemptEvent> {
  return UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAttemptEvents;
}

function eventsInIteration(events: ReadonlyArray<AttemptEvent>, iteration: number): AttemptEvent[] {
  return events.filter((e) => e.iteration === iteration);
}

function iterationNumbers(events: ReadonlyArray<AttemptEvent>): number[] {
  return [...new Set(events.map((e) => e.iteration))].sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Orchestration - Given steps
// ---------------------------------------------------------------------------

Given('a puzzle that exercises the complete basic-technique attempt sequence', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(LoadPuzzleByName.andInitialise('Logic Squeeze Grid'));
});

Given('a partially filled grid solvable with basic techniques', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(LoadPuzzleByName.andInitialise('Easy Scan Grid'));
});

Given('every cell in the 9x9 grid contains a non-zero digit', async () => {
  const completedGrid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  await actorCalled(SOLVER_ACTOR).attemptsTo(InitialiseGrid.withCompleteGrid(completedGrid));
});

Given('no digits violate row, column, or block rules', () => {
  // Context only — grid already set up correctly
});

Given('a puzzle that cannot be solved with basic techniques', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(LoadPuzzleByName.andInitialise('Empty Grid'));
});

Given('the {string} puzzle is loaded', async (puzzleName: string) => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(LoadPuzzleByName.andInitialise(puzzleName));
});

// ---------------------------------------------------------------------------
// Orchestration - When steps
// ---------------------------------------------------------------------------

When('the main solving loop executes with attempt tracing', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGridTrackingOrder());
});

When('the solver executes the main loop', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGrid());
});

When('the main execution loop runs', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGridTrackingOrder());
});

When('the solver executes all three algorithms without making changes', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGrid());
});

When('the orchestrator solve method is called', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SolvePuzzle.withCurrentGrid());
});

// ---------------------------------------------------------------------------
// Orchestration - Then steps
// ---------------------------------------------------------------------------

Then('"Unit Completion" should be attempted first', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');

  const events = attemptEvents();
  for (const iteration of iterationNumbers(events)) {
    const iterEvents = eventsInIteration(events, iteration);
    assert.strictEqual(
      iterEvents[0]?.technique,
      'UnitCompletion',
      `Iteration ${iteration}: Unit Completion was not the first recorded attempt`
    );
  }
});

Then(
  '"Hidden Singles" should be attempted second for digits {int} through {int}',
  async (from: number, to: number) => {
    const events = attemptEvents();
    for (const iteration of iterationNumbers(events)) {
      const iterEvents = eventsInIteration(events, iteration);
      const hsEvents = iterEvents.slice(1, -1);
      assert.strictEqual(
        hsEvents.length,
        to - from + 1,
        `Iteration ${iteration}: expected ${to - from + 1} Hidden Singles attempts`
      );
      hsEvents.forEach((event, index) => {
        assert.strictEqual(
          event.technique,
          'HiddenSingles',
          `Iteration ${iteration}: attempt ${index + 2} was not Hidden Singles`
        );
        assert.strictEqual(
          event.parameter,
          from + index,
          `Iteration ${iteration}: Hidden Singles digit was out of scan order`
        );
      });
    }
  }
);

Then('"Naked Singles" should be attempted third', () => {
  const events = attemptEvents();
  for (const iteration of iterationNumbers(events)) {
    const iterEvents = eventsInIteration(events, iteration);
    assert.strictEqual(
      iterEvents[iterEvents.length - 1]?.technique,
      'NakedSingles',
      `Iteration ${iteration}: Naked Singles was not the final recorded attempt`
    );
  }
});

Then('the execution order should be maintained in every iteration', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');

  const events = attemptEvents();
  assert.ok(events.length > 0, 'Expected attempt evidence for the basic orchestration sequence');
  let expectedSequence = 1;
  for (const iteration of iterationNumbers(events)) {
    const iterEvents = eventsInIteration(events, iteration);
    assert.strictEqual(
      iterEvents.length,
      11,
      `Iteration ${iteration}: expected exactly 11 attempt events`
    );
    for (const event of iterEvents) {
      assert.strictEqual(
        event.sequence,
        expectedSequence,
        `Iteration ${iteration}: expected solve-wide sequence ${expectedSequence}`
      );
      expectedSequence += 1;
    }
  }
});

Then('every attempt should expose immutable change evidence', () => {
  for (const event of attemptEvents()) {
    assert.strictEqual(event.changed, event.changes.length > 0);
    assert.ok(Object.isFrozen(event), `Attempt ${event.sequence} is mutable`);
    assert.ok(Object.isFrozen(event.changes), `Attempt ${event.sequence} changes are mutable`);
    for (const change of event.changes) {
      assert.ok(Object.isFrozen(change), `Attempt ${event.sequence} change is mutable`);
      assert.ok(Object.isFrozen(change.cell), `Attempt ${event.sequence} cell is mutable`);
    }
  }
});

Then('multiple iterations should occur', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');
  assert.ok(
    UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAttemptIterations > 1,
    'Expected more than one solving iteration'
  );
});

Then('each iteration should make progress until solved', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');
  const events = attemptEvents();
  const iterations = iterationNumbers(events);
  for (const iteration of iterations.slice(0, -1)) {
    assert.ok(
      eventsInIteration(events, iteration).some(({ changed }) => changed),
      `Non-terminal iteration ${iteration} made no progress`
    );
  }
});

Then('the final status should be {string}', async (status: string) => {
  const actual = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(actual, status);
});

Then('the system should detect the grid is full', async () => {
  const full = await actorCalled(SOLVER_ACTOR).answer(GridCell.isGridFull());
  assert.ok(full, 'Expected grid to be full');
});

Then('the status should return {string}', async (status: string) => {
  const actual = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(actual, status);
});

Then('no algorithms should be executed', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');

  // SUD-01 contract (BACKLOG-035): an already-solved grid returns SOLVED via the early
  // isGridFull() check in SudokuOrchestrator.solve(), before the progress loop — and therefore
  // before startIteration() is ever called — so the audit trail must show zero iterations and
  // zero events, not merely an overall SOLVED status.
  const ability = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR));
  assert.strictEqual(
    ability.lastAttemptIterations,
    0,
    `Expected 0 iterations for an already-solved grid but got ${ability.lastAttemptIterations}`
  );
  assert.strictEqual(
    ability.lastAttemptEvents.length,
    0,
    `Expected 0 attempt events for an already-solved grid but got ${ability.lastAttemptEvents.length}`
  );
});

Then('Unit Completion should be attempted without changing the grid', () => {
  const unitCompletion = attemptEvents().filter(({ technique }) => technique === 'UnitCompletion');
  assert.ok(unitCompletion.length > 0, 'Expected Unit Completion attempts');
  assert.ok(
    unitCompletion.every(({ changed, changes }) => !changed && changes.length === 0),
    'Logic Squeeze Grid should not attribute changes to Unit Completion'
  );
});

Then('Hidden Singles and Naked Singles should each change the grid', () => {
  const changedTechniques = new Set(
    attemptEvents()
      .filter(({ changed }) => changed)
      .map(({ technique }) => technique)
  );
  assert.ok(changedTechniques.has('HiddenSingles'), 'Expected a Hidden Singles change');
  assert.ok(changedTechniques.has('NakedSingles'), 'Expected a Naked Singles change');
});

Then('the system should exit the solving loop', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'STUCK_ON_ADVANCED_LOGIC');
});

Then('the puzzle should be completely solved', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');
});

Then('all {int} cells should contain valid digits', async (_count: number) => {
  const allFilled = await actorCalled(SOLVER_ACTOR).answer(GridCell.allFilled());
  assert.ok(allFilled);
});
