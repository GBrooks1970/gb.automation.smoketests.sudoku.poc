import { Mulberry32 } from './prng';
import { UniquenessOracle } from './uniqueness-oracle';

export interface ClueReductionResult {
  grid: number[][];
  clueCount: number;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface CellPair {
  cell1: CellCoord;
  cell2?: CellCoord;
}

/**
 * Reduces a complete 9x9 Sudoku solution grid to a minimal uniquely-solvable puzzle clue set.
 *
 * @param solution Complete valid 9x9 Sudoku solution grid.
 * @param targetClues Desired clue count threshold (default: 32; minimum bounds >= 17).
 * @param seed Seed for deterministic PRNG cell removal ordering.
 * @param symmetrical Whether to enforce 180-degree rotational symmetry (default: true).
 * @returns Result object containing the reduced partial grid and final clue count.
 */
export function reduceToClues(
  solution: number[][],
  targetClues: number = 32,
  seed: number | string = Date.now(),
  symmetrical: boolean = true
): ClueReductionResult {
  const prng = new Mulberry32(seed);
  const grid = solution.map((row) => [...row]);
  let clueCount = 81;

  const pairs = buildCellPairs(symmetrical);
  const shuffledPairs = prng.shuffle(pairs);

  for (const pair of shuffledPairs) {
    if (clueCount <= targetClues) {
      break;
    }

    const val1 = grid[pair.cell1.row][pair.cell1.col];
    let val2 = 0;

    grid[pair.cell1.row][pair.cell1.col] = 0;
    let removedCount = 1;

    if (pair.cell2) {
      val2 = grid[pair.cell2.row][pair.cell2.col];
      grid[pair.cell2.row][pair.cell2.col] = 0;
      removedCount = 2;
    }

    // Verify solution remains unique
    const solutions = UniquenessOracle.countSolutions(grid, 2);

    if (solutions === 1) {
      clueCount -= removedCount;
    } else {
      // Restore cell values if removal created multiple solutions or unsolvable grid
      grid[pair.cell1.row][pair.cell1.col] = val1;
      if (pair.cell2) {
        grid[pair.cell2.row][pair.cell2.col] = val2;
      }
    }
  }

  return {
    grid,
    clueCount,
  };
}

/**
 * Builds the cell removal units (single cells or 180-degree symmetric pairs).
 */
function buildCellPairs(symmetrical: boolean): CellPair[] {
  const pairs: CellPair[] = [];
  const visited = new Set<string>();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const key1 = `${r},${c}`;
      if (visited.has(key1)) continue;

      if (symmetrical) {
        const symR = 8 - r;
        const symC = 8 - c;
        const key2 = `${symR},${symC}`;

        visited.add(key1);
        visited.add(key2);

        if (r === symR && c === symC) {
          pairs.push({ cell1: { row: r, col: c } });
        } else {
          pairs.push({
            cell1: { row: r, col: c },
            cell2: { row: symR, col: symC },
          });
        }
      } else {
        visited.add(key1);
        pairs.push({ cell1: { row: r, col: c } });
      }
    }
  }

  return pairs;
}
