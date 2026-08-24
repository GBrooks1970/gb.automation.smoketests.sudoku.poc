import { SudokuTutorService } from '../server/SudokuTutorService';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface DifficultyGradeResult {
  difficulty: DifficultyLevel;
  highestTechnique: string;
  solveSteps: number;
  isSolvable: boolean;
  usedTechniques: string[];
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

  const usedTechniques: string[] = [];
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

    if (hint.status !== 'HINT_AVAILABLE' || !hint.move || !hint.technique) {
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
  usedTechniques: string[],
  isSolvable: boolean
): { difficulty: DifficultyLevel; highestTechnique: string } {
  if (!isSolvable) {
    return { difficulty: 'Expert', highestTechnique: 'AdvancedTechniquesRequired' };
  }

  if (usedTechniques.includes('X-Wing')) {
    return { difficulty: 'Expert', highestTechnique: 'X-Wing' };
  }
  if (usedTechniques.includes('NakedPairs')) {
    return { difficulty: 'Hard', highestTechnique: 'NakedPairs' };
  }
  if (usedTechniques.includes('HiddenSingles')) {
    return { difficulty: 'Medium', highestTechnique: 'HiddenSingles' };
  }
  if (usedTechniques.includes('NakedSingles')) {
    return { difficulty: 'Easy', highestTechnique: 'NakedSingles' };
  }
  if (usedTechniques.includes('UnitCompletion')) {
    return { difficulty: 'Easy', highestTechnique: 'UnitCompletion' };
  }

  return { difficulty: 'Easy', highestTechnique: 'UnitCompletion' };
}
