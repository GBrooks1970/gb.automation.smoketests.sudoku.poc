import { AuditEvent } from '../audit/AuditTypes';
import { PuzzleLoader } from '../PuzzleLoader';
import { SudokuOrchestrator } from '../SudokuOrchestrator';
import { SudokuSolver } from '../SudokuSolver';
import { ApiError } from './errors';
import { cloneGrid } from './validation';
import { SolveStep, SolverStatus, VisualiseResult } from './types';

export class SolveStepTracker {
  constructor(private readonly puzzleLoader: PuzzleLoader = new PuzzleLoader('../puzzles.json')) {}

  trackSolve(puzzleName: string): VisualiseResult {
    const puzzle = this.puzzleLoader.getPuzzleByName(puzzleName);
    if (!puzzle) {
      throw new ApiError(404, 'PUZZLE_NOT_FOUND', `Puzzle '${puzzleName}' not found`, {
        availablePuzzles: this.puzzleLoader.listPuzzleNames(),
      });
    }

    const initialGrid = cloneGrid(puzzle.grid);
    const solver = new SudokuSolver(puzzle.name, cloneGrid(puzzle.grid));
    const orchestrator = new SudokuOrchestrator(solver, {
      enabled: true,
      includeGridSnapshots: false,
      verbosityLevel: 'standard',
    });

    const status = orchestrator.solve() as SolverStatus;
    const auditTrail = orchestrator.getAuditTrail();
    if (!auditTrail) {
      throw new ApiError(500, 'AUDIT_TRAIL_UNAVAILABLE', 'Solve audit trail was not generated');
    }

    const steps = this.flattenToSteps(auditTrail.events);

    return {
      puzzleName: puzzle.name,
      difficulty: puzzle.difficulty,
      description: puzzle.description,
      status,
      initialGrid,
      finalGrid: solver.getGrid(),
      steps,
      statistics: {
        totalSteps: steps.length,
        totalIterations: auditTrail.totalIterations,
        stepsByAlgorithm: {
          unitCompletion: auditTrail.statistics.changesByAlgorithm.unitCompletion,
          hiddenSingles: auditTrail.statistics.changesByAlgorithm.hiddenSingles,
          nakedSingles: auditTrail.statistics.changesByAlgorithm.nakedSingles,
        },
      },
    };
  }

  private flattenToSteps(events: AuditEvent[]): SolveStep[] {
    let stepNumber = 0;
    return events.flatMap((event) =>
      event.cellChanges.map((change) => ({
        stepNumber: ++stepNumber,
        iteration: event.iteration,
        algorithm: event.algorithm,
        ...(event.algorithmParameter !== undefined && { algorithmParam: event.algorithmParameter }),
        cell: change.cell,
        oldValue: change.oldValue,
        newValue: change.newValue,
      }))
    );
  }
}
