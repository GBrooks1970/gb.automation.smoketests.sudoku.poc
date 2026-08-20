# Advanced Solving Techniques - Design Document

**Version:** v1.0  
**Date:** 2026-08-20T15:30:00Z  
**Author:** Portfolio worklist SUD-32 (BACKLOG-014)  
**Reviewer:** Antigravity / DeepMind  
**Status:** Approved  
**Decision:** DR-041  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis](#2-problem-analysis)
3. [Requirements](#3-requirements)
4. [Design Overview](#4-design-overview)
5. [Detailed Design](#5-detailed-design)
6. [Implementation Plan](#6-implementation-plan)
7. [Refactoring Strategy](#7-refactoring-strategy)
8. [Testing Strategy](#8-testing-strategy)
9. [Migration Path](#9-migration-path)
10. [Alternatives Considered](#10-alternatives-considered)
11. [Open Questions](#11-open-questions)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### Purpose

The existing Sudoku solver across all three parity Stacks (`DEMOAPP001_TYPESCRIPT_CYPRESS`, `DEMOAPP002_PYTHON_PYTEST`, and `DEMOAPP003_CSHARP_SPECFLOW`) implements three basic deterministic techniques:
1. **Unit Completion** (filling the 9th digit in a unit with 8 solved cells)
2. **Hidden Singles** (finding the only cell in a unit where a digit can legally be placed)
3. **Naked Singles** (finding a cell that has only one legal candidate remaining)

When a puzzle cannot be solved by these three basic techniques alone, the solver terminates with status `STUCK_ON_ADVANCED_LOGIC`.

This design document governs the deterministic advanced-technique extension (`BACKLOG-014` / `SUD-32`..`SUD-34`), establishing:
- A minimum initial scope consisting of **Naked Pairs** and **X-Wing**.
- An explicit **no-guessing boundary** (pure logical deduction; no backtracking or trial-and-error under the solver API).
- The technique execution order within the solver and orchestrator loop.
- Unified attempt, change, and audit semantics preserving DR-037 (`AttemptEvent` contract) and DR-038 (component-coverage floors and mutation-sensitive testing).
- Candidate tracking and candidate elimination data models.
- Representative fixtures and the canonical-feature-first three-Stack rollout process.

### Scope

**In Scope:**
- Architectural design for candidate matrix representation across all three Stacks.
- Specification of **Naked Pairs** (subset elimination in rows, columns, and 3×3 blocks).
- Specification of **X-Wing** (fish pattern candidate elimination across 2 rows × 2 columns, and 2 columns × 2 rows).
- Technique ordering in `SudokuOrchestrator`: Unit Completion → Hidden Singles (digits 1..9) → Naked Singles → Naked Pairs → X-Wing.
- Attempt event emission (`AttemptEvent`) for advanced techniques with immutable before/after evidence.
- Canonical Gherkin feature specification (`features-shared/`) and three-Stack parity contracts.

**Out of Scope:**
- Backtracking, depth-first search, or guessing algorithms (strictly forbidden under the solver API per DR-041).
- Higher-order techniques (Hidden Pairs, Naked/Hidden Triples, Swordfish, Jellyfish, XY-Wing, Coloring, Forcing Chains) — reserved for future roadmap increments.
- Production code modifications in SUD-32 (SUD-32 is docs-only; implementation is staged in SUD-33 and SUD-34).

### Key Decisions

1. **Deterministic Candidate-Elimination Pipeline (DR-041):** Advanced techniques operate by eliminating invalid candidates from peer cells, unlocking subsequent basic placements (Naked Singles / Hidden Singles) in subsequent loop iterations.
2. **Strict No-Guessing Guarantee (DR-041):** The solver remains 100% human-deductive and deterministic. Puzzles that exceed the combined basic + advanced capability continue to return `STUCK_ON_ADVANCED_LOGIC`.
3. **Preservation of DR-037 and DR-038:** Every advanced technique attempt emits an immutable `AttemptEvent`. Coverage floors (Node 70%/85%/75%, Python 85%, C# 80%/80%) and focused mutation tests apply to all new solver methods.
4. **Canonical-Feature-First Multi-Stack Parity:** Canonical Gherkin scenarios under `features-shared/` are authored first, then propagated unchanged to `demoapp001`, `demoapp002`, and `demoapp003`.

### Success Criteria

- Language-neutral algorithm pseudocode and complexity specifications published under `DOCS/.algorithm/` for Naked Pairs and X-Wing.
- Seamless integration into `SudokuSolver` and `SudokuOrchestrator` without breaking existing simple, logic-squeeze, or already-solved puzzle fixtures.
- 100% test pass rate and zero parity drift across TypeScript, Python, and C# Stacks upon rollout.

---

## 2. Problem Analysis

### Current State

The current solver pipeline across all Stacks operates directly on a 9×9 integer grid:
- Empty cells are represented by `0` (or empty values).
- The orchestrator runs an iteration loop:
  1. Checks if the grid is already solved (`isGridFull` / `is_grid_full` / `IsGridFull`) → returns `SOLVED` with 0 iterations and 0 events.
  2. Applies `UnitCompletion` (row, column, block).
  3. Applies `HiddenSingles` for target numbers 1 through 9.
  4. Applies `NakedSingles` across all empty cells.
  5. If any cell was changed, increments `iteration` and repeats from step 1.
  6. If no cell was changed, exits loop and returns `STUCK_ON_ADVANCED_LOGIC`.

While effective for easy and moderate puzzles, medium-hard to difficult puzzles frequently require candidate reductions (such as Naked Pairs eliminating candidates in a shared block or row) or global geometric patterns (such as X-Wing eliminating candidates in parallel columns) before any single cell can be definitively placed.

### Root Cause Analysis

Basic techniques only place numbers when a cell has a single candidate (Naked Single) or a unit has a single cell for a digit (Hidden Single). They do not reduce the candidate sets of *other* cells based on multi-cell constraints. Without candidate elimination, the candidate count for intermediate cells remains $\ge 2$, causing basic techniques to report no progress.

### Constraints and Assumptions

- **Purity:** Candidate calculation must be a pure function of the current 9×9 grid state and Sudoku rules (row, column, 3×3 box uniqueness).
- **Parity:** All three Stacks must calculate candidate sets deterministically and identically.
- **Audit Compatibility:** `AuditTrail` records successful cell placements. Candidate eliminations that do not immediately place a digit do not corrupt cell values; when candidate eliminations enable subsequent single placements, the resulting cell changes are recorded under the technique that performed the placement, while the attempt event stream (`AttemptEvent`) records the execution of the advanced technique.

---

## 3. Requirements

### Functional Requirements

- **FR-01: Candidate Matrix Generation:** The solver must be capable of computing the candidate set $\mathcal{C}(r, c) \subseteq \{1..9\}$ for every cell $(r, c)$ in the 9×9 grid.
- **FR-02: Naked Pairs Technique:**
  - Identifies two empty cells within the same unit (row, column, or block) that share the exact same two candidates $\{d_1, d_2\}$ with $|\mathcal{C}| = 2$.
  - Eliminates $d_1$ and $d_2$ from all other empty cells in that same unit.
  - Returns `true` if at least one candidate was eliminated; `false` otherwise.
- **FR-03: X-Wing Technique:**
  - **Row-based X-Wing:** Identifies two rows where a candidate digit $d$ appears in exactly two columns $c_1, c_2$. If both rows share the same column pair $(c_1, c_2)$, digit $d$ is eliminated from all other cells in columns $c_1$ and $c_2$.
  - **Column-based X-Wing:** Identifies two columns where a candidate digit $d$ appears in exactly two rows $r_1, r_2$. If both columns share the same row pair $(r_1, r_2)$, digit $d$ is eliminated from all other cells in rows $r_1$ and $r_2$.
  - Returns `true` if at least one candidate was eliminated; `false` otherwise.
- **FR-04: Orchestration Integration:** Advanced techniques are executed in priority order after basic techniques:
  $$\text{UnitCompletion} \longrightarrow \text{HiddenSingles}(1..9) \longrightarrow \text{NakedSingles} \longrightarrow \text{NakedPairs} \longrightarrow \text{XWing}$$
- **FR-05: Attempt Event Logging:** Each invocation of `NakedPairs` and `XWing` emits an immutable `AttemptEvent` containing `iteration`, `technique`, `changed`, and snapshot evidence.

### Non-Functional Requirements

- **NFR-01: Determinism:** Given the same input grid, the solver must produce the exact same sequence of decisions across TypeScript, Python, and C#.
- **NFR-02: Zero Regression:** All 48 existing canonical scenarios must continue to pass with identical outcomes.
- **NFR-03: Performance:** Candidate computation and advanced technique scans must complete within $< 10\text{ms}$ per puzzle on modern hardware.
- **NFR-04: Coverage & Mutation Policy:** All new production methods must meet DR-038 coverage thresholds and include mutation-sensitive negative tests.

---

## 4. Design Overview

### Candidate Model Architecture

A candidate set $\mathcal{C}(r, c)$ for cell $(r, c)$ contains all digits $d \in \{1..9\}$ such that:
1. $\text{grid}[r][c] == 0$ (the cell is empty).
2. $d$ is not present in row $r$.
3. $d$ is not present in column $c$.
4. $d$ is not present in the $3 \times 3$ block containing $(r, c)$.

```
+-------------------------------------------------------------+
|                      SudokuOrchestrator                     |
+-------------------------------------------------------------+
                              |
                     [ Iteration Loop ]
                              |
    +-------------------------+-------------------------+
    | 1. Unit Completion (Row, Col, Block)             |
    | 2. Hidden Singles (Digits 1..9)                  |
    | 3. Naked Singles (Cell by Cell)                  |
    |                                                         |
    | [ If No Basic Progress -> Compute Candidates ]          |
    |                                                         |
    | 4. Naked Pairs (Row, Col, Block eliminations)    |
    |    - If candidates eliminated -> Restart Loop           |
    |                                                         |
    | 5. X-Wing (Row-wise & Column-wise eliminations)  |
    |    - If candidates eliminated -> Restart Loop           |
    +---------------------------------------------------------+
                              |
             [ Solved? -> SOLVED (exit 0) ]
     [ No Progress -> STUCK_ON_ADVANCED_LOGIC (exit 0) ]
```

---

## 5. Detailed Design

### 5.1 Candidate Model & Data Structures

Across all three Stacks, candidate sets are managed with deterministic collections:
- **TypeScript:** `Map<string, Set<number>>` or `number[][][]` (array of candidate arrays per cell).
- **Python:** `dict[tuple[int, int], set[int]]` or `list[list[set[int]]]`.
- **C#:** `Dictionary<(int Row, int Col), HashSet<int>>` or `HashSet<int>[,]`.

### 5.2 Naked Pairs Algorithm Specification

1. **Unit Traversal:** Iterate through all 27 units (9 rows, 9 columns, 9 blocks).
2. **Pair Identification:** In the unit, find all empty cells with $|\mathcal{C}(r, c)| == 2$.
3. **Match Matching:** If two cells $c_a, c_b$ have identical candidate sets $\{d_1, d_2\}$:
   - For all other cells $c_k$ in the unit where $c_k \notin \{c_a, c_b\}$:
     - Remove $d_1$ and $d_2$ from $\mathcal{C}(c_k)$.
     - If any candidate was removed, mark `changed = true`.
4. **Return:** `true` if candidate eliminations occurred; `false` otherwise.

### 5.3 X-Wing Algorithm Specification

1. **Row-Based X-Wing:**
   - For each digit $d \in \{1..9\}$:
     - For each row $r$, find all column indices where $d \in \mathcal{C}(r, c)$.
     - If a row has exactly two column positions $(c_1, c_2)$ containing candidate $d$:
       - Search for another row $r'$ that also has candidate $d$ in *exactly* $(c_1, c_2)$.
       - When found, eliminate candidate $d$ from all other rows in columns $c_1$ and $c_2$ ($r_k \notin \{r, r'\}$).
2. **Column-Based X-Wing:**
   - For each digit $d \in \{1..9\}$:
     - For each column $c$, find all row indices where $d \in \mathcal{C}(r, c)$.
     - If a column has exactly two row positions $(r_1, r_2)$ containing candidate $d$:
       - Search for another column $c'$ that also has candidate $d$ in *exactly* $(r_1, r_2)$.
       - When found, eliminate candidate $d$ from all other columns in rows $r_1$ and $r_2$ ($c_k \notin \{c, c'\}$).
3. **Return:** `true` if candidate eliminations occurred; `false` otherwise.

### 5.4 Attempt Event Semantics

Following DR-037:
- `technique`: `"NakedPairs"` or `"XWing"`.
- `algorithmParam`: unit identifier for Naked Pairs (e.g. `"Row 4"`, `"Block 2"`) or digit identifier for X-Wing (e.g. `"Digit 7"`).
- `changed`: `true` if candidates were eliminated, unlocking cell changes; `false` if no elimination pattern was found.
- `cellsChanged`: list of cells affected by the elimination or resulting placement.

---

## 6. Implementation Plan

The multi-stack delivery is structured across three worklist items:

```
[SUD-32: Design & Governance] (Current Item - Docs Only)
  ├── DOCS/.design/advanced-solving-techniques.md
  ├── DOCS/.algorithm/naked-pairs.md
  ├── DOCS/.algorithm/x-wing.md
  └── decision-register.md (DR-041)
            │
            ▼
[SUD-33: Naked Pairs Implementation] (Code + Tests)
  ├── features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature (Canonical Scenarios)
  ├── DEMOAPP001 (TypeScript SudokuSolver.applyNakedPairs + tests)
  ├── DEMOAPP002 (Python SudokuSolver.apply_naked_pairs + tests)
  └── DEMOAPP003 (C# SudokuSolver.ApplyNakedPairs + tests)
            │
            ▼
[SUD-34: X-Wing Implementation & BACKLOG-014 Closeout] (Code + Tests + Docs)
  ├── features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature (Canonical Scenarios)
  ├── DEMOAPP001 (TypeScript SudokuSolver.applyXWing + tests)
  ├── DEMOAPP002 (Python SudokuSolver.apply_x_wing + tests)
  ├── DEMOAPP003 (C# SudokuSolver.ApplyXWing + tests)
  └── Full 3-Stack Parity & Coverage Floor Verification
```

---

## 7. Refactoring Strategy

- **Helper Isolation:** Grid peer calculation and unit iteration will be shared across techniques rather than duplicated.
- **Backwards Compatibility:** The core `solve()` API signature remains identical across all Stacks.

---

## 8. Testing Strategy

### 8.1 Representative Fixtures

1. **Naked Pairs Fixture (`NakedPairsRowGrid` / `NakedPairsBlockGrid`):**
   - A grid where basic singles stall, but a Naked Pair of $\{2, 7\}$ in Row 2 eliminates candidate 2 from cell $(2, 5)$, immediately making cell $(2, 5)$ a Naked Single 4.
2. **X-Wing Fixture (`XWingRowGrid` / `XWingColGrid`):**
   - A grid where candidate 7 appears only in columns 2 and 8 in both Row 1 and Row 5. Elimination of 7 from all other cells in columns 2 and 8 enables the solver to complete the puzzle.

### 8.2 Negative Controls & Mutation Testing

- **Technique Removal Mutation:** Removing `applyNakedPairs()` must cause the Naked Pairs fixture to fail with `STUCK_ON_ADVANCED_LOGIC`.
- **Order Mutation:** Inverting the execution order of Naked Pairs and X-Wing must be detected by the `AttemptEvent` observer.

---

## 9. Migration Path

- No breaking changes to existing public APIs, CLI, or OpenAPI contracts.
- `STUCK_ON_ADVANCED_LOGIC` remains the terminal status for puzzles requiring techniques beyond X-Wing.

---

## 10. Alternatives Considered

1. **Alternative 1: Add Backtracking / Recursive Guessing**
   - *Rejected:* Backtracking solves all puzzles blindly without human-pedagogical technique attribution, destroying the teaching value of the multi-stack exemplar.
2. **Alternative 2: Single-Stack Implementation First without Canonical Spec**
   - *Rejected:* Violates RA §5.5 and DR-024 (Canonical Feature Store change governance).

---

## 11. Open Questions

- *None:* Scope and boundaries are fully governed under DR-041.

---

## 12. Appendices

- [DR-041 in decision-register.md](../../decision-register.md)
- [Naked Pairs Algorithm Specification](../.algorithm/naked-pairs.md)
- [X-Wing Algorithm Specification](../.algorithm/x-wing.md)
