# Implementation Logs

**Status:** Authoritative (DR-019, 2026-05-16)
**Governed by:** `reference-architecture.md` v1.15 §10.8
**Template:** `DOCS/.templates/implementation-log.template.md`

This directory is the authoritative location for implementation logs. Logs document development sessions, design decisions, bugs fixed, and lessons learned.

---

## Naming Convention

Every log file MUST use the UTC date-prefix plus short-slug pattern:

```
YYYY-MM-DD_short-session-topic.md
```

**Examples:**
- `2026-01-30_initial-project-creation.md`
- `2026-05-14_naming-conventions-and-testing.md`

---

## Creating a New Implementation Log

1. Copy the canonical template: `DOCS/.templates/implementation-log.template.md`
2. Name the file `YYYY-MM-DD_short-session-topic.md` using today's UTC date
3. Fill in all `[REQUIRED]` fields
4. Add an entry to the log index below

---

## Log Index

| File | Date | Topic |
|------|------|-------|
| [2026-01-30_initial-project-creation.md](2026-01-30_initial-project-creation.md) | 2026-01-30 | Initial project setup, algorithm docs, solver refactoring, test expansion |
| [2026-05-14_naming-conventions-and-testing.md](2026-05-14_naming-conventions-and-testing.md) | 2026-05-14 | Sprint 2 naming conventions, testing strategy, and v1.3 migration work |
| [2026-05-18_structural-review-and-backlog-sprint.md](2026-05-18_structural-review-and-backlog-sprint.md) | 2026-05-18 | Structural review and backlog remediation sprint |
| [2026-05-19_code-review-claude-v1.md](2026-05-19_code-review-claude-v1.md) | 2026-05-19 | Comprehensive code review bundle |
| [2026-05-19_python-pytest-stack-onboarding.md](2026-05-19_python-pytest-stack-onboarding.md) | 2026-05-19 | Python pytest-bdd Stack onboarding |
| [2026-05-20_rest-api-wrapper.md](2026-05-20_rest-api-wrapper.md) | 2026-05-20 | DEMOAPP001 REST API wrapper |
| [2026-05-20_review-output-location-migration.md](2026-05-20_review-output-location-migration.md) | 2026-05-20 | Review output location migration |
| [2026-05-20_analysis-folder-migration.md](2026-05-20_analysis-folder-migration.md) | 2026-05-20 | Analysis/report folder migration |
| [2026-05-24_web-ui-visualisation-cleanup.md](2026-05-24_web-ui-visualisation-cleanup.md) | 2026-05-24 | Web UI visualisation cleanup |
| [2026-05-28_backlog-to-todo-plan-implementation.md](2026-05-28_backlog-to-todo-plan-implementation.md) | 2026-05-28 | Backlog-to-todo plan implementation |
| [2026-05-30_sudoku-spec-v1-structural-review.md](2026-05-30_sudoku-spec-v1-structural-review.md) | 2026-05-30 | Sudoku solver specification v1.0 structural review |

---

## Archive

Logs created before 2026-05-16 were originally stored in `DOCS/.implementation/` under the `IMPL_LOG_YYYY-MM-DD_Long_Title.md` naming pattern. Those files have been moved here and renamed to the v1.3 convention as part of MIG-09 (DR-017). `DOCS/.implementation/` is now a read-only archive.
