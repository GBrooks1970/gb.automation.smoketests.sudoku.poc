# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-05-13T22:17Z
**Sources:**
- [Code Review - Claude Sonnet 4.5 (2026-01-30)](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z.md)
- [Code Review - Claude Opus 4.6 (2026-03-30)](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md)
- [Code Review - Claude Sonnet 4.6 (2026-05-13)](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md)
**Status:** Active Development

---

## Overview

This backlog tracks planned work for the Sudoku Solver POC project. Updated 2026-05-13 after the
third code review (Claude Sonnet 4.6). Sprint 1 ended 2026-04-13 with partial completion.
Sprints reset to Sprint 2 starting 2026-05-14.

### Overall Project Health

| Metric | Status |
|--------|--------|
| Overall Grade | B+ (positive trajectory) |
| Critical Issues | 2 (HIGH priority, carried 3 reviews) |
| Medium Issues | 2 |
| Low Issues | 5 |
| Approved Designs Pending Implementation | 4 |
| Code Reviews | 3 (Sonnet 4.5, Opus 4.6, Sonnet 4.6) |

### Sprint Planning

- **Sprint Duration:** 2 weeks
- **Current Sprint:** Sprint 2 (2026-05-14 to 2026-05-27)
- **Sprint Goal:** Close the two persistent HIGH risks (Hidden Singles + Test Runner) and
  complete the partial Sprint 1 items
- **Sprint Reset Note:** Sprint 1 (2026-03-30 to 2026-04-13) ended with partial completion.
  Sprint 2 resumes from the remaining Sprint 1 items plus new review findings.

---

## Implementation Strategy

The implementation sequence remains as established in the Opus 4.6 review, with Sprint 2
replacing Sprint 1 as the immediate focus. The critical path is:

```
Sprint 2: Constants.ts + Prettier + Hidden Singles Fix + Test Runner + CI
    |
Sprint 3: Console Output Decoupling (IOutput)
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
| 1 | Create constants.ts + update all 5 source files | 2h | None | 🔴 Not Started |
| 2 | Add Prettier + eslint-config-prettier | 1-2h | None (parallel with Step 1) | 🔴 Not Started |
| 3 | Fix Hidden Singles (rows + columns) + add test puzzle | 4-6h | Step 1 (uses GRID_SIZE) | 🔴 Not Started |
| 4 | Create Implementation Log for this cycle | 1h | Step 3 | 🔴 Not Started |
| 5 | Implement Cucumber.js test runner + core step definitions | 16-24h | Step 3 | 🔴 Not Started |
| 6 | Create minimal GitHub Actions CI workflow | 2-3h | Step 5 | 🔴 Not Started |

**Sprint 2 Total Estimate:** 26-38 hours

### Step 1 Details: Create constants.ts (2h)

- Create `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/constants.ts`
- Contents: `GRID_SIZE = 9`, `BLOCK_SIZE = 3`, `EMPTY_CELL = 0`, `MIN_DIGIT = 1`, `MAX_DIGIT = 9`
- Remove constant exports from `SudokuSolver.ts` (they move to constants.ts)
- Update all 5 source files to import from `./constants`
- `npm run build` clean, `npm run lint` clean
- Closes BACKLOG-005 fully

### Step 2 Details: Add Prettier (1-2h, parallel with Step 1)

- `npm install --save-dev prettier eslint-config-prettier`
- Create `.prettierrc`: 2-space indent, single quotes, trailing commas
- Add `format` and `format:check` scripts to `package.json`
- Update `eslint.config.js` to add `eslintConfigPrettier` (disable conflicting rules)
- Run `npm run format` to establish formatting baseline
- Closes BACKLOG-006 fully

### Step 3 Details: Fix Hidden Singles (4-6h)

- Extend `SudokuSolver.hiddenSingles()` with row-based and column-based checks
- Row check: for each row, get empty cells, filter by column/block exclusions, place if single
- Column check: for each col, get empty cells, filter by row/block exclusions, place if single
- Add test puzzle to `puzzles.json` that requires row/column hidden singles to solve
  (verify it solves with the fix; verify it stays STUCK without the fix)
- Remove Hidden Singles limitation note from `CLAUDE.md` Known Limitations
- Update `DOCS/ALGORITHM_Sudoku_Basic_Solver.md` to confirm complete implementation
- Closes BACKLOG-001

### Step 4 Details: Implementation Log (1h)

- Create `DOCS/.implementation/IMPL_LOG_2026-05-13_Sprint2_Foundations.md`
- Document: constants.ts architecture decision, Prettier configuration, Hidden Singles fix
  approach, naming conventions cycle decisions from prior sprint
- Closes BACKLOG-003

### Step 5 Details: Cucumber.js Test Runner (16-24h)

- `npm install --save-dev @cucumber/cucumber @cucumber/pretty-formatter`
- Create `tests/step_definitions/solver_steps.ts`
- Implement step definitions in this priority order:
  1. Background step (grid initialization)
  2. 4 integration test scenarios (Easy, Medium, Hard, Empty puzzles)
  3. 4 Unit Completion scenarios
  4. 5 Hidden Singles scenarios (validates Step 3 fix)
  5. 3 Naked Singles scenarios
  6. 7 PuzzleLoader scenarios
  7. 5 Orchestration scenarios
  8. Remaining edge cases
- Create `cucumber.js` config file
- Add `"test": "cucumber-js"` to `package.json` scripts
- All implemented step definitions must pass
- Closes BACKLOG-002

### Step 6 Details: GitHub Actions CI (2-3h)

- Create `.github/workflows/ci.yml`
- Triggers: push and pull_request to all branches
- Steps: checkout, Node.js 20 setup, `npm ci`, `npm run lint`, `npm run build`, `npm test`
- Add CI status badge to `README.md`
- First stage of BACKLOG-004

---

## Product Backlog

### HIGH Priority

#### BACKLOG-001: Complete Hidden Singles Implementation
**Priority:** HIGH | **Estimate:** 4-6h | **Sprint:** 2 (Step 3)
**Risk Reference:** [Risk 1 - Sonnet 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started
**Carried from:** Sprint 1

**Description:**
Current `hiddenSingles()` only checks 3x3 blocks. Add row-based and column-based checking
per specification. Carried through three consecutive code reviews without action.

**Acceptance Criteria:**
- [ ] `hiddenSingles()` checks rows for hidden singles
- [ ] `hiddenSingles()` checks columns for hidden singles
- [ ] `hiddenSingles()` checks blocks for hidden singles (existing preserved)
- [ ] Test puzzle added that requires row/column hidden singles
- [ ] New puzzle solves with fix; remains STUCK_ON_ADVANCED_LOGIC without fix
- [ ] Algorithm documentation updated (limitation note removed)
- [ ] CLAUDE.md Known Limitations updated

**Dependencies:** BACKLOG-005-NEW (constants.ts - use GRID_SIZE in new loops)

---

#### BACKLOG-002: Implement Automated Test Runner
**Priority:** HIGH | **Estimate:** 16-24h | **Sprint:** 2 (Step 5)
**Risk Reference:** [Risk 2 - Sonnet 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started
**Carried from:** Sprint 1

**Description:**
35+ Gherkin scenarios exist but cannot be executed. Install Cucumber.js and implement
step definitions for all scenarios.

**Acceptance Criteria:**
- [ ] `@cucumber/cucumber` installed with TypeScript support
- [ ] `tests/step_definitions/solver_steps.ts` created
- [ ] Step definitions implemented for 35+ scenarios (all must pass)
- [ ] `npm test` script runs all scenarios
- [ ] `cucumber.js` configuration file present
- [ ] All scenarios green

**Dependencies:** BACKLOG-001 (correct algorithm first)

---

#### BACKLOG-003: Create Implementation Logs for Pending Cycles
**Priority:** HIGH | **Estimate:** 1h | **Sprint:** 2 (Step 4)
**Status:** 🔴 Not Started
**Carried from:** Sprint 1

**Description:**
Document the naming conventions cycle and Sprint 2 work in implementation logs.

**Acceptance Criteria:**
- [ ] `IMPL_LOG_2026-05-13_Sprint2_Foundations.md` created
- [ ] Constants architecture decision documented
- [ ] Hidden Singles fix approach documented
- [ ] Prettier configuration rationale documented

**Dependencies:** BACKLOG-001 (document after fix is complete)

---

### MEDIUM Priority

#### BACKLOG-005-NEW: Centralize Constants in constants.ts
**Priority:** MEDIUM | **Estimate:** 2h | **Sprint:** 2 (Step 1)
**Risk Reference:** [Risk 3 - Sonnet 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started
**Note:** Supersedes original BACKLOG-005 (which was partially completed with wrong architecture)

**Description:**
Constants were exported from `SudokuSolver.ts` instead of a dedicated `constants.ts`.
This creates awkward cross-module dependencies and leaves `PuzzleLoader.ts` with hardcoded 9s.
This item completes BACKLOG-005 per its original acceptance criteria.

**Acceptance Criteria:**
- [ ] `app_src/constants.ts` created with GRID_SIZE, BLOCK_SIZE, EMPTY_CELL, MIN_DIGIT, MAX_DIGIT
- [ ] Constant exports removed from `SudokuSolver.ts`
- [ ] All 5 source files import from `./constants`
- [ ] `PuzzleLoader.ts` uses GRID_SIZE in validation (removes hardcoded 9)
- [ ] `npm run build` succeeds, `npm run lint` passes
- [ ] Bat file output identical

**Dependencies:** None

---

#### BACKLOG-006-COMPLETE: Add Prettier to ESLint Setup
**Priority:** MEDIUM | **Estimate:** 1-2h | **Sprint:** 2 (Step 2)
**Status:** 🟡 In Progress (ESLint done, Prettier outstanding)

**Description:**
ESLint was added in the previous cycle. Prettier and `eslint-config-prettier` remain.

**Acceptance Criteria:**
- [x] ESLint installed with naming-convention rule
- [x] `npm run lint` script added
- [ ] Prettier installed and configured
- [ ] `npm run format` and `npm run format:check` scripts added
- [ ] `eslint-config-prettier` added to disable conflicting rules

**Dependencies:** None

---

#### BACKLOG-004: Setup GitHub Actions CI/CD
**Priority:** MEDIUM | **Estimate:** 2-3h (first stage) | **Sprint:** 2 (Step 6)
**Status:** 🔴 Not Started

**Description:**
Minimal GitHub Actions workflow: build + lint + test. Can now be created in 2-3 hours
without waiting for test runner (build + lint alone is valuable).

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml` created
- [ ] Build step: `npm ci` + `npm run build`
- [ ] Lint step: `npm run lint`
- [ ] Test step: `npm test` (once BACKLOG-002 complete)
- [ ] PR status checks visible
- [ ] README updated with CI badge

**Dependencies:** BACKLOG-002 (test step only; build+lint can start immediately)

---

#### BACKLOG-017: Unify Feature Design Overlap
**Priority:** MEDIUM | **Estimate:** 1h remaining | **Sprint:** 2 (close outstanding items)
**Status:** 🟡 In Progress

**Description:**
Reconcile the three feature designs. Most acceptance criteria completed in April 2026.
One criterion remains: document the single Express server approach explicitly.

**Acceptance Criteria:**
- [x] Shared `CellChange` interface specified as single definition
- [x] `SolveStep extends CellChange` inheritance documented
- [ ] Single Express server approach documented in REST API design
- [x] Design documents updated with cross-references
- [x] TODO task lists updated to reflect shared foundations
- [x] No contradictions between the three designs

**Dependencies:** None

---

#### BACKLOG-007: Decouple Console Output
**Priority:** MEDIUM | **Estimate:** 4-6h | **Sprint:** 3
**Status:** 🔴 Not Started

**Description:**
Introduce `IOutput` interface to decouple console.log. Prerequisite for REST API
and testable CLI output assertions.

**Acceptance Criteria:**
- [ ] `IOutput` interface created with `write(message: string)` method
- [ ] `ConsoleOutput` implementation (default behaviour preserved)
- [ ] `SudokuCLI` refactored to accept `IOutput` constructor parameter
- [ ] Default behaviour unchanged (bat file output identical)
- [ ] `SudokuSolver.named()` removed or used in index.ts

**Dependencies:** BACKLOG-002 (test runner recommended for assertion verification)

---

#### BACKLOG-008: Implement Audit Trail Feature
**Priority:** MEDIUM | **Estimate:** 20-30h | **Sprint:** 3-4
**Design Reference:** [DESIGN_Audit_Trail_Feature.md](../DOCS/.design/DESIGN_Audit_Trail_Feature.md)
**Status:** 🔴 Not Started

**Description:**
Implement audit logging per approved design. Foundation for REST API and Web UI change tracking.

**Acceptance Criteria:**
- [ ] `app_src/audit/AuditTypes.ts` with shared CellChange interface
- [ ] `app_src/audit/AuditLogger.ts` with iteration tracking and change recording
- [ ] `app_src/audit/AuditFormatter.ts` with JSON export and console summary
- [ ] `SudokuSolver.setAuditLogger()` integration
- [ ] Algorithm attribution for each change recorded
- [ ] Less than 5% performance overhead
- [ ] Cucumber step definitions for audit scenarios

**Dependencies:** BACKLOG-017, BACKLOG-007 (recommended)

---

#### BACKLOG-009: Implement REST API Wrapper
**Priority:** MEDIUM | **Estimate:** 24-32h | **Sprint:** 4-5
**Design Reference:** [DESIGN_REST_API_Wrapper.md](../DOCS/.design/DESIGN_REST_API_Wrapper.md)
**Status:** 🔴 Not Started

**Acceptance Criteria:**
- [ ] Express.js server (also hosts Web UI static files)
- [ ] Technique endpoints, solve endpoint, puzzle endpoints, validate endpoint
- [ ] AuditLogger integrated for change tracking in API responses
- [ ] Request validation middleware and error handling middleware
- [ ] Jest + Supertest API tests

**Dependencies:** BACKLOG-008, BACKLOG-007

---

#### BACKLOG-018: Implement Web UI Solver Visualisation
**Priority:** MEDIUM | **Estimate:** 20-30h | **Sprint:** 5-6
**Design Reference:** [DESIGN_Web_UI_Solver_Visualisation.md](../DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md)
**Status:** 🔴 Not Started

**Acceptance Criteria:**
- [ ] SolveStepTracker as adapter over AuditLogger
- [ ] HTML grid with algorithm colour coding
- [ ] Step-by-step playback controls
- [ ] Served from existing REST API Express server

**Dependencies:** BACKLOG-009, BACKLOG-008

---

### LOW Priority (Sprint 7+)

#### BACKLOG-010: Docker Compose for Local Development
**Priority:** LOW | **Estimate:** 8-12h | **Sprint:** 7+
**Status:** 🔴 Not Started

---

#### BACKLOG-011: Performance Benchmarking Suite
**Priority:** LOW | **Estimate:** 12-16h | **Sprint:** 7+
**Status:** 🔴 Not Started

**Dependencies:** BACKLOG-002, BACKLOG-004

---

### Future Enhancements (Not Prioritised)

#### BACKLOG-012: Implement Python Version (DEMOAPP002)
**Estimate:** 40-60h | **Status:** 📋 Planned

#### BACKLOG-013: Implement C# Version (DEMOAPP003)
**Estimate:** 40-60h | **Status:** 📋 Planned

#### BACKLOG-014: Advanced Solving Techniques
**Estimate:** 60-80h | **Status:** 📋 Planned

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

At each step completion, verify before moving to the next step:

| Step | Verification |
|------|-------------|
| Step 1 | `npm run build` clean, `npm run lint` clean, bat output identical |
| Step 2 | `npm run format:check` passes, `npm run lint` still passes |
| Step 3 | New puzzle solves correctly, bat file shows updated output |
| Step 4 | Implementation log is complete and accurate |
| Step 5 | `npm test` runs, all scenarios pass |
| Step 6 | CI pipeline green on GitHub Actions |

### Technical Debt Rules (From Sonnet 4.6 Review)

1. Only start a backlog item when all its acceptance criteria can be completed in the sprint
2. Create an implementation log entry at every sprint close
3. Verify all acceptance criteria explicitly before marking an item complete
4. Run CLAUDE.md currency check at each sprint close

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items |
|--------|-------|-------|-----------|
| 2 | 2026-05-14 to 2026-05-27 | Close Persistent Risks | BACKLOG-005-NEW, BACKLOG-006-COMPLETE, BACKLOG-001, BACKLOG-003, BACKLOG-002, BACKLOG-004 |
| 3 | 2026-05-28 to 2026-06-10 | Output + Audit | BACKLOG-007, BACKLOG-008 (start), BACKLOG-017 (close) |
| 4 | 2026-06-11 to 2026-06-24 | Audit + API | BACKLOG-008 (finish), BACKLOG-009 (start) |
| 5 | 2026-06-25 to 2026-07-08 | API + Web UI | BACKLOG-009 (finish), BACKLOG-018 (start) |
| 6 | 2026-07-09 to 2026-07-22 | Web UI + Polish | BACKLOG-018 (finish) |
| 7+ | 2026-07-23+ | Infrastructure | BACKLOG-010, BACKLOG-011 |

---

**Next Review Date:** 2026-05-27 (End of Sprint 2)
**Backlog Owner:** Project Lead / Development Team
