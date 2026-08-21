# Interactive Sudoku Tutor — Design Document

**Version:** v1.0  
**Date:** 2026-08-20T23:55:00Z  
**Author:** Portfolio worklist SUD-35 (BACKLOG-015)  
**Reviewer:** Antigravity / DeepMind  
**Status:** Approved  
**Decision:** DR-042  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis](#2-problem-analysis)
3. [Requirements](#3-requirements)
4. [Architecture & Component Design](#4-architecture--component-design)
5. [Next-Move Hint Contract](#5-next-move-hint-contract)
6. [Human-Readable Rationale Generation](#6-human-readable-rationale-generation)
7. [API & Service Specification](#7-api--service-specification)
8. [Web UI Guided Tutor Design](#8-web-ui-guided-tutor-design)
9. [Testing Strategy](#9-testing-strategy)
10. [Multi-Stack Staging Roadmap](#10-multi-stack-staging-roadmap)
11. [Alternatives Considered](#11-alternatives-considered)
12. [References](#12-references)

---

## 1. Executive Summary

### 1.1 Purpose

The Sudoku solver platform across all three technology stacks (`DEMOAPP001_TYPESCRIPT_CYPRESS`, `DEMOAPP002_PYTHON_PYTEST`, `DEMOAPP003_CSHARP_SPECFLOW`) provides deterministic solving capabilities across five techniques: Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, and X-Wing.

In addition, DEMOAPP001 provides an Express REST API and a Web UI solver visualisation (`BACKLOG-018` / `LAND-09D`). However, the existing Web UI is purely a **read-only replay** of a completed solve payload. It does not allow users to interact with a custom or partial grid in real time, step through a puzzle move-by-move with guidance, or receive pedagogical explanations for *why* a specific digit or candidate elimination is recommended.

This design document governs **`BACKLOG-015`** (Interactive Sudoku Tutor), establishing:
1. The **Next-Move Hint Engine** service architecture, providing side-effect-free, single-step deterministic deduction consuming the existing solver and audit stream.
2. The **Hint Response Contract & Rationale Engine**, returning structured placement/elimination data paired with clear human-readable explanations.
3. The **HTTP REST API Contract** (`POST /api/tutor/hint`) within the DEMOAPP001 Express service.
4. The **Interactive Guided Tutor UI** within the DEMOAPP001 web application, reusing the existing grid, player, event log, and statistics components.
5. The **Multi-Stack Roadmap Strategy**, establishing DEMOAPP001 as the pioneer stack under the platform capability matrix (§6.1).

---

## 2. Problem Analysis

### 2.1 Limitations of Current Visualisation
- **Batch-Only Replay**: Current `/api/visualise/:name` executes the entire solve from initial state to finish in a single batch, producing a static 50+ event JSON array.
- **No Incremental Advice**: A user stuck on a puzzle cannot ask "What is my next best move?" for their current board state without running a full automated solve.
- **No Contextual Educational Explanations**: While `AuditEvent` records `{ row, col, val, algorithm }`, it does not generate human-friendly sentences explaining the elimination or placement logic (e.g. which row/column/block peers eliminated the other candidates).
- **Risk of Divergent Solver Implementations**: If the tutor creates its own separate solving logic, it risks drifting from the core solver and audit trail contract.

### 2.2 Core Architectural Principles
1. **Single Source of Truth**: The hint engine MUST NOT implement a second solving algorithm. It MUST delegate directly to `SudokuSolver` and inspect the resulting `AuditEvent` or single-step progress.
2. **Side-Effect-Free Evaluation**: Evaluating a hint on a given 9×9 grid MUST NOT mutate the input grid or global state.
3. **Deterministic Progression**: The hint returned MUST follow the exact priority order established by DR-041:
   $$\text{UnitCompletion} \longrightarrow \text{HiddenSingles}(1..9) \longrightarrow \text{NakedSingles} \longrightarrow \text{NakedPairs} \longrightarrow \text{XWing}$$
4. **Pedagogical Clarity**: Explanations must clearly identify the technique, target cell or units, affected digit(s), and the logical justification.

---

## 3. Requirements

### 3.1 Functional Requirements
- **FR-01 (Next-Move Hint)**: Given any valid 9×9 partial grid, the engine determines the single next logical move according to the deterministic technique hierarchy.
- **FR-02 (State Classification)**: The engine correctly classifies the grid state into:
  - `HINT_AVAILABLE`: A valid placement or candidate elimination was found.
  - `SOLVED`: The grid is already completely and correctly filled.
  - `STUCK_ON_ADVANCED_LOGIC`: No basic or intermediate technique makes progress.
  - `INVALID_GRID`: The provided grid violates Sudoku constraints (row/column/block duplicates or malformed dimensions).
- **FR-03 (Human Rationale)**: Every `HINT_AVAILABLE` response includes a natural-language `rationale` describing the logical deduction.
- **FR-04 (Candidate Eliminations)**: For candidate-elimination techniques (Naked Pairs, X-Wing), the response details eliminated digits and affected cells in addition to resulting placements.
- **FR-05 (HTTP Endpoint)**: Expose `POST /api/tutor/hint` accepting `{ grid: number[][] }` and returning the hint payload.
- **FR-06 (Guided Web UI)**: Provide an interactive mode in the DEMOAPP001 web interface allowing manual cell entry, one-click hint requests, visual cell highlighting, rationale display, and move application.

### 3.2 Non-Functional Requirements
- **NFR-01 (Performance)**: Hint generation response time < 25ms for any valid grid.
- **NFR-02 (Immutability)**: Complete isolation; caller-supplied data structures are preserved.
- **NFR-03 (API Compatibility)**: OpenAPI 3.0 specification conformance with strict schema validation.
- **NFR-04 (Zero Parity Regression)**: In-process `@util` surface and multi-stack parity checks remain 100% green.

---

## 4. Architecture & Component Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Web UI Guided Tutor                      │
│         (Interactive Grid, Hint Button, Rationale Box)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP POST /api/tutor/hint
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express REST API Router                     │
│               (app_src/server/index.ts)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               SudokuTutorService (NEW)                      │
│             (app_src/server/SudokuTutorService.ts)          │
│                                                             │
│  1. Validate grid structure & constraints                   │
│  2. Instantiate isolated SudokuSolver(gridCopy)             │
│  3. Execute single-step technique pass in DR-041 order      │
│  4. Extract move & candidate delta                          │
│  5. Generate human-readable rationale via RationaleGenerator│
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│         SudokuSolver         │ │      RationaleGenerator     │
│   (app_src/SudokuSolver.ts)  │ │(app_src/server/Rationale.ts)│
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 5. Next-Move Hint Contract

### 5.1 Hint Status Enum
```typescript
export enum HintStatus {
    HINT_AVAILABLE = 'HINT_AVAILABLE',
    SOLVED = 'SOLVED',
    STUCK_ON_ADVANCED_LOGIC = 'STUCK_ON_ADVANCED_LOGIC',
    INVALID_GRID = 'INVALID_GRID'
}
```

### 5.2 Hint Response Data Model
```typescript
export interface CellCoordinate {
    row: number; // 0-indexed (0..8)
    col: number; // 0-indexed (0..8)
}

export interface CandidateElimination {
    row: number;
    col: number;
    eliminatedDigits: number[];
}

export interface MoveRecommendation {
    cell: CellCoordinate;
    digit: number;
    previousValue: number;
}

export interface TutorHintResponse {
    status: HintStatus;
    technique: string | null; // e.g. 'UnitCompletion', 'HiddenSingles', 'NakedSingles', 'NakedPairs', 'XWing'
    move: MoveRecommendation | null;
    eliminations: CandidateElimination[];
    rationale: string;
    highlightCells: CellCoordinate[];
    highlightUnits?: {
        type: 'row' | 'col' | 'block';
        index: number;
    }[];
}
```

---

## 6. Human-Readable Rationale Generation

The `RationaleGenerator` translates solver actions and audit events into pedagogical explanations:

| Technique | Example Action | Generated Rationale |
|---|---|---|
| **Unit Completion** | Fills `(2, 4) = 7` | *"Row 3 currently contains 8 digits [1, 2, 3, 4, 5, 6, 8, 9]. The only missing digit to complete the unit is 7 at cell (3, 5)."* |
| **Hidden Singles** | Places `digit = 4` at `(0, 7)` | *"In Block 3, digit 4 cannot be placed in any other empty cell because all other cells share a row or column with existing 4s. Therefore, 4 must go in cell (1, 8)."* |
| **Naked Singles** | Places `digit = 9` at `(4, 4)` | *"Cell (5, 5) has candidate digit 9 only. All other digits (1-8) are eliminated by peers in its row, column, or 3×3 block."* |
| **Naked Pairs** | Eliminates `{3, 7}` from Row 1 | *"Cells (1, 2) and (1, 6) both contain only candidates {3, 7} in Row 1. These digits cannot appear elsewhere in Row 1, allowing 7 to be eliminated from cell (1, 8)."* |
| **X-Wing** | Eliminates candidate 7 | *"Candidate 7 appears exactly twice in Rows 2 and 5 at Columns 2 and 6, forming an X-Wing. Therefore, 7 can be safely eliminated from all other cells in Columns 2 and 6."* |
| **Already Solved** | - | *"The puzzle is already completely and correctly solved!"* |
| **Stuck** | - | *"No further progress can be made using the available basic and intermediate techniques (Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, X-Wing). Further solving requires advanced techniques or candidate chains."* |
| **Invalid Grid** | - | *"The grid contains conflicting digits violating Sudoku rules in row, column, or block."* |

---

## 7. API & Service Specification

### 7.1 HTTP Endpoint

- **Method**: `POST`
- **Path**: `/api/tutor/hint`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
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

### 7.2 Response Codes
- `200 OK`: Valid grid analysed, returns `TutorHintResponse`.
- `400 Bad Request`: Malformed payload (missing `grid`, non-array, wrong dimensions).
- `422 Unprocessable Entity`: Grid contains invalid cell values (outside range 0–9 or non-integer).

---

## 8. Web UI Guided Tutor Design

### 8.1 User Flow
1. **Input Grid**: User selects a preset puzzle from `puzzles.json` or manually inputs clues into the interactive 9×9 grid.
2. **Request Hint**: User clicks the **"Get Hint" / "Explain Next Move"** button.
3. **Visual Feedback**:
   - The target cell is highlighted with an active glowing border.
   - Related peer units (row, column, block) or X-Wing lines are subtly highlighted.
4. **Pedagogical Explanation**: The rationale box displays the technique badge, target coordinate, suggested value, and the detailed natural-language explanation.
5. **Apply Move**: User can click **"Apply Hint"** to update the grid with the single recommended move, or manually type their answer.

---

## 9. Testing Strategy

### 9.1 Component Tests
- `SudokuTutorService` unit tests verifying:
  - Unit Completion hint generation & rationale
  - Hidden Singles hint generation & rationale
  - Naked Singles hint generation & rationale
  - Naked Pairs hint generation & rationale
  - X-Wing hint generation & rationale
  - Solved grid detection
  - Stuck grid classification
  - Invalid grid rejection

### 9.2 API & OpenAPI Schema Tests
- Supertest integration tests covering `POST /api/tutor/hint` for `200`, `400`, `422` status codes.
- OpenAPI schema validation in `docs/openapi.yaml` via Redocly.

### 9.3 Browser & Smoke Verification
- Verify interactive guided mode in the web UI using the development server (`npm run start:web`).

---

## 10. Multi-Stack Staging Roadmap

Per the platform specification §6.1 capability matrix:
- **DEMOAPP001 (TypeScript)**: Pioneer stack delivering tutor service, REST API endpoint, and guided UI in SUD-36 and SUD-37.
- **DEMOAPP002 (Python)** & **DEMOAPP003 (C#)**: Staged on roadmap. Core solver & Screenplay parity remain unchanged across all three stacks.

---

## 11. Alternatives Considered

1. **Alternative: Replay full solve and pick step $N+1$**
   - *Rejected*: Inefficient for arbitrary custom user boards; does not handle custom user deviations from the standard solve path.
2. **Alternative: Build a standalone client-side JavaScript hint algorithm**
   - *Rejected*: Violates Single Responsibility and single-source-of-truth principles; client-side duplicate logic would drift from the governed solver.

---

## 12. References

- `DOCS/.design/sudoku-solver-platform-specification.md` (Platform Spec v1.1, DR-034)
- `DOCS/.design/advanced-solving-techniques.md` (Advanced Techniques Design, DR-041)
- `DOCS/.design/web-ui-solver-visualisation.md` (Web UI Architecture)
- `decision-register.md` (DR-042)
