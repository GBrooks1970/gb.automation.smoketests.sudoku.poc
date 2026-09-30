// Regenerates tests/fixtures from REAL result files, keeping a few scenarios (including outlines whose rows
// share a name). Fixtures are trimmed, never written by hand.
//   node tools/parity-page/tests/make-fixtures.mjs <results-root> [<feature-file>]
// where <results-root> holds demoapp001/test-results/cucumber.json, demoapp002/test-results/pytest-cucumber.json
// and demoapp003/test-results/reqnroll.ndjson, as produced by CI evidence.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STACKS } from '../adapters.mjs';
import { KEEP } from './keep.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'fixtures');
const src = process.argv[2];
if (!src) throw new Error('usage: node make-fixtures.mjs <results-root> [<feature-file>]');
const featureSrc = process.argv[3] ?? join(here, '../../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature');

// Trimmed feature: the header and Background, the section banners that still have a kept scenario, and the kept scenarios.
{
  const lines = readFileSync(featureSrc, 'utf8').split(/\r?\n/);
  const isBanner = (l) => l.trim().startsWith('# =====');
  const isScenario = (l) => /^\s*Scenario( Outline)?:/.test(l);
  const first = lines.findIndex((l) => isBanner(l) || isScenario(l));
  const kept = [...lines.slice(0, first)];
  let i = first;
  let pendingBanner = [];
  while (i < lines.length) {
    if (isBanner(lines[i])) {
      pendingBanner = lines.slice(i, i + 3);
      i += 3;
      continue;
    }
    if (isScenario(lines[i])) {
      let j = i + 1;
      while (j < lines.length && !isScenario(lines[j]) && !isBanner(lines[j])) j += 1;
      const name = lines[i].replace(/^\s*Scenario( Outline)?:\s*/, '').trim();
      if (KEEP.includes(name)) {
        if (pendingBanner.length) {
          kept.push(...pendingBanner, '');
          pendingBanner = [];
        }
        kept.push(...lines.slice(i, j));
      }
      i = j;
      continue;
    }
    i += 1;
  }
  const to = join(out, 'features', 'BasicSudokuSolverLogic.feature');
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, `${kept.join('\n').replace(/\s+$/, '')}\n`);
}

for (const stack of STACKS) {
  const from = join(src, stack.dir, stack.file);
  const to = join(out, stack.dir, stack.file);
  mkdirSync(dirname(to), { recursive: true });
  if (stack.format === 'cucumber-json') {
    const features = JSON.parse(readFileSync(from, 'utf8'));
    for (const f of features) f.elements = f.elements.filter((e) => e.type === 'background' || KEEP.includes(e.name));
    writeFileSync(to, `${JSON.stringify(features, null, 1)}\n`);
  } else {
    const all = readFileSync(from, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const pickleIds = new Set(all.filter((m) => m.pickle && KEEP.includes(m.pickle.name)).map((m) => m.pickle.id));
    const caseIds = new Set(all.filter((m) => m.testCase && pickleIds.has(m.testCase.pickleId)).map((m) => m.testCase.id));
    const startedIds = new Set(all.filter((m) => m.testCaseStarted && caseIds.has(m.testCaseStarted.testCaseId)).map((m) => m.testCaseStarted.id));
    const keep = all.filter((m) => {
      if (m.meta || m.testRunStarted || m.testRunFinished || m.hook) return true;
      if (m.pickle) return pickleIds.has(m.pickle.id);
      if (m.testCase) return caseIds.has(m.testCase.id);
      if (m.testCaseStarted) return startedIds.has(m.testCaseStarted.id);
      if (m.testStepStarted) return startedIds.has(m.testStepStarted.testCaseStartedId);
      if (m.testStepFinished) return startedIds.has(m.testStepFinished.testCaseStartedId);
      if (m.testCaseFinished) return startedIds.has(m.testCaseFinished.testCaseStartedId);
      return false; // source, gherkinDocument and stepDefinition are not read by the adapters
    });
    writeFileSync(to, `${keep.map((m) => JSON.stringify(m)).join('\n')}\n`);
  }
}
console.log(`fixtures written to ${out}`);
