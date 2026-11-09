---
version: 1
created: 2026-11-09T17:05:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-090 / TRIAGE-15
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-090 / TRIAGE-15 Assess candidate-qualified and fixed-fixture step arguments

**Goal.** Eliminate parameter-blind and vacuous step definition bindings in advanced solving strategy scenarios (Naked Pairs and X-Wing) across all three Stacks (DEMOAPP001 TypeScript, DEMOAPP002 Python, DEMOAPP003 C#). Adopt a formal Decision Record (DR-049) governing read-only candidate observation APIs and Actor Memory shapes. Require that all coordinate, digit, and candidate-set arguments in Given and Then steps are faithfully validated against the active grid state rather than discarded. Expand `.batch/test-then-assertion-mutations.ps1` with planted candidate mutation controls to prove that modified parameters fail reliably.

Source: Claude review v2 (`DOCS/.review/CODE_REVIEW_Claude_v2_20261105T1425Z/`) Risk 3 recommendations 3-4 (MEDIUM priority) and Codex review v3 (`DOCS/.review/CODE_REVIEW_CODEX_v3_20261105T0858Z/`) S-06, triaged as root worklist item **TRIAGE-15** and recorded in the project backlog as **BACKLOG-090**.

---

## Evidence gathered before planning

Audited on 2026-11-09 on branch `worklist/triage-15-candidate-arguments` cut from `main` @ `10dbd58`:

### 1. Inventory of Ignored Parameters across Stacks

The following 13 step definition locations across each Stack (39 total bindings) accept Gherkin parameters and currently discard them:

| Scenario | Step Text | Current TS Implementation | Current Python Implementation | Current C# Implementation | Impact |
|---|---|---|---|---|---|
| Naked Pair in row | `Given row {row:d} contains exactly two cells sharing candidate pair "{candidates}"` | `nakedPairs.steps.ts:13` (`_row`, `_candidates` unused) | `test_basic_sudoku_solver_logic.py:892` (`row`, `candidates` unused) | `BasicSudokuSolverLogicSteps.cs:777` (`row`, `candidates` unused) | Changing row or candidate pair in Gherkin passes silently |
| Naked Pair in row | `And another cell in row {row:d} has candidates "{candidates}"` | `nakedPairs.steps.ts:20` (comment only) | `test_basic_sudoku_solver_logic.py:897` (`pass`) | `BasicSudokuSolverLogicSteps.cs:781` (empty body) | No assertion that another cell has specified candidates |
| Naked Pair in row | `Then the cell in row {row:d} with candidates "{candidates}" should be updated to {val:d}` | `nakedPairs.steps.ts:48` (`_candidates` unused) | `test_basic_sudoku_solver_logic.py:947` (`candidates` unused) | `BasicSudokuSolverLogicSteps.cs:825` (`candidates` unused) | Does not verify the placed cell had those candidates |
| Naked Pair in column | `Given column {col:d} contains exactly two cells sharing candidate pair "{candidates}"` | `nakedPairs.steps.ts:27` (`_col`, `_candidates` unused) | `test_basic_sudoku_solver_logic.py:902` (`col`, `candidates` unused) | `BasicSudokuSolverLogicSteps.cs:786` (`col`, `candidates` unused) | Changing col or candidate pair passes silently |
| Naked Pair in column | `And another cell in column {col:d} has candidates "{candidates}"` | `nakedPairs.steps.ts:34` (comment only) | `test_basic_sudoku_solver_logic.py:907` (`pass`) | `BasicSudokuSolverLogicSteps.cs:790` (empty body) | No assertion on column cell candidates |
| Naked Pair in column | `Then the cell in column {col:d} with candidates "{candidates}" should be updated to {val:d}` | `nakedPairs.steps.ts:56` (`_candidates` unused) | `test_basic_sudoku_solver_logic.py:952` (`candidates` unused) | `BasicSudokuSolverLogicSteps.cs:829` (`candidates` unused) | Does not verify the placed cell had those candidates |
| Naked Pair in block | `Given a 3x3 block at position ({br:d}, {bc:d}) contains exactly two cells sharing candidate pair "{candidates}"` | `nakedPairs.steps.ts:41` (`_br`, `_bc`, `_candidates` unused) | `test_basic_sudoku_solver_logic.py:912` (`br`, `bc`, `candidates` unused) | `BasicSudokuSolverLogicSteps.cs:795` (`br`, `bc`, `candidates` unused) | Changing block coords or candidates passes silently |
| Naked Pair in block | `And another cell in that block has candidates "{candidates}"` | `nakedPairs.steps.ts:49` (comment only) | `test_basic_sudoku_solver_logic.py:917` (`pass`) | `BasicSudokuSolverLogicSteps.cs:799` (empty body) | No assertion on block cell candidates |
| Naked Pair in block | `Then the cell in block ({br:d}, {bc:d}) with candidates "{candidates}" should be updated to {val:d}` | `nakedPairs.steps.ts:64` (`_candidates` unused) | `test_basic_sudoku_solver_logic.py:950` (`candidates` unused) | `BasicSudokuSolverLogicSteps.cs:827` (`candidates` unused) | Does not verify the placed cell had those candidates |
| X-Wing in rows | `Given rows {r1:d} and {r2:d} have candidate {digit:d} only in columns {c1:d} and {c2:d}` | `xWing.steps.ts:10` (`_r1, _r2, _digit, _c1, _c2` unused) | `test_basic_sudoku_solver_logic.py:927` (`r1, r2, digit, c1, c2` unused) | `BasicSudokuSolverLogicSteps.cs:808` (`r1, r2, digit, c1, c2` unused) | All 5 pattern parameters ignored |
| X-Wing in rows | `And another cell at row {row:d}, column {col:d} has candidates "{candidates}"` | `xWing.steps.ts:25` (comment only) | `test_basic_sudoku_solver_logic.py:937` (`pass`) | `BasicSudokuSolverLogicSteps.cs:816` (empty body) | Cell coords and candidate string ignored |
| X-Wing in columns | `Given columns {c1:d} and {c2:d} have candidate {digit:d} only in rows {r1:d} and {r2:d}` | `xWing.steps.ts:18` (`_c1, _c2, _digit, _r1, _r2` unused) | `test_basic_sudoku_solver_logic.py:932` (`c1, c2, digit, r1, r2` unused) | `BasicSudokuSolverLogicSteps.cs:812` (`c1, c2, digit, r1, r2` unused) | All 5 pattern parameters ignored |
| X-Wing in columns | `And another cell at row {row:d}, column {col:d} has candidates "{candidates}"` | `xWing.steps.ts:25` (comment only) | `test_basic_sudoku_solver_logic.py:937` (`pass`) | `BasicSudokuSolverLogicSteps.cs:816` (empty body) | Cell coords and candidate string ignored |

### 2. Empirical Must-Fail Baselines (Captured on 2026-11-09)

To verify the vulnerability, must-fail probes were executed against unpatched code in an isolated scratch environment:
- **Probe 1 (Naked Pair candidate mutation):** In `Scenario: Identify a Naked Pair in a row and eliminate candidates to place a single`, changed `candidate pair "2, 7"` to `candidate pair "3, 8"`.
  - Result: `1 passed, 54 deselected (0.32s)`. The suite passed with returncode 0 despite the corrupted precondition!
- **Probe 2 (X-Wing row/col/digit mutation):** In `Scenario: Detect X-Wing in rows and eliminate candidate from columns to place a single`, changed `rows 1 and 4 have candidate 7 only in columns 1 and 5` to `rows 2 and 5 have candidate 8 only in columns 2 and 6`.
  - Result: `1 passed, 54 deselected (0.41s)`. The suite passed with returncode 0 despite all 5 pattern parameters being wrong!

Both probes empirically confirm the finding in Claude review v2 Risk 3 recs 3-4 and Codex review v3 S-06.

---

## Decision Record: DR-049

### DR-049 — Candidate Observation APIs and Precondition Validation for Advanced Strategy Scenarios

**Date:** 2026-11-09  
**Status:** Proposed (pending owner approval)  
**Context:**  
The canonical feature `BasicSudokuSolverLogic.feature` contains scenarios for Naked Pairs and X-Wing that specify candidate sets and unit coordinates in step text. Currently, the test glue in all three Stacks constructs hardcoded fixtures (`SetupGridState.nakedPairRow()`, etc.) and completely ignores the advertised parameters, with secondary Givens left as empty no-ops (`pass`). Mutating the Gherkin text survives undetected.

**Decision:**
1. **Expose Read-Only Candidate Calculation on `SudokuSolver`:**
   Each Stack's solver already contains a private helper `getCellCandidates(row, col)`. Promote this method to `public`:
   - TypeScript: `public getCellCandidates(row: number, col: number): Set<number>`
   - Python: `def get_cell_candidates(self, row: int, col: int) -> set[int]:`
   - C#: `public HashSet<int> GetCellCandidates(int row, int col)`
2. **Expose Screenplay Candidate Question:**
   Expose candidate inspection via Screenplay questions without altering solver mutation boundaries:
   - `GridCell.candidatesAt(row: number, col: number)` returning the Set/HashSet of integer candidates.
3. **Faithful Precondition Validation in Given Steps:**
   - Every Given step accepting coordinates, digits, or candidate strings MUST assert that the configured grid actually satisfies those claims.
   - For `Given row {row} contains exactly two cells sharing candidate pair "{candidates}"`: Parse the CSV string into integer set; verify that `row` has exactly two empty cells whose candidates equal that pair.
   - For `And another cell in {unit} has candidates "{candidates}"`: Verify that the unit contains an empty cell whose candidates match the expected set, and remember that cell in Actor Memory (`TARGET_CELL`).
   - For X-Wing: Verify that the two rows/cols have candidate `digit` only in the specified two columns/rows.
4. **Then Step Candidate Association:**
   - In `Then the cell in {unit} with candidates "{candidates}" should be updated to {val}`, verify that the cell identified by `TARGET_CELL` has been updated to `val`, and that the pre-solve snapshot candidates for that cell matched `{candidates}`.
5. **Zero Feature File Rewording:**
   The canonical `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` remains the single source of truth and is not modified. All 55 scenarios and 309 steps remain byte-for-byte identical across all three Stacks.
6. **Mutation Harness Integration:**
   Add planted candidate mutations to `.batch/test-then-assertion-mutations.ps1` to continuously prove these bindings cannot be bypassed.

---

## Decisions for Owner Review

### Decision 1: Candidate calculation exposure mechanism
- **Recommended (Option A):** Expose existing private `getCellCandidates(row, col)` as public on `SudokuSolver` in all three Stacks.
  - *Rationale:* The logic already exists, is thoroughly tested by algorithm operations, is pure and side-effect-free, and avoids duplicating candidate calculation logic in test glue.
- **Alternative (Option B):** Duplicate the candidate calculation logic purely inside the test glue / Screenplay question.
  - *Rejected:* Duplicating candidate calculation across 3 test glue languages introduces maintenance drift and contradicts portfolio pair programming standards.

### Decision 2: Decision Record ID (DR-049 vs DR-050)
- **Recommended (Option A):** Use **DR-049**.
  - *Rationale:* In `decision-register.md`, line 13 explicitly states: `*Last entry: DR-048 (Accepted). Next ID: DR-049.*`. `check-ra-header-currency.ps1` checks for continuous sequential numbering `DR-001 through DR-$latestAcceptedId`. Skipping DR-049 to use DR-050 would break the continuous sequence or require an artificial placeholder.
- **Alternative (Option B):** Use DR-050 and create an empty/reserved DR-049.
  - *Rejected:* Unnecessary indirection when DR-049 is completely free.

### Decision 3: Precondition validation failure behavior
- **Recommended (Option A):** Fail fast with an `AssertionError` in the Given step if the grid state does not match the Gherkin step parameters (e.g. `AssertionError: Expected exactly 2 cells with candidate pair {2, 7} in row 0, found 0`).
  - *Rationale:* Makes living documentation failures immediate, readable, and unmistakable.
- **Alternative (Option B):** Dynamically mutate the fixture to match whatever Gherkin parameters are passed.
  - *Rejected:* Arbitrary Sudoku candidate-structure generation is far beyond smoke-test POC scope; the Gherkin scenarios are fixed canonical examples.

### Decision 4: Handling the "another cell has candidates" Givens
- **Recommended (Option A):** In `And another cell in {unit} has candidates "{candidates}"`, locate the cell in that unit having that candidate set, assert its presence, and remember its coordinate in Actor Memory (`TARGET_CELL`).
  - *Rationale:* Transforms what was previously an empty `pass` step into an active, verifying precondition step that securely connects Given to Then.
- **Alternative (Option B):** Retain comment-only / no-op for the secondary Givens.
  - *Rejected:* Leaves Risk 3 rec 3 unresolved.

### Decision 5: Then step candidate validation
- **Recommended (Option A):** In `Then the cell in ... with candidates "{candidates}" should be updated to {val}`, verify that the cell (retrieved from `TARGET_CELL` or by candidate match) was updated to `val`, and assert that prior to the algorithm run its candidates included `val` and matched `{candidates}`.
  - *Rationale:* Disposes the discarded `_candidates` parameter in Then steps, fulfilling the second half of Risk 3.
- **Alternative (Option B):** Check only the final placed value `val` and continue ignoring `candidates` in Then steps.
  - *Rejected:* Leaves parameter-blind Then steps in place.

### Decision 6: New mutation controls in `.batch/test-then-assertion-mutations.ps1`
- **Recommended (Option A):** Add 3 new planted candidate mutations to `.batch/test-then-assertion-mutations.ps1`:
  1. `naked-pair-candidates`: in `Identify a Naked Pair in a row...`, mutate `candidate pair "2, 7"` to `"3, 8"`.
  2. `another-cell-candidates`: in `Identify a Naked Pair in a row...`, mutate `candidates "2, 7, 4"` to `"2, 7, 5"`.
  3. `xwing-rows-pattern`: in `Detect X-Wing in rows...`, mutate `rows 1 and 4` to `rows 2 and 5`.
  - *Rationale:* Empirically proves all candidate-bearing Givens are bound and that errors are killed across all three Stacks.
- **Alternative (Option B):** Do not add mutation controls for Givens.
  - *Rejected:* Violates Risk 3 rec 4 and Codex S-06 recommendation.

---

## Steps

All work will take place on branch `worklist/triage-15-candidate-arguments` cut from `main` @ `10dbd58`.

1. **Backlog Status:** Mark BACKLOG-090 as `In Progress` in `DOCS/.planning/backlog.md` (Summary: 11 Open / 1 In Progress / 112 Resolved / 124 Total).
2. **Decision Record:** Add DR-049 to `decision-register.md` and update `CLAUDE.md` and `DOCS/.planning/backlog.md` accepted DR ranges to DR-001 through DR-049.
3. **Implementation Plan Approval:** Update plan status to `approved` and register in `DOCS/.implementation-plans/_index.md`.
4. **Solver & Screenplay Enhancements:**
   - DEMOAPP001 (TS): Expose `getCellCandidates` on `SudokuSolver`; add `candidatesAt` to `GridCell`.
   - DEMOAPP002 (Python): Expose `get_cell_candidates` on `SudokuSolver`; add `candidates_at` to `GridCell`.
   - DEMOAPP003 (C#): Expose `GetCellCandidates` on `SudokuSolver`; add `CandidatesAt` to `GridCell`.
5. **Step Definition Updates:**
   - DEMOAPP001: Update `nakedPairs.steps.ts` and `xWing.steps.ts` to validate parameters.
   - DEMOAPP002: Update `test_basic_sudoku_solver_logic.py` Naked Pairs and X-Wing Givens and Thens.
   - DEMOAPP003: Update `BasicSudokuSolverLogicSteps.cs` Naked Pairs and X-Wing Givens and Thens.
6. **Mutation Controls Expansion:**
   - Add 3 candidate mutations to `.batch/test-then-assertion-mutations.ps1` (bringing suite to 28 mutations per Stack).
   - Verify all 28 mutations are killed on DEMOAPP001, DEMOAPP002, and DEMOAPP003.
7. **Local Verification:**
   - 113 component + 55 BDD scenarios in TS (DEMOAPP001).
   - 30 unit + 55 BDD scenarios in Python (DEMOAPP002).
   - 55 BDD scenarios in C# (DEMOAPP003).
   - All 7 parity checks (`.batch/run-parity-checks.ps1`).
8. **PR & Merge:**
   - Push branch and open project PR.
   - Merge on all-green CI.

---

## Verification

- **Empirical Tests:** 55 scenarios / 309 steps pass across DEMOAPP001, DEMOAPP002, and DEMOAPP003.
- **Parity Gate:** All 7 parity checks in `.batch/run-parity-checks.ps1` PASS.
- **Mutation Controls:** `.batch/test-then-assertion-mutations.ps1` reports 100% killed mutations (28 killed per Stack).
- **CI Fan-in:** PR and main runs pass all required jobs.
