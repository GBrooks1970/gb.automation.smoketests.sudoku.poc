# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](03_PROJECT_REVIEWS/PROJECT_001_SUDOKU.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29T06:33Z

Severity refers to impact in this portfolio/demo context. High does not assert a remotely exploitable application vulnerability. No Critical finding was established.

## R1 High - Local lockfile retains an advisory already fixed upstream

- **Risk description:** npm audit exits 1 with one high js-yaml finding at the reviewed local HEAD. This is a baseline synchronisation issue, not an unresolved upstream change.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/package-lock.json](../../../demo-apps/demoapp001-typescript-cypress/package-lock.json) (line 3105) pins js-yaml 4.3.1; [demo-apps/demoapp001-typescript-cypress/package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json) (line 69) permits the same version. Audit reports GHSA-2883-xcg3-v3hh, affecting >=4.0.0 <4.3.2, with a fix available. The read-only `HEAD..origin/main` diff changes that lock entry and override to 4.3.2. See [captured validation](ANNEX/VALIDATION.md).
- **Impact:** the local checkout fails the repository's high-severity audit policy. The dependency is development tooling; this review does not establish malicious YAML reachability through the Sudoku API.
- **Recommendation:** incorporate the existing upstream fix through the normal authorised synchronisation workflow, then run a fresh lock-aware audit. Do not create a duplicate dependency fix or weaken the policy.

## R2 Medium - Generator returns the wrong difficulty as success

- **Risk description:** when no generated candidate reaches the requested difficulty, the service retains its first candidate and returns it as success. This contradicts the documented bounded failure behaviour.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts) (line 65) retains the first candidate; line 79 returns it unconditionally. [DOCS/.design/puzzle-generator.md](../../../DOCS/.design/puzzle-generator.md) (line 182) requires a timeout after unsuccessful attempts and line 219 documents 422 for unattainable parameters. A real request with `difficulty: 'Expert', clueCount: 81, seed: 'review-proof'` returned HTTP 200, `difficulty: 'Easy'`, 81 clues.
- **Impact:** callers cannot rely on the requested tier. A schema-valid success response conceals an unsatisfied business requirement, undermining BACKLOG-016's closure claim.
- **Recommendation:** define one authoritative attempt policy and reject exhaustion with a typed domain failure mapped to the documented client status. Add exact target-match and exhausted-search tests at service/API levels. If best-effort generation is desired instead, approve and expose that distinct contract explicitly rather than silently falling back.

## R3 Medium - XWing is not recognised by the difficulty grader

- **Risk description:** tutor and grader use different string tokens for the same technique.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/app_src/server/SudokuTutorService.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/SudokuTutorService.ts) (line 271) returns `XWing`; [demo-apps/demoapp001-typescript-cypress/app_src/generator/difficulty-grader.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/generator/difficulty-grader.ts) (line 71) checks `X-Wing`. A controlled tutor seam returning one XWing hint then SOLVED produced `usedTechniques: ['XWing']`, `difficulty: 'Easy'`, and `highestTechnique: 'UnitCompletion'`. This is a focused seam probe, not evidence that an actual generated grid used only XWing.
- **Impact:** a solved grid requiring XWing is graded using a lower recognised technique or the Easy fallback. Target selection and displayed learning difficulty become misleading.
- **Recommendation:** share the production technique union/enum and exhaustively map every supported value. Add exact tier assertions for every technique and a real XWing-to-completion regression fixture. Existing enum-membership assertions in [demo-apps/demoapp001-typescript-cypress/tests/component/generator-service.contract.test.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/component/generator-service.contract.test.ts) (line 46) cannot catch this defect.

## R4 Medium - Tutor applies stale asynchronous hints

- **Risk description:** editing, clearing or loading a grid does not invalidate a pending hint request. When its response arrives, it becomes active for the new grid and may overwrite a cell.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/app_src/server/public/js/tutor.js](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/public/js/tutor.js) (line 161) submits a snapshot, line 176 assigns the returned hint without checking grid identity, and line 196 applies it without revalidation. Clear/reset/edit methods clear only the current hint. A controlled JavaScript VM probe requested a hint for a nearly complete row, cleared the grid, resolved the old response, then applied it: cell (0,2) became 3 in the cleared board.
- **Impact:** delayed responses or overlapping requests can apply logically invalid moves and confuse auto-play. The current smoke script checks served assets and the API, not this asynchronous browser state.
- **Recommendation:** maintain a grid revision and request sequence; discard results when either is stale, abort invalidated requests, and verify the target cell still matches the submitted snapshot before applying. Cover clear, edit, load, reset and out-of-order responses in controller tests.

## R5 Low - Active README contradicts delivered capabilities

- **Risk description:** current prose both advertises and denies advanced techniques, and reports a superseded TypeScript component count.
- **Evidence:** [README.md](../../../README.md) (line 30) advertises Naked Pairs/X-Wing; [README.md](../../../README.md) (line 316) says puzzles requiring those techniques return STUCK. [README.md](../../../README.md) (line 230) describes 20 component tests as current; the canonical [DOCS/.planning/backlog.md](../../../DOCS/.planning/backlog.md) (line 39) records 49, confirmed locally. Historical measured coverage values should be labelled as dated baselines rather than silently treated as newly measured.
- **Impact:** reviewers receive conflicting capability and assurance claims even though the existing currency guard passes.
- **Recommendation:** reconcile active README prose with the implemented five-technique solver and measured current test inventory. Preserve dated historical reports and extend the currency check to these product facts.

## Related Assurance Observations

The generator design calls for bounded time and attempts. Complete-solution construction has an iteration cap, but [demo-apps/demoapp001-typescript-cypress/app_src/generator/uniqueness-oracle.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/generator/uniqueness-oracle.ts) (line 25) recursively searches without an explicit work/time budget, and generation executes synchronously in the API. No stress test or production denial-of-service exploit was attempted. Treat this as a bounded-runtime follow-up, not an empirically proven timing failure.

The backlog reports all 93 items resolved, zero open and zero in progress. R2-R4 are newly identified residual defects; the review neither reopens historical items nor treats intentionally unimplemented Python/C# product surfaces as defects.

---

[<- Previous: Section](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](03_PROJECT_REVIEWS/PROJECT_001_SUDOKU.md)
