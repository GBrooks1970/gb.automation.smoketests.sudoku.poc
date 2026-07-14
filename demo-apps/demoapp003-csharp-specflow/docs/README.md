# DEMOAPP003_CSHARP_SPECFLOW — Stack README

**Language:** C# on .NET 10 LTS
**Framework:** Reqnroll 3.3 + NUnit 4
**Surface type:** @util
**Last updated:** 2026-07-14

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

Expected output: 46 scenarios passing through generated Reqnroll/NUnit tests.

## Key Commands

| Command | Description |
|---------|-------------|
| `dotnet restore --locked-mode` | Restore NuGet packages from committed lockfiles |
| `dotnet test --no-restore` | Run the Reqnroll/NUnit suite |
| `dotnet run --project tooling/performance/DemoApp003.Performance.csproj --configuration Release` | Run reporting-only benchmarks |

## Deeper Reading

- `architecture.md` — stack architecture and dependencies
- `screenplay-guide.md` — C# Screenplay conventions
- `qa-strategy.md` — test scope and parity expectations
