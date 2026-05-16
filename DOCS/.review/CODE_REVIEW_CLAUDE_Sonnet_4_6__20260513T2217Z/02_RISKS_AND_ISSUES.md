# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md)

**Reviewer:** AI assistant (CLAUDE Sonnet 4.6)
**Date:** 2026-05-13T22:17Z

---

## Risk Register

Risks are numbered from highest to lowest priority. Prior review risk numbers are included in
parentheses for traceability. Status column reflects current state as of this review.

---

### Risk 1: Incomplete Hidden Singles Implementation (CARRIED FORWARD HIGH - Opus4.6 Risk 2)

**Status:** OPEN - unresolved across three code reviews

**Risk Description/Explanation:**
The `hiddenSingles()` method only checks 3x3 blocks but does not check rows or columns. The
specification, algorithm documentation, and CLAUDE.md all acknowledge this gap. Three consecutive
code reviews have flagged this as HIGH priority. No action has been taken.

**Evidence Outline:**

```typescript
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts (lines 82-98)
public hiddenSingles(target: number): boolean {
    let changed = false;

    // Check each 3x3 block - ONLY CHECKS BLOCKS, NOT ROWS OR COLUMNS
    for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
      for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
        if (this.isNumberInBlock(target, blockRow, blockCol)) continue;
        const candidates = this.getBlockEmptyCells(blockRow, blockCol)
          .filter(cell => !this.isInRow(target, cell.row) && !this.isInCol(target, cell.col));

        if (candidates.length === 1) {
          this.grid[candidates[0].row][candidates[0].col] = target;
          changed = true;
        }
      }
    }
    // Missing: row-based and column-based hidden singles checks
    return changed;
  }
```

- `CLAUDE.md` (Known Limitations section): "Hidden Singles: Only checks 3x3 blocks, not rows/columns (incomplete implementation)"
- `DOCS/ALGORITHM_Sudoku_Basic_Solver.md`: Documents row, column, AND block checks
- `DOCS/.planning/BACKLOG.md` BACKLOG-001: "Not Started" since first sprint

**Impact Analysis:**
- Solver cannot find hidden singles in rows or columns, reducing solve effectiveness
- The "Logic Squeeze Grid" (medium) may be compensating via Naked Singles, masking the gap
- Algorithm correctness is demonstrably incomplete relative to specification
- Cannot validly claim "full basic technique implementation" in any documentation

**Refactor Recommendation and Strategy:**
- Add row-check loop: for each row, find empty cells where the target is not excluded by
  column or block constraints; place if exactly one candidate remains
- Add column-check loop: same pattern transposed
- Follow the identical filter pattern already used for block checks
- Add a test puzzle to `puzzles.json` that requires row/column hidden singles to solve
- Estimated effort: 4-6 hours including test puzzle and documentation updates

---

### Risk 2: No Automated Test Execution (CARRIED FORWARD HIGH - Opus4.6 Risk 3)

**Status:** OPEN - unresolved across three code reviews

**Risk Description/Explanation:**
35+ Gherkin scenarios exist in `BasicSudokuSolverLogic.feature` but no test runner, step
definitions, or test configuration exists. The scenarios are documentation only.

**Evidence Outline:**

```json
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json - scripts section
"scripts": {
    "start": "ts-node app_src/index.ts",
    "build": "tsc",
    "run": "node dist/index.js",
    "lint": "eslint app_src/**/*.ts"
}
```

- No `test` script in `package.json`
- No step definition files anywhere in the project
- No `cucumber.js`, `jest.config.ts`, or equivalent configuration file
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/` contains only the `.feature` file

**Impact Analysis:**
- Risk 1 (Hidden Singles) cannot be automatically validated even when fixed
- The naming convention changes (this cycle) had no automated regression check
- No test safety net exists for any future code changes
- All 35+ carefully authored scenarios provide zero automated protection

**Refactor Recommendation and Strategy:**
- Install `@cucumber/cucumber` with TypeScript support: add to `devDependencies`
- Create `tests/step_definitions/sudoku_steps.ts` implementing core step definitions
- Add `npm test` script to `package.json`
- Start with the 4 integration test scenarios and the 4 unit completion scenarios
  as the highest-value, lowest-effort starting point (8 scenarios, ~4-6 hours)
- Full 35+ step definitions can be completed incrementally: ~16-24 total hours

---

### Risk 3: Constants Not Centralized - PuzzleLoader Gap (NEW LOW-MEDIUM)

**Status:** NEW - created by partial implementation of BACKLOG-005

**Risk Description/Explanation:**
The constants work (BACKLOG-005) updated `SudokuSolver.ts`, `SudokuOrchestrator.ts`, and
`SudokuCLI.ts` but did not update `PuzzleLoader.ts`. The validator still uses hardcoded `9`
in three places. Additionally, having constants exported from `SudokuSolver.ts` means any
class wanting `GRID_SIZE` must import from the solver class, which is semantically wrong.

**Evidence Outline:**

```typescript
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/PuzzleLoader.ts (lines 51-53, 56)
if (!puzzle.grid || puzzle.grid.length !== 9) {
    throw new Error(`Puzzle "${puzzle.name}" (index ${index}) must have exactly 9 rows`);
}
puzzle.grid.forEach((row, rowIndex) => {
    if (row.length !== 9) {
```

```typescript
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuOrchestrator.ts (line 1)
import { SudokuSolver, GRID_SIZE, EMPTY_CELL } from "./SudokuSolver";
// SudokuOrchestrator imports grid constants from the solver class file
// Architecturally: a coordinator should not depend on the solver for constants
```

- BACKLOG-005 acceptance criteria: "app_src/constants.ts created" - criterion NOT met
- BACKLOG-005 acceptance criteria: "All hardcoded values replaced across 4 source files" -
  criterion NOT met (PuzzleLoader still has hardcoded 9)

**Impact Analysis:**
- Partial completion of BACKLOG-005 means the acceptance criteria are not fully satisfied
- `SudokuOrchestrator` and `SudokuCLI` have an implicit dependency on `SudokuSolver.ts`
  for constants, coupling modules that should be independent
- When implementing the REST API or Audit Trail, new files will face the same awkwardness
- `PuzzleLoader` validation messages will become incorrect if grid size ever changes

**Refactor Recommendation and Strategy:**
- Create `app_src/constants.ts` with `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`,
  `MIN_DIGIT = 1`, `MAX_DIGIT = 9` as exported constants
- Remove constant exports from `SudokuSolver.ts` and replace with imports from `constants.ts`
- Update all 4 source files to import from `constants.ts`
- This is a ~2 hour refactor and fully completes BACKLOG-005
- Estimated effort: 2 hours

---

### Risk 4: No CI/CD Pipeline (CARRIED FORWARD MEDIUM - Opus4.6 Risk 4)

**Status:** OPEN - unresolved, but ESLint is now in place as a quality step

**Risk Description/Explanation:**
No GitHub Actions workflow exists. ESLint has now been added (reducing the scope of Risk 4
from prior review), but there is no automated execution of build or lint checks on push or PR.

**Evidence Outline:**
- No `.github/workflows/` directory in the repository
- `npm run build` and `npm run lint` both pass locally but are never run automatically
- BACKLOG-004 remains "Blocked (requires BACKLOG-002)" in backlog

**Impact Analysis:**
- The naming convention changes were not verified by any CI gate before merging
- Without a build check, a breaking TypeScript change could be committed undetected
- The ESLint rule protects naming conventions at local run time only

**Refactor Recommendation and Strategy:**
- Create a minimal `.github/workflows/ci.yml` with build and lint steps only
  (does not require test runner - build + lint alone is valuable)
- Estimated effort: 2-3 hours (minimal workflow, no test runner required)
- This unblocks CI foundation ahead of test runner availability

---

### Risk 5: ESLint Without Prettier (NEW LOW-MEDIUM)

**Status:** NEW - created by partial implementation of BACKLOG-006

**Risk Description/Explanation:**
BACKLOG-006 specified both ESLint (naming/quality rules) and Prettier (code formatting).
ESLint was installed and configured correctly. Prettier was not added. Code formatting
consistency is still manual (no `npm run format:check` or `npm run format` scripts).

**Evidence Outline:**

```json
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json
"devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^8.59.3",
    "@typescript-eslint/parser": "^8.59.3",
    "eslint": "^10.3.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
}
// No prettier, eslint-config-prettier, or @prettier/plugin-*
```

- BACKLOG-006 acceptance criteria: "Prettier installed and configured" - NOT met
- BACKLOG-006 acceptance criteria: "`npm run format:check` script added" - NOT met

**Impact Analysis:**
- Indentation and formatting drift is still possible between contributors
- The ESLint config does not include `eslint-config-prettier` to prevent rule conflicts
  with Prettier (when Prettier is eventually added)
- BACKLOG-006 completion criteria remain partially unmet

**Refactor Recommendation and Strategy:**
- Install `prettier`, `eslint-config-prettier`
- Create `.prettierrc` with project-specific settings
- Add `format` and `format:check` scripts to `package.json`
- Add `eslint-config-prettier` to the `eslint.config.js` extends list
- Estimated effort: 1-2 hours

---

### Risk 6: Dead Code - SudokuSolver.named() (CARRIED FORWARD LOW - Opus4.6 Project Review)

**Status:** OPEN - unchanged

**Risk Description/Explanation:**
The static factory method `SudokuSolver.named()` has existed since project creation and has
never been called. No test, no entry point, no CLI uses it.

**Evidence Outline:**

```typescript
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts (lines 17-19)
static named(name: string = "S000", origGrid: number[][] = Array.from(
    { length: GRID_SIZE }, () => Array(GRID_SIZE).fill(EMPTY_CELL)
)): SudokuSolver {
    return new SudokuSolver(name, origGrid);
}
```

- `index.ts` uses `new SudokuSolver(puzzle.name, puzzle.grid)` directly, not `SudokuSolver.named()`
- No other file calls `SudokuSolver.named()`
- ESLint naming-convention rule does not catch unused code (that requires `@typescript-eslint/no-unused-vars` or TypeScript's `noUnusedLocals`)

**Impact Analysis:**
- Minor dead code that adds noise to the public API surface
- Could be removed immediately without any impact

**Refactor Recommendation and Strategy:**
- Either remove `SudokuSolver.named()` entirely, or use it in `index.ts` to replace the
  constructor calls (`SudokuSolver.named(puzzle.name, puzzle.grid)`)
- Using it in `index.ts` would justify its existence and demonstrate the factory pattern
- Estimated effort: 30 minutes

---

### Risk 7: Console Output Coupling (CARRIED FORWARD LOW - Opus4.6 Risk 7)

**Status:** OPEN - unchanged

**Risk Description/Explanation:**
`SudokuCLI` uses `console.log()` directly. `index.ts` uses `console.log()` and
`console.error()` directly. No output abstraction exists.

**Evidence Outline:**

```typescript
// DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuCLI.ts (lines 19, 20, 28, 29, 37-41, 44, 46)
// 9 direct console.log() calls
console.log(`\n--${this.solver.name}----`);
console.log("\n-------------------------");
// ...
```

- `SudokuCLI.ts`: 9 `console.log()` calls
- `index.ts`: 7 `console.log()` calls, 2 `console.error()` calls

**Impact Analysis:**
- Cannot assert against output in step definitions without capturing stdout
- REST API and Audit Trail features will need structured output, making this coupling more costly
- Testing the CLI's display logic requires monkey-patching or stdout capture

**Refactor Recommendation and Strategy:**
- Add `IOutput` interface to decouple console dependency
- Recommended prerequisite for REST API implementation (BACKLOG-007)
- Estimated effort: 4-6 hours

---

### Risk 8: No Implementation Logs for Recent Cycles (NEW LOW)

**Status:** NEW

**Risk Description/Explanation:**
The project has one implementation log (`IMPL_LOG_2026-01-30_Initial_Project_Creation.md`)
covering the original setup. No log was created for the Opus 4.6 review cycle (2026-03-30
to 2026-05-13), and no log was created for the naming conventions work completed 2026-05-13.
BACKLOG-003 ("Document Code Review Findings") has been "Not Started" since Sprint 1.

**Evidence Outline:**
- `DOCS/.implementation/` contains only `IMPL_LOG_2026-01-30_Initial_Project_Creation.md`
  and `TEMPLATE_Implementation_Log.md` and `README.md`
- BACKLOG-003 status: "Not Started" in current backlog
- No log documents the constants work, naming conventions work, or ESLint configuration

**Impact Analysis:**
- No audit trail of decisions made during the naming conventions work
- Future reviewers cannot understand why constants were put in `SudokuSolver.ts` rather than
  `constants.ts`, or why Prettier was omitted from BACKLOG-006
- Implementation logs serve as institutional memory; the absence creates knowledge gaps

**Refactor Recommendation and Strategy:**
- Create `IMPL_LOG_2026-05-13_Naming_Conventions_And_Review.md` documenting this cycle
- Move BACKLOG-003 to immediate status
- Estimated effort: 1 hour

---

## Risk Summary Table

| # | Risk | Severity | Status | Prior Review | Change This Cycle | Est. Effort |
|---|------|----------|--------|-------------|-------------------|-------------|
| 1 | Incomplete Hidden Singles | HIGH | OPEN | Opus4.6 Risk 2 | Unchanged | 4-6h |
| 2 | No Automated Test Runner | HIGH | OPEN | Opus4.6 Risk 3 | Unchanged | 16-24h |
| 3 | Constants Not Centralized | LOW-MEDIUM | NEW | - | New gap from partial BACKLOG-005 | 2h |
| 4 | No CI/CD Pipeline | MEDIUM | OPEN | Opus4.6 Risk 4 | ESLint now available as a step | 2-3h |
| 5 | ESLint Without Prettier | LOW-MEDIUM | NEW | - | New gap from partial BACKLOG-006 | 1-2h |
| 6 | Dead Code: named() | LOW | OPEN | Opus4.6 Project Review | Unchanged | 0.5h |
| 7 | Console Output Coupling | LOW | OPEN | Opus4.6 Risk 7 | Unchanged | 4-6h |
| 8 | No Implementation Logs | LOW | NEW | - | No log for this cycle | 1h |

### Risks Resolved Since Opus 4.6 Review

| Prior Risk | Description | Resolution |
|-----------|-------------|-----------|
| Opus4.6 Risk 6 | Magic Numbers (partial) | GRID_SIZE/BLOCK_SIZE/EMPTY_CELL extracted from SudokuSolver/Orchestrator/CLI. PuzzleLoader still outstanding. |
| Opus4.6 Risk 8 | Stale Backlog Dates | Backlog reset with new sprint dates (2026-03-30). |
| Opus4.6 Risk 1 | Design-Implementation Gap | Partially reduced - Sprint 1 items partially completed. |

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md)

*Reviewer: AI assistant (CLAUDE Sonnet 4.6)*
