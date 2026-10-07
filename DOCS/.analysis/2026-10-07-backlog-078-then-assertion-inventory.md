# BACKLOG-078 Then assertion inventory

**Date:** 2026-10-07
**Scope:** all digit, row, column, block and count-bearing Then bindings in the canonical
`BasicSudokuSolverLogic.feature`, inspected across DEMOAPP001, DEMOAPP002 and DEMOAPP003.
**Before-change source:** main `aeea19a53421867e82d1d3e9f18218b618fa66e3`.
**Authority:** BACKLOG-078 and the [approved plan](../.implementation-plans/2026-10-07-backlog-078-exact-assertions.md).

## Affected bindings

Sixteen parameterised patterns have the dispositions below: 48 implementations across three
Stacks. The shared explicit-cell binding also serves both X-Wing scenarios. The number of
patterns does not count aliases or each scenario invocation as another binding.

| Then pattern | Before change | Required observation |
|---|---|---|
| `the system should identify the missing value as {int}` | Algorithm progress; Python/C# additionally require a positive expectation | The intended initially empty row cell now contains the stated digit. |
| `the value {int} should be placed in the empty cell` | Digit exists anywhere | The same Given-owned target transitions from zero to the stated digit. |
| `the system should place {int} in the empty cell of column {int}` | Digit exists in the stated column | Target belongs to that column and has the stated transition. |
| `the system should place {int} in the empty cell of that block` | Digit exists anywhere | The block fixture's intended empty cell has the stated transition. |
| `the system should place {int} in the only valid cell in row {int}` | Digit exists in the stated row | Given-owned target belongs to the stated row and has the stated transition. |
| `the system should place {int} in the only valid cell in column {int}` | Digit exists in the stated column | Given-owned target belongs to the stated column and has the stated transition. |
| `the system should place {int} in the one remaining valid cell of that block` | Digit exists anywhere | The Hidden Single fixture's intended empty cell has the stated transition. |
| `the algorithm should skip row {int}` | Progress is false; row identity ignored | Stated row equals the prepared row, its cells are unchanged, and progress is false. |
| `no cells in row {int} should be modified` | Whole-grid snapshot comparison; row identity ignored | Stated row equals the prepared row and its cells match the snapshot. |
| `the system should determine the only possible value is {int}` | Progress and final target value | Add proof that the fixture target was originally empty. |
| `the cell at row {int}, column {int} should be updated to {int}` | Final value at the stated cell only | Stated coordinates equal the prepared target; its previous value was zero. |
| `all {int} cells should be filled with their respective values` | Three fixed final values; TypeScript ignores count | Consume count, prove exactly three initial empties, and verify the fixture's three transitions to 5, 5 and 9. |
| `the cell in row {int} with candidates {string} should be updated to {int}` | Final value at `(row, 2)` | Stated row equals the prepared Pair target; prove its transition. |
| `the cell in column {int} with candidates {string} should be updated to {int}` | Final value at `(2, column)` | Stated column equals the prepared Pair target; prove its transition. |
| `the cell in block ({int}, {int}) with candidates {string} should be updated to {int}` | Final value at `(0, 2)`; block coordinates ignored | Prepared Pair target belongs to both stated block coordinates and has the stated transition. |
| `all {int} cells should contain valid digits` | Non-zero cells; TypeScript ignores count | Consume the 81-cell count and query the existing valid-solution check. |

## Stack binding locations

- DEMOAPP001: `tests/screenplay/step_definitions/unitCompletion.steps.ts`,
  `hiddenSingles.steps.ts`, `nakedSingles.steps.ts`, `nakedPairs.steps.ts` and
  `orchestration.steps.ts`; local assertion helpers are in `support/grid-assertions.ts`.
- DEMOAPP002: `tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py`, using
  `system_identifies_missing_value`, `value_placed_in_empty_cell/column/block`,
  `value_in_only_row_cell/column_cell/remaining_block_cell`, `algorithm_skips_row`,
  `no_cells_in_row_modified`, `determines_only_possible_value`, `cell_updated`,
  `all_three_cells_filled`, `cell_in_row_updated_to/column_updated_to/block_updated_to`
  and `all_cells_valid`.
- DEMOAPP003: `tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs`, using
  `SystemIdentifiesMissingValue`, `ValuePlacedInEmptyCell/Column/Block`,
  `ValueInOnlyRowCell/ColumnCell/RemainingBlockCell`, `AlgorithmSkipsRow`,
  `NoCellsInRowModified`, `DeterminesOnlyPossibleValue`, `CellUpdated`,
  `AllThreeCellsFilled`, `CellInRowUpdatedTo/ColumnUpdatedTo/BlockUpdatedTo` and `AllCellsValid`.

Paths above are relative to each Stack directory. Setup observations are prepared by its
`InitialiseGrid` and `SetupGridState` Tasks, before the algorithm runs. Deep snapshots and
fixture-owned targets use the existing `GRID_SNAPSHOT` and `TARGET_CELL` keys. Assertion helpers
query `GridSnapshot`, `TargetCell` and `GridCell`; they do not call Abilities from step definitions.
Question signatures, Memory shapes and production solver/API code are unchanged.

## Other inspected parameterised Then bindings

Algorithm names/digit ranges, orchestration order, statuses, validation result, loaded-puzzle
count, error messages and puzzle index/difficulty expectations already consume their relevant
arguments through the existing Questions and assertions. They are outside this placement repair.
The contextual `the move should be validated against row, column, and block constraints` step
has no bound digit/position argument and is followed by the exact `VALID`/`INVALID` result check.

Naked Pair candidate-string qualifiers and related Given parameters remain existing fixed-fixture
descriptions; this repair does not assert candidate observations or widen their APIs. This is an
explicit boundary, not evidence that changing those qualifiers would fail. Such work needs its
own selection and contract assessment.

## Native acceptance controls

`.batch/test-then-assertion-mutations.ps1` executes positive selected scenarios, then 22 planted
wrong expectations per Stack: missing/generic/column/block digits, row/column identity,
negative-row identity, explicit cell/X-Wing coordinates, Pair row/column/both block coordinates,
and the three-/81-cell counts. Each mutation must execute one scenario and fail its assertion;
runner errors, missing results and zero tests fail the control. Canonical and selected Stack
feature bytes are restored in `finally` and verified by SHA-256. Results stay separate from
normal suite artefacts, and CI runs these controls before the full suite emits parity evidence.

Each native runner passed all 15 selected positive scenarios and rejected every one of the
22 planted wrong expectations: 45 positives / 66 killed total. All feature hashes restored.
The plan Outcome and authoritative backlog retain exact durations and the existing suite,
coverage, audit and parity results.

The held candidate-qualifier boundary was also probed separately in Python: changing only
the Pair Then candidates from `2, 7, 4` to `1, 7, 4` passed one selected scenario (exit 0,
0 failures/errors, command 2762 ms); canonical and Stack bytes restored. TypeScript/C# candidate
survival was not run in this probe. Root TRIAGE-15 records further assessment without expanding
BACKLOG-078's approved repair.
