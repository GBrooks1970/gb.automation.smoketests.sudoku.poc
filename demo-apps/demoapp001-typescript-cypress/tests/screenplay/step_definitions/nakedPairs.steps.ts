import { Given, Then } from '@cucumber/cucumber';
import { actorCalled, notes } from '@serenity-js/core';
import * as assert from 'assert';
import { SOLVER_ACTOR } from '../support/actors';
import { SetupGridState } from '../tasks/SetupGridState';
import { assertPreparedPlacement, parseCandidates, setsEqual } from '../support/grid-assertions';
import { GridCell } from '../questions/GridCell';
import { GridSnapshot } from '../questions/GridSnapshot';
import { TargetCell } from '../questions/TargetCell';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { BLOCK_SIZE, GRID_SIZE } from '../../../app_src/constants';
import { TARGET_CELL, SudokuNotes } from '../support/memory-keys';

// ---------------------------------------------------------------------------
// Naked Pairs - Given steps
// ---------------------------------------------------------------------------

Given(
  'row {int} contains exactly two cells sharing candidate pair {string}',
  async (row: number, candidatesStr: string) => {
    const actor = actorCalled(SOLVER_ACTOR);
    await actor.attemptsTo(SetupGridState.nakedPairRow());
    const expected = parseCandidates(candidatesStr);
    let matchingCells = 0;
    for (let c = 0; c < GRID_SIZE; c++) {
      const cellCandidates = await actor.answer(GridCell.candidatesAt(row, c));
      if (setsEqual(cellCandidates, expected)) {
        matchingCells++;
      }
    }
    assert.strictEqual(
      matchingCells,
      2,
      `Expected exactly 2 cells sharing candidate pair {${candidatesStr}} in row ${row}, found ${matchingCells}`
    );
  }
);

Given(
  'another cell in row {int} has candidates {string}',
  async (row: number, candidatesStr: string) => {
    const actor = actorCalled(SOLVER_ACTOR);
    const expected = parseCandidates(candidatesStr);
    let foundCol: number | null = null;
    for (let c = 0; c < GRID_SIZE; c++) {
      const cellCandidates = await actor.answer(GridCell.candidatesAt(row, c));
      if (setsEqual(cellCandidates, expected)) {
        foundCol = c;
        break;
      }
    }
    assert.notStrictEqual(
      foundCol,
      null,
      `Expected a cell in row ${row} with candidates {${candidatesStr}}`
    );
    UseSudokuSolver.as(actor).setTargetCell(row, foundCol!);
    await notes<SudokuNotes>().set(TARGET_CELL, { row, col: foundCol! }).performAs(actor);
  }
);

Given(
  'column {int} contains exactly two cells sharing candidate pair {string}',
  async (col: number, candidatesStr: string) => {
    const actor = actorCalled(SOLVER_ACTOR);
    await actor.attemptsTo(SetupGridState.nakedPairColumn());
    const expected = parseCandidates(candidatesStr);
    let matchingCells = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      const cellCandidates = await actor.answer(GridCell.candidatesAt(r, col));
      if (setsEqual(cellCandidates, expected)) {
        matchingCells++;
      }
    }
    assert.strictEqual(
      matchingCells,
      2,
      `Expected exactly 2 cells sharing candidate pair {${candidatesStr}} in column ${col}, found ${matchingCells}`
    );
  }
);

Given(
  'another cell in column {int} has candidates {string}',
  async (col: number, candidatesStr: string) => {
    const actor = actorCalled(SOLVER_ACTOR);
    const expected = parseCandidates(candidatesStr);
    let foundRow: number | null = null;
    for (let r = 0; r < GRID_SIZE; r++) {
      const cellCandidates = await actor.answer(GridCell.candidatesAt(r, col));
      if (setsEqual(cellCandidates, expected)) {
        foundRow = r;
        break;
      }
    }
    assert.notStrictEqual(
      foundRow,
      null,
      `Expected a cell in column ${col} with candidates {${candidatesStr}}`
    );
    UseSudokuSolver.as(actor).setTargetCell(foundRow!, col);
    await notes<SudokuNotes>().set(TARGET_CELL, { row: foundRow!, col }).performAs(actor);
  }
);

Given(
  'a 3x3 block at position \\({int}, {int}\\) contains exactly two cells sharing candidate pair {string}',
  async (br: number, bc: number, candidatesStr: string) => {
    const actor = actorCalled(SOLVER_ACTOR);
    await actor.attemptsTo(SetupGridState.nakedPairBlock());
    const expected = parseCandidates(candidatesStr);
    let matchingCells = 0;
    const startRow = br * BLOCK_SIZE;
    const startCol = bc * BLOCK_SIZE;
    for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
      for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
        const cellCandidates = await actor.answer(GridCell.candidatesAt(r, c));
        if (setsEqual(cellCandidates, expected)) {
          matchingCells++;
        }
      }
    }
    assert.strictEqual(
      matchingCells,
      2,
      `Expected exactly 2 cells sharing candidate pair {${candidatesStr}} in block (${br}, ${bc}), found ${matchingCells}`
    );
  }
);

Given('another cell in that block has candidates {string}', async (candidatesStr: string) => {
  const actor = actorCalled(SOLVER_ACTOR);
  const expected = parseCandidates(candidatesStr);
  const target = await actor.answer(TargetCell.current());
  const br = Math.floor(target.row / BLOCK_SIZE);
  const bc = Math.floor(target.col / BLOCK_SIZE);
  const startRow = br * BLOCK_SIZE;
  const startCol = bc * BLOCK_SIZE;
  let foundCell: { row: number; col: number } | null = null;
  for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
    for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
      const cellCandidates = await actor.answer(GridCell.candidatesAt(r, c));
      if (setsEqual(cellCandidates, expected)) {
        foundCell = { row: r, col: c };
        break;
      }
    }
    if (foundCell) break;
  }
  assert.notStrictEqual(
    foundCell,
    null,
    `Expected a cell in block (${br}, ${bc}) with candidates {${candidatesStr}}`
  );
  UseSudokuSolver.as(actor).setTargetCell(foundCell!.row, foundCell!.col);
  await notes<SudokuNotes>().set(TARGET_CELL, foundCell!).performAs(actor);
});

Given('a grid state where no unit contains a naked pair', async () => {
  await actorCalled(SOLVER_ACTOR).attemptsTo(SetupGridState.noNakedPairs());
});

// ---------------------------------------------------------------------------
// Naked Pairs - Then steps
// ---------------------------------------------------------------------------

Then(
  'the cell in row {int} with candidates {string} should be updated to {int}',
  async (row: number, candidatesStr: string, val: number) => {
    const actor = actorCalled(SOLVER_ACTOR);
    const expected = parseCandidates(candidatesStr);
    assert.ok(
      expected.has(val),
      `Expected candidate set {${candidatesStr}} to contain placement value ${val}`
    );
    const snapshot = await actor.answer(GridSnapshot.current());
    const snapSolver = new SudokuSolver('snapshot', snapshot);
    const target = await actor.answer(TargetCell.current());
    assert.strictEqual(target.row, row, 'Target cell row does not match expected row');
    const snapCandidates = snapSolver.getCellCandidates(target.row, target.col);
    assert.ok(
      setsEqual(snapCandidates, expected),
      `Expected cell [${target.row},${target.col}] initial candidates to match {${candidatesStr}}`
    );
    await assertPreparedPlacement(actor, val, { row });
  }
);

Then(
  'the cell in column {int} with candidates {string} should be updated to {int}',
  async (col: number, candidatesStr: string, val: number) => {
    const actor = actorCalled(SOLVER_ACTOR);
    const expected = parseCandidates(candidatesStr);
    assert.ok(
      expected.has(val),
      `Expected candidate set {${candidatesStr}} to contain placement value ${val}`
    );
    const snapshot = await actor.answer(GridSnapshot.current());
    const snapSolver = new SudokuSolver('snapshot', snapshot);
    const target = await actor.answer(TargetCell.current());
    assert.strictEqual(target.col, col, 'Target cell column does not match expected column');
    const snapCandidates = snapSolver.getCellCandidates(target.row, target.col);
    assert.ok(
      setsEqual(snapCandidates, expected),
      `Expected cell [${target.row},${target.col}] initial candidates to match {${candidatesStr}}`
    );
    await assertPreparedPlacement(actor, val, { col });
  }
);

Then(
  'the cell in block \\({int}, {int}\\) with candidates {string} should be updated to {int}',
  async (br: number, bc: number, candidatesStr: string, val: number) => {
    const actor = actorCalled(SOLVER_ACTOR);
    const expected = parseCandidates(candidatesStr);
    assert.ok(
      expected.has(val),
      `Expected candidate set {${candidatesStr}} to contain placement value ${val}`
    );
    const snapshot = await actor.answer(GridSnapshot.current());
    const snapSolver = new SudokuSolver('snapshot', snapshot);
    const target = await actor.answer(TargetCell.current());
    assert.strictEqual(
      Math.floor(target.row / BLOCK_SIZE),
      br,
      'Target cell block row does not match expected block'
    );
    assert.strictEqual(
      Math.floor(target.col / BLOCK_SIZE),
      bc,
      'Target cell block column does not match expected block'
    );
    const snapCandidates = snapSolver.getCellCandidates(target.row, target.col);
    assert.ok(
      setsEqual(snapCandidates, expected),
      `Expected cell [${target.row},${target.col}] initial candidates to match {${candidatesStr}}`
    );
    await assertPreparedPlacement(actor, val, { block: [br, bc] });
  }
);
