# How To: Debug the SudokuSolver in VS Code

**Difficulty:** Beginner
**Time to complete:** 15 minutes
**Last verified:** 2026-04-02

---

## What you will achieve

By the end of this guide you will have the VS Code debugger attached to the running TypeScript solver, with execution paused on a breakpoint inside `SudokuSolver.ts`. You will be able to inspect the live grid state cell by cell, step through algorithm logic one line at a time, and watch variables change as the solver fills cells.

---

## Before you start

**You need:**
- [ ] [VS Code](https://code.visualstudio.com/) installed
- [ ] Node.js 16 or later — run `node --version` to confirm
- [ ] Dependencies installed — run `npm install` once from `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/`

**You should know:**
- How to open a terminal in VS Code (`Ctrl+`` ` ``)
- What a breakpoint is (a marker that pauses execution at a specific line)

---

## Understanding what you are debugging

The solver has a clear call chain. Knowing it tells you where to place breakpoints:

```
index.ts            ← entry point, loads puzzles and starts the loop
  └── SudokuCLI.run()
        └── SudokuOrchestrator.solve()   ← main while-loop
              ├── SudokuSolver.unitCompletion()    line 24
              ├── SudokuSolver.hiddenSingles(digit) line 80   ← called 9× per iteration
              └── SudokuSolver.nakedSingles()      line 112
```

The key state to watch is `this.grid` — a `number[][]` that starts with `0` in empty cells and fills in during solving. `this.origGrid` never changes and is your reference for the starting position.

---

## Steps

### Step 1: Create the VS Code launch configuration

VS Code needs a `launch.json` file to know how to start the debugger for a TypeScript/Node.js project.

Create the folder and file at the repo root:

```
.vscode/
└── launch.json
```

Create `.vscode/launch.json` with this content:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug SudokuSolver",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "node",
            "runtimeArgs": [
                "--require", "ts-node/register"
            ],
            "args": [
                "${workspaceFolder}/DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/index.ts"
            ],
            "cwd": "${workspaceFolder}/DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS",
            "env": {
                "TS_NODE_PROJECT": "${workspaceFolder}/DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tsconfig.json"
            },
            "sourceMaps": true,
            "console": "integratedTerminal",
            "skipFiles": [
                "<node_internals>/**",
                "**/node_modules/**"
            ]
        }
    ]
}
```

**Why each setting matters:**

| Setting | Purpose |
|---------|---------|
| `runtimeArgs: ["--require", "ts-node/register"]` | Tells Node to compile TypeScript on the fly, so you debug the `.ts` source directly — not compiled `.js` |
| `args` | The entry point — equivalent to running `ts-node app_src/index.ts` |
| `cwd` | Sets the working directory so `puzzles.json` is found at its relative path (`../puzzles.json`) |
| `TS_NODE_PROJECT` | Points `ts-node` at the correct `tsconfig.json` so strict mode and path resolution match the project's settings |
| `sourceMaps: true` | Enables mapping from Node's internal execution back to your `.ts` line numbers |
| `skipFiles` | Prevents the debugger from stepping into Node internals or `node_modules` |

---

### Step 2: Open SudokuSolver.ts and set a breakpoint

Open [`DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts`](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts).

Set a breakpoint on **line 91** — this is inside `hiddenSingles()`, at the point where a hidden single has been found and is about to be placed:

```typescript
// Line 91 in hiddenSingles()
this.grid[candidates[0].r][candidates[0].c] = target;
```

To set the breakpoint: click in the gutter (the grey strip to the left of the line numbers). A red dot appears.

> **Good first breakpoints for learning the solver:**
>
> | Line | Location | What you can observe |
> |------|----------|----------------------|
> | 33 | `unitCompletion()` — row found | `r`, which row has one empty cell, `missing` value |
> | 91 | `hiddenSingles()` — placing a digit | `target`, `candidates[0]`, current `this.grid` state |
> | 119 | `nakedSingles()` — placing a digit | `r`, `c`, `possible` set (should have 1 element) |
> | 29 | `SudokuOrchestrator.solve()` — loop start | Pause at the top of each iteration to watch overall progress |

---

### Step 3: Start the debugger

Open the Run and Debug panel: press `Ctrl+Shift+D` (Windows) or click the play-with-bug icon in the left sidebar.

At the top of the panel, confirm the dropdown shows **"Debug SudokuSolver"** (the name from `launch.json`).

Press **F5** or click the green play button.

**You should see:**
- The integrated terminal opens and `ts-node` starts compiling
- Execution pauses at your breakpoint with a yellow highlight on line 91
- The Debug toolbar appears at the top of the screen

---

### Step 4: Inspect the grid state

With execution paused at line 91 inside `hiddenSingles()`, open the **Variables** panel (left side of the Debug panel).

Expand **`this`** → **`grid`** to see the full 9×9 array in its current state. Cells containing `0` are still empty; cells with `1`–`9` have been filled.

Also inspect:
- `target` — the digit about to be placed (1–9)
- `candidates[0]` — the `{r, c}` coordinates of the cell that will receive `target`
- `candidates[0].r` and `candidates[0].c` — the row and column

> **Reading the grid in the Variables panel:**
> The `grid` array is indexed `grid[row][col]` where row 0 is the top row and col 0 is the leftmost column. Compare it against the printed output in the terminal to orient yourself.

---

### Step 5: Step through the code

Use the debug toolbar buttons (or keyboard shortcuts) to move through execution:

| Button | Key | Action |
|--------|-----|--------|
| Continue | **F5** | Run until the next breakpoint |
| Step Over | **F10** | Execute the current line and move to the next — does not enter function calls |
| Step Into | **F11** | Enter the function call on the current line (e.g., step into `isInRow()`) |
| Step Out | **Shift+F11** | Finish the current function and return to its caller |
| Restart | **Ctrl+Shift+F5** | Restart the solver from the beginning |
| Stop | **Shift+F5** | Stop debugging |

**Recommended first walkthrough:**

1. Press **F5** to reach the first breakpoint hit (first hidden single found).
2. Hover over `this.grid` in the editor — a tooltip shows its current value.
3. Note `target`, `candidates[0].r`, `candidates[0].c`.
4. Press **F10** to execute the assignment. Watch the cell in `this.grid` change from `0` to `target`.
5. Press **F5** again to reach the next hidden single placement.
6. Repeat until `SOLVED` prints in the terminal.

---

### Step 6: Watch specific variables across breakpoint hits

The **Watch** panel lets you track an expression continuously across every breakpoint hit.

Click **"+ Add Expression"** in the Watch panel and enter:

```
this.grid[0]
```

This shows row 0's current state every time execution pauses. Try these watches:

| Expression | Shows |
|------------|-------|
| `this.grid[0]` | Top row values |
| `this.grid.flat().filter(v => v === 0).length` | Number of empty cells remaining |
| `target` | Current digit being placed by `hiddenSingles` |
| `candidates.length` | How many candidate cells exist for `target` in this unit |
| `this.origGrid[0]` | Original clues for row 0 — never changes, useful for comparison |

---

### Step 7: Trace a single puzzle solve end to end

To trace one puzzle rather than all four, temporarily edit `index.ts` to solve only the Easy Scan Grid.

Locate [index.ts lines 22–29](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/index.ts#L22):

```typescript
// Comment out the "solve all" loop:
// allPuzzles.forEach(puzzle => { ... });

// And uncomment / add this below it:
const easyPuzzle = loader.getPuzzleByName("Easy Scan Grid");
if (easyPuzzle) {
    const solver = new SudokuSolver(easyPuzzle.name, easyPuzzle.grid);
    const app = new SudokuCLI(solver);
    app.run();
}
```

Now each **F5** press moves to the next breakpoint hit *for the Easy Scan Grid only*, making the trace easier to follow. Undo this change when done.

> This is a temporary diagnostic edit — do not commit it.

---

### Step 8: Set a conditional breakpoint

Conditional breakpoints only pause when a specific condition is true — essential for stopping at a particular cell or digit without clicking F5 dozens of times.

To set one:
1. Right-click an existing breakpoint dot (or right-click the gutter line).
2. Select **"Edit Breakpoint..."**.
3. Enter a condition expression.

**Useful conditions for this solver:**

| Condition | Pauses when |
|-----------|-------------|
| `target === 5` | `hiddenSingles` is processing digit 5 |
| `candidates[0].r === 0 && candidates[0].c === 2` | The specific cell [0,2] is about to be filled |
| `r === 3` | `unitCompletion` or `nakedSingles` is processing row 3 |
| `this.grid.flat().filter(v => v === 0).length < 10` | Fewer than 10 empty cells remain |
| `changed === true` | A technique has just made at least one placement |

---

## Verify it worked

You have debugged the solver successfully if:
- [ ] The debugger paused on your breakpoint inside `SudokuSolver.ts` (not inside compiled `.js`)
- [ ] `this.grid` was visible and readable in the Variables panel
- [ ] You stepped through at least one cell placement and watched `this.grid` update
- [ ] The solver completed and printed `SOLVED` or `STUCK_ON_ADVANCED_LOGIC` in the integrated terminal

---

## Common problems

### Breakpoint shows as a hollow circle (unverified)

**Cause:** The TypeScript source map could not be loaded, so VS Code does not know where the breakpoint maps to in the running code.

**Fix:** Ensure `TS_NODE_PROJECT` in `launch.json` points to the correct `tsconfig.json`. Run `npm install` to confirm `ts-node` is installed. Restart VS Code and try again.

---

### `Error: Cannot find module '../puzzles.json'`

**Cause:** `cwd` in `launch.json` is wrong, so the relative path `../puzzles.json` inside `PuzzleLoader` resolves to the wrong location.

**Fix:** Confirm `launch.json` has:
```json
"cwd": "${workspaceFolder}/DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS"
```
The `cwd` must be the `DEMOAPP001_TYPESCRIPT_CYPRESS` directory — the same directory you `cd` into when running `npm start` manually.

---

### `TypeError: Cannot find module 'ts-node/register'`

**Cause:** `ts-node` is not installed in the app's `node_modules`.

**Fix:**
```bash
cd DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS
npm install
```

---

### Debugger steps into Node.js internals instead of your code

**Cause:** `skipFiles` is missing or misconfigured in `launch.json`.

**Fix:** Confirm your `launch.json` includes:
```json
"skipFiles": [
    "<node_internals>/**",
    "**/node_modules/**"
]
```
Press **Shift+F11** (Step Out) to escape from an internal file and return to your source.

---

### Variables panel shows `undefined` or `Cannot read properties`

**Cause:** Execution is paused at a line where the variable is not yet in scope (e.g., a breakpoint on the `let changed = false` declaration before `changed` has a value).

**Fix:** Move the breakpoint one line later, to where the variable has been assigned and is in use. Line 91 (`this.grid[...] = target`) is a reliable place where all the interesting variables are in scope simultaneously.

---

## What to do next

- Read the [Hidden Singles algorithm explanation](../ALGORITHM_Sudoku_Basic_Solver.md#2-hidden-singles-algorithm) and use the debugger to verify each step of the pseudocode against the live code.
- Set a breakpoint at [SudokuOrchestrator.ts line 29](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuOrchestrator.ts#L29) to observe how the outer solve loop coordinates the three algorithms across iterations.
- Once you understand the flow, implement [BACKLOG-001](../DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md) — use the debugger to verify the new row and column loops place digits correctly before committing.
