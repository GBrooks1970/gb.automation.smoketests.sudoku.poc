import { AuditTrail } from './AuditTypes';

export class AuditFormatter {
  static formatSummary(trail: AuditTrail): string {
    const s = trail.statistics;
    const total = trail.totalChanges;
    const pct = (n: number) => (total > 0 ? `(${((n / total) * 100).toFixed(1)}%)` : '(-)');

    return [
      '+---------------------------------------------------------+',
      '|         SUDOKU SOLVER - AUDIT TRAIL SUMMARY             |',
      '+---------------------------------------------------------+',
      `| Puzzle:    ${trail.puzzleName.padEnd(44)}|`,
      `| Status:    ${trail.status.padEnd(44)}|`,
      `| Duration:  ${String(trail.totalDurationMs + 'ms').padEnd(44)}|`,
      `| Iterations:${String(trail.totalIterations).padEnd(44)}|`,
      `| Changes:   ${String(trail.totalChanges).padEnd(44)}|`,
      '+---------------------------------------------------------+',
      `|  Unit Completion:  ${String(s.changesByAlgorithm.unitCompletion).padEnd(6)} ${pct(s.changesByAlgorithm.unitCompletion).padEnd(32)}|`,
      `|  Hidden Singles:   ${String(s.changesByAlgorithm.hiddenSingles).padEnd(6)} ${pct(s.changesByAlgorithm.hiddenSingles).padEnd(32)}|`,
      `|  Naked Singles:    ${String(s.changesByAlgorithm.nakedSingles).padEnd(6)} ${pct(s.changesByAlgorithm.nakedSingles).padEnd(32)}|`,
      '+---------------------------------------------------------+',
    ].join('\n');
  }

  static formatDetailed(trail: AuditTrail): string {
    const lines: string[] = [];
    let currentIteration = 0;
    for (const event of trail.events) {
      if (event.iteration !== currentIteration) {
        currentIteration = event.iteration;
        lines.push(`\n=== ITERATION ${currentIteration} ===`);
      }
      const paramStr =
        event.algorithmParameter !== undefined ? `(${event.algorithmParameter})` : '';
      for (const change of event.cellChanges) {
        lines.push(
          `[${event.algorithm}${paramStr}] ` +
            `Cell [${change.cell.row},${change.cell.col}]: ${change.oldValue} -> ${change.newValue}` +
            (change.reason ? `\n  Reason: ${change.reason}` : '')
        );
      }
    }
    return lines.join('\n');
  }

  static toJson(trail: AuditTrail): string {
    return JSON.stringify(trail, null, 2);
  }
}
