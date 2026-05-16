# Sudoku Basic Solver Algorithm

**Version:** v1.0
**Date:** 2026-01-30T20:00:00Z

This document describes the implementation of three fundamental Sudoku solving techniques used in the [TypeScript Sudoku Solver](../../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts).

## Overview

The algorithm implements three solving techniques in order of increasing complexity:

1. **Unit Completion** - Simplest: fill in the last empty cell in a row/column/block
2. **Hidden Singles** - Medium: find where a digit must go within a unit
3. **Naked Singles** - Most complex: find cells that can only contain one digit

These techniques are applied iteratively until the puzzle is solved or no further progress can be made.

---

## 1. Unit Completion Algorithm

### Goal
Solve units (rows, columns, or blocks) that have only one empty cell.

### Technique
When a row, column, or 3×3 block has exactly one empty cell, the missing digit must go in that cell.

### Example
```
Row: [5, 8, _, 2, 1, 6, 3, 4, 7]
```
The missing digit is **9**, so it must go in the empty cell.

### Pseudocode

```
FUNCTION UnitCompletion():
    FOR each unit (row, column, or block):
        IF count_empty_cells(unit) == 1:
            missing_val = find_missing_digit(unit)
            PLACE missing_val in empty_cell
            RETURN TRUE
    RETURN FALSE
```

### Implementation Reference
- TypeScript: [`unitCompletion()`](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts#L24)
- Complexity: **O(n)** per unit (27 units total: 9 rows + 9 columns + 9 blocks)

---

## 2. Hidden Singles Algorithm

*Also known as: Crosshatch*

### Goal
Find a specific digit's only possible placement within a unit (row, column, or block).

### Technique
If a digit can only go in one cell within a row, column, or block, place it there (even if that cell has other candidates).

### Example
```
Block:  [1, 2, 3]
        [4, _, 6]
        [7, 8, 9]
```
If the digit **5** is blocked from the second row and third column by existing 5's in other units, it can only go in position `[1, 1]`.

### Why "Hidden Single"?
The single candidate for the digit may be "hidden" among other possible values for that cell. From the cell's perspective, it might have multiple candidates, but from the digit's perspective, there's only one valid location.

### Pseudocode

```
FUNCTION HiddenSingles(target_number):
    // Check each row
    FOR each row in grid:
        IF target_number NOT in row:
            candidates = empty cells in row where target_number is valid
            IF length(candidates) == 1:
                PLACE target_number in candidates[0]
                RETURN TRUE

    // Check each column
    FOR each column in grid:
        IF target_number NOT in column:
            candidates = empty cells in column where target_number is valid
            IF length(candidates) == 1:
                PLACE target_number in candidates[0]
                RETURN TRUE

    // Check each 3×3 block
    FOR each 3x3_block in grid:
        IF target_number NOT in block:
            candidates = empty cells in block where target_number is valid
            IF length(candidates) == 1:
                PLACE target_number in candidates[0]
                RETURN TRUE

    RETURN FALSE
```

### Implementation Reference
- TypeScript: [`hiddenSingles(target)`](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts#L66)
- Called 9 times per iteration (once for each digit 1-9)
- Complexity: **O(n)** per digit scan

---

## 3. Naked Singles Algorithm

### Goal
Find cells that can only contain one specific digit after elimination.

### Technique
For each empty cell, eliminate all digits that appear in the same row, column, or block. If only one digit remains, place it.

### Example
```
Cell at [4, 4] can "see":
- Row 4: [1, 2, 3]
- Column 4: [4, 5, 6]
- Block (1,1): [7, 8]

Candidates remaining: {9}
```
Only **9** is missing, so this cell must be 9.

### Why "Naked Single"?
The single candidate is "naked" or obvious when looking at that specific cell. Unlike Hidden Singles, which focus on where a digit can go, Naked Singles focus on what a cell can contain.

### Pseudocode

```
FUNCTION NakedSingles():
    FOR each empty_cell in grid:
        possible_values = {1..9}
        REMOVE values found in cell.row
        REMOVE values found in cell.col
        REMOVE values found in cell.block
        IF length(possible_values) == 1:
            PLACE possible_values[0] in cell
            RETURN TRUE
    RETURN FALSE
```

### Implementation Reference
- TypeScript: [`nakedSingles()`](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts#L98)
- Complexity: **O(n²)** - examines all empty cells

---

## 4. Main Execution Loop

### Goal
Orchestrate the solving techniques until the puzzle is solved or no more progress can be made.

### Strategy
Apply techniques from simplest to most complex, repeating until:
1. The puzzle is solved (all cells filled), OR
2. No technique makes progress (stuck - requires advanced techniques)

### Pseudocode

```
FUNCTION SolveSudoku():
    WHILE grid_is_not_full:
        changed = FALSE

        // Step 1: Try Unit Completion (simplest - O(n) per unit)
        IF UnitCompletion() == TRUE:
            changed = TRUE

        // Step 2: Try Hidden Singles for each digit 1-9
        // Scan systematically to find where each digit must go
        FOR val FROM 1 TO 9:
            IF HiddenSingles(val) == TRUE:
                changed = TRUE

        // Step 3: Try Naked Singles (most complex - checks all cells)
        IF NakedSingles() == TRUE:
            changed = TRUE

        // Step 4: Check if we made any progress this iteration
        IF changed == FALSE:
            PRINT "Basic algorithm stuck - requires advanced techniques."
            BREAK

    IF grid_is_full:
        PRINT "Puzzle Solved!"
    ELSE:
        PRINT "Puzzle requires advanced techniques (e.g., Naked Pairs, X-Wing)"
```

### Implementation Reference
- TypeScript: [`SudokuOrchestrator.solve()`](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuOrchestrator.ts#L25)
- Returns: `"SOLVED"` or `"STUCK_ON_ADVANCED_LOGIC"`

### Execution Order Importance
The order matters for efficiency:
1. **Unit Completion** is fastest (O(n)) - try first
2. **Hidden Singles** is medium speed - try second
3. **Naked Singles** is slowest (O(n²)) - try last

---

## Algorithm Complexity Analysis

| Technique | Time Complexity | Calls Per Iteration | Total Complexity |
|-----------|----------------|---------------------|------------------|
| Unit Completion | O(n) | 1 | O(n) |
| Hidden Singles | O(n) | 9 (for digits 1-9) | O(9n) |
| Naked Singles | O(n²) | 1 | O(n²) |

**Overall**: O(n²) per iteration, where n = 81 (grid size)

---

## Puzzle Difficulty Coverage

### ✅ Solvable with Basic Techniques
- Easy puzzles (high number of clues)
- Medium puzzles (moderate clues, logical deduction)
- Some hard puzzles (if they rely only on these three techniques)

### ❌ Requires Advanced Techniques
- Naked/Hidden Pairs
- Naked/Hidden Triples
- X-Wing
- Swordfish
- XY-Wing
- Coloring strategies
- Forcing chains

When the basic algorithm returns `"STUCK_ON_ADVANCED_LOGIC"`, the puzzle requires techniques beyond this implementation.

---

## Testing

The algorithm is tested comprehensively in:
- **Feature File**: [BasicSudokuSolverLogic.feature](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/BasicSudokuSolverLogic.feature)
- **Test Puzzles**: [puzzles.json](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/puzzles.json)

See the [README](../../README.md) for instructions on running the solver and tests.

---

## References

- [Sudoku Solving Techniques](https://www.sudokuwiki.org/sudoku.htm)
- [SudokuSolver.ts Implementation](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts)
- [SudokuOrchestrator.ts Implementation](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuOrchestrator.ts)
