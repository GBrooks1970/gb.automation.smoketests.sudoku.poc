# ANNEX - Validation Evidence

[<- Back to Index](../00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [<- Previous: Migration Plans](../07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

---

## Constraints Applied

- No git mutations, no `npm install` / `npm ci`, no `nvm use`, no Docker, and no edits outside this review folder. Temporary files (scratch configs, audit JSON, downloaded CI artefacts, .NET build output) went to a scratch directory outside the repository. After each run I checked for repo writes with `find -newer <marker>`, and none were found.
- Gate resolution per `portfolio-prompts/project-layout.md` "Validation gates": there is no `docs/project-contract.md`, so the registry row gates apply (`type: ci_jobs`, stack defaults inside each Stack directory, `.batch/*.ps1` parity scripts). CI job steps were reproduced where they are read-only.
- Toolchain: Node `v24.18.0` (meets `engines >=24 <25`), Python 3.13.1 (existing untracked `.venv`), .NET SDK 10.0.403, PowerShell 7.

## Repository State

```text
git status --short   -> ?? DOCS/.review/CODE_REVIEW_CODEX_v3_20261105T0858Z/   (another agent; untouched)
git log --oneline -1 -> f3408bf Merge pull request #94 ... (2026-10-08T01:05:17+01:00)
git status -sb       -> ## main...origin/main
```

## Commands Run and Results

| # | Command (working directory) | Result |
|---|---|---|
| 1 | `npx tsc --noEmit` (DEMOAPP001) | PASS (exit 0) |
| 2 | `npm run lint` (DEMOAPP001) | PASS (exit 0) |
| 3 | `npm run format:check` (DEMOAPP001) | PASS: "All matched files use Prettier code style" |
| 4 | `npm run test:component` (DEMOAPP001) | PASS: tests 113, pass 113, fail 0 |
| 5 | `npm run test:openapi` (DEMOAPP001) | PASS: tests 8, pass 8 |
| 6 | `npm run openapi:lint` (DEMOAPP001) | PASS: "Your API description is valid" |
| 7 | `npm run test:api` (DEMOAPP001) | PASS: "API integration tests: PASS" |
| 8 | Cucumber via Node API, scratch config, Serenity adapter writing to scratch, no Serenity BDD crew (DEMOAPP001) | PASS: 55 scenarios (55 passed), 309 steps (309 passed) |
| 8a | Same, without the Serenity adapter (diagnostic only, off-contract) | 13 failed / 42 passed: Ability state leaks between scenarios when the scene lifecycle is not driven |
| 9 | `PYTHONDONTWRITEBYTECODE=1 .venv/Scripts/python -m pytest -p no:cacheprovider` (DEMOAPP002) | PASS: 85 passed in 0.61s |
| 10 | `dotnet test tests/component/DemoApp003.ComponentTests.csproj --artifacts-path <scratch> -p:RestoreLockedMode=true` (DEMOAPP003) | PASS: Passed 28, Failed 0 |
| 11 | `dotnet test tests/DemoApp003.Specs.csproj --artifacts-path <scratch> -p:RestoreLockedMode=true` (DEMOAPP003) | FAIL: Failed 17, Passed 38, Total 55, all "Puzzle not found". The cause is out-of-tree output layout (Risk 5), not a solver defect. CI default layout: 55/55 (row 19) |
| 12 | `node --test tools/parity-page/tests/*.test.mjs` (root) | PASS: tests 21, pass 21 |
| 13 | `pwsh .batch/check-memory-key-parity.ps1` | PASS |
| 14 | `pwsh .batch/check-step-text-parity.ps1` | PASS |
| 15 | `pwsh .batch/test-dependency-audit-policy.ps1` | PASS (13/13) |
| 16 | `pwsh .batch/check-ra-header-currency.ps1` | FAIL: only 2 FAIL lines, both "omits CODE_REVIEW_CODEX_v3_20261105T0858Z" (untracked parallel review); 81 OK lines. It will also flag this folder until it is indexed |
| 17 | `pwsh .batch/test-documentation-currency.ps1` | FAIL: "Documentation currency baseline must pass before controls run". Inference: same untracked-review cause as row 16 |
| 18 | `npm audit --json` / `npm audit` / `npm audit --omit=dev` (DEMOAPP001, read-only) | 14 vulnerabilities (12 moderate, 2 high); runtime-only: 2 (1 high `body-parser` GHSA-27r3-jxmh-p828, 1 moderate `qs` GHSA-6pq8-jhm2-2vcw) |
| 19 | `gh run list`, `gh pr list`, `gh run view 41307055984 [--log-failed]`, `gh run download 41307055984 -n demoapp00{1,2,3}-ci-evidence -D <scratch>` | Last 3 CI runs (PRs #95-#97) failure; all three Stack logs show "Policy error: Exception 1 expired on 2026-10-12"; artefact `reqnroll.trx` 55/55, `component.trx` 28/28, `pytest-junit.xml` tests=85 |
| 20 | `pwsh .batch/evaluate-dependency-audit.ps1 -Stack demoapp001 -Tool npm-audit -NativeReport <row 18 json> -NativeExitCode 1 -EvidenceRoot <scratch>` | FAIL: `findings=11 blocking=0 unexcepted=0`, "Exception 1 expired on 2026-10-12" |
| 21 | Same with `-PolicyPath <scratch policy, exceptions: []>` | FAIL: `blocking=4 unexcepted=4` (body-parser high; follow-redirects high x3) |
| 22 | Same evaluator, `-Stack demoapp002 -Tool pip-audit` on the CI DEMOAPP002 native report, exception-free policy | FAIL: `findings=14 blocking=14 unexcepted=14` (certifi x1, filelock x12, msgpack x1, all `unknown`) |
| 23 | supertest probe of `createApp()` (scratch script, no listening server) | `/api/visualise/100%25` -> 500 `INTERNAL_SERVER_ERROR`; `/api/puzzles/100%25` -> 404; `/api/visualise/Easy%20Scan%20Grid` -> 200 |
| 24 | `md5sum` of the four feature files and three `puzzles.json` | Features all `6958d3c800ad7b79f13b933da901defd`; puzzles all `291796cbdeb1b513e7c86c4912bb18d9` |
| 25 | `git grep` for token/key/private-key patterns; `git ls-files` for `.env`/`.pem`/`.pfx` | None found |

## Gates Not Run, and Why

- `.batch/test-then-assertion-mutations.ps1`: rewrites tracked feature files in place (Risk 9). Unsafe in a shared checkout.
- `npm run test:coverage` / Python `coverage` / C# coverage collection: coverage was not re-measured. Floors are enforced in CI. The local venv lacks `coverage`, and installing it is out of bounds.
- `.batch/invoke-dependency-audit.ps1` and `check-ci-evidence.ps1` against the repo `.results/`: these write evidence into the repository. The evaluator was run against scratch inputs instead (rows 20-22).
- `npm run build`, `check:pages`, `check:web`, `generate-feature-parity-report.ps1`, `run-parity-checks.ps1`, `tools/parity-page/check-parity.mjs`/`build-page.mjs` against real results: these write `dist/`, `.results/` or `parity-page-dist/` in the repo.
- Docker Compose services and the live Pages URLs: Docker was not started. The public URLs were not fetched, so their current content is unverified.
- `pip-audit` locally: not run. The CI DEMOAPP002 artefact from 2026-11-01 was used instead (row 22).

---

[<- Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_Claude_v2_20261105T1425Z.md)
