# Cross-Cutting Analysis Within the Repository

[<- Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (Codex GPT-6)

## Tool-Agnostic Tests

- One shared Gherkin corpus is executed by three runners; adapters normalise their native result formats. [tools/parity-page/check-parity.mjs](../../../tools/parity-page/check-parity.mjs) (line 42).
- Source parity proves text alignment; result parity proves a narrower observed execution contract, subject to S-04.
- Framework-specific reporting and setup remain appropriate at the edge; do not force identical runner internals.

## Code-Agnostic Tests

- Behavioural scenarios cross TypeScript, Python and C# while native component tests exercise language-specific boundaries.
- S-03 identifies precisely where similar interfaces do not yet have equivalent missing-file behaviour.
- API/browser tests are TypeScript capability tests and should not be included in common-core parity totals.

## Single Source of Truth

- Shared features and copied stack features are guarded for parity; the backlog is the status authority. [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 28).
- Source manifests and lockfiles determine installed dependencies; historical audit acceptance is not today's feed result.
- Fixed advanced fixtures partially bypass the parameters of the purported single specification (S-06).

## API Contract Compliance

- The Express application uses explicit typed parsers and a 100 KB JSON limit. [demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) (line 32).
- OpenAPI lint and eight native contract tests passed, but seed acceptance still differs from the schema (S-05).
- Three individual technique endpoints do not imply all five techniques have dedicated endpoints; the complete solve pipeline is a separate API capability.

## Screenplay Parity

- Actors receive solver, puzzle-loader and note-taking capabilities together. [demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts) (line 20).
- Per-scenario state is recreated rather than sharing a global puzzle across cases; native .NET and Python tests passed in the isolated baseline.
- Fixed Given fixtures are an assurance weakness even where all three stacks duplicate them consistently.

## Batch File Design

- `.batch` scripts centralise documentation, source parity, audit policy and evidence controls; CI invokes native stack commands. [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) (line 15).
- Audit validation fails closed on an expired exception, which is correct policy behaviour; the stale policy data is the defect (S-02).
- The documentation guard also scans review inventory. Its initial scratch failure was missing historical review directories, not a source defect; the restored baseline passed. [.batch/check-ra-header-currency.ps1](../../../.batch/check-ra-header-currency.ps1) (line 422).

## Documentation Alignment

- Current backlog counts and native baseline counts agree within their named scopes. [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 28).
- Previously resolved Then assertions and separately deferred Given work are not conflated. [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 48).
- Registry freshness, historical audit dates and three-technique inline comments deserve targeted updates, not wholesale rewriting of historical records.

## Logging Alignment

- CI retains each stack's native tests, coverage and audit evidence, with a seven-day retention window; Pages assembles the parity view only after the gate. [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) (line 15); [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) (line 374).
- Audit/attempt observations are explicit domain outputs, whereas runner logs are operational evidence. Keep their counts distinct.
- Partial Cucumber Messages must be rejected before converting declared steps into apparent execution evidence (S-04).

## Test Coverage Metrics

- Observed common BDD execution count is 55 per stack; TypeScript reports 309 steps. These are not 165 distinct business scenarios.
- Python's 85 comprises its BDD and component tests; C# is 28 component plus 55 BDD; TypeScript has 113 component tests plus its separate BDD lane.
- Historical coverage floors and mutation kills were inspected in CI/backlog but not remeasured in this review. No current line/branch coverage percentage is asserted.

## Runtime Lifecycle, Data and Synchronisation

The solver lanes are synchronous, deterministic local computations, with fresh scenario abilities and explicit fixtures; they do not need browser sleep-based synchronisation. The separate tutor/player is stateful browser code, whose interactive races were not rerun here. API integration checks were exercised by their own script; no shared fixed-port service or Docker stack was started by the coordinating reviewer. Missing fixture selection and ignored Given parameters are the concrete data risks (S-03/S-06). There are no user tokens in the common solver suite. The unauthenticated demo API and permissive CORS must remain scoped to the intended demo environment.

## CI and Local Reproducibility

Three stack jobs gate parity and the site build, while Pages write permissions are confined to the deploy job. npm/pip caches key from lock inputs; .NET uses locked restore. Actions are version-tagged rather than digest-pinned; this is a supply-chain hardening opportunity, not a proved compromise. Docker Compose provides test/API/benchmark lanes but does not equal every CI gate. Docker was not started, images were not pulled and storage was not inspected; any later Docker work must verify `E:\_DockerData`. No live CI conclusion is drawn from local success.

---

[<- Previous](03_PROJECT_REVIEWS/PROJECT_001_SUDOKU.md) | [Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](05_RECOMMENDATIONS.md)
