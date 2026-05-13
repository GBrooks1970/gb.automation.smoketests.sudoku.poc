# Migration Plans

[<- Back to Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md)

**Reviewer:** AI assistant (CLAUDE Sonnet 4.6)
**Date:** 2026-05-13T22:17Z

---

## Plan 1: Sprint 2 - Close the Persistent Risks

A focused single-sprint plan to resolve the two HIGH risks that have been carried through all
three code reviews. Sprint 2 should be sequenced and not start additional features until
Steps 1-5 are complete.

### Step 1: Centralize Constants (2 hours)

- Create `app_src/constants.ts` with: `GRID_SIZE = 9`, `BLOCK_SIZE = 3`,
  `EMPTY_CELL = 0`, `MIN_DIGIT = 1`, `MAX_DIGIT = 9`
- Remove `export const GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL` from `SudokuSolver.ts`
- Update all 5 source files: import from `./constants` (or `../constants` as needed)
- Validates: `npm run build` clean, `npm run lint` clean, `npm start` output identical
- Closes BACKLOG-005 fully (all acceptance criteria met)

### Step 2: Add Prettier (1-2 hours)

- `npm install --save-dev prettier eslint-config-prettier`
- Create `.prettierrc` with: 2-space indent, single quotes, trailing commas for ES5
- Add `"format": "prettier --write app_src/**/*.ts"` and `"format:check": "prettier --check app_src/**/*.ts"` to `package.json` scripts
- Update `eslint.config.js` to spread `eslintConfigPrettier` last to disable conflicting rules
- Run `npm run format` to apply formatting baseline
- Closes BACKLOG-006 fully

### Step 3: Complete Hidden Singles (4-6 hours)

- In `SudokuSolver.hiddenSingles()`, after the existing block loop, add:
  - Row loop: for each row 0..GRID_SIZE-1, find cells not already containing `target`,
    filter by isInCol and isNumberInBlock exclusions, place if count === 1
  - Column loop: for each col 0..GRID_SIZE-1, find cells not already containing `target`,
    filter by isInRow and isNumberInBlock exclusions, place if count === 1
- Add new puzzle to `puzzles.json` that is unsolvable with blocks-only hidden singles
  but solvable with row/column hidden singles (verify it solves after fix)
- Update `CLAUDE.md` Known Limitations: remove the hidden singles row/column note
- Update `DOCS/ALGORITHM_Sudoku_Basic_Solver.md`: confirm row/column checking is complete
- Closes BACKLOG-001 fully

### Step 4: Create Implementation Log (1 hour)

- Create `DOCS/.implementation/IMPL_LOG_2026-05-13_Sprint2_Foundations.md`
- Document: constants refactor (why constants.ts over SudokuSolver.ts), Prettier config
  choices, Hidden Singles fix approach, decisions from the naming conventions cycle
- Closes BACKLOG-003

### Step 5: Implement Test Runner (16-24 hours)

- `npm install --save-dev @cucumber/cucumber @cucumber/pretty-formatter`
- Create `tests/step_definitions/` directory
- Create `tests/step_definitions/solver_steps.ts` with step definitions for:
  - Background: "a standard 9x9 Sudoku grid is initialized"
  - Integration scenarios first (4 scenarios: Easy Scan, Logic Squeeze, Minimal Clues, Empty)
  - Unit Completion scenarios (4 scenarios)
  - Hidden Singles scenarios (5 scenarios - validates Step 3 fix)
  - Naked Singles scenarios (3 scenarios)
  - PuzzleLoader scenarios (7 scenarios)
- Create `cucumber.js` configuration file
- Add `"test": "cucumber-js"` to `package.json` scripts
- Closes BACKLOG-002

### Step 6: Minimal CI Workflow (2-3 hours)

- Create `.github/workflows/ci.yml`:
  - Trigger: push and pull_request
  - Node.js 20 setup
  - `npm ci`
  - `npm run lint`
  - `npm run build`
  - `npm test` (now available from Step 5)
- Add CI badge to `README.md`
- Closes BACKLOG-004 (first stage - build + lint + test)

### Sprint 2 Total Estimate: 26-38 hours

```
Step 1: Constants (2h)    -> Step 3: Hidden Singles (4-6h)  -> Step 5: Test Runner (16-24h)
Step 2: Prettier (1-2h)   ->                                  Step 6: CI (2-3h)
                           -> Step 4: Impl Log (1h)
```

Steps 1 and 2 can be done in parallel. Steps 3 and 4 depend on Step 1.
Step 5 depends on Step 3. Step 6 depends on Step 5.

---

## Plan 2: Feature Implementation (Post Sprint 2)

With the test runner and algorithm correctness resolved, feature implementation can proceed
with confidence. The sequencing from the Opus 4.6 Migration Plan 1 remains valid.

### Phase 1: Console Output Decoupling (Sprint 3, 4-6 hours)

- Implement `IOutput` interface and `ConsoleOutput` class in `app_src/output/`
- Refactor `SudokuCLI` to accept `IOutput` in its constructor
- Prerequisite for REST API (cannot test API response generation through console)
- Closes BACKLOG-007

### Phase 2: Audit Trail Core (Sprint 3-4, 20-30 hours)

- Implement `AuditTypes.ts` with shared `CellChange` interface (the foundation for API and UI)
- Implement `AuditLogger.ts` and `AuditFormatter.ts`
- Integrate `setAuditLogger()` into `SudokuSolver`
- Add audit trail scenarios to the feature file; implement step definitions
- Closes BACKLOG-008

### Phase 3: REST API (Sprint 4-5, 24-32 hours)

- Create Express.js server that will also serve the Web UI
- Implement `SudokuApiService` using `AuditLogger` for change tracking
- Implement all route handlers: techniques, solve, puzzles, validate
- Jest + Supertest API tests
- Closes BACKLOG-009

### Phase 4: Web UI (Sprint 5-6, 20-30 hours)

- Implement `SolveStepTracker` as an adapter over `AuditLogger`
- Serve static HTML/CSS/JS from the existing REST API Express server
- Grid display, step-by-step playback, event log, statistics panel
- Closes BACKLOG-018

### Phase 5: Polish and Performance (Sprint 7, 12-16 hours)

- Docker Compose for local development (BACKLOG-010)
- Performance benchmarking (BACKLOG-011)
- Complete all remaining Gherkin step definitions (any not covered in prior phases)
- Update all documentation to reflect final state

---

## Plan 3: Technical Debt Prevention Strategy

Going forward, the following practices will prevent recurrence of the issues found in this review.

### Practice 1: Sprint Completion Discipline

- A sprint item is only started when all its acceptance criteria can be completed in the sprint
- Partial completions (like BACKLOG-005 and BACKLOG-006 this cycle) create more risk than
  deferring the item to the next sprint
- If a sprint item cannot be fully completed, its scope should be reduced before starting

### Practice 2: Implementation Log on Every Sprint Close

- Create an implementation log entry at the end of every sprint documenting:
  - Decisions made (e.g., why constants.ts location was chosen)
  - Items completed vs. deferred
  - Known gaps for the next sprint
- This prevents the knowledge gap that occurred with the naming conventions cycle

### Practice 3: Acceptance Criteria Verification Before Marking Complete

- Before marking a backlog item complete, explicitly verify each acceptance criterion
- BACKLOG-005 had "app_src/constants.ts created" as a criterion; if this had been checked
  before closing the item, the deviation would have been caught immediately

### Practice 4: CI First, Then Tests

- The minimal CI workflow (build + lint) can be created immediately, without waiting for the
  test runner. This provides a quality gate that catches TypeScript errors and naming violations
  on every push.
- Do not wait for a "complete" CI pipeline before starting CI. Start minimal and expand.

### Practice 5: CLAUDE.md Currency Check at Sprint Close

- At the end of each sprint, review CLAUDE.md for sections that are now stale
- Known Limitations, Planned Features, and Development Commands sections tend to drift
- A 15-minute CLAUDE.md review at sprint close prevents cumulative documentation debt

---

## Plan Summary

| Plan | Scope | Sprints | Effort | Priority |
|------|-------|---------|--------|----------|
| 1. Sprint 2: Close Persistent Risks | Constants, Prettier, Hidden Singles, Test Runner, CI | 1 sprint | 26-38h | IMMEDIATE |
| 2. Feature Implementation | Console Output, Audit Trail, REST API, Web UI | 4-5 sprints | 70-100h | Post Sprint 2 |
| 3. Technical Debt Prevention | Process practices | Ongoing | 0h extra | IMMEDIATE |

---

[<- Back to Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md)

*Reviewer: AI assistant (CLAUDE Sonnet 4.6)*
