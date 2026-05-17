# TODO: Complete Hidden Singles Implementation

**Created:** 2026-04-02T00:00:00Z
**Backlog Reference:** BACKLOG-001 (Complete Hidden Singles Implementation)
**Estimated Effort:** 4-6 hours
**Sprint:** 1 (2026-03-30 to 2026-04-13)
**Status:** 🔴 Not Started

---

## Overview

`hiddenSingles(target)` in [SudokuSolver.ts:80](../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts#L80) only scans 3×3 blocks. The algorithm specification ([sudoku-basic-solver.md §2](../sudoku-basic-solver.md)) requires it to scan all three unit types: **rows**, **columns**, and blocks.

This document walks through the gap step by step — understanding it first, designing the fix second — so the algorithm is fully understood before any code is changed.

---

## Prerequisites

- [ ] Read [sudoku-basic-solver.md §2](../sudoku-basic-solver.md#2-hidden-singles-algorithm) to understand the full specification.
- [ ] Read [SudokuSolver.ts](../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts) in full — particularly `hiddenSingles()` (line 80) and all private helpers (lines 127-206).
- [ ] Run `npm start` from `demo-apps/demoapp001-typescript-cypress/` and confirm the existing output is correct before touching anything.

---

## Phase 1: Understand the Gap (No Code Changes)

Before writing a single line, trace the algorithm by hand. This phase exists to ensure the fix is correct on first attempt.

### 1.1 What the algorithm specification says

The `HiddenSingles(target)` algorithm must do the following for **each** of the three unit types:

```
For each ROW r (0-8):
    If target is already placed in row r → skip
    Find empty cells in row r where target is not excluded by column or block constraints
    If exactly 1 such cell → place target there

For each COLUMN c (0-8):
    If target is already placed in column c → skip
    Find empty cells in column c where target is not excluded by row or block constraints
    If exactly 1 such cell → place target there

For each BLOCK (br, bc) (already implemented):
    If target is already placed in the block → skip
    Find empty cells in the block where target is not excluded by row or column constraints
    If exactly 1 such cell → place target there
```

### 1.2 What the current code actually does

Read lines 80-98 of [SudokuSolver.ts](../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts#L80):

```typescript
public hiddenSingles(target: number): boolean {
    let changed = false;

    // Check each 3x3 block    ← ONLY THIS. Rows and columns are missing.
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (this.isNumberInBlock(target, row, col)) continue;
            const candidates = this.getBlockEmptyCells(row, col)
                .filter(cell => !this.isInRow(target, cell.r) && !this.isInCol(target, cell.c));
            if (candidates.length === 1) {
                this.grid[candidates[0].r][candidates[0].c] = target;
                changed = true;
            }
        }
    }

    return changed;
}
```

The block scan is correct and complete. The row and column scans simply do not exist.

### 1.3 Inventory the available private helpers

Before writing the new loops, confirm that the helpers needed already exist:

| Helper | Location | Does what |
|--------|----------|-----------|
| `isInRow(v, r)` | line 127 | Returns `true` if `v` is already placed in row `r` |
| `isInCol(v, c)` | line 131 | Returns `true` if `v` is already placed in column `c` |
| `isNumberInBlock(v, br, bc)` | line 135 | Returns `true` if `v` is already in block `(br, bc)` |
| `getBlockEmptyCells(br, bc)` | line 146 | Returns empty cell coordinates within a block |

Note what is **not** present: there is no `getRowEmptyCells(r)` or `getColEmptyCells(c)` helper. The new row and column loops will inline their own empty-cell iteration, consistent with the style of the block scan which uses `getBlockEmptyCells` for convenience. The row/column versions are simple enough to not need extracted helpers — a standard `for` loop over indices is sufficient and readable.

### 1.4 Trace the row scan logic by hand

Pick target = `5` and row = `3` from the [Easy Scan Grid](../../demo-apps/demoapp001-typescript-cypress/puzzles.json) as a worked example:

```
Row 3 state: [8, 0, 0, 0, 6, 0, 0, 0, 3]
```

Step 1 — Is `5` already in row 3? Check `isInRow(5, 3)` → scan `[8,0,0,0,6,0,0,0,3]` → **no**.

Step 2 — For each empty cell in row 3 (columns 1, 2, 3, 5, 6, 7), ask: is `5` excluded from this cell by its column or its block?

| Cell | `isInCol(5, c)?` | `isNumberInBlock(5, Math.floor(3/3), Math.floor(c/3))?` | Valid candidate? |
|------|-----------------|--------------------------------------------------------|-----------------|
| [3,1] | check col 1 | check block (1,0) | depends on grid state |
| [3,2] | check col 2 | check block (1,0) | depends on grid state |
| [3,3] | check col 3 | check block (1,1) | depends on grid state |
| [3,5] | check col 5 | check block (1,1) | depends on grid state |
| [3,6] | check col 6 | check block (1,2) | depends on grid state |
| [3,7] | check col 7 | check block (1,2) | depends on grid state |

Step 3 — If exactly 1 survives, place `5` there. This is the hidden single.

> **Key insight:** the block index for cell `(r, c)` is `(Math.floor(r/3), Math.floor(c/3))`. This is the same formula already used in `getCellCandidates()` (line 186-187). It is the only new computation the row/column loops require.

### 1.5 Trace the column scan logic by hand

Identical reasoning, transposed. For target = `5` and column = `5`:

```
Column 5 values: [0, 5, 0, 0, 3, 0, 0, 9, 0]
```

Step 1 — `isInCol(5, 5)` → `true` → **skip**. Column 5 already contains 5. No placement needed.

Try column = `6` for target = `5`:

```
Column 6 values: [0, 0, 0, 0, 0, 0, 2, 0, 0]
```

Step 1 — `isInCol(5, 6)` → **false**.

Step 2 — For each empty cell in column 6 (rows 0,1,2,3,4,5,7), ask: is `5` excluded from this cell by its row or its block?

| Cell | `isInRow(5, r)?` | `isNumberInBlock(5, Math.floor(r/3), Math.floor(6/3))?` | Valid? |
|------|-----------------|--------------------------------------------------------|--------|
| [0,6] | check row 0 | check block (0,2) | depends |
| [1,6] | check row 1 | check block (0,2) | depends |
| [2,6] | check row 2 | check block (0,2) | depends |
| ... | ... | ... | ... |

Step 3 — If exactly 1 survives, place `5` there.

> The pattern is the mirror image of the row scan. The only difference is which axis is held fixed (row vs column) and which constraint type is swapped (`isInRow` ↔ `isInCol`).

---

## Phase 2: Design the New Loops (Still No Code Changes)

With the logic traced by hand, write out the pseudocode for both new loops before touching the TypeScript.

### 2.1 Row scan pseudocode

```
FOR r = 0 TO 8:
    IF isInRow(target, r) → CONTINUE   // target already placed in this row

    candidates = []
    FOR c = 0 TO 8:
        IF grid[r][c] ≠ 0 → CONTINUE  // cell not empty
        blockRow = Math.floor(r / 3)
        blockCol = Math.floor(c / 3)
        IF NOT isInCol(target, c) AND NOT isNumberInBlock(target, blockRow, blockCol):
            candidates.push({r, c})

    IF candidates.length == 1:
        grid[candidates[0].r][candidates[0].c] = target
        changed = true
```

### 2.2 Column scan pseudocode

```
FOR c = 0 TO 8:
    IF isInCol(target, c) → CONTINUE   // target already placed in this column

    candidates = []
    FOR r = 0 TO 8:
        IF grid[r][c] ≠ 0 → CONTINUE  // cell not empty
        blockRow = Math.floor(r / 3)
        blockCol = Math.floor(c / 3)
        IF NOT isInRow(target, r) AND NOT isNumberInBlock(target, blockRow, blockCol):
            candidates.push({r, c})

    IF candidates.length == 1:
        grid[candidates[0].r][candidates[0].c] = target
        changed = true
```

### 2.3 Execution order within `hiddenSingles()`

The three scans are independent — the result of one does not invalidate another within the same call, because each scan only ever places at most one digit per unit, and unit types are disjoint in terms of which constraints they use. The order within the method does not affect correctness, but matching the algorithm specification order (rows → columns → blocks) is preferred for readability and consistency with the pseudocode in the algorithm doc.

**Final method structure:**

```
hiddenSingles(target):
    1. Scan rows       (NEW)
    2. Scan columns    (NEW)
    3. Scan blocks     (existing — unchanged)
    return changed
```

---

## Phase 3: Add a Demonstrative Test Puzzle

The fix must be verifiable. A puzzle is needed that **requires** row or column hidden singles to make progress — otherwise the existing code already solves it and the new code cannot be shown to matter.

### 3.1 Characteristics of the test puzzle

A puzzle that demonstrates row/column hidden singles:
- Contains at least one cell that can only be identified via row hidden single OR column hidden single
- Cannot be further solved by block hidden singles alone at that point
- Should be solvable to SOLVED status with the complete implementation
- Should remain at `STUCK_ON_ADVANCED_LOGIC` or make fewer placements with the incomplete implementation

### 3.2 Task

- [ ] **3.2.1** Construct or source a 9×9 puzzle with the above characteristics. To verify it:
  1. Run it through the current (block-only) solver — note how far it gets
  2. Manually identify the cell that requires a row or column hidden single
  3. Confirm the complete algorithm would place that cell

- [ ] **3.2.2** Add the puzzle to [puzzles.json](../../demo-apps/demoapp001-typescript-cypress/puzzles.json) with:
  - `name`: `"Row Column Hidden Singles"`
  - `difficulty`: `"medium"`
  - `description`: `"Requires row and column hidden singles to solve — validates complete hiddenSingles() implementation"`

- [ ] **3.2.3** Verify `npm start` still runs cleanly after adding the puzzle. The new puzzle may show as `STUCK_ON_ADVANCED_LOGIC` at this stage (before the fix) — that is expected and confirms it exercises the gap.

---

## Phase 4: Implement the Fix

With Phase 1-3 complete, the implementation is a direct transcription of the pseudocode from Phase 2 into TypeScript. No new private helpers are required.

### 4.1 Implement row scanning

- [ ] **4.1.1** In `hiddenSingles(target)` ([SudokuSolver.ts:80](../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts#L80)), add the row-scanning loop **before** the existing block loop, following the pseudocode in §2.1 exactly.

- [ ] **4.1.2** Use the `isInRow`, `isInCol`, and `isNumberInBlock` private helpers — do not inline the constraint checks manually. This keeps the pattern consistent with the existing block scan.

- [ ] **4.1.3** Use `Math.floor(r / 3)` and `Math.floor(c / 3)` for block index calculation — the same formula used in `getCellCandidates()`.

### 4.2 Implement column scanning

- [ ] **4.2.1** Add the column-scanning loop **between the row loop and the block loop**, following the pseudocode in §2.2.

- [ ] **4.2.2** Ensure the logic is symmetric with the row loop — `isInRow` and `isInCol` are swapped relative to the row version.

### 4.3 Preserve the existing block scan

- [ ] **4.3.1** The block-scanning loop (the existing code) must remain **unchanged** — move it after the two new loops, do not rewrite it.

### 4.4 Verify the fix compiles

- [ ] **4.4.1** Run `npm run build` — confirm zero TypeScript errors.
- [ ] **4.4.2** Run `npm start` — confirm all existing puzzles produce the same results as before the change.
- [ ] **4.4.3** Confirm the new `"Row Column Hidden Singles"` puzzle now produces `SOLVED` (or at minimum makes additional placements compared to the old output).

---

## Phase 5: Update Tests

The Gherkin feature file already contains two scenarios that target the new behaviour. They were written speculatively but cannot be validated until the implementation exists.

### 5.1 Review the existing scenarios

Read [BasicSudokuSolverLogic.feature lines 41-53](../../demo-apps/demoapp001-typescript-cypress/tests/BasicSudokuSolverLogic.feature#L41):

```gherkin
Scenario: Identify a Hidden Single in a row
  Given row 3 is missing the number 6
  And 8 cells in row 3 cannot contain 6 due to column or block constraints
  When the "Hidden Singles" algorithm is executed for value 6
  Then the system should place 6 in the only valid cell in row 3
  And the grid should reflect the new value

Scenario: Identify a Hidden Single in a column
  Given column 5 is missing the number 2
  And 8 cells in column 5 cannot contain 2 due to row or block constraints
  When the "Hidden Singles" algorithm is executed for value 2
  Then the system should place 2 in the only valid cell in column 5
  And the grid should reflect the new value
```

These scenarios already correctly specify the expected behaviour. No changes to the feature file are needed for these two scenarios.

### 5.2 Add an integration scenario for the new puzzle

- [ ] **5.2.1** Add the following scenario to the Integration Tests section of [BasicSudokuSolverLogic.feature](../../demo-apps/demoapp001-typescript-cypress/tests/BasicSudokuSolverLogic.feature):

```gherkin
Scenario: Solve "Row Column Hidden Singles" puzzle
  Given the puzzle "Row Column Hidden Singles" is loaded from JSON
  When the solver attempts to solve it
  Then the status should be "SOLVED"
  And all cells should be filled
  And the solution should be valid (no constraint violations)
```

### 5.3 Manual verification (until test runner is configured)

As noted in BACKLOG-002, the Gherkin scenarios cannot be automatically executed yet. Until BACKLOG-002 (Cucumber.js setup) is complete:

- [ ] **5.3.1** Manually trace the row hidden singles scenario: construct a minimal 9×9 grid where digit `6` is absent from row 3 and blocked from all but one empty cell by column/block constraints. Run `hiddenSingles(6)` on it and assert the correct cell is filled.

- [ ] **5.3.2** Manually trace the column hidden singles scenario: same approach for column 5 and digit `2`.

- [ ] **5.3.3** Document the hand-traced grids as comments near the Gherkin scenarios so that when step definitions are written (BACKLOG-002), the test author has a concrete grid to use.

---

## Phase 6: Update Documentation

All three documentation files that reference the limitation must be updated. No documentation should mention the block-only constraint after this fix is in.

### 6.1 Update the algorithm documentation

- [ ] **6.1.1** In [sudoku-basic-solver.md](../sudoku-basic-solver.md), remove the `⚠️ Current Implementation Limitation` warning box under Hidden Singles (§2), replacing it with a confirmation that all three unit types are implemented.

- [ ] **6.1.2** Update the `**Version:**` and `**Date:**` fields to reflect the change.

### 6.2 Update CLAUDE.md

- [ ] **6.2.1** In [CLAUDE.md](../../CLAUDE.md), under **Known Limitations**, remove or update the entry:
  > **Hidden Singles**: Only checks 3×3 blocks, not rows/columns (incomplete implementation)

  Replace with:
  > **Hidden Singles**: Checks all three unit types (rows, columns, and 3×3 blocks) — implementation complete.

- [ ] **6.2.2** Under **Solving Algorithms**, update the `SudokuSolver.hiddenSingles(target)` entry to remove the `**Note**:` line that references the block-only limitation.

### 6.3 Update the backlog

- [ ] **6.3.1** In [BACKLOG.md](BACKLOG.md), mark BACKLOG-001 as `🟢 Completed` and tick all acceptance criteria checkboxes.

### 6.4 Create an implementation log

- [ ] **6.4.1** Create `DOCS/.implementation/IMPL_LOG_[date]_Hidden_Singles_Complete_Implementation.md` documenting:
  - What was changed and why
  - The exact cells/loops added
  - Which test puzzle was added and what it demonstrates
  - Whether behaviour changed for existing puzzles (it should not)

---

## Summary of All Files to Change

| File | Change |
|------|--------|
| `app_src/SudokuSolver.ts` | Add row scan and column scan loops to `hiddenSingles()` |
| `puzzles.json` | Add `"Row Column Hidden Singles"` puzzle |
| `tests/BasicSudokuSolverLogic.feature` | Add integration scenario for new puzzle; annotate existing row/column scenarios with hand-traced grids |
| `DOCS/.algorithm/sudoku-basic-solver.md` | Remove limitation warning; update version |
| `CLAUDE.md` | Remove Known Limitation; update algorithm description |
| `DOCS/.planning/backlog.md` | Mark BACKLOG-001 complete |
| `DOCS/.implementation/IMPL_LOG_[date]_...md` | Create implementation log |

---

## Key Correctness Checks

Before considering this done, verify the following three properties:

1. **No regression** — All four existing puzzles (`Easy Scan Grid`, `Logic Squeeze Grid`, `Minimal Clues`, `Empty Grid`) produce exactly the same output as before the change. Row/column scanning can only find additional placements, not change existing ones.

2. **Symmetry** — The row loop and column loop are exact mirrors of each other. If they are not structurally symmetric, something is wrong. Compare them side by side before committing.

3. **Guard condition correctness** — The row loop guards with `isInRow`; the column loop guards with `isInCol`; the block loop guards with `isNumberInBlock`. Each loop's skip-guard uses the same unit type being scanned. Verify this is correct in the final code.

---

## Notes for Implementing Agent

- The existing block scan code in `hiddenSingles()` is **correct** — do not refactor it, move it, or rewrite it. Insert the two new loops before it.
- The private helpers `isInRow`, `isInCol`, and `isNumberInBlock` are already well-tested indirectly by the existing passing puzzles. Trust them.
- `Math.floor(r / 3)` and `Math.floor(c / 3)` for block indices are the same formula already present in `getCellCandidates()` at lines 186-187. Consistency with the existing code matters.
- The fix is small: two loops of ~10 lines each. If the implementation is growing beyond ~25 lines of new code, something has gone wrong — re-read the pseudocode in Phase 2.

---

**Estimated Total Effort:** 4-6 hours across all phases
