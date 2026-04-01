# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-03-30T16:30:00Z
**Sources:**
- [Code Review - Claude Sonnet 4.5 (2026-01-30)](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z.md)
- [Code Review - Claude Opus 4.6 (2026-03-30)](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md)
**Status:** Active Development

---

## Overview

This backlog tracks planned work for the Sudoku Solver POC project. It was originally created from the first code review (2026-01-30) and has been updated based on the second code review (2026-03-30) to reflect current priorities, a unified feature implementation strategy, and reset sprint planning.

### Overall Project Health

| Metric | Status |
|--------|--------|
| Overall Grade | B+ (Good with execution gap) |
| Critical Issues | 3 (HIGH priority) |
| Medium Issues | 3 |
| Low Issues | 2 |
| Approved Designs Pending Implementation | 3 |
| Design Documents | 4 (Solver Spec, Audit Trail, REST API, Web UI) |
| TODO Task Lists | 3 (Audit Trail, REST API, Web UI) |
| Code Reviews | 2 (Sonnet 4.5, Opus 4.6) |

### Sprint Planning

- **Sprint Duration:** 2 weeks
- **Current Sprint:** Sprint 1 (2026-03-30 to 2026-04-13)
- **Velocity:** TBD (sprint reset - previous sprints had zero velocity)
- **Sprint Reset Note:** Sprints reset from original 2026-01-30 numbering due to zero completed items. See [Risk 1 - Design-Implementation Gap](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md).

---

## Implementation Strategy

Based on the second code review's Unified Feature Implementation Strategy (see [Migration Plan 1](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/07_MIGRATION_PLANS.md)), features should be implemented in the following order to maximise code reuse and minimize duplication:

```
Sprint 1: Solver Fixes + Constants + Linting + Backlog Reset
    |
Sprint 2: Test Infrastructure (Cucumber.js)
    |
Sprint 3: Audit Trail Core (shared CellChange interface)
    |
Sprint 4-5: REST API (uses AuditLogger for change tracking)
    |
Sprint 5-6: Web UI (SolveStepTracker adapts AuditLogger, served by REST API)
    |
Sprint 7: CI/CD + Polish
```

**Key Principle:** The Audit Trail's `CellChange` interface becomes the shared data model for all change tracking. The REST API's Express server hosts the Web UI. This prevents duplicate code.

---

## Current Sprint (Sprint 1: 2026-03-30 to 2026-04-13)

### Sprint Goal
Fix critical code gaps, establish code quality tooling, and unify feature designs.

### Sprint Backlog

- [ ] **BACKLOG-001: Complete Hidden Singles Implementation** (HIGH) - 4-6 hours
- [ ] **BACKLOG-005: Extract Magic Numbers to Constants** (MEDIUM) - 3-4 hours
- [ ] **BACKLOG-006: Add ESLint and Prettier** (MEDIUM) - 4-6 hours
- [ ] **BACKLOG-017: Unify Feature Design Overlap** (MEDIUM) - 4 hours
- [ ] **BACKLOG-003: Document Code Review Findings** (HIGH) - 2-4 hours

**Sprint Capacity:** ~20-24 hours

---

## Product Backlog

### HIGH Priority

#### BACKLOG-001: Complete Hidden Singles Implementation
**Priority:** HIGH | **Estimate:** 4-6 hours | **Sprint:** 1
**Risk Reference:** [Risk 2 - Opus 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started
**TODO Reference:** N/A (standalone fix)

**Description:**
Current `hiddenSingles()` implementation only checks 3x3 blocks, omitting row and column analysis per specification. This is the highest-priority code fix.

**Acceptance Criteria:**
- [ ] `hiddenSingles()` checks rows for hidden singles
- [ ] `hiddenSingles()` checks columns for hidden singles
- [ ] `hiddenSingles()` checks blocks for hidden singles (existing functionality preserved)
- [ ] Test puzzle added that requires row/column hidden singles
- [ ] Algorithm documentation updated (remove limitation note)
- [ ] CLAUDE.md limitation note updated
- [ ] Implementation documented in implementation log

**Dependencies:** None

**Files to Modify:**
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts` (lines 80-99)
- `DOCS/ALGORITHM_Sudoku_Basic_Solver.md` (remove limitation note)
- `CLAUDE.md` (update Known Limitations)

---

#### BACKLOG-002: Implement Automated Test Runner
**Priority:** HIGH | **Estimate:** 16-24 hours | **Sprint:** 2
**Risk Reference:** [Risk 3 - Opus 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started

**Description:**
35+ Gherkin scenarios exist but cannot be executed. Install Cucumber.js and create step definitions.

**Acceptance Criteria:**
- [ ] Cucumber.js installed with TypeScript support
- [ ] Step definitions created for core scenarios (15-20 minimum)
- [ ] All implemented step definitions pass
- [ ] `npm test` script runs all tests
- [ ] Test report generated (HTML or JSON)
- [ ] Documentation updated with test instructions

**Dependencies:**
- BACKLOG-001 (recommended first - ensures correct algorithm behaviour)

**Files to Create:**
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/step_definitions/sudoku_steps.ts`
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/cucumber.js`

**Files to Modify:**
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json` (add dependencies and test script)

---

#### BACKLOG-003: Document Code Review Findings
**Priority:** HIGH | **Estimate:** 2-4 hours | **Sprint:** 1
**Status:** 🔴 Not Started

**Description:**
Create implementation log documenting both code review findings and actions taken.

**Acceptance Criteria:**
- [ ] Implementation log created for second review
- [ ] All 8 risks documented with severity and status
- [ ] Unified implementation strategy documented
- [ ] Sprint reset rationale explained
- [ ] Cross-references to both code reviews

**Dependencies:** None

**Files to Create:**
- `DOCS/.implementation/IMPL_LOG_2026-03-30_Code_Review_Actions.md`

---

### MEDIUM Priority

#### BACKLOG-017: Unify Feature Design Overlap (NEW)
**Priority:** MEDIUM | **Estimate:** 4 hours | **Sprint:** 1
**Risk Reference:** [Risk 5 - Opus 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started

**Description:**
Reconcile the three feature designs (Audit Trail, REST API, Web UI) to share a common change-tracking interface and Express server. Prevent duplicate code before implementation begins.

**Acceptance Criteria:**
- [ ] Shared `CellChange` interface specification agreed across all designs
- [ ] Single Express server approach documented (REST API hosts Web UI)
- [ ] SolveStepTracker defined as adapter over AuditLogger
- [ ] Design documents updated with cross-references
- [ ] TODO task lists updated to reflect shared foundations
- [ ] No contradictions between the three designs

**Dependencies:** None (design-level work)

**Files to Modify:**
- `DOCS/.design/DESIGN_Audit_Trail_Feature.md` (add cross-references)
- `DOCS/.design/DESIGN_REST_API_Wrapper.md` (add cross-references)
- `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` (add cross-references)
- `DOCS/.planning/TODO_Audit_Trail_Feature.md` (update for shared interface)
- `DOCS/.planning/TODO_REST_API_Wrapper.md` (update for unified server)
- `DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md` (update for REST API consumption)

---

#### BACKLOG-005: Extract Magic Numbers to Constants
**Priority:** MEDIUM | **Estimate:** 3-4 hours | **Sprint:** 1
**Risk Reference:** [Risk 6 - Opus 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started

**Description:**
Replace hardcoded values (9, 3, 1-9) with named constants for maintainability.

**Acceptance Criteria:**
- [ ] `app_src/constants.ts` created with GRID_SIZE, BLOCK_SIZE, MIN_DIGIT, MAX_DIGIT, EMPTY_CELL
- [ ] All hardcoded values replaced across 4 source files
- [ ] `npm start` produces identical output (no behavioural change)
- [ ] `npm run build` succeeds

**Dependencies:** None

**Files to Create:**
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/constants.ts`

**Files to Modify:**
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts`
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuOrchestrator.ts`
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuCLI.ts`
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/PuzzleLoader.ts`

---

#### BACKLOG-006: Add ESLint and Prettier
**Priority:** MEDIUM | **Estimate:** 4-6 hours | **Sprint:** 1
**Status:** 🔴 Not Started

**Description:**
Configure automated code formatting and linting for consistent code style.

**Acceptance Criteria:**
- [ ] ESLint installed with TypeScript rules
- [ ] Prettier installed and configured
- [ ] `npm run lint` and `npm run format:check` scripts added
- [ ] All existing code passes linting
- [ ] Configuration documented in CLAUDE.md

**Dependencies:** None

---

#### BACKLOG-004: Setup GitHub Actions CI/CD
**Priority:** MEDIUM | **Estimate:** 4-6 hours | **Sprint:** 3 (after test runner)
**Risk Reference:** [Risk 4 - Opus 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md)
**Status:** ⏸️ Blocked (requires BACKLOG-002)

**Description:**
Minimal GitHub Actions workflow: build validation + test execution + lint check.

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml` created
- [ ] Build step: `npm run build`
- [ ] Test step: `npm test` (when available)
- [ ] Lint step: `npm run lint` (when available)
- [ ] PR status checks visible
- [ ] README updated with CI badge

**Dependencies:**
- BACKLOG-002 (Test Runner) - required
- BACKLOG-006 (ESLint) - recommended

---

#### BACKLOG-007: Decouple Console Output
**Priority:** MEDIUM | **Estimate:** 4-6 hours | **Sprint:** 3
**Risk Reference:** [Risk 7 - Opus 4.6 Review](../DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/02_RISKS_AND_ISSUES.md)
**Status:** 🔴 Not Started

**Description:**
Introduce IOutput interface to decouple console.log. Prerequisite for REST API and testable CLI output.

**Acceptance Criteria:**
- [ ] `IOutput` interface created with `write(message: string)` method
- [ ] `ConsoleOutput` implementation (default)
- [ ] `SudokuCLI` refactored to accept `IOutput` parameter
- [ ] Default behaviour unchanged
- [ ] Unit tests using buffer-based output

**Dependencies:**
- BACKLOG-002 (Test Runner) - recommended for assertion tests

---

#### BACKLOG-008: Implement Audit Trail Feature
**Priority:** MEDIUM | **Estimate:** 20-30 hours | **Sprint:** 3-4
**Design Reference:** [DESIGN_Audit_Trail_Feature.md](../DOCS/.design/DESIGN_Audit_Trail_Feature.md)
**TODO Reference:** [TODO_Audit_Trail_Feature.md](TODO_Audit_Trail_Feature.md)
**Status:** 🔴 Not Started

**Description:**
Implement audit logging per approved design. This is the foundation for the REST API and Web UI change tracking.

**Acceptance Criteria:**
- [ ] AuditTypes.ts with shared CellChange interface (consumed by REST API and Web UI)
- [ ] AuditLogger.ts with iteration tracking and change recording
- [ ] AuditFormatter.ts with JSON export, console summary, detailed output
- [ ] SudokuSolver integration (setAuditLogger, change-logging in algorithms)
- [ ] Algorithm attribution for each change
- [ ] <5% performance overhead
- [ ] Unit and integration tests
- [ ] Documentation updated

**Dependencies:**
- BACKLOG-017 (Design Unification) - ensures shared interface design
- BACKLOG-007 (Output Decoupling) - recommended

---

#### BACKLOG-009: Implement REST API Wrapper
**Priority:** MEDIUM | **Estimate:** 24-32 hours | **Sprint:** 4-5
**Design Reference:** [DESIGN_REST_API_Wrapper.md](../DOCS/.design/DESIGN_REST_API_Wrapper.md)
**TODO Reference:** [TODO_REST_API_Wrapper.md](TODO_REST_API_Wrapper.md)
**Status:** 🔴 Not Started

**Description:**
Implement Express.js REST API. This server will also host the Web UI static files.

**Acceptance Criteria:**
- [ ] Express.js server with health check, CORS, JSON parsing
- [ ] Technique endpoints (unit-completion, hidden-singles, naked-singles)
- [ ] Solve endpoint with step tracking (uses AuditLogger)
- [ ] Puzzle endpoints (list, get by name)
- [ ] Validation endpoint
- [ ] Request validation middleware
- [ ] Error handling middleware
- [ ] API tests (Jest + Supertest)
- [ ] Documentation updated

**Dependencies:**
- BACKLOG-008 (Audit Trail) - required for change tracking
- BACKLOG-007 (Output Decoupling) - required

---

#### BACKLOG-018: Implement Web UI Solver Visualisation (NEW)
**Priority:** MEDIUM | **Estimate:** 20-30 hours | **Sprint:** 5-6
**Design Reference:** [DESIGN_Web_UI_Solver_Visualisation.md](../DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md)
**TODO Reference:** [TODO_Web_UI_Solver_Visualisation.md](TODO_Web_UI_Solver_Visualisation.md)
**Status:** 🔴 Not Started

**Description:**
Build web-based visualization of the solving process. Served from the REST API's Express server.

**Acceptance Criteria:**
- [ ] SolveStepTracker adapts AuditLogger output to frontend format
- [ ] HTML grid display with algorithm colour coding
- [ ] Step-by-step playback controls (next, prev, play, pause)
- [ ] Event log panel with current step highlighting
- [ ] Statistics panel (algorithm breakdown, solve status)
- [ ] Puzzle selector dropdown
- [ ] Responsive design
- [ ] Served from existing REST API Express server (no separate server)

**Dependencies:**
- BACKLOG-009 (REST API) - required (provides Express server and solve API)
- BACKLOG-008 (Audit Trail) - required (provides change tracking data)

---

### LOW Priority (Sprint 7+)

#### BACKLOG-010: Docker Compose for Local Development
**Priority:** LOW | **Estimate:** 8-12 hours | **Sprint:** 7+
**Status:** 🔴 Not Started

**Description:**
Containerize application and development environment.

**Acceptance Criteria:**
- [ ] Dockerfile with multi-stage build
- [ ] docker-compose.yml for development
- [ ] Source code volume mounting
- [ ] Documentation updated

**Dependencies:** None

---

#### BACKLOG-011: Performance Benchmarking Suite
**Priority:** LOW | **Estimate:** 12-16 hours | **Sprint:** 7+
**Status:** 🔴 Not Started

**Description:**
Measure solving performance and track regressions.

**Acceptance Criteria:**
- [ ] Benchmark puzzle set (10+ puzzles)
- [ ] Performance measurement harness
- [ ] Baseline metrics established
- [ ] Regression detection

**Dependencies:**
- BACKLOG-002 (Test Runner)
- BACKLOG-004 (CI/CD)

---

### Future Enhancements (Not Prioritised)

#### BACKLOG-012: Implement Python Version (DEMOAPP002)
**Estimate:** 40-60 hours | **Status:** 📋 Planned

Implement Sudoku solver in Python following the same tech-agnostic specification. Use pytest-bdd for shared Gherkin scenarios.

---

#### BACKLOG-013: Implement C# Version (DEMOAPP003)
**Estimate:** 40-60 hours | **Status:** 📋 Planned

Implement Sudoku solver in C# following the same tech-agnostic specification. Use SpecFlow for shared Gherkin scenarios.

---

#### BACKLOG-014: Advanced Solving Techniques
**Estimate:** 60-80 hours | **Status:** 📋 Planned

Implement Naked Pairs, X-Wing, Swordfish, and other advanced techniques. Requires a new design document.

---

#### BACKLOG-015: Interactive Sudoku Tutor
**Estimate:** 80-120 hours | **Status:** 💡 Idea

Educational web interface with step-by-step explanations, candidate tracking, and algorithm highlighting. Extends the Web UI (BACKLOG-018).

---

#### BACKLOG-016: Puzzle Generator
**Estimate:** 40-60 hours | **Status:** 💡 Idea

Generate valid Sudoku puzzles with configurable difficulty using backtracking and strategic cell removal.

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

### Priority Definitions

- **HIGH:** Critical for project success, blocks other work, or fixes specification gaps
- **MEDIUM:** Important for quality and maintainability, enables future features
- **LOW:** Nice-to-have improvements, optimisation, or convenience features

### Estimation Guidelines

- **1-4 hours:** Simple refactoring, configuration, documentation
- **4-8 hours:** Feature implementation, test addition
- **8-16 hours:** Complex features, integration work
- **16-40 hours:** Major features with design, implementation, testing
- **40+ hours:** Multi-sprint epics, new implementations

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items |
|--------|-------|-------|-----------|
| 1 | 2026-03-30 to 2026-04-13 | Foundation | BACKLOG-001, 003, 005, 006, 017 |
| 2 | 2026-04-14 to 2026-04-27 | Testing | BACKLOG-002 |
| 3 | 2026-04-28 to 2026-05-11 | Audit + Quality | BACKLOG-004, 007, 008 (start) |
| 4 | 2026-05-12 to 2026-05-25 | Audit + API | BACKLOG-008 (finish), 009 (start) |
| 5 | 2026-05-26 to 2026-06-08 | API + Web UI | BACKLOG-009 (finish), 018 (start) |
| 6 | 2026-06-09 to 2026-06-22 | Web UI + Polish | BACKLOG-018 (finish) |
| 7+ | 2026-06-23+ | Infrastructure | BACKLOG-010, 011 |

---

## Tracking and Reporting

### Sprint Metrics (To be tracked)

- **Velocity:** Hours completed per sprint
- **Burndown:** Remaining work vs. time
- **Completion Rate:** Percentage of committed items completed
- **Defect Rate:** Bugs introduced per sprint

### Quality Metrics (To be tracked)

- **Test Coverage:** Line coverage, branch coverage (once test runner is available)
- **Code Quality:** ESLint warnings, TypeScript strict mode compliance
- **Security:** npm audit findings (high/critical)
- **Performance:** Solving time regression

---

**Next Review Date:** 2026-04-13 (End of Sprint 1)

**Backlog Owner:** Project Lead / Development Team
