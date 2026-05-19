# DOCS — Documentation Index

**Last Updated:** 2026-05-15T18:29Z
**Maintainer:** Project Lead / Development Team

> This is the master index for project documentation. Active governed docs and canonical templates are
> cross-referenced here. If you add a new document, update this index.

---

## Directory Structure

```
DOCS/
├── README.md                               <- This file (master index)
├── reference-architecture.md              <- Screenplay-BDD Reference Architecture v1.3
├── documentation-review-20260514T1100Z.md
│
├── templates/                              <- Canonical template store (RA §10.5)
│   ├── decision-record.template.md        <- For decision-register.md entries
│   ├── changelog.template.md              <- For root CHANGELOG.md
│   ├── backlog.template.md                <- For DOCS/.planning/backlog.md
│   └── naming-conventions.template.md     <- For naming-conventions.md
│
├── .algorithm/                             <- Language-agnostic algorithm pseudocode
│   ├── README.md                           <- Algorithm directory guide
│   ├── sudoku-basic-solver.md    <- Core algorithm pseudocode + complexity
│   └── sudoku-advanced-solver.md <- Advanced techniques reference
│
├── .design/                                <- Design & specification documents
│   ├── README.md                           <- Design directory guide
│   ├── sudoku-solver-specification.md
│   ├── audit-trail-feature.md
│   ├── rest-api-wrapper.md
│   ├── web-ui-solver-visualisation.md
│   ├── naming-conventions-design.md
│   └── screenplay-migration.md      <- NEW (2026-05-14)
│
├── .planning/                              <- Backlog, TODOs, prompt playbooks
│   ├── README.md
│   ├── backlog.md
│   ├── todo-audit-trail-feature.md
│   ├── todo-rest-api-wrapper.md
│   ├── todo-web-ui-solver-visualisation.md
│   ├── todo-hidden-singles-implementation.md
│   └── prompt-playbook-20260330T1645Z.md
│
├── .implementation/                        <- Session implementation logs
│   ├── README.md
│   ├── IMPL_LOG_2026-01-30_Initial_Project_Creation.md
│   └── IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md
│
├── .howto/                                 <- Practical how-to guides
│   ├── README.md
│   └── debug-sudoku-solver.md
│
└── .review/                                <- Code review outputs and template
    ├── README.md
    ├── code-review-template.md
    ├── CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/
    ├── CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/
    ├── CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/
    └── CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z/
```

---

## Templates

Canonical template store — all document templates live here. Use a template before creating any new document of the corresponding type. Source of truth: `DOCS/.templates/`.

| Template | Governs | Phase |
|----------|---------|-------|
| [decision-record.template.md](.templates/decision-record.template.md) | `decision-register.md` entries | 0 |
| [changelog.template.md](.templates/changelog.template.md) | Root `CHANGELOG.md` | 0 |
| [backlog.template.md](.templates/backlog.template.md) | `DOCS/.planning/backlog.md` | 0 |
| [naming-conventions.template.md](.templates/naming-conventions.template.md) | `DOCS/.design/naming-conventions.md` | 0 |
| [readme.template.md](.templates/readme.template.md) | Root `README.md` | 0 |
| [stack-architecture.template.md](.templates/stack-architecture.template.md) | `[STACK]/docs/architecture.md` | 5 |
| [screenplay-guide.template.md](.templates/screenplay-guide.template.md) | `[STACK]/docs/screenplay-guide.md` | 5 |
| [qa-strategy.template.md](.templates/qa-strategy.template.md) | `[STACK]/docs/qa-strategy.md` | 5 |
| [stack-readme.template.md](.templates/stack-readme.template.md) | `[STACK]/docs/README.md` | 5 |
| [parity-contract.template.md](.templates/parity-contract.template.md) | `DOCS/.architecture/screenplay-parity-contract.md` | 6 |
| [subject-app-contract.template.md](.templates/subject-app-contract.template.md) | `DOCS/.architecture/subject-app-contract.md` | 6 |
| [algorithm.template.md](.templates/algorithm.template.md) | `DOCS/.algorithm/` algorithm docs | — |
| [implementation-log.template.md](.templates/implementation-log.template.md) | `DOCS/.implementation-logs/YYYY-MM-DD_*.md` | — |
| [code-review.template.md](.templates/code-review.template.md) | `.review/CODE_REVIEW_*/` | — |
| [design-document.template.md](.templates/design-document.template.md) | `DOCS/.design/` design documents | — |
| [howto.template.md](.templates/howto.template.md) | `DOCS/.howto/` how-to guides | — |

> Legacy convenience copies may exist in dot-prefixed subdirectories, but the canonical templates are the lowercase files in `DOCS/.templates/`.

---

## Root-Level Governance Documents

The following documents MUST exist at the repository root per the Reference Architecture §10.1, §10.6, §10.9.

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview, quick-start |
| [CHANGELOG.md](../CHANGELOG.md) | Version history, notable changes |
| [decision-register.md](../decision-register.md) | Structural and process decisions (DR-001 onwards) |
| [naming-conventions.md](.design/naming-conventions.md) | Authoritative naming conventions for all code and docs (DR-001 + DR-019: stored in `.design/`) |

---

## Algorithm Documentation

Stored in [.algorithm/](.algorithm/) — language-agnostic pseudocode for every algorithm in the project.

| File | Purpose | Version |
|------|---------|---------|
| [sudoku-basic-solver.md](.algorithm/sudoku-basic-solver.md) | Unit Completion, Hidden Singles, Naked Singles pseudocode | v1.0 |
| [sudoku-advanced-solver.md](.algorithm/sudoku-advanced-solver.md) | Naked/Hidden Pairs, X-Wing, chain techniques | Draft |

---

## Design Documents

| Document | Purpose | Status | Version |
|----------|---------|--------|---------|
| [sudoku-solver-specification.md](.design/sudoku-solver-specification.md) | Tech-agnostic solver spec | Implemented | v1.0 |
| [audit-trail-feature.md](.design/audit-trail-feature.md) | Audit logging system | Approved, not implemented | v1.1 |
| [rest-api-wrapper.md](.design/rest-api-wrapper.md) | Express REST API | Approved, not implemented | v1.0 |
| [web-ui-solver-visualisation.md](.design/web-ui-solver-visualisation.md) | Browser step-by-step visualisation | Approved, not implemented | v1.2 |
| [naming-conventions-design.md](.design/naming-conventions-design.md) | TypeScript naming standards | Adopted | v1.0 |
| [screenplay-migration.md](.design/screenplay-migration.md) | Screenplay pattern migration for tests | Approved | v1.0 |

---

## Planning & Backlog

| Document | Purpose |
|----------|---------|
| [backlog.md](.planning/backlog.md) | Product backlog, sprint tracking |
| [todo-audit-trail-feature.md](.planning/todo-audit-trail-feature.md) | Audit Trail implementation task list |
| [todo-rest-api-wrapper.md](.planning/todo-rest-api-wrapper.md) | REST API implementation task list |
| [todo-web-ui-solver-visualisation.md](.planning/todo-web-ui-solver-visualisation.md) | Web UI implementation task list |
| [todo-hidden-singles-implementation.md](.planning/todo-hidden-singles-implementation.md) | Hidden Singles implementation (COMPLETED) |
| [prompt-playbook-20260330T1645Z.md](.planning/prompt-playbook-20260330T1645Z.md) | AI session reproducibility guide |

---

## Implementation Logs

Chronological record of every development session.

| Log | Date | Scope |
|-----|------|-------|
| [IMPL_LOG_2026-01-30_Initial_Project_Creation.md](.implementation/IMPL_LOG_2026-01-30_Initial_Project_Creation.md) | 2026-01-30 | Initial setup, solver algorithms |
| [IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md](.implementation/IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md) | 2026-05-14 | Naming, constants, Cucumber test runner |

---

## How-To Guides

| Guide | Topic | Difficulty | Time |
|-------|-------|-----------|------|
| [debug-sudoku-solver.md](.howto/debug-sudoku-solver.md) | VS Code debugging setup | Beginner | 15 min |

---

## Code Reviews

Reviews are snapshots: timestamped, immutable once written.

| Review | Reviewer | Date | Grade |
|--------|---------|------|-------|
| [CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z](.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/) | CLAUDE Sonnet 4.5 | 2026-01-30 | A- |
| [CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z](.review/CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z/) | GPT-5.3 Codex | 2026-03-30 | — |
| [CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z](.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/) | CLAUDE Opus 4.6 | 2026-03-30 | B+ |
| [CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z](.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/) | CLAUDE Sonnet 4.6 | 2026-05-13 | A- |

---

## Analysis Reports

One-time assessments that are not code reviews.

| Report | Date | Topic |
|--------|------|-------|
| [documentation-review-20260514T1100Z.md](documentation-review-20260514T1100Z.md) | 2026-05-14 | Project alignment vs. Reference Architecture |

---

## Maintenance Notes

- When adding a document, update this index **in the same commit**
- Before creating any new document type, check `DOCS/.templates/` for a template first
- All algorithm docs must also be listed in [.algorithm/README.md](.algorithm/README.md)
- All design docs must also be listed in [.design/README.md](.design/README.md)
- All code reviews must also be listed in [.review/README.md](.review/README.md)
- Implementation logs are append-only — never modify a completed log
- Any structural decision (new folder, new doc type, naming deviation) MUST produce a `decision-register.md` entry
