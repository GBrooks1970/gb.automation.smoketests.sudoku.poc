# Implementation Log: BACKLOG-092 / TRIAGE-21 Add Stack job timeouts and PR-scoped CI concurrency

**Date:** 2026-11-09T23:18:00Z
**Session goal:** Harden `.github/workflows/ci.yml` by introducing workflow-level concurrency that cancels superseded in-flight pull request runs while preserving non-cancelling execution on `main`, adding explicit `timeout-minutes: 15` across all three Stack jobs (`demoapp001-typescript-cypress`, `demoapp002-python-pytest`, and `demoapp003-csharp-specflow`), adding `timeout-minutes: 5` to `gate`, keeping Pages deployment concurrency (`group: pages, cancel-in-progress: false`) intact, and leaving `dependency-audit.yml` unchanged.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-21 (Claude review v2 Risk 8 residual, LOW priority), tracked in the project backlog as BACKLOG-092. Under the owner-approved implementation plan (Decisions 1–4):
- Add top-level workflow concurrency to `.github/workflows/ci.yml`:
  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: ${{ github.event_name == 'pull_request' }}
  ```
- Declare `timeout-minutes: 15` on `demoapp001-typescript-cypress`, `demoapp002-python-pytest`, and `demoapp003-csharp-specflow`.
- Declare `timeout-minutes: 5` on `gate`.
- Preserve job-level `concurrency: group: pages, cancel-in-progress: false` on `pages-deploy`.
- Keep `dependency-audit.yml` untouched (it already declares `timeout-minutes: 15` and scheduled non-cancelling concurrency).
- Verify with documentation currency and 7 parity gates.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| PR-scoped workflow concurrency | `cancel-in-progress: ${{ github.event_name == 'pull_request' }}` cancels superseded PR runs while ensuring push runs on `main` run to completion | Under Decision 1 (no new DR required) |
| Standardized 15m timeout for Stack jobs | Empiric runtimes are 30s–3m45s; 15m provides 4x–30x headroom against runner congestion while bounding runaway worker hour consumption | Under Decision 2 (no new DR required) |
| 5m timeout on gate job | Gate is a coordination step running a single `echo` command (~3s); 5m bounds queue time cleanly | Under Decision 2 (no new DR required) |
| Leave `dependency-audit.yml` intact | Weekly scheduled workflow already possesses appropriate non-cancelling concurrency and 15m job timeout | Under Decision 3 (no new DR required) |
| No Decision Record required | Workflow infrastructure hardening only; no reference architecture or solver contract modifications | Under Decision 4 (no new DR required) |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-09-triage-21-ci-timeouts-concurrency.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-09_triage-21-ci-timeouts-concurrency.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.github/workflows/ci.yml` | Added workflow concurrency block and job-level `timeout-minutes` to 3 Stack jobs (15m) and `gate` (5m) |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-092 as Resolved (counts: 9 Open / 0 In Progress / 115 Resolved / 124 Total) |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-092 delivery outcome |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

---

## 4. Bugs and Errors Encountered

None. CI workflow modifications adhered to YAML formatting rules and line ending standards, passing all 5 CI jobs on PR #120 on the first attempt.

---

## 5. Lessons Learned

- Conditional `cancel-in-progress: ${{ github.event_name == 'pull_request' }}` in GitHub Actions allows a single top-level concurrency group to serve both pull requests (cancelling superseded commits) and main branches (running every release/deployment to completion).
- Bounding job runtimes with explicit `timeout-minutes` is critical hygiene to prevent hung runners or stuck subprocesses from burning repository action minutes.
