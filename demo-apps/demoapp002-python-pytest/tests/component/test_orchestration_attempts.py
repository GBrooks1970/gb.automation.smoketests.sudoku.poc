from dataclasses import FrozenInstanceError

import pytest

from app_src import AttemptEvent, SudokuOrchestrator, SudokuSolver


EMPTY_GRID = [[0 for _ in range(9)] for _ in range(9)]
SOLVED_EXCEPT_ONE = [
    [5, 3, 4, 6, 7, 8, 9, 1, 0],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
]
SOLVED_GRID = [row.copy() for row in SOLVED_EXCEPT_ONE]
SOLVED_GRID[0][8] = 2


def expected_iteration() -> list[tuple[str, int | None]]:
    return [
        ("UnitCompletion", None),
        *(("HiddenSingles", digit) for digit in range(1, 10)),
        ("NakedSingles", None),
        ("NakedPairs", None),
        ("XWing", None),
    ]


def test_observer_records_every_unchanged_attempt_in_exact_order() -> None:
    events: list[AttemptEvent] = []
    solver = SudokuSolver("empty", EMPTY_GRID)

    result = SudokuOrchestrator(solver, attempt_observer=events.append).solve()

    assert result == "STUCK_ON_ADVANCED_LOGIC"
    assert [(event.technique, event.parameter) for event in events] == expected_iteration()
    assert [event.iteration for event in events] == [1] * 13
    assert [event.sequence for event in events] == list(range(1, 14))
    assert all(not event.changed and not event.changes for event in events)


def test_observer_records_immutable_changes_and_non_terminal_progress() -> None:
    events: list[AttemptEvent] = []
    solver = SudokuSolver("one missing", SOLVED_EXCEPT_ONE)

    result = SudokuOrchestrator(solver, attempt_observer=events.append).solve()

    assert result == "SOLVED"
    assert sorted({event.iteration for event in events}) == [1, 2]
    assert any(event.changed for event in events if event.iteration == 1)
    assert all(not event.changed for event in events if event.iteration == 2)

    changed_event = next(event for event in events if event.changed)
    assert changed_event.changes[0].cell.row == 0
    assert changed_event.changes[0].cell.col == 8
    assert changed_event.changes[0].old_value == 0
    assert changed_event.changes[0].new_value == 2
    with pytest.raises(FrozenInstanceError):
        changed_event.iteration = 99  # type: ignore[misc]
    with pytest.raises(AttributeError):
        changed_event.changes.append(changed_event.changes[0])  # type: ignore[attr-defined]


def test_completed_grid_exits_before_any_solving_attempt() -> None:
    events: list[AttemptEvent] = []
    solver = SudokuSolver("complete", SOLVED_GRID)

    result = SudokuOrchestrator(solver, attempt_observer=events.append).solve()

    assert result == "SOLVED"
    assert events == []


def test_observer_rejects_changed_result_without_cell_evidence() -> None:
    solver = SudokuSolver("inconsistent technique", EMPTY_GRID)
    solver.unit_completion = lambda: True  # type: ignore[method-assign]

    with pytest.raises(
        RuntimeError,
        match="UnitCompletion returned changed=True but produced 0 cell changes",
    ):
        SudokuOrchestrator(solver, attempt_observer=lambda _: None).solve()
