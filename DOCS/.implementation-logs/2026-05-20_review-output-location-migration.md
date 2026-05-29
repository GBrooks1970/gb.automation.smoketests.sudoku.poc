# Implementation Log: Review Output Location Migration

**Date:** 2026-05-20T18:21:56Z
**Session goal:** Move repository-root `.review` outputs into `DOCS/.review` and make the
Reference Architecture rule explicit.
**Outcome:** Completed -- review outputs consolidated under DOCS and active guidance updated.

---

## 1. Primary Request and Intent

**What was asked:** Move all contents from repository-root `.review` into `DOCS/.review`,
rectify prompts and workflows that would create new files in the wrong location, update the
Reference Architecture rule, validate the work, and commit it.

**Scope that emerged:**

- Merge the root `.review/README.md` policy into the existing `DOCS/.review/README.md`.
- Update RA v1.14, the decision register, active templates, `CLAUDE.md`, the backlog, and indexes.
- Preserve completed implementation logs as historical records rather than editing their past-state
  `.review` references.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Make `DOCS/.review/` the single authoritative review output directory | Keeps reviews with the rest of the governance documentation and removes the dual-location ambiguity introduced by DR-014 | DR-029 |
| Update RA Section 10.7 rather than treating this as a project-only exception | The user asked for a rule, and future agents should rely on normative architecture text rather than local convention only | DR-029 |
| Leave historical implementation logs unchanged | Logs are append-only and record the state that existed when they were written | No |

---

## 3. Files Created or Significantly Modified

### Created

| File | Purpose |
|------|---------|
| `DOCS/.implementation-logs/2026-05-20_review-output-location-migration.md` | This session log |

### Moved

| From | To |
|------|----|
| `.review/2026-05-18_reference-architecture-structural-review.md` | `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` |
| `.review/2026-05-18_repository-structural-review.md` | `DOCS/.review/2026-05-18_repository-structural-review.md` |
| `.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/` | `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/` |

### Modified

| File | Change summary |
|------|---------------|
| `DOCS/reference-architecture.md` | Updated to v1.14 and made `DOCS/review/` the required review output location, with project naming conventions allowed to use `DOCS/.review/` |
| `decision-register.md` | Added DR-029 and marked DR-014 as superseded |
| `DOCS/.review/README.md` | Replaced split-location policy with the authoritative `DOCS/.review/` policy and listed moved reviews |
| `DOCS/.templates/code-review.template.md` | Updated generated bundle path to `DOCS/.review/` |
| `DOCS/.templates/structural-review.template.md` | Updated generated structural review path to `DOCS/.review/` |
| `CLAUDE.md` | Updated agent guidance and risk notes so new reviews are not created at repository root |
| `DOCS/.planning/backlog.md` | Updated RA version and review evidence paths |
| `DOCS/README.md` | Updated review directory guidance and index entries |
| `CHANGELOG.md` | Recorded the DR-029 / RA v1.14 location change |

### Deleted

| File | Reason |
|------|--------|
| `.review/README.md` | Policy merged into `DOCS/.review/README.md`; root `.review/` is no longer used |

---

## 4. Bugs and Errors Encountered

### Historical Path Over-Correction

**Symptom:** A mechanical replacement changed some completed implementation-log paths.
**Root cause:** Historical logs contain past-state `.review/` references but are not active workflow
instructions.
**Fix:** Reverted those incidental log edits and recorded the migration in this new log instead.

---

## 5. Current State at End of Session

**Completed this session:**

- Review outputs live under `DOCS/.review/`.
- Active templates and agent guidance point to `DOCS/.review/`.
- DR-029 and RA v1.14 define the rule.
- Root `.review/` no longer exists in the working tree.

**Left incomplete / deferred:**

- None.

**New backlog items generated:**

- None.

---

## 6. Validation

- `Test-Path -LiteralPath .review` returned `False`.
- `rg` check confirmed active guidance/templates point to `DOCS/.review/`; remaining root `.review/`
  mentions are historical records or explicit "do not use" rules.
- `git diff --check` completed without whitespace errors.

---

*End of Implementation Log*
