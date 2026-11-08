# Implementation Log: BACKLOG-086 / TRIAGE-18 DEMOAPP003 fixture anchoring and authoritative loader paths

**Date:** 2026-11-08T02:15:00Z
**Session goal:** Make the DEMOAPP003 Reqnroll suite load the same puzzle data in and out of the source tree, make an explicit `PuzzleLoader` path mean exactly that file, and stop `LoadPuzzles` from hiding loader errors.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-18 (Claude review v2 Risk 5 merged with Codex v3 S-03). The owner approved the [implementation plan](../.implementation-plans/2026-11-08-triage-18-csharp-fixture-path.md) "as recommended": explicit path authoritative with relative paths resolved from `AppContext.BaseDirectory` and no ancestor walk (A1); `puzzles.json` copied to the test output (B1); getters rethrow the loader error (C1); no DR; re-measure only the `demoapp003-component` inventory record; the TypeScript/Python masking as a new root candidate; the missing-file scenario recorded under TRIAGE-20; the main session merging on all-green.

**Scope that emerged:** Two documentation-currency control anchors had to follow the updated counts (see section 4).

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Rooted path as given; relative path resolved once from `AppContext.BaseDirectory`; no walk, no fallback file | Matches the TypeScript (`__dirname`) and Python (`__file__`) loaders and removes working-directory dependence | No (DR-035 validation boundary unchanged) |
| Linked `puzzles.json` copied to the Specs output; actor loads it from `AppContext.BaseDirectory` | The fixture travels with the assembly, so `--artifacts-path`, CI and Docker load the same data as an in-tree run | No |
| `LoadPuzzles` getters rethrow with `ExceptionDispatchInfo`; `GetError()` unchanged | The real `FileNotFoundException` reaches the scenario; error-asserting scenarios still read the captured error | No |
| Missing-path controls place a valid `puzzles.json` beside the working directory | Without a fallback file present, the old resolver would also have thrown, so the control would not prove anything | No |
| Two commits | The inventory's `sourceSha` must name a real commit, so it was measured at the code commit | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-08-triage-18-csharp-fixture-path.md` | Approved plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-08_triage-18-csharp-fixture-path.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs` | Authoritative path resolution; ancestor walk removed |
| `demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj` | Linked `puzzles.json` copied to output |
| `demo-apps/demoapp003-csharp-specflow/tests/screenplay/actors/SudokuActors.cs` | Actor loads the anchored path |
| `demo-apps/demoapp003-csharp-specflow/tests/screenplay/abilities/LoadPuzzles.cs` | Getters rethrow the loader error |
| `demo-apps/demoapp003-csharp-specflow/tests/component/PuzzleLoaderContractTests.cs` | Two missing-path controls (30 tests) |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` | `demoapp003-component` re-measured; dated note |
| `.batch/test-documentation-currency.ps1` | Two control anchors follow the new counts |
| `CLAUDE.md`, `README.md`, DEMOAPP003 `README.md`, `docs/README.md`, `docs/qa-strategy.md`, `docs/component-test-coverage-baseline.md`, `CHANGELOG.md` | Counts 30 / 85, path rule, dated coverage observation, Fixed entry |
| `DOCS/.planning/backlog.md`, `DOCS/.implementation-plans/_index.md`, `DOCS/.implementation-logs/README.md` | BACKLOG-086 recorded, then Resolved; plan and log indexed |

### Deleted
| File | Reason |
|------|--------|
| None | |

---

## 4. Bugs and Errors Encountered

### Documentation-currency controls lost their anchors
**Symptom:** After the counts moved to 30 / 85, `test-documentation-currency.ps1` (and `run-parity-checks.ps1`, which calls it) failed with "Expected one mutation anchor for C# guide execution count, found 0".
**Root cause:** Lines 135 and 138 use the literal count text as the `Before` anchor for their negative mutations.
**Fix:** Moved both `Before` strings to the new counts; the mutation targets are unchanged. 37/37 rejected.

### Earlier session interruptions
**Symptom:** A background component baseline run was lost when the session hit a usage limit.
**Root cause:** Background tasks do not survive a session restart.
**Fix:** Re-ran the baseline in the foreground after resuming; the reproduction artefacts in the scratchpad were intact.

---

## 5. Lessons Learned

- An ancestor search that "helps" a relative path find its file can make a suite pass for the wrong reason. Out-of-tree runs (`dotnet test --artifacts-path`) expose working-directory dependence cheaply.
- A test ability that swallows setup errors converts a clear root cause into misleading downstream failures. Staging the fix (rethrow first, then repair) proves the error is now visible.
- A must-fail control for a fallback must plant the fallback. Otherwise both the old and new code throw and the control proves nothing.
- Count claims guarded by mutation controls need their anchors moved in the same change.

---

## 6. Current State at End of Session

**Completed this session:**
- PR #108 (head `4c02078`) merged as `f1481eb60f629fc559b9f43bf29d0c3c17532a8b`.
- PR CI run 42436430723 passed all five required jobs: DEMOAPP003 components 30/30, Reqnroll 55/55, coverage 530/607 lines (87.31%) and 270/314 branches (85.99%).
- `main` push run 42436704351 at `f1481eb` passed all seven jobs, including Pages build and deploy (deployment 7630049775).

**Local evidence (.NET SDK 10.0.403, PowerShell 7.6.9):**
- Out of tree: 38/55 before; 38/55 with "Puzzle file not found" after the rethrow alone; 55/55 after the fix.
- Components: 28 passed and 2 failed against the old loader; 30/30 after.
- Parity checks, feature parity, step text, memory keys and RA/documentation currency PASS; documentation currency 37/37.

**Open:**
- Root worklist: TRIAGE-18 tick, a new LOW root candidate for the same error masking in the TypeScript and Python `LoadPuzzles` abilities (Decision 6), and a note under TRIAGE-20 naming the missing-file scenario's empty Given and self-created error (Decision 7).
- The next root worklist item is TRIAGE-19 (BACKLOG-087).
