# Code Review: gb.automation.smoketests.sudoku.poc

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z
**Scope:** Full repository review of the three-Stack Sudoku solver parity POC (DEMOAPP001 TypeScript / Cucumber / Serenity/JS, DEMOAPP002 Python / pytest-bdd, DEMOAPP003 C# / Reqnroll), its canonical feature store, `.batch/` governance scripts, `tools/parity-page/`, CI, Docker and documentation, assessed against `DOCS/.planning/backlog.md`.
**Repository state reviewed:** `main` at `f3408bfdbff107bdf7475fc6acdc6bd3d38fb60d` (2026-10-08, PR #94), equal to `origin/main`. The only working-tree change at review start was another agent's untracked `DOCS/.review/CODE_REVIEW_CODEX_v3_20261105T0858Z/`, which this review did not read or modify.
**Version rationale:** `v2` because the only prior review with the bare agent token `Claude` in this location is `CODE_REVIEW_CLAUDE_v1_20260519T1948Z`; the other `CODE_REVIEW_CLAUDE_*` folders carry model-qualified agent tokens (`CLAUDE_Fable_5`, `CLAUDE_Opus_4_8`, and so on).
**Review location:** `DOCS/.review/` per the registry deviation (`portfolio-prompts/registry.yml` lines 121-125).

---

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md) - design and code quality, highlights, pedagogical value, overall verdict.
2. [Risks and Issues](02_RISKS_AND_ISSUES.md) - 12 numbered risks, High to Low, each with evidence, impact and remediation.
3. [Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_gb.automation.smoketests.sudoku.poc.md) - the single project, with per-Stack notes, deferred-coverage, lifecycle, data and CI assessments.
4. [Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) - cross-cutting analysis within the repo (Stacks vs CI vs governance scripts vs docs).
5. [Recommendations](05_RECOMMENDATIONS.md) - recommended refactors, next steps, future ideas.
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) - Test Pyramid, SOLID, KISS, YAGNI, REST/OpenAPI, ISTQB, pedagogy.
7. [Migration Plans](07_MIGRATION_PLANS.md) - single source of truth, Docker Compose, GitHub Actions.
8. [ANNEX: Validation Evidence](ANNEX/VALIDATION_EVIDENCE.md) - every command run for this review, with exact results.

## Structure Summary

The review follows `templates/code-review.template.md` with the template's single-repository customisation: one project file under `03_PROJECT_REVIEWS/`, and `04_CROSS_PROJECT_ANALYSIS.md` treated as cross-cutting analysis inside the repo. Sections that do not apply keep their heading and carry an `N/A - <reason>` line. All paths are repository-relative (relative to the repository root, not to this folder). Every result quoted as "observed" was produced by a command listed in the annex; anything else is labelled as an inference.

## Key Findings

1. **CI is red on every change since 2026-10-13 (High, Risk 1).** The single DR-039 exception in `.github/dependency-audit-policy.json` expired on 2026-10-12. The evaluator fails closed on any expired exception for every Stack, so all three Stack jobs fail at "Dependency audit". All three open Dependabot PRs (#95, #96, #97) are red for this reason (CI run 41307055984 log: "Policy error: Exception 1 expired on 2026-10-12"). Main still shows the 2026-10-08 green run because nothing has been pushed since, and the backlog reports 0 Open items.
2. **The expired exception masks real blocking advisories (High, Risk 2).** With the exception removed, the project's own evaluator reports 4 unexcepted high npm findings (runtime `body-parser` GHSA-27r3-jxmh-p828 through Express; dev `follow-redirects` x3 through `@serenity-js/serenity-bdd` -> `axios`) and 14 unknown-severity pip-audit findings (`certifi`, `filelock`, `msgpack` in the audit tool's own dependency tree). Removing the exception alone will not turn CI green.
3. **Some Gherkin steps prove nothing (Medium, Risk 3).** Three Then steps are empty in all three Stacks ("no errors should occur", "the main loop should exit", "the move should be validated against ..."), and 18 DEMOAPP001 step bindings discard their Gherkin parameters (for example X-Wing rows/columns). BACKLOG-078 made 16 Then patterns exact, but these remain.
4. **A double URL decode in `/api/visualise/:name` returns 500 for a valid request (Medium, Risk 4).** `GET /api/visualise/100%25` returned `500 INTERNAL_SERVER_ERROR`; the same name on `/api/puzzles/:name` returns `404 PUZZLE_NOT_FOUND`.
5. **Strong core.** All locally runnable native gates passed: 113 component tests, 55 scenarios / 309 steps, 8 OpenAPI tests, API integration, tsc, lint, format, 85 Python tests, 28 C# component tests, 21 parity-tool tests, memory-key and step-text parity, 13/13 audit-policy controls. The documented counts match these runs exactly.

## Navigation Guide

- Hiring manager or reviewer short on time: read Key Findings above, then [01_EXECUTIVE_SUMMARY.md](01_EXECUTIVE_SUMMARY.md).
- Next engineer fixing things: start at [02_RISKS_AND_ISSUES.md](02_RISKS_AND_ISSUES.md) Risks 1-2 (they block every merge), then the ordered list in [05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md) "Next Steps".
- Test-strategy reader: [03_PROJECT_REVIEWS/PROJECT_001_gb.automation.smoketests.sudoku.poc.md](03_PROJECT_REVIEWS/PROJECT_001_gb.automation.smoketests.sudoku.poc.md) and [06_ARCHITECTURE_ASSESSMENT.md](06_ARCHITECTURE_ASSESSMENT.md).
- To check a claim: every command and its output summary is in [ANNEX/VALIDATION_EVIDENCE.md](ANNEX/VALIDATION_EVIDENCE.md).
- Cross-references: Risk 1/2 <-> 07 GitHub Actions plan; Risk 3 <-> 06 ISTQB section; Risk 6 <-> 04 Documentation Alignment.

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
