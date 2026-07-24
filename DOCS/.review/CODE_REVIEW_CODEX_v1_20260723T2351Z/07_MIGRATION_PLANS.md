[Review index](00_CODE_REVIEW_CODEX_v1_20260723T2351Z.md) > Migration Plans

# Migration Plans

These plans describe corrective migrations, not implementation performed by this review. Each should receive an authoritative backlog ID before work begins.

## Plan A - Observable Orchestration Contract

**Priority:** P0

**Effort:** Medium

**Change risk:** Medium

**Finding:** R1

### Preconditions

1. Decide whether `Logic Squeeze Grid` or its scenario wording is authoritative.
2. Define an implementation-neutral attempt-event schema.
3. Preserve current solver outcome and audit-result compatibility unless a decision record approves a contract change.

### Steps

1. Add characterisation tests for current algorithm sequence and result grids.
2. Introduce an attempt observer/trace at each orchestrator call site.
3. Record attempt and change as separate facts.
4. Add lower-level orchestration tests using spies/fakes.
5. Change the canonical Gherkin to assert order, iterations, and technique participation using the new evidence.
6. Update all three bindings in the same change and run feature/step parity.
7. Re-run all stack tests and compare result/audit snapshots.

### Exit Criteria

- Removing, reordering, or skipping any promised technique causes a focused test failure.
- The all-three scenario proves three distinct technique changes, or its wording no longer claims that.
- Multiple-iteration scenarios assert iteration count and per-iteration progress.
- All three stack gates and parity checks pass.

### Rollback

The observer can be removed without changing algorithm implementations if it is kept behind a narrow interface. Do not discard the pre-change characterisation fixtures.

## Plan B - Cross-Stack Boundary Normalisation

**Priority:** P1

**Effort:** Small

**Change risk:** Low

**Finding:** R2

### Steps

1. Add a canonical boolean-cell rejection scenario.
2. Bind it in all stacks before changing Python.
3. Replace the Python type check with exact non-boolean integer validation.
4. Add a focused Python loader test for `true` and `false`.
5. Re-run parity and all stack suites.
6. Update the validation-boundary evidence only if error wording or status codes change.

### Exit Criteria

- Identical malformed JSON is rejected by every loader and REST entry point.
- No valid integer puzzle changes behaviour.
- Canonical feature and step parity remain exact.

### Rollback

This is a boundary tightening. If an undocumented consumer relies on booleans, reject them with a migration error rather than silently restoring coercion.

## Plan C - Test-Evidence Layering

**Priority:** P1

**Effort:** Medium to large

**Change risk:** Low

**Finding:** R4

### Steps

1. Inventory production branches and map each to the best test level.
2. Add focused loader, technique, and orchestrator unit/component suites.
3. Add API service tests and OpenAPI lint/response validation.
4. Establish coverage baselines for all stacks.
5. Trial mutation testing on loader/orchestrator code to identify weak assertions.
6. Set incremental thresholds only after reviewing generated exclusions.
7. Update the root test-strategy claim to match measured evidence.

### Exit Criteria

- Each production layer has a stated test level and purpose.
- Coverage is collected in CI and reported consistently.
- At least one mutation-sensitive test detects removal/reordering of every basic technique call.
- OpenAPI implementation drift fails a gate.

### Rollback

Coverage thresholds should be introduced in report-only mode first. A faulty threshold can be reverted without removing the new tests or generated evidence.

## Plan D - Documentation Currency Reset

**Priority:** P2

**Effort:** Medium

**Change risk:** Low

**Finding:** R3

### Steps

1. Confirm authorities for project status, API contract, backlog state, architecture version, and review inventory.
2. Update root and stack READMEs from manifests and current test output.
3. Reconcile or mark the REST design as historical.
4. Correct stale backlog detail without changing item history.
5. Update both review indexes in the same commit.
6. Extend currency checks for stable facts.
7. Record any substantive architectural choice in the decision register.

### Exit Criteria

- A cold-start reader encounters no contradictory public/private, framework, runtime, test-count, or API-status claim.
- Every review directory is discoverable from the authoritative index.
- Automated currency checks fail on the high-value drift cases.

### Rollback

Documentation changes are independently reversible. Historical records and immutable review contents must not be rewritten.

## Plan E - Symmetric CI Assurance

**Priority:** P2

**Effort:** Medium

**Change risk:** Low

**Finding:** R5

### Steps

1. Add supported-runtime dependency audits to each stack job.
2. Configure structured test result output for Cucumber, pytest, and `dotnet test`.
3. Upload evidence with consistent names and retention.
4. Add coverage and OpenAPI checks from Plan C.
5. Keep the current least-privilege workflow and fan-in job.
6. Document policy for audit-tool outages and vulnerability exceptions.

### Exit Criteria

- Every stack produces a test report and dependency-audit result.
- An audit failure has an explicit, reviewable exception path.
- Evidence is available even when a stack test fails.
- The final gate cannot pass when a required assurance job fails.

### Rollback

Introduce evidence publication before making audits blocking. If a registry/tool outage creates instability, temporarily return only that audit to report-only mode through an explicit, time-bounded decision.

## Recommended Sequence

```text
Backlog triage
    |
Plan A -> Plan B
    |        |
    +-----> Plan C
               |
          Plan D -> Plan E
```

Plan A should precede BACKLOG-014. Plan C should precede BACKLOG-015 and BACKLOG-016 because tutor explanations and generator uniqueness both depend on trustworthy solver evidence.

---

Review: CODE_REVIEW_CODEX_v1_20260723T2351Z | Reviewer: AI assistant (Codex, GPT-5) | Generated: 2026-07-23T23:51Z
