import {
  AnswersQuestions,
  CollectsArtifacts,
  Interaction,
  UsesAbilities,
  notes,
} from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import { TARGET_CELL, GRID_SNAPSHOT, SudokuNotes } from '../support/memory-keys';
import { BLOCK_SIZE, GRID_SIZE } from '../../../app_src/constants';
import * as GridFixtures from '../fixtures/GridFixtures';

async function recordFixture(
  actor: UsesAbilities & AnswersQuestions & CollectsArtifacts,
  target?: { row: number; col: number }
): Promise<void> {
  const ability = UseSudokuSolver.as(actor);
  ability.takeSnapshot();
  await notes<SudokuNotes>()
    .set(
      GRID_SNAPSHOT,
      ability.gridSnapshot.map((row) => [...row])
    )
    .performAs(actor);
  if (target) {
    ability.setTargetCell(target.row, target.col);
    await notes<SudokuNotes>().set(TARGET_CELL, target).performAs(actor);
  }
}

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

  almostCompleteColumn: (col: number, missingDigit: number) =>
    Interaction.where(
      `#actor sets up column ${col} missing digit ${missingDigit}`,
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        GridFixtures.setupAlmostCompleteColumn(ability.getSolver(), col, missingDigit);
        await recordFixture(actor, { row: 0, col });
      }
    ),

  almostCompleteBlock: (blockRow: number, blockCol: number, missingDigit: number) =>
    Interaction.where(
      `#actor sets up block (${blockRow},${blockCol}) missing digit ${missingDigit}`,
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        GridFixtures.setupAlmostCompleteBlock(
          ability.getSolver(),
          blockRow,
          blockCol,
          missingDigit
        );
        await recordFixture(actor, {
          row: blockRow * BLOCK_SIZE + BLOCK_SIZE - 1,
          col: blockCol * BLOCK_SIZE + BLOCK_SIZE - 1,
        });
      }
    ),

  withMultipleEmpties: () =>
    Interaction.where('#actor sets up a grid with multiple empties per unit', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupMultipleEmpties(ability.getSolver());
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // Hidden Singles scenarios
  // ---------------------------------------------------------------------------

  rowMissingDigit: (rowIndex: number, target: number) =>
    Interaction.where(`#actor sets up row ${rowIndex} missing digit ${target}`, async (actor) => {
      GridFixtures.setupRowMissingDigit(UseSudokuSolver.as(actor).getSolver(), rowIndex, target);
      await recordFixture(actor, { row: rowIndex, col: 4 });
    }),

  rowColumnConstraints: (count: number, rowIndex: number, target: number) =>
    Interaction.where('#actor sets up row-column constraints', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupRowColumnConstraints(ability.getSolver(), count, rowIndex, target);
      await recordFixture(actor, { row: rowIndex, col: 4 });
    }),

  columnMissingDigit: (colIndex: number, target: number) =>
    Interaction.where(
      `#actor sets up column ${colIndex} missing digit ${target}`,
      async (actor) => {
        GridFixtures.setupColumnMissingDigit(
          UseSudokuSolver.as(actor).getSolver(),
          colIndex,
          target
        );
        await recordFixture(actor, { row: 4, col: colIndex });
      }
    ),

  columnRowConstraints: (count: number, colIndex: number, target: number) =>
    Interaction.where('#actor sets up column-row constraints', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupColumnRowConstraints(ability.getSolver(), count, colIndex, target);
      await recordFixture(actor, { row: 4, col: colIndex });
    }),

  blockFourEmpties: () =>
    Interaction.where('#actor sets up a block with four empty cells', async (actor) => {
      GridFixtures.setupBlockFourEmpties(UseSudokuSolver.as(actor).getSolver());
    }),

  hiddenSingleInBlock: (target: number) =>
    Interaction.where(`#actor sets up a hidden single for digit ${target}`, async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupHiddenSingleInBlock(ability.getSolver(), target);
      await recordFixture(actor, { row: 1, col: 2 });
    }),

  digitInRow: (rowIndex: number, digit: number) =>
    Interaction.where(`#actor places digit ${digit} in row ${rowIndex}`, async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupDigitInRow(ability.getSolver(), rowIndex, digit);
      await recordFixture(actor, { row: rowIndex, col: 5 });
    }),

  withMultipleCandidates: () =>
    Interaction.where(
      '#actor re-initialises grid so digit has multiple candidate positions',
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('test');
        ability.takeSnapshot();
      }
    ),

  // ---------------------------------------------------------------------------
  // Naked Singles scenarios
  // ---------------------------------------------------------------------------

  targetCell: (row: number, col: number) =>
    Interaction.where(`#actor targets cell [${row},${col}]`, async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.clearCell(ability.getSolver(), row, col);
      await recordFixture(actor, { row, col });
    }),

  valuesInRow: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's row`, async (actor) => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      GridFixtures.addValuesToRow(UseSudokuSolver.as(actor).getSolver(), row, col, values);
      await recordFixture(actor);
    }),

  valuesInColumn: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's column`, async (actor) => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      GridFixtures.addValuesToColumn(UseSudokuSolver.as(actor).getSolver(), col, row, values);
      await recordFixture(actor);
    }),

  valuesInBlock: (values: number[]) =>
    Interaction.where(`#actor places ${values} in the target cell's block`, async (actor) => {
      const tc = await actor.answer(notes<SudokuNotes>().get(TARGET_CELL));
      const { row, col } = tc!;
      GridFixtures.addValuesToBlock(
        UseSudokuSolver.as(actor).getSolver(),
        row,
        col,
        row,
        col,
        values
      );
      await recordFixture(actor);
    }),

  threeCandidates: () =>
    Interaction.where(
      '#actor sets up cell [0,0] with exactly three candidates [2,5,8]',
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('test');
        GridFixtures.setupThreeCandidates(ability.getSolver());
        ability.takeSnapshot();
        ability.setTargetCell(0, 0);
        await notes<SudokuNotes>().set(TARGET_CELL, { row: 0, col: 0 }).performAs(actor);
      }
    ),

  threeNakedSingles: () =>
    Interaction.where('#actor sets up 3 cells each with exactly one candidate', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.initialise('test');
      GridFixtures.setupThreeNakedSingles(ability.getSolver());
      await recordFixture(actor);
    }),

  // ---------------------------------------------------------------------------
  // Constraint Validation (Scenario Outline)
  // ---------------------------------------------------------------------------

  named: (gridState: string) =>
    Interaction.where(`#actor sets up named grid state "${gridState}"`, async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.initialise('test');
      GridFixtures.setupNamedGridState(ability.getSolver(), gridState);
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // Grid Initialization tests
  // ---------------------------------------------------------------------------

  fromSpecificGrid: (grid: number[][]) =>
    Interaction.where('#actor stores a specific grid snapshot', async (actor) => {
      UseSudokuSolver.as(actor).storeSnapshot(grid);
      await notes<SudokuNotes>().set(GRID_SNAPSHOT, grid).performAs(actor);
    }),

  // ---------------------------------------------------------------------------
  // Naked Pairs scenarios
  // ---------------------------------------------------------------------------

  nakedPairRow: () =>
    Interaction.where('#actor sets up a row with a naked pair', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupNakedPairRow(ability.getSolver());
      await recordFixture(actor, { row: 0, col: 2 });
    }),

  nakedPairColumn: () =>
    Interaction.where('#actor sets up a column with a naked pair', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupNakedPairColumn(ability.getSolver());
      await recordFixture(actor, { row: 2, col: 0 });
    }),

  nakedPairBlock: () =>
    Interaction.where('#actor sets up a 3x3 block with a naked pair', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupNakedPairBlock(ability.getSolver());
      await recordFixture(actor, { row: 0, col: 2 });
    }),

  noNakedPairs: () =>
    Interaction.where('#actor sets up a grid with no naked pairs', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupNoNakedPairs(ability.getSolver());
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // X-Wing scenarios
  // ---------------------------------------------------------------------------

  xWingRow: () =>
    Interaction.where('#actor sets up rows with an X-Wing pattern', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupXWingRow(ability.getSolver());
      await recordFixture(actor, { row: 7, col: 1 });
    }),

  xWingColumn: () =>
    Interaction.where('#actor sets up columns with an X-Wing pattern', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupXWingColumn(ability.getSolver());
      await recordFixture(actor, { row: 1, col: 7 });
    }),

  noXWing: () =>
    Interaction.where('#actor sets up a grid with no X-Wing patterns', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      GridFixtures.setupNoXWing(ability.getSolver());
      ability.takeSnapshot();
    }),

  // ---------------------------------------------------------------------------
  // Edge Case tests
  // ---------------------------------------------------------------------------

  multipleSolvers: (count: number) =>
    Interaction.where(`#actor loads ${count} independent solver instances`, async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      const puzzles = LoadPuzzles.as(actor).getAll();
      ability.setMultipleSolvers(GridFixtures.createSolversFromPuzzles(count, puzzles));
    }),

  noProgress: () =>
    Interaction.where(
      '#actor sets up an empty grid where no algorithm makes progress',
      async (actor) => {
        const ability = UseSudokuSolver.as(actor);
        ability.initialise('stuck');
        ability.takeSnapshot();
      }
    ),

  runAllAlgorithmsIndividually: () =>
    Interaction.where('#actor runs all algorithms individually on the grid', async (actor) => {
      const ability = UseSudokuSolver.as(actor);
      ability.takeSnapshot();
      ability.applyUnitCompletion();
      for (let d = 1; d <= GRID_SIZE; d++) ability.applyHiddenSingles(d);
      ability.applyNakedSingles();
      ability.applyNakedPairs();
      ability.applyXWing();
    }),
};
