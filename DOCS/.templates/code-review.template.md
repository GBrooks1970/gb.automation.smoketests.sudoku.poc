# TEMPLATE — Code Review

**Intended audience:** The reviewer (AI or human) conducting a comprehensive code review.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `reference-architecture.md` v1.3 §10.7
**Produces:** `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/`

> This template is the canonical version. The copy at `DOCS/.review/code-review-template.md` is a historical project-specific version.
> Review outputs are **read-only** once written — do not edit findings after the fact.
> Action items raised MUST be tracked in `DOCS/.planning/backlog.md` or `decision-register.md`.

---

## How to Use This Template

1. Create the output directory: `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/`
2. Author each file below from scratch — no copy-paste from previous reviews.
3. Timestamp format: `YYYYMMDDTHHMMZ` (UTC, no seconds).
4. After writing, add action items to `DOCS/.planning/backlog.md` before closing the session.

---

## Required Output Files [REQUIRED — all must be present]

```
.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/
├── 00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md           # Index and metadata
├── 01_EXECUTIVE_SUMMARY.md
├── 02_RISKS_AND_ISSUES.md
├── 03_PROJECT_REVIEWS/
│   └── PROJECT_001_[ProjectName].md               # One file per project reviewed
├── 04_CROSS_PROJECT_ANALYSIS.md
├── 05_RECOMMENDATIONS.md
├── 06_ARCHITECTURE_ASSESSMENT.md
└── 07_MIGRATION_PLANS.md
```

---

## 00 — Index and Metadata

```markdown
# Code Review: [Subject] [REQUIRED]

**Reviewer:** [AI model name / human name] [REQUIRED]
**Date:** YYYY-MM-DDTHH:MMZ [REQUIRED]
**Scope:** [What was reviewed] [REQUIRED]
**Grade:** [A+ / A / A- / B+ / B / B- / C / F] [REQUIRED]

## Contents
- [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md)
- [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md)
- [03_PROJECT_REVIEWS/](03_PROJECT_REVIEWS/)
- [04_CROSS_PROJECT_ANALYSIS.md](04_CROSS_PROJECT_ANALYSIS.md)
- [05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md)
- [06_ARCHITECTURE_ASSESSMENT.md](06_ARCHITECTURE_ASSESSMENT.md)
- [07_MIGRATION_PLANS.md](07_MIGRATION_PLANS.md)
```

---

## 01 — Executive Summary [REQUIRED]

```markdown
# Executive Summary [REQUIRED]

## Overall Grade: [Grade]

## Dimension Breakdown [REQUIRED]
| Dimension | Grade | Notes |
|-----------|-------|-------|
| Design Quality | [A–F] | [2–3 words] |
| Code Quality | [A–F] | [2–3 words] |
| Test Coverage | [A–F] | [2–3 words] |
| Documentation | [A–F] | [2–3 words] |
| Implementation Progress | [A–F] | [2–3 words] |

## Key Strengths (3–5 bullets) [REQUIRED]
## Key Risks (3–5 bullets, reference 02_RISKS_AND_ISSUES.md) [REQUIRED]
## Immediate Actions Required [REQUIRED]
```

---

## 02 — Risks and Issues [REQUIRED]

```markdown
# Risks and Issues

Numbered high to low priority. Each entry MUST include: [REQUIRED]
- **Risk description** — what is the issue?
- **Evidence** — file path, line numbers, code snippet
- **Impact** — what are the consequences?
- **Recommendation** — how to fix it?
```

---

## 03 — Project Reviews [REQUIRED]

```markdown
# [ProjectName] — Project Review

## Architecture and Design (3–5 bullets) [REQUIRED]
## Code Quality (3–5 bullets) [REQUIRED]
## Test Coverage (3–5 bullets) [REQUIRED]
## Documentation (3–5 bullets) [REQUIRED]
## Strengths [REQUIRED]
## Weaknesses [REQUIRED]
```

---

## 04 — Cross-Project Analysis [REQUIRED]

```markdown
# Cross-Project Analysis

## Tool-Agnostic Tests — can tests run across frameworks?
## Single Source of Truth — feature file and data consistency
## Screenplay Parity — consistency across Stack implementations
## Documentation Alignment — consistency and completeness
## Test Coverage Metrics — quantitative assessment
```

---

## 05–07 — Remaining Sections [REQUIRED]

```markdown
# 05 Recommendations
[Prioritised improvements — reference backlog IDs where items are tracked]

# 06 Architecture Assessment
[SOLID, KISS, YAGNI, DRY, ISTQB — highlight alignment and gaps]

# 07 Migration Plans
[Priority migration strategies — steps, effort, risk for top items]
```

---

## Reviewer Attribution

**Format:** `AI assistant (CLAUDE [model])` or `[First name, Role]`
**Output format:** Markdown with GitHub-flavored extensions; ASCII only; no emojis.
