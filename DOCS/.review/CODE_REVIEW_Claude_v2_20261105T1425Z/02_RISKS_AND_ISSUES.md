# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_gb.automation.smoketests.sudoku.poc.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

Risks are numbered from highest to lowest priority. "Observed" means the result was produced by a command in [ANNEX/VALIDATION_EVIDENCE.md](ANNEX/VALIDATION_EVIDENCE.md). "Inference" marks reasoning that was not proven by execution.

| # | Severity | Title |
|---|---|---|
| 1 | High | Expired dependency exception makes every CI run fail on all three Stacks |
| 2 | High | The policy error masks real blocking advisories; removing the exception alone will not turn CI green |
| 3 | Medium | Vacuous and parameter-blind step bindings overstate what the Gherkin verifies |
| 4 | Medium | `/api/visualise/:name` double-decodes the path parameter and returns 500 |
| 5 | Medium | DEMOAPP003 fixture resolution walks the filesystem and swallows load errors |
| 6 | Medium | Canonical project state conflicts with reality and with the portfolio registry |
| 7 | Low | Canonical feature narrative and data governance drift from the RA and the guide |
| 8 | Low | CI supply-chain and liveness hardening gaps |
| 9 | Low | Then-assertion mutation controls rewrite tracked files in place |
| 10 | Low | Docker images and Compose services drift from CI |
| 11 | Low | Tracked agent-local settings and misleading Stack names |
| 12 | Low | Naked Pairs / X-Wing eliminations are transient (pedagogical accuracy) |

---

## Risk 1 - Expired dependency exception makes every CI run fail on all three Stacks (High)

**Risk Description/Explanation**
DR-039 lets one time-boxed exception live in `.github/dependency-audit-policy.json`. The only entry (braces GHSA-vfj7-8cjw-p6xm, DEMOAPP001) expired on 2026-10-12. The evaluator validates every exception in the file before it filters by Stack, and it records an expired one as a policy error. A policy error forces `status = fail`. So all three Stack jobs, not only DEMOAPP001, now fail at "Dependency audit" and "Verify ... evidence". `Gate (all stacks green)` therefore cannot pass, and Pages cannot redeploy.

**Evidence Outline**
- [.github/dependency-audit-policy.json](.github/dependency-audit-policy.json) (line 15): `"expiresOn": "2026-10-12"`.
- [.batch/evaluate-dependency-audit.ps1](.batch/evaluate-dependency-audit.ps1) (lines 200-201): `foreach ($exception in @($policy.exceptions))` has no Stack filter. Lines 238-239 hold `throw "Exception $exceptionIndex expired on ..."`, and lines 321-322 force `fail` when `$policyErrors.Count -gt 0`.
- CI run 41307055984 (PR #97, 2026-11-01). The DEMOAPP001, DEMOAPP002 and DEMOAPP003 logs all contain `Policy error: Exception 1 expired on 2026-10-12` followed by exit code 1 (observed through `gh run view --log-failed`). PRs #95 (2026-10-22) and #96 (2026-11-01) are also `failure`.
- Local reproduction: the evaluator run against a fresh `npm audit --json` of the `main` lockfile printed `status=fail ... Policy error: Exception 1 expired on 2026-10-12` and exited 1.
- [DOCS/.planning/backlog.md](DOCS/.planning/backlog.md) (lines 3, 28-33): "Last Updated: 2026-10-07 ... braces exception remains approved through 2026-10-12", with 0 Open / 0 In Progress. No item tracks the expiry.
- [README.md](README.md) (lines 263-266) correctly documents that "stale/expired policy fails closed". The mechanism is behaving as designed.

**Impact Analysis**
- No change can merge green: not a Dependabot bump, not a docs fix. The `merge only on green` portfolio rule turns this into a full stop on the project.
- The README CI badge and the latest main run (37705857943, 2026-10-08) still show green, so the public evidence looks healthier than the current state. Any push to `main` would turn the badge red and skip `pages-build`/`pages-deploy`.
- The backlog, as canonical state, says nothing is open. A cold-starting agent would not know the project is blocked.

**Refactor Recommendation and Strategy**
1. Open a backlog item now (for example "DR-039 exception expiry and current audit findings"). Record that the expiry is the trigger, and that Risk 2 is the real work.
2. Delete the expired entry from the policy file. The policy forbids keeping an expired exception, and the braces finding is no longer reported on `main` (see Risk 2), so re-approval is unnecessary.
3. Add expiry visibility. One option is a scheduled `workflow_dispatch`-style run (for example a weekly `schedule:`) of only the three audit steps. Another is a policy-controls check that warns 3 days before `expiresOn`. Either would have turned this red on 2026-10-13 instead of at the next PR.
4. Optional design refinement: report an expired exception for a different Stack as a warning on the other Stacks rather than a failure. Keep failure on the owning Stack. That keeps fail-closed semantics where they matter and stops one Stack's lapse blocking unrelated lanes. Record the change in a DR if adopted.

---

## Risk 2 - The policy error masks real blocking advisories; removing the exception alone will not turn CI green (High)

**Risk Description/Explanation**
When any policy error exists, the evaluator skips severity classification, so the summary reports `blocking=0` / `unexcepted=0` whatever the findings are. CI therefore currently under-reports. Re-evaluating today's findings with an exception-free copy of the policy shows that both DEMOAPP001 and DEMOAPP002 would still fail.

**Evidence Outline**
- [.batch/evaluate-dependency-audit.ps1](.batch/evaluate-dependency-audit.ps1) (line 290): `if ($toolStatus -eq 'success' -and $policyErrors.Count -eq 0) {` is the only path that populates `blockingFindings`.
- Observed (local `npm audit --json` on `main` at `f3408bf`, evaluator with `exceptions: []` from a scratch policy): `status=fail findings=11 blocking=4 unexcepted=4`:
  - `GHSA-27r3-jxmh-p828 body-parser [high]`: runtime dependency through `express@5.2.1 -> body-parser@2.3.0` (`npm ls`). `npm audit --omit=dev` also reports it (1 high, 1 moderate `qs`).
  - `GHSA-q3jh-wrc6-jgq8`, `GHSA-8r9p-f939-6h3c`, `GHSA-mrwp-f3q8-3g9p follow-redirects [high]`: dev only, through `@serenity-js/serenity-bdd@3.44.1 -> axios@1.18.1 -> follow-redirects@1.16.0`. npm reports the range for GHSA-mrwp-f3q8-3g9p as `>=1.16.0 <=1.16.1`, so Dependabot PR #95 (to 1.16.1) does not clear all three. That is an inference from the advisory range only; PR #95 was not tested.
- Observed (CI artefact `demoapp002-ci-evidence` from run 41307055984, re-evaluated with the exception-free policy): `status=fail findings=14 blocking=14 unexcepted=14`. The findings are 1 `certifi 2026.7.22`, 12 `filelock 3.32.0` and 1 `msgpack 1.2.1`, all with `unknown` severity, which DR-039 treats as blocking.
- [.batch/invoke-dependency-audit.ps1](.batch/invoke-dependency-audit.ps1) (line 36): `pip_audit --local --skip-editable` audits the whole venv. All three packages are pinned in [requirements-test.lock](demo-apps/demoapp002-python-pytest/requirements-test.lock) (lines 5, 11, 20) as transitive dependencies of the test tooling, `pip-audit` itself included (line 26). That they come specifically through pip-audit's dependency chain is an inference.
- The braces GHSA-vfj7-8cjw-p6xm is no longer in the local `main` audit, so the exception would also trip "no longer matches a reported finding" (lines 278-279) even if it had not expired.

**Impact Analysis**
- A maintainer who "fixes CI" by deleting the expired exception will hit a second red wall, with 4 new npm failures and 14 new Python failures.
- One high finding (body-parser) sits on the shipped REST API's request path. `express.json()` is mounted globally at [app_src/server/app.ts](demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) (line 32). The service is local-only and exposed through the Compose `api` profile, so real-world exposure is low, but the portfolio claims a governed audit.
- The Python lane's findings are all in test tooling, not in the solver. Unknown-severity blocking is defensible, but it makes the lane brittle to advisory noise in the audit tool's own tree.

**Refactor Recommendation and Strategy**
1. DEMOAPP001: run `npm audit fix` as a lockfile-only change, or merge the body-parser (#97) and fast-uri (#96) bumps together on a single branch after the Risk 1 fix. For follow-redirects, confirm a release above 1.16.1 or add an `overrides` pin. If none exists, take a new, owner-approved 14-day exception per DR-039.
2. DEMOAPP002: refresh `requirements-test.lock` to patched `certifi`/`filelock`/`msgpack` versions where available. If not, decide whether the audit scope should exclude the auditor's own dependencies (for example by auditing a requirements file of the app plus its test runtime instead of `--local`), and record that as a DR-039 amendment.
3. Make the summary honest under policy errors. Always compute `blockingFindingCount` and `unexceptedFindingCount`, even when the status is already `fail` because of policy errors, so the evidence artefact shows the real queue.
4. Add a negative control to [.batch/test-dependency-audit-policy.ps1](.batch/test-dependency-audit-policy.ps1) asserting that a policy error plus a high finding reports `blocking >= 1`.

---

## Risk 3 - Vacuous and parameter-blind step bindings overstate what the Gherkin verifies (Medium)

**Risk Description/Explanation**
BACKLOG-078 made 16 Then patterns exact across all Stacks, with mutation controls behind them, which is excellent. A set of bindings outside that inventory still prove nothing. Three Then steps have empty bodies in all three Stacks. Several Given/When steps are no-ops. In DEMOAPP001, 18 step bindings accept Gherkin parameters and discard them, using a hard-coded fixture instead. A reader of the feature therefore believes things are verified that are not.

**Evidence Outline**
- Empty Then bodies, identical in all three Stacks:
  - "no errors should occur" (feature line 335): [integration.steps.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/integration.steps.ts) (lines 74-76), [test_basic_sudoku_solver_logic.py](demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py) (lines 789-791), [BasicSudokuSolverLogicSteps.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs) (lines 676-679).
  - "the main loop should exit" (feature line 361): [edgeCases.steps.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/edgeCases.steps.ts) (lines 119-121), Python lines 955-957, C# lines 831-834.
  - "the move should be validated against row, column, and block constraints": [constraintValidation.steps.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/constraintValidation.steps.ts) (lines 26-28), Python lines 344-346, C# lines 268-271. The BACKLOG-078 inventory explicitly calls this one contextual ([DOCS/.analysis/2026-10-07-backlog-078-then-assertion-inventory.md](DOCS/.analysis/2026-10-07-backlog-078-then-assertion-inventory.md) line 62). The other two are not mentioned.
- Python no-op Given/When bodies (`pass`): "no digits violate row, column, or block rules" (line 381), "the puzzles.json file does not exist" (line 599), "the PuzzleLoader attempts to load the file" (line 609), "attempting to create a SudokuSolver" (line 816), and four "another cell ... has candidates" Givens.
- DEMOAPP001 parameter-blind bindings: for example [xWing.steps.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/xWing.steps.ts) (lines 10-29), where `rows {int} and {int} have candidate {int} only in columns {int} and {int}` ignores all five arguments and calls `SetupGridState.xWingRow()`. The other cases are in `nakedPairs.steps.ts` (lines 13-46), `nakedSingles.steps.ts` (lines 41, 46), `constraintValidation.steps.ts` (line 14), `hiddenSingles.steps.ts` (lines 57, 68), `puzzleLoader.steps.ts` (line 33) and `unitCompletion.steps.ts` (lines 65-73). A grep for `async (_param` found 18 such bindings.
- [puzzleLoader.steps.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/puzzleLoader.steps.ts) (line 157): `assert.ok(count >= 0, ...)` is a tautology for an array length.
- Existing awareness: the root worklist already holds unselected candidate TRIAGE-15, "Assess candidate-qualified and fixed-fixture step arguments" (`WORKLIST_gb.automation.smoketests.sudoku.poc.md` line 1028, owner selection needed). It covers the parameter-blind Givens. It does not name the three empty Then bodies, and it is not tracked in the project backlog.

**Impact Analysis**
- Editing "rows 1 and 4" in an X-Wing Given would still pass. The Gherkin documents a contract the glue does not enforce, which is the classic way living documentation goes stale.
- "no errors should occur" is meaningful only because an exception elsewhere would fail the scenario. The step adds no assertion of its own, so a refactor that swallows errors inside the Task would pass silently.
- For a portfolio aimed at mid-level testers, empty Then bodies replicated faithfully in three languages teach that parity of shape equals parity of verification.

**Refactor Recommendation and Strategy**
1. Extend the BACKLOG-078 inventory to every Then binding, not only digit/position-bearing ones, and give each a disposition: assert, merge into the previous step, or reword the Gherkin.
2. "no errors should occur": assert `ErrorThrown` / `LAST_ERROR` is empty. "the main loop should exit": assert the attempt-event sequence ends after one full pass with no placement, using the existing attempt-event evidence (DR-037).
3. Parameter-blind Givens: either select the fixture by the parameters, and fail fast if no fixture matches, or remove the numbers from the step text and state "Given the canonical X-Wing row fixture". Record the choice per RA Section 5.4.
4. Add two or three planted parameter mutations (for example change the X-Wing row numbers) to `.batch/test-then-assertion-mutations.ps1`. Each must fail, which proves the Givens are bound.

---

## Risk 4 - `/api/visualise/:name` double-decodes the path parameter and returns 500 (Medium)

**Risk Description/Explanation**
Express already percent-decodes route parameters. The visualise route calls `decodeURIComponent` a second time. A puzzle name that contains a literal `%` (sent as `%25`) becomes `100%` after the first decode, and the second decode then throws `URIError`. The generic error handler maps that to 500. The sibling `/api/puzzles/:name` route does not double-decode and correctly returns 404.

**Evidence Outline**
- [app_src/server/app.ts](demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) (lines 101-106): `tracker.trackSolve(decodeURIComponent(firstParam(req.params.name)))`. Compare lines 94-99 (no second decode).
- Observed with supertest against `createApp()` (scratch probe, no server started):
  - `GET /api/visualise/Easy%20Scan%20Grid` -> 200
  - `GET /api/visualise/100%25` -> 500 `INTERNAL_SERVER_ERROR`
  - `GET /api/puzzles/100%25` -> 404 `PUZZLE_NOT_FOUND`
  - `GET /api/visualise/nope` -> 404 `PUZZLE_NOT_FOUND`
- [docs/openapi.yaml](demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml) (lines 229-245) documents `500` as a response for this path, so the OpenAPI response-contract test would accept this defect as conformant.

**Impact Analysis**
- A client-input error is reported as a server fault, which breaks the error-taxonomy discipline the rest of the API follows.
- The same name produces different status codes on two routes, a REST consistency defect that a reviewer probing the API would find quickly.
- Inference: names containing an encoded sequence such as `%2541` would decode twice and match a different name. That is a minor correctness hazard, not a security issue in this local-only service.

**Refactor Recommendation and Strategy**
1. Remove the `decodeURIComponent` call (Express has already decoded the parameter).
2. Add an API integration case for a `%25` name on both routes, asserting 404 with `PUZZLE_NOT_FOUND`.
3. Consider whether `500` should be listed per path in the OpenAPI document at all. Listing it on every path normalises server faults as contract-conformant.

---

## Risk 5 - DEMOAPP003 fixture resolution walks the filesystem and swallows load errors (Medium)

**Risk Description/Explanation**
DEMOAPP001 and DEMOAPP002 anchor `puzzles.json` to their source file locations. DEMOAPP003 passes the bare name `"puzzles.json"`, and `PuzzleLoader.ResolvePuzzlePath` then tries the current directory, `AppContext.BaseDirectory`, and every ancestor of the current working directory. If nothing matches it falls back to a non-existent path. The test Ability catches the resulting `FileNotFoundException` and keeps a null loader, so later steps fail with misleading "Puzzle not found" errors instead of the real cause.

**Evidence Outline**
- [tests/screenplay/actors/SudokuActors.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/actors/SudokuActors.cs) (line 11): `LoadPuzzles.From("puzzles.json")`. Compare [SudokuActors.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts) (line 7), which uses `path.resolve(__dirname, '../../../puzzles.json')`, and [actors.py](demo-apps/demoapp002-python-pytest/tests/screenplay/support/actors.py) (line 9), which uses `Path(__file__).resolve().parents[3]`.
- [app_src/PuzzleLoader.cs](demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs) (lines 41-63): an unbounded upward walk with a fallback to `Path.GetFullPath(filePath)`.
- [tests/screenplay/abilities/LoadPuzzles.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/abilities/LoadPuzzles.cs) (lines 11-21): `catch (Exception ex) { _error = ex; }`. `GetByName` then returns null, and the Task throws `Puzzle not found` ([Tasks.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/tasks/Tasks.cs) lines 391-392).
- Observed: running `dotnet test tests/DemoApp003.Specs.csproj --artifacts-path <scratch>` (build output outside the repo tree) gave `Failed: 17, Passed: 38, Total: 55`, all with `Puzzle not found: "Easy Scan Grid"` / `"Empty Grid"`. The same 28 component tests passed, and CI's default layout passes 55/55 (run 41307055984 `reqnroll.trx`). The suite's correctness therefore depends on where the binaries are written.

**Impact Analysis**
- Out-of-tree builds (`--artifacts-path`, `UseArtifactsOutput`, some IDE or container layouts) produce 17 misleading red scenarios. The error message points at the puzzle data, not the path.
- Inference: an unrelated `puzzles.json` in any ancestor directory would be loaded silently, and the scenarios would run against the wrong data.
- This is a parity asymmetry in the one area RA Section 5.6 explicitly governs (test data location and isolation).

**Refactor Recommendation and Strategy**
1. Copy `puzzles.json` to the test output (`<None Include="..\puzzles.json" CopyToOutputDirectory="PreserveNewest" />`) and pass `Path.Combine(AppContext.BaseDirectory, "puzzles.json")` from `SudokuActors`. Or anchor the path through `[CallerFilePath]`, as the other Stacks do.
2. Remove the upward walk from production `PuzzleLoader`, or bound it to the solution root. A loader that guesses is harder to reason about than one that fails.
3. In `LoadPuzzles`, keep capturing the error for the "missing file" scenario, but make `GetByName` and similar methods throw the captured error when the loader is null, so the real cause surfaces.

---

## Risk 6 - Canonical project state conflicts with reality and with the portfolio registry (Medium)

**Risk Description/Explanation**
The backlog is the declared source of truth. It reports zero open work while CI is blocked (Risk 1) and three dependency PRs are open. Portfolio-level records disagree with the backlog and with each other.

**Evidence Outline**
- [DOCS/.planning/backlog.md](DOCS/.planning/backlog.md) (lines 28-33): 0 Open / 0 In Progress / 104 Resolved. Line 3 is dated 2026-10-07.
- Portfolio `README.md` (line 24) lists the project as `Active`. Line 35 defines `Active` as "the canonical backlog contains open work", which contradicts the backlog.
- `portfolio-prompts/registry.yml` (line 134): "one unscheduled test-quality item (BACKLOG-078) remains open". BACKLOG-078 is Resolved (backlog lines 489 and 1888), and the backlog itself labels the registry note "historical/non-current" (line 1824).
- Open PRs #95, #96 and #97 (Dependabot) are not reflected in the backlog. There is no `.github/dependabot.yml` in the tree, so update cadence is controlled outside the repo (GitHub settings). That is an inference from the file list plus the PR authorship.

**Impact Analysis**
- A cold-starting agent following the resume/derive prompts would conclude there is nothing to do.
- Hiring managers reading the registry see a stale open item. Readers of the backlog see a clean slate. Neither reflects the actual blocked state.

**Refactor Recommendation and Strategy**
1. Add the Risk 1/2 item to the backlog as `Open` and reference PRs #95-#97.
2. Correct the registry note in the support repo and re-run its generator/check. That is out of this repo's scope, so flag it to the registry owner.
3. Reconcile the lifecycle label (`Active` vs `Resting`) once the backlog has open work again. With the new item it will legitimately be `Active`.

---

## Risk 7 - Canonical feature narrative and data governance drift from the RA and the guide (Low)

**Risk Description/Explanation**
Several "single source of truth" rules are stated but not enforced, or are contradicted by the artefacts.

**Evidence Outline**
- [features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature](features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature) (lines 3-5): "apply three fundamental solving techniques ... Unit Completion, Hidden Singles, and Naked Singles". The same file has Naked Pairs and X-Wing scenarios, and the README says five techniques. TRIAGE-08 reconciled eight active documents but not the canonical feature header, which needs a DR-governed change.
- [CLAUDE.md](CLAUDE.md) (line 215) and [decision-register.md](decision-register.md) (line 296) say the Stack copy carries `@stack-demoapp001`. The four feature files are byte-identical (same MD5), so no Stack tag exists. The `stack-demoapp002` marker declared in [pyproject.toml](demo-apps/demoapp002-python-pytest/pyproject.toml) is unused.
- [DOCS/reference-architecture.md](DOCS/reference-architecture.md) (line 445): "Test data MUST NOT be embedded as inline literals in canonical feature files". The canonical file embeds literals such as `the missing digit is 7`, `column 0`, and full row values. BACKLOG-078 deliberately added more exact literals.
- `puzzles.json` exists as three identical copies with no parity gate (`.batch/` and `tools/` contain no check that reads them). [CLAUDE.md](CLAUDE.md) "Add a Puzzle" tells contributors to edit only the DEMOAPP001 copy.

**Impact Analysis**
- The feature narrative is the first thing a reader sees. It understates the solver and contradicts the README.
- An unenforced RA MUST, plus a guide that describes a tag that does not exist, erodes trust in the governance layer.
- A contributor following CLAUDE.md would silently desynchronise DEMOAPP002/003 test data. Inference: the scenarios use named puzzles, so a drifted copy would surface as a Stack-specific failure rather than silently.

**Refactor Recommendation and Strategy**
1. Raise a DR to update the feature narrative to five techniques, and propagate it byte-for-byte.
2. Either amend RA Section 5.6 to permit exact behavioural literals in canonical features (which is the de facto decision behind BACKLOG-078), or move them into `Examples` tables. Record the decision.
3. Fix CLAUDE.md line 215 and DR-0xx wording to match the byte-identical copy policy, or reinstate the Stack tags.
4. Add a `puzzles.json` hash-equality check to `.batch/run-parity-checks.ps1` (a few lines), and update CLAUDE.md "Add a Puzzle" to say all three copies.

---

## Risk 8 - CI supply-chain and liveness hardening gaps (Low)

**Risk Description/Explanation**
The workflow is well structured, but third-party actions use mutable major tags, the Stack jobs have no time limit, and nothing runs on a schedule.

**Evidence Outline**
- [.github/workflows/ci.yml](.github/workflows/ci.yml) (lines 21, 26, 109, 129, 188, 270, 370, 395): `actions/checkout@v7`, `setup-node@v7`, `upload-artifact@v7`, `setup-python@v6`, `setup-dotnet@v5`, `download-artifact@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`, all tags rather than commit SHAs.
- Lines 3-9: triggers are `pull_request`, `push` and `workflow_dispatch`, with no `schedule`. A scheduled run would have exposed Risk 1 on 2026-10-13.
- Lines 15-19, 118-120, 177-179: the three Stack jobs have no `timeout-minutes` (parity, pages-build and pages-deploy do have one). There is no workflow-level `concurrency`, so superseded PR pushes keep running.

**Impact Analysis**
- A compromised or re-pointed tag could run in a job that holds `pages: write` / `id-token: write` (the deploy job). The risk is low but real, and the portfolio presents itself as audit-minded.
- Time-dependent policy (exception windows) has no clock-driven check.

**Refactor Recommendation and Strategy**
1. Pin actions to full SHAs with a version comment, and let Dependabot `github-actions` updates maintain them.
2. Add `schedule: - cron: '0 6 * * 1'` running at least the dependency-audit steps.
3. Add `timeout-minutes: 15` to the Stack jobs, and `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` for pull requests.

---

## Risk 9 - Then-assertion mutation controls rewrite tracked files in place (Low)

**Risk Description/Explanation**
`.batch/test-then-assertion-mutations.ps1` plants mutations by rewriting the canonical feature and the Stack feature in the working tree, then restores the original bytes in `finally` and verifies them by SHA-256. That is safe on an ephemeral CI runner. It is hazardous in a shared or long-lived checkout, and the portfolio's own memory notes say other sessions work in this checkout.

**Evidence Outline**
- [.batch/test-then-assertion-mutations.ps1](.batch/test-then-assertion-mutations.ps1) (lines 23-26, 164, 169): the script reads the originals, writes `$text.Replace($mutation.Old, $mutation.New)` to the real path, and restores in `finally`.

**Impact Analysis**
- A hard kill (terminal closed, `Stop-Process`, power loss) leaves a mutated canonical feature in the working tree. A parallel agent running parity checks or committing at that moment would see or commit wrong expectations.
- This review deliberately did not run the control for this reason.

**Refactor Recommendation and Strategy**
1. Copy the Stack into a temporary directory (as `test-documentation-currency.ps1` already does with its GUID-named fixture root) and mutate there. Or point each runner at a temporary feature path through its config.
2. Until then, document "CI or isolated worktree only" at the top of the script and in CLAUDE.md.

---

## Risk 10 - Docker images and Compose services drift from CI (Low)

**Evidence Outline**
- [docker-compose.yml](docker-compose.yml) (line 7): `demoapp001-tests` runs `build && lint && test:api && npm test`. It omits `format:check`, `verify:openapi`, coverage floors and the parity/audit steps that CI runs (ci.yml lines 36-100). DEMOAPP002 runs bare `python -m pytest` with no coverage floor.
- [demo-apps/demoapp001-typescript-cypress/Dockerfile](demo-apps/demoapp001-typescript-cypress/Dockerfile) (line 1) `node:24-alpine`, DEMOAPP002 `python:3.13-slim`, DEMOAPP003 `mcr.microsoft.com/dotnet/sdk:10.0`: floating tags, no digest, no non-root `USER`.

**Impact Analysis**
- "Green in Compose" is a weaker statement than "green in CI", but the README lists Compose as a repository-level verification command, so readers will assume parity.
- Floating base tags make container runs non-reproducible over time.

**Refactor Recommendation and Strategy**
- Have Compose call the same npm script CI calls (for example a new `npm run verify` that chains the CI steps), pin base images by digest, and add `USER node` / a non-root user where the toolchain allows it.

---

## Risk 11 - Tracked agent-local settings and misleading Stack names (Low)

**Evidence Outline**
- `.claude/settings.local.json` is tracked (`git ls-files`). It contains 34 lines of permission allow-rules with absolute paths to a former checkout (`d:\__GB_DEV\_GitHub\...`), including broad rules such as `Bash(git checkout *)`, `Bash(npm install:*)` and a `Remove-Item -Recurse -Force` rule. It contains no secrets.
- The local DEMOAPP002 `.venv` (untracked) has its editable install pointing at the same non-existent former path, and `pytest 9.0.3` against `9.1.1` in the lock. It still passed because `pythonpath = ["."]` wins. This is a local reproducibility note only.
- Stack directory names `demoapp001-typescript-cypress` (no Cypress dependency in [package.json](demo-apps/demoapp001-typescript-cypress/package.json) lines 42-66) and `demoapp003-csharp-specflow` (Reqnroll) are documented as stable legacy IDs ([DOCS/.design/naming-conventions.md](DOCS/.design/naming-conventions.md) lines 32-33, 126).

**Impact Analysis**
- `*.local.json` is conventionally per-developer. Publishing it in a public repo leaks workstation paths and may widen an agent's permissions for anyone who clones the repo.
- The names mislead skim-readers about the stack being demonstrated.

**Refactor Recommendation and Strategy**
- Untrack `.claude/settings.local.json` (`git rm --cached`) and add it to `.gitignore`. Keep the shared `.claude/settings.json`.
- Add a single sentence near the top of the root README: "Directory names are stable legacy IDs: DEMOAPP001 uses Cucumber.js + Serenity/JS (no Cypress); DEMOAPP003 uses Reqnroll."

---

## Risk 12 - Naked Pairs / X-Wing eliminations are transient (pedagogical accuracy) (Low)

**Risk Description/Explanation**
Inference from reading the code: candidates are recomputed from the grid on each call, and the pair/X-Wing eliminations are applied only to a local `Map`. An elimination therefore only has an effect when it immediately reduces a peer to a single candidate, and it is otherwise discarded. Textbook Naked Pairs and X-Wing persist eliminations as pencil marks that compound across techniques.

**Evidence Outline**
- [app_src/SudokuSolver.ts](demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts) (lines 245-347): `cellCandidates` is built per unit from `getCellCandidates`, `cands.delete(d1)` mutates only the local set, and placement happens only when `cands.size === 1`. Nothing in `DOCS/.algorithm/naked-pairs.md` or `x-wing.md` mentions that eliminations are not retained (grep for persist/retain/pencil returned nothing).

**Impact Analysis**
- The solver is weaker than the technique names suggest, and some puzzles a reader expects to be solvable with five techniques will report `STUCK_ON_ADVANCED_LOGIC`. That is acceptable for a POC, but it should be stated, since the repo's audience is learning the techniques.

**Refactor Recommendation and Strategy**
- Document the "elimination-to-single only, no persistent candidate state" simplification in the two algorithm docs and the platform specification. Optionally plan a candidate-grid model as a future parity item.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_gb.automation.smoketests.sudoku.poc.md)
