# TODO: Web UI Solver Visualisation

**Created:** 2026-02-06T00:00:00Z
**Last Updated:** 2026-04-02T00:00:00Z
**Design Document:** [web-ui-solver-visualisation.md](../DOCS/.design/web-ui-solver-visualisation.md)
**Backlog Reference:** BACKLOG-018 (Implement Web UI Solver Visualisation)
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

> **Architecture note (updated 2026-04-02, per BACKLOG-017/018):** The Web UI is **not a standalone app**. It is served as static files from the REST API's Express server (BACKLOG-009). Phases 1 and 2.4 below were originally written assuming a separate `web/server.ts` — see the updated notes on each phase for how to adapt under the unified architecture.

- [ ] **BACKLOG-009: Implement REST API Wrapper** — **Required.** The Express server that serves the Web UI's static files and provides `GET /api/puzzles` and `POST /api/solve`. Do not create a separate Express server for the Web UI.
- [ ] **BACKLOG-008: Audit Trail Feature** — **Required.** Provides the `AuditLogger` and `CellChange` interface. `SolveStepTracker` is an adapter over `AuditLogger` output, not an independent wrapper of `SudokuSolver`. See Phase 2 notes.
- [ ] **BACKLOG-017: Unify Feature Design Overlap** — Complete first. Establishes the shared `CellChange` interface and single-server architecture that this TODO depends on.
- [ ] **Review design document** — Read `DOCS/.design/web-ui-solver-visualisation.md` thoroughly before starting.

---

## Phase 1: Project Setup and Server Foundation

> **Architecture note (updated 2026-04-02):** Per BACKLOG-017/018, there is no separate web server. The REST API Express server (BACKLOG-009, `api/server.ts`) serves the Web UI static files via `express.static('web/public')`. Tasks 1.2, 1.4, and 1.5 are replaced by a single static-file mount in the existing server. Task 1.6 verification is done against the REST API's port.

- [ ] **1.1** Create web app static asset directory at `demo-apps/demoapp001-typescript-cypress/web/public/`
- [ ] **1.2** ~~Create `web/server.ts`~~ — **Not required.** Add `app.use(express.static('web/public'))` to the REST API server (`api/server.ts`) instead.
- [ ] **1.3** Create `web/public/` directory for static assets (HTML, CSS, JS)
- [ ] **1.4** ~~Update `package.json` — Add `npm run web` script~~ — **Not required.** Web UI is served by `npm run api`.
- [ ] **1.5** ~~Create `web/tsconfig.json`~~ — **Not required.** No TypeScript compilation needed for vanilla JS frontend.
- [ ] **1.6** Verify REST API server serves a placeholder `index.html` from `web/public/` on `http://localhost:{PORT}`

## Phase 2: Solve Engine with Step Tracking

> **Architecture note (updated 2026-04-02):** Per BACKLOG-017/018, `SolveStepTracker` is an **adapter over `AuditLogger`** (from BACKLOG-008), not an independent wrapper around `SudokuSolver`. `SolveStep` maps directly from `AuditEvent`/`CellChange` in `AuditTypes.ts`. Task 2.4 is replaced by the existing REST API endpoints from BACKLOG-009 (`GET /api/puzzles`, `POST /api/solve`).

- [ ] **2.1** Create `web/SolveStepTracker.ts` — Adapts `AuditTrail` (from `AuditLogger.getTrail()`) into the frontend `SolveResult` format. Does **not** wrap `SudokuSolver` directly.
- [ ] **2.2** `interface SolveStep extends CellChange` — import `CellChange` from `app_src/audit/AuditTypes.ts`. `SolveStep` inherits `cell`, `oldValue`, `newValue`, `reason?` and adds `stepNumber`, `iteration`, `algorithm`, `algorithmParam?`. Do not redefine the shared fields.
- [ ] **2.3** Define `SolveResult` interface: `{ puzzleName, difficulty, status, initialGrid, finalGrid, steps[], statistics }` — aligns with `AuditTrail`; add frontend-specific fields only.
- [ ] **2.4** ~~Create `web/routes/api.ts`~~ — **Not required.** Puzzle listing and solve endpoints already provided by REST API (BACKLOG-009). Web UI frontend calls the existing `GET /api/puzzles` and `POST /api/solve`.
- [ ] **2.5** Verify REST API returns correct JSON for all four test puzzles (coordinate with BACKLOG-009)

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

- The existing solver classes (`SudokuSolver`, `SudokuOrchestrator`) should NOT be modified. The step tracker adapts AuditLogger output.
- The `puzzles.json` file is the single source of truth for puzzle data.
- **BACKLOG-008 (Audit Trail) must be implemented before this feature.** `SolveStepTracker` is an adapter over `AuditLogger` — it is not an independent mechanism. Do not create a parallel change-tracking implementation.
- **BACKLOG-009 (REST API) must be implemented before this feature.** The Web UI has no server of its own; it is served as static files from the REST API's Express server and calls the REST API's existing endpoints.
- The web UI should work independently of the CLI — both are separate consumers of the solver library.
- Keep the frontend simple — this is a pedagogical tool, not a production SaaS app.
- **Estimated effort reduction:** Because the server and API endpoints are provided by BACKLOG-009, the effective effort for this feature is closer to 12-18 hours (frontend only), not the original 20-30 hours.

---

**Estimated Total Effort:** 20-30 hours across all phases
