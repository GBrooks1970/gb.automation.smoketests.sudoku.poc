// Tests for the parity page builder. Run: node --test tools/parity-page/tests/*.test.mjs
// Builds from the trimmed real fixtures and the real step-definition sources.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { STACKS } from '../adapters.mjs';
import { PLANTED, build, extractSnippets, negativeChecks, render } from '../build-page.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures');
const feature = join(fixtures, 'features', 'BasicSudokuSolverLogic.feature');
const tmp = () => mkdtempSync(join(tmpdir(), 'parity-build-'));
const done = (...dirs) => dirs.forEach((d) => rmSync(d, { recursive: true, force: true }));

function copyFixtures() {
  const dir = tmp();
  cpSync(fixtures, dir, { recursive: true });
  return dir;
}
function rewriteAll(dir, fn) {
  for (const s of STACKS) {
    const path = join(dir, s.dir, s.file);
    writeFileSync(path, fn(readFileSync(path, 'utf8'), s.id));
  }
}

test('builds a page from real results, with the gate and every negative check run', () => {
  const out = tmp();
  try {
    const { data, html, file } = build({ root: fixtures, feature, out, env: {} });
    assert.ok(existsSync(file));
    assert.equal(data.rows.length, 13);
    assert.deepEqual(Object.fromEntries(Object.entries(data.cases).map(([k, v]) => [k, v.exit])), { clean: 0, text: 1, fail_ts: 1, fail_py: 1, fail_cs: 1 });
    assert.ok(data.cases.clean.lines.includes('PARITY PASS'));
    assert.ok(data.cases.text.lines.some((l) => l.includes('step text DIFFERS')));
    assert.ok(data.sections.includes('Hidden Singles Algorithm'));
    assert.equal(data.meta.sha, null, 'a local build says so');
    assert.ok(!/\/\*__(DATA|SCRIPT)__\*\//.test(html.replace(/<!--[\s\S]*?-->/g, '')), 'placeholders are replaced');
    const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
    assert.doesNotThrow(() => new Function(script), 'the inlined script parses');
  } finally { done(out); }
});

test('outline rows that share a name are kept apart in the page data', () => {
  const out = tmp();
  try {
    const { data } = build({ root: fixtures, feature, out, env: {} });
    const rows = data.rows.filter((r) => r.name === 'Validate moves against Sudoku constraints');
    assert.equal(rows.length, 8);
    assert.deepEqual(rows.map((r) => r.n), [0, 1, 2, 3, 4, 5, 6, 7]);
  } finally { done(out); }
});

test('CI metadata is read from the environment', () => {
  const out = tmp();
  try {
    const { data } = build({ root: fixtures, feature, out, env: { GITHUB_SHA: 'abc1234def', GITHUB_RUN_ID: '42', GITHUB_REPOSITORY: 'o/r' } });
    assert.deepEqual([data.meta.sha, data.meta.runId, data.meta.repo], ['abc1234def', '42', 'o/r']);
  } finally { done(out); }
});

test('the build refuses to run on results that fail the gate', () => {
  const dir = copyFixtures();
  const out = tmp();
  try {
    rewriteAll(dir, (t, id) => (id === 'py' ? t.replace(PLANTED.find, PLANTED.replace) : t));
    assert.throws(() => build({ root: dir, feature, out, env: {} }), /cannot build the page from results that fail the gate/);
    assert.ok(!existsSync(join(out, 'index.html')));
  } finally { done(dir, out); }
});

test('the negative check fails the build when the planted change cannot be made', () => {
  const dir = copyFixtures();
  try {
    // Change the planted step's text in all three Stacks so the real results still pass, but the planted text is gone.
    rewriteAll(dir, (t) => t.replaceAll(PLANTED.find, 'fresh value'));
    assert.throws(() => negativeChecks(dir, feature), /planted text not found/);
  } finally { done(dir); }
});

test('the negative check fails the build when the gate does not fail on a planted change', () => {
  // A blind gate that always passes must be caught by the build, whatever it is given.
  const dir = tmp();
  try {
    const blind = join(dir, 'blind-gate.mjs');
    writeFileSync(blind, "console.log('PARITY PASS');\n");
    assert.throws(() => negativeChecks(fixtures, feature, blind), /negative check "text" FAILED: the gate did not fail as expected/);
  } finally { done(dir); }
});

test('step snippets come from the three real sources, and a missing source fails', () => {
  const s = extractSnippets();
  for (const id of ['ts', 'py', 'cs']) {
    assert.match(s[id].code, /algorithm is executed for value/);
    assert.match(s[id].where, /:\d+-\d+$/);
  }
  assert.throws(() => extractSnippets(tmp()), /step-definition source missing/);
});

test('render escapes a closing script tag inside data', () => {
  const html = render({ x: '</script><b>' }, '<script>const DATA = /*__DATA__*/null;\n/*__SCRIPT__*/</script>', 'const a = 1;');
  assert.ok(html.includes('<\\/script><b>'));
  assert.equal((html.match(/<\/script>/g) ?? []).length, 1);
});

test('render rejects a template without its placeholders', () => {
  assert.throws(() => render({}, '<p>no placeholders</p>', ''), /missing its data or script placeholder/);
});
