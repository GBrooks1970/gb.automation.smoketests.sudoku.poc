# DEMOAPP003_CSHARP_SPECFLOW — Screenplay Guide

**Stack:** DEMOAPP003_CSHARP_SPECFLOW (stable legacy identifier)
**Language:** C#
**Screenplay library:** Local lightweight interfaces over Reqnroll
**Last updated:** 2026-07-14

## 1. Actor Setup

`SudokuActors.MakeSolverActor()` creates a fresh `Actor` for every scenario and equips it with `UseSudokuSolver` and `LoadPuzzles`. The Reqnroll `[BeforeScenario]` hook recreates the actor, so Memory is isolated per scenario.

## 2. Abilities

| Ability | Wraps | Purpose |
|---------|-------|---------|
| `UseSudokuSolver` | `SudokuSolver`, `SudokuOrchestrator` | Solver setup, algorithm calls, solve status, audit trail |
| `LoadPuzzles` | `PuzzleLoader` | Puzzle lookup by name, index, and difficulty |

## 3. Tasks

Tasks are static factories returning `ITask`, implemented by `DelegateTask`. Step definitions never instantiate the solver directly; they call tasks such as `InitialiseGrid.Empty()`, `ApplyAlgorithm.HiddenSingles(value)`, and `SolvePuzzle.WithCurrentGrid()`.

## 4. Questions

Questions are static factories returning `IQuestion<T>`, implemented by `DelegateQuestion<T>`. Assertions read observable state through questions such as `SolveStatus.Current()`, `GridCell.At(row, col)`, and `AuditTrailQuestion.Current()`.

## 5. Memory Keys

All Memory keys live in `tests/screenplay/support/MemoryKeys.cs`.

| Constant | String value |
|----------|--------------|
| `SOLVE_RESULT` | `SOLVE_RESULT` |
| `ALGORITHM_PROGRESS` | `ALGORITHM_PROGRESS` |
| `LAST_ERROR` | `LAST_ERROR` |
| `TARGET_CELL` | `TARGET_CELL` |
| `GRID_SNAPSHOT` | `GRID_SNAPSHOT` |
| `VALIDATION_RESULT` | `VALIDATION_RESULT` |

## 6. Adding a Scenario

Update `features-shared/`, propagate the feature body to `tests/features/`, add only stack-local tags in the C# copy, then implement any new Task/Question before adding or extending Reqnroll bindings.

## 7. Step Definition Conventions

Step definitions must stay thin: delegate actions to Tasks and assertions to Questions. Any inability to implement canonical step text must be tracked in `DOCS/.planning/backlog.md`.
