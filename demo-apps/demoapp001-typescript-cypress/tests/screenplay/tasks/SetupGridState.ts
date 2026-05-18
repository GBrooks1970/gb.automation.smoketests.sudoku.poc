import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { TARGET_CELL, GRID_SNAPSHOT, SudokuNotes } from '../support/memory-keys';
import { GRID_SIZE } from '../../../app_src/constants';
import * as GridFixtures from '../fixtures/GridFixtures';

/**
 * Task: SetupGridState
 *
 * Factory functions returning Interactions that configure the solver's grid
 * into specific states required by test scenarios. Grid manipulation is
 * delegated to GridFixtures (pure functions on SudokuSolver), keeping this
 * Task responsible only for orchestration and Actor Memory writes.
 */
export const SetupGridState = {

  // ---------------------------------------------------------------------------
  // Unit Completion scenarios
  // ---------------------------------------------------------------------------

  almostCompleteColumn: (col: number) =>
    Interaction.where(`#actor sets up column ${col} with 8 non-zero values`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupAlmostCompleteColumn(ability.getSolver(), col);
      ability.takeSnapshot();
    }),

  almostCompleteBlock: (blockRow: number, blockCol: number) =>
    Interaction.where(
      `#actor sets up block (${blockRow},${blockCol}) with 8 non-zero values`,
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        GridFixtures.setupAlmostCompleteBlock(ability.getSolver(), blockRow, blockCol);
        ability.takeSnapshot();
      }
    ),

  withMultipleEmpties: () =>
    Interaction.where('#actor sets up a grid with multiple empties per unit', async actor => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupMultipleEmpties(ability.getSolver());
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // Hidden Singles scenarios
  // ---------------------------------------------------------------------------

  rowMissingDigit: (rowIndex: number, target: number) =>
    Interaction.where(`#actor sets up row ${rowIndex} missing digit ${target}`, async actor => {
      GridFixtures.setupRowMissingDigit(UseSudokuSolver.as(actor).getSolver(), rowIndex, target);
    }),

  rowColumnConstraints: (_count: number, _rowIndex: number, _target: number) =>
    Interaction.where('#actor confirms row-column constraints (context)', async actor => {
      UseSudokuSolver.as(actor).takeSnapshot();
    }),

  columnMissingDigit: (colIndex: number, target: number) =>
    Interaction.where(
      `#actor sets up column ${colIndex} missing digit ${target}`,
      async actor => {
        GridFixtures.setupColumnMissingDigit(UseSudokuSolver.as(actor).getSolver(), colIndex, target);
      }
    ),

  columnRowConstraints: (_count: number, _colIndex: number, _target: number) =>
    Interaction.where('#actor confirms column-row constraints (context)', async actor => {
      UseSudokuSolver.as(actor).takeSnapshot();
    }),

  blockFourEmpties: () =>
    Interaction.where('#actor sets up a block with four empty cells', async actor => {
      GridFixtures.setupBlockFourEmpties(UseSudokuSolver.as(actor).getSolver());
    }),

  hiddenSingleInBlock: (target: number) =>
    Interaction.where(`#actor sets up a hidden single for digit ${target}`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupHiddenSingleInBlock(ability.getSolver(), target);
      ability.takeSnapshot();
    }),

  digitInRow: (rowIndex: number, digit: number) =>
    Interaction.where(`#actor places digit ${digit} in row ${rowIndex}`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupDigitInRow(ability.getSolver(), rowIndex, digit);
      ability.takeSnapshot();
    }),

  withMultipleCandidates: () =>
    Interaction.where('#actor re-initialises grid so digit has multiple candidate positions',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('test');
        ability.takeSnapshot();
      }
    ),

  // ---------------------------------------------------------------------------
  // Naked Singles scenarios
  // ---------------------------------------------------------------------------

  targetCell: (row: number, col: number) =>
    Interaction.where(`#actor targets cell [${row},${col}]`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.clearCell(ability.getSolver(), row, col);
      ability.setTargetCell(row, col);
      await notes<SudokuNotes>().set(TARGET_CELL, { row, col }).performAs(actor);
    }),

  valuesInRow: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's row`, async actor => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      GridFixtures.addValuesToRow(UseSudokuSolver.as(actor).getSolver(), row, col, values);
    }),

  valuesInColumn: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's column`, async actor => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      GridFixtures.addValuesToColumn(UseSudokuSolver.as(actor).getSolver(), col, row, values);
    }),

  valuesInBlock: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's block`, async actor => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      GridFixtures.addValuesToBlock(UseSudokuSolver.as(actor).getSolver(), row, col, row, col, values);
    }),

  threeCandidates: () =>
    Interaction.where('#actor sets up cell [0,0] with exactly three candidates [2,5,8]',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('test');
        GridFixtures.setupThreeCandidates(ability.getSolver());
        ability.takeSnapshot();
        ability.setTargetCell(0, 0);
        await notes<SudokuNotes>().set(TARGET_CELL, { row: 0, col: 0 }).performAs(actor);
      }
    ),

  threeNakedSingles: () =>
    Interaction.where('#actor sets up 3 cells each with exactly one candidate',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('test');
        GridFixtures.setupThreeNakedSingles(ability.getSolver());
        ability.takeSnapshot();
      }
    ),

  // ---------------------------------------------------------------------------
  // Constraint Validation (Scenario Outline)
  // ---------------------------------------------------------------------------

  named: (gridState: string) =>
    Interaction.where(`#actor sets up named grid state "${gridState}"`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.initialise('test');
      GridFixtures.setupNamedGridState(ability.getSolver(), gridState);
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // Grid Initialization tests
  // ---------------------------------------------------------------------------

  fromSpecificGrid: (grid: number[][]) =>
    Interaction.where('#actor stores a specific grid snapshot', async actor => {
      UseSudokuSolver.as(actor).storeSnapshot(grid);
      await notes<SudokuNotes>().set(GRID_SNAPSHOT, grid).performAs(actor);
    }),

  // ---------------------------------------------------------------------------
  // Edge Case tests
  // ---------------------------------------------------------------------------

  multipleSolvers: (count: number) =>
    Interaction.where(`#actor loads ${count} independent solver instances`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      const puzzles = LoadPuzzles.as(actor).getAll();
      ability.setMultipleSolvers(GridFixtures.createSolversFromPuzzles(count, puzzles));
    }),

  noProgress: () =>
    Interaction.where('#actor sets up an empty grid where no algorithm makes progress',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('stuck');
        ability.takeSnapshot();
      }
    ),

  runAllAlgorithmsIndividually: () =>
    Interaction.where('#actor runs all three algorithms individually on the grid',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.takeSnapshot();
        ability.applyUnitCompletion();
        for (let d = 1; d <= GRID_SIZE; d++) ability.applyHiddenSingles(d);
        ability.applyNakedSingles();
      }
    ),
};
