# Changelog

**Project:** gb.automation.smoketests.sudoku.poc
All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## [Unreleased]

### Changed
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
- `DOCS/ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md` — alignment report (updated for v1.1)
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
- `DOCS/ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md` — revised against RA v1.1; Phase 0 completion status added; §6, §9, §13, §14, §15 updated

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
