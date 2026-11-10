---
version: 1
created: 2026-11-10T21:15:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-098 / TRIAGE-28
status: draft
language: en-GB
---

# Implementation plan: BACKLOG-098 / TRIAGE-28 Untrack agent-local settings and explain the legacy Stack directory names

**Goal.** Untrack machine/agent-local settings (`.claude/settings.local.json`) from the git index and ignore them via `.gitignore` while keeping shared team settings (`.claude/settings.json`) tracked; and document in the root `README.md` that Stack directory names (`demoapp001-typescript-cypress`, `demoapp003-csharp-specflow`) are stable legacy IDs (clarifying that DEMOAPP001 demonstrates Cucumber.js + Serenity/JS with no Cypress dependency, and DEMOAPP003 demonstrates Reqnroll) to prevent reader confusion without mutating filesystem paths or breaking existing references and CI contracts.

Source: Root worklist item **TRIAGE-28** (Claude review v2 Risk 11, LOW priority), tracked in the project backlog as **BACKLOG-098**.

---

## Evidence gathered before planning

Audited on 2026-11-10 on branch `worklist/triage-28-untrack-local-settings-legacy-names` cut from `main` @ `a3c4315`:

### 1. Existing Tracked Local Settings (Claude Review v2 Risk 11)
- `.claude/settings.local.json` is currently tracked (`git ls-files .claude` returns `.claude/settings.json` and `.claude/settings.local.json`).
- `.claude/settings.local.json` contains 34 lines of workstation-specific permission allow-rules with absolute paths to a former checkout (`d:\__GB_DEV\_GitHub\...`) and broad execution permissions (`Bash(git checkout *)`, `Bash(npm install:*)`, `PowerShell(Remove-Item -Recurse -Force)`).
- `.claude/settings.json` contains repository-wide shared permissions (`git commit`, `npm test`) and should remain tracked.
- `.gitignore` currently has no entry matching `.claude/` or `*.local.json`.

### 2. Misleading Stack Directory Names (Claude Review v2 Risk 11)
- `demo-apps/demoapp001-typescript-cypress/` contains no Cypress dependency in `package.json`; it implements BDD with Cucumber.js and Serenity/JS.
- `demo-apps/demoapp003-csharp-specflow/` implements BDD with Reqnroll on .NET 10 LTS, not SpecFlow (which was deprecated in favour of Reqnroll).
- Both directory names are documented in `DOCS/.design/naming-conventions.md` (lines 32-33, 126, 137) as stable legacy filesystem IDs that separate filesystem paths from canonical Stack identifiers (`DEMOAPP001_TYPESCRIPT_CYPRESS`, `DEMOAPP003_CSHARP_SPECFLOW`).
- The root `README.md` mentions the directories in the directory tree (lines 70, 77) and in the Demo Applications quick-starts (lines 111, 154), but does not have an explicit prominent note explaining the historical naming convention for skim-readers.

### 3. Currency and Parity Guard Baselines
- `.batch/check-ra-header-currency.ps1` tests `README.md` claims:
  - Stable claims: `public repository status`, `root capability scenario count`, `root three-Stack scenario total`, `root Node runtime`, `root Python runtime`, `root .NET runtime`.
  - Scoped claims: `root five-technique overview` (under `## Overview`), `root solver boundary` (under `## Solving Capabilities`), `root measured counts` (under `## Key Design Principles`), `root historical coverage and mutation labels` (under `## Key Design Principles`).
  - Explanatory notes must be added without modifying the scoped claim headings or text checked by these regular expressions.
- Parity checks: All 8 parity checks and 37 documentation currency negative controls currently pass cleanly.

---

## Proposed Changes

### 1. Git Tracking & Ignore
- Untrack `.claude/settings.local.json` from git while preserving the local file on disk:
  ```bash
  git rm --cached .claude/settings.local.json
  ```
- In `.gitignore`, add a dedicated section:
  ```gitignore
  # Agent and IDE local settings
  .claude/*.local.json
  ```
- Verify that `.claude/settings.json` remains tracked and untracked changes to `settings.local.json` are ignored.

### 2. Root `README.md` Clarification
- In `README.md` under `## Overview` (or `## Demo Applications`):
  Add the exact explanatory sentence recommended by Claude review v2 Risk 11:
  > **Note on directory naming:** Directory names are stable legacy IDs: DEMOAPP001 uses Cucumber.js + Serenity/JS (no Cypress); DEMOAPP003 uses Reqnroll. See [naming-conventions.md](DOCS/.design/naming-conventions.md).
- In the directory structure block of `README.md`:
  Annotate `demoapp001-typescript-cypress/` as `# TypeScript + Node.js (Cucumber.js + Serenity/JS; legacy path)` and ensure `demoapp003-csharp-specflow/` remains annotated as `# C# + Reqnroll (stable legacy path)`.

### 3. Documentation & Changelog
- Record the changes in `CHANGELOG.md` under `[Unreleased] > Changed`:
  - Untracked `.claude/settings.local.json` and added `.claude/*.local.json` to `.gitignore`.
  - Added legacy Stack directory naming explanation to root `README.md`.

---

## Key Decisions for Owner Review

### Decision 1: Git ignore pattern and local preservation
- **Recommendation:** Untrack `.claude/settings.local.json` using `git rm --cached` so developers with existing local settings do not lose their permissions locally. Add `.claude/*.local.json` to `.gitignore` so any future `settings.local.json` or variation is ignored while `.claude/settings.json` remains tracked.
- **Alternative:** Add `*.local.json` globally. *Rejected:* Overly broad; scoped path `.claude/*.local.json` is precise and follows project conventions.

### Decision 2: Location and wording of legacy directory explanation
- **Recommendation:** Add the exact recommended sentence from Claude review v2 Risk 11 as a callout blockquote at the beginning of `## Demo Applications` in `README.md`, and annotate the directory tree under `## Project Structure`.
- **Alternative:** Rename the directories on the filesystem. *Strongly Rejected:* Renaming would break hundreds of file references across documentation, batch scripts, CI workflows, Docker Compose files, and git history, violating the architectural stability principle established in `DOCS/.design/naming-conventions.md`.

### Decision 3: No Decision Record required
- **Recommendation:** Confirm no Decision Record is required for TRIAGE-28 (recorded as `None expected` in backlog). This is repository hygiene, configuration cleanup, and documentation clarification of existing naming decisions (DR-016).

### Decision 4: Verification and delivery sequence
- **Recommendation:** Execute in two standard stages:
  1. Implementation PR (`worklist/triage-28-untrack-local-settings-legacy-names`): Untrack `.claude/settings.local.json`, update `.gitignore`, update `README.md`, update `CHANGELOG.md`, pass all 8 parity gates and 37 currency controls, merge on green.
  2. Outcome PR (`worklist/triage-28-outcome`): Update backlog to `Resolved` (3 Open / 0 In Progress / 121 Resolved / 124 Total), advance implementation plan to `delivered`, author implementation log, merge on green, tick root worklist item `- [x] TRIAGE-28`.

---

## Implementation Phases

### Phase 1: Planning & Approval
1. Author implementation plan `DOCS/.implementation-plans/2026-11-10-triage-28-untrack-local-settings-legacy-names.md` with status `draft`.
2. Add plan to `DOCS/.implementation-plans/_index.md`.
3. Commit draft plan and index to `worklist/triage-28-untrack-local-settings-legacy-names`.
4. Submit plan and Decisions 1–4 for owner approval.

### Phase 2: Configuration Updates (Post-Approval)
1. Mark BACKLOG-098 as `In Progress` in `DOCS/.planning/backlog.md` (3 Open / 1 In Progress / 120 Resolved / 124 Total).
2. Update plan status to `approved`.
3. Untrack `.claude/settings.local.json`: `git rm --cached .claude/settings.local.json`.
4. Add `.claude/*.local.json` to `.gitignore`.
5. Update `README.md` with legacy directory naming callout.
6. Add entry to `CHANGELOG.md`.

### Phase 3: Validation & Parity Gates
1. Run `git status` to verify `.claude/settings.local.json` is untracked and ignored, and `.claude/settings.json` is untouched.
2. Run `.batch/check-ra-header-currency.ps1`.
3. Run `.batch/run-parity-checks.ps1` (all 8 parity gates).
4. Run `docker compose config`.

### Phase 4: Implementation PR & CI
1. Commit changes to `worklist/triage-28-untrack-local-settings-legacy-names`.
2. Push branch and open Implementation PR for BACKLOG-098 / TRIAGE-28.
3. Monitor CI checks to green and merge with `--match-head-commit`.

### Phase 5: Outcome PR & Worklist Closure
1. Fast-forward local `main`.
2. Cut `worklist/triage-28-outcome` branch.
3. Mark BACKLOG-098 as `Resolved` in `DOCS/.planning/backlog.md` (Summary: 3 Open / 0 In Progress / 121 Resolved / 124 Total).
4. Author implementation log `DOCS/.implementation-logs/2026-11-10_triage-28-untrack-local-settings-legacy-names.md` and index.
5. Update implementation plan status to `delivered`.
6. Open Outcome PR, monitor CI to green, merge with `--match-head-commit`.
7. Update root `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with merge SHAs.

---

## Risk Analysis & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Accidental deletion of local settings file | Developer/agent loses local permissions | Medium | Use `git rm --cached` (not `git rm`), which removes the file from the index while keeping the working copy intact. |
| Inadvertently ignoring `.claude/settings.json` | Loss of shared team permissions tracking | Low | Use explicit pattern `.claude/*.local.json` in `.gitignore` rather than `.claude/*`. |
| Documentation currency check break | Parity gate failure in `check-ra-header-currency.ps1` | Low | Ensure the new callout in `README.md` does not alter existing regex-matched claims or section headers checked by the currency guard. Verified locally before commit. |
