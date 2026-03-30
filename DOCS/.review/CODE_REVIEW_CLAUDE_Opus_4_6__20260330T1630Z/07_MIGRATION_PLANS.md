# Migration Plans

[<- Back to Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md)

**Reviewer:** AI assistant (CLAUDE Opus 4.6)
**Date:** 2026-03-30T16:30Z

---

## Plan 1: Unified Feature Implementation Strategy

A coordinated implementation order that addresses feature overlap (Risk 5) and maximizes code reuse across the three designed features.

### Phase 1: Foundation (Sprint 1, Weeks 1-2)

- **Complete Hidden Singles** - Fix the row/column gap in `SudokuSolver.hiddenSingles()`. This ensures all downstream features (audit, API, UI) track correct algorithm behaviour.
- **Extract Constants** - Create `constants.ts` to remove magic numbers before new code references them.
- **Add ESLint/Prettier** - Establish code quality standards before adding significant new code.
- **Reset Backlog** - Update sprint dates and assignments to reflect current reality.
- **Deliverable:** Corrected solver, clean codebase, updated backlog.

### Phase 2: Test Infrastructure (Sprint 2, Weeks 3-4)

- **Install Cucumber.js** - Add test framework with TypeScript support.
- **Create Core Step Definitions** - Implement step definitions for the most critical 15-20 scenarios (algorithm tests, integration tests).
- **Add npm test Script** - Enable `npm test` to run all implemented scenarios.
- **Deliverable:** Executable test suite with 15-20+ passing scenarios.

### Phase 3: Audit Trail Core (Sprint 3, Weeks 5-6)

- **Implement AuditTypes.ts** - Define shared `CellChange`, `AuditEvent`, `AuditTrail` interfaces. Design these to be consumed by both the Audit Trail formatter and the Web UI's SolveStepTracker.
- **Implement AuditLogger.ts** - Core logging class with iteration tracking and change recording.
- **Integrate With Solver** - Add `setAuditLogger()` to `SudokuSolver`, add change-logging calls in algorithm methods.
- **Implement AuditFormatter.ts** - Console summary, detailed output, and JSON export.
- **Add Audit Trail Tests** - Cucumber scenarios for audit logging behaviour.
- **Deliverable:** Working audit trail with JSON export, integrated into solver.

### Phase 4: REST API (Sprint 4-5, Weeks 7-10)

- **Create Express Server** - Single server that will also host the Web UI in Phase 5. Include health check, CORS, JSON parsing.
- **Implement SudokuApiService** - Service layer wrapping solver operations. Use AuditLogger internally to track changes for API responses.
- **Implement Route Handlers** - Technique endpoints, solve endpoint, puzzle endpoints, validate endpoint.
- **Add API Tests** - Jest + Supertest integration tests for all endpoints.
- **Deliverable:** Working REST API serving technique and solve endpoints with change tracking.

### Phase 5: Web UI (Sprint 6-7, Weeks 11-14)

- **Implement SolveStepTracker** - Thin adapter over AuditLogger that formats audit events into `SolveStep` objects for the frontend.
- **Serve Static Files From REST API Server** - Add static file serving to the existing Express server rather than creating a new server.
- **Build Frontend** - HTML grid, CSS styling, JavaScript modules for playback, event log, and statistics.
- **Add API Route For Step-By-Step Solve** - Extend the existing `/api/solve` endpoint to return steps (or add `/api/solve/steps`).
- **Deliverable:** Working web visualization consuming the REST API.

### Phase 6: CI/CD and Polish (Sprint 8, Weeks 15-16)

- **GitHub Actions Workflow** - Build, lint, and test pipeline.
- **Complete Remaining Step Definitions** - Implement all 35+ Gherkin scenarios.
- **Performance Baselines** - Measure solver speed and audit overhead.
- **Update Documentation** - Implementation logs, CLAUDE.md updates, design document status updates.
- **Deliverable:** Fully automated build and test pipeline.

### Key Principle: Shared Foundations

```
Phase 1: Solver fixes + Constants + Linting
    |
Phase 2: Test Infrastructure (Cucumber.js)
    |
Phase 3: Audit Trail Core (shared CellChange interface)
    |           \
Phase 4: REST API (uses AuditLogger for change tracking)
    |           |
Phase 5: Web UI (SolveStepTracker adapts AuditLogger, served by REST API server)
    |
Phase 6: CI/CD + Polish
```

---

## Plan 2: GitHub Actions CI/CD Pipeline

Progressive CI/CD implementation aligned with the unified feature implementation phases.

### Stage 1: Build Validation (Phase 1 Deliverable)

- **Trigger:** Push to any branch, PR to main
- **Steps:** Checkout, install dependencies, `npm run build` (TypeScript compilation)
- **Purpose:** Ensure TypeScript compiles without errors on every change
- **Estimated setup:** 2 hours
- **File:** `.github/workflows/ci.yml`

### Stage 2: Automated Testing (Phase 2 Deliverable)

- **Add To Pipeline:** `npm test` step after build
- **Test Reporter:** Cucumber HTML/JSON report generation
- **Failure Behaviour:** Block PR merge if tests fail
- **Coverage:** Upload Cucumber report as workflow artifact
- **Estimated setup:** 2 hours (add to existing workflow)

### Stage 3: Code Quality (Phase 6 Deliverable)

- **Add To Pipeline:** `npm run lint` step
- **TypeScript Strict Check:** Verify no `any` types introduced
- **Dependency Audit:** `npm audit` for vulnerability scanning
- **Estimated setup:** 2 hours (add to existing workflow)

### Stage 4: Documentation Validation (Future)

- **Link Checker:** Validate all markdown cross-references resolve
- **Schema Validation:** Ensure puzzles.json conforms to expected structure
- **Design Document Linting:** Check for required sections in design documents
- **Estimated setup:** 4 hours

### Stage 5: API and Performance (Future)

- **API Contract Testing:** Run Supertest suite against REST API
- **Performance Regression:** Compare solver speed against baselines
- **Audit Overhead Check:** Verify <5% overhead target
- **Estimated setup:** 4 hours

### Target Pipeline Structure

```yaml
# .github/workflows/ci.yml (target state)
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - run: npm audit --audit-level=moderate
```

---

## Plan 3: Multi-Language Implementation Strategy

Strategy for implementing the Sudoku solver in Python and C# while maintaining specification parity.

### Guiding Principles

- **Single Specification, Multiple Implementations** - `DESIGN_Sudoku_Solver_Specification.md` remains the canonical reference for all implementations
- **Shared Test Scenarios** - The Gherkin feature file should work across all implementations (same scenarios, language-specific step definitions)
- **Consistent Architecture** - Each implementation follows the same class structure (Solver, Orchestrator, CLI/UI, Loader) adapted to language idioms
- **Independent Repositories or Monorepo Directories** - Each language implementation lives in its own `DEMOAPP00X_*` directory

### Python Implementation (BACKLOG-012)

- **Framework:** Python 3.10+, pytest-bdd for Gherkin scenarios
- **Directory:** `DEMOAPPS/DEMOAPP002_PYTHON_PYTEST/`
- **Key Differences:** Use type hints (`list[list[int]]` instead of `number[][]`), use `json` module instead of `PuzzleLoader` class (if Pythonic), adapt Set operations
- **Testing:** Share the same `.feature` file with Python step definitions
- **Estimated effort:** 16-24 hours

### C# Implementation (BACKLOG-013)

- **Framework:** .NET 8, SpecFlow for Gherkin scenarios
- **Directory:** `DEMOAPPS/DEMOAPP003_CSHARP_SPECFLOW/`
- **Key Differences:** Use `int[,]` or `int[][]` for grids, proper interfaces (`ISudokuSolver`, `IPuzzleLoader`), dependency injection via constructor
- **Testing:** Share the same `.feature` file with C# step definitions via SpecFlow
- **Estimated effort:** 16-24 hours

### Parity Validation

- **Same Puzzles:** All implementations use the same `puzzles.json` (or equivalent format)
- **Same Expected Results:** Easy=SOLVED, Medium=SOLVED, Hard=STUCK, Empty=STUCK
- **Same Gherkin Scenarios:** 35+ scenarios validate identical behaviour across languages
- **Cross-Language CI:** GitHub Actions matrix build testing all implementations

### Implementation Order

```
1. TypeScript (DONE - current implementation)
      |
2. Python (natural second choice - rapid development, pytest-bdd ecosystem)
      |
3. C# (third choice - SpecFlow ecosystem, enterprise patterns)
      |
4. Cross-language parity testing (shared feature file, matrix CI)
```

---

## Plan Summary

| Plan | Scope | Sprints | Effort | Dependencies |
|------|-------|---------|--------|-------------|
| 1. Unified Features | Audit + API + UI | 8 sprints | ~100-120 hours | Sequential (phases build on each other) |
| 2. CI/CD Pipeline | GitHub Actions | 5 stages | ~14 hours | Stages 2+ depend on Plan 1 phases |
| 3. Multi-Language | Python + C# | 4-6 sprints | ~40-60 hours | Plan 1 Phase 1 (correct spec) |

---

[<- Back to Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md)

*Reviewer: AI assistant (CLAUDE Opus 4.6)*
