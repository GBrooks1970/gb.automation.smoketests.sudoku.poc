import { Actor } from '@serenity-js/core';
import * as assert from 'assert';
import { BLOCK_SIZE, EMPTY_CELL, GRID_SIZE } from '../../../app_src/constants';
import { GridCell } from '../questions/GridCell';
import { GridSnapshot } from '../questions/GridSnapshot';
import { TargetCell } from '../questions/TargetCell';

type ExpectedPosition = { row?: number; col?: number; block?: [number, number] };

async function fixtureSnapshot(actor: Actor): Promise<number[][]> {
  const snapshot = await actor.answer(GridSnapshot.current());
  assert.strictEqual(snapshot.length, GRID_SIZE, 'Expected a pre-operation fixture snapshot');
  assert.ok(snapshot.every((row) => row.length === GRID_SIZE));
  return snapshot;
}

export async function assertCellTransition(
  actor: Actor,
  row: number,
  col: number,
  value: number
): Promise<void> {
  const snapshot = await fixtureSnapshot(actor);
  assert.strictEqual(
    snapshot[row][col],
    EMPTY_CELL,
    `Cell [${row},${col}] was not originally empty`
  );
  assert.strictEqual(
    await actor.answer(GridCell.at(row, col)),
    value,
    `Expected newly placed ${value} at [${row},${col}]`
  );
}

export async function assertPreparedPlacement(
  actor: Actor,
  value: number,
  position: ExpectedPosition = {}
): Promise<void> {
  const target = await actor.answer(TargetCell.current());
  if (position.row !== undefined) {
    assert.strictEqual(target.row, position.row, 'Expected row does not match the prepared target');
  }
  if (position.col !== undefined) {
    assert.strictEqual(
      target.col,
      position.col,
      'Expected column does not match the prepared target'
    );
  }
  if (position.block !== undefined) {
    assert.deepStrictEqual(
      [Math.floor(target.row / BLOCK_SIZE), Math.floor(target.col / BLOCK_SIZE)],
      position.block,
      'Expected block does not contain the prepared target'
    );
  }
  await assertCellTransition(actor, target.row, target.col, value);
}

export async function assertPreparedRowUnchanged(actor: Actor, row: number): Promise<void> {
  const target = await actor.answer(TargetCell.current());
  assert.strictEqual(target.row, row, 'Expected row does not match the prepared row');
  const snapshot = await fixtureSnapshot(actor);
  const current = await Promise.all(
    snapshot[row].map((_value, col) => actor.answer(GridCell.at(row, col)))
  );
  assert.deepStrictEqual(current, snapshot[row], `Expected row ${row} to remain unchanged`);
}
