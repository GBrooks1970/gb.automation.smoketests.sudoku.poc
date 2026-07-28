# DEMOAPP003: C# + Reqnroll Sudoku Solver

DEMOAPP003 is the C# parity Stack for the shared Sudoku solver Gherkin contract.
The established `DEMOAPP003_CSHARP_SPECFLOW` identifier, directory, and solution filename are
retained as stable legacy integration points; DR-036 records the framework/runtime migration.

## Prerequisites

- .NET SDK 10.0

The test manifest currently pins:

| Package | Version |
|---|---|
| `Reqnroll.NUnit` | `3.3.4` |
| `NUnit` | `4.6.1` |
| `coverlet.collector` | `10.0.1` |

## Commands

```powershell
dotnet restore --locked-mode
dotnet test --no-restore
dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore --collect:"XPlat Code Coverage" --settings tests/component/coverage.runsettings --results-directory .results/component-coverage
./tooling/coverage/Write-CoverageSummary.ps1 -CoverageDirectory .results/component-coverage -MinimumLinePercent 80 -MinimumBranchPercent 80
dotnet run --project tooling/performance/DemoApp003.Performance.csproj --configuration Release
```

## Structure

| Path | Purpose |
|------|---------|
| `app_src/` | C# Sudoku solver, orchestrator, puzzle loader, and audit models |
| `tests/component/` | Distinct NUnit component-test project and selected-scope coverage settings |
| `tests/features/` | Stack-local copy of canonical Gherkin |
| `tests/screenplay/` | Actor, abilities, tasks, questions, fixtures, and Reqnroll bindings |
| `tooling/coverage/` | Cobertura summary and DR-038 line/branch floor enforcement |
| `tooling/performance/` | Reporting-only benchmark runner |
| `docs/` | Stack-level architecture, Screenplay, and QA documentation |

Feature files are owned by `features-shared/`; only stack-local tags belong in `tests/features/`.
The solution test command runs 48 Reqnroll tests plus 24 focused component tests (72 total). The
selected production scope must retain at least 80% line and 80% branch coverage under DR-038.

## Grid Access

`SudokuSolver.GetGrid()` returns a deep-copy snapshot of the working grid (the
v1.0 `getGrid` operation) — prefer it wherever access is read-only. The public
`Grid` property is retained for compatibility (test fixtures use it to compose
grid states), but mutating it directly from outside the solver is
**deprecated**: external mutation bypasses the solving algorithms and the
audit trail.

## Puzzle Validation

`PuzzleLoader` performs the v1.0 §7.1 structure validation (exactly 9 rows,
exactly 9 columns per row, every cell in the integer range 0–9). The **integer
type check** is enforced by **typed deserialization** rather than an explicit
per-cell check: `Puzzle.Grid` is declared `int[][]`, so `System.Text.Json`
rejects any non-integer JSON token (for example `1.5`, `"x"`, or `true`) while
deserialising `puzzles.json`, before `ValidatePuzzles()` runs the range check on
the already-typed integers.

This is a **mechanism difference, not a responsibility difference** from
DEMOAPP001 (TypeScript, explicit `Number.isInteger`) and DEMOAPP002 (Python,
exact `type(cell) is int`): in C# a malformed numeric shape surfaces as a
`System.Text.Json.JsonException` at load time rather than as the v1.0 §7.1
`has invalid value at [r][c]: v` message. The loader's responsibility — reject
non-integer and out-of-range cells before solving — is identical across all
three stacks. The cross-cutting layer responsibilities are authoritative in
[`DOCS/.architecture/validation-boundaries.md`](../../DOCS/.architecture/validation-boundaries.md)
§2.1.

## License

This C# stack is part of the repository's [ISC-licensed](../../LICENSE) original project material.
NuGet dependencies retain their respective licence terms.
