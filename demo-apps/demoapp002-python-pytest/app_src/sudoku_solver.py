from __future__ import annotations

from copy import deepcopy
from typing import Any

from .audit import AuditLogger
from .constants import BLOCK_SIZE, EMPTY_CELL, GRID_SIZE


class SudokuSolver:
    def __init__(self, name: str, orig_grid: list[list[int]] | None = None):
        self.name = name
        self.orig_grid = deepcopy(orig_grid) if orig_grid is not None else [
            [EMPTY_CELL for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)
        ]
        self.grid = deepcopy(self.orig_grid)
        self._audit_logger: AuditLogger | None = None

    def set_audit_logger(self, logger: AuditLogger) -> None:
        self._audit_logger = logger

    def unit_completion(self) -> bool:
        changed = False
        changes: list[dict[str, Any]] = []

        for row in range(GRID_SIZE):
            if self.grid[row].count(EMPTY_CELL) == 1:
                col = self.grid[row].index(EMPTY_CELL)
                missing = self._find_missing_digit(self.grid[row])
                changes.append({
                    "cell": {"row": row, "col": col},
                    "oldValue": EMPTY_CELL,
                    "newValue": missing,
                    "reason": f"Last empty cell in row {row}",
                })
                self.grid[row][col] = missing
                changed = True

        for col in range(GRID_SIZE):
            column = [self.grid[row][col] for row in range(GRID_SIZE)]
            if column.count(EMPTY_CELL) == 1:
                row = column.index(EMPTY_CELL)
                missing = self._find_missing_digit(column)
                changes.append({
                    "cell": {"row": row, "col": col},
                    "oldValue": EMPTY_CELL,
                    "newValue": missing,
                    "reason": f"Last empty cell in column {col}",
                })
                self.grid[row][col] = missing
                changed = True

        for block_row in range(BLOCK_SIZE):
            for block_col in range(BLOCK_SIZE):
                empty_cells = self._get_block_empty_cells(block_row, block_col)
                if len(empty_cells) == 1:
                    missing = self._find_missing_digit(self._get_block_values(block_row, block_col))
                    cell = empty_cells[0]
                    changes.append({
                        "cell": cell,
                        "oldValue": EMPTY_CELL,
                        "newValue": missing,
                        "reason": f"Last empty cell in block ({block_row},{block_col})",
                    })
                    self.grid[cell["row"]][cell["col"]] = missing
                    changed = True

        if self._audit_logger and self._audit_logger.is_enabled() and changes:
            self._audit_logger.log_change("UnitCompletion", changes)
        return changed

    def hidden_singles(self, target: int) -> bool:
        changed = False
        changes: list[dict[str, Any]] = []

        for row in range(GRID_SIZE):
            if self._is_in_row(target, row):
                continue
            candidates: list[dict[str, int]] = []
            for col in range(GRID_SIZE):
                if self.grid[row][col] != EMPTY_CELL:
                    continue
                block_row = row // BLOCK_SIZE
                block_col = col // BLOCK_SIZE
                if not self._is_in_col(target, col) and not self._is_number_in_block(target, block_row, block_col):
                    candidates.append({"row": row, "col": col})
            if len(candidates) == 1:
                cell = candidates[0]
                changes.append({
                    "cell": cell,
                    "oldValue": EMPTY_CELL,
                    "newValue": target,
                    "reason": f"Only valid location for {target} in row {row}",
                })
                self.grid[cell["row"]][cell["col"]] = target
                changed = True

        for col in range(GRID_SIZE):
            if self._is_in_col(target, col):
                continue
            candidates = []
            for row in range(GRID_SIZE):
                if self.grid[row][col] != EMPTY_CELL:
                    continue
                block_row = row // BLOCK_SIZE
                block_col = col // BLOCK_SIZE
                if not self._is_in_row(target, row) and not self._is_number_in_block(target, block_row, block_col):
                    candidates.append({"row": row, "col": col})
            if len(candidates) == 1:
                cell = candidates[0]
                changes.append({
                    "cell": cell,
                    "oldValue": EMPTY_CELL,
                    "newValue": target,
                    "reason": f"Only valid location for {target} in column {col}",
                })
                self.grid[cell["row"]][cell["col"]] = target
                changed = True

        for block_row in range(BLOCK_SIZE):
            for block_col in range(BLOCK_SIZE):
                if self._is_number_in_block(target, block_row, block_col):
                    continue
                candidates = [
                    cell
                    for cell in self._get_block_empty_cells(block_row, block_col)
                    if not self._is_in_row(target, cell["row"]) and not self._is_in_col(target, cell["col"])
                ]
                if len(candidates) == 1:
                    cell = candidates[0]
                    changes.append({
                        "cell": cell,
                        "oldValue": EMPTY_CELL,
                        "newValue": target,
                        "reason": f"Only valid location for {target} in block ({block_row},{block_col})",
                    })
                    self.grid[cell["row"]][cell["col"]] = target
                    changed = True

        if self._audit_logger and self._audit_logger.is_enabled() and changes:
            self._audit_logger.log_change("HiddenSingles", changes, target)
        return changed

    def naked_singles(self) -> bool:
        changed = False
        changes: list[dict[str, Any]] = []
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                if self.grid[row][col] != EMPTY_CELL:
                    continue
                possible = self._get_cell_candidates(row, col)
                if len(possible) == 1:
                    value = next(iter(possible))
                    changes.append({
                        "cell": {"row": row, "col": col},
                        "oldValue": EMPTY_CELL,
                        "newValue": value,
                        "reason": f"Only candidate remaining in cell [{row},{col}]",
                    })
                    self.grid[row][col] = value
                    changed = True

        if self._audit_logger and self._audit_logger.is_enabled() and changes:
            self._audit_logger.log_change("NakedSingles", changes)
        return changed

    def is_valid_placement(self, row: int, col: int, value: int) -> bool:
        for c in range(GRID_SIZE):
            if c != col and self.grid[row][c] == value:
                return False
        for r in range(GRID_SIZE):
            if r != row and self.grid[r][col] == value:
                return False
        block_row = (row // BLOCK_SIZE) * BLOCK_SIZE
        block_col = (col // BLOCK_SIZE) * BLOCK_SIZE
        for r in range(block_row, block_row + BLOCK_SIZE):
            for c in range(block_col, block_col + BLOCK_SIZE):
                if (r != row or c != col) and self.grid[r][c] == value:
                    return False
        return True

    def no_constraint_violations(self) -> bool:
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                value = self.grid[row][col]
                if value != EMPTY_CELL and not self.is_valid_placement(row, col, value):
                    return False
        return True

    def is_valid_solution(self) -> bool:
        digits = set(range(1, GRID_SIZE + 1))
        for index in range(GRID_SIZE):
            if set(self.grid[index]) != digits:
                return False
            if {self.grid[row][index] for row in range(GRID_SIZE)} != digits:
                return False
        for block_row in range(BLOCK_SIZE):
            for block_col in range(BLOCK_SIZE):
                if set(self._get_block_values(block_row, block_col)) != digits:
                    return False
        return True

    def _is_in_row(self, value: int, row: int) -> bool:
        return value in self.grid[row]

    def _is_in_col(self, value: int, col: int) -> bool:
        return any(row[col] == value for row in self.grid)

    def _is_number_in_block(self, value: int, block_row: int, block_col: int) -> bool:
        start_row = block_row * BLOCK_SIZE
        start_col = block_col * BLOCK_SIZE
        for row in range(start_row, start_row + BLOCK_SIZE):
            for col in range(start_col, start_col + BLOCK_SIZE):
                if self.grid[row][col] == value:
                    return True
        return False

    def _get_block_empty_cells(self, block_row: int, block_col: int) -> list[dict[str, int]]:
        start_row = block_row * BLOCK_SIZE
        start_col = block_col * BLOCK_SIZE
        cells: list[dict[str, int]] = []
        for row in range(start_row, start_row + BLOCK_SIZE):
            for col in range(start_col, start_col + BLOCK_SIZE):
                if self.grid[row][col] == EMPTY_CELL:
                    cells.append({"row": row, "col": col})
        return cells

    def _get_block_values(self, block_row: int, block_col: int) -> list[int]:
        start_row = block_row * BLOCK_SIZE
        start_col = block_col * BLOCK_SIZE
        values: list[int] = []
        for row in range(start_row, start_row + BLOCK_SIZE):
            for col in range(start_col, start_col + BLOCK_SIZE):
                values.append(self.grid[row][col])
        return values

    def _get_cell_candidates(self, row: int, col: int) -> set[int]:
        candidates = set(range(1, GRID_SIZE + 1))
        candidates.difference_update(self.grid[row])
        candidates.difference_update(self.grid[r][col] for r in range(GRID_SIZE))

        block_row = (row // BLOCK_SIZE) * BLOCK_SIZE
        block_col = (col // BLOCK_SIZE) * BLOCK_SIZE
        for r in range(block_row, block_row + BLOCK_SIZE):
            for c in range(block_col, block_col + BLOCK_SIZE):
                candidates.discard(self.grid[r][c])
        candidates.discard(EMPTY_CELL)
        return candidates

    def _find_missing_digit(self, values: list[int]) -> int:
        present = {value for value in values if value != EMPTY_CELL}
        for digit in range(1, GRID_SIZE + 1):
            if digit not in present:
                return digit
        raise ValueError("No missing digit found - invalid sudoku state")
