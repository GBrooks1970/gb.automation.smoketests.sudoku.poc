---
version: 1
created: 2026-11-09T21:05:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-092 / TRIAGE-21
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-092 / TRIAGE-21 Add Stack job timeouts and PR-scoped CI concurrency

**Goal.** Harden `.github/workflows/ci.yml` by adding explicit job-level `timeout-minutes` to all unbounded jobs (`demoapp001-typescript-cypress`, `demoapp002-python-pytest`, `demoapp003-csharp-specflow`, and `gate`) and configuring workflow-level concurrency that cancels superseded in-progress runs for pull requests (`refs/pull/*/merge`) while running `main` pushes to completion. Preserve the job-level Pages deployment concurrency (`group: pages, cancel-in-progress: false`) and leave `dependency-audit.yml` unchanged.

Source: Root worklist item **TRIAGE-21** (Claude v2 review Risk 8 residual, LOW priority), tracked in the project backlog as **BACKLOG-092**.

---

## Evidence gathered before planning

Audited on 2026-11-09 on branch `worklist/triage-21-ci-timeouts-concurrency` cut from `main` @ `ef1c233`:

### 1. Workflow Concurrency Audit

Inspection of `.github/workflows/ci.yml`:
- Currently, there is **no top-level `concurrency` block**.
- Consequence: When multiple commits are rapidly pushed to an active pull request, multiple redundant workflow runs execute simultaneously, consuming GitHub Actions minutes and runner quotas without providing value.
- In contrast, `pages-deploy` (lines 388–390) explicitly defines its own job-level concurrency:
  ```yaml
  concurrency:
    group: pages
    cancel-in-progress: false
  ```
- And `dependency-audit.yml` (lines 20–22) defines non-cancelling weekly concurrency:
  ```yaml
  concurrency:
    group: dependency-audit-${{ github.ref }}
    cancel-in-progress: false
  ```

### 2. Job Timeout Audit

Inspection of job-level `timeout-minutes` in `.github/workflows/ci.yml`:
- `demoapp001-typescript-cypress` (lines 15–18): **None** (unbounded, defaults to GitHub Actions default of 360 minutes / 6 hours).
- `demoapp002-python-pytest` (lines 118–121): **None** (unbounded).
- `demoapp003-csharp-specflow` (lines 177–180): **None** (unbounded).
- `parity` (lines 246–252): Has `timeout-minutes: 10`.
- `gate` (lines 305–308): **None** (unbounded).
- `pages-build` (lines 318–327): Has `timeout-minutes: 15`.
- `pages-deploy` (lines 374–381): Has `timeout-minutes: 10`.

### 3. Empirical Duration Baselines (Captured from Recent CI Runs)

From recent CI runs on GitHub Actions (e.g. PR #118 run `42695824590` and PR #119 run `42697219051`):
| Job | Typical CI Duration | Proposed `timeout-minutes` | Headroom Factor |
|---|---|---|---|
| `demoapp001-typescript-cypress` | 3m 02s – 3m 46s | 15 | ~4x – 5x |
| `demoapp002-python-pytest` | 27s – 34s | 15 | ~25x – 30x |
| `demoapp003-csharp-specflow` | 1m 45s – 2m 38s | 15 | ~6x – 8x |
| `parity` | 10s | 10 (existing) | ~60x |
| `gate` | 3s | 5 | ~100x |
| `pages-build` | ~1m | 15 (existing) | ~15x |
| `pages-deploy` | ~20s | 10 (existing) | ~30x |

---

## Decisions for Owner Review

### Decision 1: Workflow-Level Concurrency Pattern
- **Options:**
  - *Option A (Recommended):*
    ```yaml
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: ${{ github.event_name == 'pull_request' }}
    ```
    - Rationale: For pull requests (`github.event_name == 'pull_request'`), `cancel-in-progress` evaluates to `true`. When a new commit is pushed to the PR branch, superseded in-flight jobs are safely cancelled.
    - For `push` to `main` (or `workflow_dispatch`), `cancel-in-progress` evaluates to `false`. Every commit on `main` runs to completion and publishes deployment artifacts.
    - Preserves job-level concurrency on `pages-deploy` (`group: pages, cancel-in-progress: false`).
  - *Option B:* `group: ci-${{ github.ref }}` with hardcoded `cancel-in-progress: true`.
    - Risk: This would cancel push runs on `main` if multiple PR merges land in quick succession. Not recommended.
- **Recommendation:** Approve Option A.

### Decision 2: Stack Job and Gate Timeouts
- **Options:**
  - *Option A (Recommended):* Set `timeout-minutes: 15` on `demoapp001-typescript-cypress`, `demoapp002-python-pytest`, and `demoapp003-csharp-specflow`. Set `timeout-minutes: 5` on `gate`.
    - Rationale: Standardizes on 15 minutes across all three Stacks (matching `pages-build` and `dependency-audit.yml`), ensuring ample headroom against runner congestion while preventing runaway runner hour consumption.
  - *Option B:* Set tighter timeouts based on per-stack runtimes (e.g. 5m for Python, 8m for C#, 10m for TS).
    - Risk: Transient Ubuntu runner network slowdowns during `npm ci` or `dotnet restore` could cause flaky timeouts.
- **Recommendation:** Approve Option A.

### Decision 3: Boundary & Verification Plan
- **Plan:**
  1. Update `.github/workflows/ci.yml` with concurrency and timeout declarations.
  2. Leave `dependency-audit.yml` unchanged (it already has `timeout-minutes: 15` and scheduled non-cancelling concurrency).
  3. Verify with local checks:
     - Run `.batch/check-ra-header-currency.ps1` to confirm `ci.yml` parsing remains clean.
     - Run `.batch/test-documentation-currency.ps1` to ensure YAML line ending and formatting currency.
     - Run full parity checks (`.batch/run-parity-checks.ps1`).
  4. Push branch `worklist/triage-21-ci-timeouts-concurrency` and open PR.
  5. Verify all 5 PR CI jobs pass.
  6. Deliver outcome PR, update root worklist, and mark BACKLOG-092 Resolved.
- **Recommendation:** Approve as proposed.

### Decision 4: No Decision Record Required
- **Rationale:** This is standard CI infrastructure hardening (LOW priority, Claude v2 Risk 8 residual) that does not alter domain logic, test scenarios, or reference architecture standards.
- **Recommendation:** No DR required.

---

## Execution Steps (Post-Approval)

1. **Backlog Transition:** Mark BACKLOG-092 as `In Progress` in `DOCS/.planning/backlog.md` (counts: 9 Open / 1 In Progress / 114 Resolved / 124 Total).
2. **Implementation:** Edit `.github/workflows/ci.yml` to insert workflow concurrency and job timeouts.
3. **Verification:** Run documentation currency, parity checks, and validate YAML syntax.
4. **PR & Merge:** Push `worklist/triage-21-ci-timeouts-concurrency`, open PR, watch CI, and merge on all-green.
5. **Outcome:** Open and merge outcome PR, update root worklist tick.
