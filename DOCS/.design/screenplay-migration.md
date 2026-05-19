# Screenplay Pattern Migration — Design Document

**Version:** v1.0
**Date:** 2026-05-14T11:00Z
**Author:** AI assistant (CLAUDE Sonnet 4.6)
**Status:** Approved

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis](#2-problem-analysis)
3. [Screenplay Pattern Primer](#3-screenplay-pattern-primer)
4. [Mapping: Current Tests to Screenplay](#4-mapping-current-tests-to-screenplay)
5. [Detailed Design](#5-detailed-design)
6. [Multi-Stack Parity](#6-multi-stack-parity)
7. [Implementation Plan](#7-implementation-plan)
8. [Testing Strategy](#8-testing-strategy)
9. [Alternatives Considered](#9-alternatives-considered)
10. [Open Questions](#10-open-questions)

---

## 1. Executive Summary

The project currently has 43 Gherkin scenarios backed by procedural Cucumber.js step
definitions in a single `SudokuWorld` class. This design is functional but does not
scale: adding scenarios means adding more procedural state to the World object, and
reuse across languages (Python, C#) requires duplicating step logic independently.

The **Screenplay pattern** replaces procedural steps with composable, intent-revealing
building blocks:

| Concept | Role | Sudoku Example |
|---------|------|----------------|
| **Actor** | Who performs the action | `AnAutomatedSolver` |
| **Ability** | What the actor can do | `UseSudokuSolver`, `LoadPuzzles` |
| **Task** | High-level business goal | `SolvePuzzleWith.technique('Unit Completion')` |
| **Action** | Low-level atomic interaction | `InitialiseGrid.withRow([1,2,0,...])` |
| **Question** | Query observable state | `SolveStatus.current()`, `Grid.cellAt(4, 4)` |

**Benefits delivered:**
- Step definitions become single-line delegations — no more growing World objects
- Tasks and Questions are reusable across scenarios and across language stacks
- Gherkin remains identical; only the backing implementation changes
- The same Actor vocabulary works in Serenity/JS (TS), Serenity/Core (Java), and
  equivalent patterns in Python and C#

---

## 2. Problem Analysis

### 2.1 Current Architecture

```
BasicSudokuSolverLogic.feature
         |
   cucumber.js config
         |
 solver_steps.ts  ←─── SudokuWorld (holds all mutable state)
         |
 SudokuSolver / SudokuOrchestrator / PuzzleLoader  (production code)
```

`SudokuWorld` currently stores:
```typescript
// tests/step_definitions/solver_steps.ts
class SudokuWorld extends World {
  solver: SudokuSolver;        // mutable, rebuilt per scenario
  loader: PuzzleLoader | null;
  lastChanged: boolean;
  solveResult: string;
  lastError: Error | null;
  gridSnapshot: number[][];
  validationResult: string;
  targetCell: { row, col };
  targetValue: number;
  multipleSolvers: SudokuSolver[];
}
```

### 2.2 Problems With the Current Approach

| Problem | Evidence | Consequence |
|---------|---------|-------------|
| **Accidental state coupling** | `targetCell` set in one Given, read in a later Then | Steps break if step order changes |
| **Monolithic world class** | 9 fields, 8 helpers, 600+ lines in one file | Hard to navigate; single-file bottleneck |
| **No cross-language reuse** | Python / C# step defs must duplicate all logic | Same bugs fixed in 3 places |
| **Low expressiveness** | `this.lastChanged = this.solver.unitCompletion()` | Intent buried in implementation |
| **Weak SOLID compliance** | World handles data loading, grid setup, algorithm invocation | Violates SRP |

### 2.3 Goals

1. Replace `SudokuWorld` state juggling with explicit Screenplay Tasks and Questions
2. Keep all 43 Gherkin scenarios **unchanged** — this is a refactor, not a redesign
3. Enable the same Actor vocabulary to be expressed in TypeScript, Python, and C#
4. Improve step definition readability so a mid-level tester can understand intent
   without reading production code

---

## 3. Screenplay Pattern Primer

> The Screenplay pattern was formalised by Antony Marcano and Andy Palmer. It builds
> on SOLID principles to make test code as maintainable as production code.

### 3.1 Core Vocabulary

```
Actor ──has──> Ability  (what they CAN do)
     ──does──> Task     (what they DO — composed of Actions)
     ──asks──> Question (what they OBSERVE — returns a value)

Task ──calls──> Action  (smallest reusable interaction unit)
```

### 3.2 Vocabulary Applied to This Project

```
AnAutomatedSolver                     ← Actor (the test persona)
  │
  ├── Ability: UseSudokuSolver        ← wraps SudokuSolver instance
  ├── Ability: LoadPuzzles            ← wraps PuzzleLoader
  │
  ├── Task: SolvePuzzle               ← calls orchestrator.solve()
  ├── Task: ApplyAlgorithm            ← calls solver.unitCompletion() etc.
  ├── Task: InitialiseGrid            ← calls new SudokuSolver(name, grid)
  ├── Task: LoadPuzzleByName          ← calls loader.getPuzzleByName()
  │
  └── Question: SolveStatus           ← reads orchestrator result string
      Question: GridCell              ← reads solver.grid[row][col]
      Question: AlgorithmMadeProgress ← reads the boolean return value
      Question: LoadedPuzzleCount     ← reads loader.getPuzzleCount()
```

### 3.3 Why This Works for Sudoku

The Sudoku solver is **completely deterministic** — the same input always produces the
same sequence of moves. This makes it an ideal test subject for Screenplay because:
- Questions always return stable, assertable values
- Tasks compose cleanly without side-effect ambiguity
- The Actor models a "solver agent" rather than a UI user, which is the natural
  abstraction for algorithm testing

---

## 4. Mapping: Current Tests to Screenplay

### 4.1 Scenario Category → Task/Question Map

| Gherkin Category | Tasks Used | Questions Used |
|-----------------|-----------|---------------|
| Unit Completion (4 scenarios) | `InitialiseGrid`, `ApplyAlgorithm` | `AlgorithmMadeProgress`, `GridCell` |
| Hidden Singles (5 scenarios) | `InitialiseGrid`, `ApplyAlgorithm` | `AlgorithmMadeProgress`, `GridCell`, `RowContains` |
| Naked Singles (3 scenarios) | `InitialiseGrid`, `ApplyAlgorithm` | `AlgorithmMadeProgress`, `GridCell` |
| Constraint Validation (8 examples) | `InitialiseGrid`, `SetupGridState`, `AttemptPlacement` | `PlacementValidity` |
| Orchestration (5 scenarios) | `LoadPuzzle`, `SolvePuzzle` | `SolveStatus`, `AlgorithmExecutionOrder` |
| PuzzleLoader (7 scenarios) | `LoadPuzzlesFrom`, `RequestPuzzle` | `LoadedPuzzleCount`, `PuzzleByName`, `ErrorThrown` |
| Grid Initialization (2 scenarios) | `InitialiseGrid` | `GridMatchesOriginal`, `GridDiffersFrom` |
| Integration (5 scenarios) | `LoadPuzzle`, `SolvePuzzle` | `SolveStatus`, `AllCellsFilled`, `SolutionIsValid` |
| Edge Cases (4 scenarios) | `InitialiseInvalidGrid`, `ApplyAlgorithm` | `ErrorThrown`, `AlgorithmMadeProgress` |

### 4.2 Step Definition Transformation — Before and After

#### Before (procedural SudokuWorld)

```typescript
// solver_steps.ts — current approach
Given('a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]',
  function (this: SudokuWorld) {
    const values = [1, 2, 0, 4, 5, 6, 7, 8, 9];
    for (let col = 0; col < GRID_SIZE; col++) {
      this.solver.grid[0][col] = values[col];         // direct mutation
    }
    this.gridSnapshot = copyGrid(this.solver.grid);   // save state for later
  });

When('the "Unit Completion" algorithm scans the row',
  function (this: SudokuWorld) {
    this.lastChanged = this.solver.unitCompletion();  // result stored in World
  });

Then('the value 3 should be placed in the empty cell',
  function (this: SudokuWorld) {
    const found = this.solver.grid.some(row => row.includes(3));
    assert.ok(found, 'Expected value 3 to be placed in the grid');
  });
```

**Problems:** 3 separate fields (`grid`, `gridSnapshot`, `lastChanged`) must stay
in sync; intent ("unit completion scans a nearly-complete row") is buried.

#### After (Screenplay)

```typescript
// steps/unitCompletionSteps.ts — Screenplay approach
Given('a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]',
  async () => {
    await actor.attemptsTo(
      InitialiseGrid.withRowValues({ row: 0, values: [1, 2, 0, 4, 5, 6, 7, 8, 9] })
    );
  });

When('the "Unit Completion" algorithm scans the row',
  async () => {
    await actor.attemptsTo(
      ApplyAlgorithm.called('UnitCompletion')
    );
  });

Then('the value 3 should be placed in the empty cell',
  async () => {
    await actor.attemptsTo(
      Ensure.that(Grid.containsValue(3), isTrue())
    );
  });
```

**Benefits:** No World state; each step reads as plain English; `ApplyAlgorithm`
and `Grid.containsValue` are reusable across all algorithm scenarios.

---

## 5. Detailed Design

### 5.1 Directory Structure

```
demo-apps/demoapp001-typescript-cypress/
├── app_src/                           (unchanged production code)
├── tests/
│   ├── BasicSudokuSolverLogic.feature (unchanged — Gherkin does not change)
│   └── screenplay/                    (NEW — Screenplay layer)
│       ├── actors/
│       │   └── SudokuActors.ts        Actor factory (AnAutomatedSolver)
│       ├── abilities/
│       │   ├── UseSudokuSolver.ts     Wraps SudokuSolver + SudokuOrchestrator
│       │   └── LoadPuzzles.ts         Wraps PuzzleLoader
│       ├── tasks/
│       │   ├── InitialiseGrid.ts
│       │   ├── ApplyAlgorithm.ts
│       │   ├── SolvePuzzle.ts
│       │   ├── LoadPuzzleByName.ts
│       │   ├── SetupGridState.ts
│       │   └── AttemptPlacement.ts
│       ├── questions/
│       │   ├── SolveStatus.ts
│       │   ├── GridCell.ts
│       │   ├── AlgorithmMadeProgress.ts
│       │   ├── LoadedPuzzleCount.ts
│       │   ├── PlacementValidity.ts
│       │   └── ErrorThrown.ts
│       └── step_definitions/
│           ├── background.steps.ts
│           ├── unitCompletion.steps.ts
│           ├── hiddenSingles.steps.ts
│           ├── nakedSingles.steps.ts
│           ├── constraintValidation.steps.ts
│           ├── orchestration.steps.ts
│           ├── puzzleLoader.steps.ts
│           ├── gridInitialisation.steps.ts
│           ├── integration.steps.ts
│           └── edgeCases.steps.ts
```

> **Rationale (SRP):** Each step definitions file owns exactly one scenario category.
> Adding a new category means adding one file, not extending a 600-line monolith.

### 5.2 Abilities

Abilities wrap the production code surface. An Actor **has** an Ability; they never
instantiate production classes directly in step definitions.

```typescript
// tests/screenplay/abilities/UseSudokuSolver.ts

import { Ability, Actor } from '@serenity-js/core';
import { SudokuSolver } from '../../app_src/SudokuSolver';
import { SudokuOrchestrator } from '../../app_src/SudokuOrchestrator';

/**
 * Ability: UseSudokuSolver
 *
 * Encapsulates the lifetime of a SudokuSolver + SudokuOrchestrator pair.
 * An actor that HAS this ability can initialise grids, apply algorithms,
 * and run the full solving loop.
 *
 * Design note: Abilities are the only place in the Screenplay layer that
 * directly imports production classes. This is intentional — it is the
 * Dependency Inversion boundary.
 */
export class UseSudokuSolver implements Ability {
  private solver: SudokuSolver | null = null;
  private lastAlgorithmChanged: boolean = false;
  private solveResult: string = '';

  static as(actor: Actor): UseSudokuSolver {
    return actor.abilityTo(UseSudokuSolver);
  }

  initialise(name: string, grid?: number[][]): void {
    this.solver = new SudokuSolver(name, grid);
  }

  getSolver(): SudokuSolver {
    if (!this.solver) throw new Error('Solver not initialised — call InitialiseGrid first');
    return this.solver;
  }

  applyUnitCompletion(): void {
    this.lastAlgorithmChanged = this.getSolver().unitCompletion();
  }

  applyHiddenSingles(target: number): void {
    this.lastAlgorithmChanged = this.getSolver().hiddenSingles(target);
  }

  applyNakedSingles(): void {
    this.lastAlgorithmChanged = this.getSolver().nakedSingles();
  }

  solvePuzzle(): void {
    const orchestrator = new SudokuOrchestrator(this.getSolver());
    this.solveResult = orchestrator.solve();
  }

  get algorithmMadeProgress(): boolean { return this.lastAlgorithmChanged; }
  get result(): string { return this.solveResult; }
}
```

```typescript
// tests/screenplay/abilities/LoadPuzzles.ts

import { Ability, Actor } from '@serenity-js/core';
import { PuzzleLoader, Puzzle } from '../../app_src/PuzzleLoader';
import * as path from 'path';

/**
 * Ability: LoadPuzzles
 *
 * Wraps PuzzleLoader to give an actor access to the puzzle data source.
 * The path is resolved once at construction; all queries are read-only.
 */
export class LoadPuzzles implements Ability {
  private loader: PuzzleLoader;
  private lastError: Error | null = null;

  static as(actor: Actor): LoadPuzzles {
    return actor.abilityTo(LoadPuzzles);
  }

  static from(filePath: string): LoadPuzzles {
    return new LoadPuzzles(filePath);
  }

  private constructor(filePath: string) {
    try {
      this.loader = new PuzzleLoader(path.resolve(__dirname, '../../', filePath));
    } catch (e) {
      this.lastError = e as Error;
      this.loader = null as unknown as PuzzleLoader;
    }
  }

  getByName(name: string): Puzzle | undefined {
    return this.loader?.getPuzzleByName(name);
  }

  getCount(): number { return this.loader?.getPuzzleCount() ?? 0; }
  getError(): Error | null { return this.lastError; }
}
```

### 5.3 Tasks

Tasks are the **verbs** — what the actor does. Each Task is a small, named unit that
composes one or more lower-level interactions.

```typescript
// tests/screenplay/tasks/InitialiseGrid.ts

import { Task, Actor } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { GRID_SIZE, EMPTY_CELL } from '../../app_src/constants';

/**
 * Task: InitialiseGrid
 *
 * Creates a new SudokuSolver with either an empty grid or a specific row/column
 * pre-populated. Use the fluent factory methods to build the right variant.
 *
 * Examples:
 *   InitialiseGrid.empty()
 *   InitialiseGrid.withRowValues({ row: 0, values: [1,2,0,4,5,6,7,8,9] })
 *   InitialiseGrid.fromPuzzle(puzzle)
 */
export class InitialiseGrid implements Task {
  static empty(): Task {
    return new InitialiseGrid('empty', null);
  }

  static withRowValues(options: { row: number; values: number[] }): Task {
    const grid = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(EMPTY_CELL)
    );
    grid[options.row] = [...options.values];
    return new InitialiseGrid('rowSetup', grid);
  }

  static fromPuzzle(puzzle: { name: string; grid: number[][] }): Task {
    return new InitialiseGrid(puzzle.name, puzzle.grid);
  }

  private constructor(
    private readonly name: string,
    private readonly grid: number[][] | null
  ) {}

  async performAs(actor: Actor): Promise<void> {
    UseSudokuSolver.as(actor).initialise(
      this.name,
      this.grid ?? undefined
    );
  }
}
```

```typescript
// tests/screenplay/tasks/ApplyAlgorithm.ts

import { Task, Actor } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

type AlgorithmName = 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';

/**
 * Task: ApplyAlgorithm
 *
 * Invokes one of the three basic solving algorithms on the current grid.
 * For HiddenSingles, a target digit must be supplied.
 *
 * Design note: The algorithm name is a string enum so that Gherkin steps can
 * pass the algorithm name directly (matching the feature file phrasing) without
 * a mapping table in the step definition.
 */
export class ApplyAlgorithm implements Task {
  static called(name: 'UnitCompletion'): Task;
  static called(name: 'HiddenSingles', forDigit: number): Task;
  static called(name: 'NakedSingles'): Task;
  static called(name: AlgorithmName, forDigit?: number): Task {
    return new ApplyAlgorithm(name, forDigit);
  }

  private constructor(
    private readonly name: AlgorithmName,
    private readonly digit?: number
  ) {}

  async performAs(actor: Actor): Promise<void> {
    const ability = UseSudokuSolver.as(actor);
    switch (this.name) {
      case 'UnitCompletion': return ability.applyUnitCompletion();
      case 'HiddenSingles':  return ability.applyHiddenSingles(this.digit!);
      case 'NakedSingles':   return ability.applyNakedSingles();
    }
  }
}
```

```typescript
// tests/screenplay/tasks/SolvePuzzle.ts

import { Task, Actor } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';

/**
 * Task: SolvePuzzle
 *
 * Composes LoadPuzzle + InitialiseGrid + run orchestrator into one high-level
 * task. Used by integration tests that want to say:
 *   "actor.attemptsTo(SolvePuzzle.named('Easy Scan Grid'))"
 *
 * Design note: Composing sub-Tasks inside a Task is the Screenplay equivalent
 * of calling helper methods. It keeps integration scenarios one-liners.
 */
export class SolvePuzzle implements Task {
  static named(puzzleName: string): Task {
    return new SolvePuzzle(puzzleName);
  }

  private constructor(private readonly puzzleName: string) {}

  async performAs(actor: Actor): Promise<void> {
    const puzzle = LoadPuzzles.as(actor).getByName(this.puzzleName);
    if (!puzzle) throw new Error(`Puzzle not found: ${this.puzzleName}`);
    UseSudokuSolver.as(actor).initialise(puzzle.name, puzzle.grid);
    UseSudokuSolver.as(actor).solvePuzzle();
  }
}
```

### 5.4 Questions

Questions return observable state — they never change state. This keeps assertions
clean and separates the "act" phase from the "assert" phase.

```typescript
// tests/screenplay/questions/SolveStatus.ts

import { Question, Actor } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Question: SolveStatus
 *
 * Returns the string result of the last solve attempt:
 *   "SOLVED" | "STUCK_ON_ADVANCED_LOGIC"
 *
 * Usage in step definition:
 *   expect(await actor.answer(SolveStatus.current())).toBe('SOLVED');
 */
export const SolveStatus = {
  current: (): Question<string> =>
    Question.about('the solve status', (actor: Actor) =>
      UseSudokuSolver.as(actor).result
    ),
};
```

```typescript
// tests/screenplay/questions/AlgorithmMadeProgress.ts

import { Question, Actor } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Question: AlgorithmMadeProgress
 *
 * Returns true if the most recently applied algorithm changed at least one cell.
 * Maps to the boolean return value of unitCompletion() / hiddenSingles() / nakedSingles().
 */
export const AlgorithmMadeProgress = {
  afterLastCall: (): Question<boolean> =>
    Question.about('whether the algorithm made progress', (actor: Actor) =>
      UseSudokuSolver.as(actor).algorithmMadeProgress
    ),
};
```

```typescript
// tests/screenplay/questions/GridCell.ts

import { Question, Actor } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';

/**
 * Question: GridCell
 *
 * Returns the current value of a specific cell in the working grid.
 * Value 0 means empty; 1-9 means filled.
 *
 * Usage:
 *   expect(await actor.answer(GridCell.at(4, 4))).toBe(9);
 */
export const GridCell = {
  at: (row: number, col: number): Question<number> =>
    Question.about(`grid cell [${row},${col}]`, (actor: Actor) =>
      UseSudokuSolver.as(actor).getSolver().grid[row][col]
    ),

  containsValue: (value: number): Question<boolean> =>
    Question.about(`grid contains ${value}`, (actor: Actor) =>
      UseSudokuSolver.as(actor).getSolver().grid
        .some(r => r.includes(value))
    ),
};
```

### 5.5 Actor Factory

```typescript
// tests/screenplay/actors/SudokuActors.ts

import { Actor, Cast } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import * as path from 'path';

const PUZZLES_PATH = path.resolve(__dirname, '../../../puzzles.json');

/**
 * SudokuActors: Cast implementation for Screenplay.
 *
 * The Cast is responsible for equipping each Actor with the right Abilities.
 * In this domain there is a single actor persona: "An Automated Solver".
 * All scenarios use this actor — it is re-created fresh per scenario via
 * Serenity/JS's automatic crew reset.
 *
 * Design note: Using a Cast (rather than constructing actors inline) means
 * that all ability configuration lives in one place. Adding a new Ability
 * (e.g., WriteAuditLog) only requires changing this file.
 */
export const SudokuActors: Cast = {
  prepare(actor: Actor): Actor {
    return actor.whoCan(
      new UseSudokuSolver(),
      LoadPuzzles.from(PUZZLES_PATH),
    );
  },
};
```

### 5.6 Example Step Definitions File (Integration Tests)

```typescript
// tests/screenplay/step_definitions/integration.steps.ts

import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';
import { SolvePuzzle } from '../tasks/SolvePuzzle';
import { SolveStatus } from '../questions/SolveStatus';
import { GridCell } from '../questions/GridCell';
import { equals, isTrue } from '@serenity-js/assertions';

/**
 * Integration step definitions — full solve scenarios.
 *
 * Each step is a single delegation to a Task or Question. The intent is
 * readable at a glance without knowledge of the production codebase.
 */

Given('the puzzle {string} is loaded from JSON',
  async (puzzleName: string) => {
    await actorCalled('Solver').attemptsTo(
      SolvePuzzle.named(puzzleName)
    );
  });

// Note: SolvePuzzle loads AND solves — this When step is a no-op because
// the Task already performed the solve. We keep the step for Gherkin readability.
When('the solver attempts to solve it', async () => { /* delegated to Given */ });

Then('the status should be {string}',
  async (expectedStatus: string) => {
    await actorCalled('Solver').attemptsTo(
      Ensure.that(SolveStatus.current(), equals(expectedStatus))
    );
  });

Then('all cells should be filled',
  async () => {
    await actorCalled('Solver').attemptsTo(
      Ensure.that(GridCell.allFilled(), isTrue())
    );
  });
```

---

## 6. Multi-Stack Parity

A key project goal is that the same Gherkin feature file runs across TypeScript,
Python, and C# implementations. Screenplay pattern enables this:

### 6.1 TypeScript — Serenity/JS

- **Library:** `@serenity-js/core`, `@serenity-js/cucumber`
- **Assertion:** `@serenity-js/assertions` (`Ensure.that(Q, matcher)`)
- **Actor reset:** automatic per scenario via `@serenity-js/cucumber` hooks

### 6.2 Python — pytest-bdd + Screenplay-style

Python lacks a formal Screenplay library, but the same conceptual separation is
achievable using dataclasses and pytest fixtures:

```python
# tests/screenplay/abilities/use_sudoku_solver.py
from dataclasses import dataclass, field
from app_src.sudoku_solver import SudokuSolver
from app_src.sudoku_orchestrator import SudokuOrchestrator

@dataclass
class UseSudokuSolver:
    """Ability: wraps the solver domain for an actor."""
    _solver: SudokuSolver | None = field(default=None, repr=False)
    _last_changed: bool = False
    _solve_result: str = ''

    def initialise(self, name: str, grid=None):
        self._solver = SudokuSolver(name, grid)

    def apply_unit_completion(self):
        self._last_changed = self._solver.unit_completion()

    def solve_puzzle(self):
        orch = SudokuOrchestrator(self._solver)
        self._solve_result = orch.solve()

    @property
    def algorithm_made_progress(self): return self._last_changed
    @property
    def result(self): return self._solve_result
```

```python
# tests/screenplay/actors/sudoku_actors.py
import pytest
from .abilities.use_sudoku_solver import UseSudokuSolver
from .abilities.load_puzzles import LoadPuzzles

@pytest.fixture
def actor():
    """Actor fixture — reset per scenario by pytest."""
    class Actor:
        solver_ability = UseSudokuSolver()
        puzzle_ability = LoadPuzzles('puzzles.json')
    return Actor()
```

Step definitions then delegate to `actor.solver_ability.apply_unit_completion()` —
identical intent to the TypeScript version, different syntax.

### 6.3 C# — SpecFlow + Screenplay-style

SpecFlow has Screenplay support via community packages. The same vocabulary maps to:

```csharp
// Abilities/UseSudokuSolver.cs
public class UseSudokuSolver : IAbility
{
    private SudokuSolver? _solver;
    private bool _lastChanged;
    private string _solveResult = string.Empty;

    public static UseSudokuSolver As(IActor actor) =>
        actor.FindAbility<UseSudokuSolver>();

    public void Initialise(string name, int[][]? grid = null)
        => _solver = new SudokuSolver(name, grid);

    public void ApplyUnitCompletion()
        => _lastChanged = _solver!.UnitCompletion();

    public bool AlgorithmMadeProgress => _lastChanged;
    public string Result => _solveResult;
}
```

```csharp
// Tasks/SolvePuzzle.cs
public class SolvePuzzle : ITask
{
    private readonly string _puzzleName;
    public static ITask Named(string name) => new SolvePuzzle(name);
    private SolvePuzzle(string name) => _puzzleName = name;

    public void PerformAs(IActor actor)
    {
        var puzzle = LoadPuzzles.As(actor).GetByName(_puzzleName);
        UseSudokuSolver.As(actor).Initialise(puzzle.Name, puzzle.Grid);
        UseSudokuSolver.As(actor).SolvePuzzle();
    }
}
```

### 6.4 Parity Summary

| Concept | TypeScript (Serenity/JS) | Python (pytest) | C# (SpecFlow) |
|---------|------------------------|----------------|---------------|
| Actor | `actorCalled('Solver')` | `actor` fixture | `Actor.Named("Solver")` |
| Ability | `class X implements Ability` | `@dataclass` | `class X : IAbility` |
| Task | `class X implements Task` | function / class | `class X : ITask` |
| Question | `Question.about(...)` | property / function | `class X : IQuestion<T>` |
| Assertion | `Ensure.that(Q, equals(x))` | `assert actor.ability.prop == x` | `actor.AskFor(Q).Should().Be(x)` |

The Gherkin feature file `BasicSudokuSolverLogic.feature` is **shared across all three
stacks unchanged**. Only step definition files differ — and they all read as
intent-revealing delegations to the same Screenplay vocabulary.

---

## 7. Implementation Plan

### Phase 1 — Foundation (2-3h)
- Install `@serenity-js/core` and `@serenity-js/cucumber`
- Create the `tests/screenplay/` directory structure
- Implement `UseSudokuSolver` and `LoadPuzzles` Abilities
- Implement `SudokuActors` Cast
- Update `cucumber.js` to load Serenity/JS hooks

### Phase 2 — Core Tasks and Questions (4-6h)
- Implement all Tasks: `InitialiseGrid`, `ApplyAlgorithm`, `SolvePuzzle`,
  `LoadPuzzleByName`, `SetupGridState`, `AttemptPlacement`
- Implement all Questions: `SolveStatus`, `GridCell`, `AlgorithmMadeProgress`,
  `LoadedPuzzleCount`, `PlacementValidity`, `ErrorThrown`

### Phase 3 — Step Definition Migration (4-6h)
- Replace `tests/step_definitions/solver_steps.ts` with 10 focused files
- Each file owns one scenario category (Unit Completion, Hidden Singles, etc.)
- Run `npm test` — all 43 scenarios must continue to pass

### Phase 4 — HTML Report and Serenity BDD (1-2h)
- Enable `@serenity-js/serenity-bdd` reporter
- Generate living documentation from the Gherkin scenarios
- Add `npm run serenity:report` script to `package.json`

### Phase 5 — Python Parity (Sprint 3, separate task)
- Implement Python Screenplay-style abilities and step definitions
- Share the same `.feature` file
- Run with `pytest-bdd`

### Phase 6 — C# Parity (Sprint 4, separate task)
- Implement C# Screenplay-style abilities and step definitions
- Run with SpecFlow
- Validate cross-language scenario parity

### Effort Estimate

| Phase | Estimate | Sprint |
|-------|---------|--------|
| Phase 1 — Foundation | 2-3h | 3 |
| Phase 2 — Tasks & Questions | 4-6h | 3 |
| Phase 3 — Step migration | 4-6h | 3 |
| Phase 4 — HTML Reports | 1-2h | 3 |
| Phase 5 — Python | 8-12h | 4 |
| Phase 6 — C# | 8-12h | 5 |
| **Total TypeScript** | **11-17h** | Sprint 3 |
| **Total multi-stack** | **27-41h** | Sprints 3-5 |

---

## 8. Testing Strategy

### 8.1 Acceptance Criteria

- [ ] All 43 existing Gherkin scenarios pass after migration (zero regressions)
- [ ] `npm run format:check`, `npm run lint`, `npm run build` all clean
- [ ] No single step definition file exceeds 80 lines
- [ ] Each Task/Question has a JSDoc comment explaining its design role
- [ ] Serenity HTML report generates successfully with `npm run serenity:report`

### 8.2 Regression Approach

Run the existing Cucumber suite before and after migration to confirm zero regression:

```bash
# Before migration
npm test > before-migration.txt

# After migration
npm test > after-migration.txt

diff before-migration.txt after-migration.txt
# Expected: identical scenario/step pass counts
```

### 8.3 ISTQB Considerations

| Technique | Application |
|-----------|------------|
| **Equivalence Partitioning** | Each algorithm (UC, HS, NS) is tested as a partition of the solving strategy |
| **Boundary Value Analysis** | Empty cells: 0 empties (complete grid), 1 empty (unit completion), 2+ empties (other techniques) |
| **State Transition** | Grid state transitions: initialised → partially solved → SOLVED / STUCK |
| **Decision Table** | Constraint validation Scenario Outline covers all row/col/block constraint combinations |

---

## 9. Alternatives Considered

### 9.1 Keep Current Procedural Step Definitions

**Why rejected:** The existing approach works at 43 scenarios but will not scale to
100+ scenarios (Python + C# implementations) without significant duplication. The World
object already has 9 fields; adding more scenarios adds more fields. Screenplay
eliminates the world entirely.

### 9.2 Page Object Model (POM)

**Why not applicable:** POM is designed for browser UI test automation where a "page"
is a meaningful concept. This project tests a pure algorithm — there is no page, no
DOM, no user interaction. Screenplay's Actor/Ability/Task model fits algorithm testing
more naturally.

### 9.3 Custom Wrapper Without Serenity/JS

**Why rejected:** Building a bespoke Screenplay framework is YAGNI. `@serenity-js/core`
is mature, well-documented, and provides the HTML Living Documentation report for free.
For Python and C#, the pattern is applied without a formal library (the pattern, not the
library, is what matters).

---

## 10. Open Questions

| # | Question | Owner | Target Date |
|---|---------|-------|------------|
| 1 | Should the Serenity HTML report be published to GitHub Pages? | Project Lead | Sprint 3 planning |
| 2 | For Python, use pytest-bdd or behave? Both support Gherkin; pytest-bdd integrates with pytest fixtures more naturally | Dev Team | Sprint 4 planning |
| 3 | Should the Screenplay Abilities wrap the production classes or the compiled JS output? TypeScript source is preferred. | Architect | Sprint 3 kickoff |

---

## Appendix A — Screenplay vs Current: SOLID Assessment

| Principle | Current (Procedural) | Screenplay |
|-----------|---------------------|-----------|
| **SRP** | World class handles setup, invocation, state storage, assertion | Each Task/Question has one responsibility |
| **OCP** | Adding scenarios means modifying the World class | Adding scenarios means adding a new Task — no modification |
| **LSP** | No inheritance used | Ability interface substitutable in tests |
| **ISP** | World exposes all state to all steps | Steps only interact with the specific Question they need |
| **DIP** | Step defs depend directly on `SudokuSolver` constructor | Step defs depend on `UseSudokuSolver` Ability (abstraction) |

---

## Appendix B — Serenity/JS Installation

```bash
cd demo-apps/demoapp001-typescript-cypress

# Core Serenity/JS packages
npm install --save-dev \
  @serenity-js/core \
  @serenity-js/cucumber \
  @serenity-js/assertions \
  @serenity-js/serenity-bdd

# Update cucumber.js to register Serenity/JS
# Add @serenity-js/cucumber to requireModule in cucumber.js
```

Updated `cucumber.js`:
```javascript
// cucumber.js
const { SudokuActors } = require('./tests/screenplay/actors/SudokuActors');

module.exports = {
  default: {
    require: ['tests/screenplay/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register', '@serenity-js/cucumber'],
    format: ['@cucumber/pretty-formatter', '@serenity-js/serenity-bdd'],
    paths: ['tests/**/*.feature'],
    publishQuiet: true,
    worldParameters: { cast: SudokuActors },
  },
};
```
