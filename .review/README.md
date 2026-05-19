# Code Review Outputs

**Status:** Authoritative location for future reviews
**Governed by:** `reference-architecture.md` v1.13 Section 10.7
**Decision:** `DR-014`

This repository-root `.review/` directory is the v1.13-compliant location for new code review outputs.

---

## Accepted Output Shapes

Two output shapes are accepted. Choose based on review scope.

### Shape 1 -- Single-file Structural Review

Use for: comprehensive structural audits of the repository against the current Reference Architecture.

```text
.review/YYYY-MM-DD_repository-structural-review.md
.review/YYYY-MM-DD_[scope-slug].md        (for scoped reviews, e.g. screenplay-layer-review)
```

**Template:** [`../DOCS/.templates/structural-review.template.md`](../DOCS/.templates/structural-review.template.md)

**Required sections (in order):**
1. Header block (Project, Reviewer, Review Date, RA version, Active Stack, Format)
2. First-Pass Structural Observations (What Works Well / What Raises Concern)
3. Risks and Issues (numbered high to low, each with Nature / Current state / Impact / Required refactor)
4. Overall Summary (Design quality, Main highlights, RA compliance table, Pedagogical value)
5. Future Work (Potential future work / Legacy debt)

### Shape 2 -- Multi-file Bundle Review

Use for: comprehensive reviews with separately-navigable sections (executive summary, risks, recommendations, architecture assessment, migration plans).

```text
.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/
```

`[UTC]` MUST use `YYYYMMDDTHHMMZ`. The main index file inside the bundle MUST use:

```text
00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md
```

**Template:** [`../DOCS/.templates/code-review.template.md`](../DOCS/.templates/code-review.template.md)

**Required files:**

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

---

## Rules

- Every review output MUST be authored from the template for its chosen shape.
- Review outputs are read-only once written. Do not edit findings after the fact. A new review supersedes an old one.
- Action items raised in a review MUST be tracked in `DOCS/.planning/backlog.md` or `decision-register.md` before the session closes.

---

## Historical Reviews

Historical review outputs remain under [`../DOCS/.review/`](../DOCS/.review/) in their original v1.2-era naming format. They are read-only snapshots and MUST NOT be renamed or edited after the fact.
