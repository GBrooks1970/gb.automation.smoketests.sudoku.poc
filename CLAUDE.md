# CLAUDE.md - AI Assistant Guide

This file gives AI assistants the minimum current context needed to work in this repository without breaking Reference Architecture parity.

## Authority Order

When documents conflict, use this order:

1. `decision-register.md`
2. `DOCS/reference-architecture.md`
3. `DOCS/.analysis/ref-arch-alignment_2026-05-15.md`
4. Stack-level docs under `demo-apps/demoapp001-typescript-cypress/docs/`
5. This guide

`decision-register.md` is authoritative for structural and process decisions. Current accepted range: DR-001 through DR-036 (excluding superseded/deprecated entries).

## Current Architecture Baseline

- Reference Architecture: v1.15, accepted 2026-05-20
- Active Stacks: `DEMOAPP001_TYPESCRIPT_CYPRESS`, `DEMOAPP002_PYTHON_PYTEST`, `DEMOAPP003_CSHARP_SPECFLOW`
- Active test surface: `@util` in-process class testing
- Active API surface: DEMOAPP001 Express REST API at `app_src/server/index.ts`
- Canonical feature store: `features-shared/`
- Stack-local feature copies: `demo-apps/demoapp001-typescript-cypress/tests/features/`, `demo-apps/demoapp002-python-pytest/tests/features/`, `demo-apps/demoapp003-csharp-specflow/tests/features/`
- Screenplay implementations: DEMOAPP001 passing with Serenity/JS + Cucumber.js; DEMOAPP002 passing with pytest-bdd; DEMOAPP003 passing with Reqnroll + NUnit
- Implementation logs: authoritative at `DOCS/.implementation-logs/` (DR-019)
- Feature parity script: `.batch/generate-feature-parity-report.ps1` (MIG-10)
- All RA v1.3 migration gaps resolved: MIG-01 through MIG-13 all Resolved; RA v1.14 review-location rule resolved by DR-029
- DOCS subdirectories: all dot + kebab-case (DR-019); no plain-name subdirectories
- Document filenames: all authored docs use kebab-case (DR-020); permanent exceptions: `README.md`, `CHANGELOG.md`, `CLAUDE.md`

## Repository Map

```text
gb.automation.smoketests.sudoku.poc/
|-- demo-apps/
|   |-- demoapp001-typescript-cypress/
|   |   |-- app_src/
|   |   |   |-- index.ts
|   |   |   |-- SudokuSolver.ts
|   |   |   |-- SudokuOrchestrator.ts
|   |   |   |-- SudokuCLI.ts
|   |   |   |-- PuzzleLoader.ts
|   |   |   |-- constants.ts
|   |   |   `-- server/
|   |   |-- tests/
|   |   |   |-- features/
|   |   |   |   `-- BasicSudokuSolverLogic.feature
|   |   |   `-- screenplay/
|   |   |       |-- abilities/
|   |   |       |-- actors/
|   |   |       |-- questions/
|   |   |       |-- step_definitions/
|   |   |       |-- support/
|   |   |       `-- tasks/
|   |   |-- docs/
|   |   |-- tooling/cucumber.js
|   |   |-- cucumber.js
|   |   |-- package.json
|   |   `-- puzzles.json
|   |-- demoapp002-python-pytest/
|   |   |-- app_src/
|   |   |   |-- sudoku_solver.py
|   |   |   |-- sudoku_orchestrator.py
|   |   |   |-- puzzle_loader.py
|   |   |   |-- audit.py
|   |   |   `-- constants.py
|   |   |-- tests/
|   |   |   |-- features/
|   |   |   |   `-- BasicSudokuSolverLogic.feature
|   |   |   `-- screenplay/
|   |   |       |-- abilities/
|   |   |       |-- fixtures/
|   |   |       |-- questions/
|   |   |       |-- step_definitions/
|   |   |       |-- support/
|   |   |       `-- tasks/
|   |   |-- pyproject.toml
|   |   `-- puzzles.json
|   `-- demoapp003-csharp-specflow/
|       |-- app_src/
|       |-- tests/
|       |   |-- features/
|       |   |   `-- BasicSudokuSolverLogic.feature
|       |   `-- screenplay/
|       |-- tooling/performance/
|       |-- docs/
|       `-- puzzles.json
|-- features-shared/
|   `-- util-tests/sudoku-solver/BasicSudokuSolverLogic.feature
|-- DOCS/
|   |-- reference-architecture.md
|   |-- .architecture/                      # cross-cutting architecture specs
|   |-- .analysis/                          # analysis and report-style docs, DR-030
|   |-- .templates/                         # all document templates
|   |-- .planning/backlog.md                # authoritative backlog
|   |-- .design/naming-conventions.md       # authoritative naming conventions
|   |-- .implementation-logs/               # implementation logs (active + archive template)
|   |-- .review/                            # review outputs, DR-029
|   |-- .algorithm/                         # algorithm specifications
|   `-- .howto/                             # how-to guides
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
| `DEMOAPP002_PYTHON_PYTEST` | Python 3.13 | pytest-bdd | `@util` | `demo-apps/demoapp002-python-pytest/` |
| `DEMOAPP003_CSHARP_SPECFLOW` (stable legacy ID) | C# / .NET 10 | Reqnroll + NUnit | `@util` | `demo-apps/demoapp003-csharp-specflow/` |

## Development Commands

Run DEMOAPP001 commands from `demo-apps/demoapp001-typescript-cypress/`.

| Command | Purpose |
|---------|---------|
| `npm ci` | Install locked dependencies |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Run ESLint over app source |
| `npm run format:check` | Check Prettier formatting for app source |
| `npm test` | Run Cucumber/Serenity Screenplay scenarios |
| `npm run test:api` | Run REST API integration checks |
| `npm run start:api` | Start Express REST API on `PORT` or 3000 |
| `npm run start:web` | Start the combined Express API and Web UI server |
| `npm start -- --help` | Show CLI options |

Run DEMOAPP002 commands from `demo-apps/demoapp002-python-pytest/`.

| Command | Purpose |
|---------|---------|
| `python -m pip install -c requirements-test.lock -e ".[test]"` | Install constrained Python Stack test dependencies |
| `python -m pytest` | Run pytest-bdd Screenplay scenarios |

Run DEMOAPP003 commands from `demo-apps/demoapp003-csharp-specflow/`.

| Command | Purpose |
|---------|---------|
| `dotnet restore --locked-mode` | Restore locked C# Stack dependencies |
| `dotnet test --no-restore` | Run Reqnroll/NUnit Screenplay scenarios |
| `dotnet run --project tooling/performance/DemoApp003.Performance.csproj --configuration Release` | Run C# reporting-only benchmarks |

Repository-level orchestration:

```powershell
.\.batch\run-demoapp001.ps1
.\.batch\run-parity-checks.ps1
.\.batch\run-performance-benchmarks.ps1
docker compose config
docker compose run --rm demoapp001-tests
docker compose run --rm demoapp002-tests
docker compose run --rm demoapp003-tests
docker compose run --rm parity-checks
docker compose --profile api up demoapp001-api
docker compose --profile benchmark run --rm performance-benchmarks
```

Docker runtime commands require Docker Desktop or another Docker Engine with Compose v2.

Expected current baseline:

```text
DEMOAPP001: 46 scenarios passed / 257 steps passed
DEMOAPP002: 46 pytest-bdd scenarios passed
DEMOAPP003: 46 Reqnroll scenarios passed
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

Governed by `DOCS/reference-architecture.md` v1.15 and decisions DR-012 through DR-033.

| Rule | Current instruction |
|------|---------------------|
| Decision authority | `decision-register.md` wins over restatements elsewhere |
| Feature source | `features-shared/` is canonical; Stack features are copies with stack tags |
| Memory keys | Constant name must equal string value exactly |
| Step text | Stack-local Gherkin text must match canonical text except local tags |
| Backlog statuses | Use exactly `Open`, `In Progress`, or `Resolved` for backlog item status |
| Templates | Use `DOCS/.templates/*.template.md` files |
| Review outputs | New reviews go under `DOCS/.review/` with `CODE_REVIEW_[AGENT]_v[N]_[UTC]/` |
| Analysis reports | New one-time analysis/report docs go under `DOCS/.analysis/` |
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
| Review outputs | `DOCS/.review/` | New and historical reviews live under `DOCS/.review/`; do not recreate root `.review/` |
| Analysis reports | `DOCS/.analysis/` | One-time analysis/report docs live under `DOCS/.analysis/`; do not place them at DOCS root |

## Documentation Pointers

| Document | Purpose |
|----------|---------|
| `DOCS/.analysis/ref-arch-alignment_2026-05-15.md` | Historical v1.3 compliance and migration status |
| `DOCS/.architecture/screenplay-parity-contract.md` | Memory keys, Tasks, Questions, and parity signatures |
| `DOCS/.architecture/subject-app-contract.md` | Active `@util` and future `@cli` surface contracts |
| `DOCS/.architecture/validation-boundaries.md` | Validation layer responsibilities: loader = structure, solver/API = constraints (DR-035) |
| `DOCS/.architecture/orchestration-design.md` | Build, test, metrics, and retention design |
| `DOCS/.architecture/logging-design.md` | Logging and reporting strategy |
| `DOCS/.planning/backlog.md` | Authoritative backlog content |
| `DOCS/.design/naming-conventions.md` | Authoritative naming conventions (DR-020: kebab-case for all authored docs) |
| `DOCS/.analysis/analysis-document-naming-kebab-case-20260516.md` | Document naming impact assessment and migration log (Phases 0–4) |
| `DOCS/.review/README.md` | Code review output policy |

## Current Limitations

1. No advanced Sudoku techniques such as Naked Pairs, X-Wing, or Swordfish.
2. No backtracking or trial-and-error solver mode.

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
