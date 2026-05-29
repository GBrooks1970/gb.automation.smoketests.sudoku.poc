from __future__ import annotations

from app_src import Puzzle, PuzzleLoader


class LoadPuzzles:
    @classmethod
    def from_path(cls, file_path: str) -> "LoadPuzzles":
        return cls(file_path)

    def __init__(self, file_path: str):
        self._loader: PuzzleLoader | None = None
        self._last_error: Exception | None = None
        try:
            self._loader = PuzzleLoader(file_path)
        except Exception as error:
            self._last_error = error

    def get_by_name(self, name: str) -> Puzzle | None:
        return self._loader.get_puzzle_by_name(name) if self._loader else None

    def get_by_index(self, index: int) -> Puzzle | None:
        return self._loader.get_puzzle_by_index(index) if self._loader else None

    def get_by_difficulty(self, difficulty: str) -> list[Puzzle]:
        return self._loader.get_puzzles_by_difficulty(difficulty) if self._loader else []

    def get_all(self) -> list[Puzzle]:
        return self._loader.get_all_puzzles() if self._loader else []

    def get_count(self) -> int:
        return self._loader.get_puzzle_count() if self._loader else 0

    def get_error(self) -> Exception | None:
        return self._last_error
