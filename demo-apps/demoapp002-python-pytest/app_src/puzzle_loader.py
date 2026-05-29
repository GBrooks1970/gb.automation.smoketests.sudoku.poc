from __future__ import annotations

import json
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path

from .constants import EMPTY_CELL, GRID_SIZE, MAX_DIGIT


@dataclass(frozen=True)
class Puzzle:
    name: str
    difficulty: str
    description: str
    grid: list[list[int]]


class PuzzleLoader:
    def __init__(self, file_path: str = "../puzzles.json"):
        path = Path(file_path)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent / file_path
        path = path.resolve()

        if not path.exists():
            raise FileNotFoundError(f"Puzzle file not found: {path}")

        data = json.loads(path.read_text(encoding="utf-8"))
        self._puzzles = [
            Puzzle(
                name=item["name"],
                difficulty=item["difficulty"],
                description=item["description"],
                grid=deepcopy(item["grid"]),
            )
            for item in data["puzzles"]
        ]
        self._validate_puzzles()

    def get_all_puzzles(self) -> list[Puzzle]:
        return deepcopy(self._puzzles)

    def get_puzzle_by_name(self, name: str) -> Puzzle | None:
        return next((puzzle for puzzle in self._puzzles if puzzle.name == name), None)

    def get_puzzles_by_difficulty(self, difficulty: str) -> list[Puzzle]:
        return [puzzle for puzzle in self._puzzles if puzzle.difficulty.lower() == difficulty.lower()]

    def get_puzzle_by_index(self, index: int) -> Puzzle | None:
        return self._puzzles[index] if 0 <= index < len(self._puzzles) else None

    def get_puzzle_count(self) -> int:
        return len(self._puzzles)

    def list_puzzle_names(self) -> list[str]:
        return [puzzle.name for puzzle in self._puzzles]

    def _validate_puzzles(self) -> None:
        for index, puzzle in enumerate(self._puzzles):
            if len(puzzle.grid) != GRID_SIZE:
                raise ValueError(f'Puzzle "{puzzle.name}" (index {index}) must have exactly 9 rows')
            for row_index, row in enumerate(puzzle.grid):
                if len(row) != GRID_SIZE:
                    raise ValueError(f'Puzzle "{puzzle.name}" row {row_index} must have exactly 9 columns')
                for col_index, cell in enumerate(row):
                    if not isinstance(cell, int) or cell < EMPTY_CELL or cell > MAX_DIGIT:
                        raise ValueError(
                            f'Puzzle "{puzzle.name}" has invalid value at [{row_index}][{col_index}]: {cell}'
                        )
