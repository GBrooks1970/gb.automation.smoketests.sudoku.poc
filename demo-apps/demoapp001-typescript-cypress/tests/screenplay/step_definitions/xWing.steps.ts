import { Given } from '@cucumber/cucumber';
import { actorCalled, notes } from '@serenity-js/core';
import * as assert from 'assert';
import { SOLVER_ACTOR } from '../support/actors';
import { SetupGridState } from '../tasks/SetupGridState';
import { GridCell } from '../questions/GridCell';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { GRID_SIZE } from '../../../app_src/constants';
import { TARGET_CELL, SudokuNotes } from '../support/memory-keys';
import { parseCandidates, setsEqual } from '../support/grid-assertions';

// ---------------------------------------------------------------------------
// X-Wing - Given steps
// ---------------------------------------------------------------------------

Given(
  'rows {int} and {int} have candidate {int} only in columns {int} and {int}',
  async (r1: number, r2: number, digit: number, c1: number, c2: number) => {
    const actor = actorCalled(SOLVER_ACTOR);
    await actor.attemptsTo(SetupGridState.xWingRow());
    for (const r of [r1, r2]) {
      const colsWithDigit: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const cands = await actor.answer(GridCell.candidatesAt(r, c));
        if (cands.has(digit)) {
          colsWithDigit.push(c);
        }
      }
      assert.deepStrictEqual(
        colsWithDigit.sort(),
        [c1, c2].sort(),
        `Expected row ${r} to have candidate ${digit} only in columns [${c1}, ${c2}], found [${colsWithDigit}]`
      );
    }
  }
);

Given(
  'columns {int} and {int} have candidate {int} only in rows {int} and {int}',
  async (c1: number, c2: number, digit: number, r1: number, r2: number) => {
    const actor = actorCalled(SOLVER_ACTOR);
    await actor.attemptsTo(SetupGridState.xWingColumn());
    for (const c of [c1, c2]) {
      const rowsWithDigit: number[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        const cands = await actor.answer(GridCell.candidatesAt(r, c));
        if (cands.has(digit)) {
          rowsWithDigit.push(r);
        }
      }
      assert.deepStrictEqual(
        rowsWithDigit.sort(),
        [r1, r2].sort(),
        `Expected column ${c} to have candidate ${digit} only in rows [${r1}, ${r2}], found [${rowsWithDigit}]`
      );
    }
  }
);

Given(
  'another cell at row {int}, column {int} has candidates {string}',
  async (row: number, col: number, candidatesStr: string) => {
    const actor = actorCalled(SOLVER_ACTOR);
    const expected = parseCandidates(candidatesStr);
    const actual = await actor.answer(GridCell.candidatesAt(row, col));
    assert.ok(
      setsEqual(actual, expected),
      `Expected cell [${row},${col}] to have candidates {${candidatesStr}}, found {${Array.from(actual).join(', ')}}`
    );
    UseSudokuSolver.as(actor).setTargetCell(row, col);
    await notes<SudokuNotes>().set(TARGET_CELL, { row, col }).performAs(actor);
  }
);

Given('a grid state where no X-Wing pattern exists', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.noXWing());
});
