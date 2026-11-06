# Implementation Log: BACKLOG-082 restore green CI under DR-039

**Date:** 2026-11-06T14:26:21Z
**Session goal:** Make all-Stack CI genuinely green again without weakening the fail-closed DR-039 dependency policy.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** The owner asked for a diagnosis of the red Sudoku CI, then approved the resulting [implementation plan](../.implementation-plans/2026-11-06-backlog-082-dependency-audit-green.md) "as recommended": option (b) in one PR, with the agent merging only when every check was green.

**Scope that emerged:**
- The three open Dependabot PRs (#96, #97, #98) were folded into the fix and closed.
- A Python lock update was needed that Dependabot never proposes, because the repository has no `.github/dependabot.yml`.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Delete the braces exception rather than renew it | GHSA-vfj7-8cjw-p6xm was withdrawn on 2026-10-23, and the evaluator rejects an exception that no longer matches a finding | No (applies existing DR-039) |
| One PR containing the policy change and all lock bumps | No subset of the changes is green on its own | No |
| Use the exact fix versions for the Python test tooling (certifi 2026.10.18, filelock 4.2.1, msgpack 1.2.3) | Smallest change that clears all 14 pip-audit findings | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-06-backlog-082-dependency-audit-green.md` | Approved plan |
| `DOCS/.analysis/2026-11-06-backlog-082-ci-diagnostic.md` | Read-only CI diagnostic that preceded the plan |
| `DOCS/.implementation-logs/2026-11-06_backlog-082-dependency-audit-green.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.github/dependency-audit-policy.json` | `exceptions: []`; threshold and the 14-day limit are unchanged |
| `demo-apps/demoapp001-typescript-cypress/package-lock.json` | Cherry-picks of Dependabot #96 (fast-uri 3.1.9), #97 (body-parser 2.4.0) and #98 (follow-redirects 1.16.2) |
| `demo-apps/demoapp002-python-pytest/requirements-test.lock` | certifi, filelock and msgpack bumped to their fix versions |
| `DOCS/.planning/backlog.md`, `CHANGELOG.md`, `DOCS/.implementation-plans/_index.md` | BACKLOG-082 recorded, and later Resolved |

### Deleted
| File | Reason |
|------|--------|
| None | |

---

## 4. Bugs and Errors Encountered

### CI red on every run since 2026-10-22
**Symptom:** Every Stack job failed at `Dependency audit` with "Policy error: Exception 1 expired on 2026-10-12", then at `Verify DEMOAPPxxx evidence`. Downstream jobs, including Pages, were skipped. CI has no schedule trigger, so the first red run was the first PR after the expiry.
**Root cause:** The policy's single DEMOAPP001 exception expired. The evaluator checks every exception for every Stack, so all three Stacks failed. While a policy error exists it also skips severity classification, which hid four blocking DEMOAPP001 findings and 14 DEMOAPP002 findings.
**Fix:** Removed the exception and remediated the hidden findings through lock updates (PR #101).

### Local Python environment install stalls
**Symptom:** Creating a fresh Python 3.13 environment hung during `ensurepip`, and then during `pip install`, with no output (seen twice in this session and once in the diagnostic).
**Root cause:** Not established; local to this machine.
**Fix:** None. DEMOAPP002 was proven by PR CI instead, as the plan allowed.

---

## 5. Lessons Learned

- A fail-closed policy with expiring exceptions needs a scheduled run. Without one, the expiry surfaced ten days late and went unnoticed in the backlog.
- A policy error that hides severity classification means "remove the exception" is never the whole fix. Re-run the evaluator with the exception removed before planning.
- The must-fail control (new policy against the pre-fix audit output, still `blocking=4`) is a cheap way to prove remediation rather than relaxation.

---

## 6. Current State at End of Session

**Completed this session:**
- PR #101 merged as `624a4af945a9463c93b0060780c12e8a7ba459b9`. PR run 42232061531 passed all five required jobs, with every audit at `status=pass blocking=0`.
- `main` push run 42233130935 passed all seven jobs, including `Build static evidence site` and `Deploy to GitHub Pages`. `/parity/` returns HTTP 200.
- Dependabot PRs #96, #97 and #98 closed as superseded.

**Local evidence (Node v24.18.0, fresh `npm ci`):**
- DEMOAPP001: 113/113 component tests, 8/8 OpenAPI tests, API integration PASS, and BDD 55 scenarios / 309 steps.
- Governed audit: `status=pass findings=2 blocking=0`.
- Negative control: `status=fail findings=11 blocking=4`.
- Policy controls: 13/13; documentation currency: 37/37; RA currency: PASS.

**CI evidence:**
- DEMOAPP002: pytest 30 passed, BDD 55 scenarios.
- DEMOAPP003: 28/28 component tests and 55/55 specs.

**Open:** none for this item. A weekly scheduled audit run was proposed to the owner as a separate follow-up.
