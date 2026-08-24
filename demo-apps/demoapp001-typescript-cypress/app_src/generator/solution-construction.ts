import { Mulberry32 } from './prng';
import { isValidPlacement, isValidSolution } from './grid-validator';

/**
 * Custom Error thrown when complete-solution construction exceeds max iteration bounds.
 */
export class GeneratorTimeoutError extends Error {
  constructor(iterations: number, maxIterations: number) {
    super(`Puzzle generator exceeded maximum iteration bound (${iterations} >= ${maxIterations}).`);
    this.name = 'GeneratorTimeoutError';
  }
}

/**
 * Generates a complete, fully populated 9x9 valid Sudoku solution grid.
 *
 * Uses seed-driven PRNG to pre-fill independent diagonal 3x3 blocks followed by
 * MRV-guided (Minimum Remaining Values) bounded backtracking search.
 * The search logic is strictly isolated from SudokuSolver.
 *
 * @param seed Optional integer or string seed for 100% deterministic generation.
 * @param maxIterations Maximum allowed backtracking iterations before timing out (default: 10,000).
 * @returns A 100% valid 9x9 Sudoku solution matrix.
 */
export function generateCompleteSolution(
  seed: number | string = Date.now(),
  maxIterations: number = 10000
): number[][] {
  const prng = new Mulberry32(seed);
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  // Step 1: Pre-fill independent diagonal 3x3 blocks (Block 0, Block 4, Block 8)
  fillDiagonalBlock(grid, 0, 0, prng);
  fillDiagonalBlock(grid, 3, 3, prng);
  fillDiagonalBlock(grid, 6, 6, prng);

  // Step 2: Fill remaining empty cells using MRV-guided bounded backtracking
  let iterations = 0;

  function backtrack(): boolean {
    const nextCell = findBestEmptyCell(grid);
    if (!nextCell) {
      return true; // All cells filled
    }

    const [row, col] = nextCell;
    const digits = prng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of digits) {
      iterations++;
      if (iterations > maxIterations) {
        throw new GeneratorTimeoutError(iterations, maxIterations);
      }

      if (isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num;
        if (backtrack()) {
          return true;
        }
        grid[row][col] = 0;
      }
    }

    return false;
  }

  const success = backtrack();
  if (!success || !isValidSolution(grid)) {
    throw new Error(`Failed to construct valid Sudoku solution for seed '${seed}'.`);
  }

  return grid.map((r) => [...r]);
}

/**
 * Finds the empty cell with the Minimum Remaining Values (MRV) to optimize search tree pruning.
 */
function findBestEmptyCell(grid: number[][]): [number, number] | null {
  let minCandidates = 10;
  let bestCell: [number, number] | null = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, r, c, num)) {
            count++;
          }
        }
        if (count < minCandidates) {
          minCandidates = count;
          bestCell = [r, c];
          if (count === 0) return bestCell; // Immediate dead end
        }
      }
    }
  }

  return bestCell;
}

/**
 * Pre-fills a 3x3 block starting at (startRow, startCol) with a PRNG-shuffled permutation of 1..9.
 */
function fillDiagonalBlock(
  grid: number[][],
  startRow: number,
  startCol: number,
  prng: Mulberry32
): void {
  const digits = prng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      grid[startRow + r][startCol + c] = digits[idx++];
    }
  }
}
