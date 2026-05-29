import { AuditLogger } from '../audit/AuditLogger';
import { AuditEvent, CellChange } from '../audit/AuditTypes';
import { GRID_SIZE } from '../constants';
import { Puzzle, PuzzleLoader } from '../PuzzleLoader';
import { SudokuOrchestrator } from '../SudokuOrchestrator';
import { SudokuSolver } from '../SudokuSolver';
import { ApiError } from './errors';
import { buildValidationResponse, cloneGrid, countEmptyCells } from './validation';
import {
  Grid,
  PuzzleListResponse,
  PuzzleResponse,
  RequestOptions,
  SolveOptions,
  SolveResponse,
  SolverStatus,
  TechniqueName,
  TechniqueResponse,
  ValidationResponse,
} from './types';

export class SudokuApiService {
  constructor(private readonly puzzleLoader: PuzzleLoader = new PuzzleLoader('../puzzles.json')) {}

  executeUnitCompletion(grid: Grid, options: RequestOptions): TechniqueResponse {
    return this.executeTechnique('UnitCompletion', grid, options, (solver) =>
      solver.unitCompletion()
    );
  }

  executeHiddenSingles(
    grid: Grid,
    targetNumber: number | undefined,
    options: RequestOptions
  ): TechniqueResponse {
    return this.executeTechnique(
      'HiddenSingles',
      grid,
      options,
      (solver) => {
        if (targetNumber !== undefined) {
          return solver.hiddenSingles(targetNumber);
        }

        let changed = false;
        for (let digit = 1; digit <= GRID_SIZE; digit++) {
          if (solver.hiddenSingles(digit)) {
            changed = true;
          }
        }
        return changed;
      },
      targetNumber
    );
  }

  executeNakedSingles(grid: Grid, options: RequestOptions): TechniqueResponse {
    return this.executeTechnique('NakedSingles', grid, options, (solver) => solver.nakedSingles());
  }

  executeSolve(grid: Grid, options: SolveOptions): SolveResponse {
    const gridBefore = cloneGrid(grid);
    const solver = new SudokuSolver('api-request', grid);
    const orchestrator = new SudokuOrchestrator(solver, {
      enabled: true,
      includeGridSnapshots: options.includeIterationHistory,
      verbosityLevel: 'standard',
    });

    const status = orchestrator.solve() as SolverStatus;
    const auditTrail = orchestrator.getAuditTrail();
    if (!auditTrail) {
      throw new ApiError(500, 'AUDIT_TRAIL_UNAVAILABLE', 'Solve audit trail was not generated');
    }

    return {
      success: true,
      status,
      message:
        status === 'SOLVED'
          ? 'Puzzle solved successfully'
          : 'Basic techniques insufficient. Advanced techniques required.',
      timestamp: auditTrail.endTime,
      durationMs: auditTrail.totalDurationMs,
      iterations: auditTrail.totalIterations,
      totalChanges: auditTrail.totalChanges,
      statistics: auditTrail.statistics,
      ...(options.returnGridSnapshot && { gridBefore }),
      gridAfter: cloneGrid(solver.grid),
      ...(status === 'STUCK_ON_ADVANCED_LOGIC' && { emptyCells: countEmptyCells(solver.grid) }),
      ...(options.includeIterationHistory && { events: auditTrail.events }),
    };
  }

  listPuzzles(): PuzzleListResponse {
    const puzzles = this.puzzleLoader.getAllPuzzles().map((puzzle) => ({
      name: puzzle.name,
      difficulty: puzzle.difficulty,
      description: puzzle.description,
    }));

    return {
      puzzles,
      count: puzzles.length,
    };
  }

  getPuzzleByName(name: string): PuzzleResponse {
    const puzzle = this.puzzleLoader.getPuzzleByName(name);
    if (!puzzle) {
      throw new ApiError(404, 'PUZZLE_NOT_FOUND', `Puzzle '${name}' not found`, {
        availablePuzzles: this.puzzleLoader.listPuzzleNames(),
      });
    }

    return this.toPuzzleResponse(puzzle);
  }

  validateGrid(grid: Grid): ValidationResponse {
    return buildValidationResponse(grid);
  }

  private executeTechnique(
    technique: TechniqueName,
    grid: Grid,
    options: RequestOptions,
    action: (solver: SudokuSolver) => boolean,
    targetNumber?: number
  ): TechniqueResponse {
    const startedAtMs = Date.now();
    const gridBefore = cloneGrid(grid);
    const solver = new SudokuSolver('api-request', grid);
    const auditLogger = new AuditLogger(solver.name, solver.origGrid, {
      enabled: true,
      includeGridSnapshots: false,
      verbosityLevel: 'standard',
    });

    solver.setAuditLogger(auditLogger);
    auditLogger.startIteration();
    const changed = action(solver);
    const durationMs = Date.now() - startedAtMs;
    const events = auditLogger.getTrail(solver.grid, this.resolveStatus(solver.grid)).events;
    const changes = this.prepareChanges(events, options.includeReason);

    return {
      success: true,
      technique,
      changed,
      message: this.techniqueMessage(technique, changed, changes.length, targetNumber),
      timestamp: new Date().toISOString(),
      durationMs,
      changes,
      ...(options.returnGridSnapshot && { gridBefore, gridAfter: cloneGrid(solver.grid) }),
      ...(targetNumber !== undefined && { targetNumber }),
    };
  }

  private prepareChanges(events: AuditEvent[], includeReason: boolean): CellChange[] {
    const changes = events.flatMap((event) => event.cellChanges);
    if (includeReason) {
      return changes;
    }

    return changes.map(({ cell, oldValue, newValue }) => ({ cell, oldValue, newValue }));
  }

  private techniqueMessage(
    technique: TechniqueName,
    changed: boolean,
    changeCount: number,
    targetNumber?: number
  ): string {
    if (!changed) {
      if (technique === 'HiddenSingles' && targetNumber !== undefined) {
        return `No hidden singles found for digit ${targetNumber}`;
      }
      return `No ${this.readableTechniqueName(technique)} changes found`;
    }

    return `${this.readableTechniqueName(technique)} placed ${changeCount} cell(s)`;
  }

  private readableTechniqueName(technique: TechniqueName): string {
    if (technique === 'UnitCompletion') return 'Unit Completion';
    if (technique === 'HiddenSingles') return 'Hidden Singles';
    return 'Naked Singles';
  }

  private resolveStatus(grid: Grid): SolverStatus {
    return countEmptyCells(grid) === 0 ? 'SOLVED' : 'STUCK_ON_ADVANCED_LOGIC';
  }

  private toPuzzleResponse(puzzle: Puzzle): PuzzleResponse {
    return {
      name: puzzle.name,
      difficulty: puzzle.difficulty,
      description: puzzle.description,
      grid: cloneGrid(puzzle.grid),
    };
  }
}
