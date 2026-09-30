import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DifficultyLevel,
  GENERATOR_MAX_ATTEMPTS,
  GeneratorExhaustedError,
  gradePuzzle,
  isValidPartialGrid,
  isValidSolution,
  PuzzleGeneratorService,
  UniquenessOracle,
} from '../../app_src/generator';
import * as difficultyGrader from '../../app_src/generator/difficulty-grader';
import * as solutionConstruction from '../../app_src/generator/solution-construction';

// Real seeded pipeline fixtures; no classification or construction stubs.
const TARGET_FIXTURES: {
  difficulty: DifficultyLevel;
  seed: string;
  clueCount: number;
  highestTechnique: string;
}[] = [
  {
    difficulty: 'Easy',
    seed: 'tier-regression-0',
    clueCount: 38,
    highestTechnique: 'HiddenSingles',
  },
  {
    difficulty: 'Medium',
    seed: 'tier-regression-14',
    clueCount: 32,
    highestTechnique: 'NakedSingles',
  },
  {
    difficulty: 'Hard',
    seed: 'tier-regression-65',
    clueCount: 28,
    highestTechnique: 'NakedPairs',
  },
  {
    difficulty: 'Expert',
    seed: 'xwing-regression-242',
    clueCount: 24,
    highestTechnique: 'X-Wing',
  },
];

for (const fixture of TARGET_FIXTURES) {
  test(`real generation returns a unique, solvable exact ${fixture.difficulty} target`, () => {
    const service = new PuzzleGeneratorService();
    const options = { difficulty: fixture.difficulty, seed: fixture.seed, symmetrical: false };
    const puzzle = service.generatePuzzle(options);

    assert.equal(puzzle.difficulty, fixture.difficulty);
    assert.equal(puzzle.highestTechnique, fixture.highestTechnique);
    assert.equal(puzzle.seed, fixture.seed);
    assert.equal(puzzle.clueCount, fixture.clueCount);
    assert.equal(isValidPartialGrid(puzzle.grid), true);
    assert.equal(isValidSolution(puzzle.solution), true);
    assert.equal(UniquenessOracle.countSolutions(puzzle.grid, 2), 1);
    const grade = gradePuzzle(puzzle.grid);
    assert.equal(grade.isSolvable, true);
    assert.equal(grade.difficulty, fixture.difficulty);
    assert.equal(grade.highestTechnique, fixture.highestTechnique);
    assert.deepEqual(service.generatePuzzle(options), puzzle, 'the seeded target must repeat');
  });
}

test('real generation exhausts an impossible Expert target instead of returning an Easy grid', () => {
  assert.equal(GENERATOR_MAX_ATTEMPTS, 5);
  const service = new PuzzleGeneratorService();

  assert.throws(
    () => service.generatePuzzle({ difficulty: 'Expert', clueCount: 81, seed: 'review-proof' }),
    (error: unknown) => {
      assert.ok(error instanceof GeneratorExhaustedError);
      assert.equal(error.name, 'GeneratorExhaustedError');
      assert.equal(error.seed, 'review-proof');
      assert.equal(error.targetDifficulty, 'Expert');
      assert.equal(error.attempts, 5);
      return true;
    }
  );
});

test('real generation exhausts smaller bounds and succeeds on the fourth exact-target attempt', () => {
  const service = new PuzzleGeneratorService();
  const options = { difficulty: 'Hard' as const, seed: 'tier-retry-9', symmetrical: false };

  for (const maxAttempts of [1, 3]) {
    assert.throws(
      () => service.generatePuzzle({ ...options, maxAttempts }),
      (error: unknown) => {
        assert.ok(error instanceof GeneratorExhaustedError);
        assert.equal(error.seed, options.seed);
        assert.equal(error.targetDifficulty, 'Hard');
        assert.equal(error.attempts, maxAttempts);
        return true;
      }
    );
  }

  const puzzle = service.generatePuzzle({ ...options, maxAttempts: 4 });
  assert.equal(puzzle.seed, 'tier-retry-9-3');
  assert.equal(puzzle.difficulty, 'Hard');
  assert.equal(puzzle.highestTechnique, 'NakedPairs');
  assert.equal(gradePuzzle(puzzle.grid).isSolvable, true);
  assert.equal(UniquenessOracle.countSolutions(puzzle.grid, 2), 1);
  assert.deepEqual(service.generatePuzzle({ ...options, maxAttempts: 4 }), puzzle);
});

test('real untargeted generation skips an unsolvable initial candidate', () => {
  const service = new PuzzleGeneratorService();
  const options = { seed: 'api-test-123', symmetrical: false, clueCount: 32 };

  assert.throws(
    () => service.generatePuzzle({ ...options, maxAttempts: 1 }),
    (error: unknown) => {
      assert.ok(error instanceof GeneratorExhaustedError);
      assert.equal(error.targetDifficulty, undefined);
      assert.equal(error.attempts, 1);
      return true;
    }
  );

  const puzzle = service.generatePuzzle({ ...options, maxAttempts: 2 });
  assert.equal(puzzle.seed, 'api-test-123-1');
  assert.equal(gradePuzzle(puzzle.grid).isSolvable, true);
  assert.equal(UniquenessOracle.countSolutions(puzzle.grid, 2), 1);
});

test('grading seam: Expert labels without a deterministic solution exhaust all governed attempts', (context) => {
  // Controlled policy seam, not evidence of native solver or generator behaviour.
  const grading = context.mock.method(difficultyGrader, 'gradePuzzle', () => ({
    difficulty: 'Expert' as const,
    highestTechnique: 'AdvancedTechniquesRequired' as const,
    solveSteps: 0,
    isSolvable: false,
    usedTechniques: [],
  }));
  const service = new PuzzleGeneratorService();

  for (const difficulty of [undefined, 'Expert'] as const) {
    assert.throws(
      () => service.generatePuzzle({ difficulty, clueCount: 81, seed: 'controlled-unsolvable' }),
      (error: unknown) => {
        assert.ok(error instanceof GeneratorExhaustedError);
        assert.equal(error.seed, 'controlled-unsolvable');
        assert.equal(error.targetDifficulty, difficulty);
        assert.equal(error.attempts, 5);
        return true;
      }
    );
  }

  assert.equal(grading.mock.callCount(), 10);
});

test('attempt-policy seam: invalid retry bounds fail before complete-solution construction', (context) => {
  const construction = context.mock.method(
    solutionConstruction,
    'generateCompleteSolution',
    (): never => {
      throw new Error('construction must not run for invalid bounds');
    }
  );
  const service = new PuzzleGeneratorService();

  for (const maxAttempts of [0, -1, 1.5, 6, NaN, Infinity]) {
    assert.throws(
      () => service.generatePuzzle({ seed: 'invalid-bounds', maxAttempts }),
      RangeError
    );
  }

  assert.equal(construction.mock.callCount(), 0);
});
