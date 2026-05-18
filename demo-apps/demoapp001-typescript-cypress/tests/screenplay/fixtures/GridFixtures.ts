import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { GRID_SIZE, BLOCK_SIZE, EMPTY_CELL } from '../../../app_src/constants';

export function setupAlmostCompleteColumn(solver: SudokuSolver, col: number): void {
  const values = [1, 2, 3, 4, 5, 6, 8, 9];
  for (let i = 0; i < values.length; i++) {
    solver.grid[i + 1][col] = values[i];
  }
  solver.grid[0][col] = EMPTY_CELL;
}

export function setupAlmostCompleteBlock(
  solver: SudokuSolver, blockRow: number, blockCol: number
): void {
  const values = [1, 2, 3, 5, 6, 7, 8, 9];
  let idx = 0;
  for (let r = blockRow * BLOCK_SIZE; r < (blockRow + 1) * BLOCK_SIZE; r++) {
    for (let c = blockCol * BLOCK_SIZE; c < (blockCol + 1) * BLOCK_SIZE; c++) {
      solver.grid[r][c] = idx < values.length ? values[idx++] : EMPTY_CELL;
    }
  }
}

export function setupMultipleEmpties(solver: SudokuSolver): void {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      solver.grid[row][col] =
        (row + col) % 2 === 0 ? ((row * 3 + col + 1) % 9) + 1 : EMPTY_CELL;
    }
  }
}

export function setupRowMissingDigit(
  solver: SudokuSolver, rowIndex: number, target: number
): void {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== target);
  let idx = 0;
  for (let col = 0; col < GRID_SIZE; col++) {
    solver.grid[rowIndex][col] = col === 4 ? EMPTY_CELL : digits[idx++];
  }
}

export function setupColumnMissingDigit(
  solver: SudokuSolver, colIndex: number, target: number
): void {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== target);
  let idx = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    solver.grid[row][colIndex] = row === 4 ? EMPTY_CELL : digits[idx++];
  }
}

export function setupBlockFourEmpties(solver: SudokuSolver): void {
  solver.grid[0][0] = 1;
  solver.grid[1][0] = 2;
  solver.grid[2][0] = 3;
  solver.grid[2][1] = 6;
  solver.grid[2][2] = 7;
}

export function setupHiddenSingleInBlock(solver: SudokuSolver, target: number): void {
  solver.grid[0][5] = target;
  solver.grid[3][1] = target;
}

export function setupDigitInRow(solver: SudokuSolver, rowIndex: number, digit: number): void {
  solver.grid[rowIndex][5] = digit;
}

export function clearCell(solver: SudokuSolver, row: number, col: number): void {
  solver.grid[row][col] = EMPTY_CELL;
}

export function setupThreeCandidates(solver: SudokuSolver): void {
  solver.grid[0][1] = 1;
  solver.grid[0][2] = 3;
  solver.grid[0][3] = 4;
  solver.grid[1][0] = 6;
  solver.grid[2][0] = 7;
  solver.grid[4][0] = 9;
}

export function setupThreeNakedSingles(solver: SudokuSolver): void {
  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      solver.grid[r][c] = solution[r][c];
    }
  }
  solver.grid[0][0] = EMPTY_CELL;
  solver.grid[4][4] = EMPTY_CELL;
  solver.grid[8][8] = EMPTY_CELL;
}

export function setupNamedGridState(solver: SudokuSolver, gridState: string): void {
  switch (gridState) {
    case 'has5InSameRow':   solver.grid[0][5] = 5; break;
    case 'has3InSameCol':   solver.grid[5][0] = 3; break;
    case 'has7InSameBlock': solver.grid[0][0] = 7; break;
    case 'has1InRowAndCol': solver.grid[8][0] = 1; solver.grid[0][8] = 1; break;
    case 'fullyConstrained': solver.grid[3][0] = 8; break;
    // emptyGrid, noConflicts, noConstraints: no-op (fresh solver already empty)
  }
}

export function setupWithDuplicateInRow(
  solver: SudokuSolver, rowIndex: number, value: number
): void {
  solver.grid[rowIndex][0] = value;
  solver.grid[rowIndex][1] = value;
}

export function addValuesToRow(
  solver: SudokuSolver, row: number, excludeCol: number, values: number[]
): void {
  let placed = 0;
  for (let c = 0; c < GRID_SIZE && placed < values.length; c++) {
    if (c !== excludeCol && solver.grid[row][c] === EMPTY_CELL) {
      solver.grid[row][c] = values[placed++];
    }
  }
}

export function addValuesToColumn(
  solver: SudokuSolver, col: number, excludeRow: number, values: number[]
): void {
  let placed = 0;
  for (let r = 0; r < GRID_SIZE && placed < values.length; r++) {
    if (r !== excludeRow && solver.grid[r][col] === EMPTY_CELL) {
      solver.grid[r][col] = values[placed++];
    }
  }
}

export function addValuesToBlock(
  solver: SudokuSolver,
  targetRow: number, targetCol: number,
  excludeRow: number, excludeCol: number,
  values: number[]
): void {
  const blockStartRow = Math.floor(targetRow / BLOCK_SIZE) * BLOCK_SIZE;
  const blockStartCol = Math.floor(targetCol / BLOCK_SIZE) * BLOCK_SIZE;
  let placed = 0;
  for (let r = blockStartRow; r < blockStartRow + BLOCK_SIZE && placed < values.length; r++) {
    for (let c = blockStartCol; c < blockStartCol + BLOCK_SIZE && placed < values.length; c++) {
      if ((r !== excludeRow || c !== excludeCol) && solver.grid[r][c] === EMPTY_CELL) {
        solver.grid[r][c] = values[placed++];
      }
    }
  }
}

export function createSolversFromPuzzles(
  count: number,
  puzzles: Array<{ name: string; grid: number[][] }>
): SudokuSolver[] {
  return puzzles.slice(0, count).map(p => new SudokuSolver(p.name, p.grid));
}
