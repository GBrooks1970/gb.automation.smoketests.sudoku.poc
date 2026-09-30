import { reduceToClues } from './clue-removal';
import { DifficultyGradeResult, DifficultyLevel, gradePuzzle } from './difficulty-grader';
import { generateCompleteSolution } from './solution-construction';

/** DR-043's maximum number of complete generation attempts per request. */
export const GENERATOR_MAX_ATTEMPTS = 5;

export class GeneratorExhaustedError extends Error {
  constructor(
    public readonly seed: string,
    public readonly targetDifficulty: DifficultyLevel | undefined,
    public readonly attempts: number
  ) {
    super(
      `Could not generate a solvable ${targetDifficulty ? `${targetDifficulty} ` : ''}Sudoku puzzle within ${attempts} attempts for seed '${seed}'.`
    );
    this.name = 'GeneratorExhaustedError';
  }
}

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
  highestTechnique: DifficultyGradeResult['highestTechnique'];
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
    const maxAttempts = options.maxAttempts ?? GENERATOR_MAX_ATTEMPTS;
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > GENERATOR_MAX_ATTEMPTS) {
      throw new RangeError(
        `maxAttempts must be an integer between 1 and ${GENERATOR_MAX_ATTEMPTS}.`
      );
    }

    let targetClues = options.clueCount;
    if (targetClues === undefined) {
      targetClues = targetDifficulty ? getDefaultCluesForDifficulty(targetDifficulty) : 32;
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const currentSeed = attempt === 0 ? baseSeed : `${baseSeed}-${attempt}`;
      const solution = generateCompleteSolution(currentSeed);
      const reduced = reduceToClues(solution, targetClues, currentSeed, symmetrical);
      const grade = gradePuzzle(reduced.grid);

      if (grade.isSolvable && (!targetDifficulty || grade.difficulty === targetDifficulty)) {
        return {
          seed: currentSeed,
          difficulty: grade.difficulty,
          clueCount: reduced.clueCount,
          symmetrical,
          highestTechnique: grade.highestTechnique,
          solveSteps: grade.solveSteps,
          grid: reduced.grid,
          solution,
        };
      }
    }

    throw new GeneratorExhaustedError(baseSeed, targetDifficulty, maxAttempts);
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
