# Sudoku Solver POC - Project Review

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

Single-repository review: this file covers the whole project (three Stacks + shared
infrastructure) per the template's single-repository customisation.

## Architecture and Design

- The specification-first model holds end to end: platform spec v1.1 (Accepted, DR-034) governs;
  the canonical Gherkin lives once in
  [BasicSudokuSolverLogic.feature](../../../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature)
  and is propagated (not re-authored) to each Stack, with propagation verified by script.
- Screenplay is implemented faithfully in all three languages: thin step definitions delegate to
  Tasks, Questions read state, Abilities own the subject application handle - e.g. the TS glue in
  [orchestration.steps.ts](../../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts)
  contains no direct solver calls, and the C# Stack carries its own minimal
  `IAbility`/`ITask`/`IQuestion<T>` kernel
  ([support/](../../../../demo-apps/demoapp003-csharp-specflow/tests/screenplay/support/)) rather
  than faking Screenplay with static helpers.
- Subject-application layering is clean: `app_src/` (solver, orchestrator, loader, audit, and in
  DEMOAPP001 the Express server) is test-framework-free; tests reach it only through Abilities.
  The validation split (loader = structure; solver/API = constraints) is documented as a contract
  in [validation-boundaries.md](../../../../DOCS/.architecture/validation-boundaries.md) (DR-035).
- The SUD-20 tracked-order solve path is a well-judged design: a dedicated
  `solvePuzzleTrackingOrder()` on the Ability
  ([UseSudokuSolver.ts](../../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/abilities/UseSudokuSolver.ts)
  (lines 97-103)) keeps ordering instrumentation separate from the opt-in audit-trail feature, so
  "Solver without audit logging produces no trail" still means what it says.
- DEMOAPP001 additionally ships REST API + web UI surfaces with an OpenAPI 3.0 contract
  ([openapi.yaml](../../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml)); the
  capability matrix (README + spec v1.1 §6.1) honestly stages these as roadmap for Python/C#
  rather than claiming parity that does not exist.

## Code Quality

- Solver algorithms are readable, deterministic, and pedagogically commented (why-not-what, e.g.
  the "hidden among other candidates" note in
  [SudokuSolver.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts)
  (lines 110-121)); the three implementations mirror each other closely enough that a reader can
  diff techniques across languages.
- Audit batching is consistent: one event per algorithm invocation with batched `CellChange`
  entries and the digit as `algorithmParameter` - this is what makes the SUD-20 ordering
  assertions structurally sound (02, I-3).
- Weakness (Risk 1): static-analysis gates cover `app_src/` only; the test layer relies on
  ts-node type-checking alone. The Python and C# Stacks have no linter wired at all (acceptable
  for POC scope, but the TS gap is the visible one since a config exists and excludes them).
- No secrets, tokens, or environment-dependent credentials anywhere in the tree; the API server
  binds a local port with no auth surface, which is appropriate for its pedagogical scope.
- Minor duplication is contained and justified where it exists (e.g. `solvePuzzleWithAudit()` vs
  `solvePuzzleTrackingOrder()` differ only in storage target, with a comment explaining why they
  are separate).

## Test Coverage

- 46 canonical scenarios / 257 steps per Stack (138 scenario executions across the three),
  verified green in this review for DEMOAPP001 and DEMOAPP002; DEMOAPP003 reviewed statically
  (no local .NET 10 SDK - CI authoritative). REST API integration tests PASS.
- Coverage spans grid initialisation, all three algorithms (including per-digit hidden-singles
  scan order), orchestration ordering/termination, constraint validation, edge cases
  (already-solved, empty, unsolvable), audit trail on/off, puzzle loading, and solver isolation.
- ISTQB technique use is genuine: boundary and equivalence work on placement validity and digit
  ranges; decision coverage on solve outcomes (`SOLVED` / `STUCK_ON_ADVANCED_LOGIC`).
- The previously-weakest assertions (ordering/no-execution) are now the strongest: real
  invariants over captured audit events, including the zero-iterations/zero-events contract for
  already-solved input in all three Stacks.
- Deferred coverage is explicit, not silent: advanced techniques, tutor, and generator are parked
  as Open backlog futures (BACKLOG-014/015/016); API/web parity for Python/C# is staged on the
  roadmap per the capability matrix.

## Documentation

- The DOCS system remains the repository's differentiator: reference architecture (v1.15),
  decision register through DR-036, authoritative backlog (77 items, 3 Open - verified),
  per-stack READMEs/architecture/QA-strategy docs, howtos, and an unbroken implementation-log
  trail including the P-04 licence and P-07 public-readiness audits.
- Governance now enforces its own currency: `.batch/check-ra-header-currency.ps1` (CI-gated)
  ends the thrice-recurred RA-header drift for the two files it covers.
- Weakness (Risk 2): `CLAUDE.md` line 229 still cites "DR-012 through DR-033" against line 15's
  correct "DR-001 through DR-036", and `CLAUDE.md` is outside the guard's target list.
- CHANGELOG is current through the latest stream (BACKLOG-051/054/055, P-04, P-07) - a direct
  fix of v1 Risk 5 that has held.

## Strengths

- Machine-enforced tri-stack parity (memory keys, feature presence, 177 step-text lines, RA
  headers) with a CI fan-in `gate` job for branch protection.
- Honest governance: superseded decisions (MIT worklist default vs delivered ISC D-06) recorded
  with their full history instead of rewritten.
- Lifecycle currency actively managed: Reqnroll/.NET 10 (DR-036), Node 24, zero dependency
  advisories, lockfile-pinned restores in all three ecosystems.
- Review-to-remediation loop demonstrably works: all eight v1 findings closed with evidence
  within two weeks, each traceable worklist -> backlog -> PR -> code.

## Weaknesses

- Static-analysis scope excludes the showcase test layer (Risk 1).
- One live governance contradiction in `CLAUDE.md` plus a guard blind spot (Risk 2).
- Local-tooling currency nits: pwsh 7.4 compose pin (Risk 3), unenforced Node engines floor
  (Risk 4).
- DEMOAPP003 remains unverifiable on a dev machine without a .NET 10 SDK - worth a README note
  that CI is the authoritative gate for that Stack (I-2).

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
