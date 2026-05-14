# Backlog

**Project:** gb.automation.smoketests.sudoku.poc
**Last Updated:** 2026-05-14
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.1
**Template:** `DOCS/templates/TEMPLATE_Backlog.md`

> **Authoritative backlog:** [`DOCS/.planning/BACKLOG.md`](DOCS/.planning/BACKLOG.md) — full sprint plans, acceptance criteria, and item history.
> **Note (DR-006):** Under Reference Architecture v1.1, the required backlog location is `DOCS/planning/BACKLOG.md` (project: `DOCS/.planning/BACKLOG.md` via DR-001). This root file is a **convenience summary only** — not the required document. Always update the detailed backlog; this file reflects it.

---

## Project Health

| Metric | Status |
|--------|--------|
| Overall Grade | A- |
| Test Scenarios | 43 passing |
| Critical Issues | 0 |
| Approved Designs Pending Implementation | 3 (Audit Trail, REST API, Web UI) |
| Reference Architecture Compliance | Low–Moderate — Phase 0 in progress |

---

## Current Sprint — Sprint 2 (2026-05-14 to 2026-05-27)

**Sprint Goal:** Complete Sprint 2 items (CI) and begin Phase 0 of Reference Architecture migration.

### In Progress

| ID | Title | Stack(s) | Nature of Gap |
|----|-------|----------|--------------|
| NEW-001 | Create DECISION_REGISTER.md and backfill DR-001–005 | ALL | RA compliance — §10.6 |
| NEW-002 | Create CHANGELOG.md at repository root | ALL | RA compliance — §10.1 |
| NEW-003 | Promote BACKLOG.md to repository root | ALL | RA compliance — §10.1 |
| NEW-004 | Create NAMING_CONVENTIONS.md | ALL | RA compliance — §10.9 |
| NEW-005 | Create DOCS/templates/ and consolidate templates | ALL | RA compliance — §10.5 |

### Open (Sprint 2 remaining)

| ID | Title | Stack(s) | Priority |
|----|-------|----------|----------|
| BACKLOG-006 | GitHub Actions CI pipeline | DEMOAPP001 | High |

---

## High Priority Backlog (Phase 1–4 of RA Migration)

| ID | Title | Stack(s) | Nature of Gap | Phase |
|----|-------|----------|--------------|-------|
| ~~NEW-006~~ | ~~Create features_shared/ canonical feature store~~ | ALL | ✅ Done — DR-007 | 1 |
| NEW-007 | Install Serenity/JS — create Screenplay directory structure | DEMOAPP001 | RA §3, §4 — no Screenplay layer | 2 |
| NEW-008 | Define Memory key constants in screenplay/support/memory-keys.ts | DEMOAPP001 | RA §3.5, §8.1 — no memory keys | 2 |
| NEW-009 | Implement UseSudokuSolver and LoadPuzzles Abilities | DEMOAPP001 | RA §3.2, §7.3 — no Abilities | 2 |
| NEW-010 | Implement all Tasks and Questions | DEMOAPP001 | RA §3.3, §3.4 — no Tasks/Questions | 3 |
| NEW-011 | Migrate step definitions to Screenplay (replace solver_steps.js) | DEMOAPP001 | RA §2.2 — layer coupling | 4 |
| NEW-012 | Refactor over-specified step text to parameterised form | DEMOAPP001 | RA §5.4 — over-specification | 4 |
| NEW-013 | Create stack-level docs/ with ARCHITECTURE, SCREENPLAY_GUIDE, QA_STRATEGY, README | DEMOAPP001 | RA §10.2 — stack docs absent | 5 |

---

## Medium Priority Backlog (Phase 5–7 of RA Migration)

| ID | Title | Stack(s) | Nature of Gap | Phase |
|----|-------|----------|--------------|-------|
| NEW-014 | Create DOCS/architecture/ with 4 required documents | ALL | RA §10.3 — no architecture docs | 6 |
| NEW-015 | Create .batch/ orchestration script + .results/.metrics/ output | ALL | RA §9 — no orchestration/metrics | 7 |
| BACKLOG-017 | Console output coupling (IOutput interface) | DEMOAPP001 | Tech debt | Sprint 3 |

---

## Low Priority / Future

| ID | Title | Stack(s) | Notes |
|----|-------|----------|-------|
| NEW-016 | Add exit codes and stderr to SudokuCLI for @cli surface compliance | DEMOAPP001 | RA §6.3 — CLI surface hardening |
| BACKLOG-004 | Audit Trail Feature implementation | DEMOAPP001 | Design complete |
| BACKLOG-008 | REST API Wrapper implementation | DEMOAPP001 | Design complete |
| BACKLOG-009 | Web UI Solver Visualisation | DEMOAPP001 | Design complete |

---

## Resolved (recent)

| ID | Title | Resolved | Decision Record |
|----|-------|----------|----------------|
| BACKLOG-001 | Hidden Singles — rows/columns | 2026-05-14 | — |
| BACKLOG-002 | Test runner (Cucumber.js) | 2026-05-14 | DR-002 |
| BACKLOG-005 | Centralise constants in constants.ts | 2026-05-14 | — |
| BACKLOG-006-COMPLETE | Prettier code formatting | 2026-05-14 | — |

> Full history in [`DOCS/.planning/BACKLOG.md`](DOCS/.planning/BACKLOG.md)
