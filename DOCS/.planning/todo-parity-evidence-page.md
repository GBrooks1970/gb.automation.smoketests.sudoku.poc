# TODO: Three-Stack Parity Evidence Page

**Created:** 2026-09-30T18:33:09Z
**Last Updated:** 2026-09-30T18:44:53Z
**Backlog Reference:** BACKLOG-075 (Three-stack parity evidence page)
**Stack(s):** All (DEMOAPP001, DEMOAPP002, DEMOAPP003)
**Decision:** DR-047 (accepted 2026-09-30). DR-040 stays in force for the visualisation.
**Estimated Effort:** 14 to 19 hours across five PRs (an estimate; the spike and mock-up are already done)

---

## Overview

Build plan for the parity page at `/parity/` that the owner approved as a mock-up on 2026-09-30. It covers the remaining criteria of BACKLOG-075: a results-level gate, a fan-in report job, one Pages artefact, a negative check, and a page built only from run artefacts.

This plan restructures CI, which DR-047 says to agree with the owner first. The four decisions in section 3 were answered on 2026-09-30, so S1 to S4 can proceed.

The approach follows `loan-origination-parity` (LOP), whose `tools/check-parity.mjs` and `tools/build-reports.mjs` already do this for four surfaces: a Node gate over each surface's Cucumber results, and a builder that writes one self-contained HTML page and fails unless the gate is shown to fail on a planted change.

---

## Status Legend

| Field | Allowed values |
|-------|----------------|
| Done | `[ ]` not complete, `[x]` complete |
| Status | `Not Started`, `In Progress`, `Blocked`, `Complete`, `Skipped` |

---

## 1. Current Baseline (read from `main` `b60111e`)

| Area | State |
|------|-------|
| Results files in CI evidence | DEMOAPP001 already writes `test-results/cucumber.json`. DEMOAPP002 writes only `test-results/pytest-junit.xml`. DEMOAPP003 writes `test-results/reqnroll.trx`. The contract is `.batch/check-ci-evidence.ps1` (lines 14 to 35), with negative controls in `.batch/test-ci-evidence-contract.ps1` |
| Evidence artefacts | Each Stack job uploads `demoappNNN-ci-evidence` with `retention-days: 7` |
| Current gate job | `gate` ("Gate (all stacks green)") only runs `echo "all stacks green"` after the three Stack jobs |
| Pages | `.github/workflows/pages.yml` builds DEMOAPP001 only and deploys on every push to `main`, without waiting for CI. Example: at `6559b37`, Pages run `36752340564` succeeded while CI run `36752340605` failed |
| Branch protection | `main` is not protected (API returns 404), so no check name is required by the platform |
| Spike result | C# results come from Reqnroll's `message` formatter, which wrote `cucumber-messages/reqnroll.ndjson` under the test output folder. See the spike log |
| Adapter rules | Drop hidden hook steps (DEMOAPP001). Key results by (scenario name, occurrence index) in feature order. Read C# in pickle order, because NUnit runs scenarios alphabetically. Convert durations to milliseconds. See the two implementation logs |
| Main CI | Green at `1170508` (run `36755560842`) and `b60111e` (run `36757011984`) |

---

## 2. Target Design

**New files** (Node 24, no npm dependencies, like LOP):

| File | Purpose |
|------|---------|
| `tools/parity-page/adapters.mjs` | Loads Cucumber JSON (TypeScript, Python) and Cucumber Messages (C#) into one shape: scenario key, ordered steps, status, duration in ms |
| `tools/parity-page/check-parity.mjs` | The results-level gate. Fails on differing scenario counts, keys or order, step text, or any scenario not passed. Honours `PARITY_RESULTS_DIR` so the builder can run it on a tampered copy |
| `tools/parity-page/build-page.mjs` | Builds `parity/index.html` from the three result files, the feature file and the three step-definition sources, then runs the negative check. Fails if any source, snippet or result is missing |
| `tools/parity-page/template.html`, `page.js` | The approved mock-up, with its banner removed and data placeholders added |
| `tools/parity-page/tests/*.test.mjs`, `fixtures/` | Unit tests run with `node --test`. Fixtures are trimmed from real results (scenarios including the 8-row outline) by a script, not written by hand |

**CI shape** (`ci.yml`):

| Job | When | Does |
|-----|------|------|
| three Stack jobs | unchanged, plus new result files in evidence | as today |
| `parity` (new) | pull requests and `main`, after the three Stack jobs | Downloads the three evidence artefacts, runs the unit tests, runs the gate, builds the page with the negative check, uploads `parity-page` |
| `gate` ("Gate (all stacks green)") | unchanged name | `needs` gains `parity`, so the existing aggregate check now includes the results-level gate |
| `pages-build` (new) | `main` only, after `gate` | Builds the DEMOAPP001 visualisation exactly as `pages.yml` does today, runs `scripts/check-pages.cjs`, then adds `parity/` from the `parity-page` artefact, and uploads one Pages artefact. No Pages permissions |
| `pages-deploy` (new) | `main` only, after `pages-build` | Deploy-only `pages: write` and `id-token: write`, as DR-040 requires |

`pages.yml` is removed in the same PR, so there is one workflow and one Pages deployment.

**Unchanged:** the solver, features, puzzle data, REST API, every Stack's behaviour, `scripts/check-pages.cjs` and the visualisation itself.

---

## 3. Decisions (all answered by the owner on 2026-09-30, as recommended)

| # | Decision | Answer | Why |
|---|----------|----------------|-----|
| D1 | How to get one Pages artefact: (a) move the visualisation build and deploy into `ci.yml` and delete `pages.yml`, or (b) keep `pages.yml` and have it fetch the `parity-page` artefact from the CI run | (a) | It mirrors LOP and gates publication on CI, which today's Pages workflow does not. (b) keeps two workflows and needs cross-workflow artefact access |
| D2 | Where the new tools live: a new root `tools/parity-page/`, or under `tooling/` | `tools/parity-page/` | `tooling/` holds only the performance Dockerfile; a Node toolset fits better beside LOP's layout. Either is cheap to change now |
| D3 | Should `gate` absorb the new `parity` job? | Yes, keep the name | No platform rule depends on the name, and one aggregate check is easier to read |
| D4 | Landing page: add a 'Parity evidence' link for the Sudoku card after publication | Yes, as a separate PR in `GBrooks1970/portfolio` | LOP did the same (portfolio#52). Needs that repo's three test baselines and parity guard, and the registry-owner cross-check, so it is out of scope for BACKLOG-075 unless you say otherwise |

---

## 4. Slices (one PR each; the owner merges)

| Done | Status | Slice | Acceptance check |
|------|--------|-------|------------------|
| [x] | Complete | **S1. Adapters, gate and unit tests** (`tools/parity-page/`, not wired into CI) | `node --test` passes on fixtures trimmed from real results. Cases: clean pass; one-word step-text change fails; a failed step fails in each of the three formats; C# results in execution order still pass (pickle order); outline rows stay distinct; hidden hook steps ignored; count mismatch fails. The gate exits 0 on the real local results and 1 on the planted copies |
| [ ] | In Progress | **S2. Emit and require the result files** (`ci.yml` Stack jobs, evidence contract) | DEMOAPP002 writes `test-results/pytest-cucumber.json`. DEMOAPP003 enables the `message` formatter through `tests/reqnroll.json` and a copy step puts `reqnroll.ndjson` into evidence, following the existing `component.trx` copy step. `check-ci-evidence.ps1` requires both new files and `test-ci-evidence-contract.ps1` has a negative control for each. All three evidence artefacts contain their result file in PR CI |
| [ ] | In Progress | **S3. Page builder and template** | `node tools/parity-page/build-page.mjs` builds `parity/index.html` from the S2 artefacts. It fails with a clear message when a result file, the feature file or a step-definition snippet is missing. The negative check runs inside the build and fails the build if the gate does not fail on the planted change. The output has no hand-typed results. Also checked at phone width and in both themes, with the approved toggle |
| [ ] | Not Started | **S4. CI wiring and Pages consolidation** (depends on D1 to D3) | On the PR: `parity` passes and `gate` needs it. After the owner merges: `pages-build` and `pages-deploy` succeed on `main`, `/parity/` serves the page, and the site root still serves the unchanged visualisation. `pages.yml` is gone. Docs that mention it (`decision-register.md` DR-040 text is immutable, so only current-state docs: README, CLAUDE.md, backlog notes) are updated |
| [ ] | Not Started | **S5. Close-out** | BACKLOG-075 criteria all ticked with run IDs and commits, item moved to Resolved, Open count back to 0, implementation log and a walkthrough written. D4 is raised if not already decided |

Real failing runs: during S1 and S2 I will also run each Stack locally with one step temporarily made to fail in a scratch copy, never committed, to confirm that a genuine failure reaches each result format and the gate reports it. Planted status changes alone do not prove that.

---

## 5. Verification Plan

| Check | How |
|-------|-----|
| Gate logic | `node --test tools/parity-page/tests` in the `parity` job, before the real gate |
| Real parity | The gate on the run's own three artefacts |
| Gate can fail | Negative check in the build (planted one-word step-text change in a temporary copy) |
| Visualisation untouched | `scripts/check-pages.cjs` still runs, unmodified, before `parity/` is added. After S4 is merged, compare the site root files with the previous deployment |
| No behaviour change | The three Stacks' own suites and existing gates pass unchanged (55 scenarios, 309 steps each) |
| Evidence contract | Existing negative controls plus the two new ones |
| Publication gate | `pages-deploy` runs only on `main` and only after `gate` succeeds. Confirm a red run does not deploy |

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Consolidating Pages changes a live deployment that only `main` can exercise | S4 keeps the visualisation build steps as they are. A manual `workflow_dispatch` dry run builds the artefact without deploying. The owner merges, then I verify the deployed root and `/parity/` |
| Reqnroll's `message` formatter changes in a later version | Reqnroll is locked at 3.3.4 (`packages.lock.json`). The adapter checks the protocol version and the shape, and fails loudly, not silently |
| The gate passes because an adapter drops data | Count checks: 55 scenarios and 309 steps are asserted per Stack against the feature file's own expansion, not only against each other |
| Evidence retention is 7 days, so the page cannot be rebuilt from old runs | The page is built inside the same run. Nothing else reads the artefacts later |
| First real failing run per format reveals a different shape | Covered by the local real-failure check in S1 and S2, before CI wiring |

---

## 7. Out of Scope

- Changes to the solver, feature files, puzzle data, REST API or any Stack's behaviour.
- A committed timing baseline. The page shows this run's timings only. A baseline can be a later item.
- Moving the generator into `portfolio-prompts` as a shared tool. That waits for a second adopter.
- The landing card update (D4) unless the owner includes it.

---

## Notes

- Artefact layout (checked on CI run `36783859964`): `demoapp001-ci-evidence` uploads two paths (`.results/demoapp001/` and `.results/feature-parity/`), so it unpacks with a `demoapp001/` folder and a `feature-parity/` folder. The other two artefacts unpack flat. In S4, download the DEMOAPP001 artefact into `.results/` and the other two into `.results/demoapp002/` and `.results/demoapp003/`, which is the layout the gate expects.
- Approved mock-up: a private artifact built from real results on 2026-09-30. Its template file will be committed in S3.
- Related logs: `DOCS/.implementation-logs/2026-09-30_backlog-075-reqnroll-results-spike.md` and `DOCS/.implementation-logs/2026-09-30_backlog-075-mockup-and-ordering-finding.md`.
