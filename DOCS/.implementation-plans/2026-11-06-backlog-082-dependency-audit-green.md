---
version: 1
created: 2026-11-06T13:27Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-082
status: approved
approved: 2026-11-06 by GBrooks1970, "Approve as recommended"; option (b) in one PR, agent merges only when every check is green
delivered: not yet
language: en-GB
---

# Implementation plan: BACKLOG-082 restore green CI under DR-039

**Goal.** Make all-Stack CI genuinely green again without weakening the fail-closed dependency policy
(DR-039). Every Stack job has failed since 2026-10-22 because the only policy exception (braces
GHSA-vfj7-8cjw-p6xm) expired on 2026-10-12. That error also hides real blocking advisories in
DEMOAPP001 and DEMOAPP002. This unblocks every PR and lets Pages redeploy again.

## Evidence gathered before planning

A read-only diagnostic ran on 2026-11-06 against `main` `53fe0ea`, with all reproduction in a scratch
folder outside the repository. No tracked file was changed. Full report:
[2026-11-06-backlog-082-ci-diagnostic.md](../.analysis/2026-11-06-backlog-082-ci-diagnostic.md).

| Finding | Consequence for the plan |
|---|---|
| Six red runs (for example 42204161289 and 42203474191) all fail only at `Dependency audit` (policy error: exception 1 expired) and then `Verify DEMOAPPxxx evidence`. Every build and test step passes. | The fix is confined to the dependency policy and lockfiles. No test or source changes are needed. |
| GitHub withdrew GHSA-vfj7-8cjw-p6xm on 2026-10-23T12:53:02Z (`gh api advisories/...`). A renewed policy copy still fails with "no longer matches a reported finding". | Renewing the exception is impossible, so the entry must be deleted. |
| With exceptions set to `[]`, DEMOAPP001 has `blocking=4`: body-parser GHSA-27r3-jxmh-p828 (high, runtime via express) and follow-redirects GHSA-q3jh-wrc6-jgq8, GHSA-8r9p-f939-6h3c and GHSA-mrwp-f3q8-3g9p (high, dev). | Deleting the exception alone stays red. The npm bumps must land in the same PR. |
| Dependabot PRs #96 (fast-uri), #97 (body-parser) and #98 (follow-redirects) are lockfile-only. Combined, they give npm audit exit 0 and evaluator `status=pass findings=2 blocking=0`, and `npm ls` is clean. | Apply all three in this PR. No single one goes green alone. |
| DEMOAPP002 has 14 findings, all blocking because pip-audit gives no severity (`unknown` blocks). They are certifi 2026.7.22, filelock 3.32.0 (12) and msgpack 1.2.1, all reached only through pip-audit's own dependencies. The fixes are certifi 2026.10.18, filelock 4.2.1 (major bump) and msgpack 1.2.3, and the PyPI vulnerability data shows 0 for those versions. | Bump three lines in `requirements-test.lock`. This was not proven by a full local pip-audit run, so PR CI is the confirming check. |
| DEMOAPP003 has zero NuGet findings. | No C# change. |
| The backlog shows 0 Open and still cites the braces exception as approved. There is no `.github/dependabot.yml`, so Python locks get no Dependabot PRs. | Add a backlog item and correct the header. Prevention is a separate optional follow-up. |

## Steps

All work is done in a git worktree on branch `claude/backlog-082-dependency-audit-green`, cut from
`origin/main`, because other sessions share the root checkout.

1. **Record the item.** In `DOCS/.planning/backlog.md` add BACKLOG-082 ("Restore green CI: remove
   withdrawn braces exception and remediate hidden advisories", All Stacks (CI + locks), High,
   `In Progress`, DR-039). Cite Claude v2 Risks 1-2, Codex v3 S-01/S-02 and PRs #96-#98. Update the
   summary counts and correct the header text that still describes the braces exception as approved.
2. **File the plan.** Add this plan as `DOCS/.implementation-plans/2026-11-06-backlog-082-dependency-audit-green.md`
   with status `approved`, add a row to `_index.md`, and copy the diagnostic report into
   `DOCS/.analysis/2026-11-06-backlog-082-ci-diagnostic.md`.
3. **Policy.** In `.github/dependency-audit-policy.json`, set `"exceptions": []`. Keep
   `blockAtOrAbove: high` and `maximumExceptionDays: 14` unchanged.
4. **npm lock (DEMOAPP001).** Cherry-pick the three Dependabot commits (#96 `bea3438`, #97 `2324c4b`,
   #98 `489dbea`) into `demo-apps/demoapp001-typescript-cypress/package-lock.json`. No `package.json`
   change. Confirm with `npm ls` and `npm audit` in a scratch copy (exit 0).
5. **Python lock (DEMOAPP002).** In `demo-apps/demoapp002-python-pytest/requirements-test.lock` set
   `certifi==2026.10.18`, `filelock==4.2.1` and `msgpack==1.2.3`. Use the exact fix versions, not the
   latest, to keep the change minimal.
6. **CHANGELOG.** Add one entry describing the security and CI repair.
7. **Local gates** (Node 24.18.0, already active), run in the worktree:
   - **DEMOAPP001:** `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm run format:check`,
     `npm run test:component`, `npm run test:openapi`, `npm run test:api`, and the BDD suite.
   - **Evaluator on DEMOAPP001:** run `evaluate-dependency-audit.ps1` against a fresh npm audit with the
     new policy. Expected result: `status=pass blocking=0`.
   - **DEMOAPP002:** pytest in a fresh venv installed with `-c requirements-test.lock`, and pip-audit if
     the venv completes.
   - **Repository checks:** `.batch/check-ra-header-currency.ps1` and
     `test-dependency-audit-policy.ps1` (13/13).
8. **Publish.** Push the branch and open one PR. It references #96, #97 and #98, which are closed with
   a comment once the PR merges, if Dependabot does not close them itself.

## Verification

- **PR CI:** all three Stack jobs, the parity gate and `Gate (all stacks green)` pass. Each audit step
  logs `status=pass blocking=0`.
- **Negative check (must fail):** run the evaluator against a scratch copy of the new policy plus the
  *pre-fix* npm audit output. It must still report `blocking=4`. This proves the fix comes from
  remediation, not from a weaker policy.
- **Policy self-tests:** `test-dependency-audit-policy.ps1` stays 13/13. Those negative controls prove
  that expiry and stale-exception detection are still enforced.
- **After merge:** the `main` push run is green, the Pages deploy job runs and succeeds, and the README
  badge shows passing.

## Delivery

- **Branch and PR:** one branch and one PR on `GBrooks1970/gb.automation.smoketests.sudoku.poc`.
- **Merge:** the agent merges only when every check is green (no red-merge exception for this PR). It
  then fast-forwards the local `main` and removes the worktree and branch.
- **Follow-up PR, after the merge:**
  - Append the Outcome to this plan, citing the merge SHA and CI run.
  - Set BACKLOG-082 to `Resolved`.
  - Add an implementation log in `DOCS/.implementation-logs/`.
- **Portfolio root repo:** update the worklist and handover only if the owner asks.
- **Fallback:** if the Python bumps break pytest in CI, split DEMOAPP002 out under option (c): an exact
  owner-approved DR-039 exception, at most 14 days. This is put to the owner first, never applied
  silently.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Remediation route | (a) renew exception (impossible), (b) remove exception and bump locks, (c) mix, with an exception for DEMOAPP002, (d) do nothing | (b) | (b), 2026-11-06 |
| Packaging | One PR with everything, or separate PRs (each would be red until the last lands) | One PR | One PR, 2026-11-06 |
| Dependabot PRs #96-#98 | Cherry-pick into this PR and close them, or merge them first on red | Cherry-pick and close | Cherry-pick and close, 2026-11-06 |
| Python versions | Exact fix versions, or latest (certifi 2026.10.23, filelock 4.2.9, msgpack 1.2.4) | Exact fix versions | Exact fix versions, 2026-11-06 |
| Merge authority | Agent merges on all-green, or owner merges | Agent merges on all-green | Agent merges on all-green, 2026-11-06 |
| Prevention follow-up | Weekly scheduled audit run and/or per-Stack expiry scoping (new DR), as a separate later item; or none | Weekly schedule as a separate item, proposed after this lands | As recommended, 2026-11-06 |

## Outcome

Not yet delivered.
