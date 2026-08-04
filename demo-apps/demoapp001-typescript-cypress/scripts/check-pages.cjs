// Drift + self-containment gate for the static evidence site (BACKLOG-071 /
// DR-040). Runs on plain Node against built dist/. Fails (exit 1) if the
// precomputed payloads are non-deterministic or malformed, if a slug is
// unmapped, or if the static viewer references a server/API or an external
// asset, or omits its provenance banner.
//
// Run via `npm run check:pages` (builds first) or directly after a build.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { precompute } = require('./lib/precompute-visualise.cjs');

const APP = resolve(__dirname, '..');
const problems = [];
const check = (ok, message) => {
  if (!ok) problems.push(message);
};

// ── Determinism: precompute twice, compare bytes. ───────────
const first = precompute();
const second = precompute();
check(
  JSON.stringify(first) === JSON.stringify(second),
  'precomputed data is not deterministic across runs',
);

// ── Payload schema + content. ───────────────────────────────
check(first.puzzles.length > 0, 'no puzzles were precomputed');
for (const p of first.puzzles) {
  check(Boolean(p.name && p.difficulty && p.slug), `puzzle index row is incomplete: ${JSON.stringify(p)}`);
  const v = first.payloads[p.slug];
  check(Boolean(v), `no payload for slug ${p.slug}`);
  if (!v) continue;
  // VisualiseResult shape the viewer relies on.
  for (const field of ['puzzleName', 'difficulty', 'description', 'status', 'initialGrid', 'steps', 'statistics']) {
    check(field in v, `payload ${p.slug} is missing field "${field}"`);
  }
  check(Array.isArray(v.initialGrid) && v.initialGrid.length === 9, `payload ${p.slug} initialGrid is not a 9x9 grid`);
  check(Array.isArray(v.steps), `payload ${p.slug} steps is not an array`);
  check(v.statistics && typeof v.statistics.totalSteps === 'number', `payload ${p.slug} statistics.totalSteps missing`);
}

// ── Static viewer self-containment (no server / no external assets). ──
const indexHtml = readFileSync(resolve(APP, 'pages/index.html'), 'utf8');
const appJs = readFileSync(resolve(APP, 'pages/js/app.js'), 'utf8');

// No API calls, no server dependency.
check(!/\/api\//.test(appJs), 'static app.js must not call /api/* endpoints');
check(!/\/api\//.test(indexHtml), 'static index.html must not reference /api/*');
// Fixture fetches are relative (./data/...), never absolute or external.
check(!/fetch\(\s*['"]\//.test(appJs), 'static app.js must fetch relative paths, not absolute (leading /)');
check(!/https?:\/\//.test(appJs), 'static app.js must not fetch external http(s):// URLs');
check(/fetch\(\s*['"]\.\/data\//.test(appJs), 'static app.js must fetch precomputed data from ./data/');
// Asset references in index.html are relative (Pages base-path safe).
check(!/(?:href|src)=["']\//.test(indexHtml), 'static index.html asset refs must be relative (no leading /)');
check(!/https?:\/\//.test(indexHtml), 'static index.html must not reference external http(s):// assets');
// Provenance banner presence and truthful framing.
check(/Static evidence/i.test(indexHtml), 'index.html must carry the "Static evidence" provenance banner');
check(/not.*(tutor|hosted solver|live API|parity)/is.test(indexHtml), 'index.html banner must disclaim tutor/hosted-solver/live-API/parity');

if (problems.length > 0) {
  console.error('check-pages: FAIL');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `check-pages: PASS (deterministic, schema-valid, self-contained; ` +
    `${first.puzzles.length} puzzles: ${first.puzzles.map((p) => p.slug).join(', ')})`,
);
