# Architecture Assessment

Assessed against SOLID, KISS, YAGNI, DRY, and ISTQB principles.

---

## SOLID

### Single Responsibility Principle

**TypeScript subject application:** Each class has one responsibility. `SudokuSolver` implements
algorithms; `SudokuOrchestrator` coordinates the solve loop; `PuzzleLoader` reads and validates
puzzle data; `SudokuCLI` formats and presents results; `index.ts` handles CLI argument parsing
and lifecycle. No class combines concerns.

**TypeScript Screenplay layer:** Each Task and Question class has a single factory method per
behavior (factory methods are the units of responsibility). `InitialiseGrid` handles grid setup
only; `ApplyAlgorithm` handles algorithm invocation only; `SolvePuzzle` handles orchestration
only. Eleven dedicated Task classes and eleven dedicated Question classes with clear single-
purpose names.

**Python stack:** Functionally equivalent. The monolithic `__init__.py` files collect many
classes in one file, but each class still has single responsibility internally.

**Assessment: Strong.** SRP is well observed at the class level across both stacks.

### Open/Closed Principle

The Screenplay layer is open for extension without modification. A new algorithm (e.g., Naked
Pairs) requires: a new method on `SudokuSolver`, a new factory method on `ApplyAlgorithm` Task,
a new static method on `AlgorithmMadeProgress` or a new Question class, and a new step
definition. No existing Task, Question, or Ability class is modified. The orchestrator receives
a new technique invocation in its loop. Feature files receive new scenarios.

**Assessment: Strong.** Extension paths are well-defined and do not require modification of
existing components.

### Liskov Substitution Principle

Not directly applicable at the class level (no significant inheritance hierarchies). The
Screenplay actor contract (`attempts_to`, `answer`, `remember`, `recall`, `ability_to`) is
a protocol, not an inheritance hierarchy. Both stacks implement the protocol correctly.

### Interface Segregation Principle

Abilities expose minimal interfaces. After the BACKLOG-023 refactor, `UseSudokuSolver` exposes
only the methods needed by Tasks: `initialise()`, `getSolver()`, algorithm application methods,
`solvePuzzle()`, and snapshot helpers. The large helper-method surface that preceded the refactor
has been removed. `LoadPuzzles` exposes only `getCount()`, `getAll()`, `getByName()`,
`getByDifficulty()`, and `getByIndex()`.

**Assessment: Strong.** Ability interfaces are minimal and stable after BACKLOG-023.

### Dependency Inversion Principle

Tasks and Questions depend on the Actor abstraction, not on concrete Ability classes directly.
Tasks receive the Actor via `Interaction.where()` (TypeScript) / `Task(action)` (Python) and
retrieve Abilities via `actor.ability_to(UseSudokuSolver)`. This means Tasks are testable
independently by substituting a mock Actor.

The subject application has no dependency on the test layer. `SudokuSolver` accepts an optional
`AuditLogger` via setter injection, keeping the core algorithm free of logging coupling.

**Assessment: Strong.** Dependency inversion is observed at both the subject application and
Screenplay layers.

---

## KISS (Keep It Simple)

The solver uses three deterministic techniques without guessing or backtracking. The architecture
uses exactly as many layers as needed (5) with well-defined boundaries. The canonical feature
file is a single `.feature` file, not split across multiple files. The orchestration script is a
single PowerShell file.

One area of complexity: the `_PENDING_MISSING_DIGIT_CONTEXT` transient memory key used in
Python step definitions to coordinate a two-step Gherkin context. This is an internal workaround
for a multi-step setup pattern and is not part of the parity contract. It is acceptable but
should be documented as a local convention to avoid confusion by future contributors.

**Assessment: Strong.** The design minimises accidental complexity. All complexity present
is inherent (multi-step Gherkin setup, grid state management across scenario steps).

---

## YAGNI (You Aren't Gonna Need It)

The solver does not implement backtracking, trial-and-error, Naked Pairs, X-Wing, or Swordfish.
These are explicitly out of scope (BACKLOG-014 tracks them as Future). The subject application
contract documents the `@util` surface as in-scope and the `@cli` surface as a documented-but-
deferred baseline. No infrastructure for features that do not yet exist has been added.

The `packages/` directory (DR-028) is defined as optional and is not created -- correctly, since
no shared packages exist yet.

**Assessment: Strong.** No speculative generalisation detected.

---

## DRY (Don't Repeat Yourself)

**Positive observations:**
- `SOLVER_ACTOR` constant in `actors.ts` eliminates the repeated `'Solver'` string across all
  step-definition files (BACKLOG-030).
- `constants.ts` / `constants.py` define `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`, `MIN_DIGIT`,
  `MAX_DIGIT` once and import them throughout.
- `GridFixtures.ts` / `grid_fixtures.py` consolidate all grid setup logic. Tasks call fixtures
  rather than duplicating setup code.
- The canonical feature file is the single source of Gherkin truth; Stack-local copies contain
  only the Stack tag addition.

**Remaining repetition:**
- `puzzles.json` is duplicated in both Stack directories. The data is currently identical but
  there is no automated enforcement. This is an acceptable trade-off given DR-026 (test data is
  Stack-local), but it is worth noting as a future DRY concern when a third Stack is added.
- Algorithm logic in `SudokuSolver.ts` and `sudoku_solver.py` is necessarily duplicated across
  language boundaries. This is inherent to multi-language parity, not a DRY violation, but it
  must be managed via the parity contract.

**Assessment: Strong.** Duplication is either intentional (cross-language parity) or governed
(Stack-local data per DR-026).

---

## ISTQB Principles

**Independent testing:** Each scenario uses a fresh Actor instance created by the `actor`
fixture/hook. Solvers are constructed with deep-copy semantics. No test-level global state.

**Early defect detection:** Validation in `PuzzleLoader` and `SudokuSolver` constructors raises
errors at initialization time, not during algorithm execution. This is consistent with ISTQB's
shift-left principle.

**Absence of defect fallacy:** The 46 canonical scenarios test behavior at a unit level, but the
`@cli` surface is not tested. A defect in `index.ts` exit-code handling would not be caught by
any current scenario. This is an accepted gap per DR-003.

**Traceability:** All 46 scenarios are traceable to requirements via the canonical feature file
and the `@util` surface tag. The parity contract documents the mapping from scenario group to
Screenplay component. The decision register traces structural choices to their context and
alternatives.

**Test independence:** The pytest-bdd `actor` fixture is function-scoped; the Serenity/JS
Before hook creates a fresh Actor per scenario. Scenarios are independent. Order-dependent
failures are not possible given the current fixture design.

**Assessment: Strong.** ISTQB principles are well-observed. The `@cli` surface gap is
documented and accepted.

---

## Reference Architecture v1.13 Compliance Summary

| Section | Requirement | Status |
|---------|-------------|--------|
| Section 2.1 -- Layer model | 5 layers present and segregated | Compliant |
| Section 3 -- Screenplay pattern | Actor, Ability, Task, Question all implemented | Compliant |
| Section 3.5 -- Memory contract | Six keys defined; GridCell snapshot methods use ability field in both stacks by design | Compliant |
| Section 4 -- Directory blueprint | DR-001 dot-prefix divergence documented | Compliant (DR-001) |
| Section 5 -- Canonical feature store | `features-shared/` authoritative | Compliant |
| Section 5.5 -- Feature change governance | DR-024 adds breaking-change gate | Compliant |
| Section 5.6 -- Test data management | Stack-local `puzzles.json`, deep-copy enforced | Compliant |
| Section 6 -- @util surface contract | DR-021 formalises contract | Compliant |
| Section 8.1 -- Memory key parity | Checker script exists; CI gate pending | Partial |
| Section 8.4 -- Parity criteria | Automated for criteria 1, 2, 3; manual for 4, 5 | Compliant |
| Section 9.4 -- CI/CD pipeline | GitHub Actions workflow active | Compliant |
| Section 10.6 -- Decision register | DR-001 through DR-028 current | Compliant |
| Section 10.7 -- Code review outputs | This review in `.review/CODE_REVIEW_CLAUDE_v1_*/` | Compliant |
