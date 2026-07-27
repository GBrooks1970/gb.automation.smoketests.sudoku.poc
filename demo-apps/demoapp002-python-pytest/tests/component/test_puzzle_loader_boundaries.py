from __future__ import annotations

import json
from pathlib import Path

import pytest

from app_src import PuzzleLoader


@pytest.mark.parametrize("boolean_cell", [True, False])
def test_loader_rejects_json_boolean_cells(tmp_path: Path, boolean_cell: bool) -> None:
    puzzle_path = write_puzzle(tmp_path, boolean_cell)

    with pytest.raises(ValueError):
        PuzzleLoader(str(puzzle_path))


def test_loader_still_accepts_integer_boundary_values(tmp_path: Path) -> None:
    grid = empty_grid()
    grid[0][0] = 0
    grid[0][1] = 9
    puzzle_path = write_puzzle(tmp_path, grid=grid)

    puzzle = PuzzleLoader(str(puzzle_path)).get_puzzle_by_index(0)

    assert puzzle is not None
    assert puzzle.grid[0][0:2] == [0, 9]


def test_loader_exposes_queries_without_leaking_mutable_grid_state(tmp_path: Path) -> None:
    puzzle_path = write_puzzle(tmp_path)
    loader = PuzzleLoader(str(puzzle_path))

    assert loader.get_puzzle_count() == 1
    assert loader.list_puzzle_names() == ["Boundary Grid"]
    assert loader.get_puzzle_by_name("Boundary Grid") is not None
    assert loader.get_puzzle_by_name("boundary grid") is None
    assert loader.get_puzzles_by_difficulty("INVALID")[0].name == "Boundary Grid"
    assert loader.get_puzzle_by_index(-1) is None
    assert loader.get_puzzle_by_index(1) is None

    returned_puzzles = loader.get_all_puzzles()
    returned_puzzles[0].grid[0][0] = 9
    stored_puzzle = loader.get_puzzle_by_index(0)
    assert stored_puzzle is not None
    assert stored_puzzle.grid[0][0] == 0


def test_loader_rejects_missing_puzzle_file(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError, match="Puzzle file not found"):
        PuzzleLoader(str(tmp_path / "missing.json"))


def test_loader_rejects_incorrect_row_count(tmp_path: Path) -> None:
    puzzle_path = write_puzzle(tmp_path, grid=empty_grid()[:-1])

    with pytest.raises(ValueError, match="exactly 9 rows"):
        PuzzleLoader(str(puzzle_path))


def test_loader_rejects_incorrect_column_count(tmp_path: Path) -> None:
    grid = empty_grid()
    grid[0] = grid[0][:-1]
    puzzle_path = write_puzzle(tmp_path, grid=grid)

    with pytest.raises(ValueError, match="exactly 9 columns"):
        PuzzleLoader(str(puzzle_path))


@pytest.mark.parametrize("invalid_cell", [1.5, "1", -1, 10])
def test_loader_rejects_non_integer_or_out_of_range_cells(
    tmp_path: Path, invalid_cell: object
) -> None:
    puzzle_path = write_puzzle(tmp_path, invalid_cell)

    with pytest.raises(ValueError, match="has invalid value"):
        PuzzleLoader(str(puzzle_path))


def write_puzzle(
    temp_directory: Path,
    first_cell: object = 0,
    *,
    grid: list[list[int]] | None = None,
) -> Path:
    puzzle_grid: list[list[object]] = grid if grid is not None else empty_grid()
    puzzle_grid[0][0] = first_cell
    puzzle_path = temp_directory / "puzzles.json"
    puzzle_path.write_text(
        json.dumps(
            {
                "puzzles": [
                    {
                        "name": "Boundary Grid",
                        "difficulty": "invalid",
                        "description": "A puzzle-loader boundary fixture",
                        "grid": puzzle_grid,
                    }
                ]
            }
        ),
        encoding="utf-8",
    )
    return puzzle_path


def empty_grid() -> list[list[int]]:
    return [[0 for _ in range(9)] for _ in range(9)]
