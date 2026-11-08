---
version: 1
created: 2026-11-08T01:45Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-086 / TRIAGE-18
status: implemented
approved: 2026-11-08 by GBrooks1970, "Approved both as recommended"; every recommended option, main session merges only when every check is green
delivered: PR #108, merge commit f1481eb60f629fc559b9f43bf29d0c3c17532a8b
language: en-GB
---

# Implementation plan: BACKLOG-086 / TRIAGE-18 anchor DEMOAPP003 fixture data, make explicit paths authoritative and surface loader errors

**Goal.** Make the DEMOAPP003 (C#) Reqnroll suite find its puzzle data wherever the build output
lives, make an explicit loader path mean exactly that file, and stop the `LoadPuzzles` ability from
hiding loader failures behind empty results. Today the suite passes 55/55 only because the test
process starts inside the source tree: an out-of-tree build loses 17 of 55 scenarios, and the
failures read "Puzzle not found" rather than the real "Puzzle file not found". Source: Claude review
v2 Risk 5 merged with Codex v3 S-03, triaged as TRIAGE-18 (MEDIUM), recorded as BACKLOG-086.

## Evidence gathered before planning

Read and reproduced on 2026-11-08 in this plan's worktree at `bf04586` (equal to `origin/main`; no
open PRs). Build output went to the ignored `bin/`/`obj/` folders and to
`scratchpad/t18-artifacts/`; no tracked file was changed apart from this plan and its `_index.md`
row. Runtime: .NET SDK 10.0.403.

| Finding | Consequence for the plan |
|---|---|
| `app_src/PuzzleLoader.cs` lines 41-63 (`ResolvePuzzlePath`): a rooted path is returned only if it exists. Otherwise the candidates are the path against the current directory, the path against `AppContext.BaseDirectory`, then for every ancestor of the current directory both `<ancestor>/<filePath>` **and** `<ancestor>/puzzles.json`. The first existing candidate wins. | An explicit path is not authoritative. A missing `C:\x\missing.json` or `missing.json` silently loads any `puzzles.json` found in the current directory or above it, with no error. This is the core defect. |
| `tests/screenplay/actors/SudokuActors.cs` line 11: every actor is built with `LoadPuzzles.From("puzzles.json")`, a bare relative name. | The suite's data source depends on the test process's working directory. In-tree, `dotnet test` runs from `tests/bin/Debug/net10.0`, and the ancestor walk reaches `demo-apps/demoapp003-csharp-specflow/puzzles.json`. Out of tree, it finds nothing. |
| `tests/screenplay/abilities/LoadPuzzles.cs` lines 11-21: the constructor catches every exception into `_error`. The getters (lines 25-34) then return `[]`, `null` or `0`; only `GetError()` reports the failure. | A loader failure surfaces later as an unrelated error (`Puzzle not found: "Easy Scan Grid"`) or a wrong count, not as the real `FileNotFoundException`. |
| **Reproduction, in tree:** `dotnet test tests/DemoApp003.Specs.csproj` gives `Passed! - Failed: 0, Passed: 55`. `dotnet test tests/component/DemoApp003.ComponentTests.csproj` gives `Passed! - Failed: 0, Passed: 28`. | Baseline for "no regression". |
| **Reproduction, out of tree:** `dotnet test tests/DemoApp003.Specs.csproj --artifacts-path <scratch>/t18-artifacts --logger "trx;LogFileName=before.trx"` gives `Failed! - Failed: 17, Passed: 38, Total: 55` (dotnet exit 1). The failure messages are 12 `InvalidOperationException : Puzzle not found: "<name>"` (Easy Scan Grid 7, Logic Squeeze Grid 2, Minimal Clues 1, Crosshatch Challenge 1, Empty Grid 1) and 5 assertion failures on empty results (current solver name 2, multiple-solver count 2, loaded puzzle count 1). The 17 failing scenarios are the five puzzle-solving scenarios, the three audit-trail scenarios, the four loader query/load scenarios, technique ordering, multiple iterations, advanced-technique detection, concurrent solvers and grid preservation. | This matches the review's 38/55 exactly and is the must-fail baseline. None of the failures names the real cause. |
| The puzzles file is not copied to any build output; `tests/DemoApp003.Specs.csproj` has no `None`/`Content` item for it. | The anchored path needs the file next to the test assembly (or a compile-time source path). |
| DEMOAPP001 `app_src/PuzzleLoader.ts` line 34: `path.resolve(__dirname, filePath)`, then `throw new Error("Puzzle file not found: ...")` if missing. DEMOAPP002 `app_src/puzzle_loader.py` lines 20-27: a relative path is resolved against the loader's own directory (`Path(__file__)`), then `FileNotFoundError` if missing. Both test actors pass an absolute, source-anchored path (`SudokuActors.ts` line 7; `support/actors.py` `PUZZLES_PATH`). | TypeScript and Python already treat an explicit path as authoritative, anchor relative paths to the loader rather than the working directory, and have no ancestor walk or fallback file name. The C# fix brings DEMOAPP003 into line; it is not a new cross-Stack contract. |
| The TypeScript and Python `LoadPuzzles` abilities also catch the loader error and return empty results from their getters. | The same masking pattern exists in the other Stacks, but their paths are anchored, so it does not bite there. It is not in this item's acceptance and is not folded in (see Decision 6). |
| Other `PuzzleLoader` callers: `tests/component/PuzzleLoaderContractTests.cs` (absolute temp files, plus `RejectsMissingPuzzleFile` with a relative missing name from an isolated temp working directory) and `tooling/performance/Program.cs` lines 16 and 24 (absolute path from `FindStackFile`). No production caller relies on the default argument or the ancestor walk. | Removing the walk breaks no caller. The existing missing-file test passes today only because no `puzzles.json` sits above `%TEMP%`. |
| DR-035 (decision register line 1832) fixes the **validation** boundary: loaders do structure validation only (9x9 shape, integer range), fail fast, worded identically across Stacks; strict duplicate validation is deferred. `DOCS/.architecture/validation-boundaries.md` row "Puzzle loader" restates it. Neither says anything about how a path is resolved. | Path resolution and error surfacing are outside the DR-035 boundary, so the acceptance's condition "record DR-049 first if the change alters a DR-035 validation boundary" is not met. No DR is needed (Decision 4). DR-049 stays the next free id. |
| The feature's "Handle missing puzzle file gracefully" scenario uses an empty `Given the puzzles.json file does not exist` binding, and `SimulateError.ForMissingFile()` (`tasks/Tasks.cs` line 481) creates a `FileNotFoundException("Puzzle file not found")` itself when `GetError()` is null. In tree, the loader succeeds, so the scenario asserts against an error it created itself. | Adjacent: the scenario never loads a missing file. It is a no-op/tautological binding of the kind TRIAGE-20 (BACKLOG-089) inventories, so it is recorded there, not fixed here (Decision 7). |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` records `demoapp003-component` as 28 tests with LF-normalised SHA-256 fingerprints of every file in `tests/component/`. `check-ra-header-currency.ps1` fails on any fingerprint drift. Active count claims: `CLAUDE.md` line 155 ("28 component tests plus 55 Reqnroll tests (83 total)"), root `README.md` line 232, and the DEMOAPP003 `docs/qa-strategy.md` and `docs/README.md`. | Adding component controls means re-measuring the DEMOAPP003 component record and updating the active "28" claims in the same change (Decision 5). |
| `docs/component-test-coverage-baseline.md` line 49 records `PuzzleLoader` at 64/65 lines (98.46%) and 29/32 branches (90.63%). The CI floor is 80% lines and 80% branches over the component run. | Removing the walk removes branches; the floor cannot be put at risk by this change. The baseline row is refreshed with measured values. |

## Design options

**A. Loader path resolution (`PuzzleLoader.ResolvePuzzlePath`).**

- **A1 (recommended): explicit path is authoritative, no walk.** A rooted path is used as given. A
  relative path is resolved once against `AppContext.BaseDirectory`, the location of the running
  assembly. This mirrors TypeScript (`__dirname`) and Python (`__file__`), which anchor to the
  loader rather than the working directory. If the resolved file does not exist, throw
  `FileNotFoundException("Puzzle file not found: <resolved path>")`. The default argument
  `"puzzles.json"` follows the same rule. There is no fallback file name and no ancestor walk.
- **A2: relative to the current directory, no walk.** The usual .NET convention, but it keeps the
  working-directory dependence that caused this defect, and differs from the other two Stacks.
- **A3: keep the ancestor walk for the default (no-argument) case only.** An explicit path becomes
  authoritative, but a default-constructed loader still searches upward. No caller uses the
  default today, so the walk would be untested convenience code that could again pick up the wrong
  file.
- **A4: bound the walk** (for example three levels, `filePath` only, no `puzzles.json` fallback).
  Smaller change, but still working-directory dependent and still not authoritative for a relative
  path.

**B. Anchoring the test actor (`SudokuActors.cs` line 11).**

- **B1 (recommended): copy to output and resolve from `AppContext.BaseDirectory`.** Add to
  `tests/DemoApp003.Specs.csproj`
  `<None Include="..\puzzles.json" Link="puzzles.json" CopyToOutputDirectory="PreserveNewest" />`
  (a link, so there is still one source file), and build the actor with
  `LoadPuzzles.From(Path.Combine(AppContext.BaseDirectory, "puzzles.json"))`. This works in tree, out
  of tree, with `--artifacts-path` and in the Docker image, because the file always travels with the
  assembly.
- **B2: `[CallerFilePath]`.** Resolves to the source file's directory at compile time. It needs no
  build change, but the absolute path is baked into the binary, so it breaks when binaries move to
  another machine or container without the source tree.

**C. Error surfacing (`LoadPuzzles.cs`).**

- **C1 (recommended): rethrow the captured error from every getter.** If `_error` is set, `GetAll`,
  `GetByName`, `GetByDifficulty`, `GetByIndex` and `GetCount` call
  `ExceptionDispatchInfo.Capture(_error).Throw()`, so the original `FileNotFoundException` or
  `InvalidDataException` surfaces with its message and stack. `GetError()` keeps returning the error
  without throwing, so the scenarios that assert on a loader error (`LAST_ERROR`, boolean-cell and
  missing-file paths) are unchanged.
- **C2: wrap in `InvalidOperationException("LoadPuzzles failed: ...", inner)`.** Clearer framing,
  but it changes the surfaced type and message and adds a layer readers must unwrap.

## Decision record

**Recommendation: no DR.** DR-035 governs what a loader validates, not how it finds its file.
A1 to C1 change no validation rule, no cross-Stack contract and no Screenplay or Memory shape. They
make the C# loader match the TypeScript and Python loaders' existing behaviour. The acceptance
requires DR-049 only if a DR-035 boundary changes, and none does.

If the owner prefers a record anyway (Decision 4, option b), the draft is:

> **DR-049: Puzzle loaders treat an explicit path as authoritative**
>
> **Date:** 2026-11-08. **Status:** Proposed.
>
> **Context:** BACKLOG-086 / TRIAGE-18 found that the DEMOAPP003 `PuzzleLoader` searched the
> working directory and its ancestors for the requested file, and then for any `puzzles.json`, so a
> missing explicit path silently loaded other data. Its Reqnroll suite passed only when run inside
> the source tree (55/55 in tree, 38/55 out of tree). DEMOAPP001 and DEMOAPP002 already resolve
> relative paths against the loader's own location and fail when the file is missing.
>
> **Decision:** In every Stack, a loader given an explicit path loads exactly that file. A relative
> path is resolved once against the loader's own location (`__dirname`, `__file__`,
> `AppContext.BaseDirectory`). A missing file raises the Stack's file-not-found error with the
> message "Puzzle file not found". No loader searches ancestor directories or substitutes another
> file name. Test actors pass an absolute, build-anchored path. DR-035's validation boundary is
> unchanged.
>
> **Consequences:** Out-of-tree and container runs load the same data as in-tree runs. A wrong path
> fails at once with the real cause. The DEMOAPP003 test project copies `puzzles.json` to its
> output.
>
> **Alternatives considered:** working-directory resolution (A2); keeping the walk for the
> default case (A3); a bounded walk (A4); `[CallerFilePath]` anchoring (B2).

## Steps

All work happens in this worktree on branch `worklist/triage-18-csharp-fixture-path`, cut from
`origin/main` `bf04586`, because other sessions share the checkout. Steps assume the recommended
options.

1. **Record the item.** In `DOCS/.planning/backlog.md` set BACKLOG-086 to `In Progress`, adding a
   detail entry with the worklist acceptance criteria, the Verification checks and the plan link. Summary: 13 Open /
   1 In Progress / 108 Resolved / 122 Total. Update the header lines.
2. **File the plan.** This file, with status set to `approved` and the owner's words, plus its
   `_index.md` row.
3. **Must-fail component controls first** (`tests/component/PuzzleLoaderContractTests.cs`, both
   `[NonParallelizable]`, each in an isolated temp working directory that contains a valid
   `puzzles.json` fallback):
   - `MissingAbsolutePathDoesNotLoadFallbackData`: `new PuzzleLoader(<temp>/missing-<guid>.json)`
     must throw `FileNotFoundException` with "Puzzle file not found";
   - `MissingRelativePathDoesNotLoadFallbackData`: `new PuzzleLoader("missing-<guid>.json")` must
     throw the same.

   Run the component project against the **unchanged** loader and record that both new tests fail
   (no exception, because the old resolver loads the fallback `puzzles.json`): 28 passed, 2 failed.
4. **Surface loader errors (C1).** Change `LoadPuzzles.cs` so that every getter rethrows the
   captured error with `ExceptionDispatchInfo`; `GetError()` is unchanged. Re-run the out-of-tree
   Reqnroll command. Expected: still 38/55, but the failures now report
   `FileNotFoundException : Puzzle file not found: ...` instead of "Puzzle not found" or an
   empty-result assertion. This proves the error now surfaces; any failure that still shows a
   different message is listed in the Outcome.
5. **Make explicit paths authoritative (A1).** Rewrite `ResolvePuzzlePath` as: rooted, used as
   given; otherwise `Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, filePath))`. Delete the
   candidate list and ancestor walk. The constructor's existing existence check and message stay as
   they are.
6. **Anchor the actor (B1).** Add the linked `puzzles.json` `None` item with
   `CopyToOutputDirectory="PreserveNewest"` to `tests/DemoApp003.Specs.csproj`. Change
   `SudokuActors.cs` line 11 to
   `LoadPuzzles.From(Path.Combine(AppContext.BaseDirectory, "puzzles.json"))`. Confirm with
   `dotnet restore --locked-mode` that the lock file is unchanged.
7. **Re-measure the inventory record.** Run the governed DEMOAPP003 component command from the
   inventory (`dotnet test tests/component/DemoApp003.ComponentTests.csproj --no-restore --logger
   "trx;LogFileName=component.trx" --results-directory $REPOSITORY_ROOT/.results/triage-18/<date>/csharp`).
   Update only the `demoapp003-component` suite record in
   `DOCS/.analysis/2026-10-07-component-execution-inventory.json`: tests 30, runtime, `sourceSha`,
   UTC timings, output hash and sorted source fingerprints. Add a dated note that only this suite
   was re-measured. Update the active "28" claims to 30 (`CLAUDE.md` line 155, now "30 component
   tests plus 55 Reqnroll tests (85 total)"; root `README.md` line 232; DEMOAPP003
   `docs/qa-strategy.md` and `docs/README.md`).
8. **Docs.** Refresh the `PuzzleLoader` row in `docs/component-test-coverage-baseline.md` from the
   measured coverage run. Add one sentence to the DEMOAPP003 `README.md` loader section: an explicit
   path is authoritative, a relative path resolves against the assembly directory, and there is no
   directory search. Add a CHANGELOG `[Unreleased]` `### Fixed` entry.
9. **Local gates** (listed under Verification), recorded with output.
10. **Publish.** Commit
    `fix(TRIAGE-18): anchor DEMOAPP003 fixture data and make explicit loader paths authoritative`,
    with a body naming BACKLOG-086 and the reason. Push, setting the upstream to the new remote
    branch, and open one PR.

## Verification

- **Must-fail, Reqnroll out of tree:** before any change, 38/55 (17 failed, "Puzzle not found"), as
  recorded above. After step 4, still 38/55 but with `Puzzle file not found` messages. After steps
  5 and 6, `dotnet test tests/DemoApp003.Specs.csproj --artifacts-path <fresh scratch>` gives 55/55.
- **Must-fail, missing-path controls:** after step 3, 2 of 30 component tests fail against the
  unchanged loader. After step 5, 30/30 pass. Both prove a missing absolute and a missing relative
  path throw `FileNotFoundException` without loading the fallback data.
- **No regression in tree:** Reqnroll 55/55 in tree. The missing-file, boolean-cell, grid-dimension
  and grid-value scenarios still pass.
- **Component coverage floor:** the CI command (`--collect:"XPlat Code Coverage" --settings
  tests/component/coverage.runsettings`, then `Write-CoverageSummary.ps1 -MinimumLinePercent 80
  -MinimumBranchPercent 80`) passes.
- **Parity and governance:** `run-parity-checks.ps1`, `generate-feature-parity-report.ps1`,
  `check-step-text-parity.ps1`, `check-memory-key-parity.ps1`, `check-ra-header-currency.ps1`
  (including the re-measured inventory) and `test-documentation-currency.ps1` (37/37) all pass. No
  feature or step text changes, so 55 scenarios / 309 steps per Stack stay in parity.
- **Then-assertion mutation controls** for DEMOAPP003 run in CI only. This worktree is isolated, but
  TRIAGE-24 has not landed, so the script is not run locally.
- **Docker** (optional, if the owner wants it): `docker compose run --rm demoapp003-tests` proves
  the copy-to-output path in the container (storage on `E:\_DockerData`). CI covers Linux
  out-of-source-tree behaviour regardless.
- **PR CI:** all five PR jobs pass (three Stack jobs, parity, `Gate (all stacks green)`). After
  merge, the `main` push run passes all seven jobs, including Pages build and deploy.

## Delivery

- **Project PR:** one PR from `worklist/triage-18-csharp-fixture-path`. The main session merges it
  only when every check is green. The worktree and branch are then removed. The shared checkout is
  never switched off `main`.
- **Outcome follow-up PR:** append the Outcome here, set status to `implemented`, fill `delivered`,
  update the `_index.md` row, set BACKLOG-086 to `Resolved` with evidence (Summary
  13 Open / 0 In Progress / 109 Resolved / 122 Total), and add
  `DOCS/.implementation-logs/<date>_triage-18-csharp-fixture-path.md`, indexed in that folder's
  `README.md`.
- **Portfolio root:** tick TRIAGE-18 in `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with the
  merge commit, from an isolated root worktree in a separate root PR. Under Decision 7, add a note
  under TRIAGE-20 naming the missing-file scenario's empty Given and self-created error.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| 1. Loader path resolution | A1 explicit authoritative, relative to `AppContext.BaseDirectory`, no walk; A2 relative to the working directory, no walk; A3 keep the walk for the default case only; A4 bounded walk | A1: matches TypeScript and Python, removes working-directory dependence, and no caller uses the default or the walk | A1, as recommended, 2026-11-08 |
| 2. Test actor anchoring | B1 linked copy-to-output plus `AppContext.BaseDirectory`; B2 `[CallerFilePath]` | B1: travels with the assembly, so it works out of tree and in containers | B1, as recommended, 2026-11-08 |
| 3. Error surfacing in `LoadPuzzles` | C1 rethrow the original error from getters with `ExceptionDispatchInfo`; C2 wrap in `InvalidOperationException` | C1: the real type and message reach the scenario failure; `GetError()` is unchanged | C1, as recommended, 2026-11-08 |
| 4. Decision record | (a) no DR; (b) DR-049 as drafted above | (a): DR-035's validation boundary is unchanged and the other Stacks already behave this way | (a) no DR, as recommended, 2026-11-08 |
| 5. Inventory refresh | (a) re-measure only the `demoapp003-component` record in the existing inventory file, with a dated note; (b) re-run all four native suites and re-record the whole file | (a): only DEMOAPP003 sources change, the guard checks each suite separately, and a local DEMOAPP002 run stalls on this machine | (a), as recommended, 2026-11-08 |
| 6. Same masking in the TypeScript and Python abilities | (a) out of scope, recorded as a new root worklist candidate; (b) fold into this item | (a): not in the acceptance, and their anchored paths keep it latent | (a), as recommended, 2026-11-08 |
| 7. Missing-file scenario's empty Given and self-created error | (a) record it under TRIAGE-20 (BACKLOG-089) as a named binding for its disposition inventory; (b) fix it here | (a): it is a no-op binding, which is TRIAGE-20's scope, and fixing it here would widen this item | (a), as recommended, 2026-11-08 |
| 8. Merge authority | Main session merges on all-green; or the owner merges | Main session merges on all-green, as for TRIAGE-16 and TRIAGE-17 | Main session merges on all-green, as recommended, 2026-11-08 |

## Outcome

Delivered in [PR #108](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/108),
head `4c02078`, merged as `f1481eb` on 2026-11-08T02:01:03Z, with every recommended option.

- **Must-fail, Reqnroll out of tree:** unchanged code 38/55 (17 failed: 12
  `Puzzle not found: "<name>"`, 5 empty-result assertions). After the `LoadPuzzles` rethrow alone,
  38/55 with all 17 failures reading `FileNotFoundException : Puzzle file not found`. After the
  loader fix and anchoring, on a fresh `--artifacts-path`, 55/55, with `puzzles.json` in the
  artifacts output.
- **Must-fail, component controls:** against the unchanged loader, 28 passed and 2 failed
  (`MissingAbsolutePathDoesNotLoadFallbackData`, `MissingRelativePathDoesNotLoadFallbackData`:
  "Expected: <FileNotFoundException> ... But was: no exception thrown"). After the fix, 30/30.
- **Local gates:** Reqnroll 55/55 in tree; `dotnet restore --locked-mode` left the lock files
  unchanged; component coverage 530/607 lines (87.31%) and 270/314 branches (85.99%), floors 80/80
  satisfied, with `PuzzleLoader` at 49/50 lines and 24/26 branches; `run-parity-checks.ps1`,
  feature parity, step text (217 lines x3), memory keys and RA/documentation currency PASS;
  documentation currency 37/37. The Then-assertion mutation controls ran in CI only.
- **Inventory:** the `demoapp003-component` record was re-measured at `029fb43`: 30/30 on
  .NET SDK 10.0.403, started 2026-11-08T01:50:32.8517399Z, command 5289 ms, runner 271 ms, with new
  output hashes and the new `PuzzleLoaderContractTests.cs` fingerprint. The other three suites are
  unchanged.
- **PR CI:** run 42436430723 at `4c02078` passed all five required jobs, with DEMOAPP003
  components 30/30, Reqnroll 55/55 and coverage 87.31% / 85.99%.
- **Exact merge:** `main` push run 42436704351 at `f1481eb` passed all seven jobs, including Pages
  build and deploy (deployment 7630049775).

**Differences from the plan.**

1. Two commits instead of one. The inventory's `sourceSha` must be a real commit, so the code was
   committed first (`029fb43`), the governed component command was measured at that commit, and the
   inventory and docs followed as `4c02078`. No history was rewritten.
2. Two `test-documentation-currency.ps1` control anchors changed. Lines 135 and 138 quote the counts
   as mutation anchors ("Expected output: 83 tests ..." and "| Focused component tests | 28 |"). After
   the count update they failed with "Expected one mutation anchor ... found 0", so their `Before`
   strings moved to 85 and 30. The mutation targets are unchanged and the run is 37/37.
3. The coverage baseline row was not rewritten. The `PuzzleLoader` row in
   `docs/component-test-coverage-baseline.md` is the dated SUD-26 baseline of 24 tests, so it was kept,
   and a dated "Later observation (2026-11-08)" paragraph plus an inventory-table note were added.
4. The coverage run wrote to the scratchpad rather than `.results/component-coverage`; the governed
   inventory run wrote to the ignored `.results/triage-18/20261108/` in the worktree.

Record: [implementation log](../.implementation-logs/2026-11-08_triage-18-csharp-fixture-path.md).
