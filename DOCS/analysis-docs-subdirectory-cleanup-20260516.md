# Analysis: DOCS Subdirectory Cleanup — Consolidate to Dot-Prefix Kebab-Case

**Date:** 2026-05-16
**Author:** Claude Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` — eliminate duplicate DOCS subdirectories; enforce a single convention: dot-prefix + kebab-case for all DOCS type-specific subdirectories
**Status:** Pre-migration — awaiting DR-019 and execution

---

## 1. Problem Statement

The DOCS directory currently contains **13 subdirectories** using three different naming conventions, creating a dual-source confusion that contradicts the repository's single-convention rule established by DR-001.

### 1.1 Current state

| Directory | Convention | Content | Role |
|-----------|-----------|---------|------|
| `DOCS/.algorithm/` | dot + single-word | 4 files | Authoritative |
| `DOCS/.design/` | dot + single-word | 9 files | Authoritative |
| `DOCS/.howto/` | dot + single-word | 3 files | Authoritative |
| `DOCS/.implementation/` | dot + single-word | 2 files | Read-only archive (DR-017) |
| `DOCS/.planning/` | dot + single-word | 7 files | Authoritative |
| `DOCS/.review/` | dot + single-word | 2 files | Authoritative |
| `DOCS/.templates/` | dot + single-word | **1 file only** | Partial — shadow of `templates/` |
| `DOCS/architecture/` | plain, no dot | 4 files | Authoritative — **wrong convention** |
| `DOCS/design/` | plain, no dot | 1 file | DR-013 bridge — **redundant** |
| `DOCS/implementation-logs/` | plain kebab, no dot | 3 files | Authoritative per DR-017 — **wrong convention** |
| `DOCS/planning/` | plain, no dot | 1 file | DR-013 bridge — **redundant** |
| `DOCS/templates/` | plain, no dot | **22 files** | Main template store — **wrong convention** |

### 1.2 How it got here

The problem accumulated across three separate decisions:

| Decision | Date | What it created | What it left behind |
|----------|------|-----------------|---------------------|
| DR-001 | 2026-01-30 | `.design/`, `.planning/`, `.algorithm/`, `.implementation/`, `.review/`, `.howto/` | Established dot-prefix as project convention |
| DR-013 | 2026-05-15 | `design/` bridge, `planning/` bridge, `implementation-logs/` compatibility path | Two directories per role — one dot-prefix, one RA-literal |
| DR-017 | 2026-05-16 | Made `implementation-logs/` authoritative (MIG-09) | Both `.implementation/` (archive) and `implementation-logs/` (active) exist |

Additionally, `DOCS/templates/` and `DOCS/architecture/` were created directly with RA-literal naming without going through a decision that acknowledged the DR-001 dot-prefix convention, and `DOCS/.templates/` was created with only a single file, leaving 22 files stranded in the non-dot `DOCS/templates/`.

### 1.3 Discrepancy summary

| Issue | Detail |
|-------|--------|
| Duplicate design directory | `.design/` (9 files, authoritative) vs `design/` (1 bridge file) |
| Duplicate planning directory | `.planning/` (7 files, authoritative) vs `planning/` (1 bridge file) |
| Split implementation-log store | `.implementation/` (2 files, archive) vs `implementation-logs/` (3 files, active) |
| Split template store | `.templates/` (1 file) vs `templates/` (22 files) |
| Missing dot on architecture | `architecture/` (4 files) — no dot prefix |
| No dot on implementation-logs | `implementation-logs/` — active content, wrong convention |

---

## 2. Target State

**Rule:** Every DOCS type-specific subdirectory MUST use a leading dot followed by kebab-case. No plain-name (non-dot) subdirectories exist under DOCS except as a transitional state.

### 2.1 Target directory inventory (8 subdirectories)

| Target directory | Replaces / absorbs | Content after migration |
|------------------|--------------------|------------------------|
| `DOCS/.algorithm/` | No change | Algorithm specification documents |
| `DOCS/.architecture/` | `DOCS/architecture/` | Cross-cutting architecture specs |
| `DOCS/.design/` | `DOCS/.design/` + removes `DOCS/design/` bridge | Design documents and naming conventions |
| `DOCS/.howto/` | No change | How-to guides |
| `DOCS/.implementation-logs/` | `DOCS/.implementation/` + `DOCS/implementation-logs/` | All implementation logs (active + archived template) |
| `DOCS/.planning/` | `DOCS/.planning/` + removes `DOCS/planning/` bridge | Backlog, TODO files, planning artefacts |
| `DOCS/.review/` | No change | Code review outputs (historical) |
| `DOCS/.templates/` | `DOCS/.templates/` + absorbs all of `DOCS/templates/` | All document templates |

### 2.2 Before and after mapping

| Current path | Target path | Action |
|-------------|------------|--------|
| `DOCS/.algorithm/` | `DOCS/.algorithm/` | None |
| `DOCS/.design/` | `DOCS/.design/` | None |
| `DOCS/.howto/` | `DOCS/.howto/` | None |
| `DOCS/.planning/` | `DOCS/.planning/` | None |
| `DOCS/.review/` | `DOCS/.review/` | None |
| `DOCS/.implementation/README.md` | `DOCS/.implementation-logs/README.md` | Move + update content |
| `DOCS/.implementation/TEMPLATE_Implementation_Log.md` | `DOCS/.implementation-logs/TEMPLATE_Implementation_Log.md` | Move |
| `DOCS/.templates/decision-record.template.md` | `DOCS/.templates/decision-record.template.md` | None (already correct) |
| `DOCS/architecture/*.md` (4 files) | `DOCS/.architecture/*.md` | `git mv` |
| `DOCS/design/NAMING_CONVENTIONS.md` | REMOVED | Bridge no longer needed |
| `DOCS/implementation-logs/README.md` | `DOCS/.implementation-logs/README.md` | `git mv` |
| `DOCS/implementation-logs/2026-01-30_initial-project-creation.md` | `DOCS/.implementation-logs/2026-01-30_initial-project-creation.md` | `git mv` |
| `DOCS/implementation-logs/2026-05-14_naming-conventions-and-testing.md` | `DOCS/.implementation-logs/2026-05-14_naming-conventions-and-testing.md` | `git mv` |
| `DOCS/planning/BACKLOG.md` | REMOVED | Bridge no longer needed |
| `DOCS/templates/*.md` (22 files) | `DOCS/.templates/*.md` | `git mv` all |

---

## 3. Reference Impact

### 3.1 `DOCS/templates/` → `DOCS/.templates/`

**References to update (16 files):**

| File | Category |
|------|----------|
| `BACKLOG.md` | Root redirect |
| `CHANGELOG.md` | Governance doc |
| `CLAUDE.md` | Agent guide |
| `decision-register.md` | All DRs that name templates |
| `DOCS/.design/NAMING_CONVENTIONS.md` | Naming conventions doc |
| `DOCS/.implementation/README.md` | Archive README |
| `DOCS/.planning/BACKLOG.md` | Authoritative backlog |
| `DOCS/README.md` | DOCS root index |
| `DOCS/implementation-logs/README.md` | Will move to `.implementation-logs/` |
| `DOCS/ref-arch-alignment_2026-05-14.md` | Historical alignment doc |
| `DOCS/ref-arch-alignment_2026-05-15.md` | Active alignment doc |
| `DOCS/templates/naming-conventions.template.md` | Self-reference (will move) |
| `demo-apps/demoapp001-typescript-cypress/docs/architecture.md` | Stack doc |
| `demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md` | Stack doc |
| `demo-apps/demoapp001-typescript-cypress/docs/README.md` | Stack doc |
| `demo-apps/demoapp001-typescript-cypress/docs/screenplay-guide.md` | Stack doc |

### 3.2 `DOCS/architecture/` → `DOCS/.architecture/`

**References to update (13 files):**

| File | Category |
|------|----------|
| `.batch/run-demoapp001.ps1` | Script comment |
| `BACKLOG.md` | Root redirect |
| `CLAUDE.md` | Agent guide |
| `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md` | Historical analysis |
| `DOCS/README.md` | DOCS root index |
| `DOCS/architecture/logging-design.md` | Self-reference (will move) |
| `DOCS/ref-arch-alignment_2026-05-14.md` | Historical alignment |
| `DOCS/ref-arch-alignment_2026-05-15.md` | Active alignment |
| `DOCS/templates/TEMPLATE_Parity_Contract.md` | Template (will move) |
| `DOCS/templates/TEMPLATE_Subject_App_Contract.md` | Template (will move) |
| `DOCS/templates/parity-contract.template.md` | Template (will move) |
| `DOCS/templates/subject-app-contract.template.md` | Template (will move) |

**Note:** `DOCS/reference-architecture.md` also uses the string `DOCS/architecture/` as an illustrative RA blueprint example. This file is the governing reference architecture and its content should NOT be changed — the project's local decision diverges from the RA path with a DR entry.

### 3.3 `DOCS/implementation-logs/` → `DOCS/.implementation-logs/`

**References to update (12 files):**

| File | Category |
|------|----------|
| `BACKLOG.md` | Root redirect |
| `CHANGELOG.md` | Governance doc |
| `CLAUDE.md` | Agent guide |
| `decision-register.md` | DR-013, DR-017 |
| `DOCS/.design/NAMING_CONVENTIONS.md` | Naming conventions |
| `DOCS/.implementation/README.md` | Archive README (moving content) |
| `DOCS/.planning/BACKLOG.md` | Authoritative backlog |
| `DOCS/README.md` | DOCS root index |
| `DOCS/ref-arch-alignment_2026-05-14.md` | Historical alignment |
| `DOCS/ref-arch-alignment_2026-05-15.md` | Active alignment |

### 3.4 Bridge removals (`design/`, `planning/`)

Removing the bridge files requires updating any remaining documentation that points readers to `DOCS/design/` or `DOCS/planning/`. These currently appear in:

- `decision-register.md` (DR-013 context and decision text)
- `DOCS/ref-arch-alignment_2026-05-15.md` (MIG-02 resolution text)
- `DOCS/.design/NAMING_CONVENTIONS.md` (Section 3 DOCS RA-literal bridge row)
- `CLAUDE.md` (repository map)

After removal, references that cited the bridge files should be updated to point directly to the dot-prefix authoritative directories.

---

## 4. Decision Register Impact

### 4.1 DR-019 — Extend dot-prefix convention to all DOCS subdirectories (proposed)

This migration requires a new Decision Register entry that:
- Extends DR-001's dot-prefix rule explicitly to `architecture/` and `templates/`
- Supersedes the bridge strategy in DR-013 (bridges no longer needed once the dot-prefix is the only convention)
- Supersedes DR-017's `implementation-logs/` authoritative designation in favour of `.implementation-logs/`
- Records the consolidation of `.implementation/` (archive) and `implementation-logs/` (active) into `.implementation-logs/`

### 4.2 RA path divergence

`reference-architecture.md` v1.3 names literal paths: `DOCS/planning/`, `DOCS/design/`, `DOCS/implementation-logs/`, `DOCS/architecture/`. After this migration ALL of those paths will be replaced by dot-prefix equivalents. This is a documented project-local divergence, analogous to the DR-001 divergence for `.planning/`, `.design/`, etc. The new DR-019 entry makes the full divergence explicit and records the rationale (DR-001 precedent, single-convention rule, elimination of dual-directory confusion).

---

## 5. Migration Plan

### Phase 0 — Decision gate

- [ ] DR-019 drafted and accepted in `decision-register.md`
- [ ] Supersession links from DR-013 and DR-017 added

### Phase 1 — Filesystem moves (git mv)

Execute in this order to avoid conflicts:

```powershell
# 1. Rename architecture -> .architecture
git mv DOCS/architecture DOCS/.architecture

# 2. Merge .implementation/ archive files into .implementation-logs/
#    (rename the directory, then move the active files into it)
git mv DOCS/.implementation DOCS/.implementation-logs
git mv "DOCS/implementation-logs/README.md" "DOCS/.implementation-logs/active-README.md"
git mv "DOCS/implementation-logs/2026-01-30_initial-project-creation.md" "DOCS/.implementation-logs/2026-01-30_initial-project-creation.md"
git mv "DOCS/implementation-logs/2026-05-14_naming-conventions-and-testing.md" "DOCS/.implementation-logs/2026-05-14_naming-conventions-and-testing.md"
# Then remove the now-empty implementation-logs/ directory (git rm -r)
git rm DOCS/implementation-logs/.gitkeep  # if present, else just rmdir

# 3. Move all templates/ content into .templates/
git mv DOCS/templates/TEMPLATE_Algorithm.md               DOCS/.templates/TEMPLATE_Algorithm.md
git mv DOCS/templates/TEMPLATE_Backlog.md                 DOCS/.templates/TEMPLATE_Backlog.md
git mv DOCS/templates/TEMPLATE_Changelog.md               DOCS/.templates/TEMPLATE_Changelog.md
git mv DOCS/templates/TEMPLATE_Code_Review.md             DOCS/.templates/TEMPLATE_Code_Review.md
git mv DOCS/templates/TEMPLATE_Decision_Record.md         DOCS/.templates/TEMPLATE_Decision_Record.md
git mv DOCS/templates/TEMPLATE_Implementation_Log.md      DOCS/.templates/TEMPLATE_Implementation_Log.md
git mv DOCS/templates/TEMPLATE_Naming_Conventions.md      DOCS/.templates/TEMPLATE_Naming_Conventions.md
git mv DOCS/templates/TEMPLATE_Parity_Contract.md         DOCS/.templates/TEMPLATE_Parity_Contract.md
git mv DOCS/templates/TEMPLATE_QA_Strategy.md             DOCS/.templates/TEMPLATE_QA_Strategy.md
git mv DOCS/templates/TEMPLATE_Readme.md                  DOCS/.templates/TEMPLATE_Readme.md
git mv DOCS/templates/TEMPLATE_Screenplay_Guide.md        DOCS/.templates/TEMPLATE_Screenplay_Guide.md
git mv DOCS/templates/TEMPLATE_Stack_Architecture.md      DOCS/.templates/TEMPLATE_Stack_Architecture.md
git mv DOCS/templates/TEMPLATE_Stack_Readme.md            DOCS/.templates/TEMPLATE_Stack_Readme.md
git mv DOCS/templates/TEMPLATE_Subject_App_Contract.md    DOCS/.templates/TEMPLATE_Subject_App_Contract.md
git mv DOCS/templates/algorithm.template.md               DOCS/.templates/algorithm.template.md
git mv DOCS/templates/backlog.template.md                 DOCS/.templates/backlog.template.md
git mv DOCS/templates/changelog.template.md               DOCS/.templates/changelog.template.md
git mv DOCS/templates/code-review.template.md             DOCS/.templates/code-review.template.md
git mv DOCS/templates/decision-record.template.md         DOCS/.templates/decision-record.template.md
git mv DOCS/templates/implementation-log.template.md      DOCS/.templates/implementation-log.template.md
git mv DOCS/templates/naming-conventions.template.md      DOCS/.templates/naming-conventions.template.md
git mv DOCS/templates/parity-contract.template.md         DOCS/.templates/parity-contract.template.md
git mv DOCS/templates/qa-strategy.template.md             DOCS/.templates/qa-strategy.template.md
git mv DOCS/templates/readme.template.md                  DOCS/.templates/readme.template.md
git mv DOCS/templates/screenplay-guide.template.md        DOCS/.templates/screenplay-guide.template.md
git mv DOCS/templates/stack-architecture.template.md      DOCS/.templates/stack-architecture.template.md
git mv DOCS/templates/stack-readme.template.md            DOCS/.templates/stack-readme.template.md
git mv DOCS/templates/subject-app-contract.template.md    DOCS/.templates/subject-app-contract.template.md

# 4. Remove bridge files (git rm)
git rm DOCS/design/NAMING_CONVENTIONS.md
git rm DOCS/planning/BACKLOG.md
# The now-empty bridge directories disappear automatically
```

**Note on `DOCS/.implementation-logs/README.md` merge:** The `.implementation/README.md` (archive notice) and `implementation-logs/README.md` (authoritative index) both land in `.implementation-logs/`. The archive README becomes a historical note within the merged directory, and the active README becomes the primary `README.md`. A single unified README covering both the active logs and the archived template should be written after the move.

### Phase 2 — Reference updates

Update all files listed in Section 3, replacing:

| Old path | New path |
|----------|---------|
| `DOCS/templates/` | `DOCS/.templates/` |
| `DOCS/architecture/` | `DOCS/.architecture/` |
| `DOCS/implementation-logs/` | `DOCS/.implementation-logs/` |
| `DOCS/design/NAMING_CONVENTIONS.md` | `DOCS/.design/NAMING_CONVENTIONS.md` |
| `DOCS/planning/BACKLOG.md` | `DOCS/.planning/BACKLOG.md` |

**Files that must NOT be changed:**
- `DOCS/reference-architecture.md` — RA-literal paths are the governing document's own content; local divergence is recorded in DR-019
- `DOCS/.review/**` — historical review outputs, read-only per RA §10.7

### Phase 3 — NAMING_CONVENTIONS.md update

Update `DOCS/.design/NAMING_CONVENTIONS.md`:
- Section 3 Directories: remove RA-literal bridge row; update all DOCS directory examples to dot-prefix kebab-case
- Section 5 Documentation Files: update template and architecture references
- Section 9: `Current next ID` to `DR-020` (after DR-019 is added)
- Quick Reference table: remove bridge row; update implementation logs and templates rows

### Phase 4 — CLAUDE.md and governance docs update

- `CLAUDE.md`: update repository map and documentation pointers
- `decision-register.md`: add DR-019; add supersession links from DR-013 and DR-017
- `DOCS/ref-arch-alignment_2026-05-15.md`: update all DOCS path references

### Phase 5 — Validation

```powershell
# Confirm no non-dot plain-name subdirectories remain under DOCS/
Get-ChildItem -Path DOCS -Directory | Where-Object { $_.Name -notmatch '^\.' }
# Expected: no output

# Confirm all 8 target dot-prefix directories exist
Get-ChildItem -Path DOCS -Directory | Sort-Object Name

# Confirm npm test still passes (templates and architecture paths are doc-only,
# so no runtime impact expected)
.\.batch\run-demoapp001.ps1
# Expected: OverallExitCode=0, 43/43 scenarios

# Confirm no stale references remain
grep -r "DOCS/templates\|DOCS/architecture\|DOCS/implementation-logs\|DOCS/design\|DOCS/planning" \
  --include="*.md" --include="*.ts" --include="*.ps1" --include="*.json" \
  . | grep -v ".review" | grep -v "reference-architecture.md" | grep -v "ANALYSIS_Directory_Naming"
# Expected: no output (only the RA and this analysis doc are allowed to retain the old paths)
```

---

## 6. Effort Estimate

| Phase | Scope | Estimated effort |
|-------|-------|-----------------|
| 0 — Decision gate (DR-019) | 1 DR entry | 15 min |
| 1 — Filesystem moves | ~30 git mv + 2 git rm | 20 min |
| 2 — Reference updates | ~16 files, ~40 string replacements | 45 min |
| 3 — NAMING_CONVENTIONS.md update | 1 file | 15 min |
| 4 — CLAUDE.md + governance | 3 files | 20 min |
| 5 — Validation | grep audit + test run | 15 min |
| **Total** | | **~2 hours** |

---

## 7. Files Explicitly Out of Scope

| File | Reason |
|------|--------|
| `DOCS/reference-architecture.md` | Governing document — RA-literal paths are the RA's own content |
| `DOCS/.review/**` | Read-only per RA §10.7 |
| `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md` | Historical analysis — old paths in body text describe the past state |
| `DOCS/analysis-docs-subdirectory-cleanup-20260516.md` | This document — migration plan, old paths are the subject matter |

---

*Binding decision must be recorded as DR-019 before Phase 1 begins.*
