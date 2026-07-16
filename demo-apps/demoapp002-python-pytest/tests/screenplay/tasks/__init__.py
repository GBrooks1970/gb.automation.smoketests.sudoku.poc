from __future__ import annotations

from copy import deepcopy
from typing import Callable

from app_src import SudokuSolver
from app_src.constants import EMPTY_CELL, GRID_SIZE
from tests.screenplay.abilities import LoadPuzzles, UseSudokuSolver
from tests.screenplay.fixtures import grid_fixtures
from tests.screenplay.support.actor import Actor
from tests.screenplay.support.memory_keys import (
    ALGORITHM_PROGRESS,
    GRID_SNAPSHOT,
    LAST_ERROR,
    SOLVE_RESULT,
    TARGET_CELL,
    VALIDATION_RESULT,
)


class Task:
    def __init__(self, action: Callable[[Actor], None]):
        self._action = action

    def perform_as(self, actor: Actor) -> None:
        self._action(actor)


class InitialiseGrid:
    @staticmethod
    def empty() -> Task:
        return Task(lambda actor: actor.ability_to(UseSudokuSolver).initialise("test"))

    @staticmethod
    def with_row_values(row: int, values: list[int]) -> Task:
        def action(actor: Actor) -> None:
            grid = [[EMPTY_CELL for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
            grid[row] = list(values)
            actor.ability_to(UseSudokuSolver).initialise("test", grid)

        return Task(action)

    @staticmethod
    def from_puzzle_named(name: str) -> Task:
        def action(actor: Actor) -> None:
            puzzle = actor.ability_to(LoadPuzzles).get_by_name(name)
            if puzzle is None:
                raise RuntimeError(f'Puzzle not found: "{name}"')
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise(puzzle.name, puzzle.grid)
            snapshot = deepcopy(ability.get_solver().orig_grid)
            ability.store_snapshot(snapshot)
            actor.remember(GRID_SNAPSHOT, snapshot)

        return Task(action)

    @staticmethod
    def with_grid(name: str, grid: list[list[int]]) -> Task:
        return Task(lambda actor: actor.ability_to(UseSudokuSolver).initialise(name, grid))

    @staticmethod
    def with_complete_grid(grid: list[list[int]]) -> Task:
        return Task(lambda actor: actor.ability_to(UseSudokuSolver).initialise("complete", grid))

    @staticmethod
    def with_duplicate_in_row(row_index: int, value: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise("duplicate")
            grid_fixtures.setup_with_duplicate_in_row(ability.get_solver(), row_index, value)

        return Task(action)


class ApplyAlgorithm:
    @staticmethod
    def unit_completion() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.apply_unit_completion()
            actor.remember(ALGORITHM_PROGRESS, ability.algorithm_made_progress)

        return Task(action)

    @staticmethod
    def hidden_singles(for_digit: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.apply_hidden_singles(for_digit)
            actor.remember(ALGORITHM_PROGRESS, ability.algorithm_made_progress)

        return Task(action)

    @staticmethod
    def naked_singles() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.apply_naked_singles()
            actor.remember(ALGORITHM_PROGRESS, ability.algorithm_made_progress)

        return Task(action)


class SetupGridState:
    @staticmethod
    def almost_complete_column(col: int, missing_digit: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_almost_complete_column(ability.get_solver(), col, missing_digit)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def almost_complete_block(block_row: int, block_col: int, missing_digit: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_almost_complete_block(ability.get_solver(), block_row, block_col, missing_digit)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def with_multiple_empties() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_multiple_empties(ability.get_solver())
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def row_missing_digit(row_index: int, target: int) -> Task:
        return Task(
            lambda actor: grid_fixtures.setup_row_missing_digit(
                actor.ability_to(UseSudokuSolver).get_solver(), row_index, target
            )
        )

    @staticmethod
    def row_column_constraints(count: int, row_index: int, target: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_row_column_constraints(ability.get_solver(), count, row_index, target)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def column_missing_digit(col_index: int, target: int) -> Task:
        return Task(
            lambda actor: grid_fixtures.setup_column_missing_digit(
                actor.ability_to(UseSudokuSolver).get_solver(), col_index, target
            )
        )

    @staticmethod
    def column_row_constraints(count: int, col_index: int, target: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_column_row_constraints(ability.get_solver(), count, col_index, target)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def block_four_empties() -> Task:
        return Task(
            lambda actor: grid_fixtures.setup_block_four_empties(actor.ability_to(UseSudokuSolver).get_solver())
        )

    @staticmethod
    def hidden_single_in_block(target: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_hidden_single_in_block(ability.get_solver(), target)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def digit_in_row(row_index: int, digit: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.setup_digit_in_row(ability.get_solver(), row_index, digit)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def with_multiple_candidates() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise("test")
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def target_cell(row: int, col: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            grid_fixtures.clear_cell(ability.get_solver(), row, col)
            ability.set_target_cell(row, col)
            actor.remember(TARGET_CELL, {"row": row, "col": col})

        return Task(action)

    @staticmethod
    def values_in_row(values: list[int]) -> Task:
        def action(actor: Actor) -> None:
            target = actor.recall(TARGET_CELL)
            grid_fixtures.add_values_to_row(
                actor.ability_to(UseSudokuSolver).get_solver(), target["row"], target["col"], values
            )

        return Task(action)

    @staticmethod
    def values_in_column(values: list[int]) -> Task:
        def action(actor: Actor) -> None:
            target = actor.recall(TARGET_CELL)
            grid_fixtures.add_values_to_column(
                actor.ability_to(UseSudokuSolver).get_solver(), target["col"], target["row"], values
            )

        return Task(action)

    @staticmethod
    def values_in_block(values: list[int]) -> Task:
        def action(actor: Actor) -> None:
            target = actor.recall(TARGET_CELL)
            grid_fixtures.add_values_to_block(
                actor.ability_to(UseSudokuSolver).get_solver(),
                target["row"],
                target["col"],
                target["row"],
                target["col"],
                values,
            )

        return Task(action)

    @staticmethod
    def three_candidates() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise("test")
            grid_fixtures.setup_three_candidates(ability.get_solver())
            ability.take_snapshot()
            ability.set_target_cell(0, 0)
            actor.remember(TARGET_CELL, {"row": 0, "col": 0})

        return Task(action)

    @staticmethod
    def three_naked_singles() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise("test")
            grid_fixtures.setup_three_naked_singles(ability.get_solver())
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def named(grid_state: str) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise("test")
            grid_fixtures.setup_named_grid_state(ability.get_solver(), grid_state)
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def from_specific_grid(grid: list[list[int]]) -> Task:
        def action(actor: Actor) -> None:
            actor.ability_to(UseSudokuSolver).store_snapshot(grid)
            actor.remember(GRID_SNAPSHOT, deepcopy(grid))

        return Task(action)

    @staticmethod
    def multiple_solvers(count: int) -> Task:
        def action(actor: Actor) -> None:
            puzzles = actor.ability_to(LoadPuzzles).get_all()
            actor.ability_to(UseSudokuSolver).set_multiple_solvers(
                grid_fixtures.create_solvers_from_puzzles(count, puzzles)
            )

        return Task(action)

    @staticmethod
    def no_progress() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.initialise("stuck")
            ability.take_snapshot()

        return Task(action)

    @staticmethod
    def run_all_algorithms_individually() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.take_snapshot()
            ability.apply_unit_completion()
            for digit in range(1, GRID_SIZE + 1):
                ability.apply_hidden_singles(digit)
            ability.apply_naked_singles()

        return Task(action)


class SetTargetCell:
    @staticmethod
    def at(row: int, col: int) -> Task:
        def action(actor: Actor) -> None:
            actor.ability_to(UseSudokuSolver).set_target_cell(row, col)
            actor.remember(TARGET_CELL, {"row": row, "col": col})

        return Task(action)


class AttemptPlacement:
    @staticmethod
    def of_value(value: int) -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.set_target_value(value)
            target = ability.target_cell
            ability.validate_and_store(target["row"], target["col"], value)
            actor.remember(VALIDATION_RESULT, ability.validation_result)

        return Task(action)


class LoadPuzzleByName:
    @staticmethod
    def and_initialise(name: str) -> Task:
        def action(actor: Actor) -> None:
            puzzle = actor.ability_to(LoadPuzzles).get_by_name(name)
            if puzzle is None:
                raise RuntimeError(f'Puzzle not found: "{name}"')
            actor.ability_to(UseSudokuSolver).initialise(puzzle.name, puzzle.grid)

        return Task(action)

    @staticmethod
    def and_initialise_or_default(name: str) -> Task:
        def action(actor: Actor) -> None:
            puzzle = actor.ability_to(LoadPuzzles).get_by_name(name)
            ability = actor.ability_to(UseSudokuSolver)
            if puzzle is None:
                ability.initialise("notfound")
            else:
                ability.initialise(puzzle.name, puzzle.grid)

        return Task(action)


class LoadPuzzleByIndex:
    @staticmethod
    def and_initialise(index: int) -> Task:
        def action(actor: Actor) -> None:
            puzzle = actor.ability_to(LoadPuzzles).get_by_index(index)
            ability = actor.ability_to(UseSudokuSolver)
            if puzzle is None:
                ability.initialise("notfound")
            else:
                ability.initialise(puzzle.name, puzzle.grid)

        return Task(action)


class LoadPuzzlesByDifficulty:
    @staticmethod
    def and_store(difficulty: str) -> Task:
        def action(actor: Actor) -> None:
            puzzles = actor.ability_to(LoadPuzzles).get_by_difficulty(difficulty)
            actor.ability_to(UseSudokuSolver).set_multiple_solvers(
                grid_fixtures.create_solvers_from_puzzles(len(puzzles), puzzles)
            )

        return Task(action)


class SolvePuzzle:
    @staticmethod
    def with_current_grid() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.solve_puzzle()
            actor.remember(SOLVE_RESULT, ability.result)

        return Task(action)

    @staticmethod
    def with_current_grid_and_audit() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.solve_puzzle_with_audit()
            actor.remember(SOLVE_RESULT, ability.result)

        return Task(action)

    @staticmethod
    def with_current_grid_tracking_order() -> Task:
        """SUD-20 / BACKLOG-051: same solve, but always captures the audit event sequence so
        orchestration Then-steps can assert real algorithm ordering / no-execution counts."""

        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.solve_puzzle_tracking_order()
            actor.remember(SOLVE_RESULT, ability.result)

        return Task(action)


class EnableAuditLogging:
    @staticmethod
    def for_current_solver() -> Task:
        return Task(lambda actor: actor.ability_to(UseSudokuSolver).enable_audit())


class SimulateError:
    @staticmethod
    def for_invalid_row_count(rows: int) -> Task:
        def action(actor: Actor) -> None:
            error = ValueError(f'Puzzle "test" (index 0) must have exactly 9 rows')
            actor.ability_to(UseSudokuSolver).set_solver_error(error)
            actor.remember(LAST_ERROR, error)

        return Task(action)

    @staticmethod
    def for_invalid_cell_value(value: int) -> Task:
        def action(actor: Actor) -> None:
            error = ValueError(f'Puzzle "Bad" has invalid value at [0][0]: {value}')
            actor.ability_to(UseSudokuSolver).set_solver_error(error)
            actor.remember(LAST_ERROR, error)

        return Task(action)

    @staticmethod
    def for_missing_file() -> Task:
        def action(actor: Actor) -> None:
            error = actor.ability_to(LoadPuzzles).get_error() or FileNotFoundError("Puzzle file not found")
            actor.ability_to(UseSudokuSolver).set_solver_error(error)
            actor.remember(LAST_ERROR, error)

        return Task(action)


class CheckAlgorithmProgress:
    @staticmethod
    def unit_completion_on_snapshot() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.reinitialise_from_snapshot()
            ability.apply_unit_completion()
            actor.remember(ALGORITHM_PROGRESS, ability.algorithm_made_progress)

        return Task(action)

    @staticmethod
    def naked_singles_on_snapshot() -> Task:
        def action(actor: Actor) -> None:
            ability = actor.ability_to(UseSudokuSolver)
            ability.reinitialise_from_snapshot()
            ability.apply_naked_singles()
            actor.remember(ALGORITHM_PROGRESS, ability.algorithm_made_progress)

        return Task(action)

    @staticmethod
    def reinit_from_snapshot() -> Task:
        return Task(lambda actor: actor.ability_to(UseSudokuSolver).reinitialise_from_snapshot())
