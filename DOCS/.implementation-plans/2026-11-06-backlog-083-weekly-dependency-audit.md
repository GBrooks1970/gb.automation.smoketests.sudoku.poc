---
version: 1
created: 2026-11-06T14:37Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-083
status: approved
approved: 2026-11-06 by GBrooks1970, "Approve as recommended"; every recommended option, agent merges only when every check is green
language: en-GB
---

# Implementation plan: BACKLOG-083 weekly scheduled dependency audit

**Goal.** Make DR-039 exception expiries and newly published advisories surface within days, not at
the next pull request. BACKLOG-082 showed the gap: the only DR-039 exception expired on 2026-10-12,
but `ci.yml` has no `schedule:` trigger, so nothing failed until a PR ran on 2026-10-22, and the
backlog said 0 Open for ten days. The BACKLOG-082 plan named a weekly scheduled audit as the
recommended follow-up, and the owner accepted it on 2026-11-06.

## Evidence gathered before planning

Read on 2026-11-06 against `main` `a6e1c12`. No tracked file was changed.

| Finding | Consequence for the plan |
|---|---|
| `ci.yml` triggers on `pull_request`, `push` to `main`/`master` and `workflow_dispatch` only. | Nothing re-evaluates the policy between PRs. A schedule is needed. |
| In `ci.yml`, `pages-build` runs for every non-PR event and `pages-deploy` runs for any non-PR event on `refs/heads/main`. A scheduled run always uses `main`. | A `schedule:` on `ci.yml` would rebuild and redeploy Pages every week unless both jobs gained new conditions. A separate workflow avoids touching the deploy path at all. |
| `.batch/invoke-dependency-audit.ps1 -Stack <id>` already runs the governed tool for each Stack and calls `evaluate-dependency-audit.ps1`, which evaluates expiry against today's UTC date and exits 1 on `status=fail`. | The scheduled workflow only needs each Stack's locked restore plus this script. No script change. |
| The audits need a restored environment: pip-audit runs with `--local` against the installed packages, and the NuGet audit runs with `--no-restore`. | Each leg repeats the same locked install step as `ci.yml`. |
| `evaluate-dependency-audit.ps1` treats any policy error as global, so an expired exception for one Stack fails every Stack. | Acceptable for the schedule (the run is red either way). Scoping expiry to its own Stack would change DR-039 behaviour and is left out of scope (see decisions). |
| GitHub lists only `CI` plus the two dynamic Dependabot workflows. `ci.yml` is the README badge. | The new workflow does not affect the existing badge or required checks. |
| GitHub disables scheduled workflows in a public repository after 60 days with no repository activity, and emails the failure of a scheduled run to the user who last changed the cron line. | Recorded as a known limit in DR-048 and the README; no extra alerting is built. |

## Design

Add one audit-only workflow, `.github/workflows/dependency-audit.yml`:

```yaml
name: Dependency audit

on:
  schedule:
    - cron: '0 6 * * 1'   # Mondays 06:00 UTC
  workflow_dispatch:
  pull_request:
    paths:
      - .github/workflows/dependency-audit.yml

permissions:
  contents: read

concurrency:
  group: dependency-audit-${{ github.ref }}
  cancel-in-progress: false

jobs:
  audit:
    name: Audit ${{ matrix.stack }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        stack: [demoapp001, demoapp002, demoapp003]
    steps:
      # checkout (persist-credentials: false)
      # demoapp001: setup-node 24 + npm ci           (same as ci.yml)
      # demoapp002: setup-python 3.13 + pip install -c requirements-test.lock -e ".[test]"
      # demoapp003: setup-dotnet 10.0.x + dotnet restore --locked-mode
      # ./.batch/invoke-dependency-audit.ps1 -Stack ${{ matrix.stack }} -EvidenceRoot .results/${{ matrix.stack }}
      # upload .results/<stack>/audit/ as dependency-audit-<stack>, 7 days, if: always()
```

Properties this gives:

- **Cannot deploy Pages.** The workflow grants only `contents: read`, has no `pages` or `id-token`
  permission, no `github-pages` environment and no Pages actions. Pages stays deployable only from
  `ci.yml`'s `pages-deploy` job.
- **Same policy, same tools.** It runs the existing scripts with the existing policy file, so a
  scheduled verdict means exactly what a PR verdict means. `fail-fast: false` keeps one Stack's
  failure from hiding another's (DR-022 multi-Stack rule).
- **Self-testing PR trigger.** The `pull_request` trigger is limited to changes to this workflow
  file, so the PR that adds it proves every leg runs, and later PRs are not slowed.
- **Latency.** Weekly, so an expiry or new advisory shows within seven days. Exceptions may last up
  to 14 days, so every exception is checked at least once before it expires.

## Steps

All work is in a git worktree on branch `claude/backlog-083-weekly-dependency-audit`, cut from
`origin/main` `a6e1c12`, because other sessions share the root checkout.

1. **Record the item.** In `DOCS/.planning/backlog.md` add BACKLOG-083 ("Weekly scheduled dependency
   audit", All, Medium, `In Progress`, DR-048) with a section table row, a detail entry with
   acceptance criteria, updated summary counts (1 In Progress, 105 Resolved, 106 Total) and header
   lines.
2. **File the plan.** This file, status set to `approved` with the owner's words, plus its `_index.md`
   row.
3. **Decision record.** Add DR-048, "Run the DR-039 dependency audits weekly in an audit-only
   workflow": context (BACKLOG-082's ten-day gap), decision (the design above), consequences (seven-day
   latency, 60-day inactivity limit, default failure email only, global policy errors unchanged),
   alternatives (schedule on `ci.yml`; daily cadence; per-Stack expiry scoping). Update the register
   footer to "Next ID: DR-049" and the accepted range in `CLAUDE.md`.
4. **Workflow.** Add `.github/workflows/dependency-audit.yml` as designed. No change to `ci.yml`, the
   audit scripts or the policy file.
5. **Docs.** One short paragraph in the README's dependency-audit section naming the weekly run and
   its limits, and one CHANGELOG entry.
6. **Local checks** (Node 24.18.0, already active): parse the workflow YAML; run
   `.batch/check-ra-header-currency.ps1`, `.batch/test-documentation-currency.ps1` and
   `.batch/test-dependency-audit-policy.ps1`; run `invoke-dependency-audit.ps1 -Stack demoapp001`
   locally after `npm ci` (expected `status=pass blocking=0`). DEMOAPP002 is left to CI because a
   fresh Python 3.13 venv stalls on this machine.
7. **Publish.** Push and open one PR.

## Verification

- **PR CI:** the existing `CI` jobs pass (unchanged) and the new workflow's three `Audit` legs pass via
  the paths-limited `pull_request` trigger, each logging `status=pass`.
- **Static no-deploy check:** the workflow file contains no `pages:`, `id-token:`, `environment:`,
  `deploy-pages` or `upload-pages-artifact`. Recorded in the log with the grep output.
- **Dispatch proof after merge:** `gh workflow run dependency-audit.yml --ref main` completes green in
  all three legs, and the repository's deployment list shows no new `github-pages` deployment from
  that run.
- **Live negative control (expiry must fail):** push a throwaway branch whose policy holds one
  vulnerability exception with an `expiresOn` date in the past, dispatch the workflow on that branch,
  and confirm every leg fails with "expired on". Then delete the throwaway branch. Pushing a non-main
  branch does not trigger `ci.yml`, and no PR is opened for it.
- **Schedule registration:** `gh api .../actions/workflows` lists `Dependency audit` as `active`. The
  first scheduled run (Monday 2026-11-09 06:00 UTC) is recorded later if it has run by then; the
  dispatch run is the acceptance proof.

## Delivery

- **Merge:** the agent merges only when every check is green, then fast-forwards local `main` in the
  root checkout (already on `main`, so no branch switch) with `git merge --ff-only`, and removes the
  worktree and branch.
- **Follow-up PR:** append the Outcome here, set BACKLOG-083 to `Resolved`, and add
  `DOCS/.implementation-logs/2026-11-06_backlog-083-weekly-dependency-audit.md` indexed in that
  folder's `README.md`.
- **Portfolio root repo:** worklist and handover only if the owner asks.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Where the schedule lives | (a) separate audit-only `dependency-audit.yml`; (b) `schedule:` on `ci.yml` with extra guards on both Pages jobs | (a): no deploy path to guard, cheaper run | As recommended, 2026-11-06 |
| Cadence | Weekly, Monday 06:00 UTC; or daily | Weekly, as accepted for BACKLOG-082 | As recommended, 2026-11-06 |
| Decision record | New DR-048; or note it under DR-039 only | DR-048: a new workflow and audit cadence is a structural CI choice, and DR-039 stays unamended | As recommended, 2026-11-06 |
| PR self-test trigger | Paths-limited `pull_request`; or dispatch-only proof after merge | Paths-limited trigger | As recommended, 2026-11-06 |
| Live expiry negative control | Throwaway branch with an expired exception, dispatched then deleted; or rely on `test-dependency-audit-policy.ps1` | Do the live control | As recommended, 2026-11-06 |
| Failure alerting | GitHub's default failure email; or also open an issue (needs `issues: write`) | Default email only | As recommended, 2026-11-06 |
| Per-Stack expiry scoping | Out of scope (separate item and DR if wanted); or include now | Out of scope | As recommended, 2026-11-06 |
| Merge authority | Agent merges on all-green; or owner merges | Agent merges on all-green | As recommended, 2026-11-06 |
