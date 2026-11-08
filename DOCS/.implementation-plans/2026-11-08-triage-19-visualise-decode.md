---
version: 1
created: 2026-11-08T06:10Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-087 / TRIAGE-19
status: implemented
approved: 2026-11-08 by GBrooks1970, "Approved both"; every recommended option, main session merges only when every check is green
delivered: PR #110, merge commit be26d730340112f0778e7ff3478605625aaf466d
language: en-GB
---

# Implementation plan: BACKLOG-087 / TRIAGE-19 remove the double URL decode on `/api/visualise/:name`

**Goal.** Make `/api/visualise/:name` decode its path parameter exactly once, as `/api/puzzles/:name`
already does, so a puzzle name that contains a literal `%` returns `404 PUZZLE_NOT_FOUND` rather
than `500 INTERNAL_SERVER_ERROR`. A double-encoded name must also stop resolving to a different
puzzle. Source: Claude review v2 Risk 4 (MEDIUM), triaged as TRIAGE-19 and recorded as
BACKLOG-087.

## Evidence gathered before planning

Read and reproduced on 2026-11-08 in this plan's worktree at `41429f3` (equal to `origin/main`),
under Node 24.18.0 after `npm ci` in DEMOAPP001. The probe is a supertest script kept outside the
worktree (`scratchpad/t19-probe/probe.ts`) that imports `createApp()`; no server was started. No
tracked file was changed apart from this plan and its `_index.md` row.

| Finding | Consequence for the plan |
|---|---|
| `app_src/server/app.ts` line 104: `res.json(tracker.trackSolve(decodeURIComponent(firstParam(req.params.name))))`. | Express 5.2.1 has already percent-decoded `req.params.name`, so this is a second decode. |
| `app_src/server/app.ts` lines 94-99, the sibling route `/api/puzzles/:name`: `res.json(service.getPuzzleByName(firstParam(req.params.name)))`, with no second decode. | The fix is to make line 104 match line 97. |
| `errorHandler` (lines 147-182) maps `ApiError` to its status and JSON parse errors to 400. Anything else, including the `URIError` the second decode throws, becomes `500 INTERNAL_SERVER_ERROR`. | The 500 is the generic fallback, not a deliberate mapping. |
| **Probe, unchanged code:** `GET /api/visualise/100%25` gives **500** `INTERNAL_SERVER_ERROR`. `GET /api/puzzles/100%25` gives **404** `PUZZLE_NOT_FOUND` ("Puzzle '100%' not found"). `GET /api/visualise/Easy%20Scan%20Grid` and `GET /api/puzzles/Easy%20Scan%20Grid` both give **200**. `GET /api/visualise/Unknown` gives **404**. | This reproduces the review exactly and is the must-fail baseline. |
| **Probe, double-encoded name:** `GET /api/visualise/Easy%2520Scan%2520Grid` gives **200** for "Easy Scan Grid", while `GET /api/puzzles/Easy%2520Scan%2520Grid` gives **404** ("Puzzle 'Easy%20Scan%20Grid' not found"). | The double decode also makes the two routes disagree on which puzzle a URL names (the review's "inference" bullet, now observed). After the fix both give 404. |
| **Probe, malformed escape:** `GET /api/visualise/%ZZ` and `GET /api/puzzles/%ZZ` both give **500**. | A separate defect on both routes. Express's own parameter decode rejects the malformed escape (inference: a 400-class router error), and `errorHandler` maps it to 500. Removing the second decode does not change it. It is outside this item (Decision 4). |
| Callers: the browser player (`app_src/server/public/js/app.js` line 144) sends `encodeURIComponent(puzzleName)` once. `tests/component/player-module.contract.test.ts` stubs `/api/visualise/Module%20fixture`. `tooling/performance/benchmark.ts` line 49 and `tests/api/api.integration.ts` lines 239 and 264 use single-encoded names. The Pages build (`scripts/lib/precompute-visualise.cjs`) calls the service directly, not the route. | No caller double-encodes, so the behaviour change for double-encoded names affects no client. |
| Baseline gates in this worktree: `npm run test:api` gives `API integration tests: PASS`; `npm run test:openapi` gives `tests 8, pass 8, fail 0`. | Baseline for no regression. |
| `docs/openapi.yaml` lines 229-245 (`getVisualise`) and lines 210-226 (`getPuzzleByName`) already declare 200, 404 `PuzzleNotFound` and 500 `InternalError`. `PuzzleName` (line 295) is described as "URL-encoded". Every path carries a `'500'` entry (ten in total), and `openapi.contract.test.ts` "accepts the implemented unexpected-error response" proves the 500 shape against a failing service. | No OpenAPI change is needed for the fix itself: 404 is already the documented response. The review's rec 3 (whether to list 500 per path) is a separate contract question (Decision 3). |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` fingerprints `tests/component/*.test.ts` and `tests/api/openapi.contract.test.ts` (plus `package.json`, `tsconfig.json`, `redocly.yaml`), but not `tests/api/api.integration.ts`. | Putting the new cases in `api.integration.ts` needs no inventory re-measure. Changing the OpenAPI contract test would (Decision 2). |
| DR-035 decision 2: the OpenAPI document "must be updated in the same change as any endpoint or schema change". | The documented responses do not change, so the OpenAPI file stays as it is. No DR is needed: this is a defect fix towards the documented contract. |

## Design options

- **A1 (recommended): remove the second decode.** Line 104 becomes
  `res.json(tracker.trackSolve(firstParam(req.params.name)))`, identical in form to the puzzles route.
  This is the smallest change and matches the review's rec 1.
- **A2: keep the decode but guard it.** Catch the `URIError` and map it to `404 PUZZLE_NOT_FOUND` or
  `400`. This hides the symptom, keeps the double decode, and leaves the double-encoded mismatch.
- **A3: shared parameter helper.** A `puzzleNameParam(req)` used by both routes. Tidy, but with one
  call site each it adds indirection without removing duplication worth the name.

## Steps

All work happens in this worktree on branch `worklist/triage-19-visualise-decode`, cut from
`origin/main` `41429f3`, because other sessions share the checkout. The steps assume the recommended
options.

1. **Record the item.** In `DOCS/.planning/backlog.md` set BACKLOG-087 to `In Progress` with a detail
   entry (worklist acceptance, Verification checks, plan link). Summary: 13 Open / 1 In Progress /
   109 Resolved / 123 Total. Update the header, status and sprint lines.
2. **File the plan.** This file, with status set to `approved` and the owner's words, plus its
   `_index.md` row.
3. **Must-fail API cases first** (`tests/api/api.integration.ts`):
   - in `puzzleEndpoints()`: `GET /api/puzzles/100%25` expects 404 with `error` `PUZZLE_NOT_FOUND`;
   - in `visualiseEndpoint()`: `GET /api/visualise/100%25` expects 404 with `error`
     `PUZZLE_NOT_FOUND`;
   - in `visualiseEndpoint()`: `GET /api/visualise/Easy%2520Scan%2520Grid` expects 404
     `PUZZLE_NOT_FOUND`, matching the puzzles route (Decision 5);
   - the existing `Easy%20Scan%20Grid` 200 assertions on both routes and the `Unknown` 404 cases stay
     unchanged.

   Run `npm run test:api` against the **unchanged** app and record the failure (expected: the
   `100%25` visualise case receives 500, not 404).
4. **Fix (A1).** Remove `decodeURIComponent(...)` from `app.ts` line 104. No other source change.
5. **Docs.** Add a CHANGELOG `[Unreleased]` `### Fixed` entry. No OpenAPI or README change, because
   the documented behaviour already says 404.
6. **Local gates**, recorded with output (listed under Verification).
7. **Publish.** Commit `fix(TRIAGE-19): decode the visualise route parameter once`, with a body naming
   BACKLOG-087 and the reason. Push with the upstream set to the new remote branch, and open one PR.

## Verification

- **Must-fail:** after step 3, `npm run test:api` fails on `GET /api/visualise/100%25` (500 instead
  of 404) against the unchanged route. After step 4 it prints `API integration tests: PASS`.
- **Still passing:** `GET /api/visualise/Easy%20Scan%20Grid` and `GET /api/puzzles/Easy%20Scan%20Grid`
  return 200 with the right puzzle; `Unknown` returns 404 on both routes.
- **Re-probe:** the scratch probe shows `100%25` giving 404 on both routes and `Easy%2520Scan%2520Grid`
  giving 404 on both. `%ZZ` still gives 500 on both, which is expected and out of scope (Decision 4).
- **DEMOAPP001 gates (the CI job's steps):** `npm run build`, `npm run lint`, `npm run format:check`,
  `npm run test:api`, `npm run verify:openapi` (lint plus 8/8 contract tests), `npm run test:coverage`
  (component suite, 113 tests, with its line/branch/function floors) and `npm test` (components plus
  55 scenarios / 309 steps).
- **Governance:** `check-ra-header-currency.ps1` and `test-documentation-currency.ps1` (37/37), since
  the backlog changes. Inventory fingerprints are unaffected because only `api.integration.ts` and
  `app.ts` change.
- **PR CI:** all five PR jobs pass. After merge, the `main` push run passes all seven jobs, including
  Pages build and deploy.

## Delivery

- **Project PR:** one PR from `worklist/triage-19-visualise-decode`. The main session merges it only
  when every check is green. The worktree and branch are then removed, locally and on the remote.
- **Outcome follow-up PR:** append the Outcome here, set status to `implemented`, fill `delivered`,
  update the `_index.md` row, set BACKLOG-087 to `Resolved` with evidence (Summary 13 Open /
  0 In Progress / 110 Resolved / 123 Total), and add
  `DOCS/.implementation-logs/2026-11-08_triage-19-visualise-decode.md`, indexed in that folder's
  `README.md`. If Decision 4 adds a root candidate, mirror it here as `Open` BACKLOG-101 under the
  BACKLOG-085 convention, adjusting the counts.
- **Portfolio root:** tick TRIAGE-19 in `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with the
  merge commit, from an isolated root worktree in a separate root PR, and append any candidate that
  Decision 3 or 4 creates.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| 1. Fix shape | A1 remove the second decode; A2 guard the decode and map `URIError`; A3 shared parameter helper | A1: smallest change, matches the sibling route and the review's rec 1 | A1, as recommended, 2026-11-08 |
| 2. Where the regression cases live | (a) `tests/api/api.integration.ts` only; (b) also add a `getVisualise` 404 assertion to `openapi.contract.test.ts` | (a): the integration test is the API gate named in the acceptance. A contract-test edit would change a fingerprinted file and force a `demoapp001-openapi` inventory re-measure, and 404 conformance is already exercised for `getPuzzleByName` | (a), as recommended, 2026-11-08 |
| 3. OpenAPI per-path `500` entries (review Risk 4 rec 3) | (a) keep them as they are, out of scope, as the worklist states; (b) record a new LOW root candidate to review whether 500 belongs on every path; (c) remove them now | (a): the 500 response is real and contract-tested for unexpected failures; the defect was the route reaching it for a client error, which this item fixes and the new case guards. Changing the contract shape is a separate API design choice | (a) keep, as recommended, 2026-11-08 |
| 4. Malformed escape (`%ZZ`) gives 500 on both routes | (a) record a new LOW root candidate: honour Express 4xx `status` in `errorHandler`, with must-fail API cases; (b) fold it into this item; (c) leave it unrecorded | (a): it is a real error-taxonomy defect found by this plan's probe, but it is not the double decode and touches the shared error handler | (a) new LOW root candidate, mirrored as BACKLOG-101 in the follow-up, as recommended, 2026-11-08 |
| 5. Double-encoded name assertion | (a) include `Easy%2520Scan%2520Grid` giving 404 on visualise; (b) only the `100%25` cases | (a): it proves the route decodes exactly once and agrees with the puzzles route; no client double-encodes | (a), as recommended, 2026-11-08 |
| 6. Decision record | No DR; or a DR | No DR: the fix restores documented behaviour and changes no contract | No DR, as recommended, 2026-11-08 |
| 7. Merge authority | Main session merges on all-green; or the owner merges | Main session merges on all-green, as for TRIAGE-16 to TRIAGE-18 | Main session merges on all-green, as recommended, 2026-11-08 |

## Outcome

Delivered in [PR #110](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/110),
head `65ed5e7`, merged as `be26d73` on 2026-11-08T08:31:39Z, with every recommended option.

- **Must-fail:** with the three new cases in `tests/api/api.integration.ts` and the route unchanged,
  `npm run test:api` exited 1 with `Error: expected 404 "Not Found", got 500 "Internal Server Error"`
  at the `/api/visualise/100%25` case (`api.integration.ts:273`). The harness stops at its first
  failure, so the double-encoded case's "before" was taken from the scratch probe:
  `/api/visualise/Easy%2520Scan%2520Grid` returned 200 ("Easy Scan Grid"). After the fix
  `npm run test:api` printed `API integration tests: PASS`.
- **Probe after the fix:** `100%25` and `Easy%2520Scan%2520Grid` give 404 `PUZZLE_NOT_FOUND` on both
  routes, `Easy%20Scan%20Grid` gives 200 on both, and `Unknown` gives 404. `%ZZ` still gives 500 on
  both routes, recorded as BACKLOG-101 (Decision 4).
- **Local gates (Node 24.18.0):** `tsc --noEmit`, lint, `format:check`, build and `test:api` pass;
  `verify:openapi` valid with 8/8 contract tests; components 113/113 with 80.11% lines / 91.94%
  branches / 80.17% functions (one test worker); `npm test` 113 components plus 55 scenarios /
  309 steps; RA/documentation currency PASS; documentation currency 37/37.
- **PR CI:** run 42463066910 at `65ed5e7` passed all five required jobs (DEMOAPP001 2m48s, DEMOAPP002
  22s, DEMOAPP003 1m58s, parity and `Gate (all stacks green)`); Pages jobs were skipped on the PR.
- **Exact merge:** `main` push run 42463312104 at `be26d73` passed all seven jobs, including Pages build and deploy (deployment 7633561566).

**Differences from the plan.**

1. The second must-fail (double-encoded name) was recorded from the scratch probe, not from
   `test:api`, because the harness stops at its first failure.
2. Locally, `npm run test:coverage` with default parallel workers failed one wall-clock budget test
   on each of two runs, a different test each time ("Average time per solution (15.2ms) was not
   below 15ms"; "Clue reduction time (157ms) exceeded 150ms budget"). Those files are unchanged by
   this item, and with `--test-concurrency=1` all 113 passed. CI's coverage step passed without a
   flake.

Decision 4's follow-on is recorded as root TRIAGE-31 and mirrored here as Open BACKLOG-101.

Record: [implementation log](../.implementation-logs/2026-11-08_triage-19-visualise-decode.md).
