from __future__ import annotations

from pathlib import Path

from tests.screenplay.abilities import LoadPuzzles, UseSudokuSolver
from tests.screenplay.support.actor import Actor

SOLVER_ACTOR = "Solver"
PUZZLES_PATH = Path(__file__).resolve().parents[3] / "puzzles.json"


def make_solver_actor() -> Actor:
    return Actor.named(SOLVER_ACTOR).who_can(
        UseSudokuSolver(),
        LoadPuzzles.from_path(str(PUZZLES_PATH)),
    )
