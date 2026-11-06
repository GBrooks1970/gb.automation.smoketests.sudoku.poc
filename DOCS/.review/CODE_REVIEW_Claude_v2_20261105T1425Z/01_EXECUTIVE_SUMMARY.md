# Executive Summary

[<- Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

---

## Overall Verdict

This is one of the most heavily governed repositories in the portfolio. Three Stacks implement one tech-agnostic solver specification and run one byte-identical 55-scenario feature file. The repository also carries results-level parity evidence, negative controls for its own gates and a fail-closed dependency policy. Every native gate I could run locally passed, and the documented test counts match what actually ran.

The headline problem is that the fail-closed policy has now closed. The one dependency exception expired on 2026-10-12. Since then every CI run fails on all three Stacks, including all three open Dependabot PRs, while the backlog reports 0 Open items and the README badge still shows the last green main run from 2026-10-08. Behind the expiry sit real blocking advisories that the policy error currently hides. So the repository's strongest assurance mechanism is working as designed, but nobody is tracking it. The fix is small and the governance needed for it already exists.

## Design Quality

- Specification-first, multi-Stack design is real, not decorative: [features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature](features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature) and the three Stack copies hash identically (MD5 `6958d3c8...`), as do the three `puzzles.json` files (`291796cb...`).
- Screenplay layering is consistent across three very different runtimes: Serenity/JS in DEMOAPP001, and hand-built Actor/Ability/Task/Question kernels in Python ([tests/screenplay/support/actor.py](demo-apps/demoapp002-python-pytest/tests/screenplay/support/actor.py)) and C# ([tests/screenplay/support/Actor.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/support/Actor.cs)). Memory-key and step-text parity are machine-checked (both PASS locally).
- The parity evidence page ([tools/parity-page/](tools/parity-page/README.md)) reads what each Stack actually executed, rather than what its feature file says. CI then gates on that result ([.github/workflows/ci.yml](.github/workflows/ci.yml) lines 246-303). That is a mature design choice.
- Asymmetries weaken the parity story in places. DEMOAPP003 resolves `puzzles.json` by walking up the directory tree from a bare relative name, and its Ability swallows load errors (Risk 5). DEMOAPP001 owns the only HTTP surface, and that surface has an unguarded double decode (Risk 4).
- Governance volume is very high: a 2,717-line decision register, a 2,002-line backlog, and 16 PowerShell governance scripts. The volume is justified for a parity teaching repo. It does, however, make state drift between the backlog, the registry and reality more likely (Risk 6).

## Code Quality

- Static gates are clean: `npx tsc --noEmit`, ESLint and Prettier all pass in DEMOAPP001, and CI also covers `tests/**` and `tooling/**` ([package.json](demo-apps/demoapp001-typescript-cypress/package.json) lines 19-21).
- Solver loops terminate by construction. Each orchestrator iteration must place at least one digit or exit ([app_src/SudokuOrchestrator.ts](demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts) line 59), and all three Stacks share the same shape.
- Dependencies are locked in all three ecosystems: `package-lock.json` with `npm ci`, `requirements-test.lock` used as constraints, and `packages.lock.json` with `--locked-mode`. CI permissions are least-privilege (`contents: read`, Pages rights only on the deploy job, `persist-credentials: false`).
- The test glue has blind spots. Some step bindings are empty or ignore their arguments (Risk 3). Python and C# step definitions are single files of 1,011 and 966 lines. The Python Tasks and Questions live in `__init__.py` modules of 604 and 202 lines.
- Error mapping on the API is mostly disciplined (typed `ApiError`, JSON-parse mapping, a 100 kB body limit in [app_src/server/app.ts](demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) lines 32, 147-182). One route bypasses that discipline (Risk 4).

## Main Highlights

- The gates check themselves. The CI evidence contract rejects 21 planted omissions or malformations. The audit policy has 13 negative controls (13/13 locally). The Then-assertion mutation controls plant 22 wrong expectations per Stack.
- Documentation currency held up under verification. README and CLAUDE.md claim 113 component, 8 OpenAPI, 85 Python and 28 C# component tests, plus 55 scenarios / 309 steps. Every one of those numbers was reproduced by this review's runs.
- Publication discipline: Pages deploys only from `main`, only after `Gate (all stacks green)`, and only the deploy job holds `pages: write` (ci.yml lines 374-395).
- A real Reqnroll Cucumber Messages pipeline (`tests/reqnroll.json`) feeds results-level parity. This is a non-trivial cross-ecosystem integration.

## Pedagogical Value

- Excellent for a mid-level audience learning "same behaviour, three runtimes". The same scenario reads identically in Cucumber.js, pytest-bdd and Reqnroll, and the reader can compare a framework-provided Screenplay with two hand-built ones.
- The governance scripts are themselves a teaching asset: they show how to make parity, evidence and audit policy executable rather than aspirational.
- The vacuous steps teach the wrong lesson if left in place (Risk 3). A learner copying "Then no errors should occur" with an empty body learns that a green Then proves something.
- Stack directory names (`typescript-cypress` with no Cypress dependency; `csharp-specflow` running Reqnroll) are documented legacy IDs. They still mislead a first-time reader or hiring manager, so a one-line callout in the root README would help.

---

[<- Previous: Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Risks and Issues ->](02_RISKS_AND_ISSUES.md)
