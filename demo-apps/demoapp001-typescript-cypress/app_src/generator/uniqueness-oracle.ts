import { isValidPartialGrid, isValidPlacement } from './grid-validator';

/**
 * Solution-Uniqueness Counting Oracle for Sudoku Puzzles.
 *
 * Provides an isolated dual-search solution counting algorithm that determines whether
 * a partial grid has 0, 1, or multiple (>1) valid completions.
 * Strictly isolated from public SudokuSolver logic.
 */
export class UniquenessOracle {
  /**
   * Counts the number of valid completions for a partial Sudoku grid up to a maximum limit.
   *
   * @param grid The 9x9 partial Sudoku grid to test.
   * @param limit The maximum solution count threshold before early exit (default: 2).
   * @returns 0 if unsolvable/invalid, 1 if uniquely solvable, or limit (>=2) if multiple solutions exist.
   */
  public static countSolutions(grid: number[][], limit: number = 2): number {
    if (!isValidPartialGrid(grid)) {
      return 0;
    }

    const board = grid.map((row) => [...row]);
    let count = 0;

    function search(): boolean {
      const emptyCell = UniquenessOracle.findBestEmptyCell(board);
      if (!emptyCell) {
        count++;
        return count >= limit; // Stop search early as soon as limit is reached
      }

      const [row, col] = emptyCell;

      for (let digit = 1; digit <= 9; digit++) {
        if (isValidPlacement(board, row, col, digit)) {
          board[row][col] = digit;
          if (search()) {
            return true;
          }
          board[row][col] = 0;
        }
      }

      return false;
    }

    search();
    return count;
  }

  /**
   * Finds the empty cell with Minimum Remaining Values (MRV) to optimize search tree pruning.
   */
  private static findBestEmptyCell(board: number[][]): [number, number] | null {
    let minCandidates = 10;
    let bestCell: [number, number] | null = null;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          let candidates = 0;
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(board, r, c, num)) {
              candidates++;
            }
          }
          if (candidates < minCandidates) {
            minCandidates = candidates;
            bestCell = [r, c];
            if (candidates === 0) return bestCell; // Immediate dead end
          }
        }
      }
    }

    return bestCell;
  }
}
