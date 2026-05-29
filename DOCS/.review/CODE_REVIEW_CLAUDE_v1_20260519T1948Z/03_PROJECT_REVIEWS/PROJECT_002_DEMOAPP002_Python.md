# DEMOAPP002_PYTHON_PYTEST -- Project Review

**Stack:** `DEMOAPP002_PYTHON_PYTEST`
**Language/Framework:** Python 3.13 / pytest-bdd 8.x
**Surface:** `@util` (in-process)
**Entry point:** `demo-apps/demoapp002-python-pytest/`
**Execution baseline:** 46 scenarios -- all passing

---

## Architecture and Design

- The Actor contract is implemented as a pure-Python class in
  `tests/screenplay/support/actor.py`. The `attempts_to()`, `answer()`, `remember()`, and
  `recall()` methods match the Screenplay parity contract. `ability_to()` correctly retrieves an
  Ability instance by type. The absence of a Serenity/JS dependency is appropriate -- pytest-bdd
  does not require a Serenity integration layer.

- Memory key constants in `tests/screenplay/support/memory_keys.py` match the TypeScript
  definitions exactly: same six keys (`SOLVE_RESULT`, `ALGORITHM_PROGRESS`, `LAST_ERROR`,
  `TARGET_CELL`, `GRID_SNAPSHOT`, `VALIDATION_RESULT`), and name=value parity is preserved. The
  memory key parity checker confirms this.

- Tasks and Questions are both implemented as class collections inside their respective package
  `__init__.py` files (`tasks/__init__.py`, `questions/__init__.py`) rather than as individual
  files per class. This is a structural divergence from the TypeScript reference implementation,
  where each of the eleven Task classes and eleven Question classes has its own file. The
  monolithic `__init__.py` approach works but reduces navigability and increases the risk of
  merge conflicts as the Stack grows.

- `UseSudokuSolver` and `LoadPuzzles` Abilities in `tests/screenplay/abilities/` are clean
  Python translations of the TypeScript counterparts. Deep-copy semantics are preserved via
  `deepcopy()`. All algorithm delegation methods (`apply_unit_completion()`,
  `apply_hidden_singles()`, `apply_naked_singles()`) are present and correctly update the
  `algorithm_made_progress` flag.

- `grid_fixtures.py` provides pure functions that mirror the TypeScript `GridFixtures.ts` module.
  The setup functions accept a `SudokuSolver` instance and perform grid mutation without
  returning state. This is the correct Screenplay fixture pattern.

## Code Quality

- Python idioms are used consistently throughout. Type hints use the modern `|` union syntax
  (`list[list[int]] | None`). Dataclasses with `frozen=True` are used for immutable `Puzzle`
  records in `puzzle_loader.py`. f-strings and list comprehensions appear where appropriate.

- The `audit.py` module includes a `SudokuAuditLogger` class with timestamped event recording,
  per-algorithm change counts, and a `to_dict()` serialisation method. The JSON output format
  matches the TypeScript audit trail shape.

- PEP 8 compliance is maintained across all source files. Import ordering follows standard
  convention (stdlib, third-party, local).

- Two structural issues in the Questions module reduce code quality:

  1. Several `GridCell` static methods call `actor.ability_to(UseSudokuSolver)` directly for
     snapshot comparisons, bypassing the `GRID_SNAPSHOT` Memory key. This couples the Question
     layer to the Ability layer without going through Actor memory (Risk 1 in
     `02_RISKS_AND_ISSUES.md`).

  2. `MultipleSolvers.isolation_verified()` mutates Ability state inside the question resolver
     (Risk 2 in `02_RISKS_AND_ISSUES.md`).

## Test Coverage

- All 46 canonical scenarios pass. The step definitions in
  `tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py` cover every Gherkin step
  in `BasicSudokuSolverLogic.feature` using the `@given`, `@when`, `@then` decorators with
  `parsers.parse()` for parameterised steps.

- The `actor` pytest fixture is scoped per-function (implicitly, since no scope is specified).
  This ensures a fresh Actor and fresh Abilities for every scenario, preventing inter-scenario
  state leakage. This matches the TypeScript stack's per-scenario Actor lifecycle.

- The `_PENDING_MISSING_DIGIT_CONTEXT` actor memory key is used as a temporary coordination
  mechanism between the "column N contains M non-zero values" step and the "the missing digit
  is D" step. This is a pragmatic workaround for a two-step Gherkin context pattern. It is not
  defined in `memory_keys.py` because it is transient and not part of the parity contract. The
  pattern is acceptable but should be documented as a local convention.

- Two Task factory methods (`SetupGridState.row_column_constraints()` and
  `column_row_constraints()`) are no-ops: they accept constraint parameters but ignore them and
  only call `take_snapshot()`. The corresponding Gherkin steps pass because subsequent assertions
  rely on grid state from prior steps rather than on the constraint setup. This represents a
  silent coverage gap (Risk 3 in `02_RISKS_AND_ISSUES.md`).

## Documentation

- The Python stack does not have a dedicated `docs/` directory at the time of this review. The
  TypeScript stack has `demo-apps/demoapp001-typescript-cypress/docs/` with architecture,
  algorithm, and README content. Adding equivalent Python stack documentation would complete the
  structural parity with DEMOAPP001 and provide reference material for DEMOAPP003 authors.

- `pyproject.toml` is minimal and correct. It specifies `requires-python = ">=3.11"` and
  `pytest >= 8.0` / `pytest-bdd >= 8.0` in the test extras. A `[tool.pytest.ini_options]`
  section with `bdd_features_base_dir` would reduce the path argument in the `scenarios()` call
  in the step definitions file, but this is a minor style preference.

## Strengths

- The Python solver is an accurate semantic translation of the TypeScript algorithms. All three
  techniques produce identical results on the same input grids. The `orig_grid` deep-copy
  invariant is preserved, making the solver safe for multi-instance and isolation tests.

- The `Actor` class is self-contained and does not depend on any third-party framework. This
  makes it portable to DEMOAPP003 without modification (beyond language translation). The
  `ability_to(type)` pattern using `isinstance()` lookup is idiomatic and testable.

- The `Task` and `Question` base classes in their respective `__init__.py` files define a
  consistent protocol via `perform_as(actor)` and `answered_by(actor)`. The Actor's
  `attempts_to()` and `answer()` methods delegate to these methods, maintaining the contract.

- The audit trail integration in the Python stack is feature-complete: `EnableAuditLogging.for_
  current_solver()`, `SolvePuzzle.with_current_grid_and_audit()`, and `AuditTrail.current()` are
  all implemented and exercised by the audit scenario.

## Weaknesses

- Tasks and Questions are implemented in monolithic `__init__.py` files rather than per-class
  files. This deviates from the TypeScript reference pattern and reduces discoverability. The
  parity contract document lists eleven Task classes and eleven Question classes; a new Stack
  author reading the Python source will see all classes in a single file rather than the
  modular structure implied by the contract.

- `SetupGridState.row_column_constraints()` and `column_row_constraints()` are no-ops. The
  TypeScript equivalent correctly calls `GridFixtures.setupRowColumnConstraints()`. This gap
  means the Hidden Singles constraint-setup scenarios are not fully exercised in Python.

- `MultipleSolvers.isolation_verified()` is both impure (side effects in a Question) and
  structurally coupled to implementation details of `multiple_solvers` list ordering. Any change
  to how `UseSudokuSolver` stores multiple solver instances will silently break this assertion.
