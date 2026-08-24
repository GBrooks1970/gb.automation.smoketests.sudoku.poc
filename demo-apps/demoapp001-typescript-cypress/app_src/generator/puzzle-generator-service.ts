import { reduceToClues } from './clue-removal';
import { DifficultyGradeResult, DifficultyLevel, gradePuzzle } from './difficulty-grader';
import { generateCompleteSolution } from './solution-construction';

export interface GeneratePuzzleOptions {
  difficulty?: DifficultyLevel;
  seed?: number | string;
  symmetrical?: boolean;
  clueCount?: number;
  maxAttempts?: number;
}

export interface GeneratedPuzzle {
  seed: string;
  difficulty: DifficultyLevel;
  clueCount: number;
  symmetrical: boolean;
  highestTechnique: string;
  solveSteps: number;
  grid: number[][];
  solution: number[][];
}

/**
 * Pipeline Orchestrator for Sudoku Puzzle Generation.
 * Integrates solution construction (SUD-39), clue reduction (SUD-40), and difficulty grading (SUD-41).
 */
export class PuzzleGeneratorService {
  /**
   * Generates a complete governed Sudoku puzzle matching requested parameters.
   */
  public generatePuzzle(options: GeneratePuzzleOptions = {}): GeneratedPuzzle {
    const baseSeed = options.seed !== undefined ? String(options.seed) : String(Date.now());
    const symmetrical = options.symmetrical !== false;
    const targetDifficulty = options.difficulty;
    const maxAttempts = options.maxAttempts ?? 10;

    let targetClues = options.clueCount;
    if (targetClues === undefined) {
      targetClues = targetDifficulty ? getDefaultCluesForDifficulty(targetDifficulty) : 32;
    }

    let bestCandidate: {
      solution: number[][];
      grid: number[][];
      clueCount: number;
      grade: DifficultyGradeResult;
      seedUsed: string;
    } | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const currentSeed = attempt === 0 ? baseSeed : `${baseSeed}-${attempt}`;
      const solution = generateCompleteSolution(currentSeed);
      const reduced = reduceToClues(solution, targetClues, currentSeed, symmetrical);
      const grade = gradePuzzle(reduced.grid);

      const candidate = {
        solution,
        grid: reduced.grid,
        clueCount: reduced.clueCount,
        grade,
        seedUsed: currentSeed,
      };

      if (!bestCandidate) {
        bestCandidate = candidate;
      }

      if (!targetDifficulty || grade.difficulty === targetDifficulty) {
        bestCandidate = candidate;
        break;
      }
    }

    if (!bestCandidate) {
      throw new Error(`Failed to generate Sudoku puzzle for seed '${baseSeed}'.`);
    }

    return {
      seed: bestCandidate.seedUsed,
      difficulty: bestCandidate.grade.difficulty,
      clueCount: bestCandidate.clueCount,
      symmetrical,
      highestTechnique: bestCandidate.grade.highestTechnique,
      solveSteps: bestCandidate.grade.solveSteps,
      grid: bestCandidate.grid,
      solution: bestCandidate.solution,
    };
  }
}

/**
 * Maps default target clue count per difficulty level.
 */
function getDefaultCluesForDifficulty(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case 'Easy':
      return 38;
    case 'Medium':
      return 32;
    case 'Hard':
      return 28;
    case 'Expert':
      return 24;
  }
}
