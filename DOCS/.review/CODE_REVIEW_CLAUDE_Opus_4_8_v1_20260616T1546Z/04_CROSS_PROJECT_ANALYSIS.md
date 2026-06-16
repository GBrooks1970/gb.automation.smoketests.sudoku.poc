# Cross-Cutting Analysis (within the repository)

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Project Review](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

Per the single-repository customisation, this is a cross-cutting analysis *within* the repo: suite
vs CI vs parity tooling vs API vs documentation. Each area carries 3-5 bullets.

---

## Tool-Agnostic Tests

- The same canonical Gherkin feature drives three different BDD runners (Cucumber.js + Serenity/JS,
  pytest-bdd, SpecFlow + NUnit), proving the behavioural contract is genuinely framework-agnostic.
- The canonical feature carries only `@util`; stack-local copies add a single stack tag
  (`@stack-demoappNNN`). This review confirmed the non-tag bodies are byte-identical across all
  three stacks (diff of tag-stripped files).
- Each stack expresses the same scenarios in its runner's idiom (Cucumber step glue, pytest-bdd
  step functions, SpecFlow `[Binding]` steps) without altering step text - the step-text parity
  gate enforces this (177 step lines match per stack).

## Code-Agnostic Tests

- The behavioural assertions are language-independent: they are stated over solver outcomes
  (`SOLVED`, `STUCK_ON_ADVANCED_LOGIC`), grid contents, and cell placements, not over any
  language's data structures.
- Memory-key constants are identical strings across stacks (name == value, set-equal), so the
  Screenplay Actor-Memory contract is the same regardless of implementation language - verified by
  `check-memory-key-parity.ps1` (all 6 keys OK in all three stacks).
- The one acknowledged code-level asymmetry is the C# loader's integer-validation mechanism
  (typed deserialization vs explicit check); it is a mechanism difference, not a behavioural one,
  and is documented (SUD-06, validation-boundaries section 2.1).

## Single Source of Truth (features and data)

- `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` is the canonical
  source; stack copies are propagated per the documented update procedure in CLAUDE.md.
- The feature-parity report (`generate-feature-parity-report.ps1`) ran PASS in this review,
  confirming no scenario presence drift.
- Test data (`puzzles.json`) is Stack-local and read-only during execution (RA Section 5.6
  compliant per RA-007/DR-026). Each stack carries its own copy; this is a deliberate
  Stack-local-data choice, not unmanaged duplication.

## API Contract Compliance (REST / OpenAPI)

- The DEMOAPP001 API is described by an authored OpenAPI 3.0.3 document
  ([openapi.yaml](../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml)) adopted by
  DR-035; this review cross-checked it against
  [app.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) and the paths,
  methods, error codes, and the structure/constraint validation split all match the implementation.
- Error responses use stable machine-readable codes (`MISSING_GRID`, `INVALID_GRID_FORMAT`,
  `INVALID_JSON`, `INVALID_TARGET_NUMBER`, `PUZZLE_NOT_FOUND`, `ROUTE_NOT_FOUND`,
  `AUDIT_TRAIL_UNAVAILABLE`, `INTERNAL_SERVER_ERROR`), all enumerated in the spec.
- Validation layering is explicit and consistent between code, OpenAPI, and
  `validation-boundaries.md`: structure on every grid endpoint, constraint only on
  `POST /api/validate`.
- The contract is authored (not generated) and the spec itself states it must be updated in the
  same change as any endpoint change - a sensible discipline, though it relies on reviewer
  vigilance rather than a generator.

## Screenplay Parity

- All three stacks implement Abilities, Tasks, Questions, and Actor Memory; step definitions
  delegate through the actor rather than calling Abilities directly (MIG-04/05, DR-015).
- The parity contract document records canonical Memory keys, Task/Question signatures, and parity
  expectations; two earlier "anti-pattern" findings (BACKLOG-032/033) were confirmed false
  positives because the TypeScript reference exhibits the same intentional pattern - good
  cross-stack diligence.
- See [ANNEX/SCREENPLAY_PARITY.md](ANNEX/SCREENPLAY_PARITY.md) for the detailed three-stack
  evidence.

## Batch File Design

- Three focused parity scripts (`check-memory-key-parity.ps1`, `generate-feature-parity-report.ps1`,
  `check-step-text-parity.ps1`) plus run/benchmark orchestration scripts. Each has a single
  responsibility, a documented exit-code contract, and clear console output.
- The step-text parity script tokenises Gherkin correctly (ignores tags and structure, compares
  step lines positionally) and reports drift with line numbers - a genuinely useful, not
  ceremonial, gate.
- Drift risk: the scripts are PowerShell-only, so non-PowerShell contributors cannot run them
  locally without installing `pwsh` (Risk 5). They are cross-platform on CI via `pwsh`.

## Documentation Alignment

- Backlog, decision register, RA, validation-boundaries, and CLAUDE.md are mutually consistent and
  match the live tree.
- The root README is the one misaligned document: the Flask label, the "35+" count, and the
  non-ASCII style (Risks 1-3). All other docs verified accurate.
- The capability matrix appears in both the README and platform spec section 6.1 with consistent
  content; the cross-reference anchor resolves.

## Logging Alignment

- Audit logging is a first-class, opt-in feature across all three stacks (AuditLogger /
  audit.py / AuditLogger.cs) with consistent event/statistics shapes; the API exposes the audit
  trail through `solve` and `visualise`. Logging design is documented in
  `DOCS/.architecture/logging-design.md`. No drift observed in the audit event contract across
  stacks.

## Test Coverage Metrics

- 46 scenarios x 3 stacks = 138 scenario executions; DEMOAPP001 additionally 257 step executions
  and a separate API integration harness.
- All parity gates PASS; all stacks green locally. Quantitatively this matches the backlog's
  declared baseline exactly, so the documented metrics are trustworthy.

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Project Review](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
