import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { GRID_SIZE, BLOCK_SIZE, EMPTY_CELL } from '../../../app_src/constants';

function digitsExcept(missingDigit: number): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((digit) => digit !== missingDigit);
}

export function setupAlmostCompleteColumn(
  solver: SudokuSolver,
  col: number,
  missingDigit: number
): void {
  const values = digitsExcept(missingDigit);
  for (let i = 0; i < values.length; i++) {
    solver.grid[i + 1][col] = values[i];
  }
  solver.grid[0][col] = EMPTY_CELL;
}

export function setupAlmostCompleteBlock(
  solver: SudokuSolver,
  blockRow: number,
  blockCol: number,
  missingDigit: number
): void {
  const values = digitsExcept(missingDigit);
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
      solver.grid[row][col] = (row + col) % 2 === 0 ? ((row * 3 + col + 1) % 9) + 1 : EMPTY_CELL;
    }
  }
}

export function setupRowMissingDigit(solver: SudokuSolver, rowIndex: number, target: number): void {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== target);
  let idx = 0;
  for (let col = 0; col < GRID_SIZE; col++) {
    solver.grid[rowIndex][col] = col === 4 ? EMPTY_CELL : digits[idx++];
  }
}

export function setupColumnMissingDigit(
  solver: SudokuSolver,
  colIndex: number,
  target: number
): void {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== target);
  let idx = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    solver.grid[row][colIndex] = row === 4 ? EMPTY_CELL : digits[idx++];
  }
}

export function setupRowColumnConstraints(
  solver: SudokuSolver,
  count: number,
  rowIndex: number,
  target: number
): void {
  const candidateCol = 4;
  const usedRows = new Set<number>();
  let blocked = 0;

  for (let col = 0; col < GRID_SIZE && blocked < count; col++) {
    if (col === candidateCol) continue;

    const row = findBlockingRow(col, rowIndex, candidateCol, usedRows);
    solver.grid[row][col] = target;
    usedRows.add(row);
    blocked++;
  }
}

export function setupColumnRowConstraints(
  solver: SudokuSolver,
  count: number,
  colIndex: number,
  target: number
): void {
  const candidateRow = 4;
  const usedCols = new Set<number>();
  let blocked = 0;

  for (let row = 0; row < GRID_SIZE && blocked < count; row++) {
    if (row === candidateRow) continue;

    const col = findBlockingCol(row, candidateRow, colIndex, usedCols);
    solver.grid[row][col] = target;
    usedCols.add(col);
    blocked++;
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
    case 'has5InSameRow':
      solver.grid[0][5] = 5;
      break;
    case 'has3InSameCol':
      solver.grid[5][0] = 3;
      break;
    case 'has7InSameBlock':
      solver.grid[0][0] = 7;
      break;
    case 'has1InRowAndCol':
      solver.grid[8][0] = 1;
      solver.grid[0][8] = 1;
      break;
    case 'fullyConstrained':
      solver.grid[3][0] = 8;
      break;
    // emptyGrid, noConflicts, noConstraints: no-op (fresh solver already empty)
  }
}

export function setupWithDuplicateInRow(
  solver: SudokuSolver,
  rowIndex: number,
  value: number
): void {
  solver.grid[rowIndex][0] = value;
  solver.grid[rowIndex][1] = value;
}

export function addValuesToRow(
  solver: SudokuSolver,
  row: number,
  excludeCol: number,
  values: number[]
): void {
  let placed = 0;
  for (let c = 0; c < GRID_SIZE && placed < values.length; c++) {
    if (c !== excludeCol && solver.grid[row][c] === EMPTY_CELL) {
      solver.grid[row][c] = values[placed++];
    }
  }
}

export function addValuesToColumn(
  solver: SudokuSolver,
  col: number,
  excludeRow: number,
  values: number[]
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
  targetRow: number,
  targetCol: number,
  excludeRow: number,
  excludeCol: number,
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
  return puzzles.slice(0, count).map((p) => new SudokuSolver(p.name, p.grid));
}

function findBlockingRow(
  col: number,
  candidateRow: number,
  candidateCol: number,
  usedRows: Set<number>
): number {
  const candidateBlockRow = Math.floor(candidateRow / BLOCK_SIZE);
  const candidateBlockCol = Math.floor(candidateCol / BLOCK_SIZE);
  const colSharesCandidateBlock = Math.floor(col / BLOCK_SIZE) === candidateBlockCol;
  const allowedRows = Array.from({ length: GRID_SIZE }, (_, row) => row)
    .filter((row) => row !== candidateRow)
    .filter(
      (row) => !colSharesCandidateBlock || Math.floor(row / BLOCK_SIZE) !== candidateBlockRow
    );
  return allowedRows.find((row) => !usedRows.has(row)) ?? allowedRows[0];
}

function findBlockingCol(
  row: number,
  candidateRow: number,
  candidateCol: number,
  usedCols: Set<number>
): number {
  const candidateBlockRow = Math.floor(candidateRow / BLOCK_SIZE);
  const candidateBlockCol = Math.floor(candidateCol / BLOCK_SIZE);
  const rowSharesCandidateBlock = Math.floor(row / BLOCK_SIZE) === candidateBlockRow;
  const allowedCols = Array.from({ length: GRID_SIZE }, (_, col) => col)
    .filter((col) => col !== candidateCol)
    .filter(
      (col) => !rowSharesCandidateBlock || Math.floor(col / BLOCK_SIZE) !== candidateBlockCol
    );
  return allowedCols.find((col) => !usedCols.has(col)) ?? allowedCols[0];
}

export function setupNakedPairRow(solver: SudokuSolver): void {
  const rowDigits = [1, 3, 5, 6, 8, 9];
  for (let c = 3; c < GRID_SIZE; c++) {
    solver.grid[0][c] = rowDigits[c - 3];
  }
  solver.grid[4][0] = 4;
  solver.grid[5][1] = 4;
}

export function setupNakedPairColumn(solver: SudokuSolver): void {
  const colDigits = [1, 2, 4, 6, 7, 9];
  for (let r = 3; r < GRID_SIZE; r++) {
    solver.grid[r][0] = colDigits[r - 3];
  }
  solver.grid[0][4] = 5;
  solver.grid[1][5] = 5;
}

export function setupNakedPairBlock(solver: SudokuSolver): void {
  const blockDigits = [2, 3, 4, 5, 7, 8];
  let idx = 0;
  for (let r = 1; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      solver.grid[r][c] = blockDigits[idx++];
    }
  }
  solver.grid[4][0] = 9;
  solver.grid[5][1] = 9;
}

export function setupNoNakedPairs(solver: SudokuSolver): void {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      solver.grid[r][c] = EMPTY_CELL;
    }
  }
}

export function setupXWingRow(solver: SudokuSolver): void {
  const digits = [1, 2, 3, 4, 5, 6, 8];
  const cols = [0, 2, 3, 4, 6, 7, 8];
  for (let i = 0; i < digits.length; i++) {
    solver.grid[1][cols[i]] = digits[i];
    solver.grid[4][cols[i]] = digits[i];
  }
  // Target cell (7, 1) setup with candidates {3, 7}
  const r7Digits = [1, 2, 4, 5, 6, 8];
  const r7Cols = [0, 2, 3, 4, 5, 6];
  for (let i = 0; i < r7Digits.length; i++) {
    solver.grid[7][r7Cols[i]] = r7Digits[i];
  }
  solver.grid[8][1] = 9;
}

export function setupXWingColumn(solver: SudokuSolver): void {
  const digits = [1, 2, 3, 4, 5, 6, 8];
  const rows = [0, 2, 3, 5, 6, 7, 8];
  for (let i = 0; i < digits.length; i++) {
    solver.grid[rows[i]][1] = digits[i];
    solver.grid[rows[i]][5] = digits[i];
  }
  // Target cell (1, 7) setup with candidates {3, 7}
  const c7Digits = [1, 2, 4, 5, 6, 8];
  const c7Rows = [0, 2, 3, 4, 5, 6];
  for (let i = 0; i < c7Digits.length; i++) {
    solver.grid[c7Rows[i]][7] = c7Digits[i];
  }
  solver.grid[1][8] = 9;
}

export function setupNoXWing(solver: SudokuSolver): void {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      solver.grid[r][c] = EMPTY_CELL;
    }
  }
}
