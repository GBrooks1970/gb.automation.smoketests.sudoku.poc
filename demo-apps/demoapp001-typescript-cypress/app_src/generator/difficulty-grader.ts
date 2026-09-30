import { SudokuTutorService } from '../server/SudokuTutorService';
import { Technique, TechniqueName } from '../techniques';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type HighestTechnique =
  Exclude<TechniqueName, 'XWing'> | 'X-Wing' | 'AdvancedTechniquesRequired';

// DR-043 tiers. XWing remains the API/tutor token; X-Wing remains the generator's display label.
const TECHNIQUE_GRADES = {
  [Technique.UnitCompletion]: {
    difficulty: 'Easy',
    highestTechnique: 'UnitCompletion',
    rank: 0,
  },
  [Technique.HiddenSingles]: {
    difficulty: 'Easy',
    highestTechnique: 'HiddenSingles',
    rank: 1,
  },
  [Technique.NakedSingles]: {
    difficulty: 'Medium',
    highestTechnique: 'NakedSingles',
    rank: 2,
  },
  [Technique.NakedPairs]: {
    difficulty: 'Hard',
    highestTechnique: 'NakedPairs',
    rank: 3,
  },
  [Technique.XWing]: { difficulty: 'Expert', highestTechnique: 'X-Wing', rank: 4 },
} satisfies Record<
  TechniqueName,
  { difficulty: DifficultyLevel; highestTechnique: HighestTechnique; rank: number }
>;

export interface DifficultyGradeResult {
  difficulty: DifficultyLevel;
  highestTechnique: HighestTechnique;
  solveSteps: number;
  isSolvable: boolean;
  usedTechniques: TechniqueName[];
}

/**
 * Technique-Based Difficulty Grader for Sudoku Puzzles.
 *
 * Grades a Sudoku puzzle based on the minimum solving technique required to reach a complete solution,
 * consistent with the existing puzzles.json difficulty field and DR-043 design.
 */
export function gradePuzzle(grid: number[][]): DifficultyGradeResult {
  const tutorService = new SudokuTutorService();
  const board = grid.map((row) => [...row]);

  const usedTechniques: TechniqueName[] = [];
  let solveSteps = 0;
  let isSolvable = false;
  let stepLimit = 81;

  while (stepLimit > 0) {
    stepLimit--;
    const hint = tutorService.getHint(board);

    if (hint.status === 'SOLVED') {
      isSolvable = true;
      break;
    }

    if (hint.status !== 'HINT_AVAILABLE' || !hint.move || hint.technique === 'None') {
      break;
    }

    if (!usedTechniques.includes(hint.technique)) {
      usedTechniques.push(hint.technique);
    }

    board[hint.move.cell.row][hint.move.cell.col] = hint.move.digit;
    solveSteps++;
  }

  const { difficulty, highestTechnique } = classifyDifficulty(usedTechniques, isSolvable);

  return {
    difficulty,
    highestTechnique,
    solveSteps,
    isSolvable,
    usedTechniques,
  };
}

/**
 * Classifies the difficulty level based on the highest technique tier used.
 */
function classifyDifficulty(
  usedTechniques: TechniqueName[],
  isSolvable: boolean
): { difficulty: DifficultyLevel; highestTechnique: HighestTechnique } {
  if (!isSolvable) {
    return { difficulty: 'Expert', highestTechnique: 'AdvancedTechniquesRequired' };
  }

  let highestGrade: (typeof TECHNIQUE_GRADES)[TechniqueName] =
    TECHNIQUE_GRADES[Technique.UnitCompletion];
  for (const technique of usedTechniques) {
    const grade = TECHNIQUE_GRADES[technique];
    if (grade.rank > highestGrade.rank) {
      highestGrade = grade;
    }
  }

  return { difficulty: highestGrade.difficulty, highestTechnique: highestGrade.highestTechnique };
}
