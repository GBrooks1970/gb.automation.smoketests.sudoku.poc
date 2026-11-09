---
version: 1
created: 2026-11-09T15:27:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-089 / TRIAGE-20
status: approved
approved: 2026-11-09 (owner, as recommended across all 8 decisions)
language: en-GB
---

# Implementation plan: BACKLOG-089 / TRIAGE-20 Give the empty Then steps real observations and dispose of no-op and tautological bindings

**Goal.** Eliminate vacuous, parameter-blind, and tautological step bindings across all three Stacks (DEMOAPP001 TypeScript, DEMOAPP002 Python, DEMOAPP003 C#). Give the empty Then steps real observations backed by Actor Memory (`LAST_ERROR`), DR-037 orchestration attempt events, and genuine fixture validation. Replace tautological assertions (e.g. `count >= 0`) with deterministic checks, align the missing puzzle file scenario to test real loader failure, and prove all new assertions with focused mutation controls in `.batch/test-then-assertion-mutations.ps1`. Source: Claude review v2 Risk 3 recommendations 1-2 (MEDIUM priority), triaged as TRIAGE-20 and recorded in the project backlog as BACKLOG-089.

## Evidence gathered before planning

Audited on 2026-11-09 on branch `worklist/triage-20-real-then-observations` cut from `main` @ `360a226`:

| Finding | Current Implementation across Stacks | Consequence for the plan |
|---|---|---|
| **Empty Then:** `"no errors should occur"` (canonical feature line 335) | TS `integration.steps.ts:74-76`: comment only.<br>Python `test_basic_sudoku_solver_logic.py:789-791`: `pass`.<br>C# `BasicSudokuSolverLogicSteps.cs:676-679`: empty method. | A failure or swallowed error inside the task passes silently. All three Stacks already implement `ErrorThrown.last()` / `ErrorThrown.Last()` querying `LAST_ERROR` in Actor Memory. The step must assert that `LAST_ERROR` is null. |
| **Empty Then:** `"the main loop should exit"` (canonical feature line 361) | TS `edgeCases.steps.ts:119-121`: comment only.<br>Python `test_basic_sudoku_solver_logic.py:955-957`: `pass`.<br>C# `BasicSudokuSolverLogicSteps.cs:831-834`: empty method. | In `Scenario: Verify algorithm returns false when no progress made`, the runner tests individual techniques but never proves the orchestrator loop exits. Under DR-037, `lastAttemptEvents` and `lastAttemptIterations` record loop attempts. The step must assert that the loop executed 1 iteration where all attempts had `changed == false` and returned `STUCK_ON_ADVANCED_LOGIC`. |
| **Empty Then:** `"the move should be validated against row, column, and block constraints"` (canonical line 171) | TS `constraintValidation.steps.ts:26-28`: comment only.<br>Python line 344-346: `pass`.<br>C# line 268-271: empty method. | The When step calls `AttemptPlacement.ofValue(value)` which evaluates `isValidPlacement(row, col, value)` across row, col, and block constraints and stores `VALIDATION_RESULT`. The Then step should assert that `VALIDATION_RESULT` was evaluated and recorded before the subsequent step checks the exact value. |
| **Tautological Assertion:** `Then the result should be an array of matching puzzles` (canonical line 268) | TS `puzzleLoader.steps.ts:157`: `assert.ok(count >= 0)`.<br>Python line 679: `assert count >= 0`.<br>C# line 588: `Assert.That(count, Is.GreaterThanOrEqualTo(0))`. | For any array, `length >= 0` is always true. When requesting difficulty `"easy"` against `puzzles.json`, exactly 1 matching puzzle exists ("Easy Scan Grid"). The step must assert `count == 1` (or `count > 0`) and verify all returned solvers match difficulty `"easy"`. |
| **Python No-Op (`pass`) Steps:** lines ~381, 599, 609, 816 | Line 381 (`no digits violate row, column, or block rules`): `pass`.<br>Line 599 (`the puzzles.json file does not exist`): `pass`.<br>Line 609 (`the PuzzleLoader attempts to load the file`): `pass`.<br>Line 816 (`attempting to create a SudokuSolver`): `pass`. | In line 381, the grid is already complete; the step can verify 0 rule violations. In lines 599 and 609, the missing file test is bypassed via `SimulateError`. In line 816, the invalid dimension test simulates the error in Given instead of constructing the solver in When. Each must be given real work. |
| **Four "another cell" Givens:** Python lines 890, 900, 910, 930 | TS `nakedPairs.steps.ts:19, 33, 46` and `xWing.steps.ts:25`: comment only.<br>Python lines 890, 900, 910, 930: `pass`.<br>C# lines 775, 784, 793, 810: empty methods. | These steps specify candidate sets for cells in Naked Pairs and X-Wing scenarios. Adding new candidate observation APIs is explicitly reserved for TRIAGE-15 (BACKLOG-090) under a formal Decision Record. In TRIAGE-20, their disposition is inventoried: verify preconfigured fixture cell state where possible, and document hand-off to TRIAGE-15. |
| **Missing Puzzle File Scenario:** `Handle missing puzzle file gracefully` (canonical line 275) | TS, Python, and C# all call `SimulateError.forMissingFile()`, which generates a `FileNotFoundException("Puzzle file not found")` when no loader error occurred. | Per TRIAGE-18 Decision 6/7 and the TRIAGE-20 worklist note, the scenario asserts against an error it made itself. Pointing the loader at a missing path (`"nonexistent_puzzles.json"`) allows the loader to throw a real file-not-found error, eliminating the artificial simulation. |
| **Mutation Controls:** `.batch/test-then-assertion-mutations.ps1` | Currently runs 22 mutations across 15 scenarios in an isolated temporary Stack copy (TRIAGE-24). | Adding planted mutations for `"no errors should occur"`, `"the main loop should exit"`, and the array count tautology will ensure these new assertions cannot be broken or hollowed out in the future. |

---

## Detailed Step Inventory & Disposition

| # | Step Phrase | Type | Canonical Line | Files & Lines across Stacks | Current State | Planned Disposition | Mutation / Verification Oracle |
|---|---|---|---|---|---|---|---|
| **1** | `no errors should occur` | Then | 335 | TS: `integration.steps.ts:74-76`<br>Py: `test_basic_sudoku_solver_logic.py:789-791`<br>C#: `BasicSudokuSolverLogicSteps.cs:676-679` | Empty / `pass` | **Assert:** Query `ErrorThrown.last()` / `ErrorThrown.Last()` from Actor Memory (`LAST_ERROR`) and assert it is `null` / `None`. | Planted mutation in `SimulateError` / memory setting a non-null error; step must fail with `AssertionError`. |
| **2** | `the main loop should exit` | Then | 361 | TS: `edgeCases.steps.ts:119-121`<br>Py: `test_basic_sudoku_solver_logic.py:955-957`<br>C#: `BasicSudokuSolverLogicSteps.cs:831-834` | Empty / `pass` | **Assert:** Assert orchestration loop exit using DR-037 attempt events: orchestrator executed 1 iteration, 0 attempts made progress (`changed == false`), and solver status is `"STUCK_ON_ADVANCED_LOGIC"`. | Planted mutation simulating progress (`changed = true`) or multiple iterations; step must fail. |
| **3** | `the move should be validated against row, column, and block constraints` | Then | 171 | TS: `constraintValidation.steps.ts:26-28`<br>Py: `test_basic_sudoku_solver_logic.py:344-346`<br>C#: `BasicSudokuSolverLogicSteps.cs:268-271` | Empty / `pass` | **Assert:** Assert that `VALIDATION_RESULT` in Actor Memory is non-empty and contains `'VALID'` or `'INVALID'`, confirming multi-constraint validation was executed. | Clearing or corrupting `VALIDATION_RESULT`; step must fail. |
| **4** | `the result should be an array of matching puzzles` | Then | 268 | TS: `puzzleLoader.steps.ts:157`<br>Py: `test_basic_sudoku_solver_logic.py:679`<br>C#: `BasicSudokuSolverLogicSteps.cs:588` | Tautology (`count >= 0`) | **Assert:** Assert `count == 1` (matching exactly 1 easy puzzle in `puzzles.json`) and verify each returned puzzle has `difficulty == "easy"`. | Planted mutation requesting non-matching difficulty or mutating expected count; step must fail. |
| **5** | `no digits violate row, column, or block rules` | Given | 207 | TS: `orchestration.steps.ts:57-59`<br>Py: `test_basic_sudoku_solver_logic.py:381`<br>C#: `BasicSudokuSolverLogicSteps.cs:289-292` | Empty / `pass` | **Verify:** Assert the initialized grid is a valid complete solution with 0 rule violations via `isValidSolution()` / validation helper. | Corrupting a cell in the solved grid fixture; Given step must fail. |
| **6** | `the puzzles.json file does not exist` | Given | 276 | TS: `puzzleLoader.steps.ts:75-77`<br>Py: `test_basic_sudoku_solver_logic.py:599`<br>C#: `BasicSudokuSolverLogicSteps.cs:515-518` | Empty / `pass` | **Configure:** Set target loader path to a non-existent file path (`"nonexistent_puzzles.json"`) on the actor's loader ability. | Pointing to an existing valid file; subsequent error assertion must fail. |
| **7** | `the PuzzleLoader attempts to load the file` / `When the PuzzleLoader is initialized` | When | 277 / 277 | TS: `puzzleLoader.steps.ts:87-89, 103-106`<br>Py: `test_basic_sudoku_solver_logic.py:609, 628-630`<br>C#: `BasicSudokuSolverLogicSteps.cs:524-527, 541-543` | Calls `SimulateError.forMissingFile()` or empty | **Execute:** Attempt real file loading using the configured non-existent path, catching the real runtime error (`FileNotFoundException`, `ENOENT`, `FileNotFoundError`) into `LAST_ERROR`. | Suppressing the file load attempt; Then step must fail. |
| **8** | `attempting to create a SudokuSolver` | When | 343 | TS: `edgeCases.steps.ts:43-45`<br>Py: `test_basic_sudoku_solver_logic.py:816`<br>C#: `BasicSudokuSolverLogicSteps.cs:702-705` | Empty / `pass` | **Execute:** Attempt to instantiate `SudokuSolver` with the malformed 8-row grid, catching the constructor dimension error into `LAST_ERROR`. | Suppressing constructor instantiation; Then step must fail. |
| **9** | Four "another cell ... has candidates" | Given | 382, 396, 410, 429 | TS: `nakedPairs.steps.ts:19, 33, 46`, `xWing.steps.ts:25`<br>Py: lines 890, 900, 910, 930<br>C#: lines 775, 784, 793, 810 | Empty / `pass` | **Retain & Inventory:** Retain existing step structure and record formal disposition hand-off to TRIAGE-15 (BACKLOG-090), where a dedicated Decision Record will govern candidate-observation APIs across Stacks without premature API drift. | Bound parameter verification deferred to TRIAGE-15. |

---

## Design

1. **Memory Key and Error Assertion Alignment (`LAST_ERROR`):**
   - In `integration.steps.ts` (TS), `test_basic_sudoku_solver_logic.py` (Py), and `BasicSudokuSolverLogicSteps.cs` (C#), `Then('no errors should occur')` asks `ErrorThrown.last()` / `ErrorThrown.Last()` and asserts the value is null/None.
2. **Loop Termination Observation (DR-037 Attempt Events):**
   - In `edgeCases.steps.ts` (TS), `test_basic_sudoku_solver_logic.py` (Py), and `BasicSudokuSolverLogicSteps.cs` (C#), `Then('the main loop should exit')` executes `SolvePuzzle.withCurrentGrid()` (or examines the orchestrator solve result on the ability) and verifies:
     - `ability.lastAttemptIterations === 1`
     - `ability.lastAttemptEvents.length > 0` and every attempt event in `lastAttemptEvents` has `changed === false`
     - `ability.solveResult === 'STUCK_ON_ADVANCED_LOGIC'`
3. **Move Constraint Validation Assertion (`VALIDATION_RESULT`):**
   - In `constraintValidation.steps.ts` (TS), `test_basic_sudoku_solver_logic.py` (Py), and `BasicSudokuSolverLogicSteps.cs` (C#), `Then('the move should be validated against row, column, and block constraints')` asserts that `VALIDATION_RESULT` is non-empty (`'VALID'` or `'INVALID'`).
4. **Non-Tautological Array Length & Content Assertion:**
   - In `puzzleLoader.steps.ts` (TS), `test_basic_sudoku_solver_logic.py` (Py), and `BasicSudokuSolverLogicSteps.cs` (C#), `Then('the result should be an array of matching puzzles')` replaces `count >= 0` with:
     - `count === 1` (or `count > 0`)
     - Iterates over the returned solvers and asserts each solver has difficulty `"easy"`.
5. **Real Missing File Loading:**
   - In `Given('the puzzles.json file does not exist')`, configure the actor's `LoadPuzzles` ability with `"nonexistent_puzzles.json"`.
   - In `When('the PuzzleLoader is initialized')`, execute `LoadPuzzles.from(...)` and catch the real file-not-found exception into `LAST_ERROR`, eliminating `SimulateError.forMissingFile()`.
6. **Constructor Invocation for Invalid Dimensions:**
   - In `When('attempting to create a SudokuSolver')`, attempt to construct `new SudokuSolver('test', malformedGrid)` and catch the dimension error into `LAST_ERROR`.
7. **Mutation Controls Extension:**
   - Extend `.batch/test-then-assertion-mutations.ps1` with new mutations targeting:
     - `no-errors-planted`: plants a non-null error in `LAST_ERROR` -> `"no errors should occur"` fails.
     - `main-loop-progress-planted`: plants a fake `changed = true` attempt -> `"the main loop should exit"` fails.
     - `puzzles-array-count-planted`: expects 0 puzzles -> `"the result should be an array of matching puzzles"` fails.

---

## Decisions for Owner Approval

### Decision 1: Observation mechanism for `"no errors should occur"`
- **Recommended (Option A):** Assert that `LAST_ERROR` in Actor Memory is null/empty via `ErrorThrown.last()` across all three Stacks (`assert.strictEqual(error, null)` in TS, `assert actor.answer(ErrorThrown.last()) is None` in Python, `Assert.That(_actor.Answer(ErrorThrown.Last()), Is.Null)` in C#).
- **Alternative (Option B):** Check solver error state directly on `UseSudokuSolver`. (Rejected: Actor Memory `LAST_ERROR` is the standardized Screenplay memory key across all Stacks per DR-013/MIG-04).

### Decision 2: Observation mechanism for `"the main loop should exit"`
- **Recommended (Option A):** Assert orchestration loop exit using DR-037 attempt events on the ability (`lastAttemptIterations == 1`, all attempts in `lastAttemptEvents` have `changed == false`, and solve result is `STUCK_ON_ADVANCED_LOGIC`).
- **Alternative (Option B):** Retain comment-only verification based on individual algorithm return values. (Rejected: Vacuous Then body identified as Risk 3).

### Decision 3: Disposition of `"the move should be validated against row, column, and block constraints"`
- **Recommended (Option A):** Assert that `VALIDATION_RESULT` in Actor Memory is populated with `'VALID'` or `'INVALID'`, confirming multi-constraint validation was executed.
- **Alternative (Option B):** Reword or remove the Gherkin step. (Rejected: Rewording alters canonical feature and step-text parity, whereas an active assertion preserves feature parity cleanly).

### Decision 4: Replacement of `count >= 0` tautology
- **Recommended (Option A):** Assert `count == 1` (or `count > 0`) and verify all returned solvers match difficulty `"easy"`.
- **Alternative (Option B):** Replace with `count > 0` only without verifying puzzle difficulty. (Option A is preferred for full contract assurance).

### Decision 5: Real missing file handling vs simulation
- **Recommended (Option A):** Transition from `SimulateError.forMissingFile()` to actual file loading with a non-existent path (`"nonexistent_puzzles.json"`), capturing the real filesystem error in `LAST_ERROR`.
- **Alternative (Option B):** Keep `SimulateError.forMissingFile()`. (Rejected: Violates the owner-approved note from TRIAGE-18 Decision 6/7).

### Decision 6: Scope boundary for candidate-qualified Givens
- **Recommended (Option A):** Inventory the four `"another cell ... has candidates"` Givens as retained fixture assertions and document their formal hand-off to TRIAGE-15 (BACKLOG-090), avoiding premature API introduction before TRIAGE-15's mandatory Decision Record.
- **Alternative (Option B):** Implement full candidate observation APIs in TRIAGE-20 without a DR. (Rejected: DR is required before introducing candidate observation APIs).

### Decision 7: Mutation controls in `.batch/test-then-assertion-mutations.ps1`
- **Recommended (Option A):** Add 3 new focused planted mutations (no-errors, main-loop-exit, matching-puzzles-count) to the safe temporary-copy mutation harness.
- **Alternative (Option B):** Keep the existing 22 mutations only. (Option A is preferred to ensure new assertions are guarded).

---

## Steps

All work happens on branch `worklist/triage-20-real-then-observations` cut from `origin/main` (`360a226`).

1. **Backlog Status:** Mark BACKLOG-089 as `In Progress` in `DOCS/.planning/backlog.md` (Summary: 12 Open / 1 In Progress / 111 Resolved / 124 Total).
2. **Implementation Plan Approval:** Commit this implementation plan with status updated to `approved` and index it in `DOCS/.implementation-plans/_index.md`.
3. **Capture Must-Fail Before Evidence:**
   - Run a probe showing the empty/tautological assertions pass even when corrupted (e.g. injecting an error into memory or returning 0 puzzles).
4. **Implement Step Definitions across all three Stacks:**
   - DEMOAPP001 (TypeScript): `integration.steps.ts`, `edgeCases.steps.ts`, `constraintValidation.steps.ts`, `puzzleLoader.steps.ts`.
   - DEMOAPP002 (Python): `test_basic_sudoku_solver_logic.py`, `tasks/__init__.py`.
   - DEMOAPP003 (C#): `BasicSudokuSolverLogicSteps.cs`, `tasks/Tasks.cs`.
5. **Update `.batch/test-then-assertion-mutations.ps1`:**
   - Add new planted mutations and verify they are killed in all Stacks.
6. **Local Verification:**
   - Run 55 scenarios across DEMOAPP001, DEMOAPP002, DEMOAPP003.
   - Run 7 parity checks (`.batch/run-parity-checks.ps1`).
   - Run mutation controls (`.batch/test-then-assertion-mutations.ps1`).
7. **Open PR & Merge:**
   - Push branch and open project PR.
   - Merge on all-green CI.

---

## Verification

- **Empirical Tests:** 55 scenarios / 309 steps pass across DEMOAPP001, DEMOAPP002, and DEMOAPP003.
- **Parity Gate:** All 7 parity checks in `.batch/run-parity-checks.ps1` PASS.
- **Mutation Controls:** `.batch/test-then-assertion-mutations.ps1` runs safely in temporary copies and reports 100% killed mutations (25 killed mutations per Stack).
- **CI Fan-in:** PR and main runs pass all required jobs.
