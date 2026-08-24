# Sudoku Puzzle Generator, Uniqueness, and Difficulty Contracts — Design Document

**Version:** v1.0  
**Date:** 2026-08-24T20:12:00Z  
**Author:** Portfolio worklist SUD-38 (BACKLOG-016)  
**Reviewer:** Antigravity / DeepMind  
**Status:** Approved  
**Decision:** DR-043  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis & Non-Goals](#2-problem-analysis--non-goals)
3. [Architectural Principles & Isolation Rules](#3-architectural-principles--isolation-rules)
4. [Complete Solution Construction Strategy](#4-complete-solution-construction-strategy)
5. [Clue Removal & Solution-Uniqueness Oracle](#5-clue-removal--solution-uniqueness-oracle)
6. [Technique-Based Difficulty Grading Contract](#6-technique-based-difficulty-grading-contract)
7. [Repeatability & Seed Policy](#7-repeatability--seed-policy)
8. [Bounded Runtime & Failure Boundaries](#8-bounded-runtime--failure-boundaries)
9. [HTTP REST API & Service Specification](#9-http-rest-api--service-specification)
10. [Testing & Verification Strategy](#10-testing--verification-strategy)
11. [Multi-Stack Staging Roadmap](#11-multi-stack-staging-roadmap)
12. [Alternatives Considered](#12-alternatives-considered)
13. [References](#13-references)

---

## 1. Executive Summary

### 1.1 Purpose

The Sudoku solver platform across all three technology stacks (`DEMOAPP001_TYPESCRIPT_CYPRESS`, `DEMOAPP002_PYTHON_PYTEST`, `DEMOAPP003_CSHARP_SPECFLOW`) currently operates against static, pre-defined puzzle fixtures (`puzzles.json`). While DEMOAPP001 provides an Express REST API, a Web UI solver visualisation (`BACKLOG-018`), and an Interactive Sudoku Tutor (`BACKLOG-015` / `SUD-35`–`37`), the platform lacks dynamic puzzle generation capabilities.

This design document governs **`BACKLOG-016`** (Sudoku Puzzle Generator, Uniqueness Verification, and Difficulty Grading), establishing:
1. **Complete Solution Construction**: A seed-based pseudo-random solver search for generating fully valid 9×9 Sudoku solution grids.
2. **Clue Removal & Uniqueness Counting Oracle**: A deterministic clue-elimination process paired with an isolated solution-counting oracle verifying that exactly one unique solution exists.
3. **Technique-Based Difficulty Grading**: Grading based strictly on the highest-order governed technique required to solve the puzzle (`Easy` = Unit Completion / Hidden Singles; `Medium` = Naked Singles; `Hard` = Naked Pairs; `Expert` = X-Wing).
4. **Repeatability & Seed Policy**: Guaranteed 100% deterministic puzzle generation given any integer or string seed.
5. **Express REST API Contract**: `POST /api/generator/generate` in DEMOAPP001 with full OpenAPI 3.0 schema conformance.
6. **Strict Search Isolation**: Absolute isolation between puzzle generation/counting search and the public, deterministic, no-guessing `SudokuSolver` contract.

---

## 2. Problem Analysis & Non-Goals

### 2.1 Problem Analysis

Generating valid, high-quality Sudoku puzzles requires solving three distinct challenges:
- **Solution Construction**: Generating a fully populated 9×9 matrix adhering to all row, column, and 3×3 block constraints ($9 \times 9 = 81$ filled cells).
- **Symmetric Clue Removal with Uniqueness Assurance**: Digits must be removed from the full grid while ensuring the remaining clues allow **exactly one** valid solution. If multiple solutions exist, the puzzle is invalid.
- **Objective Difficulty Classification**: Clue count alone is a poor indicator of puzzle difficulty. A 30-clue puzzle requiring only Unit Completion is far easier than a 32-clue puzzle requiring an X-Wing elimination. Difficulty MUST be classified by the deterministic technique required to complete the board.

### 2.2 Non-Goals

- **No Silent Backtracking in `SudokuSolver`**: The public `SudokuSolver` MUST remain 100% deterministic and no-guessing. Generation/uniqueness search operates in an isolated module and NEVER alters solver rules.
- **No Non-Unique Puzzles**: Puzzles with zero or >1 solutions are strictly rejected by the generator engine.
- **No Unbounded Search**: Generation calls MUST operate within bounded attempt limits and time budgets ($< 250\text{ ms}$).

---

## 3. Architectural Principles & Isolation Rules

### 3.1 Strict Solver Contract Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PUBLIC DETERMINISTIC DOMAIN                           │
│                                                                             │
│   SudokuSolver.ts  ──►  Deterministic Techniques Only                        │
│                         (UnitCompletion ──► HiddenSingles ──► NakedSingles  │
│                          ──► NakedPairs ──► XWing)                          │
│                         NO GUESSING / NO BACKTRACKING                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ Uses solver to grade difficulty & verify
                                     │ no-guessing solve path
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GENERATOR & UNIQUENESS ISOLATED DOMAIN                   │
│                                                                             │
│   SudokuGeneratorService.ts ──► Seeded PRNG                                 │
│   SolutionConstruction.ts   ──► Backtracking Grid Fill                      │
│   UniquenessOracle.ts       ──► Dual-Search Solution Counter (Count = 1)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Isolation Invariant**: `SudokuSolver` remains completely free of search or trial-and-error logic.
2. **Deterministic Grading**: Generated puzzles are solved via `SudokuSolver` to capture the audit trail and measure the exact technique hierarchy required.
3. **Seeded PRNG**: All pseudo-random choices (initial digit placement, cell selection order, candidate ordering) consume a seed-governed PRNG (`LinearCongruentialGenerator` or `Mulberry32`).

---

## 4. Complete Solution Construction Strategy

### 4.1 Grid Initialization & Seeded Backtracking

To construct a full 9×9 Sudoku grid:
1. Initialize an empty 9×9 matrix ($81$ zeros).
2. Seed the PRNG with the supplied `seed` value.
3. Fill diagonal 3×3 blocks (Block 1, Block 5, Block 9) with shuffled digits $1..9$. (Diagonal blocks are mutually independent, ensuring zero initial conflict).
4. Apply a recursive backtracking solver over remaining empty cells:
   - For each empty cell, iterate through a PRNG-shuffled permutation of digits $1..9$.
   - Place a valid digit and recurse to the next cell.
   - If no valid digit exists, backtrack.
5. Terminate when cell 81 is successfully filled.

---

## 5. Clue Removal & Solution-Uniqueness Oracle

### 5.1 Clue Removal Algorithm

Given a completed 9×9 solution grid:
1. Initialize the clue grid as a copy of the solution grid (81 clues).
2. Generate a PRNG-shuffled list of cell coordinates $(r, c)$ for removal (supporting optional rotational symmetry).
3. For each coordinate $(r, c)$:
   - Temporarily clear cell $(r, c)$ ($0$).
   - Execute `UniquenessOracle.countSolutions(grid, maxCount = 2)`.
   - If `countSolutions` returns `1`: the removal is safe; keep cell cleared.
   - If `countSolutions` returns `> 1`: removing cell $(r, c)$ introduces multiple solutions; restore cell $(r, c)$ to its original value.
4. Continue until the target clue count or difficulty tier is satisfied or all cells have been tested.

### 5.2 Solution-Uniqueness Oracle

The `UniquenessOracle` counts how many valid completions exist for a given partial grid:
```typescript
export class UniquenessOracle {
  public static countSolutions(grid: number[][], limit: number = 2): number {
    let count = 0;
    function search(board: number[][]): boolean {
      const empty = findFirstEmpty(board);
      if (!empty) {
        count++;
        return count >= limit; // Early exit as soon as limit (2) is reached
      }
      const [r, c] = empty;
      for (let digit = 1; digit <= 9; digit++) {
        if (isValidPlacement(board, r, c, digit)) {
          board[r][c] = digit;
          if (search(board)) return true;
          board[r][c] = 0;
        }
      }
      return false;
    }
    search(deepCopy(grid));
    return count;
  }
}
```

---

## 6. Technique-Based Difficulty Grading Contract

Difficulty is determined by passing the generated puzzle to `SudokuSolver.solvePuzzleTrackingOrder()` and evaluating the audit trail:

| Difficulty Tier | Required Technique Threshold | Max Technique Used |
| :--- | :--- | :--- |
| **`Easy`** | Solvable using only **Unit Completion** and/or **Hidden Singles**. | `HiddenSingles` (or `UnitCompletion`) |
| **`Medium`** | Requires **Naked Singles** (beyond Unit Completion / Hidden Singles). | `NakedSingles` |
| **`Hard`** | Requires **Naked Pairs** (beyond basic techniques). | `NakedPairs` |
| **`Expert`** | Requires **X-Wing** (beyond Naked Pairs). | `XWing` |

If `SudokuSolver` returns `status: "STUCK"`, the puzzle requires techniques beyond the governed solver contract (e.g. Swordfish, XY-Wing) and is rejected by the generator for public tiers.

---

## 7. Repeatability & Seed Policy

- **Seed Parameter**: Accepts an integer or string seed (e.g. `12345` or `"portfolio-demo-seed"`).
- **PRNG Invariant**: Given the same seed, requested difficulty tier, and clue removal symmetry, the generator MUST produce the identical 9×9 puzzle grid across runs and environments.
- **Default Seed**: If omitted, the server uses `Date.now()`.

---

## 8. Bounded Runtime & Failure Boundaries

- **Max Search Attempts**: Solution construction backtracking is capped at 10,000 iterations per attempt.
- **Max Grid Retries**: If clue removal fails to achieve the target difficulty within 5 grid generation attempts, the generator throws a `GeneratorTimeoutError`.
- **Time Budget**: API endpoint response time target is $< 250\text{ ms}$.

---

## 9. HTTP REST API & Service Specification

### 9.1 Endpoint Contract

`POST /api/generator/generate`

#### Request Body Schema
```json
{
  "difficulty": "Easy" | "Medium" | "Hard" | "Expert",
  "seed": 12345,
  "symmetrical": true
}
```

#### Response Body Schema (`200 OK`)
```json
{
  "status": "SUCCESS",
  "puzzle": {
    "grid": [[0, 0, ...], ...],
    "solution": [[5, 3, ...], ...],
    "difficulty": "Easy",
    "clueCount": 36,
    "seed": 12345,
    "maxTechniqueRequired": "HiddenSingles"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid difficulty tier or malformed JSON body.
- `422 Unprocessable Entity`: Request parameters cannot yield a valid puzzle within bounds.

---

## 10. Testing & Verification Strategy

1. **Unit & Component Tests**:
   - `PRNG` seed determinism test.
   - `SolutionConstruction` 9×9 validity test (all rows/cols/blocks 1..9).
   - `UniquenessOracle` test (1 solution for valid puzzle, 2 solutions for non-unique puzzle).
   - `DifficultyGrading` test verifying exact tier assignment matching `AuditEvent` logs.
2. **OpenAPI Schema Contract**:
   - Redocly CLI lint of `POST /api/generator/generate` schema in `docs/openapi.yaml`.
   - OpenAPI response payload validation tests.
3. **Repository Parity & Governance**:
   - All 7 repository parity and currency scripts (`.batch/run-parity-checks.ps1`) PASS 100%.

---

## 11. Multi-Stack Staging Roadmap

Per Sudoku Solver Platform Specification v1.1 (§6.1):
- **Phase 1 (SUD-38..41)**: DEMOAPP001 (TypeScript) acts as the pioneer stack for puzzle generation, uniqueness oracle, difficulty grading, and Express REST API endpoint.
- **Phase 2 (Future)**: Python (DEMOAPP002) and C# (DEMOAPP003) generator parity modules added under separate worklist authorization.

---

## 12. Alternatives Considered

1. **Alternative: Allow guessing/backtracking in `SudokuSolver`**
   - *Rejected*: Violates DR-001 and DR-041 core invariants that the solver is strictly deterministic and no-guessing.
2. **Alternative: Grade difficulty by clue count alone**
   - *Rejected*: Clue count does not correlate reliably with cognitive difficulty; technique-based grading provides a true pedagogical metric.

---

## 13. References

- `DOCS/.design/sudoku-solver-platform-specification.md` — Platform Specification v1.1
- `DOCS/.design/interactive-sudoku-tutor.md` — Interactive Sudoku Tutor Design (DR-042)
- `decision-register.md` — DR-041 (Deterministic Advanced Techniques), DR-042 (Tutor Contract)
- `DOCS/.planning/backlog.md` — BACKLOG-016 (Puzzle Generator)
