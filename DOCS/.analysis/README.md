# Analysis Reports

**Status:** Authoritative location for project analysis and report-style documents
**Decision:** `DR-030`

This directory contains one-time assessments, migration analyses, and alignment reports that are not code review outputs and are not implementation logs.

---

## Rules

- Future analysis and report-style documents MUST be created under `DOCS/.analysis/`.
- Use `analysis-topic-YYYYMMDD.md` for new analysis documents unless a more specific existing naming pattern applies.
- Historical report filenames are preserved when moved here.
- Code review outputs belong in `DOCS/.review/`.
- Development session logs belong in `DOCS/.implementation-logs/`.

---

## Contents

| Report | Date | Purpose |
|--------|------|---------|
| [documentation-review-20260514T1100Z.md](documentation-review-20260514T1100Z.md) | 2026-05-14 | Documentation ecosystem review |
| [ref-arch-alignment_2026-05-14.md](ref-arch-alignment_2026-05-14.md) | 2026-05-14 | Reference Architecture v1.1 alignment and migration report |
| [ref-arch-alignment_2026-05-15.md](ref-arch-alignment_2026-05-15.md) | 2026-05-15 | Historical Reference Architecture v1.3 re-baseline report |
| [analysis-directory-naming-kebab-case-2026-05-16.md](analysis-directory-naming-kebab-case-2026-05-16.md) | 2026-05-16 | Stack directory naming analysis |
| [analysis-docs-subdirectory-cleanup-20260516.md](analysis-docs-subdirectory-cleanup-20260516.md) | 2026-05-16 | DOCS subdirectory cleanup analysis |
| [analysis-document-naming-kebab-case-20260516.md](analysis-document-naming-kebab-case-20260516.md) | 2026-05-16 | Document naming migration analysis |
