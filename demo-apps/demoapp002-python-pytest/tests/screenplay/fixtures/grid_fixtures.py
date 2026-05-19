from __future__ import annotations

from app_src import Puzzle, SudokuSolver
from app_src.constants import BLOCK_SIZE, EMPTY_CELL, GRID_SIZE


def _digits_except(missing_digit: int) -> list[int]:
    return [digit for digit in range(1, GRID_SIZE + 1) if digit != missing_digit]


def setup_almost_complete_column(solver: SudokuSolver, col: int, missing_digit: int) -> None:
    values = _digits_except(missing_digit)
    for index, value in enumerate(values):
        solver.grid[index + 1][col] = value
    solver.grid[0][col] = EMPTY_CELL


def setup_almost_complete_block(
    solver: SudokuSolver, block_row: int, block_col: int, missing_digit: int
) -> None:
    values = _digits_except(missing_digit)
    index = 0
    for row in range(block_row * BLOCK_SIZE, (block_row + 1) * BLOCK_SIZE):
        for col in range(block_col * BLOCK_SIZE, (block_col + 1) * BLOCK_SIZE):
            solver.grid[row][col] = values[index] if index < len(values) else EMPTY_CELL
            index += 1


def setup_multiple_empties(solver: SudokuSolver) -> None:
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            solver.grid[row][col] = ((row * 3 + col + 1) % 9) + 1 if (row + col) % 2 == 0 else EMPTY_CELL


def setup_row_missing_digit(solver: SudokuSolver, row_index: int, target: int) -> None:
    digits = _digits_except(target)
    index = 0
    for col in range(GRID_SIZE):
        if col == 4:
            solver.grid[row_index][col] = EMPTY_CELL
        else:
            solver.grid[row_index][col] = digits[index]
            index += 1


def setup_column_missing_digit(solver: SudokuSolver, col_index: int, target: int) -> None:
    digits = _digits_except(target)
    index = 0
    for row in range(GRID_SIZE):
        if row == 4:
            solver.grid[row][col_index] = EMPTY_CELL
        else:
            solver.grid[row][col_index] = digits[index]
            index += 1


def setup_block_four_empties(solver: SudokuSolver) -> None:
    solver.grid[0][0] = 1
    solver.grid[1][0] = 2
    solver.grid[2][0] = 3
    solver.grid[2][1] = 6
    solver.grid[2][2] = 7


def setup_hidden_single_in_block(solver: SudokuSolver, target: int) -> None:
    solver.grid[0][5] = target
    solver.grid[3][1] = target


def setup_digit_in_row(solver: SudokuSolver, row_index: int, digit: int) -> None:
    solver.grid[row_index][5] = digit


def clear_cell(solver: SudokuSolver, row: int, col: int) -> None:
    solver.grid[row][col] = EMPTY_CELL


def setup_three_candidates(solver: SudokuSolver) -> None:
    solver.grid[0][1] = 1
    solver.grid[0][2] = 3
    solver.grid[0][3] = 4
    solver.grid[1][0] = 6
    solver.grid[2][0] = 7
    solver.grid[4][0] = 9


def setup_three_naked_singles(solver: SudokuSolver) -> None:
    solution = [
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
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            solver.grid[row][col] = solution[row][col]
    solver.grid[0][0] = EMPTY_CELL
    solver.grid[4][4] = EMPTY_CELL
    solver.grid[8][8] = EMPTY_CELL


def setup_named_grid_state(solver: SudokuSolver, grid_state: str) -> None:
    if grid_state == "has5InSameRow":
        solver.grid[0][5] = 5
    elif grid_state == "has3InSameCol":
        solver.grid[5][0] = 3
    elif grid_state == "has7InSameBlock":
        solver.grid[0][0] = 7
    elif grid_state == "has1InRowAndCol":
        solver.grid[8][0] = 1
        solver.grid[0][8] = 1
    elif grid_state == "fullyConstrained":
        solver.grid[3][0] = 8


def setup_with_duplicate_in_row(solver: SudokuSolver, row_index: int, value: int) -> None:
    solver.grid[row_index][0] = value
    solver.grid[row_index][1] = value


def add_values_to_row(solver: SudokuSolver, row: int, exclude_col: int, values: list[int]) -> None:
    placed = 0
    for col in range(GRID_SIZE):
        if placed >= len(values):
            break
        if col != exclude_col and solver.grid[row][col] == EMPTY_CELL:
            solver.grid[row][col] = values[placed]
            placed += 1


def add_values_to_column(solver: SudokuSolver, col: int, exclude_row: int, values: list[int]) -> None:
    placed = 0
    for row in range(GRID_SIZE):
        if placed >= len(values):
            break
        if row != exclude_row and solver.grid[row][col] == EMPTY_CELL:
            solver.grid[row][col] = values[placed]
            placed += 1


def add_values_to_block(
    solver: SudokuSolver,
    target_row: int,
    target_col: int,
    exclude_row: int,
    exclude_col: int,
    values: list[int],
) -> None:
    block_start_row = (target_row // BLOCK_SIZE) * BLOCK_SIZE
    block_start_col = (target_col // BLOCK_SIZE) * BLOCK_SIZE
    placed = 0
    for row in range(block_start_row, block_start_row + BLOCK_SIZE):
        for col in range(block_start_col, block_start_col + BLOCK_SIZE):
            if placed >= len(values):
                return
            if (row != exclude_row or col != exclude_col) and solver.grid[row][col] == EMPTY_CELL:
                solver.grid[row][col] = values[placed]
                placed += 1


def create_solvers_from_puzzles(count: int, puzzles: list[Puzzle]) -> list[SudokuSolver]:
    return [SudokuSolver(puzzle.name, puzzle.grid) for puzzle in puzzles[:count]]
