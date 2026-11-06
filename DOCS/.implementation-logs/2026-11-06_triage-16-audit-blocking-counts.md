# Implementation Log: BACKLOG-084 / TRIAGE-16 real blocking counts when the audit policy has errors

**Date:** 2026-11-06T19:45:00Z
**Session goal:** Make the DR-039 dependency-audit summary report the real blocking and unexcepted counts when the policy itself is in error, without changing any verdict.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-16 (Claude review v2 Risk 2 recs 3-4). The owner approved the [implementation plan](../.implementation-plans/2026-11-06-triage-16-audit-blocking-counts.md) "as recommended": classify every finding at or above the threshold and match only exceptions that pass validation, keep `status=fail` under policy errors, fail closed on an unreadable threshold with a 15th control, no DR, the agent merging only when every check is green, and the outage path unchanged.

**Scope that emerged:** None beyond the plan.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Remove the `$policyErrors.Count -eq 0` guard from classification | `$activeExceptions` already holds only exceptions that pass validation, so expired or invalid ones can never apply; the guard only hid the counts | No (verdicts unchanged) |
| Separate `$classificationThreshold`, set to `info` in the policy catch block | `unknown` is also a valid configured `blockAtOrAbove`, so testing `$threshold -eq 'unknown'` would have misread a valid policy as unreadable | No |
| Keep `threshold=unknown` in the published summary | The summary must not claim a threshold the policy never set | No |
| Optional `ExpectedMinimumBlocking` parameter on `Invoke-Control` | The 13 existing positional calls stay unchanged; new controls assert both counts | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-06-triage-16-audit-blocking-counts.md` | Approved plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-06_triage-16-audit-blocking-counts.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.batch/evaluate-dependency-audit.ps1` | Classifies findings under policy errors; fail-closed classification threshold for an unreadable policy |
| `.batch/test-dependency-audit-policy.ps1` | Count check in `Invoke-Control`; controls `policy-error-reports-blocking` and `unreadable-policy-reports-blocking` (15 controls) |
| `DOCS/.architecture/orchestration-design.md`, `CHANGELOG.md` | Reporting behaviour described |
| `DOCS/.planning/backlog.md`, `DOCS/.implementation-plans/_index.md`, `DOCS/.implementation-logs/README.md` | BACKLOG-084 recorded, then Resolved; plan and log indexed |

### Deleted
| File | Reason |
|------|--------|
| None | |

`ci.yml`, `dependency-audit.yml`, `.batch/invoke-dependency-audit.ps1`, `.batch/check-ci-evidence.ps1` and `.github/dependency-audit-policy.json` are unchanged.

---

## 4. Bugs and Errors Encountered

### The control script stops at its first failure
**Symptom:** The must-fail run against the unchanged evaluator stopped at `policy-error-reports-blocking`, so `unreadable-policy-reports-blocking` never ran.
**Root cause:** `Invoke-Control` throws on the first unmet expectation, by design.
**Fix:** Recorded the unreadable-policy case by a direct evaluator run in the scratchpad on the same fixture: `status=fail findings=1 blocking=0 unexcepted=0` before the fix, `blocking=1 unexcepted=1` after.

---

## 5. Lessons Learned

- A correct verdict with zeroed counts still hides the truth. Controls should assert the evidence fields, not only the exit code and status.
- Do not use an in-band value as an error sentinel when that value is also a legal configuration (`unknown` as a threshold). Carry the failure as its own variable.
- When a control harness stops at its first failure, record each new must-fail case on its own, or the later ones are never proven red.

---

## 6. Current State at End of Session

**Completed this session:**
- PR #105 (head `526fddf`) merged as `ddc254037a637f23c84508021e173f238db9ea35`.
- PR CI run 42280161693 passed all five required jobs (Pages skipped on the PR): `Dependency audit policy controls: PASS (15/15)`; DEMOAPP001 `status=pass findings=2 blocking=0`; DEMOAPP002 and DEMOAPP003 `status=pass findings=0 blocking=0`.
- `workflow_dispatch` run 42280180274 of `dependency-audit.yml` on the branch passed all three legs with the same verdicts.
- `main` push run 42280718309 at `ddc2540` passed all seven jobs, including Pages build and deploy (deployment 7609115968).

**Local evidence (Node v24.18.0, .NET 10.0.403, PowerShell 7.6.9):**
- Must-fail before the fix: `policy-error-reports-blocking expected blockingFindingCount >= 1 (blocking finding reported), received 0`; direct unreadable-policy run `blocking=0 unexcepted=0`.
- After the fix: policy controls 15/15; CI evidence negative controls 21/21; RA/documentation currency PASS; documentation currency 37/37.
- Live audits: DEMOAPP001 `status=pass findings=2 blocking=0`; DEMOAPP003 `status=pass findings=0 blocking=0`. DEMOAPP002 was left to CI because a fresh Python 3.13 venv stalls on this machine.

**Open:**
- The root worklist tick for TRIAGE-16 goes through a separate root PR.
- The next root worklist item is TRIAGE-17 (mirror open root candidates into this backlog).
