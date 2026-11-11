from __future__ import annotations

from pathlib import Path

import pytest

from tests.screenplay.abilities import LoadPuzzles

PUZZLES_PATH = Path(__file__).resolve().parents[2] / "puzzles.json"


def test_missing_file_surfaces_loader_error_from_every_getter_while_preserving_get_error(
    tmp_path: Path,
) -> None:
    missing_path = str(tmp_path / "missing-ability-puzzles.json")
    ability = LoadPuzzles.from_path(missing_path)

    error = ability.get_error()
    assert isinstance(error, FileNotFoundError)
    assert "Puzzle file not found" in str(error)

    with pytest.raises(FileNotFoundError, match="Puzzle file not found"):
        ability.get_all()
    with pytest.raises(FileNotFoundError, match="Puzzle file not found"):
        ability.get_by_name("Easy Scan Grid")
    with pytest.raises(FileNotFoundError, match="Puzzle file not found"):
        ability.get_by_index(0)
    with pytest.raises(FileNotFoundError, match="Puzzle file not found"):
        ability.get_by_difficulty("easy")
    with pytest.raises(FileNotFoundError, match="Puzzle file not found"):
        ability.get_count()


def test_valid_puzzle_file_delegates_getters_and_clears_error() -> None:
    ability = LoadPuzzles.from_path(str(PUZZLES_PATH))

    assert ability.get_error() is None
    assert ability.get_count() == 5
    assert len(ability.get_all()) == 5
    named = ability.get_by_name("Easy Scan Grid")
    assert named is not None and named.name == "Easy Scan Grid"
    indexed = ability.get_by_index(0)
    assert indexed is not None and indexed.name == "Easy Scan Grid"
    assert len(ability.get_by_difficulty("easy")) > 0
