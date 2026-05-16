# Code Review Outputs

**Status:** Authoritative location for future reviews
**Governed by:** `REFERENCE_ARCHITECTURE.md` v1.3 Section 10.7
**Decision:** `DR-014`
**Template:** [`../DOCS/templates/code-review.template.md`](../DOCS/templates/code-review.template.md)

This repository-root `.review/` directory is the v1.3-compliant location for new code review outputs.

## Future Review Naming

Comprehensive review bundles MUST use this shape:

```text
.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/
```

The main index file inside the bundle MUST use this shape:

```text
00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md
```

`[UTC]` MUST use `YYYYMMDDTHHMMZ`.

## Required Bundle Contents

```text
CODE_REVIEW_[AGENT]_v[N]_[UTC]/
├── 00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md
├── 01_EXECUTIVE_SUMMARY.md
├── 02_RISKS_AND_ISSUES.md
├── 03_PROJECT_REVIEWS/
├── 04_CROSS_PROJECT_ANALYSIS.md
├── 05_RECOMMENDATIONS.md
├── 06_ARCHITECTURE_ASSESSMENT.md
└── 07_MIGRATION_PLANS.md
```

## Historical Reviews

Historical review outputs remain under [`../DOCS/.review/`](../DOCS/.review/) in their original v1.2-era naming format. They are read-only snapshots and MUST NOT be renamed or edited after the fact.
