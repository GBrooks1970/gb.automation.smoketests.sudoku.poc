/**
 * AuditTypes.ts
 *
 * Shared type definitions for the audit trail system.
 * CellChange is the cross-feature base interface: the Web UI SolveStep extends it,
 * and the REST API response payloads use it directly. Do not redefine in either surface.
 */

export interface CellChange {
  cell: { row: number; col: number };
  oldValue: number;
  newValue: number;
  reason?: string;
}

export interface AuditEvent {
  eventId: number;
  timestamp: string;
  iteration: number;
  algorithm: 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';
  algorithmParameter?: number;
  cellChanges: CellChange[];
  gridSnapshotAfter?: number[][];
}

export interface AuditStatistics {
  changesByAlgorithm: {
    unitCompletion: number;
    hiddenSingles: number;
    nakedSingles: number;
  };
  iterationsByAlgorithm: {
    unitCompletion: number;
    hiddenSingles: number;
    nakedSingles: number;
  };
  averageChangesPerIteration: number;
}

export interface AuditTrail {
  puzzleName: string;
  startTime: string;
  endTime: string;
  totalDurationMs: number;
  initialGrid: number[][];
  finalGrid: number[][];
  status: 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC';
  totalIterations: number;
  totalChanges: number;
  events: AuditEvent[];
  statistics: AuditStatistics;
}

export interface AuditConfig {
  enabled: boolean;
  includeGridSnapshots: boolean;
  verbosityLevel: 'minimal' | 'standard' | 'detailed';
}
