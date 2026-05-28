# TODO: Advanced Solving Techniques

**Created:** 2026-05-24T00:00:00Z
**Last Updated:** 2026-05-24T00:00:00Z
**Algorithm Reference:** `DOCS/.algorithm/sudoku-advanced-solver.md`
**Backlog Reference:** BACKLOG-014 (Advanced Solving Techniques)
**Stack(s):** DEMOAPP001 and future Stacks
**Estimated Effort:** 40-80 hours depending on selected technique scope

---

## Overview

Implementation plan for extending the deterministic Sudoku solver beyond Unit Completion, Hidden Singles, and Naked Singles.

Advanced techniques require candidate tracking and candidate elimination. This is a larger solver capability change than adding another placement-only method. The first implementation should therefore define a narrow MVP and protect existing behavior before expanding to more techniques.

---

## Status Legend

| Field | Allowed values |
|-------|----------------|
| Done | `[ ]` not complete, `[x]` complete |
| Status | `Not Started`, `In Progress`, `Blocked`, `Complete`, `Skipped` |

When a sub-item is finished, set `Done` to `[x]` and `Status` to `Complete`. If a sub-item is not applicable, set `Done` to `[x]`, `Status` to `Skipped`, and explain why in Notes.

---

## Current Baseline

| Area | Current state |
|------|---------------|
| Current techniques | Unit Completion, Hidden Singles, Naked Singles |
| Current stuck status | `STUCK_ON_ADVANCED_LOGIC` |
| Current design scope | Basic solver is deterministic and does not use backtracking |
| Existing advanced reference | `DOCS/.algorithm/sudoku-advanced-solver.md` lists Naked/Hidden Pairs, Triples, X-Wing, Swordfish, Jellyfish, and chains |
| Active parity model | Canonical Gherkin under `features-shared/`, Stack-local copies under each active Stack |

---

## Target Outcomes

| Done | Status | Outcome | Acceptance check |
|------|--------|---------|------------------|
| [ ] | Not Started | Candidate tracking model exists | Empty cells have deterministic candidate sets derived from row/column/block constraints |
| [ ] | Not Started | At least one scoped advanced technique is implemented | MVP technique has unit and integration coverage |
| [ ] | Not Started | Advanced techniques are orchestrated after basic techniques | Existing easy/basic puzzles still solve as before |
| [ ] | Not Started | Candidate eliminations are audit-visible | Audit trail or visualisation can distinguish placement vs elimination if included in scope |
| [ ] | Not Started | Canonical behavior is specified | Shared Gherkin or other approved test contract covers the new behavior |
| [ ] | Not Started | Multi-Stack impact is explicit | DEMOAPP001 implemented first; future Stack parity path documented |

---

## Scope Decision Gate

Complete this section before implementation starts.

| ID | Done | Status | Decision item | Notes |
|----|------|--------|---------------|-------|
| S0.1 | [ ] | Not Started | Choose MVP technique set | Recommended MVP: candidate model plus Naked Pairs; add Hidden Pairs only if time allows |
| S0.2 | [ ] | Not Started | Decide whether candidate elimination events are part of the public audit/API/Web UI contract | If public response contracts change, document clearly |
| S0.3 | [ ] | Not Started | Decide whether `STUCK_ON_ADVANCED_LOGIC` should be renamed or preserved | Prefer preserving status until a broader result taxonomy is designed |
| S0.4 | [ ] | Not Started | Decide multi-Stack rollout strategy | Recommended: implement DEMOAPP001 first, then create follow-up parity items for DEMOAPP002/DEMOAPP003 |
| S0.5 | [ ] | Not Started | Decide whether this requires a Decision Record | A structural change to solver contracts, statuses, or parity scope likely needs a DR |

---

## Phase 1: Candidate Model

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 1.1 | [ ] | Not Started | Define candidate data structure | Suggested: per-cell `Set<number>` or sorted `number[]` with deterministic serialization |
| 1.2 | [ ] | Not Started | Implement candidate initialization from current grid | Candidates must respect row, column, and block constraints |
| 1.3 | [ ] | Not Started | Implement candidate recomputation or incremental update strategy | Prefer correctness and simplicity first |
| 1.4 | [ ] | Not Started | Add helpers for row/column/block units and peer lookup | Avoid duplicating unit traversal logic in each technique |
| 1.5 | [ ] | Not Started | Add tests for candidate initialization | Include empty grid, constrained cell, solved grid, and invalid/duplicate grid behavior |
| 1.6 | [ ] | Not Started | Confirm candidate ordering is deterministic | Important for audit logs, UI display, and reproducible tests |

---

## Phase 2: Technique MVP

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 2.1 | [ ] | Not Started | Implement Naked Pairs detection | Use `DOCS/.algorithm/sudoku-advanced-solver.md` pseudocode as reference |
| 2.2 | [ ] | Not Started | Implement Naked Pairs candidate elimination | Return whether candidates changed |
| 2.3 | [ ] | Not Started | Convert single-candidate results into placements | Candidate eliminations may reveal new Naked Singles |
| 2.4 | [ ] | Not Started | Add focused tests for row, column, and block Naked Pairs | Each unit type should have a positive and no-op case |
| 2.5 | [ ] | Not Started | Add integration puzzle that requires Naked Pairs but no backtracking | Keep fixture small and explain expected progression |
| 2.6 | [ ] | Not Started | If MVP includes Hidden Pairs, repeat tasks 2.1-2.5 for Hidden Pairs | Otherwise mark skipped |

---

## Phase 3: Orchestration

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 3.1 | [ ] | Not Started | Define advanced technique order | Recommended: basic cycle first, then advanced elimination, then repeat basic cycle |
| 3.2 | [ ] | Not Started | Update orchestrator without breaking existing constructor/API usage | Existing tests must continue to compile and pass |
| 3.3 | [ ] | Not Started | Prevent infinite loops | Track whether placements or candidate eliminations occurred in each pass |
| 3.4 | [ ] | Not Started | Add max-iteration guard if not already sufficient | Guard should fail clearly if a loop bug is introduced |
| 3.5 | [ ] | Not Started | Preserve deterministic output sequence | Same input should produce the same solve trace |
| 3.6 | [ ] | Not Started | Confirm basic-only behavior remains stable for existing puzzles | Existing expected statuses should not change unless explicitly accepted |

---

## Phase 4: Audit, API, and Web UI Impact

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 4.1 | [ ] | Not Started | Decide how candidate eliminations are represented in audit events | Existing `CellChange` models placements; eliminations may need a new type |
| 4.2 | [ ] | Not Started | Update REST API response types only if public output includes advanced detail | Avoid unnecessary public contract churn |
| 4.3 | [ ] | Not Started | Update Web UI visualisation only if advanced events are exposed | Candidate elimination visualization can be deferred |
| 4.4 | [ ] | Not Started | Add API integration tests if `/api/solve` behavior changes | Include solved and stuck outcomes |
| 4.5 | [ ] | Not Started | Document any response contract changes | Include examples in relevant docs |

---

## Phase 5: Canonical Behavior and Stack Parity

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 5.1 | [ ] | Not Started | Add or update canonical Gherkin scenarios for the selected advanced technique | Follow canonical feature change governance |
| 5.2 | [ ] | Not Started | Propagate canonical scenarios to DEMOAPP001 Stack-local feature copy | Preserve stack-local tags only in Stack copy |
| 5.3 | [ ] | Not Started | Decide whether DEMOAPP002 receives implementation in the same backlog item | If deferred, create a specific follow-up backlog item |
| 5.4 | [ ] | Not Started | Run feature parity and step-text parity checks | Required after canonical feature changes |
| 5.5 | [ ] | Not Started | Update Screenplay Tasks/Questions instead of placing logic in step definitions | Preserve Layer 2 thinness |

---

## Phase 6: Documentation

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 6.1 | [ ] | Not Started | Update `DOCS/.algorithm/sudoku-advanced-solver.md` if implementation differs from draft pseudocode | Keep algorithm doc accurate |
| 6.2 | [ ] | Not Started | Update `DOCS/.design/sudoku-solver-specification.md` if advanced techniques become in scope | This may require a design version/status update |
| 6.3 | [ ] | Not Started | Update README known limitations | Remove or refine "advanced techniques out of scope" wording only after implementation |
| 6.4 | [ ] | Not Started | Update `DOCS/.planning/BACKLOG.md` after implementation | Mark BACKLOG-014 resolved only when acceptance criteria are met |
| 6.5 | [ ] | Not Started | Create an implementation log | Use `DOCS/.templates/implementation-log.template.md` |

---

## Phase 7: Verification Matrix

| ID | Done | Status | Command / Check | Expected result |
|----|------|--------|-----------------|-----------------|
| 7.1 | [ ] | Not Started | DEMOAPP001 TypeScript build | `npm run build` exits `0` |
| 7.2 | [ ] | Not Started | DEMOAPP001 lint | `npm run lint` exits `0` |
| 7.3 | [ ] | Not Started | DEMOAPP001 API integration | `npm run test:api` exits `0` |
| 7.4 | [ ] | Not Started | DEMOAPP001 Cucumber suite | `npm test` exits `0` |
| 7.5 | [ ] | Not Started | DEMOAPP002 pytest suite if impacted | `python -m pytest` exits `0` |
| 7.6 | [ ] | Not Started | Memory key parity | `.batch/check-memory-key-parity.ps1` exits `0` |
| 7.7 | [ ] | Not Started | Feature parity | `.batch/generate-feature-parity-report.ps1` exits `0` |
| 7.8 | [ ] | Not Started | Step text parity | `.batch/check-step-text-parity.ps1` exits `0` |
| 7.9 | [ ] | Not Started | Advanced fixture solve trace | Selected advanced puzzle progresses through the intended technique |

---

## Suggested File Changes

| Done | Status | Path | Purpose |
|------|--------|------|---------|
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/app_src/` | Candidate model and advanced technique implementation |
| [ ] | Not Started | `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` | Canonical behavior scenarios if shared feature contract changes |
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature` | Stack-local copy of canonical scenarios |
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/tests/screenplay/` | Tasks, Questions, and step definitions for new scenarios |
| [ ] | Not Started | `DOCS/.algorithm/sudoku-advanced-solver.md` | Algorithm documentation updates |
| [ ] | Not Started | `DOCS/.implementation-logs/YYYY-MM-DD_advanced-solving-techniques.md` | Implementation session log |

---

## Acceptance Criteria for BACKLOG-014

| Done | Status | Acceptance criterion | Evidence |
|------|--------|---------------------|----------|
| [ ] | Not Started | Candidate model is implemented and tested | Link tests and command output |
| [ ] | Not Started | At least one scoped advanced technique is implemented | Link code/tests |
| [ ] | Not Started | Existing basic solver behavior remains green | Record standard validation commands |
| [ ] | Not Started | New advanced behavior is covered by canonical or approved Stack-local tests | Link feature/test coverage |
| [ ] | Not Started | Public API/Web UI/audit impacts are documented or explicitly out of scope | Link docs or implementation log note |
| [ ] | Not Started | Multi-Stack parity path is documented | Same-item implementation or follow-up backlog item |

---

## Notes for Implementers

- Do not add backtracking to the deterministic solver as part of this backlog item unless the product scope is explicitly changed and documented.
- Candidate elimination is not the same as cell placement; model and audit it deliberately.
- Keep implementation deterministic and explainable.
- Start with one advanced technique and expand only after candidate infrastructure is proven.

