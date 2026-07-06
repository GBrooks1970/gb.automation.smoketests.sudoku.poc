# Annex: Validation Log

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06 (all commands run locally on this date)

Environment: Windows 11, Node v20.19.5, Python 3.13.1, .NET SDK 9.0.315
(with .NET 8 runtimes installed), PowerShell 7.5.5. Repository at `main`
commit `d6b47f1` (fast-forwarded from origin before validation).

## Repository state

| Command | Result |
|---------|--------|
| `git status --short` | clean (before review artefacts were written) |
| `git fetch && git pull --ff-only` | fast-forward `d294c5a` -> `d6b47f1` |

## Parity gates (registry-recorded repo-level gates)

| Command | Result |
|---------|--------|
| `pwsh -File ./.batch/run-parity-checks.ps1` | **PASS** (all three gates) |
| - memory-key parity | PASS (6 keys x 3 stacks) |
| - feature parity report | PASS (`FEATURE_PARITY_20260706T1041Z.md`) |
| - step-text parity | PASS (177 step lines match, per stack x3) |

## Stack gates (per `ci.yml` job definitions)

| Stack | Command | Result |
|-------|---------|--------|
| DEMOAPP001 | `npm run build` | PASS (tsc clean) |
| DEMOAPP001 | `npm run lint` | PASS (eslint clean) |
| DEMOAPP001 | `npm run test:api` | PASS ("API integration tests: PASS") |
| DEMOAPP001 | `npm test` | **46 scenarios (46 passed), 257 steps (257 passed)**, 7.3s |
| DEMOAPP002 | `python -m pytest` | **46 passed**, 1 warning (upstream `gherkin` DeprecationWarning), 1.4s |
| DEMOAPP003 | `dotnet test` | **Passed! Failed: 0, Passed: 46, Total: 46** (net8.0), ~1s |

## Dependency / security pass

| Command | Result |
|---------|--------|
| `npm audit` (demoapp001) | **1 high**: `form-data` 4.0.0-4.0.5, GHSA-hmw2-7cc7-3qxx, "fix available via npm audit fix" |
| `npm ls form-data` | 4.0.5 via `@serenity-js/serenity-bdd@3.43.2 -> axios@1.16.0` and `supertest@7.2.2 -> superagent@10.3.0`; lockfile marks `dev: true` |
| `dotnet list package --vulnerable --include-transitive` | **NOT RUN to completion** - failed with local MSBuild/NuGet `OutOfMemoryException` (environment fault, not repository fault); C# package versions inspected manually instead |
| Python audit | **NOT RUN** - no audit tool available in the environment; `pyproject.toml` declares only `pytest>=8.0`, `pytest-bdd>=8.0` (test extra), zero runtime dependencies |
| `git ls-files | grep -i licen` | no LICENSE file tracked (Risk 4) |

## Not exercised (and why)

- Docker Compose services and the full docker-based parity/benchmark runs -
  heavyweight infrastructure, excluded per the review prompt; the same gates
  were run natively instead.
- Performance benchmarks - reporting-only by design (BACKLOG-011), no gate to
  verify.
- Serenity BDD HTML report generation (`.batch/run-demoapp001.ps1` tail) -
  requires a Java runtime; the Serenity JSON artefacts were produced by
  `npm test` normally.

All executed gates passed. The backlog's execution-baseline claims
([backlog.md](../../../.planning/backlog.md) (line 39)) are verified accurate
as of `d6b47f1`.

---

[<- Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md)
