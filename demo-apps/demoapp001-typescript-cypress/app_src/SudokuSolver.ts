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
   * Returns a deep-copy snapshot of the current working grid (v1.0 `getGrid`
   * operation). Mutating the returned array never affects solver state.
   *
   * Prefer this over reading `grid` directly wherever access is read-only.
   * The public `grid` member is retained for compatibility, but mutating it
   * directly from outside the solver is deprecated — external mutation
   * bypasses the solving algorithms and the audit trail.
   */
  public getGrid(): number[][] {
    return this.grid.map((row) => [...row]);
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

  /**
   * Naked Pairs Algorithm
   * Goal: Find two cells in the same unit (row, column, block) that share the exact
   *       same two candidates, and eliminate those candidates from all other cells in that unit.
   * Technique: If candidate elimination reduces any peer cell to exactly 1 candidate,
   *            place that candidate in the cell.
   */
  public nakedPairs(): boolean {
    let changed = false;
    const changes: CellChange[] = [];

    const processUnit = (unitCells: { row: number; col: number }[], unitDesc: string): void => {
      const emptyCells = unitCells.filter(({ row, col }) => this.grid[row][col] === EMPTY_CELL);
      if (emptyCells.length < 2) return;

      const cellCandidates = new Map<{ row: number; col: number }, Set<number>>();
      for (const cell of emptyCells) {
        cellCandidates.set(cell, this.getCellCandidates(cell.row, cell.col));
      }

      const pairCells = emptyCells.filter((cell) => cellCandidates.get(cell)?.size === 2);
      const setEquals = (a: Set<number>, b: Set<number>): boolean => {
        if (a.size !== b.size) return false;
        for (const val of a) if (!b.has(val)) return false;
        return true;
      };

      const foundPairs: [
        { row: number; col: number },
        { row: number; col: number },
        Set<number>,
      ][] = [];
      for (let i = 0; i < pairCells.length; i++) {
        const c1 = pairCells[i];
        const s1 = cellCandidates.get(c1)!;
        for (let j = i + 1; j < pairCells.length; j++) {
          const c2 = pairCells[j];
          const s2 = cellCandidates.get(c2)!;
          if (setEquals(s1, s2)) {
            foundPairs.push([c1, c2, s1]);
          }
        }
      }

      for (const [c1, c2, pairSet] of foundPairs) {
        const [d1, d2] = Array.from(pairSet);
        for (const cell of emptyCells) {
          if (
            (cell.row === c1.row && cell.col === c1.col) ||
            (cell.row === c2.row && cell.col === c2.col)
          ) {
            continue;
          }
          const cands = cellCandidates.get(cell);
          if (!cands) continue;

          let eliminated = false;
          if (cands.has(d1)) {
            cands.delete(d1);
            eliminated = true;
          }
          if (cands.has(d2)) {
            cands.delete(d2);
            eliminated = true;
          }

          if (eliminated && cands.size === 1 && this.grid[cell.row][cell.col] === EMPTY_CELL) {
            const val = Array.from(cands)[0];
            changes.push({
              cell: { row: cell.row, col: cell.col },
              oldValue: 0,
              newValue: val,
              reason: `Naked Pair [${d1},${d2}] in ${unitDesc} eliminated candidates, leaving ${val}`,
            });
            this.grid[cell.row][cell.col] = val;
            changed = true;
          }
        }
      }
    };

    // Check all rows
    for (let row = 0; row < GRID_SIZE; row++) {
      const unit = Array.from({ length: GRID_SIZE }, (_, col) => ({ row, col }));
      processUnit(unit, `row ${row}`);
    }

    // Check all columns
    for (let col = 0; col < GRID_SIZE; col++) {
      const unit = Array.from({ length: GRID_SIZE }, (_, row) => ({ row, col }));
      processUnit(unit, `column ${col}`);
    }

    // Check all 3x3 blocks
    for (let br = 0; br < BLOCK_SIZE; br++) {
      for (let bc = 0; bc < BLOCK_SIZE; bc++) {
        const unit: { row: number; col: number }[] = [];
        for (let r = br * BLOCK_SIZE; r < (br + 1) * BLOCK_SIZE; r++) {
          for (let c = bc * BLOCK_SIZE; c < (bc + 1) * BLOCK_SIZE; c++) {
            unit.push({ row: r, col: c });
          }
        }
        processUnit(unit, `block (${br},${bc})`);
      }
    }

    if (this.auditLogger?.isEnabled() && changes.length > 0) {
      this.auditLogger.logChange('NakedPairs', changes);
    }
    return changed;
  }

  public applyNakedPairs(): boolean {
    return this.nakedPairs();
  }

  /**
   * X-Wing Algorithm
   * Goal: Eliminate candidate digit d from parallel lines (rows or columns) using a 2x2
   *       rectangular grid intersection pattern.
   * Technique:
   * 1. Row-based: If digit d appears as a candidate in exactly two columns (c1, c2) in row r1
   *    and row r2, eliminate candidate d from all other cells in columns c1 and c2.
   * 2. Column-based: If digit d appears as a candidate in exactly two rows (r1, r2) in column c1
   *    and column c2, eliminate candidate d from all other cells in rows r1 and r2.
   * If candidate elimination reduces any peer cell to exactly 1 candidate, place that candidate.
   */
  public xWing(): boolean {
    let changed = false;
    const changes: CellChange[] = [];

    const cellCandidates = new Map<string, Set<number>>();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === EMPTY_CELL) {
          cellCandidates.set(`${r},${c}`, this.getCellCandidates(r, c));
        }
      }
    }

    const eliminateAndPlace = (r: number, c: number, digit: number, patternDesc: string): void => {
      const key = `${r},${c}`;
      const cands = cellCandidates.get(key);
      if (!cands || !cands.has(digit)) return;

      cands.delete(digit);
      if (cands.size === 1 && this.grid[r][c] === EMPTY_CELL) {
        const val = Array.from(cands)[0];
        changes.push({
          cell: { row: r, col: c },
          oldValue: 0,
          newValue: val,
          reason: `X-Wing ${patternDesc} eliminated ${digit}, leaving ${val}`,
        });
        this.grid[r][c] = val;
        changed = true;
      }
    };

    for (let digit = 1; digit <= 9; digit++) {
      // 1. Row-based X-Wing
      const rowCandidates = new Map<number, number[]>();
      for (let r = 0; r < GRID_SIZE; r++) {
        const cols: number[] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
          if (this.grid[r][c] === EMPTY_CELL && cellCandidates.get(`${r},${c}`)?.has(digit)) {
            cols.push(c);
          }
        }
        if (cols.length === 2) {
          rowCandidates.set(r, cols);
        }
      }

      const rowKeys = Array.from(rowCandidates.keys());
      for (let i = 0; i < rowKeys.length; i++) {
        const r1 = rowKeys[i];
        const [c1a, c2a] = rowCandidates.get(r1)!;
        for (let j = i + 1; j < rowKeys.length; j++) {
          const r2 = rowKeys[j];
          const [c1b, c2b] = rowCandidates.get(r2)!;
          if (c1a === c1b && c2a === c2b) {
            const c1 = c1a;
            const c2 = c2a;
            for (let r = 0; r < GRID_SIZE; r++) {
              if (r !== r1 && r !== r2 && this.grid[r][c1] === EMPTY_CELL) {
                eliminateAndPlace(
                  r,
                  c1,
                  digit,
                  `for digit ${digit} in rows ${r1},${r2} columns ${c1},${c2}`
                );
              }
              if (r !== r1 && r !== r2 && this.grid[r][c2] === EMPTY_CELL) {
                eliminateAndPlace(
                  r,
                  c2,
                  digit,
                  `for digit ${digit} in rows ${r1},${r2} columns ${c1},${c2}`
                );
              }
            }
          }
        }
      }

      // 2. Column-based X-Wing
      const colCandidates = new Map<number, number[]>();
      for (let c = 0; c < GRID_SIZE; c++) {
        const rows: number[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          if (this.grid[r][c] === EMPTY_CELL && cellCandidates.get(`${r},${c}`)?.has(digit)) {
            rows.push(r);
          }
        }
        if (rows.length === 2) {
          colCandidates.set(c, rows);
        }
      }

      const colKeys = Array.from(colCandidates.keys());
      for (let i = 0; i < colKeys.length; i++) {
        const c1 = colKeys[i];
        const [r1a, r2a] = colCandidates.get(c1)!;
        for (let j = i + 1; j < colKeys.length; j++) {
          const c2 = colKeys[j];
          const [r1b, r2b] = colCandidates.get(c2)!;
          if (r1a === r1b && r2a === r2b) {
            const r1 = r1a;
            const r2 = r2a;
            for (let c = 0; c < GRID_SIZE; c++) {
              if (c !== c1 && c !== c2 && this.grid[r1][c] === EMPTY_CELL) {
                eliminateAndPlace(
                  r1,
                  c,
                  digit,
                  `for digit ${digit} in columns ${c1},${c2} rows ${r1},${r2}`
                );
              }
              if (c !== c1 && c !== c2 && this.grid[r2][c] === EMPTY_CELL) {
                eliminateAndPlace(
                  r2,
                  c,
                  digit,
                  `for digit ${digit} in columns ${c1},${c2} rows ${r1},${r2}`
                );
              }
            }
          }
        }
      }
    }

    if (this.auditLogger?.isEnabled() && changes.length > 0) {
      this.auditLogger.logChange('XWing', changes);
    }
    return changed;
  }

  public applyXWing(): boolean {
    return this.xWing();
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
