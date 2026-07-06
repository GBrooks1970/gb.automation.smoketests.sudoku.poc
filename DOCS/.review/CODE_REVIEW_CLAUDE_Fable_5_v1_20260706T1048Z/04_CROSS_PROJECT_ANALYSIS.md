# Cross-Project Analysis

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z

Single-repository review: per the template customisation, this is a
cross-cutting analysis *within* the repo - the three stacks, the parity
tooling, CI, Docker, and the documentation system, examined against each
other.

## Tool-Agnostic Tests - can tests run across frameworks?

- Yes, and it is the project's central claim, proven rather than asserted: one
  canonical feature file
  ([BasicSudokuSolverLogic.feature](../../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature),
  321 lines, 46 scenarios) executes under cucumber-js + Serenity/JS,
  pytest-bdd, and SpecFlow with 177 step lines verified byte-identical per
  stack by `.batch/check-step-text-parity.ps1` (run PASS during this review).
- The `@util` surface tag (RA section 6.0, DR-021) keeps the contract at the
  in-process subject-application level, which is what makes true portability
  achievable - no UI/API selectors leak into the canonical steps.
- Stack-local copies (not symlinks) are the propagation mechanism, with drift
  caught by the feature-parity and step-text gates rather than prevented by
  construction - a pragmatic choice for three ecosystems with different
  test-discovery rules, and the gates make it safe.

## Single Source of Truth - feature file and data consistency

- `features-shared/util-tests/sudoku-solver/` is the declared canonical store,
  with change governance defined (RA section 5.5, DR-024: breaking-change
  classification and gate sequence). The parity report generated during this
  review (`FEATURE_PARITY_20260706T1041Z.md`) shows Overall result: PASS.
- Test data is likewise per-stack copies of `puzzles.json` (three copies).
  Loader validation keeps them structurally honest, but nothing diffs the
  three copies against each other - a puzzle edited in one stack would only
  surface when a solve scenario diverged. Low risk; worth a one-line addition
  to the parity script family if data ever starts changing.
- Governance documents defer correctly: backlog -> decision register -> RA,
  and the one place the chain is stale is the register header itself (Risk 6).

## Screenplay Parity - consistency across Stack implementations

- Memory keys: 6 constants, name==value rule enforced by
  `.batch/check-memory-key-parity.ps1` across
  [memory-keys.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/support/memory-keys.ts),
  `memory_keys.py`, and `MemoryKeys.cs` - PASS during this review.
- Layer shape is faithful per language: Serenity/JS provides Actor/Ability
  natively; Python and C# hand-roll Actor, Ability, Task, Question with the
  same vocabulary and the same fixtures module (`GridFixtures`) split
  (BACKLOG-023 pattern applied to all stacks).
- Parity extends to warts, deliberately: the vacuous ordering assertions
  (Risk 7) and the Question-reads-ability-state pattern (BACKLOG-032/033,
  ruled false positives) are identical in all three stacks. Consistency is
  the right call; the fix, if taken, must be canonical-first.
- DEMOAPP001 carries extra surfaces (CLI, REST API, web UI) governed by the
  capability matrix (platform spec section 6.1) - staged capability recorded
  as a decision, not silent asymmetry.

## Documentation Alignment - consistency and completeness

- Core alignment is strong and evidence-backed: backlog suite-health claims
  reproduced exactly (46/257, 46, 46; parity PASS), platform spec v1.1 marked
  authoritative consistently across README, backlog, and CLAUDE.md.
- Misalignments cluster at the periphery, all captured as risks: CHANGELOG one
  full stream behind and contradicting BACKLOG-010 (Risk 5); register header
  on RA v1.14 vs active v1.15 (Risk 6); README tree stale (Risk 8); licence
  claim unbacked by any LICENSE file (Risk 4).
- The pattern across this repo's eight review streams is consistent: code and
  primary governance stay current, secondary metadata regresses. A tiny
  header-currency grep gate would end the recurrence cheaply.

## Test Coverage Metrics - quantitative assessment

- 46 scenarios x 3 stacks = 138 executing scenarios; DEMOAPP001 257 steps.
  All passed locally 2026-07-06 (see [ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md)).
- Distribution across the canonical file: 4 unit-completion, 5 hidden-singles,
  3 naked-singles, 8 constraint-validation (outline), 5 orchestration,
  7 loader, 2 deep-copy, 5 integration/edge, 4 error-handling, 3 audit -
  breadth is appropriate to the surface, with ISTQB-style partitioning visible
  in the validation outline.
- Supplementary gates: API integration (`npm run test:api`, PASS), lint/build
  (PASS), three parity gates (PASS), reporting-only performance benchmarks
  (not exercised in this review - reporting-only by design, BACKLOG-011).
- No coverage-percentage tooling exists for the app code itself
  (`coverlet.collector` is referenced in the C# test csproj but no threshold
  is enforced anywhere). For a scenario-driven pedagogical repo this is
  defensible; noted, not demanded.

## CI vs Local vs Docker - three execution paths, one contract

- The same gate set exists in all three run modes: `ci.yml` stack jobs +
  parity steps + fan-in `gate` job (SUD-13); `.batch/run-parity-checks.ps1`
  and per-stack commands locally; `docker-compose.yml` services mirroring each
  (including a `parity-checks` service on the official PowerShell image).
  README documents the `pwsh` 7+ prerequisite (SUD-13 companion).
- CI drift risk is currency, not correctness: `node-version: 20` now EOL
  (Risk 3), Python 3.13 and .NET 8.0.x pins current-but-aging (.NET 8 EOL
  2026-11-10, Risk 1 companion).
- Parity gates run only in the DEMOAPP001 job - acceptable (they are
  repo-level, one execution suffices), and the `gate` job gives branch
  protection a single required check regardless.

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
