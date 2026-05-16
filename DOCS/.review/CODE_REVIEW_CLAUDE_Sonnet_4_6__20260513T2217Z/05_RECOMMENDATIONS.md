# Recommendations

[<- Back to Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE Sonnet 4.6)
**Date:** 2026-05-13T22:17Z

---

## Recommended Refactors

### 1. Centralize Constants in constants.ts (LOW-MEDIUM - Risk 3)

- **What:** Create `app_src/constants.ts` with `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`,
  `MIN_DIGIT = 1`, and `MAX_DIGIT = 9` as exported constants. Remove the constant exports
  from `SudokuSolver.ts` and replace them with imports from `constants.ts`. Update
  `PuzzleLoader.ts` to import and use `GRID_SIZE` in its validation.
- **Why:** Eliminates the awkward cross-module dependency where `SudokuOrchestrator` and
  `SudokuCLI` import from the solver class. Completes BACKLOG-005 per its original specification.
  Enables PuzzleLoader to use the constant without creating a loader->solver dependency.
- **How:** Create `constants.ts` with the five exports. Update all five source files to import
  from `./constants`. Remove the three export keywords from `SudokuSolver.ts`.
- **Effort:** 2 hours
- **Validation:** `npm run build` succeeds. `npm run lint` passes. `npm start` output identical.
  BACKLOG-005 acceptance criteria all met.

### 2. Complete Hidden Singles Row and Column Checks (HIGH - Risk 1)

- **What:** Add row-based and column-based hidden singles scanning to `SudokuSolver.hiddenSingles()`.
- **Why:** Three consecutive code reviews have identified this as the highest-priority algorithm
  correctness gap. The specification, algorithm documentation, and test scenarios all expect
  row/column checking. The solver's effectiveness is measurably reduced without it.
- **How:** After the existing block-check loop, add:
  - Row check: iterate each row (0-8), get empty cells in the row where `target` is not excluded
    by column or block constraints, place if exactly one candidate
  - Column check: same pattern transposed
  - Add a test puzzle that specifically requires row/column hidden singles to `puzzles.json`
- **Effort:** 4-6 hours including test puzzle and documentation update
- **Validation:** New puzzle solves correctly. CLAUDE.md limitation note removed. Algorithm
  documentation updated.

### 3. Add Prettier Code Formatting (LOW-MEDIUM - Risk 5)

- **What:** Install `prettier` and `eslint-config-prettier`. Create `.prettierrc`. Add
  `format` and `format:check` scripts to `package.json`.
- **Why:** Completes BACKLOG-006. Automates formatting consistency. Adding `eslint-config-prettier`
  also prevents future conflicts between ESLint rules and Prettier formatting.
- **How:** `npm install --save-dev prettier eslint-config-prettier`. Create `.prettierrc` with
  sensible defaults (2-space indent, single quotes, trailing commas). Update `eslint.config.js`
  to include `eslint-config-prettier` to disable conflicting rules.
- **Effort:** 1-2 hours
- **Validation:** `npm run format:check` passes. `npm run lint` still passes.

### 4. Implement Minimal CI Workflow Without Test Runner (MEDIUM - Risk 4)

- **What:** Create `.github/workflows/ci.yml` that runs `npm ci`, `npm run lint`, and
  `npm run build` on every push and pull request.
- **Why:** The test runner (BACKLOG-002) is estimated at 16-24 hours. A build+lint CI
  workflow can be created in 2-3 hours and provides immediate value without waiting for
  the test runner. Every future commit will be automatically validated.
- **How:** Standard GitHub Actions Node.js workflow. No test step until BACKLOG-002 is complete.
- **Effort:** 2-3 hours
- **Validation:** Green CI badge appears in README. PR check shows passing build and lint.

---

## Next Steps

Recommended execution order as a single focused sprint.

### Sprint 2 Goal: Close the Two Highest Risks

The project has accumulated quality improvements (naming, constants, ESLint) but the two items
that block all testing and algorithm correctness confidence remain open. Sprint 2 should have
a single focus: make the Gherkin scenarios executable and fix the hidden singles algorithm.
Completing both removes the persistent D grade in Test Coverage and the algorithm correctness gap.

### Step 1: Centralize Constants (2 hours) - Prerequisite housekeeping

- Complete the constants work per BACKLOG-005 specification
- Creates `constants.ts` that future Audit Trail and REST API files will import from
- Satisfies all BACKLOG-005 acceptance criteria

### Step 2: Complete Hidden Singles (4-6 hours) - Highest code risk

- Fix row and column checks in `hiddenSingles()`
- Add test puzzle that validates the fix
- Update CLAUDE.md and algorithm documentation to remove limitation note
- Close BACKLOG-001

### Step 3: Add Prettier (1-2 hours) - Closes BACKLOG-006

- Complete the ESLint + Prettier requirement from BACKLOG-006
- Estimated to take under 2 hours

### Step 4: Minimal CI Workflow (2-3 hours) - Immediate build protection

- Build + lint workflow in GitHub Actions
- Does not require test runner; provides immediate regression protection

### Step 5: Implement Test Runner (16-24 hours) - The critical enabler

- Install `@cucumber/cucumber` with TypeScript support
- Implement step definitions starting with integration tests (4 scenarios)
- Then algorithm unit tests (12 scenarios)
- Add `npm test` script
- Close BACKLOG-002

### Step 6: Create Implementation Log (1 hour)

- Document this cycle's work and decisions (constants architecture, ESLint format)
- Close BACKLOG-003

### Sprint 2 Total Estimate: 26-38 hours

---

## Future Project Ideas

Long-term enhancements consistent with the project's pedagogical mission.

### 1. GitHub Actions CI Badge in README

- Add a CI status badge to `README.md` once the GitHub Actions workflow is created
- Provides immediate visual evidence of project health
- Teaches CI/CD badge integration as a standard open-source practice

### 2. HowTo Guides for Operational Procedures

- The HowTo folder has been started but not populated
- Practical guides for: running the solver, running lint, adding puzzles, running the bat file,
  understanding the algorithm output, and setting up a development environment
- These would be low-effort but high-value for new contributors

### 3. constants.ts as a Teaching Artifact

- Once `constants.ts` is created, it serves as a concrete demonstration of DRY principle
- A short JSDoc comment block explaining WHY named constants matter would add pedagogical value

### 4. Audit Trail as First Implemented Feature

- The Audit Trail (BACKLOG-008) remains the best first feature to implement after the
  test runner is in place
- It is self-contained, well-designed, and adds immediate debugging value for the solver
- Building it before the REST API validates the `CellChange` interface for shared use

---

[<- Back to Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

*Reviewer: AI assistant (CLAUDE Sonnet 4.6)*
