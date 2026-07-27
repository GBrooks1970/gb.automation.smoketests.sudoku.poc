import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { test } from 'node:test';
import { PuzzleLoader } from '../../app_src/PuzzleLoader';

const GRID_SIZE = 9;

test('loads integer boundary values and exposes puzzle queries', () => {
  const grid = emptyGrid();
  grid[0][1] = 9;

  withPuzzleDocument(puzzleDocument(grid), (filePath) => {
    const loader = new PuzzleLoader(filePath);

    assert.equal(loader.getPuzzleCount(), 1);
    assert.equal(loader.getPuzzleByName('Boundary Grid')?.grid[0][1], 9);
    assert.equal(loader.getPuzzlesByDifficulty('EASY').length, 1);
    assert.equal(loader.getPuzzleByIndex(0)?.name, 'Boundary Grid');
    assert.deepEqual(loader.listPuzzleNames(), ['Boundary Grid']);
  });
});

test('rejects missing puzzle files', () => {
  const missingPath = path.join(os.tmpdir(), `missing-puzzles-${Date.now()}.json`);

  assert.throws(() => new PuzzleLoader(missingPath), /Puzzle file not found/);
});

test('rejects invalid row and column dimensions', () => {
  withPuzzleDocument(puzzleDocument(emptyGrid().slice(0, 8)), (filePath) => {
    assert.throws(() => new PuzzleLoader(filePath), /must have exactly 9 rows/);
  });

  const shortRowGrid = emptyGrid();
  shortRowGrid[0] = shortRowGrid[0].slice(0, 8);
  withPuzzleDocument(puzzleDocument(shortRowGrid), (filePath) => {
    assert.throws(() => new PuzzleLoader(filePath), /must have exactly 9 columns/);
  });
});

test('rejects non-integer, boolean, and out-of-range cells', () => {
  for (const invalidCell of [1.5, true, false, -1, 10]) {
    const grid: unknown[][] = emptyGrid();
    grid[0][0] = invalidCell;

    withPuzzleDocument(puzzleDocument(grid), (filePath) => {
      assert.throws(() => new PuzzleLoader(filePath), /has invalid value/);
    });
  }
});

function emptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function puzzleDocument(grid: unknown[][]): unknown {
  return {
    puzzles: [
      {
        name: 'Boundary Grid',
        difficulty: 'easy',
        description: 'Focused loader boundary fixture',
        grid,
      },
    ],
  };
}

function withPuzzleDocument(document: unknown, action: (filePath: string) => void): void {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'sudoku-loader-component-'));
  const filePath = path.join(tempDirectory, 'puzzles.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(document), 'utf-8');
    action(filePath);
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}
