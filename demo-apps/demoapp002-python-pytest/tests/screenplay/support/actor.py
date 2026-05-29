from __future__ import annotations

from typing import Any, TypeVar

AbilityT = TypeVar("AbilityT")


class Actor:
    def __init__(self, name: str):
        self.name = name
        self._abilities: dict[type, object] = {}
        self._memory: dict[str, Any] = {}

    @classmethod
    def named(cls, name: str) -> "Actor":
        return cls(name)

    def who_can(self, *abilities: object) -> "Actor":
        for ability in abilities:
            self._abilities[type(ability)] = ability
        return self

    def ability_to(self, ability_type: type[AbilityT]) -> AbilityT:
        ability = self._abilities.get(ability_type)
        if ability is None:
            raise RuntimeError(f"{self.name} does not have ability {ability_type.__name__}")
        return ability

    def attempts_to(self, *tasks: object) -> None:
        for task in tasks:
            task.perform_as(self)

    def answer(self, question: object) -> Any:
        return question.answered_by(self)

    def remember(self, key: str, value: Any) -> None:
        self._memory[key] = value

    def recall(self, key: str, default: Any = None) -> Any:
        return self._memory.get(key, default)
