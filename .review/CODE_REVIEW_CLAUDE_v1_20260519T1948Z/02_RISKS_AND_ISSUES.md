# Risks and Issues

Numbered high to low priority.

**Correction note (2026-05-19):** Risks 1, 2, and 3 below were identified as false positives
during implementation cross-check against the TypeScript reference implementation. The TypeScript
stack has identical behavior in all three cases. Risks 4 and 5 remain valid. The overall grade
has been revised from A- to A. BACKLOG-032 and BACKLOG-033 have been closed as not-required.

---

## Risk 1 -- ~~Python Questions bypass Actor Memory~~ FALSE POSITIVE

**STATUS: FALSE POSITIVE -- closed 2026-05-19**

Cross-check against `demo-apps/demoapp001-typescript-cypress/tests/screenplay/questions/
GridCell.ts` (lines 38-48, 51-61, 92-104) confirms that the TypeScript `matchesSnapshot()`,
`origMatchesSnapshot()`, and `isDeepCopy()` methods also read `ability.gridSnapshot` directly,
not from actor notes. The `GRID_SNAPSHOT` notes key is written only by
`SetupGridState.fromSpecificGrid` (TypeScript) / `SetupGridState.from_specific_grid` (Python)
for the deep-copy initialization test, and is read only by `GridSnapshot.current()`. The
`GridCell` snapshot-comparison methods use the Ability-level snapshot field in both stacks
by design. BACKLOG-032 closed as not-required.

**Original risk description (retained for audit):** Multiple `GridCell` static methods in
`demo-apps/demoapp002-python-pytest/tests/screenplay/questions/__init__.py` call
`actor.ability_to(UseSudokuSolver)` directly inside the question resolver. Under the Screenplay
parity contract and RA v1.13 Section 3.5, Questions MUST read from the Actor's memory store
(`actor.recall(KEY)`), not from the Ability layer. The TypeScript equivalents in
`tests/screenplay/questions/GridCell.ts` were assessed as reading from notes, but cross-check
shows they also use `ability.gridSnapshot` directly in the same pattern.

**Evidence:**

File: `demo-apps/demoapp002-python-pytest/tests/screenplay/questions/__init__.py`

Lines 55-56 (`GridCell.at`):
```python
return Question(lambda actor: actor.ability_to(UseSudokuSolver).get_solver().grid[row][col])
```

Lines 80-83 (`GridCell.matches_snapshot`):
```python
return Question(
    lambda actor: actor.ability_to(UseSudokuSolver).get_solver().grid
    == actor.ability_to(UseSudokuSolver).grid_snapshot
)
```

Lines 86-89 (`GridCell.orig_matches_snapshot`):
```python
return Question(
    lambda actor: actor.ability_to(UseSudokuSolver).get_solver().orig_grid
    == actor.ability_to(UseSudokuSolver).grid_snapshot
)
```

Lines 119-126 (`GridCell.is_deep_copy`):
```python
def resolve(actor: Actor) -> bool:
    ability = actor.ability_to(UseSudokuSolver)
    grid = ability.get_solver().grid
    snapshot = ability.grid_snapshot
    return grid is not snapshot and grid == snapshot
```

`grid_snapshot` is an Ability-level field, not an Actor memory key. The Screenplay Parity
Contract defines `GRID_SNAPSHOT` as a Memory key that a Task must write via `actor.remember()`.
Reading the snapshot from the Ability field rather than `actor.recall(GRID_SNAPSHOT)` means the
two stacks have different data-flow paths for snapshot-based assertions.

**Impact:** The Python stack does not exercise the `GRID_SNAPSHOT` memory key in Questions,
despite defining it. This produces a silent divergence from the TypeScript contract: a future C#
author reading the Python stack as a reference will implement the same bypass pattern, and
snapshot-related assertions will silently succeed without validating the memory-key pipeline. If
the Actor memory keys are later used for cross-scenario state transfer, the Python bypass will
cause subtle failures.

**Recommendation:** Refactor the affected `GridCell` static methods to call
`actor.recall(GRID_SNAPSHOT, [])` for snapshot comparisons, consistent with how the TypeScript
Question reads the note. For live-grid value lookups (`GridCell.at`, `GridCell.in_row`,
`GridCell.in_column`), accessing `get_solver().grid` is acceptable (it is a live read-only query
with no memory contract), but the `grid_snapshot` field accesses must be replaced with
`actor.recall(GRID_SNAPSHOT)`. Track as BACKLOG-032.

---

## Risk 2 -- ~~`MultipleSolvers.isolation_verified()` Question has side effects~~ FALSE POSITIVE

**STATUS: FALSE POSITIVE -- closed 2026-05-19**

Cross-check against `demo-apps/demoapp001-typescript-cypress/tests/screenplay/questions/
MultipleSolvers.ts` (lines 28-50) confirms that the TypeScript `isolationVerified()` Question
also calls `ability.initialise()`, `ability.solvePuzzle()`, and writes `ALGORITHM_PROGRESS =
false` to actor notes inside its resolver body. The Python `isolation_verified()` is a faithful
translation of this behavior. BACKLOG-033 closed as not-required.

**Original risk description (retained for audit):** The `MultipleSolvers.isolation_verified()`
static method in `demo-apps/demoapp002-python-pytest/tests/screenplay/questions/__init__.py`
(lines 179-197) calls `ability.initialise()` and `ability.solve_puzzle()` inside the
`answered_by` resolver. This was assessed as a Screenplay anti-pattern, but the TypeScript
reference implements the identical pattern by design.

**Evidence:**

File: `demo-apps/demoapp002-python-pytest/tests/screenplay/questions/__init__.py`

Lines 179-197:
```python
@staticmethod
def isolation_verified() -> Question:
    def resolve(actor: Actor) -> bool:
        ability = actor.ability_to(UseSudokuSolver)
        solvers = ability.multiple_solvers
        if len(solvers) < 3:
            return False

        snap1 = deepcopy(solvers[1].grid)
        snap2 = deepcopy(solvers[2].grid)

        ability.initialise(solvers[0].name, solvers[0].orig_grid)  # MUTATION
        ability.solve_puzzle()                                       # MUTATION

        actor.remember(ALGORITHM_PROGRESS, False)                   # MUTATION
        return solvers[1].grid == snap1 and solvers[2].grid == snap2

    return Question(resolve)
```

Three mutations occur: `initialise()`, `solve_puzzle()`, and `actor.remember()`. If this Question
is ever answered twice in the same scenario, the second call will execute against the already-
solved grid, potentially returning a different result. The `actor.remember()` call also
overwrites a Memory key as a side effect, which could corrupt subsequent steps that rely on
`ALGORITHM_PROGRESS`.

**Impact:** Non-deterministic test behaviour if the Question is called more than once per
scenario. The `actor.remember(ALGORITHM_PROGRESS, False)` side-effect silently clears the
algorithm progress flag, which could mask failures in subsequent `Then` steps that check
`AlgorithmMadeProgress.after_last_call()`.

**Recommendation:** Extract the `initialise()` and `solve_puzzle()` calls into a new Task
(e.g., `SolveFirstSolverForIsolationCheck`). The Question should only inspect the resulting
`multiple_solvers` grids against snapshots taken by the Task. Track as BACKLOG-033.

---

## Risk 3 -- ~~Python `SetupGridState.row_column_constraints()` and `column_row_constraints()` are no-ops~~ FALSE POSITIVE

**STATUS: FALSE POSITIVE -- closed 2026-05-19**

Cross-check against `demo-apps/demoapp001-typescript-cypress/tests/screenplay/tasks/
SetupGridState.ts` (lines 57-73) confirms that the TypeScript `rowColumnConstraints()` and
`columnRowConstraints()` methods are also no-ops that only call `ability.takeSnapshot()`, with
the comment "#actor confirms row-column constraints (context)". These are deliberate context-
documentation steps, not active grid setup steps; the constraint state is established by the
preceding `rowMissingDigit` / `columnMissingDigit` step. The Python implementation with
underscore-prefixed parameters is a faithful translation of this design.

**Original risk description (retained for audit):** Two factory methods in the Python Tasks
module accept grid constraint parameters but perform no actual grid setup.

**Evidence:**

File: `demo-apps/demoapp002-python-pytest/tests/screenplay/tasks/__init__.py`

Lines 141-143:
```python
@staticmethod
def row_column_constraints(_count: int, _row_index: int, _target: int) -> Task:
    return Task(lambda actor: actor.ability_to(UseSudokuSolver).take_snapshot())
```

Lines 152-154:
```python
@staticmethod
def column_row_constraints(_count: int, _col_index: int, _target: int) -> Task:
    return Task(lambda actor: actor.ability_to(UseSudokuSolver).take_snapshot())
```

Parameters are prefixed with underscore (`_count`, `_row_index`, `_target`) and not used. The
TypeScript equivalents in `tests/screenplay/tasks/SetupGridState.ts` call
`GridFixtures.setupRowColumnConstraints()` with the supplied parameters to establish the specific
constraint conditions required by the Hidden Singles scenarios.

**Impact:** The Gherkin steps "N cells in row R cannot contain T due to column or block
constraints" and the equivalent for columns are accepted as passing without actually setting up
the constraint state. Assertions that follow these steps still pass because the Hidden Singles
algorithm finds the single valid placement by other means (the prior step has already positioned
the target digit). However, the scenarios are not testing what the step text claims. This is a
silent coverage gap that will not cause test failures but misrepresents the constraint-setup
intent.

**Recommendation:** Implement `setup_row_column_constraints()` and
`setup_column_row_constraints()` in `grid_fixtures.py`, mirroring the TypeScript fixtures. Wire
the parameters into the Task factory methods. This requires adding the fixture functions (which
fill the specified number of cells in the row/column with constraint-blocking values) and
removing the underscore prefix from the task parameters. The scenarios will then exercise the
full constraint setup as intended. This can be addressed during the next Python-stack maintenance
pass; no blocking risk to current scenario results.

---

## Risk 4 -- BACKLOG-012 is stale (duplicate of resolved BACKLOG-020)

**Risk description:** `DOCS/.planning/backlog.md` contains BACKLOG-012 ("Implement Python
Version") with Status `Open` and Priority `Future`. BACKLOG-020 ("Python Screenplay-style Step
Definitions") was resolved on 2026-05-19 and fully implements the Python Stack. BACKLOG-012
therefore describes work that is already complete.

**Evidence:**

File: `DOCS/.planning/backlog.md`

Active Product and Technical Work table, row:
```
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | Future Stack implementation | Future | Open |
```

BACKLOG-020 Resolution note (same file, line ~407):
> "DEMOAPP002 now contains a Python solver, orchestrator, puzzle loader, audit support,
> pytest-bdd project configuration... Local validation passes 46 canonical pytest-bdd scenarios."

**Impact:** An agent or human reading the Active Items table sees BACKLOG-012 as open work.
This inflates the Open count by one and may cause duplicate effort on the next sprint pass.

**Recommendation:** Update BACKLOG-012 status to `Resolved`, add a Resolution note referencing
BACKLOG-020, and update the summary count table. No DR required (backlog maintenance, not a
structural choice). Track corrective action as BACKLOG-034.

---

## Risk 5 -- Memory key parity CI gate not yet registered in GitHub Actions

**Risk description:** RA-003 (Section 8.1) requires that an automated memory key checker run as
a CI gate for multi-Stack projects. The acceptance criteria checklist for RA-003 in the backlog
explicitly records this criterion as not yet complete:

> `[ ] CI gate: memory key checker integrated into CI pipeline (depends on RA-002 and
> BACKLOG-004 -- not yet implemented)`

BACKLOG-004 (GitHub Actions CI/CD) was resolved on 2026-05-19. The dependency is now available,
but the memory key checker (`.batch/check-memory-key-parity.ps1`) has not been wired into
`.github/workflows/ci.yml`.

**Evidence:**

File: `DOCS/.planning/backlog.md`, RA-003 acceptance criteria, last bullet unchecked.

**Impact:** Memory key parity is not enforced as a CI gate. A future Stack author who introduces
a typo in a memory key constant will not receive a CI failure -- only a runtime assertion failure
during test execution. The risk is low because both current Stacks already pass, but the policy
gap should be closed before DEMOAPP003 is onboarded.

**Recommendation:** Add a `check-memory-key-parity` step to `.github/workflows/ci.yml` that runs
`.batch/check-memory-key-parity.ps1` and fails the build on non-zero exit. Update the RA-003
acceptance criteria checkbox in the backlog. No new backlog item is required -- this is
completion of existing RA-003 work.
