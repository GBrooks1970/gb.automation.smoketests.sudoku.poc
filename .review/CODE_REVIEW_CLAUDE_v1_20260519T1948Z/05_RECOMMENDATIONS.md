# Recommendations

Prioritised from highest to lowest impact. Backlog IDs are referenced where new items are needed.

---

## ~~P1 -- Refactor Python Questions to read from Actor memory (BACKLOG-032)~~ NOT REQUIRED

**STATUS: FALSE POSITIVE -- BACKLOG-032 closed 2026-05-19.** TypeScript `GridCell` Questions
use `ability.gridSnapshot` directly in the same pattern. No action required.

**Priority:** High -- must be resolved before DEMOAPP003 is authored.

Refactor the `GridCell` static methods in `demo-apps/demoapp002-python-pytest/tests/screenplay/
questions/__init__.py` that access `ability_to(UseSudokuSolver).grid_snapshot` directly. Replace
with `actor.recall(GRID_SNAPSHOT, [])` to use the Actor memory key as the TypeScript stack does.

Affected methods: `matches_snapshot()`, `orig_matches_snapshot()`, `is_deep_copy()`.

The live-grid value methods (`at()`, `in_row()`, `in_column()`, `all_filled()`, etc.) correctly
access `get_solver().grid` and do not need to change -- these are valid real-time reads.

Effort estimate: 1--2 hours. No DR required.

---

## ~~P1 -- Extract side effects from `MultipleSolvers.isolation_verified()` (BACKLOG-033)~~ NOT REQUIRED

**STATUS: FALSE POSITIVE -- BACKLOG-033 closed 2026-05-19.** TypeScript `MultipleSolvers.
isolationVerified()` has identical mutations by design. No action required.

**Priority:** High -- Screenplay anti-pattern that must not propagate to DEMOAPP003.

Create a new Task (`SolveFirstSolverForIsolationCheck` or similar) in `tasks/__init__.py` that:
1. Takes deep-copy snapshots of `multiple_solvers[1].grid` and `multiple_solvers[2].grid`.
2. Calls `ability.initialise()` and `ability.solve_puzzle()` on solver 0.
3. Stores the snapshots and the resulting state in a dedicated memory key (or reuse
   `GRID_SNAPSHOT` for the reference snapshots).

Refactor `MultipleSolvers.isolation_verified()` to read those stored snapshots and compare
without calling any Ability methods. Remove the `actor.remember(ALGORITHM_PROGRESS, False)` side
effect from the Question entirely.

Effort estimate: 2--3 hours. No DR required.

---

## P2 -- Resolve BACKLOG-012 as duplicate of BACKLOG-020 (BACKLOG-034)

**Priority:** Medium -- governance hygiene, prevents misleading Open count.

Update `DOCS/.planning/backlog.md`:
- Change BACKLOG-012 status from `Open` to `Resolved`.
- Add resolution note: "Resolved as part of BACKLOG-020 (2026-05-19). DEMOAPP002 is fully
  operational. If a CLI-surface Python Stack is later planned, a new backlog item should be
  created."
- Update the summary counts (Open: 10 -> 9, Resolved: 43 -> 44).

Effort estimate: 10 minutes. No DR required.

---

## P2 -- Implement constraint-setup fixtures for Hidden Singles (Python)

**Priority:** Medium -- closes a silent coverage gap.

Implement `setup_row_column_constraints()` and `setup_column_row_constraints()` in
`grid_fixtures.py` to mirror the TypeScript fixture implementations. Update
`SetupGridState.row_column_constraints()` and `column_row_constraints()` in `tasks/__init__.py`
to call these functions with the supplied parameters instead of ignoring them.

This restores the intended constraint-setup coverage for the Hidden Singles "multiple locations"
scenarios and ensures the Python stack correctly tests the same grid conditions as TypeScript.

Effort estimate: 2--4 hours. No DR required.

---

## P2 -- Register memory key parity checker in GitHub Actions CI

**Priority:** Medium -- closes the residual RA-003 acceptance criterion.

Add a step to `.github/workflows/ci.yml` that runs `.batch/check-memory-key-parity.ps1` and
fails the workflow on non-zero exit. Update the unchecked criterion in the RA-003 backlog entry.
This gate must run after both stacks' steps are present in the workflow, so it should follow the
DEMOAPP002 job.

Effort estimate: 30--60 minutes. No DR required (completion of existing RA-003 work).

---

## P3 -- Add Python stack `docs/` directory

**Priority:** Low -- documentation completeness for DEMOAPP003 authors.

Create `demo-apps/demoapp002-python-pytest/docs/README.md` documenting: Stack entry point,
how to run tests, how to add a new scenario, and any Python-specific notes (virtual environment
setup, pytest-bdd feature path configuration). Mirror the structure of
`demo-apps/demoapp001-typescript-cypress/docs/README.md`.

Effort estimate: 1--2 hours. No DR required.

---

## P3 -- Restructure Python Tasks and Questions into per-class files

**Priority:** Low -- structural parity with TypeScript; improves navigability.

Migrate the eleven Task classes from `tasks/__init__.py` into individual files
(`tasks/initialise_grid.py`, `tasks/apply_algorithm.py`, etc.) and update `tasks/__init__.py` to
re-export all classes. Do the same for the eleven Question classes. This aligns the Python stack's
module structure with the TypeScript reference and makes individual class files directly
addressable in documentation and code review.

This change is purely structural; no logic changes are required. All imports in the step
definitions file remain unchanged as long as `__init__.py` re-exports the classes.

Effort estimate: 2--3 hours. No DR required (structural organisation, not a normative rule
change). If agreed as the canonical Python pattern, update the parity contract document to
specify per-class files as the required structure.

---

## P4 -- Add `[tool.pytest.ini_options]` to pyproject.toml

**Priority:** Low -- minor usability improvement.

Add a `[tool.pytest.ini_options]` section to `demo-apps/demoapp002-python-pytest/pyproject.toml`
with at minimum:

```toml
[tool.pytest.ini_options]
bdd_features_base_dir = "tests/features"
```

This removes the relative `../../features/` path from the `scenarios()` call in the step
definitions and aligns the project with pytest-bdd best practice.

Effort estimate: 15 minutes. No DR required.
