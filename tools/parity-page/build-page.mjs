#!/usr/bin/env node
// Builds the three-Stack parity evidence page (BACKLOG-075, DR-047) as one self-contained HTML file.
// Everything on the page is read at build time: each Stack's own results, the feature file, the three
// step-definition sources, and the output of the real gate run on copies of the results.
// The build fails if the gate fails on the real results, if a source or snippet is missing, or if the gate
// does NOT fail on any planted change (the negative check).
//   node tools/parity-page/build-page.mjs [--out <dir>]
// Environment: PARITY_RESULTS_DIR (default .results), PARITY_FEATURE, PARITY_PAGE_OUT (default parity-page-dist).
// CI metadata is taken from GITHUB_REPOSITORY, GITHUB_SHA and GITHUB_RUN_ID when present.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STACKS, featureExpectation, keyed } from './adapters.mjs';
import { FEATURE, gate, loadAll } from './check-parity.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../..');

/** The step shown in "One step, three languages", found by an anchor line in each step-definition source. */
const SNIPPETS = {
  ts: {
    path: 'demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/hiddenSingles.steps.ts',
    anchor: "'the {string} algorithm is executed for value {int}'",
    start: (i) => i - 1, // the When( line above the pattern
    end: (lines, i) => lines.findIndex((l, n) => n > i && l === ');'),
  },
  py: {
    path: 'demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py',
    anchor: '@when(parsers.parse(\'the "{algorithm}" algorithm is executed for value {value:d}\'))',
    start: (i) => i,
    end: (lines, i) => lines.findIndex((l, n) => n > i && l.trim() === '') - 1,
  },
  cs: {
    path: 'demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs',
    anchor: '[When(@"the ""([^""]*)"" algorithm is executed for value (\\d+)")]',
    start: (i) => i,
    end: (lines, i) => lines.findIndex((l, n) => n > i && l === '    }'),
  },
};

/** The one-word change planted by the negative check, and the scenario whose failure is planted. */
export const PLANTED = { scenario: 'Identify a Hidden Single in a row', find: 'new value', replace: 'updated value' };

export function extractSnippets(root = repoRoot) {
  const out = {};
  for (const [id, s] of Object.entries(SNIPPETS)) {
    const file = join(root, s.path);
    if (!existsSync(file)) throw new Error(`step-definition source missing: ${s.path}`);
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const i = lines.findIndex((l) => l.includes(s.anchor));
    if (i === -1) throw new Error(`snippet anchor not found in ${s.path}: ${s.anchor}`);
    const start = s.start(i);
    const end = s.end(lines, i);
    if (start < 0 || end < start) throw new Error(`could not bound the snippet in ${s.path}`);
    out[id] = { where: `${s.path}:${start + 1}-${end + 1}`, code: lines.slice(start, end + 1).join('\n') };
  }
  return out;
}

/** Sections come from the feature file's banner comments (`# ====` / `# Title` / `# ====`). */
export function featureSections(featurePath) {
  const sectionOf = new Map();
  const titles = [];
  let section = null;
  let inBanner = false;
  for (const raw of readFileSync(featurePath, 'utf8').split('\n')) {
    const l = raw.trim();
    if (l.startsWith('# =====')) { inBanner = !inBanner; continue; }
    if (inBanner && l.startsWith('#')) { section = l.replace(/^#\s*/, '').replace(/\s+Tests$/, '').trim(); titles.push(section); continue; }
    const m = l.match(/^(?:Scenario Outline|Scenario):\s*(.+)$/);
    if (m) {
      const name = m[1].trim();
      if (sectionOf.has(name) && sectionOf.get(name) !== section) throw new Error(`scenario name "${name}" appears in two sections`);
      sectionOf.set(name, section);
    }
  }
  return { sectionOf, titles };
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)];
const round1 = (n) => Math.round(n * 10) / 10;

/** Rows joined across the three Stacks by key. The gate has already proved the keys and order are identical. */
export function buildRows(loaded, sectionOf) {
  const byStack = Object.fromEntries(STACKS.map((s) => [s.id, keyed(loaded[s.id])]));
  return byStack.ts.map((t, i) => {
    const section = sectionOf.get(t.row.name);
    if (!section) throw new Error(`scenario "${t.row.name}" is not in any feature section`);
    return {
      name: t.row.name,
      n: t.index,
      section,
      steps: t.row.steps.map((s) => `${s.keyword} ${s.text}`.trim()),
      res: Object.fromEntries(STACKS.map((s) => [s.id, [byStack[s.id][i].row.status, round1(byStack[s.id][i].row.ms)]])),
    };
  });
}

export function buildTimings(loaded) {
  return Object.fromEntries(STACKS.map((s) => {
    const ms = loaded[s.id].map((r) => r.ms);
    const sorted = [...ms].sort((a, b) => a - b);
    return [s.id, { total: round1(ms.reduce((a, b) => a + b, 0)), p50: round1(quantile(sorted, 0.5)), p95: round1(quantile(sorted, 0.95)) }];
  }));
}

function runGate(root, feature, gateScript) {
  const r = spawnSync(process.execPath, [gateScript], { env: { ...process.env, PARITY_RESULTS_DIR: root, PARITY_FEATURE: feature }, encoding: 'utf8' });
  const lines = r.stdout.split('\n').filter((l) => l && !l.startsWith('parity gate:'));
  return { exit: r.status, lines };
}

function copyResults(root) {
  const dir = mkdtempSync(join(tmpdir(), 'parity-neg-'));
  for (const s of STACKS) {
    const to = join(dir, s.dir, s.file);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(join(root, s.dir, s.file), to);
  }
  return dir;
}

function edit(dir, id, fn) {
  const s = STACKS.find((x) => x.id === id);
  const path = join(dir, s.dir, s.file);
  writeFileSync(path, fn(readFileSync(path, 'utf8')));
}

const plantJsonFailure = (text) => {
  const data = JSON.parse(text);
  let done = false;
  for (const f of data) for (const e of f.elements) {
    if (e.name !== PLANTED.scenario || done) continue;
    e.steps.filter((x) => !x.hidden).at(-1).result.status = 'failed';
    done = true;
  }
  if (!done) throw new Error(`planted scenario not found: ${PLANTED.scenario}`);
  return JSON.stringify(data);
};

const plantMessagesFailure = (text) => {
  const messages = text.split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const pickle = messages.find((m) => m.pickle && m.pickle.name === PLANTED.scenario)?.pickle;
  if (!pickle) throw new Error(`planted scenario not found: ${PLANTED.scenario}`);
  const testCase = messages.find((m) => m.testCase && m.testCase.pickleId === pickle.id).testCase;
  const started = messages.find((m) => m.testCaseStarted && m.testCaseStarted.testCaseId === testCase.id).testCaseStarted;
  const hit = messages.find((m) => m.testStepFinished && m.testStepFinished.testCaseStartedId === started.id && m.testStepFinished.testStepResult.status === 'PASSED');
  hit.testStepFinished.testStepResult.status = 'FAILED';
  return `${messages.map((m) => JSON.stringify(m)).join('\n')}\n`;
};

/**
 * The negative check: run the REAL gate (as a child process) on the real results, then on copies carrying one
 * planted change each. Throws unless the clean run passes and every planted run fails for the intended reason.
 */
export function negativeChecks(root, feature, gateScript = join(here, 'check-parity.mjs')) {
  const cases = { clean: runGate(root, feature, gateScript) };
  if (cases.clean.exit !== 0) throw new Error(`the gate fails on the real results:\n${cases.clean.lines.join('\n')}`);
  const plans = {
    text: { id: 'py', expect: 'step text DIFFERS', fn: (t) => { if (!t.includes(PLANTED.find)) throw new Error(`planted text not found: ${PLANTED.find}`); return t.replace(PLANTED.find, PLANTED.replace); } },
    fail_ts: { id: 'ts', expect: 'TypeScript: 1 execution(s) not passed', fn: plantJsonFailure },
    fail_py: { id: 'py', expect: 'Python: 1 execution(s) not passed', fn: plantJsonFailure },
    fail_cs: { id: 'cs', expect: 'C#: 1 execution(s) not passed', fn: plantMessagesFailure },
  };
  for (const [name, plan] of Object.entries(plans)) {
    const dir = copyResults(root);
    try {
      edit(dir, plan.id, plan.fn);
      const run = runGate(dir, feature, gateScript);
      if (run.exit !== 1 || !run.lines.some((l) => l.includes(plan.expect))) {
        throw new Error(`negative check "${name}" FAILED: the gate did not fail as expected (exit ${run.exit}, wanted a line containing "${plan.expect}")\n${run.lines.join('\n')}`);
      }
      cases[name] = run;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  return cases;
}

const scriptSafe = (s) => s.replace(/<\/(script)/gi, '<\\/$1');

export function render(data, template = readFileSync(join(here, 'template.html'), 'utf8'), script = readFileSync(join(here, 'page.js'), 'utf8')) {
  if (!template.includes('/*__DATA__*/null') || !template.includes('/*__SCRIPT__*/')) throw new Error('template.html is missing its data or script placeholder');
  return template.replace('/*__DATA__*/null', () => scriptSafe(JSON.stringify(data))).replace('/*__SCRIPT__*/', () => scriptSafe(script));
}

export function build({ root, feature, out, env = process.env }) {
  const expected = featureExpectation(feature);
  const { loaded, problems } = loadAll(root);
  const result = gate(loaded, expected, problems);
  if (!result.ok) throw new Error(`cannot build the page from results that fail the gate:\n${result.lines.join('\n')}`);
  const { sectionOf, titles } = featureSections(feature);
  const rows = buildRows(loaded, sectionOf);
  const sections = titles.filter((t) => rows.some((r) => r.section === t));
  const planted = rows.find((r) => r.name === PLANTED.scenario);
  if (!planted) throw new Error(`planted scenario not found in the results: ${PLANTED.scenario}`);
  const plantedStep = planted.steps.at(-1);
  if (!plantedStep.includes(PLANTED.find)) throw new Error(`planted step does not contain "${PLANTED.find}": ${plantedStep}`);
  const data = {
    meta: {
      repo: env.GITHUB_REPOSITORY ?? 'GBrooks1970/gb.automation.smoketests.sudoku.poc',
      sha: env.GITHUB_SHA ?? null,
      runId: env.GITHUB_RUN_ID ?? null,
      generated: `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    },
    sections,
    rows,
    timings: buildTimings(loaded),
    impl: extractSnippets(),
    cases: negativeChecks(root, feature),
    planted_step: { scenario: PLANTED.scenario, before: plantedStep, after: plantedStep.replace(PLANTED.find, PLANTED.replace) },
  };
  const html = render(data);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'index.html'), html);
  return { data, html, file: join(out, 'index.html') };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const flag = process.argv.indexOf('--out');
  const out = flag > -1 ? process.argv[flag + 1] : process.env.PARITY_PAGE_OUT ?? join(repoRoot, 'parity-page-dist');
  const root = process.env.PARITY_RESULTS_DIR ?? join(repoRoot, '.results');
  const feature = process.env.PARITY_FEATURE ?? join(repoRoot, FEATURE);
  try {
    const { data, file } = build({ root, feature, out });
    console.log(`parity page built: ${file}`);
    console.log(`${data.rows.length} scenarios, ${data.sections.length} sections, gate and ${Object.keys(data.cases).length - 1} negative checks ran`);
  } catch (error) {
    console.error(`parity page NOT built: ${error.message}`);
    process.exit(1);
  }
}
