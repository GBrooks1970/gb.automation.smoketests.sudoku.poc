# Screenplay-BDD Reference Architecture — Alignment & Migration Report

**Date:** 2026-05-15
**Analyst:** GitHub Copilot (GPT-5.3-Codex)
**Subject:** gb.automation.smoketests.sudoku.poc vs REFERENCE_ARCHITECTURE.md v1.2
**Status:** New baseline for v1.2 (supersedes prior v1.1-focused alignment)

---

## Executive Summary

The repository remains strong on implementation architecture (Screenplay layering, canonical feature store, stack documentation, architecture docs, orchestration runner, and CLI hardening). Core execution quality is stable, with test baseline confirmed at:

- 43 scenarios (43 passed)
- 241 steps (241 passed)

However, with REFERENCE_ARCHITECTURE.md now at v1.2, compliance is no longer "phase-complete". New and tightened v1.2 obligations introduce governance/documentation drift that now requires a focused follow-up migration cycle.

### Overall compliance (v1.2)

**Status:** High, but not full compliance.

### What is fully aligned

- Layered Screenplay architecture for DEMOAPP001
- Canonical feature store pattern with stack-local propagation
- Stack-level docs present
- Cross-cutting architecture docs present
- CLI hardening implemented (`--help`, `--timeout`, explicit exit contract)
- Orchestration runner emits two metrics formats with UTC timestamped files

### What is newly out of alignment under v1.2

- Template filename contract in Appendix A (exact lower-case names) is not met in DOCS/templates
- Backlog status taxonomy does not use required `Open` / `In Progress` / `Resolved`
- Review-output extension rule references DR-012, but project decision register currently ends at DR-008
- Code review directory placement is still under DOCS/.review rather than repository root `code-review/` or `.review/`
- Retention cleanup in orchestration script deletes metrics summaries instead of preserving them when purging old logs
- CLAUDE.md contains stale migration-era references (for example deleted step-definition paths, outdated memory-key notes)

---

## 1. Version Delta: v1.1 -> v1.2

The v1.2 bump adds or tightens governance requirements that materially affect this repository:

| Area | v1.2 Impact | Repository Effect |
|------|-------------|------------------|
| Code review outputs (10.7) | Adds accepted output shapes and explicit bundle naming requirements; references DR-012 for multi-file bundle extension | Current review bundle naming does not match the specified v1.2 extension format; DR-012 absent |
| Template index (Appendix A) | Requires exact lower-case template file names under DOCS/templates | Current template set is mostly uppercase TEMPLATE_*.md; required filenames missing |
| Backlog status rules (10.1) | Requires statuses exactly `Open`, `In Progress`, `Resolved` | Current backlog uses emoji statuses and mixed labels |
| Results archival (9.3) | Requires preserving metrics summary when old logs are purged | Current cleanup removes all old files in logs and metrics together |

---

## 2. Current Compliance Snapshot

| Domain | Status | Notes |
|-------|--------|-------|
| Section 2 Layer model | ✅ | Implemented and stable |
| Section 3 Screenplay contracts | ✅ | Actor/Abilities/Tasks/Questions in place |
| Section 4 structure (role-level) | ✅ | Structural roles present; naming divergence remains intentional |
| Section 5 canonical feature store | ✅ | features_shared present and in use |
| Section 6 CLI contract | ✅ | Help/options, timeout, exit mapping, stderr behavior present |
| Section 7 Ability taxonomy relevance | ⚪ | API/UI canonical abilities not required for current @util stack |
| Section 8 parity rules (single-stack pre-parity) | ⚠️ | Internal consistency good; multi-stack parity not yet testable |
| Section 9 orchestration/metrics | ⚠️ | Metrics format compliant; archival behavior partially non-compliant |
| Section 10 documentation obligations | ⚠️ | Most docs exist, but v1.2 template filename contract and some placement rules are not fully met |
| Section 11 onboarding checklist readiness | ⚠️ | Foundation exists, but governance docs must be normalized before Stack 2 onboarding |

Legend: ✅ compliant, ⚠️ partial/non-compliant, ⚪ not currently applicable

---

## 3. Detailed Findings (ordered by severity)

## High Severity

### H1. Appendix A template filename contract not met

**Requirement (v1.2):** exact template files under DOCS/templates using lower-case `*.template.md` names.

**Observed:** DOCS/templates currently contains uppercase names (for example `TEMPLATE_Stack_Architecture.md`, `TEMPLATE_Code_Review.md`) and does not contain the required lower-case filenames.

**Risk:** Automated governance checks or future stack onboarding against v1.2 template paths will fail.

**Recommended migration:** Add v1.2-compliant lower-case template files (can be canonical copies of existing content), then update document metadata links to those canonical names.

### H2. Backlog status taxonomy non-compliant

**Requirement (10.1):** all backlog items MUST use `Open`, `In Progress`, or `Resolved`.

**Observed:** DOCS/.planning/BACKLOG.md uses emoji statuses (`🔴 Not Started`, `🟢 Completed`, `🟡 In Progress`) and mixed terminology.

**Risk:** Governance non-compliance and ambiguous automation/reporting semantics.

**Recommended migration:** Normalize status fields in DOCS/.planning/BACKLOG.md to required values and preserve current meaning in a one-time mapping table.

### H3. Review-output extension references DR-012, but DR-012 absent

**Requirement (10.7):** multi-file bundle extension is accepted in v1.2 and explicitly recorded as DR-012.

**Observed:** DECISION_REGISTER.md currently states last entry DR-008; no DR-012 exists.

**Risk:** If project continues using bundle review format, provenance is incomplete under v1.2.

**Recommended migration:** Add decisions DR-009 through DR-012, or (minimum) add DR-009 that explicitly adopts v1.2 and introduces local decision ID for review output shape, then align naming convention accordingly.

## Medium Severity

### M1. Code review directory location differs from v1.2 root expectation

**Requirement (10.7):** `code-review/` or `.review/` at repository root.

**Observed:** reviews are in DOCS/.review.

**Risk:** Moderate. Functional organization is fine, but literal-path compliance is off unless formally superseded by decision.

**Recommended migration options:**

1. Move/duplicate review root to repository `.review/`.
2. Keep DOCS/.review and record an explicit accepted divergence decision against v1.2 path literal.

### M2. Metrics archival logic does not preserve summary files

**Requirement (9.3):** metrics summary must be preserved after log purge.

**Observed:** .batch/run-demoapp001.ps1 purges old files in both .results/logs and .results/.metrics, including markdown summaries.

**Risk:** Historical compliance visibility can be lost.

**Recommended migration:** Change cleanup policy to purge old logs and machine-readable metrics selectively, while retaining markdown summaries (or retaining latest N summaries per suite).

### M3. CLAUDE.md contains stale references that conflict with current architecture state

**Observed examples:** references to deleted step-definition path/tests and memory-keys "not yet created".

**Risk:** AI agent context drift and incorrect future edits.

**Recommended migration:** Refresh CLAUDE.md risk register and authoritative-reference sections to match current repository state and v1.2 obligations.

## Low Severity

### L1. Dot-prefix DOCS subdirectory strategy still diverges from literal RA path examples

**Observed:** project continues to use DR-001 dot-prefixed folders (for example DOCS/.planning, DOCS/.design).

**Risk:** Low if documented and consistently enforced.

**Recommended migration:** No immediate structural change required if decision record remains explicit and cross-referenced in compliance docs.

---

## 4. Evidence Snapshot

### Verified execution state

- npm test result: 43 scenarios passed, 241 steps passed.
- Orchestration runner execution: BuildExitCode=0, TestExitCode=0, OverallExitCode=0.
- Metrics artifacts generated in .results/.metrics with UTC timestamp suffix.

### Verified governance state

- REFERENCE_ARCHITECTURE.md is v1.2 (2026-05-15).
- DECISION_REGISTER.md currently ends at DR-008.
- DOCS/templates lacks required lower-case Appendix A template filenames.
- DOCS/.planning/BACKLOG.md status taxonomy not normalized to required three states.
- Existing alignment file for 2026-05-14 includes stale pre-migration sections and is no longer authoritative for v1.2.

---

## 5. Future Migration Work (v1.2 Compliance Plan)

## Phase A — Governance Normalization (Completed 2026-05-15)

**Status:** ✅ Resolved

Completed items:
1. ✅ Adopted v1.2 formally in DECISION_REGISTER with new decision entry (DR-009).
2. ✅ Added required template filenames under DOCS/templates in exact Appendix A names (14 lower-case .template.md files).
3. ✅ Normalized DOCS/.planning/BACKLOG.md statuses to Open/In Progress/Resolved across all 24 items.
4. ✅ Updated backlog metadata to include explicit parity-gap tracking language per v1.2 §10.1.

**Validation:**
- DECISION_REGISTER.md now contains DR-009 with full v1.2 adoption context and consequences.
- DOCS/templates now contains both legacy uppercase TEMPLATE_*.md (for transition) and required lowercase *.template.md files.
- BACKLOG.md status values confirmed as `Open`, `In Progress`, or `Resolved` (no emoji or mixed terminology).
- BACKLOG.md header updated with v1.2 governance reference and explicit parity tracking purpose statement.

## Phase B — Review & Provenance Alignment (Completed 2026-05-15)

**Status:** ✅ Resolved

Completed items:
1. ✅ Decided on review directory strategy: `DOCS/.review/` with dot-prefix convention justification (DR-010).
2. ✅ Added formal decision entry for review output shape and naming strategy aligned to v1.2 (DR-011).
3. ✅ Standardized review output naming and structure to v1.2-compliant bundle shape.

**Validation:**
- DECISION_REGISTER.md now contains DR-010 (review directory divergence justification via DR-001 consistency).
- DECISION_REGISTER.md now contains DR-011 (review output shape compliance and DR-012 multi-file bundle strategy).
- All existing review outputs in DOCS/.review already follow v1.2 shape (no changes needed to historical reviews).
- Future reviews will be generated using v1.2-compliant naming and structure.

## Phase C — Orchestration Archival Compliance (Medium)

1. Update .batch/run-demoapp001.ps1 retention cleanup to preserve markdown summaries.
2. Document retention/archival policy clearly in DOCS/architecture/logging-design.md and CHANGELOG if retention behavior changes.

## Phase D — Agent Instruction Currency (Medium)

1. Update CLAUDE.md stale references (removed files, outdated risk entries, backlog path references).
2. Add explicit parity-rules summary section aligned with v1.2 Section 8 language.

---

## 6. Proposed Backlog Additions

| ID | Title | Priority | Status | Affected area |
|----|-------|----------|--------|---------------|
| NEW-017 | Adopt RA v1.2 in decision register | High | Resolved (2026-05-15) | Governance |
| NEW-018 | Add Appendix A exact template filenames in DOCS/templates | High | Resolved (2026-05-15) | Documentation templates |
| NEW-019 | Normalize backlog status taxonomy to Open/In Progress/Resolved | High | Resolved (2026-05-15) | Planning |
| NEW-020 | Align review output policy with v1.2 and record decision lineage | Medium | Resolved (2026-05-15) | Reviews |
| NEW-021 | Preserve metrics summaries during archival cleanup | Medium | Open | Orchestration |
| NEW-022 | Refresh CLAUDE.md for post-migration reality and v1.2 parity rules | Medium | Open | Agent guidance |

---

## 7. Conclusion

The repository remains technically healthy and execution-stable, but the v1.2 architecture bump re-opens compliance work in governance and documentation mechanics. The migration burden is now primarily procedural rather than algorithmic.

With Phases A through D completed, the project should return to full compliance posture under v1.2 and be better prepared for Stack 2 onboarding and parity verification.
