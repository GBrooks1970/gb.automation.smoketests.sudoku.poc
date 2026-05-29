# Cross-Project Analysis

---

## Tool-Agnostic Tests -- can tests run across frameworks?

Yes. The canonical feature file located at [features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature](features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature) acts as the single source of behavioral specification for the entire project. Each Stack copies this file to its local `/tests/features/` folder, adding only stack-specific tags (such as `@stack-demoapp001`, `@stack-demoapp002`, or `@stack-demoapp003`).

Because the Gherkin step text is identical across all three implementations, test execution is completely tool-agnostic. The BDD engines—CucumberJS (TypeScript), pytest-bdd (Python), and SpecFlow (C#)—successfully parse and map the exact same sentences, showcasing excellent multi-framework layer isolation.

---

## Single Source of Truth -- feature file and data consistency

* **Features**: Enforced correctly. The canonical feature file is the master, and the step-text parity checker (`.batch/check-step-text-parity.ps1`) enforces that local copies do not diverge.
* **Test Puzzles**: Currently, `puzzles.json` is duplicated across three distinct stack directories:
  - `demo-apps/demoapp001-typescript-cypress/puzzles.json`
  - `demo-apps/demoapp002-python-pytest/puzzles.json`
  - `demo-apps/demoapp003-csharp-specflow/puzzles.json`
  They are identical by convention, but duplication across three folders introduces a maintenance overhead. As part of future expansion (e.g. extending the API surfaces), it would be highly beneficial to centralize the puzzles schema, or have standard tooling copy files from a shared folder.

---

## Screenplay Parity -- consistency across Stack implementations

The Screenplay implementation across the three language stacks is highly consistent:

* **Memory Keys**: All three Stacks utilize the identical list of six keys representing test telemetry parameters. Parity is enforced programmatically via `.batch/check-memory-key-parity.ps1`.
* **Actor Protocol**: Each stack fully supports state containment via generic remember/recall methods, ensuring no out-of-band state leaking occurs:
  - TypeScript: Serenity/JS native actor notes
  - Python: custom dictionary-backed `Actor` class
  - C#: type-safe generic dictionary-backed `Actor` class
* **Ability Segregation**: Abilities (`UseSudokuSolver` and `LoadPuzzles`) translate the core application boundaries consistently, and provide deep copy protections (via `JS structuredClone`, Python `copy.deepcopy`, and custom C# `GridHelpers.DeepCopy`).
* **Task/Question Interfaces**: TypeScript maps interactions via distinct individual class files, whereas Python and C# group related tasks into cohesive factory utilities (static collections) to stay idiomatic and lightweight.

---

## Documentation Alignment -- consistency and completeness

| Document | TypeScript (`demoapp001`) | Python (`demoapp002`) | C# (`demoapp003`) |
|----------|---------------------------|-------|---|
| Stack README | Present | Absent | Present |
| Architecture Guide | Present | Absent | Present |
| QA Strategy | Present | Absent | Present |
| Screenplay Guide | Present | Absent | Present |

The TypeScript and C# Stacks have outstanding, multi-file local documentation structures under their local `docs/` folders. The Python Stack's lack of local documentation creates the sole structural gap in documentation completeness.

---

## Test Coverage Metrics -- quantitative assessment

| Metric | TypeScript Stack | Python Stack | C# Stack |
|--------|------------------|--------------|----------|
| Total BDD Scenarios | 46 | 46 | 46 |
| BDD Gherkin Steps | 257 | 257 | 257 |
| Success / Pass Rate | 100% | 100% | 100% |
| Shared Memory Keys | 6 / 6 | 6 / 6 | 6 / 6 |
| Deterministic Solving Techniques | Unit-Completion, Hidden-Singles, Naked-Singles | Unit-Completion, Hidden-Singles, Naked-Singles | Unit-Completion, Hidden-Singles, Naked-Singles |
| JSON Audit Trails | Validated | Validated | Validated |
