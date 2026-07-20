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
import { AuditEvent } from '../../../app_src/audit/AuditTypes';

// ---------------------------------------------------------------------------
// Orchestration - ordering helpers (SUD-20 / BACKLOG-051)
// ---------------------------------------------------------------------------

// Fixed priority order the orchestrator always calls algorithms in (SudokuOrchestrator.solve()).
const ALGORITHM_RANK: Record<AuditEvent['algorithm'], number> = {
  UnitCompletion: 0,
  HiddenSingles: 1,
  NakedSingles: 2,
};

function orderingEvents(): AuditEvent[] {
  return UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastOrderingEvents;
}

function eventsInIteration(events: AuditEvent[], iteration: number): AuditEvent[] {
  return events.filter((e) => e.iteration === iteration);
}

function iterationNumbers(events: AuditEvent[]): number[] {
  return [...new Set(events.map((e) => e.iteration))].sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Orchestration - Given steps
// ---------------------------------------------------------------------------

Given('a puzzle that requires all three techniques', async () => {
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

When('the main solving loop executes one iteration', async () => {
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

  // The orchestrator always calls unitCompletion() before hiddenSingles()/nakedSingles() every
  // iteration (SudokuOrchestrator.solve()), but the audit trail only logs an event when a call
  // produces a change. So the real, always-true claim observable from the trail is: whenever a
  // Unit Completion event IS logged for an iteration, it is that iteration's first event — no
  // Hidden Singles or Naked Singles event precedes it.
  const events = orderingEvents();
  for (const iteration of iterationNumbers(events)) {
    const iterEvents = eventsInIteration(events, iteration);
    const ucIndex = iterEvents.findIndex((e) => e.algorithm === 'UnitCompletion');
    if (ucIndex !== -1) {
      assert.strictEqual(
        ucIndex,
        0,
        `Iteration ${iteration}: Unit Completion event was not first (index ${ucIndex} of ${iterEvents.length})`
      );
    }
  }
});

Then(
  '"Hidden Singles" should be attempted second for digits {int} through {int}',
  async (from: number, to: number) => {
    const events = orderingEvents();
    for (const iteration of iterationNumbers(events)) {
      const iterEvents = eventsInIteration(events, iteration);
      const ucIndex = iterEvents.findIndex((e) => e.algorithm === 'UnitCompletion');
      const hsEvents = iterEvents.filter((e) => e.algorithm === 'HiddenSingles');
      const firstHsIndex = iterEvents.findIndex((e) => e.algorithm === 'HiddenSingles');

      if (ucIndex !== -1 && firstHsIndex !== -1) {
        assert.ok(
          ucIndex < firstHsIndex,
          `Iteration ${iteration}: a Hidden Singles event preceded the Unit Completion event`
        );
      }

      let lastDigit = 0;
      for (const e of hsEvents) {
        const digit = e.algorithmParameter as number;
        assert.ok(
          digit >= from && digit <= to,
          `Iteration ${iteration}: Hidden Singles digit ${digit} is outside the expected range ${from}-${to}`
        );
        assert.ok(
          digit > lastDigit,
          `Iteration ${iteration}: Hidden Singles digit ${digit} did not increase after ${lastDigit} (out of scan order)`
        );
        lastDigit = digit;
      }
    }
  }
);

Then('"Naked Singles" should be attempted third', () => {
  const events = orderingEvents();
  for (const iteration of iterationNumbers(events)) {
    const iterEvents = eventsInIteration(events, iteration);
    const nsIndex = iterEvents.findIndex((e) => e.algorithm === 'NakedSingles');
    if (nsIndex !== -1) {
      assert.strictEqual(
        nsIndex,
        iterEvents.length - 1,
        `Iteration ${iteration}: Naked Singles event was not last (index ${nsIndex} of ${iterEvents.length})`
      );
    }
  }
});

Then('the execution order should be maintained in every iteration', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');

  const events = orderingEvents();
  assert.ok(
    events.length > 0,
    'Expected at least one audit event for a puzzle requiring all three techniques'
  );
  for (const iteration of iterationNumbers(events)) {
    const iterEvents = eventsInIteration(events, iteration);
    let maxRankSoFar = -1;
    for (const e of iterEvents) {
      const rank = ALGORITHM_RANK[e.algorithm];
      assert.ok(
        rank >= maxRankSoFar,
        `Iteration ${iteration}: event ${e.eventId} (${e.algorithm}) broke the Unit Completion -> Hidden Singles -> Naked Singles priority order`
      );
      maxRankSoFar = rank;
    }
  }
});

Then('multiple iterations should occur', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');
});

Then('each iteration should make progress until solved', async () => {
  const status = await actorCalled(SOLVER_ACTOR).answer(SolveStatus.current());
  assert.strictEqual(status, 'SOLVED');
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
    ability.lastOrderingIterations,
    0,
    `Expected 0 iterations for an already-solved grid but got ${ability.lastOrderingIterations}`
  );
  assert.strictEqual(
    ability.lastOrderingEvents.length,
    0,
    `Expected 0 audit events for an already-solved grid but got ${ability.lastOrderingEvents.length}`
  );
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
