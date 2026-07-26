[Review index](../00_CODE_REVIEW_CODEX_v1_20260723T2351Z.md) > Project Reviews > Sudoku Solver POC

# Sudoku Solver POC - Project Review

## Project Snapshot

| Attribute | Reviewed state |
|-----------|----------------|
| Purpose | A cross-language Screenplay/BDD Sudoku solver POC |
| Stacks | TypeScript/Cypress/Cucumber, Python/pytest-bdd, C#/.NET 10/Reqnroll |
| Executable specification | 46 canonical scenarios per stack |
| Step text | 177 lines per stack, parity check passed |
| TypeScript execution count | 257 steps reported by current project records |
| Shared data | Three byte-identical `puzzles.json` catalogues |
| Open backlog | BACKLOG-014, BACKLOG-015, BACKLOG-016 |
| Default-branch assurance | Latest reviewed GitHub Actions run succeeded |

## Architecture and Design

- The loader, solver/orchestrator, algorithm, Screenplay ability, task, question, and step-definition responsibilities are visibly separated in every implementation.
- The orchestrator follows the documented deterministic order and avoids external services, timing dependencies, and shared process state.
- Input validation is deliberately located at loader and API boundaries, while solvers copy puzzle state before mutation.
- Canonical Gherkin and data are copied per stack rather than consumed from one runtime location. That choice supports standalone stack execution but relies on the parity gates to prevent drift.
- The REST API and static web player form a reasonable thin presentation layer over the TypeScript implementation; the OpenAPI contract is the clearest implemented interface description.

## Code Quality

- Algorithm methods are small and readable, and the use of named audit events supports diagnostic assertions.
- Deterministic loops and explicit validity checks make failures reproducible and keep the suite fast.
- Python's `isinstance(cell, int)` boundary is a language-specific type trap that admits booleans; this is the clearest implementation defect found.
- Audit semantics are underspecified: events represent successful changes, but several tests interpret their absence/presence as evidence of attempted call order.
- The stacks generally favour straightforward duplication over abstraction across languages, which is appropriate for a parity POC.

## Test Coverage

- Breadth is strong: 46 scenarios cover solving outcomes, invalid data, orchestration, audit state, invariants, REST behaviour, and parity-sensitive vocabulary.
- The Python suite passed all 46 scenarios in 1.08 seconds, showing useful deterministic feedback.
- The orchestration suite has critical oracle gaps: multiple steps bind rich behavioural wording to final-status assertions.
- The named all-three-techniques fixture does not produce evidence of Unit Completion and still solves when Unit Completion is disabled.
- Lower-level unit/component tests, coverage reports, mutation testing, and executable OpenAPI response validation are absent or not evidenced in CI.

## Documentation

- The repository has unusually extensive architecture, design, QA, API, planning, review, implementation-log, and session-note material.
- The backlog is detailed and makes future capability dependencies explicit.
- Several high-visibility documents conflict with the live implementation, including repository visibility, stack maturity, test counts, runtime/framework versions, and REST design status.
- The review indexes lag the actual review directories despite a documented same-commit maintenance expectation.
- The current architecture currency gate is valuable but covers only part of the facts that have drifted.

## Strengths

- Exact multi-stack feature, step, memory-key, and data parity.
- Clean deterministic solver core with no network or authentication dependencies.
- Strong CI hygiene: least privilege, locked installs/restores, caching, and a fan-in gate.
- Clear open-scope accounting for advanced solving, tutoring, and generation.
- Public ISC licensing and no candidate secrets found in the live source scan.

## Weaknesses

- Test names and scenario prose sometimes claim more than their assertions observe.
- Cross-language input parity is incomplete for JSON booleans.
- Scenario count is high, but the test pyramid is not established by independent lower-level suites.
- Documentation governance does not yet prevent stale narrative and indexes.
- CI retains less test and dependency evidence for Python/C# than for TypeScript.

## Runtime and Lifecycle Assessment

The automated suites are in-process and do not depend on arbitrary sleeps. Python creates a new actor per scenario, C# uses scenario hooks, and the TypeScript Screenplay stage manages actor context. API integration uses an in-process application rather than a bound network port. Solver state is copied before mutation. No reusable login, bearer token, external wait, or secret lifecycle is present.

The web player uses a timer for human-facing playback, but no reviewed automated test relies on that timer. Container workloads were not started during review.

## Dependency, Security, and Licence Assessment

- Root and package metadata consistently identify the ISC licence.
- The repository is public, so dependency and documentation claims should be assessed as externally visible.
- npm reported zero known vulnerabilities from the lock file.
- Python packages are version-pinned, but `pip-audit` was not available and the constraints file has no hashes.
- NuGet uses a lock file, but the local audit could not be completed under the unsupported host SDK.
- No candidate credentials or secrets were found by the targeted live-source scan.
- CI's read-only permissions and disabled persisted credentials materially reduce workflow-token exposure.

## Validation Performed

| Check | Result |
|-------|--------|
| PowerShell parity suite | PASS |
| Python `pytest` | PASS - 46 scenarios |
| npm lock-file audit | PASS - zero vulnerabilities |
| Latest default-branch CI | PASS |
| Puzzle catalogue SHA-256 parity | PASS |
| Boolean-cell boundary probe | FAIL - Python accepted boolean |
| Algorithm-use probe | FAIL - no Unit Completion event; puzzle still solved with method disabled |
| TypeScript full local test | SKIPPED - Node 24 required, Node 20 available |
| C# full local test | SKIPPED - .NET 10 required, .NET 9 available |
| Python dependency audit | SKIPPED - `pip-audit` unavailable |
| Docker Compose config | INCONCLUSIVE - 30-second timeout |

See the [validation log](../ANNEX/VALIDATION_LOG.md) for commands, versions, and scope.

---

Review: CODE_REVIEW_CODEX_v1_20260723T2351Z | Reviewer: AI assistant (Codex, GPT-5) | Generated: 2026-07-23T23:51Z
