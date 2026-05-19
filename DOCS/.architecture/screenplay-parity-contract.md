# Screenplay Parity Contract

**Last updated:** 2026-05-19
**Stacks covered:** DEMOAPP001_TYPESCRIPT_CYPRESS (current), DEMOAPP002_PYTHON_PYTEST (current), DEMOAPP003_CSHARP_SPECFLOW (planned)
**Governed by:** `decision-register.md` (signature or key changes require a DR entry)

---

## 1. Memory Key Constants

All Stacks MUST define these constants. Constant name MUST equal its string value exactly.

| Key constant | String value | Surface | Written by | Read by |
|-------------|-------------|---------|-----------|---------|
| `SOLVE_RESULT` | `'SOLVE_RESULT'` | @util | `SolvePuzzle`, `UseSudokuSolver` | `SolveStatus` |
| `ALGORITHM_PROGRESS` | `'ALGORITHM_PROGRESS'` | @util | `ApplyAlgorithm` | `AlgorithmMadeProgress` |
| `LAST_ERROR` | `'LAST_ERROR'` | @util | error-producing Tasks/Abilities | `ErrorThrown` |
| `TARGET_CELL` | `'TARGET_CELL'` | @util | `SetupGridState` | `GridCell`, setup Tasks |
| `GRID_SNAPSHOT` | `'GRID_SNAPSHOT'` | @util | `SetupGridState` | regression checks |
| `VALIDATION_RESULT` | `'VALIDATION_RESULT'` | @util | `AttemptPlacement` | `PlacementValidity` |

Adding a new key requires updating this document, Stack memory-key files, and a DR entry.

---

## 2. Actor Contract

| Method | Signature shape | All Stacks must implement |
|--------|-----------------|---------------------------|
| Create | `Actor.named(label)` or framework equivalent | Yes |
| Equip | `actor.whoCan(ability, ...)` or equivalent | Yes |
| Execute | `actor.attemptsTo(task, ...)` | Yes |
| Query | `actor.answer(question)` | Yes |
| Remember | `actor.remember(key, value)` or equivalent | Yes |
| Recall | `actor.recall(key)` or equivalent | Yes |
| Reset | Memory cleared between scenarios | Yes |

---

## 3. Ability Signatures

### UseSudokuSolver

| Stack | Factory | Retrieval |
|------|---------|-----------|
| TypeScript (current) | `new UseSudokuSolver()` | `UseSudokuSolver.as(actor)` |
| Python (current) | `UseSudokuSolver()` | `actor.ability_to(UseSudokuSolver)` |
| C# (planned) | `new UseSudokuSolver()` | framework actor ability lookup |

**Normative interface (BACKLOG-023 — slimmed, 2026-05-18):**

| Method | Purpose |
|--------|---------|
| `initialise(name, grid?)` | Create fresh SudokuSolver |
| `getSolver()` | Access the live SudokuSolver instance |
| `applyUnitCompletion()` | Invoke solver.unitCompletion() |
| `applyHiddenSingles(target)` | Invoke solver.hiddenSingles(target) |
| `applyNakedSingles()` | Invoke solver.nakedSingles() |
| `solvePuzzle()` | Invoke orchestrator.solve() |
| `isGridFull()` | Delegate to orchestrator |
| Cross-step state setters | `setTargetCell`, `setTargetValue`, `takeSnapshot`, `storeSnapshot`, `reinitialiseFromSnapshot`, `validateAndStore`, `setMultipleSolvers`, `setSolverError` |
| Read-only accessors | `algorithmMadeProgress`, `result`, `targetCell`, `targetValue`, `gridSnapshot`, `validationResult`, `multipleSolvers`, `solverError` |

Grid setup helpers now live under each Stack's Screenplay fixture layer, such as
`tests/screenplay/fixtures/GridFixtures.ts` in DEMOAPP001 and
`tests/screenplay/fixtures/grid_fixtures.py` in DEMOAPP002. Tasks obtain the
solver via the Stack Ability and pass it to the relevant fixture function.

Validation logic (`isValidPlacement`, `noConstraintViolations`, `isValidSolution`) is now on
`SudokuSolver` (app_src) as public methods.

### LoadPuzzles

| Stack | Factory | Retrieval |
|------|---------|-----------|
| TypeScript (current) | `LoadPuzzles.from(filePath)` | `LoadPuzzles.as(actor)` |
| Python (current) | `LoadPuzzles.from_path(path)` | `actor.ability_to(LoadPuzzles)` |
| C# (planned) | `LoadPuzzles.From(path)` | framework actor ability lookup |

---

## 4. Task Signatures

| Task | Factory shape | Execution | Ability required | Memory written |
|------|---------------|-----------|------------------|----------------|
| `InitialiseGrid` | `empty()` / `fromPuzzle(name, grid)` / setup variants | `performAs(actor)` | `UseSudokuSolver` | task-specific setup state |
| `ApplyAlgorithm` | `called(name)` | `performAs(actor)` | `UseSudokuSolver` | `ALGORITHM_PROGRESS` |
| `SolvePuzzle` | `usingCurrentSolver()` / equivalent | `performAs(actor)` | `UseSudokuSolver` | `SOLVE_RESULT` |
| `LoadPuzzleByName` | `named(name)` | `performAs(actor)` | `LoadPuzzles`, `UseSudokuSolver` | `LAST_ERROR` on failures |
| `SetupGridState` | scenario-focused factory methods | `performAs(actor)` | `UseSudokuSolver` | `TARGET_CELL`, `GRID_SNAPSHOT` |
| `AttemptPlacement` | `atTarget()` / value variants | `performAs(actor)` | `UseSudokuSolver` | `VALIDATION_RESULT`, `LAST_ERROR` |

---

## 5. Question Signatures

| Question | Factory shape | Execution | Returns | Memory read |
|----------|---------------|-----------|---------|-------------|
| `SolveStatus` | `current()` | `answeredBy(actor)` | `string` | `SOLVE_RESULT` |
| `GridCell` | `at(row, col)` | `answeredBy(actor)` | `number` | current grid state |
| `AlgorithmMadeProgress` | `afterLastCall()` | `answeredBy(actor)` | `boolean` | `ALGORITHM_PROGRESS` |
| `LoadedPuzzleCount` | `current()` | `answeredBy(actor)` | `number` | loader ability state |
| `PlacementValidity` | `current()` | `answeredBy(actor)` | `string` | `VALIDATION_RESULT` |
| `ErrorThrown` | `last()` | `answeredBy(actor)` | `Error \| null` | `LAST_ERROR` |

---

## 6. Step Definition Shape Contract

All Stacks MUST keep canonical Gherkin step text identical to `features-shared/`.

Canonical examples:

```gherkin
Given a standard 9x9 Sudoku grid is initialized
Given row {int} is missing the number {int}
When the {string} algorithm is executed for value {int}
Then the system should place {int} in the only valid cell in row {int}
```

If a Stack cannot implement a scenario, it MUST tag the local copy `@pending` and record the gap in `DOCS/.planning/backlog.md`.

---

## 7. Parity Verification Checklist

- [ ] Memory key constants match name/value parity exactly
- [ ] Task factory and execution shapes align with this contract
- [ ] Question factory and return type shapes align with this contract
- [ ] Canonical step text is unchanged in all Stack-local feature copies
- [ ] Any `@pending` scenario has a corresponding backlog item
- [ ] Scenario isolation is verified (no state leakage)

---

Template source: `../templates/parity-contract.template.md`
