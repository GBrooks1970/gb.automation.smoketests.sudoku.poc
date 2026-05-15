import { SudokuSolver } from './SudokuSolver';
import { SudokuCLI } from './SudokuCLI';
import { PuzzleLoader } from './PuzzleLoader';

/**
 * Main entry point for the Sudoku Solver CLI application.
 * Loads puzzles from puzzles.json and solves them using the basic algorithm.
 */

type CliOptions = {
  showHelp: boolean;
  timeoutMs?: number;
};

function printHelp(): void {
  console.log('Sudoku Solver CLI');
  console.log('');
  console.log('Usage: npm start -- [options]');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help             Show this help and exit');
  console.log('  --timeout <ms>         Stop with non-zero exit if runtime exceeds <ms>');
  console.log('  --timeout=<ms>         Same as above, equals-sign format');
  console.log('');
  console.log('Exit codes:');
  console.log('  0  All puzzles solved (SOLVED)');
  console.log('  1  At least one puzzle stuck, timeout reached, or runtime/config error');
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { showHelp: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.showHelp = true;
      continue;
    }

    if (arg === '--timeout') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --timeout');
      }
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('--timeout must be a positive integer in milliseconds');
      }
      options.timeoutMs = parsed;
      i += 1;
      continue;
    }

    if (arg.startsWith('--timeout=')) {
      const value = arg.split('=')[1];
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('--timeout must be a positive integer in milliseconds');
      }
      options.timeoutMs = parsed;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function enforceTimeout(startedAtMs: number, timeoutMs?: number): void {
  if (timeoutMs === undefined) {
    return;
  }

  const elapsed = Date.now() - startedAtMs;
  if (elapsed > timeoutMs) {
    throw new Error(`Execution exceeded timeout of ${timeoutMs}ms`);
  }
}

function run(): number {
  const options = parseArgs(process.argv.slice(2));
  if (options.showHelp) {
    printHelp();
    return 0;
  }

  // Load puzzles from JSON file
  const loader = new PuzzleLoader('../puzzles.json');
  const startedAtMs = Date.now();
  let foundStuckPuzzle = false;

  console.log('\n===========================================');
  console.log('    SUDOKU SOLVER - Basic Algorithm Demo');
  console.log('===========================================');
  console.log(`\nLoaded ${loader.getPuzzleCount()} puzzles from puzzles.json`);
  console.log('Available puzzles:', loader.listPuzzleNames().join(', '));
  if (options.timeoutMs !== undefined) {
    console.log(`Timeout: ${options.timeoutMs}ms`);
  }
  console.log('\n===========================================\n');

  // Option 1: Solve all puzzles
  console.log('>>> Solving ALL puzzles...\n');
  const allPuzzles = loader.getAllPuzzles();
  for (const puzzle of allPuzzles) {
    enforceTimeout(startedAtMs, options.timeoutMs);

    const solver = new SudokuSolver(puzzle.name, puzzle.grid);
    const app = new SudokuCLI(solver);
    console.log(`\n[${puzzle.difficulty.toUpperCase()}] ${puzzle.description}`);
    const status = app.run();
    if (status !== 'SOLVED') {
      foundStuckPuzzle = true;
    }

    enforceTimeout(startedAtMs, options.timeoutMs);
  }

  // Exit contract: 0 when all solved, non-zero when any puzzle is stuck.
  return foundStuckPuzzle ? 1 : 0;
}

try {
  process.exit(run());
} catch (error) {
  console.error('Error loading or solving puzzles:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
