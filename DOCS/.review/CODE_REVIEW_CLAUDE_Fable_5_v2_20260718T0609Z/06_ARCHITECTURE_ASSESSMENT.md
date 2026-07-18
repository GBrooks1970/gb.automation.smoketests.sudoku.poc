# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

## Test Pyramid

- Inverted-by-design but honestly so: this is a behaviour-specification POC, so BDD scenarios
  (46 x 3) are the deliberate centre of gravity, with algorithm-level determinism giving them
  unit-like speed (~17s TS, ~3.5s Python for the full suite). REST API integration tests add the
  middle layer for DEMOAPP001.
- No line/branch coverage tooling; acceptable here because scenario-per-requirement traceability
  is the more meaningful metric for a spec-first project, and it is complete for the v1.0/v1.1
  contract. A mutation pass (05, Future Ideas) would be the pyramid's highest-value addition.

## SOLID Principles

- **SRP:** strong - Solver, Orchestrator, Loader, Audit, Output, and (DEMOAPP001) Server are
  separate units; the Screenplay layers each hold one responsibility.
- **OCP:** solvers extend by adding techniques without editing the orchestration contract; the
  `IOutput` seam (BACKLOG-007) lets the CLI vary output without touching solver logic.
- **LSP/ISP:** the C# `IAbility`/`ITask`/`IQuestion<T>` interfaces are minimal and substitutable;
  no fat interfaces observed.
- **DIP:** Abilities depend on the subject application through narrow handles; step definitions
  depend on Tasks/Questions, not concretions. The one wrinkle is historical (the once-399-line
  Ability, since slimmed under BACKLOG-023) - now compliant.

## KISS

- Algorithms are the simplest logic-based implementations that satisfy the spec (no backtracking,
  by design - `STUCK_ON_ADVANCED_LOGIC` is an honest outcome, not a hidden brute-force fallback).
- The SUD-20 ordering solution resisted the temptation to overload the existing audit feature and
  instead added a small, single-purpose path - simple and non-entangling.

## YAGNI

- Staged capability (API/web for Python/C#) is explicitly roadmap, not speculatively built - the
  matrix records intent without shipping unused surface.
- Parked product futures (tutor, generator, advanced techniques) stay as backlog entries, not
  half-built code.

## DRY

- The canonical feature store and generated Stack copies are DRY-by-tooling (parity gates catch
  divergence). Cross-stack behavioural logic is intentionally duplicated per language - the right
  call, since the pedagogical point is comparing implementations, and drift is script-guarded.

## REST + OpenAPI

- DEMOAPP001's nine endpoints are documented by a maintained OpenAPI 3.0 contract with structured
  error codes; DR-035 binds contract and code to change together. Validation boundaries
  (structure vs constraint) are contract-documented. N/A for the other two Stacks (no API yet).

## ISTQB Strategies

- Genuine technique use: boundary/equivalence on placement validity and digit ranges; decision
  coverage on solve outcomes; state-transition-flavoured coverage of the iterate-until-stable
  orchestration loop; the already-solved/empty/unsolvable edge triad.

## Pedagogical Comments

- Comments explain why, not what (the hidden-single naming rationale, the SUD-20 behaviour-
  neutrality note, the deliberate separation of the two audit paths). This is the repository's
  teaching strength and it is consistent across the TypeScript Stack; the Python/C# Stacks are
  slightly leaner on prose but readable.

## Overall

Architecturally an A. The gaps are peripheral (static-analysis scope, one doc contradiction,
container/runtime currency nits), none touching the core design. The design faithfully teaches
Screenplay + spec-first multi-stack parity, and the tooling makes the parity claim falsifiable
rather than asserted.

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
