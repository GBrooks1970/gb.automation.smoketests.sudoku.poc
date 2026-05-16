# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-05-16 (MIG-09 resolved)
**Governed by:** `REFERENCE_ARCHITECTURE.md` v1.3 Section 10.1
**Template:** `DOCS/templates/backlog.template.md`
**Authoritative path:** `DOCS/.planning/BACKLOG.md`
**Compatibility path:** `DOCS/planning/BACKLOG.md` (DR-013 bridge)
**Status:** Active Development

---

## Purpose

This backlog tracks product, technical debt, and Reference Architecture migration work required to keep current and future Stacks in parity.

Per v1.3 Section 10.1:

- Every tracked item uses exactly one status: `Open`, `In Progress`, or `Resolved`.
- Resolved items are retained as a record that the gap existed.
- Structural choices must be recorded in `DECISION_REGISTER.md` before the related work is closed.

---

## Summary

| Status | Count |
|--------|-------|
| Open | 16 |
| In Progress | 1 |
| Resolved | 16 |
| **Total** | **33** |

| Area | Current state |
|------|---------------|
| Current execution baseline | 43 scenarios / 241 steps passing |
| Active Reference Architecture | v1.3 |
| Active Stack | `DEMOAPP001_TYPESCRIPT_CYPRESS` (dir: `demo-apps/demoapp001-typescript-cypress/`) |
| Current sprint focus | CI wiring, output decoupling, implementation-log normalization |
| Highest parity risks | MIG-09 impl-log naming; MIG-10 parity report process (pre-Stack 2) |

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
| MIG-10 | Add feature parity validation report process | All | Generated parity artifacts | Medium | Open | Pending |
| MIG-11 | Parameterize over-specified canonical Gherkin steps | All | Gherkin portability | Low | Open | Pending if step contract changes |
| MIG-12 | Decide metrics Stack identifier policy | All | Multi-Stack reporting | Low | Open | Pending |
| MIG-13 | Rename Stack filesystem directories to kebab-case | DEMOAPP001 and future Stacks | Directory naming alignment | Medium | Resolved | DR-016 |

---

## Active Product and Technical Work

| ID | Title | Stack(s) | Nature of Gap | Priority | Status |
|----|-------|----------|---------------|----------|--------|
| BACKLOG-004 | Setup GitHub Actions CI/CD | DEMOAPP001 | CI automation | Medium | Open |
| BACKLOG-017 | Unify Feature Design Overlap | All planned app surfaces | Design consistency | Medium | In Progress |
| BACKLOG-007 | Decouple Console Output | DEMOAPP001 | CLI/API extensibility | Medium | Open |
| BACKLOG-008 | Implement Audit Trail Feature | DEMOAPP001 | Feature implementation | Medium | Open |
| BACKLOG-009 | Implement REST API Wrapper | DEMOAPP001 future API surface | Feature implementation | Medium | Open |
| BACKLOG-018 | Implement Web UI Solver Visualisation | DEMOAPP001 future UI surface | Feature implementation | Medium | Open |
| BACKLOG-020 | Python Screenplay-style Step Definitions | DEMOAPP002 | Future Stack parity | Medium | Open |
| BACKLOG-021 | C# Screenplay-style Step Definitions | DEMOAPP003 | Future Stack parity | Medium | Open |
| BACKLOG-010 | Docker Compose for Local Development | All | Local development infrastructure | Low | Open |
| BACKLOG-011 | Performance Benchmarking Suite | All | Performance regression detection | Low | Open |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | Future Stack implementation | Future | Open |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | Future Stack implementation | Future | Open |
| BACKLOG-014 | Advanced Solving Techniques | DEMOAPP001 and future Stacks | Solver capability | Future | Open |
| BACKLOG-015 | Interactive Sudoku Tutor | Future product surface | Product idea | Future | Open |
| BACKLOG-016 | Puzzle Generator | Future product surface | Product idea | Future | Open |

---

## Active Item Details

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
**Status:** In Progress
**Stack(s):** All planned app surfaces
**Nature of Gap:** Design consistency

Acceptance criteria:

- [x] Shared `CellChange` interface specified as single definition
- [x] `SolveStep extends CellChange` inheritance documented
- [ ] Single Express server approach explicitly documented in REST API design document
- [x] Design documents updated with cross-references
- [x] TODO task lists updated to reflect shared foundations
- [x] No contradictions between the three designs

### BACKLOG-007: Decouple Console Output

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001
**Nature of Gap:** CLI/API extensibility

Acceptance criteria:

- [ ] `app_src/output/IOutput.ts` interface created with `write(message: string): void`
- [ ] `app_src/output/ConsoleOutput.ts` implementation created
- [ ] `SudokuCLI` accepts an `IOutput` constructor parameter with `ConsoleOutput` default
- [ ] `SudokuSolver.named()` removed or used in `index.ts`
- [ ] Default CLI behavior unchanged
- [ ] `npm test` remains green

### BACKLOG-008: Implement Audit Trail Feature

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/DESIGN_Audit_Trail_Feature.md`

Acceptance criteria:

- [ ] `app_src/audit/AuditTypes.ts` with shared audit interfaces
- [ ] `app_src/audit/AuditLogger.ts` with iteration tracking and change recording
- [ ] `app_src/audit/AuditFormatter.ts` with JSON export and console summary
- [ ] Optional `SudokuSolver.setAuditLogger()` integration
- [ ] Algorithm attribution for each cell change recorded
- [ ] Less than 5% solver performance overhead
- [ ] Gherkin coverage added for audit scenarios

### BACKLOG-009: Implement REST API Wrapper

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001 future API surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/DESIGN_REST_API_Wrapper.md`

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

Design reference: `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md`

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

### MIG-13: Rename Stack filesystem directories to kebab-case

**Priority:** Medium
**Status:** Open
**Stack(s):** DEMOAPP001 and future Stacks
**Nature of Gap:** Directory naming alignment
**Decision Record:** DR-016
**Scheduled:** Sprint 3 (before Stack 2 onboarding)

Analysis reference: `DOCS/ANALYSIS_Directory_Naming_Kebab_Case_2026-05-16.md`

Acceptance criteria:

- [x] `DEMOAPPS/` renamed to `demo-apps/` using `git mv`
- [x] `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` renamed to `demo-apps/demoapp001-typescript-cypress/` using `git mv`
- [x] `features_shared/` renamed to `features-shared/`
- [x] TypeScript `__dirname`-relative paths confirmed rename-safe; `npm run build` exit 0 (Phase 4)
- [x] `tooling/cucumber.js`, `tsconfig.json`, `package.json` use relative paths — no edits needed; `npm test` 43/43 (Phase 4)
- [x] `.batch/run-demoapp001.ps1` updated and smoke-tested; BuildExitCode=0 TestExitCode=0 (Phase 4)
- [x] All markdown documentation updated; 0 stale-path links in focus files (Phase 4)
- [x] `NAMING_CONVENTIONS.md`, `CLAUDE.md`, `CHANGELOG.md`, `DECISION_REGISTER.md` updated (Phase 3)
- [x] DR-016 referenced in commit message (Phase 2 commit)

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
| MIG-09 | Normalize implementation-log location and naming policy | All | 2026-05-16 | Log files moved to `DOCS/implementation-logs/` with v1.3 naming; archive in `.implementation/`; DR-017 |

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items | Status |
|--------|-------|-------|-----------|--------|
| 2 | 2026-05-14 to 2026-05-27 | Close persistent risks and governance drift | BACKLOG-004, MIG-08, MIG-04, MIG-05 | In Progress |
| 3 | 2026-05-28 to 2026-06-10 | Directory rename and output decoupling | MIG-13 ✅, BACKLOG-007, BACKLOG-017 | In Progress |
| 4 | 2026-06-11 to 2026-06-24 | Audit/API foundations and Python Stack start | BACKLOG-008, BACKLOG-009, BACKLOG-020 | Open |
| 5 | 2026-06-25 to 2026-07-08 | API/Web UI and C# Stack start | BACKLOG-018, BACKLOG-021 | Open |
| 6+ | 2026-07-09 onward | Multi-Stack polish and infrastructure | BACKLOG-010, BACKLOG-011, MIG-09 through MIG-12 | Open |

---

## Maintenance Rules

1. Keep item statuses exactly `Open`, `In Progress`, or `Resolved`.
2. Update the summary counts whenever an item status changes.
3. Do not delete resolved items.
4. Add a Decision Register entry before closing any item that resolves into a structural choice.
5. Update `DOCS/ref-arch-alignment_2026-05-15.md` when Reference Architecture migration status changes.
6. Keep `DOCS/planning/BACKLOG.md` as a bridge only unless DR-013 is superseded.

---

**Next Review Date:** 2026-05-27
**Backlog Owner:** Project Lead / Development Team
