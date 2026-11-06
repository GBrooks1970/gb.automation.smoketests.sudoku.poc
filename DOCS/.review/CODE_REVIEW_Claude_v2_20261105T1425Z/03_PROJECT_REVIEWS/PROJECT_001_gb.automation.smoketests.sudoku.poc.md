# Project Review 001: gb.automation.smoketests.sudoku.poc

[<- Back to Index](../00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

---

## Stack and Intent

The project is a pedagogical, specification-first Sudoku solver POC. One tech-agnostic specification (platform v1.1 plus core v1.0) is implemented three times. Each implementation runs one canonical `@util` Gherkin contract in process, through a Screenplay layer:

| Stack | Runtime / runner | Screenplay | Extra surfaces |
|---|---|---|---|
| DEMOAPP001 (`demo-apps/demoapp001-typescript-cypress/`) | Node 24, Cucumber.js 12, Serenity/JS 3.44 | Framework (`@serenity-js/core`) | CLI, Express 5 REST API + OpenAPI 3.0, tutor/visualiser web UI, puzzle generator, static Pages site |
| DEMOAPP002 (`demo-apps/demoapp002-python-pytest/`) | Python 3.13, pytest 9, pytest-bdd 8.1 | Hand-built kernel | Performance benchmark |
| DEMOAPP003 (`demo-apps/demoapp003-csharp-specflow/`) | .NET 10, Reqnroll 3.3.4 + NUnit 4 | Hand-built kernel | Performance benchmark |

## Review Bullets

- **Architecture and design patterns.** The layering is faithful: Gherkin, then step definitions (Layer 2), then Tasks/Questions (Layer 3), then Abilities (Layer 4), then the production solver. Step definitions delegate through `actorCalled(...).attemptsTo(...)` / `actor.answer(...)`, and memory-key names equal their string values in all Stacks (`check-memory-key-parity.ps1` PASS). The production solver keeps techniques, orchestration, loading and audit in separate units (for example [app_src/SudokuOrchestrator.ts](demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts), [app_src/audit/AuditLogger.ts](demo-apps/demoapp001-typescript-cypress/app_src/audit/AuditLogger.ts)). One weakness: the Python and C# Screenplay layers pack Tasks and Questions into one module each ([tests/screenplay/tasks/__init__.py](demo-apps/demoapp002-python-pytest/tests/screenplay/tasks/__init__.py), 604 lines; [tests/screenplay/tasks/Tasks.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/tasks/Tasks.cs), 527 lines), whereas TypeScript has one file per Task.
- **Code quality and maintainability.** TypeScript is strict-compiled, linted and formatted across app, tests and tooling (all PASS locally). Production error handling is typed. The C# loader's directory walk (Risk 5) and the API's double decode (Risk 4) are the two concrete code defects found. Step definition files in Python (1,011 lines) and C# (966 lines) are monoliths. Splitting them by technique, as DEMOAPP001 does, would make three-way comparison easier.
- **Test coverage and approach.** The pyramid is measured rather than claimed. DEMOAPP001 has 113 component tests (`node --test`), 8 OpenAPI response-contract tests, an API integration script and 55 BDD scenarios. DEMOAPP002 has 30 component plus 55 BDD tests. DEMOAPP003 has 28 component plus 55 BDD tests. Coverage floors are enforced on deliberately selected modules (DR-038). The weakest layer is the Gherkin glue itself, where three empty Then bodies and 18 parameter-blind TypeScript bindings remain (Risk 3).
- **Documentation quality.** Unusually complete, with design, algorithm, how-to, architecture, analysis, implementation-plan and implementation-log trees, and every numeric claim I checked was correct. The weaknesses are drift in the few places governance does not reach: the canonical feature narrative (three techniques instead of five), CLAUDE.md's non-existent `@stack-demoapp001` tag, the "Add a Puzzle" instructions, and project state versus the registry (Risks 6, 7).
- **Strengths.** Byte-identical features and puzzle data across Stacks; results-level parity gate and evidence page; gates with their own negative controls; least-privilege CI with main-only, gate-after Pages deploys; a fail-closed dependency policy with exact exception metadata.
- **Weaknesses.** CI is currently red because the policy has lapsed with no one tracking it (Risks 1, 2). Some assertions are vacuous (Risk 3). Fixture resolution is asymmetric between Stacks (Risk 5). The backlog states that nothing is open (Risk 6).
- **Portfolio credibility.** High in substance. The governance and evidence tooling show senior judgement. The currently red CI on every PR, and a backlog that does not know it, is exactly what a technical reviewer clicking through the Actions tab would notice first. It should be fixed before the project is presented again.

## Deferred, Quarantined or Planned-but-Unimplemented Coverage

- The backlog has no open or deferred items (0 Open / 0 In Progress, [DOCS/.planning/backlog.md](DOCS/.planning/backlog.md) lines 28-33). The feature files carry no `@pending`, `@wip` or `@skip` tags (grep returned nothing), so nothing is quarantined.
- Staged capability, not parity debt: REST API, web UI and tutor are DEMOAPP001-only, with Python and C# "on the roadmap" ([DOCS/.design/sudoku-solver-platform-specification.md](DOCS/.design/sudoku-solver-platform-specification.md) lines 127-139; README capability matrix). This is a documented staging decision (DR-034), and the repo is consistent with it. No Python or C# API code exists or is claimed.
- Two unselected candidates sit only in the portfolio root worklist, not in the project backlog: TRIAGE-10 (generator request / validation-error schema drift versus runtime, LOW) and TRIAGE-15 (candidate-qualified and fixed-fixture step arguments, LOW). Both are real according to this review: TRIAGE-15 overlaps Risk 3. Neither appears in the canonical backlog, which is a documentation-alignment gap.
- Techniques beyond the five (Swordfish, XY-Wing, chains) are explicitly out of scope ([README.md](README.md) lines 319-321), and the implementation matches that statement.

## Runtime Lifecycle, Test Isolation, Waits and Suite Stability

- **Lifecycle and isolation.** DEMOAPP002 creates a fresh actor per test through a function-scoped `actor` fixture ([test_basic_sudoku_solver_logic.py](demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py) lines 46-48). DEMOAPP003 rebuilds the actor in `[BeforeScenario]` ([BasicSudokuSolverLogicSteps.cs](demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs) lines 17-21). DEMOAPP001 relies on Serenity/JS dismissing the Cast at scene end.
- **Isolation observation.** When the suite is run without the `@serenity-js/cucumber` formatter, the scene lifecycle is not driven. In that off-contract run, 13 of 55 scenarios failed because Ability state leaked between scenarios. With the adapter configured, 55/55 passed. The project's own config is correct (`tooling/cucumber.js` line 4). The point is pedagogical: DEMOAPP001's isolation depends entirely on the adapter being registered, so a short note in [docs/screenplay-guide.md](demo-apps/demoapp001-typescript-cypress/docs/screenplay-guide.md) would help anyone who rewires the formatter list.
- **Waits and synchronisation.** N/A - every BDD surface is in-process and synchronous (`@util`). There are no browsers, network calls or polling in the BDD lanes. The API integration test uses supertest against `createApp()` with no listening socket.
- **Stability.** All three Stack lanes passed deterministically in local runs and in CI run 41307055984 before the audit step. The solver is deterministic and its loops terminate monotonically. The only environmental fragility found is DEMOAPP003's path-dependent fixture loading (Risk 5).

## Data Setup and API / Token / Auth Assumptions

- **Fixtures.** Named puzzles come from `puzzles.json` (three byte-identical copies, not gated). Inline grids come from `GridFixtures` / `grid_fixtures.py`, with snapshots stored in Actor Memory before the action. Scenarios never write to shared data (RA Section 5.6 line 449 is satisfied). The loaders deep-copy grids, and a dedicated scenario verifies that (feature line 291).
- **Path assumptions.** TypeScript and Python anchor the file to their source locations. C# uses a bare relative path plus an upward walk (Risk 5).
- **API / token / auth.** N/A for authentication: the API has no auth, no tokens and no secrets by design (local demo). CORS is `*` ([app.ts](demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) lines 124-135), the body limit is 100 kB, and the server listens on all interfaces at `PORT`/3000. That is acceptable for a local POC, but it should be stated as "not for exposure" if the Compose `api` profile is ever published.
- **Secrets.** A `git grep` for common token, key and private-key patterns returned nothing, and no `.env`, `.pem` or `.pfx` files are tracked. CI uses no repository secrets. Pages uses OIDC (`id-token: write`) on the deploy job only.

## CI Assessment

- **Workflow correctness.** One workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs three independent Stack jobs. They feed a `parity` job (tool tests, results-level gate, page build with a negative check), then `gate`, then `pages-build` (non-PR) and `pages-deploy` (main only). Evidence steps use `if: always()` with `if-no-files-found: error`. The structure is correct and clear.
- **Current status.** Red on every run since the exception expiry (Risk 1). The last green run on `main` is 37705857943 (2026-10-08). Nothing is scheduled (Risk 8).
- **Caching and image strategy.** `setup-node` uses the npm cache keyed on the lockfile and `setup-python` uses the pip cache keyed on pyproject plus the lock. .NET has no NuGet cache (the restore is cheap). No container images are used in CI. Compose builds images locally from floating tags (Risk 10).
- **Secrets and permissions.** Workflow default is `contents: read`. Only `pages-deploy` gets `pages: write` / `id-token: write`. Checkout uses `persist-credentials: false`. Actions are pinned by tag, not SHA (Risk 8).
- **Published artefacts.** Per-Stack evidence (7-day retention), the parity page, and the Pages site with the visualiser at `/` and parity at `/parity/`. The live URLs were not fetched in this review, so their current availability is unverified.
- **Local reproducibility.** Good. Every CI step maps to an npm script, pytest, dotnet or `.batch/*.ps1` command, and the README documents the `pwsh` prerequisite. Exceptions: the mutation controls must not be run in a shared checkout (Risk 9), and `check-ra-header-currency.ps1` fails locally whenever an un-indexed review folder exists, including this one and the parallel Codex v3 folder (see [04_CROSS_PROJECT_ANALYSIS.md](../04_CROSS_PROJECT_ANALYSIS.md)).

## Documentation Alignment Against `DOCS/.planning/backlog.md`

| Backlog claim | Verified? | Evidence |
|---|---|---|
| 113 TS component tests | Yes | `npm run test:component`: tests 113, pass 113 |
| 55 scenarios / 309 steps per Stack | Yes (TS, Python); C# yes in CI | Local TS 55/309 pass; local pytest 85 passed; CI `reqnroll.trx` 55/55 |
| 8 OpenAPI tests | Yes | `npm run test:openapi`: tests 8, pass 8; Redocly lint valid |
| 30 Python / 28 C# component tests | Yes | pytest 85 = 55 + 30; `dotnet test` component 28/28 |
| "all seven exact-merge CI jobs passed" (PR #93/#94) | Yes, historically | Run 37705857943 success, 2026-10-08 |
| 0 Open items | No | CI blocked by expired exception plus blocking findings (Risks 1, 2); 3 open PRs |
| DR-039 braces exception "approved through 2026-10-12" | Stale | Expired; finding no longer reported on `main` |
| Registry: "BACKLOG-078 remains open" | Stale (registry side) | Backlog lines 489, 1888: Resolved |

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
