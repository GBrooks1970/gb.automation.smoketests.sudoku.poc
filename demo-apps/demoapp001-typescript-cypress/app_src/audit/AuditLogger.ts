import { AuditConfig, AuditEvent, AuditStatistics, AuditTrail, CellChange } from './AuditTypes';

const DEFAULT_CONFIG: AuditConfig = {
  enabled: true,
  includeGridSnapshots: false,
  verbosityLevel: 'standard',
};

export class AuditLogger {
  private readonly config: AuditConfig;
  private readonly events: AuditEvent[] = [];
  private readonly puzzleName: string;
  private readonly initialGrid: number[][];
  private readonly startTime: Date;
  private currentIteration: number = 0;
  private eventIdCounter: number = 0;

  constructor(puzzleName: string, initialGrid: number[][], config: Partial<AuditConfig> = {}) {
    this.puzzleName = puzzleName;
    this.initialGrid = initialGrid.map((r) => [...r]);
    this.startTime = new Date();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  startIteration(): void {
    this.currentIteration++;
  }

  logChange(
    algorithm: AuditEvent['algorithm'],
    cellChanges: CellChange[],
    algorithmParameter?: number,
    gridSnapshotAfter?: number[][]
  ): void {
    if (!this.config.enabled || cellChanges.length === 0) return;
    const event: AuditEvent = {
      eventId: ++this.eventIdCounter,
      timestamp: new Date().toISOString(),
      iteration: this.currentIteration,
      algorithm,
      cellChanges,
      ...(algorithmParameter !== undefined && { algorithmParameter }),
      ...(this.config.includeGridSnapshots &&
        gridSnapshotAfter && {
          gridSnapshotAfter: gridSnapshotAfter.map((r) => [...r]),
        }),
    };
    this.events.push(event);
  }

  getChangeCount(): number {
    return this.events.reduce((sum, e) => sum + e.cellChanges.length, 0);
  }

  getStatistics(): AuditStatistics {
    const stats: AuditStatistics = {
      changesByAlgorithm: { unitCompletion: 0, hiddenSingles: 0, nakedSingles: 0 },
      iterationsByAlgorithm: { unitCompletion: 0, hiddenSingles: 0, nakedSingles: 0 },
      averageChangesPerIteration: 0,
    };
    for (const event of this.events) {
      const changes = event.cellChanges.length;
      if (event.algorithm === 'UnitCompletion') {
        stats.changesByAlgorithm.unitCompletion += changes;
        stats.iterationsByAlgorithm.unitCompletion++;
      } else if (event.algorithm === 'HiddenSingles') {
        stats.changesByAlgorithm.hiddenSingles += changes;
        stats.iterationsByAlgorithm.hiddenSingles++;
      } else {
        stats.changesByAlgorithm.nakedSingles += changes;
        stats.iterationsByAlgorithm.nakedSingles++;
      }
    }
    const total =
      stats.changesByAlgorithm.unitCompletion +
      stats.changesByAlgorithm.hiddenSingles +
      stats.changesByAlgorithm.nakedSingles;
    stats.averageChangesPerIteration =
      this.currentIteration > 0 ? total / this.currentIteration : 0;
    return stats;
  }

  getTrail(finalGrid: number[][], status: 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC'): AuditTrail {
    const endTime = new Date();
    return {
      puzzleName: this.puzzleName,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDurationMs: endTime.getTime() - this.startTime.getTime(),
      initialGrid: this.initialGrid,
      finalGrid: finalGrid.map((r) => [...r]),
      status,
      totalIterations: this.currentIteration,
      totalChanges: this.getChangeCount(),
      events: this.events,
      statistics: this.getStatistics(),
    };
  }
}
