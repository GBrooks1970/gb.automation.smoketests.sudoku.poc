# DEMOAPP003 Component-Test Coverage Baseline

**Work item:** SUD-26 / BACKLOG-065

**Captured:** 2026-07-28

**Runtime:** .NET SDK 10.0.302; coverlet.collector 10.0.1

**Status:** Baseline retained; SUD-28 enforces 80% lines / 80% branches

## Purpose

This is the first lower-level C# evidence layer beneath the canonical Reqnroll suite. It targets
production seams where direct inputs and outputs give more mutation-sensitive evidence than
repeating the user-facing Gherkin. The canonical 48-test Reqnroll suite remains the cross-Stack
behaviour contract; these tests do not replace it.

## Test inventory

| Production layer | Focused evidence | Test file |
|---|---|---|
| Puzzle loading | Valid `0`/`9` boundaries and query paths; missing file; row/column shape; typed non-integer and out-of-range cells | `tests/component/PuzzleLoaderContractTests.cs` |
| Solver techniques | One minimal grid each for Unit Completion, Hidden Singles and Naked Singles | `tests/component/SolverTechniqueContractTests.cs` |
| Orchestration | SUD-22 attempt order/immutability, fixpoint/no-progress evidence and early-complete exit | `tests/component/OrchestrationAttemptContractTests.cs` |
| Validation mapping | Valid placement, row/column/block conflicts, clean/duplicate constraint states and complete/invalid solution results | `tests/component/SudokuValidationContractTests.cs` |

The C# Stack has no API or service surface, so an HTTP/service mapping lane is not applicable.
Direct `SudokuSolver` validation tests cover the equivalent in-process contract.

The Stack-local commands are:

```powershell
dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore
dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore --collect:"XPlat Code Coverage" --settings tests/component/coverage.runsettings --results-directory .results/component-coverage
./tooling/coverage/Write-CoverageSummary.ps1 -CoverageDirectory .results/component-coverage -MinimumLinePercent 80 -MinimumBranchPercent 80
```

The default `dotnet test --no-restore` command retains both the 24-test component lane and the
48-test Reqnroll lane. CI collects and checks coverage as a blocking coverage-floor step before
running Reqnroll separately.

## Baseline

coverlet collected branch and line data from 24 passing component tests. The scope is limited to
the three production types named by SUD-26:

| Type | Lines covered | Line coverage | Branches covered | Branch coverage |
|---|---:|---:|---:|---:|
| `PuzzleLoader` (including its private collection DTO) | 64 / 65 | 98.46% | 29 / 32 | 90.63% |
| `SudokuOrchestrator` | 68 / 90 | 75.56% | 23 / 34 | 67.65% |
| `SudokuSolver` | 256 / 296 | 86.49% | 128 / 146 | 87.67% |
| **Selected-type total** | **388 / 451** | **86.03%** | **180 / 212** | **84.91%** |

These numbers remain the starting observation, not a quality target. SUD-28 reviewed the selected
scope and adopted floors of 80% lines and 80% branches. The floors sit below the measured baseline
and are enforced by the committed Cobertura summary helper. See
`DOCS/.analysis/coverage-and-mutation-policy-20260728.md` and DR-038.

## Exclusions and interpretation

- Reqnroll and Screenplay bindings remain covered by the BDD/parity gates and are not counted as
  production component coverage.
- Models, constants, audit helpers and attempt-event value types are exercised through the selected
  production types but are not independent SUD-26 coverage targets.
- The C# Stack exposes no API, service, UI or CLI surface; those mapping layers are therefore not
  omitted test obligations for this Stack.
- Puzzle catalogue data, generated output, performance tooling and third-party code are outside
  this focused baseline.
- Coverage below either floor fails the helper. Cobertura's uncovered lines and partial branches
  remain available so future work improves meaningful paths instead of hiding them through filters.

## Reproduction

From `demo-apps/demoapp003-csharp-specflow/` under the supported .NET 10 runtime:

```powershell
dotnet restore --locked-mode
dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore --collect:"XPlat Code Coverage" --settings tests/component/coverage.runsettings --results-directory .results/component-coverage
./tooling/coverage/Write-CoverageSummary.ps1 -CoverageDirectory .results/component-coverage -MinimumLinePercent 80 -MinimumBranchPercent 80
```

`coverage.runsettings` retains the SUD-26 include filters. The summary helper enforces the line and
branch floors supplied explicitly by CI and the reproduction command.
