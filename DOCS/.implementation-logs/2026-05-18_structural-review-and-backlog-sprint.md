# Implementation Log: Structural Review and Backlog Sprint (BACKLOG-007, 017, 023, 008)

**Date:** 2026-05-18T00:00:00Z
**Session goal:** Conduct a comprehensive repository structural review against RA v1.13, then action four backlog items and capture new items raised by the review.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Perform a comprehensive structural review of the repository — treating it as if seen for the first time — covering RA compliance, design quality, risks ordered by severity, and pedagogical value. Then action four recommended backlog items (BACKLOG-007, BACKLOG-017, BACKLOG-023, BACKLOG-008) and add new backlog items from the review findings.

**Scope that emerged:**

- A new single-file review output format was needed; the existing `code-review.template.md` only governs multi-file bundles. A new `structural-review.template.md` was created to make future reviews comparable.
- The `.review/README.md` required updating to document both accepted output shapes.
- The `BACKLOG-017` remaining criterion ("Single Express server approach documented") could be closed in one small edit to the REST API design doc.
- `BACKLOG-023` (Ability refactor) revealed a missed caller: `LoadPuzzlesByDifficulty.ts` still referenced the removed `storeSolversFromPuzzles` method; caught by the TypeScript compiler during validation.
- `BACKLOG-008` (Audit Trail) required adding three new Gherkin scenarios to the canonical feature file, propagating to the Stack-local copy, and adding a step definition file.
- Several detail sections in the backlog had stale `Status: Open` and unchecked criteria for items already delivered (BACKLOG-007, BACKLOG-023) — corrected in the same commit as the new backlog additions.
- The backlog header still referenced RA v1.9 (should be v1.13) — corrected.
- The active table still had rows for BACKLOG-008 and BACKLOG-023 (resolved) — removed.
- Nine risks from the structural review were converted to backlog items; two (Risk 3 and Risk 11) already had tracking items (BACKLOG-022 and BACKLOG-024). BACKLOG-022's priority was raised from Low to High.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|-------------|
| Single-file structural review format as a distinct template from the multi-file bundle | The multi-file `code-review.template.md` is not suitable for a single cohesive structural audit document; having a separate template with fixed section order and fixed comparability rules enables future reviews to be diffed against this one | No — naming and template decisions fall within DR-020 and existing RA §10.5 latitude |
| GridFixtures as module-level pure functions (not a static class) | Pure functions taking a `SudokuSolver` argument are the simplest boundary: no instantiation, no shared state, no inheritance. TypeScript module-level functions are composable and treeshakeable | No — implementation pattern, not a structural rule change |
| AuditLogger kept synchronous; `solve()` remains synchronous | Making `solve()` async would ripple through the Screenplay layer (`solvePuzzle()` on the Ability, every Task that calls it). The design doc showed async but the practical cost was too high; batch file writes at end-of-solve can be sync | No — implementation choice within BACKLOG-008 scope |
| `setAuditLogger()` on SudokuSolver rather than constructor injection | Keeps the existing `new SudokuSolver(name, grid)` constructor signature unchanged across all tests and callers; the Orchestrator wires the logger after construction | No — backwards-compatibility choice within BACKLOG-008 scope |
| BACKLOG-022 priority raised Low → High | The structural review classified Step-Text Parity Checker as Risk 3 (High). The existing Low priority was understated; MUST automation is a normative RA requirement (DR-027) | No |

---

## 3. Files Created or Significantly Modified

### Created

| File | Purpose |
|------|---------|
| `.review/2026-05-18_repository-structural-review.md` | Comprehensive single-file structural review of the repository against RA v1.13; 12 risks numbered high-to-low with remediation steps |
| `DOCS/.templates/structural-review.template.md` | Template governing single-file structural reviews; includes comparability rules (fixed section order, fixed severity labels, fixed risk subsection names) |
| `app_src/output/IOutput.ts` | Interface with `write(message: string): void` — the decoupling boundary for SudokuCLI console output |
| `app_src/output/ConsoleOutput.ts` | Default implementation delegating to `console.log` |
| `tests/screenplay/fixtures/GridFixtures.ts` | Pure functions extracted from `UseSudokuSolver` Ability; each takes a `SudokuSolver` argument and mutates its grid for test setup |
| `app_src/audit/AuditTypes.ts` | Shared TypeScript interfaces: `CellChange`, `AuditEvent`, `AuditStatistics`, `AuditTrail`, `AuditConfig`. `CellChange` is the cross-feature base type consumed by REST API and Web UI |
| `app_src/audit/AuditLogger.ts` | Core audit logger: per-iteration tracking, per-algorithm change recording, statistics calculation, trail export |
| `app_src/audit/AuditFormatter.ts` | Output formatters: `formatSummary` (tabular console), `formatDetailed` (per-change verbose), `toJson` |
| `tests/screenplay/step_definitions/audit.steps.ts` | Step definitions for three new audit trail Gherkin scenarios |

### Modified

| File | Change summary |
|------|---------------|
| `app_src/SudokuCLI.ts` | Accepts `IOutput` via constructor (default `ConsoleOutput`); all `console.log` calls replaced with `this.output.write()` |
| `app_src/SudokuSolver.ts` | Removed dead `named()` static factory; added `setAuditLogger()`; added `isValidPlacement()`, `noConstraintViolations()`, `isValidSolution()` as public methods; `unitCompletion`, `hiddenSingles`, `nakedSingles` collect `CellChange` records when a logger is attached |
| `app_src/SudokuOrchestrator.ts` | Accepts optional `AuditConfig`; creates `AuditLogger` and wires to solver when enabled; exposes `getAuditTrail()` |
| `tests/screenplay/abilities/UseSudokuSolver.ts` | Slimmed from 399 lines to ~130 lines: all `setupXxx()` helpers removed (moved to GridFixtures); `isValidPlacement`, `noConstraintViolations`, `isValidSolution` removed (now on SudokuSolver); `solveFirstAndCheckIsolation()` removed (logic moved to MultipleSolvers question); added `solvePuzzleWithAudit()`, `enableAudit()`, `lastAuditTrail` accessor |
| `tests/screenplay/tasks/SetupGridState.ts` | All factory functions updated from `ability.setupXxx()` to `GridFixtures.setupXxx(ability.getSolver(), ...)`. `named()` and `threeCandidates()` now call `ability.initialise()` before delegating grid setup |
| `tests/screenplay/tasks/InitialiseGrid.ts` | `withDuplicateInRow` updated to call `ability.initialise('duplicate')` then `GridFixtures.setupWithDuplicateInRow()` |
| `tests/screenplay/tasks/LoadPuzzlesByDifficulty.ts` | `storeSolversFromPuzzles()` (removed from Ability) replaced with `setMultipleSolvers(createSolversFromPuzzles(...))` |
| `tests/screenplay/questions/GridCell.ts` | `isValidSolution()` and `noConstraintViolations()` now delegate to `ability.getSolver().isValidSolution()` and `.noConstraintViolations()` |
| `tests/screenplay/questions/MultipleSolvers.ts` | `isolationVerified()` now contains the isolation check logic inline (was `solveFirstAndCheckIsolation()` on the Ability) |
| `DOCS/.design/rest-api-wrapper.md` | Added "Single Express Server Approach" section documenting that REST API and Web UI share one Express process, one port, and the `CellChange` type |
| `DOCS/.architecture/screenplay-parity-contract.md` | Ability interface section updated to document the slimmed interface and note that GridFixtures holds the extracted setup helpers |
| `features-shared/.../BasicSudokuSolverLogic.feature` | Three new audit trail scenarios added: trail generation, algorithm attribution, no-trail-when-disabled |
| `demo-apps/.../tests/features/BasicSudokuSolverLogic.feature` | Same three scenarios propagated to Stack-local copy |
| `.review/README.md` | Updated to document both accepted output shapes (single-file structural review and multi-file bundle) with links to respective templates; `Governed by` corrected from v1.3 to v1.13 |
| `DOCS/.planning/backlog.md` | Major update: 7 new items (BACKLOG-025 to 031) added; BACKLOG-022 priority raised to High; stale BACKLOG-007 and BACKLOG-023 detail sections corrected to Resolved; BACKLOG-008 and BACKLOG-023 rows removed from active table; header `Governed by` corrected to v1.13; summary counts updated (Open 21, Resolved 32, Total 53) |

---

## 4. Bugs and Errors Encountered

### LoadPuzzlesByDifficulty referenced removed Ability method

**Symptom:** `npm test` reported `error TS2339: Property 'storeSolversFromPuzzles' does not exist on type 'UseSudokuSolver'` on first run after the BACKLOG-023 Ability slim-down.

**Root cause:** `LoadPuzzlesByDifficulty.ts` called `ability.storeSolversFromPuzzles(puzzles)` which was removed from the Ability as part of the refactor. The file was missed in the initial scan of Ability callers because it is a Task file not in the main `SetupGridState.ts` surface.

**Fix:** Replaced the call with `ability.setMultipleSolvers(createSolversFromPuzzles(puzzles.length, puzzles))` importing `createSolversFromPuzzles` from `GridFixtures`. Build and test passed on the next run.

---

### Git staging path collision (uppercase casing vs lowercase index)

**Symptom:** `git add` using the uppercase-cased planning backlog path failed silently (exit code 1, no file staged) because git on this Windows repository already tracks the file under the lowercase path `DOCS/.planning/backlog.md`.

**Root cause:** Windows filesystems are case-insensitive. The file on disk had uppercase casing, but git's index records it as `backlog.md` (from a previous `git mv` or initial add with the lowercase form). The uppercase path given to `git add` resolved to the same inode but did not match the index entry.

**Fix:** Used `git add "DOCS/.planning/backlog.md"` (lowercase). File staged correctly and committed with the other review artefacts.

---

## 5. Lessons Learned

- **Read all callers before removing an Ability method.** The Ability had 40+ methods; the initial caller scan covered `SetupGridState.ts` and the step definitions but missed `LoadPuzzlesByDifficulty.ts` which is a separate Task file. A Grep for the method name before deletion would have caught this immediately.

- **`SolverFirstAndCheckIsolation` was a compound operation masquerading as an Ability method.** Moving it inline into the Question (`MultipleSolvers.isolationVerified`) made the logic more readable and correctly placed: Questions read state and compute observations; this was always an observation, not an Ability capability.

- **The structural review format choice (single-file vs multi-file) should be decided before starting.** The review was written as a single cohesive document; the existing `code-review.template.md` specifies a multi-file bundle. Creating `structural-review.template.md` after the fact means the first review and its template were produced in the same session — which is acceptable but slightly out of order relative to RA §10.5 (template MUST precede document).

- **Backlog summary counts drift silently when detail sections are updated without syncing the table.** BACKLOG-007 and BACKLOG-023 were marked Resolved in the summary and detail section in prior sessions, but their rows remained in the active table and their detail `**Status:**` fields were not updated. The count-table says the truth; the active table and detail sections accumulated debt. A checklist of "remove row from active table + mark detail section" when resolving items would prevent this.

- **Windows git case-sensitivity is a persistent friction point.** DR-020 (kebab-case for all docs) and BACKLOG-026 (normalize planning backlog filename casing) are directly motivated by this. Until BACKLOG-026 is actioned, every git operation on `backlog.md` risks the same staging confusion.

---

## 6. Current State at End of Session

**Completed this session:**

- Review: Full structural review written against RA v1.13, committed to `.review/`
- Template: `structural-review.template.md` created with comparability rules
- BACKLOG-007: `IOutput` / `ConsoleOutput` decoupling — 46 scenarios pass
- BACKLOG-017: Express server approach documented in REST API design doc — Resolved
- BACKLOG-023: `UseSudokuSolver` slimmed; `GridFixtures.ts` created; `SudokuSolver` gains `isValidPlacement`, `noConstraintViolations`, `isValidSolution` — 46 scenarios pass
- BACKLOG-008: Audit trail infrastructure (`AuditTypes`, `AuditLogger`, `AuditFormatter`), `SudokuSolver.setAuditLogger()`, orchestrator integration, 3 Gherkin scenarios — 46 scenarios / 257 steps pass
- Backlog: BACKLOG-025 through BACKLOG-031 added; BACKLOG-022 priority raised; stale statuses corrected; table cleaned up

**Left incomplete / deferred:**

- BACKLOG-025 (Medium): Parity report terminology fix — deferred; latent until CI wired
- BACKLOG-026 (Medium): planning backlog filename casing — deferred; risk is latent until Linux CI
- BACKLOG-027 (Medium): Serenity/JS reporters — deferred; good first task for next session
- BACKLOG-028 (Medium): `decision-register.md` stale metadata — deferred; five-minute fix
- BACKLOG-029 (Medium): DR-010 supersession marker — deferred; five-minute fix
- BACKLOG-030 (Low): Actor name constant — deferred; low blast radius
- BACKLOG-031 (Low): Sprint roadmap update — deferred; planning doc currency only
- BACKLOG-004 (Medium): GitHub Actions CI — deferred; dependency on several parity tools being stable first
- BACKLOG-022 (High): Step-text parity checker — script template exists in review; awaiting CI wiring

**New backlog items generated this session:**

- BACKLOG-025 through BACKLOG-031 — all added to `DOCS/.planning/backlog.md` this session

---

## 7. Next Steps

1. **BACKLOG-028** — Update `decision-register.md` `Last Updated` field to 2026-05-18. Five-minute fix, eliminates agent confusion about document currency.
2. **BACKLOG-029** — Mark DR-010 as Superseded by DR-014 in `decision-register.md`. Similarly quick.
3. **BACKLOG-026** — normalize `DOCS/.planning/backlog.md` filesystem casing through a temporary `git mv`. Eliminates the case-sensitivity risk before Linux CI is added.
4. **BACKLOG-025** — Fix parity report terminology while the CI design is fresh; must be done before BACKLOG-004 CI wiring.
5. **BACKLOG-027** — Configure Serenity/JS reporters. Demonstrates the full framework value and produces living documentation for future Stack authors.
6. **BACKLOG-024** — Make `the missing digit is {int}` step genuinely parameterised before onboarding DEMOAPP002.
7. **BACKLOG-004** — GitHub Actions CI; the gate scripts and parity tooling are stable enough to wire now.

---

*End of Implementation Log*
