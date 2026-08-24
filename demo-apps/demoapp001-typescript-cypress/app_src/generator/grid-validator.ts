/**
 * Grid Validation Utility for Sudoku Puzzle Generator.
 * Provides constraint checking and complete-solution validation.
 */

/**
 * Checks if placing a number at grid[row][col] violates Sudoku row, column, or 3x3 block constraints.
 */
export function isValidPlacement(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    // Check row constraint (skip target column)
    if (i !== col && grid[row][i] === num) return false;
    // Check column constraint (skip target row)
    if (i !== row && grid[i][col] === num) return false;
  }

  // Check 3x3 block constraint
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;

  for (let r = blockRowStart; r < blockRowStart + 3; r++) {
    for (let c = blockColStart; c < blockColStart + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates whether a 9x9 grid is a complete, fully populated valid Sudoku solution.
 * Asserts all rows, columns, and 3x3 blocks contain digits 1..9 exactly once.
 */
export function isValidSolution(grid: number[][]): boolean {
  if (!grid || grid.length !== 9) return false;

  for (let r = 0; r < 9; r++) {
    if (!grid[r] || grid[r].length !== 9) return false;
    const rowSet = new Set<number>();
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val < 1 || val > 9) return false;
      rowSet.add(val);
    }
    if (rowSet.size !== 9) return false;
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const colSet = new Set<number>();
    for (let r = 0; r < 9; r++) {
      colSet.add(grid[r][c]);
    }
    if (colSet.size !== 9) return false;
  }

  // Check 3x3 blocks
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const blockSet = new Set<number>();
      for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
        for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
          blockSet.add(grid[r][c]);
        }
      }
      if (blockSet.size !== 9) return false;
    }
  }

  return true;
}

/**
 * Validates that a partial 9x9 grid contains no constraint violations among filled cells (digits 1..9).
 */
export function isValidPartialGrid(grid: number[][]): boolean {
  if (!grid || grid.length !== 9) return false;

  for (let r = 0; r < 9; r++) {
    if (!grid[r] || grid[r].length !== 9) return false;
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (val < 1 || val > 9) return false;
        if (!isValidPlacement(grid, r, c, val)) return false;
      }
    }
  }

  return true;
}
