# Implementation Log: BACKLOG-088 / TRIAGE-24 run Then-assertion mutation controls on a temporary copy

**Date:** 2026-11-09T15:10:00Z
**Session goal:** Isolate `.batch/test-then-assertion-mutations.ps1` runs in a GUID temporary workspace so tracked repository feature files are never written and cannot be stranded corrupted.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-24 (Claude review v2 Risk 9). The owner approved the [implementation plan](../.implementation-plans/2026-11-08-triage-24-then-mutation-controls.md) across all 9 decisions: copy the target Stack to a GUID temporary workspace under `%TEMP%` (`sudoku-then-mutations-<stack>-<guid>`), link `node_modules` via junction in DEMOAPP001, restore with locked mode in DEMOAPP003, mutate only the temporary copy's feature file, prove canonical and Stack tracked feature files untouched via SHA-256 checks before and after (`TrackedFeaturesUnchanged = true`), sweep stale temporary workspaces older than 24 hours at startup, and no DR.

**Scope that emerged:** In DEMOAPP003, Reqnroll regenerates code-behind from the feature file at test build time; running `dotnet test tests/DemoApp003.Specs.csproj --no-restore ...` from the copied Stack root compiled the mutated feature and failed the assertion as expected without modifying any source tree files.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Copy entire Stack directory to GUID temp root | Unified isolation mechanism across all three Stacks; avoids runner-specific config hacking | No |
| Stop mutating canonical `features-shared/` | Nothing in any Stack reads `features-shared/` at run time; mutating it provides no extra assurance and risks repo pollution | No |
| Junction `node_modules` in DEMOAPP001 | Avoids copying ~400 packages or slow `npm ci`; junction unlinked prior to recursive workspace deletion | No |
| locked-mode restore in DEMOAPP003 copy | Enables out-of-source compilation of regenerated feature code-behind | No |
| Guarded cleanup and 24h startup sweep | Prevents unbounded growth of stranded temp folders while tolerating briefly locked folders | No |
| Retain summary keys and add 2 fields | Uploaded artifacts stay backwards-compatible while exposing `TrackedFeaturesUnchanged` and `WorkspaceRoot` | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-08-triage-24-then-mutation-controls.md` | Approved implementation plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-09_triage-24-then-mutation-controls.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.batch/test-then-assertion-mutations.ps1` | Creates isolated Stack copy in temp root, links dependencies, mutates copy only, asserts tracked features untouched, sweeps stale roots |
| `CHANGELOG.md` | Added Changed entry under [Unreleased] |
| `DOCS/.analysis/2026-10-07-backlog-078-then-assertion-inventory.md` | Appended dated addendum recording isolated copy mechanics |
| `DOCS/.planning/backlog.md` | BACKLOG-088 marked In Progress, then Resolved; counts updated |
| `DOCS/.implementation-plans/_index.md` | Registered plan and recorded delivery |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

### Deleted
| File | Reason |
|------|--------|
| None | |

---

## 4. Bugs and Errors Encountered

### Premature kill during must-fail baseline
**Symptom:** Initial probe killed the process at 3.5s, before positive controls finished (positive controls take ~13-28s on DEMOAPP001), so the mutation had not yet been written.
**Root cause:** Underestimated test startup and execution duration.
**Fix:** Added file-content polling in the test harness to wait until `tests/features/BasicSudokuSolverLogic.feature` contained the mutated expectation before issuing `Stop-Process -Force`. This confirmed that unpatched runs permanently stranded mutated files.

---

## 5. Lessons Learned

- Always poll the target condition (e.g. file content change) rather than relying on arbitrary sleep intervals when demonstrating failure modes.
- Reqnroll in .NET 10 seamlessly regenerates code-behind when feature files change in a copied workspace with `dotnet restore --locked-mode`.
