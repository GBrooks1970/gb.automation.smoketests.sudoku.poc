# Analysis: Document Naming — Adopting Lowercase Kebab-Case

**Date:** 2026-05-16
**Author:** Claude Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` — impact assessment for converting document filenames from the current `PREFIX_Title_Case.md` format to `lowercase-kebab-case.md`
**Status:** Pre-decision — awaiting DR

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
| `DOCS/ANALYSIS_DOCS_Subdirectory_Cleanup_20260516.md` | `analysis-docs-subdirectory-cleanup-20260516.md` |
| `DOCS/ANALYSIS_Directory_Naming_Kebab_Case_2026-05-16.md` | `analysis-directory-naming-kebab-case-2026-05-16.md` |
| `DOCS/Documentation_Review_20260514T1100Z.md` | `documentation-review-20260514T1100Z.md` |
| `DOCS/REFERENCE_ARCHITECTURE.md` | `reference-architecture.md` |
| `DOCS/.implementation-logs/ARCHIVE_NOTICE.md` | `archive-notice.md` |
| `demo-apps/demoapp001-typescript-cypress/docs/ARCHITECTURE.md` | `architecture.md` |
| `demo-apps/demoapp001-typescript-cypress/docs/QA_STRATEGY.md` | `qa-strategy.md` |
| `demo-apps/demoapp001-typescript-cypress/docs/SCREENPLAY_GUIDE.md` | `screenplay-guide.md` |

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

14 document types have both an old-style `TEMPLATE_Algorithm.md` and a new-style `algorithm.template.md` under `DOCS/.templates/`. The old-style files predate the RA template mandate (Section 10.5) and are heavier, more prescriptive documents. The new-style files are the RA v1.3 governed canonical templates. **Recommended: consolidate as a prerequisite step.** Remove the `TEMPLATE_` files; keep and improve the `*.template.md` files. This is a separate, bounded change that does not require the kebab-case decision to proceed.

---

## 6. Implementation Plan

### Phase 0 — Prerequisites (before any renames)

- [ ] **Resolve TEMPLATE_ duplication** (Section 5.4): Remove 14 `TEMPLATE_*.md` files from `DOCS/.templates/`; confirm the `*.template.md` versions cover all required sections. This is independent of the naming decision and should proceed regardless.
- [ ] **Draft DR-020** covering: kebab-case adoption scope, permanent exceptions (`README.md`, `CHANGELOG.md`, `CLAUDE.md`), treatment of historical analysis docs.
- [ ] **Inventory every markdown link** (not prose) pointing to files that will be renamed. These must be updated atomically with the rename.

### Phase 1 — Authored documents in typed directories (low external risk)

Rename files within `DOCS/.design/`, `DOCS/.algorithm/`, `DOCS/.howto/`, `DOCS/.planning/`, `DOCS/.implementation-logs/`:

```
DOCS/.design/DESIGN_Audit_Trail_Feature.md        → audit-trail-feature.md
DOCS/.design/DESIGN_Naming_Conventions.md         → naming-conventions-design.md
DOCS/.design/DESIGN_REST_API_Wrapper.md           → rest-api-wrapper.md
DOCS/.design/DESIGN_Screenplay_Migration.md       → screenplay-migration.md
DOCS/.design/DESIGN_Sudoku_Solver_Specification.md → sudoku-solver-specification.md
DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md → web-ui-solver-visualisation.md
DOCS/.design/NAMING_CONVENTIONS.md               → naming-conventions.md
DOCS/.design/TEMPLATE_Design_Document.md          → (remove if *.template.md duplicate exists)
DOCS/.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md → sudoku-advanced-solver.md
DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md    → sudoku-basic-solver.md
DOCS/.algorithm/TEMPLATE_Algorithm.md              → (remove — governed by algorithm.template.md)
DOCS/.howto/HOWTO_Debug_SudokuSolver.md           → debug-sudoku-solver.md
DOCS/.howto/TEMPLATE_HowTo.md                    → (remove — add to .templates/ if missing)
DOCS/.planning/TODO_Audit_Trail_Feature.md        → todo-audit-trail-feature.md
DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md → todo-hidden-singles-implementation.md
DOCS/.planning/TODO_REST_API_Wrapper.md           → todo-rest-api-wrapper.md
DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md → todo-web-ui-solver-visualisation.md
DOCS/.planning/PROMPT_PLAYBOOK_20260330T1645Z.md  → prompt-playbook-20260330T1645Z.md
DOCS/.planning/BACKLOG.md                         → backlog.md
DOCS/.implementation-logs/ARCHIVE_NOTICE.md       → archive-notice.md
DOCS/.implementation-logs/TEMPLATE_Implementation_Log.md → (remove — governed by .templates/)
```

**Blast radius for Phase 1:** ~35 references to update across governance docs.

### Phase 2 — DOCS root and Stack docs

```
DOCS/REFERENCE_ARCHITECTURE.md                    → reference-architecture.md
DOCS/ANALYSIS_DOCS_Subdirectory_Cleanup_20260516.md → analysis-docs-subdirectory-cleanup-20260516.md
DOCS/ANALYSIS_Directory_Naming_Kebab_Case_2026-05-16.md → analysis-directory-naming-kebab-case-2026-05-16.md
DOCS/Documentation_Review_20260514T1100Z.md       → documentation-review-20260514T1100Z.md
demo-apps/demoapp001-typescript-cypress/docs/ARCHITECTURE.md   → architecture.md
demo-apps/demoapp001-typescript-cypress/docs/QA_STRATEGY.md    → qa-strategy.md
demo-apps/demoapp001-typescript-cypress/docs/SCREENPLAY_GUIDE.md → screenplay-guide.md
```

**Note on historical analysis docs:** The `ANALYSIS_*.md` files describe migrations that are already complete. Their historical content references the old state by design. Renaming is low-risk but their bodies will still reference old conventions — that is acceptable (historical documents describe the past).

**Blast radius for Phase 2:** ~40 references across CLAUDE.md, README.md, CHANGELOG.md, DECISION_REGISTER.md, ref-arch-alignment docs, and stack docs.

### Phase 3 — Root governance rename

```
DECISION_REGISTER.md  → decision-register.md
BACKLOG.md            → backlog.md  (root redirect — may be deleted rather than renamed)
```

**Blast radius for Phase 3:** highest — `DECISION_REGISTER.md` is referenced in nearly every governance document. ~60 references.

### Phase 4 — NAMING_CONVENTIONS.md and CLAUDE.md updates

- Update `DOCS/.design/NAMING_CONVENTIONS.md` (now `naming-conventions.md`) to reflect:
  - Single kebab-case rule replacing the five per-type prefix rules
  - Permanent exceptions table: `README.md`, `CHANGELOG.md`, `CLAUDE.md`
  - Generated artefact patterns remain as-is
- Update `CLAUDE.md`: all documentation pointer paths updated.
- Update DR-019 and DR-020 in `decision-register.md`.

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

*Binding decision must be recorded as DR-020 before Phase 1 begins.*
*This document itself follows the current `ANALYSIS_` prefix convention; once DR-020 is accepted, future analysis documents would be named `analysis-subject-YYYYMMDD.md`.*
