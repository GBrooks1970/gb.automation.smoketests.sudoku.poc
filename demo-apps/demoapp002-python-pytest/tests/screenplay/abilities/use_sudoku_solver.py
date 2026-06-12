from __future__ import annotations

from copy import deepcopy

from app_src import SudokuOrchestrator, SudokuSolver


class UseSudokuSolver:
    def __init__(self):
        self._solver: SudokuSolver | None = None
        self._last_algorithm_changed = False
        self._solve_result = ""
        self._target_cell = {"row": 0, "col": 0}
        self._target_value = 0
        self._grid_snapshot: list[list[int]] = []
        self._validation_result = ""
        self._multiple_solvers: list[SudokuSolver] = []
        self._solver_error: Exception | None = None
        self._audit_enabled = False
        self._last_audit_trail: dict | None = None

    def initialise(self, name: str, grid: list[list[int]] | None = None) -> None:
        self._solver = SudokuSolver(name, grid)
        self._last_algorithm_changed = False
        self._solve_result = ""
        self._solver_error = None

    def get_solver(self) -> SudokuSolver:
        if self._solver is None:
            raise RuntimeError("Solver not initialised - call InitialiseGrid first")
        return self._solver

    def apply_unit_completion(self) -> None:
        self._last_algorithm_changed = self.get_solver().unit_completion()

    def apply_hidden_singles(self, target: int) -> None:
        self._last_algorithm_changed = self.get_solver().hidden_singles(target)

    def apply_naked_singles(self) -> None:
        self._last_algorithm_changed = self.get_solver().naked_singles()

    def solve_puzzle(self) -> None:
        orchestrator = SudokuOrchestrator(self.get_solver())
        self._solve_result = orchestrator.solve()
        self._last_audit_trail = None

    def solve_puzzle_with_audit(self) -> None:
        orchestrator = SudokuOrchestrator(self.get_solver(), {"enabled": True})
        self._solve_result = orchestrator.solve()
        self._last_audit_trail = orchestrator.get_audit_trail()

    def enable_audit(self) -> None:
        self._audit_enabled = True

    def is_grid_full(self) -> bool:
        return SudokuOrchestrator(self.get_solver()).is_grid_full()

    def set_target_cell(self, row: int, col: int) -> None:
        self._target_cell = {"row": row, "col": col}

    def set_target_value(self, value: int) -> None:
        self._target_value = value

    def take_snapshot(self) -> None:
        self._grid_snapshot = self.get_solver().get_grid()

    def store_snapshot(self, grid: list[list[int]]) -> None:
        self._grid_snapshot = deepcopy(grid)

    def reinitialise_from_snapshot(self) -> None:
        self.initialise("check", self._grid_snapshot)

    def validate_and_store(self, row: int, col: int, value: int) -> None:
        self._validation_result = "VALID" if self.get_solver().is_valid_placement(row, col, value) else "INVALID"

    def set_multiple_solvers(self, solvers: list[SudokuSolver]) -> None:
        self._multiple_solvers = solvers

    def set_solver_error(self, error: Exception) -> None:
        self._solver_error = error

    @property
    def algorithm_made_progress(self) -> bool:
        return self._last_algorithm_changed

    @property
    def result(self) -> str:
        return self._solve_result

    @property
    def target_cell(self) -> dict[str, int]:
        return self._target_cell

    @property
    def target_value(self) -> int:
        return self._target_value

    @property
    def grid_snapshot(self) -> list[list[int]]:
        return self._grid_snapshot

    @property
    def validation_result(self) -> str:
        return self._validation_result

    @property
    def multiple_solvers(self) -> list[SudokuSolver]:
        return self._multiple_solvers

    @property
    def solver_error(self) -> Exception | None:
        return self._solver_error

    @property
    def audit_enabled(self) -> bool:
        return self._audit_enabled

    @property
    def last_audit_trail(self) -> dict | None:
        return self._last_audit_trail
