---
version: 1
created: 2026-11-10T14:02:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-096 / TRIAGE-26
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-096 / TRIAGE-26 Amend RA Section 5.6 to permit exact behavioural literals in canonical features

**Goal.** Amend `DOCS/reference-architecture.md` Section 5.6 to replace the blanket inline literal prohibition with an inline literal policy that permits exact behavioural verification literals in canonical features (aligning the architecture with the established BACKLOG-078 and DR-049 assertion practices); record Decision Record DR-052; annotate historical decision DR-026; bump the Reference Architecture version from v1.15 to v1.16; update governing citations across `reference-architecture.md`, `decision-register.md`, `CLAUDE.md`, `DOCS/.planning/backlog.md`, `DOCS/README.md`, `DOCS/.implementation-logs/README.md`, `DOCS/.review/README.md`, and `CHANGELOG.md`; and validate that all 8 repository parity gates and 37 documentation currency negative controls pass cleanly.

Source: Root worklist item **TRIAGE-26** (Claude review v2 Risk 7 part, 07 Single Source of Truth, LOW priority), tracked in the project backlog as **BACKLOG-096**.

---

## Evidence gathered before planning

Audited on 2026-11-10 on branch `worklist/triage-26-amend-ra-exact-literals` cut from `main` @ `c28323b`:

### 1. Section 5.6 Policy Drift Audit
- `DOCS/reference-architecture.md` Section 5.6 (lines 442–446) currently contains a blanket prohibition:
  ```markdown
  **Inline literal prohibition:**

  Test data MUST NOT be embedded as inline literals in canonical feature files. Inline literals tie a scenario to a specific input value, preventing reuse and making the canonical file a de-facto test data store. Use parameterised steps (Section 5.4) and provide values in Stack-local Scenario Outline `Examples` tables.
  ```
- This rule was drafted during early project phases (DR-026 / RA v1.10) to prevent feature files from becoming dumping grounds for arbitrary test fixtures.
- However, as solver capabilities expanded, the project deliberately established exact behavioural literals in canonical scenarios:
  - Under BACKLOG-078 (Exact Then assertions), 16 Then step patterns were hardened with exact behavioural literals (e.g. `the missing value should be 7`, `the cell at row 0, column 1 should have value 5`).
  - Under BACKLOG-090 / TRIAGE-15 (DR-049), candidate observation and fixed-coordinate arguments were introduced (e.g. `the candidate values for row 0, column 0 should be "1, 2, 4"`).
- Claude Code Review v2 Risk 7 observed that this created an unenforced and contradicted rule where an architectural RFC 2119 "MUST NOT" directly clashed with established canonical verification practice. Review v2 recommended either moving all literals into `Examples` tables or amending RA Section 5.6 to permit exact behavioural literals in canonical features.
- The project owner explicitly approved the amend option.

### 2. Active Canonical Features Use Exact Behavioural Literals
- Inspection of `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` shows that exact behavioural literals are used throughout:
  - Exact coordinates: `Given column 0 contains 8 non-zero values`
  - Exact values: `Then the missing value should be 7`
  - Exact candidate subsets: `Given 3 empty cells each have exactly one possible value`
  - Exact validation results: `Then the move should be reported as VALID`
- These literals do not represent arbitrary bulk test data, but rather the normative behavioural specification of the algorithm under test. Forcing all such values into external files or Scenario Outline tables would degrade scenario readability and add unnecessary indirection without improving reusability.

### 3. Architecture Version Guard Mechanism
- `.batch/check-ra-header-currency.ps1` dynamically enforces synchronization across repository governance files:
  1. Reads `**Version:** <n>` from `DOCS/reference-architecture.md`.
  2. Asserts that `decision-register.md`, `DOCS/.planning/backlog.md`, and `CLAUDE.md` cite `Governed by... reference-architecture.md v<n>`.
  3. Checks that `decision-register.md` footer matches the accepted decision range in `CLAUDE.md`.
- Bumping the Reference Architecture from v1.15 to v1.16 requires synchronous citation updates across all governing files to ensure `.batch/check-ra-header-currency.ps1` remains green.

### 4. Parity Gate and Documentation Currency Baseline
- Execution of `.\.batch\run-parity-checks.ps1` on the base commit `c28323b` confirms that all 8 parity gates currently pass:
  1. `check-ra-header-currency.ps1`: PASS (accepted range DR-001 through DR-051; 55 scenarios / 309 steps)
  2. `test-documentation-currency.ps1`: PASS (37/37 negative controls rejected)
  3. `test-dependency-audit-policy.ps1`: PASS (15/15 policy controls pass)
  4. `test-ci-evidence-contract.ps1`: PASS (21/21 contract controls pass)
  5. `check-memory-key-parity.ps1`: PASS (memory keys match across all 3 Stacks)
  6. `generate-feature-parity-report.ps1`: PASS (3 in parity, 0 drift, 0 missing)
  7. `check-step-text-parity.ps1`: PASS (217 step lines match across all 3 Stacks)
  8. `check-puzzles-parity.ps1`: PASS (3/3 copies match; 6/6 negative controls pass)

---

## Decisions for Owner Review

### Decision 1: Record Decision Record DR-052 (*Permit Exact Behavioural Literals in Canonical Features and Bump Reference Architecture to v1.16*) and Annotate DR-026
- **Details:**
  - Author DR-052 in `decision-register.md` formally recording the owner-selected decision to amend RA Section 5.6 to permit exact behavioural literals in canonical feature files.
  - Annotate DR-026 in `decision-register.md` noting that its original blanket inline literal prohibition is superseded by DR-052.
  - Update `decision-register.md` footer to `*Last entry: DR-052 (Accepted). Next ID: DR-053.*`.
  - Update `CLAUDE.md` line 15 accepted range to `DR-001 through DR-052 (excluding superseded/deprecated entries)`.
- **Rationale:** Satisfies acceptance criteria that a Decision Record records the amend decision and maintains governance synchronization.
- **Recommendation:** Approve as proposed.

### Decision 2: Amend RA Section 5.6 in `DOCS/reference-architecture.md`
- **Details:**
  - Update Section 5.6 "Inline literal prohibition" to "Inline literal policy":
    ```markdown
    **Inline literal policy:**

    Arbitrary bulk test datasets MUST NOT be embedded as inline literals in canonical feature files; broad fixture collections or enumerated test puzzle banks belong in governed fixture stores (e.g. `puzzles.json`) or data-driven `Examples` tables.

    However, exact behavioural literals that define the normative behavioral contract of a scenario (such as expected elimination coordinates, target cell row/column indices, candidate sets, or specific solved digits as established under BACKLOG-078 and DR-049) ARE PERMITTED in canonical features. Such literals specify exact verification criteria rather than arbitrary test data stores, ensuring high-fidelity assertion and exact parity across all Stacks.
    ```
  - Clarify the "Data-driven scenarios:" subsection so that canonical Scenario Outlines MAY include governed `Examples` tables where parameter variants define behavioural specifications across Stacks.
  - Update document header to `**Version:** 1.16` and `**Date:** 2026-11-10`.
- **Rationale:** Reconciles the architectural requirement with real-world BDD best practices and resolves the contradiction identified in Claude review v2 Risk 7 without mutating test code or step definitions.
- **Recommendation:** Approve as proposed.

### Decision 3: Advance Reference Architecture Version to v1.16 Across Governing Files
- **Details:**
  - Synchronously update governing citations from v1.15 to v1.16 in:
    - `DOCS/reference-architecture.md` (header: `**Version:** 1.16`, `**Date:** 2026-11-10`)
    - `decision-register.md` (line 5: `**Governed by:** `reference-architecture.md` v1.16 §10.6`)
    - `DOCS/.planning/backlog.md` (line 5: `**Governed by:** `reference-architecture.md` v1.16 Section 10.1`; line 16: `Per v1.16 Section 10.1:`; line 135: `| Active Reference Architecture | v1.16 |`)
    - `CLAUDE.md` (line 19: `- Reference Architecture: v1.16, accepted 2026-11-10`; line 253: `Governed by `DOCS/reference-architecture.md` v1.16`)
    - `DOCS/README.md` (line 16: `reference-architecture.md <- Screenplay-BDD Reference Architecture v1.16`)
    - `DOCS/.implementation-logs/README.md` (line 4: `**Governed by:** `reference-architecture.md` v1.16 §10.8`)
    - `DOCS/.review/README.md` (line 4: `**Governed by:** `reference-architecture.md` v1.16 Section 10.7`)
    - `CHANGELOG.md` (add entry under `[Unreleased] > Changed` recording DR-052 / Reference Architecture v1.16)
- **Rationale:** Guarantees that `.batch/check-ra-header-currency.ps1` immediately validates active version v1.16 across all required targets without header divergence.
- **Recommendation:** Approve as proposed.

### Decision 4: Automated Verification Strategy and Gate Validation
- **Details:**
  - Run `.\.batch\run-parity-checks.ps1` covering all 8 parity gates.
  - Verify `.batch/check-ra-header-currency.ps1` reports:
    - `Active RA version: v1.16`
    - `OK decision-register.md cites v1.16`
    - `OK DOCS/.planning/backlog.md cites v1.16`
    - `OK CLAUDE.md cites v1.16`
    - `OK accepted range DR-001 through DR-052`
    - `Canonical feature execution: 55 scenarios / 309 steps per Stack`
  - Verify `.batch/test-documentation-currency.ps1` passes all 37 negative controls.
  - Verify feature parity, step text parity, memory key parity, puzzles fixture parity, CI evidence contract, and dependency audit policy checks all PASS.
- **Rationale:** Provides rigorous assurance that the documentation-only changes preserve all repo guards and test baselines.
- **Recommendation:** Approve as proposed.

---

## Plan of Work

### Phase 1: Planning and Registration
1. Commit this implementation plan `DOCS/.implementation-plans/2026-11-10-triage-26-amend-ra-exact-literals.md` and index it in `DOCS/.implementation-plans/_index.md`.
2. Present plan summary and decisions to owner via parent agent message.
3. Upon approval, mark BACKLOG-096 as `In Progress` in `DOCS/.planning/backlog.md` (Summary: 5 Open / 1 In Progress / 118 Resolved / 124 Total).
4. Update plan status to `approved`.

### Phase 2: Decision Record Authoring & Annotation
1. Author DR-052 in `decision-register.md`.
2. Annotate DR-026 in `decision-register.md` to reference DR-052.
3. Update footer in `decision-register.md` to `*Last entry: DR-052 (Accepted). Next ID: DR-053.*`.
4. Update `CLAUDE.md` line 15 to `Current accepted range: DR-001 through DR-052 (excluding superseded/deprecated entries).`.

### Phase 3: Amend RA Section 5.6 and Advance RA Version
1. Edit `DOCS/reference-architecture.md` Section 5.6 to replace the blanket inline literal prohibition with the amended inline literal policy.
2. Bump `DOCS/reference-architecture.md` version header to `1.16` and date to `2026-11-10`.
3. Update all governing RA version citations from v1.15 to v1.16 in `decision-register.md`, `DOCS/.planning/backlog.md`, `CLAUDE.md`, `DOCS/README.md`, `DOCS/.implementation-logs/README.md`, `DOCS/.review/README.md`, and `CHANGELOG.md`.

### Phase 4: Local Validation and Gate Execution
1. Run `.\.batch\check-ra-header-currency.ps1` and assert it passes with v1.16 and DR-052.
2. Run `.\.batch\run-parity-checks.ps1` and assert all 8 parity gates pass.

### Phase 5: Implementation PR and Merge
1. Commit changes to `worklist/triage-26-amend-ra-exact-literals`.
2. Push branch and open Implementation PR referencing BACKLOG-096 / TRIAGE-26.
3. Watch CI checks to green and merge using `--match-head-commit`.

### Phase 6: Outcome PR and Worklist Closure
1. Fast-forward local `main` to `origin/main`.
2. Create branch `worklist/triage-26-outcome`.
3. Mark BACKLOG-096 as `Resolved` in `DOCS/.planning/backlog.md` (Summary: 5 Open / 0 In Progress / 119 Resolved / 124 Total).
4. Update plan status to `delivered` in `DOCS/.implementation-plans/2026-11-10-triage-26-amend-ra-exact-literals.md` and `_index.md`.
5. Author `DOCS/.implementation-logs/2026-11-10_triage-26-amend-ra-exact-literals.md` and index in `README.md`.
6. Open and merge Outcome PR on green.
7. Tick `- [x] TRIAGE-26` in root `WORKLIST_gb.automation.smoketests.sudoku.poc.md` citing merge SHAs.

---

## Risk Analysis & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Missed RA version citation across documentation | Gate failure in `check-ra-header-currency.ps1` | Low | Audited all occurrences of `v1.15` beforehand; updated synchronously in Phase 3. |
| Overly permissive wording encourages test data sprawl | Architecture erosion | Low | The amended wording explicitly restricts inline literals to normative behavioural contracts (elimination coordinates, expected outputs, candidate subsets) and reiterates that bulk datasets belong in `puzzles.json`. |
| Unintentional modification of executable steps | Test failure | Zero | This is a docs-only task; no feature files, step definitions, or subject app code are modified. |
