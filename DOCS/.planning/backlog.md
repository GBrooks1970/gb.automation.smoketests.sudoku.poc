# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-06-17 (reconciling the 2026-06-16 CLAUDE_Opus_4_8 code-review remediation
stream — BACKLOG-043+ / worklist SUD-09.. — as items land; 2026-06-13 reconciled the 2026-05-30
GPT-5.3-Codex stream BACKLOG-035 through BACKLOG-042 / worklist SUD-01..08)
**Governed by:** `reference-architecture.md` v1.15 Section 10.1
**Template:** `DOCS/.templates/backlog.template.md`
**Authoritative path:** `DOCS/.planning/backlog.md`
**Status:** Active Development

---

## Purpose

This backlog tracks product, technical debt, and Reference Architecture migration work required to keep current and future Stacks in parity.

Per v1.15 Section 10.1:

- Every tracked item uses exactly one status: `Open`, `In Progress`, or `Resolved`.
- Resolved items are retained as a record that the gap existed.
- Structural choices must be recorded in `decision-register.md` before the related work is closed.

---

## Summary

| Status | Count |
|--------|-------|
| Open | 3 |
| In Progress | 0 |
| Resolved | 66 |
| **Total** | **69** |

| Area | Current state |
|------|---------------|
| Current execution baseline | DEMOAPP001: 46 scenarios / 257 steps passing; DEMOAPP001 REST API integration PASS; DEMOAPP002: 46 pytest-bdd scenarios passing; DEMOAPP003: 46 SpecFlow scenarios passing; 3-Stack parity PASS |
| Active Reference Architecture | v1.15 |
| Active platform specification | `sudoku-solver-platform-specification.md` v1.1 (Accepted, DR-034); `sudoku-solver-specification.md` v1.0 is the original core baseline |
| Active Stacks | `DEMOAPP001_TYPESCRIPT_CYPRESS` (dir: `demo-apps/demoapp001-typescript-cypress/`), `DEMOAPP002_PYTHON_PYTEST` (dir: `demo-apps/demoapp002-python-pytest/`), `DEMOAPP003_CSHARP_SPECFLOW` (dir: `demo-apps/demoapp003-csharp-specflow/`) |
| Current sprint focus | Future product/solver work (all current sprint items resolved; 2026-05-30 code-review remediation stream closed — BACKLOG-035..042) |
| Highest parity risks | RA-001 through RA-006 all Resolved — RA v1.9 structural gaps closed |

---

## Reference Architecture Migration Items

| ID | Title | Stack(s) | Nature of Gap | Priority | Status | Decision Record |
|----|-------|----------|---------------|----------|--------|-----------------|
| MIG-01 | Adopt Reference Architecture v1.3 and create DR-012 | All | Governance baseline | High | Resolved | DR-012 |
| MIG-02 | Add RA-literal DOCS path bridges | All | Documentation path compatibility | High | Resolved | DR-013 |
| MIG-03 | Align code review output location and naming | All | Review output compliance | High | Resolved | DR-014, DR-029 |
| MIG-04 | Wire Screenplay runtime state through Actor Memory | DEMOAPP001 and future Stacks | Screenplay parity contract | High | Resolved | DR-015 |
| MIG-05 | Remove direct Ability calls from step definitions | DEMOAPP001 and future Stacks | Layer 2 thinness | High | Resolved | DR-015 |
| MIG-06 | Refresh AI agent guide for v1.3 | All | Agent guidance currency | Medium | Resolved | DR-012, DR-013, DR-014, DR-029 |
| MIG-07 | Reconcile backlog against v1.3 state | All | Planning currency | Medium | Resolved | None required |
| MIG-08 | Complete template mandate details | All | Template compliance | Medium | Resolved | None required |
| MIG-09 | Normalize implementation-log location and naming policy | All | Documentation path and naming | Medium | Resolved | DR-017 |
| MIG-10 | Add feature parity validation report process | All | Generated parity artifacts | Medium | Resolved | None required |
| MIG-11 | Parameterize over-specified canonical Gherkin steps | All | Gherkin portability | Low | Resolved | DR-018 |
| MIG-12 | Decide metrics Stack identifier policy | All | Multi-Stack reporting | Low | Resolved | DR-016 |
| MIG-13 | Rename Stack filesystem directories to kebab-case | DEMOAPP001 and future Stacks | Directory naming alignment | Medium | Resolved | DR-016 |

---

## Reference Architecture Improvement Items

Raised by structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.
Items are improvements to `reference-architecture.md` v1.3 itself, not project implementation work.

| ID | Title | Risk (review) | Severity | Priority | Status | Decision Record |
|----|-------|---------------|----------|----------|--------|-----------------|
| RA-001 | Define `@util` surface type formally in RA Sections 6 and 7 | Risk 1 | Critical | High | Resolved | DR-021 |
| RA-002 | Add CI/CD pipeline requirements section to RA (Section 9.4) | Risk 2 | High | High | Resolved | DR-022 |
| RA-003 | Define automated Memory key parity enforcement mechanism | Risk 3 | High | High | Resolved | DR-023 |
| RA-004 | Define Canonical Feature Store change governance (Section 5.5) | Risk 4 | High | High | Resolved | DR-024 |
| RA-005 | Correct `features_shared/` underscore naming throughout RA | Risk 5 | Medium | Medium | Resolved | None required |
| RA-006 | Resolve uppercase doc name conflict in RA Sections 10.1 and 10.2 | Risk 7 | Medium | Medium | Resolved | DR-025 |
| RA-007 | Add test data management specification to RA (Section 5.6) | Risk 8 | Medium | Medium | Resolved | DR-026 |
| RA-008 | Replace CHANGELOG.md retention policy rule with decision-register.md (Section 9.3) | Risk 9 | Low | Low | Resolved | None required |
| RA-009 | Add verification method column to parity criteria (Section 8.4) | Risk 10 | Low | Low | Resolved | DR-027 |
| RA-010 | Specify shared `packages/` directory rules in RA (Section 4.4) | Risk 11 | Low | Low | Resolved | DR-028 |

---

## Code Review Remediation Items (GPT-5.3-Codex review, 2026-05-30)

Raised by `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` (Risks 1–6, plus its Next
Steps). The review postdated this backlog by one day, so the remediation was tracked and delivered
through the portfolio worklist `WORKLIST_gb.automation.smoketests.sudoku.poc.md` (items SUD-01..08)
and is reconciled here as the authoritative record. All **Resolved 2026-06-13**.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-035 | SUD-01 | Early solved-grid check before the progress loop (already-solved input returns `SOLVED` without invoking algorithms) | All | Risk 2 | High | Resolved | None required |
| BACKLOG-036 | SUD-02 | Draft v1.1 solver-platform specification evolving the v1.0 baseline | All (docs) | Risk 1 | High | Resolved | DR-034 |
| BACKLOG-037 | SUD-03 | Deep-copy grid snapshot methods (`getGrid`/`get_grid`/`GetGrid`); public `grid` retained, direct mutation deprecated | All | Risk 3 | Medium | Resolved | None required |
| BACKLOG-038 | SUD-04 | Document validation-layer boundaries (loader = structure; solver/API = constraints) + author DEMOAPP001 OpenAPI contract | DEMOAPP001 (docs) | Risk 4 | Medium | Resolved | DR-035 |
| BACKLOG-039 | SUD-05 | Stack capability matrix — core/BDD parity required, API/web staged as roadmap for DEMOAPP002/003 | All (docs) | Risk 5 | Medium | Resolved | None required |
| BACKLOG-040 | SUD-06 | Document C# loader integer validation (typed `System.Text.Json` deserialization as the integer-type gate) | DEMOAPP003 (docs) | Risk 6 | Low | Resolved | None required |
| BACKLOG-041 | SUD-07 | Accept v1.1 spec post-merge — DR-034 flipped to Accepted, root README version/status metadata updated | All (docs) | Next Step 2 | Medium | Resolved | DR-034 |
| BACKLOG-042 | SUD-08 | Bump GitHub Actions to Node-24-compatible versions (`checkout@v5`/`setup-node@v5`/`setup-python@v6`/`setup-dotnet@v5`/`upload-artifact@v6`) ahead of the 2026-06-16 cutover | CI | Currency | Medium | Resolved | None required |

Delivery: SUD-01/02 in PR #18; SUD-03/04 in PR #19; SUD-07/08 in PR #20; SUD-05/06 in PR #21.
All three stacks remained green (46 scenarios each) with memory-key / feature / step-text parity
passing at each step; CI ran green on the new Node-24 action pins. Docs-only items were verified by
link/anchor resolution and stale-claim greps. The structural decisions are recorded as DR-034 (v1.1
platform spec) and DR-035 (validation boundaries + OpenAPI), both Accepted.

---

## Code Review Remediation Items (CLAUDE_Opus_4_8 review, 2026-06-16)

Raised by `DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z/` (Risks 1–5; all
Low/editorial or Informational — no Critical/High/Medium findings). Tracked and delivered through
the portfolio worklist `WORKLIST_gb.automation.smoketests.sudoku.poc.md` (items SUD-09..13) and
reconciled here as the authoritative record.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-043 | SUD-09 | Fix root README "+ Flask" mislabel of the Python stack (diagram boxes relabelled to the real toolchains: TypeScript/Cucumber, Python/pytest-bdd, C#/SpecFlow) | All (docs) | Risk 1 | Low | Resolved | None required |
| BACKLOG-044 | SUD-10 | Update stale root README "35+ test scenarios" claim to the true figure (46 scenarios per stack / 138 across all three; DEMOAPP001 = 46/257 steps) | All (docs) | Risk 2 | Low | Resolved | None required |
| BACKLOG-045 | SUD-11 | Governance hygiene: add an ordering note at DR-035 explaining it was authored before DR-034 (IDs sequential, on-page order reversed); drop seconds from the root README date metadata per the no-seconds convention (`2026-01-30T20:00:00Z` -> `2026-01-30T20:00Z`) | All (docs) | Risk 4 | Low | Resolved | None required (editorial) |
| BACKLOG-046 | SUD-12 | README ASCII-vs-emoji policy — option (a) documented exception: record in `DOCS/.design/naming-conventions.md` §5.1 that the root README is a deliberate, governed exception permitted rich formatting (emoji status glyphs + box-drawing diagram) as the primary human-facing doc, while all other authored docs stay ASCII/kebab-case per DR-020; README and naming-conventions no longer contradict | All (docs) | Risk 3 | Low | Resolved | None required (DR-020 already reserves README) |
| BACKLOG-047 | SUD-13 | CI aggregate `gate` job + `pwsh` prerequisite note — option (b) DO IT: add a lightweight `gate` job to `.github/workflows/ci.yml` with `needs: [demoapp001-typescript-cypress, demoapp002-python-pytest, demoapp003-csharp-specflow]` running a trivial step, to serve as a single fan-in required status check that branch protection can pin; add a `pwsh` (PowerShell 7+) prerequisite note to the README contributor section for reproducing the `.batch/*.ps1` parity gates locally | CI + docs | Risk 5 | Informational | Resolved | None required (no structural change; gate is a CI convenience) |

---

## Active Product and Technical Work

| ID | Title | Stack(s) | Nature of Gap | Priority | Status |
|----|-------|----------|---------------|----------|--------|
| BACKLOG-009 | Implement REST API Wrapper | DEMOAPP001 API surface | Feature implementation | Medium | Resolved |
| BACKLOG-018 | Implement Web UI Solver Visualisation | DEMOAPP001 future UI surface | Feature implementation | Medium | Resolved |
| BACKLOG-021 | C# Screenplay-style Step Definitions | DEMOAPP003 | Future Stack parity | Medium | Resolved |
| BACKLOG-010 | Docker Compose for Local Development | All | Local development infrastructure | Low | Resolved |
| BACKLOG-011 | Performance Benchmarking Suite | All | Performance regression detection | Low | Resolved |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | Future Stack implementation | Future | Resolved |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | Future Stack implementation | Future | Resolved |
| BACKLOG-014 | Advanced Solving Techniques | DEMOAPP001 and future Stacks | Solver capability | Future | Open |
| BACKLOG-015 | Interactive Sudoku Tutor | Future product surface | Product idea | Future | Open |
| BACKLOG-016 | Puzzle Generator | Future product surface | Product idea | Future | Open |
| BACKLOG-032 | Refactor Python Questions to read from Actor memory | DEMOAPP002 | Screenplay parity (Risk 1) | High | Resolved |
| BACKLOG-033 | Extract side effects from MultipleSolvers.isolation_verified() | DEMOAPP002 | Screenplay anti-pattern (Risk 2) | High | Resolved |
| BACKLOG-034 | Resolve BACKLOG-012 as stale duplicate of BACKLOG-020 | All | Backlog governance (Risk 4) | Medium | Resolved |

---

## Active Item Details

### RA-001: Define `@util` surface type formally in RA Sections 6 and 7

**Priority:** High
**Status:** Resolved
**Severity:** Critical (review Risk 1)
**Nature of Gap:** RA specification gap — `@util` tag appears in Sections 5.3 and Appendix B but has no corresponding surface contract (Section 6), Ability definition (Section 7), or orchestration lifecycle (Section 9.1)
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 1
**Resolution:** DR-021 — RA v1.4 adds Section 6.0 (`@util` surface contract), Section 7.0 (canonical Ability), Section 8.1 minimum Memory keys, Section 9.1 lifecycle, Appendix B checklist block. RA version bumped to v1.4 (2026-05-18).

Acceptance criteria:

- [x] Section 6.0 added: `@util` surface contract specifying in-process subject application requirements
- [x] Section 7.0 added: canonical `@util` Ability definition (`UseSubjectDirectly` or equivalent)
- [x] Section 9.1 updated: `@util` orchestration lifecycle added alongside API/UI/CLI lifecycles
- [x] Minimum Memory key set for `@util` surface documented in Section 8.1
- [x] Appendix B compliance checklist references the new `@util` surface contract section
- [x] RA version bumped and a DR entry created recording the addition

---

### RA-002: Add CI/CD pipeline requirements section to RA

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 2)
**Nature of Gap:** RA mandates orchestration and metrics but provides no CI/CD pipeline specification — pipeline gate requirements, required exit code handling, and artifact retention in CI context are undefined
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 2
**Resolution:** DR-022 — RA v1.5 adds Section 9.4 (CI/CD Pipeline Requirements): required gate sequence, `OverallExitCode` contract, feature parity as mandatory gate, CI artifact retention, multi-Stack pipeline isolation. RA version bumped to v1.5 (2026-05-18).

Acceptance criteria:

- [x] Section 9.4 added: CI/CD pipeline requirements covering required gates (build, test, parity report)
- [x] Exit code contract specified: `OverallExitCode` must block merge on non-zero
- [x] Feature parity report designated as required CI gate (not optional)
- [x] Artifact retention in CI context addressed (same policy as Section 9.3 or explicitly different)
- [x] RA version bumped and a DR entry created

---

### RA-003: Define automated Memory key parity enforcement mechanism

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 3)
**Nature of Gap:** Section 8.1 mandates identical Memory key constants across Stacks but provides no automated verification mechanism — manual checklist only, insufficient for multi-Stack projects
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 3
**Resolution:** DR-023 — RA v1.6 adds "Automated enforcement" subsection to Section 8.1 (multi-Stack MUST provide checker, single-Stack MAY use checklist). Appendix A updated with `memory-key-check.template.md`. Template created at `DOCS/.templates/memory-key-check.template.md`. Script created at `.batch/check-memory-key-parity.ps1`. DEMOAPP001 and DEMOAPP002 pass: all 6 constants verified OK per Stack. The GitHub Actions CI workflow runs the memory-key parity gate.

Acceptance criteria:

- [x] Section 8.1 updated: normative requirement for an automated memory-key checker in multi-Stack projects
- [x] Appendix A updated: `memory-key-check.template.md` added (script or CI step template)
- [x] Project implementation: `.batch/check-memory-key-parity.ps1` created for DEMOAPP001 baseline
- [x] CI gate: memory key checker integrated into CI pipeline
- [x] RA version bumped and a DR entry created

---

### RA-004: Define Canonical Feature Store change governance

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 4)
**Nature of Gap:** Section 5 defines feature propagation process but no change approval process — no specification for who can modify canonical features, what review is required, or how breaking changes are coordinated across Stacks
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 4
**Resolution:** DR-024 — RA v1.7 adds Section 5.5 (Feature Change Governance): breaking vs non-breaking classification table, breaking change gate sequence (MUST), `@pending` one-sprint resolution deadline with two-sprint escalation to defect, canonical file protection rules. RA version bumped to v1.7 (2026-05-18).

Acceptance criteria:

- [x] Section 5.5 added: Feature Change Governance covering non-breaking vs breaking change classification
- [x] Breaking change definition provided: addition, removal, or modification to step text or scenario structure
- [x] Review gate requirement for breaking changes stated normatively (MUST)
- [x] `@pending` resolution deadline policy added (maximum sprint horizon before gap becomes a defect)
- [x] RA version bumped and a DR entry created

---

### RA-005: Correct `features_shared/` underscore naming throughout RA

**Priority:** Medium
**Status:** Resolved
**Severity:** Medium (review Risk 5)
**Nature of Gap:** RA uses `features_shared/` (underscore) throughout Sections 4, 5, 5.2, 5.3, and 11 — any project adopting kebab-case naming diverges from RA examples immediately without a reconciliation path; agents reading the RA produce non-compliant paths
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 5
**Resolution:** RA v1.8 — all 8 occurrences of `features_shared/` replaced with `features-shared/`. Section 4 intro note added clarifying blueprint names are illustrative defaults. Section 4.3 note added clarifying Stack directory name vs canonical Stack name distinction. No DR required (editorial correction, no normative rule change).

Acceptance criteria:

- [x] All `features_shared/` occurrences in the RA replaced with `features-shared/` (hyphen) as the illustrative default
- [x] Section 4 note added: directory names in the blueprint are illustrative; projects document their chosen names in `naming-conventions.md`
- [x] Section 4.3 updated to reflect the same note for Stack directory names
- [x] RA version bumped (no DR required — editorial correction, not a normative rule change)

---

### RA-006: Resolve uppercase document name conflict in RA Sections 10.1 and 10.2

**Priority:** Medium
**Status:** Resolved
**Severity:** Medium (review Risk 7)
**Nature of Gap:** Section 10.2 mandates `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` as uppercase fixed names, but Section 10.9 mandates a naming conventions document that allows kebab-case — following both requirements simultaneously is impossible; this project has `architecture.md`, `qa-strategy.md`, `screenplay-guide.md` per DR-020
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 7
**Resolution:** DR-025 — RA v1.9 introduces FIXED vs convention-governed name-type distinction. Section 10.1 updated (README.md, CHANGELOG.md FIXED; others convention-governed). Section 10.2 updated: uppercase fixed names removed, replaced with convention-governed roles with kebab-case illustrative defaults and migration note. Appendix A name-type column added. This project's DR-020 kebab-case docs now explicitly in compliance.

Acceptance criteria:

- [x] Section 10.1 table updated: `README.md` and `CHANGELOG.md` explicitly marked `FIXED` (ecosystem standard); other documents marked as convention-governed
- [x] Section 10.2 updated: Stack-level document names changed from fixed uppercase to "project convention per Section 10.9"
- [x] Appendix A `Governs` column updated to show convention-governed output paths with note
- [x] RA version bumped and a DR entry created (this is a normative rule change — ARCHITECTURE.md was previously REQUIRED)

---

### RA-007: Add test data management specification to RA

**Priority:** Medium
**Status:** Resolved
**Severity:** Medium (review Risk 8)
**Nature of Gap:** The RA defines behavioral contracts (Gherkin feature files) and orchestration contracts (lifecycle, metrics) but provides no guidance on test data. For projects where test data is the primary input to the system under test (e.g. `puzzles.json`), there is no specification for: where test data lives (Stack, canonical store, or shared package), how test data is versioned alongside feature files, data isolation between scenarios, or data-driven testing patterns beyond parameterised step text.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 8
**Resolution:** DR-026 — RA v1.10 adds Section 5.6 (Test Data Management): location rules table (Stack-local vs shared), inline literal prohibition (MUST NOT), scenario isolation MUST (deep copy or in-memory), shared data versioning treated as breaking change, Scenario Outline guidance for data-driven scenarios. DEMOAPP001 `puzzles.json` confirmed compliant — Stack-local, read-only during test execution.

Acceptance criteria:

- [x] Section 5.6 added: Test Data Management covering data location rules (Stack-local vs shared), versioning, scenario isolation (MUST NOT modify shared data — operate on a copy or in-memory representation), and data-driven Scenario Outline guidance
- [x] Shared test data path documented: MUST live under `packages/` or a dedicated `data/` directory and be referenced in `DOCS/architecture/subject-app-contract.md`
- [x] Inline literal prohibition restated normatively: test data MUST NOT be embedded in canonical feature files (links to Section 5.4 parameterised steps)
- [x] RA version bumped and a DR entry created

---

### RA-008: Replace CHANGELOG.md retention policy rule with decision-register.md

**Priority:** Low
**Status:** Resolved
**Severity:** Low (review Risk 9)
**Nature of Gap:** Section 9.3 requires that a change to the test result retention policy be recorded in `CHANGELOG.md`. CHANGELOG.md is intended for release notes and notable changes visible to project consumers. A retention window change is an operational configuration concern for the build system operator, not a release note. In practice this rule will either be silently ignored (policy changes without a changelog entry) or the changelog accumulates operational noise that obscures actual feature changes.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 9
**Resolution:** RA v1.11 — Section 9.3 bullet updated: `CHANGELOG.md` replaced with `decision-register.md`. Retention policy changes now MUST be recorded as a DR entry with the new window, reason, and effective date. No DR required (editorial correction to a low-stakes rule).

Acceptance criteria:

- [x] Section 9.3 updated: `CHANGELOG.md` reference replaced with `decision-register.md` — any change to the retention policy MUST be recorded as a DR entry documenting the new window, the reason, and the effective date
- [x] RA version bumped (no DR required — editorial correction to a low-stakes rule)

---

### RA-009: Add verification method column to parity criteria (Section 8.4)

**Priority:** Low
**Status:** Resolved
**Severity:** Low (review Risk 10)
**Nature of Gap:** Section 8.4 defines five criteria for declaring a Stack in parity but specifies no verification method for any of them. Appendix B provides a manual checklist. Neither specifies whether verification is manual, scripted, or a CI gate. The current project has automated coverage for criterion 1 (feature parity report) and criterion 2 (memory key parity check), but criteria 3–5 remain manual-only. A checklist filled in manually is subject to human error and is insufficient as a parity gate at scale.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 10
**Resolution:** DR-027 — RA v1.12 replaces Section 8.4 numbered list with a verification method table (criterion, description, method, automated/manual). Normative statement added: criteria 1, 2, and 3 MUST be verified by automated tools. Criterion 3 (step-text diff) has no dedicated script yet — tracked as BACKLOG-022. DR-027 required (new MUST language).

Acceptance criteria:

- [x] Section 8.4 updated: verification method column added to the parity criteria table (automated parity report, automated memory-key checker, automated step-text diff, manual against parity-contract.md, manual backlog scan)
- [x] Normative statement added: criteria 1, 2, and 3 MUST be verified by an automated tool before a Stack is declared in parity; manual checklist alone is insufficient
- [x] RA version bumped and DR-027 created (new MUST language requires a DR entry)

---

### RA-010: Specify shared `packages/` directory rules in RA (Section 4.4)

**Priority:** Low
**Status:** Resolved
**Severity:** Low (review Risk 11)
**Nature of Gap:** Section 4 shows `packages/` as "Shared code packages (OPTIONAL)" with no further specification. In a multi-Stack project, shared utilities (e.g. a common PuzzleLoader or shared assertion helper) will naturally emerge. There is no guidance on what is appropriate to place there, how shared packages relate to the parity contract, whether they count as part of the Stack or the project, or how package interface changes are versioned and propagated across Stacks.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 11
**Resolution:** DR-028 — RA v1.13 adds Section 4.4 (Shared Packages Directory): independent versioning MUST, MUST NOT include Stack-specific code or test runner imports, public interface changes treated as breaking changes (Section 5.5 gate), DR entry MUST, parity verification run MUST. Shared package failures are project-level breaking changes — must be resolved before Stack is declared in parity. DEMOAPP001 has no packages/ usage; compliant. DR-028 recorded.

Acceptance criteria:

- [x] Section 4.4 added: Shared Packages — each package independently versioned; MUST NOT contain Stack-specific code or test runner imports; subject application source MUST NOT live in `packages/` unless a pure utility library with no Stack-specific dependencies; any change to a shared package's public interface MUST produce a DR entry and a parity verification run against all dependent Stacks
- [x] RA version bumped and a DR entry created (this is a normative rule change introducing MUST requirements for a previously unconstrained area)

---

### BACKLOG-004: Setup GitHub Actions CI/CD

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** CI automation

Acceptance criteria:

- [x] `.github/workflows/ci.yml` created
- [x] Build step runs `npm ci` and `npm run build`
- [x] Lint step runs `npm run lint`
- [x] Test step runs `npm test`
- [x] PR status checks visible in GitHub
- [x] `README.md` updated with CI badge

Resolution:

- GitHub Actions workflow `CI` now runs on `pull_request`, `push`, and manual dispatch. The DEMOAPP001 job installs with `npm ci`, runs build/lint/test, executes parity gates, and uploads validation artifacts. PR status checks are configured by the `pull_request` trigger and will be visible in GitHub after the branch is pushed.

### BACKLOG-017: Unify Feature Design Overlap

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All planned app surfaces
**Nature of Gap:** Design consistency

Acceptance criteria:

- [x] Shared `CellChange` interface specified as single definition
- [x] `SolveStep extends CellChange` inheritance documented
- [x] Single Express server approach explicitly documented in REST API design document
- [x] Design documents updated with cross-references
- [x] TODO task lists updated to reflect shared foundations
- [x] No contradictions between the three designs

### BACKLOG-007: Decouple Console Output

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** CLI/API extensibility

Acceptance criteria:

- [x] `app_src/output/IOutput.ts` interface created with `write(message: string): void`
- [x] `app_src/output/ConsoleOutput.ts` implementation created
- [x] `SudokuCLI` accepts an `IOutput` constructor parameter with `ConsoleOutput` default
- [x] `SudokuSolver.named()` removed or used in `index.ts`
- [x] Default CLI behavior unchanged
- [x] `npm test` remains green

### BACKLOG-008: Implement Audit Trail Feature

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/audit-trail-feature.md`

Acceptance criteria:

- [x] `app_src/audit/AuditTypes.ts` with shared audit interfaces
- [x] `app_src/audit/AuditLogger.ts` with iteration tracking and change recording
- [x] `app_src/audit/AuditFormatter.ts` with JSON export and console summary
- [x] Optional `SudokuSolver.setAuditLogger()` integration
- [x] Algorithm attribution for each cell change recorded
- [x] Less than 5% solver performance overhead (logging is conditional on enabled flag)
- [x] Gherkin coverage added for audit scenarios (3 new scenarios, 46/46 pass)

### BACKLOG-009: Implement REST API Wrapper

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001 API surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/rest-api-wrapper.md`

Acceptance criteria:

- [x] Express.js server
- [x] Technique endpoints for unit-completion, hidden-singles, and naked-singles
- [x] Solve endpoint with step tracking using AuditLogger
- [x] Puzzle endpoints: list and get by name
- [x] Validate endpoint
- [x] Request validation and error handling middleware
- [x] API tests for all endpoints

Resolution:

- DEMOAPP001 now exposes an Express REST API under `app_src/server/`, started with `npm run start:api`. The API includes all technique endpoints, `POST /api/solve` with `AuditLogger` events/statistics, puzzle list/get endpoints, `POST /api/validate`, CORS headers, structured validation/error middleware, and `npm run test:api` endpoint coverage.

### BACKLOG-018: Implement Web UI Solver Visualisation

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001 future UI surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/web-ui-solver-visualisation.md`

Acceptance criteria:

- [x] `SolveStepTracker` adapter over `AuditLogger`
- [x] HTML grid display with algorithm color coding
- [x] Step-by-step playback controls
- [x] Event log panel with current step highlighting
- [x] Statistics panel
- [x] Served from the REST API Express server

Resolution:

- `SolveStepTracker` wraps `SudokuOrchestrator` + `AuditLogger`, flattening `AuditEvent[]` into a `SolveStep[]` with per-cell `stepNumber`, `iteration`, `algorithm`, and `algorithmParam`. New `GET /api/visualise/:name` endpoint returns `VisualiseResult` (initialGrid, finalGrid, steps, statistics). Static files served from `app_src/server/public/` via `express.static`. Vanilla ES-module frontend: `grid.js` renders the 9×9 grid with algorithm colour-coding and a pulsing highlight on the current cell; `player.js` manages step-index state, play/pause interval, and speed control; `app.js` orchestrates puzzle selection, API calls, the scrollable click-to-jump event log, and live statistics percentage bars. `npm run start:web` starts the combined server. 46/46 Screenplay scenarios remain green.

### BACKLOG-020: Python Screenplay-style Step Definitions

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP002
**Nature of Gap:** Future Stack parity

Acceptance criteria:

- [x] `demo-apps/demoapp002-python-pytest/` directory created
- [x] Python solver implementation follows the solver specification
- [x] `UseSudokuSolver` and `LoadPuzzles` abilities implemented
- [x] Tasks and Questions implemented in Python-appropriate style
- [x] All canonical Gherkin scenarios pass
- [x] Python project configuration present

Resolution:

- DEMOAPP002 now contains a Python solver, orchestrator, puzzle loader, audit support, pytest-bdd project configuration, a Stack-local feature copy tagged `@stack-demoapp002`, and Screenplay-style abilities, tasks, questions, actor memory, and step definitions. Local validation passes 46 canonical pytest-bdd scenarios. Memory key parity, feature parity, and step-text parity now include DEMOAPP002.

### BACKLOG-021: C# Screenplay-style Step Definitions

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP003
**Nature of Gap:** Future Stack parity

Acceptance criteria:

- [x] `demo-apps/demoapp003-csharp-specflow/` directory created
- [x] C# solver implementation follows the solver specification
- [x] Screenplay-style `IAbility`, `ITask`, and `IQuestion<T>` interfaces defined
- [x] `UseSudokuSolver` and `LoadPuzzles` abilities implemented
- [x] All canonical Gherkin scenarios pass
- [x] `dotnet test` runs with SpecFlow

Resolution:

- DEMOAPP003 now implements the canonical @util feature contract with .NET 8, SpecFlow, NUnit, a C# solver/orchestrator/puzzle-loader/audit model, Screenplay-style Actor/Ability/Task/Question components, Stack-local docs, benchmark runner, and parity-script integration. `dotnet test` passes 46/46 scenarios. DR-032 records the Stack decision.

### BACKLOG-022: Implement step-text parity checker (Section 8.4 criterion 3)

**Priority:** High
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Parity automation — Section 8.4 criterion 3 (step Gherkin text matches canonical exactly) is designated MUST be automated per DR-027, but no script exists. The feature parity report checks scenario presence; it does not diff individual step text within a scenario.

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 3

Acceptance criteria:

- [x] Script created (e.g. `.batch/check-step-text-parity.ps1`) that diffs step text in Stack-local feature files against canonical feature files
- [x] Any step text divergence exits non-zero and reports the differing lines
- [x] Script integrated as a CI gate per Section 9.4
- [x] No DR required unless the implementation reveals a structural gap

Resolution:

- `.batch/check-step-text-parity.ps1` now verifies Stack-local step text against canonical feature files and reports differing line numbers. `.github/workflows/ci.yml` includes an initial step-text parity gate; BACKLOG-004 expands that workflow into the full build/lint/test CI pipeline.

---

### MIG-13: Rename Stack filesystem directories to kebab-case

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001 and future Stacks
**Nature of Gap:** Directory naming alignment
**Decision Record:** DR-016
**Scheduled:** Sprint 3 (before Stack 2 onboarding)

Analysis reference: `DOCS/.analysis/analysis-directory-naming-kebab-case-2026-05-16.md`

Acceptance criteria:

- [x] `DEMOAPPS/` renamed to `demo-apps/` using `git mv`
- [x] `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` renamed to `demo-apps/demoapp001-typescript-cypress/` using `git mv`
- [x] `features_shared/` renamed to `features-shared/`
- [x] TypeScript `__dirname`-relative paths confirmed rename-safe; `npm run build` exit 0 (Phase 4)
- [x] `tooling/cucumber.js`, `tsconfig.json`, `package.json` use relative paths — no edits needed; `npm test` 43/43 (Phase 4)
- [x] `.batch/run-demoapp001.ps1` updated and smoke-tested; BuildExitCode=0 TestExitCode=0 (Phase 4)
- [x] All markdown documentation updated; 0 stale-path links in focus files (Phase 4)
- [x] `naming-conventions.md`, `CLAUDE.md`, `CHANGELOG.md`, `decision-register.md` updated (Phase 3)
- [x] DR-016 referenced in commit message (Phase 2 commit)

### BACKLOG-023: Refactor UseSudokuSolver Ability to remove fixture and validation logic

**Priority:** High
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Ability layer violation (RA §3.2)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 2

The `UseSudokuSolver` Ability (399 lines, 17 private fields, 40+ methods) contains grid manipulation
helpers, a duplicate `isValidPlacement` constraint checker, and compound operations that belong in
Tasks or a dedicated fixtures module. RA §3.2 requires the Ability to expose a minimal, stable
interface. This must be resolved before DEMOAPP002 onboarding, otherwise the Python Stack will
inherit the same overloaded pattern.

Acceptance criteria:

- [x] `tests/screenplay/fixtures/GridFixtures.ts` created containing all `setupXxx()` helper functions as pure functions accepting a `SudokuSolver` argument
- [x] `UseSudokuSolver` retains only: `initialise()`, `getSolver()`, `applyUnitCompletion()`, `applyHiddenSingles()`, `applyNakedSingles()`, `solvePuzzle()`, and read-only accessors
- [x] `isValidPlacement()` exposed on `SudokuSolver` in `app_src/`; Ability delegates to it rather than duplicating the logic
- [x] `isValidSolution()` moved to a test utility module or delegates to subject application
- [x] `solveFirstAndCheckIsolation()` compound operation moved to the relevant Task or Question
- [x] All existing Tasks updated to call `GridFixtures` functions directly rather than Ability setup methods
- [x] `npm test` remains green at 43 scenarios / 241 steps
- [x] `screenplay-parity-contract.md` updated to reflect the slimmed Ability interface

---

### BACKLOG-024: Make "the missing digit is {int}" step genuinely parameterised

**Priority:** Low
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Step definition shape (RA §8.2)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 11

The step `Given('the missing digit is {int}', ...)` in `unitCompletion.steps.ts` accepts a digit
parameter from the Gherkin but discards it. The missing digit is hardcoded in
`setupAlmostCompleteColumn()`. This violates the implicit contract of a parameterised step and
will propagate to future Stacks as a silent no-op. Must be resolved before DEMOAPP002 onboarding.

Acceptance criteria:

- [x] `setupAlmostCompleteColumn(col, missingDigit)` updated to accept the missing digit and build the column accordingly rather than hardcoding `[1,2,3,4,5,6,8,9]`
- [x] `unitCompletion.steps.ts` passes the `digit` parameter through to the grid setup method
- [x] Canonical feature file updated if the step text changes (per feature update procedure in `CLAUDE.md`)
- [x] Stack-local feature copy updated to match
- [x] `npm test` remains green
- [x] No DR required unless the step text change is a breaking canonical feature change

Resolution:

- The missing digit step now applies the supplied digit to the pending column or block unit-completion fixture. Feature text was unchanged, so canonical and Stack-local feature files remain in parity.

---

### BACKLOG-025: Fix feature parity report summary terminology to match RA CI gate spec

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Parity tooling compliance (RA §9.4)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 4

RA §9.4 states the CI pipeline MUST fail if `Overall result: DRIFT` or
`Overall result: MISSING` appears in the report output. The script
`.batch/generate-feature-parity-report.ps1` writes `Overall result: PASS` or
`Overall result: FAIL` at the summary level. Text-based CI gates written
against the RA-specified strings would never trigger. Exit-code-based gates
work correctly, but the terminology mismatch is a latent defect that will
cause confusion when CI is authored (BACKLOG-004).

Acceptance criteria:

- [x] `generate-feature-parity-report.ps1` updated: summary line writes `PASS`, `DRIFT`, or `MISSING` (not `FAIL`)
- [x] The `Write-Host "Overall result: ..."` console line updated to match
- [x] Script exit code behaviour unchanged (non-zero on any non-PASS result)
- [x] No DR required (editorial correction to a tooling script)

Resolution:

- `.batch/generate-feature-parity-report.ps1` now reports aggregate `PASS`, `DRIFT`, or `MISSING` while preserving non-zero exit behavior for any non-PASS result.

---

### BACKLOG-026: Normalize planning backlog filename to comply with DR-020

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Document naming violation (DR-020)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 5

DR-020 mandates kebab-case for all authored documents (exceptions: `README.md`,
`CHANGELOG.md`, `CLAUDE.md`). The planning backlog file was exposed on disk with
uppercase filename casing while references in CLAUDE.md, the RA, and the file's
own header use `DOCS/.planning/backlog.md` (lowercase). On Linux CI runners
(case-sensitive), mismatched path casing can fail to resolve.

**Resolution:** The file casing was normalized to `DOCS/.planning/backlog.md`
using a temporary intermediate `git mv` because Windows is case-insensitive.
Editable non-review uppercase references were updated; review outputs under
`DOCS/.review/` remain read-only per RA §10.7 and `DOCS/.review/README.md`.

Acceptance criteria:

- [x] Planning backlog filename normalized to `DOCS/.planning/backlog.md` via `git mv`
- [x] Editable non-review uppercase references updated via search
- [x] `npm test` remains green
- [x] No DR required (corrects a naming violation, not a normative rule change)

---

### BACKLOG-027: Configure Serenity/JS reporters to produce living documentation

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Framework investment unrealised

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 6

`tests/screenplay/support/configure.ts` sets `crew: []`. Serenity/JS's primary
differentiator over plain Cucumber is its HTML living documentation report.
Without reporters in the crew, test output is identical to plain Cucumber and
the framework investment is not realised. This is especially relevant for
demonstrating pedagogical content to new Stack authors.

Acceptance criteria:

- [x] `@serenity-js/serenity-bdd` installed as a dev dependency
- [x] `configure.ts` updated: `crew` includes `ArtifactArchiver.storingArtifactsAt('.results/serenity')` and the documented `@serenity-js/serenity-bdd` reporter class-description config
- [x] `.results/serenity/` added to `.gitignore`
- [x] Orchestration script (`.batch/run-demoapp001.ps1`) updated to invoke the Serenity BDD CLI to generate the HTML report after the test run
- [x] `npm test` remains green with reporters active
- [x] Stack `docs/README.md` updated with instructions for viewing the report

Resolution:

- Serenity BDD reporting is active for DEMOAPP001. `npm test` now emits Serenity JSON reports, `.batch/run-demoapp001.ps1` generates `.results/serenity/index.html` after the test run, generated Stack-local `.results/` output is ignored, and the Stack README documents viewing instructions plus the Java runtime prerequisite; no DR required.

---

### BACKLOG-028: Correct stale metadata in decision-register.md and backlog.md headers

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Governance document currency

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 7

`decision-register.md` header shows `Last Updated: 2026-05-16` while DR-021
through DR-028 were added on 2026-05-18. The `backlog.md` header previously
referenced `reference-architecture.md v1.9 Section 10.1` (now corrected to
v1.13 in this session). Stale metadata misleads agents that use header fields
to determine document currency.

**Resolution:** `decision-register.md` header metadata now reflects the current
accepted governance state: `Last Updated` is 2026-05-18 and the governing
Reference Architecture version is v1.13. Current governance document headers
were checked for stale RA version metadata.

Acceptance criteria:

- [x] `decision-register.md` `**Last Updated:**` field set to `2026-05-18`
- [x] Verify no other header metadata fields in governance documents reference superseded RA versions
- [x] No DR required (metadata correction, not a normative rule change)

---

### BACKLOG-029: Mark DR-010 as Superseded by DR-014 in decision register

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Decision register governance (RA §10.6)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 8

DR-010 formally accepted `DOCS/.review/` as the code review output location.
DR-014 subsequently moved this to repository-root `.review/`. DR-010 remained
`Status: Accepted` with no forward reference to DR-014. Per RA §10.6, a
superseded entry MUST contain a forward reference to its replacement. An agent
reading the register in order would see DR-010 as valid authority.

Acceptance criteria:

- [x] DR-010 `**Status:**` field updated to: `Superseded by DR-014 -- 2026-05-16`
- [x] A forward reference note added to DR-010's Consequences section identifying DR-014 as the replacement
- [x] DR-014 verified to contain a back reference to DR-010 (add one if missing)
- [x] No new DR required (corrects governance record, not a normative rule change)

Resolution:

- DR-010 now records DR-014 as its superseding decision, with a forward reference in Consequences. DR-014 already contained the required back reference to DR-010. DR-014 was later superseded by DR-029, which restores `DOCS/.review/` as the single authoritative review output location.

---

### BACKLOG-030: Extract actor name 'Solver' to shared constant across step definitions

**Priority:** Low
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Magic string risk (RA §8.2)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 9

The string `'Solver'` is used as the argument to `actorCalled('Solver')` in
every step definition file without being extracted to a shared constant. If
the actor persona name changes, it must be located and updated manually across
all step definition files. The name is semantically significant to Serenity/JS
(it appears in reports and stack traces).

Acceptance criteria:

- [x] `tests/screenplay/support/actors.ts` created: `export const SOLVER_ACTOR = 'Solver';`
- [x] All `actorCalled('Solver')` occurrences in step definition files replaced with `actorCalled(SOLVER_ACTOR)` (importing from `actors.ts`)
- [x] `npm test` remains green
- [x] No DR required

Resolution:

- Step definitions now use `SOLVER_ACTOR` from `tests/screenplay/support/actors.ts`, centralising the Serenity actor persona name without changing report semantics; no DR required.

---

### BACKLOG-031: Update sprint roadmap to reflect resolved items

**Priority:** Low
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Planning document currency

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 12

The sprint roadmap in `DOCS/.planning/backlog.md` shows Sprint 6+ listing
"RA-001 through RA-006 (Open)" while all ten RA items are Resolved. Sprint 2
and Sprint 3 statuses list items already resolved and have dates past their
end date. Any agent or stakeholder reading the roadmap to determine current
focus receives misleading information.

Acceptance criteria:

- [x] Sprint 2 and Sprint 3 rows marked `Completed` with a note of completion date
- [x] Sprint 6+ row updated to remove resolved RA items; replaced with accurate current open items
- [x] Sprint 4 and Sprint 5 rows reviewed for accuracy against current open items
- [x] No DR required

Resolution:

- Sprint roadmap rows now reflect current resolved work and the remaining open backlog. Sprint 2 and Sprint 3 are marked completed on 2026-05-19; Sprint 4 and Sprint 5 remove resolved items; Sprint 6+ no longer references resolved RA items.

---

### BACKLOG-032: Refactor Python Questions to read from Actor memory

**Priority:** High
**Status:** Resolved
**Stack(s):** DEMOAPP002
**Nature of Gap:** Screenplay parity (RA Section 3.5 -- Memory contract)

Review evidence: `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/02_RISKS_AND_ISSUES.md` Risk 1

Resolution:

- FALSE POSITIVE. Cross-check against `tests/screenplay/questions/GridCell.ts` confirmed that
  the TypeScript `matchesSnapshot()`, `origMatchesSnapshot()`, and `isDeepCopy()` methods also
  read `ability.gridSnapshot` directly. The Python implementation is correct parity. No code
  changes required. Review artifacts corrected 2026-05-19.

---

### BACKLOG-033: Extract side effects from MultipleSolvers.isolation_verified()

**Priority:** High
**Status:** Resolved
**Stack(s):** DEMOAPP002
**Nature of Gap:** Screenplay anti-pattern (Questions must be side-effect free)

Review evidence: `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/02_RISKS_AND_ISSUES.md` Risk 2

Resolution:

- FALSE POSITIVE. Cross-check against `tests/screenplay/questions/MultipleSolvers.ts` confirmed
  that the TypeScript `isolationVerified()` Question also calls `ability.initialise()`,
  `ability.solvePuzzle()`, and writes `ALGORITHM_PROGRESS = false` to notes inside its resolver.
  The Python implementation is a faithful translation. No code changes required. Review artifacts
  corrected 2026-05-19.

---

### BACKLOG-034: Resolve BACKLOG-012 as stale duplicate of BACKLOG-020

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Backlog governance (stale Open item)

Review evidence: `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/02_RISKS_AND_ISSUES.md` Risk 4

Resolution:

- BACKLOG-012 status updated to `Resolved` (duplicate of BACKLOG-020 which resolved the Python
  Stack on 2026-05-19). Summary count table updated. No DR required.

---

### BACKLOG-014: Advanced Solving Techniques

**Priority:** Future
**Status:** Open
**Stack(s):** DEMOAPP001 and future Stacks (parity required)
**Nature of Gap:** Solver capability — the solver implements only three deterministic techniques
(Unit Completion, Hidden Singles, Naked Singles) and returns `STUCK_ON_ADVANCED_LOGIC` once they are
exhausted. There is no support for the harder human-style strategies (Naked/Hidden Pairs, Pointing
Pairs, X-Wing, Swordfish) and no backtracking/trial-and-error mode (see `CLAUDE.md` "Current
Limitations").

Design reference: `DOCS/.design/advanced-solving-techniques.md` (to be authored)
Algorithm reference: `DOCS/.algorithm/` — one specification per technique (to be authored)

This is the only one of the three future ideas that changes solver behaviour, so it is bound by the
canonical-feature-first procedure (`CLAUDE.md`) and full three-stack parity. It is also a
prerequisite for difficulty grading in BACKLOG-016 and for technique explanations in BACKLOG-015.

Acceptance criteria:

- [ ] Design doc authored at `DOCS/.design/advanced-solving-techniques.md` listing the techniques in
      scope, their ordering relative to the existing three, and the deterministic (no-guessing) boundary
- [ ] An algorithm specification added under `DOCS/.algorithm/` for each new technique
- [ ] New `SudokuSolver` methods implement at least Naked Pairs and X-Wing (further techniques optional
      per the design doc), with no trial-and-error/backtracking unless explicitly decided in a DR
- [ ] `SudokuOrchestrator.solve()` integrates the new techniques after the existing three; an
      already-solved or simply-solvable grid is unaffected (preserves the SUD-01 early-exit guard)
- [ ] Canonical Gherkin coverage added in `features-shared/` first, then propagated to all three Stack
      copies; new step definitions / Screenplay components added per Stack
- [ ] Algorithm attribution for each cell change recorded through the existing `AuditLogger`
- [ ] `npm test`, `python -m pytest`, and `dotnet test` green; memory-key, feature, and step-text parity PASS
- [ ] A decision-register entry recorded if any structural choice (e.g. enabling backtracking, a new
      result string) is made before the item is closed

---

### BACKLOG-015: Interactive Sudoku Tutor

**Priority:** Future
**Status:** Open
**Stack(s):** DEMOAPP001 first (future-Stack parity per the SUD-05 capability matrix)
**Nature of Gap:** Product idea — the existing Web UI (BACKLOG-018, Resolved) *replays* a completed
solve read-only. There is no interactive mode that guides a user through their own grid, suggests the
next deterministic move, and explains which technique applies and why.

Design reference: `DOCS/.design/interactive-sudoku-tutor.md` (to be authored)

Builds on the resolved audit trail (BACKLOG-008), `SolveStepTracker` / Web UI (BACKLOG-018), and the
REST API (BACKLOG-009). Richer explanations depend on BACKLOG-014 (advanced techniques). Per the
SUD-05 capability matrix this is a DEMOAPP001 surface first; Python/C# remain roadmap.

Acceptance criteria:

- [ ] Design doc authored at `DOCS/.design/interactive-sudoku-tutor.md` defining the tutor surface,
      its tag (e.g. an extension of the existing `@web` / API surface), and the user interaction model
- [ ] A "next move" hint engine that, given a partial grid, returns the next deterministic step, the
      technique name, and a human-readable rationale — sourced from the existing solver + `AuditLogger`,
      not a second solving implementation
- [ ] Interactive guided-mode UI served from the existing Express server (`npm run start:web`),
      reusing the grid / event-log / statistics components where possible
- [ ] Behavioural coverage added (canonical-feature-first if the tutor logic is testable at the `@util`
      surface; otherwise API/UI-level tests as the design doc specifies)
- [ ] A decision-register entry recorded for the new surface contract before the item is closed
- [ ] Capability matrix (platform spec §6.1) updated to record tutor support per Stack

---

### BACKLOG-016: Puzzle Generator

**Priority:** Future
**Status:** Open
**Stack(s):** DEMOAPP001 first (future-Stack parity per the SUD-05 capability matrix)
**Nature of Gap:** Product idea — the project only *consumes* fixed puzzles from `puzzles.json`. There
is no capability to generate new valid puzzles (a complete solution reduced to a uniquely-solvable
clue set) with a target difficulty.

Design reference: `DOCS/.design/puzzle-generator.md` (to be authored)

Difficulty grading is naturally expressed in terms of which techniques a puzzle requires, so the
difficulty dimension depends on BACKLOG-014. Generated puzzles must satisfy the existing loader and
validation-boundary rules (DR-035) and the `puzzles.json` schema.

Acceptance criteria:

- [ ] Design doc authored at `DOCS/.design/puzzle-generator.md` covering the generation strategy
      (full-solution construction then clue removal), the uniqueness guarantee, and the difficulty model
- [ ] Generator produces a complete valid solution and removes cells while preserving a unique solution
- [ ] Difficulty rating derived from the solving techniques a puzzle requires (links to BACKLOG-014);
      puzzles tagged with a difficulty consistent with the existing `puzzles.json` `difficulty` field
- [ ] Generated puzzles validate through the existing `PuzzleLoader` (structure) and solver/API
      (constraints) per `validation-boundaries.md`; output conforms to the `puzzles.json` schema
- [ ] Behavioural coverage added per the design doc (canonical-feature-first where applicable)
- [ ] A decision-register entry recorded for the new capability before the item is closed
- [ ] Capability matrix (platform spec §6.1) updated to record generator support per Stack

---

## Resolved Items

| ID | Title | Stack(s) | Resolved | Notes |
|----|-------|----------|----------|-------|
| BACKLOG-001 | Complete Hidden Singles Implementation | DEMOAPP001 | 2026-05-14 | Rows, columns, and blocks now checked |
| BACKLOG-002 | Implement Automated Test Runner | DEMOAPP001 | 2026-05-14 | Cucumber test runner established |
| BACKLOG-003 | Create Implementation Logs | All | 2026-05-14 | Initial implementation logs created |
| BACKLOG-005-NEW | Centralize Constants in constants.ts | DEMOAPP001 | 2026-05-14 | Grid constants centralized |
| BACKLOG-006-COMPLETE | Add Prettier to ESLint Setup | DEMOAPP001 | 2026-05-14 | Formatting baseline established |
| BACKLOG-019 | Migrate TypeScript Tests to Screenplay Pattern | DEMOAPP001 | 2026-05-15 | Screenplay layer implemented and green |
| MIG-01 | Adopt Reference Architecture v1.3 and create DR-012 | All | 2026-05-15 | DR-012 |
| MIG-02 | Add RA-literal DOCS path bridges | All | 2026-05-15 | DR-013 |
| MIG-03 | Align code review output location and naming | All | 2026-05-15 | DR-014; updated by DR-029 |
| MIG-06 | Refresh AI agent guide for v1.3 | All | 2026-05-15 | `CLAUDE.md` current; updated by DR-029 |
| MIG-07 | Reconcile backlog against v1.3 state | All | 2026-05-15 | This update |
| MIG-08 | Complete template mandate details | All | 2026-05-15 | Required annotations added; current docs use lowercase template references |
| MIG-04 | Wire Screenplay runtime state through Actor Memory | DEMOAPP001 | 2026-05-16 | TakeNotes wired; all 6 Memory keys runtime-active; DR-015 |
| MIG-05 | Remove direct Ability calls from step definitions | DEMOAPP001 | 2026-05-16 | All step files thin; 8 new Tasks, 5 new Questions; DR-015 |
| MIG-13 | Rename Stack filesystem directories to kebab-case | DEMOAPP001 and future Stacks | 2026-05-16 | R100 renames via git mv; ~50 files updated; 43/43 pass; PR #13; DR-016 |
| MIG-09 | Normalize implementation-log location and naming policy | All | 2026-05-16 | Log files moved to `DOCS/.implementation-logs/` with v1.3 naming; archive in `.implementation/`; DR-017 |
| MIG-10 | Add feature parity validation report process | All | 2026-05-16 | `.batch/generate-feature-parity-report.ps1` created; reports write to `.results/feature-parity/`; orchestration-design updated |
| MIG-11 | Parameterize over-specified canonical Gherkin steps | All | 2026-05-16 | Two scenarios converted to Scenario Outlines with Examples; step defs parameterized; 43/43 pass; parity PASS; DR-018 |
| MIG-12 | Decide metrics Stack identifier policy | All | 2026-05-16 | Short identifier `DEMOAPP001` documented in run script (DR-016 ref) and orchestration-design Section 6; stale RA v1.2 comment corrected |
| BACKLOG-026 | Normalize planning backlog filename to lowercase | All | 2026-05-19 | `DOCS/.planning/backlog.md` filesystem casing normalized; editable non-review references updated; no DR required |
| BACKLOG-028 | Correct stale governance document metadata | All | 2026-05-19 | `decision-register.md` header updated to `Last Updated: 2026-05-18` and RA v1.13 governance; no DR required |
| BACKLOG-029 | Mark DR-010 as Superseded by DR-014 in decision register | All | 2026-05-19 | DR-010 status and forward reference updated; DR-014 back reference verified; no DR required |
| BACKLOG-025 | Fix feature parity report summary terminology to match RA CI gate spec | All | 2026-05-19 | Feature parity report summary and console output now emit `PASS`, `DRIFT`, or `MISSING`; non-PASS exit remains non-zero; no DR required |
| BACKLOG-022 | Implement step-text parity checker (Section 8.4 criterion 3) | All | 2026-05-19 | `.batch/check-step-text-parity.ps1` added with non-zero drift exit and line reporting; initial CI gate added; no DR required |
| BACKLOG-004 | Setup GitHub Actions CI/CD | DEMOAPP001 | 2026-05-19 | `CI` workflow added for DEMOAPP001 build, lint, tests, parity gates, and artifact upload; README badge added |
| BACKLOG-031 | Update sprint roadmap to reflect resolved items | All | 2026-05-19 | Sprint roadmap refreshed to remove resolved items, mark completed rows, and show current open work; no DR required |
| BACKLOG-024 | Make "the missing digit is {int}" step genuinely parameterised | DEMOAPP001 | 2026-05-19 | Missing digit parameter now drives column/block unit-completion fixture setup; feature text unchanged and parity retained; no DR required |
| BACKLOG-030 | Extract actor name 'Solver' to shared constant across step definitions | DEMOAPP001 | 2026-05-19 | Shared `SOLVER_ACTOR` constant added and step definitions use `actorCalled(SOLVER_ACTOR)`; no DR required |
| BACKLOG-027 | Configure Serenity/JS reporters to produce living documentation | DEMOAPP001 | 2026-05-19 | Serenity BDD reporter and artifact archiver configured; runner generates HTML living documentation after tests; no DR required |
| BACKLOG-020 | Python Screenplay-style Step Definitions | DEMOAPP002 | 2026-05-19 | DEMOAPP002 Python pytest-bdd Stack created; 46 canonical scenarios pass; parity gates include DEMOAPP002; no DR required |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | 2026-05-19 | Duplicate of BACKLOG-020; Python Stack completed by BACKLOG-020. Closed as stale per BACKLOG-034. |
| BACKLOG-032 | Refactor Python Questions to read from Actor memory | DEMOAPP002 | 2026-05-19 | False positive -- TypeScript GridCell Questions use ability.gridSnapshot directly in the same pattern; no action required. |
| BACKLOG-033 | Extract side effects from MultipleSolvers.isolation_verified() | DEMOAPP002 | 2026-05-19 | False positive -- TypeScript MultipleSolvers.isolationVerified() has identical mutations by design; no action required. |
| BACKLOG-034 | Resolve BACKLOG-012 as stale duplicate of BACKLOG-020 | All | 2026-05-19 | BACKLOG-012 closed, resolved items table updated; no DR required. |
| BACKLOG-009 | Implement REST API Wrapper | DEMOAPP001 | 2026-05-20 | Express API server added with technique, solve, puzzle, validation, request validation/error middleware, and API integration tests; no DR required. |
| BACKLOG-018 | Implement Web UI Solver Visualisation | DEMOAPP001 | 2026-05-20 | SolveStepTracker adapter, GET /api/visualise/:name endpoint, and vanilla ES-module frontend (grid, player, event log, statistics) served from existing Express server; no DR required. |
| BACKLOG-021 | C# Screenplay-style Step Definitions | DEMOAPP003 | 2026-05-28 | DEMOAPP003 C# SpecFlow Stack added with 46 canonical scenarios passing; parity scripts include C#; DR-032. |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | 2026-05-28 | Covered by BACKLOG-021; closed as duplicate/umbrella following the BACKLOG-012/BACKLOG-020 precedent. |
| BACKLOG-011 | Performance Benchmarking Suite | All | 2026-05-28 | Reporting-only benchmark harnesses added for DEMOAPP001/002/003 with root aggregation script and `.results/performance/` artifacts; no timing threshold gate. |
| BACKLOG-010 | Docker Compose for Local Development | All | 2026-05-29 | Integrated Alpine, slim, and SDK-based multi-stack Compose services, parity validation loops, and aggregated benchmarking runtimes; DR-033 |
| BACKLOG-035 | Early solved-grid check (SUD-01) | All | 2026-06-13 | `isGridFull`-style guard before the progress loop in all three orchestrators; already-solved input returns `SOLVED` with 0 iterations/0 events; 46×3 green, parity PASS; PR #18 |
| BACKLOG-036 | v1.1 solver-platform specification (SUD-02) | All | 2026-06-13 | `sudoku-solver-platform-specification.md` v1.1 evolves the v1.0 core baseline; DR-034; PR #18 |
| BACKLOG-037 | Deep-copy grid snapshot methods (SUD-03) | All | 2026-06-13 | `getGrid`/`get_grid`/`GetGrid` return deep copies; read-only call sites converted; public `grid` retained, direct mutation deprecated in stack docs; PR #19 |
| BACKLOG-038 | Validation-layer boundaries + OpenAPI contract (SUD-04) | DEMOAPP001 | 2026-06-13 | `validation-boundaries.md` (loader=structure, solver/API=constraints; strict mode deferred); DEMOAPP001 `openapi.yaml` (9 paths, 19 schemas); DR-035; PR #19 |
| BACKLOG-039 | Stack capability matrix (SUD-05) | All | 2026-06-13 | 7×3 matrix in platform spec §6.1 + README mirror; core/BDD parity required, API/web roadmap for DEMOAPP002/003; PR #21 |
| BACKLOG-040 | C# loader integer validation docs (SUD-06) | DEMOAPP003 | 2026-06-13 | DEMOAPP003 README documents typed `System.Text.Json` deserialization as the integer-type gate before the v1.0 §7.1 range check; `PuzzleLoader.cs` untouched; PR #21 |
| BACKLOG-041 | Accept v1.1 spec post-merge (SUD-07) | All | 2026-06-13 | DR-034 flipped Proposed→Accepted; root README + DOCS indexes present v1.1 as platform authority with v1.0 as core baseline; CLAUDE.md DR range corrected; PR #20 |
| BACKLOG-042 | Node-24 GitHub Actions bump (SUD-08) | CI | 2026-06-13 | `ci.yml` action pins bumped to Node-24 majors ahead of the 2026-06-16 cutover; CI green on the new pins, no deprecation warnings; PR #20 |
| BACKLOG-043 | Fix root README "+ Flask" mislabel (SUD-09) | All | 2026-06-17 | Architecture diagram Python box no longer reads "+ Flask"; all three boxes relabelled to real toolchains (TypeScript/Cucumber, Python/pytest-bdd, C#/SpecFlow); `git grep Flask` returns no source hits; review CLAUDE_Opus_4_8 v1 Risk 1; no DR required |
| BACKLOG-044 | Update stale README "35+ test scenarios" count (SUD-10) | All | 2026-06-17 | README pedagogical section now states the true figure (46 scenarios per stack / 138 across all three; DEMOAPP001 = 46/257 steps), consistent with backlog baseline line 36 and CLAUDE.md; `grep "35+"` over README returns no stale-count hit; review CLAUDE_Opus_4_8 v1 Risk 2; no DR required |

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items | Status |
|--------|-------|-------|-----------|--------|
| 2 | 2026-05-14 to 2026-05-27 | Close persistent risks and governance drift | MIG-04, MIG-05, MIG-08, BACKLOG-004 | Completed 2026-05-19 |
| 3 | 2026-05-19 | Directory rename and output decoupling | MIG-13, BACKLOG-007, BACKLOG-017 | Completed 2026-05-19 |
| 4 | 2026-05-20 | API foundation and Web UI completion | BACKLOG-009, BACKLOG-018 | Completed 2026-05-20 |
| 5 | 2026-05-28 onward | C# Stack, local Compose, and benchmarking | BACKLOG-021, BACKLOG-013, BACKLOG-010, BACKLOG-011 | Completed 2026-05-29 |
| 6+ | After Sprint 5 completion | Future solver and product ideas | BACKLOG-014, BACKLOG-015, BACKLOG-016 | Open |

---

## Maintenance Rules

1. Keep item statuses exactly `Open`, `In Progress`, or `Resolved`.
2. Update the summary counts whenever an item status changes.
3. Do not delete resolved items.
4. Add a Decision Register entry before closing any item that resolves into a structural choice.
5. Update `DOCS/.analysis/ref-arch-alignment_2026-05-15.md` when Reference Architecture migration status changes.
6. Keep `DOCS/.planning/backlog.md` as a bridge only unless DR-013 is superseded.

---

**Next Review Date:** 2026-05-27
**Backlog Owner:** Project Lead / Development Team
