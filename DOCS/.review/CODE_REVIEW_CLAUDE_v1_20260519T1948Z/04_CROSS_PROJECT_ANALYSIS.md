# Cross-Project Analysis

---

## Tool-Agnostic Tests -- can tests run across frameworks?

The canonical feature file at `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`
is the single behavioral specification. Stack-local copies carry only the additional Stack tag
(`@stack-demoapp001`, `@stack-demoapp002`). Gherkin step text is identical across stacks; the
step-text parity checker (`.batch/check-step-text-parity.ps1`) verifies this as a CI gate.

The test runner bindings (Cucumber.js for TypeScript, pytest-bdd for Python) are entirely within
each Stack's layer-2 step-definition files. The subject application logic, Screenplay Tasks,
Questions, and Abilities are test-runner agnostic. Adding a third runner (SpecFlow for C#) does
not require changes to the canonical feature file or the shared fixtures contract.

**Assessment: Passed.** The architecture correctly isolates framework dependencies to the step-
definition layer.

---

## Single Source of Truth -- feature file and data consistency

The canonical feature file is authoritative at `features-shared/util-tests/sudoku-solver/
BasicSudokuSolverLogic.feature`. Both Stack-local copies are verified against it by the step-
text parity checker and the feature parity report generator
(`.batch/generate-feature-parity-report.ps1`).

Puzzle data lives in Stack-local `puzzles.json` files under each demo-app directory. There is
currently no shared puzzle data store. Both stacks reference the same five puzzles by name in
their scenarios ("Easy Scan Grid", "Logic Squeeze Grid", "Empty Grid", etc.). If puzzle data
diverges between stacks, scenario results could diverge silently. The current data is identical
(verified by inspection), but there is no automated cross-stack puzzle data parity check.

**Assessment: Substantially passed.** Feature parity is automated and enforced. Puzzle data
parity is manual and relies on the two `puzzles.json` files staying in sync by convention.
Consider adding a cross-stack data parity check to the feature parity report script (BACKLOG-009
scope) when the REST API stack is onboarded and puzzle data becomes a first-class concern.

---

## Screenplay Parity -- consistency across Stack implementations

**Memory keys:** All six constants defined identically in both stacks. Verified by
`.batch/check-memory-key-parity.ps1`. Name=value parity enforced. Pass.

**Actor contract:** Both stacks implement `attempts_to()`, `answer()`, `remember()`, `recall()`,
and `ability_to()`. The TypeScript Actor is provided by Serenity/JS `actorCalled()`; the Python
Actor is a hand-written class. The interface shapes match the parity contract. Pass.

**Ability signatures:** `UseSudokuSolver` and `LoadPuzzles` are present in both stacks with
matching method shapes. `apply_unit_completion()` / `applyUnitCompletion()`,
`apply_hidden_singles(digit)` / `applyHiddenSingles(target)`, `apply_naked_singles()` /
`applyNakedSingles()`, `solve_puzzle()` / `solvePuzzle()`, etc. Pass.

**Task factory signatures:** All eleven Task classes are present in both stacks with matching
factory method names and parameters. The Python implementations are in `tasks/__init__.py`
(monolithic) vs per-file in TypeScript. Functional parity confirmed by scenario execution. Pass.

**Question factory signatures:** All eleven Question classes are present in both stacks.
Functional parity confirmed by scenario execution. However, four Python `GridCell` static
methods bypass Actor memory and access the Ability directly, diverging from the TypeScript
implementation pattern. Functional parity is achieved, but structural parity has gaps. See
Risk 1 in `02_RISKS_AND_ISSUES.md`. Partial pass.

**Step text parity:** Verified by `.batch/check-step-text-parity.ps1`. All step texts in both
Stack-local feature files match the canonical file (excluding Stack-local tag additions). Pass.

**Overall Screenplay parity assessment:** Functional parity complete (46/46 scenarios passing in
both stacks). Structural parity has two gaps (Questions memory bypass, side-effecting Question).

---

## Documentation Alignment -- consistency and completeness

| Document | TypeScript (DEMOAPP001) | Python (DEMOAPP002) | Gap |
|----------|------------------------|---------------------|-----|
| Stack README | Present, current, includes Serenity report instructions | Absent | Gap |
| Algorithm docs | Present under `docs/` | Absent | Gap |
| Architecture docs | Referenced via DOCS/.architecture/ | Referenced via DOCS/.architecture/ | None |
| Parity contract | `screenplay-parity-contract.md` covers both stacks | Same document | None |
| Subject app contract | `subject-app-contract.md` covers both | Same document | None |
| Naming conventions | `naming-conventions.md` covers both | Same document | None |

The Python Stack lacks a Stack-level `docs/` directory equivalent to the TypeScript stack's
`demo-apps/demoapp001-typescript-cypress/docs/`. This is not currently required by the parity
contract, but the absence means a DEMOAPP003 author has no Python-stack-specific reference.

---

## Test Coverage Metrics -- quantitative assessment

| Metric | DEMOAPP001 (TypeScript) | DEMOAPP002 (Python) |
|--------|------------------------|---------------------|
| Total scenarios | 46 | 46 |
| Total steps | 257 | 46 * avg_steps |
| Pass rate | 100% | 100% |
| Scenario groups | 11 | 11 |
| Memory keys exercised | 6/6 | 6/6 (but GRID_SNAPSHOT reads bypass memory in Questions) |
| Algorithm coverage | Unit Completion, Hidden Singles, Naked Singles | Same |
| Error simulation coverage | 3 error types | 3 error types |
| Audit trail coverage | 1 scenario (3 assertions) | 1 scenario (4 assertions) |

Both stacks achieve 100% scenario pass rate against the 46 canonical scenarios. The Python stack
exercises all 11 algorithm and feature groups. The constraint-setup no-ops (Risk 3) mean that two
specific Hidden Singles sub-scenarios are not fully exercised as intended, but they still pass.
