from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any


class AuditLogger:
    def __init__(self, puzzle_name: str, initial_grid: list[list[int]], config: dict[str, Any] | None = None):
        self._config = {"enabled": True, "include_grid_snapshots": False, "verbosity_level": "standard"}
        if config:
            self._config.update(config)
        self._events: list[dict[str, Any]] = []
        self._puzzle_name = puzzle_name
        self._initial_grid = deepcopy(initial_grid)
        self._start_time = datetime.now(timezone.utc)
        self._current_iteration = 0
        self._event_id_counter = 0

    def is_enabled(self) -> bool:
        return bool(self._config["enabled"])

    def start_iteration(self) -> None:
        self._current_iteration += 1

    def log_change(
        self,
        algorithm: str,
        cell_changes: list[dict[str, Any]],
        algorithm_parameter: int | None = None,
        grid_snapshot_after: list[list[int]] | None = None,
    ) -> None:
        if not self.is_enabled() or not cell_changes:
            return

        self._event_id_counter += 1
        event: dict[str, Any] = {
            "eventId": self._event_id_counter,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "iteration": self._current_iteration,
            "algorithm": algorithm,
            "cellChanges": deepcopy(cell_changes),
        }
        if algorithm_parameter is not None:
            event["algorithmParameter"] = algorithm_parameter
        if self._config["include_grid_snapshots"] and grid_snapshot_after is not None:
            event["gridSnapshotAfter"] = deepcopy(grid_snapshot_after)
        self._events.append(event)

    def get_change_count(self) -> int:
        return sum(len(event["cellChanges"]) for event in self._events)

    def get_statistics(self) -> dict[str, Any]:
        stats = {
            "changesByAlgorithm": {"unitCompletion": 0, "hiddenSingles": 0, "nakedSingles": 0},
            "iterationsByAlgorithm": {"unitCompletion": 0, "hiddenSingles": 0, "nakedSingles": 0},
            "averageChangesPerIteration": 0,
        }
        for event in self._events:
            key = {
                "UnitCompletion": "unitCompletion",
                "HiddenSingles": "hiddenSingles",
                "NakedSingles": "nakedSingles",
            }[event["algorithm"]]
            stats["changesByAlgorithm"][key] += len(event["cellChanges"])
            stats["iterationsByAlgorithm"][key] += 1

        total = sum(stats["changesByAlgorithm"].values())
        stats["averageChangesPerIteration"] = total / self._current_iteration if self._current_iteration else 0
        return stats

    def get_trail(self, final_grid: list[list[int]], status: str) -> dict[str, Any]:
        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - self._start_time).total_seconds() * 1000)
        return {
            "puzzleName": self._puzzle_name,
            "startTime": self._start_time.isoformat(),
            "endTime": end_time.isoformat(),
            "totalDurationMs": duration_ms,
            "initialGrid": deepcopy(self._initial_grid),
            "finalGrid": deepcopy(final_grid),
            "status": status,
            "totalIterations": self._current_iteration,
            "totalChanges": self.get_change_count(),
            "events": deepcopy(self._events),
            "statistics": self.get_statistics(),
        }
