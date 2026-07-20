/**
 * Memory key constants for the DEMOAPP001 Screenplay layer.
 *
 * Rule (RA §8.1): constant name MUST equal its string value exactly.
 * These values must be identical across all Stacks for parity.
 */
export const SOLVE_RESULT = 'SOLVE_RESULT';
export const ALGORITHM_PROGRESS = 'ALGORITHM_PROGRESS';
export const LAST_ERROR = 'LAST_ERROR';
export const TARGET_CELL = 'TARGET_CELL';
export const GRID_SNAPSHOT = 'GRID_SNAPSHOT';
export const VALIDATION_RESULT = 'VALIDATION_RESULT';

/**
 * Typed notepad interface for Actor Memory (RA §3.5, §8.1).
 * Used with TakeNotes.usingAnEmptyNotepad<SudokuNotes>() in the Cast.
 */
export interface SudokuNotes {
  SOLVE_RESULT: string;
  ALGORITHM_PROGRESS: boolean;
  LAST_ERROR: Error | null;
  TARGET_CELL: { row: number; col: number };
  GRID_SNAPSHOT: number[][];
  VALIDATION_RESULT: string;
}
