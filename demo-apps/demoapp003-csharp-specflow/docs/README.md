# DEMOAPP003_CSHARP_SPECFLOW — Stack README

**Language:** C# on .NET 8
**Framework:** SpecFlow 3.9 + NUnit
**Surface type:** @util
**Last updated:** 2026-05-28

## Prerequisites

- .NET SDK 8.0+

## Setup

```powershell
cd demo-apps/demoapp003-csharp-specflow
dotnet restore
```

## Running Tests

```powershell
dotnet test
```

Expected output: 46 scenarios passing through generated SpecFlow/NUnit tests.

## Key Commands

| Command | Description |
|---------|-------------|
| `dotnet restore` | Restore NuGet packages |
| `dotnet test` | Run the SpecFlow/NUnit suite |
| `dotnet run --project tooling/performance/DemoApp003.Performance.csproj --configuration Release` | Run reporting-only benchmarks |

## Deeper Reading

- `architecture.md` — stack architecture and dependencies
- `screenplay-guide.md` — C# Screenplay conventions
- `qa-strategy.md` — test scope and parity expectations
