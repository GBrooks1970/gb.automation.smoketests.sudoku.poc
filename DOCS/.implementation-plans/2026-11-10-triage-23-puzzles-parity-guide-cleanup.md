---
version: 1
created: 2026-11-10T00:15:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-094 / TRIAGE-23
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-094 / TRIAGE-23 Gate puzzles.json copy parity and correct the guide's Stack-tag and Add-a-Puzzle wording

**Goal.** Author and wire an automated parity check `.batch/check-puzzles-parity.ps1` that asserts byte-identical SHA256 copy parity across all three `puzzles.json` files and fails closed on planted single-copy mutations; update `CLAUDE.md` to cite all three puzzle copies in "Add a Puzzle" and retire inaccurate `@stack-demoapp001` tag claims; remove the unused `stack-demoapp002` pytest marker in `demo-apps/demoapp002-python-pytest/pyproject.toml`; and record DR-050 in `decision-register.md` reconciling three-Stack fixture parity and tagless canonical feature replication.

Source: Root worklist item **TRIAGE-23** (Claude review v2 Risk 7 part, LOW priority), tracked in the project backlog as **BACKLOG-094**.

---

## Evidence gathered before planning

Audited on 2026-11-10 on branch `worklist/triage-23-puzzles-parity-guide-cleanup` cut from `main` @ `160c7a3`:

### 1. `puzzles.json` Fixture State
- The repository contains three copies of `puzzles.json`:
  1. `demo-apps/demoapp001-typescript-cypress/puzzles.json`
  2. `demo-apps/demoapp002-python-pytest/puzzles.json`
  3. `demo-apps/demoapp003-csharp-specflow/puzzles.json`
- All three files currently exist and are byte-identical, sharing SHA256:
  `88410514bf7cbef6d78598c6c0f6d29518857a788cfd98faf60b0f7ff276c009`.
- However, `.batch/run-parity-checks.ps1` and `.github/workflows/ci.yml` do not check `puzzles.json`. If a developer adds a puzzle only to DEMOAPP001 per the instructions in `CLAUDE.md`, the copies silently desynchronise until a multi-Stack scenario fails.

### 2. Guide Drift in `CLAUDE.md`
- **Line 206**: Claims `Available puzzle data is in demo-apps/demoapp001-typescript-cypress/puzzles.json.`
- **Lines 212–215**:
  - Step 2 claims feature changes are copied only to `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature`.
  - Step 4 claims `Add stack-local tags only in the Stack copy, currently @stack-demoapp001.`
  - In reality, all four feature files (`features-shared/` and the three Stacks) are 100% byte-identical under `@util`, carrying no Stack-specific tags.
- **Lines 298–303**: "Add a Puzzle" instructs:
  ```markdown
  1. Edit demo-apps/demoapp001-typescript-cypress/puzzles.json.
  2. Add a puzzle object with name, difficulty, description, and a 9x9 grid.
  3. Add or update canonical Gherkin if behavior changes.
  4. Run .\.batch\run-demoapp001.ps1.
  ```
  This instruction ignores DEMOAPP002 and DEMOAPP003, leading directly to copy drift.

### 3. Unused Marker in `pyproject.toml`
- `demo-apps/demoapp002-python-pytest/pyproject.toml` (line 26) declares:
  `"stack-demoapp002: DEMOAPP002 Python pytest Stack scenarios",`
- No feature file or scenario carries `@stack-demoapp002`. Python tests pass with 85/85 tests regardless of whether this marker is present.

### 4. Decision Register Context
- Early decision **DR-008** (2026-05-14) planned to add `@stack-demoapp001` locally. As multi-Stack architecture matured (DR-033, DR-038), the repository adopted strict byte-identical feature replication across all Stacks.
- Early decisions **DR-026** and **DR-028** recorded that `puzzles.json` was single-Stack (DEMOAPP001 only).
- Creating **DR-050** formally supersedes/reconciles these historical notes and establishes three-Stack `puzzles.json` copy parity and tagless canonical feature replication under governance.
- `.batch/check-ra-header-currency.ps1` dynamically checks that `CLAUDE.md` cites `accepted range DR-001 through DR-$latestAcceptedId`. Adding DR-050 advances this range to DR-050.

---

## Decisions for Owner Review

### Decision 1: Author `.batch/check-puzzles-parity.ps1` with Built-In Negative Control Verification
- **Details:**
  - Create `.batch/check-puzzles-parity.ps1` that computes SHA256 across all three Stack copies (`demoapp001`, `demoapp002`, `demoapp003`).
  - Asserts that all three files exist and produce matching SHA256 hashes.
  - Includes a negative control execution: in a temporary scratch directory, simulates single-copy drift for each of the three Stacks and asserts that the comparison fails closed (exit code 1) in all three cases.
  - Wire `.batch/check-puzzles-parity.ps1` into `.batch/run-parity-checks.ps1` as an 8th parity check and into `.github/workflows/ci.yml` as a step under the DEMOAPP001 job.
- **Rationale:** Satisfies acceptance criteria that `puzzles.json` copy parity is asserted and proven to fail on planted single-copy edits, without leaving lingering mutations in tracked files.
- **Recommendation:** Approve as proposed.

### Decision 2: Update `CLAUDE.md` to Reflect Three-Stack Realities
- **Details:**
  - Update line 206 to state that puzzle fixture data is replicated across all three Stacks in byte-identical copies.
  - Update "Canonical Feature Update Procedure" (lines 208–220) to specify propagating changes to all three Stack locations (`demoapp001`, `demoapp002`, `demoapp003`), remove the obsolete `@stack-demoapp001` tag claim, and confirm that all Stack copies are byte-identical with canonical.
  - Update "Add a Puzzle" (lines 298–304) to instruct updating all three Stack `puzzles.json` files, running `.batch/check-puzzles-parity.ps1` (or `run-parity-checks.ps1`), and verifying all three test suites.
- **Rationale:** Prevents contributor drift and aligns documentation with actual project architecture.
- **Recommendation:** Approve as proposed.

### Decision 3: Remove Unused `stack-demoapp002` Pytest Marker
- **Details:**
  - Remove `"stack-demoapp002: DEMOAPP002 Python pytest Stack scenarios",` from `demo-apps/demoapp002-python-pytest/pyproject.toml`.
- **Rationale:** Dead configuration that misleadingly suggests `@stack-demoapp002` tags exist in feature files.
- **Recommendation:** Approve as proposed.

### Decision 4: Record DR-050 in `decision-register.md`
- **Details:**
  - Author DR-050: *Reconcile three-stack puzzles fixture parity and retire obsolete stack-tag claims*.
  - Explicitly annotate DR-008, DR-026, and DR-028 with notes referencing DR-050.
  - Update `decision-register.md` footer to `Next ID: DR-051`.
  - Update `CLAUDE.md` accepted range to `DR-001 through DR-050`.
- **Rationale:** Provides formal architectural governance for test fixture copy parity and tagless Gherkin parity per portfolio standards.
- **Recommendation:** Approve as proposed.

---

## Execution Steps (Post-Approval)

1. **Backlog Transition:** Mark BACKLOG-094 as `In Progress` in `DOCS/.planning/backlog.md` (counts: 7 Open / 1 In Progress / 116 Resolved / 124 Total).
2. **Author Parity Script:** Create `.batch/check-puzzles-parity.ps1` with positive check and temp-dir negative controls. Wire into `.batch/run-parity-checks.ps1` and `.github/workflows/ci.yml`.
3. **Update CLAUDE.md:** Update puzzle data locations, "Add a Puzzle", canonical feature propagation, and DR range.
4. **Update pyproject.toml:** Remove `stack-demoapp002` marker.
5. **Record DR-050:** Add DR-050 to `decision-register.md` and annotate DR-008, DR-026, DR-028.
6. **Local Verification:** Run RA header currency, documentation currency, and all 8 parity checks.
7. **PR & Merge:** Push `worklist/triage-23-puzzles-parity-guide-cleanup`, open PR, watch CI, merge on green, and deliver outcome PR.
