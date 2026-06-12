# Sudoku Solver Platform Specification

> **Document Type:** Platform Specification
> **Audience:** Mid-level software engineers and AI agents
> **Scope:** The whole multi-stack solver platform — core solver contract, deliberate extensions, stack parity rules, and optional surfaces

**Version:** v1.1
**Date:** 2026-06-12
**Status:** Proposed — accepted when the pull request carrying this document is merged (DR-034)
**Evolves:** `sudoku-solver-specification.md` v1.0 (2026-01-30), which remains the **original core baseline**

---

## Table of Contents

1. [Purpose and Authority](#1-purpose-and-authority)
2. [Relationship to v1.0](#2-relationship-to-v10)
3. [Core Solver Contract](#3-core-solver-contract)
4. [Deliberate Extensions Beyond v1.0](#4-deliberate-extensions-beyond-v10)
5. [Stack Parity Rules](#5-stack-parity-rules)
6. [Optional Surfaces and Staged Capability](#6-optional-surfaces-and-staged-capability)
7. [Specification Change Process](#7-specification-change-process)

---

## 1. Purpose and Authority

### 1.1 Why this document exists

The repository has grown well beyond the scope of the v1.0 solver specification: it now carries
three language stacks in behavioural parity, an audit trail, a REST API, a web visualisation UI,
Docker Compose tooling, and performance benchmarking. Code review
`DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` (Risk 1, High) found that if v1.0
remained the sole implementation authority, maintainers would be at risk of misclassifying
intentional evolution as drift — for example, treating row/column Hidden Singles as
out-of-specification behaviour, or removing surfaces absent from v1.0.

This document is the authoritative specification for the **platform**. It does not restate the
algorithmic detail of v1.0; it classifies every current capability as either *core baseline*,
*deliberate extension*, or *optional surface*, and states which rules bind every stack.

### 1.2 Authority order

Per `CLAUDE.md`, when documents conflict:

1. `decision-register.md` (DR-034 records the adoption of this specification)
2. `DOCS/reference-architecture.md` (currently v1.15) — test architecture and parity governance
3. **This document** — platform capability classification and solver behavioural contract
4. `sudoku-solver-specification.md` v1.0 — algorithmic detail of the core solver, as qualified by Section 3 below

## 2. Relationship to v1.0

### 2.1 v1.0 is the original core baseline

`sudoku-solver-specification.md` v1.0 remains in place, unmodified in substance, as the **original
core baseline**: the language-agnostic design of the basic solver (data structures, the three
techniques, orchestration loop, validation rules, expected behaviours). Implementers of a new
stack should still read v1.0 in full for the algorithmic detail.

### 2.2 What v1.1 changes

This version is an **evolution, not a supersession**: v1.0's requirements stand except where this
section explicitly qualifies them.

| # | v1.0 statement | v1.1 qualification |
|---|----------------|--------------------|
| 1 | §5.2.1: "This specification covers the **block-based** hidden singles technique" | **Promoted to explicit requirement:** Hidden Singles MUST be applied to rows, columns, **and** blocks. All three stacks already implement this; it is required behaviour, not drift. |
| 2 | §8.5: "Already solved grid returns `SOLVED` immediately" | Reaffirmed and made precise: the orchestrator MUST check grid fullness **before** entering the progress loop and return `SOLVED` without invoking any algorithm. Audit trails for already-solved inputs record zero iterations and zero events. (Implemented under worklist item SUD-01.) |
| 3 | §4: solver `getGrid` required operation | Restored (worklist item SUD-03, review Risk 3): all three solvers expose a deep-copy snapshot operation — `getGrid()` (TypeScript), `get_grid()` (Python), `GetGrid()` (C#) — which read-only consumers MUST prefer. The public working-grid members (`grid` / `Grid`) are retained for compatibility, but direct external mutation is deprecated: it bypasses the solving algorithms and the audit trail. |
| 4 | §7: structure validation mandatory; duplicate-constraint validation optional | The split is intentional: loaders validate shape/range; solver and API layers validate constraints. The validation-boundaries document required by worklist item SUD-04 (review Risk 4) is authoritative on layer responsibilities. |
| 5 | §1.3 scope: "basic solver, clear success/failure reporting" only | The platform deliberately extends this scope — see Section 4. The extensions are requirements of the platform, not deviations from it. |

### 2.3 Status reporting contract (unchanged)

The solver result strings remain exactly:

- `SOLVED`
- `STUCK_ON_ADVANCED_LOGIC`

No stack may rename, localise, or extend these values without a breaking-change gate per
Reference Architecture Section 5.5.

## 3. Core Solver Contract

The core solver contract binds **every** stack, present and future:

1. **Techniques:** Unit Completion, Hidden Singles (rows, columns, and blocks — see §2.2 item 1),
   and Naked Singles, applied in that order within each orchestration iteration (v1.0 §5, §6).
2. **Determinism:** no backtracking, brute force, or randomness; identical input produces an
   identical sequence of placements (v1.0 §1.2).
3. **Orchestration:** the progress loop repeats while any technique changes at least one cell;
   already-solved inputs return `SOLVED` before the loop starts (§2.2 item 2).
4. **Grid integrity:** the original grid is deep-copied at construction and never mutated;
   algorithms modify only the working grid (v1.0 §3, §8.4).
5. **Validation:** structure validation (shape, 0–9 range, integer values) is mandatory at the
   loader; constraint validation lives in solver/API layers (§2.2 item 4).
6. **Status strings:** exactly the two values in §2.3.

## 4. Deliberate Extensions Beyond v1.0

The following capabilities are **intentional platform features**. None of them appears in v1.0;
their absence there is not a licence to remove them.

| Extension | Specification / design source | Implemented in |
|-----------|------------------------------|----------------|
| Row/column/block Hidden Singles | This document §2.2 item 1 | All three stacks |
| Audit trail (iteration tracking, per-change algorithm attribution, statistics, JSON export) | `DOCS/.design/audit-trail-feature.md` | All three stacks |
| REST API wrapper (technique endpoints, solve with step tracking, puzzle list/get, validate) | `DOCS/.design/rest-api-wrapper.md` | DEMOAPP001 |
| Web UI solver visualisation (step playback over the audit trail) | `DOCS/.design/web-ui-solver-visualisation.md` | DEMOAPP001 |
| Docker Compose local development and parity runtimes | DR-033; `docker-compose.yml` | Repository-level |
| Performance benchmarking (reporting-only harnesses, `.results/performance/` aggregation) | BACKLOG-011 resolution | All three stacks + root aggregation |
| Multi-stack parity governance (canonical feature store, parity scripts, CI gates) | `DOCS/reference-architecture.md` v1.15; DR-012 onwards | Repository-level |

## 5. Stack Parity Rules

Parity is governed by the Reference Architecture (v1.15) and summarised here for the platform:

1. **Core solver parity is REQUIRED.** Every stack implements the full core solver contract of
   Section 3 and passes the canonical Gherkin feature set (currently 46 scenarios) from
   `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`.
2. **BDD/Screenplay parity is REQUIRED.** Each stack implements the Screenplay contract
   (`DOCS/.architecture/screenplay-parity-contract.md`): identical Memory key constants, thin
   step definitions, Tasks/Questions structure.
3. **Parity is verified mechanically.** `.batch/check-memory-key-parity.ps1`,
   `.batch/generate-feature-parity-report.ps1`, and `.batch/check-step-text-parity.ps1` MUST pass;
   they run as CI gates per `ci.yml`.
4. **API/web parity is NOT required.** Operational surfaces are staged capability — see Section 6.
5. **Breaking changes** to the canonical features, status strings, or shared contracts follow the
   Reference Architecture Section 5.5 gate.

## 6. Optional Surfaces and Staged Capability

The platform distinguishes required parity (Section 5) from **staged capability**: surfaces that
one stack pioneers and others adopt by roadmap, not by parity obligation.

- **DEMOAPP001 (TypeScript)** is the pioneer stack: it carries the REST API, web UI, and API
  integration tests in addition to the required core.
- **DEMOAPP002 (Python)** and **DEMOAPP003 (C#)** are core-solver/BDD stacks today. API/web
  capability for these stacks is **on the roadmap** (user decision, 2026-06-12) — they are not
  "intentionally util-only" forever, and their current absence of API/web surfaces is not a
  parity failure.
- A per-stack **capability matrix** (core solver, BDD parity, CLI/display, audit, REST API,
  web UI, performance tooling) is delivered under worklist item SUD-05 (review Risk 5) and, once
  landed, is the authoritative statement of which stack carries which surface.

## 7. Specification Change Process

1. Behavioural changes to the core solver contract (Section 3) require: canonical feature update
   per the procedure in `CLAUDE.md`, all three stacks updated in the same change, parity gates
   green, and a DR entry if the change is structural.
2. Promoting a staged capability (Section 6) to a required parity item requires a DR entry and a
   Reference Architecture review.
3. New versions of this document follow the same acceptance path as v1.1: proposed via pull
   request, accepted on merge, recorded in `decision-register.md`.
4. The root `README.md` version/status metadata is updated only after the version carrying the
   change is accepted (review Next Step 2).

---

**Related documents:** `sudoku-solver-specification.md` (v1.0 core baseline) ·
`DOCS/reference-architecture.md` (v1.15) · `decision-register.md` (DR-034) ·
`DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` (originating review)
