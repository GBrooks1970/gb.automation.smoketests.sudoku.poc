# Implementation Log: BACKLOG-090 / TRIAGE-15 Assess candidate-qualified and fixed-fixture step arguments

**Date:** 2026-11-09T18:00:00Z
**Session goal:** Eliminate parameter-blind and vacuous step bindings in Naked Pairs and X-Wing scenarios across all three Stacks (DEMOAPP001 TS, DEMOAPP002 Python, DEMOAPP003 C#), adopt DR-049 governing candidate observation, validate preconditions and coordinates, and expand mutation controls.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-15 (Claude review v2 Risk 3 recommendations 3-4, MEDIUM priority; Codex review v3 S-06), recorded in project backlog as BACKLOG-090. Under the owner-approved implementation plan and DR-049:
- Expose read-only candidate calculation on `SudokuSolver` and Screenplay Question `GridCell.candidatesAt(row, col)` across all three Stacks.
- In Naked Pairs Givens (`row {row} contains exactly two cells sharing candidate pair "{candidates}"` etc.), actively query the solver's grid state and assert that exactly 2 cells have matching candidate sets.
- In Naked Pairs secondary Givens (`another cell in {unit} has candidates "{candidates}"`), locate the cell matching that candidate set, assert its existence, and record it in `TARGET_CELL` Actor Memory.
- In X-Wing Givens (`rows {r1} and {r2} have candidate {digit} only in columns {c1} and {c2}` etc.), assert that the specified digit appears as a candidate only in the stated coordinates.
- In X-Wing secondary Givens (`another cell at row {row}, column {col} has candidates "{candidates}"`), verify candidate match and record `TARGET_CELL`.
- In Naked Pairs Then steps (`the cell in {unit} with candidates "{candidates}" should be updated to {val}`), assert that `{candidates}` contains `val`, verify that the cell's pre-operation snapshot candidates match `{candidates}`, and assert proper placement.
- Add 3 planted candidate mutation controls to `.batch/test-then-assertion-mutations.ps1` (total 28 mutations per Stack), confirming all are killed.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| DR-049 accepted for candidate observation | Formally defines read-only candidate query contract on `SudokuSolver` and Screenplay `GridCell.candidatesAt` | Yes (DR-049) |
| Expose existing internal candidate methods as public | Leverages existing, tested candidate calculation logic in each solver; returning empty set for filled cells ensures semantic correctness | Under DR-049 |
| Precondition validation failure behavior | Fail fast with explicit assertion error when Gherkin parameters do not match grid state | Under DR-049 |
| Active target cell resolution in secondary Givens | Replaced no-op bindings by searching unit for matching candidates and storing coordinate in `TARGET_CELL` | Under DR-049 |
| Snapshot-backed candidate verification in Then steps | Confirms that pre-operation target cell candidates matched `{candidates}` and contained placement value `val` | Under DR-049 |
| Expand mutation harness to 28 mutations | Added 3 planted candidate mutation controls in `.batch/test-then-assertion-mutations.ps1` (`naked-pair-candidates`, `another-cell-candidates`, `xwing-rows-pattern`) | Under DR-049 |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-09-triage-15-candidate-arguments.md` | Approved implementation plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-09_triage-15-candidate-arguments.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `decision-register.md` | Recorded DR-049; updated currency header to DR-001 through DR-049 |
| `CLAUDE.md` | Updated accepted DR range to DR-001 through DR-049 |
| `.batch/test-then-assertion-mutations.ps1` | Added 3 candidate mutation controls (total 28 per Stack) |
| `demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts` | Promoted `getCellCandidates` to public, returning empty Set on filled cells |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/questions/GridCell.ts` | Added `candidatesAt(row, col)` Question |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/support/grid-assertions.ts` | Added `parseCandidates` and `setsEqual` helpers |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/nakedPairs.steps.ts` | Validated candidate parameters in Givens and Thens |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/xWing.steps.ts` | Validated coordinates and candidates in X-Wing Givens |
| `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` | Promoted `get_cell_candidates` to public, returning empty set on filled cells |
| `demo-apps/demoapp002-python-pytest/tests/screenplay/questions/__init__.py` | Added `candidates_at(row, col)` Question |
| `demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py` | Validated candidate parameters in Givens and Thens across Naked Pairs and X-Wing |
| `demo-apps/demoapp003-csharp-specflow/app_src/SudokuSolver.cs` | Promoted `GetCellCandidates` to public, returning empty HashSet on filled cells |
| `demo-apps/demoapp003-csharp-specflow/tests/screenplay/questions/Questions.cs` | Added `CandidatesAt(row, col)` Question |
| `demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs` | Validated candidate parameters in Givens and Thens across Naked Pairs and X-Wing |
| `DOCS/.planning/backlog.md` | BACKLOG-090 marked Resolved (counts: 11 Open / 0 In Progress / 113 Resolved / 124 Total) |
| `DOCS/.implementation-plans/_index.md` | Recorded BACKLOG-090 delivery |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

---

## 4. Bugs and Errors Encountered

### Candidate calculation on filled cells
- **Symptom:** Without checking `grid[row][col] != EMPTY_CELL`, `getCellCandidates` returned remaining candidates even for cells already containing digits, causing X-Wing candidate queries to find candidate 7 in every non-7 cell in the row/col.
- **Root cause:** Sudoku candidate definitions apply only to empty cells. When a cell is filled with a digit, its candidate set is empty.
- **Fix:** Added guard `if (grid[row][col] != EMPTY_CELL) return empty_set()` at the start of `getCellCandidates` in TS, Python, and C#.

### Python Screenplay method invocation mismatch
- **Symptom:** `AttributeError: 'Actor' object has no attribute 'ask'` in Python step definitions.
- **Root cause:** In DEMOAPP002 Python, the method is `actor.answer(question)` rather than `actor.ask(question)`.
- **Fix:** Replaced `actor.ask(` with `actor.answer(`.

---

## 5. Lessons Learned

- In Sudoku solver domain logic, cell candidates must always evaluate to empty for filled cells; this prevents candidate-level pattern matchers from conflating filled cells with candidate availability.
- Aligning Screenplay question naming across language Stacks is greatly aided by having uniform method semantics (`actor.answer(...)`).
