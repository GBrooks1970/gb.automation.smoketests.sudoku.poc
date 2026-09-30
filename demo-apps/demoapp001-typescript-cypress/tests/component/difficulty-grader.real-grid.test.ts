import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuditLogger } from '../../app_src/audit/AuditLogger';
import { gradePuzzle } from '../../app_src/generator/difficulty-grader';
import { UniquenessOracle } from '../../app_src/generator/uniqueness-oracle';
import { SudokuTutorService } from '../../app_src/server/SudokuTutorService';
import { SudokuSolver } from '../../app_src/SudokuSolver';

// Derived with generateCompleteSolution('xwing-regression-242') followed by
// reduceToClues(solution, 24, 'xwing-regression-242', false). The committed grid
// keeps this regression independent of subsequent generator changes.
const X_WING_PUZZLE = [
  [0, 5, 0, 0, 0, 8, 0, 0, 7],
  [0, 0, 0, 3, 0, 6, 5, 0, 8],
  [8, 0, 0, 1, 0, 0, 0, 0, 4],
  [0, 1, 0, 4, 0, 0, 0, 0, 0],
  [7, 0, 0, 0, 3, 0, 0, 0, 5],
  [0, 2, 0, 0, 7, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 3, 0, 9, 0],
  [2, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 0, 0, 0, 0, 2, 0],
];

const EXPECTED_SOLUTION = [
  [3, 5, 1, 9, 4, 8, 2, 6, 7],
  [9, 4, 7, 3, 2, 6, 5, 1, 8],
  [8, 6, 2, 1, 5, 7, 9, 3, 4],
  [6, 1, 8, 4, 9, 5, 3, 7, 2],
  [7, 9, 4, 6, 3, 2, 1, 8, 5],
  [5, 2, 3, 8, 7, 1, 6, 4, 9],
  [1, 7, 5, 2, 8, 3, 4, 9, 6],
  [2, 3, 9, 7, 6, 4, 8, 5, 1],
  [4, 8, 6, 5, 1, 9, 7, 2, 3],
];

test('gradePuzzle grades a real XWing-to-completion tutor solve as Expert', () => {
  assert.equal(UniquenessOracle.countSolutions(X_WING_PUZZLE, 2), 1);
  const input = X_WING_PUZZLE.map((row) => [...row]);
  const board = X_WING_PUZZLE.map((row) => [...row]);
  const tutor = new SudokuTutorService();
  const xWingSteps: number[] = [];

  // Replay the real service, proving XWing is used on an actual solvable grid
  // rather than inferring it from a controlled technique-token seam.
  for (let step = 0; step < 57; step++) {
    const before = board.map((row) => [...row]);
    const hint = tutor.getHint(board);
    assert.deepEqual(board, before, 'hint evaluation must preserve its input');
    assert.equal(hint.status, 'HINT_AVAILABLE');
    assert.ok(hint.move);
    assert.equal(board[hint.move.cell.row][hint.move.cell.col], 0);
    assert.equal(hint.move.previousValue, 0);

    if (hint.technique === 'XWing') {
      xWingSteps.push(step);
      assert.deepEqual(hint.move, { cell: { row: 7, col: 3 }, digit: 7, previousValue: 0 });

      const solver = new SudokuSolver('xwing-grading-regression', before);
      const audit = new AuditLogger('xwing-grading-regression', before);
      solver.setAuditLogger(audit);
      assert.equal(solver.xWing(), true);
      const events = audit.getTrail(solver.getGrid(), 'STUCK_ON_ADVANCED_LOGIC').events;
      assert.equal(events[0].algorithm, 'XWing');
      assert.deepEqual(events[0].cellChanges[0], {
        cell: { row: 7, col: 3 },
        oldValue: 0,
        newValue: 7,
        reason: 'X-Wing for digit 6 in rows 4,8 columns 2,3 eliminated 6, leaving 7',
      });
    }

    board[hint.move.cell.row][hint.move.cell.col] = hint.move.digit;
  }

  assert.deepEqual(xWingSteps, [34]);
  assert.equal(tutor.getHint(board).status, 'SOLVED');
  assert.deepEqual(board, EXPECTED_SOLUTION);
  assert.equal(new SudokuSolver('completed-xwing-regression', board).isValidSolution(), true);

  assert.deepEqual(gradePuzzle(input), {
    difficulty: 'Expert',
    highestTechnique: 'X-Wing',
    solveSteps: 57,
    isSolvable: true,
    usedTechniques: ['HiddenSingles', 'UnitCompletion', 'NakedSingles', 'XWing'],
  });
  assert.deepEqual(input, X_WING_PUZZLE, 'grading must preserve the caller grid');
});
