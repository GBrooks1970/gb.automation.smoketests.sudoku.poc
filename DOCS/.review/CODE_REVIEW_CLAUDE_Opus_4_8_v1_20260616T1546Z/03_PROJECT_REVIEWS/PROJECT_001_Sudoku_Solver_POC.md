# Project Review 001 - Sudoku Solver POC (multi-stack)

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

This is a single-repository project; per the template's single-repository customisation there is
only `PROJECT_001`. The repository hosts three stacks, the canonical feature store, parity
tooling, a REST API, and the governance docs. They are reviewed together below.

---

## Architecture and design patterns

- **Specification-driven, three-stack Screenplay.** A v1.0 core spec and a v1.1 platform spec are
  realised in DEMOAPP001 (TypeScript, Cucumber.js + Serenity/JS), DEMOAPP002 (Python, pytest-bdd),
  and DEMOAPP003 (C#, SpecFlow + NUnit). All three target the `@util` in-process surface and share
  one canonical Gherkin feature.
- **Clean component split.** Solver / Orchestrator / PuzzleLoader / (CLI, API, Web) are separate
  with single responsibilities. The orchestrator owns the solve loop and the SUD-01 early-exit
  guard; the solver owns the three techniques and the constraint queries; the loader owns
  structure validation.
- **Screenplay layering is faithful.** Step definitions are thin and delegate via
  `actor.attemptsTo(...)` / `actor.answer(...)`; Abilities expose a slim interface (the overloaded
  Ability flagged in an earlier review, BACKLOG-023, was refactored into `GridFixtures` and is
  resolved). Memory keys are runtime-active and parity-checked.
- **REST as an adapter, not a rewrite.** The Express API wraps the same solver/orchestrator with
  its own untrusted-input validation layer and an authored OpenAPI contract; it does not duplicate
  solving logic.

## Code quality and maintainability

- The core solver
  ([SudokuSolver.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts))
  is compact and well-commented at the *why* level (each technique has a short rationale block).
  The Python and C# ports mirror it without behavioural drift.
- `getGrid()` / `get_grid()` / `GetGrid()` return deep copies (SUD-03); the public `grid` member
  is retained for compatibility with external mutation explicitly deprecated in the doc comment.
  This is a clean, backwards-compatible way to close a mutation hazard.
- The API service clones request grids before constructing a solver
  ([SudokuApiService.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/server/SudokuApiService.ts)
  lines 62-63, 131-132) and validates structure up front
  ([validation.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/server/validation.ts)).
- DEMOAPP001 `npm run build` and `npm run lint` both exit 0 (TypeScript strict compile + ESLint).
- Maintainability risk is low and well-managed: cross-stack drift is the obvious hazard for a
  three-implementation repo, and it is precisely what the `.batch` parity scripts and CI gate.

## Test coverage and approach

- 46 canonical scenarios per stack, all passing locally in this review (DEMOAPP001: 46/46 + 257
  steps; DEMOAPP002: 46 pytest-bdd; DEMOAPP003: 46 SpecFlow). See
  [ANNEX/VALIDATION_LOG.md](../ANNEX/VALIDATION_LOG.md).
- The feature exercises each technique positively and negatively (returns-false scenarios),
  constraint validation via a decision-table Scenario Outline, orchestration order, multi-iteration
  solving, the already-solved early exit, loader structure validation, deep-copy/isolation, full
  end-to-end solves of named puzzles, and audit-trail behaviour. This is a genuinely
  comprehensive behavioural net for the solver's scope.
- API coverage is a standalone integration harness (`npm run test:api` -> PASS) rather than part
  of the Cucumber suite, which is an appropriate separation (HTTP concerns vs solver behaviour).
- No skipped or `@pending` scenarios; the `STUCK_ON_ADVANCED_LOGIC` boundary is asserted as
  behaviour, not used to dodge coverage.

## Documentation quality

- The backlog ([DOCS/.planning/backlog.md](../../../.planning/backlog.md)) is accurate and
  disciplined: statuses are constrained to Open/In Progress/Resolved, counts reconcile, resolved
  items are retained, and structural choices are tied to DR entries. It correctly records the
  SUD-01..08 remediation stream as BACKLOG-035..042.
- The governance set is strong: `reference-architecture.md` (v1.15), `decision-register.md`
  (DR-001..035), and the new `validation-boundaries.md` (DR-035) which converts an implicit code
  behaviour into a stated contract.
- The CLAUDE.md agent guide is current and matches the live tree (authority order, stack
  inventory, commands, parity rules).
- **Weakness:** the root README has drifted from the implementation in three small ways - the
  "+ Flask" Python label, the stale "35+" scenario count, and a non-ASCII style at odds with the
  project's own conventions (Risks 1-3). These are the only material documentation defects found.

## Strengths

- Mechanically enforced three-stack behavioural parity (the headline senior signal).
- Honest, accurate, well-governed documentation set (backlog + decision register + RA).
- Defensive, contract-documented REST API with a matching OpenAPI spec.
- Immutability discipline across solver, snapshots, and API.
- Demonstrated follow-through: a complete prior-review remediation stream closed and reconciled.

## Weaknesses

- Root README inaccuracies and style drift (Risks 1-3) - the only reader-facing credibility dent.
- Minor governance hygiene: DR entries out of ID order, a seconds-bearing README date (Risk 4).
- CI lacks a single aggregate required-check job and couples local parity reproduction to `pwsh`
  (Risk 5, informational).
- The C# loader's integer-validation mechanism differs from the other two stacks (typed
  deserialization vs explicit check); resolved by documentation (SUD-06), which is proportionate
  but remains a small parity asymmetry by design.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
