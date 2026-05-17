# Analysis: Document Naming — Adopting Lowercase Kebab-Case

**Date:** 2026-05-16 (updated 2026-05-17)
**Author:** Claude Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` — impact assessment for converting document filenames from the current `PREFIX_Title_Case.md` format to `lowercase-kebab-case.md`
**Status:** Phases 0–2 and 4 complete 2026-05-17; Phase 3 deferred — 24 authored docs renamed, DR-020 accepted, CLAUDE.md and naming-conventions.md finalized

---

## 1. Executive Summary

The repository's document filenames currently use three different conventions simultaneously, creating an inconsistency that clashes with the kebab-case direction already adopted for directories (DR-016, DR-019), implementation logs (DR-017), and RA-governed templates. Adopting kebab-case for all document filenames would eliminate that inconsistency, but carries a meaningful blast radius (~55 files to rename, ~75 files with cross-references to update) and a small set of hard exceptions where tooling or ecosystem conventions lock the filename.

**Recommendation:** Adopt kebab-case in two targeted phases. Exempt three fixed-role files (`README.md`, `CHANGELOG.md`, `CLAUDE.md`) and all generated artefacts. Consolidate the duplicate `TEMPLATE_*` / `*.template.md` file pairs as a prerequisite.

---

## 2. Current Naming Landscape

### 2.1 Convention inventory

The repository currently has **four active document naming conventions**:

| Convention | Pattern | Examples | Count |
|-----------|---------|---------|-------|
| Prefix + Title Case | `PREFIX_Word_Word.md` | `DESIGN_Audit_Trail_Feature.md`, `ALGORITHM_Sudoku_Basic_Solver.md` | ~28 |
| Fixed role (ecosystem) | `UPPERCASE.md` | `README.md`, `CHANGELOG.md`, `CLAUDE.md`, `DECISION_REGISTER.md` | ~10 |
| Date-prefix kebab | `YYYY-MM-DD_slug.md` | `2026-01-30_initial-project-creation.md` | 2 |
| Kebab-case (governed) | `word-word.md` | `orchestration-design.md`, `decision-record.template.md` | ~22 |

77 markdown files in total (excluding `.results/`, `.review/`, `node_modules/`).

### 2.2 Files already using kebab-case

The following files already conform to the target convention and require no change:

| Location | Files |
|----------|-------|
| `DOCS/.architecture/` | `logging-design.md`, `orchestration-design.md`, `screenplay-parity-contract.md`, `subject-app-contract.md` |
| `DOCS/.implementation-logs/` | `2026-01-30_initial-project-creation.md`, `2026-05-14_naming-conventions-and-testing.md` |
| `DOCS/.templates/*.template.md` | 14 files (`backlog.template.md`, `decision-record.template.md`, etc.) |
| `DOCS/` root | `ref-arch-alignment_2026-05-14.md`, `ref-arch-alignment_2026-05-15.md` |

These 22 files are already compliant. **The problem is the remaining ~55 files.**

### 2.3 Files using the non-kebab conventions

**Category A — Prefix + Title Case authored documents (~28 files)**

| File | Proposed kebab name |
|------|---------------------|
| `DOCS/.design/DESIGN_Audit_Trail_Feature.md` | `audit-trail-feature.md` |
| `DOCS/.design/DESIGN_Naming_Conventions.md` | `naming-conventions.md` |
| `DOCS/.design/DESIGN_REST_API_Wrapper.md` | `rest-api-wrapper.md` |
| `DOCS/.design/DESIGN_Screenplay_Migration.md` | `screenplay-migration.md` |
| `DOCS/.design/DESIGN_Sudoku_Solver_Specification.md` | `sudoku-solver-specification.md` |
| `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` | `web-ui-solver-visualisation.md` |
| `DOCS/.design/NAMING_CONVENTIONS.md` | `naming-conventions.md` *(already named above — de-duplicate)* |
| `DOCS/.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md` | `sudoku-advanced-solver.md` |
| `DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md` | `sudoku-basic-solver.md` |
| `DOCS/.howto/HOWTO_Debug_SudokuSolver.md` | `debug-sudoku-solver.md` |
| `DOCS/.planning/TODO_Audit_Trail_Feature.md` | `todo-audit-trail-feature.md` |
| `DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md` | `todo-hidden-singles-implementation.md` |
| `DOCS/.planning/TODO_REST_API_Wrapper.md` | `todo-rest-api-wrapper.md` |
| `DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md` | `todo-web-ui-solver-visualisation.md` |
| `DOCS/.planning/PROMPT_PLAYBOOK_20260330T1645Z.md` | `prompt-playbook-20260330T1645Z.md` |
| `DOCS/.planning/BACKLOG.md` | `backlog.md` |
| `DOCS/analysis-docs-subdirectory-cleanup-20260516.md` | `analysis-docs-subdirectory-cleanup-20260516.md` |
| `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md` | `analysis-directory-naming-kebab-case-2026-05-16.md` |
| `DOCS/documentation-review-20260514T1100Z.md` | `documentation-review-20260514T1100Z.md` |
| `DOCS/reference-architecture.md` | `reference-architecture.md` |
| `DOCS/.implementation-logs/ARCHIVE_NOTICE.md` | `archive-notice.md` |
| `demo-apps/demoapp001-typescript-cypress/docs/architecture.md` | `architecture.md` |
| `demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md` | `qa-strategy.md` |
| `demo-apps/demoapp001-typescript-cypress/docs/screenplay-guide.md` | `screenplay-guide.md` |

**Category B — Fixed-role root governance docs (~5 files)**

| File | Convention reason | Recommendation |
|------|------------------|----------------|
| `README.md` (all locations) | GitHub/npm ecosystem hard standard | **Keep `README.md`** |
| `CHANGELOG.md` | Tooling dependency (standard-version, semantic-release) | **Keep `CHANGELOG.md`** — see Section 5.2 |
| `CLAUDE.md` | Anthropic Claude tooling default — see Section 5.3 | **Keep `CLAUDE.md`** |
| `DECISION_REGISTER.md` | Internal governance, no tooling dependency | Rename → `decision-register.md` |
| `BACKLOG.md` (root redirect) | Internal redirect, no tooling dependency | Remove or rename |

**Category C — Duplicate TEMPLATE_ / .template.md pairs (14 pairs)**

Currently `.templates/` contains both:
- `TEMPLATE_Algorithm.md` — old-style heavyweight project template
- `algorithm.template.md` — RA v1.3 governed lightweight template

For 14 document types. This duplication was inherited from two separate eras of template governance. See Section 5.4 for the consolidation recommendation.

**Category D — Generated artefacts (gitignored)**

| Pattern | Generated by | Recommendation |
|---------|-------------|----------------|
| `DEMOAPP001_YYYYMMDDTHHmmssZ.md` | `.batch/run-demoapp001.ps1` | Keep as-is — governed by script, not authoring convention |
| `FEATURE_PARITY_[YYYYMMDDTHHMMZ].md` | `.batch/generate-feature-parity-report.ps1` | Keep as-is — governed by RA §9.2 naming requirement |

---

## 3. Pros of Adopting Kebab-Case for Document Files

### 3.1 Convention unification — highest value argument

The project has already adopted kebab-case for:
- **Directories** (DR-016, DR-019) — `demo-apps/`, `.architecture/`, `.templates/`
- **Implementation logs** (DR-017) — `2026-01-30_initial-project-creation.md`
- **RA-governed templates** — `decision-record.template.md`, `qa-strategy.template.md`
- **Architecture docs** — `orchestration-design.md`, `logging-design.md`

Continuing with `DESIGN_Audit_Trail_Feature.md` while `orchestration-design.md` sits next to it is a visible inconsistency. Kebab-case for all authored documents closes the last remaining inconsistency.

### 3.2 Prefix redundancy elimination

When files live in typed directories, the filename prefix carries no additional information:

```
DOCS/.design/DESIGN_Audit_Trail_Feature.md   ← prefix duplicates directory role
DOCS/.design/audit-trail-feature.md          ← directory provides the context
```

The `DESIGN_`, `ALGORITHM_`, `HOWTO_`, and `TODO_` prefixes were added to aid visual identification in flat file-tree views. With dot-prefix directories already enforcing visual grouping, the prefixes are redundant noise.

### 3.3 Shell and tooling ergonomics

- No Shift/CapsLock required when typing or tab-completing document paths.
- Consistent with how modern documentation tools (GitHub Pages, VitePress, MkDocs, Docusaurus) generate URL slugs from filenames — a future docs site could use filenames directly as slugs.
- grep, find, and CI path matchers work without case flag gymnastics.

### 3.4 Cross-platform safety

Documents referenced in scripts or code (e.g., if an agent reads a template by path) become portable. The project runs on a Windows dev machine (case-insensitive) and will eventually run on Linux CI (case-sensitive). Lowercase filenames are unambiguous on both platforms.

### 3.5 AI agent discoverability

AI agents that auto-discover and index project documentation benefit from consistent, predictable naming. Kebab-case is the format most documentation AI tooling (LlamaIndex, LangChain loaders) uses for semantic chunking — word boundaries from hyphens map cleanly to token boundaries.

### 3.6 Removes the DESIGN_ / TEMPLATE_ prefix system from NAMING_CONVENTIONS.md

The current naming conventions document defines five distinct per-type prefix rules. Adopting kebab-case reduces this to one rule: `word-word.md`. The naming conventions document becomes simpler to write, read, and enforce.

---

## 4. Cons of Adopting Kebab-Case for Document Files

### 4.1 Significant blast radius

- **~55 files** need renaming.
- **~75 files** contain inline references to the current names (paths, markdown links, prose mentions).
- This is comparable to the MIG-13 directory rename (220 references across ~80 files) but broader in prose impact because document names appear more frequently in human-readable text.

### 4.2 Git history discontinuity

`git log --follow` and `git blame` break across renames for all ~55 files. Investigating *why* a design decision was made in `DESIGN_Audit_Trail_Feature.md` via `git blame` after it becomes `audit-trail-feature.md` requires knowing the rename happened. The rename commit can be noted, but the cognitive overhead is real.

### 4.3 Loss of at-a-glance type identification in file explorers

In a flat list view (no directory grouping visible), `DESIGN_Audit_Trail_Feature.md` immediately signals its document type. `audit-trail-feature.md` requires knowing which directory it lives in. For developers using non-hierarchical search tools (fuzzy file openers like VS Code Ctrl+P), the prefix acted as a filter shortcut.

*Mitigation: the dot-prefix directory convention (DR-019) means files are always seen in context of their parent role directory.*

### 4.4 Tooling exceptions create a split convention

Even after full adoption, three files must remain in their current UPPERCASE form (`README.md`, `CHANGELOG.md`, `CLAUDE.md`). A "kebab-case for documents" rule with documented exceptions is less clean than a truly uniform rule. Contributors must still learn the exception list.

### 4.5 Breaks all external references

Any link to a document filename in:
- GitHub PRs, issues, or comments
- Slack or chat history
- External wikis
- Code review outputs (read-only per RA §10.7)

...becomes stale. Historical review outputs under `DOCS/.review/` reference the current uppercase names and cannot be edited. Those references will permanently point to files that no longer exist at those paths.

### 4.6 CI tooling risk for `CHANGELOG.md`

If `CHANGELOG.md` is renamed now but a CI tool later generates `CHANGELOG.md`, the repository will have two changelogs (`CHANGELOG.md` generated by tool, `changelog.md` maintained by hand). The recommendation to keep `CHANGELOG.md` addresses this, but it means the kebab-case adoption is always incomplete at the root level.

---

## 5. Key Decision Points

### 5.1 `DECISION_REGISTER.md` — rename or keep?

No tooling dependency. All references are in prose and markdown links within this repository. **Recommended: rename to `decision-register.md`.** Impact: ~50 references across governance documents.

### 5.2 `CHANGELOG.md` — rename or keep?

Several common CI tools specifically generate or parse `CHANGELOG.md` (standard-version, semantic-release, keep-a-changelog CLI). BACKLOG-004 (GitHub Actions CI/CD) is open. If a changelog generator is wired before a rename, a `changelog.md` rename will immediately conflict with the tool output. **Recommended: keep `CHANGELOG.md` as a permanent exception, matching README.md.** Document the exception in NAMING_CONVENTIONS.md.

### 5.3 `CLAUDE.md` — rename or keep?

Claude Code (the CLI tool in which this assistant runs) has a well-documented lookup order for its instruction file. It checks `CLAUDE.md` by name (case-sensitive on Linux, case-insensitive on macOS/Windows). On a Linux CI runner, `claude.md` would NOT be found if the tool looks for `CLAUDE.md`. **Recommended: keep `CLAUDE.md` as a permanent exception.** Verify the tooling lookup order before reconsidering.

### 5.4 Duplicate `TEMPLATE_*` / `*.template.md` pairs — consolidate first

14 document types in `DOCS/.templates/` have both an old-style `TEMPLATE_Algorithm.md` and a new-style `algorithm.template.md`. Additionally, three directories hold local template files (`TEMPLATE_Design_Document.md` in `.design/`, `TEMPLATE_HowTo.md` in `.howto/`, and `TEMPLATE_Implementation_Log.md` in `.implementation-logs/`) that have no `.template.md` counterpart in `.templates/` or that duplicate the `.templates/` version. Section 5.5 contains the pair-by-pair analysis and per-file action. **Recommended: consolidate as a prerequisite step.** This is independent of the kebab-case naming decision and should proceed regardless.

### 5.5 Template pair-by-pair analysis

Each pair was read and compared in full on 2026-05-17. The recommended action for each file is stated explicitly. Approval is requested before any file is deleted or moved.

---

#### Pair 1 — Algorithm

| Attribute | `TEMPLATE_Algorithm.md` | `algorithm.template.md` |
|-----------|------------------------|------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Line 8 note | "This template is the canonical version. The copy at `DOCS/.algorithm/TEMPLATE_Algorithm.md` is a convenience reference for the algorithm directory." | "This lowercase file is the canonical template. Legacy convenience copies may exist under dot-prefixed documentation folders, but new algorithm documents should start from this file." |
| All other content | Identical | Identical |

**Difference:** Single line of self-description only. Both files have identical structure, headings, placeholders, and [REQUIRED] markers.

**Recommended action:** Remove `TEMPLATE_Algorithm.md`. `algorithm.template.md` is the canonical file.

---

#### Pair 2 — Backlog

| Attribute | `TEMPLATE_Backlog.md` | `backlog.template.md` |
|-----------|----------------------|----------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Structure | Sprint-based: Current Sprint / High-Med-Low buckets / Resolved. No [REQUIRED] markers. No Purpose, Migration Items, Sprint Roadmap, Maintenance Rules, or Next Review Date sections. | Project-style: Purpose / Summary / Migration Items / Active Product Work / Active Item Details / Resolved Items / Sprint Roadmap / Maintenance Rules / Next Review Date. Full [REQUIRED] markers throughout. |
| Matches current BACKLOG.md format | No — diverges significantly | Yes — matches our actual `DOCS/.planning/BACKLOG.md` exactly |

**Difference:** Substantially different structure and completeness. `backlog.template.md` is the evolved, authoritative version.

**Recommended action:** Remove `TEMPLATE_Backlog.md`. `backlog.template.md` is the governed current version.

---

#### Pair 3 — Changelog

| Attribute | `TEMPLATE_Changelog.md` | `changelog.template.md` |
|-----------|------------------------|------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| [REQUIRED] markers | None | Present throughout |
| "Known Issues" section | Absent | Present (per-release) |
| `**Project:**` header field | Absent | Present with [REQUIRED] |
| Usage instruction | "Add new entries at the top…" only | Adds "Replace every [REQUIRED] placeholder before publishing." |

**Difference:** `changelog.template.md` is a more complete governed version with [REQUIRED] markers and a "Known Issues" section.

**Recommended action:** Remove `TEMPLATE_Changelog.md`. `changelog.template.md` is the governed current version.

---

#### Pair 4 — Code Review

| Attribute | `TEMPLATE_Code_Review.md` | `code-review.template.md` |
|-----------|--------------------------|--------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| `**Produces:**` line | `DOCS/.review/CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/` | `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` |
| Output directory in How to Use | `DOCS/.review/CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/` | `.review/CODE_REVIEW_[AGENT]_v[N]_[UTC]/` |
| v1.3 alignment | No — uses old v1.2 `DOCS/.review/` path and `{Reviewer}__{UTC_TIMESTAMP}` naming | Yes — aligned with DR-012 and DR-014 (root `.review/`, `[AGENT]_v[N]_[UTC]` naming) |

**Difference:** Different output path and naming format. `TEMPLATE_Code_Review.md` reflects the superseded v1.2 convention. `code-review.template.md` reflects the current v1.3 standard.

**Recommended action:** Remove `TEMPLATE_Code_Review.md`. `code-review.template.md` is the v1.3-aligned version.

---

#### Pair 5 — Decision Record

| Attribute | `TEMPLATE_Decision_Record.md` | `decision-record.template.md` |
|-----------|------------------------------|------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are byte-for-byte identical.

**Recommended action:** Remove `TEMPLATE_Decision_Record.md`. `decision-record.template.md` is the canonical file.

---

#### Pair 6 — Implementation Log

| Attribute | `TEMPLATE_Implementation_Log.md` | `implementation-log.template.md` |
|-----------|----------------------------------|----------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Line 8 note | "This template is the canonical version. The copy at `DOCS/.implementation/TEMPLATE_Implementation_Log.md` is a convenience reference." | "This lowercase file is the canonical template. Legacy convenience copies may exist…" |
| `**Produces:**` line | `DOCS/.implementation/IMPL_LOG_YYYY-MM-DD_Topic_Slug.md` — **stale path and naming** | `DOCS/.implementation/IMPL_LOG_YYYY-MM-DD_Topic_Slug.md` — **same stale path and naming** |
| Naming instruction | "Name the file: `IMPL_LOG_YYYY-MM-DD_Brief_Topic_Slug.md`" — **stale** | "Name the file: `IMPL_LOG_YYYY-MM-DD_Brief_Topic_Slug.md`" — **same stale** |
| All other content | Identical | Identical |

**Difference:** Line 8 self-description only. Both files carry the same stale path (`DOCS/.implementation/`) and filename convention (`IMPL_LOG_*`). Both need correcting to `DOCS/.implementation-logs/YYYY-MM-DD_short-session-topic.md` (per DR-017/DR-019).

**Recommended action:** Remove `TEMPLATE_Implementation_Log.md`. Update `implementation-log.template.md` to correct: (a) `**Produces:**` → `DOCS/.implementation-logs/YYYY-MM-DD_short-session-topic.md`; (b) naming instruction → `YYYY-MM-DD_short-session-topic.md`.

---

#### Pair 7 — Naming Conventions

| Attribute | `TEMPLATE_Naming_Conventions.md` | `naming-conventions.template.md` |
|-----------|----------------------------------|----------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Section count | 10 sections | 12 sections |
| [REQUIRED] markers | None | Present throughout |
| `**Governed by:**` header | Absent | Present with [REQUIRED] |
| `**Template:**` self-reference | Absent | Present with [REQUIRED] |
| Section 8 | "Document Names" | "Tag Names" (Document Names renumbered to 9) |
| Sections 10–12 | Ends at "Enforcement" (section 10) | Adds "Generated Artifact Names" (10), renumbers Decision Record IDs to 11 and Enforcement to 12 |

**Difference:** Substantially different. `naming-conventions.template.md` adds two complete sections ("Tag Names" and "Generated Artifact Names") required by RA v1.3 §10.9, and carries [REQUIRED] markers throughout.

**Recommended action:** Remove `TEMPLATE_Naming_Conventions.md`. `naming-conventions.template.md` is the governed v1.3-compliant version.

---

#### Pair 8 — Parity Contract

| Attribute | `TEMPLATE_Parity_Contract.md` | `parity-contract.template.md` |
|-----------|------------------------------|------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_Parity_Contract.md`. `parity-contract.template.md` is the canonical file.

---

#### Pair 9 — QA Strategy

| Attribute | `TEMPLATE_QA_Strategy.md` | `qa-strategy.template.md` |
|-----------|--------------------------|--------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_QA_Strategy.md`. `qa-strategy.template.md` is the canonical file.

---

#### Pair 10 — Root README

| Attribute | `TEMPLATE_Readme.md` | `readme.template.md` |
|-----------|---------------------|---------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_Readme.md`. `readme.template.md` is the canonical file.

---

#### Pair 11 — Screenplay Guide

| Attribute | `TEMPLATE_Screenplay_Guide.md` | `screenplay-guide.template.md` |
|-----------|-------------------------------|-------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_Screenplay_Guide.md`. `screenplay-guide.template.md` is the canonical file.

---

#### Pair 12 — Stack Architecture

| Attribute | `TEMPLATE_Stack_Architecture.md` | `stack-architecture.template.md` |
|-----------|----------------------------------|----------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_Stack_Architecture.md`. `stack-architecture.template.md` is the canonical file.

---

#### Pair 13 — Stack README

| Attribute | `TEMPLATE_Stack_Readme.md` | `stack-readme.template.md` |
|-----------|---------------------------|---------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_Stack_Readme.md`. `stack-readme.template.md` is the canonical file.

---

#### Pair 14 — Subject Application Contract

| Attribute | `TEMPLATE_Subject_App_Contract.md` | `subject-app-contract.template.md` |
|-----------|-----------------------------------|-----------------------------------|
| Location | `DOCS/.templates/` | `DOCS/.templates/` |
| Content | Identical | Identical |

**Difference:** None — files are identical.

**Recommended action:** Remove `TEMPLATE_Subject_App_Contract.md`. `subject-app-contract.template.md` is the canonical file.

---

#### Directory-local templates (no `.template.md` counterpart)

Three template files live inside their subject directories rather than in `.templates/`. None has a counterpart in `.templates/`:

**`DOCS/.design/TEMPLATE_Design_Document.md`**
A comprehensive 700-line heavyweight design document template covering 12 sections: executive summary, problem analysis, requirements, high-level design, detailed design, implementation plan, refactoring strategy, testing strategy, migration path, alternatives, open questions, and appendices. No `design-document.template.md` exists in `.templates/`. This template has significant content value not found elsewhere.

**Recommended action:** Move to `DOCS/.templates/design-document.template.md` so all templates live in one directory. The existing DESIGN_ documents in `.design/` were authored from an older version of this template; the moved version covers the same ground with more rigour.

---

**`DOCS/.howto/TEMPLATE_HowTo.md`**
A concise, well-structured how-to template with comment-block authoring instructions. Covers: what you will achieve, before-you-start checklist, step-by-step procedure with expected output, verify-it-worked section, common problems, and next steps. No `howto.template.md` exists in `.templates/`.

**Recommended action:** Move to `DOCS/.templates/howto.template.md`. Rename matches the `.template.md` convention; `.howto/` directory retains only authored content.

---

**`DOCS/.implementation-logs/TEMPLATE_Implementation_Log.md`**
This is the legacy template copy that was moved from `.implementation/` to `.implementation-logs/` by DR-019. It is an additional copy of the same stale `TEMPLATE_Implementation_Log.md` already covered in Pair 6 above. The canonical template is `implementation-log.template.md` in `.templates/`.

**Recommended action:** Remove. No unique content; superseded by `DOCS/.templates/implementation-log.template.md` (after it is updated per Pair 6 recommendation).

---

### 5.6 Summary of recommended actions for Phase 0

| # | File | Action | Reason |
|---|------|--------|--------|
| 1 | `DOCS/.templates/TEMPLATE_Algorithm.md` | **Remove** | Identical to `algorithm.template.md` (line 8 note only differs) |
| 2 | `DOCS/.templates/TEMPLATE_Backlog.md` | **Remove** | Superseded by the structurally richer `backlog.template.md` |
| 3 | `DOCS/.templates/TEMPLATE_Changelog.md` | **Remove** | Superseded; `changelog.template.md` has [REQUIRED] markers and Known Issues section |
| 4 | `DOCS/.templates/TEMPLATE_Code_Review.md` | **Remove** | Stale v1.2 output path; `code-review.template.md` reflects v1.3 (DR-012/DR-014) |
| 5 | `DOCS/.templates/TEMPLATE_Decision_Record.md` | **Remove** | Identical to `decision-record.template.md` |
| 6 | `DOCS/.templates/TEMPLATE_Implementation_Log.md` | **Remove** | Identical (minus line 8) to `implementation-log.template.md`; both need path fix (see #15) |
| 7 | `DOCS/.templates/TEMPLATE_Naming_Conventions.md` | **Remove** | Superseded; `naming-conventions.template.md` adds Tag Names and Generated Artifacts sections |
| 8 | `DOCS/.templates/TEMPLATE_Parity_Contract.md` | **Remove** | Identical to `parity-contract.template.md` |
| 9 | `DOCS/.templates/TEMPLATE_QA_Strategy.md` | **Remove** | Identical to `qa-strategy.template.md` |
| 10 | `DOCS/.templates/TEMPLATE_Readme.md` | **Remove** | Identical to `readme.template.md` |
| 11 | `DOCS/.templates/TEMPLATE_Screenplay_Guide.md` | **Remove** | Identical to `screenplay-guide.template.md` |
| 12 | `DOCS/.templates/TEMPLATE_Stack_Architecture.md` | **Remove** | Identical to `stack-architecture.template.md` |
| 13 | `DOCS/.templates/TEMPLATE_Stack_Readme.md` | **Remove** | Identical to `stack-readme.template.md` |
| 14 | `DOCS/.templates/TEMPLATE_Subject_App_Contract.md` | **Remove** | Identical to `subject-app-contract.template.md` |
| 15 | `DOCS/.templates/implementation-log.template.md` | **Update** | Fix stale `Produces:` path and filename convention to reflect DR-017/DR-019 |
| 16 | `DOCS/.design/TEMPLATE_Design_Document.md` | **Move** → `DOCS/.templates/design-document.template.md` | No counterpart exists in `.templates/`; belongs there |
| 17 | `DOCS/.howto/TEMPLATE_HowTo.md` | **Move** → `DOCS/.templates/howto.template.md` | No counterpart exists in `.templates/`; belongs there |
| 18 | `DOCS/.implementation-logs/TEMPLATE_Implementation_Log.md` | **Remove** | Duplicate copy of stale legacy template; `implementation-log.template.md` is canonical |

---

## 6. Implementation Plan

### Phase 0 — Prerequisites (before any renames)

Execute Section 5.6 actions (all approved and completed 2026-05-17). Summary:

- [x] **Remove 14 `TEMPLATE_*.md` files** from `DOCS/.templates/` (items 1–14 in Section 5.6)
- [x] **Update `implementation-log.template.md`** — `Produces:` corrected to `DOCS/.implementation-logs/YYYY-MM-DD_short-session-topic.md`; naming instruction corrected (item 15)
- [x] **Move `TEMPLATE_Design_Document.md`** → `DOCS/.templates/design-document.template.md`; RA preamble added (item 16)
- [x] **Move `TEMPLATE_HowTo.md`** → `DOCS/.templates/howto.template.md`; naming note updated (item 17)
- [x] **Remove `DOCS/.implementation-logs/TEMPLATE_Implementation_Log.md`** (item 18)
- [x] **Draft DR-020** — kebab-case adoption for all authored docs; three permanent exceptions (`README.md`, `CHANGELOG.md`, `CLAUDE.md`); four-phase migration plan. Accepted 2026-05-17.
- [x] **Inventory every markdown link** (not prose) pointing to files that will be renamed — see Section 6.1 below.
- [x] **Fix 13 stale `templates/` links** in `DOCS/README.md` (broken from DR-019 rename); also added `design-document.template.md` and `howto.template.md` rows.

**Result:** `DOCS/.templates/` contains 16 `*.template.md` files. No `TEMPLATE_*` files remain. 43/43 scenarios pass. OverallExitCode=0. Phase 0 fully complete.

### 6.1 — Markdown link inventory (Phase 0 output)

Links to files renamed in Phase 1 must be updated atomically during the rename. Links to files renamed in Phase 2 and 3 likewise.

**Phase 1 — files with links to authored directory docs:**

| Linking file | Links to (pre-rename) | Count |
|-------------|----------------------|-------|
| `DOCS/.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md` | `ALGORITHM_Sudoku_Basic_Solver.md` | 2 |
| `DOCS/.algorithm/README.md` | `ALGORITHM_Sudoku_Basic_Solver.md`, `ALGORITHM_Sudoku_Advanced_Solver.md` | 2 |
| `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` | `DESIGN_Audit_Trail_Feature.md`, `DESIGN_REST_API_Wrapper.md`, `DESIGN_Sudoku_Solver_Specification.md`, `TODO_Web_UI_Solver_Visualisation.md`, `BACKLOG.md` | 5 |
| `DOCS/.design/README.md` | `DESIGN_Sudoku_Solver_Specification.md`, `DESIGN_Naming_Conventions.md`, `NAMING_CONVENTIONS.md`, `DESIGN_Audit_Trail_Feature.md`, `DESIGN_REST_API_Wrapper.md`, `DESIGN_Web_UI_Solver_Visualisation.md`, `DESIGN_Screenplay_Migration.md` | 7 |
| `DOCS/.howto/HOWTO_Debug_SudokuSolver.md` | `ALGORITHM_Sudoku_Basic_Solver.md`, `TODO_Hidden_Singles_Complete_Implementation.md` | 2 |
| `DOCS/.howto/README.md` | `HOWTO_Debug_SudokuSolver.md` | 1 |
| `DOCS/.planning/TODO_Audit_Trail_Feature.md` | `DESIGN_Audit_Trail_Feature.md` | 1 |
| `DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md` | `ALGORITHM_Sudoku_Basic_Solver.md` (×3), `BACKLOG.md` | 4 |
| `DOCS/.planning/TODO_REST_API_Wrapper.md` | `DESIGN_REST_API_Wrapper.md` | 1 |
| `DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md` | `DESIGN_Web_UI_Solver_Visualisation.md` | 1 |
| `DOCS/.templates/howto.template.md` | Example comments only — not active links | — |
| `DOCS/README.md` | `ALGORITHM_Sudoku_Basic_Solver.md`, `ALGORITHM_Sudoku_Advanced_Solver.md`, `DESIGN_*` (×6), `TODO_*` (×4), `HOWTO_Debug_SudokuSolver.md`, `PROMPT_PLAYBOOK_*`, `NAMING_CONVENTIONS.md` | ~15 |
| `README.md` (root) | `DESIGN_Sudoku_Solver_Specification.md` (×5), `ALGORITHM_Sudoku_Basic_Solver.md` (×3), `DESIGN_Audit_Trail_Feature.md`, `DESIGN_REST_API_Wrapper.md` | ~10 |
| `demo-apps/demoapp001-typescript-cypress/README.md` | `ALGORITHM_Sudoku_Basic_Solver.md` (×3), `DESIGN_*` (×5) | ~8 |

**Phase 2 — files with links to DOCS root and Stack docs:**

| Linking file | Links to (pre-rename) | Count |
|-------------|----------------------|-------|
| `DOCS/README.md` | `ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md` (dead link — file renamed already) | 1 |
| `DOCS/.templates/qa-strategy.template.md` | `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md` | 2 |
| `DOCS/.templates/stack-architecture.template.md` | `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` | 2 |
| `DOCS/.templates/stack-readme.template.md` | `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` | 3 |
| `DOCS/README.md` | Template-index `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` references | 3 |

*Note: Template links to `ARCHITECTURE.md`, `QA_STRATEGY.md`, `SCREENPLAY_GUIDE.md` are examples inside template bodies — update alongside the actual stack docs rename.*

**Phase 3 — files with links to root governance docs:**

| Linking file | Links to (pre-rename) | Count |
|-------------|----------------------|-------|
| `DOCS/.templates/readme.template.md` | `DECISION_REGISTER.md` | 1 |
| `DOCS/.templates/stack-architecture.template.md` | `DECISION_REGISTER.md` | 1 |
| `DOCS/README.md` | `BACKLOG.md` (root redirect), `DECISION_REGISTER.md` | 2 |
| `DOCS/.templates/qa-strategy.template.md` | `DOCS/.planning/BACKLOG.md` | 1 |
| `DOCS/.planning/README.md` | `BACKLOG.md` (within `.planning/`) | 1 |
| `DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md` | `BACKLOG.md` | 1 |
| `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` | `BACKLOG.md` | 1 |
| `BACKLOG.md` (root) | `DOCS/.planning/BACKLOG.md` (authoritative — not renamed) | 2 |

### Phase 1 — Authored documents in typed directories ✅ Complete 2026-05-17

All 17 renames executed. ~60 references updated across 29 files. Validation: 0 broken links, 43/43 scenarios pass. See Phase 1c validation in commit history.

```
DOCS/.design/DESIGN_Audit_Trail_Feature.md        → audit-trail-feature.md
DOCS/.design/DESIGN_Naming_Conventions.md         → naming-conventions-design.md
DOCS/.design/DESIGN_REST_API_Wrapper.md           → rest-api-wrapper.md
DOCS/.design/DESIGN_Screenplay_Migration.md       → screenplay-migration.md
DOCS/.design/DESIGN_Sudoku_Solver_Specification.md → sudoku-solver-specification.md
DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md → web-ui-solver-visualisation.md
DOCS/.design/NAMING_CONVENTIONS.md               → naming-conventions.md
✅ DOCS/.design/TEMPLATE_Design_Document.md       → moved to DOCS/.templates/design-document.template.md (Phase 0)
DOCS/.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md → sudoku-advanced-solver.md
DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md    → sudoku-basic-solver.md
✅ DOCS/.algorithm/TEMPLATE_Algorithm.md          → removed (Phase 0)
DOCS/.howto/HOWTO_Debug_SudokuSolver.md           → debug-sudoku-solver.md
✅ DOCS/.howto/TEMPLATE_HowTo.md                 → moved to DOCS/.templates/howto.template.md (Phase 0)
DOCS/.planning/TODO_Audit_Trail_Feature.md        → todo-audit-trail-feature.md
DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md → todo-hidden-singles-implementation.md
DOCS/.planning/TODO_REST_API_Wrapper.md           → todo-rest-api-wrapper.md
DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md → todo-web-ui-solver-visualisation.md
DOCS/.planning/PROMPT_PLAYBOOK_20260330T1645Z.md  → prompt-playbook-20260330T1645Z.md
DOCS/.planning/BACKLOG.md                         → backlog.md
DOCS/.implementation-logs/ARCHIVE_NOTICE.md       → archive-notice.md
✅ DOCS/.implementation-logs/TEMPLATE_Implementation_Log.md → removed (Phase 0)
```

**Blast radius for Phase 1:** ~35 references to update across governance docs.

### Phase 2 — DOCS root and Stack docs ✅ Complete 2026-05-17

```
DOCS/reference-architecture.md                    → reference-architecture.md
DOCS/analysis-docs-subdirectory-cleanup-20260516.md → analysis-docs-subdirectory-cleanup-20260516.md
DOCS/analysis-directory-naming-kebab-case-2026-05-16.md → analysis-directory-naming-kebab-case-2026-05-16.md
DOCS/documentation-review-20260514T1100Z.md       → documentation-review-20260514T1100Z.md
demo-apps/demoapp001-typescript-cypress/docs/architecture.md   → architecture.md
demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md    → qa-strategy.md
demo-apps/demoapp001-typescript-cypress/docs/screenplay-guide.md → screenplay-guide.md
```

**Note on historical analysis docs:** The `ANALYSIS_*.md` files describe migrations that are already complete. Their historical content references the old state by design. Renaming is low-risk but their bodies will still reference old conventions — that is acceptable (historical documents describe the past).

**Blast radius for Phase 2:** ~40 references across CLAUDE.md, README.md, CHANGELOG.md, DECISION_REGISTER.md, ref-arch-alignment docs, and stack docs.

### Phase 3 — Root governance rename (Deferred)

```
DECISION_REGISTER.md  → decision-register.md
BACKLOG.md            → backlog.md  (root redirect — may be deleted rather than renamed)
```

**Blast radius for Phase 3:** highest — `DECISION_REGISTER.md` is referenced in nearly every governance document. ~60 references.

**Status:** Deferred. Phase 3 was intentionally skipped after Phase 2 to avoid the highest-blast rename while working on an active development branch. `DECISION_REGISTER.md` and root `BACKLOG.md` remain with their current names until a dedicated sprint executes this rename. When executed, Phase 4 updates below will also need a follow-up pass to update any DR-020 / DR-019 references that use `decision-register.md`.

### Phase 4 — naming-conventions.md and CLAUDE.md updates ✅ Complete 2026-05-17

- [x] `DOCS/.design/naming-conventions.md` updated: kebab-case rule (DR-020) in Section 5 with pattern table and permanent exceptions; Quick Reference row corrected; DR-021 next ID
- [x] `CLAUDE.md` updated: DR-020 added to Architecture Baseline; parity rules updated to DR-012 through DR-020 range; document naming parity rule added; risk register updated; documentation pointers current
- [ ] `DECISION_REGISTER.md` DR-019 / DR-020 in-body path references — deferred with Phase 3

### Validation gate (after each phase)

```powershell
# No broken markdown links
grep -r "](DESIGN_\|](ALGORITHM_\|](HOWTO_\|](TODO_\|](TEMPLATE_" --include="*.md" . `
  | grep -v ".review" | grep -v ".results"
# Expected: no output

# Tests still pass
.\.batch\run-demoapp001.ps1
# Expected: OverallExitCode=0, 43/43 scenarios
```

---

## 7. Effort and Risk Summary

| Phase | Files renamed | Reference updates | Risk | Effort |
|-------|--------------|-------------------|------|--------|
| 0 — Prerequisites (TEMPLATE_ consolidation, DR-020) | 14 removed | ~20 | Low | 1–2 hrs |
| 1 — Typed-directory authored docs | ~20 | ~35 | Low | 1 hr |
| 2 — DOCS root + Stack docs | 7 | ~40 | Medium | 1 hr |
| 3 — Root governance rename | 2 | ~60 | High | 1–2 hrs |
| 4 — NAMING_CONVENTIONS.md + CLAUDE.md | 0 | 2 files | Low | 30 min |
| **Total** | **~29 renamed, 14 removed** | **~155 updates** | Medium-High | **~5–6 hrs** |

---

## 8. Recommendation

**Adopt kebab-case for all authored document files, in four phases.**

The primary motivation is convention unification: directories, templates, implementation logs, and architecture docs already use kebab-case. Extending the same rule to all authored documents eliminates the last remaining naming inconsistency and simplifies NAMING_CONVENTIONS.md to a single rule.

**Permanent exceptions (document in DR-020):**
- `README.md` — ecosystem hard standard; GitHub renders it by name
- `CHANGELOG.md` — CI tooling dependency; keep UPPERCASE to prevent future tool conflicts
- `CLAUDE.md` — Anthropic tooling default; verify lookup behaviour before reconsidering
- Generated artefacts in `.results/` — governed by script/RA output format requirements

**Prerequisite (Phase 0, independent of naming decision):**
- Consolidate the duplicate `TEMPLATE_` / `*.template.md` file pairs in `.templates/`. This cleanup is clearly correct regardless of which naming convention is chosen and should not be held pending the larger decision.

**Sequencing:**
Execute phases in the order above. Phase 3 (root governance rename, especially `DECISION_REGISTER.md`) carries the highest blast radius and should be the last phase, not the first, to allow incremental validation and to reduce the risk of a large merge conflict on a long-running branch.

---

*DR-020 accepted 2026-05-17. This document was authored before DR-020 was accepted and still carries the legacy `ANALYSIS_` prefix name — it is a historical record and exempt from renaming per the analysis docs exception documented in Phase 2. Future analysis documents should be named `analysis-subject-YYYYMMDD.md`.*

*Phase 3 (DECISION_REGISTER.md rename) remains deferred. All other phases are complete.*
