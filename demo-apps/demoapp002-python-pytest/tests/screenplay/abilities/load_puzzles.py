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
        return self._require_loader().get_puzzle_by_name(name)

    def get_by_index(self, index: int) -> Puzzle | None:
        return self._require_loader().get_puzzle_by_index(index)

    def get_by_difficulty(self, difficulty: str) -> list[Puzzle]:
        return self._require_loader().get_puzzles_by_difficulty(difficulty)

    def get_all(self) -> list[Puzzle]:
        return self._require_loader().get_all_puzzles()

    def get_count(self) -> int:
        return self._require_loader().get_puzzle_count()

    def get_error(self) -> Exception | None:
        return self._last_error

    def _require_loader(self) -> PuzzleLoader:
        if self._last_error is not None:
            raise self._last_error
        if self._loader is None:
            raise RuntimeError("PuzzleLoader is not initialised")
        return self._loader
