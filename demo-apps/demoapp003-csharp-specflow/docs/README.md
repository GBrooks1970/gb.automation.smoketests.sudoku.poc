# DEMOAPP003_CSHARP_SPECFLOW — Stack README

**Language:** C# on .NET 10 LTS
**Framework:** Reqnroll 3.3 + NUnit 4
**Surface type:** @util
**Last updated:** 2026-07-28

`DEMOAPP003_CSHARP_SPECFLOW` and its directory remain stable legacy identifiers; the active BDD
runtime is Reqnroll (DR-036).

## Prerequisites

- .NET SDK 10.0

## Setup

```powershell
cd demo-apps/demoapp003-csharp-specflow
dotnet restore --locked-mode
```

## Running Tests

```powershell
dotnet test --no-restore
```

Expected output: 72 tests passing across the solution — 48 generated Reqnroll tests plus 24
focused component tests in a separate NUnit project.

## Key Commands

| Command | Description |
|---------|-------------|
| `dotnet restore --locked-mode` | Restore NuGet packages from committed lockfiles |
| `dotnet test --no-restore` | Run the 48-test Reqnroll lane and 24-test component lane |
| `dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore` | Run only the focused component lane |
| `dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore --collect:"XPlat Code Coverage" --settings tests/component/coverage.runsettings --results-directory .results/component-coverage` | Collect the report-only selected-module coverage baseline |
| `./tooling/coverage/Write-CoverageSummary.ps1 -CoverageDirectory .results/component-coverage` | Print line and branch evidence from the latest Cobertura report |
| `dotnet run --project tooling/performance/DemoApp003.Performance.csproj --configuration Release` | Run reporting-only benchmarks |

## Deeper Reading

- `architecture.md` — stack architecture and dependencies
- `component-test-coverage-baseline.md` — focused test inventory, first baseline and exclusions
- `screenplay-guide.md` — C# Screenplay conventions
- `qa-strategy.md` — test scope and parity expectations
