# Screenplay-BDD Reference Architecture - Alignment & Migration Report

**Date:** 2026-05-15
**Analyst:** Codex (GPT-5)
**Subject:** `gb.automation.smoketests.sudoku.poc` vs `REFERENCE_ARCHITECTURE.md` v1.3
**Status:** v1.3 re-baseline; supersedes the v1.2 alignment text in this file

---

## Executive Summary

The project remains execution-stable and substantially aligned at the Stack implementation level. The current orchestration run completed successfully:

- Build exit code: 0
- Test exit code: 0
- 43 scenarios passed
- 241 steps passed
- Metrics written to `.results/.metrics/DEMOAPP001_20260515T165829Z.txt` and `.md`

The v1.3 reference architecture bump re-opened compliance work. MIG-01, MIG-02, MIG-03, and MIG-06 are now complete: `DECISION_REGISTER.md` adopts v1.3 through DR-012, DR-012 records the multi-file review bundle convention required by v1.3 Section 10.7, DR-013 records the compatibility strategy for v1.3 DOCS paths, DR-014 creates root `.review/` as the future review-output location, and `CLAUDE.md` now reflects the current v1.3/Screenplay baseline. The remaining largest gaps are not solver correctness problems. They are Screenplay contract, backlog, and template gaps:

- The v1.3 DOCS literal paths and root review path now exist; historical dot-prefixed documentation remains preserved by decision.
- The Screenplay layer exists and passes, but Memory key constants are mostly documentary; Tasks and Questions store/read state through Ability instance fields instead of Actor Memory.
- Several step definitions directly call Abilities, so Layer 2 is not consistently thin.
- `DOCS/.planning/BACKLOG.md` and some template metadata still describe v1.2 or older pre-Screenplay state.

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
| Backlog | `DOCS/planning/BACKLOG.md` MUST exist and use `Open` / `In Progress` / `Resolved` | `DOCS/planning/BACKLOG.md` now bridges to `DOCS/.planning/BACKLOG.md`; authoritative backlog content remains stale |
| Templates | Every document type in Sections 10.1-10.9 needs a template with `[REQUIRED]` mandatory fields | Lowercase filenames exist, but some templates lack `[REQUIRED]` annotations |
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
| Section 10 documentation obligations | Partial | DR-012, DR-013, DR-014, DOCS path bridges, root `.review/`, and refreshed agent guide are in place; template and backlog gaps remain |
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

### H3. Actor Memory contract is not fully implemented

**Requirement:** Memory is a scenario-scoped key-value store. Tasks write Memory and Questions read Memory using named key constants.

**Observed:** `tests/screenplay/support/memory-keys.ts` defines the expected constants, but Tasks and Questions read/write state through fields on `UseSudokuSolver` and `LoadPuzzles`. Searches found no `remember(...)` or `recall(...)` usage in the Screenplay layer.

**Risk:** Cross-stack parity can drift because the documented Memory contract is not the runtime state contract.

**Migration:** MIG-04.

### H4. Step definitions are not consistently thin

**Requirement:** Step definitions map Gherkin to Screenplay interactions; business mechanics belong in Tasks, Questions, and Abilities.

**Observed:** Several step files import and call Abilities directly, especially `puzzleLoader.steps.ts`, `orchestration.steps.ts`, `edgeCases.steps.ts`, `gridInitialisation.steps.ts`, and `nakedSingles.steps.ts`.

**Risk:** Layer 2 remains partially coupled to lower-level mechanics, reducing portability for the planned Python and C# Stacks.

**Migration:** MIG-05.

## Medium Severity

### M1. AI agent guide is stale against v1.3 and current implementation - Resolved by MIG-06

**Observed before migration:** `CLAUDE.md` referenced v1.2, DR-011 as latest, old status symbols, the old feature-file path, and a "No Screenplay Layer" known limitation. It also said Hidden Singles was blocks-only, which conflicted with current code.

**Resolution:** `CLAUDE.md` now states the active v1.3 baseline, DR-001 through DR-014 authority range, current Stack and feature paths, root `.review/` policy, exact backlog status taxonomy, and current Screenplay implementation status. It now treats MIG-04 and MIG-05 as remaining Screenplay conformance work rather than claiming Screenplay is absent.

**Migration:** MIG-06 resolved on 2026-05-15.

### M2. Backlog content no longer reflects current compliance state

`DOCS/.planning/BACKLOG.md` is governed by v1.2, has stale summary counts, and still lists `BACKLOG-019: Migrate TypeScript Tests to Screenplay Pattern` as `Open` even though the Screenplay implementation is present and passing.

**Migration:** MIG-07.

### M3. Review output location and naming were not v1.3-aligned - Resolved by MIG-03

**Observed before migration:** Existing review bundles used names such as `CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z`, and no repository-root `.review/` or `code-review/` directory existed.

**Resolution:** DR-014 now makes repository-root `.review/` the authoritative location for future reviews. Root `.review/README.md` defines the future `CODE_REVIEW_[AGENT]_v[N]_[UTC]` bundle naming and historical handling; `DOCS/.review/README.md`, `DOCS/templates/code-review.template.md`, and `DOCS/.design/NAMING_CONVENTIONS.md` now point future reviews to the v1.3 shape without renaming historical review bundles.

**Migration:** MIG-03 resolved on 2026-05-15.

### M4. Template mandate is not fully satisfied

All 14 lowercase Appendix A template files exist under `DOCS/templates/`. However, `backlog.template.md`, `changelog.template.md`, and `naming-conventions.template.md` do not contain `[REQUIRED]` annotations for mandatory fields. Several governed documents still reference legacy uppercase template filenames.

**Migration:** MIG-08.

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
- `DOCS/templates/` contains all 14 lowercase Appendix A filenames.
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
| MIG-04 | Open | High | Screenplay Memory | Wire runtime state through Actor Memory or an explicitly documented Serenity/JS equivalent | Tasks write named Memory keys; Questions read named Memory keys; parity contract and docs match runtime behavior |
| MIG-05 | Open | High | Step definitions | Remove direct Ability calls from step definitions | Step files delegate through `actor.attemptsTo(...)` and `actor.answer(...)`; missing Tasks/Questions are added |
| MIG-06 | Resolved 2026-05-15 | Medium | AI agent guide | Refresh `CLAUDE.md` for v1.3 and current Screenplay implementation | No v1.2 stale baseline; no "No Screenplay Layer" limitation; current feature paths, DR range, backlog taxonomy, and risks are accurate |
| MIG-07 | Open | Medium | Backlog | Reconcile backlog against current v1.3 state | Governance references v1.3; summary counts match item statuses; `BACKLOG-019` is resolved or split into remaining Screenplay-contract work; MIG items are tracked |
| MIG-08 | Open | Medium | Templates | Complete template mandate details | `backlog.template.md`, `changelog.template.md`, and `naming-conventions.template.md` mark mandatory fields with `[REQUIRED]`; governed docs reference lowercase templates |
| MIG-09 | Open | Medium | Implementation logs | Normalize implementation-log location and naming policy | `implementation-logs` path strategy implemented; future log naming follows `YYYY-MM-DD_short-session-topic.md`; legacy files are preserved or mapped |
| MIG-10 | Open | Medium | Parity artifacts | Add feature parity validation report process | Generated reports go to `.results/feature-parity/FEATURE_PARITY_[YYYYMMDDTHHMMZ].md`; process documented in orchestration design |
| MIG-11 | Open | Low | Gherkin | Parameterize over-specified canonical steps before Stack 2 | Literal setup arrays are moved to parameters or Examples tables; canonical and Stack-local features remain synchronized |
| MIG-12 | Open | Low | Metrics | Decide metric Stack identifier policy | Metrics use either full Stack names or a documented short-name mapping; orchestration docs and metrics output agree |

---

## 6. Recommended Sequence

1. Complete MIG-07 and MIG-08 next. These remove stale backlog and template guidance that can mislead future agents.
2. Complete MIG-04 and MIG-05 before onboarding Stack 2. These are the actual portability blockers.
3. Complete MIG-09 through MIG-12 as part of the Stack 2 readiness work.

---

## 7. Conclusion

The TypeScript Stack is green and useful as the current reference implementation, but the repository is not fully v1.3-compliant. MIG-01 through MIG-03 and MIG-06 have reset the governance baseline and agent guide around DR-012, DR-013, and DR-014. The remaining v1.3 work should focus on Actor Memory usage, thin step definitions, and updated backlog/template guidance.
