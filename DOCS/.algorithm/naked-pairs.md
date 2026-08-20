# Naked Pairs Algorithm

**Version:** v1.0  
**Date:** 2026-08-20T15:30:00Z  
**Domain:** Sudoku Solving / Subset Elimination  
**Status:** Approved  

> Eliminates candidates from peer cells when two cells in a single unit share the exact same two candidates.

---

## Overview

The **Naked Pairs** algorithm is a foundational subset elimination technique. It operates on candidate sets $\mathcal{C}(r, c)$ of unsolved cells within any standard 9-cell unit (row, column, or $3 \times 3$ block).

When two empty cells within the same unit have candidate sets consisting of the exact same two numbers $\{d_1, d_2\}$, one cell must take $d_1$ and the other must take $d_2$. Although it is not yet known which cell takes which digit, it is mathematically certain that no other cell in that unit can contain either $d_1$ or $d_2$. Therefore, $d_1$ and $d_2$ can be safely eliminated from all other cells in that unit.

---

## Technique Summary

| # | Technique Name | Complexity | Difficulty to Detect | Frequency |
|---|---------------|------------|---------------------|-----------|
| 1 | Naked Pairs (Row) | $O(N^2)$ per unit | Moderate | Common |
| 2 | Naked Pairs (Column) | $O(N^2)$ per unit | Moderate | Common |
| 3 | Naked Pairs (Block) | $O(N^2)$ per unit | Moderate | Common |

---

## 1. Naked Pairs Algorithm

### Goal

Eliminate candidates from non-pair cells within a unit to reduce candidate ambiguity and unlock subsequent Naked or Hidden Singles.

### Technique

1. For a given unit $U \in \{\text{Rows}, \text{Columns}, \text{Blocks}\}$:
2. Identify all unsolved cells $c \in U$ that have exactly two candidates ($|\mathcal{C}(c)| = 2$).
3. Compare all pairs of two-candidate cells $(c_a, c_b)$ in $U$.
4. If $\mathcal{C}(c_a) == \mathcal{C}(c_b) == \{d_1, d_2\}$:
   - A Naked Pair is confirmed.
   - For every other unsolved cell $c_k \in U \setminus \{c_a, c_b\}$:
     - Remove $d_1$ and $d_2$ from $\mathcal{C}(c_k)$.
     - If at least one candidate was removed from $\mathcal{C}(c_k)$, record progress.

### Example

Consider Row 4 with unsolved cells $A, B, C, D$:
```
Row 4: [ 1, 9, _, _, 5, 6, _, _, 8 ]
         Col 3 (A)  Col 4 (B)  Col 7 (C)  Col 8 (D)

Candidate sets:
Cell A: {2, 7}
Cell B: {2, 7}
Cell C: {2, 3, 7}
Cell D: {3, 4}
```

- Cells $A$ and $B$ share the exact candidate set $\{2, 7\}$ in Row 4.
- **Naked Pair:** $\{2, 7\}$ in columns 3 and 4.
- **Action:** Eliminate 2 and 7 from all other cells in Row 4.
- **Result:**
  - Cell $C$ candidates $\{2, 3, 7\} \setminus \{2, 7\} \longrightarrow \{3\}$.
  - Cell $C$ is now immediately solvable as a **Naked Single 3**.

### Pseudocode

```
FUNCTION ApplyNakedPairs(grid, candidates):
    changed = FALSE

    FOR each unit U in {AllRows(grid), AllColumns(grid), AllBlocks(grid)}:
        // Find all empty cells in unit with exactly 2 candidates
        pair_candidates = []
        FOR each cell in U:
            IF grid[cell.r][cell.c] == 0 AND length(candidates[cell.r][cell.c]) == 2:
                pair_candidates.append(cell)

        // Check each pair of cells
        FOR i FROM 0 TO length(pair_candidates) - 1:
            FOR j FROM i + 1 TO length(pair_candidates):
                cell_a = pair_candidates[i]
                cell_b = pair_candidates[j]

                IF candidates[cell_a.r][cell_a.c] == candidates[cell_b.r][cell_b.c]:
                    pair_values = candidates[cell_a.r][cell_a.c] // {d1, d2}

                    // Eliminate pair_values from all other cells in unit U
                    FOR each other_cell in U:
                        IF other_cell != cell_a AND other_cell != cell_b AND grid[other_cell.r][other_cell.c] == 0:
                            FOR each digit in pair_values:
                                IF digit IN candidates[other_cell.r][other_cell.c]:
                                    REMOVE digit FROM candidates[other_cell.r][other_cell.c]
                                    changed = TRUE

    RETURN changed
```

### Complexity

- **Time Complexity:** $O(U \cdot K^2)$ where $U = 27$ units and $K \le 9$ empty cells per unit. With $N=9$, this is bounded by a constant $O(1)$ operations ($\approx 27 \times \binom{9}{2} \approx 972$ comparisons maximum).
- **Space Complexity:** $O(1)$ auxiliary space beyond the candidate matrix.
- **Detection Difficulty:** Moderate (requires candidate tracking).

### Implementation Reference

- TypeScript: `demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts` (SUD-33)
- Python: `demo-apps/demoapp002-python-pytest/demoapp002/sudoku_solver.py` (SUD-33)
- C#: `demo-apps/demoapp003-csharp-specflow/src/DemoApp003.Core/SudokuSolver.cs` (SUD-33)

---

## Complexity Analysis Summary

| Technique | Time (worst-case) | Space | Detection |
|-----------|-------------------|-------|-----------|
| Naked Pairs (Row) | $< 1\text{ms}$ | $O(1)$ | Moderate |
| Naked Pairs (Column) | $< 1\text{ms}$ | $O(1)$ | Moderate |
| Naked Pairs (Block) | $< 1\text{ms}$ | $O(1)$ | Moderate |

---

## Coverage and Limitations

### Handles
- Single-unit candidate conflicts where 2 digits are constrained to 2 cells.
- Unlocking hidden or naked singles that were previously blocked by redundant candidates.

### Cannot Handle
- Multi-unit intersection patterns (requires Pointing Pairs / Box-Line Reduction).
- Hidden pairs where extra candidates obscure the pair (requires Hidden Pairs).
- 2D grid patterns spanning multiple rows/columns (requires X-Wing).

---

## References

- [Sudoku Advanced Solver Overview](./sudoku-advanced-solver.md)
- [Design Document: Advanced Solving Techniques](../.design/advanced-solving-techniques.md)
