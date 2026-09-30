# Implementation Log: BACKLOG-075 Parity Evidence Page Build and Publication

**Date:** 2026-09-30T22:43:34Z
**Session goal:** Build and publish the three-Stack parity evidence page approved in DR-047: adapters and a results-level gate, result files in CI evidence, the page builder, and the CI and Pages wiring.
**Outcome:** Completed. The page is live at `/parity/`, published from `main` by the consolidated CI workflow. The owner merged every slice.

This follows `2026-09-30_backlog-075-reqnroll-results-spike.md` and `2026-09-30_backlog-075-mockup-and-ordering-finding.md`, which are append-only and not edited.

---

## 1. Primary Request and Intent

**What was asked:** BACKLOG-075's remaining criteria (DR-047): a results-level gate, a fan-in report job, one Pages artefact, a negative check, and a page built only from run artefacts, following the plan in `DOCS/.planning/todo-parity-evidence-page.md`.

**Scope that emerged:**
- A genuine failing-run check per Stack, before wiring the gate into CI.
- Merging the Pages workflow into `ci.yml` (owner decision D1).
- Recording a test-quality finding as BACKLOG-078.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|-------------|
| Owner decisions D1 to D4: move Pages into `ci.yml` and delete `pages.yml`; tools in `tools/parity-page/`; `gate` absorbs `parity`, keeping its name; landing link as a later separate PR | Recorded in the plan on 2026-09-30, all as recommended | No. DR-047 covers the scope; DR-040 is unchanged and its intent is preserved |
| Compare each Stack's executions against the feature file's own expansion (55 executions, 309 steps), not only against each other | A gate that only compares Stacks can pass when all three drift together | No |
| Order results by feature-file order; read C# by pickle order | NUnit runs Reqnroll scenarios alphabetically (see the previous log) | No |
| Hidden hook steps are ignored for step text but count towards status | A failing `After` hook must fail the execution | No |
| Keep the `gate` job name and add `parity` to its `needs` | One aggregate check; `main` is not branch-protected, so no rule depends on the name | No |
| Publish only from `main`, after the gate, through `pages-build` (no Pages permissions) and `pages-deploy` (deploy-only permissions) | Preserves DR-040's bounds and gates publication on CI, which the old workflow did not | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `tools/parity-page/adapters.mjs` | Reads Cucumber JSON (TypeScript, Python) and Cucumber Messages (C#) into one shape, and expands the feature file |
| `tools/parity-page/check-parity.mjs` | The results-level gate (S1) |
| `tools/parity-page/build-page.mjs`, `template.html`, `page.js` | The page builder, with the negative check (S3) |
| `tools/parity-page/tests/` | 21 `node:test` cases and fixtures trimmed from real CI-written results by `make-fixtures.mjs`, including a trimmed real feature file |
| `demo-apps/demoapp003-csharp-specflow/tests/reqnroll.json` | Enables Reqnroll's `message` formatter (S2) |
| `DOCS/.planning/todo-parity-evidence-page.md` | The build plan and slice status |

### Modified
| File | Change summary |
|------|---------------|
| `.github/workflows/ci.yml` | DEMOAPP002 writes `pytest-cucumber.json`; an `if: always()` step keeps `reqnroll.ndjson`; new `parity`, `pages-build` and `pages-deploy` jobs; `gate` needs `parity` |
| `.batch/check-ci-evidence.ps1`, `.batch/test-ci-evidence-contract.ps1` | Require both new result files; new `ndjson` kind; 21 negative controls (was 19) |
| `.gitignore` | Ignores `/parity-page-dist/` |
| `DOCS/.planning/backlog.md`, `CHANGELOG.md` | BACKLOG-075 closed; BACKLOG-078 opened |

### Deleted
| File | Reason |
|------|--------|
| `.github/workflows/pages.yml` | Merged into `ci.yml`. It deployed on every push to `main` whether or not CI passed |

No solver, feature, puzzle, REST API or Stack source or step-definition file changed, and neither `scripts/check-pages.cjs` nor the visualisation. The only file under a Stack's `tests/` folder is the new `reqnroll.json`, which changes no behaviour (55 of 55 still pass).

---

## 4. Verification and Results

| Check | Result |
|-------|--------|
| `node --test tools/parity-page/tests/*.test.mjs` | 21 passed, 0 failed, about 4 s |
| Genuine failing run per Stack (expected value changed to an impossible 10 in a copy; reverted; nothing committed) | TypeScript 1 failed of 55; Python 1 failed; C# Failed 1, Passed 54. The gate exited 1 on each, naming the scenario as `FAILED` |
| PR #86 CI, run `36783859964`: S1 gate on the three downloaded CI artefacts | 55 / 55 / 55 executions, PARITY PASS; evidence contract 6/6, 6/6 and 7/7 files |
| PR #88 CI, run `36786145054` | Stack jobs green; `Parity gate and evidence page` 14 s; Gate 2 s; Pages jobs skipped on the PR |
| Dry run from the branch, run `36786357914` (`workflow_dispatch`) | All green, `pages-build` included, deploy skipped. Artefact root `index.html` md5 `83469e225423e8c43cd9e1abc6f4acf3`, identical to the live page, and the five static assets identical |
| `main` after #88 (`ab92c23`), run `36786863220` | All seven jobs green: DEMOAPP001 79 s, DEMOAPP002 29 s, DEMOAPP003 32 s, Parity 12 s, Gate 3 s, Build static evidence site 14 s, Deploy to GitHub Pages 11 s |
| Live site after the deployment (created 2026-09-30T22:41:53Z) | Root still md5 `83469e225423e8c43cd9e1abc6f4acf3`; `/parity/` returns 200 and carries `runId` 36786863220 and commit `ab92c23` |
| Live `/parity/` at 375 px (browser pane, mobile preset) | `PARITY PASS`, 55 scenarios, 309 steps each, 165 executions, 165 passed, 165 ticks; no console errors; no horizontal scroll (`scrollWidth` 375); dark theme and toggle present |

---

## 5. Bugs and Errors Encountered

- **Duplicate data declaration.** The first generated `page.js` still contained the `const DATA` placeholder line, which broke the inlined script. Found by a smoke run against a stub DOM, before any PR.
- **Escaped newlines.** Two generated files got literal line breaks inside string literals through shell escaping and failed to parse. Fixed by rewriting them with the file tools.
- **A test that did not test its claim.** One test described a gate that does not fail, but never made the gate blind. Replaced with a test that injects an always-passing gate script and expects the build to reject it.
- **Merge conflicts on #86.** `CHANGELOG.md` and the plan doc changed on both sides after #83 and #85 merged first. Resolved with a merge commit, keeping both entries.

---

## 6. Lessons Learned

- Plant failures into result files to test mapping, but also run a genuine failing test in each Stack: it confirmed the encodings and exposed BACKLOG-078.
- Build the page from CI-written artefacts, not local ones, before wiring CI. Two layout facts (the DEMOAPP001 artefact's nested folders, and C# file size and shape) only showed there.
- A dry run by `workflow_dispatch`, with deployment restricted to `main`, let the Pages restructure be checked byte for byte against the live site before merging.
- Two timestamps in earlier notes of this session were estimated, not read from the clock. Use `date -u`.

---

## 7. Current State at End of Session

**Completed this session:**
- ✅ S1 to S4 merged: #83, #86, #87, #88 (plus #82 and #85 docs).
- ✅ `/parity/` is live, and the visualisation at the site root is unchanged.
- ✅ All seven BACKLOG-075 acceptance criteria met.

**Left incomplete / deferred:**
- ⏸️ The landing-page link (owner decision D4): a separate PR in `GBrooks1970/portfolio`, with its own test baselines and the registry-owner cross-check.
- ⏸️ BACKLOG-078 (weak Then-step assertions) is Open and unscheduled.
- ⏸️ No committed timing baseline; the page shows each run's own timings.
- ⏸️ A genuine failing run is not part of CI; it was checked locally only.

**New backlog items generated:**
- BACKLOG-078, recorded earlier in the session.

---

## 8. Next Steps

1. Add the 'Parity evidence' link to the Sudoku card in `GBrooks1970/portfolio` (D4), and update the portfolio capability matrix in the same PR.
2. Decide whether to schedule BACKLOG-078.
3. After 19 October 2026, confirm the first `main` run on the moved `ubuntu-latest` label is green.

---

*End of Implementation Log*
