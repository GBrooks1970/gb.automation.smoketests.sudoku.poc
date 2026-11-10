# Implementation Log: BACKLOG-094 / TRIAGE-23 Gate puzzles.json copy parity and correct the guide's Stack-tag and Add-a-Puzzle wording

**Date:** 2026-11-10T08:00:00Z
**Session goal:** Author `.batch/check-puzzles-parity.ps1` to assert byte-identical SHA256 copy parity across all three `puzzles.json` files with built-in negative controls (verifying rejection of single-copy mutations and missing files across all three Stacks), wire it into `.batch/run-parity-checks.ps1` as the 8th parity gate and into `.github/workflows/ci.yml`, update `CLAUDE.md` to cite all three puzzle copies in "Add a Puzzle" and retire obsolete `@stack-demoapp001` tag claims, remove the dead `stack-demoapp002` pytest marker in `demo-apps/demoapp002-python-pytest/pyproject.toml`, and record DR-050 in `decision-register.md` governing multi-Stack fixture parity and tagless canonical feature replication.
**Outcome:** Completed (PR #127 / `7711e57`)

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-23 (Claude review v2 Risk 7 part, LOW priority), tracked in the project backlog as BACKLOG-094. Under the owner-approved implementation plan (Decisions 1–4):
- Author `.batch/check-puzzles-parity.ps1` computing SHA256 across all three Stack copies (`demoapp001`, `demoapp002`, `demoapp003`), asserting hash equality, and running temp-directory negative controls proving that single-copy edits or missing files fail closed with exit code 1.
- Wire `.batch/check-puzzles-parity.ps1` into `.batch/run-parity-checks.ps1` (making 8 parity checks total) and `.github/workflows/ci.yml`.
- Update `CLAUDE.md`:
  - Line 206 to note puzzle data is replicated across all three Stacks in byte-identical copies.
  - "Canonical Feature Update Procedure" (lines 208–220) to specify propagating feature changes to all three Stacks and retire the `@stack-demoapp001` tag claim.
  - "Add a Puzzle" (lines 298–304) to instruct editing all three copies, running `.batch/check-puzzles-parity.ps1`, and running test suites across all Stacks.
- Remove the unused `stack-demoapp002` marker from `demo-apps/demoapp002-python-pytest/pyproject.toml`.
- Author DR-050 in `decision-register.md`, annotate DR-007, DR-008, DR-026, and DR-028, and advance `CLAUDE.md` accepted range to DR-001 through DR-050.
- Verify with documentation currency controls and all 8 parity gates.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Built-in negative controls in `.batch/check-puzzles-parity.ps1` | Proves that the parity check fails closed on single-copy drift or missing files across each of the three Stacks (6/6 controls rejected) in an isolated temporary directory without touching tracked files | DR-050 |
| Update `CLAUDE.md` to reflect three-Stack architecture | Prevents contributor confusion and silent puzzle desynchronisation by directing additions to all three copies and clarifying that feature files are byte-identical without Stack tags | DR-050 |
| Retire unused `stack-demoapp002` marker | Cleans up dead pytest configuration that falsely implied Stack-local feature tags exist | DR-050 |
| Author DR-050 in `decision-register.md` | Formally supersedes the early `@stack-demoapp001` tag requirement (DR-007) and reconciles the single-Stack test data assumptions (DR-026, DR-028) under active three-Stack architecture | DR-050 accepted |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `.batch/check-puzzles-parity.ps1` | Parity gate asserting byte-identical SHA256 across all three `puzzles.json` copies with 6 negative controls |
| `DOCS/.implementation-plans/2026-11-10-triage-23-puzzles-parity-guide-cleanup.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-10_triage-23-puzzles-parity-guide-cleanup.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.batch/run-parity-checks.ps1` | Wired `.batch/check-puzzles-parity.ps1` as the 8th repository parity gate |
| `.github/workflows/ci.yml` | Added `Puzzles fixture parity` step to DEMOAPP001 job |
| `CLAUDE.md` | Updated puzzle locations, "Add a Puzzle" instructions, feature update procedure, and accepted range to DR-050 |
| `demo-apps/demoapp002-python-pytest/pyproject.toml` | Removed unused `stack-demoapp002` marker |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` | Refreshed `demoapp002-component` source hash for `pyproject.toml` |
| `decision-register.md` | Recorded DR-050, annotated DR-007, DR-008, DR-026, and DR-028, updated footer to Next ID: DR-051 |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-094 as Resolved (counts: 7 Open / 0 In Progress / 117 Resolved / 124 Total) |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-094 delivery outcome |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

---

## 4. Bugs and Errors Encountered

- **Component inventory source hash drift:** Modifying `pyproject.toml` altered its portable source hash, causing `check-ra-header-currency.ps1` to detect source drift for `demoapp002-component`. Refreshed the recorded SHA256 in `DOCS/.analysis/2026-10-07-component-execution-inventory.json` with a dated description note, restoring all documentation currency checks to clean PASS.

---

## 5. Lessons Learned

- Coupling positive parity assertions with automated negative controls in scratch directories ensures verification scripts genuinely fail closed without requiring manual mutation testing.
- Configuration files included in execution inventory scopes (`pyproject.toml`, `package.json`, etc.) require corresponding inventory hash updates whenever edited.
