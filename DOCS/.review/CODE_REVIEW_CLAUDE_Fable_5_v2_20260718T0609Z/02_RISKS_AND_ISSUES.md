# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

Numbered high to low priority. No Critical, High, or Medium findings. Both suites that could be
run locally are green, all four parity gates pass, `npm audit` is clean, no secrets were found in
the tree, and every risk from the 2026-07-06 review is verifiably closed (the closure evidence is
summarised at the end of this file). The four numbered findings are all Low.

---

## Risk 1 (Low): Lint and format gates cover `app_src/` only - the Screenplay test layer is outside every static-analysis gate

**Risk description** - The DEMOAPP001 `lint`, `format`, and `format:check` scripts all target
`app_src/**/*.ts` exclusively, and the ESLint flat config scopes its only rule block to the same
glob. The `tests/` tree - roughly 50 TypeScript files of abilities, tasks, questions, step
definitions, fixtures, and support code, which is the pattern this portfolio project exists to
showcase - plus `tooling/` (benchmark, cucumber configs) is never linted or format-checked, and
CI runs only `npm run lint`.

**Evidence** -
[package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json) (lines 20-22):

```json
"lint": "eslint app_src/**/*.ts",
"format": "prettier --write app_src/**/*.ts",
"format:check": "prettier --check app_src/**/*.ts",
```

[eslint.config.js](../../../demo-apps/demoapp001-typescript-cypress/eslint.config.js) (line 7):
`files: ["app_src/**/*.ts"]`. [ci.yml](../../../.github/workflows/ci.yml) (lines 40-42) runs
`npm run lint` only; `format:check` is wired into no gate at all. (The test code *is*
type-checked - `tsconfig.cucumber.json` compiles it via ts-node during `npm test` - so this is a
style/consistency gap, not a correctness gap.)

**Impact** - Naming-convention and formatting drift in the most-read layer of the repository goes
uncaught. For a pedagogical portfolio project the test glue is the primary exhibit; it is the one
place where "unlinted" costs credibility. The gap also quietly undermines the naming-conventions
rules the project documents in `DOCS/.design/naming-conventions.md`, which the ESLint
naming-convention rules exist to enforce.

**Recommendation** - Extend the globs: `eslint "app_src/**/*.ts" "tests/**/*.ts" "tooling/**/*.ts"`
(and the same for the two Prettier scripts), add a matching `files` block in `eslint.config.js`
pointing `parserOptions.project` at `tsconfig.cucumber.json`, fix whatever surfaces (expect
mostly formatting), and add `npm run format:check` as a CI step beside Lint. Stack-local change;
no parity or DR impact.

---

## Risk 2 (Low): `CLAUDE.md` contradicts itself on the accepted DR range and sits outside the new header-currency guard

**Risk description** - `CLAUDE.md` states the accepted decision range twice and the two
statements disagree: line 15 says "Current accepted range: DR-001 through DR-036" (correct -
DR-036 is the latest, per [decision-register.md](../../../decision-register.md) (line 2015)),
while line 229 says the project is "Governed by `DOCS/reference-architecture.md` v1.15 and
decisions DR-012 through DR-033" (stale - it predates DR-034..036). The new
[check-ra-header-currency.ps1](../../../.batch/check-ra-header-currency.ps1) (lines 18-21)
guards exactly two files (`decision-register.md`, `DOCS/.planning/backlog.md`) and does not
cover `CLAUDE.md`, so the drift class the guard was built for (three prior recurrences:
BACKLOG-028, SUD-11, v1 review Risk 6) is already present in the one governance document the
guard omits.

**Evidence** - [CLAUDE.md](../../../CLAUDE.md) (line 15 vs line 229). Guard target list:
[check-ra-header-currency.ps1](../../../.batch/check-ra-header-currency.ps1) (lines 18-21).

**Impact** - Low but pointed: `CLAUDE.md` is the primary agent-onboarding document, and agents
told "DR-012 through DR-033" may treat DR-034 (v1.1 spec acceptance), DR-035 (validation
boundaries), and DR-036 (Reqnroll/.NET 10 migration) as outside the accepted set. The project's
own review history shows uncaught header drift recurs until a script owns it.

**Recommendation** - Fix line 229 to "DR-001 through DR-036" (or drop the range there and point
to line 15's statement as the single occurrence). Then extend the guard: add `CLAUDE.md` to the
`$Targets` list for the RA-version citation, and consider a second regex asserting the "DR-001
through DR-NNN" range matches the register's "Next ID" footer. Docs plus a two-line script
change; no DR required (editorial currency).

---

## Risk 3 (Low): The local `parity-checks` compose service pins PowerShell 7.4 - the same end-of-support lineage BACKLOG-050 just migrated off

**Risk description** - `docker-compose.yml` runs the parity gates in
`mcr.microsoft.com/powershell:7.4-ubuntu-22.04`. PowerShell 7.4 is the LTS built on .NET 8, and
its support ends alongside .NET 8 on 2026-11-10 - under four months away, and the exact
runtime-lifecycle family this project deliberately exited for the C# Stack via DR-036
(Reqnroll/.NET 10). The image also pins Ubuntu 22.04 while CI runs the same scripts on
`ubuntu-latest` (24.04) with pwsh 7.5, so the containerised parity path certifies a different
shell/OS pair than CI does.

**Evidence** - [docker-compose.yml](../../../docker-compose.yml) (line 31):

```yaml
image: mcr.microsoft.com/powershell:7.4-ubuntu-22.04
```

Contrast [README.md](../../../README.md) (line 286): CI runs the gates with preinstalled `pwsh`
on `ubuntu-latest`.

**Impact** - None today; the scripts are version-agnostic PowerShell. But after 2026-11-10 the
local convenience path runs on an unsupported shell, and the repo's own review stream has
established (v1 Risk 1, Risk 3) that "green on an EOL runtime, silently" is the finding class
this project does not want standing.

**Recommendation** - Bump to `mcr.microsoft.com/powershell:7.5-ubuntu-24.04` (or the `latest`
LTS tag if drift-tolerance is preferred) in the same commit as any next compose touch. One line;
verify with `docker compose run --rm parity-checks` where a Docker engine is available.

---

## Risk 4 (Low): The Node `>=24 <25` engines floor is not enforced, and the suite silently runs green on EOL Node 20

**Risk description** - DEMOAPP001 declares `"engines": { "node": ">=24 <25" }` but nothing turns
that declaration into a gate: there is no `.npmrc` with `engine-strict=true` in the Stack
directory, so `npm ci`/`npm install` merely warns and every script runs regardless. Demonstrated
concretely during this review: the full suite (46 scenarios / 257 steps) and the API integration
tests passed on local Node 20.19.5 - an EOL runtime below the declared floor - without any
signal beyond an install-time warning nobody re-reads.

**Evidence** -
[package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json) (lines 6-8);
absence of `.npmrc` (`rg --files` shows none in the Stack directory);
[ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md) (Node 20.19.5 run, green).

**Impact** - CI is unaffected (it pins Node 24, [ci.yml](../../../.github/workflows/ci.yml)
(lines 26-30)), so the certified path is sound. The risk is local-certification drift: a
contributor on an old Node can "verify" behaviour the project no longer supports, and
version-specific breakage (for example an `engines`-gated transitive dependency) would surface
in CI only.

**Recommendation** - Add a one-line `.npmrc` (`engine-strict=true`) beside `package.json`, so
installs on a non-compliant Node fail fast. Alternatively document the floor in the Stack README
prerequisites. Verify with `npm ci` on Node 24. No parity or DR impact.

---

## Informational (no number, no action forced)

- **I-1:** The web UI renders API-derived strings through `innerHTML` template interpolation
  ([app.js](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/public/js/app.js)
  (lines 152, 172)). Safe today - the interpolated values originate from repo-controlled
  `puzzles.json` and solver-generated reason strings on a local pedagogical server - but this
  becomes an XSS surface the day puzzle input is user-supplied (for example the roadmap
  API-for-Python/C# or any "paste your puzzle" feature). Worth a defensive `textContent`
  refactor whenever `app.js` is next touched.
- **I-2:** DEMOAPP003 was reviewed statically only: the local environment has .NET SDKs up to
  9.0.316 and the Stack targets `net10.0`
  ([DemoApp003.Specs.csproj](../../../demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj)
  (line 4)), so `dotnet test` was not run here. CI (`dotnet-version: "10.0.x"`) is the
  authoritative gate, and the backlog records the same limitation and workaround for the SUD-20
  delivery ([backlog.md](../../.planning/backlog.md) (lines 207-212)). Stated per the evidence
  rules rather than guessed.
- **I-3 (a strength, recorded so it is not re-litigated):** the SUD-20 "Hidden Singles digits
  strictly ascending" assertion
  ([orchestration.steps.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts)
  (lines 143-151)) is *structurally* guaranteed, not merely true of current fixtures:
  `hiddenSingles(target)` batches every placement for a digit into a single audit event per call
  ([SudokuSolver.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts)
  (lines 122-198): one `logChange('HiddenSingles', changes, target)` after the row/column/block
  scans), and the orchestrator scans digits 1-9 in order - so an iteration can never contain two
  HiddenSingles events for the same digit, and future puzzle fixtures cannot break the
  assertion spuriously. The backlog's "verified empirically against every current puzzle
  fixture" ([backlog.md](../../.planning/backlog.md) (line 200)) undersells it.
- **I-4:** DEMOAPP002 emits one upstream `DeprecationWarning` from the `gherkin` package under
  Python 3.13 (unchanged from v1's I-2; third-party, cosmetic).

---

## Closure verification of the 2026-07-06 (v1) findings

Checked against the current tree rather than trusting the backlog:

| v1 finding | Status | Evidence |
|------------|--------|----------|
| Risk 1 SpecFlow EOL / net8.0 | Closed | Reqnroll 3.3.4 + NUnit 4.6.1 on `net10.0` ([DemoApp003.Specs.csproj](../../../demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj) (lines 4, 21)); DR-036 recorded |
| Risk 2 form-data advisory | Closed | `npm audit`: 0 vulnerabilities (this review, see ANNEX) |
| Risk 3 CI on EOL Node 20 | Closed | `node-version: 24` + npm cache ([ci.yml](../../../.github/workflows/ci.yml) (lines 26-30)); `engines >=24 <25`; `node:24-alpine` Dockerfile |
| Risk 4 missing LICENSE | Closed | Root ISC [LICENSE](../../../LICENSE); `package.json` `"license": "ISC"`, `pyproject.toml` `license = "ISC"`, csproj `PackageLicenseExpression` ISC (D-06) |
| Risk 5 CHANGELOG behind | Closed | [CHANGELOG.md](../../../CHANGELOG.md) current through BACKLOG-051/054/055 and P-04/P-07 |
| Risk 6 register cites RA v1.14 | Closed | Header cites v1.15; guarded by `.batch/check-ra-header-currency.ps1` (PASS in this review) |
| Risk 7 hollow orchestration assertions | Closed | Real audit-event invariants in all three Stacks (SUD-20); see I-3 above |
| Risk 8 README tree drift | Closed | [README.md](../../../README.md) (lines 57-79) tree now matches the layout |
| I-3 stale "Next Review Date" | Closed | No stale next-review header remains in [backlog.md](../../.planning/backlog.md) |

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)
