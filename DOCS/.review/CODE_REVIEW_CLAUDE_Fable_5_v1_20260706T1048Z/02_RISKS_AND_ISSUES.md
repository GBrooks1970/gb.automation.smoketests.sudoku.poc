# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z

Numbered high to low priority. No Critical or High findings - the suites are
green, parity holds, and no secret or unsafe-input surface was found. The
Medium findings are all currency/lifecycle risks rather than defects.

---

## Risk 1 (Medium): DEMOAPP003's BDD framework (SpecFlow) is end-of-life, on a runtime approaching end-of-support

**Risk description** - The C# stack depends on SpecFlow 3.9.74
([DemoApp003.Specs.csproj](../../../demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj)
(lines 18-19)). SpecFlow was discontinued by Tricentis with support ending
2024-12-31; 3.9.74 is the final release and the repository/website have been
retired. The community successor is Reqnroll (a near drop-in fork: same
`[Binding]` attribute model, a `SpecFlow.NUnit` -> `Reqnroll.NUnit` package
swap plus namespace change). Compounding this, the stack targets `net8.0`
(both csproj files), and .NET 8 LTS support ends 2026-11-10 - about four
months from this review. SpecFlow has no official support for .NET 9/10, so
the C# stack cannot follow the runtime forward on its current framework.
No backlog item, DR entry, or stack doc records this.

**Evidence** -
[DemoApp003.Specs.csproj](../../../demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj)
(lines 4, 18-19):

```xml
<TargetFramework>net8.0</TargetFramework>
...
<PackageReference Include="SpecFlow.NUnit" Version="3.9.74" />
<PackageReference Include="SpecFlow.Tools.MsBuild.Generation" Version="3.9.74" />
```

`grep -ril "reqnroll|discontinu" DOCS/.review/` returns nothing - no prior
review or governance doc has recorded the EOL. (The suite itself passes:
`dotnet test` 46/46 locally during this review.)

**Impact** - Today: none functionally. Within months: the stack is frozen on
an unsupported framework + runtime pair. Any future .NET upgrade, NUnit 4
adoption, or security patch need has no supported path. For a portfolio repo
whose C# stack exists to demonstrate multi-stack judgement, "green on an
abandoned framework, silently" is itself the credibility risk.

**Recommendation** - Raise a backlog item and make an explicit decision (this
is structural, so it needs a DR entry per the project's own rules):
(a) migrate DEMOAPP003 to Reqnroll (low effort - package swap, `TechTalk.SpecFlow`
-> `Reqnroll` namespace in
[BasicSudokuSolverLogicSteps.cs](../../../demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs)
and the generated feature code-behind, re-run `dotnet test` + parity gates), and
bump `net8.0` -> `net10.0` LTS when convenient; or (b) explicitly accept the
freeze with a documented support boundary. **Question recorded for the
maintainer (review ran unattended):** prefer (a) Reqnroll migration or (b)
documented freeze? Option (a) is recommended.

---

## Risk 2 (Medium): One high-severity npm advisory in DEMOAPP001 dev dependencies (fix available)

**Risk description** - `npm audit` in
`demo-apps/demoapp001-typescript-cypress/` reports 1 high-severity
vulnerability: `form-data` 4.0.0 - 4.0.5 (installed: 4.0.5), "CRLF injection in
form-data via unescaped multipart field names and filenames"
(GHSA-hmw2-7cc7-3qxx), with `fix available via npm audit fix`.

**Evidence** - `npm audit` output captured 2026-07-06 (see
[ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md)). Dependency chain from
`npm ls form-data`:

```text
@serenity-js/serenity-bdd@3.43.2 -> axios@1.16.0 -> form-data@4.0.5
supertest@7.2.2 -> superagent@10.3.0 -> form-data@4.0.5 (deduped)
```

`package-lock.json` marks the package `dev: true` - it is not shipped by the
Express runtime (`express` is the sole production dependency,
[package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json)
(lines 45-47)).

**Impact** - Real-world exploitability is low (dev-time tooling constructing
multipart requests in tests/reporting), but the portfolio has already
established (hand-baked HBSP-09 precedent) that a standing red `npm audit` /
Dependabot signal on the default branch costs more in credibility than the
fix costs in effort.

**Recommendation** - Run `npm audit fix` in the stack directory and commit the
lockfile-only change; verify with `npm ci && npm test` + `npm run test:api`.
No manifest ranges need to change (`form-data` >= 4.0.6 satisfies existing
carets).

---

## Risk 3 (Medium): CI runs the TypeScript stack on end-of-life Node 20

**Risk description** - The DEMOAPP001 CI job pins `node-version: 20`
([ci.yml](../../../.github/workflows/ci.yml) (line 23)). Node.js 20
maintenance ended 2026-04-30; as of this review CI is testing on an EOL
runtime. `@types/node` is likewise pinned to `^20.0.0`
([package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json)
(line 34)).

**Evidence** - [ci.yml](../../../.github/workflows/ci.yml) (lines 20-25). Note
the contrast with SUD-08 (BACKLOG-042), which proactively bumped the *action*
majors for the Node 24 runner cutover but deliberately left the app toolchain
at 20 ("independent of the action runtime" -
[CHANGELOG.md](../../../CHANGELOG.md) (line 20)) - correct then, stale now.

**Impact** - No immediate breakage (the suite passed on local Node 20.19.5
during this review), but no more security patches for the runtime CI certifies
against, and a growing mismatch with the ecosystem (several dev-dependency
majors now set engines >= 22).

**Recommendation** - Bump `node-version` to 22 (active LTS) in `ci.yml`, bump
`@types/node` to `^22`, run the full stack job locally, and note the change in
the CHANGELOG. Consider also updating the `Dockerfile` base image for
`demoapp001-tests` in the same change if it pins Node 20.

---

## Risk 4 (Low): Declared licence file does not exist

**Risk description** - The root README's licence section reads "This is an
educational project. See LICENSE file for details."
([README.md](../../../README.md) (line 280)) - but no LICENSE file is tracked
anywhere in the repository (`git ls-files | grep -i licen` returns nothing).
The only machine-readable licence signal is `"license": "ISC"` in
[package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json)
(line 25); `pyproject.toml` and the csproj files declare nothing.

**Impact** - Legally the repo defaults to "all rights reserved", which
contradicts both the stated educational intent and the ISC claim in one stack
manifest. For a public portfolio repo this is an easy credibility deduction
for any reviewer who checks.

**Recommendation** - Add a LICENSE file at the repo root (MIT or ISC fits the
stated intent), align `package.json`'s `license` field, and add `license`
metadata to `pyproject.toml`. Alternatively, if the intent is genuinely
all-rights-reserved, rewrite the README section to say so. Docs-only; no DR
required.

---

## Risk 5 (Low): CHANGELOG has fallen a full remediation stream behind the backlog

**Risk description** - [CHANGELOG.md](../../../CHANGELOG.md) records the
SUD-01..08 stream but has no entry for any of SUD-09..13 / BACKLOG-043..047
(README corrections, governance hygiene, ASCII exception, CI `gate` job -
merged via PRs #24-#26, per
[backlog.md](../../.planning/backlog.md) (lines 123-127)). It also still
states "BACKLOG-010 remains in progress: ... runtime verification is pending"
([CHANGELOG.md](../../../CHANGELOG.md) (line 32)) although the backlog resolved
BACKLOG-010 on 2026-05-29 with DR-033. All content sits under `[Unreleased]`.

**Impact** - The project's own convention (Keep a Changelog, stated in the
header) is not being maintained; an agent or reviewer using the CHANGELOG for
currency gets a state two streams old and one claim that directly contradicts
the authoritative backlog.

**Recommendation** - Add a summary entry for the SUD-09..13 stream (one bullet
per item is enough), correct the BACKLOG-010 line to its resolved state, and
decide whether to cut a dated release heading now that the platform spec is at
v1.1. Docs-only; no DR required.

---

## Risk 6 (Low): decision-register.md header cites the superseded RA v1.14

**Risk description** - The register header says "**Governed by:**
`reference-architecture.md` v1.14 (section 10.6)"
([decision-register.md](../../../decision-register.md) (line 5)), but the
active Reference Architecture is v1.15 (accepted 2026-05-20 - stated in
[CLAUDE.md](../../../CLAUDE.md) "Current Architecture Baseline" and in
[backlog.md](../../.planning/backlog.md) (line 40)). This is the same class of
header drift that BACKLOG-028 fixed in May and SUD-11 fixed in June - it has
recurred.

**Impact** - Low, but the register is the top of the project's own authority
order; a stale governance pointer in the most authoritative document is the
worst place for one.

**Recommendation** - Update the header's RA version (and re-check
`Last Updated`) next time the register is touched. Consider adding a header
check to the parity/gate scripts (a two-line grep) since this is the third
occurrence of the pattern.

---

## Risk 7 (Low): Several orchestration Then-steps assert less than their Gherkin text claims

**Risk description** - In the orchestration step definitions, ordering and
"no execution" assertions are verified only indirectly, or not at all:
"Hidden Singles should be attempted second..." and "Naked Singles should be
attempted third" are empty bodies with the comment "Verified by overall SOLVED
result"
([orchestration.steps.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts)
(lines 89-96)); "no algorithms should be executed" asserts only that the
status is SOLVED (lines 128-131). The same pattern is mirrored in the Python
and C# glue (parity-faithful, so all three stacks share it).

**Evidence** -
[orchestration.steps.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts)
(lines 89-96, 128-131). Note the repo already carries the machinery to do
better: the audit trail records per-iteration, per-algorithm events, and the
SUD-01 resolution explicitly established that "already-solved input returns
SOLVED with 0 iterations / 0 events"
([backlog.md](../../.planning/backlog.md) (line 991)).

**Impact** - The business-readable scenarios promise stronger verification
than the automation delivers. A regression that reordered techniques, or ran
algorithms on an already-solved grid, would still pass these steps.

**Recommendation** - For "no algorithms should be executed", enable audit in
the fixture and assert zero events/iterations (the SUD-01 contract). For the
ordering steps, either assert order from audit-event sequence for a puzzle
that requires all three techniques, or soften the step text - canonical
feature first, then propagate to all three stacks per the CLAUDE.md procedure.
Because this touches canonical Gherkin, treat as a normal feature-change item,
not a hotfix.

---

## Risk 8 (Low): Root README structural drift (repository tree and stale paths)

**Risk description** - The README "Repository Structure" tree shows
`sudoku-basic-solver.md` sitting directly under `DOCS/`
([README.md](../../../README.md) (line 56)) though the file lives at
`DOCS/.algorithm/sudoku-basic-solver.md`, and the tree omits `features-shared/`,
`.batch/`, and the majority of the DOCS subsystem that the rest of the README
and CLAUDE.md describe.

**Impact** - Cosmetic-to-low; first-time readers get a simplified and partly
wrong map. (The links elsewhere in the README resolve correctly - only the
ASCII tree is stale.)

**Recommendation** - Refresh the tree from `CLAUDE.md`'s repository map (which
is accurate) next time the README is edited. Docs-only.

---

## Informational (no number, no action forced)

- **I-1:** .NET vulnerable-package scan not run: `dotnet list package
  --vulnerable` failed locally with an MSBuild/NuGet `OutOfMemoryException`
  (environment issue, not repository issue). C# package versions were
  inspected manually; no Python audit tool was available either. Stated per
  the evidence rules rather than guessed.
- **I-2:** DEMOAPP002 emits one upstream `DeprecationWarning` from the
  `gherkin` package (`re.split` positional `maxsplit`) under Python 3.13 -
  third-party, cosmetic, worth watching at the next pytest-bdd bump.
- **I-3:** [backlog.md](../../.planning/backlog.md) (line 1027) still carries
  "**Next Review Date:** 2026-05-27" - long past; same header-currency family
  as Risk 6.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)
