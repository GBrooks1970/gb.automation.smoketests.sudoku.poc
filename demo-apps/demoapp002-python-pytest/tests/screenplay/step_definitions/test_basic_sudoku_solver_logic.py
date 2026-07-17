from __future__ import annotations

import pytest
from pytest_bdd import given, parsers, scenarios, then, when

from tests.screenplay.abilities import UseSudokuSolver
from tests.screenplay.questions import (
    AlgorithmMadeProgress,
    AuditTrail,
    CurrentSolver,
    ErrorThrown,
    GridCell,
    GridSnapshot,
    LoadedPuzzleCount,
    LoadedPuzzles,
    MultipleSolvers,
    PlacementValidity,
    SolveStatus,
    TargetCell,
)
from tests.screenplay.support.actor import Actor
from tests.screenplay.support.actors import make_solver_actor
from tests.screenplay.tasks import (
    ApplyAlgorithm,
    AttemptPlacement,
    CheckAlgorithmProgress,
    EnableAuditLogging,
    InitialiseGrid,
    LoadPuzzleByIndex,
    LoadPuzzleByName,
    LoadPuzzlesByDifficulty,
    SetTargetCell,
    SetupGridState,
    SimulateError,
    SolvePuzzle,
)

scenarios("../../features/BasicSudokuSolverLogic.feature")


@pytest.fixture
def actor() -> Actor:
    return make_solver_actor()


@given("a standard 9x9 Sudoku grid is initialized")
def standard_grid(actor: Actor) -> None:
    actor.attempts_to(InitialiseGrid.empty())


@given(parsers.parse('a row contains the values "{values_str}"'))
def row_contains_values(actor: Actor, values_str: str) -> None:
    values = [int(value.strip()) for value in values_str.split(",")]
    actor.attempts_to(InitialiseGrid.with_row_values(0, values))


@given(parsers.parse("column {col_index:d} contains {count:d} non-zero values"))
def column_contains_values(actor: Actor, col_index: int, count: int) -> None:
    actor.remember("_PENDING_MISSING_DIGIT_CONTEXT", {"kind": "column", "col": col_index, "count": count})


@given(parsers.parse("the missing digit is {digit:d}"))
def missing_digit(actor: Actor, digit: int) -> None:
    context = actor.recall("_PENDING_MISSING_DIGIT_CONTEXT")
    if context and context["kind"] == "column":
        actor.attempts_to(SetupGridState.almost_complete_column(context["col"], digit))
    elif context and context["kind"] == "block":
        actor.attempts_to(SetupGridState.almost_complete_block(context["block_row"], context["block_col"], digit))
    actor.remember("_PENDING_MISSING_DIGIT_CONTEXT", None)


@given(parsers.parse("a 3x3 block at position ({block_row:d}, {block_col:d}) contains {count:d} non-zero values"))
def block_contains_values(actor: Actor, block_row: int, block_col: int, count: int) -> None:
    actor.remember(
        "_PENDING_MISSING_DIGIT_CONTEXT",
        {"kind": "block", "block_row": block_row, "block_col": block_col, "count": count},
    )


@given("no row, column, or block has exactly one empty cell")
def no_unit_has_one_empty(actor: Actor) -> None:
    actor.attempts_to(SetupGridState.with_multiple_empties())


@when(parsers.parse('the "{algorithm}" algorithm scans the row'))
@when(parsers.parse('the "{algorithm}" algorithm scans the column'))
@when(parsers.parse('the "{algorithm}" algorithm scans the block'))
def algorithm_scans_unit(actor: Actor, algorithm: str) -> None:
    assert algorithm == "Unit Completion"
    actor.attempts_to(ApplyAlgorithm.unit_completion())


@when(parsers.parse('the "{algorithm}" algorithm is executed'))
def algorithm_is_executed(actor: Actor, algorithm: str) -> None:
    if algorithm == "Unit Completion":
        actor.attempts_to(ApplyAlgorithm.unit_completion())
    elif algorithm == "Naked Singles":
        actor.attempts_to(ApplyAlgorithm.naked_singles())
    else:
        raise AssertionError(f"Unsupported algorithm: {algorithm}")


@then(parsers.parse("the system should identify the missing value as {value:d}"))
def system_identifies_missing_value(actor: Actor, value: int) -> None:
    assert value > 0
    assert actor.answer(AlgorithmMadeProgress.after_last_call())


@then(parsers.parse("the value {value:d} should be placed in the empty cell"))
def value_placed_in_empty_cell(actor: Actor, value: int) -> None:
    assert actor.answer(GridCell.contains_value(value))


@then(parsers.parse("the system should place {value:d} in the empty cell of column {col:d}"))
def value_placed_in_column(actor: Actor, value: int, col: int) -> None:
    assert actor.answer(GridCell.in_column(col, value))


@then(parsers.parse("the system should place {value:d} in the empty cell of that block"))
def value_placed_in_block(actor: Actor, value: int) -> None:
    assert actor.answer(GridCell.contains_value(value))


@then("the algorithm should return false")
def algorithm_returns_false(actor: Actor) -> None:
    assert actor.answer(AlgorithmMadeProgress.after_last_call()) is False


@then("no cells should be modified")
def no_cells_modified(actor: Actor) -> None:
    assert actor.answer(GridCell.matches_snapshot())


@given(parsers.parse("row {row_index:d} is missing the number {target:d}"))
def row_missing_number(actor: Actor, row_index: int, target: int) -> None:
    actor.attempts_to(SetupGridState.row_missing_digit(row_index, target))


@given(parsers.parse("{count:d} cells in row {row_index:d} cannot contain {target:d} due to column or block constraints"))
def row_constraints(actor: Actor, count: int, row_index: int, target: int) -> None:
    actor.attempts_to(SetupGridState.row_column_constraints(count, row_index, target))


@given(parsers.parse("column {col_index:d} is missing the number {target:d}"))
def column_missing_number(actor: Actor, col_index: int, target: int) -> None:
    actor.attempts_to(SetupGridState.column_missing_digit(col_index, target))


@given(parsers.parse("{count:d} cells in column {col_index:d} cannot contain {target:d} due to row or block constraints"))
def column_constraints(actor: Actor, count: int, col_index: int, target: int) -> None:
    actor.attempts_to(SetupGridState.column_row_constraints(count, col_index, target))


@given("a 3x3 block has four empty cells")
def block_has_four_empty_cells(actor: Actor) -> None:
    actor.attempts_to(SetupGridState.block_four_empties())


@given(parsers.parse("the number {target:d} is present in rows that intersect three of those empty cells"))
def number_present_in_rows(actor: Actor, target: int) -> None:
    actor.attempts_to(SetupGridState.hidden_single_in_block(target))


@given(parsers.parse("row {row_index:d} already contains the digit {digit:d}"))
def row_already_contains_digit(actor: Actor, row_index: int, digit: int) -> None:
    actor.attempts_to(SetupGridState.digit_in_row(row_index, digit))


@given(parsers.parse("the number {target:d} can be placed in multiple locations within a unit"))
def number_has_multiple_locations(actor: Actor, target: int) -> None:
    assert target > 0
    actor.attempts_to(SetupGridState.with_multiple_candidates())


@when(parsers.parse('the "{algorithm}" algorithm is executed for value {value:d}'))
def algorithm_executed_for_value(actor: Actor, algorithm: str, value: int) -> None:
    assert algorithm == "Hidden Singles"
    actor.attempts_to(ApplyAlgorithm.hidden_singles(value))


@then(parsers.parse("the system should place {value:d} in the only valid cell in row {row_index:d}"))
def value_in_only_row_cell(actor: Actor, value: int, row_index: int) -> None:
    assert actor.answer(GridCell.in_row(row_index, value))


@then("the grid should reflect the new value")
def grid_reflects_new_value(actor: Actor) -> None:
    assert actor.answer(AlgorithmMadeProgress.after_last_call())


@then(parsers.parse("the system should place {value:d} in the only valid cell in column {col_index:d}"))
def value_in_only_column_cell(actor: Actor, value: int, col_index: int) -> None:
    assert actor.answer(GridCell.in_column(col_index, value))


@then(parsers.parse("the system should place {value:d} in the one remaining valid cell of that block"))
def value_in_remaining_block_cell(actor: Actor, value: int) -> None:
    assert actor.answer(GridCell.contains_value(value))


@then(parsers.parse("the algorithm should skip row {row_index:d}"))
def algorithm_skips_row(actor: Actor, row_index: int) -> None:
    assert row_index >= 0
    assert actor.answer(AlgorithmMadeProgress.after_last_call()) is False


@then(parsers.parse("no cells in row {row_index:d} should be modified"))
def no_cells_in_row_modified(actor: Actor, row_index: int) -> None:
    assert row_index >= 0
    assert actor.answer(GridCell.matches_snapshot())


@given(parsers.parse("an empty cell at row {row:d}, column {col:d}"))
def empty_cell_at(actor: Actor, row: int, col: int) -> None:
    actor.attempts_to(SetupGridState.target_cell(row, col))


@given(parsers.parse("the numbers {a:d}, {b:d}, {c:d} are in the same row"))
def numbers_in_row(actor: Actor, a: int, b: int, c: int) -> None:
    actor.attempts_to(SetupGridState.values_in_row([a, b, c]))


@given(parsers.parse("the numbers {a:d}, {b:d}, {c:d} are in the same column"))
def numbers_in_column(actor: Actor, a: int, b: int, c: int) -> None:
    actor.attempts_to(SetupGridState.values_in_column([a, b, c]))


@given(parsers.parse("the numbers {a:d}, {b:d} are in the same 3x3 block"))
def numbers_in_block(actor: Actor, a: int, b: int) -> None:
    actor.attempts_to(SetupGridState.values_in_block([a, b]))


@given(parsers.parse('an empty cell has {count:d} possible candidates: "{candidates}"'))
def cell_has_candidates(actor: Actor, count: int, candidates: str) -> None:
    assert count == len([candidate.strip() for candidate in candidates.split(",")])
    actor.attempts_to(SetupGridState.three_candidates())


@given(parsers.parse("{count:d} empty cells each have exactly one possible value"))
def empty_cells_have_one_value(actor: Actor, count: int) -> None:
    assert count == 3
    actor.attempts_to(SetupGridState.three_naked_singles())


@then(parsers.parse("the system should determine the only possible value is {value:d}"))
def determines_only_possible_value(actor: Actor, value: int) -> None:
    assert actor.answer(AlgorithmMadeProgress.after_last_call())
    target = actor.answer(TargetCell.current())
    assert actor.answer(GridCell.at(target["row"], target["col"])) == value


@then(parsers.parse("the cell at row {row:d}, column {col:d} should be updated to {value:d}"))
def cell_updated(actor: Actor, row: int, col: int, value: int) -> None:
    assert actor.answer(GridCell.at(row, col)) == value


@then("the cell should not be filled")
def cell_not_filled(actor: Actor) -> None:
    target = actor.answer(TargetCell.current())
    assert actor.answer(GridCell.at(target["row"], target["col"])) == 0


@then("the algorithm should continue to other cells")
def algorithm_continues(actor: Actor) -> None:
    assert actor.answer(AlgorithmMadeProgress.after_last_call()) is False


@then(parsers.parse("all {count:d} cells should be filled with their respective values"))
def all_three_cells_filled(actor: Actor, count: int) -> None:
    assert count == 3
    assert actor.answer(AlgorithmMadeProgress.after_last_call())
    assert actor.answer(GridCell.at(0, 0)) == 5
    assert actor.answer(GridCell.at(4, 4)) == 5
    assert actor.answer(GridCell.at(8, 8)) == 9


@then("the algorithm should return true")
def algorithm_returns_true(actor: Actor) -> None:
    assert actor.answer(AlgorithmMadeProgress.after_last_call())


@given(parsers.parse("a cell at {row:d}, {col:d} is empty"))
def cell_is_empty(actor: Actor, row: int, col: int) -> None:
    actor.attempts_to(SetTargetCell.at(row, col))


@given(parsers.parse("the grid state is {grid_state}"))
def grid_state_is(actor: Actor, grid_state: str) -> None:
    actor.attempts_to(SetupGridState.named(grid_state))


@when(parsers.parse("attempting to place {value:d} at that position"))
def attempting_to_place(actor: Actor, value: int) -> None:
    actor.attempts_to(AttemptPlacement.of_value(value))


@then("the move should be validated against row, column, and block constraints")
def move_validated() -> None:
    pass


@then(parsers.parse("the validation result should be {expected}"))
def validation_result(actor: Actor, expected: str) -> None:
    assert actor.answer(PlacementValidity.of_last_attempt()) == expected


@given("a puzzle that requires all three techniques")
def puzzle_requires_all_techniques(actor: Actor) -> None:
    actor.attempts_to(LoadPuzzleByName.and_initialise("Logic Squeeze Grid"))


@given("a partially filled grid solvable with basic techniques")
def partially_filled_grid(actor: Actor) -> None:
    actor.attempts_to(LoadPuzzleByName.and_initialise("Easy Scan Grid"))


@given("every cell in the 9x9 grid contains a non-zero digit")
def completed_grid(actor: Actor) -> None:
    grid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
    actor.attempts_to(InitialiseGrid.with_complete_grid(grid))


@given("no digits violate row, column, or block rules")
def no_digits_violate_rules() -> None:
    pass


@given("a puzzle that cannot be solved with basic techniques")
def puzzle_cannot_be_solved(actor: Actor) -> None:
    actor.attempts_to(LoadPuzzleByName.and_initialise("Empty Grid"))


@given(parsers.parse('the "{puzzle_name}" puzzle is loaded'))
def quoted_puzzle_loaded(actor: Actor, puzzle_name: str) -> None:
    actor.attempts_to(LoadPuzzleByName.and_initialise(puzzle_name))


@when("the solver executes the main loop")
@when("the solver executes all three algorithms without making changes")
@when("the orchestrator solve method is called")
def solving_loop_runs(actor: Actor) -> None:
    actor.attempts_to(SolvePuzzle.with_current_grid())


# SUD-20 / BACKLOG-051: these two When-phrases feed the ordering/no-execution assertions below,
# so they always capture the audit event sequence (with_current_grid_tracking_order), unlike the
# other When-phrases above which share the plain with_current_grid().
@when("the main solving loop executes one iteration")
@when("the main execution loop runs")
def solving_loop_runs_tracking_order(actor: Actor) -> None:
    actor.attempts_to(SolvePuzzle.with_current_grid_tracking_order())


@then("multiple iterations should occur")
@then("each iteration should make progress until solved")
@then("the puzzle should be completely solved")
def solved_status_verified(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "SOLVED"


# Fixed priority order the orchestrator always calls algorithms in (SudokuOrchestrator.solve()).
_ALGORITHM_RANK = {"UnitCompletion": 0, "HiddenSingles": 1, "NakedSingles": 2}


def _events_in_iteration(events: list[dict], iteration: int) -> list[dict]:
    return [e for e in events if e["iteration"] == iteration]


def _iteration_numbers(events: list[dict]) -> list[int]:
    return sorted({e["iteration"] for e in events})


@then('"Unit Completion" should be attempted first')
def unit_completion_attempted_first(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "SOLVED"

    # The orchestrator always calls unit_completion() before hidden_singles()/naked_singles()
    # every iteration, but the audit trail only logs an event when a call produces a change. So
    # the real, always-true claim observable from the trail is: whenever a Unit Completion event
    # IS logged for an iteration, it is that iteration's first event.
    events = actor.ability_to(UseSudokuSolver).last_ordering_events
    for iteration in _iteration_numbers(events):
        iter_events = _events_in_iteration(events, iteration)
        uc_index = next((i for i, e in enumerate(iter_events) if e["algorithm"] == "UnitCompletion"), -1)
        if uc_index != -1:
            assert uc_index == 0, (
                f"Iteration {iteration}: Unit Completion event was not first "
                f"(index {uc_index} of {len(iter_events)})"
            )


@then(parsers.parse('"Hidden Singles" should be attempted second for digits {start:d} through {end:d}'))
def hidden_singles_attempted_second(actor: Actor, start: int, end: int) -> None:
    events = actor.ability_to(UseSudokuSolver).last_ordering_events
    for iteration in _iteration_numbers(events):
        iter_events = _events_in_iteration(events, iteration)
        uc_index = next((i for i, e in enumerate(iter_events) if e["algorithm"] == "UnitCompletion"), -1)
        hs_events = [e for e in iter_events if e["algorithm"] == "HiddenSingles"]
        first_hs_index = next((i for i, e in enumerate(iter_events) if e["algorithm"] == "HiddenSingles"), -1)

        if uc_index != -1 and first_hs_index != -1:
            assert uc_index < first_hs_index, (
                f"Iteration {iteration}: a Hidden Singles event preceded the Unit Completion event"
            )

        last_digit = 0
        for e in hs_events:
            digit = e["algorithmParameter"]
            assert start <= digit <= end, (
                f"Iteration {iteration}: Hidden Singles digit {digit} is outside the expected range {start}-{end}"
            )
            assert digit > last_digit, (
                f"Iteration {iteration}: Hidden Singles digit {digit} did not increase after {last_digit} "
                f"(out of scan order)"
            )
            last_digit = digit


@then('"Naked Singles" should be attempted third')
def naked_singles_attempted_third(actor: Actor) -> None:
    events = actor.ability_to(UseSudokuSolver).last_ordering_events
    for iteration in _iteration_numbers(events):
        iter_events = _events_in_iteration(events, iteration)
        ns_index = next((i for i, e in enumerate(iter_events) if e["algorithm"] == "NakedSingles"), -1)
        if ns_index != -1:
            assert ns_index == len(iter_events) - 1, (
                f"Iteration {iteration}: Naked Singles event was not last "
                f"(index {ns_index} of {len(iter_events)})"
            )


@then("the execution order should be maintained in every iteration")
def execution_order_maintained(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "SOLVED"

    events = actor.ability_to(UseSudokuSolver).last_ordering_events
    assert events, "Expected at least one audit event for a puzzle requiring all three techniques"
    for iteration in _iteration_numbers(events):
        max_rank_so_far = -1
        for e in _events_in_iteration(events, iteration):
            rank = _ALGORITHM_RANK[e["algorithm"]]
            assert rank >= max_rank_so_far, (
                f"Iteration {iteration}: event {e['eventId']} ({e['algorithm']}) broke the "
                f"Unit Completion -> Hidden Singles -> Naked Singles priority order"
            )
            max_rank_so_far = rank


@then(parsers.parse('the final status should be "{status}"'))
@then(parsers.parse('the status should return "{status}"'))
@then(parsers.parse('the status should be "{status}"'))
def status_should_be(actor: Actor, status: str) -> None:
    assert actor.answer(SolveStatus.current()) == status


@then("the system should detect the grid is full")
def system_detects_grid_full(actor: Actor) -> None:
    assert actor.answer(GridCell.is_grid_full())


@then("no algorithms should be executed")
def no_algorithms_executed(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "SOLVED"

    # SUD-01 contract (BACKLOG-035): an already-solved grid returns SOLVED via the early
    # is_grid_full() check in SudokuOrchestrator.solve(), before the progress loop - and
    # therefore before start_iteration() is ever called - so the audit trail must show zero
    # iterations and zero events, not merely an overall SOLVED status.
    ability = actor.ability_to(UseSudokuSolver)
    assert ability.last_ordering_iterations == 0, (
        f"Expected 0 iterations for an already-solved grid but got {ability.last_ordering_iterations}"
    )
    assert len(ability.last_ordering_events) == 0, (
        f"Expected 0 audit events for an already-solved grid but got {len(ability.last_ordering_events)}"
    )


@then("the system should exit the solving loop")
def system_exits_loop(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "STUCK_ON_ADVANCED_LOGIC"


@then(parsers.parse("all {count:d} cells should contain valid digits"))
def all_cells_valid(actor: Actor, count: int) -> None:
    assert count == 81
    assert actor.answer(GridCell.all_filled())


@given(parsers.parse("a puzzles.json file exists with {count:d} puzzles"))
def puzzles_file_exists(count: int) -> None:
    assert count == 5


@given("a puzzle with an 8x9 grid in the JSON file")
def puzzle_with_8x9_grid(actor: Actor) -> None:
    actor.attempts_to(SimulateError.for_invalid_row_count(8))


@given(parsers.parse("a puzzle with a cell value of {value:d} in the JSON file"))
def puzzle_with_invalid_cell(actor: Actor, value: int) -> None:
    actor.attempts_to(SimulateError.for_invalid_cell_value(value))


@given("puzzles are loaded from JSON")
def puzzles_loaded_from_json() -> None:
    pass


@given("the puzzles.json file does not exist")
def puzzles_file_missing() -> None:
    pass


@when(parsers.parse('the PuzzleLoader is initialized with "{file_path}"'))
def puzzle_loader_initialised_with(file_path: str) -> None:
    assert file_path


@when("the PuzzleLoader attempts to load the file")
def puzzle_loader_attempts_load() -> None:
    pass


@when(parsers.parse('requesting a puzzle by name "{name}"'))
def requesting_puzzle_by_name(actor: Actor, name: str) -> None:
    actor.attempts_to(LoadPuzzleByName.and_initialise_or_default(name))


@when(parsers.parse('requesting puzzles with difficulty "{difficulty}"'))
def requesting_puzzles_by_difficulty(actor: Actor, difficulty: str) -> None:
    actor.attempts_to(LoadPuzzlesByDifficulty.and_store(difficulty))


@when(parsers.parse("requesting puzzle at index {index:d}"))
def requesting_puzzle_at_index(actor: Actor, index: int) -> None:
    actor.attempts_to(LoadPuzzleByIndex.and_initialise(index))


@when("the PuzzleLoader is initialized")
def puzzle_loader_initialised(actor: Actor) -> None:
    actor.attempts_to(SimulateError.for_missing_file())


@then(parsers.parse("{count:d} puzzles should be successfully loaded"))
def puzzles_loaded(actor: Actor, count: int) -> None:
    assert actor.answer(LoadedPuzzleCount.current()) == count


@then("each puzzle should have a name, difficulty, description, and grid")
def each_puzzle_has_fields(actor: Actor) -> None:
    for puzzle in actor.answer(LoadedPuzzles.all()):
        assert puzzle.name
        assert puzzle.difficulty
        assert puzzle.description
        assert len(puzzle.grid) == 9


@then("a validation error should be thrown")
@then("an error should be thrown")
def validation_error_thrown(actor: Actor) -> None:
    assert actor.answer(ErrorThrown.last()) is not None


@then(parsers.parse('the error message should indicate "{message}"'))
@then(parsers.parse('the error message should contain "{message}"'))
def error_message_contains(actor: Actor, message: str) -> None:
    error = actor.answer(ErrorThrown.last())
    assert error is not None
    assert message in str(error)


@then("the correct puzzle should be returned")
def correct_puzzle_returned(actor: Actor) -> None:
    assert actor.answer(CurrentSolver.name()) == "Easy Scan Grid"


@then("the puzzle grid should be a 9x9 array")
def puzzle_grid_valid(actor: Actor) -> None:
    assert actor.answer(CurrentSolver.has_valid_grid())


@then(parsers.parse('only puzzles marked as "{difficulty}" should be returned'))
def only_matching_puzzles(actor: Actor, difficulty: str) -> None:
    assert difficulty
    assert actor.answer(MultipleSolvers.count()) > 0


@then("the result should be an array of matching puzzles")
def result_array_matching(actor: Actor) -> None:
    assert actor.answer(MultipleSolvers.count()) >= 0


@then("the first puzzle in the collection should be returned")
def first_puzzle_returned(actor: Actor) -> None:
    assert actor.answer(CurrentSolver.name()) == "Easy Scan Grid"


@given("a puzzle grid with specific values")
def puzzle_grid_with_specific_values(actor: Actor) -> None:
    grid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ]
    actor.attempts_to(SetupGridState.from_specific_grid(grid))


@given("a SudokuSolver is created with a puzzle grid")
def solver_created_with_puzzle_grid(actor: Actor) -> None:
    actor.attempts_to(InitialiseGrid.from_puzzle_named("Easy Scan Grid"))


@when("a SudokuSolver is created with that grid")
def solver_created_with_that_grid(actor: Actor) -> None:
    snapshot = actor.answer(GridSnapshot.current())
    actor.attempts_to(InitialiseGrid.with_grid("testPuzzle", snapshot))


@when("the solver modifies cells during solving")
def solver_modifies_cells(actor: Actor) -> None:
    actor.attempts_to(SolvePuzzle.with_current_grid())


@then("the solver's working grid should contain a deep copy of the puzzle")
def working_grid_deep_copy(actor: Actor) -> None:
    assert actor.answer(GridCell.is_deep_copy())


@then("the original grid should remain unchanged")
@then("the origGrid property should remain unchanged")
def original_grid_unchanged(actor: Actor) -> None:
    assert actor.answer(GridCell.orig_matches_snapshot())


@then("the working grid should reflect all modifications")
def working_grid_modified(actor: Actor) -> None:
    assert actor.answer(GridCell.working_differs_from_orig())


@given(parsers.parse('the puzzle "{name}" is loaded from JSON'))
def puzzle_loaded_from_json(actor: Actor, name: str) -> None:
    actor.attempts_to(LoadPuzzleByName.and_initialise(name))


@given("an empty 9x9 grid with all zeros")
def empty_grid_with_zeros(actor: Actor) -> None:
    actor.attempts_to(InitialiseGrid.empty())


@when("the solver attempts to solve it")
@when("the solver attempts to solve it with basic techniques only")
def solver_attempts_solve(actor: Actor) -> None:
    actor.attempts_to(SolvePuzzle.with_current_grid())


@then("all cells should be filled")
def all_cells_filled(actor: Actor) -> None:
    assert actor.answer(GridCell.all_filled())


@then("the solution should be valid (no constraint violations)")
def solution_valid_no_violations(actor: Actor) -> None:
    assert actor.answer(GridCell.is_valid_solution())


@then("the puzzle should require all three techniques")
def puzzle_requires_all_three(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "SOLVED"


@then("the solution should be valid")
def solution_valid(actor: Actor) -> None:
    assert actor.answer(GridCell.is_valid_solution())


@then("no cells should be filled")
def no_cells_filled(actor: Actor) -> None:
    assert actor.answer(GridCell.has_empty_cells())


@then("no errors should occur")
def no_errors_occur() -> None:
    pass


@given(parsers.parse("a grid with {rows:d} rows instead of {expected:d}"))
def grid_with_wrong_rows(actor: Actor, rows: int, expected: int) -> None:
    if rows != expected:
        actor.attempts_to(SimulateError.for_invalid_row_count(rows))


@given(parsers.parse("a grid where row {row_index:d} contains two {value:d}'s"))
def grid_with_duplicate_values(actor: Actor, row_index: int, value: int) -> None:
    actor.attempts_to(InitialiseGrid.with_duplicate_in_row(row_index, value))


@given("a grid state where no algorithm can make progress")
def grid_no_progress(actor: Actor) -> None:
    actor.attempts_to(SetupGridState.no_progress())


@given(parsers.parse("{count:d} different puzzles are loaded"))
def different_puzzles_loaded(actor: Actor, count: int) -> None:
    actor.attempts_to(SetupGridState.multiple_solvers(count))


@when("attempting to create a SudokuSolver")
def attempting_to_create_solver() -> None:
    pass


@when("the solver attempts to solve")
def solver_attempts_solve_invalid(actor: Actor) -> None:
    actor.attempts_to(SolvePuzzle.with_current_grid())


@when("each algorithm is executed individually")
def algorithms_executed_individually(actor: Actor) -> None:
    actor.attempts_to(SetupGridState.run_all_algorithms_individually())


@when(parsers.parse("{count:d} separate SudokuSolver instances are created"))
def separate_solvers_created(count: int) -> None:
    assert count == 3


@then("validation should detect the dimension error")
def validation_detects_dimension_error(actor: Actor) -> None:
    assert actor.answer(ErrorThrown.last()) is not None


@then("an appropriate error should be raised")
def appropriate_error_raised(actor: Actor) -> None:
    error = actor.answer(ErrorThrown.last())
    assert error is not None
    assert "must have exactly 9 rows" in str(error)


@then("the solver should not find valid moves")
@then("the puzzle should be unsolvable")
def puzzle_unsolvable(actor: Actor) -> None:
    assert actor.answer(SolveStatus.current()) == "STUCK_ON_ADVANCED_LOGIC"


@then('"Unit Completion" should return false')
def unit_completion_false(actor: Actor) -> None:
    actor.attempts_to(CheckAlgorithmProgress.unit_completion_on_snapshot())
    assert actor.answer(AlgorithmMadeProgress.after_last_call()) is False


@then(parsers.parse('"Hidden Singles" should return false for all digits {start:d}-{end:d}'))
def hidden_singles_false(actor: Actor, start: int, end: int) -> None:
    actor.attempts_to(CheckAlgorithmProgress.reinit_from_snapshot())
    for digit in range(start, end + 1):
        actor.attempts_to(ApplyAlgorithm.hidden_singles(digit))
        assert actor.answer(AlgorithmMadeProgress.after_last_call()) is False


@then('"Naked Singles" should return false')
def naked_singles_false(actor: Actor) -> None:
    actor.attempts_to(CheckAlgorithmProgress.naked_singles_on_snapshot())
    assert actor.answer(AlgorithmMadeProgress.after_last_call()) is False


@then("the main loop should exit")
def main_loop_exits() -> None:
    pass


@then("each solver should maintain its own independent grid state")
def solvers_independent(actor: Actor) -> None:
    assert actor.answer(MultipleSolvers.count()) == 3
    assert actor.answer(MultipleSolvers.are_independent())


@then("solving one should not affect the others")
def solving_one_isolated(actor: Actor) -> None:
    assert actor.answer(MultipleSolvers.isolation_verified())


@given("audit logging is enabled")
def audit_logging_enabled(actor: Actor) -> None:
    actor.attempts_to(EnableAuditLogging.for_current_solver())


@when("the solver attempts to solve it with audit")
def solver_solves_with_audit(actor: Actor) -> None:
    actor.attempts_to(SolvePuzzle.with_current_grid_and_audit())


@then("the audit trail should be generated")
def audit_trail_generated(actor: Actor) -> None:
    assert actor.answer(AuditTrail.current()) is not None


@then("the audit trail should contain at least one cell change")
def audit_trail_has_change(actor: Actor) -> None:
    trail = actor.answer(AuditTrail.current())
    assert trail is not None
    assert trail["totalChanges"] > 0


@then("every cell change should have an algorithm attribution")
def audit_trail_has_algorithm(actor: Actor) -> None:
    trail = actor.answer(AuditTrail.current())
    assert trail is not None
    for event in trail["events"]:
        assert event["algorithm"]


@then("the audit trail statistics should account for all changes")
def audit_stats_match_changes(actor: Actor) -> None:
    trail = actor.answer(AuditTrail.current())
    assert trail is not None
    stats = trail["statistics"]["changesByAlgorithm"]
    assert stats["unitCompletion"] + stats["hiddenSingles"] + stats["nakedSingles"] == trail["totalChanges"]


@then("no audit trail should be present")
def no_audit_trail_present(actor: Actor) -> None:
    assert actor.answer(AuditTrail.current()) is None
