# Sudoku Advanced Solver Algorithm

This document describes advanced Sudoku solving techniques that extend beyond the [Basic Solver](./ALGORITHM_Sudoku_Basic_Solver.md). These techniques are required when the basic methods (Unit Completion, Hidden Singles, Naked Singles) cannot make further progress.

## Overview

The advanced techniques are organized into three categories by complexity:

**Subset Techniques (Moderate)**
1. **Naked Pairs** - Two cells with same two candidates
2. **Hidden Pairs** - Two digits restricted to two cells
3. **Naked Triples** - Three cells sharing three candidates
4. **Hidden Triples** - Three digits restricted to three cells

**Fish Patterns (Complex)**
5. **X-Wing** - Rectangle pattern eliminating candidates
6. **Swordfish** - 3×3 extension of X-Wing
7. **Jellyfish** - 4×4 extension of X-Wing

**Chain Techniques (Advanced)**
8. **XY-Wing** - Three-cell pivot chain
9. **Simple Coloring** - Candidate coloring for eliminations
10. **Forcing Chains** - Logical deduction chains

These techniques work by eliminating candidates from cells, not by directly placing digits. A candidate tracking system is required.

---

## Prerequisites: Candidate Notation

Advanced techniques require tracking all possible values (candidates) for each empty cell.

### Candidate Grid Setup

```
FUNCTION InitializeCandidates():
    FOR each empty_cell in grid:
        candidates[cell] = {1..9}
        REMOVE values found in cell.row
        REMOVE values found in cell.col
        REMOVE values found in cell.block
    RETURN candidates
```

### Visual Notation Example
```
┌───────────┬───────────┬───────────┐
│ 123  4   5│ 6   78  9 │ 12  3   4 │
│ 56   7   8│ 9   12  3 │ 45  6   7 │
│ 8    9   1│ 23  4   5 │ 6   78  9 │
└───────────┴───────────┴───────────┘
Small digits = candidates, Large digits = solved cells
```

---

## 1. Naked Pairs Algorithm

### Goal
Eliminate candidates when two cells in a unit share exactly two candidates.

### Technique
If two cells in the same row, column, or block have only the same two candidates (e.g., {3,7} and {3,7}), those two digits must go in those two cells. Therefore, remove those candidates from all other cells in that unit.

### Example
```
Row 5: [_, _, 1, _, 5, 6, 7, 8, 9]
        A  B     C

Cell A candidates: {2, 4}
Cell B candidates: {2, 4}
Cell C candidates: {2, 3, 4}
```
Cells A and B form a **Naked Pair** for {2, 4}.
Result: Remove 2 and 4 from Cell C → Cell C becomes {3} → place 3.

### Why "Naked Pair"?
The pair is "naked" because the candidates are fully visible and exclusive to those two cells.

### Pseudocode

```
FUNCTION NakedPairs():
    FOR each unit (row, column, or block):
        // Find all cells with exactly 2 candidates
        pair_cells = cells in unit WHERE length(candidates) == 2

        FOR each combination of 2 cells from pair_cells:
            IF cell1.candidates == cell2.candidates:
                pair_values = cell1.candidates

                // Remove pair_values from all other cells in unit
                FOR each other_cell in unit:
                    IF other_cell NOT IN {cell1, cell2}:
                        IF candidates_changed(other_cell, pair_values):
                            RETURN TRUE
    RETURN FALSE
```

### Complexity
- **Time**: O(n²) per unit - comparing pairs of cells
- **Detection**: Moderate difficulty

---

## 2. Hidden Pairs Algorithm

### Goal
Find two digits that can only appear in two cells within a unit, then eliminate other candidates from those cells.

### Technique
If two digits are restricted to only two cells in a row, column, or block, those cells must contain those digits. Remove all other candidates from those two cells.

### Example
```
Block candidates:
[1,2,5] [3,4]   [3,4,5]
[6]     [7,8,9] [7,8,9]
[1,2,9] [3,4]   [3,4,5]
```
Digits 1 and 2 can only appear in cells [0,0] and [2,0].
Result: Remove 5 from [0,0] and 9 from [2,0].
Cells become {1,2} and {1,2} - now a Naked Pair!

### Why "Hidden Pair"?
The pair is "hidden" among other candidates in the cells. Unlike Naked Pairs where cells show only the pair values, Hidden Pairs require analyzing where digits can go.

### Pseudocode

```
FUNCTION HiddenPairs():
    FOR each unit (row, column, or block):
        // Map each digit to cells where it can appear
        digit_locations = map<digit, list<cell>>
        FOR digit FROM 1 TO 9:
            digit_locations[digit] = cells in unit where digit is candidate

        // Find two digits that share exactly two cells
        FOR each combination of 2 digits (d1, d2):
            IF length(digit_locations[d1]) == 2:
                IF digit_locations[d1] == digit_locations[d2]:
                    cells = digit_locations[d1]

                    // Remove all other candidates from these cells
                    FOR each cell in cells:
                        new_candidates = {d1, d2}
                        IF cell.candidates != new_candidates:
                            cell.candidates = new_candidates
                            RETURN TRUE
    RETURN FALSE
```

### Complexity
- **Time**: O(n²) per unit - checking digit combinations
- **Detection**: More difficult than Naked Pairs

---

## 3. Naked Triples Algorithm

### Goal
Extend Naked Pairs to three cells sharing three candidates.

### Technique
If three cells in a unit collectively contain only three candidates (each cell has 2-3 of those candidates), remove those candidates from all other cells in the unit.

### Example
```
Column 3:
Cell A: {1, 3}
Cell B: {1, 7}
Cell C: {3, 7}
Cell D: {1, 3, 5, 7}
```
Cells A, B, C form a **Naked Triple** for {1, 3, 7}.
Result: Remove 1, 3, 7 from Cell D → Cell D becomes {5}.

### Important Note
Not all three cells need all three candidates. The requirement is that the union of candidates across the three cells equals exactly three digits.

### Pseudocode

```
FUNCTION NakedTriples():
    FOR each unit (row, column, or block):
        // Find cells with 2-3 candidates
        candidate_cells = cells WHERE 2 <= length(candidates) <= 3

        FOR each combination of 3 cells from candidate_cells:
            union = cell1.candidates ∪ cell2.candidates ∪ cell3.candidates

            IF length(union) == 3:
                // Found a Naked Triple
                FOR each other_cell in unit:
                    IF other_cell NOT IN {cell1, cell2, cell3}:
                        IF remove_candidates(other_cell, union):
                            RETURN TRUE
    RETURN FALSE
```

### Complexity
- **Time**: O(n³) per unit - checking triple combinations
- **Detection**: Difficult - requires recognizing partial patterns

---

## 4. Hidden Triples Algorithm

### Goal
Find three digits restricted to three cells within a unit.

### Technique
If three digits can only appear in three specific cells within a unit, remove all other candidates from those cells.

### Pseudocode

```
FUNCTION HiddenTriples():
    FOR each unit (row, column, or block):
        digit_locations = map<digit, set<cell>>

        FOR each combination of 3 digits (d1, d2, d3):
            cells = digit_locations[d1] ∪ digit_locations[d2] ∪ digit_locations[d3]

            IF length(cells) == 3:
                // Found Hidden Triple - restrict cells to these digits
                FOR each cell in cells:
                    old_candidates = cell.candidates
                    cell.candidates = cell.candidates ∩ {d1, d2, d3}
                    IF old_candidates != cell.candidates:
                        RETURN TRUE
    RETURN FALSE
```

### Complexity
- **Time**: O(n³) per unit
- **Detection**: Very difficult - rarely needed in practice

---

## 5. X-Wing Algorithm

### Goal
Eliminate candidates using a rectangular pattern across two rows and two columns.

### Technique
When a candidate appears in exactly two cells in each of two different rows, AND those cells align in the same two columns, the candidate can be eliminated from all other cells in those columns.

### Example
```
      Col 2   Col 7
Row 1:  [3]    [3]     ← digit 3 only in these two cells
Row 6:  [3]    [3]     ← digit 3 only in these two cells
```
The 3's form a rectangle. In the final solution, 3's must be placed diagonally (either [1,2]+[6,7] or [1,7]+[6,2]).

Either way, columns 2 and 7 will each have a 3 in one of these rows.
Result: Remove 3 from all other cells in columns 2 and 7.

### Visual Pattern
```
    c1      c2
r1  [X]────[X]
     │      │
     │      │
r2  [X]────[X]
```

### Pseudocode

```
FUNCTION XWing():
    FOR digit FROM 1 TO 9:
        // Find rows where digit appears in exactly 2 cells
        FOR each row1 in grid:
            positions1 = columns where digit is candidate in row1
            IF length(positions1) != 2:
                CONTINUE

            FOR each row2 in grid WHERE row2 > row1:
                positions2 = columns where digit is candidate in row2

                IF positions1 == positions2:
                    // Found X-Wing! Eliminate from columns
                    col1, col2 = positions1
                    FOR each row NOT IN {row1, row2}:
                        IF remove_candidate(grid[row][col1], digit):
                            changed = TRUE
                        IF remove_candidate(grid[row][col2], digit):
                            changed = TRUE
                    IF changed:
                        RETURN TRUE

        // Also check column-based X-Wings (same logic, rows↔columns)
    RETURN FALSE
```

### Complexity
- **Time**: O(n²) for scanning rows/columns
- **Detection**: Moderate - pattern is distinctive

---

## 6. Swordfish Algorithm

### Goal
Extend X-Wing to three rows and three columns.

### Technique
When a candidate appears in 2-3 positions in each of three rows, AND all positions fall within the same three columns, eliminate that candidate from other cells in those columns.

### Example
```
        Col 1   Col 4   Col 8
Row 2:   [5]     [5]
Row 5:   [5]             [5]
Row 9:           [5]     [5]
```
Digit 5 forms a Swordfish pattern across 3 rows and 3 columns.
Result: Remove 5 from all other cells in columns 1, 4, and 8.

### Pseudocode

```
FUNCTION Swordfish():
    FOR digit FROM 1 TO 9:
        // Find rows where digit appears in 2-3 cells
        candidate_rows = []
        FOR each row:
            positions = columns where digit is candidate
            IF 2 <= length(positions) <= 3:
                candidate_rows.append({row, positions})

        FOR each combination of 3 rows from candidate_rows:
            all_columns = union of all positions
            IF length(all_columns) == 3:
                // Found Swordfish
                FOR each row NOT in selected_rows:
                    FOR each col in all_columns:
                        remove_candidate(grid[row][col], digit)
    RETURN changed
```

### Complexity
- **Time**: O(n³)
- **Detection**: Difficult - incomplete rectangles

---

## 7. Jellyfish Algorithm

### Goal
Extend pattern to four rows and four columns.

### Technique
Same logic as X-Wing and Swordfish, but with 4×4 pattern. If a digit appears in 2-4 positions in each of four rows, and all positions fall within four columns, eliminate from other cells in those columns.

### Pseudocode
Similar to Swordfish with combinations of 4 rows/columns.

### Complexity
- **Time**: O(n⁴)
- **Detection**: Rare - only needed for extreme puzzles

---

## 8. XY-Wing Algorithm

*Also known as: Y-Wing*

### Goal
Use three cells with bi-value candidates to eliminate a common candidate.

### Technique
Given three cells forming a hinge:
- **Pivot**: Has candidates {X, Y}
- **Wing 1**: Sees pivot, has candidates {X, Z}
- **Wing 2**: Sees pivot, has candidates {Y, Z}

Any cell that sees both wings cannot contain Z.

### Example
```
Pivot [4,4]: {3, 7}
Wing1 [4,8]: {3, 9}    ← shares 3 with pivot
Wing2 [6,4]: {7, 9}    ← shares 7 with pivot

Common candidate: 9
```
If pivot is 3 → Wing1 is 9
If pivot is 7 → Wing2 is 9
Either way, one wing is 9.

Result: Eliminate 9 from any cell that sees both wings.

### Visual Pattern
```
         Wing1 {X,Z}
            ↑
            │
Pivot {X,Y}─┘
   │
   └→ Wing2 {Y,Z}
```

### Pseudocode

```
FUNCTION XYWing():
    // Find all bi-value cells (exactly 2 candidates)
    bivalve_cells = cells WHERE length(candidates) == 2

    FOR each pivot in bivalve_cells:
        X, Y = pivot.candidates

        // Find wings that see the pivot
        FOR each wing1 in bivalve_cells that sees pivot:
            IF X IN wing1.candidates AND Y NOT IN wing1.candidates:
                Z = wing1.candidates - {X}  // The other candidate

                FOR each wing2 in bivalve_cells that sees pivot:
                    IF wing2 != wing1:
                        IF wing2.candidates == {Y, Z}:
                            // Found XY-Wing!
                            // Eliminate Z from cells seeing both wings
                            FOR each cell that sees wing1 AND wing2:
                                IF remove_candidate(cell, Z):
                                    RETURN TRUE
    RETURN FALSE
```

### Complexity
- **Time**: O(n³) - checking cell combinations
- **Detection**: Moderate - distinctive pattern

---

## 9. Simple Coloring Algorithm

### Goal
Use two-coloring to find candidate eliminations through chain logic.

### Technique
For a single digit, build chains of conjugate pairs (cells where the digit appears exactly twice in a unit). Color alternating cells in the chain with two colors. If a contradiction arises (two same-colored cells see each other), eliminate that color's cells.

### Example
```
For digit 5, starting at cell A:
A(blue) → B(green) → C(blue) → D(green)

If two blue cells see each other → contradiction
All blue cells cannot be 5 → place 5 in all green cells
```

### Coloring Rules
1. **Same unit, only 2 candidates**: Cells get opposite colors
2. **Color wrap**: If same color appears twice in a unit → that color is FALSE
3. **Color trap**: Cells seeing both colors → cannot contain the digit

### Pseudocode

```
FUNCTION SimpleColoring():
    FOR digit FROM 1 TO 9:
        // Build conjugate chains
        chains = find_conjugate_chains(digit)

        FOR each chain:
            color_map = two_color_chain(chain)  // Assigns BLUE/GREEN

            // Check for same-color conflicts
            FOR each unit:
                blue_in_unit = count cells with BLUE color in unit
                green_in_unit = count cells with GREEN color in unit

                IF blue_in_unit >= 2:
                    // Blue is false - green cells get the digit
                    place_digit_in_green_cells(digit)
                    RETURN TRUE
                IF green_in_unit >= 2:
                    place_digit_in_blue_cells(digit)
                    RETURN TRUE

            // Color trap - cells seeing both colors
            FOR each cell NOT in chain:
                IF cell sees BLUE cell AND cell sees GREEN cell:
                    remove_candidate(cell, digit)
    RETURN changed
```

### Complexity
- **Time**: O(n²) for chain building
- **Detection**: Complex - requires chain visualization

---

## 10. Forcing Chains Algorithm

### Goal
Prove a candidate must be true or false by following logical implications.

### Technique
For a cell with candidate X, assume X is true and follow all implications. Then assume X is false and follow implications. If both assumptions lead to the same conclusion for another cell, that conclusion must be true.

### Example
```
Cell A: {3, 7}

Assume A = 3:
  → B must be 5
  → C must be 9

Assume A = 7:
  → D must be 2
  → C must be 9

Both paths: C = 9
Result: Place 9 in cell C
```

### Types of Forcing Chains
1. **Cell Forcing Chain**: Multiple candidates in one cell all lead to same result
2. **Unit Forcing Chain**: All candidates for a digit in a unit lead to same result
3. **Contradiction Chain**: One assumption leads to impossibility

### Pseudocode

```
FUNCTION ForcingChain():
    FOR each cell with multiple candidates:
        results_map = map<cell, set<values>>

        FOR each candidate X in cell.candidates:
            // Temporarily assume cell = X
            implications = propagate_implications(cell, X)

            FOR each implied (target_cell, value) in implications:
                results_map[target_cell].add(value)

        // Check if all candidates lead to same conclusion
        FOR each target_cell in results_map:
            IF all candidates led to same value for target_cell:
                place_digit(target_cell, common_value)
                RETURN TRUE

    RETURN FALSE
```

### Complexity
- **Time**: O(n!) worst case - exponential chain exploration
- **Detection**: Very complex - requires deep lookahead

---

## Technique Selection Order

Apply techniques in order of complexity:

```
FUNCTION AdvancedSolve():
    WHILE grid not solved AND progress made:
        // Basic techniques first (from basic solver)
        TRY UnitCompletion()
        TRY HiddenSingles()
        TRY NakedSingles()

        // Intermediate techniques
        TRY NakedPairs()
        TRY HiddenPairs()
        TRY NakedTriples()
        TRY HiddenTriples()

        // Fish patterns
        TRY XWing()
        TRY Swordfish()
        TRY Jellyfish()

        // Chain techniques
        TRY XYWing()
        TRY SimpleColoring()
        TRY ForcingChains()

        IF no_progress:
            // Requires trial-and-error (backtracking)
            RETURN "REQUIRES_BACKTRACKING"

    RETURN "SOLVED"
```

---

## Complexity Analysis Summary

| Technique | Time Complexity | Detection Difficulty | Frequency in Puzzles |
|-----------|-----------------|---------------------|---------------------|
| Naked Pairs | O(n²) | Easy | Very Common |
| Hidden Pairs | O(n²) | Moderate | Common |
| Naked Triples | O(n³) | Moderate | Occasional |
| Hidden Triples | O(n³) | Hard | Rare |
| X-Wing | O(n²) | Moderate | Occasional |
| Swordfish | O(n³) | Hard | Rare |
| Jellyfish | O(n⁴) | Very Hard | Very Rare |
| XY-Wing | O(n³) | Moderate | Occasional |
| Simple Coloring | O(n²) | Hard | Rare |
| Forcing Chains | O(n!) | Very Hard | Very Rare |

---

## Puzzle Difficulty Coverage

### ✅ Solvable with Subset Techniques
- Hard puzzles from newspapers/magazines
- Most "Extreme" rated online puzzles
- Tournament-level puzzles (without "diabolical" rating)

### ✅ Solvable with Fish + Chain Techniques
- "Diabolical" rated puzzles
- Competition puzzles
- Handcrafted minimal-clue puzzles

### ❌ Requires Backtracking
- Puzzles with multiple solutions (invalid puzzles)
- Intentionally constructed "unsolvable by logic" puzzles
- Some 17-clue minimal puzzles

---

## Implementation Recommendations

### For TypeScript Implementation

1. **Add Candidate Tracking**
```typescript
interface Cell {
    value: number;           // 0 if empty
    candidates: Set<number>; // possible values if empty
}
```

2. **Implement in Phases**
   - Phase 1: Add candidate tracking to existing solver
   - Phase 2: Implement Naked/Hidden Pairs (most impact)
   - Phase 3: Implement X-Wing (moderate impact)
   - Phase 4: Implement remaining techniques as needed

3. **Test Coverage**
   - Each technique needs dedicated test puzzles
   - Use known puzzles from Sudoku communities
   - Verify eliminations don't break valid puzzles

### Files to Create
- `app_src/candidates/CandidateTracker.ts` - Candidate management
- `app_src/techniques/SubsetTechniques.ts` - Pairs, Triples
- `app_src/techniques/FishTechniques.ts` - X-Wing, Swordfish
- `app_src/techniques/ChainTechniques.ts` - XY-Wing, Coloring

---

## References

- [SudokuWiki Techniques](https://www.sudokuwiki.org/sudoku.htm)
- [Hodoku Solving Techniques](http://hodoku.sourceforge.net/en/techniques.php)
- [Andrew Stuart's Solver](https://www.sudokuwiki.org/sudoku.htm)
- [Basic Solver Documentation](./ALGORITHM_Sudoku_Basic_Solver.md)
- [Current TypeScript Implementation](../../DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts)
