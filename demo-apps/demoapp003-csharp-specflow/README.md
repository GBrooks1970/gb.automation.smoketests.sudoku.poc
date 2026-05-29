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
