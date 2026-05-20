import { AuditEvent, AuditStatistics, CellChange } from '../audit/AuditTypes';

export type Grid = number[][];
export type TechniqueName = 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';
export type SolverStatus = 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC';

export interface RequestOptions {
  includeReason: boolean;
  returnGridSnapshot: boolean;
}

export interface SolveOptions extends RequestOptions {
  includeIterationHistory: boolean;
}

export interface GridRequest {
  grid: Grid;
  options: RequestOptions;
}

export interface HiddenSinglesRequest extends GridRequest {
  targetNumber?: number;
}

export interface SolveRequest {
  grid: Grid;
  options: SolveOptions;
}

export interface TechniqueResponse {
  success: true;
  technique: TechniqueName;
  changed: boolean;
  message: string;
  timestamp: string;
  durationMs: number;
  changes: CellChange[];
  gridBefore?: Grid;
  gridAfter?: Grid;
  targetNumber?: number;
}

export interface SolveResponse {
  success: true;
  status: SolverStatus;
  message: string;
  timestamp: string;
  durationMs: number;
  iterations: number;
  totalChanges: number;
  statistics: AuditStatistics;
  gridBefore?: Grid;
  gridAfter: Grid;
  emptyCells?: number;
  events?: AuditEvent[];
}

export interface PuzzleSummary {
  name: string;
  difficulty: string;
  description: string;
}

export interface PuzzleResponse extends PuzzleSummary {
  grid: Grid;
}

export interface PuzzleListResponse {
  puzzles: PuzzleSummary[];
  count: number;
}

export type ValidationConflictType =
  | 'duplicate_in_row'
  | 'duplicate_in_column'
  | 'duplicate_in_block';

export interface ValidationConflict {
  type: ValidationConflictType;
  value: number;
  cells: Array<{ row: number; col: number }>;
  row?: number;
  col?: number;
  block?: { row: number; col: number };
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  dimensions: string;
  emptyCells: number;
  conflicts: ValidationConflict[];
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface SolveStep {
  stepNumber: number;
  iteration: number;
  algorithm: 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';
  algorithmParam?: number;
  cell: { row: number; col: number };
  oldValue: number;
  newValue: number;
}

export interface VisualiseStatistics {
  totalSteps: number;
  totalIterations: number;
  stepsByAlgorithm: {
    unitCompletion: number;
    hiddenSingles: number;
    nakedSingles: number;
  };
}

export interface VisualiseResult {
  puzzleName: string;
  difficulty: string;
  description: string;
  status: SolverStatus;
  initialGrid: Grid;
  finalGrid: Grid;
  steps: SolveStep[];
  statistics: VisualiseStatistics;
}
