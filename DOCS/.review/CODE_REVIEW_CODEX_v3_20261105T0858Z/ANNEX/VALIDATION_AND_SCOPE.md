# Validation and Scope

[<- Back to Index](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](DEPENDENCY_SECURITY_LICENCE.md)

**Reviewer:** AI assistant (Codex GPT-6)

**Source:** `f3408bfdbff107bdf7475fc6acdc6bd3d38fb60d`. **Date:** 2026-11-05. Node 24.18.0, npm 11.16.0 and .NET SDK 10.0.403 were available. Python tests used the project's installed venv. Commands ran in a unique source snapshot; logs include exact working directories and timestamps.

## Review method and limits

One dedicated sub-agent was assigned to this project. It inspected the repository and captured isolated validation evidence before a usage limit stopped it. The coordinating Codex reviewer completed the review, checked the saved command output, and independently verified the significant probes. This is one combined Codex review, not two independent approvals.

The scope covers the maintained application, specifications, test architecture, runners, CI, dependency manifests and locks, backlog, decisions and operational documentation. Repository mapping used `rg --files`; generated outputs, dependencies, old review bodies and archived reports were excluded from manual code assessment. The review is comprehensive by subsystem, not a claim of exhaustive path coverage or a formal security audit. No implementation or backlog was changed. Recommendations remain candidates for a separately authorised implementation task.

Tests and probes ran in uniquely named scratch snapshots. Existing installed toolchains were reused; this is not proof of a clean-machine installation. Negative probes are deliberately failing tests and are recorded separately from the unchanged baseline. Current GitHub checks, branch protection and live Pages content were not queried. Historical CI and publication claims remain dated repository evidence.

## Captured Command Manifest

Durations below are elapsed wrapper time; they are not comparable performance benchmarks. TypeScript commands ran in its stack directory, Python and .NET in theirs, governance at snapshot root.

| Check | Command | Exit | Seconds |
| --- | --- | --- | --- |
| python-tests | `D:\_CLAUDE_COWORK\PROJ001\claude-outputs\test-automation-portfolio\gb.automation.smoketests.sudoku.poc\demo-apps\demoapp002-python-pytest\.venv\Scripts\python.exe -m pytest -p no:cacheprovider` | 0 | 10.414 |
| python-audit | `D:\_CLAUDE_COWORK\PROJ001\claude-outputs\test-automation-portfolio\gb.automation.smoketests.sudoku.poc\demo-apps\demoapp002-python-pytest\.venv\Scripts\python.exe -m pip_audit --local --skip-editable --format=json` | 1 | 1.001 |
| dotnet-restore | `dotnet restore --locked-mode` | 0 | 19.51 |
| dotnet-tests | `dotnet test --no-restore --logger console;verbosity=normal` | 0 | 110.874 |
| dotnet-audit | `dotnet package list --vulnerable --include-transitive --format json --no-restore` | 0 | 26.976 |
| check-ra-header-currency | `pwsh -NoProfile -File .batch/check-ra-header-currency.ps1` | 1 | 18.052 |
| check-memory-key-parity | `pwsh -NoProfile -File .batch/check-memory-key-parity.ps1` | 0 | 9.015 |
| generate-feature-parity-report | `pwsh -NoProfile -File .batch/generate-feature-parity-report.ps1` | 0 | 7.77 |
| check-step-text-parity | `pwsh -NoProfile -File .batch/check-step-text-parity.ps1` | 0 | 12.006 |
| test-dependency-audit-policy | `pwsh -NoProfile -File .batch/test-dependency-audit-policy.ps1` | 0 | 15.561 |
| test-ci-evidence-contract | `pwsh -NoProfile -File .batch/test-ci-evidence-contract.ps1` | 0 | 36.764 |
| parity-tool-tests | `node --test tools/parity-page/tests/*.test.mjs` | 0 | 42.508 |
| typescript-noemit | `node <snapshot>\demo-apps\demoapp001-typescript-cypress\node_modules\typescript\bin\tsc --noEmit` | 0 | 16.793 |
| typescript-lint | `npm.cmd run lint` | 0 | 178.69 |
| typescript-format | `npm.cmd run format:check` | 0 | 60.544 |
| typescript-openapi | `npm.cmd run verify:openapi` | 0 | 96.684 |
| typescript-api | `npm.cmd run test:api` | 0 | 21.301 |
| typescript-component | `node --test --test-concurrency=1 -r ts-node/register tests/component/*.test.ts` | 0 | 213.089 |
| typescript-bdd | `node node_modules/@cucumber/cucumber/bin/cucumber.js --config tooling/cucumber.js` | 0 | 129.468 |
| npm-audit | `npm.cmd audit --audit-level=high --json` | 1 | 111.988 |
| node-policy | `pwsh -NoProfile -File .batch/invoke-dependency-audit.ps1 -Stack demoapp001` | 1 | 10.912 |

## Observed Results and Corrections

- TypeScript: 113 component tests; BDD 55 scenarios/309 steps; OpenAPI eight tests; API script exit 0; typecheck, lint and formatting passed.
- Python: 85 tests passed, one Gherkin deprecation warning, runner duration 3.20 s (wrapper 10.414 s).
- C#: locked restore passed; 28 component and 55 Reqnroll tests passed. The 55-test runner reported 12.2765 s; the combined wrapper took 110.874 s.
- Parity-tool suite: 21 tests passed. Audit-policy controls: 13 passed. CI evidence negative controls, feature, step-text and memory-key parity passed.
- The first documentation-currency run failed because the scratch snapshot omitted historical `.review` directories. After restoring the tracked review history, a temporary added probe correctly invalidated the source inventory. Moving that probe out of the snapshot restored the baseline: `RA/documentation currency: PASS`. Neither failed scratch setup is reported as a product defect.
- Full npm audit exited 1; production-only audit also exited 1. Governed Node audit failed on the expired exception (S-02), not a successful exemption. NuGet reported no vulnerable packages across its four projects.
- The initial Python audit could not import `pip_audit`. A separate scratch auditor was installed and attempted; see the dependency annex for its final status. No successful Python audit is inferred from the passing tests.

## Independent Counterexamples

1. **S-03:** a new NUnit probe in scratch asked `PuzzleLoader` for an absent absolute filename. Output: `Explicit missing path loaded 5 fallback puzzles`; expected `FileNotFoundException`, actual no exception. One test failed, runner duration 66 ms. Probe removed from the scratch source inventory afterwards, preserved outside the checkout.
2. **S-04:** the committed parity fixtures passed initially. Removing all but the first `testStepFinished` per C# execution reduced records 85 -> 13. The gate still printed `PARITY PASS`, expected 13 executions/72 visible steps. No repository fixture was modified.

Reproduce S-04 by loading `tools/parity-page/tests/fixtures`, applying that filter only to a temporary `reqnroll.ndjson`, loading it with `loadMessages`, and calling `gate` with `featureExpectation` filtered to `tests/keep.mjs`. The counterexample challenges evidence completeness; it is not a claim of a current failed native test.

## Not Run or Not Claimed

No new coverage-floor measurements, full mutation campaign, interactive tutor/player browser rehearsal, Docker services, benchmark run, fresh Node clean install, remote CI query, publication or deployment. Existing dated evidence for these is not relabelled as today's validation. The source state at review start was clean; only this new review folder is authored by this task.

## Integration Boundary

The source documentation guard requires every review directory in two shared indexes. This review intentionally does not touch either index because the user required separation from parallel reviewers. The restored baseline passed before this new review is integrated; registering it is a later publication step. No clean post-integration gate is claimed.


## Final Source/Secret Check

A limited scan of tracked text files, excluding historical review bodies, generated dependencies, binary files and files above 2 MB, found no matches for private-key headers or the checked GitHub, AWS access-key and OpenAI project-key forms. Only file names/counts could be emitted; no potential secret values were printed. This is a pattern scan, not a full-history or entropy-based secret audit. Source SHA and concurrent-change boundaries are recorded in the index.

---

[<- Previous](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](DEPENDENCY_SECURITY_LICENCE.md)
