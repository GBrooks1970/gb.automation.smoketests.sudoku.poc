import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { TARGET_CELL, GRID_SNAPSHOT, SudokuNotes } from '../support/memory-keys';
import { GRID_SIZE } from '../../../app_src/constants';

/**
 * Task: SetupGridState
 *
 * Factory functions returning Interactions that configure the solver's grid
 * into specific states required by test scenarios.
 * Each method maps to a distinct Gherkin Given step variant.
 *
 * targetCell() writes TARGET_CELL to Actor Memory (MIG-04).
 * valuesInRow/Column/Block() read TARGET_CELL from Actor Memory so step
 * definitions no longer access the Ability directly (MIG-05).
 */
export const SetupGridState = {

  // ---------------------------------------------------------------------------
  // Unit Completion scenarios
  // ---------------------------------------------------------------------------

  almostCompleteColumn: (col: number) =>
    Interaction.where(`#actor sets up column ${col} with 8 non-zero values`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.setupAlmostCompleteColumn(col);
      ability.takeSnapshot();
    }),

  almostCompleteBlock: (blockRow: number, blockCol: number) =>
    Interaction.where(
      `#actor sets up block (${blockRow},${blockCol}) with 8 non-zero values`,
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.setupAlmostCompleteBlock(blockRow, blockCol);
        ability.takeSnapshot();
      }
    ),

  withMultipleEmpties: () =>
    Interaction.where('#actor sets up a grid with multiple empties per unit', async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.setupMultipleEmpties();
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // Hidden Singles scenarios
  // ---------------------------------------------------------------------------

  rowMissingDigit: (rowIndex: number, target: number) =>
    Interaction.where(`#actor sets up row ${rowIndex} missing digit ${target}`, async actor => {
      UseSudokuSolver.as(actor).setupRowMissingDigit(rowIndex, target);
    }),

  rowColumnConstraints: (_count: number, _rowIndex: number, _target: number) =>
    Interaction.where('#actor confirms row-column constraints (context)', async actor => {
      UseSudokuSolver.as(actor).takeSnapshot();
    }),

  columnMissingDigit: (colIndex: number, target: number) =>
    Interaction.where(
      `#actor sets up column ${colIndex} missing digit ${target}`,
      async actor => {
        UseSudokuSolver.as(actor).setupColumnMissingDigit(colIndex, target);
      }
    ),

  columnRowConstraints: (_count: number, _colIndex: number, _target: number) =>
    Interaction.where('#actor confirms column-row constraints (context)', async actor => {
      UseSudokuSolver.as(actor).takeSnapshot();
    }),

  blockFourEmpties: () =>
    Interaction.where('#actor sets up a block with four empty cells', async actor => {
      UseSudokuSolver.as(actor).setupBlockFourEmpties();
    }),

  hiddenSingleInBlock: (target: number) =>
    Interaction.where(`#actor sets up a hidden single for digit ${target}`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.setupHiddenSingleInBlock(target);
      ability.takeSnapshot();
    }),

  digitInRow: (rowIndex: number, digit: number) =>
    Interaction.where(`#actor places digit ${digit} in row ${rowIndex}`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.setupDigitInRow(rowIndex, digit);
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
      UseSudokuSolver.as(actor).setupTargetCell(row, col);
      await notes<SudokuNotes>().set(TARGET_CELL, { row, col }).performAs(actor);
    }),

  /** Places values in the target cell's row (reads TARGET_CELL from Actor Memory). */
  valuesInRow: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's row`, async actor => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      UseSudokuSolver.as(actor).addValuesToRow(row, col, values);
    }),

  /** Places values in the target cell's column (reads TARGET_CELL from Actor Memory). */
  valuesInColumn: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's column`, async actor => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      UseSudokuSolver.as(actor).addValuesToColumn(col, row, values);
    }),

  /** Places values in the target cell's 3x3 block (reads TARGET_CELL from Actor Memory). */
  valuesInBlock: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's block`, async actor => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      UseSudokuSolver.as(actor).addValuesToBlock(row, col, row, col, values);
    }),

  threeCandidates: () =>
    Interaction.where('#actor sets up cell [0,0] with exactly three candidates [2,5,8]',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.setupThreeCandidates();
        ability.takeSnapshot();
        // setupThreeCandidates() always targets [0,0] — write to notes for MIG-05 parity
        await notes<SudokuNotes>().set(TARGET_CELL, { row: 0, col: 0 }).performAs(actor);
      }
    ),

  threeNakedSingles: () =>
    Interaction.where('#actor sets up 3 cells each with exactly one candidate',
      async actor => {
        const ability = UseSudokuSolver.as(actor);
        ability.setupThreeNakedSingles();
        ability.takeSnapshot();
      }
    ),

  // ---------------------------------------------------------------------------
  // Constraint Validation (Scenario Outline)
  // ---------------------------------------------------------------------------

  named: (gridState: string) =>
    Interaction.where(`#actor sets up named grid state "${gridState}"`, async actor => {
      const ability = UseSudokuSolver.as(actor);
      ability.setupNamedGridState(gridState);
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
      const puzzles = LoadPuzzles.as(actor).getAll();
      UseSudokuSolver.as(actor).setupMultipleSolvers(count, puzzles);
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
