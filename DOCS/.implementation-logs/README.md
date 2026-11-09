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
| [2026-07-14_p04-isc-licence-alignment.md](2026-07-14_p04-isc-licence-alignment.md) | 2026-07-14 | P-04/D-06 ISC licence alignment across all stacks |
| [2026-07-14_p07-public-readiness-audit.md](2026-07-14_p07-public-readiness-audit.md) | 2026-07-14 | P-07 publication-readiness audit and runtime/dependency hardening |
| [2026-07-28_backlog-070-supported-runtime-dependency-audits.md](2026-07-28_backlog-070-supported-runtime-dependency-audits.md) | 2026-07-28 | BACKLOG-070 supported-runtime dependency audits |
| [2026-08-24_sudoku-puzzle-generator-backlog-016.md](2026-08-24_sudoku-puzzle-generator-backlog-016.md) | 2026-08-24 | Sudoku Puzzle Generator engine, REST API & BACKLOG-016 closure (SUD-38..41) |
| [2026-09-30_backlog-075-reqnroll-results-spike.md](2026-09-30_backlog-075-reqnroll-results-spike.md) | 2026-09-30 | BACKLOG-075 Reqnroll results spike and three-Stack result comparison |
| [2026-09-30_backlog-075-mockup-and-ordering-finding.md](2026-09-30_backlog-075-mockup-and-ordering-finding.md) | 2026-09-30 | BACKLOG-075 parity page mock-up, prototype gate and execution-order finding |
| [2026-09-30_backlog-075-parity-page-build-and-publication.md](2026-09-30_backlog-075-parity-page-build-and-publication.md) | 2026-09-30 | BACKLOG-075 parity page build, CI wiring and publication |
| [2026-11-06_backlog-082-dependency-audit-green.md](2026-11-06_backlog-082-dependency-audit-green.md) | 2026-11-06 | BACKLOG-082 restore green CI under DR-039 |
| [2026-11-06_backlog-083-weekly-dependency-audit.md](2026-11-06_backlog-083-weekly-dependency-audit.md) | 2026-11-06 | BACKLOG-083 weekly audit-only dependency audit workflow (DR-048) |
| [2026-11-06_triage-16-audit-blocking-counts.md](2026-11-06_triage-16-audit-blocking-counts.md) | 2026-11-06 | BACKLOG-084 / TRIAGE-16 real blocking counts when the dependency-audit policy has errors |
| [2026-11-08_triage-18-csharp-fixture-path.md](2026-11-08_triage-18-csharp-fixture-path.md) | 2026-11-08 | BACKLOG-086 / TRIAGE-18 DEMOAPP003 fixture anchoring, authoritative loader paths and surfaced loader errors |
| [2026-11-08_triage-19-visualise-decode.md](2026-11-08_triage-19-visualise-decode.md) | 2026-11-08 | BACKLOG-087 / TRIAGE-19 single decode on `/api/visualise/:name` |
| [2026-11-09_triage-24-then-mutation-controls.md](2026-11-09_triage-24-then-mutation-controls.md) | 2026-11-09 | BACKLOG-088 / TRIAGE-24 run Then-assertion mutation controls on a temporary copy |
| [2026-11-09_triage-20-real-then-observations.md](2026-11-09_triage-20-real-then-observations.md) | 2026-11-09 | BACKLOG-089 / TRIAGE-20 Real Then observations, no-op disposal and tautology replacement |
| [2026-11-09_triage-15-candidate-arguments.md](2026-11-09_triage-15-candidate-arguments.md) | 2026-11-09 | BACKLOG-090 / TRIAGE-15 Assess candidate-qualified and fixed-fixture step arguments |
| [2026-11-09_triage-10-generator-openapi-alignment.md](2026-11-09_triage-10-generator-openapi-alignment.md) | 2026-11-09 | BACKLOG-091 / TRIAGE-10 Align generator request and validation-error schemas with runtime |
| [2026-11-09_triage-21-ci-timeouts-concurrency.md](2026-11-09_triage-21-ci-timeouts-concurrency.md) | 2026-11-09 | BACKLOG-092 / TRIAGE-21 Add Stack job timeouts and PR-scoped CI concurrency |


---

## Archive

Logs created before 2026-05-16 were originally stored in `DOCS/.implementation/` under the `IMPL_LOG_YYYY-MM-DD_Long_Title.md` naming pattern. Those files have been moved here and renamed to the v1.3 convention as part of MIG-09 (DR-017). `DOCS/.implementation/` is now a read-only archive.
