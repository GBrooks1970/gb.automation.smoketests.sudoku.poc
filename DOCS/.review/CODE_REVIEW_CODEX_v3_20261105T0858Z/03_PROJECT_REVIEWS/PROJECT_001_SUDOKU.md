# Sudoku - Project Review

[<- Back to Index](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (Codex GPT-6)

## Architecture and Design

- This is one repository with three native solver/test stacks, not three unrelated projects. The shared feature is the behavioural contract; file and execution parity provide the join.
- TypeScript uses Serenity/JS actors, abilities, tasks and questions; Python and C# implement equivalent lightweight roles. Framework equivalence is intentional rather than a demand to use the same library. [demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts](../../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts) (line 20).
- The orchestrator runs five deterministic techniques until no progress remains, and exposes observations to audit/visualisation consumers. It is not a complete search-based Sudoku solver. [demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts) (line 59).
- REST, tutor, browser playback and puzzle generation belong to TypeScript. Their absence in Python/C# is a documented capability boundary, not missing common-core parity.

## Code Quality

- Named types, narrow validation functions and explicit exhausted-generation results improve reviewability. The generator caps attempts at five. [demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts) (line 6).
- The C# file fallback violates the caller's explicit input choice (S-03); do not fix this by broadly removing legitimate default-path convenience.
- The parity adapter needs structural evidence validation, not more success-only example counts (S-04).
- Some inline comments lag the five-technique implementation even though active high-level docs were reconciled. [demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts) (line 17).

## Test Coverage

- The unchanged local baseline passed 113 TypeScript component tests and 55 BDD scenarios/309 steps, 85 Python tests, and 28 C# component plus 55 Reqnroll tests.
- The native OpenAPI lane passed eight tests; the API integration script exited 0. These are bounded representative checks, not complete request-space validation.
- Policy and evidence negative controls are valuable tests of the tests; 13 policy controls and 21 parity-tool tests passed. S-04 shows a missing absence case despite those successes.
- No pending/quarantined tags were found in the shared solver feature. The no-progress result and TypeScript-only browser features are explicit scope boundaries. Advanced Given fidelity remains TRIAGE-15.

## Documentation

- The backlog's current status is 104 resolved, with no local open work. Old dated paragraphs are history, not current state. [DOCS/.planning/backlog.md](../../../.planning/backlog.md) (line 28).
- The registry's older BACKLOG-078 summary is stale; handover v7's preflight freshness warning does not justify reopening a resolved item.
- Root TRIAGE-10/15 are named separate candidates; this review preserves that distinction. [DOCS/.planning/backlog.md](../../../.planning/backlog.md) (line 8).
- Review registration is deliberately not performed here: the currency guard expects entries in two shared indexes, which would breach the user's separation boundary. [.batch/check-ra-header-currency.ps1](../../../../.batch/check-ra-header-currency.ps1) (line 422). Before publishing this review in a later integration task, register it there and rerun the guard.

## Strengths

Executable multi-stack contracts, explicit algorithm limits, meaningful mutation controls, deterministic input data, and retained decision/implementation history.

## Weaknesses

Dependency-policy ageing, implicit fallback input selection, incomplete evidence validation, and ignored specification arguments. Their practical remedies are small compared with a framework rewrite.

---

[<- Previous](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](../04_CROSS_PROJECT_ANALYSIS.md)
