from __future__ import annotations

from .audit import AuditLogger
from .constants import EMPTY_CELL, GRID_SIZE
from .sudoku_solver import SudokuSolver


class SudokuOrchestrator:
    def __init__(self, solver: SudokuSolver, audit_config: dict | None = None):
        self._solver = solver
        self._audit_logger: AuditLogger | None = None
        if audit_config and audit_config.get("enabled"):
            self._audit_logger = AuditLogger(solver.name, solver.orig_grid, audit_config)
            solver.set_audit_logger(self._audit_logger)

    def solve(self) -> str:
        # Already-solved inputs return SOLVED immediately without executing any
        # algorithms (v1.0 edge case; shared Gherkin contract "Stop execution
        # when puzzle is completely solved").
        if self.is_grid_full():
            return "SOLVED"

        is_progressing = True

        while is_progressing:
            changed_this_pass = False
            if self._audit_logger:
                self._audit_logger.start_iteration()

            if self._solver.unit_completion():
                changed_this_pass = True

            for digit in range(1, GRID_SIZE + 1):
                if self._solver.hidden_singles(digit):
                    changed_this_pass = True

            if self._solver.naked_singles():
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
