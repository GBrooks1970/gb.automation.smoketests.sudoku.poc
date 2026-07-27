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
                        "name": "Boolean Cell Boundary",
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
