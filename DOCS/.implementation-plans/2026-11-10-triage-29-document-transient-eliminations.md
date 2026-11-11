---
version: 1
created: 2026-11-10T22:00:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-099 / TRIAGE-29
status: delivered
language: en-GB
---

# Implementation plan: BACKLOG-099 / TRIAGE-29 Document that Naked Pairs and X-Wing eliminations are transient

**Goal.** Document the "elimination-to-single only, transient candidate state (no persistent candidate grid)" simplification in `DOCS/.algorithm/naked-pairs.md`, `DOCS/.algorithm/x-wing.md`, and `DOCS/.design/sudoku-solver-platform-specification.md` (citing `app_src/SudokuSolver.ts` lines 294–314 and 383–395) so that readers and educators understand the solver's exact operational boundary: candidate sets are dynamically computed from the grid per iteration, eliminations are applied to a local map, and an elimination only persists if it immediately reduces a peer cell to a single candidate resulting in a cell placement. Non-single candidate eliminations are discarded upon method exit.

Source: Root worklist item **TRIAGE-29** (Claude review v2 Risk 12, LOW priority), tracked in the project backlog as **BACKLOG-099**.

---

## Evidence gathered before planning

Audited on 2026-11-10 on branch `worklist/triage-29-document-transient-eliminations` cut from `main` @ `691b2c4`:

### 1. Existing Solver Implementation Analysis (Claude Review v2 Risk 12)
- In `demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts`:
  - `nakedPairs()` (lines 245–347): `cellCandidates` is built per unit from `getCellCandidates(cell.row, cell.col)`. When a pair is identified, `cands.delete(d1)` and `cands.delete(d2)` mutate only the local `Map<Cell, Set<number>>`. Cell placement occurs if and only if `cands.size === 1`, setting `this.grid[cell.row][cell.col] = val`. If `cands.size > 1` after elimination, the reduced candidate set is discarded when the unit loop finishes.
  - `xWing()` (lines 354–450): `cellCandidates` is built across the 9×9 grid from `getCellCandidates(r, c)`. When an X-Wing pattern is found, `cands.delete(digit)` mutates only the local map. Cell placement occurs if and only if `cands.size === 1`. Otherwise, the elimination is discarded when `xWing()` returns.
  - Python (`demoapp002/sudoku_solver.py`) and C# (`SudokuSolver.cs`) follow the identical transient elimination pattern.
- In `DOCS/.algorithm/naked-pairs.md` and `DOCS/.algorithm/x-wing.md`:
  - Neither document currently explains that candidate sets are recomputed from the grid and not persisted across iterations. Readers and educators familiar with textbook Sudoku solving expect pencil marks to compound across techniques and iterations.
- In `DOCS/.design/sudoku-solver-platform-specification.md`:
  - Section 3 and Section 4 define techniques and deliberate extensions, but do not explicitly specify the transient candidate lifecycle boundary.

### 2. Currency and Parity Guard Baselines
- `.batch/check-ra-header-currency.ps1` tests `README.md`, `CLAUDE.md`, and execution inventory claims. Adding clarifying documentation in `DOCS/.algorithm/` and `DOCS/.design/` will not disturb regex-anchored claims.
- Parity checks: All 8 parity checks and 37 documentation currency negative controls pass cleanly.

---

## Proposed Changes

### 1. Algorithm Documentation Updates
- In `DOCS/.algorithm/naked-pairs.md`:
  Add a dedicated section:
  ```markdown
  ## Transient Candidate State & Elimination-to-Single Boundary

  In this proof-of-concept solver, candidate sets are **dynamically computed** from the physical working grid on each pass via `getCellCandidates(r, c)`. The solver maintains **no persistent candidate grid** (pencil-mark state) between algorithm steps or solving iterations.

  Consequently, candidate eliminations performed by Naked Pairs are **transient**:
  - Eliminations apply to a local candidate map constructed for the active unit.
  - An elimination takes permanent effect on the puzzle **if and only if** it immediately reduces a cell's candidate set to a single digit ($|\mathcal{C}(r, c)| = 1$), which triggers an immediate grid cell placement (`this.grid[r][c] = val`).
  - If a cell's candidates are reduced but remain ambiguous ($|\mathcal{C}(r, c)| > 1$), the elimination is discarded upon unit completion.
  - Reference: `app_src/SudokuSolver.ts` lines 294–314.

  Compounding pencil marks across multiple advanced techniques is a known educational simplification; persistent candidate tracking remains an architectural consideration for future iterations.
  ```

- In `DOCS/.algorithm/x-wing.md`:
  Add an equivalent clarifying section under `## Coverage and Limitations`:
  ```markdown
  ## Transient Candidate State & Elimination-to-Single Boundary

  Similar to Naked Pairs, the X-Wing implementation operates on a **transient candidate model**:
  - Candidates are freshly generated from the grid state on each invocation.
  - When an X-Wing pattern is detected, candidate deletions occur within a local execution map.
  - An elimination results in permanent puzzle progress **if and only if** the elimination leaves exactly one candidate ($|\mathcal{C}(r, c)| = 1$), immediately placing the value on the grid.
  - If empty cells remain with reduced but non-singleton candidate sets ($|\mathcal{C}(r, c)| > 1$), those eliminations are not preserved into subsequent iterations.
  - Reference: `app_src/SudokuSolver.ts` lines 383–395.
  ```

### 2. Platform Specification Update
- In `DOCS/.design/sudoku-solver-platform-specification.md`:
  Add a subsection under Section 3 (Core Solver Contract) or Section 4 (Deliberate Extensions):
  Clarify that while the solver implements Naked Pairs and X-Wing, candidate tracking is stateless and transient: only eliminations that reduce candidate cardinality to 1 result in immediate grid placement; persistent multi-pass pencil marking across techniques is an intentional non-requirement for the basic POC.

### 3. Changelog
- Record the documentation updates in `CHANGELOG.md` under `[Unreleased] > Changed`.

---

## Key Decisions for Owner Review

### Decision 1: Scope and phrasing of the transient candidate explanation
- **Recommendation:** Document the transient candidate state explicitly in `naked-pairs.md`, `x-wing.md`, and `sudoku-solver-platform-specification.md`, directly referencing the code mechanism (`app_src/SudokuSolver.ts` lines 294–314 and 383–395). Reiterate that persistent candidate state remains a future architectural idea, not an active defect or open item.
- **Alternative:** Implement a persistent candidate grid across solving iterations. *Rejected:* Out of scope for triage; would fundamentally alter solver architecture and state representation across all three Stacks, whereas pedagogical clarity is the requested outcome.

### Decision 2: Strictly docs-only change
- **Recommendation:** Keep TRIAGE-29 strictly documentation-only. No code, step definitions, or tests are modified.
- *Rationale:* Preserves cross-Stack execution stability while fully satisfying the acceptance criteria.

### Decision 3: No Decision Record required
- **Recommendation:** Confirm no Decision Record is required (tracked as `None expected` in `DOCS/.planning/backlog.md`), as this documents existing design intent and implementation behavior dating back to SUD-33.

### Decision 4: Delivery and verification protocol
- **Recommendation:** Execute in two standard stages:
  1. Implementation PR (`worklist/triage-29-document-transient-eliminations`): Update the three documentation files, add `CHANGELOG.md` entry, validate all 8 parity gates and 37 documentation currency controls, merge on all-green CI.
  2. Outcome PR (`worklist/triage-29-outcome`): Update backlog to `Resolved` (2 Open / 0 In Progress / 122 Resolved / 124 Total), mark plan status `delivered`, author implementation log, merge on all-green CI, and tick `- [x] TRIAGE-29` in root worklist.

---

## Implementation Phases

### Phase 1: Planning & Approval
1. Author implementation plan `DOCS/.implementation-plans/2026-11-10-triage-29-document-transient-eliminations.md` with status `draft`.
2. Add plan to `DOCS/.implementation-plans/_index.md`.
3. Commit draft plan and index to `worklist/triage-29-document-transient-eliminations`.
4. Submit plan and Decisions 1–4 for owner approval.

### Phase 2: Documentation Updates (Post-Approval)
1. Mark BACKLOG-099 as `In Progress` in `DOCS/.planning/backlog.md` (2 Open / 1 In Progress / 121 Resolved / 124 Total).
2. Update plan status to `approved`.
3. Add transient candidate state section to `DOCS/.algorithm/naked-pairs.md`.
4. Add transient candidate state section to `DOCS/.algorithm/x-wing.md`.
5. Add transient candidate state note to `DOCS/.design/sudoku-solver-platform-specification.md`.
6. Add entry to `CHANGELOG.md`.

### Phase 3: Validation & Parity Gates
1. Run `.batch/check-ra-header-currency.ps1`.
2. Run `.batch/run-parity-checks.ps1` (all 8 parity gates).
3. Verify markdown links and rendering.

### Phase 4: Implementation PR & CI
1. Commit changes to `worklist/triage-29-document-transient-eliminations`.
2. Push branch and open Implementation PR for BACKLOG-099 / TRIAGE-29.
3. Monitor CI checks to green and merge with `--match-head-commit`.

### Phase 5: Outcome PR & Worklist Closure
1. Fast-forward local `main`.
2. Cut `worklist/triage-29-outcome` branch.
3. Mark BACKLOG-099 as `Resolved` in `DOCS/.planning/backlog.md` (Summary: 2 Open / 0 In Progress / 122 Resolved / 124 Total).
4. Author implementation log `DOCS/.implementation-logs/2026-11-10_triage-29-document-transient-eliminations.md` and index.
5. Update implementation plan status to `delivered`.
6. Open Outcome PR, monitor CI to green, merge with `--match-head-commit`.
7. Update root `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with merge SHAs.

---

## Risk Analysis & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Inaccurate description of code behavior | Misleading documentation | Low | Verified directly against `app_src/SudokuSolver.ts` lines 294–314 and 383–395 prior to drafting. |
| Accidental breakage of documentation currency | Parity gate failure in `check-ra-header-currency.ps1` | Low | Ensure existing section headings and regex-tested claim strings in `sudoku-solver-platform-specification.md` remain untouched. |
| Inadvertent edits to code or step definitions | Test suite regression | Zero | Strictly documentation-only task; no code files touched. |

---

## Outcome and Delivery

- **Status:** Delivered
- **Implementation PR:** [#137](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/137)
- **Merge Commit:** `20cdf4d2625c2af8fc01021ff61a14b58da4c109` (`20cdf4d`, merged 2026-11-11T00:05:22Z)
- **CI Verification:** All 5 required CI jobs passed (Run: 42927867410). All 8 local parity gates and 37 documentation currency negative controls passed cleanly.
- **Implementation Log:** [`2026-11-11_triage-29-document-transient-eliminations.md`](../.implementation-logs/2026-11-11_triage-29-document-transient-eliminations.md)
