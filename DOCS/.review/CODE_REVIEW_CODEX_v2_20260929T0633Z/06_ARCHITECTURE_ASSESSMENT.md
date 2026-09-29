# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29T06:33Z

## Test Pyramid

- Component contracts offer fast direct checks; API/OpenAPI checks exercise the Express boundary.
- Canonical BDD acceptance is in-process, not browser E2E; do not equate its scenario count with browser coverage.
- The current product gap is state-transition and exact semantic testing, not a need for more broad duplicated scenarios.

## SOLID Principles

- SRP: loader, solver, orchestrator, audit, API and Screenplay responsibilities are recognisable.
- OCP: adding techniques touches ordered orchestration, tutor priority and grading; R3 shows the cost of loosely coordinated lists.
- LSP: no concrete substitutability defect was established; service substitution enables controlled API failure tests.
- ISP: native Task/Question/Ability interfaces are small; broad solver abilities deserve restraint as features grow.
- DIP: orchestration observers and injected API service support seams. The grader directly constructs the tutor, so its classification contract lacks a clear typed abstraction.

## KISS

- Fixed 9x9 data and deterministic technique order keep reasoning manageable.
- Plain browser modules avoid unnecessary framework overhead.
- Request revision checking is a small explicit mechanism that would resolve R4 without a framework migration.

## YAGNI

- Python/C# API and tutor ports are correctly not built merely to match TypeScript feature count.
- Generator-only search remains separate from the public human-logic solver.
- No runtime/framework migration is recommended solely because npm outdated reports newer majors.

## DRY

- Canonical features and parity checkers control intentional cross-language duplication.
- Shared technique constants should replace independent strings at tutor/grader boundaries.
- Active capability summaries need derived facts or narrow checks to avoid repeated stale statements.

## REST + OpenAPI

- Endpoint-specific request parsers and real response validation are useful contract evidence.
- Schema validity does not prove fulfilled difficulty intent; R2 requires an explicit domain failure response.
- The unauthenticated demo contract should remain distinct from any future hosted production security model.

## ISTQB Strategies

- Loader tests demonstrate boundary-value analysis and invalid equivalence classes, including booleans.
- Orchestration tests observe sequence and immutable effects, improving defect sensitivity.
- Difficulty tiers require an exact decision table, including every technique and unreachable target.
- Tutor actions require state-transition tests with delayed/out-of-order events.
- Risk-based regression should focus on R2-R4; today's passing positive tests are not sufficient closure evidence.

## Pedagogical Comments

- Technique and attempt-event comments explain algorithm order and observability.
- Some comments still describe only three techniques while code runs five; update active teaching explanations with R5.
- Keep controlled seam probes clearly labelled so readers do not mistake them for full real-puzzle or browser evidence.

---

[<- Previous: Section](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](07_MIGRATION_PLANS.md)
