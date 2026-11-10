---
version: 1
created: 2026-11-10T08:18:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-095 / TRIAGE-25
status: delivered
language: en-GB
---

# Implementation plan: BACKLOG-095 / TRIAGE-25 Update the canonical feature narrative to the five implemented techniques

**Goal.** Update the top-level feature narrative in lines 3–5 of `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` from the historical three techniques to the five implemented solving techniques (Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, and X-Wing); propagate the updated feature file byte-for-byte across all three Stack copies (`demoapp001`, `demoapp002`, `demoapp003`), verifying identical SHA256 hashes; record Decision Record DR-051 governing this narrative alignment; advance the decision range in `CLAUDE.md` to DR-051; and validate that all 8 repository parity gates and 37 documentation currency controls pass cleanly.

Source: Root worklist item **TRIAGE-25** (Claude review v2 Risk 7 part, LOW priority), tracked in the project backlog as **BACKLOG-095**.

---

## Evidence gathered before planning

Audited on 2026-11-10 on branch `worklist/triage-25-feature-narrative-five-techniques` cut from `main` @ `b1e1a4e`:

### 1. Canonical and Stack-Local Feature Narrative State
- Lines 1–8 of `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` currently read:
  ```gherkin
  @util
  Feature: Basic Sudoku Solver Logic
    As an automated Sudoku solver
    I want to apply three fundamental solving techniques systematically
    So that I can solve Sudoku puzzles using Unit Completion, Hidden Singles, and Naked Singles

    Background:
      Given a standard 9x9 Sudoku grid is initialized
  ```
- This narrative reflects the initial three-technique solver scope.
- Under BACKLOG-019 (Naked Pairs) and BACKLOG-020 (X-Wing) / TRIAGE-15, scenarios for Naked Pairs and X-Wing were added, expanding the suite to 55 scenarios and 309 steps.
- Active documentation across eight guides was reconciled in BACKLOG-081 / TRIAGE-08 to consistently document all five techniques, but lines 3–5 of the canonical feature file were not amended, leaving an internal contradiction between the feature header narrative ("three fundamental solving techniques ... Unit Completion, Hidden Singles, and Naked Singles") and the scenarios contained within the file.

### 2. Four Feature Copies and Hash Parity Baseline
- The repository maintains four copies of `BasicSudokuSolverLogic.feature`:
  1. `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` (canonical)
  2. `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature`
  3. `demo-apps/demoapp002-python-pytest/tests/features/BasicSudokuSolverLogic.feature`
  4. `demo-apps/demoapp003-csharp-specflow/tests/features/BasicSudokuSolverLogic.feature`
- Pre-planning baseline verification confirms that all four files currently share identical SHA256 hashes:
  `9F486F216EF580F0BA6FBD748C0E4093B993E20A7921B3AE3D9DDB5BCC45C62A`.
- Modifying lines 3–5 in the canonical file without propagating byte-for-byte to all three Stacks would cause immediate hash divergence.

### 3. Parity Gate and Documentation Currency Baseline
- Execution of `.\.batch\run-parity-checks.ps1` confirms all 8 parity gates pass:
  1. `.batch/check-ra-header-currency.ps1`: PASS (accepted range DR-001 through DR-050; 55 scenarios / 309 steps per Stack)
  2. `.batch/test-documentation-currency.ps1`: PASS (37/37 negative controls pass)
  3. `.batch/test-dependency-audit-policy.ps1`: PASS (15/15 policy controls pass)
  4. `.batch/test-ci-evidence-contract.ps1`: PASS (21/21 contract controls pass)
  5. `.batch/check-memory-key-parity.ps1`: PASS (all memory keys identical across 3 Stacks)
  6. `.batch/generate-feature-parity-report.ps1`: PASS (`IN_PARITY: 3, DRIFT: 0, MISSING: 0`)
  7. `.batch/check-step-text-parity.ps1`: PASS (217 step lines match in all 3 Stacks)
  8. `.batch/check-puzzles-parity.ps1`: PASS (3/3 copies match; 6/6 negative controls pass)

### 4. Decision Register Status
- Latest decision is **DR-050** (Accepted, recorded 2026-11-10 in TRIAGE-23).
- Next available ID is **DR-051**.
- `CLAUDE.md` line 15 currently cites `Current accepted range: DR-001 through DR-050`.

---

## Decisions for Owner Review

### Decision 1: Record Decision Record DR-051 (*Align Canonical Feature Narrative with Five Implemented Solving Techniques*)
- **Details:**
  - Author DR-051 in `decision-register.md` documenting the formal decision to update lines 3–5 of `BasicSudokuSolverLogic.feature` to name all five implemented solving techniques.
  - Update `decision-register.md` footer to `*Last entry: DR-051 (Accepted). Next ID: DR-052.*`.
  - Update `CLAUDE.md` line 15 accepted range to `DR-001 through DR-051 (excluding superseded/deprecated entries)`.
  - Link DR-051 to related decisions DR-007, DR-016, DR-050 and BACKLOG-081.
- **Rationale:** Satisfies the acceptance criterion that "the next free DR is recorded first", and ensures `.batch/check-ra-header-currency.ps1` remains green.
- **Recommendation:** Approve as proposed.

### Decision 2: Update Canonical Feature Narrative in `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`
- **Details:**
  - Update lines 3–5 of `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` to:
    ```gherkin
      As an automated Sudoku solver
      I want to apply five solving techniques systematically
      So that I can solve Sudoku puzzles using Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, and X-Wing
    ```
  - Preserve all other lines exactly, including scenario outlines, step texts, scenario counts (55 scenarios), and step counts (309 steps).
- **Rationale:** Aligns the top-level user story with actual solver capabilities without altering any executable Gherkin step definitions or scenario structures.
- **Recommendation:** Approve as proposed.

### Decision 3: Byte-Identical Replication across All Three Stacks
- **Details:**
  - Copy the updated `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` file byte-for-byte to:
    - `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature`
    - `demo-apps/demoapp002-python-pytest/tests/features/BasicSudokuSolverLogic.feature`
    - `demo-apps/demoapp003-csharp-specflow/tests/features/BasicSudokuSolverLogic.feature`
  - Verify that `Get-FileHash -Algorithm SHA256` outputs the exact same hash across all 4 locations.
- **Rationale:** Satisfies acceptance criteria that "the four feature files hash identically" and conforms to the tagless byte-identical replication policy established in DR-050.
- **Recommendation:** Approve as proposed.

### Decision 4: Automated Verification Strategy and Gate Validation
- **Details:**
  - Run `.batch/run-parity-checks.ps1` covering all 8 parity gates.
  - Verify that `.batch/generate-feature-parity-report.ps1` reports `PASS` (0 drift, 0 missing).
  - Verify that `.batch/check-step-text-parity.ps1` reports `PASS` (217 step lines matching across all three Stacks).
  - Verify that `.batch/check-ra-header-currency.ps1` confirms scenario count (55) and step count (309) remain unchanged and validates the updated DR-051 range in `CLAUDE.md`.
  - Verify that `.batch/test-documentation-currency.ps1` passes all 37 negative controls.
- **Rationale:** Ensures complete regression avoidance across all toolchains and documentation integrity guards.
- **Recommendation:** Approve as proposed.

---

## Plan of Work

### Phase 1: Planning and Backlog Transition
1. Commit this implementation plan `DOCS/.implementation-plans/2026-11-10-triage-25-feature-narrative-five-techniques.md` and index it in `DOCS/.implementation-plans/_index.md`.
2. Present plan to owner via parent agent message.
3. Upon approval, mark BACKLOG-095 as `In Progress` in `DOCS/.planning/backlog.md` (Summary: 6 Open / 1 In Progress / 117 Resolved / 124 Total).
4. Update plan status to `approved`.

### Phase 2: Decision Record Authoring
1. Author DR-051 in `decision-register.md`.
2. Update footer in `decision-register.md` to `*Last entry: DR-051 (Accepted). Next ID: DR-052.*`.
3. Update `CLAUDE.md` line 15 to `Current accepted range: DR-001 through DR-051 (excluding superseded/deprecated entries).`.

### Phase 3: Feature Narrative Alignment and Replication
1. Edit lines 3–5 in `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`.
2. Propagate the updated file byte-for-byte to the three Stack locations.
3. Assert SHA256 identity across all 4 files.

### Phase 4: Local Validation and Gate Execution
1. Run `.\.batch\run-parity-checks.ps1` and verify all 8 parity gates pass.
2. Verify Gherkin scenario and step execution counts remain 55 / 309.

### Phase 5: Implementation PR and Merge
1. Commit changes to `worklist/triage-25-feature-narrative-five-techniques`.
2. Push branch and open Implementation PR referencing BACKLOG-095 / TRIAGE-25.
3. Watch CI to all-green and merge using `--match-head-commit`.

### Phase 6: Outcome PR and Worklist Closure
1. Fast-forward local `main` to `origin/main`.
2. Create branch `worklist/triage-25-outcome`.
3. Mark BACKLOG-095 as `Resolved` in `DOCS/.planning/backlog.md` (Summary: 6 Open / 0 In Progress / 118 Resolved / 124 Total).
4. Update plan status to `delivered` in `DOCS/.implementation-plans/2026-11-10-triage-25-feature-narrative-five-techniques.md` and `_index.md`.
5. Author `DOCS/.implementation-logs/2026-11-10_triage-25-feature-narrative-five-techniques.md` and index in `README.md`.
6. Open and merge Outcome PR on green.
7. Tick `- [x] TRIAGE-25` in root `WORKLIST_gb.automation.smoketests.sudoku.poc.md` citing merge SHAs.

---

## Risk Analysis & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Line-ending or whitespace mismatch during feature copying | Parity failure | Low | Use exact byte copy or PowerShell `Copy-Item` / UTF-8 without BOM, verified by `Get-FileHash -Algorithm SHA256`. |
| Scenario/step count mismatch | Gate failure | Very Low | Only lines 3–5 (Feature header description) are altered. No Scenario Outline, Background, or Step definitions are modified. |
| RA header currency failure | Gate failure | Low | Synchronously update `CLAUDE.md` line 15 when adding DR-051 to `decision-register.md`. |

---

## Outcome and Delivery

- **Status:** Delivered
- **Implementation PR:** [#129](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/129)
- **Merged commit:** `0c667bf` (2026-11-10)
- **CI Run:** [42826936108](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/42826936108) (all 5 jobs passed)
- **Delivered Scope:**
  - Recorded Decision Record DR-051 in `decision-register.md` (*Align Canonical Feature Narrative with Five Implemented Solving Techniques*), updated footer to `Next ID: DR-052`, and advanced `CLAUDE.md` accepted range to `DR-001 through DR-051`.
  - Updated lines 3–5 of `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` to name the five implemented solving techniques: Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, and X-Wing.
  - Propagated byte-for-byte across all three Stack copies (`demoapp001`, `demoapp002`, `demoapp003`), verifying identical SHA256 (`F1FF2FA664C6DC4078A5A56E81B71E2F944E3DDE02E1AF2C199984AFB6E00D62`) across all 4 feature files.
  - Verified all 8 repository parity gates and 37 documentation currency controls pass cleanly.