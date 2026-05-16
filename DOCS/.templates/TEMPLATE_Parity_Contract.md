# TEMPLATE — Screenplay Parity Contract

**Intended audience:** Architects and engineers onboarding a new Stack; parity auditors.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.3, §8
**Produces:** `DOCS/.architecture/screenplay-parity-contract.md`

---

## How to Use This Template

- Author this document when the first Stack's Screenplay layer is complete (after Phase 4).
- Update when any component signature, Memory key, or step shape changes.
- Any change MUST be recorded in `DECISION_REGISTER.md` and applied to all Stacks simultaneously.

---

```markdown
# Screenplay Parity Contract

**Last updated:** YYYY-MM-DD [REQUIRED]
**Stacks covered:** [List all Stack names] [REQUIRED]
**Governed by:** `DECISION_REGISTER.md` (all signature changes require a DR entry)

---

## 1. Memory Key Constants [REQUIRED]

All Stacks MUST define these constants. Constant name MUST equal its string value exactly.

| Key constant | String value | Surface | Written by | Read by |
|-------------|-------------|---------|-----------|---------|
| `SOLVE_RESULT` | `'SOLVE_RESULT'` | @util | `SolvePuzzle` | `SolveStatus` |
| `ALGORITHM_PROGRESS` | `'ALGORITHM_PROGRESS'` | @util | `ApplyAlgorithm` | `AlgorithmMadeProgress` |
| `LAST_ERROR` | `'LAST_ERROR'` | @util | Error Tasks | `ErrorThrown` |
| `TARGET_CELL` | `'TARGET_CELL'` | @util | Setup Tasks | `GridCell` |
| `GRID_SNAPSHOT` | `'GRID_SNAPSHOT'` | @util | Setup Tasks | Assertion Questions |
| `VALIDATION_RESULT` | `'VALIDATION_RESULT'` | @util | `AttemptPlacement` | `PlacementValidity` |

**Adding a new key:** Update this table AND the Stack's `screenplay/support/memory-keys` file. DR entry required.

---

## 2. Actor Contract [REQUIRED]

| Method | Signature | All Stacks must implement |
|--------|-----------|--------------------------|
| Create | `Actor.named(label)` or Cast equivalent | Yes |
| Equip | `actor.whoCan(ability, ...)` | Yes |
| Execute | `actor.attemptsTo(task, ...)` | Yes |
| Query | `actor.answer(question)` | Yes |
| Remember | `actor.remember(key, value)` | Yes |
| Recall | `actor.recall(key)` | Yes |
| Reset | Memory cleared per scenario | Yes |

---

## 3. Ability Signatures [REQUIRED]

### [AbilityName]

| Language | Factory method | Retrieval |
|----------|---------------|-----------|
| TypeScript | `new UseSudokuSolver()` | `actor.abilityTo(UseSudokuSolver)` |
| Python | `UseSudokuSolver()` | `actor.solver_ability` |
| C# | `new UseSudokuSolver()` | `actor.FindAbility<UseSudokuSolver>()` |

---

## 4. Task Signatures [REQUIRED]

| Task | Factory | Execution | Ability required | Memory written |
|------|---------|-----------|-----------------|---------------|
| `InitialiseGrid` | `InitialiseGrid.empty()` / `.withRowValues(...)` / `.fromPuzzle(...)` | `performAs(actor)` | `UseSudokuSolver` | — |
| `ApplyAlgorithm` | `ApplyAlgorithm.called('UnitCompletion')` | `performAs(actor)` | `UseSudokuSolver` | `ALGORITHM_PROGRESS` |
| `SolvePuzzle` | `SolvePuzzle.named(puzzleName)` | `performAs(actor)` | `UseSudokuSolver`, `LoadPuzzles` | `SOLVE_RESULT` |

[Add rows for all Tasks]

---

## 5. Question Signatures [REQUIRED]

| Question | Factory | Execution | Returns | Memory read |
|----------|---------|-----------|---------|------------|
| `SolveStatus` | `SolveStatus.current()` | `answeredBy(actor)` | `string` | `SOLVE_RESULT` |
| `GridCell` | `GridCell.at(row, col)` | `answeredBy(actor)` | `number` | — |
| `AlgorithmMadeProgress` | `AlgorithmMadeProgress.afterLastCall()` | `answeredBy(actor)` | `boolean` | `ALGORITHM_PROGRESS` |

[Add rows for all Questions]

---

## 6. Step Definition Shape Contract [REQUIRED]

All Stacks MUST use identical Gherkin step text. The following examples are canonical:

```gherkin
Given a standard 9x9 Sudoku grid is initialized
Given row {int} is missing the number {int}
When the {string} algorithm is executed for value {int}
Then the system should place {int} in the only valid cell in row {int}
```

Deviations: none permitted. If a step cannot be implemented in a Stack, tag it `@pending` and record in `DOCS/.planning/BACKLOG.md`.

---

## 7. Parity Verification Checklist

Run this checklist before marking a new Stack as in parity:

```
[ ] All Memory key constants defined with correct string values
[ ] All Task factory and execution method names match this contract
[ ] All Question factory and execution method names match this contract
[ ] All Gherkin step text matches canonical feature files exactly
[ ] No @pending scenarios without a BACKLOG.md entry
[ ] Memory cleared between scenarios (verified by test isolation)
```
```
