# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-05-19 (BACKLOG-028 resolved — governance metadata corrected)
**Governed by:** `reference-architecture.md` v1.13 Section 10.1
**Template:** `DOCS/.templates/backlog.template.md`
**Authoritative path:** `DOCS/.planning/backlog.md`
**Status:** Active Development

---

## Purpose

This backlog tracks product, technical debt, and Reference Architecture migration work required to keep current and future Stacks in parity.

Per v1.13 Section 10.1:

- Every tracked item uses exactly one status: `Open`, `In Progress`, or `Resolved`.
- Resolved items are retained as a record that the gap existed.
- Structural choices must be recorded in `decision-register.md` before the related work is closed.

---

## Summary

| Status | Count |
|--------|-------|
| Open | 19 |
| In Progress | 0 |
| Resolved | 34 |
| **Total** | **53** |

| Area | Current state |
|------|---------------|
| Current execution baseline | 46 scenarios / 257 steps passing |
| Active Reference Architecture | v1.13 |
| Active Stack | `DEMOAPP001_TYPESCRIPT_CYPRESS` (dir: `demo-apps/demoapp001-typescript-cypress/`) |
| Current sprint focus | CI wiring, output decoupling, implementation-log normalization |
| Highest parity risks | RA-001 through RA-006 all Resolved — RA v1.9 structural gaps closed |

---

## Reference Architecture Migration Items

| ID | Title | Stack(s) | Nature of Gap | Priority | Status | Decision Record |
|----|-------|----------|---------------|----------|--------|-----------------|
| MIG-01 | Adopt Reference Architecture v1.3 and create DR-012 | All | Governance baseline | High | Resolved | DR-012 |
| MIG-02 | Add RA-literal DOCS path bridges | All | Documentation path compatibility | High | Resolved | DR-013 |
| MIG-03 | Align code review output location and naming | All | Review output compliance | High | Resolved | DR-014 |
| MIG-04 | Wire Screenplay runtime state through Actor Memory | DEMOAPP001 and future Stacks | Screenplay parity contract | High | Resolved | DR-015 |
| MIG-05 | Remove direct Ability calls from step definitions | DEMOAPP001 and future Stacks | Layer 2 thinness | High | Resolved | DR-015 |
| MIG-06 | Refresh AI agent guide for v1.3 | All | Agent guidance currency | Medium | Resolved | DR-012, DR-013, DR-014 |
| MIG-07 | Reconcile backlog against v1.3 state | All | Planning currency | Medium | Resolved | None required |
| MIG-08 | Complete template mandate details | All | Template compliance | Medium | Resolved | None required |
| MIG-09 | Normalize implementation-log location and naming policy | All | Documentation path and naming | Medium | Resolved | DR-017 |
| MIG-10 | Add feature parity validation report process | All | Generated parity artifacts | Medium | Resolved | None required |
| MIG-11 | Parameterize over-specified canonical Gherkin steps | All | Gherkin portability | Low | Resolved | DR-018 |
| MIG-12 | Decide metrics Stack identifier policy | All | Multi-Stack reporting | Low | Resolved | DR-016 |
| MIG-13 | Rename Stack filesystem directories to kebab-case | DEMOAPP001 and future Stacks | Directory naming alignment | Medium | Resolved | DR-016 |

---

## Reference Architecture Improvement Items

Raised by structural review `.review/2026-05-18_reference-architecture-structural-review.md`.
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

## Active Product and Technical Work

| ID | Title | Stack(s) | Nature of Gap | Priority | Status |
|----|-------|----------|---------------|----------|--------|
| BACKLOG-004 | Setup GitHub Actions CI/CD | DEMOAPP001 | CI automation | Medium | Open |
| BACKLOG-009 | Implement REST API Wrapper | DEMOAPP001 future API surface | Feature implementation | Medium | Open |
| BACKLOG-018 | Implement Web UI Solver Visualisation | DEMOAPP001 future UI surface | Feature implementation | Medium | Open |
| BACKLOG-020 | Python Screenplay-style Step Definitions | DEMOAPP002 | Future Stack parity | Medium | Open |
| BACKLOG-021 | C# Screenplay-style Step Definitions | DEMOAPP003 | Future Stack parity | Medium | Open |
| BACKLOG-025 | Fix feature parity report summary terminology to match RA CI gate spec | All | Parity tooling compliance (RA §9.4) | Medium | Open |
| BACKLOG-027 | Configure Serenity/JS reporters to produce living documentation | DEMOAPP001 | Framework investment unrealised | Medium | Open |
| BACKLOG-029 | Mark DR-010 as Superseded by DR-014 in decision register | All | Decision register governance (RA §10.6) | Medium | Open |
| BACKLOG-022 | Implement step-text parity checker (Section 8.4 criterion 3) | All | Parity automation (RA §8.4) | High | Open |
| BACKLOG-024 | Make "the missing digit is {int}" step genuinely parameterised | DEMOAPP001 | Step definition shape (RA §8.2) | Low | Open |
| BACKLOG-030 | Extract actor name 'Solver' to shared constant across step definitions | DEMOAPP001 | Magic string risk (RA §8.2) | Low | Open |
| BACKLOG-031 | Update sprint roadmap to reflect resolved items | All | Planning document currency | Low | Open |
| BACKLOG-010 | Docker Compose for Local Development | All | Local development infrastructure | Low | Open |
| BACKLOG-011 | Performance Benchmarking Suite | All | Performance regression detection | Low | Open |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | Future Stack implementation | Future | Open |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | Future Stack implementation | Future | Open |
| BACKLOG-014 | Advanced Solving Techniques | DEMOAPP001 and future Stacks | Solver capability | Future | Open |
| BACKLOG-015 | Interactive Sudoku Tutor | Future product surface | Product idea | Future | Open |
| BACKLOG-016 | Puzzle Generator | Future product surface | Product idea | Future | Open |

---

## Active Item Details

### RA-001: Define `@util` surface type formally in RA Sections 6 and 7

**Priority:** High
**Status:** Resolved
**Severity:** Critical (review Risk 1)
**Nature of Gap:** RA specification gap — `@util` tag appears in Sections 5.3 and Appendix B but has no corresponding surface contract (Section 6), Ability definition (Section 7), or orchestration lifecycle (Section 9.1)
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 1
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 2
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 3
**Resolution:** DR-023 — RA v1.6 adds "Automated enforcement" subsection to Section 8.1 (multi-Stack MUST provide checker, single-Stack MAY use checklist). Appendix A updated with `memory-key-check.template.md`. Template created at `DOCS/.templates/memory-key-check.template.md`. Script created at `.batch/check-memory-key-parity.ps1`. DEMOAPP001 passes: all 6 constants verified OK. CI gate depends on BACKLOG-004 (GitHub Actions).

Acceptance criteria:

- [x] Section 8.1 updated: normative requirement for an automated memory-key checker in multi-Stack projects
- [x] Appendix A updated: `memory-key-check.template.md` added (script or CI step template)
- [x] Project implementation: `.batch/check-memory-key-parity.ps1` created for DEMOAPP001 baseline
- [ ] CI gate: memory key checker integrated into CI pipeline (depends on RA-002 and BACKLOG-004 — not yet implemented)
- [x] RA version bumped and a DR entry created

---

### RA-004: Define Canonical Feature Store change governance

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 4)
**Nature of Gap:** Section 5 defines feature propagation process but no change approval process — no specification for who can modify canonical features, what review is required, or how breaking changes are coordinated across Stacks
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 4
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 5
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 7
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 8
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 9
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 10
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
**Review evidence:** `.review/2026-05-18_reference-architecture-structural-review.md` Risk 11
**Resolution:** DR-028 — RA v1.13 adds Section 4.4 (Shared Packages Directory): independent versioning MUST, MUST NOT include Stack-specific code or test runner imports, public interface changes treated as breaking changes (Section 5.5 gate), DR entry MUST, parity verification run MUST. Shared package failures are project-level breaking changes — must be resolved before Stack is declared in parity. DEMOAPP001 has no packages/ usage; compliant. DR-028 recorded.

Acceptance criteria:

- [x] Section 4.4 added: Shared Packages — each package independently versioned; MUST NOT contain Stack-specific code or test runner imports; subject application source MUST NOT live in `packages/` unless a pure utility library with no Stack-specific dependencies; any change to a shared package's public interface MUST produce a DR entry and a parity verification run against all dependent Stacks
- [x] RA version bumped and a DR entry created (this is a normative rule change introducing MUST requirements for a previously unconstrained area)

---

### BACKLOG-004: Setup GitHub Actions CI/CD

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001
**Nature of Gap:** CI automation

Acceptance criteria:

- [ ] `.github/workflows/ci.yml` created
- [ ] Build step runs `npm ci` and `npm run build`
- [ ] Lint step runs `npm run lint`
- [ ] Test step runs `npm test`
- [ ] PR status checks visible in GitHub
- [ ] `README.md` updated with CI badge

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
**Status:** Open
**Stack(s):** DEMOAPP001 future API surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/rest-api-wrapper.md`

Acceptance criteria:

- [ ] Express.js server
- [ ] Technique endpoints for unit-completion, hidden-singles, and naked-singles
- [ ] Solve endpoint with step tracking using AuditLogger
- [ ] Puzzle endpoints: list and get by name
- [ ] Validate endpoint
- [ ] Request validation and error handling middleware
- [ ] API tests for all endpoints

### BACKLOG-018: Implement Web UI Solver Visualisation

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001 future UI surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/web-ui-solver-visualisation.md`

Acceptance criteria:

- [ ] `SolveStepTracker` adapter over `AuditLogger`
- [ ] HTML grid display with algorithm color coding
- [ ] Step-by-step playback controls
- [ ] Event log panel with current step highlighting
- [ ] Statistics panel
- [ ] Served from the REST API Express server

### BACKLOG-020: Python Screenplay-style Step Definitions

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP002
**Nature of Gap:** Future Stack parity

Acceptance criteria:

- [ ] `demo-apps/demoapp002-python-pytest/` directory created
- [ ] Python solver implementation follows the solver specification
- [ ] `UseSudokuSolver` and `LoadPuzzles` abilities implemented
- [ ] Tasks and Questions implemented in Python-appropriate style
- [ ] All canonical Gherkin scenarios pass
- [ ] Python project configuration present

### BACKLOG-021: C# Screenplay-style Step Definitions

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP003
**Nature of Gap:** Future Stack parity

Acceptance criteria:

- [ ] `demo-apps/demoapp003-csharp-specflow/` directory created
- [ ] C# solver implementation follows the solver specification
- [ ] Screenplay-style `IAbility`, `ITask`, and `IQuestion<T>` interfaces defined
- [ ] `UseSudokuSolver` and `LoadPuzzles` abilities implemented
- [ ] All canonical Gherkin scenarios pass
- [ ] `dotnet test` runs with SpecFlow

### BACKLOG-022: Implement step-text parity checker (Section 8.4 criterion 3)

**Priority:** High
**Status:** Open
**Stack(s):** All
**Nature of Gap:** Parity automation — Section 8.4 criterion 3 (step Gherkin text matches canonical exactly) is designated MUST be automated per DR-027, but no script exists. The feature parity report checks scenario presence; it does not diff individual step text within a scenario.

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 3

Acceptance criteria:

- [ ] Script created (e.g. `.batch/check-step-text-parity.ps1`) that diffs step text in Stack-local feature files against canonical feature files
- [ ] Any step text divergence exits non-zero and reports the differing lines
- [ ] Script integrated as a CI gate per Section 9.4
- [ ] No DR required unless the implementation reveals a structural gap

---

### MIG-13: Rename Stack filesystem directories to kebab-case

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001 and future Stacks
**Nature of Gap:** Directory naming alignment
**Decision Record:** DR-016
**Scheduled:** Sprint 3 (before Stack 2 onboarding)

Analysis reference: `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md`

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

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 2

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
**Status:** Open
**Stack(s):** DEMOAPP001
**Nature of Gap:** Step definition shape (RA §8.2)

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 11

The step `Given('the missing digit is {int}', ...)` in `unitCompletion.steps.ts` accepts a digit
parameter from the Gherkin but discards it. The missing digit is hardcoded in
`setupAlmostCompleteColumn()`. This violates the implicit contract of a parameterised step and
will propagate to future Stacks as a silent no-op. Must be resolved before DEMOAPP002 onboarding.

Acceptance criteria:

- [ ] `setupAlmostCompleteColumn(col, missingDigit)` updated to accept the missing digit and build the column accordingly rather than hardcoding `[1,2,3,4,5,6,8,9]`
- [ ] `unitCompletion.steps.ts` passes the `digit` parameter through to the grid setup method
- [ ] Canonical feature file updated if the step text changes (per feature update procedure in `CLAUDE.md`)
- [ ] Stack-local feature copy updated to match
- [ ] `npm test` remains green
- [ ] No DR required unless the step text change is a breaking canonical feature change

---

### BACKLOG-025: Fix feature parity report summary terminology to match RA CI gate spec

**Priority:** Medium
**Status:** Open
**Stack(s):** All
**Nature of Gap:** Parity tooling compliance (RA §9.4)

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 4

RA §9.4 states the CI pipeline MUST fail if `Overall result: DRIFT` or
`Overall result: MISSING` appears in the report output. The script
`.batch/generate-feature-parity-report.ps1` writes `Overall result: PASS` or
`Overall result: FAIL` at the summary level. Text-based CI gates written
against the RA-specified strings would never trigger. Exit-code-based gates
work correctly, but the terminology mismatch is a latent defect that will
cause confusion when CI is authored (BACKLOG-004).

Acceptance criteria:

- [ ] `generate-feature-parity-report.ps1` updated: summary line writes `PASS`, `DRIFT`, or `MISSING` (not `FAIL`)
- [ ] The `Write-Host "Overall result: ..."` console line updated to match
- [ ] Script exit code behaviour unchanged (non-zero on any non-PASS result)
- [ ] No DR required (editorial correction to a tooling script)

---

### BACKLOG-026: Normalize planning backlog filename to comply with DR-020

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Document naming violation (DR-020)

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 5

DR-020 mandates kebab-case for all authored documents (exceptions: `README.md`,
`CHANGELOG.md`, `CLAUDE.md`). The planning backlog file was exposed on disk with
uppercase filename casing while references in CLAUDE.md, the RA, and the file's
own header use `DOCS/.planning/backlog.md` (lowercase). On Linux CI runners
(case-sensitive), mismatched path casing can fail to resolve.

**Resolution:** The file casing was normalized to `DOCS/.planning/backlog.md`
using a temporary intermediate `git mv` because Windows is case-insensitive.
Editable non-review uppercase references were updated; review outputs under
`.review/` and `DOCS/.review/` remain read-only per RA §10.7 and `.review/README.md`.

Acceptance criteria:

- [x] Planning backlog filename normalized to `DOCS/.planning/backlog.md` via `git mv`
- [x] Editable non-review uppercase references updated via search
- [x] `npm test` remains green
- [x] No DR required (corrects a naming violation, not a normative rule change)

---

### BACKLOG-027: Configure Serenity/JS reporters to produce living documentation

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001
**Nature of Gap:** Framework investment unrealised

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 6

`tests/screenplay/support/configure.ts` sets `crew: []`. Serenity/JS's primary
differentiator over plain Cucumber is its HTML living documentation report.
Without reporters in the crew, test output is identical to plain Cucumber and
the framework investment is not realised. This is especially relevant for
demonstrating pedagogical content to new Stack authors.

Acceptance criteria:

- [ ] `@serenity-js/serenity-bdd` installed as a dev dependency
- [ ] `configure.ts` updated: `crew` includes `ArtifactArchiver.storingArtifactsAt('.results/serenity')` and `new SerenityBDDReporter()`
- [ ] `.results/serenity/` added to `.gitignore`
- [ ] Orchestration script (`.batch/run-demoapp001.ps1`) updated to invoke the Serenity BDD CLI to generate the HTML report after the test run
- [ ] `npm test` remains green with reporters active
- [ ] Stack `docs/README.md` updated with instructions for viewing the report

---

### BACKLOG-028: Correct stale metadata in decision-register.md and backlog.md headers

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Governance document currency

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 7

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
**Status:** Open
**Stack(s):** All
**Nature of Gap:** Decision register governance (RA §10.6)

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 8

DR-010 formally accepted `DOCS/.review/` as the code review output location.
DR-014 subsequently moved this to the repository-root `.review/`. DR-010
remains `Status: Accepted` with no forward reference to DR-014. Per RA §10.6,
a superseded entry MUST contain a forward reference to its replacement. An
agent reading the register in order would see DR-010 as valid authority.

Acceptance criteria:

- [ ] DR-010 `**Status:**` field updated to: `Superseded by DR-014 -- 2026-05-16`
- [ ] A forward reference note added to DR-010's Consequences section identifying DR-014 as the replacement
- [ ] DR-014 verified to contain a back reference to DR-010 (add one if missing)
- [ ] No new DR required (corrects governance record, not a normative rule change)

---

### BACKLOG-030: Extract actor name 'Solver' to shared constant across step definitions

**Priority:** Low
**Status:** Open
**Stack(s):** DEMOAPP001
**Nature of Gap:** Magic string risk (RA §8.2)

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 9

The string `'Solver'` is used as the argument to `actorCalled('Solver')` in
every step definition file without being extracted to a shared constant. If
the actor persona name changes, it must be located and updated manually across
all step definition files. The name is semantically significant to Serenity/JS
(it appears in reports and stack traces).

Acceptance criteria:

- [ ] `tests/screenplay/support/actors.ts` created: `export const SOLVER_ACTOR = 'Solver';`
- [ ] All `actorCalled('Solver')` occurrences in step definition files replaced with `actorCalled(SOLVER_ACTOR)` (importing from `actors.ts`)
- [ ] `npm test` remains green
- [ ] No DR required

---

### BACKLOG-031: Update sprint roadmap to reflect resolved items

**Priority:** Low
**Status:** Open
**Stack(s):** All
**Nature of Gap:** Planning document currency

Review evidence: `.review/2026-05-18_repository-structural-review.md` Risk 12

The sprint roadmap in `DOCS/.planning/backlog.md` shows Sprint 6+ listing
"RA-001 through RA-006 (Open)" while all ten RA items are Resolved. Sprint 2
and Sprint 3 statuses list items already resolved and have dates past their
end date. Any agent or stakeholder reading the roadmap to determine current
focus receives misleading information.

Acceptance criteria:

- [ ] Sprint 2 and Sprint 3 rows marked `Completed` with a note of completion date
- [ ] Sprint 6+ row updated to remove resolved RA items; replaced with accurate current open items (e.g. BACKLOG-004, BACKLOG-022, BACKLOG-025 through BACKLOG-031)
- [ ] Sprint 4 and Sprint 5 rows reviewed for accuracy against current open items
- [ ] No DR required

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
| MIG-03 | Align code review output location and naming | All | 2026-05-15 | DR-014 |
| MIG-06 | Refresh AI agent guide for v1.3 | All | 2026-05-15 | `CLAUDE.md` current |
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

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items | Status |
|--------|-------|-------|-----------|--------|
| 2 | 2026-05-14 to 2026-05-27 | Close persistent risks and governance drift | BACKLOG-004, MIG-08, MIG-04, MIG-05 | In Progress |
| 3 | 2026-05-28 to 2026-06-10 | Directory rename and output decoupling | MIG-13 ✅, BACKLOG-007, BACKLOG-017 | In Progress |
| 4 | 2026-06-11 to 2026-06-24 | Audit/API foundations and Python Stack start | BACKLOG-008, BACKLOG-009, BACKLOG-020 | Open |
| 5 | 2026-06-25 to 2026-07-08 | API/Web UI and C# Stack start | BACKLOG-018, BACKLOG-021 | Open |
| 6+ | 2026-07-09 onward | Multi-Stack polish, infrastructure, and RA improvements | BACKLOG-010, BACKLOG-011, RA-001 through RA-006 | Open |

---

## Maintenance Rules

1. Keep item statuses exactly `Open`, `In Progress`, or `Resolved`.
2. Update the summary counts whenever an item status changes.
3. Do not delete resolved items.
4. Add a Decision Register entry before closing any item that resolves into a structural choice.
5. Update `DOCS/ref-arch-alignment_2026-05-15.md` when Reference Architecture migration status changes.
6. Keep `DOCS/.planning/backlog.md` as a bridge only unless DR-013 is superseded.

---

**Next Review Date:** 2026-05-27
**Backlog Owner:** Project Lead / Development Team
