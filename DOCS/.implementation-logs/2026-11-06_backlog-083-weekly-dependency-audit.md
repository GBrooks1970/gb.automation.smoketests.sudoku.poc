# Implementation Log: BACKLOG-083 weekly scheduled dependency audit

**Date:** 2026-11-06T14:55:30Z
**Session goal:** Make DR-039 exception expiries and new advisories surface within days by running the dependency audits on a weekly schedule that can never deploy Pages.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Add the weekly scheduled dependency audit that the BACKLOG-082 plan named as its recommended follow-up. The owner approved the [implementation plan](../.implementation-plans/2026-11-06-backlog-083-weekly-dependency-audit.md) "as recommended": a separate audit-only workflow, Mondays 06:00 UTC, new DR-048, a paths-limited PR trigger, a live expired-exception control, default failure email only, per-Stack expiry scoping out of scope, and the agent merging only when every check is green.

**Scope that emerged:** None beyond the plan.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Separate `dependency-audit.yml` instead of `schedule:` on `ci.yml` | `ci.yml`'s `pages-build` and `pages-deploy` run for any non-PR event on `main`, so a scheduled `ci.yml` run would redeploy Pages weekly | DR-048 |
| Matrix job per Stack with `fail-fast: false`, reusing `invoke-dependency-audit.ps1` and the existing policy | Same verdict as PR CI; one Stack's failure cannot hide another's (DR-022) | DR-048 |
| `pull_request` trigger limited to the workflow file | The adding PR proves the workflow; later PRs are not slowed | DR-048 |
| Weekly cadence | Exceptions last at most 14 days, so each is evaluated at least once before it expires | DR-048 |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `.github/workflows/dependency-audit.yml` | The audit-only scheduled workflow |
| `DOCS/.implementation-plans/2026-11-06-backlog-083-weekly-dependency-audit.md` | Approved plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-06_backlog-083-weekly-dependency-audit.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `decision-register.md` | DR-048 added; footer "Next ID: DR-049" |
| `CLAUDE.md` | Accepted range DR-001 through DR-048 |
| `README.md`, `CHANGELOG.md` | Weekly run and its limits described |
| `DOCS/.planning/backlog.md`, `DOCS/.implementation-plans/_index.md`, `DOCS/.implementation-logs/README.md` | BACKLOG-083 recorded, then Resolved; plan and log indexed |

### Deleted
| File | Reason |
|------|--------|
| None | |

`ci.yml`, `.batch/invoke-dependency-audit.ps1`, `.batch/evaluate-dependency-audit.ps1` and `.github/dependency-audit-policy.json` are unchanged.

---

## 4. Bugs and Errors Encountered

### Session write guard blocked the first worktree location
**Symptom:** Writing the plan into a sudoku worktree placed beside this session's worktree was refused by a hook.
**Root cause:** The session may write only inside its own worktree.
**Fix:** Moved the sudoku worktree (`git worktree move`) inside the session's worktree, under a path the root repo ignores.

### Check output written to the shared root checkout
**Symptom:** Three local check transcripts were written to the portfolio root by a wrong relative path.
**Root cause:** `../../../../` from the nested worktree resolved to the portfolio root.
**Fix:** Moved them to the session scratchpad immediately; nothing was committed.

---

## 5. Lessons Learned

- A scheduled trigger on a workflow that also publishes is a deploy trigger. Keeping scheduled checks in their own read-only workflow makes "cannot deploy" a property of the file, not of `if:` conditions.
- A paths-limited `pull_request` trigger lets a new workflow prove itself in the PR that adds it, before `workflow_dispatch` is available from the default branch.
- A dispatch on a throwaway branch is a cheap live negative control for a policy change, because pushes to non-main branches do not start `ci.yml`.

---

## 6. Current State at End of Session

**Completed this session:**
- PR #103 merged as `99111e0c4041621969051d14c1c2d634c7070fd0`. CI run 42237102597 passed all five required jobs; audit run 42237102729 passed all three legs.
- `workflow_dispatch` run 42237663052 on `main` passed: DEMOAPP001 `status=pass findings=2 blocking=0`, DEMOAPP002 `status=pass findings=0`, DEMOAPP003 `status=pass findings=0`. The run had exactly three jobs.
- Live negative control: dispatch run 42237715787 on throwaway branch `claude/tmp-backlog-083-expired-exception-control` (`62a9de4`, exception `expiresOn: 2026-10-30`) failed all three legs with "Policy error: Exception 1 expired on 2026-10-30". The branch was deleted.
- `main` push run 42237638303 passed all seven jobs. The only new `github-pages` deployment (7603072913, `99111e0`, 2026-11-06T14:54:52Z) links to that run's deploy job, not to the audit workflow.
- GitHub lists `Dependency audit` (ID 409436941) as `active`.

**Local evidence (Node v24.18.0):**
- `check-ra-header-currency.ps1`: PASS; `test-documentation-currency.ps1`: 37/37; `test-dependency-audit-policy.ps1`: 13/13.
- `invoke-dependency-audit.ps1 -Stack demoapp001` after `npm ci`: `status=pass findings=2 blocking=0`.
- Static no-deploy grep of the workflow: no match.

**Open:**
- The first scheduled run is due on Monday 2026-11-09 at 06:00 UTC and is not yet observed.
- Dependabot alert #20 (minimatch GHSA-g3hv-75wg-m249, moderate, DEMOAPP001 lock) is open. It is below the DR-039 `high` threshold, so it does not block.
- Per-Stack expiry scoping remains an optional owner decision that would need its own DR.
