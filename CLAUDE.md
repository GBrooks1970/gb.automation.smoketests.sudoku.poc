# CLAUDE.md - AI Assistant Guide

This file gives AI assistants the minimum current context needed to work in this repository without breaking Reference Architecture parity.

## Authority Order

When documents conflict, use this order:

1. `decision-register.md`
2. `DOCS/reference-architecture.md`
3. `DOCS/ref-arch-alignment_2026-05-15.md`
4. Stack-level docs under `demo-apps/demoapp001-typescript-cypress/docs/`
5. This guide

`decision-register.md` is authoritative for structural and process decisions. Current accepted range: DR-001 through DR-026.

## Current Architecture Baseline

- Reference Architecture: v1.11, accepted 2026-05-18
- Active Stack: `DEMOAPP001_TYPESCRIPT_CYPRESS`
- Active surface: `@util` in-process class testing
- Canonical feature store: `features-shared/`
- Stack-local feature copy: `demo-apps/demoapp001-typescript-cypress/tests/features/`
- Screenplay implementation: present and passing with Serenity/JS + Cucumber.js (MIG-04 and MIG-05 resolved by DR-015)
- Implementation logs: authoritative at `DOCS/.implementation-logs/` (DR-019)
- Feature parity script: `.batch/generate-feature-parity-report.ps1` (MIG-10)
- All RA v1.3 migration gaps resolved: MIG-01 through MIG-13 all Resolved
- DOCS subdirectories: all dot + kebab-case (DR-019); no plain-name subdirectories
- Document filenames: all authored docs use kebab-case (DR-020); permanent exceptions: `README.md`, `CHANGELOG.md`, `CLAUDE.md`

## Repository Map

```text
gb.automation.smoketests.sudoku.poc/
|-- demo-apps/
|   `-- demoapp001-typescript-cypress/
|       |-- app_src/
|       |   |-- index.ts
|       |   |-- SudokuSolver.ts
|       |   |-- SudokuOrchestrator.ts
|       |   |-- SudokuCLI.ts
|       |   |-- PuzzleLoader.ts
|       |   `-- constants.ts
|       |-- tests/
|       |   |-- features/
|       |   |   `-- BasicSudokuSolverLogic.feature
|       |   `-- screenplay/
|       |       |-- abilities/
|       |       |-- actors/
|       |       |-- questions/
|       |       |-- step_definitions/
|       |       |-- support/
|       |       `-- tasks/
|       |-- docs/
|       |-- tooling/cucumber.js
|       |-- cucumber.js
|       |-- package.json
|       `-- puzzles.json
|-- features-shared/
|   `-- util-tests/sudoku-solver/BasicSudokuSolverLogic.feature
|-- DOCS/
|   |-- reference-architecture.md
|   |-- ref-arch-alignment_2026-05-15.md
|   |-- .architecture/                      # cross-cutting architecture specs
|   |-- .templates/                         # all document templates
|   |-- .planning/backlog.md                # authoritative backlog
|   |-- .design/naming-conventions.md       # authoritative naming conventions
|   |-- .implementation-logs/               # implementation logs (active + archive template)
|   |-- .review/                            # historical review archive
|   |-- .algorithm/                         # algorithm specifications
|   `-- .howto/                             # how-to guides
|-- .review/README.md                      # future review output location, DR-014
|-- .batch/run-demoapp001.ps1
|-- decision-register.md
|-- CHANGELOG.md
|-- README.md
`-- CLAUDE.md
```

## Stack Inventory

| Stack name | Language | Framework | Surface type | Entry point |
|------------|----------|-----------|--------------|-------------|
| `DEMOAPP001_TYPESCRIPT_CYPRESS` | TypeScript 5.x | Cucumber.js + Serenity/JS | `@util` | `demo-apps/demoapp001-typescript-cypress/` |

Planned future Stacks:

| Stack name | Language | Framework | Surface type | Status |
|------------|----------|-----------|--------------|--------|
| `DEMOAPP002_PYTHON_PYTEST` | Python | pytest-bdd | `@util` | Planned |
| `DEMOAPP003_CSHARP_SPECFLOW` | C# | SpecFlow | `@util` | Planned |

## Development Commands

Run Stack commands from `demo-apps/demoapp001-typescript-cypress/`.

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Run ESLint over app source |
| `npm run format:check` | Check Prettier formatting for app source |
| `npm test` | Run Cucumber/Serenity Screenplay scenarios |
| `npm start -- --help` | Show CLI options |

Repository-level orchestration:

```powershell
.\.batch\run-demoapp001.ps1
```

Expected current baseline:

```text
43 scenarios passed
241 steps passed
OverallExitCode=0
```

## Subject Application

The Sudoku solver implements three deterministic techniques:

| Technique | Method | Current behavior |
|-----------|--------|------------------|
| Unit Completion | `SudokuSolver.unitCompletion()` | Checks rows, columns, and blocks |
| Hidden Singles | `SudokuSolver.hiddenSingles(target)` | Checks rows, columns, and blocks |
| Naked Singles | `SudokuSolver.nakedSingles()` | Eliminates row, column, and block candidates |

Solver result strings:

- `SOLVED`
- `STUCK_ON_ADVANCED_LOGIC`

Available puzzle data is in `demo-apps/demoapp001-typescript-cypress/puzzles.json`.

## Canonical Feature Update Procedure

When adding or changing Gherkin behavior:

1. Edit the canonical feature first: `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`.
2. Copy the changed feature body to `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature`.
3. Keep canonical tags limited to the canonical scope tag, currently `@util`.
4. Add stack-local tags only in the Stack copy, currently `@stack-demoapp001`.
5. Update step definitions under `tests/screenplay/step_definitions/`.
6. Run `npm test` from the Stack directory or `.\.batch\run-demoapp001.ps1` from the repository root.
7. If a scenario cannot yet be implemented, tag it `@pending` locally and add a backlog item to `DOCS/.planning/backlog.md`.
8. If the change creates or changes a structural rule, record it in `decision-register.md`.

## Screenplay Structure

Layer 2 step definitions live under:

```text
demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/
```

Layer 3 Screenplay components live under:

```text
tests/screenplay/tasks/
tests/screenplay/questions/
```

Layer 4 Abilities live under:

```text
tests/screenplay/abilities/
```

Screenplay contract is fully implemented: all six Memory key constants are runtime-active (MIG-04, DR-015) and all step definitions delegate through `actor.attemptsTo()` / `actor.answer()` (MIG-05, DR-015).

## Parity Rules Summary

Governed by `DOCS/reference-architecture.md` v1.3 and decisions DR-012 through DR-020.

| Rule | Current instruction |
|------|---------------------|
| Decision authority | `decision-register.md` wins over restatements elsewhere |
| Feature source | `features-shared/` is canonical; Stack features are copies with stack tags |
| Memory keys | Constant name must equal string value exactly |
| Step text | Stack-local Gherkin text must match canonical text except local tags |
| Backlog statuses | Use exactly `Open`, `In Progress`, or `Resolved` for backlog item status |
| Templates | Use `DOCS/.templates/*.template.md` files |
| Review outputs | New reviews go under root `.review/` with `CODE_REVIEW_[AGENT]_v[N]_[UTC]/` |
| DOCS subdirectories | All use dot + kebab-case (DR-019); no plain-name subdirectories |
| Document filenames | All authored docs use kebab-case (DR-020); exceptions: `README.md`, `CHANGELOG.md`, `CLAUDE.md` |

## Risk Register

| Risk | Area | What to check |
|------|------|---------------|
| Feature drift | `features-shared/` and Stack `tests/features/` | Canonical body and Stack-local body should match after local tag differences |
| Step coupling | `tests/screenplay/step_definitions/*.steps.ts` | Prefer `actor.attemptsTo(...)` and `actor.answer(...)`; direct Ability calls are MIG-05 debt |
| Memory parity | `tests/screenplay/support/memory-keys.ts` | Names and string values must match exactly; runtime Actor Memory wiring is MIG-04 debt |
| Grid mutation | `SudokuSolver` constructor | Preserve deep-copy behavior from `origGrid` to `grid` |
| Hidden Singles | `SudokuSolver.hiddenSingles()` | Preserve row, column, and block checks |
| Document naming drift | New authored docs in DOCS/ | Must use kebab-case (DR-020); check before creating any new .md file |
| Review outputs | `.review/` and `DOCS/.review/` | New reviews go to root `.review/`; historical `DOCS/.review/` bundles stay read-only |

## Documentation Pointers

| Document | Purpose |
|----------|---------|
| `DOCS/ref-arch-alignment_2026-05-15.md` | Current v1.3 compliance and migration status |
| `DOCS/.architecture/screenplay-parity-contract.md` | Memory keys, Tasks, Questions, and parity signatures |
| `DOCS/.architecture/subject-app-contract.md` | Active `@util` and future `@cli` surface contracts |
| `DOCS/.architecture/orchestration-design.md` | Build, test, metrics, and retention design |
| `DOCS/.architecture/logging-design.md` | Logging and reporting strategy |
| `DOCS/.planning/backlog.md` | Authoritative backlog content |
| `DOCS/.design/naming-conventions.md` | Authoritative naming conventions (DR-020: kebab-case for all authored docs) |
| `DOCS/analysis-document-naming-kebab-case-20260516.md` | Document naming impact assessment and migration log (Phases 0–4) |
| `.review/README.md` | Future code review output policy |

## Current Limitations

1. No advanced Sudoku techniques such as Naked Pairs, X-Wing, or Swordfish.
2. No backtracking or trial-and-error solver mode.
3. No GitHub Actions workflow is currently configured.

## Common Tasks

### Add a Puzzle

1. Edit `demo-apps/demoapp001-typescript-cypress/puzzles.json`.
2. Add a puzzle object with `name`, `difficulty`, `description`, and a 9x9 `grid`.
3. Add or update canonical Gherkin if behavior changes.
4. Run `.\.batch\run-demoapp001.ps1`.

### Add a Solving Algorithm

1. Add the method to `SudokuSolver`.
2. Integrate it into `SudokuOrchestrator.solve()`.
3. Add canonical feature coverage in `features-shared/`.
4. Propagate the feature to the Stack-local copy.
5. Add Screenplay Tasks/Questions or step definitions as needed.
6. Update algorithm documentation under `DOCS/.algorithm/`.
7. Run the orchestration script.

### Modify CLI Output

1. Edit `SudokuCLI.ts`.
2. Preserve stdout/stderr separation and explicit exit-code behavior.
3. Run `npm start -- --help` and relevant CLI checks.
4. Run the orchestration script.
