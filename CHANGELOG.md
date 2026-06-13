# Changelog

**Project:** gb.automation.smoketests.sudoku.poc
All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## [Unreleased]

### Added
- SUD-05 (review `CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z` Risk 5): added an authoritative per-stack capability matrix to platform specification v1.1 §6.1 (and a concise mirror in the root `README.md`) covering core solver, BDD/Screenplay parity, audit trail, CLI/display, REST API, web UI, and performance tooling for DEMOAPP001/002/003. Core-solver and BDD/Screenplay parity are presented as required for every stack; REST API and web UI are presented as staged capability with API/web on the roadmap for DEMOAPP002/003 (user decision 2026-06-12) rather than intentionally util-only. Docs-only; no behaviour change.
- SUD-04 (review `CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z` Risk 4, DR-035): `DOCS/.architecture/validation-boundaries.md` states the validation layer split authoritatively — loaders perform structure validation only (v1.0 §7.1); solvers expose a constraint query without gating solving on it; the DEMOAPP001 REST API re-validates structure on every grid-accepting endpoint and offers constraint validation via `POST /api/validate`. The optional strict duplicate-validation loader mode is explicitly deferred (user decision 2026-06-12), not open.
- SUD-04 (review Refactor 5, DR-035): authored OpenAPI 3.0 contract for the DEMOAPP001 REST API at `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml` covering all nine endpoints, request/response schemas, and the structured error codes; must be updated in the same change as any endpoint or schema change.

### Fixed
- SUD-01 (review `CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z` Risk 2): all three orchestrators (`SudokuOrchestrator.ts`, `sudoku_orchestrator.py`, `SudokuOrchestrator.cs`) now check grid fullness before entering the progress loop, so an already-solved input returns `SOLVED` immediately without executing any algorithms, matching the v1.0 edge case and the shared Gherkin contract. Audit trails for solved inputs now record zero iterations and zero events.

### Changed
- SUD-03 (review `CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z` Risk 3): all three solvers now expose the v1.0 `getGrid` snapshot operation returning a deep copy of the working grid — `SudokuSolver.getGrid()` (TypeScript), `SudokuSolver.get_grid()` (Python), `SudokuSolver.GetGrid()` (C#). Read-only call sites (CLI display, REST API grid snapshots, solve-step tracker, Screenplay snapshot helpers) now use it instead of reading the public grid member directly. The public `grid` / `Grid` members are retained for compatibility; direct external mutation is documented as deprecated in each stack README and in platform specification v1.1 §2.2.
- SUD-08 (CI maintenance): bumped GitHub Actions in `.github/workflows/ci.yml` to the major versions that run on the Node 24 runner ahead of GitHub forcing Node 24 on Actions from 2026-06-16 — `actions/checkout@v4→v5`, `actions/setup-node@v4→v5`, `actions/setup-python@v5→v6`, `actions/setup-dotnet@v4→v5`, `actions/upload-artifact@v4→v6`. No workflow logic changed; the app toolchain Node version (`node-version: 20`) is unchanged as it is independent of the action runtime.
- SUD-07 (SUD-02 deferred tail): DR-034 flipped from Proposed to Accepted following the merge of PR #18 (merge commit `9a2e29f`, 2026-06-12) — the v1.1 platform specification is now the authoritative platform specification with v1.0 as the original core solver baseline. Root `README.md` version/status metadata updated to present this authority order (header, Core Specifications table, Canonical Source). The stale `DR-001 through DR-033` accepted-range note in `CLAUDE.md` was corrected to DR-001 through DR-035.
- DR-032: Added `DEMOAPP003_CSHARP_SPECFLOW` as an active C# SpecFlow/NUnit Stack, updated parity contracts and CI, and resolved BACKLOG-021 plus umbrella BACKLOG-013.
- BACKLOG-010 remains in progress: Docker Compose files and Dockerfiles exist for all active Stacks, but runtime verification is pending until Docker Desktop/Linux engine is available locally.
- BACKLOG-011 resolved with reporting-only benchmark harnesses for TypeScript, Python, and C# plus root aggregation under `.results/performance/`.
- DR-031 / Reference Architecture v1.15: Section 4 directory blueprint updated to match current project layout — dot-prefixed DOCS subdirectories (`.algorithm/`, `.analysis/`, `.architecture/`, `.design/`, `.howto/`, `.implementation-logs/`, `.planning/`, `.review/`, `.templates/`), Stack group pattern (`demo-apps/[stack-dir]/`), `tests/api/` optional folder, and `step_definitions/` placed inside `screenplay/`. All internal RA path references updated to dot-prefixed form. Empty untracked `DOCS/implementation-logs/` directory removed.
- DR-030: analysis and report-style documents now live under `DOCS/.analysis/`; historical report filenames were preserved.
- DR-029 / Reference Architecture v1.14: review outputs now live only under `DOCS/.review/`; the former repository-root `.review/` contents were moved into DOCS and active templates/guidance were updated.
- MIG-13 (DR-016): Filesystem directories renamed to kebab-case:
  - `DEMOAPPS/` → `demo-apps/`
  - `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` → `demo-apps/demoapp001-typescript-cypress/`
  - `features_shared/` → `features-shared/`
  - All ~50 active documentation files, scripts, and configs updated accordingly
  - Historical review files under `DOCS/.review/` left unchanged (read-only per RA §10.7)
  - Canonical Stack name `DEMOAPP001_TYPESCRIPT_CYPRESS` unchanged (metrics, Memory keys, parity docs)
  - `.gitignore` updated to use generic `node_modules/` and `dist/` patterns (covers all future Stacks)

### Breaking Changes
- Phase 8 — CLI surface hardening for `DEMOAPP001_TYPESCRIPT_CYPRESS`:
  - `npm start` now returns exit code `0` only when all puzzles resolve to `SOLVED`
  - `npm start` now returns non-zero (`1`) when any puzzle is `STUCK_ON_ADVANCED_LOGIC`, timeout is exceeded, or an argument/runtime error occurs
  - Added CLI options: `--help` and `--timeout <ms>` / `--timeout=<ms>`

### Added
- SUD-02 (review `CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z` Risk 1): `DOCS/.design/sudoku-solver-platform-specification.md` v1.1 — platform specification evolving the v1.0 baseline (which it marks as the original core baseline): core solver contract, deliberate extensions (row/column/block Hidden Singles promoted to explicit requirement, audit trail, REST API, web UI, Docker Compose, performance tooling), stack parity rules, and staged-capability surfaces (API/web on the roadmap for DEMOAPP002/003). Recorded as DR-034 (Proposed; accepted on merge of the carrying PR). Root `README.md` version/status metadata is deliberately untouched until acceptance.
- `demo-apps/demoapp003-csharp-specflow/` with C# solver/orchestrator, Screenplay-style actors, abilities, tasks, questions, Memory keys, SpecFlow step definitions, and 46 canonical scenarios.
- Root parity helpers: `.batch/run-parity-checks.ps1`, C#-aware feature parity checks, and C# Memory key parity checks.
- Root benchmark helper `.batch/run-performance-benchmarks.ps1` and per-Stack benchmark runners.
- `docker-compose.yml` plus Stack-local Dockerfiles for TypeScript, Python, and C# local development containers.
- Planning hygiene docs: `todo-csharp-screenplay-stack.md`, `todo-interactive-sudoku-tutor.md`, refreshed todo statuses, and `2026-05-28_backlog-to-todo-plan-implementation.md`.
- BACKLOG-009: DEMOAPP001 Express REST API wrapper:
  - `npm run start:api` starts the API server on `PORT` or 3000
  - Technique endpoints for Unit Completion, Hidden Singles, and Naked Singles
  - `POST /api/solve` returns AuditLogger-backed step/change tracking
  - Puzzle list/get endpoints and grid validation endpoint
  - `npm run test:api` integration checks for all API endpoints
- Phase 2 — Serenity/JS Screenplay Foundation:
  - `@serenity-js/core`, `@serenity-js/cucumber`, `@serenity-js/assertions` v3.43.2 installed
  - `tests/screenplay/` directory structure: `abilities/`, `actors/`, `tasks/`, `questions/`, `support/`, `step_definitions/`
  - `tests/screenplay/support/memory-keys.ts` — 6 Memory key constants (RA §8.1 compliant)
  - `tests/screenplay/abilities/UseSudokuSolver.ts` — wraps SudokuSolver + SudokuOrchestrator
  - `tests/screenplay/abilities/LoadPuzzles.ts` — wraps PuzzleLoader
  - `tests/screenplay/actors/SudokuActors.ts` — Cast equipping UseSudokuSolver + LoadPuzzles
  - `tests/screenplay/support/configure.ts` — registers Cast with Serenity/JS
  - `DR-008` — documents Serenity/JS 3.43.2 API adaptations (`extends Ability`, path corrections)
- `decision-register.md` at repository root with DR-001–DR-005 backfilled (Phase 0 migration)
- `CHANGELOG.md` at repository root (this file)
- Planning backlog at `DOCS/.planning/backlog.md`
- `DOCS/.design/naming-conventions.md` — authoritative naming conventions (RA v1.1: `DOCS/design/`; DR-001 dot-prefix applied; initially created at root then corrected)
- `DOCS/.templates/` directory with project-specific templates:
  - `decision-record.template.md` (adapted from Reference Architecture §10.6)
  - `changelog.template.md`
  - `backlog.template.md`
  - `naming-conventions.template.md`
- `DOCS/.algorithm/` directory with algorithm pseudocode documents (moved from DOCS root)
- `DOCS/.templates/algorithm.template.md` — canonical template for algorithm documentation
- `DOCS/.algorithm/README.md` — algorithm directory guide
- `DOCS/reference-architecture.md` — Screenplay-BDD Reference Architecture (v1.1)
- `DOCS/.analysis/ref-arch-alignment_2026-05-14.md` — alignment report (updated for v1.1)
- `DR-006` in `decision-register.md` — records adoption of RA v1.1 and path corrections
- `DR-007` in `decision-register.md` — records establishment of features-shared/ canonical store
- `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` — canonical feature store (Phase 1 migration)
- `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature` — Stack-local copy with `@util @stack-demoapp001` tags

### Changed
- `cucumber.js` — requireModule now includes `@serenity-js/cucumber`; require path changed to `tests/screenplay/step_definitions/`; worldParameters removed (Cast configured via support/configure.ts)
- `DOCS/reference-architecture.md` updated from v1.0 to v1.1 (DR-006)
- `CLAUDE.md` updated: Stack inventory, risk register, canonical feature update procedure, `decision-register.md` reference, `naming-conventions.md` path corrected to `DOCS/.design/`
- `DOCS/README.md` updated: reflects `.algorithm/`, `templates/` directories, root-level governance documents, `naming-conventions.md` at corrected path
- `DOCS/.algorithm/sudoku-basic-solver.md` and `sudoku-advanced-solver.md` — relative paths updated after move to `.algorithm/`
- `DOCS/.analysis/ref-arch-alignment_2026-05-14.md` — revised against RA v1.1; Phase 0 completion status added; §6, §9, §13, §14, §15 updated

### Removed
- `demo-apps/demoapp001-typescript-cypress/tests/BasicSudokuSolverLogic.feature` — replaced by Stack-local copy at `tests/features/`

---

## [0.4.0] — 2026-05-14

### Added
- Screenplay migration design (`DOCS/.design/screenplay-migration.md`) — complete design for migrating from procedural `SudokuWorld` to Screenplay pattern (Actor, Ability, Task, Question)
- `DOCS/.design/web-ui-solver-visualisation.md` — Web UI solver visualisation design
- `DOCS/.design/naming-conventions-design.md` — naming conventions design (now also promoted to `naming-conventions.md`)
- `DOCS/.planning/todo-hidden-singles-implementation.md`
- `DOCS/.planning/todo-web-ui-solver-visualisation.md`
- `DOCS/.howto/` directory with `debug-sudoku-solver.md` and template
- `DOCS/.planning/prompt-playbook-20260330T1645Z.md` — AI session reproducibility guide
- Code review: `CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z` (grade: A-)
- Implementation log: `IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md`

### Changed
- Hidden Singles algorithm extended to check rows and columns (previously blocks only)
- Constants centralised in `app_src/constants.ts` (`GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`, `MAX_DIGIT`)
- Prettier code formatting applied across all TypeScript source files
- DOCS master index (`DOCS/README.md`) created and cross-referenced

---

## [0.3.0] — 2026-03-30

### Added
- Code reviews: `CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z` (grade: B+), `CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z`
- `DOCS/.design/screenplay-migration.md` first draft
- `DOCS/.planning/todo-rest-api-wrapper.md`, `todo-audit-trail-feature.md`

### Changed
- Backlog updated with items from Opus 4.6 and GPT-5.3 Codex reviews

---

## [0.2.0] — 2026-01-30

### Added
- Working Cucumber.js test suite: 43 scenarios, 241 steps, all passing
- `DOCS/.design/audit-trail-feature.md`
- `DOCS/.design/rest-api-wrapper.md`
- `DOCS/.algorithm/sudoku-basic-solver.md` (originally at `DOCS/sudoku-basic-solver.md`)
- `DOCS/.algorithm/sudoku-advanced-solver.md`
- `DOCS/.implementation/IMPL_LOG_2026-01-30_Initial_Project_Creation.md`
- Code review: `CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z` (grade: A-)

### Fixed
- Hidden Singles algorithm: previously only checked 3×3 blocks; now checks rows and columns (partial — completed in 0.4.0)

---

## [0.1.0] — 2026-01-30

### Added
- Initial TypeScript Sudoku solver implementation
  - `SudokuSolver.ts` — Unit Completion, Hidden Singles, Naked Singles algorithms
  - `SudokuOrchestrator.ts` — solving loop
  - `SudokuCLI.ts` — terminal display
  - `PuzzleLoader.ts` — JSON puzzle loading and validation
  - `index.ts` — entry point
- `puzzles.json` with 5 test puzzles (Easy Scan Grid, Logic Squeeze Grid, Minimal Clues, Crosshatch Challenge, Empty Grid)
- `DOCS/.design/sudoku-solver-specification.md` — tech-agnostic specification
- `CLAUDE.md` — AI agent instruction file
- `README.md` — project documentation
- `package.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`
