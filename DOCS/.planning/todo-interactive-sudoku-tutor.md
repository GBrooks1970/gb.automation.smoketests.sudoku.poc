# TODO: Interactive Sudoku Tutor

**Created:** 2026-05-28T00:00:00Z
**Last Updated:** 2026-05-28T00:00:00Z
**Backlog Reference:** BACKLOG-015 (Interactive Sudoku Tutor)
**Stack(s):** Future product surface
**Estimated Effort:** 40-80 hours depending on UI/explanation depth
**Status:** Not Started

---

## Overview

Implementation plan for a future tutor surface that explains Sudoku solving decisions step by step. This remains Future priority until BACKLOG-014 and BACKLOG-016 clarify advanced-technique explanations and puzzle availability.

---

## Target Outcomes

| Done | Status | Outcome | Acceptance check |
|------|--------|---------|------------------|
| [ ] | Not Started | Tutor can load a puzzle | User can select a puzzle from existing puzzle data |
| [ ] | Not Started | Tutor can step through solver decisions | Each visible step explains technique, cell, value, and reason |
| [ ] | Not Started | Tutor distinguishes placements from future candidate eliminations | Depends on BACKLOG-014 if candidate events become public |
| [ ] | Not Started | Tutor provides hints without immediately solving | User can request the next logical hint |
| [ ] | Not Started | Tutor has tests for core flows | UI/API or component tests cover load, hint, step, reset |

---

## Dependency Gate

| ID | Done | Status | Decision item | Notes |
|----|------|--------|---------------|-------|
| D0.1 | [ ] | Not Started | Decide whether tutor is part of existing Web UI or a separate route | Recommended: extend existing DEMOAPP001 Web UI |
| D0.2 | [ ] | Not Started | Decide explanation source | Recommended: derive from audit/visualisation events first |
| D0.3 | [ ] | Not Started | Decide dependency on advanced techniques | Recommended: wait until BACKLOG-014 candidate/elimination model is settled |
| D0.4 | [ ] | Not Started | Decide generated-puzzle integration | Recommended: optional dependency after BACKLOG-016 |

---

## Suggested Implementation Phases

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 1.1 | [ ] | Not Started | Define tutor UX flow | Puzzle selection, hint, explain, next, reset |
| 1.2 | [ ] | Not Started | Define tutor response model | Keep compatible with existing visualisation payload where possible |
| 2.1 | [ ] | Not Started | Add backend tutor endpoint or extend visualisation endpoint | Avoid duplicating solver execution |
| 2.2 | [ ] | Not Started | Add frontend tutor controls | Reuse existing grid/player modules where practical |
| 3.1 | [ ] | Not Started | Add tests | Include solved puzzle, stuck puzzle, reset, and error states |
| 4.1 | [ ] | Not Started | Update docs and implementation log | Record dependencies and any public contract changes |

---

## Acceptance Criteria for BACKLOG-015

| Done | Status | Acceptance criterion | Evidence |
|------|--------|---------------------|----------|
| [ ] | Not Started | Tutor flow is implemented in a documented product surface | Link UI/API route |
| [ ] | Not Started | Step explanations are deterministic for the same puzzle | Link tests |
| [ ] | Not Started | Existing Web UI/API behavior remains green | Record validation commands |
| [ ] | Not Started | Future advanced/generator dependencies are documented | Link docs/backlog updates |
