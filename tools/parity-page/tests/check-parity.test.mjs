// Unit tests for the parity gate. Run: node --test tools/parity-page/tests
// Fixtures are trimmed from real results (see make-fixtures.mjs); each negative case plants ONE change in a
// temporary copy and expects the gate to fail for that reason alone.
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { STACKS, featureExpectation, keyed, loadMessages } from '../adapters.mjs';
import { FEATURE, gate, loadAll } from '../check-parity.mjs';
import { KEEP } from './keep.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures');
const repoRoot = join(here, '../../..');

// What the feature says should run for the kept scenarios, in feature order.
const full = featureExpectation(join(repoRoot, FEATURE));
const rows = full.rows.filter((r) => KEEP.includes(r.name));
const expected = { executions: rows.length, steps: rows.reduce((n, r) => n + r.steps, 0), rows };

function copy() {
  const dir = mkdtempSync(join(tmpdir(), 'parity-'));
  cpSync(fixtures, dir, { recursive: true });
  return dir;
}
const pathOf = (dir, id) => { const s = STACKS.find((x) => x.id === id); return join(dir, s.dir, s.file); };
function run(dir) {
  const { loaded, problems } = loadAll(dir);
  return gate(loaded, expected, problems);
}
function edit(id, fn) {
  const dir = copy();
  const path = pathOf(dir, id);
  writeFileSync(path, fn(readFileSync(path, 'utf8')));
  try { return run(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}
const fails = (r, text) => r.lines.some((l) => l.startsWith('FAIL') && l.includes(text));

test('the feature file expands to 55 executions and 309 steps (canonical count)', () => {
  assert.equal(full.executions, 55);
  assert.equal(full.steps, 309);
});

test('the kept fixtures include outline rows that share a name', () => {
  const k = keyed(rows);
  assert.equal(k.filter((x) => x.row.name === 'Validate moves against Sudoku constraints').length, 8);
  assert.equal(k.filter((x) => x.row.name === 'Reject JSON boolean puzzle cell values on load').length, 2);
});

test('clean real results pass', () => {
  const dir = copy();
  try {
    const r = run(dir);
    assert.equal(r.ok, true, r.lines.join('\n'));
    assert.equal(r.lines.at(-1), 'PARITY PASS');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('one word of step text changed in one Stack fails, with counts unchanged', () => {
  const r = edit('py', (s) => { assert.ok(s.includes('the grid should reflect the new value')); return s.replace('the grid should reflect the new value', 'the grid should reflect the updated value'); });
  assert.equal(r.ok, false);
  assert.ok(fails(r, 'step text DIFFERS from TypeScript in Python'), r.lines.join('\n'));
});

test('a failed step fails the gate in each of the three formats', () => {
  const json = (s) => {
    const data = JSON.parse(s);
    const element = data[0].elements.find((e) => e.name === 'Identify a Hidden Single in a row');
    element.steps.filter((x) => !x.hidden).at(-1).result.status = 'failed';
    return JSON.stringify(data);
  };
  assert.ok(fails(edit('ts', json), 'TypeScript: 1 execution(s) not passed'));
  assert.ok(fails(edit('py', json), 'Python: 1 execution(s) not passed'));
  const r = edit('cs', (s) => {
    let done = false;
    return s.split('\n').map((l) => {
      if (!l || done) return l;
      const m = JSON.parse(l);
      if (m.testStepFinished && m.testStepFinished.testStepResult.status === 'PASSED') { m.testStepFinished.testStepResult.status = 'FAILED'; done = true; return JSON.stringify(m); }
      return l;
    }).join('\n');
  });
  assert.ok(fails(r, 'C#: 1 execution(s) not passed'), r.lines.join('\n'));
});

test('a failing hidden After hook fails the execution even though it has no step text', () => {
  const r = edit('ts', (s) => {
    const data = JSON.parse(s);
    data[0].elements.find((e) => e.name === 'Identify a Hidden Single in a row').steps.find((x) => x.hidden).result.status = 'failed';
    return JSON.stringify(data);
  });
  assert.ok(fails(r, 'TypeScript: 1 execution(s) not passed'), r.lines.join('\n'));
});

test('hidden hook steps are not counted as steps', () => {
  const hidden = loadAll(fixtures).loaded.ts;
  assert.equal(hidden.reduce((n, x) => n + x.steps.length, 0), expected.steps);
});

test('C# results executed out of feature order still pass (pickle order wins)', () => {
  const r = edit('cs', (s) => {
    const all = s.split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const isRun = (m) => m.testCaseStarted || m.testStepStarted || m.testStepFinished || m.testCaseFinished;
    const idOf = (m) => (m.testCaseStarted ?? m.testStepStarted ?? m.testStepFinished ?? m.testCaseFinished);
    const groups = new Map();
    for (const m of all.filter(isRun)) {
      const id = m.testCaseStarted ? m.testCaseStarted.id : idOf(m).testCaseStartedId;
      groups.set(id, [...(groups.get(id) ?? []), m]);
    }
    const reversed = [...groups.values()].reverse().flat();
    const before = all.filter((m) => !isRun(m) && !m.testRunFinished);
    const after = all.filter((m) => m.testRunFinished);
    return [...before, ...reversed, ...after].map((m) => JSON.stringify(m)).join('\n');
  });
  assert.equal(r.ok, true, r.lines.join('\n'));
});

test('a Stack that drops an outline row fails the count and the order check', () => {
  const r = edit('py', (s) => {
    const data = JSON.parse(s);
    const i = data[0].elements.findIndex((e) => e.name === 'Validate moves against Sudoku constraints');
    data[0].elements.splice(i, 1);
    return JSON.stringify(data);
  });
  assert.ok(fails(r, `Python: ran ${expected.executions - 1} executions`), r.lines.join('\n'));
});

test('a Stack that runs scenarios in a different order fails', () => {
  const r = edit('ts', (s) => {
    const data = JSON.parse(s);
    const kept = data[0].elements.filter((e) => e.type !== 'background');
    const bg = data[0].elements.filter((e) => e.type === 'background');
    data[0].elements = [...bg, ...kept.reverse()];
    return JSON.stringify(data);
  });
  assert.ok(fails(r, 'TypeScript: scenario order or names differ from the feature'), r.lines.join('\n'));
});

test('a missing results file fails and names the file', () => {
  const dir = copy();
  try {
    rmSync(pathOf(dir, 'cs'));
    const r = run(dir);
    assert.equal(r.ok, false);
    assert.ok(fails(r, 'missing C# results'), r.lines.join('\n'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a Cucumber Messages file without meta is rejected', () => {
  const dir = copy();
  try {
    const path = pathOf(dir, 'cs');
    writeFileSync(path, readFileSync(path, 'utf8').split('\n').filter((l) => l && !JSON.parse(l).meta).join('\n'));
    assert.throws(() => loadMessages(path), /no Cucumber Messages 'meta'/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
