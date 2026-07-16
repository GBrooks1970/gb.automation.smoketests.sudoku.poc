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

        # Orchestration-ordering instrumentation (SUD-20 / BACKLOG-051): a solve run that always
        # captures the audit event sequence so orchestration step definitions can assert real
        # algorithm ordering and no-execution counts instead of inferring them from the overall
        # solve status. Deliberately separate from `_last_audit_trail` / `audit_enabled`, which
        # govern the opt-in audit trail feature and must stay unaffected — the "Solver without
        # audit logging produces no trail" scenario asserts `last_audit_trail` is `None` after a
        # plain solve.
        self._last_ordering_events: list[dict] = []
        self._last_ordering_iterations = 0

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

    def solve_puzzle_tracking_order(self) -> None:
        """Runs the full solving loop with audit instrumentation always on, capturing the raw
        event sequence and iteration count for algorithm-ordering assertions (SUD-20 /
        BACKLOG-051). Behaviour-neutral: SudokuSolver's algorithms only conditionally *log* to
        the audit logger, they never branch on whether one is attached, so the returned status
        and final grid are identical to a plain solve_puzzle() call."""
        orchestrator = SudokuOrchestrator(self.get_solver(), {"enabled": True})
        self._solve_result = orchestrator.solve()
        trail = orchestrator.get_audit_trail()
        self._last_ordering_events = trail["events"] if trail else []
        self._last_ordering_iterations = trail["totalIterations"] if trail else 0

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

    @property
    def last_ordering_events(self) -> list[dict]:
        return self._last_ordering_events

    @property
    def last_ordering_iterations(self) -> int:
        return self._last_ordering_iterations
