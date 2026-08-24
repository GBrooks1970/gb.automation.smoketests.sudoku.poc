import { AuditLogger } from '../audit/AuditLogger';
import { BLOCK_SIZE, EMPTY_CELL, GRID_SIZE } from '../constants';
import { SudokuSolver } from '../SudokuSolver';
import { RationaleGenerator } from './RationaleGenerator';
import {
  CandidateElimination,
  CellCoordinate,
  Grid,
  HighlightUnit,
  HintStatus,
  MoveRecommendation,
  TechniqueName,
  TutorHintResponse,
} from './types';
import { buildValidationResponse, cloneGrid, countEmptyCells } from './validation';

export class SudokuTutorService {
  /**
   * Evaluates a partial or full grid and returns the single next deterministic
   * solving move, accompanied by pedagogical rationales, coordinate highlights,
   * and technique classification in DR-041 priority order.
   *
   * This computation is strictly side-effect-free and does not mutate the caller's grid.
   */
  getHint(grid: Grid): TutorHintResponse {
    // 1. Validate grid structure & rule constraints
    const validation = buildValidationResponse(grid);
    if (!validation.valid || validation.conflicts.length > 0) {
      const highlightCells: CellCoordinate[] = validation.conflicts.flatMap(
        (conflict) => conflict.cells
      );
      return {
        success: true,
        status: 'INVALID_GRID',
        technique: 'None',
        move: null,
        eliminations: [],
        rationale: RationaleGenerator.forInvalid(validation.message),
        highlightCells,
      };
    }

    // 2. Check if puzzle is already completely solved
    const emptyCount = countEmptyCells(grid);
    if (emptyCount === 0) {
      const solverForSolution = new SudokuSolver('check-solution', cloneGrid(grid));
      if (solverForSolution.isValidSolution()) {
        return {
          success: true,
          status: 'SOLVED',
          technique: 'None',
          move: null,
          eliminations: [],
          rationale: RationaleGenerator.forSolved(),
          highlightCells: [],
        };
      }
      return {
        success: true,
        status: 'INVALID_GRID',
        technique: 'None',
        move: null,
        eliminations: [],
        rationale: RationaleGenerator.forInvalid(
          'Grid is filled but does not form a valid Sudoku solution.'
        ),
        highlightCells: [],
      };
    }

    // 3. Priority 1: Unit Completion
    const ucResult = this.tryUnitCompletion(grid);
    if (ucResult) return ucResult;

    // 4. Priority 2: Hidden Singles (digits 1 to 9)
    const hsResult = this.tryHiddenSingles(grid);
    if (hsResult) return hsResult;

    // 5. Priority 3: Naked Singles
    const nsResult = this.tryNakedSingles(grid);
    if (nsResult) return nsResult;

    // 6. Priority 4: Naked Pairs
    const npResult = this.tryNakedPairs(grid);
    if (npResult) return npResult;

    // 7. Priority 5: X-Wing
    const xwResult = this.tryXWing(grid);
    if (xwResult) return xwResult;

    // 8. No deterministic progress possible -> STUCK_ON_ADVANCED_LOGIC
    return {
      success: true,
      status: 'STUCK_ON_ADVANCED_LOGIC',
      technique: 'None',
      move: null,
      eliminations: [],
      rationale: RationaleGenerator.forStuck(),
      highlightCells: [],
    };
  }

  private tryUnitCompletion(grid: Grid): TutorHintResponse | null {
    const solver = new SudokuSolver('tutor-uc', cloneGrid(grid));
    const logger = new AuditLogger('tutor-uc', cloneGrid(grid));
    solver.setAuditLogger(logger);

    if (solver.unitCompletion()) {
      const events = logger.getTrail(solver.getGrid(), 'STUCK_ON_ADVANCED_LOGIC').events;
      if (events.length > 0 && events[0].cellChanges.length > 0) {
        const change = events[0].cellChanges[0];
        const cell = change.cell;
        const digit = change.newValue;

        // Detect which unit completed
        const unitInfo = this.detectCompletedUnit(grid, cell);
        const existingDigits = this.getUnitValues(grid, unitInfo.type, unitInfo.index).filter(
          (v) => v !== EMPTY_CELL
        );

        const rationale = RationaleGenerator.forUnitCompletion(
          unitInfo.type,
          unitInfo.index,
          digit,
          cell,
          existingDigits
        );

        return {
          success: true,
          status: 'HINT_AVAILABLE',
          technique: 'UnitCompletion',
          move: {
            cell: { row: cell.row, col: cell.col },
            digit,
            previousValue: change.oldValue,
          },
          eliminations: [],
          rationale,
          highlightCells: [{ row: cell.row, col: cell.col }],
          highlightUnits: [{ type: unitInfo.type, index: unitInfo.index }],
        };
      }
    }
    return null;
  }

  private tryHiddenSingles(grid: Grid): TutorHintResponse | null {
    for (let digit = 1; digit <= GRID_SIZE; digit++) {
      const solver = new SudokuSolver('tutor-hs', cloneGrid(grid));
      const logger = new AuditLogger('tutor-hs', cloneGrid(grid));
      solver.setAuditLogger(logger);

      if (solver.hiddenSingles(digit)) {
        const events = logger.getTrail(solver.getGrid(), 'STUCK_ON_ADVANCED_LOGIC').events;
        if (events.length > 0 && events[0].cellChanges.length > 0) {
          const change = events[0].cellChanges[0];
          const cell = change.cell;
          const unitInfo = this.parseUnitFromReason(change.reason, cell);

          const rationale = RationaleGenerator.forHiddenSingles(
            unitInfo.type,
            unitInfo.index,
            digit,
            cell
          );

          return {
            success: true,
            status: 'HINT_AVAILABLE',
            technique: 'HiddenSingles',
            move: {
              cell: { row: cell.row, col: cell.col },
              digit,
              previousValue: change.oldValue,
            },
            eliminations: [],
            rationale,
            highlightCells: [{ row: cell.row, col: cell.col }],
            highlightUnits: [{ type: unitInfo.type, index: unitInfo.index }],
          };
        }
      }
    }
    return null;
  }

  private tryNakedSingles(grid: Grid): TutorHintResponse | null {
    const solver = new SudokuSolver('tutor-ns', cloneGrid(grid));
    const logger = new AuditLogger('tutor-ns', cloneGrid(grid));
    solver.setAuditLogger(logger);

    if (solver.nakedSingles()) {
      const events = logger.getTrail(solver.getGrid(), 'STUCK_ON_ADVANCED_LOGIC').events;
      if (events.length > 0 && events[0].cellChanges.length > 0) {
        const change = events[0].cellChanges[0];
        const cell = change.cell;
        const digit = change.newValue;

        const rationale = RationaleGenerator.forNakedSingles(cell, digit);

        return {
          success: true,
          status: 'HINT_AVAILABLE',
          technique: 'NakedSingles',
          move: {
            cell: { row: cell.row, col: cell.col },
            digit,
            previousValue: change.oldValue,
          },
          eliminations: [],
          rationale,
          highlightCells: [{ row: cell.row, col: cell.col }],
        };
      }
    }
    return null;
  }

  private tryNakedPairs(grid: Grid): TutorHintResponse | null {
    const solver = new SudokuSolver('tutor-np', cloneGrid(grid));
    const logger = new AuditLogger('tutor-np', cloneGrid(grid));
    solver.setAuditLogger(logger);

    if (solver.nakedPairs()) {
      const events = logger.getTrail(solver.getGrid(), 'STUCK_ON_ADVANCED_LOGIC').events;
      if (events.length > 0 && events[0].cellChanges.length > 0) {
        const change = events[0].cellChanges[0];
        const cell = change.cell;
        const digit = change.newValue;
        const unitInfo = this.parseUnitFromReason(change.reason, cell);

        const rationale = `Naked Pair elimination in ${this.formatUnitLabel(unitInfo.type, unitInfo.index)} unlocked digit ${digit} at cell (${cell.row + 1}, ${cell.col + 1}).`;

        return {
          success: true,
          status: 'HINT_AVAILABLE',
          technique: 'NakedPairs',
          move: {
            cell: { row: cell.row, col: cell.col },
            digit,
            previousValue: change.oldValue,
          },
          eliminations: [],
          rationale,
          highlightCells: [{ row: cell.row, col: cell.col }],
          highlightUnits: [{ type: unitInfo.type, index: unitInfo.index }],
        };
      }
    }
    return null;
  }

  private tryXWing(grid: Grid): TutorHintResponse | null {
    const solver = new SudokuSolver('tutor-xw', cloneGrid(grid));
    const logger = new AuditLogger('tutor-xw', cloneGrid(grid));
    solver.setAuditLogger(logger);

    if (solver.xWing()) {
      const events = logger.getTrail(solver.getGrid(), 'STUCK_ON_ADVANCED_LOGIC').events;
      if (events.length > 0 && events[0].cellChanges.length > 0) {
        const change = events[0].cellChanges[0];
        const cell = change.cell;
        const digit = change.newValue;

        const rationale = `X-Wing fish pattern elimination unlocked digit ${digit} at cell (${cell.row + 1}, ${cell.col + 1}).`;

        return {
          success: true,
          status: 'HINT_AVAILABLE',
          technique: 'XWing',
          move: {
            cell: { row: cell.row, col: cell.col },
            digit,
            previousValue: change.oldValue,
          },
          eliminations: [],
          rationale,
          highlightCells: [{ row: cell.row, col: cell.col }],
        };
      }
    }
    return null;
  }

  private detectCompletedUnit(
    grid: Grid,
    cell: CellCoordinate
  ): { type: 'row' | 'col' | 'block'; index: number } {
    // Check row
    const rowEmpties = grid[cell.row].filter((v) => v === EMPTY_CELL).length;
    if (rowEmpties === 1) {
      return { type: 'row', index: cell.row };
    }

    // Check column
    const colEmpties = grid.map((r) => r[cell.col]).filter((v) => v === EMPTY_CELL).length;
    if (colEmpties === 1) {
      return { type: 'col', index: cell.col };
    }

    // Check block
    const blockRow = Math.floor(cell.row / BLOCK_SIZE);
    const blockCol = Math.floor(cell.col / BLOCK_SIZE);
    return { type: 'block', index: blockRow * BLOCK_SIZE + blockCol };
  }

  private parseUnitFromReason(
    reason: string | undefined,
    cell: CellCoordinate
  ): { type: 'row' | 'col' | 'block'; index: number } {
    if (reason) {
      if (reason.includes('row')) {
        return { type: 'row', index: cell.row };
      }
      if (reason.includes('column')) {
        return { type: 'col', index: cell.col };
      }
      if (reason.includes('block')) {
        const blockRow = Math.floor(cell.row / BLOCK_SIZE);
        const blockCol = Math.floor(cell.col / BLOCK_SIZE);
        return { type: 'block', index: blockRow * BLOCK_SIZE + blockCol };
      }
    }
    return { type: 'row', index: cell.row };
  }

  private getUnitValues(grid: Grid, type: 'row' | 'col' | 'block', index: number): number[] {
    if (type === 'row') {
      return [...grid[index]];
    }
    if (type === 'col') {
      return grid.map((r) => r[index]);
    }
    const blockRow = Math.floor(index / BLOCK_SIZE);
    const blockCol = index % BLOCK_SIZE;
    const values: number[] = [];
    for (let r = blockRow * BLOCK_SIZE; r < (blockRow + 1) * BLOCK_SIZE; r++) {
      for (let c = blockCol * BLOCK_SIZE; c < (blockCol + 1) * BLOCK_SIZE; c++) {
        values.push(grid[r][c]);
      }
    }
    return values;
  }

  private formatUnitLabel(type: 'row' | 'col' | 'block', index: number): string {
    switch (type) {
      case 'row':
        return `Row ${index + 1}`;
      case 'col':
        return `Column ${index + 1}`;
      case 'block':
        return `Block ${index + 1}`;
    }
  }
}
