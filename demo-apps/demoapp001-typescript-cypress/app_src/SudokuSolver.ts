import { GRID_SIZE, BLOCK_SIZE, EMPTY_CELL } from './constants';
import { AuditLogger } from './audit/AuditLogger';
import { CellChange } from './audit/AuditTypes';

export class SudokuSolver {
  public grid: number[][];
  private auditLogger?: AuditLogger;

  constructor(
    public readonly name: string,
    public readonly origGrid: number[][] = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(EMPTY_CELL)
    )
  ) {
    // Deep copy the original grid to the working grid
    this.grid = origGrid.map((row) => [...row]);
  }

  setAuditLogger(logger: AuditLogger): void {
    this.auditLogger = logger;
  }

  /**
   * Unit Completion Algorithm
   * Goal: Solve units (rows, columns, or blocks) that have only one empty cell.
   * Technique: The missing digit must go in the only remaining empty cell.
   *
   * Example: Row has [5, 8, _, 2, 1, 6, 3, 4, 7]
   *          Missing digit is 9, so it goes in the empty cell.
   */
  public unitCompletion(): boolean {
    let changed = false;
    const changes: CellChange[] = [];

    // Check all rows
    for (let row = 0; row < GRID_SIZE; row++) {
      const empties = this.grid[row].filter((cell) => cell === EMPTY_CELL);
      if (empties.length === 1) {
        const colIndex = this.grid[row].indexOf(EMPTY_CELL);
        const missing = this.findMissingDigit(this.grid[row]);
        changes.push({
          cell: { row, col: colIndex },
          oldValue: 0,
          newValue: missing,
          reason: `Last empty cell in row ${row}`,
        });
        this.grid[row][colIndex] = missing;
        changed = true;
      }
    }

    // Check all columns
    for (let col = 0; col < GRID_SIZE; col++) {
      const column = this.grid.map((row) => row[col]);
      const empties = column.filter((cell) => cell === EMPTY_CELL);
      if (empties.length === 1) {
        const rowIndex = column.indexOf(EMPTY_CELL);
        const missing = this.findMissingDigit(column);
        changes.push({
          cell: { row: rowIndex, col },
          oldValue: 0,
          newValue: missing,
          reason: `Last empty cell in column ${col}`,
        });
        this.grid[rowIndex][col] = missing;
        changed = true;
      }
    }

    // Check all 3x3 blocks
    for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
      for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
        const blockCells = this.getBlockEmptyCells(blockRow, blockCol);
        if (blockCells.length === 1) {
          const blockValues = this.getBlockValues(blockRow, blockCol);
          const missing = this.findMissingDigit(blockValues);
          changes.push({
            cell: blockCells[0],
            oldValue: 0,
            newValue: missing,
            reason: `Last empty cell in block (${blockRow},${blockCol})`,
          });
          this.grid[blockCells[0].row][blockCells[0].col] = missing;
          changed = true;
        }
      }
    }

    if (this.auditLogger?.isEnabled() && changes.length > 0) {
      this.auditLogger.logChange('UnitCompletion', changes);
    }
    return changed;
  }

  /**
   * Hidden Singles Algorithm (also known as Crosshatch)
   * Goal: Find a specific digit's only possible placement within a unit.
   * Technique: If a digit can only go in one cell within a row/column/block,
   *            place it there (even if that cell has other candidates).
   *
   * Example: In a 3x3 block, the digit 5 is excluded from 8 cells by existing
   *          5's in the same rows/columns, leaving only one possible cell.
   *
   * Note: This is called "Hidden Single" because the single candidate for the
   *       digit may be "hidden" among other possible values for that cell.
   *
   * @param target The target number (1-9) to place
   */
  public hiddenSingles(target: number): boolean {
    let changed = false;
    const changes: CellChange[] = [];

    // Check each row: if target can only go in one empty cell in this row
    for (let row = 0; row < GRID_SIZE; row++) {
      if (this.isInRow(target, row)) continue;
      const candidates: { row: number; col: number }[] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.grid[row][col] !== EMPTY_CELL) continue;
        const blockRow = Math.floor(row / BLOCK_SIZE);
        const blockCol = Math.floor(col / BLOCK_SIZE);
        if (!this.isInCol(target, col) && !this.isNumberInBlock(target, blockRow, blockCol)) {
          candidates.push({ row, col });
        }
      }
      if (candidates.length === 1) {
        changes.push({
          cell: candidates[0],
          oldValue: 0,
          newValue: target,
          reason: `Only valid location for ${target} in row ${row}`,
        });
        this.grid[candidates[0].row][candidates[0].col] = target;
        changed = true;
      }
    }

    // Check each column: if target can only go in one empty cell in this column
    for (let col = 0; col < GRID_SIZE; col++) {
      if (this.isInCol(target, col)) continue;
      const candidates: { row: number; col: number }[] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        if (this.grid[row][col] !== EMPTY_CELL) continue;
        const blockRow = Math.floor(row / BLOCK_SIZE);
        const blockCol = Math.floor(col / BLOCK_SIZE);
        if (!this.isInRow(target, row) && !this.isNumberInBlock(target, blockRow, blockCol)) {
          candidates.push({ row, col });
        }
      }
      if (candidates.length === 1) {
        changes.push({
          cell: candidates[0],
          oldValue: 0,
          newValue: target,
          reason: `Only valid location for ${target} in column ${col}`,
        });
        this.grid[candidates[0].row][candidates[0].col] = target;
        changed = true;
      }
    }

    // Check each 3x3 block: if target can only go in one empty cell in this block
    for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
      for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
        if (this.isNumberInBlock(target, blockRow, blockCol)) continue;
        const candidates = this.getBlockEmptyCells(blockRow, blockCol).filter(
          (cell) => !this.isInRow(target, cell.row) && !this.isInCol(target, cell.col)
        );
        if (candidates.length === 1) {
          changes.push({
            cell: candidates[0],
            oldValue: 0,
            newValue: target,
            reason: `Only valid location for ${target} in block (${blockRow},${blockCol})`,
          });
          this.grid[candidates[0].row][candidates[0].col] = target;
          changed = true;
        }
      }
    }

    if (this.auditLogger?.isEnabled() && changes.length > 0) {
      this.auditLogger.logChange('HiddenSingles', changes, target);
    }
    return changed;
  }

  /**
   * Naked Singles Algorithm
   * Goal: Find cells that can only contain one specific digit.
   * Technique: For each empty cell, eliminate all digits that appear in the
   *            same row, column, or block. If only one digit remains, place it.
   *
   * Example: Cell can see digits 1,2,3,4,5,6,7,8 in its row/column/block.
   *          Only 9 is missing, so this cell must be 9.
   *
   * Note: This is called "Naked Single" because the single candidate is
   *       "naked" or obvious when looking at that specific cell.
   */
  public nakedSingles(): boolean {
    let changed = false;
    const changes: CellChange[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.grid[row][col] !== EMPTY_CELL) continue;
        const possible = this.getCellCandidates(row, col);
        if (possible.size === 1) {
          const val = Array.from(possible)[0];
          changes.push({
            cell: { row, col },
            oldValue: 0,
            newValue: val,
            reason: `Only candidate remaining in cell [${row},${col}]`,
          });
          this.grid[row][col] = val;
          changed = true;
        }
      }
    }
    if (this.auditLogger?.isEnabled() && changes.length > 0) {
      this.auditLogger.logChange('NakedSingles', changes);
    }
    return changed;
  }

  public isValidPlacement(row: number, col: number, value: number): boolean {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c !== col && this.grid[row][c] === value) return false;
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      if (r !== row && this.grid[r][col] === value) return false;
    }
    const blockRow = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE;
    const blockCol = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE;
    for (let r = blockRow; r < blockRow + BLOCK_SIZE; r++) {
      for (let c = blockCol; c < blockCol + BLOCK_SIZE; c++) {
        if ((r !== row || c !== col) && this.grid[r][c] === value) return false;
      }
    }
    return true;
  }

  public noConstraintViolations(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = this.grid[r][c];
        if (val !== EMPTY_CELL && !this.isValidPlacement(r, c, val)) return false;
      }
    }
    return true;
  }

  public isValidSolution(): boolean {
    const digits = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const setEquals = (a: Set<number>, b: Set<number>): boolean => {
      if (a.size !== b.size) return false;
      for (const v of a) if (!b.has(v)) return false;
      return true;
    };
    for (let i = 0; i < GRID_SIZE; i++) {
      if (!setEquals(new Set(this.grid[i]), digits)) return false;
      if (!setEquals(new Set(this.grid.map((r) => r[i])), digits)) return false;
    }
    for (let br = 0; br < BLOCK_SIZE; br++) {
      for (let bc = 0; bc < BLOCK_SIZE; bc++) {
        const vals = new Set<number>();
        for (let r = br * BLOCK_SIZE; r < (br + 1) * BLOCK_SIZE; r++) {
          for (let c = bc * BLOCK_SIZE; c < (bc + 1) * BLOCK_SIZE; c++) {
            vals.add(this.grid[r][c]);
          }
        }
        if (!setEquals(vals, digits)) return false;
      }
    }
    return true;
  }

  private isInRow(v: number, row: number): boolean {
    return this.grid[row].includes(v);
  }

  private isInCol(v: number, col: number): boolean {
    return this.grid.some((row) => row[col] === v);
  }

  private isNumberInBlock(v: number, blockRow: number, blockCol: number): boolean {
    const startRow = blockRow * BLOCK_SIZE;
    const startCol = blockCol * BLOCK_SIZE;
    for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
      for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
        if (this.grid[r][c] === v) return true;
      }
    }
    return false;
  }

  private getBlockEmptyCells(blockRow: number, blockCol: number): { row: number; col: number }[] {
    const startRow = blockRow * BLOCK_SIZE;
    const startCol = blockCol * BLOCK_SIZE;
    const cells: { row: number; col: number }[] = [];
    for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
      for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
        if (this.grid[r][c] === EMPTY_CELL) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  private getBlockValues(blockRow: number, blockCol: number): number[] {
    const startRow = blockRow * BLOCK_SIZE;
    const startCol = blockCol * BLOCK_SIZE;
    const values: number[] = [];
    for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
      for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
        values.push(this.grid[r][c]);
      }
    }
    return values;
  }

  private getCellCandidates(row: number, col: number): Set<number> {
    const candidates = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // Remove values in same row
    for (let c = 0; c < GRID_SIZE; c++) {
      candidates.delete(this.grid[row][c]);
    }

    // Remove values in same column
    for (let r = 0; r < GRID_SIZE; r++) {
      candidates.delete(this.grid[r][col]);
    }

    // Remove values in same 3x3 block
    const blockRow = Math.floor(row / BLOCK_SIZE);
    const blockCol = Math.floor(col / BLOCK_SIZE);
    const startRow = blockRow * BLOCK_SIZE;
    const startCol = blockCol * BLOCK_SIZE;
    for (let r = startRow; r < startRow + BLOCK_SIZE; r++) {
      for (let c = startCol; c < startCol + BLOCK_SIZE; c++) {
        candidates.delete(this.grid[r][c]);
      }
    }

    candidates.delete(EMPTY_CELL);
    return candidates;
  }

  private findMissingDigit(values: number[]): number {
    const present = new Set(values.filter((v) => v !== EMPTY_CELL));
    for (let i = 1; i <= GRID_SIZE; i++) {
      if (!present.has(i)) return i;
    }
    throw new Error('No missing digit found - invalid sudoku state');
  }
}
