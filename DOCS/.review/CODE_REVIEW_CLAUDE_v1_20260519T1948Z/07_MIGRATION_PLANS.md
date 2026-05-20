# Migration Plans

The three highest-priority improvements identified in this review. Each plan specifies steps,
effort, and risk.

---

## Plan A -- Restore Screenplay Memory Contract in Python Questions (BACKLOG-032 and BACKLOG-033)

**Scope:** `demo-apps/demoapp002-python-pytest/tests/screenplay/questions/__init__.py`
and `tasks/__init__.py`
**Priority:** High
**Effort:** 4--6 hours
**Risk:** Low (no Gherkin or Ability changes required; all 46 scenarios must remain passing)

### Background

Four `GridCell` Question methods read `ability.grid_snapshot` directly instead of reading the
`GRID_SNAPSHOT` memory key from Actor notes. `MultipleSolvers.isolation_verified()` calls
`ability.solve_puzzle()` inside a Question resolver, violating the Screenplay rule that Questions
must be side-effect free.

### Steps

1. **Verify snapshot write path.** Confirm that all Tasks that set `ability.store_snapshot()`
   also call `actor.remember(GRID_SNAPSHOT, snapshot)`. Check `InitialiseGrid.from_puzzle_named`,
   `SetupGridState.almost_complete_column`, `almost_complete_block`, `hidden_single_in_block`,
   `digit_in_row`, `from_specific_grid`, and `SetupGridState.three_candidates` /
   `three_naked_singles`. Several already call `actor.remember(GRID_SNAPSHOT, ...)` (e.g.,
   `from_puzzle_named` at line 53 of `tasks/__init__.py`); others call only
   `ability.take_snapshot()` without writing to actor memory. Those must also call
   `actor.remember(GRID_SNAPSHOT, deepcopy(snapshot))` after `take_snapshot()`.

2. **Update `GridCell.matches_snapshot()`, `orig_matches_snapshot()`, `is_deep_copy()`** to read
   from `actor.recall(GRID_SNAPSHOT, [])` instead of `ability.grid_snapshot`. Run all 46
   scenarios and confirm passing after each change.

3. **Extract the solver mutation from `MultipleSolvers.isolation_verified()`** into a new Task,
   `SolveFirstSolverForIsolationCheck`. The Task should:
   - Capture `deepcopy(solvers[1].grid)` and `deepcopy(solvers[2].grid)` into a new memory key
     (e.g., `ISOLATION_SNAPSHOTS` -- add this to `memory_keys.py` and note it is a local
     Python-stack key, not a cross-stack parity key).
   - Call `ability.initialise()` and `ability.solve_puzzle()`.
   - Write the reference snapshots to actor memory.
   Refactor `MultipleSolvers.isolation_verified()` to read the stored snapshots from memory and
   compare -- no Ability calls inside the resolver.

4. **Remove `actor.remember(ALGORITHM_PROGRESS, False)`** from the original Question. The Task
   handles state transitions; the Question only observes.

5. Run all 46 scenarios. Confirm green. Confirm memory key parity checker still passes.

### Risk

All changes are internal to the Python questions/tasks modules. No Gherkin, no Ability
signatures, no TypeScript files are touched. The only failure mode is if a Task that calls
`take_snapshot()` does not also write `GRID_SNAPSHOT` to actor memory -- step 1 of this plan
detects and corrects that.

---

## Plan B -- Implement Constraint Setup Fixtures for Hidden Singles (no new backlog item required)

**Scope:** `demo-apps/demoapp002-python-pytest/tests/screenplay/fixtures/grid_fixtures.py`
and `tasks/__init__.py`
**Priority:** Medium
**Effort:** 2--4 hours
**Risk:** Very low (no Gherkin changes; no Actor memory changes)

### Background

`SetupGridState.row_column_constraints()` and `column_row_constraints()` are no-ops. The
TypeScript equivalents call `GridFixtures.setupRowColumnConstraints()` and
`GridFixtures.setupColumnRowConstraints()` to fill the specified number of cells with values
that block the target digit from those positions. The Python scenarios still pass because the
Hidden Singles algorithm finds the valid placement without the blocking values being set, but the
test is not exercising the full constraint scenario.

### Steps

1. Review the TypeScript `GridFixtures.setupRowColumnConstraints(solver, count, rowIndex, target)`
   implementation in `demo-apps/demoapp001-typescript-cypress/tests/screenplay/fixtures/
   GridFixtures.ts`. Understand the logic: fill `count` empty cells in the target row with
   non-`target` digits that block `target` via row-or-block overlap.

2. Implement `setup_row_column_constraints(solver, count, row_index, target)` in
   `grid_fixtures.py` using the same logic in Python.

3. Implement `setup_column_row_constraints(solver, count, col_index, target)` by analogy.

4. Update `SetupGridState.row_column_constraints()` and `column_row_constraints()` in
   `tasks/__init__.py` to call the new fixture functions with the supplied parameters. Remove the
   `_` prefix from the parameter names.

5. Run all 46 scenarios and confirm they remain passing.

### Risk

The Hidden Singles scenarios currently pass without the constraint setup. If the fixture
implementation is incorrect, it could cause previously-passing scenarios to fail by filling cells
in a way that prevents the Hidden Singles algorithm from finding the target placement. Mitigation:
run scenarios after each fixture implementation and compare grid states against TypeScript to
confirm identical setup.

---

## Plan C -- Onboard DEMOAPP003 C# Stack (BACKLOG-021)

**Scope:** `demo-apps/demoapp003-csharp-specflow/` (new directory)
**Priority:** Planned (Sprint 5, 2026-06-25 to 2026-07-08)
**Effort:** 5--10 days
**Risk:** Medium (new language, new framework, first multi-stack parity verification)

### Background

DR-004 specifies the sequential Stack migration strategy: TypeScript -> Python -> C#. DEMOAPP002
is now operational. DEMOAPP003 may be authored once Plan A and Plan B above are complete, to
ensure the C# author uses a structurally correct Python reference.

### Prerequisites

Before beginning DEMOAPP003:
- [ ] BACKLOG-032 resolved (Python Questions memory contract)
- [ ] BACKLOG-033 resolved (impure Question refactor)
- [ ] Memory key parity CI gate registered (RA-003 residual)
- [ ] RA v1.13 Appendix B Stack Onboarding Checklist reviewed and any C#-specific items noted

### Steps

1. Create `demo-apps/demoapp003-csharp-specflow/` following the RA v1.13 Section 4 directory
   blueprint and DR-016 kebab-case naming.

2. Implement the C# subject application: `SudokuSolver.cs`, `SudokuOrchestrator.cs`,
   `PuzzleLoader.cs`, `SudokuCLI.cs`, `Constants.cs`. Verify algorithmic parity against
   TypeScript by running equivalent assertions.

3. Define `IAbility`, `ITask`, `IQuestion<T>` interfaces in C# and implement the `Actor` class
   following the Python `Actor` class as a reference. Use `TryGetAbility<T>()` for type-safe
   ability retrieval.

4. Implement `UseSudokuSolver` and `LoadPuzzles` Abilities following the parity contract.

5. Implement all eleven Task classes and eleven Question classes in separate `.cs` files (one
   per class, matching the TypeScript per-file pattern).

6. Copy the canonical feature file to `tests/features/BasicSudokuSolverLogic.feature` and add
   the `@stack-demoapp003` tag. Run SpecFlow binding discovery and confirm all 46 step bindings
   resolve.

7. Implement step definitions following the thin-layer pattern. All steps must use
   `actor.AttemptsTo()` and `actor.Answer()`.

8. Run all 46 scenarios with `dotnet test`. Confirm 46/46 passing.

9. Run memory key parity checker, feature parity checker, and step-text parity checker.
   Confirm all three pass.

10. Update `CLAUDE.md` and `decision-register.md` with DEMOAPP003 additions. Add
    implementation log entry.

### Risk

SpecFlow's step binding model uses attribute-based discovery (not file-based registration like
pytest-bdd). Parameterised step text with `{int}`, `{string}`, and multi-word capture groups
must be validated against SpecFlow's regex patterns. The canonical feature file uses Cucumber
expression syntax (`{int}`, `{string}`) which SpecFlow supports. Verify that all 46 step texts
bind correctly before implementing Screenplay components.
