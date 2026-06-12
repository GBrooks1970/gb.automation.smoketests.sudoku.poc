# Sudoku Solver Design Specification

> **Document Type:** Implementation Specification
> **Audience:** Mid-level software engineers
> **Scope:** Technology and language agnostic

**Version:** v1.0
**Date:** 2026-01-30T20:00:00Z

> **Baseline status (2026-06-12):** This document is the **original core baseline** for the
> solver's algorithmic design. The platform as a whole — deliberate extensions, stack parity
> rules, and staged/optional surfaces — is specified by
> `sudoku-solver-platform-specification.md` v1.1 (DR-034), which qualifies a small number of
> statements in this document (see its Section 2.2). Capabilities absent from this document are
> not necessarily drift; check v1.1 before classifying them.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Terminology and Definitions](#2-terminology-and-definitions)
3. [Data Structures](#3-data-structures)
4. [Component Architecture](#4-component-architecture)
5. [Solving Algorithms](#5-solving-algorithms)
6. [Orchestration Logic](#6-orchestration-logic)
7. [Validation Rules](#7-validation-rules)
8. [Expected Behaviors](#8-expected-behaviors)
9. [Implementation Checklist](#9-implementation-checklist)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the design of a basic Sudoku solver application. It provides sufficient detail for a mid-level engineer to implement the solution in any programming language or technology stack.

### 1.2 Design Philosophy

The solver employs a **deterministic, logic-based approach** using three fundamental techniques. It does not use brute-force or backtracking algorithms. This design choice makes the solver:

- **Predictable** — Same input always produces the same sequence of moves
- **Educational** — Each technique mirrors how humans solve Sudoku
- **Debuggable** — Every cell placement has a clear logical justification

### 1.3 Scope and Limitations

**In Scope:**
- Solving standard 9×9 Sudoku puzzles
- Three basic solving techniques (detailed in Section 5)
- Clear success/failure reporting

**Out of Scope (by design):**
- Advanced techniques (Naked Pairs, X-Wing, Swordfish)
- Backtracking or brute-force algorithms
- Puzzle generation
- Multiple solution detection

### 1.4 What This Solver Can and Cannot Solve

| Puzzle Difficulty | Typical Outcome |
|-------------------|-----------------|
| Easy              | ✓ Solved        |
| Medium            | ✓ Often solved  |
| Hard              | ✗ Usually stuck |
| Expert            | ✗ Stuck         |

Puzzles requiring only Unit Completion, Hidden Singles, and Naked Singles will be solved. Puzzles requiring advanced techniques will report "stuck" status.

---

## 2. Terminology and Definitions

Understanding Sudoku terminology is essential before implementing the solver.

### 2.1 Grid Structure

```
        Column Index (c)
        0 1 2   3 4 5   6 7 8
      ┌───────┬───────┬───────┐
    0 │ . . . │ . . . │ . . . │
Row 1 │ . . . │ . . . │ . . . │  ← Block (0,0)  Block (0,1)  Block (0,2)
(r) 2 │ . . . │ . . . │ . . . │
      ├───────┼───────┼───────┤
    3 │ . . . │ . . . │ . . . │
    4 │ . . . │ . . . │ . . . │  ← Block (1,0)  Block (1,1)  Block (1,2)
    5 │ . . . │ . . . │ . . . │
      ├───────┼───────┼───────┤
    6 │ . . . │ . . . │ . . . │
    7 │ . . . │ . . . │ . . . │  ← Block (2,0)  Block (2,1)  Block (2,2)
    8 │ . . . │ . . . │ . . . │
      └───────┴───────┴───────┘
```

### 2.2 Key Terms

| Term | Definition |
|------|------------|
| **Cell** | A single position in the grid, identified by (row, column) coordinates |
| **Row** | A horizontal line of 9 cells (indices 0–8) |
| **Column** | A vertical line of 9 cells (indices 0–8) |
| **Block** | A 3×3 subgrid; there are 9 blocks in total |
| **Unit** | Any row, column, or block (27 units total in a puzzle) |
| **Digit** | A value from 1 to 9 |
| **Empty Cell** | A cell without a digit (represented as 0) |
| **Filled Cell** | A cell containing a digit 1–9 |
| **Candidate** | A digit that could legally be placed in an empty cell |
| **Peer** | Any cell sharing a row, column, or block with another cell |

### 2.3 Block Coordinate System

Blocks are identified by (blockRow, blockCol) where each ranges from 0 to 2:

```
Block coordinates:      Cell ranges covered:
(0,0) (0,1) (0,2)      rows 0-2, cols 0-2  │  rows 0-2, cols 3-5  │  rows 0-2, cols 6-8
(1,0) (1,1) (1,2)      rows 3-5, cols 0-2  │  rows 3-5, cols 3-5  │  rows 3-5, cols 6-8
(2,0) (2,1) (2,2)      rows 6-8, cols 0-2  │  rows 6-8, cols 3-5  │  rows 6-8, cols 6-8
```

**Conversion Formulas:**
```
blockRow = floor(rowIndex / 3)
blockCol = floor(colIndex / 3)
startRow = blockRow × 3
startCol = blockCol × 3
```

### 2.4 The Three Sudoku Constraints

Every valid Sudoku solution must satisfy ALL three constraints:

1. **Row Constraint** — Each digit 1–9 appears exactly once in every row
2. **Column Constraint** — Each digit 1–9 appears exactly once in every column
3. **Block Constraint** — Each digit 1–9 appears exactly once in every 3×3 block

---

## 3. Data Structures

### 3.1 Grid Representation

The grid is represented as a **9×9 two-dimensional array of integers**.

```
Grid[row][column] → integer

Values:
  0     = empty cell
  1–9   = filled cell with that digit
```

**Example:**
```
Grid[0][0] = 5  → Row 0, Column 0 contains the digit 5
Grid[4][7] = 0  → Row 4, Column 7 is empty
```

### 3.2 Puzzle Data Structure

Each puzzle should contain:

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Human-readable identifier |
| `difficulty` | String | Categorization (e.g., "easy", "medium", "hard") |
| `description` | String | Optional notes about the puzzle |
| `grid` | Integer[9][9] | The puzzle data |

### 3.3 Cell Coordinate

When algorithms need to track cell positions:

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `row` | Integer | 0–8 | Row index |
| `col` | Integer | 0–8 | Column index |

### 3.4 Candidate Set

For tracking possible digits in a cell:

```
CandidateSet = Set of integers, each in range 1–9
```

A cell with candidates {2, 5, 9} means only digits 2, 5, or 9 could legally be placed there.

---

## 4. Component Architecture

### 4.1 Design Principles

The architecture follows the **Single Responsibility Principle**—each component has exactly one reason to change:

| Component | Responsibility |
|-----------|----------------|
| **Puzzle Loader** | Loading and validating puzzle data from storage |
| **Solver** | Executing solving algorithms on a grid |
| **Orchestrator** | Coordinating algorithm execution strategy |
| **Display** | Presenting the grid and results to users |

### 4.2 Component Diagram

```
┌─────────────────┐
│  Data Source    │  (File, Database, API, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Puzzle Loader  │  Loads and validates puzzle data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Solver      │  Contains solving algorithm implementations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orchestrator   │  Applies algorithms in strategic order
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Display      │  Renders grid and status to user
└─────────────────┘
```

### 4.3 Data Flow

1. **Puzzle Loader** reads raw puzzle data and validates structure
2. **Solver** receives a grid and stores two copies:
   - Original grid (immutable reference)
   - Working grid (modified during solving)
3. **Orchestrator** calls solver methods in a loop until solved or stuck
4. **Display** renders the working grid and final status

### 4.4 Component Specifications

#### 4.4.1 Puzzle Loader

**Purpose:** Load puzzles from storage and validate their structure.

**Required Operations:**
| Operation | Input | Output | Description |
|-----------|-------|--------|-------------|
| `loadAll` | None | List of Puzzles | Load all available puzzles |
| `loadByName` | String (name) | Puzzle or null | Load a specific puzzle |

**Validation Rules:** See Section 7.

#### 4.4.2 Solver

**Purpose:** Provide solving algorithm implementations.

**State:**
- `originalGrid` — Immutable copy of the input puzzle
- `workingGrid` — Mutable copy that algorithms modify

**Required Operations:**
| Operation | Input | Output | Description |
|-----------|-------|--------|-------------|
| `unitCompletion` | None | Boolean | Apply unit completion; returns true if any cell changed |
| `hiddenSingles` | Integer (digit) | Boolean | Apply hidden singles for one digit; returns true if any cell changed |
| `nakedSingles` | None | Boolean | Apply naked singles; returns true if any cell changed |
| `getGrid` | None | Integer[9][9] | Return current working grid state |

**Helper Operations:** (May be private/internal)
| Operation | Input | Output | Description |
|-----------|-------|--------|-------------|
| `isInRow` | digit, rowIndex | Boolean | Check if digit exists in row |
| `isInColumn` | digit, colIndex | Boolean | Check if digit exists in column |
| `isInBlock` | digit, blockRow, blockCol | Boolean | Check if digit exists in block |
| `getCandidates` | rowIndex, colIndex | Set of Integers | Get all valid candidates for a cell |
| `getEmptyCellsInBlock` | blockRow, blockCol | List of Coordinates | Get coordinates of empty cells in block |

#### 4.4.3 Orchestrator

**Purpose:** Coordinate algorithm execution in optimal order.

**Required Operations:**
| Operation | Input | Output | Description |
|-----------|-------|--------|-------------|
| `solve` | None | String | Execute solving loop; returns "SOLVED" or "STUCK" |
| `isComplete` | None | Boolean | Check if all 81 cells are filled |

#### 4.4.4 Display

**Purpose:** Render the grid and status to the user interface.

**Required Operations:**
| Operation | Input | Output | Description |
|-----------|-------|--------|-------------|
| `renderGrid` | Integer[9][9] | None | Display the grid |
| `renderStatus` | String | None | Display solver result |
| `run` | None | None | Execute the full display workflow |

---

## 5. Solving Algorithms

This section provides detailed specifications for each algorithm. Implementations should follow these specifications exactly.

### 5.1 Unit Completion

**Classification:** Simplest technique
**Complexity:** O(n) per unit where n = 9
**Human Analogy:** "This row has 8 numbers filled in, so the empty cell must be the missing number."

#### 5.1.1 Algorithm Description

Unit Completion solves units (rows, columns, or blocks) that have exactly one empty cell. When 8 of 9 cells are filled, the missing digit can be directly calculated.

#### 5.1.2 Pseudocode

```
FUNCTION unitCompletion() → Boolean
    changed ← FALSE

    // Check all rows
    FOR row ← 0 TO 8
        emptyCells ← findEmptyCellsInRow(row)
        IF count(emptyCells) = 1 THEN
            emptyCol ← emptyCells[0].column
            missingDigit ← calculateMissingDigit(getRowValues(row))
            grid[row][emptyCol] ← missingDigit
            changed ← TRUE
        END IF
    END FOR

    // Check all columns
    FOR col ← 0 TO 8
        emptyCells ← findEmptyCellsInColumn(col)
        IF count(emptyCells) = 1 THEN
            emptyRow ← emptyCells[0].row
            missingDigit ← calculateMissingDigit(getColumnValues(col))
            grid[emptyRow][col] ← missingDigit
            changed ← TRUE
        END IF
    END FOR

    // Check all blocks
    FOR blockRow ← 0 TO 2
        FOR blockCol ← 0 TO 2
            emptyCells ← findEmptyCellsInBlock(blockRow, blockCol)
            IF count(emptyCells) = 1 THEN
                cell ← emptyCells[0]
                missingDigit ← calculateMissingDigit(getBlockValues(blockRow, blockCol))
                grid[cell.row][cell.col] ← missingDigit
                changed ← TRUE
            END IF
        END FOR
    END FOR

    RETURN changed
END FUNCTION
```

#### 5.1.3 Helper: Calculate Missing Digit

```
FUNCTION calculateMissingDigit(values[]) → Integer
    // Sum of 1-9 = 45
    // Missing digit = 45 - sum of existing values
    sum ← 0
    FOR EACH value IN values
        IF value ≠ 0 THEN
            sum ← sum + value
        END IF
    END FOR
    RETURN 45 - sum
END FUNCTION
```

#### 5.1.4 Example

Before:
```
Row 3: [4, 1, 9, 5, 0, 8, 7, 3, 2]
                   ↑
              Only empty cell
```

Calculation:
```
Present digits: 4 + 1 + 9 + 5 + 8 + 7 + 3 + 2 = 39
Missing digit: 45 - 39 = 6
```

After:
```
Row 3: [4, 1, 9, 5, 6, 8, 7, 3, 2]
```

---

### 5.2 Hidden Singles

**Classification:** Intermediate technique
**Complexity:** O(n) per digit per block
**Human Analogy:** "In this 3×3 block, the digit 7 can only go in one cell because all other empty cells see a 7 in their row or column."

#### 5.2.1 Algorithm Description

A **Hidden Single** occurs when a digit has only one legal placement within a unit (block, row, or column), even though that cell might have multiple candidates.

This specification covers the **block-based** hidden singles technique. The algorithm:
1. Takes a target digit (1–9)
2. For each 3×3 block:
   - Skip if the digit already exists in the block
   - Find all empty cells in the block
   - Filter to cells where the digit is not in their row AND not in their column
   - If exactly one cell remains, place the digit there

#### 5.2.2 Pseudocode

```
FUNCTION hiddenSingles(targetDigit) → Boolean
    changed ← FALSE

    FOR blockRow ← 0 TO 2
        FOR blockCol ← 0 TO 2
            // Skip if digit already placed in this block
            IF isInBlock(targetDigit, blockRow, blockCol) THEN
                CONTINUE
            END IF

            // Find empty cells where target digit is a valid candidate
            emptyCells ← getEmptyCellsInBlock(blockRow, blockCol)
            validCells ← []

            FOR EACH cell IN emptyCells
                rowHasDigit ← isInRow(targetDigit, cell.row)
                colHasDigit ← isInColumn(targetDigit, cell.col)

                IF NOT rowHasDigit AND NOT colHasDigit THEN
                    validCells.add(cell)
                END IF
            END FOR

            // If exactly one valid cell, place the digit
            IF count(validCells) = 1 THEN
                cell ← validCells[0]
                grid[cell.row][cell.col] ← targetDigit
                changed ← TRUE
            END IF
        END FOR
    END FOR

    RETURN changed
END FUNCTION
```

#### 5.2.3 Example

Consider finding where digit **7** can go in block (1,1):

```
Block (1,1) covers rows 3-5, cols 3-5:

      Col 3  Col 4  Col 5
Row 3   2      0      8      ← Row 3 already has a 7 elsewhere
Row 4   0      0      3      ← Row 4 has no 7
Row 5   6      4      0      ← Row 5 has no 7

Column analysis:
- Col 3 has a 7 in row 0
- Col 4 has no 7
- Col 5 has a 7 in row 7
```

Empty cells: (3,4), (4,3), (4,4), (5,5)

Filtering for digit 7:
- (3,4) — Row 3 has 7 → INVALID
- (4,3) — Col 3 has 7 → INVALID
- (4,4) — Row OK, Col OK → VALID ✓
- (5,5) — Col 5 has 7 → INVALID

Only one valid cell: (4,4) → Place 7 there.

---

### 5.3 Naked Singles

**Classification:** Most thorough technique
**Complexity:** O(n²) where n = 9 (examines all 81 cells)
**Human Analogy:** "For this cell, I've checked its row, column, and block. Only one number is possible—it must go here."

#### 5.3.1 Algorithm Description

A **Naked Single** occurs when a cell has only one possible candidate after eliminating all digits seen in its row, column, and block.

The algorithm:
1. For each empty cell in the grid
2. Calculate all candidates (digits 1–9 minus those in the cell's row, column, and block)
3. If exactly one candidate remains, place it

#### 5.3.2 Pseudocode

```
FUNCTION nakedSingles() → Boolean
    changed ← FALSE

    FOR row ← 0 TO 8
        FOR col ← 0 TO 8
            // Skip filled cells
            IF grid[row][col] ≠ 0 THEN
                CONTINUE
            END IF

            candidates ← getCandidates(row, col)

            IF count(candidates) = 1 THEN
                digit ← candidates[0]
                grid[row][col] ← digit
                changed ← TRUE
            END IF
        END FOR
    END FOR

    RETURN changed
END FUNCTION
```

#### 5.3.3 Helper: Get Candidates for a Cell

```
FUNCTION getCandidates(row, col) → Set of Integers
    // Start with all possible digits
    candidates ← {1, 2, 3, 4, 5, 6, 7, 8, 9}

    // Remove digits in the same row
    FOR c ← 0 TO 8
        IF grid[row][c] ≠ 0 THEN
            candidates.remove(grid[row][c])
        END IF
    END FOR

    // Remove digits in the same column
    FOR r ← 0 TO 8
        IF grid[r][col] ≠ 0 THEN
            candidates.remove(grid[r][col])
        END IF
    END FOR

    // Remove digits in the same block
    blockRow ← floor(row / 3)
    blockCol ← floor(col / 3)
    startRow ← blockRow × 3
    startCol ← blockCol × 3

    FOR r ← startRow TO startRow + 2
        FOR c ← startCol TO startCol + 2
            IF grid[r][c] ≠ 0 THEN
                candidates.remove(grid[r][c])
            END IF
        END FOR
    END FOR

    RETURN candidates
END FUNCTION
```

#### 5.3.4 Example

Consider cell (2, 4):

```
Row 2: [3, 0, 1, 0, ?, 0, 9, 0, 7]  → Has: 3, 1, 9, 7
Col 4: [5, 8, ?, 6, 2, 4, ?, 1, ?]  → Has: 5, 8, 6, 2, 4, 1
Block (0,1): Contains 5, 8, 6, 1 additionally
```

Candidate calculation:
```
Start:    {1, 2, 3, 4, 5, 6, 7, 8, 9}
Row:      Remove {3, 1, 9, 7}  →  {2, 4, 5, 6, 8}
Column:   Remove {5, 8, 6, 2, 4, 1}  →  {remaining}
Block:    Remove any additional
Result:   {X}  ← If only one digit remains, place it
```

---

## 6. Orchestration Logic

### 6.1 Solving Strategy

The orchestrator applies algorithms in **order of increasing complexity**:

```
┌─────────────────────────────────────────────────────┐
│                  SOLVING LOOP                       │
│                                                     │
│   1. Unit Completion    (fastest, O(n))             │
│            ↓                                        │
│   2. Hidden Singles     (medium, O(n) × 9 digits)   │
│            ↓                                        │
│   3. Naked Singles      (slowest, O(n²))            │
│            ↓                                        │
│   ← Repeat while any technique makes progress →     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6.2 Orchestrator Pseudocode

```
FUNCTION solve() → String
    isProgressing ← TRUE

    WHILE isProgressing DO
        changedThisPass ← FALSE

        // Step 1: Apply Unit Completion (fastest)
        IF solver.unitCompletion() THEN
            changedThisPass ← TRUE
        END IF

        // Step 2: Apply Hidden Singles for each digit 1-9
        FOR digit ← 1 TO 9
            IF solver.hiddenSingles(digit) THEN
                changedThisPass ← TRUE
            END IF
        END FOR

        // Step 3: Apply Naked Singles (most thorough)
        IF solver.nakedSingles() THEN
            changedThisPass ← TRUE
        END IF

        // Check if any technique made progress
        isProgressing ← changedThisPass
    END WHILE

    // Determine final status
    IF isGridComplete() THEN
        RETURN "SOLVED"
    ELSE
        RETURN "STUCK_ON_ADVANCED_LOGIC"
    END IF
END FUNCTION
```

### 6.3 Completion Check

```
FUNCTION isGridComplete() → Boolean
    FOR row ← 0 TO 8
        FOR col ← 0 TO 8
            IF grid[row][col] = 0 THEN
                RETURN FALSE
            END IF
        END FOR
    END FOR
    RETURN TRUE
END FUNCTION
```

### 6.4 Why This Order?

| Technique | Why Run First/Last |
|-----------|-------------------|
| **Unit Completion** | Fastest check; filling one cell may create opportunities for the same technique elsewhere |
| **Hidden Singles** | Moderate cost; covers cases Unit Completion misses |
| **Naked Singles** | Most expensive; runs last as a thorough sweep |

The loop continues until **no technique makes any change**, indicating either success or that the puzzle requires techniques beyond this solver's capability.

---

## 7. Validation Rules

### 7.1 Puzzle Structure Validation

Before solving, validate the puzzle structure:

| Rule | Check | Error Message |
|------|-------|---------------|
| Grid exists | `grid ≠ null` | "Puzzle grid is missing" |
| Correct row count | `count(grid) = 9` | "Puzzle must have exactly 9 rows" |
| Correct column count | `count(grid[i]) = 9 for all i` | "Row {i} must have exactly 9 columns" |
| Valid cell values | `0 ≤ grid[r][c] ≤ 9` | "Invalid value at [{r}][{c}]: {value}" |
| Integer values | `isInteger(grid[r][c])` | "Cell at [{r}][{c}] must be an integer" |

### 7.2 Validation Pseudocode

```
FUNCTION validatePuzzle(puzzle) → void OR throw Error
    IF puzzle.grid = NULL THEN
        ERROR "Puzzle grid is missing"
    END IF

    IF count(puzzle.grid) ≠ 9 THEN
        ERROR "Puzzle must have exactly 9 rows"
    END IF

    FOR row ← 0 TO 8
        IF count(puzzle.grid[row]) ≠ 9 THEN
            ERROR "Row " + row + " must have exactly 9 columns"
        END IF

        FOR col ← 0 TO 8
            value ← puzzle.grid[row][col]

            IF NOT isInteger(value) THEN
                ERROR "Cell at [" + row + "][" + col + "] must be an integer"
            END IF

            IF value < 0 OR value > 9 THEN
                ERROR "Invalid value at [" + row + "][" + col + "]: " + value
            END IF
        END FOR
    END FOR
END FUNCTION
```

### 7.3 Constraint Validation (Optional)

For stricter validation, verify the input puzzle doesn't already violate Sudoku rules:

```
FUNCTION validateConstraints(grid) → Boolean
    // Check no duplicates in any row
    FOR row ← 0 TO 8
        seen ← empty set
        FOR col ← 0 TO 8
            value ← grid[row][col]
            IF value ≠ 0 THEN
                IF value IN seen THEN
                    RETURN FALSE  // Duplicate in row
                END IF
                seen.add(value)
            END IF
        END FOR
    END FOR

    // Similar checks for columns and blocks...
    // (implementation follows same pattern)

    RETURN TRUE
END FUNCTION
```

---

## 8. Expected Behaviors

### 8.1 Return Values

| Return Value | Meaning |
|--------------|---------|
| `"SOLVED"` | All 81 cells filled; puzzle complete |
| `"STUCK_ON_ADVANCED_LOGIC"` | No more moves possible with basic techniques; puzzle incomplete |

### 8.2 Immutability Contract

The solver MUST preserve the original puzzle state:

```
originalGrid should NEVER be modified after construction
workingGrid is the only grid that gets modified during solving
```

This enables:
- Comparison between original and solved state
- Reset functionality
- Audit trail of changes

### 8.3 Deep Copy Requirement

When initializing the working grid, a **deep copy** must be created:

```
// CORRECT: Deep copy
FOR row ← 0 TO 8
    workingGrid[row] ← copy of originalGrid[row]
END FOR

// WRONG: Shallow copy (both point to same data)
workingGrid ← originalGrid
```

### 8.4 Algorithm Independence

Each algorithm must be:
- **Callable independently** — Unit tests can call one algorithm in isolation
- **Side-effect contained** — Only modifies `workingGrid`
- **Return value accurate** — Returns `TRUE` only if at least one cell changed

### 8.5 Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty grid (all zeros) | Returns "STUCK_ON_ADVANCED_LOGIC" |
| Already solved grid | Returns "SOLVED" immediately |
| Invalid puzzle (violations) | Behavior undefined; validate before solving |
| Minimum 17 clues | May return "STUCK" (requires advanced techniques) |

---

## 9. Implementation Checklist

Use this checklist to verify your implementation is complete:

### 9.1 Data Structures

- [ ] Grid represented as 9×9 integer array
- [ ] Cell values use 0 for empty, 1–9 for filled
- [ ] Puzzle structure includes name, difficulty, description, grid
- [ ] Deep copy implemented for working grid

### 9.2 Solver Component

- [ ] Stores both original (immutable) and working (mutable) grids
- [ ] `unitCompletion()` implemented per specification
- [ ] `hiddenSingles(digit)` implemented per specification
- [ ] `nakedSingles()` implemented per specification
- [ ] All algorithms return boolean indicating if change was made
- [ ] Helper methods for row/column/block checks implemented

### 9.3 Orchestrator Component

- [ ] Main solve loop implemented
- [ ] Algorithms called in correct order: Unit → Hidden → Naked
- [ ] Hidden Singles called for all 9 digits
- [ ] Loop continues while progress is made
- [ ] Returns "SOLVED" or "STUCK_ON_ADVANCED_LOGIC"
- [ ] Completion check verifies no zeros remain

### 9.4 Puzzle Loader Component

- [ ] Load puzzles from data source
- [ ] Validate puzzle structure (9×9, values 0–9)
- [ ] Handle missing or malformed data gracefully

### 9.5 Display Component

- [ ] Render grid in readable format
- [ ] Show block boundaries visually
- [ ] Display solve result/status

### 9.6 Testing Recommendations

Test each algorithm independently:

| Test | Input | Expected |
|------|-------|----------|
| Unit Completion finds single empty in row | Row with 8 filled cells | Cell filled correctly |
| Unit Completion finds single empty in column | Column with 8 filled cells | Cell filled correctly |
| Unit Completion finds single empty in block | Block with 8 filled cells | Cell filled correctly |
| Hidden Singles places digit in block | Block where digit has only one valid cell | Cell filled correctly |
| Naked Singles finds cell with one candidate | Cell where elimination leaves one option | Cell filled correctly |
| Full solve on easy puzzle | Easy puzzle | Returns "SOLVED", grid complete |
| Full solve on impossible puzzle | Puzzle requiring advanced techniques | Returns "STUCK", grid incomplete |

---

## Appendix A: Quick Reference

### Block Index to Cell Range

| Block | blockRow | blockCol | Rows | Columns |
|-------|----------|----------|------|---------|
| 0 | 0 | 0 | 0–2 | 0–2 |
| 1 | 0 | 1 | 0–2 | 3–5 |
| 2 | 0 | 2 | 0–2 | 6–8 |
| 3 | 1 | 0 | 3–5 | 0–2 |
| 4 | 1 | 1 | 3–5 | 3–5 |
| 5 | 1 | 2 | 3–5 | 6–8 |
| 6 | 2 | 0 | 6–8 | 0–2 |
| 7 | 2 | 1 | 6–8 | 3–5 |
| 8 | 2 | 2 | 6–8 | 6–8 |

### Algorithm Comparison

| Algorithm | Finds | Complexity | When Most Useful |
|-----------|-------|------------|------------------|
| Unit Completion | Units with one empty | O(27) | Early solving |
| Hidden Singles | Digit with one valid cell in unit | O(81) per digit | Mid solving |
| Naked Singles | Cells with one candidate | O(81) | Late solving |

### Key Formulas

```
Block row from cell:     blockRow = floor(row / 3)
Block column from cell:  blockCol = floor(col / 3)
Block start row:         startRow = blockRow × 3
Block start column:      startCol = blockCol × 3
Missing digit in unit:   missing = 45 - sum(existing digits)
```

---

*End of Specification*
