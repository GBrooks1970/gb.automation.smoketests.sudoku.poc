---
version: 1
created: 2026-11-06T10:55Z
project: gb.automation.smoketests.sudoku.poc
type: ci-diagnostic-report
language: en-GB
---

# Sudoku POC: CI failure diagnostic report

Repository: `GBrooks1970/gb.automation.smoketests.sudoku.poc`, default branch `main` at `53fe0ea`.
Mode: strictly read-only. No git or gh mutation was made and no tracked file was edited. All reproduction ran in the scratch folder `C:\Users\brook\AppData\Local\Temp\claude\72f3a5a9524fe9a4\c3763291-69c5-45fa-a1a0-2a3a5823f6a3\scratchpad\sudoku-ci\`.

## 1. Context

- The CI workflow `.github/workflows/ci.yml` runs only on `pull_request`, `push` to `main`/`master` and `workflow_dispatch` (lines 3-9). There is no `schedule:` trigger, so nothing runs between merges.
- Each of the three Stack jobs ends with `Dependency audit` (`if: always()`, lines 97-100, 158-161, 227-230), which calls `.batch/invoke-dependency-audit.ps1`, which in turn calls `.batch/evaluate-dependency-audit.ps1` against the committed policy `.github/dependency-audit-policy.json`. Then `Verify DEMOAPPxxx evidence` (`.batch/check-ci-evidence.ps1`) rejects any audit summary whose status is not `pass` or `excepted` (check-ci-evidence.ps1 lines 116-117).
- The policy is governed by DR-039 (`decision-register.md` line 2149 onwards): block every unexcepted high, critical or unknown-severity finding; exceptions must be exact, carry owner/reason/approver/dates, last no more than 14 days, and "Expired, overlong, malformed or unmatched exceptions fail the Stack" (DR-039, Decision paragraph 2).
- The policy file holds one exception (lines 6-16): `vulnerability`, stack `demoapp001`, `GHSA-vfj7-8cjw-p6xm`, package `braces`, introduced `2026-10-06`, `"expiresOn": "2026-10-12"` (line 15).
- Ownership and planning state: the project backlog `DOCS/.planning/backlog.md` (authoritative path, line 7) is dated 2026-10-07 and reports Open 0 / In Progress 0 / Resolved 104 (lines 26-31). Its header still states "The exact DR-039 braces exception remains approved through 2026-10-12 inclusive." The root worklist `WORKLIST_gb.automation.smoketests.sudoku.poc.md` (last changed `210b0f4`, 2026-10-07) has only two unchecked items, TRIAGE-10 (line 756) and TRIAGE-15 (line 1028); neither concerns the audit. The portfolio README registry row (README.md line 24) shows the project as `Active` with live Pages links. No backlog item, worklist item or registry note tracks the expiry or the current findings. The two November reviews (Claude v2 Risks 1 and 2; Codex v3 S-01 and S-02) identify the problem but no work item has been opened from them.

## 2. Failure chain

### 2.1 Last green and first red

Evidence: `gh run list --workflow ci.yml --limit 60`.

| Event | Run | Date (UTC) | Commit | Result |
|---|---|---|---|---|
| Last green run on `main` | 37705857943 | 2026-10-08T00:05:20Z | `f3408bf` (merge of PR #94) | success |
| Exception lapses | none | after 2026-10-12 | | no run, as there is no schedule |
| First red run (any branch) | 39809993963 | 2026-10-22T15:59:34Z | `d407bfc` (Dependabot PR #95, follow-redirects 1.16.1) | failure |
| First red run on `main` | 42200997729 | 2026-11-06T10:13:27Z | `a944991` (merge of PR #99) | failure |
| Latest run on `main` | 42204161289 | 2026-11-06T10:38:03Z | `53fe0ea` (merge of PR #100) | failure |

Correction to the starting facts: there was no CI run at all between 2026-10-08 and 2026-10-22. "Every run has failed since 2026-10-13" is true only in the sense that the policy has been invalid since 2026-10-13; the first observed red run is 2026-10-22, and `main` itself stayed green until the first push on 2026-11-06. Every run since 2026-10-22 has failed (9 runs: 39809993963, 41265896720, 41307055984, 42059040802, 42197575045, 42200451217, 42200997729, 42203474191, 42204161289).

### 2.2 Per-job chain (identical in every red run)

Evidence: `gh run view <id> --json jobs` and `gh run view <id> --log-failed` for runs 42204161289, 42203474191, 39809993963, 41265896720, 41307055984 and 42059040802. In all six, the only failed steps in every Stack job are `Dependency audit` and `Verify DEMOAPPxxx evidence`. Every build, lint, test, coverage, mutation-control, parity and policy-controls step passed.

Run 42204161289 (`main`, 53fe0ea), exact log lines:

```
DEMOAPP001 TypeScript Cypress  Dependency audit | Dependency audit: stack=demoapp001 tool=npm-audit status=fail findings=11 blocking=0 unexcepted=0
DEMOAPP001 TypeScript Cypress  Dependency audit |   Policy error: Exception 1 expired on 2026-10-12
DEMOAPP001 TypeScript Cypress  Dependency audit | ##[error]Process completed with exit code 1.
DEMOAPP001 TypeScript Cypress  Verify DEMOAPP001 evidence |   FAIL  invalid audit/dependency-audit-summary.json: audit status 'fail' is not accepted
DEMOAPP002 Python Pytest       Dependency audit | Dependency audit: stack=demoapp002 tool=pip-audit status=fail findings=14 blocking=0 unexcepted=0
DEMOAPP002 Python Pytest       Dependency audit |   Policy error: Exception 1 expired on 2026-10-12
DEMOAPP002 Python Pytest       Verify DEMOAPP002 evidence |   FAIL  invalid audit/dependency-audit-summary.json: audit status 'fail' is not accepted
DEMOAPP003 C# Reqnroll         Dependency audit | Dependency audit: stack=demoapp003 tool=nuget-audit status=fail findings=0 blocking=0 unexcepted=0
DEMOAPP003 C# Reqnroll         Dependency audit |   Policy error: Exception 1 expired on 2026-10-12
DEMOAPP003 C# Reqnroll         Verify DEMOAPP003 evidence |   FAIL  invalid audit/dependency-audit-summary.json: audit status 'fail' is not accepted
```

Downstream: `Parity gate and evidence page`, `Gate (all stacks green)`, `Build static evidence site` and `Deploy to GitHub Pages` are `skipped` in every red run, because they `need` the Stack jobs (ci.yml lines 253, 308, 324).

### 2.3 Is any failure not caused by the policy expiry?

Today, no. Every failed step traces to the same policy error, and the `Verify` failure is a direct consequence of the audit summary carrying `status: fail`. No test, build or lint failure exists in any red run. However, the policy error masks real blocking findings (section 4): the visible failure is the expiry, the latent failure is the advisories.

## 3. Root cause

1. The evaluator validates every exception in the file before any Stack filter. `foreach ($exception in @($policy.exceptions))` at `evaluate-dependency-audit.ps1` lines 200-201 has no Stack condition, and lines 238-239 throw `"Exception $exceptionIndex expired on $($exception.expiresOn)"`, which is caught into `$policyErrors` (line 243). So one expired `demoapp001` exception fails all three Stacks, including DEMOAPP003, which has zero findings.
2. Line 290, `if ($toolStatus -eq 'success' -and $policyErrors.Count -eq 0)`, skips severity classification whenever a policy error exists. That is why every summary shows `blocking=0 unexcepted=0` whatever the findings are. Line 321 then forces `status = 'fail'`.
3. With no `schedule:` trigger, the expiry on 2026-10-12 surfaced only at the next PR (2026-10-22). Nothing warned before or at expiry.

The mechanism is behaving exactly as DR-039 and README.md line 266 ("stale/expired policy fails closed") intend. This is a governance-maintenance lapse, not a code defect.

### 3.1 What the exception covered, and why

- Introduced in commit `fcd8cc6` (2026-10-07, "fix(TRIAGE-13): retain visualiser playhead after tutor", merged via PR #90). The commit message records that it applied the owner-approved DR-039 braces exception for 6 to 12 October 2026 inclusive. The policy `reason` field (line 12) says it was approved "because no patched braces release is available ... remove on upstream remediation".
- `braces` 3.0.3 is a dev-only transitive dependency (`micromatch -> braces`, lockfile `"dev": true`).
- Current status of the advisory, from `gh api advisories/GHSA-vfj7-8cjw-p6xm`: summary `"Withdrawn Advisory: braces vulnerable to stack-exhaustion denial of service through deeply nested patterns"`, `"withdrawn_at":"2026-10-23T12:53:02Z"`, range `<= 3.0.3`, `first_patched_version: null`. The advisory was withdrawn by GitHub on 2026-10-23, and the current npm audit (CI run 42204161289 artefact, and a fresh lockfile audit in scratch) no longer reports braces at all.

### 3.2 Renewal versus remediation under the policy

- DR-039 allows a new exception only as an exact, owner-approved, at most 14-day entry. It never allows silently extending a date (Codex v3 S-02 says the same).
- Renewal is not merely undesirable, it is impossible to make work: I re-ran the evaluator with a copy of the policy in which the braces exception was moved to 2026-11-06 to 2026-11-19. DEMOAPP001 still fails with `Policy error: Active vulnerability exception 'GHSA-vfj7-8cjw-p6xm' no longer matches a reported finding` (evaluator lines 271-279). The only valid action on this entry is to delete it.

## 4. Hidden findings by Stack

Method: the CI evidence artefacts from run 42204161289 were downloaded with `gh run download` into scratch. The evaluator was copied into scratch and run with `-AsOfDate 2026-11-06` against three scratch policy copies: `policy-current` (unchanged), `policy-no-exceptions` (`exceptions: []`) and `policy-renewed-braces`. Evidence output is in `C:\Users\brook\AppData\Local\Temp\claude\72f3a5a9524fe9a4\c3763291-69c5-45fa-a1a0-2a3a5823f6a3\scratchpad\sudoku-ci\eval\out\`.

Results with `policy-no-exceptions`:

```
demoapp001: status=fail findings=11 blocking=4 unexcepted=4
  Unexcepted: GHSA-27r3-jxmh-p828 body-parser [high]
  Unexcepted: GHSA-q3jh-wrc6-jgq8 follow-redirects [high]
  Unexcepted: GHSA-8r9p-f939-6h3c follow-redirects [high]
  Unexcepted: GHSA-mrwp-f3q8-3g9p follow-redirects [high]
demoapp002: status=fail findings=14 blocking=14 unexcepted=14
demoapp003: status=pass findings=0 blocking=0 unexcepted=0
```

### 4.1 DEMOAPP001 (npm, Node 24)

Scope from `package-lock.json` (`dev` flag) and reverse dependencies:

| Advisory | Package (locked) | Severity | Scope | Path | Fixed in | Blocks |
|---|---|---|---|---|---|---|
| GHSA-27r3-jxmh-p828 | body-parser 2.3.0 | high | runtime | express 5.2.1 -> body-parser | 2.4.0 | yes |
| GHSA-q3jh-wrc6-jgq8 | follow-redirects 1.16.0 | high | dev | @serenity-js/serenity-bdd -> axios -> follow-redirects | 1.16.1 | yes |
| GHSA-8r9p-f939-6h3c | follow-redirects 1.16.0 | high | dev | as above | 1.16.1 | yes |
| GHSA-mrwp-f3q8-3g9p | follow-redirects 1.16.0 | high | dev | as above | 1.16.2 (range `>=1.16.0 <=1.16.1`) | yes |
| GHSA-6pq8-jhm2-2vcw | qs 6.16.0 | moderate | runtime | express, body-parser, openapi-backend, superagent | above 6.16.0 | no |
| GHSA-w74x-v6f9-j3xg, GHSA-wjr9-j795-jxcr | fast-uri 3.1.8 | moderate | dev | ajv -> fast-uri | 3.1.9 | no |
| GHSA-xhq7-xmqj-769h, GHSA-333x-w4r6-6crp | fast-uri 3.1.8 | low | dev | ajv -> fast-uri | 3.1.9 | no |
| GHSA-3g3m-2fjr-6pw4 | glob 13.0.6 | moderate | dev | @cucumber/cucumber -> glob | semver-major (@cucumber/cucumber 13.3.0) | no |
| GHSA-g3hv-75wg-m249 | minimatch 10.2.6 | moderate | dev | glob, eslint, typescript-eslint | semver-major | no |

`npm audit --omit=dev --package-lock-only` on the `main` lockfile reports `high: 1, moderate: 1` (body-parser and qs), confirming body-parser is the only runtime high. Exposure note (inference, from the Claude v2 review Risk 2): `express.json()` is mounted globally in `app_src/server/app.ts`, so the DoS path is reachable on the local REST API, which is not internet-exposed.

### 4.2 DEMOAPP002 (pip-audit, Python 3.13)

pip-audit reports no severity, so the evaluator records every finding as `unknown` (line 136), and DR-039 treats unknown as blocking. All 14 block. Fix versions are those pip-audit reported in the CI native output:

| Package (locked) | Findings | Fix version reported | Aliases |
|---|---|---|---|
| certifi 2026.7.22 | PYSEC-2026-4320 | 2026.10.18 | GHSA-6q48-6c7w-9gw2 |
| filelock 3.32.0 | CVE-2026-112907, -112908, -112909, -112910, -112911, -112913, -112915, -112935, -112936, -112938, -112939, -112940 (12) | 4.2.1 (4.0.9 for CVE-2026-112936) | GHSA-567q-5qvw-pf92, GHSA-6627-m3xw-93mp, GHSA-69hj-f68j-2879, GHSA-8mx5-7m5m-r77g, GHSA-9c4x-gm8v-wgc4, GHSA-9vhv-jxww-xfm5, GHSA-cwqr-hh33-gh44, GHSA-fq56-3cx3-fjxp, GHSA-j8f7-rjxc-mr56, GHSA-m462-7rxw-wvpg, GHSA-rfpc-qcw5-3pc4, GHSA-v4x8-3wr5-3wq8 |
| msgpack 1.2.1 | CVE-2026-114613 | 1.2.3 | GHSA-j586-36cw-2gc2 |

Scope: all three are dev/test tooling, not application code. They enter only through `pip-audit` itself (`pyproject.toml` test extra line 12; pip-audit 2.10.1 requires `CacheControl[filecache]` and `requests`; CacheControl 0.14.4 requires `msgpack<2.0.0,>=0.5.2` and `filelock>=3.8.0` for `filecache`; requests pulls `certifi`). They are pinned in `requirements-test.lock` lines 5, 11 and 20. Inference: the auditor is auditing its own dependencies because `--local` (invoke-dependency-audit.ps1 line 36) scans the whole environment.

Fix availability (PyPI JSON API, 2026-11-06): certifi 2026.10.18 (not yanked, latest 2026.10.23), filelock 4.2.1 (requires Python >=3.11, latest 4.2.9), msgpack 1.2.3 (requires Python >=3.10, latest 1.2.4). All satisfy the CacheControl and pip-audit ranges above, and the runner uses Python 3.13. Every finding has a fix available. filelock moves major version 3 to 4; its only consumer is CacheControl's file cache, whose range is unbounded above (`>=3.8.0`).

Verification of the bumps: a scratch pip-audit run could not be completed (creating the scratch Python 3.13 venv stalled in this environment and was stopped). Instead I queried the same data source pip-audit uses by default, the PyPI JSON API `vulnerabilities` field, per exact version:

```
certifi/2026.7.22  vulns= 2  ['GHSA-6q48-6c7w-9gw2', 'PYSEC-2026-4320']
certifi/2026.10.18 vulns= 0  []
filelock/3.32.0    vulns= 12 ['GHSA-v4x8-3wr5-3wq8', 'GHSA-9vhv-jxww-xfm5', plus 10 more, 12 IDs in all]
filelock/4.2.1     vulns= 0  []
msgpack/1.2.1      vulns= 1  ['GHSA-j586-36cw-2gc2']
msgpack/1.2.3      vulns= 0  []
```

The current versions reproduce exactly the 14 CI findings (certifi lists its GHSA and PYSEC IDs, which pip-audit deduplicates to one). The bumped versions report none. Inference: the evaluator would return `status=pass` for DEMOAPP002 after these three bumps, provided no other locked package gains an advisory before the PR runs. This is not proven by a full pip-audit run, so PR CI is the confirming check.

Dependabot does not cover this Stack: there is no `.github/dependabot.yml` (`gh api repos/GBrooks1970/gb.automation.smoketests.sudoku.poc/contents/.github/dependabot.yml` returns 404) and all 8 open Dependabot alerts are npm. Inference: Dependabot is configured from repository settings and does not recognise `requirements-test.lock`, so no PR will ever arrive for these findings.

### 4.3 DEMOAPP003 (NuGet, .NET 10)

`dotnet package list --vulnerable --include-transitive` reported zero vulnerable packages across all four projects (native exit 0). With the exception removed the evaluator returns `status=pass`. No bump is needed. DEMOAPP003 fails today purely because of the cross-Stack policy error.

### 4.4 Dependabot alert reconciliation

`gh api repos/GBrooks1970/gb.automation.smoketests.sudoku.poc/dependabot/alerts?state=open` returns 8 open alerts, all on `demo-apps/demoapp001-typescript-cypress/package-lock.json`: 4 high (#11, #12, #18 follow-redirects, development; #14 body-parser, runtime), 2 medium (#13, #16 fast-uri) and 2 low (#15, #17 fast-uri). This matches the starting facts (4 high, 2 moderate, 2 low). npm audit additionally reports qs, glob and minimatch, which have no Dependabot alert.

## 5. Dependabot PR assessment

All three PRs are single-commit, lockfile-only changes based on `f3408bf`. `gh api repos/GBrooks1970/gb.automation.smoketests.sudoku.poc/compare/main...<head>` (three-dot compare syntax) returns `behind_by=5 ahead_by=1` for each. `git diff --stat f3408bf 53fe0ea -- demo-apps .github .batch` is empty: the five newer commits on `main` are docs-only (22 files under `DOCS/` and indexes). The three diffs touch disjoint hunks of `package-lock.json` (lines 1502-1526 and 3932, 2398, 2598).

| PR | Change | Effect on findings (evaluator, no-exceptions policy) | Rebase needed |
|---|---|---|---|
| #96 | fast-uri 3.1.8 -> 3.1.9 (3 lines) | clears 4 fast-uri moderate/low; still 4 high: `findings=7 blocking=4` | No conflict; a rebase is optional (stale CI only) |
| #97 | body-parser 2.3.0 -> 2.4.0, its content-type 2.0.0 -> 2.1.0, qs 6.16.0 -> 6.17.1 (12 lines) | clears body-parser high and qs moderate; `findings=9 blocking=3` (follow-redirects remain). `npm audit --omit=dev` becomes 0 | No conflict |
| #98 | follow-redirects 1.16.0 -> 1.16.2 (3 lines) | clears all three follow-redirects highs; `findings=8 blocking=1` (body-parser remains) | No conflict |
| #96 + #97 + #98 combined | | `status=pass findings=2 blocking=0 unexcepted=0`; npm audit exit 0, `high: 0`; residual: glob and minimatch moderate (dev, semver-major fix, non-blocking) | |

Method: for each variant the `main` `package.json` and `package-lock.json` were copied to scratch, the PR diff from `gh pr diff` was applied with `patch -p3` (all applied cleanly, including all three together), and `npm audit --audit-level=high --json --package-lock-only` was run under Node v24.18.0 / npm 11.16.0. The combined lockfile passed `npm ls --package-lock-only --all` and was byte-identical after `npm install --package-lock-only --ignore-scripts`, so `npm ci` should accept it (inference: no `npm ci` or test run was done).

Would each be green once the policy is fixed? No PR is green on its own. Each still leaves at least one high npm finding on DEMOAPP001, and none touches DEMOAPP002, so DEMOAPP002 fails on all of them regardless. Only all three npm bumps together, plus the Python lock refresh, plus removal of the exception, gives an all-green run. #95 (follow-redirects 1.16.1) was correctly closed by Dependabot on 2026-11-05 when it was superseded by #98, since 1.16.1 does not fix GHSA-mrwp-f3q8-3g9p.

Note: Dependabot labels #96 as `chore(deps)` but fast-uri is `"dev": true` in the lockfile.

## 6. Options

| Option | What | Pros | Cons | Verdict |
|---|---|---|---|---|
| (a) Renew or extend the exception | Move `expiresOn` forward, or add a new 14-day entry | One-line change | Does not work: the braces finding is no longer reported, so the evaluator fails with "no longer matches a reported finding". Even if it did, the 4 npm highs and 14 pip findings would then be classified and block. Silently extending also breaches DR-039 | Reject |
| (b) Remediate and remove the exception | Delete the braces entry (`exceptions: []`), merge #96-#98 lockfile bumps, bump certifi/filelock/msgpack in `requirements-test.lock` | Genuinely clean audit on all three Stacks; no new risk acceptance; policy unchanged and still fail-closed | Needs one coordinated branch, because no partial step is green on its own; filelock is a major bump (dev tooling only) | Recommend |
| (c) Mix | Remove the exception, bump npm, and take a new owner-approved 14-day exception for the pip findings, or change the pip audit scope (for example to the app plus runtime test dependencies instead of `--local`) | Smaller immediate diff if Python bumps break something | 14 exception entries for fixable findings is noise; a scope change is a structural DR-039 change needing a new DR; not needed because every finding has a fix | Fallback only, if the Python bump fails in CI |
| (d) Do nothing | Leave CI red | Zero effort | Every PR is blocked (portfolio "merge only on green" rule), Pages cannot redeploy, a runtime high (body-parser) stays unpatched, the public badge shows failing, and backlog/registry overstate health | Reject |

## 7. Recommended plan

Smallest set of changes that makes CI genuinely green without weakening fail-closed behaviour: option (b), as one PR on one branch (because no subset is green, separate merges would each be red).

Order of steps:

1. Open a backlog item in `DOCS/.planning/backlog.md` (next free BACKLOG id), status `In Progress`, citing this report, Claude v2 Risks 1-2 and Codex v3 S-01/S-02, and PRs #96-#98. File an implementation plan before implementing, per the portfolio rule.
2. On a fresh branch from `main` (use a worktree: other sessions share the root checkout), in `.github/dependency-audit-policy.json` replace the exceptions array with `[]` (delete lines 6-16). Record in the commit and backlog that GHSA-vfj7-8cjw-p6xm was withdrawn on 2026-10-23.
3. Apply the three Dependabot lockfile changes to `demo-apps/demoapp001-typescript-cypress/package-lock.json` (cherry-pick `bea3438`, `2324c4b`, `489dbea`, or run a lockfile-only `npm update fast-uri body-parser follow-redirects`). No `package.json` change.
4. In `demo-apps/demoapp002-python-pytest/requirements-test.lock` set `certifi==2026.10.18` (or newer), `filelock==4.2.1` (or newer) and `msgpack==1.2.3` (or newer). Ideally regenerate the whole lock in a clean Python 3.13 environment as the file header (line 2) asks, and confirm `pip-audit` reports no findings locally.
5. Run the Node 24 local gates for DEMOAPP001 (build, lint, tests, API and OpenAPI, coverage) and the pytest suite, then push and let all-Stack PR CI prove it. Merge only when every check is green; Dependabot then auto-closes #96-#98 as merged-elsewhere (inference based on usual Dependabot behaviour), or close them manually.
6. After merge, confirm the `main` push run deploys Pages, update the backlog item to `Resolved`, refresh the backlog header (it still cites the braces exception), and update the root worklist and handover.
7. Prevention (separate, smaller follow-up, optional): add a weekly `schedule:` trigger (or audit-only workflow) so expiries and new advisories surface within days rather than at the next PR. Optionally refine the evaluator so an expired exception fails only its own Stack, recorded in a new DR. Both are design choices for the owner, not needed for green.

Estimated change size for steps 2-4: 3 files, about 30 changed lines (policy: about 12 lines removed; npm lockfile: 18 lines across 3 packages plus content-type and qs; Python lock: 3 lines), plus backlog, CHANGELOG and implementation-plan documentation. Effort: about one focused session including CI.

Risk notes: qs moves to 6.17.1 and body-parser to 2.4.0 on the runtime path, which the API integration and OpenAPI tests exercise. filelock 4.x is used only by pip-audit's cache. If CI shows a Python regression, fall back to option (c) for DEMOAPP002 only, with an exact owner-approved exception per DR-039.

## 8. Side effects

- README badge: README.md line 3 points to `actions/workflows/ci.yml/badge.svg` for the default branch. Since run 42200997729 (2026-11-06T10:13Z) the latest `main` run is red, so the public badge now shows failing. Before today it still showed the 2026-10-08 green run, which overstated health for four weeks.
- Stale Pages evidence: the Pages site (`https://gbrooks1970.github.io/gb.automation.smoketests.sudoku.poc/`, plus `/parity/`) was last deployed from `f3408bf` on 2026-10-08T00:09:02Z (deployment 6923888696). Every later `pages-build`/`pages-deploy` was skipped. Inference: as all commits since are docs-only, the published content is still accurate for the code, but it cannot be refreshed and it does not show current audit status.
- Backlog shows 0 Open: `DOCS/.planning/backlog.md` lines 26-31 report Open 0 / In Progress 0, and line 3 claims the exception "remains approved through 2026-10-12". This is out of date. Yes, the backlog should gain an item (step 1 above) for the expired exception and the 4 npm plus 14 pip blocking findings.
- Worklist and registry: the root worklist has no item for this and the registry row shows the project as `Active` with healthy links. Neither claims CI is green, but neither flags it. The worklist should gain an item if the work is run through loop-worklist.
- Process: no PR, including docs-only PRs #99 and #100, can merge on green. PRs #99 and #100 were merged red (inference from run conclusions and merge times; whether this was a deliberate owner override is not recorded).

## 9. Summary and Verdict

- All CI failures since 2026-10-22 come from one cause: the single DR-039 exception (braces GHSA-vfj7-8cjw-p6xm, DEMOAPP001) expired on 2026-10-12. The evaluator validates exceptions without a Stack filter, so all three Stacks fail at `Dependency audit` and then at `Verify DEMOAPPxxx evidence`. No other step fails. Last green on `main`: run 37705857943 (2026-10-08). First red: run 39809993963 (2026-10-22); first red on `main`: run 42200997729 (2026-11-06).
- Renewal cannot work: GitHub withdrew the braces advisory on 2026-10-23, it is no longer reported, and a renewed entry fails as "no longer matches a reported finding". The entry must be deleted.
- The policy error masks real blocking findings. With no exceptions: DEMOAPP001 has 4 high (body-parser GHSA-27r3-jxmh-p828 runtime; 3 follow-redirects dev), DEMOAPP002 has 14 unknown-severity pip-audit findings in pip-audit's own tooling (certifi, filelock, msgpack), and DEMOAPP003 passes.
- PRs #96-#98 apply cleanly together without a rebase (main has changed only docs since their base). Combined, they clear every high npm finding (evaluator `status=pass`). No single PR is green alone, and none fixes DEMOAPP002.
- Every finding has a published fix: certifi 2026.10.18, filelock 4.2.1, msgpack 1.2.3; no exception is needed.

**Verdict: ACT NOW**

Justification: CI is fully blocked on every PR, Pages cannot redeploy, the public badge is red, and a runtime high-severity advisory (body-parser) sits unpatched behind the policy error. The fix is small (3 files, about 30 lines), every finding has a published patch, and option (b) keeps DR-039 fail-closed with no new risk acceptance. Do it as one PR: open a backlog item, delete the expired exception, apply the #96-#98 lockfile bumps, bump certifi, filelock and msgpack in `requirements-test.lock`, and merge only on all-green CI. Consider a scheduled audit run as a follow-up so the next expiry cannot go unnoticed.
