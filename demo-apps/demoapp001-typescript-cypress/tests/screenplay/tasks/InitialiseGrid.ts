import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { GRID_SNAPSHOT, SudokuNotes } from '../support/memory-keys';
import { GRID_SIZE, EMPTY_CELL } from '../../../app_src/constants';
import * as GridFixtures from '../fixtures/GridFixtures';

/**
 * Task: InitialiseGrid
 *
 * Factory functions returning Interactions that create a new SudokuSolver
 * in various starting states. Each method maps to a specific Gherkin Given variant.
 *
 * fromPuzzleNamed() additionally writes GRID_SNAPSHOT to Actor Memory so that
 * subsequent steps can retrieve the original grid via GridSnapshot.current() (MIG-04).
 */
export const InitialiseGrid = {
  empty: () =>
    Interaction.where('#actor initialises an empty Sudoku grid', async actor => {
      UseSudokuSolver.as(actor).initialise('test');
    }),

  withRowValues: (options: { row: number; values: number[] }) => {
    const grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(EMPTY_CELL)
    );
    grid[options.row] = [...options.values];
    return Interaction.where(
      `#actor initialises a grid with row ${options.row} set`,
      async actor => {
        UseSudokuSolver.as(actor).initialise('test', grid);
      }
    );
  },

  fromPuzzle: (puzzle: { name: string; grid: number[][] }) =>
    Interaction.where(`#actor initialises a grid from puzzle "${puzzle.name}"`, async actor => {
      UseSudokuSolver.as(actor).initialise(puzzle.name, puzzle.grid);
    }),

  fromPuzzleNamed: (name: string) =>
    Interaction.where(`#actor loads and initialises from puzzle "${name}" and snapshots origGrid`, async actor => {
      const puzzle = LoadPuzzles.as(actor).getByName(name);
      if (!puzzle) throw new Error(`Puzzle not found: "${name}"`);
      const ability = UseSudokuSolver.as(actor);
      ability.initialise(puzzle.name, puzzle.grid);
      const origGrid = ability.getSolver().origGrid.map(r => [...r]);
      ability.storeSnapshot(origGrid);
      await notes<SudokuNotes>().set(GRID_SNAPSHOT, origGrid).performAs(actor);
    }),

  withGrid: (name: string, grid: number[][]) =>
    Interaction.where(`#actor initialises a grid from provided values`, async actor => {
      UseSudokuSolver.as(actor).initialise(name, grid);
    }),

  withCompleteGrid: (grid: number[][]) =>
    Interaction.where(`#actor initialises a completed Sudoku grid`, async actor => {
      UseSudokuSolver.as(actor).initialise('complete', grid);
    }),

  withDuplicateInRow: (rowIndex: number, value: number) =>
    Interaction.where(
      `#actor initialises a grid with duplicate ${value} in row ${rowIndex}`,
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('duplicate');
        GridFixtures.setupWithDuplicateInRow(ability.getSolver(), rowIndex, value);
      }
    ),
};
