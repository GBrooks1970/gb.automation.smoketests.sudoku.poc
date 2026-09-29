# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](ANNEX/VALIDATION.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29T06:33Z

These are proposed, unapproved steps. Effort is a qualitative planning estimate, not measured delivery time.

## Single Source of Truth for Features

- Preserve the canonical feature store and existing parity scripts; no feature-store relocation is needed.
- Centralise the technique token/type used by tutor, grader and public API.
- Add exact classification tests before updating the mapping.
- Add exhausted-target service/API tests and explicitly agree failure semantics against DR-043.
- Update active capability documentation; this review is already registered in both project review indexes.
- Run affected TypeScript gates and cross-stack parity when shared feature text changes. Estimated effort: small to medium; principal risk is changing public semantics accidentally.

## Docker Compose for Local Development

N/A - Compose already exists, and no container migration is justified by this review. A future reproducibility task may document the difference between convenience service commands and full CI gates. No Docker resources were changed.

## GitHub Actions/Workflow

- Preserve three stack jobs, supported-runtime declarations and the aggregate gate.
- Incorporate the already-existing upstream dependency fix before evaluating residual audit failures.
- Add product semantic/controller regressions to the appropriate TypeScript job.
- Run Python audit in the governed constraint-resolved environment and NuGet audit with .NET 10.
- Retain native test/coverage/audit artefacts and negative evidence controls.
- Verify required statuses and publication behaviour live before a future merge. Estimated effort: small after product tests exist; principal risk is falsely reporting skipped audits as passing.

## Product Correction Sequence

First fix the shared grading token (R3), then exact target completion/exhaustion (R2), then tutor response revisions (R4). Keep independent focused tests for each. Reconcile R5 and record approved backlog references before closure. No implementation or migration has been carried out here.

---

[<- Previous: Section](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Section ->](ANNEX/VALIDATION.md)
