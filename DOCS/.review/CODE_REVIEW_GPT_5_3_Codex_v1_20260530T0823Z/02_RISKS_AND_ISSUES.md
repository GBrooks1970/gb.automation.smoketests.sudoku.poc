# Risks and Issues

[Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md) | [Next: Project Reviews](03_PROJECT_REVIEWS/)

**Reviewer:** AI assistant (GPT-5.3 Codex)  
**Date:** 2026-05-30T08:23Z

## 1. High - v1.0 is no longer a sufficient authoritative specification

**Risk Description/Explanation**  
The repository now contains capabilities that v1.0 explicitly did not specify or only implied: row/column Hidden Singles, audit trail, REST API, web visualisation, Docker Compose, performance tooling, and multi-stack parity governance. If v1.0 remains the primary implementation specification, future maintainers may incorrectly classify current functionality as drift rather than intentional evolution.

**Evidence Outline**

- v1.0 scope is a basic solver with standard 9x9 puzzles, three basic techniques, and clear status reporting only: `DOCS/.design/sudoku-solver-specification.md` (lines 40-51).
- v1.0 Hidden Singles says the specification covers block-based Hidden Singles: `DOCS/.design/sudoku-solver-specification.md` (lines 401-411).
- TypeScript, Python, and CSharp all implement row, column, and block Hidden Singles, exceeding v1.0: `demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts` (lines 113-179), `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` (lines 76-138), and `demo-apps/demoapp003-csharp-specflow/app_src/SudokuSolver.cs` (lines 85-170).
- Extended designs exist for REST API and audit trail: `DOCS/.design/rest-api-wrapper.md` (lines 21-47) and `DOCS/.design/audit-trail-feature.md` (lines 21-47).
- Docker Compose runs stack tests, API profile, parity checks, and benchmarks: `docker-compose.yml` (lines 3-49).

**Impact Analysis**  
New contributors may implement only block Hidden Singles or may remove/ignore higher-level surfaces because they are absent from v1.0. Reviewers may also generate false positives when assessing compliance against the older baseline.

**Refactor Recommendation and Strategy**  
Create a v2.0 or v1.1 solver/platform specification that explicitly distinguishes core solver contract, deliberate extensions, stack parity rules, test architecture, API/web surfaces, and optional tooling.

## 2. High - Already-solved puzzle handling is functionally correct but not immediate as specified

**Risk Description/Explanation**  
v1.0 expects an already solved grid to return `SOLVED` immediately. The shared Gherkin contract further says no algorithms should be executed. Current orchestrators start with `isProgressing = true`, enter the loop, and attempt all algorithms once before returning `SOLVED` when no changes are made.

**Evidence Outline**

- v1.0 edge case: already solved grid returns `SOLVED` immediately: `DOCS/.design/sudoku-solver-specification.md` (lines 790-798).
- Shared feature says no algorithms should be executed for a full valid grid: `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` (lines 149-156).
- TypeScript enters the loop before checking fullness: `demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts` (lines 38-70).
- Python follows the same loop shape: `demo-apps/demoapp002-python-pytest/app_src/sudoku_orchestrator.py` (lines 16-36).
- CSharp follows the same loop shape: `demo-apps/demoapp003-csharp-specflow/app_src/SudokuOrchestrator.cs` (lines 18-47).

**Impact Analysis**  
For normal usage this is low-cost and returns the right status, but it violates the immediate-return contract and makes audit/performance semantics less precise. If algorithm call counts or iteration counts are asserted later, this behaviour can fail tests.

**Refactor Recommendation and Strategy**  
Add an early `isGridFull` / `IsGridFull` check at the top of each `solve` / `Solve` method before starting the progress loop. Preserve current return strings.

## 3. Medium - Public grid properties replace the v1.0 `getGrid` operation

**Risk Description/Explanation**  
v1.0 defines `getGrid` as a required solver operation. The implementations expose mutable/public working grid properties (`grid`, `Grid`) instead. This is convenient for tests and UI layers but weakens encapsulation and makes accidental mutation by consumers easier.

**Evidence Outline**

- v1.0 requires a solver `getGrid` operation: `DOCS/.design/sudoku-solver-specification.md` (lines 258-265).
- TypeScript exposes `public grid`: `demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts` (lines 5-17).
- Python exposes `self.grid`: `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` (lines 10-17).
- CSharp exposes `public int[][] Grid { get; }`: `demo-apps/demoapp003-csharp-specflow/app_src/SudokuSolver.cs` (lines 14-16).

**Impact Analysis**  
External code can bypass solver algorithms, causing state changes that are not audited, validated, or attributed to solving logic.

**Refactor Recommendation and Strategy**  
Add explicit snapshot operations (`getGrid`, `get_grid`, `GetGrid`) that return deep copies. Keep public access temporarily for compatibility and deprecate direct mutation in stack docs.

## 4. Medium - Constraint validation is implemented unevenly relative to optional v1.0 guidance

**Risk Description/Explanation**  
v1.0 marks duplicate row/column/block constraint validation as optional. The present repository has solver-level constraint checks and TypeScript API validation, but loader-level validation is mainly structural. This split should be intentional and documented.

**Evidence Outline**

- v1.0 structure validation is mandatory; constraint validation is optional: `DOCS/.design/sudoku-solver-specification.md` (lines 671-741).
- TypeScript loader validates dimensions and cell integer range: `demo-apps/demoapp001-typescript-cypress/app_src/PuzzleLoader.ts` (lines 50-70).
- Python loader validates dimensions and integer range: `demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py` (lines 59-70).
- CSharp loader validates dimensions and numeric range: `demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs` (lines 65-95).
- Constraint checks exist in solvers: TypeScript `noConstraintViolations`, Python `no_constraint_violations`, and CSharp `NoConstraintViolations`.

**Impact Analysis**  
A puzzle can be structurally valid but logically contradictory. If loaded without constraint validation, later solving behaviour is undefined by v1.0 and may be confusing to users.

**Refactor Recommendation and Strategy**  
Document validation layers: loader validates shape/range, solver/API validates constraints. Consider optional strict mode on loaders for duplicate detection.

## 5. Medium - TypeScript has advanced surfaces that Python and CSharp do not yet match

**Risk Description/Explanation**  
The repository is multi-stack, but the TypeScript project has REST API, web UI, and richer API integration tests while Python and CSharp are core-solver/test stacks only. This is acceptable if intentional, but it should be presented as staged capability rather than full parity.

**Evidence Outline**

- TypeScript package scripts include API/web start commands and API tests: `demo-apps/demoapp001-typescript-cypress/package.json` (lines 6-17).
- TypeScript API integration tests cover health, puzzles, validation, techniques, solve, and visualise endpoints: `demo-apps/demoapp001-typescript-cypress/tests/api/api.integration.ts` (lines 19-140).
- Python README describes only Python subject implementation, features, Screenplay tests, and puzzle data: `demo-apps/demoapp002-python-pytest/README.md` (lines 14-24).
- CSharp README similarly lists subject implementation, features, Screenplay, performance, and docs rather than REST/web: `demo-apps/demoapp003-csharp-specflow/README.md` (lines 17-27).

**Impact Analysis**  
Readers may assume all stacks expose the same operational interfaces. Cross-stack parity remains strong for the core solver and BDD contract, but not for API/web capabilities.

**Refactor Recommendation and Strategy**  
Maintain a parity matrix in the next specification: core solver parity required for all stacks; API/web parity optional or roadmap-based.

## 6. Low - CSharp loader validation relies on typed deserialization for integer enforcement

**Risk Description/Explanation**  
The CSharp loader validates dimensions and numeric range but does not perform an explicit integer-type check in the same way TypeScript and Python do. Because the target model uses `int[][]`, non-integer JSON values will generally fail during deserialization or conversion rather than through the exact v1.0 error path.

**Evidence Outline**

- v1.0 includes integer value validation: `DOCS/.design/sudoku-solver-specification.md` (lines 677-684).
- TypeScript explicitly uses `Number.isInteger`: `demo-apps/demoapp001-typescript-cypress/app_src/PuzzleLoader.ts` (lines 61-66).
- Python explicitly checks `isinstance(cell, int)`: `demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py` (lines 66-70).
- CSharp checks range on already-typed `int` cells: `demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs` (lines 85-92).

**Impact Analysis**  
The behaviour is likely acceptable at runtime, but error messages and validation attribution may differ from the v1.0 structure-validation wording.

**Refactor Recommendation and Strategy**  
Either document typed deserialization as CSharp's integer validation mechanism or add deserialization exception wrapping so invalid numeric shape yields a loader validation message.

---

[Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md) | [Next: Project Reviews](03_PROJECT_REVIEWS/)
