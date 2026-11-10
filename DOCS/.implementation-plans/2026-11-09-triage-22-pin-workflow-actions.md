---
version: 1
created: 2026-11-09T23:30:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-093 / TRIAGE-22
status: delivered
language: en-GB
---

# Implementation plan: BACKLOG-093 / TRIAGE-22 Pin workflow actions to full SHAs and commit a Dependabot configuration

**Goal.** Pin every GitHub action reference (`uses:`) across `.github/workflows/ci.yml` and `.github/workflows/dependency-audit.yml` to full 40-character commit SHAs with inline version comments, commit a canonical `.github/dependabot.yml` configuration covering `github-actions`, document the investigation into the failed dynamic Dependabot run observed at triage, and record why language package managers (`pip`, `npm`, `nuget`) are governed by DR-039 / DR-048 locked restores rather than automated uncoordinated PRs.

Source: Root worklist item **TRIAGE-22** (Claude v2 review Risk 8 residual, LOW priority), tracked in the project backlog as **BACKLOG-093**.

---

## Evidence gathered before planning

Audited on 2026-11-09 on branch `worklist/triage-22-pin-workflow-actions` cut from `main` @ `9174000`:

### 1. Workflow Actions Inventory

Current unpinned action references in the repository:
- In `.github/workflows/ci.yml` (20 occurrences across 7 jobs):
  - `actions/checkout@v7` (4 occurrences)
  - `actions/setup-node@v7` (3 occurrences)
  - `actions/setup-python@v6` (1 occurrence)
  - `actions/setup-dotnet@v5` (1 occurrence)
  - `actions/upload-artifact@v7` (4 occurrences)
  - `actions/download-artifact@v7` (4 occurrences)
  - `actions/upload-pages-artifact@v5` (1 occurrence)
  - `actions/deploy-pages@v5` (1 occurrence)
  - Gate job has no actions (`run: echo ...`).

- In `.github/workflows/dependency-audit.yml` (5 occurrences in `audit` job):
  - `actions/checkout@v7` (1 occurrence)
  - `actions/setup-node@v7` (1 occurrence)
  - `actions/setup-python@v6` (1 occurrence)
  - `actions/setup-dotnet@v5` (1 occurrence)
  - `actions/upload-artifact@v7` (1 occurrence)

### 2. Empirical Action SHA Resolution (Captured from Live CI Logs)

From the runner logs of recent CI runs (run `42718709534` on PR #120 and run `42640018272` on `main`):
| Action | Tag | Resolved 40-character Commit SHA |
|---|---|---|
| `actions/checkout` | `v7` | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | `v7` | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `actions/setup-python` | `v6` | `ece7cb06caefa5fff74198d8649806c4678c61a1` |
| `actions/setup-dotnet` | `v5` | `26b0ec14cb23fa6904739307f278c14f94c95bf1` |
| `actions/upload-artifact` | `v7` | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| `actions/download-artifact` | `v7` | `37930b1c2abaa49bbe596cd826c3c89aef350131` |
| `actions/upload-pages-artifact` | `v5` | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages` | `v5` | `368f82528645a54fb793d4d04e342629a3f51346` |

### 3. Investigation of Failed "Dependabot Updates" Run

Worklist acceptance requires investigating the failed run:
- **Run ID:** `42237665533` (event: `dynamic`, commit: `99111e0` on `main`, timestamp: 2026-11-06T14:51:29Z).
- **Log findings:**
  - In the absence of a committed `.github/dependabot.yml`, GitHub triggered an automated dynamic security update attempt for `minimatch` in `demo-apps/demoapp001-typescript-cypress`.
  - The updater container executed `/bin/sh -c $DEPENDABOT_HOME/dependabot-updater/bin/run update_files`.
  - `minimatch` was a transitive dependency of `@typescript-eslint/eslint-plugin`. Because `npm install` encountered strict peer dependency constraints without developer-specified overrides, the automated container exited with code 1:
    `"The updater encountered one or more errors ... 1. Update @typescript-eslint/eslint-plugin to versions that support the patched minimatch, or 2. Add an override/resolution to pin minimatch"`.
- **Root cause:** Dynamic Dependabot security updates run without repository policy boundaries. Committing an explicit `.github/dependabot.yml` takes control of Dependabot behaviour and scopes updates to manageable, policy-aligned ecosystems.

---

## Decisions for Owner Review

### Decision 1: Pinning Format and Scope
- **Options:**
  - *Option A (Recommended):* Pin all 25 `uses:` occurrences across `.github/workflows/ci.yml` and `.github/workflows/dependency-audit.yml` to the exact 40-character commit SHAs captured from CI logs, formatted with trailing version comments:
    ```yaml
    uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
    uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7
    uses: actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1 # v6
    uses: actions/setup-dotnet@26b0ec14cb23fa6904739307f278c14f94c95bf1 # v5
    uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7
    uses: actions/download-artifact@37930b1c2abaa49bbe596cd826c3c89aef350131 # v7
    uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5
    uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5
    ```
  - *Option B:* Pin only `ci.yml` and leave `dependency-audit.yml` unpinned.
- **Recommendation:** Approve Option A. Pinning both files ensures immutable supply-chain security across all repository workflows.

### Decision 2: Dependabot Configuration Scope (`.github/dependabot.yml`)
- **Options:**
  - *Option A (Recommended):* Commit `.github/dependabot.yml` configured for `package-ecosystem: "github-actions"` on a weekly schedule. Document within the file why language package managers (`pip`, `npm`, `nuget`) are excluded:
    1. Language dependencies across DEMOAPP001, DEMOAPP002, and DEMOAPP003 are intentionally governed by DR-039 / DR-048 via locked manifests (`package-lock.json`, `requirements-test.lock`, `packages.lock.json` with `--locked-mode`) and audited weekly by `dependency-audit.yml`.
    2. Automatic, uncoordinated Dependabot PRs for `npm` or `pip` break locked restore constraints and fail on peer dependencies (as demonstrated by the investigated dynamic failure).
  - *Option B:* Add `pip` (and/or `npm` and `nuget`) to `dependabot.yml`.
    - Risk: Dependabot PRs would alter `pyproject.toml` or `package.json` without updating the required companion locks (`requirements-test.lock`), failing CI and violating DR-039.
- **Recommendation:** Approve Option A.

### Decision 3: Boundary & Verification Plan
- **Plan:**
  1. Pin all 20 action references in `ci.yml` and all 5 action references in `dependency-audit.yml`.
  2. Create and commit `.github/dependabot.yml`.
  3. Verify with local checks:
     - `.batch/check-ra-header-currency.ps1` (verifies `ci.yml` remains parseable and python-version regex matches).
     - `.batch/test-documentation-currency.ps1` (verifies LF line endings on workflows).
     - Full parity checks (`.batch/run-parity-checks.ps1`).
  4. Push branch `worklist/triage-22-pin-workflow-actions` and open PR.
  5. PR triggers both `CI` (5 required jobs) and `Dependency audit` (3 stack jobs triggered by `paths: [.github/workflows/dependency-audit.yml]`), verifying both workflows in a single PR.
  6. Deliver outcome PR, update root worklist tick, and mark BACKLOG-093 Resolved.
- **Recommendation:** Approve as proposed.

### Decision 4: No Decision Record Required
- **Rationale:** Standard CI security hardening (Risk 8 residual, LOW priority). Does not change solver behaviour, Gherkin features, or platform specification.
- **Recommendation:** No DR required.

---

## Execution Steps (Post-Approval)

1. **Backlog Transition:** Mark BACKLOG-093 as `In Progress` in `DOCS/.planning/backlog.md` (counts: 8 Open / 1 In Progress / 115 Resolved / 124 Total).
2. **Action Pinning:** Update `.github/workflows/ci.yml` and `.github/workflows/dependency-audit.yml` with the exact 40-character SHAs and version comments.
3. **Dependabot Config:** Author `.github/dependabot.yml` covering `github-actions` with rationale comments for package manager exclusion.
4. **Local Verification:** Run documentation currency, parity checks, and validate YAML formatting.
5. **PR & Merge:** Push `worklist/triage-22-pin-workflow-actions`, open PR, watch CI (both CI and audit workflows), and merge on all-green.
6. **Outcome:** Open and merge outcome PR, update root worklist tick.

---

## Outcome and Verification

Delivered in PR #122 (`5ebcec6`), merged into `main` on 2026-11-09.

- **Pinned Actions**: Pinned all 20 action references in `.github/workflows/ci.yml` and all 5 action references in `.github/workflows/dependency-audit.yml` to full 40-character commit SHAs with inline version comments (`# v7`, `# v6`, `# v5`).
- **Dependabot Configuration**: Created and committed `.github/dependabot.yml` configured for `package-ecosystem: "github-actions"` on a weekly schedule (PR limit 5). Language ecosystems documented as governed by locked restores under DR-039 / DR-048.
- **RCA of Dynamic Run**: Documented root cause of failed dynamic Dependabot run `42237665533` in Section 3 of this plan.
- **CI & Audit Verification**: PR #122 triggered both `CI` (run `42724029815`) and `Dependency audit` (run `42724029722`), with all jobs passing completely.
- **Parity & Currency**: All 7 parity gates and documentation currency negative controls (37/37 rejected) passed 100% green.
