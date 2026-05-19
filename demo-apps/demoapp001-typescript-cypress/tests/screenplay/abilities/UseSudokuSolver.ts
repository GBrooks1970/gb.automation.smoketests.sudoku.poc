import { Ability } from '@serenity-js/core';
import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { SudokuOrchestrator } from '../../../app_src/SudokuOrchestrator';
import { AuditTrail } from '../../../app_src/audit/AuditTypes';

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
    this._gridSnapshot = this.getSolver().grid.map(r => [...r]);
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
}
