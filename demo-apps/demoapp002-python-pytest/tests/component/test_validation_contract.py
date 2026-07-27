import pytest

from app_src import SudokuSolver


SOLVED_GRID = [
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


@pytest.mark.parametrize(
    ("conflicting_cell", "expected"),
    [
        (None, True),
        ((0, 4), False),
        ((4, 0), False),
        ((1, 1), False),
    ],
)
def test_placement_validation_maps_row_column_and_block_conflicts(
    conflicting_cell: tuple[int, int] | None, expected: bool
) -> None:
    grid = empty_grid()
    if conflicting_cell is not None:
        row, col = conflicting_cell
        grid[row][col] = 5
    solver = SudokuSolver("placement validation", grid)

    assert solver.is_valid_placement(0, 0, 5) is expected


@pytest.mark.parametrize("has_duplicate", [False, True])
def test_constraint_validation_maps_clean_and_duplicate_grids(has_duplicate: bool) -> None:
    grid = empty_grid()
    if has_duplicate:
        grid[0][0:2] = [5, 5]
    solver = SudokuSolver("constraint validation", grid)

    assert solver.no_constraint_violations() is (not has_duplicate)


@pytest.mark.parametrize("is_complete_solution", [True, False])
def test_solution_validation_maps_complete_and_invalid_grids(is_complete_solution: bool) -> None:
    grid = [row.copy() for row in SOLVED_GRID]
    if not is_complete_solution:
        grid[0][0] = grid[0][1]
    solver = SudokuSolver("solution validation", grid)

    assert solver.is_valid_solution() is is_complete_solution


def empty_grid() -> list[list[int]]:
    return [[0 for _ in range(9)] for _ in range(9)]
