import { SudokuSolver } from './SudokuSolver';
import { AuditLogger } from './audit/AuditLogger';
import { AuditConfig, AuditTrail } from './audit/AuditTypes';
import { GRID_SIZE, EMPTY_CELL } from './constants';
import {
  AttemptCellChange,
  AttemptEvent,
  AttemptObserver,
  AttemptTechnique,
} from './orchestration/AttemptTypes';

/**
 * Main Controller for Sudoku Logic.
 * Orchestrates the application of basic Sudoku solving techniques.
 *
 * This class implements the solving strategy outlined in ALGORITHM_Sudoku_Basic_Solver.txt
 * by coordinating three fundamental techniques in order of efficiency:
 *
 * 1. Unit Completion - Fastest: O(n) per unit, fills obvious single-empty-cell situations
 * 2. Hidden Singles - Medium: Scans for digits that can only go in one place per unit
 * 3. Naked Singles - Slowest: O(n²), examines each cell's remaining candidates
 *
 * The orchestrator repeats this cycle until either the puzzle is solved or no
 * further progress can be made (requiring advanced techniques like Naked Pairs, X-Wing, etc.)
 */
export class SudokuOrchestrator {
  private auditLogger?: AuditLogger;
  private attemptSequence = 0;

  constructor(
    private solver: SudokuSolver,
    auditConfig?: Partial<AuditConfig>,
    private readonly attemptObserver?: AttemptObserver
  ) {
    if (auditConfig?.enabled) {
      this.auditLogger = new AuditLogger(solver.name, solver.origGrid, auditConfig);
      solver.setAuditLogger(this.auditLogger);
    }
  }

  /**
   * Solves the Sudoku puzzle using basic techniques.
   *
   * @returns "SOLVED" if the puzzle is complete, "STUCK_ON_ADVANCED_LOGIC" if basic techniques are insufficient
   */
  public solve(): string {
    this.attemptSequence = 0;

    // Already-solved inputs return SOLVED immediately without executing any
    // algorithms (v1.0 edge case; shared Gherkin contract "Stop execution when
    // puzzle is completely solved").
    if (this.isGridFull()) {
      return 'SOLVED';
    }

    let isProgressing = true;
    let iteration = 0;

    while (isProgressing) {
      iteration += 1;
      let changedThisPass = false;

      this.auditLogger?.startIteration();

      // Step 1: Unit Completion (simplest technique - O(n) per unit)
      // Fills cells in rows/columns/blocks that have only one empty cell
      if (this.runAttempt(iteration, 'UnitCompletion', () => this.solver.unitCompletion())) {
        changedThisPass = true;
      }

      // Step 2: Hidden Singles (medium complexity - scan per digit)
      // For each digit 1-9, find units where that digit can only go in one place
      for (let digit = 1; digit <= GRID_SIZE; digit++) {
        if (
          this.runAttempt(iteration, 'HiddenSingles', () => this.solver.hiddenSingles(digit), digit)
        ) {
          changedThisPass = true;
        }
      }

      // Step 3: Naked Singles (most complex - O(n²) cell examination)
      // Find cells that can only contain one digit after eliminating all "seen" values
      if (this.runAttempt(iteration, 'NakedSingles', () => this.solver.nakedSingles())) {
        changedThisPass = true;
      }

      // Step 4: Naked Pairs (advanced subset elimination across rows, columns, blocks)
      if (this.runAttempt(iteration, 'NakedPairs', () => this.solver.nakedPairs())) {
        changedThisPass = true;
      }

      // Exit loop if no technique made any progress (puzzle stuck or complete)
      isProgressing = changedThisPass;
    }

    return this.isGridFull() ? 'SOLVED' : 'STUCK_ON_ADVANCED_LOGIC';
  }

  /**
   * Checks if the grid is completely filled.
   * @returns true if all cells contain non-zero values
   */
  public isGridFull(): boolean {
    return this.solver.grid.every((row) => row.every((cell) => cell !== EMPTY_CELL));
  }

  /**
   * Returns the audit trail for this solve run, or undefined if audit logging was not enabled.
   */
  public getAuditTrail(): AuditTrail | undefined {
    if (!this.auditLogger) return undefined;
    const status = this.isGridFull() ? 'SOLVED' : 'STUCK_ON_ADVANCED_LOGIC';
    return this.auditLogger.getTrail(this.solver.grid, status);
  }

  private runAttempt(
    iteration: number,
    technique: AttemptTechnique,
    invoke: () => boolean,
    parameter?: number
  ): boolean {
    if (!this.attemptObserver) {
      return invoke();
    }

    const before = this.solver.getGrid();
    const changed = invoke();
    const changes = this.diffGrid(before, this.solver.getGrid());

    if (changed !== changes.length > 0) {
      throw new Error(
        `${technique} returned changed=${changed} but produced ${changes.length} cell changes`
      );
    }

    this.attemptSequence += 1;
    const immutableChanges = Object.freeze(
      changes.map((change) =>
        Object.freeze({
          ...change,
          cell: Object.freeze({ ...change.cell }),
        })
      )
    );
    const event: AttemptEvent = Object.freeze({
      iteration,
      sequence: this.attemptSequence,
      technique,
      ...(parameter === undefined ? {} : { parameter }),
      changed,
      changes: immutableChanges,
    });

    this.attemptObserver(event);
    return changed;
  }

  private diffGrid(before: number[][], after: number[][]): AttemptCellChange[] {
    const changes: AttemptCellChange[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (before[row][col] !== after[row][col]) {
          changes.push({
            cell: { row, col },
            oldValue: before[row][col],
            newValue: after[row][col],
          });
        }
      }
    }
    return changes;
  }
}
