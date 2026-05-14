# DOCS — Documentation Index

**Last Updated:** 2026-05-14T15:00Z
**Maintainer:** Project Lead / Development Team

> This is the master index for all project documentation. Every file in DOCS is
> cross-referenced here. If you add a new document, update this index.

---

## Directory Structure

```
DOCS/
├── README.md                               <- This file (master index)
├── REFERENCE_ARCHITECTURE.md              <- Screenplay-BDD Reference Architecture v1.0
├── ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md
├── Documentation_Review_20260514T1100Z.md
│
├── templates/                              <- Canonical template store (RA §10.5)
│   ├── TEMPLATE_Decision_Record.md        <- For DECISION_REGISTER.md entries
│   ├── TEMPLATE_Changelog.md              <- For root CHANGELOG.md
│   ├── TEMPLATE_Backlog.md                <- For root BACKLOG.md
│   └── TEMPLATE_Naming_Conventions.md     <- For NAMING_CONVENTIONS.md
│
├── .algorithm/                             <- Language-agnostic algorithm pseudocode
│   ├── README.md                           <- Algorithm directory guide
│   ├── TEMPLATE_Algorithm.md
│   ├── ALGORITHM_Sudoku_Basic_Solver.md    <- Core algorithm pseudocode + complexity
│   └── ALGORITHM_Sudoku_Advanced_Solver.md <- Advanced techniques reference
│
├── .design/                                <- Design & specification documents
│   ├── README.md                           <- Design directory guide
│   ├── TEMPLATE_Design_Document.md
│   ├── DESIGN_Sudoku_Solver_Specification.md
│   ├── DESIGN_Audit_Trail_Feature.md
│   ├── DESIGN_REST_API_Wrapper.md
│   ├── DESIGN_Web_UI_Solver_Visualisation.md
│   ├── DESIGN_Naming_Conventions.md
│   └── DESIGN_Screenplay_Migration.md      <- NEW (2026-05-14)
│
├── .planning/                              <- Backlog, TODOs, prompt playbooks
│   ├── README.md
│   ├── BACKLOG.md
│   ├── TODO_Audit_Trail_Feature.md
│   ├── TODO_REST_API_Wrapper.md
│   ├── TODO_Web_UI_Solver_Visualisation.md
│   ├── TODO_Hidden_Singles_Complete_Implementation.md
│   └── PROMPT_PLAYBOOK_20260330T1645Z.md
│
├── .implementation/                        <- Session implementation logs
│   ├── README.md
│   ├── TEMPLATE_Implementation_Log.md
│   ├── IMPL_LOG_2026-01-30_Initial_Project_Creation.md
│   └── IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md
│
├── .howto/                                 <- Practical how-to guides
│   ├── README.md
│   ├── TEMPLATE_HowTo.md
│   └── HOWTO_Debug_SudokuSolver.md
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

Canonical template store — all document templates live here. Use a template before creating any new document of the corresponding type.

| Template | Governs |
|----------|---------|
| [TEMPLATE_Decision_Record.md](templates/TEMPLATE_Decision_Record.md) | `DECISION_REGISTER.md` entries |
| [TEMPLATE_Changelog.md](templates/TEMPLATE_Changelog.md) | Root `CHANGELOG.md` |
| [TEMPLATE_Backlog.md](templates/TEMPLATE_Backlog.md) | Root `BACKLOG.md` |
| [TEMPLATE_Naming_Conventions.md](templates/TEMPLATE_Naming_Conventions.md) | `NAMING_CONVENTIONS.md` |
| [TEMPLATE_Design_Document.md](.design/TEMPLATE_Design_Document.md) | Design / analysis / planning / refactor docs |
| [TEMPLATE_Implementation_Log.md](.implementation/TEMPLATE_Implementation_Log.md) | Implementation session logs |
| [TEMPLATE_Algorithm.md](.algorithm/TEMPLATE_Algorithm.md) | Algorithm pseudocode documents |
| [TEMPLATE_HowTo.md](.howto/TEMPLATE_HowTo.md) | How-to guides |
| [code-review-template.md](.review/code-review-template.md) | Code review outputs |

---

## Root-Level Governance Documents

The following documents MUST exist at the repository root per the Reference Architecture §10.1, §10.6, §10.9.

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview, quick-start |
| [CHANGELOG.md](../CHANGELOG.md) | Version history, notable changes |
| [BACKLOG.md](../BACKLOG.md) | Backlog summary — detailed at [DOCS/.planning/BACKLOG.md](.planning/BACKLOG.md) |
| [DECISION_REGISTER.md](../DECISION_REGISTER.md) | Structural and process decisions (DR-001 onwards) |
| [NAMING_CONVENTIONS.md](../NAMING_CONVENTIONS.md) | Authoritative naming conventions for all code and docs |

---

## Algorithm Documentation

Stored in [.algorithm/](.algorithm/) — language-agnostic pseudocode for every algorithm in the project.

| File | Purpose | Version |
|------|---------|---------|
| [ALGORITHM_Sudoku_Basic_Solver.md](.algorithm/ALGORITHM_Sudoku_Basic_Solver.md) | Unit Completion, Hidden Singles, Naked Singles pseudocode | v1.0 |
| [ALGORITHM_Sudoku_Advanced_Solver.md](.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md) | Naked/Hidden Pairs, X-Wing, chain techniques | Draft |

---

## Design Documents

| Document | Purpose | Status | Version |
|----------|---------|--------|---------|
| [DESIGN_Sudoku_Solver_Specification.md](.design/DESIGN_Sudoku_Solver_Specification.md) | Tech-agnostic solver spec | Implemented | v1.0 |
| [DESIGN_Audit_Trail_Feature.md](.design/DESIGN_Audit_Trail_Feature.md) | Audit logging system | Approved, not implemented | v1.1 |
| [DESIGN_REST_API_Wrapper.md](.design/DESIGN_REST_API_Wrapper.md) | Express REST API | Approved, not implemented | v1.0 |
| [DESIGN_Web_UI_Solver_Visualisation.md](.design/DESIGN_Web_UI_Solver_Visualisation.md) | Browser step-by-step visualisation | Approved, not implemented | v1.2 |
| [DESIGN_Naming_Conventions.md](.design/DESIGN_Naming_Conventions.md) | TypeScript naming standards | Adopted | v1.0 |
| [DESIGN_Screenplay_Migration.md](.design/DESIGN_Screenplay_Migration.md) | Screenplay pattern migration for tests | Approved | v1.0 |

---

## Planning & Backlog

| Document | Purpose |
|----------|---------|
| [BACKLOG.md](.planning/BACKLOG.md) | Product backlog, sprint tracking |
| [TODO_Audit_Trail_Feature.md](.planning/TODO_Audit_Trail_Feature.md) | Audit Trail implementation task list |
| [TODO_REST_API_Wrapper.md](.planning/TODO_REST_API_Wrapper.md) | REST API implementation task list |
| [TODO_Web_UI_Solver_Visualisation.md](.planning/TODO_Web_UI_Solver_Visualisation.md) | Web UI implementation task list |
| [TODO_Hidden_Singles_Complete_Implementation.md](.planning/TODO_Hidden_Singles_Complete_Implementation.md) | Hidden Singles implementation (COMPLETED) |
| [PROMPT_PLAYBOOK_20260330T1645Z.md](.planning/PROMPT_PLAYBOOK_20260330T1645Z.md) | AI session reproducibility guide |

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
| [HOWTO_Debug_SudokuSolver.md](.howto/HOWTO_Debug_SudokuSolver.md) | VS Code debugging setup | Beginner | 15 min |

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
| [ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md](ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md) | 2026-05-14 | Project alignment vs. Reference Architecture |

---

## Maintenance Notes

- When adding a document, update this index **in the same commit**
- Before creating any new document type, check `DOCS/templates/` for a template first
- All algorithm docs must also be listed in [.algorithm/README.md](.algorithm/README.md)
- All design docs must also be listed in [.design/README.md](.design/README.md)
- All code reviews must also be listed in [.review/README.md](.review/README.md)
- Implementation logs are append-only — never modify a completed log
- Any structural decision (new folder, new doc type, naming deviation) MUST produce a `DECISION_REGISTER.md` entry
