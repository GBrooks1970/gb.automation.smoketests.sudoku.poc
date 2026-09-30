import * as assert from 'node:assert/strict';
import { test, TestContext } from 'node:test';
import { DifficultyLevel, gradePuzzle } from '../../app_src/generator/difficulty-grader';
import { SudokuTutorService } from '../../app_src/server/SudokuTutorService';
import { TutorHintResponse } from '../../app_src/server/types';
import { TechniqueName } from '../../app_src/techniques';

// Independent DR-043 expectations: these seam tests isolate classification, not solver behaviour.
const EXPECTED_GRADES = {
  UnitCompletion: { difficulty: 'Easy', highestTechnique: 'UnitCompletion' },
  HiddenSingles: { difficulty: 'Easy', highestTechnique: 'HiddenSingles' },
  NakedSingles: { difficulty: 'Medium', highestTechnique: 'NakedSingles' },
  NakedPairs: { difficulty: 'Hard', highestTechnique: 'NakedPairs' },
  XWing: { difficulty: 'Expert', highestTechnique: 'X-Wing' },
} satisfies Record<TechniqueName, { difficulty: DifficultyLevel; highestTechnique: string }>;

function stubHintSequence(context: TestContext, techniques: TechniqueName[]): void {
  let index = 0;
  context.mock.method(SudokuTutorService.prototype, 'getHint', (): TutorHintResponse => {
    const technique = techniques[index++];
    return {
      success: true,
      status: technique ? 'HINT_AVAILABLE' : 'SOLVED',
      technique: technique ?? 'None',
      move: technique ? { cell: { row: 0, col: index - 1 }, digit: index, previousValue: 0 } : null,
      eliminations: [],
      rationale: 'Controlled classification seam; not a real solving move.',
      highlightCells: [],
    };
  });
}

for (const technique of Object.keys(EXPECTED_GRADES) as TechniqueName[]) {
  test(`classification seam: ${technique} has its exact DR-043 grade and output label`, (context) => {
    stubHintSequence(context, [technique]);
    const grid = Array.from({ length: 9 }, () => Array<number>(9).fill(0));

    assert.deepEqual(gradePuzzle(grid), {
      ...EXPECTED_GRADES[technique],
      solveSteps: 1,
      isSolvable: true,
      usedTechniques: [technique],
    });
    assert.ok(grid.every((row) => row.every((value) => value === 0)));
  });
}

test('classification seam: the highest technique wins regardless of encounter order', (context) => {
  stubHintSequence(context, [
    'XWing',
    'NakedPairs',
    'NakedSingles',
    'HiddenSingles',
    'UnitCompletion',
    'XWing',
  ]);

  assert.deepEqual(gradePuzzle(Array.from({ length: 9 }, () => Array<number>(9).fill(0))), {
    difficulty: 'Expert',
    highestTechnique: 'X-Wing',
    solveSteps: 6,
    isSolvable: true,
    usedTechniques: ['XWing', 'NakedPairs', 'NakedSingles', 'HiddenSingles', 'UnitCompletion'],
  });
});

test('classification seam: None is a terminal outcome, never a supported solving technique', (context) => {
  context.mock.method(SudokuTutorService.prototype, 'getHint', (): TutorHintResponse => ({
    success: true,
    status: 'STUCK_ON_ADVANCED_LOGIC',
    technique: 'None',
    move: null,
    eliminations: [],
    rationale: 'Controlled stuck outcome.',
    highlightCells: [],
  }));

  assert.deepEqual(gradePuzzle(Array.from({ length: 9 }, () => Array<number>(9).fill(0))), {
    difficulty: 'Expert',
    highestTechnique: 'AdvancedTechniquesRequired',
    solveSteps: 0,
    isSolvable: false,
    usedTechniques: [],
  });
});
