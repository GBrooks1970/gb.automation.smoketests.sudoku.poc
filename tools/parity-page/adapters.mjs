// Result adapters for the three-Stack parity gate (BACKLOG-075, DR-047).
// Each Stack's own results are read into one shape: one row per scenario execution, in FEATURE order,
// with the steps that appear in the feature and the worst status of the execution.
//   TypeScript  Cucumber JSON      (cucumber-js `json:` formatter)
//   Python      Cucumber JSON      (pytest-bdd `--cucumberjson`)
//   C#          Cucumber Messages  (Reqnroll `message` formatter, ndjson)
// Nothing here is typed by hand: every figure is read from a results file or the feature file.
import { readFileSync } from 'node:fs';

/** Stack ids, labels and where each Stack's result file sits under the evidence root. */
export const STACKS = [
  { id: 'ts', label: 'TypeScript', dir: 'demoapp001', file: 'test-results/cucumber.json', format: 'cucumber-json' },
  { id: 'py', label: 'Python', dir: 'demoapp002', file: 'test-results/pytest-cucumber.json', format: 'cucumber-json' },
  { id: 'cs', label: 'C#', dir: 'demoapp003', file: 'test-results/reqnroll.ndjson', format: 'messages' },
];

// Worst status wins. UNKNOWN is last so a missing result can never look like a pass.
const RANK = { PASSED: 0, SKIPPED: 1, PENDING: 2, UNDEFINED: 3, AMBIGUOUS: 4, FAILED: 5, UNKNOWN: 6 };
export const worst = (statuses) => {
  if (!statuses.length) return 'UNKNOWN';
  return statuses.reduce((a, b) => ((RANK[b] ?? RANK.UNKNOWN) > (RANK[a] ?? RANK.UNKNOWN) ? b : a));
};

const millis = (d) => (typeof d === 'number' ? d / 1e6 : d ? d.seconds * 1000 + d.nanos / 1e6 : 0);

/** Cucumber JSON. Hidden hook steps are ignored for step text but still count towards the status. */
export function loadCucumberJson(path) {
  const features = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(features)) throw new Error(`${path}: expected a Cucumber JSON array`);
  const rows = [];
  for (const feature of features) {
    for (const element of feature.elements ?? []) {
      if (element.type === 'background') continue;
      const all = element.steps ?? [];
      const visible = all.filter((s) => !s.hidden);
      rows.push({
        name: element.name,
        steps: visible.map((s) => ({ keyword: String(s.keyword ?? '').trim(), text: s.name })),
        status: worst(all.map((s) => String(s.result?.status ?? 'unknown').toUpperCase())),
        ms: all.reduce((n, s) => n + millis(s.result?.duration), 0),
      });
    }
  }
  return rows;
}

/**
 * Cucumber Messages. Rows follow the order of the `pickle` messages, which is feature order.
 * The order of `testCaseStarted` is execution order, and NUnit runs Reqnroll scenarios alphabetically,
 * so walking it would fail a healthy run (see the BACKLOG-075 implementation logs).
 */
export function loadMessages(path) {
  const messages = readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  if (!messages.some((m) => m.meta)) throw new Error(`${path}: no Cucumber Messages 'meta' message`);
  const pickles = messages.filter((m) => m.pickle).map((m) => m.pickle);
  const testCases = new Map(messages.filter((m) => m.testCase).map((m) => [m.testCase.pickleId, m.testCase]));
  const startedByCase = new Map(); // testCaseId -> last testCaseStarted id (a retry replaces the earlier attempt)
  for (const m of messages) if (m.testCaseStarted) startedByCase.set(m.testCaseStarted.testCaseId, m.testCaseStarted.id);
  const finished = new Map();
  for (const m of messages) {
    if (!m.testStepFinished) continue;
    const list = finished.get(m.testStepFinished.testCaseStartedId) ?? [];
    list.push(m.testStepFinished);
    finished.set(m.testStepFinished.testCaseStartedId, list);
  }
  return pickles.map((pickle) => {
    const testCase = testCases.get(pickle.id);
    const startedId = testCase && startedByCase.get(testCase.id);
    const results = (startedId && finished.get(startedId)) || [];
    return {
      name: pickle.name,
      steps: pickle.steps.map((s) => ({ keyword: s.type ?? '', text: s.text })),
      status: worst(results.map((r) => r.testStepResult.status)),
      ms: results.reduce((n, r) => n + millis(r.testStepResult.duration), 0),
    };
  });
}

export const loadStack = (stack, path) => (stack.format === 'messages' ? loadMessages(path) : loadCucumberJson(path));

/**
 * What the feature file itself says should run: one execution per Scenario and per Examples row, in file order,
 * and the step count of each execution (Background steps plus the scenario's own steps).
 */
export function featureExpectation(featurePath) {
  const lines = readFileSync(featurePath, 'utf8').split('\n').map((l) => l.trim());
  let section = null;
  let backgroundSteps = 0;
  let current = null;
  let inExamples = false;
  let headerSeen = false;
  const executions = [];
  const isStep = (l) => /^(Given|When|Then|And|But)\s/.test(l);
  for (const l of lines) {
    if (l.startsWith('Background:')) { section = 'background'; continue; }
    const scenario = l.match(/^(Scenario Outline|Scenario):\s*(.+)$/);
    if (scenario) {
      section = 'scenario';
      inExamples = false;
      headerSeen = false;
      current = { name: scenario[2].trim(), outline: scenario[1] === 'Scenario Outline', steps: 0, rows: 0 };
      executions.push(current);
      continue;
    }
    if (l.startsWith('Examples:')) { inExamples = true; headerSeen = false; continue; }
    if (isStep(l)) {
      if (section === 'background') backgroundSteps += 1;
      else if (current) current.steps += 1;
      continue;
    }
    if (inExamples && l.startsWith('|')) {
      if (!headerSeen) headerSeen = true;
      else current.rows += 1;
    }
  }
  const expanded = [];
  for (const e of executions) {
    const count = e.outline ? e.rows : 1;
    for (let i = 0; i < count; i += 1) expanded.push({ name: e.name, steps: backgroundSteps + e.steps });
  }
  return { executions: expanded.length, steps: expanded.reduce((n, e) => n + e.steps, 0), rows: expanded };
}

/** Join key: scenario name plus its occurrence index, so outline rows that share a name stay separate. */
export function keyed(rows) {
  const seen = new Map();
  return rows.map((row) => {
    const n = seen.get(row.name) ?? 0;
    seen.set(row.name, n + 1);
    return { key: `${row.name}#${n}`, index: n, row };
  });
}
