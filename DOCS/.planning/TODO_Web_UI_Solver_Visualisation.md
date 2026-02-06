# TODO: Web UI Solver Visualisation

**Created:** 2026-02-06T00:00:00Z
**Design Document:** [DESIGN_Web_UI_Solver_Visualisation.md](../DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md)
**Backlog Reference:** BACKLOG-015 (Interactive Sudoku Tutor - MVP)
**Branch:** `claude/sudoku-solver-design-f3NRI`

---

## Overview

Implementation task list for creating a simple webpage that displays:
1. The initial puzzle state
2. Step-by-step solving events (which algorithm, which cell, what value)
3. The final result of the solve attempt (SOLVED or STUCK)

This is the MVP implementation of the web-based solver visualisation feature.

---

## Prerequisites

Before starting implementation, these items should ideally be completed (but are not strictly blocking):

- [ ] **BACKLOG-008: Audit Trail Feature** - Provides structured step data. If not implemented, the web UI will need its own lightweight step-tracking mechanism.
- [ ] **Review design document** - Read `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` thoroughly before starting.

---

## Phase 1: Project Setup and Server Foundation

- [ ] **1.1** Create web app directory structure at `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/web/`
- [ ] **1.2** Create `web/server.ts` - Express server to serve static files and API endpoints
- [ ] **1.3** Create `web/public/` directory for static assets (HTML, CSS, JS)
- [ ] **1.4** Update `package.json` - Add Express dependency and `npm run web` script
- [ ] **1.5** Create `web/tsconfig.json` if separate compilation config is needed
- [ ] **1.6** Verify server starts and serves a placeholder page on `http://localhost:3000`

## Phase 2: Solve Engine with Step Tracking

- [ ] **2.1** Create `web/SolveStepTracker.ts` - Wraps SudokuSolver to capture each cell change with algorithm attribution
- [ ] **2.2** Define `SolveStep` interface: `{ iteration, algorithm, cell: {row, col}, oldValue, newValue, reason }`
- [ ] **2.3** Define `SolveResult` interface: `{ puzzleName, difficulty, status, initialGrid, finalGrid, steps[], statistics }`
- [ ] **2.4** Create `web/routes/api.ts` - API endpoint `GET /api/puzzles` (list puzzles) and `POST /api/solve` (solve with step tracking)
- [ ] **2.5** Verify API returns correct JSON for all four test puzzles

## Phase 3: Frontend - Puzzle Grid Display

- [ ] **3.1** Create `web/public/index.html` - Main page structure with puzzle selector, grid container, controls, and event log
- [ ] **3.2** Create `web/public/css/styles.css` - Grid styling (9x9 table with 3x3 block borders, cell highlighting)
- [ ] **3.3** Create `web/public/js/grid.js` - JavaScript module to render a 9x9 grid from a `number[][]` array
- [ ] **3.4** Implement colour coding: original clues (dark/bold), solver-filled cells (coloured by algorithm), empty cells (light)
- [ ] **3.5** Verify initial puzzle renders correctly in the browser

## Phase 4: Frontend - Step-by-Step Playback

- [ ] **4.1** Create `web/public/js/player.js` - Step playback controller (next, previous, play/pause, speed control)
- [ ] **4.2** Implement "Next Step" - Applies one solve step to the grid, highlights the changed cell
- [ ] **4.3** Implement "Previous Step" - Reverts to previous grid state
- [ ] **4.4** Implement "Play All" - Auto-advances through steps with configurable delay (200ms-2000ms)
- [ ] **4.5** Implement step counter display: "Step 12 of 51"
- [ ] **4.6** Create event log panel - Scrollable list showing each step: `[UnitCompletion] Row 3, Col 4: 0 → 6`

## Phase 5: Frontend - Final Result and Statistics

- [ ] **5.1** Display final status banner: "SOLVED" (green) or "STUCK_ON_ADVANCED_LOGIC" (amber)
- [ ] **5.2** Display solving statistics: total steps, steps per algorithm, iterations count
- [ ] **5.3** Display algorithm breakdown (pie chart or simple bar using CSS, no chart library needed)
- [ ] **5.4** Implement "Reset" button to return to initial puzzle state

## Phase 6: Puzzle Selection and Integration

- [ ] **6.1** Implement puzzle dropdown selector populated from `/api/puzzles`
- [ ] **6.2** On puzzle selection: fetch solve result from `/api/solve`, reset player to step 0, render initial grid
- [ ] **6.3** Add puzzle metadata display (name, difficulty, description)
- [ ] **6.4** Handle error states (API unreachable, invalid puzzle)

## Phase 7: Testing and Polish

- [ ] **7.1** Manual test all four puzzles: Easy Scan Grid, Logic Squeeze Grid, Minimal Clues, Empty Grid
- [ ] **7.2** Verify step playback matches CLI solver output for Easy Scan Grid
- [ ] **7.3** Test browser compatibility (Chrome, Firefox - minimum)
- [ ] **7.4** Test responsive layout (desktop viewport minimum, mobile nice-to-have)
- [ ] **7.5** Add loading states for API calls
- [ ] **7.6** Update project README.md with web UI section
- [ ] **7.7** Update CLAUDE.md with web UI commands and structure

## Phase 8: Documentation

- [ ] **8.1** Create implementation log: `DOCS/.implementation/IMPL_LOG_[date]_Web_UI_Solver_Visualisation.md`
- [ ] **8.2** Update backlog: Mark BACKLOG-015 as partially complete (MVP delivered)
- [ ] **8.3** Document any deviations from the design document

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Vanilla HTML/CSS/JS | Keeps it simple, no build tooling, aligns with project's pedagogical purpose |
| Server framework | Express.js | Consistent with REST API design (BACKLOG-009), minimal setup |
| Step tracking | Wrapper around existing solver | Avoids modifying core solver code, can be replaced by Audit Trail later |
| Styling | CSS Grid + Flexbox | No external CSS framework needed for a single-page app |
| Chart library | None (CSS-only bars) | Avoids adding dependencies for simple statistics display |

---

## Dependencies Between Phases

```
Phase 1 (Server) ──→ Phase 2 (Step Tracker) ──→ Phase 3 (Grid Display)
                                                        │
                                                        ▼
                                              Phase 4 (Playback) ──→ Phase 5 (Results)
                                                        │
                                                        ▼
                                              Phase 6 (Integration) ──→ Phase 7 (Testing)
                                                                              │
                                                                              ▼
                                                                     Phase 8 (Documentation)
```

---

## Notes for Implementing Agent

- The existing solver classes (`SudokuSolver`, `SudokuOrchestrator`) should NOT be modified. The step tracker wraps them.
- The `puzzles.json` file is the single source of truth for puzzle data.
- If the Audit Trail feature (BACKLOG-008) is implemented before this, use `AuditLogger` instead of creating `SolveStepTracker`.
- The web UI should work independently of the CLI - both are separate consumers of the solver library.
- Keep the frontend simple - this is a pedagogical tool, not a production SaaS app.

---

**Estimated Total Effort:** 20-30 hours across all phases
