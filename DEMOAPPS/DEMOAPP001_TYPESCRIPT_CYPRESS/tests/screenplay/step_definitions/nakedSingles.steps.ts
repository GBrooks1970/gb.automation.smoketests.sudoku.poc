import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { ApplyAlgorithm } from '../tasks/ApplyAlgorithm';
import { SetupGridState } from '../tasks/SetupGridState';
import { AlgorithmMadeProgress } from '../questions/AlgorithmMadeProgress';
import { GridCell } from '../questions/GridCell';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { EMPTY_CELL } from '../../../app_src/constants';

// ---------------------------------------------------------------------------
// Naked Singles - Given steps
// ---------------------------------------------------------------------------

Given('an empty cell at row {int}, column {int}', async (row: number, col: number) => {
  await actorCalled('Solver').attemptsTo(SetupGridState.targetCell(row, col));
});

Given('the numbers {int}, {int}, {int} are in the same row',
  async (a: number, b: number, c: number) => {
    const actor = actorCalled('Solver');
    const { row, col } = UseSudokuSolver.as(actor).targetCell;
    await actor.attemptsTo(SetupGridState.valuesInRow(row, col, [a, b, c]));
  });

Given('the numbers {int}, {int}, {int} are in the same column',
  async (a: number, b: number, c: number) => {
    const actor = actorCalled('Solver');
    const { row, col } = UseSudokuSolver.as(actor).targetCell;
    await actor.attemptsTo(SetupGridState.valuesInColumn(col, row, [a, b, c]));
  });

Given('the numbers {int}, {int} are in the same 3x3 block',
  async (a: number, b: number) => {
    const actor = actorCalled('Solver');
    const { row, col } = UseSudokuSolver.as(actor).targetCell;
    await actor.attemptsTo(SetupGridState.valuesInBlock(row, col, row, col, [a, b]));
  });

Given('an empty cell has 3 possible candidates: [2, 5, 8]', async () => {
  await actorCalled('Solver').attemptsTo(SetupGridState.threeCandidates());
});

Given('{int} empty cells each have exactly one possible value', async (_count: number) => {
  await actorCalled('Solver').attemptsTo(SetupGridState.threeNakedSingles());
});

// ---------------------------------------------------------------------------
// Naked Singles - When steps (shared with unitCompletion.steps.ts via 'algorithm is executed')
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Naked Singles - Then steps
// ---------------------------------------------------------------------------

Then('the system should determine the only possible value is {int}',
  async (value: number) => {
    const actor = actorCalled('Solver');
    const made = await actor.answer(AlgorithmMadeProgress.afterLastCall());
    assert.ok(made, 'Expected nakedSingles to return true');
    const { row, col } = UseSudokuSolver.as(actor).targetCell;
    const cellValue = await actor.answer(GridCell.at(row, col));
    assert.strictEqual(cellValue, value);
  });

Then('the cell at row {int}, column {int} should be updated to {int}',
  async (row: number, col: number, value: number) => {
    const cellValue = await actorCalled('Solver').answer(GridCell.at(row, col));
    assert.strictEqual(cellValue, value);
  });

Then('the cell should not be filled', async () => {
  const actor = actorCalled('Solver');
  const { row, col } = UseSudokuSolver.as(actor).targetCell;
  const cellValue = await actor.answer(GridCell.at(row, col));
  assert.strictEqual(cellValue, EMPTY_CELL);
});

Then('the algorithm should continue to other cells', async () => {
  const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
  assert.strictEqual(made, false);
});

Then('all {int} cells should be filled with their respective values',
  async (_count: number) => {
    const actor = actorCalled('Solver');
    const made = await actor.answer(AlgorithmMadeProgress.afterLastCall());
    assert.ok(made, 'Expected nakedSingles to return true');
    assert.strictEqual(await actor.answer(GridCell.at(0, 0)), 5);
    assert.strictEqual(await actor.answer(GridCell.at(4, 4)), 5);
    assert.strictEqual(await actor.answer(GridCell.at(8, 8)), 9);
  });

Then('the algorithm should return true', async () => {
  const made = await actorCalled('Solver').answer(AlgorithmMadeProgress.afterLastCall());
  assert.ok(made);
});
