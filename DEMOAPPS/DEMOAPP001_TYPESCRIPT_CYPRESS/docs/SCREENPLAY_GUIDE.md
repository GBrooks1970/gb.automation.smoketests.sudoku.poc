# DEMOAPP001_TYPESCRIPT_CYPRESS — Screenplay Guide

**Stack:** DEMOAPP001_TYPESCRIPT_CYPRESS
**Language:** TypeScript
**Screenplay library:** @serenity-js/core + @serenity-js/cucumber (v3.43.2)
**Last updated:** 2026-05-15

---

## 1. Actor Setup

Actors are configured centrally through the Cast in `tests/screenplay/actors/SudokuActors.ts`, then wired into Cucumber via `tests/screenplay/support/configure.ts`.

```ts
export const SudokuActors: Cast = {
  prepare(actor: Actor): Actor {
    return actor.whoCan(
      new UseSudokuSolver(),
      LoadPuzzles.from(PUZZLES_PATH),
    );
  },
};
```

**Lifecycle:** A fresh actor persona (`Solver`) is used per scenario by Serenity/JS-Cucumber integration. Ability state is scenario-scoped through actor lifecycle and reinitialised in Given steps.

---

## 2. Abilities

### UseSudokuSolver

**Wraps:** `SudokuSolver` + `SudokuOrchestrator`
**Factory:** direct construction in Cast (`new UseSudokuSolver()`)
**Retrieved via:** `UseSudokuSolver.as(actor)`

Responsibilities:
- Initialise solver instances
- Apply algorithms (`unitCompletion`, `hiddenSingles`, `nakedSingles`)
- Execute full orchestration solve loop
- Hold cross-step state used by Tasks/Questions

### LoadPuzzles

**Wraps:** `PuzzleLoader`
**Factory:** `LoadPuzzles.from(filePath)`
**Retrieved via:** `LoadPuzzles.as(actor)`

Responsibilities:
- Read puzzle collection from `puzzles.json`
- Lookup by name, index, difficulty
- Expose loader error state for negative-path assertions

---

## 3. Tasks

### InitialiseGrid

**Purpose:** Initialise solver state for a named puzzle and optional grid setup.
**Uses ability:** `UseSudokuSolver`
**Writes to Memory:** internal ability state

### ApplyAlgorithm

**Purpose:** Execute one algorithm or all algorithms in sequence for scenario behavior.
**Uses ability:** `UseSudokuSolver`
**Writes to Memory:** algorithm progress state (via ability)

### SolvePuzzle

**Purpose:** Run orchestrator solve flow against the current solver instance.
**Uses ability:** `UseSudokuSolver`
**Writes to Memory:** solve result state (via ability)

### LoadPuzzleByName

**Purpose:** Load a named puzzle via data ability and initialise solver from loaded grid.
**Uses abilities:** `LoadPuzzles`, `UseSudokuSolver`
**Writes to Memory:** loaded puzzle context in ability state

### SetupGridState

**Purpose:** Configure scenario-specific grid preconditions without exposing production internals in step definitions.
**Uses ability:** `UseSudokuSolver`
**Writes to Memory:** target cell/snapshot/validation context in ability state

### AttemptPlacement

**Purpose:** Attempt placing a value and store validation outcome.
**Uses ability:** `UseSudokuSolver`
**Writes to Memory:** `VALIDATION_RESULT`

---

## 4. Questions

### SolveStatus

**Purpose:** Read final solve result string.
**Reads from Memory:** `SOLVE_RESULT`
**Returns:** `string`

### GridCell

**Purpose:** Read current value at a specific row/column.
**Reads from Memory:** current solver grid
**Returns:** `number`

### AlgorithmMadeProgress

**Purpose:** Report whether latest algorithm invocation changed grid state.
**Reads from Memory:** `ALGORITHM_PROGRESS`
**Returns:** `boolean`

### LoadedPuzzleCount

**Purpose:** Return total loaded puzzle count from data source.
**Reads from Memory:** data ability state
**Returns:** `number`

### PlacementValidity

**Purpose:** Return last placement validation outcome.
**Reads from Memory:** `VALIDATION_RESULT`
**Returns:** `string`

### ErrorThrown

**Purpose:** Expose the last captured error for assertions.
**Reads from Memory:** `LAST_ERROR`
**Returns:** `Error | null`

---

## 5. Memory Keys

All memory keys are defined in `tests/screenplay/support/memory-keys.ts`.

| Constant | String value | Written by | Read by |
|----------|-------------|-----------|---------|
| `SOLVE_RESULT` | `'SOLVE_RESULT'` | `SolvePuzzle`, `UseSudokuSolver` | `SolveStatus` |
| `ALGORITHM_PROGRESS` | `'ALGORITHM_PROGRESS'` | `ApplyAlgorithm`, `UseSudokuSolver` | `AlgorithmMadeProgress` |
| `LAST_ERROR` | `'LAST_ERROR'` | `LoadPuzzleByName`, `AttemptPlacement`, abilities | `ErrorThrown` |
| `TARGET_CELL` | `'TARGET_CELL'` | `SetupGridState` | `GridCell`, grid-setup Tasks |
| `GRID_SNAPSHOT` | `'GRID_SNAPSHOT'` | `SetupGridState` | regression-oriented checks |
| `VALIDATION_RESULT` | `'VALIDATION_RESULT'` | `AttemptPlacement` | `PlacementValidity` |

Rule: constant name equals string value exactly (RA §8.1).

---

## 6. Adding a New Scenario

1. Update canonical feature file in `features_shared/`.
2. Propagate the scenario to `tests/features/` and keep `@stack-demoapp001` tag locally.
3. Map each new step to existing Task/Question first.
4. If missing, add Ability API first, then Task, then Question.
5. Implement thin step definitions that delegate to `actor.attemptsTo()` and `actor.answer()`.
6. Run `npm test` and keep all existing scenarios green.

---

## 7. Step Definition Conventions

- One category-focused file per step group (for example `unitCompletion.steps.ts`, `integration.steps.ts`).
- No direct production class instantiation inside step definitions.
- Step files delegate all behavior to Tasks and Questions.
- Assertions should use Question results, not in-step implementation details.

---

Template source: `../../DOCS/templates/TEMPLATE_Screenplay_Guide.md`
