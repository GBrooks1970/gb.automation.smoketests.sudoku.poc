import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { SudokuOrchestrator } from '../../app_src/SudokuOrchestrator';
import { SudokuSolver } from '../../app_src/SudokuSolver';
import {
  AttemptCellChange,
  AttemptEvent,
  AttemptTechnique,
} from '../../app_src/orchestration/AttemptTypes';

const EMPTY_GRID = Array.from({ length: 9 }, () => Array(9).fill(0));
const SOLVED_EXCEPT_ONE = [
  [5, 3, 4, 6, 7, 8, 9, 1, 0],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function expectedIteration(): Array<{ technique: AttemptTechnique; parameter?: number }> {
  return [
    { technique: 'UnitCompletion', parameter: undefined },
    ...Array.from({ length: 9 }, (_, index) => ({
      technique: 'HiddenSingles' as const,
      parameter: index + 1,
    })),
    { technique: 'NakedSingles', parameter: undefined },
  ];
}

test('observer records every unchanged attempt in exact orchestration order', () => {
  const events: AttemptEvent[] = [];
  const solver = new SudokuSolver('empty', EMPTY_GRID);

  const result = new SudokuOrchestrator(solver, undefined, (event) => events.push(event)).solve();

  assert.equal(result, 'STUCK_ON_ADVANCED_LOGIC');
  assert.equal(events.length, 11);
  assert.deepEqual(
    events.map(({ technique, parameter }) => ({ technique, parameter })),
    expectedIteration()
  );
  assert.deepEqual(
    events.map(({ iteration }) => iteration),
    Array(11).fill(1)
  );
  assert.deepEqual(
    events.map(({ sequence }) => sequence),
    Array.from({ length: 11 }, (_, index) => index + 1)
  );
  assert.ok(events.every((event) => !event.changed && event.changes.length === 0));
});

test('observer records immutable change evidence and progress before the terminal pass', () => {
  const events: AttemptEvent[] = [];
  const solver = new SudokuSolver('one missing', SOLVED_EXCEPT_ONE);

  const result = new SudokuOrchestrator(solver, undefined, (event) => events.push(event)).solve();

  assert.equal(result, 'SOLVED');
  assert.deepEqual([...new Set(events.map(({ iteration }) => iteration))], [1, 2]);
  assert.ok(events.filter(({ iteration }) => iteration === 1).some(({ changed }) => changed));
  assert.ok(events.filter(({ iteration }) => iteration === 2).every(({ changed }) => !changed));

  const changedEvent = events.find(({ changed }) => changed);
  assert.ok(changedEvent);
  assert.deepEqual(changedEvent.changes, [{ cell: { row: 0, col: 8 }, oldValue: 0, newValue: 2 }]);
  assert.ok(Object.isFrozen(changedEvent));
  assert.ok(Object.isFrozen(changedEvent.changes));
  assert.ok(Object.isFrozen(changedEvent.changes[0]));
  assert.ok(Object.isFrozen(changedEvent.changes[0].cell));
  assert.throws(
    () => (changedEvent.changes as AttemptCellChange[]).push(changedEvent.changes[0]),
    TypeError
  );
});
