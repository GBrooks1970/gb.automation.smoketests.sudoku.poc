import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

interface Mutation {
  readonly id: string;
  readonly description: string;
  readonly target: string;
  readonly test: string;
  readonly mutate: (source: string) => string;
}

const stackRoot = path.resolve(__dirname, '../..');
const orchestrationTarget = 'app_src/SudokuOrchestrator.ts';
const loaderTarget = 'app_src/PuzzleLoader.ts';
const orchestrationTest = 'tests/component/orchestration.contract.test.ts';
const loaderTest = 'tests/component/puzzle-loader.contract.test.ts';

const unitCompletionBlock = `      // Step 1: Unit Completion (simplest technique - O(n) per unit)
      // Fills cells in rows/columns/blocks that have only one empty cell
      if (this.runAttempt(iteration, 'UnitCompletion', () => this.solver.unitCompletion())) {
        changedThisPass = true;
      }

`;

const hiddenSinglesBlock = `      // Step 2: Hidden Singles (medium complexity - scan per digit)
      // For each digit 1-9, find units where that digit can only go in one place
      for (let digit = 1; digit <= GRID_SIZE; digit++) {
        if (
          this.runAttempt(iteration, 'HiddenSingles', () => this.solver.hiddenSingles(digit), digit)
        ) {
          changedThisPass = true;
        }
      }

`;

const nakedSinglesBlock = `      // Step 3: Naked Singles (most complex - O(n²) cell examination)
      // Find cells that can only contain one digit after eliminating all "seen" values
      if (this.runAttempt(iteration, 'NakedSingles', () => this.solver.nakedSingles())) {
        changedThisPass = true;
      }

`;

const mutations: readonly Mutation[] = [
  removalMutation('ORCH-REMOVE-UNIT', 'remove Unit Completion attempt', unitCompletionBlock),
  removalMutation('ORCH-REMOVE-HIDDEN', 'remove Hidden Singles attempts', hiddenSinglesBlock),
  removalMutation('ORCH-REMOVE-NAKED', 'remove Naked Singles attempt', nakedSinglesBlock),
  reorderMutation(
    'ORCH-REORDER-UNIT',
    'move Unit Completion after Hidden Singles',
    unitCompletionBlock,
    hiddenSinglesBlock
  ),
  reorderMutation(
    'ORCH-REORDER-HIDDEN',
    'move Hidden Singles after Naked Singles',
    hiddenSinglesBlock,
    nakedSinglesBlock
  ),
  {
    id: 'ORCH-REORDER-NAKED',
    description: 'move Naked Singles before Unit Completion',
    target: orchestrationTarget,
    test: orchestrationTest,
    mutate: (source) =>
      replaceOnce(
        source,
        `${unitCompletionBlock}${hiddenSinglesBlock}${nakedSinglesBlock}`,
        `${nakedSinglesBlock}${unitCompletionBlock}${hiddenSinglesBlock}`
      ),
  },
  {
    id: 'LOADER-ALLOW-NON-INTEGER',
    description: 'accept non-integer numeric cells',
    target: loaderTarget,
    test: loaderTest,
    mutate: (source) => replaceOnce(source, '!Number.isInteger(cell)', "typeof cell !== 'number'"),
  },
  {
    id: 'LOADER-ALLOW-ABOVE-MAX',
    description: 'accept cells above the maximum digit',
    target: loaderTarget,
    test: loaderTest,
    mutate: (source) => replaceOnce(source, ' || cell > MAX_DIGIT', ''),
  },
  {
    id: 'LOADER-SKIP-ROW-COUNT',
    description: 'skip the exact row-count guard',
    target: loaderTarget,
    test: loaderTest,
    mutate: (source) =>
      replaceOnce(
        source,
        `      if (!puzzle.grid || puzzle.grid.length !== GRID_SIZE) {
        throw new Error(\`Puzzle "\${puzzle.name}" (index \${index}) must have exactly 9 rows\`);
      }

`,
        ''
      ),
  },
  {
    id: 'LOADER-SKIP-COLUMN-COUNT',
    description: 'skip the exact column-count guard',
    target: loaderTarget,
    test: loaderTest,
    mutate: (source) =>
      replaceOnce(
        source,
        `        if (row.length !== GRID_SIZE) {
          throw new Error(\`Puzzle "\${puzzle.name}" row \${rowIndex} must have exactly 9 columns\`);
        }

`,
        ''
      ),
  },
];

function removalMutation(id: string, description: string, block: string): Mutation {
  return {
    id,
    description,
    target: orchestrationTarget,
    test: orchestrationTest,
    mutate: (source) => replaceOnce(source, block, ''),
  };
}

function reorderMutation(
  id: string,
  description: string,
  firstBlock: string,
  secondBlock: string
): Mutation {
  return {
    id,
    description,
    target: orchestrationTarget,
    test: orchestrationTest,
    mutate: (source) =>
      replaceOnce(source, `${firstBlock}${secondBlock}`, `${secondBlock}${firstBlock}`),
  };
}

function replaceOnce(source: string, expected: string, replacement: string): string {
  const firstIndex = source.indexOf(expected);
  if (firstIndex < 0 || source.indexOf(expected, firstIndex + expected.length) >= 0) {
    throw new Error('Mutation anchor must occur exactly once');
  }
  return `${source.slice(0, firstIndex)}${replacement}${source.slice(firstIndex + expected.length)}`;
}

function runFocusedTest(cwd: string, testFile: string): ReturnType<typeof spawnSync> {
  return spawnSync(process.execPath, ['--test', '-r', 'ts-node/register', testFile], {
    cwd,
    encoding: 'utf-8',
  });
}

for (const testFile of [orchestrationTest, loaderTest]) {
  const baseline = runFocusedTest(stackRoot, testFile);
  if (baseline.status !== 0) {
    process.stderr.write(baseline.stdout ?? '');
    process.stderr.write(baseline.stderr ?? '');
    throw new Error(`Focused baseline failed before mutation: ${testFile}`);
  }
}

let killed = 0;
const survivors: Mutation[] = [];

for (const mutation of mutations) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'sudoku-mutation-trial-'));
  try {
    fs.cpSync(stackRoot, sandbox, {
      recursive: true,
      filter: (source) =>
        !['node_modules', 'dist', 'dist-cucumber', '.results'].includes(path.basename(source)),
    });
    fs.symlinkSync(
      path.join(stackRoot, 'node_modules'),
      path.join(sandbox, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir'
    );

    const targetPath = path.join(sandbox, mutation.target);
    const original = fs.readFileSync(targetPath, 'utf-8');
    fs.writeFileSync(targetPath, mutation.mutate(original), 'utf-8');

    const result = runFocusedTest(sandbox, mutation.test);
    if (result.status === 0) {
      survivors.push(mutation);
      process.stdout.write(`SURVIVED ${mutation.id}: ${mutation.description}\n`);
    } else {
      killed += 1;
      process.stdout.write(`KILLED   ${mutation.id}: ${mutation.description}\n`);
    }
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
}

process.stdout.write(`Mutation trial: ${killed}/${mutations.length} killed\n`);
if (survivors.length > 0) {
  process.stderr.write(`Material survivors: ${survivors.map(({ id }) => id).join(', ')}\n`);
  process.exitCode = 1;
}
