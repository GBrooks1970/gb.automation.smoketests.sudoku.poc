# Screenplay-BDD Reference Architecture — Alignment & Migration Report

**Date:** 2026-05-14
**Updated:** 2026-05-15 (Phase 8 complete — CLI contract hardened and migration phases closed)
**Analyst:** CLAUDE Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` vs. `REFERENCE_ARCHITECTURE.md` v1.1
**Status:** Living — updated when RA version changes

---

## Executive Summary

This report scores the project against every normative obligation in the Screenplay-BDD Reference Architecture (`REFERENCE_ARCHITECTURE.md`, Status: Accepted, 2026-05-14). The analysis covers structure, pattern compliance, surface-type contract, documentation, and orchestration.

**Overall compliance: High** *(upgraded — Phases 0–8 complete)*

The full Screenplay layer is now implemented. Layer 2 (Step Definitions), Layer 3 (Tasks + Questions), and Layer 4 (Abilities + Cast) are all operational. All 43 scenarios pass with the new Screenplay step definitions. Stack-level documentation and tooling configuration are in place (Phase 5), cross-cutting architecture documentation is established (Phase 6), orchestration plus metrics artifacts are implemented (Phase 7), and CLI contract hardening is complete (Phase 8).

| Area | Status | Severity |
|------|--------|----------|
| Screenplay Layer 4 — Abilities + Cast | ✅ Complete — Phase 2 (DR-008) | — |
| Screenplay Layer 3 — Tasks + Questions | ✅ Complete — Phase 3 | — |
| Screenplay Layer 2 — Step Definitions | ✅ Complete — Phase 4 (43 scenarios, 241 steps passing) | — |
| Canonical Feature Store (`features-shared/`) | ✅ Complete — Phase 1 (DR-007) | — |
| Memory key constants | ✅ Complete — Phase 2 (6 constants, RA §8.1) | — |
| Directory blueprint — Screenplay dirs | ✅ Complete — all 6 dirs populated (abilities, actors, tasks, questions, support, step_definitions) | — |
| CLI surface contract | Partial | High |
| Repository-level required documents | ✅ All present and at correct paths | — |
| Stack-level documentation | ✅ Complete — Phase 5 (`docs/` + 4 required files) | — |
| `DOCS/templates/` mandate | ✅ Complete — all 14 templates present | — |
| `DECISION_REGISTER.md` | ✅ DR-001–DR-008 | — |
| Cross-cutting architecture docs (`DOCS/architecture/`) | ✅ Complete — Phase 6 (4 required documents) | — |
| Orchestration scripts + metrics | ✅ Complete — Phase 7 (`.batch/run-demoapp001.ps1` + `.results/.metrics`) | — |
| AI agent instruction file | ✅ Complete — Phase 0 | — |
| Algorithm documentation | ✅ Aligned | — |
| Code review directory | Structurally minor drift (inside DOCS/, not root) | Low |
| Implementation logs | ✅ Aligned | — |

> **Current migration status (2026-05-15):** Phases 0–8 fully complete. Full Screenplay layer operational: 6 Abilities/Cast methods, 6 Tasks, 6 Questions, 10 step definition files. Stack docs created (`ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md`, `README.md`) and `tooling/cucumber.js` configured. Cross-cutting architecture docs created (`screenplay-parity-contract.md`, `subject-app-contract.md`, `orchestration-design.md`, `logging-design.md`). Orchestration runner implemented at `.batch/run-demoapp001.ps1` with timestamped metrics in `.results/.metrics/`. CLI now supports `--help`, `--timeout`, timeout enforcement, and explicit exit-code mapping. 43 scenarios / 241 steps all passing.

---

## 1. Subject Application Surface Type

### 1.1 Identification

The subject application (`SudokuSolver`, `SudokuOrchestrator`, `SudokuCLI`) is a **CLI surface** per §6.3. It is invoked via `npm start` (which calls `ts-node app_src/index.ts`).

However, the current step definitions **do not interact via the CLI surface at all**. They directly import and instantiate TypeScript classes in-process. This makes the current test suite a **util-surface** engagement (`@util` in the Reference Architecture's tag taxonomy, §5.3): testing logic without a live subject application process.

This is an important distinction — the two possible target states are:

| Option | Surface Type | Description |
|--------|-------------|-------------|
| A (Current intent) | `@util` | Test classes in-process. No process lifecycle needed. |
| B (Future / parity) | `@cli` | Invoke compiled binary, capture stdout, assert on output. |

Option A is the correct interpretation for this project's current scope. The Screenplay migration design (`DESIGN_Screenplay_Migration.md`) confirms this: the `UseSudokuSolver` Ability wraps the TypeScript classes directly, not the CLI output. Scenarios should be tagged `@util` in the canonical feature store.

### 1.2 CLI Contract Status (§6.3)

Phase 8 closes the previously identified CLI hardening gaps while preserving the current `@util` test strategy.

| Requirement | Current state | Gap |
|-------------|--------------|-----|
| Invokable as single command | `npm start` ✅ | — |
| Documented argument/option interface | `--help`, `--timeout <ms>`, `--timeout=<ms>` ✅ | — |
| Exit code: 0 for success, non-zero for failure | Explicit mapping in `index.ts` ✅ | — |
| Stdout for output, stderr for errors | Human-readable output to stdout; errors to stderr ✅ | — |
| Deterministic output for given inputs | Yes ✅ | — |
| Documented time bound | Optional timeout via `--timeout` ✅ | — |

---

## 2. Five-Layer Architecture (§2.1)

### 2.1 Layer Inventory

```
Layer 1 — Feature Files (Gherkin)
  File: tests/features/BasicSudokuSolverLogic.feature (Stack-local)
        features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature (canonical)
  Status: ✅ COMPLETE — 43 scenarios; @util + @stack-demoapp001 tags; canonical store live

Layer 2 — Step Definitions
  Files: tests/screenplay/step_definitions/*.steps.ts (10 files)
  Status: ✅ COMPLETE — Phase 4; thin Screenplay delegations; 241 steps passing
  Former procedural file solver_steps.ts/js deleted

Layer 3 — Screenplay (Actor / Tasks / Questions)
  Tasks: InitialiseGrid, ApplyAlgorithm, SolvePuzzle, LoadPuzzleByName,
         SetupGridState, AttemptPlacement
  Questions: SolveStatus, GridCell, AlgorithmMadeProgress, LoadedPuzzleCount,
             PlacementValidity, ErrorThrown
  Status: ✅ COMPLETE — Phase 3; Interaction.where() pattern; no assertion logic in Tasks

Layer 4 — Abilities
  Files: tests/screenplay/abilities/UseSudokuSolver.ts, LoadPuzzles.ts
  Status: ✅ COMPLETE — Phase 2 + Phase 3 extensions; DR-008; extends Ability (v3 pattern)

Layer 5 — Subject Application
  Files: app_src/SudokuSolver.ts, SudokuOrchestrator.ts, SudokuCLI.ts, PuzzleLoader.ts
  Status: ✅ WELL ALIGNED — clean, deterministic, single-responsibility
```

### 2.2 Direction of Dependency Violation

The Reference Architecture requires dependencies to flow **downward only** (§2.2). Currently, Layer 2 (Step Definitions) directly imports Layer 5 (production classes):

```javascript
// solver_steps.js — current state
const SudokuSolver_1 = require("../../app_src/SudokuSolver");
const SudokuOrchestrator_1 = require("../../app_src/SudokuOrchestrator");
const PuzzleLoader_1 = require("../../app_src/PuzzleLoader");
```

Steps call `new SudokuSolver_1.SudokuSolver(...)` directly — skipping Layers 3 and 4 entirely. This is the root cause of the coupling problem identified in `DESIGN_Screenplay_Migration.md` §2.2.

---

## 3. Screenplay Pattern (§3)

### 3.1 Component Compliance Matrix

| Component | Contract requirement | Current state |
|-----------|---------------------|--------------|
| **Actor** | Created fresh per scenario; holds Abilities; executes Tasks; answers Questions | Not implemented |
| **Ability** | Wraps interaction surface; exposes stable interface; stores results in Memory | Not implemented; design complete in `DESIGN_Screenplay_Migration.md` §5.2 |
| **Task** | Factory pattern; `performAs(actor)`; no assertion logic; no direct Subject Application access | Not implemented; design complete §5.3 |
| **Question** | Factory pattern; `answeredBy(actor)`; side-effect free; returns typed value | Not implemented; design complete §5.4 |
| **Memory** | Key-value store; named constants; cleared per scenario | Not implemented; `SudokuWorld` mutable fields are the ad-hoc substitute |

### 3.2 Memory Key Compliance (§3.5, §8.1)

Memory key constants **must be defined as named constants, not inline strings**, and the constant name must equal its string value exactly.

**Current state:** No Memory key system exists. State is managed through typed fields on `SudokuWorld`:
- `this.solver` — equivalent of an ability reference
- `this.lastChanged` — equivalent of `ALGORITHM_MADE_PROGRESS`
- `this.solveResult` — equivalent of `SOLVE_RESULT`
- `this.lastError` — equivalent of `LAST_ERROR`
- `this.targetCell` — ad-hoc state between steps
- `this.gridSnapshot` — ad-hoc state between steps

**Required:** A `screenplay/support/memory-keys.ts` file with constants following the pattern:
```typescript
export const SOLVE_RESULT         = 'SOLVE_RESULT';
export const ALGORITHM_PROGRESS   = 'ALGORITHM_PROGRESS';
export const LAST_ERROR           = 'LAST_ERROR';
export const TARGET_CELL          = 'TARGET_CELL';
export const GRID_SNAPSHOT        = 'GRID_SNAPSHOT';
```

---

## 4. Directory Structure (§4)

### 4.1 Required vs Actual

```
REQUIRED (§4)                          ACTUAL
─────────────────────────────────────  ───────────────────────────────────────────────
features-shared/                       PRESENT ✅ (Phase 1 — DR-007)
  util-tests/
    sudoku-solver/
      BasicSudokuSolverLogic.feature   PRESENT ✅ (@util tag; canonical source)

demo-apps/demoapp001-typescript-cypress/  demo-apps/demoapp001-typescript-cypress/
  app_src/                (subject)      app_src/               ✅
  tests/                               tests/
    features/             PRESENT ✅     features/BasicSudokuSolverLogic.feature ✅ (@util @stack-demoapp001)
    step_definitions/     PARTIAL ✓      step_definitions/solver_steps.js (exists, wrong form — Phase 4)
    screenplay/           PARTIAL ✓      (Phase 2 — foundation present)
      abilities/          PRESENT ✅     UseSudokuSolver.ts, LoadPuzzles.ts
      actors/             PRESENT ✅     SudokuActors.ts (Cast)
      tasks/              ABSENT ✗       (Phase 3)
      questions/          ABSENT ✗       (Phase 3)
      support/            PRESENT ✅     memory-keys.ts, configure.ts
      step_definitions/   ABSENT ✗       (Phase 4)
  tooling/                PRESENT ✅     tooling/cucumber.js (Phase 5)
  docs/                   PRESENT ✅     ARCHITECTURE.md, SCREENPLAY_GUIDE.md, QA_STRATEGY.md, README.md (Phase 5)

packages/                  ABSENT (optional, not yet needed)
.batch/ OR scripts/        ABSENT ✗       (no orchestration)
DOCS/
  algorithm/               PRESENT as .algorithm/ (DR-001 dot-prefix — name drift)
  architecture/            ABSENT ✗
  design/                  PRESENT as .design/ (DR-001 dot-prefix — name drift)
    NAMING_CONVENTIONS.md  PRESENT as DOCS/.design/NAMING_CONVENTIONS.md ✅ (v1.1 §10.9)
  planning/                PRESENT as .planning/ (DR-001 dot-prefix — name drift)
    BACKLOG.md             PRESENT at DOCS/.planning/BACKLOG.md ✅ (v1.1 §10.1)
  implementation-logs/     PRESENT as .implementation/ (DR-001 dot-prefix — name drift)
  templates/               PRESENT ✅ (Phase 0 — all 14 templates created)

code-review/ OR .review/   PRESENT as DOCS/.review/ (inside DOCS, not at root)

README.md                  ✅
CHANGELOG.md               ✅ (Phase 0)
BACKLOG.md (at root)       NOT REQUIRED by v1.1 — present as convenience redirect only
DECISION_REGISTER.md       ✅ (Phases 0–2 — DR-001–DR-008)
CLAUDE.md (agent file)     ✅ (Phase 0 — stack inventory, risk register, procedure; Phase 1 — feature sync note updated)
```

### 4.2 DOCS Subdirectory Naming Drift

The project uses dot-prefixed directory names (`DOCS/.algorithm/`, `DOCS/.design/`, `DOCS/.implementation/`, `DOCS/.planning/`, `DOCS/.review/`, `DOCS/.howto/`). The Reference Architecture uses non-dotted names (`DOCS/algorithm/`, `DOCS/architecture/`, `DOCS/planning/`, `DOCS/implementation-logs/`).

The dot-prefix convention is intentional — keeping documentation directories visually distinct and sort-first in file explorers. It is a documented divergence from the Reference Architecture, recorded as DR-001.

---

## 5. Canonical Feature Store (§5)

### 5.1 Current State

**Phase 1 complete (DR-007).** The Canonical Feature Store now exists:

```
features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature   ← canonical (@util)
demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature  ← Stack-local (@util @stack-demoapp001)
```

When a second Stack (Python, C#) is onboarded, it copies from `features-shared/` — the authoritative source is now in place.

### 5.2 Feature File Quality Assessment

Despite the location issue, the feature file quality is high:

| Criterion | Status |
|-----------|--------|
| Plain language, no code | ✅ |
| Scenarios organised by algorithm | ✅ |
| Background step for shared precondition | ✅ |
| Scenario Outline with Examples table | ✅ |
| Parameterised steps (many use `{int}`, `{string}`, `{word}`) | ✅ Mostly |
| Surface tags (`@util`) | ✅ Added — Feature-level `@util` in canonical file (Phase 1) |
| Lifecycle tags (`@requires-app`) | N/A — `@util` surface requires no app startup |
| Over-specified steps | Partial — see §5.3 |

### 5.3 Step Text — Over-Specified Examples

The Reference Architecture (§5.4) flags steps that name specific values inline. These cannot be reused:

```gherkin
# Over-specified — hardcoded values
Given a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]
Given an empty cell has 3 possible candidates: [2, 5, 8]
Then all 3 cells should be filled with their respective values
```

These should be refactored to use parameters or Examples tables:
```gherkin
# Parameterised — reusable
Given a row contains the values <row_values>
Given an empty cell has <count> possible candidates: <candidates>
```

However, many steps are already well-parameterised:
```gherkin
Given row {int} is missing the number {int}
When the {string} algorithm is executed for value {int}
Then the system should place {int} in the only valid cell in row {int}
```

---

## 6. Required Documents (§10.1, §10.9) — v1.1 Paths

> **v1.1 change note:** `BACKLOG.md` is no longer a root-level requirement — it is required at `DOCS/planning/BACKLOG.md`. `NAMING_CONVENTIONS.md` is no longer root/DOCS-flexible — it is required at `DOCS/design/NAMING_CONVENTIONS.md`. The root document set is now: `README.md`, `CHANGELOG.md`, `DECISION_REGISTER.md`, and the AI agent instruction file.

### 6.1 Root-Level Documents (§10.1)

| Document | Required path (v1.1) | Status | Notes |
|----------|---------------------|--------|-------|
| `README.md` | Repository root | ✅ Exists, comprehensive | — |
| `CHANGELOG.md` | Repository root | ✅ Created (Phase 0) | — |
| `DECISION_REGISTER.md` | Repository root | ✅ DR-001–DR-007 | — |
| AI agent instruction file | Repository root | ✅ `CLAUDE.md` — updated Phase 0 | — |

### 6.2 DOCS-Level Documents (§10.1, §10.9)

| Document | Required path (v1.1) | Project path (DR-001 dot-prefix) | Status |
|----------|---------------------|----------------------------------|--------|
| `BACKLOG.md` | `DOCS/planning/BACKLOG.md` | `DOCS/.planning/BACKLOG.md` | ✅ Exists — detailed sprint backlog |
| `NAMING_CONVENTIONS.md` | `DOCS/design/NAMING_CONVENTIONS.md` | `DOCS/.design/NAMING_CONVENTIONS.md` | ✅ Moved Phase 0 (corrected from root) |

> **Root `BACKLOG.md`:** Created in Phase 0 as a convenience summary linking to `DOCS/.planning/BACKLOG.md`. Not required by v1.1 but harmless to retain. Should note explicitly that it is a summary redirect.

### 6.3 Decisions Recorded in DECISION_REGISTER.md

| DR ID | Decision | Phase |
|-------|---------|-------|
| DR-001 | Dot-prefixed DOCS subdirectories (documented divergence from RA) | 0 |
| DR-002 | TypeScript + Cucumber.js for DEMOAPP001 | 0 |
| DR-003 | @util surface — in-process class testing | 0 |
| DR-004 | Sequential Stack migration strategy (TS → Python → C#) | 0 |
| DR-005 | Feature file unchanged during Screenplay migration | 0 |
| DR-006 | Adopt RA v1.1; correct NAMING_CONVENTIONS.md and BACKLOG.md paths | 0 |
| DR-007 | Establish features-shared/ as Canonical Feature Store | 1 |

### 6.4 ~~Decision Needed~~ — v1.1 Adoption: DR-006 ✅

The project now operates under v1.1. A `DECISION_REGISTER.md` entry should record this:

| Field | Value |
|-------|-------|
| **Context** | RA updated from v1.0 to v1.1; two path requirements changed |
| **Decision** | Adopt RA v1.1; relocate `NAMING_CONVENTIONS.md` to `DOCS/.design/`; treat root `BACKLOG.md` as convenience redirect only |
| **Consequences** | Phase 0 `NAMING_CONVENTIONS.md` path corrected; root `BACKLOG.md` demoted from required to optional |

---

## 7. Stack-Level Documentation (§10.2)

Stack-level documentation is now present inside `demo-apps/demoapp001-typescript-cypress/docs/` and aligned to the required templates.

| Document | Template | Status |
|----------|----------|--------|
| `docs/ARCHITECTURE.md` | `TEMPLATE_Stack_Architecture.md` | ✅ Present |
| `docs/SCREENPLAY_GUIDE.md` | `TEMPLATE_Screenplay_Guide.md` | ✅ Present |
| `docs/QA_STRATEGY.md` | `TEMPLATE_QA_Strategy.md` | ✅ Present |
| `docs/README.md` | `TEMPLATE_Stack_Readme.md` | ✅ Present |

Phase 5 validation confirms all four documents exist, include template references, and preserve green tests (`43 scenarios / 241 steps passing`).

---

## 8. Cross-Cutting Architecture Documents (§10.3)

Phase 6 is complete. `DOCS/architecture/` now exists with all required documents.

| Document | Status |
|----------|--------|
| Screenplay parity contract | ✅ Present — `DOCS/architecture/screenplay-parity-contract.md` |
| Subject application contract | ✅ Present — `DOCS/architecture/subject-app-contract.md` |
| Orchestration design | ✅ Present — `DOCS/architecture/orchestration-design.md` |
| Logging design | ✅ Present — `DOCS/architecture/logging-design.md` |

**Verification:**
- All four files exist in `DOCS/architecture/` ✅
- Template references are included for the two template-governed files ✅
- Regression check remains green: 43 scenarios / 241 steps passing ✅

---

## 9. Template Mandate (§10.5)

`DOCS/templates/` was created in Phase 0 and all 14 required templates are now present.

### 9.1 All 14 Templates Present in `DOCS/templates/`

| Template | Governs | Migration Phase |
|----------|---------|----------------|
| `TEMPLATE_Decision_Record.md` | `DECISION_REGISTER.md` entries | 0 |
| `TEMPLATE_Changelog.md` | Root `CHANGELOG.md` | 0 |
| `TEMPLATE_Backlog.md` | `DOCS/.planning/BACKLOG.md` | 0 |
| `TEMPLATE_Naming_Conventions.md` | `DOCS/.design/NAMING_CONVENTIONS.md` | 0 |
| `TEMPLATE_Readme.md` | Root `README.md` | 0 |
| `TEMPLATE_Stack_Architecture.md` | `[STACK]/docs/ARCHITECTURE.md` | 5 |
| `TEMPLATE_Screenplay_Guide.md` | `[STACK]/docs/SCREENPLAY_GUIDE.md` | 5 |
| `TEMPLATE_QA_Strategy.md` | `[STACK]/docs/QA_STRATEGY.md` | 5 |
| `TEMPLATE_Stack_Readme.md` | `[STACK]/docs/README.md` | 5 |
| `TEMPLATE_Parity_Contract.md` | `DOCS/architecture/` parity contract | 6 |
| `TEMPLATE_Subject_App_Contract.md` | `DOCS/architecture/` subject app contract | 6 |
| `TEMPLATE_Algorithm.md` | `DOCS/.algorithm/ALGORITHM_*.md` | — |
| `TEMPLATE_Implementation_Log.md` | `DOCS/.implementation/IMPL_LOG_*.md` | — |
| `TEMPLATE_Code_Review.md` | `DOCS/.review/CODE_REVIEW_*/` | — |

> Convenience copies of Algorithm, Implementation Log, and Code Review templates remain in their subdirectories for local reference. The canonical versions are in `DOCS/templates/`.

---

## 10. AI Agent Instruction File (§10.4)

`CLAUDE.md` at the repository root serves this role and is the most complete of the required documents. Gap analysis against §10.4 requirements:

| Requirement | Status | Notes |
|-------------|--------|-------|
| Stack inventory (name, language, framework, surface type, port/entry) | ✅ Added Phase 0 | Table with DEMOAPP001 and future Python/C# stacks |
| Canonical feature update procedure | ✅ Added Phase 0 | 7-step procedure; includes note that `features-shared/` doesn't yet exist |
| Parity rules summary (Memory keys, step shape, signatures) | ⚠ Deferred | Not yet relevant (one Stack); added to Risk Register for pre-Stack-2 action |
| Risk register | ✅ Added Phase 0 | 6 entries covering fragile areas |
| Reference to `DECISION_REGISTER.md` | ✅ Added Phase 0 | Authoritative References table added |

---

## 11. Orchestration and Metrics (§9)

### 11.1 Subject Application Lifecycle

For a `@util` surface, the CLI lifecycle (§9.1) is simplified — no process management is needed. However, the orchestration contract still requires:

- ✅ Build step: `npm run build` exists
- ❌ No orchestration script that sequences: build → test → capture exit code → write metrics
- ❌ No `.batch/` or `scripts/` directory

### 11.2 Metrics Collection (§9.2)

No metrics artifact is produced by any test run. `npm test` runs Cucumber and writes output to stdout only.

**Required:** Every run must produce metrics in two formats:
- Key-value pairs: `DEMOAPP001_SOLVER_ExitCode=0`, `DEMOAPP001_SOLVER_Passed=43`, etc.
- Markdown summary table

**Required path:** `.results/.metrics/` (currently absent).

---

## 12. What Is Correctly Aligned

It is worth stating clearly what the project gets right, as these are the foundations migration builds upon:

| Area | Quality |
|------|---------|
| **Subject application (Layer 5)** | Excellent — clean SRP, deterministic, no hidden state |
| **Algorithm correctness** | Well-tested by feature scenarios, all 4 puzzles solve correctly |
| **Gherkin scenario quality** | High — good coverage, Background pattern, Scenario Outline, mostly parameterised steps |
| **Screenplay migration design** | Complete — `DESIGN_Screenplay_Migration.md` maps every existing scenario to Tasks/Questions |
| **Algorithm documentation** | Good — pseudocode, complexity, examples, in `DOCS/.algorithm/` |
| **Implementation logs** | Well-maintained, timestamped, append-only |
| **Code review discipline** | Multiple reviews archived, timestamped, immutable |
| **BACKLOG.md** | Detailed sprint tracking; root summary + `DOCS/.planning/` detail |
| **Decision Register** | DR-001–008 — all structural decisions recorded with full context |
| **Template mandate** | 14/14 templates in `DOCS/templates/` — Phase 0 complete |
| **Canonical Feature Store** | `features-shared/util-tests/sudoku-solver/` — Phase 1 complete |
| **Feature tagging** | `@util` on canonical; `@util @stack-demoapp001` on Stack-local copy |
| **cucumber.js routing** | Reads from `tests/features/` only — no duplicate scenario risk |
| **Serenity/JS infrastructure** | v3.43.2 installed; `@serenity-js/core`, `cucumber`, `assertions` — Phase 2 |
| **Memory key constants** | 6 `UPPER_SNAKE_CASE` constants in `memory-keys.ts`; name = value (RA §8.1) |
| **Ability layer (Layer 4)** | `UseSudokuSolver` + `LoadPuzzles` extend base `Ability`; DR-008 documents API deviations |
| **Cast — SudokuActors** | Equips every Actor with both Abilities; configured via `support/configure.ts` |

---

## 13. Migration Strategy

Sequenced in dependency order. Each phase produces a shippable increment.

---

### Phase 0 — Documentation Scaffold ✅ COMPLETE (with v1.1 correction)

> **v1.1 impact on Phase 0:** Two actions below had path errors because Phase 0 was designed against v1.0. Both were corrected when v1.1 was adopted.

**Actions and status:**

| # | Action | Status | Notes |
|---|--------|--------|-------|
| 1 | Create `DECISION_REGISTER.md` at root | ✅ Done | DR-001–DR-005 backfilled |
| 2 | Backfill DR-001–005 | ✅ Done | See `DECISION_REGISTER.md` |
| 3 | Create `CHANGELOG.md` at root | ✅ Done | Full project history v0.1.0–Unreleased |
| 4 | ~~Root `BACKLOG.md`~~ → **not required by v1.1** | ⚠ Created as convenience | `DOCS/.planning/BACKLOG.md` is the required location per v1.1 §10.1; root file retained as summary redirect |
| 5 | `NAMING_CONVENTIONS.md` — **v1.1 requires `DOCS/design/`** | ✅ Corrected | Initially created at root (v1.0 assumption); moved to `DOCS/.design/NAMING_CONVENTIONS.md` on v1.1 adoption |
| 6 | Create `DOCS/templates/` | ✅ Done | All 14 templates created (7 new + 3 adapted + 4 from original Phase 0) |
| 7 | Create all required templates | ✅ Done | 14/14: Decision Record, Changelog, Backlog, Naming Conventions, Readme, Stack Architecture, Screenplay Guide, QA Strategy, Stack Readme, Parity Contract, Subject App Contract, Algorithm, Implementation Log, Code Review |
| 8 | Update `CLAUDE.md` | ✅ Done | Stack inventory, risk register, canonical feature procedure, `DECISION_REGISTER.md` reference; updated in Phase 1 for feature sync note |
| 9 | Record v1.1 adoption | ✅ Done | DR-006 — adoption of RA v1.1, NAMING_CONVENTIONS.md path correction, root BACKLOG.md status |

**Verification (v1.1) — all passing:**
- `CHANGELOG.md` at root ✅
- `DECISION_REGISTER.md` at root (DR-001–007) ✅
- `DOCS/.planning/BACKLOG.md` ✅
- `DOCS/.design/NAMING_CONVENTIONS.md` ✅
- `DOCS/templates/` — 14/14 templates ✅

---

### Phase 1 — Canonical Feature Store ✅ COMPLETE

**Commit:** `fa75cec` — *Phase 1: Establish Canonical Feature Store (RA §5)*

| # | Action | Status | Notes |
|---|--------|--------|-------|
| 1 | Create `features-shared/util-tests/sudoku-solver/` | ✅ Done | — |
| 2 | Write canonical feature file with `@util` at Feature level | ✅ Done | Surface tag only — no Stack tags |
| 3 | Create `tests/features/` Stack-local directory | ✅ Done | — |
| 4 | Write Stack-local copy with `@util @stack-demoapp001` | ✅ Done | Inherits `@util`; adds Stack tag |
| 5 | Remove old `tests/BasicSudokuSolverLogic.feature` | ✅ Done | Replaced by `tests/features/` copy |
| 6 | Update `cucumber.js` paths to `tests/features/**/*.feature` | ✅ Done | Prevents duplicate scenario pickup |
| 7 | Record DR-007 in `DECISION_REGISTER.md` | ✅ Done | Rationale: canonical store, tag taxonomy, symlink rejection |

**Verification:**
- `npm test` — 43 scenarios / 241 steps, all passing ✅
- `@util @stack-demoapp001` tags visible on all scenarios in runner output ✅
- `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` — canonical source ✅
- `tests/features/BasicSudokuSolverLogic.feature` — Stack-local copy ✅
- `DECISION_REGISTER.md` DR-007 — recorded ✅

---

### Phase 2 — Screenplay Layer — Foundation ✅ COMPLETE

**Commit:** `b1c31b0` — *Phase 2: Serenity/JS Screenplay Foundation (RA §3, §4)*

| # | Action | Status | Notes |
|---|--------|--------|-------|
| 1 | Install `@serenity-js/core`, `@serenity-js/cucumber`, `@serenity-js/assertions` | ✅ Done | v3.43.2 |
| 2 | Create `tests/screenplay/` directory structure | ✅ Done | `abilities/`, `actors/`, `tasks/`, `questions/`, `support/`, `step_definitions/` |
| 3 | Create `tests/screenplay/support/memory-keys.ts` | ✅ Done | 6 constants; name = value (RA §8.1) |
| 4 | Implement `UseSudokuSolver` Ability | ✅ Done | `extends Ability` (DR-008); import path corrected to `../../../app_src/` |
| 5 | Implement `LoadPuzzles` Ability | ✅ Done | `extends Ability`, `private constructor`, `static from()` factory |
| 6 | Implement `SudokuActors` Cast | ✅ Done | Equips Actor with `UseSudokuSolver` + `LoadPuzzles` |
| 7 | Create `support/configure.ts` | ✅ Done | Registers Cast via `configure({ crew: [], actors: SudokuActors })` |
| 8 | Update `cucumber.js` | ✅ Done | `requireModule` adds `@serenity-js/cucumber`; `require` points to screenplay dirs; Cast via support file |
| 9 | Record DR-008 | ✅ Done | Documents 3 Serenity/JS 3.43.2 API deviations from design doc |

**Deviation from design doc — DR-008:**
- Design used `implements Ability`; 3.43.2 requires `extends Ability` (base class, not interface)
- Design defined `static as()` override; base class provides this via generics — override removed
- Design import paths `../../app_src/` were wrong; corrected to `../../../app_src/`

**Verification:**
- `npm test` — 43 scenarios (43 undefined) / 241 steps (241 undefined) ✅
- No TypeScript errors ✅
- No runtime errors — Serenity/JS 3.43.2 loads cleanly ✅
- `@util @stack-demoapp001` tags visible in runner output ✅

---

### Phase 3 — Screenplay Layer — Tasks and Questions ✅ COMPLETE

**Commit:** *(see Phase 3 commit)*

| # | Action | Status | Notes |
|---|--------|--------|-------|
| 1 | Implement Tasks: `InitialiseGrid`, `ApplyAlgorithm`, `SolvePuzzle`, `LoadPuzzleByName`, `SetupGridState`, `AttemptPlacement` | ✅ Done | Functional `Interaction.where()` pattern — not class-based (Serenity/JS v3 constraint) |
| 2 | Implement Questions: `SolveStatus`, `GridCell`, `AlgorithmMadeProgress`, `LoadedPuzzleCount`, `PlacementValidity`, `ErrorThrown` | ✅ Done | Return type inferred (not `Question<T>` explicit — `QuestionAdapter<T>` is the actual type) |
| 3 | Extend `UseSudokuSolver` with cross-step state | ✅ Done | `targetCell`, `targetValue`, `gridSnapshot`, `validationResult`, `multipleSolvers`, `solverError` |
| 4 | Extend `LoadPuzzles` with public constructor | ✅ Done | `private` → `public` required for Serenity/JS `AbilityType<T>` constraint |

**Deviations from design doc:**
- Design showed class-based Tasks (`class X implements Task`). Serenity/JS v3.43.2 requires `Activity` instances (has private members) — all Tasks use `Interaction.where()` instead.
- `Question<T>` return type annotation caused type error — `Question.about()` returns `QuestionAdapter<T>`. Removed explicit annotations.
- `LoadPuzzles` constructor changed from `private` to `public` — required by `AbilityType<T>` generic constraint.

**Verification:**
- `npm test` — 43 scenarios (43 undefined, no errors) ✅
- TypeScript compiles clean ✅

---

### Phase 4 — Step Definition Migration ✅ COMPLETE

**Commit:** *(see Phase 4 commit)*

| # | Action | Status | Notes |
|---|--------|--------|-------|
| 1 | `background.steps.ts` | ✅ Done | 1 step |
| 2 | `unitCompletion.steps.ts` | ✅ Done | 12 steps |
| 3 | `hiddenSingles.steps.ts` | ✅ Done | 12 steps |
| 4 | `nakedSingles.steps.ts` | ✅ Done | 10 steps |
| 5 | `constraintValidation.steps.ts` | ✅ Done | 5 steps |
| 6 | `orchestration.steps.ts` | ✅ Done | 18 steps |
| 7 | `puzzleLoader.steps.ts` | ✅ Done | 20 steps |
| 8 | `gridInitialisation.steps.ts` | ✅ Done | 9 steps |
| 9 | `integration.steps.ts` | ✅ Done | 12 steps |
| 10 | `edgeCases.steps.ts` | ✅ Done | 14 steps |
| 11 | Delete `tests/step_definitions/solver_steps.ts` | ✅ Done | Procedural World removed |
| 12 | Delete `tests/step_definitions/solver_steps.js` | ✅ Done | Compiled output removed |

**Key design decisions in Phase 4:**
- Integration tests: `Given 'puzzle X is loaded'` → `LoadPuzzleByName.andInitialise()` (not `SolvePuzzle.named()`), so `When 'solver attempts to solve'` remains the meaningful action.
- `SetupGridState.runAllAlgorithmsIndividually()` handles the "each algorithm individually" When step.
- `SetupGridState.noProgress()` re-initialises to empty (empty grid = no progress for all algorithms).
- `UseSudokuSolver.as(actor)` is callable directly in step definitions (base class generic `as()` works).

**Verification:**
- `npm test` — 43 scenarios / 241 steps all passing ✅
- TypeScript compiles clean ✅
- `tests/step_definitions/` directory is empty (procedural World deleted) ✅

---

### Phase 5 — Stack Documentation ✅ COMPLETE
*Creates required stack-level documents (§10.2).*

**Actions:**
1. Create `demo-apps/demoapp001-typescript-cypress/docs/` directory
2. Author `docs/ARCHITECTURE.md` from `DOCS/templates/TEMPLATE_Stack_Architecture.md`
3. Author `docs/SCREENPLAY_GUIDE.md` from `DOCS/templates/TEMPLATE_Screenplay_Guide.md`
4. Author `docs/QA_STRATEGY.md` from `DOCS/templates/TEMPLATE_QA_Strategy.md`
5. Author `docs/README.md` from `DOCS/templates/TEMPLATE_Stack_Readme.md`
6. Create `tooling/` directory with `cucumber.js` configuration

**Verification:**
- `docs/ARCHITECTURE.md`, `docs/SCREENPLAY_GUIDE.md`, `docs/QA_STRATEGY.md`, and `docs/README.md` exist ✅
- All four documents reference their source templates in `DOCS/templates/` ✅
- `tooling/cucumber.js` created and `npm test` routes via `--config tooling/cucumber.js` ✅
- `npm test` remains green: 43 scenarios / 241 steps passing ✅

---

### Phase 6 — Architecture Documents ✅ COMPLETE
*Creates `DOCS/architecture/` (§10.3).*

**Actions:**
1. Create `DOCS/architecture/` directory
2. Author `DOCS/architecture/screenplay-parity-contract.md` — defines component signatures and Memory key literals for all Stacks (currently one Stack; extend when Python and C# are added)
3. Author `DOCS/architecture/subject-app-contract.md` — formalises the `@util` surface contract (in-process class interface) and the potential future `@cli` surface contract (exit codes, stdout format, timeout)
4. Author `DOCS/architecture/orchestration-design.md` — documents the `@util` lifecycle: build → test → metrics
5. Author `DOCS/architecture/logging-design.md` — documents Serenity/JS report output and any future structured logging

**Verification:**
- `DOCS/architecture/` created with all four required documents ✅
- `screenplay-parity-contract.md` and `subject-app-contract.md` reference their governing templates ✅
- `npm test` remains green: 43 scenarios / 241 steps passing ✅

---

### Phase 7 — Orchestration and Metrics ✅ COMPLETE
*Closes the §9 gap.*

**Actions:**
1. Create `.batch/` directory at repository root
2. Create `.batch/run-demoapp001.ps1` (or `.sh`) that:
   - Runs `npm run build`
   - Runs `npm test`
   - Captures exit code
   - Writes key-value metrics to `.results/.metrics/DEMOAPP001_<timestamp>.txt`
   - Writes markdown summary to `.results/.metrics/DEMOAPP001_<timestamp>.md`
3. Add `.results/` to `.gitignore`

**Verification:**
- `.batch/run-demoapp001.ps1` executes end-to-end with build and test stages ✅
- Timestamped metrics generated: `.results/.metrics/DEMOAPP001_<timestamp>.txt` and `.md` ✅
- Key-value metrics include exit code, test counts, duration, and log path ✅
- Markdown summary table generated for human-readable reporting ✅
- `.results/` added to `.gitignore` ✅
- Latest orchestration run: BuildExitCode=0, TestExitCode=0, OverallExitCode=0; 43 scenarios passed ✅

---

### Phase 8 — CLI Surface Hardening ✅ COMPLETE
*Completes §6.3 compliance for any future `@cli` Stack.*

**Actions:**
1. Modify `app_src/index.ts` to call `process.exit(0)` on SOLVED, `process.exit(1)` on STUCK
2. Route errors to `console.error()` (stderr)
3. Add `--help` option documentation
4. Add an optional `--timeout <ms>` argument with enforced limit
5. Record changes in `CHANGELOG.md` as a breaking change to the CLI interface

**Verification:**
- `npm run build` passes ✅
- `npm test` remains green (43 scenarios / 241 steps passing) ✅
- `npm start -- --help` exits 0 and documents supported options ✅
- `npm start -- --timeout 1` exits 1 with timeout error on stderr ✅
- `npm start` exits 1 when a puzzle reaches `STUCK_ON_ADVANCED_LOGIC` (explicit non-zero failure contract) ✅
- `CHANGELOG.md` records the breaking CLI interface update ✅

---

## 14. Compliance Roadmap Summary

| Phase | Closes gap in RA section | Effort | Sprint | Status |
|-------|--------------------------|--------|--------|--------|
| 0 — Documentation scaffold | §10.1, §10.5, §10.6, §10.4 | 1–2 days | Sprint 3 | ✅ Fully complete (DR-001–007; 14/14 templates; all governance docs) |
| 1 — Canonical Feature Store | §5.1–5.3 | 0.5 day | Sprint 3 | ✅ Complete — `features-shared/` live; DR-007; 43 scenarios green |
| 2 — Screenplay Foundation | §3, §4 (abilities, actors) | 2–3 h | Sprint 3 | ✅ Complete — Serenity/JS 3.43.2; Abilities, Cast, Memory keys; DR-008 |
| 3 — Tasks and Questions | §3.3, §3.4 | 4–6 h | Sprint 3 | ✅ Complete — 6 Tasks, 6 Questions; `Interaction.where()` pattern |
| 4 — Step Definition Migration | §2.2, §3, layer model | 4–6 h | Sprint 3 | ✅ Complete — 10 step files; 43 scenarios / 241 steps passing; procedural World deleted |
| 5 — Stack Documentation | §10.2 | 1 day | Sprint 3 | ✅ Complete — stack docs + tooling config |
| 6 — Architecture Documents | §10.3 | 0.5 day | Sprint 4 | ✅ Complete — `DOCS/architecture/` with 4 required docs |
| 7 — Orchestration and Metrics | §9 | 0.5 day | Sprint 4 | ✅ Complete — `.batch/run-demoapp001.ps1`, `.results/.metrics`, `.gitignore` update |
| 8 — CLI Hardening | §6.3 | 1–2 days | Sprint 5 | ✅ Complete — exit codes, stderr routing, help and timeout options |

**Critical path to minimum viable compliance:** Phases 3 → 4 (Sprint 3), Phase 5 (stack docs), Phase 6 (architecture docs), Phase 7 (orchestration/metrics), and Phase 8 (CLI hardening) are complete.

---

## 15. Backlog Items Generated

The following items should be added to `DOCS/.planning/BACKLOG.md` and cross-referenced to `DECISION_REGISTER.md` as appropriate:

| ID | Title | Phase | Priority | Status |
|----|-------|-------|----------|--------|
| NEW-001 | Create DECISION_REGISTER.md and backfill DR-001–005 | 0 | High | ✅ Done |
| NEW-002 | Create CHANGELOG.md at repository root | 0 | High | ✅ Done |
| NEW-003 | ~~Promote BACKLOG.md to root~~ → **not required by v1.1** | 0 | — | ⚠ Superseded — `DOCS/.planning/BACKLOG.md` is the required location |
| NEW-004 | Create NAMING_CONVENTIONS.md at `DOCS/.design/` (v1.1: `DOCS/design/`) | 0 | High | ✅ Done (corrected from root) |
| NEW-005 | Create DOCS/templates/ with all 14 required templates | 0 | High | ✅ Done — 14/14 templates |
| NEW-005a | Record v1.1 adoption as DR-006 | 0 | High | ✅ Done — DR-006 |
| NEW-006 | Create features-shared/ canonical feature store | 1 | High | ✅ Done — DR-007 |
| NEW-007 | Install Serenity/JS and create Screenplay directory structure | 2 | High | ✅ Done — v3.43.2; 6 dirs |
| NEW-008 | Define Memory key constants in screenplay/support/memory-keys.ts | 2 | High | ✅ Done — 6 constants |
| NEW-009 | Implement UseSudokuSolver and LoadPuzzles Abilities | 2 | High | ✅ Done — DR-008 (extends Ability) |
| NEW-010 | Implement all Tasks and Questions | 3 | High | ✅ Done — 6 Tasks (Interaction.where pattern), 6 Questions |
| NEW-011 | Migrate step definitions to Screenplay (replace solver_steps.js) | 4 | High | ✅ Done — 10 step files, 43/241 passing, procedural World deleted |
| NEW-012 | Refactor over-specified step text to parameterised form | 4 | Medium | ⏸ Deferred — Gherkin unchanged per DR-005; over-specified steps remain in place |
| NEW-013 | Create stack-level docs/ directory with 4 required documents | 5 | Medium | ✅ Done |
| NEW-014 | Create DOCS/architecture/ with 4 required documents | 6 | Medium | ✅ Done |
| NEW-015 | Create .batch/run-demoapp001 orchestration script + metrics output | 7 | Medium | ✅ Done |
| NEW-016 | Add exit codes and stderr to SudokuCLI for @cli surface compliance | 8 | Low | ✅ Done |

---

## 16. Reference Architecture Version History

| RA Version | Date | Key changes affecting this project |
|------------|------|-------------------------------------|
| v1.0 | 2026-05-14 | Initial version. `BACKLOG.md` at root; `NAMING_CONVENTIONS.md` at root or DOCS/. |
| v1.1 | 2026-05-14 | `BACKLOG.md` moved to `DOCS/planning/BACKLOG.md`. `NAMING_CONVENTIONS.md` pinned to `DOCS/design/NAMING_CONVENTIONS.md`. `DOCS/design/` added as a named subdirectory. All internal `BACKLOG.md` references updated to path-qualified form. |

**Impact of v1.0 → v1.1 on this project (resolved):**
- Root `BACKLOG.md` created in Phase 0 is no longer a required document — retained as convenience redirect only
- `NAMING_CONVENTIONS.md` created at root in Phase 0 corrected to `DOCS/.design/NAMING_CONVENTIONS.md` (DR-001 dot-prefix convention applied)
- DR-006 records the v1.1 adoption and both path corrections — ✅ complete

---

*This analysis is maintained against the current version of `REFERENCE_ARCHITECTURE.md`. Re-run when the RA version changes or when a second Stack is added — parity compliance (§8) cannot be assessed until there are two Stacks to compare.*
