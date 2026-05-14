# Changelog

**Project:** gb.automation.smoketests.sudoku.poc
All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## [Unreleased]

### Added
- Phase 2 — Serenity/JS Screenplay Foundation:
  - `@serenity-js/core`, `@serenity-js/cucumber`, `@serenity-js/assertions` v3.43.2 installed
  - `tests/screenplay/` directory structure: `abilities/`, `actors/`, `tasks/`, `questions/`, `support/`, `step_definitions/`
  - `tests/screenplay/support/memory-keys.ts` — 6 Memory key constants (RA §8.1 compliant)
  - `tests/screenplay/abilities/UseSudokuSolver.ts` — wraps SudokuSolver + SudokuOrchestrator
  - `tests/screenplay/abilities/LoadPuzzles.ts` — wraps PuzzleLoader
  - `tests/screenplay/actors/SudokuActors.ts` — Cast equipping UseSudokuSolver + LoadPuzzles
  - `tests/screenplay/support/configure.ts` — registers Cast with Serenity/JS
  - `DR-008` — documents Serenity/JS 3.43.2 API adaptations (`extends Ability`, path corrections)
- `DECISION_REGISTER.md` at repository root with DR-001–DR-005 backfilled (Phase 0 migration)
- `CHANGELOG.md` at repository root (this file)
- `BACKLOG.md` at repository root (summary; detailed backlog at `DOCS/.planning/BACKLOG.md`)
- `DOCS/.design/NAMING_CONVENTIONS.md` — authoritative naming conventions (RA v1.1: `DOCS/design/`; DR-001 dot-prefix applied; initially created at root then corrected)
- `DOCS/templates/` directory with project-specific templates:
  - `TEMPLATE_Decision_Record.md` (adapted from Reference Architecture §10.6)
  - `TEMPLATE_Changelog.md`
  - `TEMPLATE_Backlog.md`
  - `TEMPLATE_Naming_Conventions.md`
- `DOCS/.algorithm/` directory with algorithm pseudocode documents (moved from DOCS root)
- `DOCS/.algorithm/TEMPLATE_Algorithm.md` — template for algorithm documentation
- `DOCS/.algorithm/README.md` — algorithm directory guide
- `DOCS/REFERENCE_ARCHITECTURE.md` — Screenplay-BDD Reference Architecture (v1.1)
- `DOCS/ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md` — alignment report (updated for v1.1)
- `DR-006` in `DECISION_REGISTER.md` — records adoption of RA v1.1 and path corrections
- `DR-007` in `DECISION_REGISTER.md` — records establishment of features_shared/ canonical store
- `features_shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` — canonical feature store (Phase 1 migration)
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/features/BasicSudokuSolverLogic.feature` — Stack-local copy with `@util @stack-demoapp001` tags

### Changed
- `cucumber.js` — requireModule now includes `@serenity-js/cucumber`; require path changed to `tests/screenplay/step_definitions/`; worldParameters removed (Cast configured via support/configure.ts)
- `DOCS/REFERENCE_ARCHITECTURE.md` updated from v1.0 to v1.1 (DR-006)
- `CLAUDE.md` updated: Stack inventory, risk register, canonical feature update procedure, `DECISION_REGISTER.md` reference, `NAMING_CONVENTIONS.md` path corrected to `DOCS/.design/`
- `DOCS/README.md` updated: reflects `.algorithm/`, `templates/` directories, root-level governance documents, `NAMING_CONVENTIONS.md` at corrected path
- `DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md` and `ALGORITHM_Sudoku_Advanced_Solver.md` — relative paths updated after move to `.algorithm/`
- `DOCS/ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md` — revised against RA v1.1; Phase 0 completion status added; §6, §9, §13, §14, §15 updated

### Removed
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/BasicSudokuSolverLogic.feature` — replaced by Stack-local copy at `tests/features/`

---

## [0.4.0] — 2026-05-14

### Added
- Screenplay migration design (`DOCS/.design/DESIGN_Screenplay_Migration.md`) — complete design for migrating from procedural `SudokuWorld` to Screenplay pattern (Actor, Ability, Task, Question)
- `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` — Web UI solver visualisation design
- `DOCS/.design/DESIGN_Naming_Conventions.md` — naming conventions design (now also promoted to `NAMING_CONVENTIONS.md`)
- `DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md`
- `DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md`
- `DOCS/.howto/` directory with `HOWTO_Debug_SudokuSolver.md` and template
- `DOCS/.planning/PROMPT_PLAYBOOK_20260330T1645Z.md` — AI session reproducibility guide
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
- `DOCS/.design/DESIGN_Screenplay_Migration.md` first draft
- `DOCS/.planning/TODO_REST_API_Wrapper.md`, `TODO_Audit_Trail_Feature.md`

### Changed
- Backlog updated with items from Opus 4.6 and GPT-5.3 Codex reviews

---

## [0.2.0] — 2026-01-30

### Added
- Working Cucumber.js test suite: 43 scenarios, 241 steps, all passing
- `DOCS/.design/DESIGN_Audit_Trail_Feature.md`
- `DOCS/.design/DESIGN_REST_API_Wrapper.md`
- `DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md` (originally at `DOCS/ALGORITHM_Sudoku_Basic_Solver.md`)
- `DOCS/.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md`
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
- `DOCS/.design/DESIGN_Sudoku_Solver_Specification.md` — tech-agnostic specification
- `CLAUDE.md` — AI agent instruction file
- `README.md` — project documentation
- `package.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`
