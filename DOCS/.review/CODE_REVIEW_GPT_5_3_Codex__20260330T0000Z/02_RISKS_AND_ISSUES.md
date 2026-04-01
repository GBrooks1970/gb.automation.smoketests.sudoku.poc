# Risks and Issues

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md)

**Reviewer:** AI assistant (GPT-5.3-Codex)

---

## Risk 1: Hidden Singles Implementation Scope Mismatch (HIGH)

### Risk Description/Explanation
`hiddenSingles()` still operates only at block scope. Documentation and tests frame hidden singles more broadly, so behavior and expectations remain partially misaligned.

### Evidence Outline
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts` line 80 (`hiddenSingles(target: number)`)
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts` line 83 (`// Check each 3x3 block`)
- `DOCS/ALGORITHM_Sudoku_Basic_Solver.md` lines 109-110 (explicit limitation note)
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/BasicSudokuSolverLogic.feature` lines 41 and 48 (row/column hidden single scenarios)

### Impact Analysis
- Reduced solving efficiency and potentially missed placements.
- Continued confusion for learners comparing tests/spec language against actual method behavior.
- Defers confidence in algorithm correctness.

### Refactor Recommendation and Strategy
- Expand `hiddenSingles()` to scan rows, columns, and blocks.
- Keep existing block logic as one sub-step.
- Add executable tests specifically for row and column hidden single cases.
- Remove or revise limitation note once implementation is complete.

---

## Risk 2: Test Specifications Are Not Executable (HIGH)

### Risk Description/Explanation
The project has extensive BDD scenarios but no runnable test stack, so regression detection remains manual.

### Evidence Outline
- Feature coverage exists: `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/BasicSudokuSolverLogic.feature` line 1 onward.
- No `test` script in `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json` lines 6-8.
- README acknowledges no test runner: `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/README.md` line 383.

### Impact Analysis
- Quality checks depend on manual runs.
- No CI gate can enforce behavior.
- Specification drift risk increases over time.

### Refactor Recommendation and Strategy
- Add Cucumber.js (or Jest + parser) and implement step definitions.
- Add `npm test`, `npm test:ci`, and coverage output.
- Prioritize core scenarios (algorithm unit + orchestration + loader) before full suite.

---

## Risk 3: CI/CD Is Still Absent (MEDIUM-HIGH)

### Risk Description/Explanation
There is no automated build/test workflow in repository automation.

### Evidence Outline
- No workflow files found under `.github/workflows/**`.
- Build works locally (`npm run build`) but no centralized gate enforces this.

### Impact Analysis
- Broken changes can reach main without automated checks.
- No consistent quality baseline for collaboration.
- Security and formatting checks are not enforceable.

### Refactor Recommendation and Strategy
- Add staged workflows: build -> test -> lint -> security.
- Start with single Node matrix build and expand after test runner integration.

---

## Risk 4: Planning Docs Contain Broken Internal Links (MEDIUM)

### Risk Description/Explanation
Some planning documents reference review files using incorrect relative paths, which breaks navigation and traceability.

### Evidence Outline
- `DOCS/.planning/BACKLOG.md` line 5 uses `../DOCS/.review/...` from inside `DOCS/.planning/`.
- Similar path style appears in planning TODO docs headers.

### Impact Analysis
- Readers cannot reliably follow evidence chains from backlog to review artifacts.
- Weakens governance value of planning documents.
- Increases confusion during onboarding and sprint planning.

### Refactor Recommendation and Strategy
- Normalize links from `.planning` to `.review` using `../.review/...`.
- Add a markdown link checker in CI once workflows exist.

---

## Risk 5: Solver Constructor Validation Gap (MEDIUM)

### Risk Description/Explanation
`PuzzleLoader` validates puzzle grids, but `SudokuSolver` can still be instantiated directly with invalid dimensions/values.

### Evidence Outline
- Validation present in `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/PuzzleLoader.ts` lines 39-66.
- `SudokuSolver` constructor does deep copy but no dimension/value checks (`SudokuSolver.ts` lines 4-10).
- Feature file includes invalid-dimension scenario expectations, but runtime guard is not in solver path.

### Impact Analysis
- Direct programmatic usage can create invalid internal state.
- Bugs manifest later in algorithm loops instead of failing fast.
- Reduces robustness of API/Web integrations that may bypass `PuzzleLoader`.

### Refactor Recommendation and Strategy
- Add optional strict input validation in `SudokuSolver` constructor (default true).
- Reuse shared validator utility so `PuzzleLoader` and solver enforce same rules.
- Add tests for constructor rejection of malformed grids.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md)
