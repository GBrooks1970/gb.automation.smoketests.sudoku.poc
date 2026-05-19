import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SOLVER_ACTOR } from '../support/actors';
import * as assert from 'assert';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

// ---------------------------------------------------------------------------
// Audit Trail - Given steps
// ---------------------------------------------------------------------------

Given('audit logging is enabled', async () => {
  actorCalled(SOLVER_ACTOR);
  UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).enableAudit();
});

// ---------------------------------------------------------------------------
// Audit Trail - When steps
// ---------------------------------------------------------------------------

When('the solver attempts to solve it with audit', async () => {
  UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).solvePuzzleWithAudit();
});

// ---------------------------------------------------------------------------
// Audit Trail - Then steps
// ---------------------------------------------------------------------------

Then('the audit trail should be generated', () => {
  const trail = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAuditTrail;
  assert.ok(trail, 'Expected an audit trail to be generated');
});

Then('the audit trail should contain at least one cell change', () => {
  const trail = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAuditTrail;
  assert.ok(trail && trail.totalChanges > 0,
    `Expected at least one cell change but got ${trail?.totalChanges ?? 0}`);
});

Then('every cell change should have an algorithm attribution', () => {
  const trail = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAuditTrail;
  assert.ok(trail, 'Expected an audit trail');
  for (const event of trail.events) {
    assert.ok(event.algorithm,
      `Event ${event.eventId} has no algorithm attribution`);
  }
});

Then('the audit trail statistics should account for all changes', () => {
  const trail = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAuditTrail;
  assert.ok(trail, 'Expected an audit trail');
  const s = trail.statistics;
  const statsTotal = s.changesByAlgorithm.unitCompletion
    + s.changesByAlgorithm.hiddenSingles
    + s.changesByAlgorithm.nakedSingles;
  assert.strictEqual(statsTotal, trail.totalChanges,
    `Statistics total (${statsTotal}) does not match totalChanges (${trail.totalChanges})`);
});

Then('no audit trail should be present', () => {
  const trail = UseSudokuSolver.as(actorCalled(SOLVER_ACTOR)).lastAuditTrail;
  assert.strictEqual(trail, undefined, 'Expected no audit trail when audit is disabled');
});
