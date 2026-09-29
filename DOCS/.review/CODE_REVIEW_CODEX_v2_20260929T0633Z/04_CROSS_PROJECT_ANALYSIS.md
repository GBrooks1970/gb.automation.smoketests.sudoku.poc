# Cross-Project Analysis

[<- Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29T06:33Z

This is cross-cutting analysis within one repository.

## Tool-Agnostic Tests

- Canonical Gherkin describes outcomes shared by Cucumber, pytest-bdd and Reqnroll.
- Memory-key and step-text checks passed for all stacks; all 217 source step lines match.
- Runner adapters remain native; executable tests cannot simply be moved between frameworks without their bindings.

## Code-Agnostic Tests

- Feature text and fixture expectations describe a language-independent solver contract.
- Grid and immutable attempt representations translate into the three native type systems.
- Tutor/generator tests exercise TypeScript-only surfaces; these should remain separate from core parity metrics.

## Single Source of Truth

- The canonical feature governs mirrored stack feature copies; the backlog governs status.
- The shared six-key memory contract is mechanically checked.
- Technique names cross the tutor/grader boundary as strings, defeating consistency at one important point (R3).

## API Contract Compliance

- Express parsing covers shape/type/range errors, with OpenAPI lint and four response-validation tests passing.
- The contract explicitly declares no security requirement: [openapi.yaml](../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml) (line 42). No user credentials or token setup are required.
- Structural response validation does not establish target-difficulty semantics (R2). The documented generator 422 path needs a real exhaustion test.
- Wildcard CORS is a deliberate demo posture; no authenticated production-service claim is made.

## Screenplay Parity

- TypeScript uses Serenity/JS Actors, Tasks, Questions and Abilities; Python and C# implement equivalent native interfaces.
- Actor fixtures/hooks and copied grids keep ordinary scenarios isolated.
- Immutable attempt events strengthen ordering assertions. Core behaviour is confirmed by Python tests and TypeScript component checks, not by a new full three-stack run.

## Batch File Design

- PowerShell centralises parity, documentation currency, audit policy and evidence validation.
- Read-only memory-key and step-text checks passed locally; feature-report generation was not run because output was restricted to the review bundle.
- The documentation guard enumerates review directories; this bundle is registered in both project indexes and the guard passes after integration.
- Container commands are useful local entry points but do not reproduce every CI audit/coverage step automatically.

## Documentation Alignment

- Backlog current state correctly recognises all delivered product increments.
- R5 identifies contradictions in current README prose despite a passing regex-based currency guard.
- Handover v6 and local HEAD are older than fetched upstream; the review states those limitations explicitly.

## Logging Alignment

- All stacks emit native test evidence and coverage under equivalent CI artefact names.
- Audit/change evidence is distinct from immutable attempt observations, preserving different diagnostic purposes.
- Native audit reports and normalised summaries are retained with seven-day artefacts.
- Production API errors mask unexpected internal details; no new production observability assessment was performed.

## Test Coverage Metrics

- Fresh local results: 49 TypeScript component tests, four OpenAPI tests, API integration PASS and 85 Python tests.
- Cucumber dry-run: 55 scenarios / 309 steps resolved, all skipped by design.
- Backlog's C# count and coverage percentages are historical claims, not measurements from this review.
- Selected-module coverage excludes some newer product code; no overall numerical coverage claim is justified.

## CI, Infrastructure and Reproducibility

- [ci.yml](../../../.github/workflows/ci.yml) (line 11) grants read-only contents; checkout disables persisted credentials, npm/pip caches use lock-related keys, and .NET restore uses locked mode.
- CI executes build/lint/format/API/OpenAPI/coverage and stack tests, then always attempts audit/evidence checks and uploads. The fan-in gate depends on all three stacks. Live branch-protection and latest run status were not queried.
- Pages builds static evidence and isolates Pages/id-token write permissions to deployment. It does not host the tutor or generator API.
- Compose uses versioned image tags, not immutable digests. No Docker services, image pulls, storage inspection or E2E infrastructure were started; Docker data location remains the workspace's E-drive convention.
- CI and local bootstrap are not interchangeable: this run reused installed Node/Python dependencies and had no supported .NET 10 SDK.

## Dependency, Security and Licence Pass

- npm audit returned one high js-yaml advisory at local HEAD; fetched upstream already patches the lock and override. The empty exception list blocks this severity.
- npm outdated found newer releases for 16 direct development packages, including major releases of Cucumber and TypeScript. Newer does not imply vulnerable or abandoned; no abandonment was established.
- Python constraints pin pip-audit 2.10.1, but it is not installed locally. NuGet auditing was unavailable with the installed SDK; neither is reported as clean.
- A targeted current-source scan found no apparent committed credential values in implementation/CI/tooling. This was not a full-history or dedicated secret-scanner audit. Input parsing, fixed fixture paths and controlled errors reduce obvious unsafe-input surfaces; no exploitability claim is made.
- Root ISC licence and TS/Python/C# licence metadata align. Lockfiles contain package licence metadata; a complete transitive licence compatibility/legal review was not performed.

---

[<- Previous: Section](03_PROJECT_REVIEWS/PROJECT_001_SUDOKU.md) | [Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](05_RECOMMENDATIONS.md)
