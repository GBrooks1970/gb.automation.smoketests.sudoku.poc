# DEMOAPP003: C# + SpecFlow Sudoku Solver

DEMOAPP003 is the C# parity Stack for the shared Sudoku solver Gherkin contract.

## Prerequisites

- .NET SDK 8.0+

## Commands

```powershell
dotnet restore
dotnet test
dotnet run --project tooling/performance/DemoApp003.Performance.csproj --configuration Release
```

## Structure

| Path | Purpose |
|------|---------|
| `app_src/` | C# Sudoku solver, orchestrator, puzzle loader, and audit models |
| `tests/features/` | Stack-local copy of canonical Gherkin |
| `tests/screenplay/` | Actor, abilities, tasks, questions, fixtures, and SpecFlow bindings |
| `tooling/performance/` | Reporting-only benchmark runner |
| `docs/` | Stack-level architecture, Screenplay, and QA documentation |

Feature files are owned by `features-shared/`; only stack-local tags belong in `tests/features/`.

## Grid Access

`SudokuSolver.GetGrid()` returns a deep-copy snapshot of the working grid (the
v1.0 `getGrid` operation) — prefer it wherever access is read-only. The public
`Grid` property is retained for compatibility (test fixtures use it to compose
grid states), but mutating it directly from outside the solver is
**deprecated**: external mutation bypasses the solving algorithms and the
audit trail.
