import { Ability } from '@serenity-js/core';
import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { SudokuOrchestrator } from '../../../app_src/SudokuOrchestrator';
import { AuditEvent, AuditTrail } from '../../../app_src/audit/AuditTypes';

/**
 * Ability: UseSudokuSolver
 *
 * Encapsulates the lifetime of a SudokuSolver + SudokuOrchestrator pair and
 * holds cross-step state (target cell, grid snapshot, validation result).
 * Grid setup helpers live in fixtures/GridFixtures.ts; Tasks call those
 * functions with ability.getSolver() rather than calling setup methods here.
 *
 * Design: extends Ability (base class) as required by @serenity-js/core 3.x (DR-008).
 */
export class UseSudokuSolver extends Ability {
  private solver: SudokuSolver | null = null;
  private lastAlgorithmChanged: boolean = false;
  private solveResult: string = '';

  private _targetCell: { row: number; col: number } = { row: 0, col: 0 };
  private _targetValue: number = 0;
  private _gridSnapshot: number[][] = [];
  private _validationResult: string = '';
  private _multipleSolvers: SudokuSolver[] = [];
  private _solverError: Error | null = null;
  private _auditEnabled: boolean = false;
  private _lastAuditTrail: AuditTrail | undefined = undefined;

  // Orchestration-ordering instrumentation (SUD-20 / BACKLOG-051): a solve run that always
  // captures the audit event sequence so orchestration Then-steps can assert real algorithm
  // ordering and no-execution counts instead of inferring them from the overall solve status.
  // Deliberately separate from `_lastAuditTrail` / `auditEnabled`, which govern the opt-in audit
  // trail feature (`Given("audit logging is enabled")`) and must stay unaffected by this — the
  // "Solver without audit logging produces no trail" scenario asserts `lastAuditTrail` is
  // `undefined` after a plain solve, and this instrumentation must not change that.
  private _lastOrderingEvents: AuditEvent[] = [];
  private _lastOrderingIterations: number = 0;

  constructor() { super(); }

  // ---------------------------------------------------------------------------
  // Core solver lifecycle
  // ---------------------------------------------------------------------------

  initialise(name: string, grid?: number[][]): void {
    this.solver = new SudokuSolver(name, grid);
    this.lastAlgorithmChanged = false;
    this.solveResult = '';
    this._solverError = null;
  }

  getSolver(): SudokuSolver {
    if (!this.solver) throw new Error('Solver not initialised — call InitialiseGrid first');
    return this.solver;
  }

  // ---------------------------------------------------------------------------
  // Algorithm invocations
  // ---------------------------------------------------------------------------

  applyUnitCompletion(): void {
    this.lastAlgorithmChanged = this.getSolver().unitCompletion();
  }

  applyHiddenSingles(target: number): void {
    this.lastAlgorithmChanged = this.getSolver().hiddenSingles(target);
  }

  applyNakedSingles(): void {
    this.lastAlgorithmChanged = this.getSolver().nakedSingles();
  }

  solvePuzzle(): void {
    const orchestrator = new SudokuOrchestrator(this.getSolver());
    this.solveResult = orchestrator.solve();
    this._lastAuditTrail = undefined;
  }

  solvePuzzleWithAudit(): void {
    const orchestrator = new SudokuOrchestrator(this.getSolver(), { enabled: true });
    this.solveResult = orchestrator.solve();
    this._lastAuditTrail = orchestrator.getAuditTrail();
  }

  enableAudit(): void {
    this._auditEnabled = true;
  }

  /**
   * Runs the full solving loop with audit instrumentation always on, capturing the raw event
   * sequence and iteration count for algorithm-ordering assertions (SUD-20 / BACKLOG-051).
   * Behaviour-neutral: `SudokuSolver`'s algorithms only conditionally *log* to the audit logger,
   * they never branch on whether one is attached, so the returned status and final grid are
   * identical to a plain `solvePuzzle()` call.
   */
  solvePuzzleTrackingOrder(): void {
    const orchestrator = new SudokuOrchestrator(this.getSolver(), { enabled: true });
    this.solveResult = orchestrator.solve();
    const trail = orchestrator.getAuditTrail();
    this._lastOrderingEvents = trail?.events ?? [];
    this._lastOrderingIterations = trail?.totalIterations ?? 0;
  }

  isGridFull(): boolean {
    return new SudokuOrchestrator(this.getSolver()).isGridFull();
  }

  // ---------------------------------------------------------------------------
  // Cross-step state management
  // ---------------------------------------------------------------------------

  setTargetCell(row: number, col: number): void {
    this._targetCell = { row, col };
  }

  setTargetValue(value: number): void {
    this._targetValue = value;
  }

  takeSnapshot(): void {
    this._gridSnapshot = this.getSolver().getGrid();
  }

  storeSnapshot(grid: number[][]): void {
    this._gridSnapshot = grid.map(r => [...r]);
  }

  reinitialiseFromSnapshot(): void {
    this.initialise('check', this._gridSnapshot);
  }

  setValidationResult(result: string): void {
    this._validationResult = result;
  }

  validateAndStore(row: number, col: number, value: number): void {
    this._validationResult = this.getSolver().isValidPlacement(row, col, value)
      ? 'VALID' : 'INVALID';
  }

  setMultipleSolvers(solvers: SudokuSolver[]): void {
    this._multipleSolvers = solvers;
  }

  setSolverError(error: Error): void {
    this._solverError = error;
  }

  // ---------------------------------------------------------------------------
  // State accessors
  // ---------------------------------------------------------------------------

  get algorithmMadeProgress(): boolean { return this.lastAlgorithmChanged; }
  get result(): string { return this.solveResult; }
  get targetCell(): { row: number; col: number } { return this._targetCell; }
  get targetValue(): number { return this._targetValue; }
  get gridSnapshot(): number[][] { return this._gridSnapshot; }
  get validationResult(): string { return this._validationResult; }
  get multipleSolvers(): SudokuSolver[] { return this._multipleSolvers; }
  get solverError(): Error | null { return this._solverError; }
  get auditEnabled(): boolean { return this._auditEnabled; }
  get lastAuditTrail(): AuditTrail | undefined { return this._lastAuditTrail; }
  get lastOrderingEvents(): AuditEvent[] { return this._lastOrderingEvents; }
  get lastOrderingIterations(): number { return this._lastOrderingIterations; }
}
