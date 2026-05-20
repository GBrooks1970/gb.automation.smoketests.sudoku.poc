import { BLOCK_SIZE, EMPTY_CELL, GRID_SIZE, MAX_DIGIT, MIN_DIGIT } from '../constants';
import { ApiError } from './errors';
import {
  Grid,
  GridRequest,
  HiddenSinglesRequest,
  RequestOptions,
  SolveOptions,
  SolveRequest,
  ValidationConflict,
  ValidationResponse,
} from './types';

const DEFAULT_REQUEST_OPTIONS: RequestOptions = {
  includeReason: true,
  returnGridSnapshot: true,
};

const DEFAULT_SOLVE_OPTIONS: SolveOptions = {
  ...DEFAULT_REQUEST_OPTIONS,
  includeIterationHistory: false,
};

interface GridFormatValidation {
  valid: boolean;
  message: string;
  details?: unknown;
}

export function parseGridRequest(body: unknown): GridRequest {
  const grid = parseGrid(body);
  return {
    grid,
    options: parseRequestOptions(body),
  };
}

export function parseHiddenSinglesRequest(body: unknown): HiddenSinglesRequest {
  return {
    ...parseGridRequest(body),
    targetNumber: parseTargetNumber(body),
  };
}

export function parseSolveRequest(body: unknown): SolveRequest {
  const grid = parseGrid(body);
  return {
    grid,
    options: parseSolveOptions(body),
  };
}

export function validateGridFormat(grid: unknown): GridFormatValidation {
  if (!Array.isArray(grid)) {
    return {
      valid: false,
      message: 'Grid must be a 9x9 array of numbers 0-9',
      details: { field: 'grid', expectedRows: GRID_SIZE },
    };
  }

  if (grid.length !== GRID_SIZE) {
    return {
      valid: false,
      message: 'Grid must contain exactly 9 rows',
      details: { field: 'grid', receivedRows: grid.length, expectedRows: GRID_SIZE },
    };
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    const cells = grid[row];
    if (!Array.isArray(cells) || cells.length !== GRID_SIZE) {
      return {
        valid: false,
        message: 'Each grid row must contain exactly 9 columns',
        details: {
          field: `grid[${row}]`,
          receivedColumns: Array.isArray(cells) ? cells.length : undefined,
          expectedColumns: GRID_SIZE,
        },
      };
    }

    for (let col = 0; col < GRID_SIZE; col++) {
      const value = cells[col];
      if (!Number.isInteger(value) || value < EMPTY_CELL || value > MAX_DIGIT) {
        return {
          valid: false,
          message: 'Grid cells must be integer values from 0 to 9',
          details: {
            field: `grid[${row}][${col}]`,
            received: value,
            expected: '0-9',
          },
        };
      }
    }
  }

  return { valid: true, message: 'Grid format is valid' };
}

export function buildValidationResponse(grid: Grid): ValidationResponse {
  const conflicts = collectConflicts(grid);
  return {
    valid: conflicts.length === 0,
    message: conflicts.length === 0 ? 'Grid is valid' : 'Grid has conflicts',
    dimensions: `${GRID_SIZE}x${GRID_SIZE}`,
    emptyCells: countEmptyCells(grid),
    conflicts,
  };
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function countEmptyCells(grid: Grid): number {
  return grid.reduce((total, row) => total + row.filter((cell) => cell === EMPTY_CELL).length, 0);
}

function parseGrid(body: unknown): Grid {
  if (!isRecord(body) || !('grid' in body)) {
    throw new ApiError(400, 'MISSING_GRID', 'Grid is required in request body', {
      field: 'grid',
    });
  }

  const validation = validateGridFormat(body.grid);
  if (!validation.valid) {
    throw new ApiError(400, 'INVALID_GRID_FORMAT', validation.message, validation.details);
  }

  return cloneGrid(body.grid as Grid);
}

function parseRequestOptions(body: unknown): RequestOptions {
  if (!isRecord(body) || !isRecord(body.options)) {
    return { ...DEFAULT_REQUEST_OPTIONS };
  }

  return {
    includeReason:
      typeof body.options.includeReason === 'boolean'
        ? body.options.includeReason
        : DEFAULT_REQUEST_OPTIONS.includeReason,
    returnGridSnapshot:
      typeof body.options.returnGridSnapshot === 'boolean'
        ? body.options.returnGridSnapshot
        : DEFAULT_REQUEST_OPTIONS.returnGridSnapshot,
  };
}

function parseSolveOptions(body: unknown): SolveOptions {
  const requestOptions = parseRequestOptions(body);
  const includeIterationHistory =
    isRecord(body) &&
    isRecord(body.options) &&
    typeof body.options.includeIterationHistory === 'boolean'
      ? body.options.includeIterationHistory
      : DEFAULT_SOLVE_OPTIONS.includeIterationHistory;

  return {
    ...requestOptions,
    includeIterationHistory,
  };
}

function parseTargetNumber(body: unknown): number | undefined {
  if (!isRecord(body) || body.targetNumber === undefined) {
    return undefined;
  }

  const targetNumber = body.targetNumber;
  if (
    typeof targetNumber !== 'number' ||
    !Number.isInteger(targetNumber) ||
    targetNumber < MIN_DIGIT ||
    targetNumber > MAX_DIGIT
  ) {
    throw new ApiError(422, 'INVALID_TARGET_NUMBER', 'targetNumber must be between 1 and 9', {
      field: 'targetNumber',
      received: targetNumber,
      expected: '1-9',
    });
  }

  return targetNumber;
}

function collectConflicts(grid: Grid): ValidationConflict[] {
  const conflicts: ValidationConflict[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    conflicts.push(...findDuplicateConflicts(getRowCells(grid, row), 'duplicate_in_row', { row }));
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    conflicts.push(
      ...findDuplicateConflicts(getColumnCells(grid, col), 'duplicate_in_column', { col })
    );
  }

  for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
    for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
      conflicts.push(
        ...findDuplicateConflicts(getBlockCells(grid, blockRow, blockCol), 'duplicate_in_block', {
          block: { row: blockRow, col: blockCol },
        })
      );
    }
  }

  return conflicts;
}

function findDuplicateConflicts(
  cells: Array<{ row: number; col: number; value: number }>,
  type: ValidationConflict['type'],
  location: Pick<ValidationConflict, 'row' | 'col' | 'block'>
): ValidationConflict[] {
  const byValue = new Map<number, Array<{ row: number; col: number }>>();
  for (const cell of cells) {
    if (cell.value === EMPTY_CELL) continue;
    const existing = byValue.get(cell.value) ?? [];
    existing.push({ row: cell.row, col: cell.col });
    byValue.set(cell.value, existing);
  }

  return Array.from(byValue.entries())
    .filter(([, duplicateCells]) => duplicateCells.length > 1)
    .map(([value, duplicateCells]) => ({
      type,
      value,
      cells: duplicateCells,
      ...location,
    }));
}

function getRowCells(grid: Grid, row: number): Array<{ row: number; col: number; value: number }> {
  return grid[row].map((value, col) => ({ row, col, value }));
}

function getColumnCells(
  grid: Grid,
  col: number
): Array<{ row: number; col: number; value: number }> {
  return grid.map((row, rowIndex) => ({ row: rowIndex, col, value: row[col] }));
}

function getBlockCells(
  grid: Grid,
  blockRow: number,
  blockCol: number
): Array<{ row: number; col: number; value: number }> {
  const cells: Array<{ row: number; col: number; value: number }> = [];
  const startRow = blockRow * BLOCK_SIZE;
  const startCol = blockCol * BLOCK_SIZE;

  for (let row = startRow; row < startRow + BLOCK_SIZE; row++) {
    for (let col = startCol; col < startCol + BLOCK_SIZE; col++) {
      cells.push({ row, col, value: grid[row][col] });
    }
  }

  return cells;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
