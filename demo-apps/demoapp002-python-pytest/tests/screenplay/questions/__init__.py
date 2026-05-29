from __future__ import annotations

from copy import deepcopy
from typing import Any, Callable

from app_src import SudokuSolver
from app_src.constants import EMPTY_CELL, GRID_SIZE
from tests.screenplay.abilities import LoadPuzzles, UseSudokuSolver
from tests.screenplay.support.actor import Actor
from tests.screenplay.support.memory_keys import (
    ALGORITHM_PROGRESS,
    GRID_SNAPSHOT,
    LAST_ERROR,
    SOLVE_RESULT,
    TARGET_CELL,
    VALIDATION_RESULT,
)


class Question:
    def __init__(self, resolver: Callable[[Actor], Any]):
        self._resolver = resolver

    def answered_by(self, actor: Actor) -> Any:
        return self._resolver(actor)


class AlgorithmMadeProgress:
    @staticmethod
    def after_last_call() -> Question:
        return Question(lambda actor: actor.recall(ALGORITHM_PROGRESS, False))


class SolveStatus:
    @staticmethod
    def current() -> Question:
        return Question(lambda actor: actor.recall(SOLVE_RESULT, ""))


class PlacementValidity:
    @staticmethod
    def of_last_attempt() -> Question:
        return Question(lambda actor: actor.recall(VALIDATION_RESULT, ""))


class ErrorThrown:
    @staticmethod
    def last() -> Question:
        return Question(lambda actor: actor.recall(LAST_ERROR))


class GridCell:
    @staticmethod
    def at(row: int, col: int) -> Question:
        return Question(lambda actor: actor.ability_to(UseSudokuSolver).get_solver().grid[row][col])

    @staticmethod
    def contains_value(value: int) -> Question:
        return Question(lambda actor: any(value in row for row in actor.ability_to(UseSudokuSolver).get_solver().grid))

    @staticmethod
    def all_filled() -> Question:
        return Question(
            lambda actor: all(
                cell != EMPTY_CELL for row in actor.ability_to(UseSudokuSolver).get_solver().grid for cell in row
            )
        )

    @staticmethod
    def in_row(row: int, value: int) -> Question:
        return Question(lambda actor: value in actor.ability_to(UseSudokuSolver).get_solver().grid[row])

    @staticmethod
    def in_column(col: int, value: int) -> Question:
        return Question(lambda actor: any(row[col] == value for row in actor.ability_to(UseSudokuSolver).get_solver().grid))

    @staticmethod
    def matches_snapshot() -> Question:
        return Question(
            lambda actor: actor.ability_to(UseSudokuSolver).get_solver().grid
            == actor.ability_to(UseSudokuSolver).grid_snapshot
        )

    @staticmethod
    def orig_matches_snapshot() -> Question:
        return Question(
            lambda actor: actor.ability_to(UseSudokuSolver).get_solver().orig_grid
            == actor.ability_to(UseSudokuSolver).grid_snapshot
        )

    @staticmethod
    def working_differs_from_orig() -> Question:
        return Question(
            lambda actor: actor.ability_to(UseSudokuSolver).get_solver().grid
            != actor.ability_to(UseSudokuSolver).get_solver().orig_grid
        )

    @staticmethod
    def is_valid_solution() -> Question:
        return Question(lambda actor: actor.ability_to(UseSudokuSolver).get_solver().is_valid_solution())

    @staticmethod
    def has_empty_cells() -> Question:
        return Question(
            lambda actor: any(
                cell == EMPTY_CELL for row in actor.ability_to(UseSudokuSolver).get_solver().grid for cell in row
            )
        )

    @staticmethod
    def is_grid_full() -> Question:
        return Question(lambda actor: actor.ability_to(UseSudokuSolver).is_grid_full())

    @staticmethod
    def no_constraint_violations() -> Question:
        return Question(lambda actor: actor.ability_to(UseSudokuSolver).get_solver().no_constraint_violations())

    @staticmethod
    def is_deep_copy() -> Question:
        def resolve(actor: Actor) -> bool:
            ability = actor.ability_to(UseSudokuSolver)
            grid = ability.get_solver().grid
            snapshot = ability.grid_snapshot
            return grid is not snapshot and grid == snapshot

        return Question(resolve)


class GridSnapshot:
    @staticmethod
    def current() -> Question:
        return Question(lambda actor: deepcopy(actor.recall(GRID_SNAPSHOT, [])))


class TargetCell:
    @staticmethod
    def current() -> Question:
        return Question(lambda actor: actor.recall(TARGET_CELL, {"row": 0, "col": 0}))


class CurrentSolver:
    @staticmethod
    def name() -> Question:
        return Question(lambda actor: actor.ability_to(UseSudokuSolver).get_solver().name)

    @staticmethod
    def has_valid_grid() -> Question:
        def resolve(actor: Actor) -> bool:
            grid = actor.ability_to(UseSudokuSolver).get_solver().orig_grid
            return len(grid) == GRID_SIZE and all(len(row) == GRID_SIZE for row in grid)

        return Question(resolve)


class LoadedPuzzleCount:
    @staticmethod
    def current() -> Question:
        return Question(lambda actor: actor.ability_to(LoadPuzzles).get_count())


class LoadedPuzzles:
    @staticmethod
    def all() -> Question:
        return Question(lambda actor: actor.ability_to(LoadPuzzles).get_all())


class MultipleSolvers:
    @staticmethod
    def count() -> Question:
        return Question(lambda actor: len(actor.ability_to(UseSudokuSolver).multiple_solvers))

    @staticmethod
    def are_independent() -> Question:
        def resolve(actor: Actor) -> bool:
            solvers = actor.ability_to(UseSudokuSolver).multiple_solvers
            return all(solvers[index].grid is not solvers[index + 1].grid for index in range(len(solvers) - 1))

        return Question(resolve)

    @staticmethod
    def isolation_verified() -> Question:
        def resolve(actor: Actor) -> bool:
            ability = actor.ability_to(UseSudokuSolver)
            solvers = ability.multiple_solvers
            if len(solvers) < 3:
                return False

            snap1 = deepcopy(solvers[1].grid)
            snap2 = deepcopy(solvers[2].grid)

            ability.initialise(solvers[0].name, solvers[0].orig_grid)
            ability.solve_puzzle()

            actor.remember(ALGORITHM_PROGRESS, False)
            return solvers[1].grid == snap1 and solvers[2].grid == snap2

        return Question(resolve)


class AuditTrail:
    @staticmethod
    def current() -> Question:
        return Question(lambda actor: actor.ability_to(UseSudokuSolver).last_audit_trail)
