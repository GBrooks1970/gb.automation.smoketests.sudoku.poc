# How To: Add a New Solving Algorithm

**Difficulty:** Advanced
**Time to complete:** 60–90 minutes
**Last verified:** 2026-05-17

---

## What you will achieve

By the end of this guide you will have a new solving technique (e.g., Naked Pairs) that:
- Lives as a method on `SudokuSolver`
- Is called by `SudokuOrchestrator.solve()` in the correct order
- Is covered by at least one Gherkin scenario in the canonical feature store
- Has a corresponding Screenplay Task and Question wired into Actor Memory
- Has an algorithm specification document under `DOCS/.algorithm/`
- Passes the full orchestration script with all 43 existing scenarios green

This guide uses **Naked Pairs** as the worked example throughout. Replace it with your technique as you follow along.

---

## Before you start

**You need:**
- [ ] A clear understanding of what your technique does and when it applies (read the algorithm specification first if one exists)
- [ ] Node.js 16+ and npm installed
- [ ] Dependencies installed — run `npm install` from `demo-apps/demoapp001-typescript-cypress/`

**You should know:**
- The Screenplay pattern and how Actor Memory works in this project — see [add-a-gherkin-scenario.md](add-a-gherkin-scenario.md) if this is unfamiliar
- How `SudokuSolver.nakedSingles()` works — it is the best template for a new technique
- TypeScript basics

---

## Understanding the current architecture

Before adding anything, know where your code fits:

```
SudokuOrchestrator.solve()          ← calls techniques in order; you add here
  └── SudokuSolver.unitCompletion() ← returns true if any cell was changed
  └── SudokuSolver.hiddenSingles(d) ← called 9× (once per digit)
  └── SudokuSolver.nakedSingles()   ← returns true if any cell was changed
  └── [YOUR METHOD HERE]

Actor Memory (Screenplay)
  SolveXxx Task → notes.set(ALGORITHM_PROGRESS, result) → AlgorithmMadeProgress Question
```

**The return value contract:** every solving method MUST return `true` if it changed at least one cell, `false` otherwise. `SudokuOrchestrator` uses this to detect when the puzzle is stuck.

---

## Steps

### Step 1: Write the method on SudokuSolver

Open [`demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts`](../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts).

Add your method after `nakedSingles()`. The method signature must return `boolean`:

```typescript
/**
 * Naked Pairs Algorithm
 * Goal: When two cells in a unit share exactly the same two candidates,
 *       those candidates can be eliminated from all other cells in the unit.
 *
 * @returns true if any candidate was eliminated that led to a new placement
 */
public nakedPairs(): boolean {
  let changed = false;

  // Your implementation here.
  // Call getCellCandidates() for each empty cell.
  // When a naked pair is found, eliminate those two digits from
  // all other empty cells in the same row/column/block.
  // Set changed = true whenever a cell value is assigned as a result.

  return changed;
}
```

**Use the existing helper methods:** `isInRow(row, digit)`, `isInColumn(col, digit)`, `isInBlock(row, col, digit)`, and `getCellCandidates(row, col)` are already on `SudokuSolver`. Do not re-implement constraint checking inline.

---

### Step 2: Add to SudokuOrchestrator.solve()

Open [`demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts`](../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts).

Add your technique call **inside the `while (isProgressing)` loop**, after `nakedSingles()`:

```typescript
// Step 4: Naked Pairs (eliminates candidates from units with shared pairs)
if (this.solver.nakedPairs()) {
  changedThisPass = true;
}
```

> **Order matters.** More powerful techniques belong after less powerful ones. The loop restarts from Step 1 (Unit Completion) whenever any technique makes progress — so adding your technique at the end gives the simpler techniques a chance to clean up first.

---

### Step 3: Verify the solver still compiles and runs

```powershell
cd demo-apps/demoapp001-typescript-cypress
npm run build
npm start
```

**You should see:** build exit 0, and the existing four puzzles all print `SOLVED`.

If your algorithm is incomplete (a stub returning `false`), the solver will still pass — it just will not apply your technique yet.

---

### Step 4: Add the canonical Gherkin scenario

Open [`features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`](../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature).

Add a new scenario section for your technique. Model it on the existing Hidden Singles scenarios:

```gherkin
# =============================================================================
# Naked Pairs Algorithm Tests
# =============================================================================

Scenario: Identify a Naked Pair in a row
  Given a row contains two cells each with exactly the same two candidates: "<candidates>"
  When the "Naked Pairs" algorithm is executed
  Then both candidate values should be eliminated from other cells in the row
  And the algorithm should return true

  Examples:
    | candidates |
    | 4, 7       |
```

**Rules for canonical feature files:**
- Keep the `@util` tag at the file top — do not add scenario-level tags here
- Use `{string}` and `{int}` placeholders; no inline literal arrays (DR-018)
- Do not add `@stack-demoapp001` here — that goes in the Stack-local copy only

---

### Step 5: Copy the scenario to the Stack-local feature file

Open [`demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature`](../../demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature).

Add the identical scenario body. The Stack-local file already has `@util @stack-demoapp001` at the top — you do not need to add tags per scenario.

---

### Step 6: Run the feature parity report to confirm sync

```powershell
cd d:\__GB_DEV\_GitHub\gb.automation.smoketests.sudoku.poc
.\.batch\generate-feature-parity-report.ps1
```

**You should see:** `Overall result: PASS`

If the result is `DRIFT`, the two copies do not match — compare them side by side and fix the discrepancy before continuing.

---

### Step 7: Add a Screenplay Task

Open `demo-apps/demoapp001-typescript-cypress/tests/screenplay/tasks/`.

Create `ApplyNakedPairs.ts` (or add a static factory to the existing `ApplyAlgorithm.ts` following the existing pattern):

```typescript
import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { SudokuNotes, ALGORITHM_PROGRESS } from '../support/memory-keys';

export const ApplyNakedPairs = {
  onCurrentGrid: () =>
    Interaction.where(`#actor applies Naked Pairs`, async (actor) => {
      const solver = actor.abilityTo(UseSudokuSolver).solver;
      const result = solver.nakedPairs();
      await notes<SudokuNotes>().set(ALGORITHM_PROGRESS, result).performAs(actor);
    }),
};
```

**Memory key rule (DR-015):** the Task MUST write `ALGORITHM_PROGRESS` to Actor Memory using `notes<SudokuNotes>().set(KEY, value).performAs(actor)` inside the `Interaction.where()` lambda. Do not call `actor.attemptsTo()` inside the lambda — the actor type there does not expose that method.

---

### Step 8: Add step definitions

Open the appropriate step definition file in `tests/screenplay/step_definitions/`. If your scenarios introduce new step text, add new `Given`/`When`/`Then` bindings that delegate only to `actor.attemptsTo(...)` and `actor.answer(...)` — no Ability calls, no inline logic.

```typescript
When('the {string} algorithm is executed', async (algorithm: string) => {
  const actor = actorCalled('Solver');
  if (algorithm === 'Naked Pairs') {
    await actor.attemptsTo(ApplyNakedPairs.onCurrentGrid());
  }
  // ... existing cases
});
```

---

### Step 9: Write the algorithm documentation

Create `DOCS/.algorithm/naked-pairs.md` using the `algorithm.template.md` as a starting point:

```powershell
Copy-Item DOCS/.templates/algorithm.template.md DOCS/.algorithm/naked-pairs.md
```

Fill in all `[REQUIRED]` sections: overview, technique summary, pseudocode, complexity analysis, coverage and limitations, testing references.

Register the new file in [`DOCS/.algorithm/README.md`](../.algorithm/README.md).

---

### Step 10: Run the full orchestration script

```powershell
.\.batch\run-demoapp001.ps1
```

**You should see:**

```
BuildExitCode: 0
TestExitCode:  0
OverallExitCode: 0
```

The scenario count increases by however many scenarios you added. All existing 43 pass.

---

## Verify it worked

- [ ] `npm run build` exits 0 — TypeScript compiles with no errors
- [ ] `npm start` runs all puzzles and each prints `SOLVED` (or `STUCK_ON_ADVANCED_LOGIC` if the puzzle genuinely needs more advanced logic)
- [ ] Feature parity report: `PASS`
- [ ] All 43 original scenarios pass; your new scenarios also pass
- [ ] `DOCS/.algorithm/naked-pairs.md` exists and is registered in `DOCS/.algorithm/README.md`

---

## Common problems

### New scenario is `undefined` in the Cucumber output

**Cause:** No step definition matches the Gherkin step text.
**Fix:** Check the step text character-for-character against the step definition pattern. Cucumber patterns are case-sensitive and whitespace-sensitive.

---

### `notes<SudokuNotes>().set(...)` causes a TypeScript error inside `Interaction.where()`

**Cause:** Inside the `Interaction.where()` lambda, the `actor` parameter is typed as `UsesAbilities & AnswersQuestions & CollectsArtifacts`, which does not expose `attemptsTo()`.
**Fix:** Call `notes<SudokuNotes>().set(KEY, value).performAs(actor)` directly rather than wrapping it in `actor.attemptsTo(...)`. This is the documented project pattern (DR-015).

---

### `OverallExitCode=1` but all existing scenarios still pass

**Cause:** Your new scenario is failing.
**Fix:** Check the test log at `.results/logs/DEMOAPP001_test_*.log`. Find your scenario name and read the error. The most common cause is that `SetupGridState` does not have a method that matches the `Given` step for your scenario — you may need a new setup helper.

---

## What to do next

- Read [DOCS/.algorithm/sudoku-basic-solver.md](../.algorithm/sudoku-basic-solver.md) to see the documentation standard for an existing algorithm.
- Add a backlog item to [`DOCS/.planning/backlog.md`](../.planning/backlog.md) for any further algorithm refinements or scenario coverage gaps.
- If your algorithm requires a structural decision (e.g., a new Memory key), record it in `decision-register.md` — see [create-a-decision-register-entry.md](create-a-decision-register-entry.md).
