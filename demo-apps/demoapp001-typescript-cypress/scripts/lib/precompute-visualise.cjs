// Shared precompute for the static evidence build (BACKLOG-071 / DR-040).
//
// Reuses the maintained solve/visualise logic (SudokuApiService.listPuzzles /
// SolveStepTracker.trackSolve — the exact code behind the REST API's
// /api/puzzles and /api/visualise/:name) to produce, deterministically and with
// no HTTP server, the same VisualiseResult payloads the live viewer consumes.
// Both the build script and the drift check consume this so they cannot diverge.
const { SudokuApiService } = require('../../dist/server/SudokuApiService.js');
const { SolveStepTracker } = require('../../dist/server/SolveStepTracker.js');
const { PuzzleLoader } = require('../../dist/PuzzleLoader.js');

/** Stable, URL-safe filename slug for a puzzle name. */
function slugFor(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Precomputes the static-evidence data. Pure (no I/O beyond reading the
 * committed puzzles.json via PuzzleLoader): returns the puzzle index and one
 * VisualiseResult payload per puzzle, keyed by slug.
 */
function precompute() {
  const loader = new PuzzleLoader();
  const service = new SudokuApiService(loader);
  const tracker = new SolveStepTracker(loader);

  const puzzles = service.listPuzzles().puzzles.map((p) => ({
    name: p.name,
    difficulty: p.difficulty,
    slug: slugFor(p.name),
  }));

  const slugs = puzzles.map((p) => p.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error('precompute: puzzle slugs are not unique — rename a puzzle');
  }

  const payloads = {};
  for (const p of puzzles) payloads[p.slug] = tracker.trackSolve(p.name);

  return { puzzles, payloads };
}

module.exports = { precompute, slugFor };
