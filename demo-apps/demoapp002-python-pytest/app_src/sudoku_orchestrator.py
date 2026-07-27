from __future__ import annotations

from collections.abc import Callable

from .audit import AuditLogger
from .attempt import AttemptCellChange, AttemptCellPosition, AttemptEvent, AttemptObserver, AttemptTechnique
from .constants import EMPTY_CELL, GRID_SIZE
from .sudoku_solver import SudokuSolver


class SudokuOrchestrator:
    def __init__(
        self,
        solver: SudokuSolver,
        audit_config: dict | None = None,
        attempt_observer: AttemptObserver | None = None,
    ):
        self._solver = solver
        self._audit_logger: AuditLogger | None = None
        self._attempt_observer = attempt_observer
        self._attempt_sequence = 0
        if audit_config and audit_config.get("enabled"):
            self._audit_logger = AuditLogger(solver.name, solver.orig_grid, audit_config)
            solver.set_audit_logger(self._audit_logger)

    def solve(self) -> str:
        self._attempt_sequence = 0

        # Already-solved inputs return SOLVED immediately without executing any
        # algorithms (v1.0 edge case; shared Gherkin contract "Stop execution
        # when puzzle is completely solved").
        if self.is_grid_full():
            return "SOLVED"

        is_progressing = True
        iteration = 0

        while is_progressing:
            iteration += 1
            changed_this_pass = False
            if self._audit_logger:
                self._audit_logger.start_iteration()

            if self._run_attempt(iteration, "UnitCompletion", self._solver.unit_completion):
                changed_this_pass = True

            for digit in range(1, GRID_SIZE + 1):
                if self._run_attempt(
                    iteration,
                    "HiddenSingles",
                    lambda digit=digit: self._solver.hidden_singles(digit),
                    parameter=digit,
                ):
                    changed_this_pass = True

            if self._run_attempt(iteration, "NakedSingles", self._solver.naked_singles):
                changed_this_pass = True

            is_progressing = changed_this_pass

        return "SOLVED" if self.is_grid_full() else "STUCK_ON_ADVANCED_LOGIC"

    def is_grid_full(self) -> bool:
        return all(cell != EMPTY_CELL for row in self._solver.grid for cell in row)

    def get_audit_trail(self) -> dict | None:
        if not self._audit_logger:
            return None
        status = "SOLVED" if self.is_grid_full() else "STUCK_ON_ADVANCED_LOGIC"
        return self._audit_logger.get_trail(self._solver.grid, status)

    def _run_attempt(
        self,
        iteration: int,
        technique: AttemptTechnique,
        invoke: Callable[[], bool],
        parameter: int | None = None,
    ) -> bool:
        if self._attempt_observer is None:
            return invoke()

        before = self._solver.get_grid()
        changed = invoke()
        changes = self._diff_grid(before, self._solver.get_grid())
        if changed != bool(changes):
            raise RuntimeError(
                f"{technique} returned changed={changed} but produced {len(changes)} cell changes"
            )

        self._attempt_sequence += 1
        self._attempt_observer(
            AttemptEvent(
                iteration=iteration,
                sequence=self._attempt_sequence,
                technique=technique,
                parameter=parameter,
                changed=changed,
                changes=changes,
            )
        )
        return changed

    @staticmethod
    def _diff_grid(
        before: list[list[int]], after: list[list[int]]
    ) -> tuple[AttemptCellChange, ...]:
        return tuple(
            AttemptCellChange(
                cell=AttemptCellPosition(row=row, col=col),
                old_value=before[row][col],
                new_value=after[row][col],
            )
            for row in range(GRID_SIZE)
            for col in range(GRID_SIZE)
            if before[row][col] != after[row][col]
        )
