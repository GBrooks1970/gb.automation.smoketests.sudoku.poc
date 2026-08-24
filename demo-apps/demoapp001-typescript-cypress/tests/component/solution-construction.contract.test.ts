import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generateCompleteSolution,
  GeneratorTimeoutError,
  isValidSolution,
  Mulberry32,
} from '../../app_src/generator';

test('Mulberry32 generates identical float sequence for numeric seed', () => {
  const prng1 = new Mulberry32(12345);
  const prng2 = new Mulberry32(12345);

  const seq1 = Array.from({ length: 10 }, () => prng1.next());
  const seq2 = Array.from({ length: 10 }, () => prng2.next());

  assert.deepEqual(seq1, seq2);
});

test('Mulberry32 generates identical float sequence for string seed', () => {
  const prng1 = new Mulberry32('sudoku-seed-test');
  const prng2 = new Mulberry32('sudoku-seed-test');

  const seq1 = Array.from({ length: 10 }, () => prng1.next());
  const seq2 = Array.from({ length: 10 }, () => prng2.next());

  assert.deepEqual(seq1, seq2);
});

test('Mulberry32 shuffles arrays deterministically', () => {
  const prng1 = new Mulberry32(999);
  const prng2 = new Mulberry32(999);

  const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled1 = prng1.shuffle(input);
  const shuffled2 = prng2.shuffle(input);

  assert.deepEqual(shuffled1, shuffled2);
  assert.equal(shuffled1.length, input.length);
  for (const item of input) {
    assert.ok(shuffled1.includes(item));
  }
});

test('generateCompleteSolution produces identical 9x9 solution grids for identical numeric seed', () => {
  const solution1 = generateCompleteSolution(424242);
  const solution2 = generateCompleteSolution(424242);

  assert.deepEqual(solution1, solution2);
});

test('generateCompleteSolution produces identical 9x9 solution grids for identical string seed', () => {
  const solution1 = generateCompleteSolution('seed-alpha');
  const solution2 = generateCompleteSolution('seed-alpha');

  assert.deepEqual(solution1, solution2);
});

test('generateCompleteSolution produces distinct valid 9x9 solution grids for different seeds', () => {
  const solutionA = generateCompleteSolution(1001);
  const solutionB = generateCompleteSolution(2002);

  assert.notDeepEqual(solutionA, solutionB);
});

test('generateCompleteSolution produces 100% valid 9x9 Sudoku solutions across multiple seeds', () => {
  const testSeeds = [1, 42, 999, 'seed1', 'seed2', 'portfolio-demo'];

  for (const seed of testSeeds) {
    const grid = generateCompleteSolution(seed);

    assert.equal(grid.length, 9);
    for (let r = 0; r < 9; r++) {
      assert.equal(grid[r].length, 9);
    }

    assert.equal(isValidSolution(grid), true);
  }
});

test('generateCompleteSolution enforces iteration boundary limit and throws GeneratorTimeoutError', () => {
  assert.throws(
    () => {
      generateCompleteSolution(123, 1);
    },
    (err: unknown) => {
      return err instanceof GeneratorTimeoutError;
    }
  );
});

test('generateCompleteSolution generates complete solutions within performance budget (< 15ms per solution)', () => {
  const startTime = Date.now();
  const count = 10;

  for (let i = 0; i < count; i++) {
    const grid = generateCompleteSolution(i + 100);
    assert.equal(isValidSolution(grid), true);
  }

  const totalTimeMs = Date.now() - startTime;
  const avgTimeMs = totalTimeMs / count;

  assert.ok(avgTimeMs < 15, `Average time per solution (${avgTimeMs}ms) was not below 15ms.`);
});
