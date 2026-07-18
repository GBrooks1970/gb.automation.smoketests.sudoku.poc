# Cross-Project Analysis

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

Single-repository review: "cross-project" here means cross-cutting across the three Stacks, the
parity tooling, CI, containers, and the documentation system.

## Tool-Agnostic Tests - can tests run across frameworks?

- Yes, by construction: one canonical feature file executes under Cucumber+Serenity/JS,
  pytest-bdd, and Reqnroll with zero step-text divergence (177/177 lines matched per Stack in
  this review's parity run).
- The tag model (`@util`, `@stack-demoappNNN`) keeps surface selection declarative; the RA's
  `@util` surface contract (RA §6.0, DR-021) is what each Stack implements.
- Framework idioms are absorbed in the glue layer (Serenity actors vs pytest fixtures vs
  Reqnroll bindings), never in the feature text - the correct place.

## Single Source of Truth - feature file and data consistency

- `features-shared/util-tests/sudoku-solver/` is canonical; Stack copies are generated
  propagations guarded by the feature-parity and step-text gates (both PASS).
- Test data follows RA §5.6: each Stack carries its own read-only `puzzles.json`; scenario
  isolation is by deep-copy snapshot methods (`getGrid`/`get_grid`/`GetGrid`, BACKLOG-037).
- The backlog is the single authoritative status record, and its claims checked out in this
  review (open-item count, suite baselines, remediation evidence).

## Screenplay Parity - consistency across Stack implementations

- The SUD-20 change is a model of parity discipline: the same tracked-order Ability method,
  Task factory, and Then-step invariants appear in all three Stacks with language-appropriate
  naming (`solvePuzzleTrackingOrder` / `solve_puzzle_tracking_order` /
  `SolvePuzzleTrackingOrder`), and DEMOAPP003's `AuditTrail` gained `TotalIterations`
  specifically to keep the assertion set identical.
- Memory keys are constant-for-constant identical (6 keys x 3 Stacks, script-verified PASS).
- Residual asymmetry is declared, not hidden: DEMOAPP001's API/web surfaces are staged
  capability per the matrix; core solver + BDD parity are the required set.

## Documentation Alignment - consistency and completeness

- README, CHANGELOG, backlog, decision register, and platform spec agree on every checkable
  claim this review tested (scenario counts, runtimes, licence, capability staging).
- The one contradiction found is inside `CLAUDE.md` itself (DR range, Risk 2) - notable
  precisely because it is the last unguarded governance file.
- The review-output convention (this directory structure, `DOCS/.review/` deviation) is
  registry-recorded and matched by ten prior review directories.

## Batch File Design - alignment and drift

- `.batch/run-parity-checks.ps1` composes the four gates in the same order CI runs them - one
  definition of "parity" for local, compose, and CI paths.
- Scripts are self-describing (header comments state contract, exit codes, and the history that
  motivated them - `check-ra-header-currency.ps1` is exemplary).
- Drift risk sits in the container pin, not the scripts: the compose parity service runs pwsh
  7.4/Ubuntu 22.04 vs CI's ubuntu-latest pwsh 7.5 (Risk 3).

## Test Coverage Metrics - quantitative assessment

- 46 scenarios / 257 steps per Stack; 138 scenario executions across Stacks; 177 canonical step
  lines; 6 shared memory keys; 4 automated parity gates; 9 REST endpoints under OpenAPI
  contract; 0 npm audit findings; 3 Open backlog items (all parked product futures).
- DEMOAPP001 run time locally: ~17s for the full BDD suite; DEMOAPP002: ~3.5s - fast enough
  that nobody has a speed excuse to skip them.
- No line/branch coverage tooling is wired; for a behaviour-specification POC the
  scenario-per-requirement mapping is the more meaningful metric, and it is complete for the
  v1.0/v1.1 contract.

## API Contract Compliance

- DEMOAPP001's Express API is documented by a maintained OpenAPI 3.0 contract
  (`docs/openapi.yaml`, nine endpoints, structured error codes - DR-035 requires it to change
  in the same commit as any endpoint change).
- Structure re-validation on every grid-accepting endpoint plus `POST /api/validate` for
  constraints matches the documented validation-boundary contract.
- N/A beyond DEMOAPP001 - API surfaces for Python/C# are roadmap-staged, so no contract
  divergence can exist yet.

## Logging Alignment

- Audit-event shape is parity-managed across Stacks (`totalIterations`/`events` keys in TS and
  Python dicts, `TotalIterations`/`Events` in the C# record) and asserted through the shared
  ordering invariants.
- N/A for operational logging - the Stacks are test suites plus a local demo server; there is
  no production log pipeline to align.

## Code-Agnostic Tests

- The behavioural contract is fully language-independent (canonical Gherkin + RA memory-key
  contract); implementation languages are swappable per the RA's Stack-onboarding howto, which
  DEMOAPP002/003 followed in practice.
- The one deliberate mechanism difference (C# typed deserialization as the integer gate vs
  explicit `Number.isInteger`/`isinstance` checks) is documented as such
  (SUD-06, `validation-boundaries.md` §2.1) - difference-with-rationale, not drift.

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
