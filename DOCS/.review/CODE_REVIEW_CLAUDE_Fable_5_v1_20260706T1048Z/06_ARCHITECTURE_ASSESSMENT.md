# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z

Alignment and gaps against the project's stated principles (root README "Key
Design Principles" and the template's assessment axes).

## Test Pyramid

- The BDD suites double as the unit layer by design: technique-level scenarios
  (`unitCompletion` returns false, candidates counting) exercise solver
  primitives directly through the `@util` in-process surface, so the "slow BDD
  top layer" objection does not really apply - DEMOAPP002 runs 46 scenarios in
  1.4s.
- Integration: end-to-end puzzle solves + the REST API integration script
  (`tests/api/api.integration.ts`) cover component interaction; the web UI has
  no automated layer (staged capability, recorded in the capability matrix).
- Gap: no per-file coverage measurement to prove the pyramid quantitatively -
  defensible for the repo's purpose (noted in 04, not demanded).

## SOLID Principles

- **SRP:** cleanly held - Solver (techniques), Orchestrator (loop/lifecycle),
  PuzzleLoader (structure validation, DR-035 boundary), AuditLogger
  (recording), output adapters. Test side mirrors it: Tasks act, Questions
  read, Abilities own the subject handle, GridFixtures set up state
  (BACKLOG-023).
- **OCP:** new techniques slot into the orchestrator loop without modifying
  solver primitives; BACKLOG-014's acceptance criteria preserve this.
- **LSP/ISP:** the hand-rolled C#/Python Screenplay interfaces
  (`IAbility`/`ITask`/`IQuestion<T>`; Python duck-typed equivalents) are
  minimal and substitutable; no fat interfaces observed since the BACKLOG-023
  Ability slimming.
- **DIP:** `SudokuCLI` depends on `IOutput` (BACKLOG-007); the orchestrator
  takes a solver instance; step definitions depend on Tasks/Questions, not
  abilities (MIG-05). The deprecated-but-public `grid` member is the one
  abstraction leak, consciously retained for compatibility (SUD-03).

## KISS

- Strong. Three deterministic techniques, no cleverness, arrays over classes
  for the grid, vanilla ES modules for the web UI (no framework). The
  documentation system is the one place a newcomer could call heavy - but it
  is the point of the project, and CLAUDE.md gives the map.

## YAGNI

- Respected: no backtracking solver "just in case" (explicitly out of scope,
  `STUCK_ON_ADVANCED_LOGIC` is a first-class outcome), no premature API/web
  ports to Python/C# (staged via the capability matrix as a decision).
- Borderline-but-fine: reporting-only performance benchmarks (BACKLOG-011)
  ship in three stacks without a consumer gate. They are cheap and inert.

## DRY

- Single canonical feature store with automated drift gates is DRY where it
  matters. The three-language subject application is intentional triplication
  (the pedagogical product), not a DRY violation.
- Small acceptable duplication: three `puzzles.json` copies (see 04) and the
  deliberately mirrored orchestrator comments - both governed or gate-checked.

## REST + OpenAPI

- DEMOAPP001's API has a full OpenAPI 3.0 contract
  ([openapi.yaml](../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml),
  9 paths / 19 schemas, DR-035) with a documented rule that endpoint changes
  update the contract in the same change. Structured error middleware and
  validation boundaries are specified in
  [validation-boundaries.md](../../.architecture/validation-boundaries.md).
- Gap: nothing mechanically verifies the implementation against the contract
  (no schema-validation test); currently honour-system. Acceptable at this
  scale; worth a note if the API grows.

## ISTQB Strategies

- Equivalence partitioning and boundary thinking are visible in the
  constraint-validation Scenario Outline (8 cases spanning VALID/INVALID
  partitions across row/column/block constraints) and loader validation
  scenarios (dimension, range, missing-file). Decision-table flavour in the
  capability matrix. State-transition testing is not applicable to a
  stateless solve loop - correctly not forced.

## Pedagogical Comments

- Consistently good: comments explain *why* (Hidden vs Naked naming, technique
  complexity ordering in
  [SudokuOrchestrator.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts)
  (lines 6-19), deep-copy deprecation rationale) and cite the governing spec
  or Gherkin contract by name - traceability a mid-level reader can follow.
- The C# and Python stacks carry the same explanatory register, so a reader
  comparing stacks learns the pattern, not a language accident.

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
