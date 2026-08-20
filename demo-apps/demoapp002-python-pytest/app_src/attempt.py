from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Literal

AttemptTechnique = Literal[
    "UnitCompletion", "HiddenSingles", "NakedSingles", "NakedPairs", "XWing"
]
AttemptUnit = Literal["row", "column", "box"]


@dataclass(frozen=True)
class AttemptCellPosition:
    row: int
    col: int


@dataclass(frozen=True)
class AttemptCellChange:
    cell: AttemptCellPosition
    old_value: int
    new_value: int
    reason: str | None = None


@dataclass(frozen=True)
class AttemptEvent:
    """Immutable, deterministic evidence for one orchestration invocation."""

    iteration: int
    sequence: int
    technique: AttemptTechnique
    changed: bool
    changes: tuple[AttemptCellChange, ...]
    parameter: int | None = None
    unit: AttemptUnit | None = None
    index: int | None = None


AttemptObserver = Callable[[AttemptEvent], None]
