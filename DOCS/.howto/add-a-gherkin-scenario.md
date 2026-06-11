# How To: Add a New Gherkin Scenario Using the Screenplay Pattern

**Difficulty:** Intermediate
**Time to complete:** 30–45 minutes
**Last verified:** 2026-05-17

---

## What you will achieve

By the end of this guide you will have added a new BDD scenario that:
- Lives in the canonical feature store (`features-shared/`) as the single source of truth
- Is propagated to the Stack-local copy with the correct stack tag
- Is backed by a thin step definition that delegates to the Screenplay layer
- Passes the feature parity report and the full test suite

This guide uses a concrete example: adding a scenario that verifies the solver handles a grid with a duplicate value in a row.

---

## Before you start

**You need:**
- [ ] Dependencies installed — `npm install` from `demo-apps/demoapp001-typescript-cypress/`
- [ ] A clear idea of what behaviour your scenario is testing

**You should know:**
- What Gherkin `Given / When / Then` means
- That this project uses Serenity/JS with `TakeNotes` for Actor Memory (DR-015)
- That step definitions must be thin — no Ability calls, no assertion logic inline

---

## The two-file rule

This project maintains **two copies** of every feature file:

| Copy | Path | Purpose |
|------|------|---------|
| Canonical | `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` | Source of truth — `@util` tag only |
| Stack-local | `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature` | Copy consumed by the test runner — `@util @stack-demoapp001` tags |

The bodies of both files MUST be identical after the tag line. The feature parity report enforces this.

---

## Steps

### Step 1: Add the scenario to the canonical feature file

Open [`features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`](../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature).

Add your scenario in the relevant section. Example — adding to the "Edge Cases" section:

```gherkin
Scenario: Handle grid with duplicate values in row
  Given a grid where row {int} contains two {int}'s
  When the solver attempts to solve
  Then the solver should not find valid moves
  And the puzzle should be unsolvable
```

**Canonical feature file rules:**
- Do not add `@stack-demoapp001` or any lifecycle tags here — canonical files carry `@util` only
- Use Cucumber expression parameters (`{int}`, `{string}`) rather than inline literals (DR-018)
- Step text must be reusable — avoid naming specific files, endpoints, or hard-coded values in the step text itself

---

### Step 2: Copy the scenario to the Stack-local feature file

Open [`demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature`](../../demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature).

Paste the identical scenario body into the matching section. Do not change the text.

The Stack-local file has `@util @stack-demoapp001` at the top of the file — you do not need to repeat tags per scenario.

---

### Step 3: Run the feature parity report

```powershell
cd D:\_CLAUDE_COWORK\PROJ001\claude-outputs\test-automation-portfolio\gb.automation.smoketests.sudoku.poc
.\.batch\generate-feature-parity-report.ps1
```

**You should see:** `Overall result: PASS`

If the result is `DRIFT`, the two copies do not match. Open both files side by side and fix the discrepancy. Common causes: a trailing space, a different indentation, or a step that was pasted incorrectly.

---

### Step 4: Check whether the step text already has a definition

Run `npm test` from the stack directory:

```powershell
cd demo-apps/demoapp001-typescript-cypress
npm test
```

Look at the output for your new scenario. Cucumber will tell you exactly what it needs:

```
? Undefined step: 'Given a grid where row {int} contains two {int}\'s'
```

If the step is **already defined** and your scenario passes, skip to the "Verify it worked" section.

If the step is **undefined**, continue with Steps 5–7.

---

### Step 5: Identify the Screenplay components needed

For each new step, decide which Screenplay layer handles it:

| Step type | Uses |
|-----------|------|
| `Given` (setup) | A **Task** that configures Actor Memory or calls an Ability |
| `When` (action) | A **Task** that performs the operation under test |
| `Then` (assertion) | A **Question** that reads Actor Memory or Ability state; assertion in step definition |

For the duplicate-row example:
- `Given a grid where row {int} contains two {int}'s` → Task: `InitialiseGrid.withDuplicateInRow(row, val)` — already exists
- `When the solver attempts to solve` → Task: `SolvePuzzle.withCurrentGrid()` — already exists
- `Then the solver should not find valid moves` → Question: `SolveStatus.current()` — already exists

Check whether the Tasks and Questions you need already exist in:
- `tests/screenplay/tasks/`
- `tests/screenplay/questions/`

If they do not, create them (see Step 6).

---

### Step 6: (If needed) Create a new Task or Question

**New Task:**

```typescript
// tests/screenplay/tasks/MyTask.ts
import { Interaction, notes } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { SudokuNotes, SOLVE_RESULT } from '../support/memory-keys';

export const MyTask = {
  withSomeInput: (input: SomeType) =>
    Interaction.where(`#actor does something with ${input}`, async (actor) => {
      const solver = actor.abilityTo(UseSudokuSolver).solver;
      const result = solver.doSomething(input);
      await notes<SudokuNotes>().set(SOLVE_RESULT, result).performAs(actor);
    }),
};
```

**Memory key rule (DR-015):** inside `Interaction.where()`, write to Memory using `notes<SudokuNotes>().set(KEY, value).performAs(actor)` — not `actor.attemptsTo(...)`. The actor type inside the lambda does not expose `attemptsTo()`.

**New Question:**

```typescript
// tests/screenplay/questions/MyQuestion.ts
import { Question, notes } from '@serenity-js/core';
import { SudokuNotes, MY_KEY } from '../support/memory-keys';

export const MyQuestion = {
  current: () =>
    Question.about(`the current value of MY_KEY`, (actor) =>
      notes<SudokuNotes>().get(MY_KEY).answeredBy(actor)
    ),
};
```

If your scenario needs a new Memory key, add it to both `memory-keys.ts` and the `SudokuNotes` interface in the same file, and record the change in `decision-register.md` (DR-015 requires a DR for Memory key changes).

---

### Step 7: Add the step definition

Find the most appropriate step definition file in `tests/screenplay/step_definitions/`. Create a new file if the scenario belongs to a new category.

```typescript
// In the relevant *.steps.ts file
import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import * as assert from 'assert';
import { InitialiseGrid } from '../tasks/InitialiseGrid';
import { SolvePuzzle } from '../tasks/SolvePuzzle';
import { SolveStatus } from '../questions/SolveStatus';

Given('a grid where row {int} contains two {int}\'s',
  async (rowIndex: number, val: number) => {
    await actorCalled('Solver').attemptsTo(
      InitialiseGrid.withDuplicateInRow(rowIndex, val)
    );
  });

// (When and Then steps may already exist — do not duplicate them)
```

**Step definition rules:**
- Delegate only to `actor.attemptsTo(Task)` or `actor.answer(Question)` — no Ability imports, no inline logic, no assertions in `Given` or `When` steps
- Assertions belong in `Then` steps only, using `assert` on the value returned by `actor.answer(Question)`
- Step text must match the Gherkin text exactly, character for character

---

### Step 8: Run the test suite

```powershell
cd demo-apps/demoapp001-typescript-cypress
npm test
```

**You should see:** your new scenario listed as `(1 passed)` alongside the existing 43.

If your scenario shows as `(1 pending)`, tag it `@pending` in the Stack-local feature file and add a backlog item — do not leave it failing.

---

## Verify it worked

- [ ] Feature parity report: `PASS`
- [ ] New scenario appears in Cucumber output as `passed`
- [ ] All 43 original scenarios still pass
- [ ] No step definition imports an Ability directly (Layer 2 thinness rule, DR-015)

---

## Common problems

### `Ambiguous step` error

**Cause:** Two step definition patterns match the same step text.
**Fix:** Make one pattern more specific. Usually this happens when a new step partially overlaps an existing one — check all `*.steps.ts` files for similar patterns.

---

### Feature parity shows `DRIFT`

**Cause:** The canonical and Stack-local copies do not match.
**Fix:** Copy the canonical scenario text character-for-character into the Stack-local file. The parity check strips tag lines before comparing, so any mismatch is a content error.

---

### `TypeError: actor.abilityTo(...) is not a function` at runtime

**Cause:** The step definition is calling an Ability method directly instead of routing through a Task.
**Fix:** Move the Ability call into a Task (as a static factory method). Import the Task in the step definition; import the Ability only in the Task.

---

### Scenario passes locally but fails in a fresh run

**Cause:** The scenario is relying on state left behind by a previous scenario. Each scenario must be self-contained.
**Fix:** Move all state setup into `Given` steps backed by Tasks. Actor Memory is cleared automatically between scenarios — any state that needs to persist within a scenario must be stored via `notes<SudokuNotes>().set(...)`.

---

## What to do next

- If your scenario exercises a new solving technique, follow [add-a-solving-algorithm.md](add-a-solving-algorithm.md) to implement it fully.
- Review the existing steps in the `step_definitions/` directory — many common operations (load puzzle, apply algorithm, check status) are already defined.
