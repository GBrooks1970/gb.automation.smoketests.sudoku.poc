# Implementation Log: BACKLOG-087 / TRIAGE-19 single decode on `/api/visualise/:name`

**Date:** 2026-11-08T09:00:00Z
**Session goal:** Make `/api/visualise/:name` decode its path parameter once, as `/api/puzzles/:name` does, so a literal `%` in a name returns 404 rather than 500.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-19 (Claude review v2 Risk 4). The owner approved the [implementation plan](../.implementation-plans/2026-11-08-triage-19-visualise-decode.md) ("Approved both"): remove the second decode (A1); put the regression cases in `api.integration.ts` only; keep the OpenAPI per-path `500` entries; record the malformed-escape 500 as a new LOW root candidate; include the double-encoded assertion; no DR; the main session merging on all-green.

**Scope that emerged:** The plan's probe found that a malformed escape (`%ZZ`) returns 500 on both routes. It is recorded as root TRIAGE-31 and BACKLOG-101, not fixed here.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Remove the second `decodeURIComponent` rather than guard it | Express 5 has already decoded the parameter; a guard would keep the double decode and the double-encoded mismatch | No |
| Regression cases only in `api.integration.ts` | It is the API gate in the acceptance and is not in the fingerprinted execution inventory | No |
| Assert a double-encoded name returns 404 | Proves the route decodes exactly once and agrees with the puzzles route; no client double-encodes | No |
| Keep the OpenAPI per-path `500` entries | The 500 response is real and contract-tested; the defect was a client error reaching it | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-08-triage-19-visualise-decode.md` | Approved plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-08_triage-19-visualise-decode.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts` | Line 104 passes `firstParam(req.params.name)` without a second decode |
| `demo-apps/demoapp001-typescript-cypress/tests/api/api.integration.ts` | Three cases: `100%25` on both routes, double-encoded name on visualise |
| `CHANGELOG.md` | Fixed entry |
| `DOCS/.planning/backlog.md`, `DOCS/.implementation-plans/_index.md`, `DOCS/.implementation-logs/README.md` | BACKLOG-087 recorded, then Resolved; BACKLOG-101 added as Open; plan and log indexed |

### Deleted
| File | Reason |
|------|--------|
| None | |

---

## 4. Bugs and Errors Encountered

### Wall-clock budget tests flaked under local parallel coverage
**Symptom:** `npm run test:coverage` failed one generator performance-budget test on each of two local runs, a different test each time (15.2 ms against a 15 ms average budget; 157 ms against a 150 ms total budget).
**Root cause:** Timing budgets measured under coverage instrumentation with parallel test workers on a busy machine. The files involved are unchanged by this item.
**Fix:** None needed in this item. With `--test-concurrency=1` all 113 passed, and CI's coverage step passed. If CI ever goes red on one of these budgets, re-run once before diagnosing.

---

## 5. Lessons Learned

- Framework routers already decode path parameters; decoding again turns a client miss into a server fault and lets one URL name two different resources.
- A probe beside the defect often finds its neighbour: the malformed-escape 500 shares the error handler, not the double decode, so it became its own item.
- A test harness that stops at the first failure needs a second source of "before" evidence for later cases; a read-only probe against the unchanged code provides it.

---

## 6. Current State at End of Session

**Completed this session:**
- PR #110 (head `65ed5e7`) merged as `be26d730340112f0778e7ff3478605625aaf466d`.
- PR run 42463066910 passed all five required jobs (DEMOAPP001 2m48s, DEMOAPP002 22s, DEMOAPP003 1m58s, parity and `Gate (all stacks green)`).
- `main` run 42463312104 at `be26d73` passed all seven jobs, including Pages build and deploy (deployment 7633561566).

**Local evidence (Node 24.18.0):**
- Must-fail: `test:api` failed with `expected 404 "Not Found", got 500 "Internal Server Error"` before the fix and passed after.
- Probe: `/api/visualise/100%25` 500 to 404; `/api/visualise/Easy%2520Scan%2520Grid` 200 to 404; `Easy%20Scan%20Grid` 200 on both routes throughout.
- `tsc`, lint, format, build PASS; OpenAPI 8/8; components 113/113 (80.11% / 91.94% / 80.17%); BDD 55 scenarios / 309 steps; RA/documentation currency PASS; documentation currency 37/37.

**Open:**
- BACKLOG-101 / root TRIAGE-31: malformed percent-escape returns 500 on both routes.
- The next root worklist item is TRIAGE-24 (BACKLOG-088).
