# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-05-14T10:30Z
**Sources:**
- [Code Review - Claude Sonnet 4.5 (2026-01-30)](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z.md)
- [Code Review - Claude Opus 4.6 (2026-03-30)](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md)
- [Code Review - Claude Sonnet 4.6 (2026-05-13)](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md)
- [Implementation Log - Sprint 2 (2026-05-14)](../DOCS/.implementation/IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md)
**Status:** Active Development

---

## Overview

This backlog tracks planned work for the Sudoku Solver POC project. Updated 2026-05-14 after
completing BACKLOG-005-NEW and BACKLOG-006-COMPLETE during Sprint 2. Sprint 2 is ongoing
(2026-05-14 to 2026-05-27) with only Step 6 (GitHub Actions CI) remaining.

### Overall Project Health

| Metric | Status |
|--------|--------|
| Overall Grade | A- (upgraded from B+ — both HIGH risks resolved, test suite live) |
| Critical Issues | 0 (was 2 — BACKLOG-001 and BACKLOG-002 now closed) |
| Medium Issues | 2 (BACKLOG-004, BACKLOG-017) |
| Low Issues | 1 (BACKLOG-007: dead code + console coupling) |
| Approved Designs Pending Implementation | 3 (Audit Trail, REST API, Web UI) |
| Code Reviews | 3 (Sonnet 4.5, Opus 4.6, Sonnet 4.6) |
| Test Scenarios | 43 passing / 241 steps (was 0 executable) |
| Puzzles in Test Suite | 5 (Easy, Logic Squeeze, Minimal Clues, Crosshatch Challenge, Empty) |

### Grade Dimension Breakdown (post Sprint 2)

| Dimension | Grade | Change from Last Review |
|-----------|-------|------------------------|
| Design Quality | A | Unchanged |
| Code Quality | A+ | Improved (constants centralised in constants.ts, Prettier formatting baseline applied) |
| Documentation | A+ | Improved (implementation log added) |
| Test Coverage | A | Major improvement — 43 scenarios all green (was D) |
| Implementation Progress | B | Improved (3 backlog items closed this sprint) |
| Pedagogical Value | A | Unchanged |
| **Overall** | **A-** | **Upgraded from B+** |

### Sprint Planning

- **Sprint Duration:** 2 weeks
- **Current Sprint:** Sprint 2 (2026-05-14 to 2026-05-27)
- **Sprint Goal:** Complete remaining Sprint 2 items — constants.ts refactor, Prettier, and GitHub Actions CI
- **Sprint Progress:** 5 of 6 steps complete (Steps 1, 2, 3, 4, 5 done; Step 6 remaining)

---

## Implementation Strategy

```
Sprint 2: constants.ts + Prettier + Hidden Singles + Test Runner + CI
    [Steps 1, 2, 3, 4, 5 ALL DONE — only Step 6 (CI) remaining]
    |
Sprint 3: Console Output Decoupling (IOutput) + close BACKLOG-017
    |
Sprint 3-4: Audit Trail Core (shared CellChange interface)
    |
Sprint 4-5: REST API (uses AuditLogger for change tracking)
    |
Sprint 5-6: Web UI (SolveStepTracker adapts AuditLogger, served by REST API)
    |
Sprint 7: Docker + Performance + Polish
```

**Key Principle:** Backlog items are only started when all acceptance criteria can be
completed within the sprint. Partial completion creates more risk than deferral.

---

## Sprint 2 Plan: Step-by-Step (2026-05-14 to 2026-05-27)

### Sprint 2 Goal
Resolve all persistent technical debt from prior sprints and establish automated testing.

### Step-by-Step Execution Order

| Step | Item | Hours | Dependency | Status |
|------|------|-------|-----------|--------|
| 1 | Create constants.ts + update all 5 source files | 2h | None | 🟢 Completed (2026-05-14) |
| 2 | Add Prettier + eslint-config-prettier | 1-2h | None (parallel with Step 1) | 🟢 Completed (2026-05-14) |
| 3 | Fix Hidden Singles (rows + columns) + add test puzzle | 4-6h | - | 🟢 Completed (2026-05-14) |
| 4 | Create Implementation Log for this cycle | 1h | - | 🟢 Completed (2026-05-14) |
| 5 | Implement Cucumber.js test runner + all step definitions | 16-24h | - | 🟢 Completed (2026-05-14) |
| 6 | Create minimal GitHub Actions CI workflow | 2-3h | Step 5 | 🔴 Not Started |

**Sprint 2 Remaining Estimate:** 2-3 hours (Step 6 only)

### Step 1 Details: Create constants.ts — COMPLETED 2026-05-14
- Created `app_src/constants.ts` with GRID_SIZE, BLOCK_SIZE, EMPTY_CELL, MIN_DIGIT, MAX_DIGIT
- Removed 3 `export const` lines from `SudokuSolver.ts`; added import from `./constants`
- Updated SudokuOrchestrator.ts, SudokuCLI.ts, PuzzleLoader.ts, and step_definitions to import from `./constants`
- Fixed all 3 hardcoded `9` values in `PuzzleLoader.validatePuzzles()` with GRID_SIZE, EMPTY_CELL, MAX_DIGIT
- `npm run build` clean, `npm run lint` clean, `npm test` 43/43, bat file unchanged
- Commit: `a85e17a`
- Closed BACKLOG-005-NEW

### Step 2 Details: Add Prettier — COMPLETED 2026-05-14
- Installed `prettier` and `eslint-config-prettier`
- Created `.prettierrc`: tabWidth 2, singleQuote, trailingComma es5, semi, printWidth 100
- Added `format` and `format:check` scripts to `package.json`
- Added `prettierConfig` as last entry in `eslint.config.js` (disables conflicting rules)
- Applied `npm run format` baseline — 5 source files reformatted; `npm run format:check` passes
- `npm run build` clean, `npm run lint` clean, `npm test` 43/43, bat file unchanged
- Commit: `e8c984d`
- Closed BACKLOG-006-COMPLETE

### Step 3 Details: Fix Hidden Singles — COMPLETED 2026-05-14
- Extended `SudokuSolver.hiddenSingles()` with row-based and column-based checks
- Added "Crosshatch Challenge" puzzle to `puzzles.json` (5th puzzle)
- Unexpected result: "Minimal Clues" (17-clue puzzle) now SOLVED — row/col hidden singles were the missing piece
- Updated CLAUDE.md, ALGORITHM_Sudoku_Basic_Solver.md, BasicSudokuSolverLogic.feature
- Closed BACKLOG-001

### Step 4 Details: Implementation Log — COMPLETED 2026-05-14
- `IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md` created
- Documents all work from naming convention session through BACKLOG-001 and BACKLOG-002
- Closed BACKLOG-003

### Step 5 Details: Cucumber.js Test Runner — COMPLETED 2026-05-14
- Installed `@cucumber/cucumber` and `@cucumber/pretty-formatter`
- Created `cucumber.js` config and `tsconfig.cucumber.json` (separate tsconfig to avoid rootDir conflict)
- Created `tests/step_definitions/solver_steps.ts`: 43 scenarios, 241 steps, 0 failures
- `npm test` script added to `package.json`
- Closed BACKLOG-002

### Step 6 Details: GitHub Actions CI (2-3h) — OUTSTANDING

- Create `.github/workflows/ci.yml`
- Triggers: push and pull_request to all branches
- Steps: checkout, Node.js 20 setup, `npm ci`, `npm run lint`, `npm run build`, `npm test`
- Add CI status badge to `README.md`
- Closes BACKLOG-004 (first stage)

---

## Product Backlog

### COMPLETED

#### BACKLOG-001: Complete Hidden Singles Implementation
**Priority:** HIGH | **Estimate:** 4-6h | **Sprint:** 2
**Status:** 🟢 Completed (2026-05-14)
**Commit:** `f171d63`

**Acceptance Criteria:**
- [x] `hiddenSingles()` checks rows for hidden singles
- [x] `hiddenSingles()` checks columns for hidden singles
- [x] `hiddenSingles()` checks blocks for hidden singles (existing preserved)
- [x] Test puzzle added that requires row/column hidden singles (Crosshatch Challenge)
- [x] Algorithm documentation updated (limitation note removed from ALGORITHM doc and CLAUDE.md)
- [x] CLAUDE.md Known Limitations updated (entry removed)
- [x] BONUS: Minimal Clues puzzle now SOLVED (previously STUCK_ON_ADVANCED_LOGIC)

---

#### BACKLOG-002: Implement Automated Test Runner
**Priority:** HIGH | **Estimate:** 16-24h | **Sprint:** 2
**Status:** 🟢 Completed (2026-05-14)
**Commit:** `5891e1d`

**Acceptance Criteria:**
- [x] `@cucumber/cucumber` installed with TypeScript support (`@cucumber/pretty-formatter` also added)
- [x] `tests/step_definitions/solver_steps.ts` created
- [x] Step definitions implemented for all 43 scenarios (241 steps)
- [x] `npm test` script runs all scenarios
- [x] `cucumber.js` configuration file present
- [x] `tsconfig.cucumber.json` created (separate tsconfig for test compilation)
- [x] All 43 scenarios green

---

#### BACKLOG-003: Create Implementation Logs
**Priority:** HIGH | **Estimate:** 1h | **Sprint:** 2
**Status:** 🟢 Completed (2026-05-14)
**Commit:** `89e7a9a`

**Acceptance Criteria:**
- [x] `IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md` created
- [x] Constants architecture decision documented (why constants are in SudokuSolver.ts, not constants.ts)
- [x] Hidden Singles fix approach documented (row/col scanning pattern)
- [x] Naming conventions cycle decisions documented
- [x] All 5 phases of the session documented with errors and solutions

---

#### BACKLOG-005-NEW: Centralize Constants in constants.ts
**Priority:** MEDIUM | **Estimate:** 2h | **Sprint:** 2
**Status:** 🟢 Completed (2026-05-14)
**Commit:** `a85e17a`

**Acceptance Criteria:**
- [x] `app_src/constants.ts` created with GRID_SIZE, BLOCK_SIZE, EMPTY_CELL, MIN_DIGIT, MAX_DIGIT
- [x] Constant exports removed from `SudokuSolver.ts`
- [x] All source files import from `./constants` (SudokuSolver, Orchestrator, CLI, PuzzleLoader, step_definitions)
- [x] `PuzzleLoader.ts` uses GRID_SIZE, EMPTY_CELL, MAX_DIGIT in validation (removes hardcoded `9`)
- [x] `npm run build` succeeds, `npm run lint` passes, `npm test` still 43/43
- [x] Bat file output identical to pre-change output

---

#### BACKLOG-006-COMPLETE: Add Prettier to ESLint Setup
**Priority:** MEDIUM | **Estimate:** 1-2h | **Sprint:** 2
**Status:** 🟢 Completed (2026-05-14)
**Commit:** `e8c984d`

**Acceptance Criteria:**
- [x] ESLint installed with `@typescript-eslint/naming-convention` rule
- [x] `npm run lint` script added to `package.json`
- [x] Prettier installed (`prettier`, `eslint-config-prettier`)
- [x] `.prettierrc` created with project settings (tabWidth 2, singleQuote, trailingComma es5)
- [x] `npm run format` and `npm run format:check` scripts added
- [x] `eslint-config-prettier` added to `eslint.config.js` to disable conflicting rules
- [x] All existing code passes `npm run format:check`

---

### HIGH Priority

*(All HIGH items now closed. None remain.)*

---

### MEDIUM Priority

#### BACKLOG-004: Setup GitHub Actions CI/CD
**Priority:** MEDIUM | **Estimate:** 2-3h | **Sprint:** 2 (Step 6)
**Status:** 🔴 Not Started
**Note:** Previously blocked on BACKLOG-002 (test step). BACKLOG-002 is now complete — unblocked.

**Description:**
Minimal GitHub Actions workflow running build, lint, and test on every push and pull request.

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml` created
- [ ] Build step: `npm ci` + `npm run build`
- [ ] Lint step: `npm run lint`
- [ ] Test step: `npm test` (43 scenarios must pass)
- [ ] PR status checks visible in GitHub
- [ ] `README.md` updated with CI badge

**Dependencies:** ~~BACKLOG-002~~ (complete)

---

#### BACKLOG-017: Unify Feature Design Overlap
**Priority:** MEDIUM | **Estimate:** 1h remaining | **Sprint:** 3
**Status:** 🟡 In Progress
**Note:** Moved to Sprint 3 — one criterion remaining; not blocking Sprint 2 code work.

**Description:**
Reconcile the three feature designs (Audit Trail, REST API, Web UI) on shared data models and
Express server. Most acceptance criteria completed in April 2026.

**Acceptance Criteria:**
- [x] Shared `CellChange` interface specified as single definition
- [x] `SolveStep extends CellChange` inheritance documented
- [ ] Single Express server approach explicitly documented in REST API design document
- [x] Design documents updated with cross-references
- [x] TODO task lists updated to reflect shared foundations
- [x] No contradictions between the three designs

**Dependencies:** None

---

#### BACKLOG-007: Decouple Console Output
**Priority:** MEDIUM | **Estimate:** 4-6h | **Sprint:** 3
**Status:** 🔴 Not Started

**Description:**
Introduce `IOutput` interface to decouple `console.log` from `SudokuCLI`. Prerequisite for
REST API response generation and for Cucumber step definitions that assert CLI output.
Also: remove `SudokuSolver.named()` dead code at the same time (30-minute add-on).

**Acceptance Criteria:**
- [ ] `app_src/output/IOutput.ts` interface created with `write(message: string): void`
- [ ] `app_src/output/ConsoleOutput.ts` implementation (default)
- [ ] `SudokuCLI` refactored to accept `IOutput` constructor parameter with `ConsoleOutput` default
- [ ] `SudokuSolver.named()` removed or used in `index.ts`
- [ ] Default behaviour unchanged — bat file output identical
- [ ] `npm test` still 43/43

**Dependencies:** BACKLOG-002 (complete — test runner available for verification)

---

#### BACKLOG-008: Implement Audit Trail Feature
**Priority:** MEDIUM | **Estimate:** 20-30h | **Sprint:** 3-4
**Design Reference:** [DESIGN_Audit_Trail_Feature.md](../DOCS/.design/DESIGN_Audit_Trail_Feature.md)
**Status:** 🔴 Not Started

**Description:**
Implement audit logging per approved design. Provides the shared `CellChange` interface that
the REST API and Web UI both depend on for change tracking.

**Acceptance Criteria:**
- [ ] `app_src/audit/AuditTypes.ts` with shared `CellChange`, `AuditEvent`, `AuditTrail` interfaces
- [ ] `app_src/audit/AuditLogger.ts` with iteration tracking and change recording
- [ ] `app_src/audit/AuditFormatter.ts` with JSON export and console summary
- [ ] `SudokuSolver.setAuditLogger()` integration (optional injection, null by default)
- [ ] Algorithm attribution for each cell change recorded
- [ ] Less than 5% solver performance overhead
- [ ] Cucumber step definitions added for audit scenarios

**Dependencies:** BACKLOG-017 (shared interface design), BACKLOG-007 (recommended)

---

#### BACKLOG-009: Implement REST API Wrapper
**Priority:** MEDIUM | **Estimate:** 24-32h | **Sprint:** 4-5
**Design Reference:** [DESIGN_REST_API_Wrapper.md](../DOCS/.design/DESIGN_REST_API_Wrapper.md)
**Status:** 🔴 Not Started

**Acceptance Criteria:**
- [ ] Express.js server (also serves Web UI static files in Phase 5)
- [ ] Technique endpoints: unit-completion, hidden-singles, naked-singles
- [ ] Solve endpoint with step tracking (uses AuditLogger)
- [ ] Puzzle endpoints: list, get by name
- [ ] Validate endpoint
- [ ] Request validation middleware and error handling middleware
- [ ] Jest + Supertest API tests for all endpoints

**Dependencies:** BACKLOG-008, BACKLOG-007

---

#### BACKLOG-018: Implement Web UI Solver Visualisation
**Priority:** MEDIUM | **Estimate:** 20-30h | **Sprint:** 5-6
**Design Reference:** [DESIGN_Web_UI_Solver_Visualisation.md](../DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md)
**Status:** 🔴 Not Started

**Acceptance Criteria:**
- [ ] `SolveStepTracker` as thin adapter over `AuditLogger` (formats for frontend)
- [ ] HTML grid display with algorithm colour coding
- [ ] Step-by-step playback controls (next, prev, play, pause)
- [ ] Event log panel with current step highlighting
- [ ] Statistics panel (algorithm breakdown, solve status)
- [ ] Served from existing REST API Express server (no separate server)

**Dependencies:** BACKLOG-009, BACKLOG-008

---

### LOW Priority (Sprint 7+)

#### BACKLOG-010: Docker Compose for Local Development
**Priority:** LOW | **Estimate:** 8-12h | **Sprint:** 7+
**Status:** 🔴 Not Started

**Acceptance Criteria:**
- [ ] Dockerfile with multi-stage build
- [ ] `docker-compose.yml` for development environment
- [ ] Source code volume mounting for live reload
- [ ] Documentation updated

**Dependencies:** None

---

#### BACKLOG-011: Performance Benchmarking Suite
**Priority:** LOW | **Estimate:** 12-16h | **Sprint:** 7+
**Status:** 🔴 Not Started

**Acceptance Criteria:**
- [ ] Benchmark puzzle set (10+ puzzles of varying difficulty)
- [ ] Performance measurement harness
- [ ] Baseline metrics established (solve time per puzzle)
- [ ] Audit Trail overhead verified under 5% target
- [ ] Regression detection integrated into CI

**Dependencies:** BACKLOG-002 (complete), BACKLOG-004

---

### Future Enhancements (Not Prioritised)

#### BACKLOG-012: Implement Python Version (DEMOAPP002)
**Estimate:** 40-60h | **Status:** 📋 Planned

#### BACKLOG-013: Implement C# Version (DEMOAPP003)
**Estimate:** 40-60h | **Status:** 📋 Planned

#### BACKLOG-014: Advanced Solving Techniques
**Estimate:** 60-80h | **Status:** 📋 Planned
**Note:** Naked Pairs, X-Wing, Swordfish. The "Minimal Clues" puzzle now solves with the
complete basic algorithm — a truly "advanced techniques only" puzzle is still needed for
the STUCK_ON_ADVANCED_LOGIC path to be exercised beyond the Empty Grid.

#### BACKLOG-015: Interactive Sudoku Tutor
**Estimate:** 80-120h | **Status:** 💡 Idea

#### BACKLOG-016: Puzzle Generator
**Estimate:** 40-60h | **Status:** 💡 Idea

---

## Backlog Maintenance

### Status Indicators

| Icon | Status | Description |
|------|--------|-------------|
| 🔴 | Not Started | Item not yet begun |
| 🟡 | In Progress | Actively being worked on |
| 🟢 | Completed | Done and verified |
| ⏸️ | Blocked | Waiting on dependencies |
| 📋 | Planned | Future work, not prioritised |
| 💡 | Idea | Concept stage, needs design |

### Sprint 2 Quality Checkpoints

| Step | Item | Verification | Status |
|------|------|-------------|--------|
| 1 | constants.ts | `npm run build` clean, `npm run lint` clean, `npm test` 43/43, bat output identical | 🟢 |
| 2 | Prettier | `npm run format:check` passes, `npm run lint` still passes | 🟢 |
| 3 | Hidden Singles | 5 puzzles all correct results in bat output | 🟢 |
| 4 | Implementation Log | Log complete and accurate | 🟢 |
| 5 | Test Runner | `npm test` 43/43 pass | 🟢 |
| 6 | CI | Pipeline green on GitHub Actions, badge in README | 🔴 |

### Technical Debt Rules (From Sonnet 4.6 Review)

1. Only start a backlog item when all its acceptance criteria can be completed in the sprint
2. Create an implementation log entry at every sprint close
3. Verify all acceptance criteria explicitly before marking an item complete
4. Run CLAUDE.md currency check at each sprint close

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items | Status |
|--------|-------|-------|-----------|--------|
| 2 | 2026-05-14 to 2026-05-27 | Close Persistent Risks | BACKLOG-001 ✅, BACKLOG-002 ✅, BACKLOG-003 ✅, BACKLOG-005-NEW ✅, BACKLOG-006-COMPLETE ✅, BACKLOG-004 | 🟡 In Progress (Step 6 remaining) |
| 3 | 2026-05-28 to 2026-06-10 | Output + Design + Audit Start | BACKLOG-007, BACKLOG-017 (close), BACKLOG-008 (start) | 🔴 |
| 4 | 2026-06-11 to 2026-06-24 | Audit + API Start | BACKLOG-008 (finish), BACKLOG-009 (start) | 🔴 |
| 5 | 2026-06-25 to 2026-07-08 | API + Web UI Start | BACKLOG-009 (finish), BACKLOG-018 (start) | 🔴 |
| 6 | 2026-07-09 to 2026-07-22 | Web UI + Polish | BACKLOG-018 (finish) | 🔴 |
| 7+ | 2026-07-23+ | Infrastructure | BACKLOG-010, BACKLOG-011 | 🔴 |

---

**Next Review Date:** 2026-05-27 (End of Sprint 2)
**Backlog Owner:** Project Lead / Development Team
