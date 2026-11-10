# Implementation Log: BACKLOG-093 / TRIAGE-22 Pin workflow actions to full SHAs and commit a Dependabot configuration

**Date:** 2026-11-09T23:55:00Z
**Session goal:** Pin all 25 GitHub action references (`uses:`) across `.github/workflows/ci.yml` (20 occurrences) and `.github/workflows/dependency-audit.yml` (5 occurrences) to full 40-character commit SHAs with inline version comments, author and commit a canonical `.github/dependabot.yml` configuration covering `github-actions` on a weekly schedule, document the root cause of the failed dynamic Dependabot run observed at triage, and verify both CI and dependency audit workflows to green.
**Outcome:** Completed (PR #122 / `5ebcec6`)

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-22 (Claude review v2 Risk 8 residual, LOW priority), tracked in the project backlog as BACKLOG-093. Under the owner-approved implementation plan (Decisions 1–4):
- Pin every `uses:` in `.github/workflows/ci.yml` and `.github/workflows/dependency-audit.yml` to full 40-character commit SHAs with inline version comments:
  - `actions/checkout@v7` -> `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7`
  - `actions/setup-node@v7` -> `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7`
  - `actions/setup-python@v6` -> `actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1 # v6`
  - `actions/setup-dotnet@v5` -> `actions/setup-dotnet@26b0ec14cb23fa6904739307f278c14f94c95bf1 # v5`
  - `actions/upload-artifact@v7` -> `actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7`
  - `actions/download-artifact@v7` -> `actions/download-artifact@37930b1c2abaa49bbe596cd826c3c89aef350131 # v7`
  - `actions/upload-pages-artifact@v5` -> `actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5`
  - `actions/deploy-pages@v5` -> `actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5`
- Author and commit `.github/dependabot.yml` configured for `package-ecosystem: "github-actions"` on a weekly schedule.
- Explicitly document why language package managers (`npm`, `pip`, `nuget`) are omitted: they are strictly governed by locked restores under DR-039 / DR-048 (`package-lock.json`, `requirements-test.lock`, `packages.lock.json`) and audited weekly via `.github/workflows/dependency-audit.yml`.
- Investigate and document root cause of failed dynamic Dependabot run `42237665533` (2026-11-06T14:51Z).
- Verify with documentation currency negative controls and all 7 parity gates.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Pin all 25 actions to verified runner commit SHAs | Protects CI pipeline against upstream tag mutability or action supply-chain tampering while retaining inline `# vX` comments for legibility | Under Decision 1 (no new DR required) |
| Author `.github/dependabot.yml` for `github-actions` only | Automates action version updates with PR limit 5, while omitting language package managers governed by DR-039 / DR-048 locked restores | Under Decision 2 (no new DR required) |
| Root cause analysis of dynamic Dependabot failure | Run `42237665533` failed attempting unconstrained npm install of `minimatch` under `@typescript-eslint/eslint-plugin` peer dependency conflicts, demonstrating why uncoordinated automated bumps conflict with locked restores | Under Decision 3 (no new DR required) |
| No Decision Record required | Workflow supply-chain hardening only; does not alter solver behaviour, Gherkin features, or platform specification | Under Decision 4 (no new DR required) |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `.github/dependabot.yml` | Dependabot configuration for GitHub Actions weekly updates |
| `DOCS/.implementation-plans/2026-11-09-triage-22-pin-workflow-actions.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-09_triage-22-pin-workflow-actions.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.github/workflows/ci.yml` | Pinned 20 action references to full 40-character commit SHAs with inline comments |
| `.github/workflows/dependency-audit.yml` | Pinned 5 action references to full 40-character commit SHAs with inline comments |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-093 as Resolved (counts: 8 Open / 0 In Progress / 116 Resolved / 124 Total) |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-093 delivery outcome |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

---

## 4. Bugs and Errors Encountered

None. All 25 action pins mapped directly to verified download hashes captured from runner execution telemetry, passing both `CI` (run 42724029815) and `Dependency audit` (run 42724029722) on PR #122 without any failures.

---

## 5. Lessons Learned

- Pinning actions to 40-character SHAs with trailing `# vX` version comments satisfies security scanners and supply chain integrity requirements without sacrificing developer readability.
- Configuring Dependabot for `github-actions` ensures pinned SHAs remain updateable automatically via pull requests while avoiding collision with deterministic language lockfile restores.
