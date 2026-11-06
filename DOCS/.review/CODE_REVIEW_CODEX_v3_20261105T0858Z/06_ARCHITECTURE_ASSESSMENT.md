# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (Codex GPT-6)

## Test Pyramid

Native components form a substantial fast base, shared BDD tests exercise domain behaviour, and API/OpenAPI checks add an integration boundary. The solver BDD is in-process, not expensive browser E2E simply because its folder says Cypress. Browser controls form a separate surface and were not freshly exercised here. Current coverage percentages are unknown; counts measure execution inventory, not adequacy.

## SOLID Principles

- **SRP:** solver, orchestration, loading, API adaptation and reporting are separated. The loader's explicit-path policy still needs correction (S-03).
- **OCP:** observer-based attempt reporting adds evidence consumers without changing solver algorithms. [demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts) (line 59).
- **LSP:** cross-stack similar interfaces should honour comparable behavioural contracts; the missing-path difference is a concrete counterexample, not a claim about class inheritance.
- **ISP:** task/ability/question roles expose focused responsibilities rather than one test utility owning every operation. [demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts) (line 20).
- **DIP:** API construction accepts services and observers; orchestration still knows the concrete solver, which is reasonable at this POC scale. Do not add interfaces only to increase abstraction count.

## KISS

The five-technique deterministic loop and explicit no-progress result are clear. Root scripts centralise repeated governance. Ancestor file search and bespoke evidence parsing need stronger invariants because their apparent convenience hides failure modes. [demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs](../../../demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs) (line 41); [tools/parity-page/adapters.mjs](../../../tools/parity-page/adapters.mjs) (line 52).

## YAGNI

Retain the documented solver boundary and TypeScript-only UI/API features. Adding backtracking, databases, queues or more services would change the project's teaching purpose without fixing the current findings. Bounded exact-tier generation is an appropriate implemented feature, not an invitation to claim all puzzles can be generated at every requested tier. [demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/generator/puzzle-generator-service.ts) (line 6).

## DRY and Single Source of Truth

Cross-language implementations intentionally repeat behaviour; the shared corpus and parity guards justify that duplication. Avoid copying numerical claims into more documents unless a source-derived guard owns their currency. A single shared wrong fixture can still produce perfect parity, so cross-stack agreement is not an independent oracle.

## REST + OpenAPI

Named operations, input limits and explicit errors make the demo API understandable. Schema success examples are useful but cannot prove runtime acceptance equivalence; S-05 is the concrete mismatch. S-01 shows that request middleware is also part of the operational API boundary. [demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml](../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml) (line 815); [demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) (line 32).

## ISTQB Strategies

Grid dimensions and digits are suited to boundary analysis; duplicate-row/column/block rules to equivalence classes and decision tables; generator exhaustion and player/tutor mode changes to state transitions. Existing mutation controls test assertion strength. Extend those controls to preconditions, explicit input identity and absent evidence, not just wrong expected results.

## Pedagogical Comments

The architecture and named task layers are useful teaching material. Refresh the inline three-technique explanation when touching its owner, and explain the distinction between declared feature steps, recorded step results and validated execution. [demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts) (line 17). Every published count should state whether it is measured today, historical, or inferred from source.

---

[<- Previous](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](07_MIGRATION_PLANS.md)
