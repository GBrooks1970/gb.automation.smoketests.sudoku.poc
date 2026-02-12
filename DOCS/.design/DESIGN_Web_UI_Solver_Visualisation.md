# Web UI Solver Visualisation - Design Document

**Version:** v1.0
**Date:** 2026-02-06T00:00:00Z
**Author:** AI Assistant (CLAUDE Opus 4.6)
**Reviewer:** Pending
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis](#2-problem-analysis)
3. [Requirements](#3-requirements)
4. [Design Overview](#4-design-overview)
5. [Detailed Design](#5-detailed-design)
6. [Implementation Plan](#6-implementation-plan)
7. [Testing Strategy](#7-testing-strategy)
8. [Alternatives Considered](#8-alternatives-considered)
9. [Open Questions](#9-open-questions)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

### Purpose

This document outlines the design for a simple web-based visualisation of the Sudoku solver. The webpage will display a puzzle's initial state, animate the step-by-step solving process (showing which algorithm placed which digit in which cell), and present the final result along with solving statistics. This serves the project's pedagogical purpose by making the solving process visually observable rather than confined to terminal text output.

### Scope

**In Scope:**
- Single-page web application displaying Sudoku grid
- Step-by-step playback of the solving process with algorithm attribution
- Visual distinction between original clues and solver-placed digits
- Puzzle selection from the existing `puzzles.json` collection
- Final result display (SOLVED / STUCK_ON_ADVANCED_LOGIC) with statistics
- Lightweight Express server to serve the page and provide solve data

**Out of Scope:**
- User puzzle input or editing (users cannot type in their own puzzles)
- Advanced interactive tutoring or hint system
- Mobile-optimised responsive design (desktop-first, basic responsiveness only)
- User accounts, authentication, or persistence
- Integration with the planned REST API (BACKLOG-009) — this is a standalone feature
- PDF export of solving sessions
- Real-time WebSocket-based solving animation

### Key Decisions

1. **Vanilla HTML/CSS/JS frontend** — No framework (React, Vue, etc.) to avoid build tooling complexity and keep the project accessible for learning
2. **Wrapper-based step tracking** — The existing solver classes are not modified; a wrapper captures grid changes by comparing before/after states at each algorithm call
3. **Server-side solving** — The solver runs on the Node.js server; the frontend receives pre-computed solve data via a JSON API endpoint
4. **Express.js server** — Consistent with the planned REST API wrapper (BACKLOG-009), enabling future consolidation

### Success Criteria

- Page loads and displays any puzzle from `puzzles.json` within 2 seconds
- User can step through the entire solving process forwards and backwards
- Each step clearly shows: algorithm used, cell changed, old value, new value
- Final result matches the CLI solver output exactly (same cells filled, same status)
- Works in current versions of Chrome and Firefox

---

## 2. Problem Analysis

### Current State

The Sudoku solver currently produces output exclusively through the CLI (`SudokuCLI` class), rendering grids as text in the terminal. While functional, this output has significant limitations for understanding the solving process:

```
Current CLI Output Flow:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ PuzzleLoader │────→│ SudokuSolver │────→│  SudokuCLI  │
│              │     │ + Orchestr.  │     │  (console)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                                         Terminal Text:
                                         - Initial grid
                                         - "Solving..."
                                         - Final grid
                                         - Status
```

**Pain Points:**

1. **No step visibility** — The CLI shows only the initial and final states; the solving journey (which algorithms fired, in what order, which cells changed) is invisible
2. **Text-only rendering** — Terminal grid output is functional but difficult to read quickly, especially for comparing before/after states
3. **No interactivity** — Users cannot pause, rewind, or step through the solving process
4. **Limited educational value** — Without seeing intermediate states, learners cannot understand how the three algorithms work together

### Root Cause Analysis

The solver was designed as a CLI tool with a clear separation of concerns. The `SudokuCLI` class handles all display, but it only renders snapshots (initial and final grids). The `SudokuOrchestrator` orchestrates the solving loop but does not expose intermediate states or step data. This is a presentation gap, not a solver deficiency.

**Contributing Factors:**
- The orchestrator's `solve()` method runs to completion without yielding intermediate state
- No step-tracking mechanism exists (the Audit Trail feature, BACKLOG-008, is designed but not implemented)
- The CLI was built for demonstration, not exploration

### Constraints and Assumptions

**Technical Constraints:**
- Must use the existing TypeScript solver without modifying its core classes (`SudokuSolver`, `SudokuOrchestrator`, `PuzzleLoader`)
- Must run in Node.js 16+ environment (same as existing project)
- Browser support: Chrome and Firefox (current versions)
- No external CSS or JavaScript frameworks (project convention of minimal dependencies)

**Project Constraints:**
- Should integrate cleanly within the existing `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` directory structure
- Must not break existing CLI functionality (`npm start` must continue to work)
- Should be launchable with a single command (e.g., `npm run web`)

**Assumptions:**
- The existing solver produces correct results for Easy and Medium puzzles
- Users have basic web browser access on a desktop machine
- Puzzle collection remains small (4-20 puzzles) — no pagination needed
- The Audit Trail feature (BACKLOG-008) may or may not be implemented first; the design should work independently but be replaceable by the audit trail when available

### Stakeholders

| Stakeholder | Role | Interest | Impact Level |
|-------------|------|----------|--------------|
| Learners | End users | Visualise and understand solving algorithms | High |
| Test automation engineers | End users | Observe solver behaviour for test case design | Medium |
| Project maintainers | Developers | Clean integration, no regressions | High |

---

## 3. Requirements

### Functional Requirements

**FR-1: Puzzle Display**
- **Description:** Display a 9x9 Sudoku grid with clear 3x3 block boundaries
- **User Story:** As a learner, I want to see the puzzle rendered as a visual grid so that I can read it naturally
- **Acceptance Criteria:**
  - Given a puzzle is loaded
  - When the page renders
  - Then a 9x9 grid is displayed with values 1-9 in filled cells and blank for empty cells (0)
  - And 3x3 block boundaries are visually distinct (thicker borders)
  - And original clue cells are visually distinct from empty/solver-filled cells (bold, darker colour)
- **Priority:** Must Have

**FR-2: Puzzle Selection**
- **Description:** Allow users to select from available puzzles
- **User Story:** As a user, I want to choose which puzzle to visualise so that I can explore different difficulty levels
- **Acceptance Criteria:**
  - Given the page is loaded
  - When I open the puzzle selector
  - Then I see all puzzles from `puzzles.json` listed with name and difficulty
  - And selecting a puzzle loads it into the grid
- **Priority:** Must Have

**FR-3: Step-by-Step Solving Playback**
- **Description:** Step through the solving process one cell change at a time
- **User Story:** As a learner, I want to step through each solving move so that I can understand how each algorithm contributes
- **Acceptance Criteria:**
  - Given a puzzle is loaded and solved (server-side)
  - When I click "Next Step"
  - Then the next cell change is applied to the grid
  - And the changed cell is visually highlighted
  - And the event log shows: algorithm name, cell coordinates, old value → new value
  - When I click "Previous Step"
  - Then the last change is reverted and the previous state is displayed
- **Priority:** Must Have

**FR-4: Auto-Play Mode**
- **Description:** Automatically advance through solving steps with adjustable speed
- **User Story:** As a user, I want to watch the solver work automatically so that I can observe the overall solving flow
- **Acceptance Criteria:**
  - Given steps are available
  - When I click "Play"
  - Then steps advance automatically at the selected speed (default: 500ms)
  - And I can pause at any time
  - And I can adjust speed between 100ms and 2000ms
- **Priority:** Should Have

**FR-5: Event Log**
- **Description:** Display a scrollable log of all solving events
- **User Story:** As a learner, I want to see a textual log of each solving step so that I can review the algorithm's decisions
- **Acceptance Criteria:**
  - Given steps are being played
  - When a step is applied
  - Then the event log shows: `[Algorithm] Cell (row, col): oldValue → newValue`
  - And the current step is highlighted in the log
  - And clicking a log entry jumps to that step
- **Priority:** Must Have

**FR-6: Final Result Display**
- **Description:** Show the outcome of the solving attempt with statistics
- **User Story:** As a user, I want to see whether the puzzle was solved and how each algorithm contributed
- **Acceptance Criteria:**
  - Given all steps have been played (or user clicks "Solve All")
  - When the final state is reached
  - Then a status banner shows "SOLVED" (green) or "STUCK ON ADVANCED LOGIC" (amber)
  - And statistics are displayed: total steps, steps per algorithm, iteration count
- **Priority:** Must Have

**FR-7: Algorithm Colour Coding**
- **Description:** Visually distinguish which algorithm placed each digit
- **User Story:** As a learner, I want to see at a glance which algorithm filled each cell so that I can understand algorithm coverage
- **Acceptance Criteria:**
  - Given the solve has progressed
  - When viewing the grid
  - Then cells filled by Unit Completion have one colour (e.g., blue)
  - And cells filled by Hidden Singles have another colour (e.g., green)
  - And cells filled by Naked Singles have another colour (e.g., orange)
  - And original clues remain distinct (dark/black, bold)
- **Priority:** Must Have

### Non-Functional Requirements

**NFR-1: Performance**
- Page load time < 2 seconds
- Solve API response time < 500ms for any puzzle
- Step animation renders within 16ms (60fps capable)

**NFR-2: Simplicity**
- No build step required for frontend (plain HTML/CSS/JS)
- Single `npm run web` command to start
- No external CSS/JS frameworks or CDN dependencies

**NFR-3: Maintainability**
- Clean separation between server (API) and client (static files)
- Step tracking is a separate module, replaceable by Audit Trail
- Frontend JavaScript organised in logical modules (grid, player, api)

**NFR-4: Compatibility**
- Works in Chrome 100+ and Firefox 100+
- Desktop viewport (1024px minimum width)
- Graceful degradation on smaller screens (scrollable, not broken)

### Requirements Traceability Matrix

| Requirement | Design Component | Test Approach | Status |
|-------------|------------------|---------------|--------|
| FR-1 | GridRenderer (JS) | Visual inspection, screenshot comparison | Not Started |
| FR-2 | PuzzleSelector (JS), /api/puzzles | Verify dropdown populates, puzzle loads | Not Started |
| FR-3 | StepPlayer (JS), /api/solve | Compare each step with expected cell change | Not Started |
| FR-4 | StepPlayer (JS) | Verify auto-advance timing and pause | Not Started |
| FR-5 | EventLog (JS) | Verify log entries match steps | Not Started |
| FR-6 | ResultsPanel (JS) | Compare statistics with CLI output | Not Started |
| FR-7 | GridRenderer (JS) | Visual inspection of colour coding | Not Started |

---

## 4. Design Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ PuzzleSelect │  │  GridRender  │  │  StepPlayer  │             │
│  │  (dropdown)  │  │  (9x9 table) │  │  (controls)  │             │
│  └──────┬───────┘  └──────▲───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
│         │          ┌──────┴───────┐          │                      │
│         └─────────→│  AppState    │←─────────┘                      │
│                    │ (solve data, │                                  │
│                    │  current     │──→ ┌──────────────┐             │
│                    │  step index) │    │  EventLog    │             │
│                    └──────┬───────┘    │  (panel)     │             │
│                           │           └──────────────┘             │
│                           │           ┌──────────────┐             │
│                           └──────────→│ ResultsPanel │             │
│                                       │ (stats)      │             │
│                                       └──────────────┘             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP (fetch)
                            │
┌───────────────────────────┴─────────────────────────────────────────┐
│                     Express Server (Node.js)                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │ Static Files │  │  GET /api/puzzles    │  │ POST /api/solve  │ │
│  │ (HTML/CSS/JS)│  │  (puzzle list)       │  │ (solve + steps)  │ │
│  └──────────────┘  └──────────┬───────────┘  └────────┬─────────┘ │
│                               │                        │           │
│                    ┌──────────▼────────────────────────▼─────────┐ │
│                    │           SolveStepTracker                   │ │
│                    │  (wraps SudokuSolver + SudokuOrchestrator)   │ │
│                    └──────────┬───────────────────────────────────┘ │
│                               │                                     │
│                    ┌──────────▼──────────┐                         │
│                    │  Existing Solver    │                         │
│                    │  SudokuSolver       │                         │
│                    │  PuzzleLoader       │                         │
│                    └────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Overview

| Component | Responsibility | Technology | Location |
|-----------|---------------|------------|----------|
| Express Server | Serve static files and API endpoints | Express.js, TypeScript | `web/server.ts` |
| SolveStepTracker | Wrap solver to capture step-by-step changes | TypeScript | `web/SolveStepTracker.ts` |
| API Routes | `/api/puzzles` and `/api/solve` endpoints | Express.js | `web/routes/api.ts` |
| index.html | Page structure and layout | HTML5 | `web/public/index.html` |
| styles.css | Grid styling, layout, colours | CSS3 | `web/public/css/styles.css` |
| grid.js | Render and update the 9x9 grid | Vanilla JS | `web/public/js/grid.js` |
| player.js | Step playback controls | Vanilla JS | `web/public/js/player.js` |
| app.js | Application state, API calls, orchestration | Vanilla JS | `web/public/js/app.js` |

### Data Flow

```
1. Page loads → Browser fetches GET /api/puzzles
2. User selects puzzle → Browser sends POST /api/solve with puzzle name
3. Server loads puzzle from puzzles.json via PuzzleLoader
4. Server creates SolveStepTracker wrapping SudokuSolver
5. SolveStepTracker runs the solve loop, capturing each cell change
6. Server returns JSON: { initialGrid, finalGrid, steps[], status, statistics }
7. Browser stores solve data in AppState
8. User interacts with controls → StepPlayer updates step index
9. GridRenderer re-renders grid at current step
10. EventLog highlights current step entry
```

### Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Server | Express.js 4.x | Lightweight, consistent with REST API plan |
| Server Language | TypeScript (ts-node) | Matches existing project |
| Frontend | Vanilla HTML/CSS/JS | No build step, pedagogical simplicity |
| CSS Layout | CSS Grid + Flexbox | Native browser support, no framework needed |
| HTTP Client | Fetch API | Built into all modern browsers |
| Bundling | None | Plain `<script>` tags, ES modules |

### Design Principles Applied

- **Single Responsibility:** Each JS module (grid, player, app) has one job
- **Open/Closed:** SolveStepTracker wraps the solver without modifying it
- **KISS:** Vanilla frontend, no build tools, no framework
- **Separation of Concerns:** Server handles solving, browser handles presentation
- **Progressive Enhancement:** Core grid display works without JS playback controls

---

## 5. Detailed Design

### 5.1 Component: SolveStepTracker

**Purpose:** Execute the solving loop while capturing every cell change with algorithm attribution, producing a structured step list.

**Strategy:** Rather than modifying the existing `SudokuOrchestrator`, the tracker replicates the orchestration loop but wraps each algorithm call with before/after grid comparison to detect changes.

**Public Interface:**

```typescript
interface SolveStep {
    stepNumber: number;
    iteration: number;
    algorithm: 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';
    algorithmParam?: number;       // target digit for HiddenSingles
    cell: { row: number; col: number };
    oldValue: number;              // always 0 (was empty)
    newValue: number;              // 1-9 (digit placed)
}

interface SolveStatistics {
    totalSteps: number;
    totalIterations: number;
    stepsByAlgorithm: {
        unitCompletion: number;
        hiddenSingles: number;
        nakedSingles: number;
    };
}

interface SolveResult {
    puzzleName: string;
    difficulty: string;
    description: string;
    status: 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC';
    initialGrid: number[][];
    finalGrid: number[][];
    steps: SolveStep[];
    statistics: SolveStatistics;
}
```

**Implementation Approach:**

```typescript
// web/SolveStepTracker.ts
import { SudokuSolver } from '../app_src/SudokuSolver';

export class SolveStepTracker {
    private solver: SudokuSolver;
    private steps: SolveStep[] = [];
    private stepCounter: number = 0;

    constructor(name: string, grid: number[][]) {
        this.solver = new SudokuSolver(name, grid);
    }

    public solve(): SolveResult {
        const initialGrid = this.solver.origGrid.map(row => [...row]);
        let iteration = 0;
        let isProgressing = true;

        while (isProgressing) {
            iteration++;
            let changedThisPass = false;

            // Step 1: Unit Completion
            changedThisPass = this.runWithTracking(
                'UnitCompletion', iteration, undefined,
                () => this.solver.unitCompletion()
            ) || changedThisPass;

            // Step 2: Hidden Singles (digits 1-9)
            for (let digit = 1; digit <= 9; digit++) {
                changedThisPass = this.runWithTracking(
                    'HiddenSingles', iteration, digit,
                    () => this.solver.hiddenSingles(digit)
                ) || changedThisPass;
            }

            // Step 3: Naked Singles
            changedThisPass = this.runWithTracking(
                'NakedSingles', iteration, undefined,
                () => this.solver.nakedSingles()
            ) || changedThisPass;

            isProgressing = changedThisPass;
        }

        const isFull = this.solver.grid.every(row => row.every(cell => cell !== 0));
        const status = isFull ? 'SOLVED' : 'STUCK_ON_ADVANCED_LOGIC';

        return {
            puzzleName: this.solver.name,
            difficulty: '',  // populated by caller from puzzle metadata
            description: '', // populated by caller from puzzle metadata
            status,
            initialGrid,
            finalGrid: this.solver.grid.map(row => [...row]),
            steps: this.steps,
            statistics: this.computeStatistics(iteration)
        };
    }

    private runWithTracking(
        algorithm: SolveStep['algorithm'],
        iteration: number,
        param: number | undefined,
        fn: () => boolean
    ): boolean {
        const before = this.solver.grid.map(row => [...row]);
        const changed = fn();

        if (changed) {
            // Find all cells that changed
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (before[r][c] !== this.solver.grid[r][c]) {
                        this.stepCounter++;
                        this.steps.push({
                            stepNumber: this.stepCounter,
                            iteration,
                            algorithm,
                            algorithmParam: param,
                            cell: { row: r, col: c },
                            oldValue: before[r][c],
                            newValue: this.solver.grid[r][c]
                        });
                    }
                }
            }
        }

        return changed;
    }

    private computeStatistics(totalIterations: number): SolveStatistics {
        return {
            totalSteps: this.steps.length,
            totalIterations,
            stepsByAlgorithm: {
                unitCompletion: this.steps.filter(s => s.algorithm === 'UnitCompletion').length,
                hiddenSingles: this.steps.filter(s => s.algorithm === 'HiddenSingles').length,
                nakedSingles: this.steps.filter(s => s.algorithm === 'NakedSingles').length
            }
        };
    }
}
```

**Key Design Decision:** The tracker compares the full grid before and after each algorithm call. This is O(81) per comparison, which is negligible for a 9x9 grid. This avoids any modification to the solver internals.

---

### 5.2 Component: Express Server

**Purpose:** Serve static frontend files and provide API endpoints for puzzle listing and solving.

```typescript
// web/server.ts
import express from 'express';
import path from 'path';
import { apiRouter } from './routes/api';

const app = express();
const PORT = process.env.WEB_PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Sudoku Solver Web UI: http://localhost:${PORT}`);
});
```

---

### 5.3 Component: API Routes

**Purpose:** Provide puzzle data and solve results to the frontend.

**Endpoints:**

#### GET /api/puzzles

Returns the list of available puzzles (without grids, to keep the response lightweight).

**Response (200):**
```json
{
    "puzzles": [
        {
            "name": "Easy Scan Grid",
            "difficulty": "easy",
            "description": "Solvable with basic techniques..."
        }
    ]
}
```

#### POST /api/solve

Solves a puzzle and returns the full step-by-step result.

**Request:**
```json
{
    "puzzleName": "Easy Scan Grid"
}
```

**Response (200):**
```json
{
    "puzzleName": "Easy Scan Grid",
    "difficulty": "easy",
    "description": "Solvable with basic techniques...",
    "status": "SOLVED",
    "initialGrid": [[5,3,0,...], ...],
    "finalGrid": [[5,3,4,...], ...],
    "steps": [
        {
            "stepNumber": 1,
            "iteration": 1,
            "algorithm": "HiddenSingles",
            "algorithmParam": 1,
            "cell": {"row": 2, "col": 0},
            "oldValue": 0,
            "newValue": 1
        }
    ],
    "statistics": {
        "totalSteps": 51,
        "totalIterations": 12,
        "stepsByAlgorithm": {
            "unitCompletion": 15,
            "hiddenSingles": 28,
            "nakedSingles": 8
        }
    }
}
```

**Response (404):**
```json
{
    "error": "Puzzle not found",
    "availablePuzzles": ["Easy Scan Grid", "Logic Squeeze Grid", ...]
}
```

---

### 5.4 Component: Frontend - Page Layout

**Purpose:** Single HTML page with four main sections.

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: "Sudoku Solver Visualisation"                          │
│  [Puzzle Selector ▼]  [Difficulty Badge]  [Description]         │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│    ┌─────────────────────┐     │   EVENT LOG                    │
│    │                     │     │   ┌──────────────────────────┐ │
│    │    9 x 9 GRID       │     │   │ Step 1: [HiddenSingles] │ │
│    │                     │     │   │   Cell (2,0): · → 1     │ │
│    │    (with 3x3 block  │     │   │ Step 2: [UnitCompletion]│ │
│    │     borders and     │     │   │   Cell (0,2): · → 4     │ │
│    │     colour coding)  │     │   │ ...                      │ │
│    │                     │     │   │                          │ │
│    └─────────────────────┘     │   └──────────────────────────┘ │
│                                │                                │
│    PLAYBACK CONTROLS           │   STATISTICS                   │
│    [|◁] [◁] [▷] [▷|] [⏩]    │   ┌──────────────────────────┐ │
│    Step 12 of 51               │   │ Status: SOLVED           │ │
│    Speed: [====○====]          │   │ Total Steps: 51          │ │
│                                │   │ Iterations: 12           │ │
│    LEGEND                      │   │ Unit Completion: 15      │ │
│    ■ Original  ■ UnitComp     │   │ Hidden Singles: 28       │ │
│    ■ Hidden    ■ Naked        │   │ Naked Singles: 8         │ │
│                                │   └──────────────────────────┘ │
└────────────────────────────────┴────────────────────────────────┘
```

**HTML Structure:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sudoku Solver Visualisation</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <header>
        <h1>Sudoku Solver Visualisation</h1>
        <div id="puzzle-selector">
            <select id="puzzle-dropdown"></select>
            <span id="puzzle-difficulty"></span>
            <p id="puzzle-description"></p>
        </div>
    </header>

    <main>
        <section id="grid-panel">
            <div id="sudoku-grid"></div>
            <div id="playback-controls">
                <button id="btn-first" title="First Step">|◁</button>
                <button id="btn-prev" title="Previous Step">◁</button>
                <button id="btn-play" title="Play/Pause">▷</button>
                <button id="btn-next" title="Next Step">▷|</button>
                <button id="btn-last" title="Last Step">⏩</button>
                <span id="step-counter">Step 0 of 0</span>
                <label>Speed: <input type="range" id="speed-slider"
                    min="100" max="2000" value="500" step="100"></label>
            </div>
            <div id="legend">
                <span class="legend-item original">Original</span>
                <span class="legend-item unit-completion">Unit Completion</span>
                <span class="legend-item hidden-singles">Hidden Singles</span>
                <span class="legend-item naked-singles">Naked Singles</span>
            </div>
        </section>

        <section id="info-panel">
            <div id="event-log">
                <h3>Event Log</h3>
                <ol id="event-list"></ol>
            </div>
            <div id="statistics">
                <h3>Statistics</h3>
                <div id="stats-content"></div>
            </div>
        </section>
    </main>

    <script type="module" src="/js/app.js"></script>
</body>
</html>
```

---

### 5.5 Component: Frontend - Grid Renderer

**Purpose:** Render and update the 9x9 Sudoku grid as an HTML table with CSS styling.

**Key Behaviours:**

```javascript
// web/public/js/grid.js

/**
 * Creates the 9x9 grid table structure (called once on page load)
 */
function createGrid(container) {
    const table = document.createElement('table');
    table.className = 'sudoku-grid';
    for (let r = 0; r < 9; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('td');
            cell.id = `cell-${r}-${c}`;
            cell.className = getCellBorderClasses(r, c);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    container.appendChild(table);
}

/**
 * Updates the grid to reflect the state at a given step index.
 * - Applies all steps from 0 to stepIndex to the initial grid
 * - Colour-codes cells by algorithm
 * - Highlights the most recently changed cell
 */
function renderGridAtStep(initialGrid, steps, stepIndex, originalClues) {
    // Build grid state at stepIndex
    const grid = initialGrid.map(row => [...row]);
    const cellAlgorithm = {};  // Track which algorithm filled each cell

    for (let i = 0; i < stepIndex; i++) {
        const step = steps[i];
        grid[step.cell.row][step.cell.col] = step.newValue;
        cellAlgorithm[`${step.cell.row}-${step.cell.col}`] = step.algorithm;
    }

    // Render each cell
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const value = grid[r][c];
            cell.textContent = value === 0 ? '' : value;

            // Reset classes (keep border classes)
            cell.className = getCellBorderClasses(r, c);

            if (originalClues[r][c] !== 0) {
                cell.classList.add('original-clue');
            } else if (cellAlgorithm[`${r}-${c}`]) {
                cell.classList.add(algorithmToClass(cellAlgorithm[`${r}-${c}`]));
            }

            // Highlight the cell changed at current step
            if (stepIndex > 0) {
                const currentStep = steps[stepIndex - 1];
                if (currentStep.cell.row === r && currentStep.cell.col === c) {
                    cell.classList.add('highlight');
                }
            }
        }
    }
}
```

**CSS Classes:**

| Class | Purpose | Colour |
|-------|---------|--------|
| `.original-clue` | Pre-filled puzzle cells | Dark text, bold, light grey background |
| `.unit-completion` | Cells filled by Unit Completion | Blue tint (#dbeafe) |
| `.hidden-singles` | Cells filled by Hidden Singles | Green tint (#dcfce7) |
| `.naked-singles` | Cells filled by Naked Singles | Orange tint (#fed7aa) |
| `.highlight` | Currently active step cell | Bright border, subtle pulse animation |
| `.empty` | Unfilled cells | White background |

---

### 5.6 Component: Frontend - Step Player

**Purpose:** Control step-by-step playback with forward, backward, and auto-play capabilities.

**State:**

```javascript
// Player state
let currentStepIndex = 0;  // 0 = initial state, N = after N steps applied
let isPlaying = false;
let playInterval = null;
let playSpeed = 500;  // milliseconds between steps
```

**Controls:**

| Button | Action |
|--------|--------|
| First (`\|◁`) | Set stepIndex = 0, render initial grid |
| Previous (`◁`) | stepIndex = max(0, stepIndex - 1), render |
| Play/Pause (`▷`) | Toggle auto-advance at `playSpeed` interval |
| Next (`▷\|`) | stepIndex = min(totalSteps, stepIndex + 1), render |
| Last (`⏩`) | Set stepIndex = totalSteps, render final grid |
| Speed Slider | Adjust `playSpeed` (100ms = fast, 2000ms = slow) |

**Auto-Play Logic:**

```javascript
function togglePlay() {
    if (isPlaying) {
        clearInterval(playInterval);
        isPlaying = false;
    } else {
        isPlaying = true;
        playInterval = setInterval(() => {
            if (currentStepIndex >= totalSteps) {
                clearInterval(playInterval);
                isPlaying = false;
                return;
            }
            currentStepIndex++;
            renderGridAtStep(initialGrid, steps, currentStepIndex, originalClues);
            updateEventLog(currentStepIndex);
            updateStepCounter(currentStepIndex, totalSteps);
        }, playSpeed);
    }
}
```

---

### 5.7 Component: Frontend - Event Log

**Purpose:** Scrollable panel showing each solving step as a text entry.

**Entry Format:**

```
Step 1  [HiddenSingles(1)]  Cell (2, 0): · → 1
Step 2  [UnitCompletion]    Cell (0, 2): · → 4
Step 3  [HiddenSingles(5)]  Cell (3, 4): · → 5
...
```

**Behaviours:**
- All entries are rendered when solve data is loaded
- Current step entry is highlighted with a CSS class
- Scrolls to keep current step visible (`scrollIntoView`)
- Clicking an entry jumps the player to that step

---

### 5.8 Component: Frontend - Statistics Panel

**Purpose:** Display solving outcome and algorithm breakdown.

**Content at completion:**

```
┌─────────────────────────────┐
│  Status: SOLVED             │
│                             │
│  Total Steps: 51            │
│  Iterations:  12            │
│                             │
│  Unit Completion:  15 (29%) │
│  ██████████░░░░░░░░░░░░░░░ │
│                             │
│  Hidden Singles:   28 (55%) │
│  ██████████████████░░░░░░░ │
│                             │
│  Naked Singles:     8 (16%) │
│  █████░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────┘
```

The percentage bars are CSS-only (a `<div>` with a coloured background and `width` set as a percentage).

---

### 5.9 Data Model Summary

**Server → Client JSON payload (`SolveResult`):**

```
SolveResult
├── puzzleName: string
├── difficulty: string
├── description: string
├── status: "SOLVED" | "STUCK_ON_ADVANCED_LOGIC"
├── initialGrid: number[9][9]
├── finalGrid: number[9][9]
├── steps: SolveStep[]
│   └── SolveStep
│       ├── stepNumber: number
│       ├── iteration: number
│       ├── algorithm: string
│       ├── algorithmParam?: number
│       ├── cell: { row: number, col: number }
│       ├── oldValue: number
│       └── newValue: number
└── statistics: SolveStatistics
    ├── totalSteps: number
    ├── totalIterations: number
    └── stepsByAlgorithm: { unitCompletion, hiddenSingles, nakedSingles }
```

**Client-side state:**

```
AppState
├── puzzleList: PuzzleSummary[]     (from GET /api/puzzles)
├── currentSolveResult: SolveResult (from POST /api/solve)
├── currentStepIndex: number        (0 to totalSteps)
├── isPlaying: boolean
└── playSpeed: number               (milliseconds)
```

---

## 6. Implementation Plan

### Phase 1: Server Foundation

**Goal:** Express server running, serving a placeholder page, with API endpoints returning puzzle data.

**Tasks:**
1. **Create directory structure** — `web/`, `web/public/`, `web/public/css/`, `web/public/js/`, `web/routes/`
2. **Add Express dependency** — `npm install express @types/express`
3. **Create `web/server.ts`** — Express app serving static files from `web/public/`
4. **Create `web/routes/api.ts`** — `GET /api/puzzles` using existing `PuzzleLoader`
5. **Add `npm run web` script** — `ts-node web/server.ts`
6. **Create placeholder `web/public/index.html`** — Verify server works

**Deliverable:** `http://localhost:3000` serves a page; `/api/puzzles` returns puzzle list JSON

### Phase 2: Step Tracking Engine

**Goal:** Solver runs with step tracking, API returns full solve data.

**Tasks:**
1. **Create `web/SolveStepTracker.ts`** — Implements step capture logic
2. **Add `POST /api/solve` endpoint** — Accepts puzzle name, returns `SolveResult`
3. **Test all four puzzles** — Verify step data matches expected CLI output

**Deliverable:** `POST /api/solve` returns correct step-by-step JSON for all puzzles

### Phase 3: Grid Display

**Goal:** Puzzle grid renders in the browser with proper styling.

**Tasks:**
1. **Create `web/public/index.html`** — Full page layout per Section 5.4
2. **Create `web/public/css/styles.css`** — Grid styling, block borders, colour coding
3. **Create `web/public/js/grid.js`** — Grid creation and rendering functions
4. **Create `web/public/js/app.js`** — Fetch puzzles, render initial grid on selection
5. **Implement puzzle selector** — Dropdown populated from `/api/puzzles`

**Deliverable:** Select a puzzle → grid renders with original clues visually distinct

### Phase 4: Playback and Event Log

**Goal:** Step-by-step playback with controls and event log.

**Tasks:**
1. **Create `web/public/js/player.js`** — Playback control logic
2. **Implement Next/Previous/First/Last** — Grid updates per step
3. **Implement auto-play** — Play/Pause with speed control
4. **Implement event log** — Scrollable list of step entries, current step highlighted
5. **Implement click-to-jump** — Clicking a log entry jumps to that step

**Deliverable:** Full step-by-step playback with event log

### Phase 5: Results and Polish

**Goal:** Statistics display, visual polish, documentation.

**Tasks:**
1. **Implement statistics panel** — Status, totals, percentage bars
2. **Implement legend** — Colour key for algorithm attribution
3. **Add loading states** — Spinner/message during API calls
4. **Add error handling** — Graceful display if API fails
5. **Update project documentation** — README.md, CLAUDE.md
6. **Create implementation log** — `DOCS/.implementation/IMPL_LOG_[date]_Web_UI.md`

**Deliverable:** Complete web UI with all features working

### Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Step order differs from CLI | Medium | Medium | Verify step output against CLI grid states for Easy Scan Grid |
| Browser compatibility issues | Low | Low | Use only standard CSS/JS, no bleeding-edge features |
| Express port conflicts | Low | Low | Configurable via `WEB_PORT` environment variable |
| Large step counts slow rendering | Low | Low | 9x9 grid updates are O(81), negligible even at high speed |
| Audit Trail feature overlap | Medium | Low | SolveStepTracker is designed to be replaceable |

---

## 7. Testing Strategy

### Manual Testing

Since this is a visual feature, primary testing is manual:

| Test | Steps | Expected |
|------|-------|----------|
| Page loads | Navigate to `http://localhost:3000` | Grid area and controls visible |
| Puzzle selector | Select each puzzle | Grid updates with correct initial state |
| Easy Scan Grid solve | Play all steps | Status: SOLVED, 0 empty cells |
| Logic Squeeze Grid solve | Play all steps | Status: SOLVED, 0 empty cells |
| Minimal Clues solve | Play all steps | Status: STUCK, some empty cells remain |
| Empty Grid solve | Play all steps | Status: STUCK, all cells empty (no steps) |
| Step forward | Click Next | One cell fills, log entry appears |
| Step backward | Click Previous after Next | Cell reverts to previous state |
| Auto-play | Click Play | Steps advance automatically |
| Pause | Click Pause during play | Steps stop advancing |
| Speed control | Adjust slider | Auto-play speed changes |
| Jump to step | Click event log entry | Grid shows state at that step |
| Colour coding | Play through Easy puzzle | Different colours for different algorithms |

### API Testing

```gherkin
Feature: Web UI Solve API

  Scenario: List available puzzles
    When GET /api/puzzles is called
    Then response status is 200
    And response contains 4 puzzles
    And each puzzle has name, difficulty, and description

  Scenario: Solve a known puzzle
    When POST /api/solve is called with puzzleName "Easy Scan Grid"
    Then response status is 200
    And status is "SOLVED"
    And steps array is not empty
    And finalGrid has no zeros
    And statistics.totalSteps equals steps array length

  Scenario: Solve with stuck result
    When POST /api/solve is called with puzzleName "Minimal Clues"
    Then response status is 200
    And status is "STUCK_ON_ADVANCED_LOGIC"
    And finalGrid still has zeros

  Scenario: Solve non-existent puzzle
    When POST /api/solve is called with puzzleName "Does Not Exist"
    Then response status is 404
    And response contains error message
    And response contains list of available puzzles
```

### Validation Testing

- **Step consistency:** For each puzzle, apply all steps to `initialGrid` and verify the result matches `finalGrid`
- **Step count consistency:** `statistics.totalSteps` must equal `steps.length`
- **Algorithm attribution:** Each step's algorithm field must be a valid algorithm name
- **No duplicate steps:** No two steps should modify the same cell to the same value

---

## 8. Alternatives Considered

### Alternative 1: Client-Side Solving (Browser)

**Description:** Bundle the TypeScript solver for the browser using a tool like esbuild or webpack. Run solving entirely in the browser with no server.

**Pros:**
- No server needed — could be hosted as a static site
- Instant solve — no network round-trip
- Simpler deployment

**Cons:**
- Requires a build/bundling step (contradicts "no build tools" principle)
- The solver uses `fs` (in PuzzleLoader) which doesn't exist in browsers — requires refactoring
- Harder to keep solver code DRY between CLI and web
- Can't leverage planned REST API

**Reason for Rejection:** Requires bundling toolchain and solver refactoring, adding complexity disproportionate to the feature's simplicity. Server-side solving keeps the existing solver untouched.

### Alternative 2: Full React/Vue SPA

**Description:** Build the frontend using React or Vue with a component-based architecture.

**Pros:**
- More structured component model
- Better state management (React hooks or Vue reactivity)
- Richer ecosystem for UI components
- Better testing tools (React Testing Library, Vitest)

**Cons:**
- Adds significant dependencies (React: ~40KB, build tools, JSX transpilation)
- Requires build step (contradicts project convention)
- Over-engineered for a single-page visualisation
- Steeper learning curve for some target audience

**Reason for Rejection:** Over-engineered for the scope. The project values pedagogical simplicity; vanilla JS is easier to understand and modify without framework knowledge.

### Alternative 3: Pre-Rendered Static Pages

**Description:** Run the solver offline, generate static HTML files for each puzzle with all steps embedded as data attributes or JSON.

**Pros:**
- No server at runtime — pure static hosting
- Guaranteed fast load
- Could be committed to repository

**Cons:**
- Cannot handle new puzzles without re-generation
- Hard to maintain when solver changes
- No interactive puzzle selection
- Generated HTML bloat in repository

**Reason for Rejection:** Static generation is inflexible and creates maintenance burden. A live server is trivial to run and supports dynamic puzzle addition.

### Comparison Matrix

| Criterion | Chosen (Express + Vanilla JS) | Client-Side Solving | React SPA | Static Pages |
|-----------|-------------------------------|--------------------|-----------| -------------|
| Simplicity | High | Medium | Low | High |
| Dependencies | Low (Express only) | Medium (bundler) | High | None |
| Build Step Required | No | Yes | Yes | Yes (generation) |
| Solver Modification | None | Required | None | None |
| Future Extensibility | High (REST API path) | Medium | High | Low |
| Maintenance | Low | Medium | Medium | High |

---

## 9. Open Questions

### Technical Questions

**Q1: Should the web UI share a port with the future REST API?**
- **Impact:** Low
- **Blocking:** No
- **Current Decision:** Use separate ports for now (web UI on 3000, REST API on 3001 when implemented). Merge later if desired.
- **Status:** Resolved (proceed with standalone)

**Q2: Should the SolveStepTracker be reused by the Audit Trail feature?**
- **Impact:** Medium
- **Blocking:** No
- **Current Decision:** Build SolveStepTracker as standalone. When Audit Trail is implemented, the web UI can switch to using AuditLogger output instead.
- **Status:** Resolved (design for replaceability)

**Q3: Should keyboard shortcuts be supported for playback?**
- **Impact:** Low
- **Blocking:** No
- **Recommendation:** Nice-to-have. Arrow keys for next/previous, Space for play/pause.
- **Status:** Open — implement if time permits

---

## 10. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| Step | A single cell change made by the solver (one cell filled with one digit) |
| Iteration | One complete pass through all three algorithms |
| Playback | The process of replaying solve steps in the browser |
| Step Index | The current position in the step sequence (0 = initial state) |
| Original Clue | A digit present in the puzzle before solving begins |

### Appendix B: Colour Palette

| Element | Background | Text | Border |
|---------|-----------|------|--------|
| Original Clue | `#f3f4f6` (grey-100) | `#111827` (grey-900, bold) | — |
| Unit Completion | `#dbeafe` (blue-100) | `#1e40af` (blue-800) | — |
| Hidden Singles | `#dcfce7` (green-100) | `#166534` (green-800) | — |
| Naked Singles | `#fed7aa` (orange-200) | `#9a3412` (orange-800) | — |
| Highlight (current step) | — | — | `#ef4444` (red-500), 3px, pulsing |
| Empty Cell | `#ffffff` (white) | — | — |
| Grid Border (block) | — | — | `#374151` (grey-700), 2px |
| Grid Border (cell) | — | — | `#d1d5db` (grey-300), 1px |

### Appendix C: File Structure

```
DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/
├── web/
│   ├── server.ts                      # Express server entry point
│   ├── SolveStepTracker.ts            # Step-tracking solver wrapper
│   ├── routes/
│   │   └── api.ts                     # API route handlers
│   └── public/
│       ├── index.html                 # Main page
│       ├── css/
│       │   └── styles.css             # All styles
│       └── js/
│           ├── app.js                 # Application orchestration, API calls
│           ├── grid.js                # Grid rendering
│           └── player.js             # Playback controls
├── app_src/                           # Existing solver (UNCHANGED)
│   ├── SudokuSolver.ts
│   ├── SudokuOrchestrator.ts
│   ├── SudokuCLI.ts
│   ├── PuzzleLoader.ts
│   └── index.ts
├── puzzles.json                       # Existing puzzle data (UNCHANGED)
├── package.json                       # Add express dependency + web script
└── tsconfig.json                      # Existing config (UNCHANGED)
```

### Appendix D: npm Script Addition

```json
{
    "scripts": {
        "start": "ts-node app_src/index.ts",
        "build": "tsc",
        "run": "node dist/index.js",
        "web": "ts-node web/server.ts"
    }
}
```

### Appendix E: Related Documents

- [DESIGN_Audit_Trail_Feature.md](DESIGN_Audit_Trail_Feature.md) — Audit trail system (overlap with step tracking)
- [DESIGN_REST_API_Wrapper.md](DESIGN_REST_API_Wrapper.md) — REST API (future consolidation target)
- [DESIGN_Sudoku_Solver_Specification.md](DESIGN_Sudoku_Solver_Specification.md) — Core solver specification
- [BACKLOG.md](../.planning/BACKLOG.md) — Product backlog (BACKLOG-015: Interactive Sudoku Tutor)
- [TODO_Web_UI_Solver_Visualisation.md](../.planning/TODO_Web_UI_Solver_Visualisation.md) — Implementation task list

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-02-06 | AI Assistant (CLAUDE Opus 4.6) | Initial design document |

---

## Implementation Checklist

### Phase 1: Server Foundation
- [ ] Create `web/` directory structure
- [ ] Add Express dependency to `package.json`
- [ ] Create `web/server.ts`
- [ ] Create `web/routes/api.ts` with `GET /api/puzzles`
- [ ] Add `npm run web` script
- [ ] Verify server serves placeholder page

### Phase 2: Step Tracking
- [ ] Create `web/SolveStepTracker.ts`
- [ ] Add `POST /api/solve` endpoint
- [ ] Verify step data for all four test puzzles

### Phase 3: Grid Display
- [ ] Create `web/public/index.html` with full layout
- [ ] Create `web/public/css/styles.css` with grid and layout styles
- [ ] Create `web/public/js/grid.js` with rendering logic
- [ ] Create `web/public/js/app.js` with initialisation and API calls
- [ ] Implement puzzle selector dropdown
- [ ] Verify grid renders correctly for all puzzles

### Phase 4: Playback and Event Log
- [ ] Create `web/public/js/player.js`
- [ ] Implement Next/Previous/First/Last controls
- [ ] Implement auto-play with speed control
- [ ] Implement event log panel
- [ ] Implement click-to-jump on log entries

### Phase 5: Results and Polish
- [ ] Implement statistics panel with percentage bars
- [ ] Implement colour legend
- [ ] Add loading and error states
- [ ] Update README.md and CLAUDE.md
- [ ] Create implementation log

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] 9x9 grid renders with correct values and 3x3 block borders
- [ ] Puzzle selector loads all puzzles from `puzzles.json`
- [ ] Step-by-step forward playback works correctly
- [ ] Each step shows algorithm attribution and cell change
- [ ] Algorithm colour coding applied to solver-filled cells
- [ ] Final status (SOLVED/STUCK) displayed
- [ ] Event log shows all steps
- [ ] Results match CLI solver output

### Should Have
- [ ] Backward step playback
- [ ] Auto-play with speed control
- [ ] Statistics panel with algorithm breakdown
- [ ] Current step highlight (pulsing border)
- [ ] Click-to-jump in event log

### Nice to Have
- [ ] Keyboard shortcuts (arrows, space)
- [ ] Responsive design for tablets
- [ ] Grid animation on cell fill
- [ ] Iteration boundary markers in event log
- [ ] Exportable step data (download JSON)

---

## Conclusion

This design provides a simple, focused web-based visualisation of the Sudoku solving process. By wrapping the existing solver with a step-tracking mechanism and serving the results through a lightweight Express server, the feature:

1. **Preserves existing architecture** — No modifications to core solver classes
2. **Makes the solving process observable** — Step-by-step playback with algorithm attribution
3. **Stays pedagogically accessible** — Vanilla frontend, no framework complexity
4. **Enables future growth** — Can integrate with Audit Trail and REST API features when they are implemented
5. **Serves the project's core purpose** — Demonstrates clean architecture and algorithm behaviour in a visual, interactive format

The phased implementation plan allows for incremental delivery, with a functional grid display (Phase 1-3) providing early value before full playback and statistics are added (Phase 4-5).

---

*End of Design Document*
