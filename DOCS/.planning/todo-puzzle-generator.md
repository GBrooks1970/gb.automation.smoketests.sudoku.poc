# TODO: Puzzle Generator

**Created:** 2026-05-24T00:00:00Z
**Last Updated:** 2026-05-24T00:00:00Z
**Backlog Reference:** BACKLOG-016 (Puzzle Generator)
**Stack(s):** Future product surface
**Estimated Effort:** 32-64 hours depending on generation and uniqueness requirements

---

## Overview

Implementation plan for adding a Sudoku puzzle generator that can create valid 9x9 puzzles with metadata and difficulty classification.

This is a future product capability and should be treated separately from the current deterministic solver. The current solver intentionally does not use backtracking; a generator may need a separate construction/validation engine for full-grid generation and uniqueness checks. That decision must be made explicitly before implementation.

---

## Status Legend

| Field | Allowed values |
|-------|----------------|
| Done | `[ ]` not complete, `[x]` complete |
| Status | `Not Started`, `In Progress`, `Blocked`, `Complete`, `Skipped` |

When a sub-item is finished, set `Done` to `[x]` and `Status` to `Complete`. If a sub-item is not applicable, set `Done` to `[x]`, `Status` to `Skipped`, and explain why in Notes.

---

## Current Baseline

| Area | Current state |
|------|---------------|
| Puzzle format | Stack-local `puzzles.json` files with `name`, `difficulty`, `description`, and `grid` |
| Current solver | Deterministic basic techniques; no backtracking |
| Current statuses | `SOLVED`, `STUCK_ON_ADVANCED_LOGIC` |
| REST API | DEMOAPP001 Express API supports puzzle list/get, solve, validate, and visualise |
| Web UI | DEMOAPP001 visualises existing puzzles |

---

## Target Outcomes

| Done | Status | Outcome | Acceptance check |
|------|--------|---------|------------------|
| [ ] | Not Started | A valid complete solution grid can be generated | Generated full grid passes row/column/block validation |
| [ ] | Not Started | A puzzle can be derived from a complete grid | Generated puzzle has empty cells and valid givens |
| [ ] | Not Started | Generated puzzles can be validated for uniqueness or documented as non-unique | Uniqueness policy is explicit and tested |
| [ ] | Not Started | Difficulty metadata is assigned consistently | Difficulty classification rules are documented |
| [ ] | Not Started | Generated puzzles can be consumed by existing solver/API/UI surfaces | Generated puzzle conforms to existing puzzle schema |
| [ ] | Not Started | Generator behavior is reproducible when seeded | Same seed and options produce the same puzzle |

---

## Scope Decision Gate

Complete this section before implementation starts.

| ID | Done | Status | Decision item | Notes |
|----|------|--------|---------------|-------|
| S0.1 | [ ] | Not Started | Decide whether the generator may use backtracking internally | Recommended: allowed only inside generator/uniqueness engine, not inside deterministic solver |
| S0.2 | [ ] | Not Started | Decide initial user surface | Options: CLI command, REST API endpoint, Web UI control, library-only utility |
| S0.3 | [ ] | Not Started | Decide uniqueness requirement for MVP | Recommended: require unique-solution puzzles before public exposure |
| S0.4 | [ ] | Not Started | Decide difficulty bands | Suggested: easy, medium, hard, test; align with current puzzle metadata |
| S0.5 | [ ] | Not Started | Decide whether generated puzzles are persisted | Options: return only, save to file, or append to Stack-local `puzzles.json` through explicit command |
| S0.6 | [ ] | Not Started | Decide whether structural/product decisions require a Decision Record | Backtracking-in-generator or persistence policy may warrant a DR |

---

## Phase 1: Generator Core Model

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 1.1 | [ ] | Not Started | Define generator options | Suggested: seed, difficulty, minimumClues, maximumClues, symmetry, timeoutMs |
| 1.2 | [ ] | Not Started | Define generator result type | Suggested: puzzle metadata, grid, solution, seed, generationStats |
| 1.3 | [ ] | Not Started | Define random number generator strategy | Must support deterministic seed-based generation |
| 1.4 | [ ] | Not Started | Add grid validation helper reuse | Reuse existing validation logic where possible |
| 1.5 | [ ] | Not Started | Add tests for option validation | Invalid difficulty, impossible clue bounds, and invalid seeds should fail clearly |

---

## Phase 2: Complete Grid Generation

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 2.1 | [ ] | Not Started | Implement complete valid solution generation | Common approach: randomized backtracking isolated to generator module |
| 2.2 | [ ] | Not Started | Ensure generated solution satisfies all Sudoku constraints | Test every row, column, and block contains digits 1-9 |
| 2.3 | [ ] | Not Started | Make full-grid generation seed-reproducible | Same seed should produce same solution |
| 2.4 | [ ] | Not Started | Add timeout or attempt limit | Avoid infinite generation loops |
| 2.5 | [ ] | Not Started | Add unit tests for multiple seeds | Confirm valid and varied outputs |

---

## Phase 3: Puzzle Carving

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 3.1 | [ ] | Not Started | Implement clue removal strategy | Remove values from a completed grid while preserving validity |
| 3.2 | [ ] | Not Started | Add optional symmetry policy | Examples: rotational symmetry, mirror symmetry, none |
| 3.3 | [ ] | Not Started | Enforce clue count bounds | Do not produce puzzles outside requested minimum/maximum clues |
| 3.4 | [ ] | Not Started | Preserve original solution separately | Puzzle grid and solution grid should be different objects |
| 3.5 | [ ] | Not Started | Add tests for clue counts and valid givens | Givens must match the solution grid |

---

## Phase 4: Uniqueness Validation

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 4.1 | [ ] | Not Started | Implement or choose solution-counting method | Usually requires a bounded backtracking solver that stops after 2 solutions |
| 4.2 | [ ] | Not Started | Isolate uniqueness solver from deterministic teaching solver | Do not add trial-and-error behavior to `SudokuSolver` unless explicitly approved |
| 4.3 | [ ] | Not Started | Validate generated puzzle has exactly one solution if uniqueness is required | Record result in generation stats |
| 4.4 | [ ] | Not Started | Add timeout/attempt handling for uniqueness checks | Return clear failure if generation cannot satisfy constraints |
| 4.5 | [ ] | Not Started | Add tests for known unique and non-unique grids | Include empty grid as non-unique |

---

## Phase 5: Difficulty Classification

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 5.1 | [ ] | Not Started | Define difficulty classifier rules | Options: clue count, deterministic solver techniques required, solve time, or combined scoring |
| 5.2 | [ ] | Not Started | Reuse existing solver to classify basic-technique solvability | Easy/medium can be based on current deterministic techniques |
| 5.3 | [ ] | Not Started | Define handling for puzzles current solver cannot solve | Classify as hard/expert or reject depending on scope |
| 5.4 | [ ] | Not Started | Add tests for classification boundaries | Include generated and known fixture puzzles |
| 5.5 | [ ] | Not Started | Document classifier limitations | Difficulty is heuristic unless backed by a formal grading engine |

---

## Phase 6: Product Surface

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 6.1 | [ ] | Not Started | Implement initial selected surface from S0.2 | Keep MVP narrow |
| 6.2 | [ ] | Not Started | If CLI surface: add command/options without breaking existing CLI behavior | Example: `npm start -- --generate --difficulty easy --seed 123` |
| 6.3 | [ ] | Not Started | If REST API surface: add `POST /api/puzzles/generate` or similar | Include request validation and structured errors |
| 6.4 | [ ] | Not Started | If Web UI surface: add controls only after API is stable | Avoid coupling UI directly to generator internals |
| 6.5 | [ ] | Not Started | Add integration coverage for selected surface | Verify generated puzzle schema and validation behavior |

---

## Phase 7: Persistence and Data Management

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 7.1 | [ ] | Not Started | Decide whether generated puzzles can be saved | Avoid implicit writes to `puzzles.json` |
| 7.2 | [ ] | Not Started | If saving is supported, require explicit output path | Generated files should not overwrite fixtures without confirmation |
| 7.3 | [ ] | Not Started | Ensure generated output path is ignored or documented | Use `.results/generated-puzzles/` for transient outputs |
| 7.4 | [ ] | Not Started | Add schema validation for saved puzzle files | Saved puzzles must match current puzzle loader expectations |
| 7.5 | [ ] | Not Started | Add cleanup guidance | Explain how to remove generated puzzle files |

---

## Phase 8: Documentation

| ID | Done | Status | Task | Notes |
|----|------|--------|------|-------|
| 8.1 | [ ] | Not Started | Update README with generator usage if user-facing | Include examples and seed behavior |
| 8.2 | [ ] | Not Started | Update solver specification if puzzle generation becomes in scope | Current spec marks puzzle generation out of scope |
| 8.3 | [ ] | Not Started | Add or update design documentation for generator architecture | Especially if using a separate backtracking uniqueness engine |
| 8.4 | [ ] | Not Started | Update `DOCS/.planning/BACKLOG.md` after implementation | Mark BACKLOG-016 resolved only after acceptance criteria pass |
| 8.5 | [ ] | Not Started | Create an implementation log | Use `DOCS/.templates/implementation-log.template.md` |

---

## Phase 9: Verification Matrix

| ID | Done | Status | Command / Check | Expected result |
|----|------|--------|-----------------|-----------------|
| 9.1 | [ ] | Not Started | Unit tests for complete grid generation | Generated solution grids are valid |
| 9.2 | [ ] | Not Started | Unit tests for puzzle carving | Clue counts and givens are valid |
| 9.3 | [ ] | Not Started | Unit tests for uniqueness validation | Unique/non-unique cases are detected correctly |
| 9.4 | [ ] | Not Started | Unit tests for seeded reproducibility | Same seed/options produce same result |
| 9.5 | [ ] | Not Started | Selected product surface integration test | CLI/API/UI surface returns valid generated puzzle |
| 9.6 | [ ] | Not Started | DEMOAPP001 standard checks | `npm run build`, `npm run lint`, `npm run test:api`, and `npm test` exit `0` |
| 9.7 | [ ] | Not Started | `git status --short` after generation commands | No generated puzzle output is accidentally tracked |

---

## Suggested File Changes

| Done | Status | Path | Purpose |
|------|--------|------|---------|
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/app_src/generator/` | Generator and uniqueness engine implementation |
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/tests/` | Unit/integration tests for generator behavior |
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/app_src/server/` | REST API changes if API surface is selected |
| [ ] | Not Started | `demo-apps/demoapp001-typescript-cypress/app_src/index.ts` | CLI changes if CLI surface is selected |
| [ ] | Not Started | `.results/generated-puzzles/` | Generated puzzle output location |
| [ ] | Not Started | `DOCS/.design/puzzle-generator.md` | Optional generator design document |
| [ ] | Not Started | `DOCS/.implementation-logs/YYYY-MM-DD_puzzle-generator.md` | Implementation session log |

---

## Acceptance Criteria for BACKLOG-016

| Done | Status | Acceptance criterion | Evidence |
|------|--------|---------------------|----------|
| [ ] | Not Started | Generator creates valid complete solution grids | Link tests and command output |
| [ ] | Not Started | Generator creates puzzle grids with requested constraints | Link tests and sample output |
| [ ] | Not Started | Uniqueness policy is implemented or explicitly documented as out of MVP | Link tests or decision note |
| [ ] | Not Started | Difficulty classification is implemented or explicitly documented as out of MVP | Link classifier tests or decision note |
| [ ] | Not Started | Selected user surface is covered by integration tests | Link CLI/API/UI test |
| [ ] | Not Started | Existing solver behavior remains unchanged | Record standard validation commands |

---

## Notes for Implementers

- Keep generator backtracking, if used, isolated from the deterministic solver.
- Do not mutate existing `puzzles.json` implicitly.
- Seeded reproducibility is important for debugging generated puzzle reports.
- Treat difficulty labels as heuristic unless a formal grading algorithm is implemented.

