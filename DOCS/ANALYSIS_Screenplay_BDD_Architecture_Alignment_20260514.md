# Screenplay-BDD Reference Architecture — Alignment & Migration Report

**Date:** 2026-05-14
**Updated:** 2026-05-14 (revised against `REFERENCE_ARCHITECTURE.md` v1.1)
**Analyst:** CLAUDE Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` vs. `REFERENCE_ARCHITECTURE.md` v1.1
**Status:** Living — updated when RA version changes

---

## Executive Summary

This report scores the project against every normative obligation in the Screenplay-BDD Reference Architecture (`REFERENCE_ARCHITECTURE.md`, Status: Accepted, 2026-05-14). The analysis covers structure, pattern compliance, surface-type contract, documentation, and orchestration.

**Overall compliance: Low–Moderate**

The project's domain logic is well-written and testable, and a detailed Screenplay migration design exists. The gap is entirely in the test automation layer and the surrounding documentation scaffold — none of which has been built yet.

| Area | Status | Severity |
|------|--------|----------|
| Screenplay Layer (Actor / Ability / Task / Question) | Not implemented | Critical |
| Canonical Feature Store (`features_shared/`) | Absent | Critical |
| Memory key constants | Absent | Critical |
| Directory blueprint compliance | Partial | High |
| CLI surface contract | Partial | High |
| Repository-level required documents | 3 of 3 present; `NAMING_CONVENTIONS.md` at wrong path ⚠ | High |
| Stack-level documentation | Absent | High |
| `DOCS/templates/` mandate | Partial — 4 of 14 templates created | High |
| `DECISION_REGISTER.md` | ✅ Created (Phase 0) — DR-001–DR-005 | — |
| Orchestration scripts + metrics | Absent | Medium |
| AI agent instruction file | Partial | Medium |
| Algorithm documentation | Aligned | — |
| Code review directory | Structurally minor drift | Low |
| Implementation logs | Aligned in intent | Low |

> **Phase 0 status (2026-05-14):** `DECISION_REGISTER.md` (DR-001–005), `CHANGELOG.md`, root `BACKLOG.md` (convenience), `DOCS/templates/` (4 templates), and updated `CLAUDE.md` are all complete. `NAMING_CONVENTIONS.md` was created at root but v1.1 requires it at `DOCS/design/NAMING_CONVENTIONS.md` — corrected to `DOCS/.design/NAMING_CONVENTIONS.md` per DR-001.

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
features_shared/                       ABSENT ✗
  util-tests/
    solver-logic/
      *.feature

DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/  DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/
  app_src/                (subject)      app_src/               ✅
  tests/                               tests/
    features/             ABSENT ✗       BasicSudokuSolverLogic.feature (not in features/)
    step_definitions/     PARTIAL ✓      step_definitions/solver_steps.js ✅ (exists, wrong form)
    screenplay/           ABSENT ✗       (no screenplay directory)
      abilities/          ABSENT ✗
      actors/             ABSENT ✗
      tasks/              ABSENT ✗
      questions/          ABSENT ✗
      support/            ABSENT ✗
  tooling/                ABSENT ✗       (no tooling directory)
  docs/                   ABSENT ✗       (stack-level docs don't exist)

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
  templates/               PRESENT ✅ (Phase 0 — 4 of 14 templates created)

code-review/ OR .review/   PRESENT as DOCS/.review/ (inside DOCS, not at root)

README.md                  ✅
CHANGELOG.md               ✅ (Phase 0)
BACKLOG.md (at root)       NOT REQUIRED by v1.1 — present as convenience redirect only
DECISION_REGISTER.md       ✅ (Phase 0 — DR-001–DR-005)
CLAUDE.md (agent file)     ✅ (Phase 0 — stack inventory, risk register, procedure added)
```

### 4.2 DOCS Subdirectory Naming Drift

The project uses dot-prefixed directory names (`DOCS/.algorithm/`, `DOCS/.design/`, `DOCS/.implementation/`, `DOCS/.planning/`, `DOCS/.review/`, `DOCS/.howto/`). The Reference Architecture uses non-dotted names (`DOCS/algorithm/`, `DOCS/architecture/`, `DOCS/planning/`, `DOCS/implementation-logs/`).

The dot-prefix convention may be intentional (keeping documentation directories visually separate from file-browser tools that sort dots first), but it is not in the reference architecture and creates a divergence. This should be recorded in `DECISION_REGISTER.md`.

---

## 5. Canonical Feature Store (§5)

### 5.1 Current State

There is no `features_shared/` directory. The sole feature file lives at:
```
DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/BasicSudokuSolverLogic.feature
```

This means the feature file is owned by the Stack, not by the Canonical Feature Store. When a second Stack (Python, C#) is added, there will be no authoritative source to copy from.

### 5.2 Feature File Quality Assessment

Despite the location issue, the feature file quality is high:

| Criterion | Status |
|-----------|--------|
| Plain language, no code | ✅ |
| Scenarios organised by algorithm | ✅ |
| Background step for shared precondition | ✅ |
| Scenario Outline with Examples table | ✅ |
| Parameterised steps (many use `{int}`, `{string}`, `{word}`) | ✅ Mostly |
| Surface tags (`@util`, `@cli`) | ❌ None |
| Lifecycle tags (`@requires-app`) | ❌ None |
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
| `DECISION_REGISTER.md` | Repository root | ✅ Created (Phase 0) — DR-001–DR-005 | — |
| AI agent instruction file | Repository root | ✅ `CLAUDE.md` — updated Phase 0 | — |

### 6.2 DOCS-Level Documents (§10.1, §10.9)

| Document | Required path (v1.1) | Project path (DR-001 dot-prefix) | Status |
|----------|---------------------|----------------------------------|--------|
| `BACKLOG.md` | `DOCS/planning/BACKLOG.md` | `DOCS/.planning/BACKLOG.md` | ✅ Exists — detailed sprint backlog |
| `NAMING_CONVENTIONS.md` | `DOCS/design/NAMING_CONVENTIONS.md` | `DOCS/.design/NAMING_CONVENTIONS.md` | ✅ Moved Phase 0 (corrected from root) |

> **Root `BACKLOG.md`:** Created in Phase 0 as a convenience summary linking to `DOCS/.planning/BACKLOG.md`. Not required by v1.1 but harmless to retain. Should note explicitly that it is a summary redirect.

### 6.3 Decisions Backfilled to DECISION_REGISTER.md (Phase 0 complete)

| DR ID | Decision |
|-------|---------|
| DR-001 | Dot-prefixed DOCS subdirectories (documented divergence from RA) |
| DR-002 | TypeScript + Cucumber.js for DEMOAPP001 |
| DR-003 | @util surface — in-process class testing |
| DR-004 | Sequential Stack migration strategy (TS → Python → C#) |
| DR-005 | Feature file unchanged during Screenplay migration |

### 6.4 Decision Needed — v1.1 Adoption (DR-006)

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

`DOCS/templates/` was created in Phase 0 with 4 of the 14 required templates. The remaining 10 are still missing.

### 9.1 Created (Phase 0)

| Template | Governs |
|----------|---------|
| `DOCS/templates/TEMPLATE_Decision_Record.md` | `DECISION_REGISTER.md` entries |
| `DOCS/templates/TEMPLATE_Changelog.md` | Root `CHANGELOG.md` |
| `DOCS/templates/TEMPLATE_Backlog.md` | `DOCS/.planning/BACKLOG.md` (v1.1: target is `DOCS/planning/BACKLOG.md`) |
| `DOCS/templates/TEMPLATE_Naming_Conventions.md` | `DOCS/.design/NAMING_CONVENTIONS.md` (v1.1: `DOCS/design/NAMING_CONVENTIONS.md`) |

### 9.2 Existing but not yet in `DOCS/templates/`

These templates exist in their subdirectory locations. They satisfy local usage but do not satisfy the RA's requirement that all templates reside under `DOCS/templates/`.

| Current location | Required as |
|-----------------|-------------|
| `DOCS/.design/TEMPLATE_Design_Document.md` | `DOCS/templates/TEMPLATE_Design_Document.md` |
| `DOCS/.implementation/TEMPLATE_Implementation_Log.md` | `DOCS/templates/TEMPLATE_Implementation_Log.md` |
| `DOCS/.howto/TEMPLATE_HowTo.md` | `DOCS/templates/TEMPLATE_HowTo.md` |
| `DOCS/.algorithm/TEMPLATE_Algorithm.md` | `DOCS/templates/TEMPLATE_Algorithm.md` |
| `DOCS/.review/code-review-template.md` | `DOCS/templates/TEMPLATE_Code_Review.md` |

### 9.3 Missing Entirely

| Template | Governs |
|----------|---------|
| `TEMPLATE_Readme.md` | Root `README.md` |
| `TEMPLATE_Stack_Architecture.md` | Stack `docs/ARCHITECTURE.md` |
| `TEMPLATE_Screenplay_Guide.md` | Stack `docs/SCREENPLAY_GUIDE.md` |
| `TEMPLATE_QA_Strategy.md` | Stack `docs/QA_STRATEGY.md` |
| `TEMPLATE_Stack_Readme.md` | Stack `docs/README.md` |
| `TEMPLATE_Parity_Contract.md` | `DOCS/architecture/` parity contract |
| `TEMPLATE_Subject_App_Contract.md` | `DOCS/architecture/` subject app contract |
| `TEMPLATE_Implementation_Log.md` | (to be consolidated into `DOCS/templates/`) |

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
| **Algorithm documentation** | Good — pseudocode, complexity, examples, now in `DOCS/.algorithm/` |
| **Implementation logs** | Well-maintained, timestamped, append-only |
| **Code review discipline** | Multiple reviews archived, timestamped, immutable |
| **BACKLOG.md** | Detailed sprint tracking, good item format |

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
| 6 | Create `DOCS/templates/` | ✅ Done | 4 core templates created |
| 7 | Create Phase-0 templates | ✅ Done | `TEMPLATE_Decision_Record`, `TEMPLATE_Changelog`, `TEMPLATE_Backlog`, `TEMPLATE_Naming_Conventions` |
| 8 | Update `CLAUDE.md` | ✅ Done | Stack inventory, risk register, canonical feature procedure, `DECISION_REGISTER.md` reference |
| 9 | Record v1.1 adoption | 🔲 Open | DR-006 needed: document adoption of RA v1.1 and path corrections |

**Remaining from Phase 0:**
- Create DR-006 in `DECISION_REGISTER.md`: adoption of RA v1.1, `NAMING_CONVENTIONS.md` path correction, root `BACKLOG.md` status

**Verification (v1.1):**
- `CHANGELOG.md` at root ✅
- `DECISION_REGISTER.md` at root ✅
- `DOCS/.planning/BACKLOG.md` ✅ (pre-existing; this is the required path in v1.1)
- `DOCS/.design/NAMING_CONVENTIONS.md` ✅
- `DOCS/templates/` with 4 templates ✅ (10 more still needed for full compliance)

---

### Phase 1 — Canonical Feature Store (half day)
*Establishes the single source of truth before the Screenplay layer is built.*

**Actions:**
1. Create `features_shared/util-tests/sudoku-solver/` at repository root
2. Copy `BasicSudokuSolverLogic.feature` to `features_shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`
3. Add `@util` tag to all scenarios in the canonical copy
4. Create `tests/features/` inside the Stack and copy canonical file there (do not modify canonical)
5. Add Stack-specific tags to the local copy (e.g., `@stack-demoapp001`)
6. Update `cucumber.js` to reference `tests/features/` as the feature path
7. Record in `DECISION_REGISTER.md` (DR-006): "Feature file is `@util` surface — in-process algorithm testing, no live subject required"

**Verification:** `npm test` still passes all 43 scenarios from the new path.

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
| 0 — Documentation scaffold | §10.1, §10.5, §10.6, §10.4 | 1–2 days | Sprint 3 | ✅ Complete (1 action open: DR-006) |
| 1 — Canonical Feature Store | §5.1–5.3 | 0.5 day | Sprint 3 | 🔲 Open |
| 2 — Screenplay Foundation | §3, §4 (abilities, actors) | 2–3 h | Sprint 3 | 🔲 Open |
| 3 — Tasks and Questions | §3.3, §3.4 | 4–6 h | Sprint 3 | 🔲 Open |
| 4 — Step Definition Migration | §2.2, §3, layer model | 4–6 h | Sprint 3 | 🔲 Open |
| 5 — Stack Documentation | §10.2 | 1 day | Sprint 3 | 🔲 Open |
| 6 — Architecture Documents | §10.3 | 0.5 day | Sprint 4 | 🔲 Open |
| 7 — Orchestration and Metrics | §9 | 0.5 day | Sprint 4 | 🔲 Open |
| 8 — CLI Hardening | §6.3 | 1–2 days | Sprint 5 | 🔲 Open |

**Critical path to minimum viable compliance:** Phases 1 → 2 → 3 → 4 (Sprint 3). Phase 0 is done. Phases 5–8 complete full compliance.

---

## 15. Backlog Items Generated

The following items should be added to `DOCS/.planning/BACKLOG.md` and cross-referenced to `DECISION_REGISTER.md` as appropriate:

| ID | Title | Phase | Priority | Status |
|----|-------|-------|----------|--------|
| NEW-001 | Create DECISION_REGISTER.md and backfill DR-001–005 | 0 | High | ✅ Done |
| NEW-002 | Create CHANGELOG.md at repository root | 0 | High | ✅ Done |
| NEW-003 | ~~Promote BACKLOG.md to root~~ → **not required by v1.1** | 0 | — | ⚠ Superseded — `DOCS/.planning/BACKLOG.md` is the required location |
| NEW-004 | Create NAMING_CONVENTIONS.md at `DOCS/.design/` (v1.1: `DOCS/design/`) | 0 | High | ✅ Done (corrected from root) |
| NEW-005 | Create DOCS/templates/ with Phase-0 templates | 0 | High | ✅ Done (4 templates; 10 remaining) |
| NEW-005a | Record v1.1 adoption as DR-006 | 0 | High | 🔲 Open |
| NEW-006 | Create features_shared/ canonical feature store | 1 | High | 🔲 Open |
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

**Impact of v1.0 → v1.1 on this project:**
- Root `BACKLOG.md` created in Phase 0 is no longer a required document — retained as convenience redirect
- `NAMING_CONVENTIONS.md` created at root in Phase 0 corrected to `DOCS/.design/NAMING_CONVENTIONS.md` (using DR-001 dot-prefix convention)
- DR-006 needed to record the v1.1 adoption and consequent path corrections

---

*This analysis is maintained against the current version of `REFERENCE_ARCHITECTURE.md`. Re-run when the RA version changes or when a second Stack is added — parity compliance (§8) cannot be assessed until there are two Stacks to compare.*
