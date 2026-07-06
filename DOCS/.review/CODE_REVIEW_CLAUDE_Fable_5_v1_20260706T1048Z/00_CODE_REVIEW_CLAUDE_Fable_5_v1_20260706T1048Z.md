# Code Review: gb.automation.smoketests.sudoku.poc

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z
**Scope:** Full repository review - three demo-app stacks (TypeScript/Cucumber+Serenity, Python/pytest-bdd, C#/SpecFlow), canonical feature store, parity tooling, CI, Docker Compose, and the DOCS governance system - reviewed against `DOCS/.planning/backlog.md` as the status source of truth
**Grade:** A-

## Contents

- [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md)
- [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md)
- [03_PROJECT_REVIEWS/](03_PROJECT_REVIEWS/)
  - [PROJECT_001_Sudoku_Solver_POC.md](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)
- [04_CROSS_PROJECT_ANALYSIS.md](04_CROSS_PROJECT_ANALYSIS.md)
- [05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md)
- [06_ARCHITECTURE_ASSESSMENT.md](06_ARCHITECTURE_ASSESSMENT.md)
- [07_MIGRATION_PLANS.md](07_MIGRATION_PLANS.md)
- [ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md)

## Structure Summary

This is a single-repository review following the project's canonical template
(`DOCS/.templates/code-review.template.md`, per the portfolio registry deviation).
`03_PROJECT_REVIEWS/` carries one file covering the whole repository;
`04_CROSS_PROJECT_ANALYSIS.md` is a cross-cutting analysis *within* the repo
(stacks vs parity tooling vs CI vs Docker vs documentation). The ANNEX records
every validation command run during the review with its observed result.

## Review Method

- Repository state inspected (`git status --short` clean on `main` at `d6b47f1`,
  fast-forwarded from origin before review).
- Full file map taken with `git ls-files`; all source, test, config, CI, and
  governance documents in scope were read.
- `DOCS/.planning/backlog.md` (69 items, 3 Open / 66 Resolved) read in full and
  treated as the canonical project state; claims validated against the repo.
- Local validation executed in full: all three stack test suites, the DEMOAPP001
  build/lint/API gates, and all three `.batch` parity gates. Every gate passed.
  See [ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md).
- Dependency and security pass: `npm audit` run for DEMOAPP001 (1 high, dev-only,
  fix available); Python and .NET dependency versions inspected manually
  (`dotnet list package --vulnerable` failed with a local SDK error - stated,
  not guessed).

## Key Findings

1. **DEMOAPP003's BDD framework is end-of-life.** SpecFlow 3.9.74 is the final
   release of a discontinued project (support ended 2024-12-31; Reqnroll is the
   community successor). The suite is green today on .NET 8, but .NET 8 LTS
   itself reaches end-of-support on 2026-11-10, and SpecFlow will not follow the
   stack forward. No document in the repo records this risk. (Risk 1, Medium)
2. **One high-severity advisory in DEMOAPP001 dev dependencies.** `npm audit`
   reports `form-data` 4.0.5 (transitive, dev-only, via `@serenity-js/serenity-bdd`
   -> `axios` and `supertest` -> `superagent`) vulnerable to GHSA-hmw2-7cc7-3qxx;
   a lockfile-only fix is available. (Risk 2, Medium)
3. **CI runs the TypeScript stack on Node 20, which is now end-of-life**
   (maintenance ended 2026-04-30). A one-line bump to Node 22 LTS is due.
   (Risk 3, Medium)
4. **The declared licence does not exist.** `README.md` says "See LICENSE file
   for details" but no LICENSE file is tracked; `package.json` says ISC and the
   Python/C# manifests say nothing. (Risk 4, Low)
5. **Documentation currency drift continues** - the recurring portfolio theme.
   `CHANGELOG.md` has no entries for the entire SUD-09..13 remediation stream
   and still claims BACKLOG-010 "remains in progress" (Resolved 2026-05-29,
   DR-033); `decision-register.md`'s header cites RA v1.14 while the active RA
   is v1.15. (Risks 5-6, Low)

Everything the backlog claims about suite health was verified true locally:
46 scenarios per stack (DEMOAPP001 46/257 steps), API integration PASS, and
all three parity gates PASS.

## Navigation Guide

Read [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md) for the graded overview,
then [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) for the full evidence-backed
risk list. The project review, cross-cutting analysis, recommendations,
architecture assessment, and migration plans follow in numbered order. Each file
carries breadcrumb navigation back to this index.

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
