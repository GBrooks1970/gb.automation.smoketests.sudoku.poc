[Review index](00_CODE_REVIEW_CODEX_v1_20260723T2351Z.md) > Recommendations

# Recommendations

## Prioritised Improvement Plan

| Priority | Review action | Outcome | Suggested effort | Risk |
|----------|---------------|---------|------------------|------|
| P0 | R1: Make orchestration behaviour observable | Specifications fail when call order, iteration progress, or required algorithms regress | Medium | Medium |
| P1 | R2: Enforce boolean rejection across stacks | One external-input contract in all languages | Small | Low |
| P1 | R4: Establish lower-level test and contract evidence | Better fault detection and honest pyramid claims | Medium to large | Low |
| P2 | R3: Reconcile live documentation | Cold-start contributors receive one current story | Medium | Low |
| P2 | R5: Equalise CI audit and artefact evidence | Comparable assurance and diagnostics across stacks | Medium | Low |

These identifiers refer to findings in this review. They are not backlog IDs. The authoritative backlog should allocate new IDs during an authorised triage pass.

## 1. Repair Orchestration Evidence

Use an explicit observer or strategy boundary around technique invocations. The observer should record:

- iteration number;
- technique name;
- unit type and index where applicable;
- attempt sequence;
- whether the attempt changed the grid;
- cells changed or an immutable before/after digest.

Tests can then assert exact attempts independently of successful changes. Keep the production algorithm implementation unaware of BDD framework types. This resolves the current ambiguity without coupling the solver to Cucumber, pytest-bdd, or Reqnroll.

Add a fixture-characterisation test before changing `Logic Squeeze Grid`. If no compact puzzle genuinely requires all three basic techniques, narrow the scenario name and test exact techniques actually required. A truthful two-technique scenario is preferable to a manufactured claim.

## 2. Make Boundary Parity Executable

Add canonical examples for values whose types differ across languages:

- JSON `true` and `false`;
- non-integral numbers;
- numeric strings;
- `null`;
- nested/non-array rows.

The existing feature already covers several structure cases; extend it minimally for the boolean gap. Keep rejection messages stable only where message text is part of a public contract.

## 3. Build a Real Test Pyramid

Add small, framework-native tests below the Gherkin layer:

- loader table tests for type, range, dimensions, duplicates, and missing names;
- algorithm tests using minimal grids that demonstrate one exact elimination/placement;
- orchestrator tests using spies/fakes for attempt order, fixpoint termination, and no-progress exit;
- API service tests for validation/status mapping;
- OpenAPI response validation for representative success and failure paths.

Do not reproduce all 46 scenarios at every level. Select tests according to defect localisation and mutation sensitivity. Capture a coverage baseline first, then set thresholds that protect meaningful code rather than rewarding line execution.

## 4. Restore Documentation Authority

Define one current authority per topic:

| Topic | Proposed authority | Treatment of other documents |
|-------|--------------------|------------------------------|
| Public project status and entry point | Root README | Stack docs link back |
| Runtime/dependency commands | Stack manifests and stack READMEs | Generated snippets where practical |
| API behaviour | OpenAPI | Design proposal marked historical or reconciled |
| Delivery status | Authoritative backlog | Narrative summaries derived or checked |
| Review inventory | `DOCS/.review/README.md` | `DOCS/README.md` links to it |
| Architecture version | Reference architecture | Currency script checks consumers |

Update stale facts in one commit with corresponding indexes. Extend automated guards only for stable, high-value facts; avoid brittle checks for prose formatting.

## 5. Equalise CI Evidence

- Run npm audit from the committed lock file under Node 24.
- Add `pip-audit` as a governed development tool and audit the locked/constraint-resolved Python environment.
- Run the NuGet vulnerability command under .NET 10 and locked restore.
- Emit Cucumber JSON/JUnit, pytest JUnit, and TRX for all stacks.
- Upload each result even when a test job fails, subject to safe retention.
- Add OpenAPI lint and response-contract checks.
- Preserve read-only workflow permissions, disabled persisted credentials, and the final fan-in job.

## Recommendations Against Existing Open Backlog

- BACKLOG-014: retain as open. Add advanced techniques only after the basic orchestration evidence is trustworthy.
- BACKLOG-015: retain as open. A tutor should consume structured explanation/audit data, so the R1 observer design can reduce later rework.
- BACKLOG-016: retain as open. A generator will need stronger solver-oracle and uniqueness tests; R4 should precede it.

## Questions Requiring Owner Decision

1. Authorise a separate backlog/index triage change for this immutable review.
2. Choose whether the REST design document becomes current or historical.
3. Choose whether the all-three fixture or the scenario claim changes.

No recommendation requires merging this review PR before those decisions are made.

---

Review: CODE_REVIEW_CODEX_v1_20260723T2351Z | Reviewer: AI assistant (Codex, GPT-5) | Generated: 2026-07-23T23:51Z
