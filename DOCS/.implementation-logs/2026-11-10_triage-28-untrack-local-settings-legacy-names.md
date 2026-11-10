# Implementation Log: BACKLOG-098 / TRIAGE-28 Untrack agent-local settings and explain the legacy Stack directory names

**Date:** 2026-11-10T21:45:00Z
**Session goal:** Untrack machine/agent-local settings (`.claude/settings.local.json`) from the git index and ignore them via `.gitignore` while keeping team-shared settings (`.claude/settings.json`) tracked; document in the root `README.md` that Stack directory names (`demoapp001-typescript-cypress`, `demoapp003-csharp-specflow`) are stable legacy IDs (DEMOAPP001 uses Cucumber.js + Serenity/JS with no Cypress; DEMOAPP003 uses Reqnroll) to prevent reader confusion without mutating filesystem paths; and validate that all 8 parity gates and 37 documentation currency negative controls pass cleanly.
**Outcome:** Completed (PR #135 / `ced4df8`)

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-28 (Claude review v2 Risk 11, LOW priority), tracked in the project backlog as BACKLOG-098. Under the owner-approved implementation plan (Decisions 1–4):
- Remove `.claude/settings.local.json` from git tracking (`git rm --cached`) while preserving the file on local disk, and add `.claude/*.local.json` to `.gitignore`.
- Keep the team-shared configuration `.claude/settings.json` tracked in git.
- Add an explanatory callout under `## Demo Applications` in root `README.md` clarifying that directory names are stable legacy IDs (DEMOAPP001 uses Cucumber.js + Serenity/JS with no Cypress; DEMOAPP003 uses Reqnroll), and annotate the directory tree under `## Project Structure`.
- Record changes in `CHANGELOG.md` under `[Unreleased] > Changed`.
- Validate against all 8 repository parity gates and 37 documentation currency negative controls.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Untrack `.claude/settings.local.json` using `git rm --cached` | Removes workstation-specific paths and broad execution permissions from the repository while keeping local configurations intact for active developers | None required (repository hygiene & config cleanup) |
| Ignore `.claude/*.local.json` in `.gitignore` | Scoped ignore pattern prevents accidental re-commitment of local settings while keeping shared `.claude/settings.json` tracked | None required |
| Retain directory names on disk and clarify in `README.md` | Renaming filesystem directories would break hundreds of references across documentation, scripts, CI workflows, Docker Compose, and git history; a clear callout in `README.md` prevents skim-reader confusion | None required (aligns with DR-016) |
| No Decision Record required | Confirmed no new architectural standard is introduced; tracked as `None expected` in backlog | None required |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-10-triage-28-untrack-local-settings-legacy-names.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-10_triage-28-untrack-local-settings-legacy-names.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.claude/settings.local.json` | Removed from git tracking (deleted from index; preserved locally) |
| `.gitignore` | Added `.claude/*.local.json` to agent and IDE local settings section |
| `README.md` | Added legacy directory naming callout under `## Demo Applications` and annotated project directory tree |
| `CHANGELOG.md` | Added BACKLOG-098 entry under `[Unreleased] > Changed` |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-098 Resolved; updated sprint focus, summary counts (3 Open / 0 In Progress / 121 Resolved / 124 Total), and detailed section |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-098 entry to Delivered with merge metadata |
| `DOCS/.implementation-logs/README.md` | Indexed new implementation log |

---

## 4. Verification

- Git Tracking: `git ls-files .claude` confirms only `.claude/settings.json` is tracked; `.claude/settings.local.json` remains present on disk and ignored.
- `.batch/check-ra-header-currency.ps1`: PASS (Active RA version: v1.16; accepted range DR-001 through DR-052; all targets match).
- `.batch/test-documentation-currency.ps1`: PASS (37/37 negative controls rejected).
- `.batch/run-parity-checks.ps1`: PASS (all 8 parity gates clean: RA currency, doc currency, audit policy, CI evidence, memory keys, feature parity, step text parity, puzzles parity).
- Implementation PR [#135](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/135) merged cleanly as `ced4df8` after all 5 CI jobs passed (run 42908287976).
