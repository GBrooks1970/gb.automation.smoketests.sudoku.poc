import * as assert from 'node:assert/strict';
import * as os from 'node:os';
import * as path from 'node:path';
import { test } from 'node:test';
import { LoadPuzzles } from '../screenplay/abilities/LoadPuzzles';

const PUZZLES_PATH = path.resolve(__dirname, '../../puzzles.json');

test('surfaces missing-file error across every getter while preserving getError', () => {
  const missingPath = path.join(os.tmpdir(), `missing-ability-puzzles-${Date.now()}.json`);
  const ability = LoadPuzzles.from(missingPath);

  const error = ability.getError();
  assert.ok(error instanceof Error);
  assert.match(error.message, /Puzzle file not found/);

  assert.throws(() => ability.getAll(), /Puzzle file not found/);
  assert.throws(() => ability.getByName('Easy Scan Grid'), /Puzzle file not found/);
  assert.throws(() => ability.getByIndex(0), /Puzzle file not found/);
  assert.throws(() => ability.getByDifficulty('easy'), /Puzzle file not found/);
  assert.throws(() => ability.getCount(), /Puzzle file not found/);
});

test('delegates every getter cleanly and returns null getError when load succeeds', () => {
  const ability = LoadPuzzles.from(PUZZLES_PATH);

  assert.equal(ability.getError(), null);
  assert.equal(ability.getCount(), 5);
  assert.equal(ability.getAll().length, 5);
  assert.equal(ability.getByName('Easy Scan Grid')?.name, 'Easy Scan Grid');
  assert.equal(ability.getByIndex(0)?.name, 'Easy Scan Grid');
  assert.ok(ability.getByDifficulty('easy').length > 0);
});
