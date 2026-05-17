# Implementation Log: Sprint 2 - Naming Conventions, Code Review, Hidden Singles Fix, and Cucumber Test Runner

**Version:** v2.0
**Date:** 2026-05-14T09:30:00Z

**Session Date:** 2026-05-13 to 2026-05-14
**Primary Goal:** Implement Option A naming conventions, conduct third code review, and close BACKLOG-001 and BACKLOG-002 (the two highest-priority backlog items carried through three code reviews)

---

## 1. Primary Request and Intent

**Initial Request:** Analyse naming conventions in this project. Give a report of the most common convention, the outliers and a recommendation of 2 different naming conventions to use project-wide. Give reasoning for each together with an action plan to implement.

**Expanded Scope:**
- Implement Option A (idiomatic TypeScript conventions) across all source files
- Validate all work with build, lint, and bat file execution after implementation
- Create a naming conventions design document
- Conduct a full third code review of the project using the established review template and prior review as context
- Update BACKLOG.md with a step-by-step Sprint 2 plan based on code review findings
- Action BACKLOG-001 (Complete Hidden Singles Implementation)
- Action BACKLOG-002 (Implement Cucumber.js Automated Test Runner)
- Write this implementation log

---

## 2. Key Technical Concepts

**Core Technologies/Algorithms:**
- **TypeScript ESLint Flat Config** - ESLint 10 moved from `.eslintrc.json` to `eslint.config.js`. The `@typescript-eslint/naming-convention` rule enforces PascalCase for types, camelCase for variables/methods, and UPPER_CASE for module-level constants
- **Cucumber.js BDD Framework** - `@cucumber/cucumber` v12 for executing Gherkin scenarios. Uses `ts-node/register` to compile step definitions at runtime without a pre-build step
- **Hidden Singles Algorithm (Crosshatch)** - Complete implementation now scans all three unit types: rows (O(n)), columns (O(n)), and blocks (O(n)). Called 9 times per orchestrator iteration (once per digit)
- **TypeScript Project References / Multiple tsconfig** - Separate `tsconfig.cucumber.json` extends the base tsconfig with a different `rootDir` (`.` instead of `./app_src`), allowing step definitions outside `app_src/` to compile without polluting the production build

**Design Principles Applied:**
- **Single Source of Truth** - Constants `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL` exported from `SudokuSolver.ts` replace all inline magic numbers across three source files; eliminates repeated knowledge of grid dimension encoding
- **Open/Closed Principle** - Hidden Singles fix extends the algorithm to new unit types (rows and columns) without modifying the existing block-check logic; all three unit checks share the same filter pattern
- **Specification Conformance** - The Hidden Singles fix brings the implementation into alignment with the algorithm specification and documentation, which have always described checking all three unit types

**Testing Approach:**
- **BDD/Gherkin Scenarios** - 43 scenarios covering all algorithm paths, PuzzleLoader, constraint validation, orchestration, grid initialization, integration tests, and edge cases
- **Bat File Regression** - Timestamped output captures provide informal regression detection; the 2026-04-02 and 2026-05-13 and 2026-05-14 output files are comparable
- **Build and Lint Gates** - `npm run build` (tsc) and `npm run lint` (eslint) run after every significant change as quality gates

**Architecture Patterns:**
- **World Object Pattern (Cucumber)** - `SudokuWorld extends World` holds test state (solver, loader, lastChanged, solveResult, lastError, etc.) between Given/When/Then steps within a scenario
- **Literal Step Matching** - Cucumber steps with unquoted array literals (e.g., `[1, 2, 0, 4, 5, 6, 7, 8, 9]`) require exact-text step definitions rather than parameterized `{string}` expressions

---

## 3. Critical Bugs Fixed

### Bug 1: Hidden Singles Only Checked 3x3 Blocks (Specification Gap)
**File:** `demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts` (lines 84-101)
**Issue:** `hiddenSingles(target)` only scanned 3x3 blocks for candidates. The specification, algorithm documentation, and CLAUDE.md Known Limitations all acknowledged this gap. Three consecutive code reviews flagged it as HIGH priority.
**Original Code:**
```typescript
// Check each 3x3 block
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
```
**Fix Applied:**
```typescript
// Check each row
for (let row = 0; row < GRID_SIZE; row++) {
  if (this.isInRow(target, row)) continue;
  const candidates: {row: number, col: number}[] = [];
  for (let col = 0; col < GRID_SIZE; col++) {
    if (this.grid[row][col] !== EMPTY_CELL) continue;
    const blockRow = Math.floor(row / BLOCK_SIZE);
    const blockCol = Math.floor(col / BLOCK_SIZE);
    if (!this.isInCol(target, col) && !this.isNumberInBlock(target, blockRow, blockCol)) {
      candidates.push({row, col});
    }
  }
  if (candidates.length === 1) {
    this.grid[candidates[0].row][candidates[0].col] = target;
    changed = true;
  }
}
// [Column check follows the same pattern, then existing block check]
```
**Impact:** The fix proved immediately significant. The "Minimal Clues" puzzle (17 clues, previously returning `STUCK_ON_ADVANCED_LOGIC` through the entire project history) now returns `SOLVED`. Row/column hidden singles were a genuine gap that Naked Singles did NOT compensate for in this case.

### Bug 2: tsconfig.json Modified to Incompatible moduleResolution by IDE
**File:** `demo-apps/demoapp001-typescript-cypress/tsconfig.json`
**Issue:** The TypeScript language server auto-changed `"moduleResolution": "node"` to `"moduleResolution": "bundler"` and added `"ignoreDeprecations": "6.0"`. The `bundler` resolution requires `module` to be `ES2015+` but the project uses `commonjs`, causing tsc to fail with `TS5095`.
**Fix:** Reverted to `"moduleResolution": "node"` and used the correct `"ignoreDeprecations": "5.0"` (TypeScript 5.x deprecation suppressor) to silence the IDE deprecation warning.
**Impact:** Build failure blocking all further work until reverted.

### Bug 3: Block Hidden Singles Grid Setup Excluded All Candidates
**File:** `tests/step_definitions/solver_steps.ts`
**Issue:** The Given step for "Identify a Hidden Single in a 3x3 block" placed `target` in row 1 (`this.solver.grid[1][7] = target`), which excluded ALL empty cells in row 1 of the block (both `[1,1]` and `[1,2]`). This left zero candidates, causing `hiddenSingles()` to return false.
**Fix:** Replaced the row-1 constraint with a column-1 constraint (`this.solver.grid[3][1] = target`) placed below the block. This excludes `[1,1]` via column but leaves `[1,2]` (row 1 has no target, col 2 has no target) as the only valid position — a genuine block hidden single.
**Impact:** Scenario "Identify a Hidden Single in a 3x3 block" now passes correctly.

---

## 4. Files Created and Modified

### New Files Created:

1. **`demo-apps/demoapp001-typescript-cypress/eslint.config.js`** - ESLint 10 flat config
   - Enforces `camelCase` for variables, parameters, and members
   - Enforces `PascalCase` for classes, interfaces, and type aliases
   - Allows `UPPER_CASE` for constants (module-level)
   - Uses `@typescript-eslint/naming-convention` rule targeting `app_src/**/*.ts`

2. **`demo-apps/demoapp001-typescript-cypress/cucumber.js`** - Cucumber configuration
   - Points to step definitions in `tests/step_definitions/**/*.ts`
   - Registers `ts-node/register` for runtime TypeScript compilation
   - Sets `TS_NODE_PROJECT=tsconfig.cucumber.json` so ts-node uses the correct config
   - Uses `@cucumber/pretty-formatter` for readable output

3. **`demo-apps/demoapp001-typescript-cypress/tsconfig.cucumber.json`** - Cucumber-specific tsconfig
   - Extends base `tsconfig.json`
   - Overrides `rootDir: "."` to allow step definitions alongside app_src
   - Sets `noEmit: true` (type-check only; ts-node handles runtime compilation)
   - Includes both `app_src/**/*` and `tests/**/*.ts`

4. **`demo-apps/demoapp001-typescript-cypress/tests/step_definitions/solver_steps.ts`** - All step definitions
   - 43 scenarios / 241 steps, all passing
   - Custom `SudokuWorld` class holding test state between steps
   - Covers: algorithm unit tests, constraint validation Scenario Outline (8 examples), orchestration, PuzzleLoader, grid initialization, integration tests, edge cases
   - Helper functions: `copyGrid`, `isValidPlacement`, `isValidSolution`

5. **`DOCS/.design/naming-conventions-design.md`** - Project-wide naming conventions reference
   - Covers TypeScript identifiers, source files, folders, DOCS files, JSON keys, Gherkin tables
   - Includes enforcement section linking to `eslint.config.js`
   - Quick-reference table for all convention rules

6. **`DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/`** - Third code review (9 files)
   - `00_CODE_REVIEW_*.md` - Index and key findings
   - `01_EXECUTIVE_SUMMARY.md` - Overall B+ maintained, positive trajectory
   - `02_RISKS_AND_ISSUES.md` - 8 risks; 2 HIGH (Hidden Singles, test runner), 2 new gaps from partial BACKLOG-005/006 completion
   - `03_PROJECT_REVIEWS/PROJECT_001_*.md` - TypeScript solver review
   - `03_PROJECT_REVIEWS/PROJECT_002_*.md` - Design and planning review
   - `04_CROSS_PROJECT_ANALYSIS.md` - Cross-cutting concerns
   - `05_RECOMMENDATIONS.md` - Sprint 2 step-by-step plan
   - `06_ARCHITECTURE_ASSESSMENT.md` - SOLID, KISS, YAGNI, Test Pyramid
   - `07_MIGRATION_PLANS.md` - Sprint 2 execution plan and technical debt prevention

### Significantly Modified Files:

1. **`demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts`**
   - Added exported constants: `GRID_SIZE = 9`, `BLOCK_SIZE = 3`, `EMPTY_CELL = 0`
   - Renamed all outer algorithm loop variables: `r`→`row`, `c`→`col`, `br`→`blockRow`, `bc`→`blockCol`
   - Renamed all method parameters to descriptive names (`isInRow(v, row)`, `getCellCandidates(row, col)`, etc.)
   - Renamed cell coordinate object properties: `{r, c}` → `{row, col}` throughout
   - Replaced all magic numbers `9`, `3`, `0` with constants across all methods
   - Extended `hiddenSingles()`: added row-based and column-based scanning

2. **`demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts`**
   - Imports `GRID_SIZE`, `EMPTY_CELL` from `SudokuSolver`
   - Replaced `digit <= 9` with `digit <= GRID_SIZE`
   - Replaced `cell !== 0` with `cell !== EMPTY_CELL`

3. **`demo-apps/demoapp001-typescript-cypress/app_src/SudokuCLI.ts`**
   - Imports `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL` from `SudokuSolver`
   - Replaced all display-loop magic numbers with constants

4. **`demo-apps/demoapp001-typescript-cypress/puzzles.json`**
   - Added "Crosshatch Challenge" puzzle (medium difficulty, 32 clues)
   - Puzzle specifically exercises hidden singles in rows and columns
   - Solution verified correct: 4,8,3,9,2,1,6,5,7 / 9,6,7,3,4,5,8,2,1 / etc.
   - Now contains 5 puzzles total (previously 4)

5. **`demo-apps/demoapp001-typescript-cypress/tests/BasicSudokuSolverLogic.feature`**
   - Example table headers: `grid_state` → `gridState`
   - Example table values: snake_case → camelCase (e.g., `empty_grid` → `emptyGrid`)
   - Step reference updated: `<grid_state>` → `<gridState>`
   - "Minimal Clues" integration scenario updated: expected result changed from `STUCK_ON_ADVANCED_LOGIC` to `SOLVED`
   - "Crosshatch Challenge" integration scenario added
   - Puzzle count updated from 4 to 5 in PuzzleLoader scenario
   - `puzzleLoader` scenario count corrected (4→5)

6. **`demo-apps/demoapp001-typescript-cypress/package.json`**
   - Added `lint` script: `eslint app_src/**/*.ts`
   - Added `test` script: `cucumber-js`
   - Added devDependencies: `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@cucumber/cucumber`, `@cucumber/pretty-formatter`

7. **`demo-apps/demoapp001-typescript-cypress/tsconfig.json`**
   - Removed `tests` from `include` array (step definitions now handled by tsconfig.cucumber.json)
   - Added `"ignoreDeprecations": "5.0"` to suppress TS 5.x deprecation warning for `moduleResolution: node`

8. **`CLAUDE.md`**
   - Hidden Singles description: "3x3 block" → "row, column, or 3x3 block"
   - Available Test Puzzles table: Minimal Clues changed to `SOLVED`, Crosshatch Challenge row added
   - Known Limitations: Hidden Singles entry removed (fixed)
   - Development Commands table: `lint` and `test` scripts documented

9. **`DOCS/sudoku-basic-solver.md`**
   - Removed "Current Implementation Limitation" warning section

10. **`DOCS/.planning/backlog.md`**
    - Updated to v2.0 (Sprint 2: 2026-05-14 to 2026-05-27)
    - Added new BACKLOG-005-NEW (centralize constants in constants.ts)
    - Updated BACKLOG-006-COMPLETE (ESLint done, Prettier outstanding)
    - Sprint 2 step-by-step execution table with explicit dependencies
    - Added "Technical Debt Rules" section from Sonnet 4.6 review
    - Updated sprint roadmap to reflect Sprint 2 dates

---

## 5. Problem Solving Approach

**Phase 1: Naming Convention Audit**
- Spawned an Explore agent to scan all TypeScript source files, Gherkin scenarios, JSON data files, and DOCS files
- Catalogued naming conventions for 22 distinct categories
- Compared two options: Option A (idiomatic TypeScript) vs Option B (kebab-case file system)
- Recommended Option A (90% already compliant, minimal change surface)

**Phase 2: Naming Convention Implementation**
- Applied constants (`GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`) to SudokuSolver, SudokuOrchestrator, SudokuCLI
- Renamed single-letter algorithm variables in outer loops and method parameters throughout SudokuSolver
- Renamed `{r, c}` cell coordinate properties to `{row, col}` and updated all call sites
- Configured ESLint 10 flat config with `@typescript-eslint/naming-convention` rule
- Created naming-conventions-design.md
- Fixed Gherkin example table headers and values to camelCase

**Phase 3: Validation and Commit (Naming Conventions)**
- `npm run build` — clean
- `npm run lint` — clean (zero violations)
- Bat file run — all four puzzles produce expected results
- Committed: "Enforce idiomatic TypeScript naming conventions project-wide"

**Phase 4: Third Code Review**
- Re-read Opus 4.6 review (all 9 section files) for context
- Ran bat file validation to confirm current state
- Wrote all 9 review files + README
- Key finding: two partial completions (BACKLOG-005 constants in wrong file; BACKLOG-006 missing Prettier) created new gaps
- Grade maintained at B+; positive trajectory noted
- Committed: "Add third code review (Sonnet 4.6) and update backlog for Sprint 2"

**Phase 5: BACKLOG-001 — Hidden Singles Fix**
- Identified the fix pattern: same filter logic as block check, applied to row and column iteration
- Implemented row scan: iterate each row, collect empty cells not excluded by column or block, place if count == 1
- Implemented column scan: iterate each column, collect empty cells not excluded by row or block, place if count == 1
- Added "Crosshatch Challenge" puzzle (Bert Hall's "The Gentle" puzzle — a well-known crosshatch-only puzzle)
- Discovered: Minimal Clues puzzle now SOLVED — updated CLAUDE.md, algorithm doc, and feature file accordingly
- `npm run build` clean, `npm run lint` clean, bat file all five puzzles correct
- Committed: "BACKLOG-001: Complete Hidden Singles implementation across all unit types"

**Phase 6: BACKLOG-002 — Cucumber.js Test Runner**
- Installed `@cucumber/cucumber` and `@cucumber/pretty-formatter`
- Created `cucumber.js` flat config and `tsconfig.cucumber.json`
- Added `"test": "cucumber-js"` script to package.json
- Wrote `solver_steps.ts`: 43 scenarios, 241 steps covering the complete feature file
- Iteratively fixed three step definition issues discovered during first test run (see Section 6)
- Resolved tsconfig rootDir conflict by creating `tsconfig.cucumber.json`
- `npm test` — 43/43 pass, 241/241 steps pass
- Committed: "BACKLOG-002: Implement Cucumber.js test runner with 43 passing scenarios"

---

## 6. Errors Encountered and Solutions

### Error 1: tsc Option 'bundler' Incompatible with CommonJS Module
**Error Message:** `error TS5095: Option 'bundler' can only be used when 'module' is set to 'preserve' or to 'es2015' or later.`
**Root Cause:** The TypeScript language server in VS Code automatically modified `tsconfig.json` to change `moduleResolution` from `"node"` to `"bundler"` and added `"ignoreDeprecations": "6.0"`. The `bundler` value is incompatible with `"module": "commonjs"`.
**Solution:** Reverted `moduleResolution` to `"node"` and replaced `"6.0"` with `"5.0"` as the correct `ignoreDeprecations` value for TypeScript 5.x deprecations.
**Files Modified:** `tsconfig.json`

### Error 2: Cucumber Step Undefined — Unquoted Array Literal
**Symptom:** `Given a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]` reported as `? undefined` by Cucumber.
**Root Cause:** The step definition used `{string}` as the parameter expression, which matches text in double quotes only. The feature file has the array literal without surrounding quotes, so `{string}` does not match.
**Solution:** Changed step definition from `Given('a row contains the values {string}', ...)` to `Given('a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]', ...)` — a literal match with no parameter expression. Same approach applied to `'an empty cell has 3 possible candidates: [2, 5, 8]'`.
**Files Modified:** `tests/step_definitions/solver_steps.ts`

### Error 3: Block Hidden Singles Assertion Failed — Grid Setup Flaw
**Error Message:** `AssertionError: Expected algorithm to return true (grid was changed). Expected false to be truthy.`
**Root Cause:** The Given step "the number 5 is present in rows that intersect three of those empty cells" placed `target` at `this.solver.grid[1][7] = target`. This put the digit in row 1, which excluded BOTH `[1,1]` and `[1,2]` from being candidates, leaving zero valid positions in the block and causing `hiddenSingles()` to return false.
**Solution:** Changed the row-1 constraint to a column-1 constraint at row 3 (`this.solver.grid[3][1] = target`) — below the block. This excludes `[1,1]` via column but leaves `[1,2]` (row 1 has no target, col 2 has no target) as the sole valid position.
**Files Modified:** `tests/step_definitions/solver_steps.ts`

### Error 4: Duplicate Cucumber Step Definition — PuzzleLoader Load File
**Error Message:** Cucumber reported ambiguous step match for `When the PuzzleLoader attempts to load the file`.
**Root Cause:** The step was defined twice: once for the 8-row grid scenario and once for the invalid cell value scenario. Cucumber does not permit duplicate step definitions.
**Solution:** Merged both `When` definitions into one, driven by a context flag `_loadErrorContext` set by the respective `Given` step (`'bad-dimensions'` or `'bad-value'`). A switch statement in the single `When` handler performs the appropriate simulation.
**Files Modified:** `tests/step_definitions/solver_steps.ts`

### Error 5: tsc Error — Step Definitions Outside rootDir
**Error Message:** `error TS6059: File 'tests/step_definitions/solver_steps.ts' is not under 'rootDir' 'app_src'. 'rootDir' is expected to contain all source files.`
**Root Cause:** The main `tsconfig.json` had `rootDir: "./app_src"`. Adding TypeScript step definitions in `tests/step_definitions/` brought them into the compilation scope (via the old `"include": ["app_src/**/*", "tests"]`) but outside the declared rootDir.
**Solution:** Created `tsconfig.cucumber.json` that extends the base config and overrides `rootDir: "."` with `noEmit: true`. Removed `"tests"` from the main tsconfig `include` array (production build is app_src only). Updated `cucumber.js` to set `TS_NODE_PROJECT=tsconfig.cucumber.json`.
**Files Modified:** `tsconfig.json`, `tsconfig.cucumber.json` (new), `cucumber.js`

---

## 7. All User Requests (Chronological)

1. "Analyse naming conventions in this project. Give a report of the most common convention, the outliers and a recommendation of 2 different naming conventions to use project-wide. Give reasoning for each together with an action plan to implement."
2. "Implement option A. Validate all work. Make sure the project builds and runs successfully after your work. Run the bat file, to make sure the expected output is produced. Once fully validated, create a new doc that outlines the expected project naming conventions."
3. "Commit the changes with a suitable message."
4. "Run the bat file, to make sure the expected output is produced. Once fully validated — use the code review template to perform a thorough and comprehensive code review of this project. Use the latest existing code review as context. Make the new code review follow the same format and style as the existing one. After completing the code review, look to update the backlog to give a clear step by step plan to properly categorise and prioritize the outstanding implementation of the design plans."
5. "Read latest code review. Read the backlog.md. Followed by Actioning BACKLOG-001, BACKLOG-002. After each task: Validate all work on completion of each task. If clarification is needed ask for it. When fully validated task commit with the appropriate commit message. When all tasks complete give a summarized report of work done and reasoning for each."
6. "Continue from where you left off." (after context was interrupted)
7. "Re-assess where you are and pick up the previous task to completion." (after context was interrupted again)
8. "Use the TEMPLATE_Implementation_Log template to write an implementation log of what has been done in this session so far."

---

## 8. Current Project Status

**Completed This Session:**
- ✅ Naming convention audit — full project scan across 22 categories with outlier analysis
- ✅ Option A naming conventions implemented — constants, variable renames, ESLint, DESIGN doc
- ✅ ESLint 10 configured — `eslint.config.js` with `@typescript-eslint/naming-convention` rule
- ✅ Gherkin example tables standardised — camelCase headers and values
- ✅ naming-conventions-design.md created — comprehensive reference document
- ✅ Third code review completed — `CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/` (9 files)
- ✅ BACKLOG.md updated — Sprint 2 plan with six ordered steps and explicit dependencies
- ✅ BACKLOG-001 closed — `hiddenSingles()` now checks rows, columns, and blocks
- ✅ Crosshatch Challenge puzzle added — demonstrates complete hidden singles technique
- ✅ Minimal Clues puzzle result corrected — now `SOLVED` (was `STUCK_ON_ADVANCED_LOGIC`)
- ✅ BACKLOG-002 closed — 43 Cucumber scenarios / 241 steps all passing
- ✅ tsconfig.cucumber.json created — clean separation of production and test compilation

**Remaining Sprint 2 Items (Not Yet Started):**
- 🔴 BACKLOG-005-NEW — Centralize constants in `app_src/constants.ts` (currently exported from `SudokuSolver.ts`; `PuzzleLoader.ts` still has hardcoded 9)
- 🔴 BACKLOG-006-COMPLETE — Add Prettier and `eslint-config-prettier` (ESLint done; Prettier not added)
- 🔴 BACKLOG-004 — GitHub Actions CI/CD workflow (build + lint + test)
- 🔴 BACKLOG-003 — This implementation log (partially satisfied by this document)

**Design Complete, Implementation Pending:**
- 📋 BACKLOG-007 — Console Output Decoupling (`IOutput` interface)
- 📋 BACKLOG-008 — Audit Trail Feature (`AuditLogger`, `AuditTypes`, `AuditFormatter`)
- 📋 BACKLOG-009 — REST API Wrapper (Express.js server)
- 📋 BACKLOG-018 — Web UI Solver Visualisation

---

## 9. Lessons Learned

**Constants Architecture:**
- Exporting constants from a domain class (`SudokuSolver.ts`) creates implicit coupling — `SudokuOrchestrator` and `SudokuCLI` now import from the solver class for grid-dimension constants that are architecturally neutral. A dedicated `constants.ts` (as originally specified in BACKLOG-005) avoids this. Deviating from the acceptance criteria of a backlog item creates incomplete work that requires a follow-up item.
- Lesson: Always implement to the backlog item's acceptance criteria, not to a convenient approximation.

**Hidden Singles Impact:**
- Adding row/column hidden singles to a "blocks-only" implementation produced an immediate, measurable result: a 17-clue puzzle that was stuck for the project's entire history now solves completely. This was unexpected and confirms the algorithm specification was correct about needing all three unit types.
- Lesson: Specification compliance matters even when naive workarounds seem to compensate; Naked Singles does NOT always substitute for Hidden Singles.

**Cucumber Step Definitions:**
- Cucumber's `{string}` expression only matches double-quoted text. Feature file steps with unquoted array literals (e.g., `[1, 2, 0, 4, 5, 6, 7, 8, 9]`) require literal step definition text with no parameter expressions. This is a common trap when step text includes brackets.
- Lesson: Review step text for unquoted special characters before writing parameterized step definitions.
- Duplicate step definitions produce an ambiguous match error. When two scenarios share a step name but need different behaviour, use a context flag set in the Given step to drive a shared When implementation.
- Lesson: One step text = one step definition. Use world state to differentiate behaviour.

**TypeScript Multi-tsconfig Pattern:**
- When tests live outside `rootDir`, the clean solution is a separate `tsconfig.cucumber.json` that extends the base config with `rootDir: "."` and `noEmit: true`. This keeps production build clean while allowing ts-node to resolve test files correctly.
- Lesson: For test tooling that uses TypeScript (Cucumber, Jest with ts-jest), always create a separate tsconfig rather than widening the production `rootDir`.

**IDE Auto-Modifications:**
- The VS Code TypeScript language server can silently modify `tsconfig.json` (e.g., changing `moduleResolution`). These modifications may be incompatible with the project's actual module system and break the build.
- Lesson: Always run `npm run build` after IDE-assisted file changes to catch invisible modifications. Add `tsconfig.json` to the list of files to diff before committing.

---

## 10. Next Steps for Future Development

When implementing BACKLOG-005-NEW (Centralize constants in constants.ts):
1. Create `app_src/constants.ts` with: `GRID_SIZE = 9`, `BLOCK_SIZE = 3`, `EMPTY_CELL = 0`, `MIN_DIGIT = 1`, `MAX_DIGIT = 9`
2. Remove the three `export const` lines from `SudokuSolver.ts`
3. Update `SudokuSolver.ts`, `SudokuOrchestrator.ts`, `SudokuCLI.ts` to import from `./constants`
4. Update `PuzzleLoader.ts` to import `GRID_SIZE` and replace hardcoded `9` values in `validatePuzzles()`
5. Run `npm run build`, `npm run lint`, `npm test`, bat file — all must pass
6. Verify all BACKLOG-005 acceptance criteria are met before closing

When implementing BACKLOG-006-COMPLETE (Add Prettier):
1. `npm install --save-dev prettier eslint-config-prettier`
2. Create `.prettierrc`: 2-space indent, single quotes, trailing commas (ES5)
3. Add `"format": "prettier --write app_src/**/*.ts"` and `"format:check": "prettier --check app_src/**/*.ts"` to `package.json` scripts
4. Add `eslint-config-prettier` at the end of `eslint.config.js` rules to disable conflicting ESLint rules
5. Run `npm run format` to establish the formatting baseline
6. Run `npm run build`, `npm run lint`, `npm test` — all must pass

When implementing BACKLOG-004 (GitHub Actions CI/CD):
1. Create `.github/workflows/ci.yml` with triggers: push and pull_request
2. Add Node.js 20 setup step
3. Add steps: `npm ci`, `npm run lint`, `npm run build`, `npm test`
4. Add CI status badge to `README.md`
5. Verify the workflow passes on the current branch before merging

When implementing BACKLOG-007 (Console Output Decoupling):
1. Create `app_src/output/IOutput.ts` with `write(message: string): void` interface
2. Create `app_src/output/ConsoleOutput.ts` implementing `IOutput` via `console.log`
3. Refactor `SudokuCLI` constructor to accept `IOutput` with `ConsoleOutput` as default
4. Add step definitions to the Cucumber feature file for output-related scenarios
5. Verify bat file output is unchanged (default ConsoleOutput behaviour preserved)
6. Remove `SudokuSolver.named()` dead code at the same time (30-minute task)

---

*End of Implementation Log*
