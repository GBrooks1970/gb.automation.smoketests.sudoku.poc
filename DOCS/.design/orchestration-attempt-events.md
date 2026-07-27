# Orchestration Attempt Events - Design Document

**Version:** v1.1
**Date:** 2026-07-27T19:27Z
**Author:** Portfolio worklist SUD-21
**Reviewer:** Codex
**Status:** Implemented
**Decision:** DR-037

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis](#2-problem-analysis)
3. [Requirements](#3-requirements)
4. [Design Overview](#4-design-overview)
5. [Detailed Design](#5-detailed-design)
6. [Implementation Plan](#6-implementation-plan)
7. [Refactoring Strategy](#7-refactoring-strategy)
8. [Testing Strategy](#8-testing-strategy)
9. [Migration Path](#9-migration-path)
10. [Alternatives Considered](#10-alternatives-considered)
11. [Open Questions](#11-open-questions)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### Purpose

The existing audit trail records only algorithm calls that changed at least one cell. It therefore
cannot prove that a technique was attempted when it made no change, or that every promised call
occurred in the correct order. This design introduces an implementation-neutral, opt-in
`AttemptEvent` contract for SUD-22 while preserving the current change-oriented audit contract.

### Scope

**In scope:**

- A deterministic attempt-event schema and optional observer shared by TypeScript, Python and C#.
- The sequencing, immutability and compatibility rules for the observer.
- A characterisation baseline for the five current puzzles.
- An explicit decision about the inaccurate `Logic Squeeze Grid` all-three-techniques claim.

**Out of scope:**

- Changing solver results, algorithm order or the existing `AuditTrail` payload.
- Adding advanced techniques, backtracking or a general lower-level test framework.

### Key Decisions

1. **Separate attempts from audit changes.** Attempt events describe invocations; existing audit
   events remain the compatible record of successful cell changes.
2. **Use deterministic immutable evidence.** Events contain no timestamps and retain deep-copied
   change evidence, so all three stacks can compare the same trace.
3. **Narrow the `Logic Squeeze Grid` claim.** The current fixture demonstrates Hidden Singles and
   Naked Singles changes, not Unit Completion participation and not causal dependence on all three.

### Success Criteria

- Every current basic-technique call can be represented without language-specific types.
- An unchanged attempt remains observable with `changed: false` and an empty change list.
- Consumers cannot mutate a recorded event or its nested cell-change evidence.
- The implemented observer does not change the current solve result or audit response shape.

---

## 2. Problem Analysis

### Current State

Each orchestrator performs one Unit Completion call, nine Hidden Singles calls (digits 1 through
9), and one Naked Singles call per iteration. `AuditLogger` receives an event only when a call
changes cells. A successful solve can therefore have no Unit Completion audit event even though
Unit Completion was invoked every iteration.

The committed [characterisation evidence](../.analysis/orchestration-characterisation-20260727.md)
shows the same results in all three stacks. In particular, `Logic Squeeze Grid` solves in two
iterations with zero Unit Completion changes. Single-technique-removal probes also show that the
fixture still solves when any one of the three techniques is disabled.

### Root Cause Analysis

The audit feature was designed to explain mutations to the grid, not to act as an orchestration
spy. Later Gherkin used change events as indirect evidence of invocation order, which cannot prove
unchanged attempts and overstates the fixture's causal coverage.

### Constraints and Assumptions

- The current `AuditTrail` is used by the REST and web surfaces and remains backward compatible.
- Canonical feature changes must be applied to all three stacks in one change.
- Hidden Singles is invoked once per digit and performs row, column and box scans internally.
- Attempt observation must not depend on Cucumber, pytest-bdd or Reqnroll.
- The observer is diagnostic/test evidence; default solving remains free of required consumers.

### Stakeholders

| Stakeholder | Interest | Impact |
|---|---|---|
| Stack implementers | One language-neutral contract | High |
| Test authors | Mutation-sensitive orchestration evidence | High |
| REST/web consumers | Existing audit payload compatibility | High |
| Maintainers | Deterministic traces and low coupling | Medium |

---

## 3. Requirements

### Functional Requirements

**FR-1: Record every orchestrator attempt**

- Emit one event after every Unit Completion, Hidden Singles and Naked Singles invocation.
- Emit no events for an input rejected by the existing already-solved early exit.

**FR-2: Distinguish invocation from mutation**

- `changed` records the algorithm result.
- `changes` contains immutable cell-level evidence and is empty when `changed` is false.
- `changed` must equal `changes.length > 0` for the current basic techniques.

**FR-3: Preserve ordering information**

- `sequence` increases monotonically for the entire solve, starting at 1.
- `iteration` starts at 1 and groups attempts into solving passes.
- Hidden Singles records its target digit as `parameter`.

**FR-4: Preserve compatibility**

- Existing `AuditEvent`, `AuditTrail`, result strings and result grids do not change.
- The observer is supplied through a narrow optional interface or callback.

### Non-Functional Requirements

- **Determinism:** no timestamps, runtime object identities or framework types.
- **Immutability:** each event and every nested cell/change object is copied before publication.
- **Parity:** field meaning and zero/one-based conventions are identical in all stacks.
- **Maintainability:** stable technique identifiers use PascalCase values already used by audit.
- **Performance:** a missing/no-op observer adds only a conditional call at an algorithm boundary.

### Requirements Traceability

| Requirement | Design element | Verification owner |
|---|---|---|
| FR-1, FR-3 | Attempt-event schema and sequence invariants | SUD-22 focused tests |
| FR-2 | `changed` plus immutable `changes` | SUD-22 contract tests |
| FR-4 | Separate observer and audit types | Existing 46-scenario suites |
| Determinism/parity | Canonical field table | Cross-stack trace comparison |

---

## 4. Design Overview

### High-Level Architecture

```text
SudokuOrchestrator
  -> invoke algorithm
  -> collect immutable before/after change evidence
  -> publish AttemptEvent to optional observer
  -> continue existing solve loop

SudokuSolver -> existing AuditLogger -> existing change-only AuditTrail
```

The attempt observer and audit logger answer different questions. The observer proves what the
orchestrator invoked and in what order. The audit trail continues to explain which invocations
changed the grid.

### Components

| Component | Responsibility | Dependency |
|---|---|---|
| `AttemptEvent` | Immutable language-neutral evidence record | Existing cell-change shape |
| Attempt observer | Receives events in sequence | No test-framework dependency |
| Orchestrator instrumentation | Publishes after each call | Optional observer |
| Existing `AuditLogger` | Records successful changes | Unchanged |

### Design Principles

- **Single responsibility:** attempts and changes are separate evidence streams.
- **Dependency inversion:** production orchestration depends on an observer contract, not a runner.
- **Open/closed:** future techniques can add optional context without changing required fields.
- **KISS:** the schema uses primitives and arrays that map directly across all three languages.

---

## 5. Detailed Design

### 5.1 Canonical Attempt-Event Schema

| Field | Type | Required | Rule |
|---|---|---:|---|
| `iteration` | positive integer | Yes | One-based solving pass |
| `sequence` | positive integer | Yes | One-based and strictly increasing across the solve |
| `technique` | enum string | Yes | `UnitCompletion`, `HiddenSingles`, or `NakedSingles` |
| `parameter` | integer | No | Hidden Singles target digit, 1 through 9 |
| `unit` | enum string | No | `row`, `column`, or `box` when a future boundary identifies a unit |
| `index` | integer | No | One-based unit index when `unit` is present |
| `changed` | boolean | Yes | Whether the invocation changed at least one cell |
| `changes` | array | Yes | Immutable deep copies; empty exactly when `changed` is false |

Each `changes` entry uses the existing language-neutral cell-change fields:

```json
{
  "cell": { "row": 0, "col": 8 },
  "oldValue": 0,
  "newValue": 2,
  "reason": "optional human-readable detail"
}
```

Rows and columns stay zero-based because that is the existing audit contract. `unit`/`index` are
optional: the current orchestrator sees a Hidden Singles call for a target digit, while row,
column and box scans occur inside that method. Technique-focused tests must protect those internal
passes; the orchestration trace must not invent unit events it cannot observe.

### 5.2 Example Iteration

```json
[
  {
    "iteration": 1,
    "sequence": 1,
    "technique": "UnitCompletion",
    "changed": false,
    "changes": []
  },
  {
    "iteration": 1,
    "sequence": 2,
    "technique": "HiddenSingles",
    "parameter": 1,
    "changed": true,
    "changes": [
      { "cell": { "row": 4, "col": 7 }, "oldValue": 0, "newValue": 1 }
    ]
  }
]
```

The complete iteration continues through Hidden Singles parameter 9 and then Naked Singles.

### 5.3 Invariants

1. Event order is Unit Completion, Hidden Singles digits 1 through 9, then Naked Singles.
2. Every non-terminal iteration that leads to another pass contains at least one changed event.
3. The final no-progress iteration may contain eleven unchanged events.
4. An already-solved grid has an empty attempt trace.
5. Published event collections and nested changes cannot alias the solver's mutable grid.

### 5.4 Fixture Decision

No current compact fixture honestly proves causal dependence on all three techniques. The
`Logic Squeeze Grid` metadata is narrowed to say that the current solve records Hidden Singles and
Naked Singles changes while Unit Completion is attempted without changing a cell. SUD-22 aligns
the canonical scenario wording and bindings with that observable evidence and removes the
unprovable "requires all three" assertion.

### 5.5 Error Handling

Observer failures must fail the diagnostic/test invocation rather than be swallowed. Production
callers that do not supply an observer retain current behaviour. No network, file or clock access
belongs in the event contract.

---

## 6. Implementation Plan

### Phase 1 - Characterisation and Contract (SUD-21)

- Record the cross-stack baseline and the mutation probes.
- Approve DR-037 and this schema.
- Narrow non-executable fixture metadata/documentation without changing solver behaviour.

### Phase 2 - Instrumentation and Executable Specification (SUD-22, Complete)

- Added the optional observer contract in all three stacks.
- Published an event at every orchestrator call site.
- Added observer-spy component tests for removal/reordering sensitivity; the existing focused
  Hidden Singles row, column and box scenarios protect its internal passes.
- Updated canonical Gherkin first, propagated every binding, and retained parity.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Observer changes the audit response | Keep contracts and storage separate |
| Mutable evidence drifts after publication | Deep-copy and freeze/read-only-wrap nested data |
| Gherkin overstates a fixture again | Assert only trace evidence and mutation-sensitive outcomes |
| Language-specific naming drifts | Treat this field table as canonical |

---

## 7. Refactoring Strategy

SUD-22 adds the smallest optional seam needed by each language while keeping public solve results
and existing audit methods source-compatible. The observer can be removed independently if it
proves unsuitable; the committed characterisation evidence remains the rollback baseline.

---

## 8. Testing Strategy

- **Characterisation:** compare result, iteration and change counts against the committed baseline.
- **Contract:** verify required fields, indexing, monotonic sequence and immutability.
- **Mutation sensitivity:** removal or reordering of every promised call must fail a focused test.
- **Technique coverage:** direct tests must fail when a Hidden Singles row, column or box pass is
  removed, because those passes are inside one orchestrator call.
- **Regression:** run all three 46-scenario suites and all parity checks.
- **Compatibility:** compare pre/post SUD-22 result grids and existing audit trail projections.

---

## 9. Migration Path

1. Landed this approved contract and baseline without production changes in SUD-21.
2. Introduced optional observer types in all three stacks in SUD-22.
3. Added focused observer-spy tests before altering canonical scenario wording.
4. Updated the canonical feature and all local copies/bindings together.
5. Ran the full three-stack and parity gates with result and audit compatibility retained.

No data migration or consumer action is required.

---

## 10. Alternatives Considered

### Extend Existing Audit Events to Include Unchanged Calls

Rejected because it changes the semantics and payload volume of a REST/web-facing contract that
currently means "cell changes".

### Infer Attempts Permanently from Iteration Count

Rejected because a regression that removes or reorders a call would leave the inferred sequence
unchanged and preserve the false confidence identified by review R1.

### Replace `Logic Squeeze Grid` Immediately

Rejected for SUD-21 because current fixtures do not prove causal dependence on all three methods,
and inventing an unverified puzzle would trade one unsupported claim for another. The claim is
narrowed; a future fixture may be added when mutation evidence proves it.

### Couple Instrumentation to the BDD Runners

Rejected because production code would depend on Cucumber, pytest-bdd or Reqnroll and the three
implementations would not share a clean contract.

---

## 11. Open Questions

None block implementation. The fixture question is resolved in favour of narrower wording, and the
observer/audit relationship is resolved by DR-037. SUD-22's idiomatic language-specific type names
retain the field meanings above.

---

## 12. Appendices

### References

- [Characterisation evidence](../.analysis/orchestration-characterisation-20260727.md)
- [Existing audit design](audit-trail-feature.md)
- [Orchestration design](../.architecture/orchestration-design.md)
- [Codex review R1](../.review/CODE_REVIEW_CODEX_v1_20260723T2351Z/02_RISKS_AND_ISSUES.md#r1---orchestration-specifications-can-give-false-confidence-high)
- [Canonical feature](../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature)

### Document History

| Version | Date | Change |
|---|---|---|
| v1.1 | 2026-07-27 | Recorded the completed SUD-22 implementation and executable verification |
| v1.0 | 2026-07-27 | Approved SUD-21 attempt-event contract and fixture decision |

### Approval

Approved by the project owner on 2026-07-27 through the instruction to proceed with the
recommended SUD-21 worklist plan. DR-037 records the structural decision.
