import { Ability } from '@serenity-js/core';
import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { SudokuOrchestrator } from '../../../app_src/SudokuOrchestrator';
import { GRID_SIZE, BLOCK_SIZE, EMPTY_CELL } from '../../../app_src/constants';

/**
 * Ability: UseSudokuSolver
 *
 * Encapsulates the lifetime of a SudokuSolver + SudokuOrchestrator pair.
 * An actor that HAS this ability can initialise grids, apply algorithms,
 * and run the full solving loop.
 *
 * Design note: Abilities are the only place in the Screenplay layer that
 * directly imports production classes. This is the Dependency Inversion boundary.
 *
 * Note: extends Ability (base class) as required by @serenity-js/core 3.x (DR-008).
 */
export class UseSudokuSolver extends Ability {
  private solver: SudokuSolver | null = null;
  private lastAlgorithmChanged: boolean = false;
  private solveResult: string = '';

  // Cross-step state (replaces SudokuWorld fields from solver_steps.ts)
  private _targetCell: { row: number; col: number } = { row: 0, col: 0 };
  private _targetValue: number = 0;
  private _gridSnapshot: number[][] = [];
  private _validationResult: string = '';
  private _multipleSolvers: SudokuSolver[] = [];
  private _solverError: Error | null = null;

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

  setMultipleSolvers(solvers: SudokuSolver[]): void {
    this._multipleSolvers = solvers;
  }

  storeSolversFromPuzzles(puzzles: Array<{ name: string; grid: number[][] }>): void {
    this._multipleSolvers = puzzles.map(p => new SudokuSolver(p.name, p.grid));
  }

  setSolverError(error: Error): void {
    this._solverError = error;
  }

  // ---------------------------------------------------------------------------
  // Grid manipulation helpers (moved from SudokuWorld setup steps)
  // ---------------------------------------------------------------------------

  setupAlmostCompleteColumn(col: number): void {
    // Fill column with 1-8 leaving row 0 empty (missing 7)
    const values = [1, 2, 3, 4, 5, 6, 8, 9];
    for (let i = 0; i < values.length; i++) {
      this.getSolver().grid[i + 1][col] = values[i];
    }
    this.getSolver().grid[0][col] = EMPTY_CELL;
  }

  setupAlmostCompleteBlock(blockRow: number, blockCol: number): void {
    // Fill block with 1,2,3,5,6,7,8,9 (missing 4) — last cell empty
    const values = [1, 2, 3, 5, 6, 7, 8, 9];
    let idx = 0;
    for (let r = blockRow * BLOCK_SIZE; r < (blockRow + 1) * BLOCK_SIZE; r++) {
      for (let c = blockCol * BLOCK_SIZE; c < (blockCol + 1) * BLOCK_SIZE; c++) {
        if (idx < values.length) {
          this.getSolver().grid[r][c] = values[idx++];
        } else {
          this.getSolver().grid[r][c] = EMPTY_CELL;
        }
      }
    }
  }

  setupMultipleEmpties(): void {
    // Alternating pattern — every row/col/block has 2+ empty cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        this.getSolver().grid[row][col] =
          ((row + col) % 2 === 0) ? ((row * 3 + col + 1) % 9) + 1 : EMPTY_CELL;
      }
    }
  }

  setupRowMissingDigit(rowIndex: number, target: number): void {
    // Fill row with all digits except target; leave col 4 empty
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== target);
    let idx = 0;
    for (let col = 0; col < GRID_SIZE; col++) {
      this.getSolver().grid[rowIndex][col] = (col === 4) ? EMPTY_CELL : digits[idx++];
    }
  }

  setupColumnMissingDigit(colIndex: number, target: number): void {
    // Fill column with all digits except target; leave row 4 empty
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== target);
    let idx = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      this.getSolver().grid[row][colIndex] = (row === 4) ? EMPTY_CELL : digits[idx++];
    }
  }

  setupBlockFourEmpties(): void {
    // Block (0,0): fill with 1,2,3,6,7; leave 4 cells empty
    this.getSolver().grid[0][0] = 1;
    this.getSolver().grid[1][0] = 2;
    this.getSolver().grid[2][0] = 3;
    this.getSolver().grid[2][1] = 6;
    this.getSolver().grid[2][2] = 7;
  }

  setupHiddenSingleInBlock(target: number): void {
    // Empty cells in block(0,0): [0,1],[0,2],[1,1],[1,2]
    // Exclude three via row/col, leave [1,2] as only candidate
    this.getSolver().grid[0][5] = target; // row 0 has target → excludes [0,1] and [0,2]
    this.getSolver().grid[3][1] = target; // col 1 has target → excludes [1,1]
    // [1,2] remains: row 1 no target, col 2 no target
  }

  setupDigitInRow(rowIndex: number, digit: number): void {
    this.getSolver().grid[rowIndex][5] = digit;
  }

  setupTargetCell(row: number, col: number): void {
    this._targetCell = { row, col };
    this.getSolver().grid[row][col] = EMPTY_CELL;
  }

  addValuesToRow(row: number, excludeCol: number, values: number[]): void {
    let placed = 0;
    for (let c = 0; c < GRID_SIZE && placed < values.length; c++) {
      if (c !== excludeCol && this.getSolver().grid[row][c] === EMPTY_CELL) {
        this.getSolver().grid[row][c] = values[placed++];
      }
    }
  }

  addValuesToColumn(col: number, excludeRow: number, values: number[]): void {
    let placed = 0;
    for (let r = 0; r < GRID_SIZE && placed < values.length; r++) {
      if (r !== excludeRow && this.getSolver().grid[r][col] === EMPTY_CELL) {
        this.getSolver().grid[r][col] = values[placed++];
      }
    }
  }

  addValuesToBlock(targetRow: number, targetCol: number, excludeRow: number, excludeCol: number, values: number[]): void {
    const blockStartRow = Math.floor(targetRow / BLOCK_SIZE) * BLOCK_SIZE;
    const blockStartCol = Math.floor(targetCol / BLOCK_SIZE) * BLOCK_SIZE;
    let placed = 0;
    for (let r = blockStartRow; r < blockStartRow + BLOCK_SIZE && placed < values.length; r++) {
      for (let c = blockStartCol; c < blockStartCol + BLOCK_SIZE && placed < values.length; c++) {
        if ((r !== excludeRow || c !== excludeCol) && this.getSolver().grid[r][c] === EMPTY_CELL) {
          this.getSolver().grid[r][c] = values[placed++];
        }
      }
    }
  }

  setupThreeCandidates(): void {
    // Cell [0,0] has exactly [2,5,8] as candidates
    // Eliminate 1,3,4 via row and 6,7,9 via column
    this.solver = new SudokuSolver('test');
    this.getSolver().grid[0][1] = 1;
    this.getSolver().grid[0][2] = 3;
    this.getSolver().grid[0][3] = 4;
    this.getSolver().grid[1][0] = 6;
    this.getSolver().grid[2][0] = 7;
    this.getSolver().grid[4][0] = 9;
    this._targetCell = { row: 0, col: 0 };
  }

  setupThreeNakedSingles(): void {
    // Near-complete grid: remove 3 cells that are each naked singles
    const solution = [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ];
    this.solver = new SudokuSolver('test', solution);
    this.getSolver().grid[0][0] = EMPTY_CELL; // was 5
    this.getSolver().grid[4][4] = EMPTY_CELL; // was 5
    this.getSolver().grid[8][8] = EMPTY_CELL; // was 9
  }

  setupNamedGridState(gridState: string): void {
    this.solver = new SudokuSolver('test');
    const { row, col } = this._targetCell;

    switch (gridState) {
      case 'emptyGrid':
        // All zeros — any value is valid
        break;
      case 'has5InSameRow':
        this.getSolver().grid[0][5] = 5;
        break;
      case 'has3InSameCol':
        this.getSolver().grid[5][0] = 3;
        break;
      case 'has7InSameBlock':
        this.getSolver().grid[0][0] = 7;
        break;
      case 'noConflicts':
        // No 9 anywhere in row 4, col 4, or block(1,1)
        break;
      case 'has1InRowAndCol':
        this.getSolver().grid[8][0] = 1;
        this.getSolver().grid[0][8] = 1;
        break;
      case 'fullyConstrained':
        this.getSolver().grid[3][0] = 8;
        break;
      case 'noConstraints':
        // No 4 in row 5, col 3, or block — valid placement
        break;
    }
    // Suppress unused variable warning — row/col kept for context
    void row; void col;
  }

  setupWithDuplicateInRow(rowIndex: number, value: number): void {
    this.solver = new SudokuSolver('duplicate');
    this.getSolver().grid[rowIndex][0] = value;
    this.getSolver().grid[rowIndex][1] = value;
  }

  setupMultipleSolvers(count: number, puzzles: Array<{ name: string; grid: number[][] }>): void {
    this._multipleSolvers = puzzles.slice(0, count).map(p => new SudokuSolver(p.name, p.grid));
  }

  // ---------------------------------------------------------------------------
  // Placement validation
  // ---------------------------------------------------------------------------

  validateAndStore(row: number, col: number, value: number): void {
    this._validationResult = this.isValidPlacement(row, col, value) ? 'VALID' : 'INVALID';
  }

  private isValidPlacement(row: number, col: number, value: number): boolean {
    const grid = this.getSolver().grid;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c !== col && grid[row][c] === value) return false;
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      if (r !== row && grid[r][col] === value) return false;
    }
    const blockRow = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE;
    const blockCol = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE;
    for (let r = blockRow; r < blockRow + BLOCK_SIZE; r++) {
      for (let c = blockCol; c < blockCol + BLOCK_SIZE; c++) {
        if ((r !== row || c !== col) && grid[r][c] === value) return false;
      }
    }
    return true;
  }

  noConstraintViolations(): boolean {
    const grid = this.getSolver().grid;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = grid[r][c];
        if (val !== EMPTY_CELL && !this.isValidPlacement(r, c, val)) return false;
      }
    }
    return true;
  }

  isValidSolution(): boolean {
    const grid = this.getSolver().grid;
    const digits = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const setEquals = (a: Set<number>, b: Set<number>): boolean => {
      if (a.size !== b.size) return false;
      for (const v of a) if (!b.has(v)) return false;
      return true;
    };
    for (let i = 0; i < GRID_SIZE; i++) {
      if (!setEquals(new Set(grid[i]), digits)) return false;
      if (!setEquals(new Set(grid.map(r => r[i])), digits)) return false;
    }
    for (let br = 0; br < BLOCK_SIZE; br++) {
      for (let bc = 0; bc < BLOCK_SIZE; bc++) {
        const vals = new Set<number>();
        for (let r = br * BLOCK_SIZE; r < (br + 1) * BLOCK_SIZE; r++) {
          for (let c = bc * BLOCK_SIZE; c < (bc + 1) * BLOCK_SIZE; c++) {
            vals.add(grid[r][c]);
          }
        }
        if (!setEquals(vals, digits)) return false;
      }
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Compound operations (used by Tasks for complex multi-step interactions)
  // ---------------------------------------------------------------------------

  /** Solves the first solver in multipleSolvers, returns true if the others are unchanged. */
  solveFirstAndCheckIsolation(): boolean {
    const solvers = this._multipleSolvers;
    const snap1 = solvers[1].grid.map(r => [...r]);
    const snap2 = solvers[2].grid.map(r => [...r]);
    this.initialise(solvers[0].name, solvers[0].origGrid);
    this.solvePuzzle();
    for (let r = 0; r < solvers[1].grid.length; r++) {
      for (let c = 0; c < solvers[1].grid[r].length; c++) {
        if (solvers[1].grid[r][c] !== snap1[r][c]) return false;
        if (solvers[2].grid[r][c] !== snap2[r][c]) return false;
      }
    }
    return true;
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
}
