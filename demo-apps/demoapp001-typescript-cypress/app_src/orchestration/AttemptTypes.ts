export type AttemptTechnique = 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles' | 'NakedPairs';

export type AttemptUnit = 'row' | 'column' | 'box';

export interface AttemptCellChange {
  readonly cell: Readonly<{ row: number; col: number }>;
  readonly oldValue: number;
  readonly newValue: number;
  readonly reason?: string;
}

/**
 * Immutable evidence that an orchestration boundary was invoked.
 *
 * Unlike AuditEvent, unchanged attempts are retained and no timestamp is recorded. This keeps
 * the trace deterministic and preserves the existing change-only audit response contract.
 */
export interface AttemptEvent {
  readonly iteration: number;
  readonly sequence: number;
  readonly technique: AttemptTechnique;
  readonly parameter?: number;
  readonly unit?: AttemptUnit;
  readonly index?: number;
  readonly changed: boolean;
  readonly changes: ReadonlyArray<AttemptCellChange>;
}

export type AttemptObserver = (event: AttemptEvent) => void;
