export class SudokuSolver {
  public grid: number[][];

  constructor(
    public readonly name: string,
    public readonly origGrid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))
  ) {
    // Deep copy the original grid to the working grid
    this.grid = origGrid.map(row => [...row]);
  }

  static named(name: string = "S000", origGrid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))): SudokuSolver {
    return new SudokuSolver(name, origGrid);
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

    // Check all rows
    for (let r = 0; r < 9; r++) {
      const empties = this.grid[r].filter(cell => cell === 0);
      if (empties.length === 1) {
        const colIndex = this.grid[r].indexOf(0);
        const missing = this.findMissingDigit(this.grid[r]);
        this.grid[r][colIndex] = missing;
        changed = true;
      }
    }

    // Check all columns
    for (let c = 0; c < 9; c++) {
      const column = this.grid.map(row => row[c]);
      const empties = column.filter(cell => cell === 0);
      if (empties.length === 1) {
        const rowIndex = column.indexOf(0);
        const missing = this.findMissingDigit(column);
        this.grid[rowIndex][c] = missing;
        changed = true;
      }
    }

    // Check all 3x3 blocks
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const blockCells = this.getBlockEmptyCells(br, bc);
        if (blockCells.length === 1) {
          const blockValues = this.getBlockValues(br, bc);
          const missing = this.findMissingDigit(blockValues);
          this.grid[blockCells[0].r][blockCells[0].c] = missing;
          changed = true;
        }
      }
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

    // Check each 3x3 block
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.isNumberInBlock(target, row, col)) continue;
        const candidates = this.getBlockEmptyCells(row, col)
          .filter(cell => !this.isInRow(target, cell.r) && !this.isInCol(target, cell.c));

        if (candidates.length === 1) {
          this.grid[candidates[0].r][candidates[0].c] = target;
          changed = true;
        }
      }
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
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.grid[r][c] !== 0) continue;
        const possible = this.getCellCandidates(r, c);
        if (possible.size === 1) {
          this.grid[r][c] = Array.from(possible)[0];
          changed = true;
        }
      }
    }
    return changed;
  }

  private isInRow(v: number, r: number): boolean {
    return this.grid[r].includes(v);
  }

  private isInCol(v: number, c: number): boolean {
    return this.grid.some(row => row[c] === v);
  }

  private isNumberInBlock(v: number, br: number, bc: number): boolean {
    const startRow = br * 3;
    const startCol = bc * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (this.grid[r][c] === v) return true;
      }
    }
    return false;
  }

  private getBlockEmptyCells(br: number, bc: number): {r:number, c:number}[] {
    const startRow = br * 3;
    const startCol = bc * 3;
    const cells: {r:number, c:number}[] = [];
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (this.grid[r][c] === 0) {
          cells.push({r, c});
        }
      }
    }
    return cells;
  }

  private getBlockValues(br: number, bc: number): number[] {
    const startRow = br * 3;
    const startCol = bc * 3;
    const values: number[] = [];
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        values.push(this.grid[r][c]);
      }
    }
    return values;
  }

  private getCellCandidates(r: number, c: number): Set<number> {
    const candidates = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // Remove values in same row
    for (let col = 0; col < 9; col++) {
      candidates.delete(this.grid[r][col]);
    }

    // Remove values in same column
    for (let row = 0; row < 9; row++) {
      candidates.delete(this.grid[row][c]);
    }

    // Remove values in same 3x3 block
    const blockRow = Math.floor(r / 3);
    const blockCol = Math.floor(c / 3);
    const startRow = blockRow * 3;
    const startCol = blockCol * 3;
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        candidates.delete(this.grid[row][col]);
      }
    }

    candidates.delete(0); // Remove empty cell marker
    return candidates;
  }

  private findMissingDigit(values: number[]): number {
    const present = new Set(values.filter(v => v !== 0));
    for (let i = 1; i <= 9; i++) {
      if (!present.has(i)) return i;
    }
    throw new Error("No missing digit found - invalid sudoku state");
  }
}