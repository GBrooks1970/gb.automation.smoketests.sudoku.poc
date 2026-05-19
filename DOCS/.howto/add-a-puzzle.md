# How To: Add a New Puzzle

**Difficulty:** Beginner
**Time to complete:** 10 minutes
**Last verified:** 2026-05-17

---

## What you will achieve

By the end of this guide you will have added a new Sudoku puzzle to `puzzles.json`, confirmed it passes `PuzzleLoader` validation, and verified the full test suite still passes.

---

## Before you start

**You need:**
- [ ] Dependencies installed — run `npm install` once from `demo-apps/demoapp001-typescript-cypress/`
- [ ] A valid 9×9 Sudoku grid (no solver required — partially-filled grids are fine)

**You should know:**
- How to edit a JSON file
- What a 9×9 Sudoku grid looks like (rows 0–8, columns 0–8)

---

## The puzzle schema

Every entry in `puzzles.json` must match this structure:

```json
{
  "name": "Your Puzzle Name",
  "difficulty": "easy",
  "description": "One sentence describing the puzzle's character.",
  "grid": [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ]
}
```

**Field rules enforced by `PuzzleLoader.validatePuzzles()`:**

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | Must be unique — `getPuzzleByName()` returns the first match |
| `difficulty` | string | Any value accepted; existing puzzles use `"easy"`, `"medium"`, `"hard"` |
| `description` | string | Free text; appears in log output |
| `grid` | `number[][]` | Exactly 9 rows, each with exactly 9 columns |
| Cell values | integer | `0` = empty cell; `1`–`9` = given clue. Any other value throws a validation error at startup |

> **`0` means empty, not "skip"** — a cell value of `0` is the sentinel that tells the solver this cell needs to be filled. Any value outside `0–9` (including `10`, `-1`, or `null`) causes `PuzzleLoader` to throw immediately on startup.

---

## Steps

### Step 1: Open puzzles.json

Open [`demo-apps/demoapp001-typescript-cypress/puzzles.json`](../../demo-apps/demoapp001-typescript-cypress/puzzles.json).

The file contains a top-level `"puzzles"` array. Existing entries are:

| Name | Difficulty |
|------|------------|
| Easy Scan Grid | easy |
| Logic Squeeze Grid | medium |
| Minimal Clues | hard |
| Crosshatch Challenge | medium |
| Empty Grid (Stress Test) | expert |

---

### Step 2: Add your puzzle entry

Append a new object to the `"puzzles"` array before the closing `]`. Keep the trailing comma on the previous entry.

```json
{
  "name": "My New Puzzle",
  "difficulty": "easy",
  "description": "A beginner puzzle solvable by Unit Completion alone.",
  "grid": [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0]
  ]
}
```

**Tip:** Count the values in each row — each must have exactly 9 numbers.

---

### Step 3: Validate your puzzle without running the full test suite

Run a quick sanity check using `npm start`:

```powershell
cd demo-apps/demoapp001-typescript-cypress
npm start
```

**You should see:**

```
--- My New Puzzle ---
Result: SOLVED   (or STUCK_ON_ADVANCED_LOGIC if your puzzle needs advanced techniques)
```

If you see an error like `Puzzle "My New Puzzle" must have exactly 9 rows`, fix the grid — count rows and columns carefully.

---

### Step 4: Run the full test suite

```powershell
cd d:\__GB_DEV\_GitHub\gb.automation.smoketests.sudoku.poc
.\.batch\run-demoapp001.ps1
```

**You should see:**

```
BuildExitCode: 0
TestExitCode: 0
OverallExitCode: 0
```

The existing 43 scenarios continue to pass. Adding a puzzle does not break any existing scenario because the scenarios reference puzzles by name (e.g., `"Easy Scan Grid"`) — your new puzzle is simply ignored by tests that do not name it.

---

### Step 5: (Optional) Add a Gherkin scenario for your puzzle

If your puzzle exercises a specific solving behaviour you want to verify automatically, add a scenario to the canonical feature file. See [add-a-gherkin-scenario.md](add-a-gherkin-scenario.md) for the full procedure.

---

## Verify it worked

- [ ] `npm start` ran without a validation error and printed your puzzle's name and result
- [ ] `OverallExitCode=0` from the orchestration script
- [ ] `43` scenarios still pass (no regressions)

---

## Common problems

### `Puzzle "X" must have exactly 9 rows`

**Cause:** Your grid array has fewer or more than 9 inner arrays.
**Fix:** Count the rows in your `"grid"` value — there must be exactly 9.

---

### `Puzzle "X" row N must have exactly 9 columns`

**Cause:** One of your rows has fewer or more than 9 numbers.
**Fix:** Count the values in the failing row. Add or remove values until each row has exactly 9.

---

### `Puzzle "X" has invalid value at [R][C]: N`

**Cause:** A cell contains a value outside the range `0–9` (for example `10`, `-1`, or a typo like `00`).
**Fix:** Check cell `[R][C]` in your grid. Valid values are integers `0` through `9` only.

---

### `SyntaxError: Unexpected token` or the file fails to parse

**Cause:** A JSON formatting error — most commonly a missing comma between array elements, a trailing comma after the last entry, or a missing closing brace.
**Fix:** Use a JSON validator (VS Code underlines JSON errors automatically, or paste into [jsonlint.com](https://jsonlint.com)).

---

## What to do next

- Try [add-a-gherkin-scenario.md](add-a-gherkin-scenario.md) to add an automated test for your new puzzle.
- Try [debug-sudoku-solver.md](debug-sudoku-solver.md) to watch the solver work through your puzzle cell by cell.
