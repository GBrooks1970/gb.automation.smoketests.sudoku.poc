# Screenplay-BDD Reference Architecture — Alignment & Migration Report

**Date:** 2026-05-14
**Updated:** 2026-05-14 (v1.1 adoption; Phase 0 fully complete; Phase 1 complete)
**Analyst:** CLAUDE Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` vs. `REFERENCE_ARCHITECTURE.md` v1.1
**Status:** Living — updated when RA version changes

---

## Executive Summary

This report scores the project against every normative obligation in the Screenplay-BDD Reference Architecture (`REFERENCE_ARCHITECTURE.md`, Status: Accepted, 2026-05-14). The analysis covers structure, pattern compliance, surface-type contract, documentation, and orchestration.

**Overall compliance: Moderate** *(upgraded from Low–Moderate — Phases 0 and 1 complete)*

The project's documentation scaffold and canonical feature store are fully established. The remaining gap is the Screenplay implementation layer (Phases 2–4), which has a complete design but no code yet.

| Area | Status | Severity |
|------|--------|----------|
| Screenplay Layer (Actor / Ability / Task / Question) | Not implemented | Critical |
| Canonical Feature Store (`features_shared/`) | ✅ Complete — Phase 1 (DR-007) | — |
| Memory key constants | Absent — Phase 2 | High |
| Directory blueprint compliance | Partial — `features_shared/` + `tests/features/` added; Screenplay dirs absent | High |
| CLI surface contract | Partial | High |
| Repository-level required documents | ✅ All present and at correct paths | — |
| Stack-level documentation | Absent — Phase 5 | High |
| `DOCS/templates/` mandate | ✅ Complete — all 14 templates present | — |
| `DECISION_REGISTER.md` | ✅ DR-001–DR-007 | — |
| Orchestration scripts + metrics | Absent — Phase 7 | Medium |
| AI agent instruction file | ✅ Complete — Phase 0 | — |
| Algorithm documentation | ✅ Aligned | — |
| Code review directory | Structurally minor drift (inside DOCS/, not root) | Low |
| Implementation logs | ✅ Aligned | — |

> **Current migration status (2026-05-14):** Phase 0 fully complete (DR-001–007, 14/14 templates, all governance docs). Phase 1 complete (DR-007, `features_shared/` established, `@util @stack-demoapp001` tags live, 43 scenarios green). Phases 2–8 open.

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

### 1.2 CLI Contract Gaps (§6.3)

Even under Option A, the CLI surface has compliance gaps relevant to any future `@cli` Stack:

| Requirement | Current state | Gap |
|-------------|--------------|-----|
| Invokable as single command | `npm start` ✅ | — |
| Documented argument/option interface | Implied by `index.ts` only | No `--help`, no documented interface |
| Exit code: 0 for success, non-zero for failure | Always exits 0 | `SudokuCLI.run()` never calls `process.exit()` |
| Stdout for output, stderr for errors | `console.log()` only | No stderr usage; errors swallowed silently |
| Deterministic output for given inputs | Yes ✅ | — |
| Documented time bound | None | No timeout mechanism |

---

## 2. Five-Layer Architecture (§2.1)

### 2.1 Layer Inventory

```
Layer 1 — Feature Files (Gherkin)
  File: tests/BasicSudokuSolverLogic.feature
  Status: EXISTS — 43 scenarios, well-structured
  Issues: Not in features_shared/; no surface tags; step text has some over-specification

Layer 2 — Step Definitions
  File: tests/step_definitions/solver_steps.js  (compiled JS)
  Status: EXISTS — functional but non-Screenplay
  Issues: Monolithic SudokuWorld class; direct production-class coupling;
          business logic mixed into steps; state via mutable World fields

Layer 3 — Screenplay (Actor / Tasks / Questions)
  Status: ABSENT — not implemented
  Design: Fully specified in DOCS/.design/DESIGN_Screenplay_Migration.md

Layer 4 — Abilities
  Status: ABSENT — not implemented

Layer 5 — Subject Application
  Files: app_src/SudokuSolver.ts, SudokuOrchestrator.ts, SudokuCLI.ts, PuzzleLoader.ts
  Status: WELL ALIGNED — clean, deterministic, single-responsibility
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
features_shared/                       PRESENT ✅ (Phase 1 — DR-007)
  util-tests/
    sudoku-solver/
      BasicSudokuSolverLogic.feature   PRESENT ✅ (@util tag; canonical source)

DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/  DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/
  app_src/                (subject)      app_src/               ✅
  tests/                               tests/
    features/             PRESENT ✅     features/BasicSudokuSolverLogic.feature ✅ (@util @stack-demoapp001)
    step_definitions/     PARTIAL ✓      step_definitions/solver_steps.js (exists, wrong form — Phase 4)
    screenplay/           ABSENT ✗       (Phase 2–3)
      abilities/          ABSENT ✗
      actors/             ABSENT ✗
      tasks/              ABSENT ✗
      questions/          ABSENT ✗
      support/            ABSENT ✗
  tooling/                ABSENT ✗       (Phase 5)
  docs/                   ABSENT ✗       (Phase 5)

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
DECISION_REGISTER.md       ✅ (Phase 0/1 — DR-001–DR-007)
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
features_shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature   ← canonical (@util)
DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/features/BasicSudokuSolverLogic.feature  ← Stack-local (@util @stack-demoapp001)
```

When a second Stack (Python, C#) is onboarded, it copies from `features_shared/` — the authoritative source is now in place.

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
| DR-007 | Establish features_shared/ as Canonical Feature Store | 1 |

### 6.4 ~~Decision Needed~~ — v1.1 Adoption: DR-006 ✅

The project now operates under v1.1. A `DECISION_REGISTER.md` entry should record this:

| Field | Value |
|-------|-------|
| **Context** | RA updated from v1.0 to v1.1; two path requirements changed |
| **Decision** | Adopt RA v1.1; relocate `NAMING_CONVENTIONS.md` to `DOCS/.design/`; treat root `BACKLOG.md` as convenience redirect only |
| **Consequences** | Phase 0 `NAMING_CONVENTIONS.md` path corrected; root `BACKLOG.md` demoted from required to optional |

---

## 7. Stack-Level Documentation (§10.2)

No stack-level `docs/` directory exists inside `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/`. All four required documents are absent:

| Document | Template | Status |
|----------|----------|--------|
| `docs/ARCHITECTURE.md` | `stack-architecture.template.md` | ❌ Absent |
| `docs/SCREENPLAY_GUIDE.md` | `screenplay-guide.template.md` | ❌ Absent |
| `docs/QA_STRATEGY.md` | `qa-strategy.template.md` | ❌ Absent |
| `docs/README.md` | `stack-readme.template.md` | ❌ Absent |

**Note:** The project-level `DOCS/` folder is well-maintained. The gap is specifically the *stack-level* `docs/` directory inside `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/`.

---

## 8. Cross-Cutting Architecture Documents (§10.3)

No `DOCS/architecture/` directory exists. All four required documents are absent:

| Document | Status |
|----------|--------|
| Screenplay parity contract | ❌ Absent |
| Subject application contract | ❌ Absent (details are in `DESIGN_Sudoku_Solver_Specification.md` but not in the required format) |
| Orchestration design | ❌ Absent |
| Logging design | ❌ Absent |

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
| Canonical feature update procedure | ✅ Added Phase 0 | 7-step procedure; includes note that `features_shared/` doesn't yet exist |
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
| **Decision Register** | DR-001–007 — all structural decisions recorded with full context |
| **Template mandate** | 14/14 templates in `DOCS/templates/` — Phase 0 complete |
| **Canonical Feature Store** | `features_shared/util-tests/sudoku-solver/` — Phase 1 complete |
| **Feature tagging** | `@util` on canonical; `@util @stack-demoapp001` on Stack-local copy |
| **cucumber.js routing** | Reads from `tests/features/` only — no duplicate scenario risk |

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
| 1 | Create `features_shared/util-tests/sudoku-solver/` | ✅ Done | — |
| 2 | Write canonical feature file with `@util` at Feature level | ✅ Done | Surface tag only — no Stack tags |
| 3 | Create `tests/features/` Stack-local directory | ✅ Done | — |
| 4 | Write Stack-local copy with `@util @stack-demoapp001` | ✅ Done | Inherits `@util`; adds Stack tag |
| 5 | Remove old `tests/BasicSudokuSolverLogic.feature` | ✅ Done | Replaced by `tests/features/` copy |
| 6 | Update `cucumber.js` paths to `tests/features/**/*.feature` | ✅ Done | Prevents duplicate scenario pickup |
| 7 | Record DR-007 in `DECISION_REGISTER.md` | ✅ Done | Rationale: canonical store, tag taxonomy, symlink rejection |

**Verification:**
- `npm test` — 43 scenarios / 241 steps, all passing ✅
- `@util @stack-demoapp001` tags visible on all scenarios in runner output ✅
- `features_shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` — canonical source ✅
- `tests/features/BasicSudokuSolverLogic.feature` — Stack-local copy ✅
- `DECISION_REGISTER.md` DR-007 — recorded ✅

---

### Phase 2 — Screenplay Layer — Foundation (2–3 hours)
*Implements the design from `DESIGN_Screenplay_Migration.md` §5.1–5.2.*

**Actions:**
1. Install `@serenity-js/core`, `@serenity-js/cucumber`, `@serenity-js/assertions`
2. Create directory structure:
   ```
   tests/screenplay/
     abilities/
     actors/
     tasks/
     questions/
     support/
   ```
3. Create `tests/screenplay/support/memory-keys.ts` with constants:
   ```typescript
   export const SOLVE_RESULT       = 'SOLVE_RESULT';
   export const ALGORITHM_PROGRESS = 'ALGORITHM_PROGRESS';
   export const LAST_ERROR         = 'LAST_ERROR';
   export const TARGET_CELL        = 'TARGET_CELL';
   export const GRID_SNAPSHOT      = 'GRID_SNAPSHOT';
   export const VALIDATION_RESULT  = 'VALIDATION_RESULT';
   ```
4. Implement `UseSudokuSolver` and `LoadPuzzles` Abilities (verbatim from design §5.2)
5. Implement `SudokuActors` Cast (verbatim from design §5.5)
6. Update `cucumber.js` to use `@serenity-js/cucumber` and `SudokuActors`

**Verification:** Cucumber runs with no step definitions yet — no errors, all scenarios pending.

---

### Phase 3 — Screenplay Layer — Tasks and Questions (4–6 hours)
*Implements the business vocabulary.*

**Actions:**
1. Implement all Tasks (from design §5.3): `InitialiseGrid`, `ApplyAlgorithm`, `SolvePuzzle`, `LoadPuzzleByName`, `SetupGridState`, `AttemptPlacement`
2. Implement all Questions (from design §5.4): `SolveStatus`, `GridCell`, `AlgorithmMadeProgress`, `LoadedPuzzleCount`, `PlacementValidity`, `ErrorThrown`
3. Verify Tasks do not contain assertion logic
4. Verify Questions are side-effect free

**Verification:** Unit tests on Tasks and Questions in isolation (no Cucumber needed yet).

---

### Phase 4 — Step Definition Migration (4–6 hours)
*Replaces `solver_steps.js` (compiled procedural World) with 10 focused TypeScript files.*

**Actions:**
1. Create 10 step definition files (one per scenario category per design §5.1):
   - `background.steps.ts`
   - `unitCompletion.steps.ts`
   - `hiddenSingles.steps.ts`
   - `nakedSingles.steps.ts`
   - `constraintValidation.steps.ts`
   - `orchestration.steps.ts`
   - `puzzleLoader.steps.ts`
   - `gridInitialisation.steps.ts`
   - `integration.steps.ts`
   - `edgeCases.steps.ts`
2. Migrate each step definition to use `actor.attemptsTo(Task)` / `actor.answer(Question)` pattern
3. Delete `tests/step_definitions/solver_steps.js` (compiled output and source)
4. Refactor over-specified step text identified in §5.3 to parameterised equivalents

**Verification:** `npm test` — all 43 scenarios green.

---

### Phase 5 — Stack Documentation (1 day)
*Creates required stack-level documents (§10.2).*

**Actions:**
1. Create `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/` directory
2. Author `docs/ARCHITECTURE.md` from `DOCS/templates/stack-architecture.template.md`
3. Author `docs/SCREENPLAY_GUIDE.md` from `DOCS/templates/screenplay-guide.template.md`
4. Author `docs/QA_STRATEGY.md` from `DOCS/templates/qa-strategy.template.md`
5. Author `docs/README.md` from `DOCS/templates/stack-readme.template.md`
6. Create `tooling/` directory with `cucumber.js` configuration

**Verification:** All four documents exist and reference the correct Templates.

---

### Phase 6 — Architecture Documents (half day)
*Creates `DOCS/architecture/` (§10.3).*

**Actions:**
1. Create `DOCS/architecture/` directory
2. Author `DOCS/architecture/screenplay-parity-contract.md` — defines component signatures and Memory key literals for all Stacks (currently one Stack; extend when Python and C# are added)
3. Author `DOCS/architecture/subject-app-contract.md` — formalises the `@util` surface contract (in-process class interface) and the potential future `@cli` surface contract (exit codes, stdout format, timeout)
4. Author `DOCS/architecture/orchestration-design.md` — documents the `@util` lifecycle: build → test → metrics
5. Author `DOCS/architecture/logging-design.md` — documents Serenity/JS report output and any future structured logging

---

### Phase 7 — Orchestration and Metrics (half day)
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

---

### Phase 8 — CLI Surface Hardening (optional / future)
*Completes §6.3 compliance for any future `@cli` Stack.*

**Actions:**
1. Modify `app_src/index.ts` to call `process.exit(0)` on SOLVED, `process.exit(1)` on STUCK
2. Route errors to `console.error()` (stderr)
3. Add `--help` option documentation
4. Add an optional `--timeout <ms>` argument with enforced limit
5. Record changes in `CHANGELOG.md` as a breaking change to the CLI interface

---

## 14. Compliance Roadmap Summary

| Phase | Closes gap in RA section | Effort | Sprint | Status |
|-------|--------------------------|--------|--------|--------|
| 0 — Documentation scaffold | §10.1, §10.5, §10.6, §10.4 | 1–2 days | Sprint 3 | ✅ Fully complete (DR-001–007; 14/14 templates; all governance docs) |
| 1 — Canonical Feature Store | §5.1–5.3 | 0.5 day | Sprint 3 | ✅ Complete — `features_shared/` live; DR-007; 43 scenarios green |
| 2 — Screenplay Foundation | §3, §4 (abilities, actors) | 2–3 h | Sprint 3 | 🔲 Open |
| 3 — Tasks and Questions | §3.3, §3.4 | 4–6 h | Sprint 3 | 🔲 Open |
| 4 — Step Definition Migration | §2.2, §3, layer model | 4–6 h | Sprint 3 | 🔲 Open |
| 5 — Stack Documentation | §10.2 | 1 day | Sprint 3 | 🔲 Open |
| 6 — Architecture Documents | §10.3 | 0.5 day | Sprint 4 | 🔲 Open |
| 7 — Orchestration and Metrics | §9 | 0.5 day | Sprint 4 | 🔲 Open |
| 8 — CLI Hardening | §6.3 | 1–2 days | Sprint 5 | 🔲 Open |

**Critical path to minimum viable compliance:** Phases 2 → 3 → 4 (Sprint 3). Phases 0 and 1 are done. Phases 5–8 complete full compliance.

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
| NEW-006 | Create features_shared/ canonical feature store | 1 | High | ✅ Done — DR-007 |
| NEW-007 | Install Serenity/JS and create Screenplay directory structure | 2 | High | 🔲 Open |
| NEW-008 | Define Memory key constants in screenplay/support/memory-keys.ts | 2 | High | 🔲 Open |
| NEW-009 | Implement UseSudokuSolver and LoadPuzzles Abilities | 2 | High | 🔲 Open |
| NEW-010 | Implement all Tasks and Questions | 3 | High | 🔲 Open |
| NEW-011 | Migrate step definitions to Screenplay (replace solver_steps.js) | 4 | High | 🔲 Open |
| NEW-012 | Refactor over-specified step text to parameterised form | 4 | Medium | 🔲 Open |
| NEW-013 | Create stack-level docs/ directory with 4 required documents | 5 | Medium | 🔲 Open |
| NEW-014 | Create DOCS/architecture/ with 4 required documents | 6 | Medium | 🔲 Open |
| NEW-015 | Create .batch/run-demoapp001 orchestration script + metrics output | 7 | Medium | 🔲 Open |
| NEW-016 | Add exit codes and stderr to SudokuCLI for @cli surface compliance | 8 | Low | 🔲 Open |

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
