# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md)

**Reviewer:** AI assistant (CLAUDE Opus 4.6)
**Date:** 2026-03-30T16:30Z

---

## Risk Register

Risks are numbered from highest to lowest priority. Risks carried forward from the prior review are marked with their original risk number for traceability.

---

### Risk 1: Growing Design-Implementation Gap (NEW - HIGH)

**Risk Description/Explanation:**
Three comprehensive design documents (Audit Trail, REST API, Web UI) and three TODO task lists have been created since the first review, but zero lines of implementation code have been written. The backlog shows Sprint 1-2 items (BACKLOG-001 through BACKLOG-003) that were scheduled for 2026-01-30 to 2026-02-13 but remain at "Not Started" status. The project has invested heavily in planning but has not begun execution.

**Evidence Outline:**
- `DOCS/.planning/BACKLOG.md` - Sprint 1-2 items (BACKLOG-001, BACKLOG-002, BACKLOG-003) all show status "Not Started" despite the sprint window having closed ~6 weeks ago
- `DOCS/.design/DESIGN_Audit_Trail_Feature.md` (v1.0, 2026-01-30) - No implementation started
- `DOCS/.design/DESIGN_REST_API_Wrapper.md` (v1.0, 2026-01-30) - No implementation started
- `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` (v1.1, 2026-02-18) - No implementation started
- `git log` shows no commits modifying `app_src/` since project creation

**Impact Analysis:**
- Design documents may become stale as understanding evolves, requiring rework
- Assumptions in designs (e.g., SolveStepTracker behaviour, Express integration) are untested
- Backlog velocity metrics are meaningless with zero completed items
- Pedagogical value is diminished without working implementations of designed features
- Risk of "analysis paralysis" - continued design work instead of implementation

**Refactor Recommendation and Strategy:**
- Freeze new design work until at least one feature is fully implemented
- Start with the smallest, highest-value feature (Audit Trail - Phase 1 only, ~8 hours)
- Update backlog to reflect actual sprint progress and reset sprint numbering
- Adopt a "walking skeleton" approach: implement thin end-to-end slices rather than full phases
- Estimated effort: Organizational (0 code hours, 2 hours planning)

---

### Risk 2: Incomplete Hidden Singles Implementation (CARRIED FORWARD - HIGH, was Risk 1)

**Risk Description/Explanation:**
The `hiddenSingles()` method only checks 3x3 blocks for hidden singles but does not check rows or columns. The algorithm documentation and design specification both describe checking all three unit types (rows, columns, blocks), creating a specification-implementation mismatch.

**Evidence Outline:**

```typescript
// app_src/SudokuSolver.ts (lines 80-99)
public hiddenSingles(target: number): boolean {
    let changed = false;

    // Check each 3x3 block - ONLY CHECKS BLOCKS
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.isNumberInBlock(target, row, col)) continue;
        const candidates = this.getBlockEmptyCells(row, col)
          .filter(cell => !this.isInRow(target, cell.r) && !this.isInCol(target, cell.c));

        if (candidates.length === 1) {
          this.grid[candidates[0].r][candidates[0].c] = target;
          changed = true;
        }
      }
    }

    return changed;
    // Missing: row-based and column-based hidden singles checks
}
```

- `DOCS/ALGORITHM_Sudoku_Basic_Solver.md` (line ~95) documents row, column, AND block checks
- `DOCS/.design/DESIGN_Sudoku_Solver_Specification.md` specifies hidden singles across all unit types
- CLAUDE.md explicitly notes: "Current implementation only checks blocks, not rows/columns"

**Impact Analysis:**
- Reduces the solver's effectiveness - some puzzles solvable with complete hidden singles will be reported as "STUCK_ON_ADVANCED_LOGIC"
- Creates inconsistency between specification and implementation
- The "Logic Squeeze Grid" (medium difficulty) may be solved by other techniques compensating, masking the gap
- Educational value is reduced - students studying the code will see an incomplete algorithm

**Refactor Recommendation and Strategy:**
- Add row-based and column-based hidden singles checks to the `hiddenSingles()` method
- Follow the same pattern as the block check: iterate cells, filter candidates, place if single
- Add test puzzles that specifically require row/column hidden singles to validate
- Estimated effort: 4-6 hours (implementation + testing)

---

### Risk 3: No Automated Test Execution (CARRIED FORWARD - HIGH, was Risk 2)

**Risk Description/Explanation:**
The project has 35+ Gherkin scenarios in `BasicSudokuSolverLogic.feature` but no test runner is configured. There is no `cucumber.js`, `jest`, or any other test framework in `package.json`. The feature file cannot be executed.

**Evidence Outline:**

```json
// package.json - devDependencies (no test framework)
"devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
}
```

```json
// package.json - scripts (no test script)
"scripts": {
    "start": "ts-node app_src/index.ts",
    "build": "tsc",
    "run": "node dist/index.js"
}
```

- `tests/BasicSudokuSolverLogic.feature` contains 35+ scenarios that cannot be run
- No step definition files exist
- No test configuration files (jest.config, cucumber.js, etc.)

**Impact Analysis:**
- Changes to solver algorithms cannot be validated automatically
- Regression testing is entirely manual (run `npm start` and inspect output)
- The comprehensive Gherkin scenarios provide zero value as executable tests
- CI/CD cannot be implemented without a test runner
- Refactoring is risky without automated regression detection

**Refactor Recommendation and Strategy:**
- Install Cucumber.js with TypeScript support: `@cucumber/cucumber`, `ts-node`
- Create step definition files implementing the 35+ Gherkin scenarios
- Add `npm test` script to `package.json`
- Start with the most critical scenarios (algorithm tests, integration tests)
- Estimated effort: 16-24 hours (framework setup + step definitions)

---

### Risk 4: No CI/CD Pipeline (CARRIED FORWARD - MEDIUM, was Risk 3)

**Risk Description/Explanation:**
No GitHub Actions workflow, build validation, or automated quality gates exist. All changes are pushed without automated verification.

**Evidence Outline:**
- No `.github/workflows/` directory exists
- No CI/CD configuration files in the repository
- `DOCS/.planning/BACKLOG.md` lists BACKLOG-004 (GitHub Actions CI/CD) at Sprint 3-4 priority
- `07_MIGRATION_PLANS.md` from the prior review outlined a 7-phase CI/CD plan, none executed

**Impact Analysis:**
- No automated build verification on push or PR
- No automated test execution (compounded by Risk 3)
- No code quality checks (linting, formatting)
- Manual review is the only quality gate
- Increases risk of breaking changes reaching the main branch

**Refactor Recommendation and Strategy:**
- Create a minimal GitHub Actions workflow: TypeScript compilation check (`npm run build`)
- Expand once test runner is available (Risk 3) to include `npm test`
- Add ESLint check as a workflow step
- Estimated effort: 4-6 hours (basic workflow + build check)

---

### Risk 5: Overlapping Feature Designs Without Unified Implementation Strategy (NEW - MEDIUM)

**Risk Description/Explanation:**
The three design documents describe features with significant overlap, but no unified implementation strategy addresses the dependencies:
- The **Web UI** requires step-by-step solve tracking (SolveStepTracker)
- The **Audit Trail** also tracks step-by-step changes (AuditLogger)
- The **REST API** wraps the solver and could serve the Web UI
- The **Web UI** design includes its own Express server, separate from the REST API

**Evidence Outline:**
- `DESIGN_Web_UI_Solver_Visualisation.md` defines `SolveStepTracker` that captures `SolveStep` objects with `{ row, col, previousValue, newValue, algorithm }`
- `DESIGN_Audit_Trail_Feature.md` defines `CellChange` with `{ row, col, previousValue, newValue, algorithm, timestamp, iterationNumber }`
- Both track the same fundamental data (cell changes with algorithm attribution)
- `DESIGN_REST_API_Wrapper.md` defines `POST /api/solve` endpoint; `DESIGN_Web_UI_Solver_Visualisation.md` defines its own `POST /api/solve` endpoint with different response shapes
- `TODO_REST_API_Wrapper.md` Phase 1 creates an Express server; `TODO_Web_UI_Solver_Visualisation.md` Phase 1 also creates an Express server

**Impact Analysis:**
- Implementing features independently will create duplicate code (two Express servers, two change trackers)
- The SolveStepTracker and AuditLogger serve nearly identical purposes but have different interfaces
- Integrating features after independent implementation will require significant refactoring
- The REST API's solve endpoint and the Web UI's solve endpoint will diverge

**Refactor Recommendation and Strategy:**
- Unify the change tracking: implement AuditLogger first, then build SolveStepTracker as a thin adapter
- Implement REST API server first, then serve the Web UI from the same Express instance
- Define a shared implementation order: (1) Audit Trail core, (2) REST API with audit integration, (3) Web UI consuming REST API
- Update design documents to cross-reference the unified approach
- Estimated effort: 4 hours (design alignment) + implementation time

---

### Risk 6: Magic Numbers and Hardcoded Constants (CARRIED FORWARD - LOW-MEDIUM, was Risk 4)

**Risk Description/Explanation:**
Grid size (9), block size (3), and digit range (1-9) are hardcoded throughout the solver code.

**Evidence Outline:**

```typescript
// app_src/SudokuSolver.ts - examples of hardcoded values
for (let r = 0; r < 9; r++) {           // line 31 - grid size
for (let c = 0; c < 9; c++) {           // line 42 - grid size
for (let br = 0; br < 3; br++) {        // line 52 - block count
const startRow = br * 3;                 // line 139 - block size
new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9])  // line 155 - digit range
for (let i = 1; i <= 9; i++) {           // line 175 - digit range
```

- Also present in `SudokuOrchestrator.ts` (line 37: `digit <= 9`), `SudokuCLI.ts` (line 21: `i < 9`), `PuzzleLoader.ts` (line 43: `length !== 9`)

**Impact Analysis:**
- Violates DRY principle across 4 source files
- Prevents future support for variant grid sizes (4x4, 16x16)
- Makes the relationship between 9 (grid size) and 3 (block size) implicit
- Low immediate risk since the project only targets standard 9x9 Sudoku

**Refactor Recommendation and Strategy:**
- Create a `constants.ts` file with `GRID_SIZE = 9`, `BLOCK_SIZE = 3`, `DIGITS = [1..9]`
- Replace all hardcoded values with named constants
- Estimated effort: 3-4 hours

---

### Risk 7: Console Output Coupling (CARRIED FORWARD - LOW, was Risk 5)

**Risk Description/Explanation:**
`SudokuCLI` directly uses `console.log()` with no abstraction, preventing output redirection and limiting testability.

**Evidence Outline:**

```typescript
// app_src/SudokuCLI.ts (lines 21-33)
public displayGrid(): void {
    console.log(`\n--${this.solver.name}----`);
    console.log("\n-------------------------");
    for (let i = 0; i < 9; i++) {
        // ... builds rowString ...
        console.log(rowString);
```

- 10 direct `console.log()` calls in `SudokuCLI.ts`
- 7 direct `console.log()` calls in `index.ts`
- No output interface or abstraction

**Impact Analysis:**
- Cannot redirect output to file, buffer, or test assertion without monkey-patching console
- Testing CLI output requires capturing stdout
- The Audit Trail and REST API designs both introduce alternative output channels, making this coupling more problematic
- Low immediate risk for current CLI-only usage

**Refactor Recommendation and Strategy:**
- Introduce an `IOutput` interface with `write(message: string)` method
- Inject into `SudokuCLI` constructor: `constructor(solver: SudokuSolver, output: IOutput = new ConsoleOutput())`
- This is listed as BACKLOG-007 and is a recommended prerequisite for the REST API feature
- Estimated effort: 4-6 hours

---

### Risk 8: Backlog Sprint Dates Are Stale (NEW - LOW)

**Risk Description/Explanation:**
The backlog references Sprint 1-2 (2026-01-30 to 2026-02-13) as the "Current Sprint" but this sprint window closed over 6 weeks ago. Sprint assignments for future items reference Sprint 3-8 with dates that have also passed.

**Evidence Outline:**
- `DOCS/.planning/BACKLOG.md` header: "Current Sprint: Sprint 1-2 (2026-01-30 to 2026-02-13)"
- BACKLOG-001, 002, 003 are all "Not Started" despite being assigned to Sprint 1-2
- BACKLOG-004 references Sprint 3-4, BACKLOG-005/006 reference Sprint 3 - all past dates

**Impact Analysis:**
- Backlog does not reflect reality, reducing its usefulness as a planning tool
- Sprint velocity metrics will be misleading
- New contributors may be confused by stale sprint assignments

**Refactor Recommendation and Strategy:**
- Reset sprint numbering and dates to start from current date
- Move incomplete Sprint 1-2 items to the new Sprint 1
- Re-estimate based on available capacity and implementation order
- Estimated effort: 1-2 hours

---

## Risk Summary Table

| # | Risk | Severity | Status | Estimated Effort |
|---|------|----------|--------|-----------------|
| 1 | Design-Implementation Gap | HIGH | NEW | 2h planning |
| 2 | Incomplete Hidden Singles | HIGH | CARRIED (was #1) | 4-6h |
| 3 | No Automated Test Execution | HIGH | CARRIED (was #2) | 16-24h |
| 4 | No CI/CD Pipeline | MEDIUM | CARRIED (was #3) | 4-6h |
| 5 | Overlapping Feature Designs | MEDIUM | NEW | 4h design |
| 6 | Magic Numbers | LOW-MEDIUM | CARRIED (was #4) | 3-4h |
| 7 | Console Output Coupling | LOW | CARRIED (was #5) | 4-6h |
| 8 | Stale Backlog Dates | LOW | NEW | 1-2h |

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md)

*Reviewer: AI assistant (CLAUDE Opus 4.6)*
