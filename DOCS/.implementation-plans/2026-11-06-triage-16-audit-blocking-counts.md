---
version: 1
created: 2026-11-06T18:44Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-084 / TRIAGE-16
status: approved
approved: 2026-11-06 by GBrooks1970, "Approve as recommended"; every recommended option, agent merges only when every check is green
delivered: not yet
language: en-GB
---

# Implementation plan: BACKLOG-084 / TRIAGE-16 real blocking counts when the audit policy has errors

**Goal.** Make the DR-039 dependency-audit summary tell the truth when the policy itself is in
error. Today `.batch/evaluate-dependency-audit.ps1` skips finding classification whenever
`$policyErrors.Count -gt 0`, so an expired or invalid exception produces `status=fail` with
`blockingFindingCount=0` and `unexceptedFindingCount=0`, even when a high finding is present. The
verdict is right, but the counts hide the finding that the expired exception was covering. This is
the "green hides the truth" pattern BACKLOG-082 exposed. Source: Claude review v2
(`DOCS/.review/CODE_REVIEW_Claude_v2_20261105T1425Z/`) Risk 2 recs 3-4, 05 Recommended Refactors
item 1 and 07 Step 6, triaged as TRIAGE-16 (HIGH) and approved by the owner on 2026-11-06.

## Evidence gathered before planning

Read on 2026-11-06 against `main` `a35067d` (clean, equal to `origin/main`, latest `main` CI run
42238975046 green). The reads ran in the shared checkout and in this plan's worktree; no tracked file
was changed apart from this plan and its `_index.md` row.

| Finding | Consequence for the plan |
|---|---|
| `evaluate-dependency-audit.ps1` line 290: `if ($toolStatus -eq 'success' -and $policyErrors.Count -eq 0)` guards the whole classification loop (lines 290-309). | Removing the `$policyErrors.Count -eq 0` clause is the core change. |
| Lines 200-247 validate each exception separately. An exception that fails any check (missing field, unsupported stack or kind, span over `maximumExceptionDays`, future start, expiry before `AsOfDate`) is recorded in `$policyErrors` and never added to `$activeExceptions`. | Classifying against `$activeExceptions` already uses only exceptions that pass validation. Expired or invalid exceptions can never mark a finding as excepted. No new filtering is needed. |
| Lines 270-282 add two further policy errors after validation ("no longer matches a reported finding"; outage exception "does not match the current audit outage") but leave those exceptions in `$activeExceptions`. | A stale vulnerability exception matches no finding by definition, and the loop only applies `kind -eq 'vulnerability'` entries, so neither can mark a finding as excepted. No change needed. |
| If the policy file cannot be read or its header is invalid (lines 248-252), `$threshold` becomes `'unknown'`, which ranks 5 in `$severityRanks` (line 32). Only `unknown`-severity findings would then reach the blocking list; a `high` (3) or `critical` (4) finding would still be under-reported. | Needs a fail-closed rule for classification when the threshold cannot be read (Decision 3). |
| Line 321 already sets `status=fail` when `$policyErrors.Count -gt 0`. Exit code 1 follows from `status=fail` (line 362). | The verdict and exit code are unchanged by this item. Only the counts and lists change. |
| `.batch/test-dependency-audit-policy.ps1` runs 13 controls. `Invoke-Control` (lines 26-58) checks only the exit code and `status`; it never reads `blockingFindingCount` or `unexceptedFindingCount`. The `expired-exception` control (lines 114-117) passes today with zero counts. | The harness needs an optional count check, and a new control must assert counts. |
| `.batch/check-ci-evidence.ps1` (lines 105-121) accepts only `status` `pass`/`excepted` with `unexceptedFindingCount=0`, and `test-ci-evidence-contract.ps1` writes its own fixture summaries. | Neither depends on the zero counts under policy errors. Both must still pass unchanged. |
| The live policy `.github/dependency-audit-policy.json` holds `"exceptions": []`. The latest audits report DEMOAPP001 `findings=2 blocking=0`, DEMOAPP002 and DEMOAPP003 `findings=0`. | With no policy errors, live behaviour is unchanged: all three Stacks stay `status=pass blocking=0`. |
| DR-039 (decision register line 2149) and DR-048 (line 2743, "Policy errors stay global") define the verdict rules. Neither specifies the counts under policy errors. | No DR: verdicts, thresholds and exception rules are unchanged. The next free DR stays DR-049. |
| `DOCS/.planning/backlog.md`: Open 0 / In Progress 0 / Resolved 106 / Total 106; BACKLOG-084 is unused. | BACKLOG-084 is claimed for this item; confirm it is still free immediately before the backlog write. |

## Design

1. **Always classify.** The loop runs whenever `$toolStatus -eq 'success'`, whatever the policy error
   count. Every finding at or above the threshold goes into `$blockingFindings`. Each one is matched
   only against `$activeExceptions`, the exceptions that passed validation, so expired or invalid
   exceptions are never applied. A match goes into `$exceptedFindings` and `$appliedExceptions`;
   otherwise the finding goes into `$unexceptedFindings`.
2. **Fail closed on an unreadable threshold** (Decision 3, recommended option). When the policy
   header cannot be read and `$threshold` is `'unknown'`, classification uses the lowest rank
   (`info`), so every finding counts as blocking. The summary's `threshold` field still reports
   `unknown`, so no false threshold is published.
3. **Verdict unchanged.** Line 321 stays as it is: any policy error gives `status=fail` and exit 1.
   With a policy error, `status` can never become `excepted`, because the `fail` branch is checked
   first.
4. **Outage path unchanged.** The outage block (line 311) keeps its `$policyErrors.Count -eq 0`
   guard. Outages report no findings, so there is nothing to count, and changing when outage
   exceptions apply is out of scope.

## Steps

All work happens in a git worktree on branch `worklist/triage-16-audit-blocking-counts`, cut from
`origin/main` `a35067d`, because other sessions share the checkout.

1. **Record the item.** In `DOCS/.planning/backlog.md` add BACKLOG-084 ("Report real blocking counts
   when the dependency-audit policy has errors", All, High, `In Progress`, source TRIAGE-16 / Claude
   review v2 Risk 2) with a section table row, a detail entry carrying the acceptance criteria below,
   updated Summary counts (0 Open, 1 In Progress, 106 Resolved, 107 Total) and header lines.
2. **File the plan.** This file, with status set to `approved` and the owner's words, plus its
   `_index.md` row.
3. **Must-fail control first.** In `.batch/test-dependency-audit-policy.ps1`:
   - give `Invoke-Control` an optional `[int]$ExpectedMinimumBlocking = -1` parameter, after the
     existing positional parameters so the 13 current calls are unchanged. When it is 0 or more,
     read `blockingFindingCount` and `unexceptedFindingCount` from the summary and throw unless both
     are at least that value;
   - add the control `policy-error-reports-blocking` beside `expired-exception`: DEMOAPP001,
     `npm-audit`, the `$npmHigh` report, native exit 1, a policy holding the expired exception,
     expected exit 1, `status=fail`, minimum blocking 1;
   - if Decision 3 takes option (a), also add `unreadable-policy-reports-blocking`: the `$npmHigh`
     report with a policy whose `blockAtOrAbove` is unsupported, expected exit 1, `status=fail`,
     minimum blocking 1.

   Run the script against the **unchanged** evaluator and record that the new control(s) fail with
   the "blocking" message. This is the must-fail proof.
4. **Evaluator.** In `.batch/evaluate-dependency-audit.ps1`, drop `-and $policyErrors.Count -eq 0`
   from line 290 and, under Decision 3 (a), compare against `info` when `$threshold` is `'unknown'`.
   No other line changes. Re-run step 3's script: 14/14 controls pass (15/15 under Decision 3 (a)).
5. **Docs.** Add one sentence to `DOCS/.architecture/orchestration-design.md` (dependency-audit
   section, near line 138): the summary reports real finding counts even when the policy has errors,
   and only exceptions that pass validation are applied. Add one CHANGELOG `[Unreleased]` entry under
   `### Fixed`.
6. **Local gates** (Node 24.18.0), recorded with output:
   - `pwsh ./.batch/test-dependency-audit-policy.ps1`: `PASS (14/14)` (or 15/15);
   - `pwsh ./.batch/test-ci-evidence-contract.ps1`: pass, unchanged;
   - `pwsh ./.batch/invoke-dependency-audit.ps1 -Stack demoapp001` after `npm ci`, and the same for
     `demoapp002` (locked Python 3.13 install) and `demoapp003` (`dotnet restore --locked-mode`),
     each `status=pass blocking=0`. Any Stack whose runtime cannot be restored locally (a fresh
     Python 3.13 venv stalled on this machine during BACKLOG-083) is left to CI and named as such;
   - `.batch/check-ra-header-currency.ps1` and `.batch/test-documentation-currency.ps1`, since the
     backlog and an architecture document change.
7. **Publish.** Commit `fix(TRIAGE-16): classify blocking audit findings when the policy has errors`
   with a body naming BACKLOG-084 and the reason, push (setting the upstream to the new remote
   branch, not `main`), and open one PR.

## Verification

Acceptance criteria from the worklist, each checked with recorded evidence:

- **Classification under policy errors:** findings reach `blockingFindings`/`unexceptedFindings`
  when `$policyErrors.Count -gt 0`, and only the final `status` reflects policy errors. Proof: the
  diff at line 290 and the new control's summary showing `blockingFindingCount >= 1`.
- **Must-fail control:** `policy-error-reports-blocking` fails against the unchanged evaluator
  (step 3) and passes after step 4. "Policy error plus high finding" gives `status=fail` with
  `blockingFindingCount >= 1`.
- **No regression:** all 13 existing controls pass, so the run reports 14/14 (15/15 under Decision 3
  (a)); the CI evidence-contract controls pass.
- **Live audits unchanged:** all three Stacks report `status=pass blocking=0` locally where the
  runtime is available, and in CI.
- **PR CI:** CI passes all five jobs that run on a PR (three Stack jobs, parity and
  `Gate (all stacks green)`; Pages jobs are skipped on PRs).
- **Audit workflow:** `gh workflow run dependency-audit.yml --ref worklist/triage-16-audit-blocking-counts`
  passes all three `Audit` legs with `status=pass`. The workflow's paths-limited `pull_request`
  trigger does not fire, because this PR does not change the workflow file, so the dispatch is the
  proof.
- **Exact merge:** after merge, `main` push CI passes all seven jobs, including Pages build and deploy.

## Delivery

- **Project PR:** one PR from `worklist/triage-16-audit-blocking-counts`, merged only when every
  check is green (merge authority per Decision 5). After merge the worktree and branch are removed.
  The shared checkout is never switched off `main`; it is fast-forwarded only if it is still clean on
  `main`.
- **Outcome follow-up PR:** append the Outcome here, set status to `implemented`, fill `delivered`,
  update the `_index.md` row, set BACKLOG-084 to `Resolved` with evidence and recompute the Summary
  (0 Open, 0 In Progress, 107 Resolved, 107 Total), and add
  `DOCS/.implementation-logs/2026-11-06_triage-16-audit-blocking-counts.md` indexed in that folder's
  `README.md`. This follows the BACKLOG-082 and BACKLOG-083 pattern (PRs #101/#102 and #103/#104).
- **Portfolio root:** tick TRIAGE-16 in `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with the
  merge commit and a one-line outcome, in a separate root PR from an isolated root worktree (the
  root checkout carries other sessions' changes). The worklist never enters a project commit.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| 1. Which exceptions apply when the policy has errors | (a) classify every finding at or above the threshold and match only against active exceptions that pass validation, never expired or invalid ones; (b) apply no exceptions at all while any policy error exists; (c) leave classification skipped and only document it | (a): counts tell the truth, a valid exception still shows as applied, and the verdict stays `fail` | (a), as recommended, 2026-11-06 |
| 2. Verdict under policy errors | Keep `status=fail` and exit 1; or allow `excepted` when every finding is covered | Keep `status=fail`: DR-039 and DR-048 behaviour unchanged | Keep `status=fail`, as recommended, 2026-11-06 |
| 3. Unreadable policy threshold | (a) fail closed: classify at `info`, so every finding counts as blocking, keep `threshold=unknown` in the summary, and add a 15th control; (b) leave the `unknown` rank, keep 14 controls and record it as a known limit | (a): the review's aim (real counts under policy errors) also covers an unreadable policy, at the cost of one more control | (a), as recommended, 2026-11-06 |
| 4. Decision record | No DR; or a new DR-049 | No DR: verdicts, thresholds and exception rules are unchanged, only reporting | No DR, as recommended, 2026-11-06 |
| 5. Merge authority | Agent merges each PR only when every check is green; or the owner merges | Agent merges on all-green, as for BACKLOG-082/083 | Agent merges on all-green, as recommended, 2026-11-06 |
| 6. Outage path | Leave the line 311 guard as it is; or also apply outage exceptions under policy errors | Leave it: outages report no findings to count, and changing when exceptions apply would alter DR-039 | Leave it, as recommended, 2026-11-06 |

## Outcome

[Appended after delivery.]
