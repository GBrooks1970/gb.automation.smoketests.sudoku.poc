# X-Wing Algorithm

**Version:** v1.0  
**Date:** 2026-08-20T15:30:00Z  
**Domain:** Sudoku Solving / Fish Patterns  
**Status:** Approved  

> Eliminates candidates across two parallel rows or columns using a 2×2 rectangular grid intersection pattern.

---

## Overview

The **X-Wing** algorithm is a classical 2-dimensional single-digit fish pattern (the order-2 member of the Basic Fish family: X-Wing, Swordfish, Jellyfish).

It operates on a specific candidate digit $d \in \{1..9\}$ across two parallel lines (defining rows or defining columns). When digit $d$ can only appear in exactly two positions in line 1 and exactly two positions in line 2, and those positions share the exact same perpendicular coordinates, the four cells form the vertices of a rectangle (resembling an "X").

Because digit $d$ must occupy diagonally opposite corners of this rectangle, digit $d$ cannot appear anywhere else in the two perpendicular lines intersecting those corners. Therefore, digit $d$ can be eliminated from all other cells in those perpendicular lines.

---

## Technique Summary

| # | Technique Name | Complexity | Difficulty to Detect | Frequency |
|---|---------------|------------|---------------------|-----------|
| 1 | X-Wing (Row-Based) | $O(9 \cdot \binom{9}{2})$ | Complex | Occasional |
| 2 | X-Wing (Column-Based) | $O(9 \cdot \binom{9}{2})$ | Complex | Occasional |

---

## 1. X-Wing (Row-Based)

### Goal

Eliminate candidate digit $d$ from columns $c_1$ and $c_2$ outside of the two defining rows $r_1$ and $r_2$.

### Technique

1. For each candidate digit $d \in \{1..9\}$:
2. For each row $r \in \{0..8\}$:
   - Identify all columns $c$ in row $r$ where $d \in \mathcal{C}(r, c)$.
   - If row $r$ contains candidate $d$ in **exactly two columns** $(c_1, c_2)$:
     - Search for a second row $r' > r$ that also contains candidate $d$ in **exactly two columns**, which must be $(c_1, c_2)$.
3. If such a matching pair of rows $(r_1, r_2)$ and columns $(c_1, c_2)$ exists:
   - An X-Wing is formed.
   - For all other rows $r_k \notin \{r_1, r_2\}$:
     - Remove digit $d$ from $\mathcal{C}(r_k, c_1)$ and $\mathcal{C}(r_k, c_2)$.
     - If any candidate was removed, record progress.

### Example

Consider digit **7** in a puzzle grid:
```
           Col 1        Col 7
Row 1: ... [ . 7 . ] ... [ . 7 . ] ... (7 appears only in Col 1 & Col 7 of Row 1)
           ...          ...
Row 5: ... [ . 7 . ] ... [ . 7 . ] ... (7 appears only in Col 1 & Col 7 of Row 5)
```

- In Row 1, 7 can only go in `(1, 1)` or `(1, 7)`.
- In Row 5, 7 can only go in `(5, 1)` or `(5, 7)`.
- If `(1, 1)` is 7, then `(5, 7)` must be 7. If `(1, 7)` is 7, then `(5, 1)` must be 7.
- In either case, columns 1 and 7 have their 7's locked in rows 1 and 5.
- **Action:** Eliminate 7 from all other cells in Column 1 and Column 7 (e.g. at `(3, 1)`, `(8, 7)`, etc.).

---

## 2. X-Wing (Column-Based)

### Goal

Eliminate candidate digit $d$ from rows $r_1$ and $r_2$ outside of the two defining columns $c_1$ and $c_2$.

### Technique

1. For each candidate digit $d \in \{1..9\}$:
2. For each column $c \in \{0..8\}$:
   - Identify all rows $r$ in column $c$ where $d \in \mathcal{C}(r, c)$.
   - If column $c$ contains candidate $d$ in **exactly two rows** $(r_1, r_2)$:
     - Search for a second column $c' > c$ that also contains candidate $d$ in **exactly two rows**, which must be $(r_1, r_2)$.
3. If such a matching pair of columns $(c_1, c_2)$ and rows $(r_1, r_2)$ exists:
   - For all other columns $c_k \notin \{c_1, c_2\}$:
     - Remove digit $d$ from $\mathcal{C}(r_1, c_k)$ and $\mathcal{C}(r_2, c_k)$.
     - If any candidate was removed, record progress.

---

## Pseudocode

```
FUNCTION ApplyXWing(grid, candidates):
    changed = FALSE

    FOR digit FROM 1 TO 9:
        // --- 1. Row-based X-Wing ---
        row_candidates = MAP<row_idx, LIST<col_idx>>()
        FOR r FROM 0 TO 8:
            cols = []
            FOR c FROM 0 TO 8:
                IF grid[r][c] == 0 AND digit IN candidates[r][c]:
                    cols.append(c)
            IF length(cols) == 2:
                row_candidates[r] = cols

        FOR each (r1, r2) in Pairs(row_candidates.keys()):
            IF row_candidates[r1] == row_candidates[r2]: // same (c1, c2)
                c1 = row_candidates[r1][0]
                c2 = row_candidates[r1][1]

                // Eliminate digit from all other rows in col c1 and c2
                FOR r FROM 0 TO 8:
                    IF r != r1 AND r != r2 AND grid[r][c1] == 0:
                        IF digit IN candidates[r][c1]:
                            REMOVE digit FROM candidates[r][c1]
                            changed = TRUE
                    IF r != r1 AND r != r2 AND grid[r][c2] == 0:
                        IF digit IN candidates[r][c2]:
                            REMOVE digit FROM candidates[r][c2]
                            changed = TRUE

        // --- 2. Column-based X-Wing ---
        col_candidates = MAP<col_idx, LIST<row_idx>>()
        FOR c FROM 0 TO 8:
            rows = []
            FOR r FROM 0 TO 8:
                IF grid[r][c] == 0 AND digit IN candidates[r][c]:
                    rows.append(r)
            IF length(rows) == 2:
                col_candidates[c] = rows

        FOR each (c1, c2) in Pairs(col_candidates.keys()):
            IF col_candidates[c1] == col_candidates[c2]: // same (r1, r2)
                r1 = col_candidates[c1][0]
                r2 = col_candidates[c1][1]

                // Eliminate digit from all other cols in row r1 and r2
                FOR c FROM 0 TO 8:
                    IF c != c1 AND c != c2 AND grid[r1][c] == 0:
                        IF digit IN candidates[r1][c]:
                            REMOVE digit FROM candidates[r1][c]
                            changed = TRUE
                    IF c != c1 AND c != c2 AND grid[r2][c] == 0:
                        IF digit IN candidates[r2][c]:
                            REMOVE digit FROM candidates[r2][c]
                            changed = TRUE

    RETURN changed
```

---

## Complexity Analysis Summary

| Technique | Time (worst-case) | Space | Detection |
|-----------|-------------------|-------|-----------|
| X-Wing (Row-Based) | $O(9 \cdot \binom{9}{2}) \approx 324$ checks | $O(1)$ | Complex |
| X-Wing (Column-Based) | $O(9 \cdot \binom{9}{2}) \approx 324$ checks | $O(1)$ | Complex |

---

## Coverage and Limitations

### Handles
- 2D rectangle constraints across 2 rows × 2 columns or 2 columns × 2 rows.
- Unlocking deep single placements in medium-to-hard puzzles without guessing.

### Cannot Handle
- 3D fish patterns spanning 3 rows × 3 columns (requires Swordfish).
- 4D fish patterns spanning 4 rows × 4 columns (requires Jellyfish).
- Non-aligned multi-digit candidate chains (requires XY-Wing or Forcing Chains).

---

## References

- [Sudoku Advanced Solver Overview](./sudoku-advanced-solver.md)
- [Design Document: Advanced Solving Techniques](../.design/advanced-solving-techniques.md)
