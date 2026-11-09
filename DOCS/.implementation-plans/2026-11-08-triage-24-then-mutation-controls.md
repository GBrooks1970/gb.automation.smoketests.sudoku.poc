---
version: 1
created: 2026-11-08T10:45Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-088 / TRIAGE-24
status: delivered
approved: 2026-11-09 (owner, as recommended across all 9 decisions)
delivered: 2026-11-09 in PR #112 / 811fb79
language: en-GB
---

# Implementation plan: BACKLOG-088 / TRIAGE-24 run the Then-assertion mutation controls on a temporary copy

**Goal.** Make `.batch/test-then-assertion-mutations.ps1` plant its 22 wrong expectations in a
GUID-named temporary copy of the Stack, so no run (finished, failed or killed) can leave a mutated
tracked feature in a checkout. The control must keep proving the same thing: 15 positive scenarios
pass and 22 planted mutations are killed per Stack. Source: Claude review v2 Risk 9 (LOW, pulled
forward by the owner because TRIAGE-20 and TRIAGE-15 add mutation controls), triaged as TRIAGE-24
and recorded as BACKLOG-088.

## Evidence gathered before planning

Read and probed on 2026-11-08 in this plan's worktree at `1f2c4ac` (equal to `origin/main`), under
Node 24.18.0 and PowerShell 7.6.9 after `npm ci` in DEMOAPP001. The probes ran against GUID temporary
directories under `%TEMP%`, were cleaned up, and left every tracked feature byte-identical. No tracked
file was changed apart from this plan and its `_index.md` row.

| Finding | Consequence for the plan |
|---|---|
| `.batch/test-then-assertion-mutations.ps1` lines 23-26 read the canonical feature (`features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`) and the Stack feature (`tests/features/BasicSudokuSolverLogic.feature`). Lines 160-165 write each mutation into **both real files**. Lines 169-180 restore them in `finally` and compare SHA-256. | A hard kill (closed terminal, `Stop-Process`, power loss) skips `finally` and leaves tracked features mutated. Other sessions share this checkout, so this is the review's Risk 9. |
| Scope: 22 mutations over 15 distinct scenarios (lines 32-70): unit completion (row, column, block), Hidden Singles (row, column, block, negative row), Naked Singles (single, multiple), Naked Pairs (row, column, block), X-Wing (rows, columns), and the easy end-to-end solve. Each mutation edits one Then (or Examples cell feeding a Then) in the feature text. The same 22 run in all three Stacks. | The set of Then steps and mutations is unchanged by this item; only where the mutated text lives changes. TRIAGE-20 and TRIAGE-15 will add controls later. |
| Runners (lines 86-97): DEMOAPP001 `npx cucumber-js --config tooling/cucumber.js --name ...` from the Stack root (config `paths: ['tests/features/**/*.feature']`); DEMOAPP002 `python -m pytest tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py -k ...` (the test module binds `scenarios("../../features/BasicSudokuSolverLogic.feature")`, and `pyproject.toml` sets `pythonpath = ["."]`); DEMOAPP003 `dotnet test tests/DemoApp003.Specs.csproj --no-restore --filter ...` (Reqnroll generates code-behind from the feature at build time). | Each runner reads the feature relative to the Stack root, so running from a copied Stack root picks up the copied, mutated feature with no runner change. |
| No test, step definition or config in any Stack reads `features-shared/` (grep over `.ts`, `.py`, `.cs`, `.js`, `.json`, `.csproj`, `.toml`). | Mutating the canonical feature is not needed to exercise the bound assertion. It only kept the canonical/Stack pair in step while the files were being edited in place. |
| **Probe 1, temporary copy (DEMOAPP001):** the Stack copied to `%TEMP%\sudoku-then-mutations-probe-<guid>\demoapp001` without `node_modules` (linked to the worktree's `node_modules` by a junction). The positive `Complete a row with only one missing value` run gave exit 0, `1 scenario (1 passed)`. With mutation `unit-missing-digit` planted in the **copy only**, it gave exit 1, `AssertionError [ERR_ASSERTION]: Expected newly placed 4 at [0,2]`, `1 scenario (1 failed)`. The four tracked feature hashes (canonical plus three Stacks) were identical before and after. | A copied Stack root catches a mutated assertion exactly as the in-place run does. |
| **Probe 2, killed mid-run:** same copy; the mutated cucumber run was started as a child and killed with `Stop-Process -Force` after 4 s. Tracked feature hashes were still identical; the copy's feature stayed mutated. The first cleanup attempt failed ("being used by another process") because a grandchild process briefly held the directory; a retry succeeded. | With the copy, a hard kill can only strand a temporary directory, never a tracked file. Stale roots need a guarded sweep that tolerates in-use directories. |
| **Probe 3, runner redirection instead of copying (DEMOAPP001):** passing a temporary feature path on the cucumber command line **added** to the config's `paths` rather than replacing it: the JSON result listed two features (the tracked one and the temporary one) and two scenarios. | Redirecting the runner needs a generated config per run for DEMOAPP001 and cannot work for DEMOAPP003 (code-behind generation), so a uniform Stack copy is simpler (Decision 1). |
| `.batch/test-documentation-currency.ps1` lines 42-79 already create `%TEMP%\sudoku-currency-<guid>` fixtures and delete them with `Remove-CurrencyFixture`, which refuses to recurse unless the root is a direct child of the temp directory, matches the GUID name pattern and is not a reparse point. `test-ci-evidence-contract.ps1` and `test-dependency-audit-policy.ps1` use the same GUID-root style. | Reuse this guard (with a `sudoku-then-mutations-` prefix) for creation, cleanup and the stale-root sweep. Any dependency link inside the copy must be removed before the guarded recursive delete. |
| CI (`ci.yml` lines 63-65, 150-152, 209-211) runs the script per Stack after the toolchain install and before the full suite, writing evidence to `.results/<stack>/then-assertion-mutations/`. DEMOAPP002 installs with `pip install -e ".[test]"`; DEMOAPP003 restores with `--locked-mode` beforehand. No script or workflow reads `summary.json` apart from the uploaded artefact. | The CI step and evidence path can stay as they are. A DEMOAPP003 copy needs one `dotnet restore --locked-mode` in the copy (offline from the NuGet cache). The summary keys can grow without breaking a consumer. |
| The script is not part of the fingerprinted execution inventory, and no active guide, `CLAUDE.md` or README names it. `DOCS/.analysis/2026-10-07-backlog-078-then-assertion-inventory.md` line 72-75 describes the in-place restore ("restored in `finally` and verified by SHA-256"). | No inventory re-measure and no count change (15 / 22 stay). The dated analysis gets a short addendum rather than a rewrite (Decision 7). |
| DR-039/DR-047/DR-048 and the RA cover CI evidence and parity, not how a local control stores its scratch files. | No DR. |

## Design

1. **One temporary root per run.** `New-MutationWorkspace` creates
   `%TEMP%/sudoku-then-mutations-<stack>-<guid>/` and copies the Stack directory into it, excluding
   generated and dependency folders (`node_modules`, `bin`, `obj`, `.results`, `dist`,
   `__pycache__`, `.pytest_cache`, `.venv`).
2. **Dependencies.**
   - DEMOAPP001: link `node_modules` from the real Stack into the copy (a junction on Windows, a
     symlink elsewhere) rather than copying ~400 packages; read-only use by cucumber and ts-node.
   - DEMOAPP002: nothing to link. `pythonpath = ["."]` makes the copy's `app_src` importable.
   - DEMOAPP003: run `dotnet restore --locked-mode` once in the copy, then the existing
     `dotnet test --no-restore --filter ...` per run.
3. **Mutate only the copy.** Each mutation rewrites the copy's `tests/features/BasicSudokuSolverLogic.feature`
   from the original bytes held in memory; the canonical feature and every tracked Stack feature are
   only read. The existing "must match once" check stays.
4. **Run from the copy.** `Invoke-Scenario` pushes into the copy's Stack root instead of the real one.
   Result and log files stay under the existing evidence root.
5. **Prove the tracked tree untouched.** Hash the canonical feature and the three tracked Stack
   features at start and in `finally`; any difference fails the run (`TrackedFeaturesUnchanged`).
6. **Cleanup.** In `finally`, unlink the dependency link first, then delete the root with the guarded
   remover. At start, sweep `sudoku-then-mutations-*` roots older than 24 hours with the same guard,
   skipping (with a warning) any root still in use.

## Steps

All work happens in this worktree on branch `worklist/triage-24-then-mutation-controls`, cut from
`origin/main` `1f2c4ac`, because other sessions share the checkout. The steps assume the recommended
options.

1. **Record the item.** In `DOCS/.planning/backlog.md` set BACKLOG-088 to `In Progress` with a detail
   entry (worklist acceptance, Verification checks, plan link). Summary: 13 Open / 1 In Progress /
   110 Resolved / 124 Total. Update the header, status and sprint lines.
2. **File the plan.** This file, with status set to `approved` and the owner's words, plus its
   `_index.md` row.
3. **Must-fail baseline (before any change).** In a disposable scratch copy of the repository (not
   this worktree), start the current script for DEMOAPP001 restricted to one mutation
   (`-MutationIds unit-missing-digit`), kill it with `Stop-Process -Force` once the mutated run has
   started, and record that the scratch copy's canonical and DEMOAPP001 features no longer match
   their original SHA-256. This shows the current script can strand a mutated tracked file.
4. **Implement the design** in `.batch/test-then-assertion-mutations.ps1`: workspace creation and
   guarded cleanup (adapted from `Remove-CurrencyFixture`), per-Stack dependency handling, mutation
   of the copy only, runs from the copy, tracked-feature hash check, stale-root sweep. Replace the
   header comment with one stating that tracked files are never written. Keep the parameters, the
   evidence layout and the existing summary keys; set `FeaturesRestored` from the tracked-hash check
   and add `TrackedFeaturesUnchanged` and `WorkspaceRoot`.
5. **After evidence.** Repeat step 3's kill against the new script, in the same kind of scratch copy:
   the tracked hashes must be identical, and the next run must sweep or tolerate the stranded root.
6. **Docs.** Append a dated addendum to
   `DOCS/.analysis/2026-10-07-backlog-078-then-assertion-inventory.md` saying the controls now run
   on a temporary copy (BACKLOG-088). Add a CHANGELOG `[Unreleased]` `### Changed` entry.
7. **Local gates**, recorded with output (listed under Verification).
8. **Publish.** Commit `fix(TRIAGE-24): run the Then-assertion mutation controls on a temporary copy`,
   with a body naming BACKLOG-088 and the reason. Push with the upstream set to the new remote
   branch, and open one PR.

## Verification

- **Must-fail (before):** step 3's killed run leaves the scratch copy's canonical and DEMOAPP001
  feature hashes changed.
- **After:** step 5's killed run leaves all four tracked feature hashes unchanged; only a
  `sudoku-then-mutations-*` root is stranded, and the next run's sweep (or its age guard) handles it.
- **Full controls, locally, in this isolated worktree:** `test-then-assertion-mutations.ps1` for
  DEMOAPP001 and DEMOAPP003 reports 15 positive scenarios and 22 killed mutations each, with
  `TrackedFeaturesUnchanged = true`, the four tracked hashes identical before and after (recorded in
  the log), and no `sudoku-then-mutations-*` root left behind. DEMOAPP002 runs in CI only, because
  a fresh Python 3.13 venv stalls on this machine.
- **No regression:** `npm test` (113 components, 55 scenarios / 309 steps) and `dotnet test` (30 +
  55) still pass from the real Stack roots; `run-parity-checks.ps1` passes.
- **Governance:** `check-ra-header-currency.ps1` and `test-documentation-currency.ps1` (37/37),
  since the backlog and an analysis document change. No inventory fingerprint changes.
- **PR CI:** all five PR jobs pass, and each Stack's "Then assertion mutation controls" step logs
  `Then assertion controls PASS: 22 mutations killed`, with the uploaded summary showing 15 positive
  scenarios, 22 mutations and `TrackedFeaturesUnchanged: true`. After merge, the `main` push run
  passes all seven jobs, including Pages build and deploy. Record each Stack's step duration against
  the previous `main` run, because the copy (and the DEMOAPP003 restore) adds time.

## Delivery

- **Project PR:** one PR from `worklist/triage-24-then-mutation-controls`. The main session merges
  it only when every check is green. The worktree and branch are then removed.
- **Outcome follow-up PR:** append the Outcome here, set status to `implemented`, fill `delivered`,
  update the `_index.md` row, set BACKLOG-088 to `Resolved` with evidence (Summary 13 Open /
  0 In Progress / 111 Resolved / 124 Total), and add
  `DOCS/.implementation-logs/<date>_triage-24-then-mutation-controls.md`, indexed in that folder's
  `README.md`.
- **Portfolio root:** tick TRIAGE-24 in `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with the
  merge commit, from an isolated root worktree in a separate root PR. The item's interim rule ("run
  it only in CI or an isolated worktree until this lands") is then lifted, which unblocks TRIAGE-20.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| 1. Isolation approach | (a) copy the whole Stack to a GUID temp root and run from there; (b) redirect each runner to a temporary feature (generated cucumber config for DEMOAPP001, pytest-bdd base-dir override for DEMOAPP002, still a copy for DEMOAPP003); (c) keep in-place mutation and only document "CI or isolated worktree only" (review rec 2) | (a): one mechanism for all three Stacks, proven by Probe 1; Probe 3 showed (b) needs a generated config for DEMOAPP001 and cannot cover DEMOAPP003; (c) leaves the hazard | Approved (a), 2026-11-09 |
| 2. Canonical feature | (a) stop mutating it; only the copy's Stack feature changes; (b) also copy and mutate the canonical feature inside the temp root | (a): nothing in any Stack reads `features-shared/` at run time, so mutating it proves nothing extra | Approved (a), 2026-11-09 |
| 3. DEMOAPP001 dependencies | (a) link `node_modules` into the copy (junction or symlink), unlinked before the guarded delete; (b) `npm ci` in the copy per run; (c) copy `node_modules` | (a): no network and no 400-package copy; the guard refuses reparse points, and the link is removed first | Approved (a), 2026-11-09 |
| 4. Stranded roots after a hard kill | (a) sweep `sudoku-then-mutations-*` roots older than 24 hours at start, with the guarded remover, skipping roots in use; (b) leave them to the OS temp cleaner | (a): Probe 2 showed a killed run strands a root that may still be locked briefly; an age-limited guarded sweep is safe with parallel runs | Approved (a), 2026-11-09 |
| 5. Summary schema | (a) keep existing keys (`FeaturesRestored` now set from the tracked-hash check) and add `TrackedFeaturesUnchanged` and `WorkspaceRoot`; (b) rename `FeaturesRestored` | (a): uploaded artefacts stay comparable with earlier runs | Approved (a), 2026-11-09 |
| 6. Local DEMOAPP002 run | (a) CI only, as for earlier items; (b) attempt a local venv | (a): a fresh Python 3.13 venv stalls on this machine; CI runs the same script | Approved (a), 2026-11-09 |
| 7. BACKLOG-078 analysis note | (a) append a dated addendum to the 2026-10-07 inventory analysis; (b) leave the dated analysis as it is | (a): one dated line keeps the analysis truthful without rewriting history | Approved (a), 2026-11-09 |
| 8. Decision record | No DR; or a DR | No DR: a local tooling change with the same controls and counts | Approved (No DR), 2026-11-09 |
| 9. Merge authority | Main session merges on all-green; or the owner merges | Main session merges on all-green, as for TRIAGE-16 to TRIAGE-19 | Approved (Main session merges on all-green), 2026-11-09 |

## Outcome

Delivered 2026-11-09 in PR [#112](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/112),
merged as `811fb79`.

1. **Isolation in GUID temporary workspace:** `.batch/test-then-assertion-mutations.ps1` creates
   `%TEMP%/sudoku-then-mutations-<stack>-<guid>/` per run and copies the Stack excluding
   dependency/build artifacts. DEMOAPP001 links `node_modules` via junction (unlinked before delete).
   DEMOAPP003 runs `dotnet restore --locked-mode` once in the workspace.
2. **Tracked features untouched:** Mutations edit only the temporary workspace's feature file.
   Canonical and all three Stack features are checked before and in `finally`; all four SHA-256
   hashes remain byte-identical (`TrackedFeaturesUnchanged = true`).
3. **Must-fail baseline (before):** Killed run against unpatched script permanently mutated canonical
   and Stack feature files in the repository.
4. **Kill-recovery verification (after):** Killed run against patched script left all 4 tracked features
   100% byte-identical.
5. **Full controls:** DEMOAPP001 (15 positive / 22 killed) and DEMOAPP003 (15 positive / 22 killed)
   pass locally; DEMOAPP002 in CI.
6. **Stale workspace cleanup:** Workspaces older than 24 hours swept at script start with guarded remover.
7. **CI:** PR run `42624564441` and `main` merge run `42640018272` passed all jobs, including Pages deploy.
