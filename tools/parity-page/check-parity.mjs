#!/usr/bin/env node
// Results-level parity gate (DR-047, BACKLOG-075). Unlike the file-level scripts under .batch/, which compare
// feature files before anything runs, this compares what each Stack EXECUTED and how it came out:
//   1. every result file is present and readable;
//   2. every Stack ran exactly the executions the feature file expands to, and the same step count;
//   3. every Stack ran them in feature-file order, with the same scenario keys;
//   4. every Stack's step text matches the TypeScript Stack's for each execution;
//   5. every execution passed.
// Exit 0 prints PARITY PASS; exit 1 prints every failure found.
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STACKS, featureExpectation, keyed, loadStack } from './adapters.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
export const FEATURE = 'features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature';

/** Load every Stack's results from `<root>/<demoappNNN>/<file>`. Missing files are reported, not thrown. */
export function loadAll(root) {
  const loaded = {};
  const problems = [];
  for (const stack of STACKS) {
    const path = join(root, stack.dir, stack.file);
    if (!existsSync(path)) {
      problems.push(`missing ${stack.label} results: ${path}`);
      continue;
    }
    try {
      loaded[stack.id] = loadStack(stack, path);
    } catch (error) {
      problems.push(`cannot read ${stack.label} results ${path}: ${error.message}`);
    }
  }
  return { loaded, problems };
}

/**
 * @param {Record<string, object[]>} results rows per stack id
 * @param {{executions:number, steps:number, rows:{name:string}[]}} expected from the feature file
 * @param {string[]} problems load problems to report as failures
 */
export function gate(results, expected, problems = []) {
  const lines = [...problems.map((p) => `FAIL ${p}`)];
  const present = STACKS.filter((s) => results[s.id]);
  lines.push(`expected from feature: ${expected.executions} executions, ${expected.steps} steps each`);
  lines.push(`executions: ${STACKS.map((s) => `${s.id} ${results[s.id]?.length ?? 'n/a'}`).join(', ')}`);

  const expectedKeys = keyed(expected.rows).map((k) => k.key);
  const keyedByStack = {};
  for (const stack of present) {
    const rows = results[stack.id];
    keyedByStack[stack.id] = keyed(rows);
    const steps = rows.reduce((n, r) => n + r.steps.length, 0);
    if (rows.length !== expected.executions) lines.push(`FAIL ${stack.label}: ran ${rows.length} executions, the feature expands to ${expected.executions}`);
    if (steps !== expected.steps) lines.push(`FAIL ${stack.label}: ran ${steps} steps, the feature expands to ${expected.steps}`);
    const got = keyedByStack[stack.id].map((k) => k.key);
    if (got.length === expectedKeys.length && got.some((k, i) => k !== expectedKeys[i])) {
      const i = got.findIndex((k, n) => k !== expectedKeys[n]);
      lines.push(`FAIL ${stack.label}: scenario order or names differ from the feature at position ${i + 1}: "${got[i]}" vs "${expectedKeys[i]}"`);
    }
  }

  const base = present[0];
  if (base) {
    for (const stack of present.slice(1)) {
      const a = keyedByStack[base.id];
      const b = keyedByStack[stack.id];
      for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
        if (a[i].key !== b[i].key) continue; // already reported as an order/name failure
        const ta = a[i].row.steps.map((s) => s.text);
        const tb = b[i].row.steps.map((s) => s.text);
        const at = ta.findIndex((t, n) => t !== tb[n]);
        if (at !== -1 || ta.length !== tb.length) {
          const n = at === -1 ? Math.min(ta.length, tb.length) : at;
          lines.push(`FAIL step text DIFFERS from ${base.label} in ${stack.label}: "${a[i].row.name}"${a[i].index ? ` (row ${a[i].index + 1})` : ''} step ${n + 1}`);
          lines.push(`       ${base.label}: ${ta[n] ?? '(missing)'}`);
          lines.push(`       ${stack.label}: ${tb[n] ?? '(missing)'}`);
        }
      }
    }
  }

  for (const stack of present) {
    const bad = keyedByStack[stack.id].filter((k) => k.row.status !== 'PASSED');
    if (bad.length) lines.push(`FAIL ${stack.label}: ${bad.length} execution(s) not passed, first "${bad[0].row.name}" is ${bad[0].row.status}`);
  }

  const ok = !lines.some((l) => l.startsWith('FAIL'));
  lines.push(ok ? 'PARITY PASS' : 'PARITY FAIL');
  return { ok, lines };
}

// CLI. PARITY_RESULTS_DIR lets tools/parity-page/build-page.mjs run this gate on a tampered copy (its negative check).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.env.PARITY_RESULTS_DIR ?? join(repoRoot, '.results');
  const feature = process.env.PARITY_FEATURE ?? join(repoRoot, FEATURE);
  console.log(`parity gate: results ${relative(process.cwd(), root) || '.'}, feature ${relative(repoRoot, feature)}`);
  const expected = featureExpectation(feature);
  const { loaded, problems } = loadAll(root);
  const { ok, lines } = gate(loaded, expected, problems);
  for (const line of lines) console.log(line);
  process.exit(ok ? 0 : 1);
}
