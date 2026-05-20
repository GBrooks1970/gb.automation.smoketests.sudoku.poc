# Code Review Outputs

**Status:** Authoritative location for all project review outputs
**Governed by:** `reference-architecture.md` v1.14 Section 10.7
**Decision:** `DR-029`

This directory contains historical and current code review outputs for comprehensive assessment of the Sudoku Solver project and related test automation codebases.

---

## Purpose

Reviews in this directory serve as:

- **Quality Assurance** - Systematic assessment of code and design quality
- **Risk Identification** - Early detection of issues and technical debt
- **Knowledge Sharing** - Transfer of best practices and architectural insights
- **Continuous Improvement** - Actionable recommendations for enhancement
- **Documentation** - Historical record of codebase evolution and decisions

---

## Accepted Output Shapes

Two output shapes are accepted. Choose based on review scope.

### Shape 1 -- Single-file Structural Review

Use for focused structural audits and lightweight follow-up reviews.

```text
DOCS/.review/YYYY-MM-DD_repository-structural-review.md
DOCS/.review/YYYY-MM-DD_[scope-slug].md
```

**Template:** [`../.templates/structural-review.template.md`](../.templates/structural-review.template.md)

### Shape 2 -- Multi-file Bundle Review

Use for comprehensive reviews with separately navigable sections.

```text
DOCS/.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/
```

`[UTC]` MUST use `YYYYMMDDTHHMMZ`. The main index file inside the bundle MUST use:

```text
00_CODE_REVIEW_[AGENT]_v[N]_[UTC].md
```

**Template:** [`../.templates/code-review.template.md`](../.templates/code-review.template.md)

Required files:

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
- Review outputs MUST be created under `DOCS/.review/`; repository-root `.review/` is not used by this project.
- Review outputs are read-only once written. Do not edit findings after the fact. A new review supersedes an old one.
- Action items raised in a review MUST be tracked in `DOCS/.planning/backlog.md` or `decision-register.md` before the session closes.

---

## Directory Structure

```text
DOCS/.review/
├── README.md
├── code-review-template.md                         # Historical project-specific review template
├── YYYY-MM-DD_*structural-review.md                # Single-file structural reviews
├── CODE_REVIEW_[AGENT]_v[N]_[UTC]/                 # Current bundle naming shape
└── CODE_REVIEW_{Reviewer}__{Timestamp}/            # Historical bundle naming shape
```

---

## Available Reviews

| Review | Reviewer | Date | Grade | Notes |
|--------|---------|------|-------|-------|
| [CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z](CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z.md) | CLAUDE Sonnet 4.5 | 2026-01-30 | A- | Baseline review |
| [CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z](CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z/00_CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z.md) | GPT-5.3 Codex | 2026-03-30 | — | Parallel review |
| [CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z](CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/00_CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z.md) | CLAUDE Opus 4.6 | 2026-03-30 | B+ | Second iteration |
| [CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z](CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | CLAUDE Sonnet 4.6 | 2026-05-13 | A- | Third iteration |
| [2026-05-18_reference-architecture-structural-review.md](2026-05-18_reference-architecture-structural-review.md) | Codex | 2026-05-18 | — | Reference Architecture structural review |
| [2026-05-18_repository-structural-review.md](2026-05-18_repository-structural-review.md) | Codex | 2026-05-18 | — | Repository structural review |
| [CODE_REVIEW_CLAUDE_v1_20260519T1948Z](CODE_REVIEW_CLAUDE_v1_20260519T1948Z/00_CODE_REVIEW_CLAUDE_v1_20260519T1948Z.md) | CLAUDE | 2026-05-19 | A- | Full current-shape code review bundle |

---

## Example Workflow

```bash
cd DOCS/.review
mkdir CODE_REVIEW_CLAUDE_v1_20260520T1200Z
cd CODE_REVIEW_CLAUDE_v1_20260520T1200Z
mkdir 03_PROJECT_REVIEWS
```
