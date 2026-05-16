# Screenplay-BDD Reference Architecture - Alignment & Migration Report

**Date:** 2026-05-15 (updated 2026-05-16)
**Analyst:** Codex (GPT-5); updated by Claude Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` vs `REFERENCE_ARCHITECTURE.md` v1.3
**Status:** v1.3 re-baseline; MIG-04 and MIG-05 resolved 2026-05-16

---

## Executive Summary

The project remains execution-stable and substantially aligned at the Stack implementation level. The current orchestration run completed successfully:

- Build exit code: 0
- Test exit code: 0
- 43 scenarios passed
- 241 steps passed
- Metrics written to `.results/.metrics/DEMOAPP001_20260515T165829Z.txt` and `.md`

The v1.3 reference architecture bump re-opened compliance work. MIG-01, MIG-02, MIG-03, MIG-06, MIG-07, and MIG-08 are now complete: `DECISION_REGISTER.md` adopts v1.3 through DR-012, DR-012 records the multi-file review bundle convention required by v1.3 Section 10.7, DR-013 records the compatibility strategy for v1.3 DOCS paths, DR-014 creates root `.review/` as the future review-output location, `CLAUDE.md` now reflects the current v1.3/Screenplay baseline, the authoritative backlog is reconciled against the current migration state, and current governed docs now reference lowercase templates with mandatory fields annotated where MIG-08 required it. MIG-04 and MIG-05 are now complete: Actor Memory is wired via TakeNotes (`notes<SudokuNotes>()` pattern) — all six Memory key constants are now runtime-active. All step definition files are thin; no step file imports or calls Abilities directly. All 43 scenarios pass after the migration.

The remaining gaps are process and tooling items (MIG-09 through MIG-12), not Screenplay contract gaps.

### Overall v1.3 Compliance

**Status:** Partial compliance. Execution quality is high; governance and strict architecture conformance require migration.

---

## 1. v1.3 Delta Impact

The v1.3 architecture tightens or makes explicit these obligations:

| Area | v1.3 requirement | Current effect |
|------|------------------|----------------|
| Code review directory | Root `code-review/` or `.review/` MUST exist; bundle convention recorded as DR-012 | Root `.review/` exists for future reviews via DR-014; historical reviews remain under `DOCS/.review/` |
| Implementation logs | `implementation-logs/` MUST exist under `DOCS/` or root | `DOCS/implementation-logs/README.md` now bridges to `DOCS/.implementation/` via DR-013 |
| Naming conventions | `DOCS/design/NAMING_CONVENTIONS.md` MUST exist | `DOCS/design/NAMING_CONVENTIONS.md` now bridges to `DOCS/.design/NAMING_CONVENTIONS.md` via DR-013 |
| Backlog | `DOCS/planning/BACKLOG.md` MUST exist and use `Open` / `In Progress` / `Resolved` | `DOCS/planning/BACKLOG.md` bridges to the reconciled authoritative backlog at `DOCS/.planning/BACKLOG.md`; current counts are Open 20, In Progress 1, Resolved 12 |
| Templates | Every document type in Sections 10.1-10.9 needs a template with `[REQUIRED]` mandatory fields | Lowercase filenames exist; MIG-08 added mandatory-field annotations to the backlog, changelog, and naming-conventions templates and updated current governed docs to lowercase references |
| Feature parity reports | Generated parity reports go to `.results/feature-parity/FEATURE_PARITY_[YYYYMMDDTHHMMZ].md` | No parity report generator yet; not blocking one-Stack execution |

---

## 2. Compliance Snapshot

| Domain | Status | Notes |
|--------|--------|-------|
| Section 2 layer model | Partial | Layers exist, but some step definitions call Abilities directly |
| Section 3 Screenplay contracts | Partial | Actor/Ability/Task/Question structures exist; Actor Memory contract is not fully implemented |
| Section 4 directory blueprint | Partial | Core roles and v1.3 compatibility paths exist; remaining drift is mostly historical dot-prefix organization |
| Section 5 canonical feature store | Compliant | `features_shared/` exists; stack-local copy matches canonical body after tag line |
| Section 6 subject application contract | Compliant for current scope | `@util` surface is active; CLI baseline is documented and hardened |
| Section 7 ability taxonomy | Mostly compliant | Current `@util` ability model is project-specific; future `@cli` work needs `InvokeExecutable` |
| Section 8 multi-Stack parity | Pre-parity / partial | One Stack exists; parity contract exists; Memory keys are not wired into Actor Memory |
| Section 9 orchestration and metrics | Mostly compliant | Runner emits key-value and markdown metrics; markdown summaries are preserved |
| Section 10 documentation obligations | Partial | DR-012, DR-013, DR-014, DOCS path bridges, root `.review/`, refreshed agent guide, reconciled backlog, and template cleanup are in place; implementation-log naming/path and parity report process remain |
| Section 11 new Stack readiness | Partial | TypeScript baseline passes, but v1.3 governance should be normalized before Stack 2 |

---

## 3. Detailed Findings

## High Severity

### H1. v1.3 adoption and DR-012 are not recorded - Resolved by MIG-01

**Requirement:** `DECISION_REGISTER.md` is authoritative for structural and process decisions. v1.3 Section 10.7 states that the multi-file review bundle convention is recorded as DR-012.

**Observed before migration:** The register ended at DR-011 and contained v1.2 adoption language. Header metadata also referenced the legacy uppercase template name.

**Resolution:** DR-012 now adopts `REFERENCE_ARCHITECTURE.md` v1.3 as the active governance baseline and records the future multi-file review bundle naming convention required by Section 10.7. The register header now references v1.3 and `DOCS/templates/decision-record.template.md`; the footer now reports last entry DR-012 and next ID DR-013.

**Migration:** MIG-01 resolved on 2026-05-15.

### H2. v1.3 DOCS literal documentation paths are missing - Resolved by MIG-02

**Requirement:** v1.3 names literal paths for `DOCS/planning/BACKLOG.md`, `DOCS/design/NAMING_CONVENTIONS.md`, and `DOCS/implementation-logs/`.

**Observed before migration:** The project used `DOCS/.planning`, `DOCS/.design`, and `DOCS/.implementation` under DR-001, and the v1.3 literal DOCS paths were absent.

**Resolution:** DR-013 now records the compatibility path strategy. `DOCS/planning/BACKLOG.md`, `DOCS/design/NAMING_CONVENTIONS.md`, and `DOCS/implementation-logs/README.md` now exist as bridge files pointing to the authoritative dot-prefixed locations.

**Migration:** MIG-02 resolved on 2026-05-15. Root code review path alignment remains tracked by MIG-03.

### H3. Actor Memory contract is not fully implemented - Resolved by MIG-04

**Requirement:** Memory is a scenario-scoped key-value store. Tasks write Memory and Questions read Memory using named key constants.

**Observed before migration:** `tests/screenplay/support/memory-keys.ts` defined the expected constants, but Tasks and Questions read/write state through fields on `UseSudokuSolver` and `LoadPuzzles`. No `remember(...)` or `recall(...)` usage was present.

**Resolution:** `TakeNotes.usingAnEmptyNotepad<SudokuNotes>()` added to Cast. `SudokuNotes` interface added to `memory-keys.ts`. All outcome Tasks write their results to Actor Memory via `notes<SudokuNotes>().set(KEY, value).performAs(actor)`. The four outcome Questions (`SolveStatus`, `AlgorithmMadeProgress`, `PlacementValidity`, `ErrorThrown`) read from Actor Memory. All six Memory key constants are now runtime-active. DR-015 records the decision and the project-standard notes pattern.

**Migration:** MIG-04 resolved on 2026-05-16.

### H4. Step definitions are not consistently thin - Resolved by MIG-05

**Requirement:** Step definitions map Gherkin to Screenplay interactions; business mechanics belong in Tasks, Questions, and Abilities.

**Observed before migration:** Several step files imported and called Abilities directly: `puzzleLoader.steps.ts`, `orchestration.steps.ts`, `edgeCases.steps.ts`, `gridInitialisation.steps.ts`, `nakedSingles.steps.ts`, `constraintValidation.steps.ts`, `integration.steps.ts`.

**Resolution:** New Tasks created: `SetTargetCell`, `SolvePuzzle.withCurrentGrid`, `SimulateError`, `CheckAlgorithmProgress`, `LoadPuzzleByIndex`, `LoadPuzzlesByDifficulty`, `LoadPuzzleByName.andInitialiseOrDefault`, `InitialiseGrid.fromPuzzleNamed`. New Questions created: `GridSnapshot`, `MultipleSolvers`, `LoadedPuzzles`, `CurrentSolver`, `TargetCell`, plus `GridCell.isDeepCopy()`. All seven affected step files updated to remove Ability imports. `SetupGridState.valuesInRow/Column/Block` now read `TARGET_CELL` from Actor Memory. All 43 scenarios pass.

**Migration:** MIG-05 resolved on 2026-05-16.

## Medium Severity

### M1. AI agent guide is stale against v1.3 and current implementation - Resolved by MIG-06

**Observed before migration:** `CLAUDE.md` referenced v1.2, DR-011 as latest, old status symbols, the old feature-file path, and a "No Screenplay Layer" known limitation. It also said Hidden Singles was blocks-only, which conflicted with current code.

**Resolution:** `CLAUDE.md` now states the active v1.3 baseline, DR-001 through DR-014 authority range, current Stack and feature paths, root `.review/` policy, exact backlog status taxonomy, and current Screenplay implementation status. It now treats MIG-04 and MIG-05 as remaining Screenplay conformance work rather than claiming Screenplay is absent.

**Migration:** MIG-06 resolved on 2026-05-15.

### M2. Backlog content no longer reflects current compliance state - Resolved by MIG-07

**Observed before migration:** `DOCS/.planning/BACKLOG.md` was governed by v1.2, had stale summary counts, and still listed `BACKLOG-019: Migrate TypeScript Tests to Screenplay Pattern` as `Open` even though the Screenplay implementation was present and passing.

**Resolution:** `DOCS/.planning/BACKLOG.md` now references `REFERENCE_ARCHITECTURE.md` v1.3, uses only the v1.3 status taxonomy, and reconciles summary counts to Open 20, In Progress 1, Resolved 12. `BACKLOG-019` is resolved with residual Screenplay conformance tracked by MIG-04 and MIG-05, and the MIG-01 through MIG-12 migration set is tracked directly in the backlog.

**Migration:** MIG-07 resolved on 2026-05-15.

### M3. Review output location and naming were not v1.3-aligned - Resolved by MIG-03

**Observed before migration:** Existing review bundles used names such as `CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z`, and no repository-root `.review/` or `code-review/` directory existed.

**Resolution:** DR-014 now makes repository-root `.review/` the authoritative location for future reviews. Root `.review/README.md` defines the future `CODE_REVIEW_[AGENT]_v[N]_[UTC]` bundle naming and historical handling; `DOCS/.review/README.md`, `DOCS/templates/code-review.template.md`, and `DOCS/.design/NAMING_CONVENTIONS.md` now point future reviews to the v1.3 shape without renaming historical review bundles.

**Migration:** MIG-03 resolved on 2026-05-15.

### M4. Template mandate is not fully satisfied - Resolved by MIG-08

**Observed before migration:** All 14 lowercase Appendix A template files existed under `DOCS/templates/`, but `backlog.template.md`, `changelog.template.md`, and `naming-conventions.template.md` did not contain `[REQUIRED]` annotations for mandatory fields. Several current governed documents still referenced legacy uppercase template filenames.

**Resolution:** The three affected lowercase templates now mark mandatory fields with `[REQUIRED]`. Current governed docs now reference lowercase template filenames, including `DOCS/README.md`, `CHANGELOG.md`, `DOCS/.design/NAMING_CONVENTIONS.md`, `DOCS/.planning/BACKLOG.md`, architecture contracts, and `DEMOAPP001_TYPESCRIPT_CYPRESS/docs/*`.

**Migration:** MIG-08 resolved on 2026-05-15.

### M5. Implementation log location and naming diverge from v1.3

Implementation logs exist, but under `DOCS/.implementation/` with names like `IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md`. v1.3 expects an `implementation-logs/` directory and UTC date-prefix plus short slug naming.

**Migration:** MIG-09.

## Low Severity

### L1. Over-specified Gherkin remains

Some canonical steps still embed literal values, for example array literals in setup steps. v1.3 Section 5.4 says these SHOULD be refactored to parameterized forms.

**Migration:** MIG-11.

### L2. Metrics use short Stack identifier

Metrics currently use `DEMOAPP001` rather than the full canonical Stack directory name `DEMOAPP001_TYPESCRIPT_CYPRESS`. This is workable, but should be explicitly documented or normalized before multi-Stack reporting.

**Migration:** MIG-12.

---

## 4. Evidence Snapshot

### Execution

Latest orchestration run:

```text
BuildExitCode: 0
TestExitCode: 0
OverallExitCode: 0
DEMOAPP001_BDD_Tests=43
DEMOAPP001_BDD_Passed=43
DEMOAPP001_BDD_Failed=0
DEMOAPP001_BDD_Skipped=0
```

Test log confirms:

```text
43 scenarios (43 passed)
241 steps (241 passed)
```

### Feature Store

- Canonical feature: `features_shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`
- Stack-local feature: `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/features/BasicSudokuSolverLogic.feature`
- Feature bodies match after the tag line.
- Canonical tag: `@util`
- Stack-local tags: `@util @stack-demoapp001`

### Governance

- `REFERENCE_ARCHITECTURE.md` is v1.3 dated 2026-05-15.
- `DECISION_REGISTER.md` last entry is DR-014; next ID is DR-015.
- DR-012 records v1.3 adoption and the multi-file review bundle convention.
- DR-013 records the DOCS compatibility path strategy.
- DR-014 records root `.review/` as the future review-output location.
- `CLAUDE.md` now reflects v1.3, current Screenplay implementation status, current paths, and current decision range.
- `DOCS/.planning/BACKLOG.md` now reflects v1.3, tracks MIG-01 through MIG-12, and reports Open 20 / In Progress 1 / Resolved 12.
- `DOCS/templates/` contains all 14 lowercase Appendix A filenames.
- `backlog.template.md`, `changelog.template.md`, and `naming-conventions.template.md` now mark mandatory fields with `[REQUIRED]`.
- Current governed docs now reference lowercase template filenames.
- Root `.review/README.md` exists and defines future v1.3 review output naming.
- `DOCS/planning/BACKLOG.md`, `DOCS/design/NAMING_CONVENTIONS.md`, and `DOCS/implementation-logs/README.md` exist as compatibility bridges.
- Dot-prefix authoritative sources remain under `DOCS/.planning`, `DOCS/.design`, and `DOCS/.implementation`.
- Historical review outputs remain under `DOCS/.review/` unchanged.

---

## 5. Migration Work

All future migration tasks are labelled `MIG-**` as requested.

| ID | Status | Priority | Affected area | Task | Acceptance criteria |
|----|--------|----------|---------------|------|---------------------|
| MIG-01 | Resolved 2026-05-15 | High | Decision Register | Record v1.3 adoption and create DR-012 for the multi-file review bundle convention | DR-012 exists; register header references v1.3 and `decision-record.template.md`; `Last entry` and `Next ID` updated |
| MIG-02 | Resolved 2026-05-15 | High | Documentation paths | Decide and implement the v1.3 path strategy for `DOCS/planning`, `DOCS/design`, and `DOCS/implementation-logs` | Compatibility files/directories exist with DR-013-backed sync policy |
| MIG-03 | Resolved 2026-05-15 | High | Code review outputs | Align review storage and naming with v1.3 | Root `.review/` exists; future bundle naming uses `CODE_REVIEW_[AGENT]_v[N]_[UTC]`; historical handling is documented without editing findings |
| MIG-04 | Resolved 2026-05-16 | High | Screenplay Memory | Wire runtime state through Actor Memory via TakeNotes | All six Memory key constants are runtime-active; Tasks write notes; Questions read notes; DR-015 records the pattern |
| MIG-05 | Resolved 2026-05-16 | High | Step definitions | Remove direct Ability calls from step definitions | All step files delegate through `actor.attemptsTo(...)` and `actor.answer(...)`; 8 new Tasks and 5 new Questions added |
| MIG-06 | Resolved 2026-05-15 | Medium | AI agent guide | Refresh `CLAUDE.md` for v1.3 and current Screenplay implementation | No v1.2 stale baseline; no "No Screenplay Layer" limitation; current feature paths, DR range, backlog taxonomy, and risks are accurate |
| MIG-07 | Resolved 2026-05-15 | Medium | Backlog | Reconcile backlog against current v1.3 state | Governance references v1.3; summary counts match item statuses; `BACKLOG-019` is resolved with residual work tracked by MIG-04 and MIG-05; MIG items are tracked |
| MIG-08 | Resolved 2026-05-15 | Medium | Templates | Complete template mandate details | `backlog.template.md`, `changelog.template.md`, and `naming-conventions.template.md` mark mandatory fields with `[REQUIRED]`; current governed docs reference lowercase templates |
| MIG-09 | Open | Medium | Implementation logs | Normalize implementation-log location and naming policy | `implementation-logs` path strategy implemented; future log naming follows `YYYY-MM-DD_short-session-topic.md`; legacy files are preserved or mapped |
| MIG-10 | Open | Medium | Parity artifacts | Add feature parity validation report process | Generated reports go to `.results/feature-parity/FEATURE_PARITY_[YYYYMMDDTHHMMZ].md`; process documented in orchestration design |
| MIG-11 | Open | Low | Gherkin | Parameterize over-specified canonical steps before Stack 2 | Literal setup arrays are moved to parameters or Examples tables; canonical and Stack-local features remain synchronized |
| MIG-12 | Open | Low | Metrics | Decide metric Stack identifier policy | Metrics use either full Stack names or a documented short-name mapping; orchestration docs and metrics output agree |

---

## 6. Recommended Sequence

1. ~~Complete MIG-04 and MIG-05 before onboarding Stack 2.~~ **Done** (2026-05-16).
2. Complete MIG-09 through MIG-12 as part of the Stack 2 readiness work.

---

## 7. Conclusion

The TypeScript Stack is green and fully aligned on the Screenplay contract. MIG-01 through MIG-08 reset the governance baseline, agent guide, backlog, and template references. MIG-04 (Actor Memory via TakeNotes) and MIG-05 (thin step definitions) are now resolved — all six Memory key constants are runtime-active and no step file accesses Abilities directly. The remaining v1.3 work (MIG-09 through MIG-12) covers implementation-log naming, parity reporting, Gherkin portability, and metrics naming — process and tooling items rather than Screenplay contract gaps. The repository is ready for Stack 2 onboarding.
