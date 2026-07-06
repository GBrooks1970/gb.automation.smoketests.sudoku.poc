# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Validation Log ->](ANNEX/VALIDATION_LOG.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z

Priority migration strategies for the top findings - steps, effort, risk.
The template's historical plans (single source of truth, Docker Compose,
GitHub Actions) are all delivered and green in this repo, so per the
single-repository customisation those appear as N/A closures and the live
plans address the current risks.

## Plan 1: DEMOAPP003 SpecFlow -> Reqnroll (Risk 1)

- **Step 1 - Decide and record.** DR entry choosing migration (recommended)
  or documented freeze; backlog item raised (suggested BACKLOG-050).
- **Step 2 - Package swap.** In
  [DemoApp003.Specs.csproj](../../../demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj):
  `SpecFlow.NUnit` -> `Reqnroll.NUnit`, `SpecFlow.Tools.MsBuild.Generation` ->
  `Reqnroll.Tools.MsBuild.Generation` (Reqnroll generates code-behind the same
  way).
- **Step 3 - Namespace change.** `TechTalk.SpecFlow` -> `Reqnroll` in
  `BasicSudokuSolverLogicSteps.cs`; delete the checked-in
  `BasicSudokuSolverLogic.feature.cs` and let MSBuild regenerate.
- **Step 4 - Verify.** `dotnet test` 46/46, then all three parity gates
  (step text and memory keys are framework-independent, should be untouched).
- **Step 5 - Docs.** Stack README, root README capability/stack tables,
  directory naming note (directory keeps `-specflow` or is renamed under a
  small follow-up DR - renaming re-runs the MIG-13 playbook), CHANGELOG entry.
- **Step 6 - Runtime follow-up.** Separate change: `net8.0` -> `net10.0` LTS
  before 2026-11-10, with `ci.yml` `dotnet-version` bump.
- **Effort:** half a day including docs. **Risk:** low - Reqnroll is a
  compatibility-focused fork; the suite is deterministic and in-process.

## Plan 2: Toolchain currency sweep (Risks 2, 3)

- **Step 1.** `npm audit fix` in the DEMOAPP001 directory; commit lockfile.
- **Step 2.** `ci.yml` `node-version: 20` -> `22`; `@types/node` `^20` ->
  `^22`; check the demoapp001 Dockerfile base image for a Node 20 pin.
- **Step 3.** Local verification: `npm ci`, `npm run build`, `npm run lint`,
  `npm run test:api`, `npm test`, then push and confirm the CI `gate` job.
- **Step 4.** CHANGELOG entries; no DR (dependency maintenance, no structural
  choice).
- **Effort:** under an hour. **Risk:** minimal - dev-only advisory fix plus a
  supported-LTS runtime bump; failure mode is caught by the existing gates.

## Plan 3: Documentation currency batch (Risks 4, 5, 6, 8; I-3)

- **Step 1.** Add LICENSE (MIT or ISC per maintainer preference - question
  recorded, review ran unattended); align `package.json` and `pyproject.toml`
  licence metadata.
- **Step 2.** CHANGELOG: add the SUD-09..13 stream summary; correct the stale
  BACKLOG-010 "remains in progress" line; consider cutting a dated release
  heading at platform spec v1.1.
- **Step 3.** decision-register.md header: RA v1.14 -> v1.15; refresh
  `Last Updated` when edited.
- **Step 4.** Root README: refresh the repository-structure tree from
  CLAUDE.md's accurate map. Backlog footer: update or drop the 2026-05-27
  "Next Review Date".
- **Step 5 (optional, ends the recurrence).** Two-line header-currency grep in
  `.batch/run-parity-checks.ps1` asserting governance headers cite the active
  RA version.
- **Effort:** one docs PR, ~1-2 hours. **Risk:** none - docs-only; review
  outputs under `DOCS/.review/` remain untouched per RA section 10.7.

## Delivered plans (template axes) - N/A closures

- **Single Source of Truth for Features:** N/A - delivered; canonical store +
  three automated parity gates, PASS verified this review.
- **Docker Compose for Local Development:** N/A - delivered (BACKLOG-010,
  DR-033); compose services mirror CI and local gates.
- **GitHub Actions/Workflow:** N/A - delivered (BACKLOG-004, SUD-08, SUD-13);
  three stack jobs + parity gates + fan-in `gate` job on Node-24-ready action
  majors. Remaining workflow work is the currency sweep in Plan 2.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Validation Log ->](ANNEX/VALIDATION_LOG.md)
