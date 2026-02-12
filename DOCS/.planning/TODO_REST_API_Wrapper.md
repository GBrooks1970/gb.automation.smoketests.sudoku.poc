# TODO: REST API Wrapper

**Created:** 2026-02-12T00:00:00Z
**Design Document:** [DESIGN_REST_API_Wrapper.md](../DOCS/.design/DESIGN_REST_API_Wrapper.md)
**Backlog Reference:** BACKLOG-009 (Implement REST API Wrapper)
**Estimated Effort:** 24-32 hours

---

## Overview

Implementation task list for a RESTful API that wraps the Sudoku Solver, providing HTTP endpoints to execute solving techniques individually or run the complete solving loop. The API exposes the three fundamental techniques (Unit Completion, Hidden Singles, Naked Singles) as separate endpoints, a full solve endpoint, a grid validation endpoint, and a puzzle listing endpoint. All responses include before/after grid states and detailed cell change deltas.

---

## Prerequisites

- [ ] **Review design document** — Read `DOCS/.design/DESIGN_REST_API_Wrapper.md` thoroughly before starting.
- [ ] **BACKLOG-007: Decouple Console Output with DI** — Required per backlog. The API should not produce console output during request handling.
- [ ] **Existing solver code compiles** — Verify `npm start` runs before starting.
- [ ] **Node.js 16+ available** — Express.js 4.x requires Node.js 16+.

---

## Phase 1: Project Setup and Express Server (Priority: HIGH)

### 1.1 Directory Structure and Dependencies

- [ ] **1.1.1** Create directory structure:
  ```
  DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/api/
  ├── routes/
  ├── controllers/
  ├── services/
  ├── middleware/
  ├── utils/
  ├── types/
  └── tests/
  ```
- [ ] **1.1.2** Install dependencies: `npm install express cors helmet express-rate-limit`
- [ ] **1.1.3** Install dev dependencies: `npm install -D @types/express @types/cors supertest @types/supertest`
- [ ] **1.1.4** Add `"api": "ts-node api/server.ts"` script to `package.json`
- [ ] **1.1.5** Verify `npm run api` starts Express without errors

### 1.2 Create Express Server

- [ ] **1.2.1** Create `api/server.ts` with:
  - Express app with JSON body parsing
  - Helmet security headers
  - CORS middleware (configurable origins)
  - Rate limiting (100 requests per 15 minutes per IP)
  - Health check endpoint: `GET /health` → `{ status: "ok", timestamp }`
  - Mount route groups: `/api/techniques`, `/api`, `/api/puzzles`
  - Error handling middleware (last in chain)
  - Listen on configurable port (default 3000, `PORT` env var)
- [ ] **1.2.2** Export `app` for test usage (supertest)
- [ ] **1.2.3** Verify `GET /health` returns 200 with JSON response

### 1.3 Create TypeScript Interfaces

- [ ] **1.3.1** Create `api/types/api.types.ts` with all interfaces from design document:
  - Request types: `GridRequest`, `HiddenSinglesRequest`, `SolveRequest`, `RequestOptions`, `SolveOptions`
  - Response types: `TechniqueResponse`, `SolveResponse`, `ValidationResponse`
  - Data types: `CellChange`, `Statistics`, `IterationSnapshot`, `Conflict`
  - Error types: `ApiError` (success: false, error code, message, details)

---

## Phase 2: Validation and Utilities (Priority: HIGH)

### 2.1 Grid Validator

- [ ] **2.1.1** Create `api/utils/gridValidator.ts`
- [ ] **2.1.2** Implement `validate(grid)` — returns `{ valid, message, details }`:
  - Check grid is not null/undefined
  - Check grid is an array with exactly 9 rows
  - Check each row is an array with exactly 9 columns
  - Check all values are integers in range 0-9
- [ ] **2.1.3** Implement `validateConstraints(grid)` — checks for Sudoku rule violations:
  - Duplicate non-zero values in any row
  - Duplicate non-zero values in any column
  - Duplicate non-zero values in any 3x3 block
  - Return list of `Conflict` objects

### 2.2 Validation Middleware

- [ ] **2.2.1** Create `api/middleware/validation.middleware.ts`
- [ ] **2.2.2** Implement `validateGrid` middleware — validates grid in request body, returns 400 with structured error if invalid
- [ ] **2.2.3** Implement `validateHiddenSingles` middleware — calls validateGrid first, then validates targetNumber (if present) is integer 1-9, returns 422 if invalid
- [ ] **2.2.4** Implement `validateSolveOptions` middleware — validates maxIterations (positive integer), includeIterationHistory (boolean)

### 2.3 Error Handling Middleware

- [ ] **2.3.1** Create `api/middleware/error.middleware.ts`
- [ ] **2.3.2** Implement global error handler — catches all unhandled errors:
  - In development: return stack trace
  - In production: return generic error message with requestId
  - Always: return structured JSON `{ success: false, error, message }`
  - Log errors to console (or logger if available)

### 2.4 Response Formatter

- [ ] **2.4.1** Create `api/utils/responseFormatter.ts`
- [ ] **2.4.2** Implement helper to format TechniqueResponse consistently
- [ ] **2.4.3** Implement helper to format SolveResponse consistently
- [ ] **2.4.4** Implement helper to format error responses consistently

---

## Phase 3: Core API Service (Priority: HIGH)

### 3.1 SudokuApiService — Business Logic

- [ ] **3.1.1** Create `api/services/SudokuApiService.ts`
- [ ] **3.1.2** Implement `static executeUnitCompletion(grid, includeReason)`:
  - Deep copy grid, create SudokuSolver instance
  - Snapshot grid before, run `solver.unitCompletion()`, compare after
  - Detect all cell changes via before/after grid comparison
  - Return TechniqueResponse with changes[], timing, gridBefore, gridAfter
- [ ] **3.1.3** Implement `static executeHiddenSingles(grid, targetNumber?, includeReason)`:
  - If targetNumber provided: run `solver.hiddenSingles(targetNumber)` for that digit only
  - If targetNumber omitted: run `solver.hiddenSingles(digit)` for digits 1-9
  - Detect changes, return TechniqueResponse
- [ ] **3.1.4** Implement `static executeNakedSingles(grid, includeReason)`:
  - Run `solver.nakedSingles()`, detect changes, return TechniqueResponse
- [ ] **3.1.5** Implement `static executeSolve(grid, options)`:
  - Create SudokuSolver and SudokuOrchestrator
  - Run `orchestrator.solve()`
  - Count total changes (before/after diff)
  - Return SolveResponse with status, statistics, gridBefore, gridAfter, emptyCells count
  - TODO note: iteration count and per-algorithm statistics require solver modification or step tracking
- [ ] **3.1.6** Implement `static validateGrid(grid)`:
  - Run structural validation and constraint validation
  - Return ValidationResponse with conflicts list

### 3.2 ChangeTracker Helper

- [ ] **3.2.1** Create `ChangeTracker` class (private to SudokuApiService or in utils)
- [ ] **3.2.2** Constructor takes grid snapshot (deep copy)
- [ ] **3.2.3** Implement `getChanges(afterGrid, includeReason)` — compares before/after, returns CellChange[]
- [ ] **3.2.4** Implement `inferReason(row, col, value)` — generates human-readable reason string (basic: `"Cell [r,c] set to v"`)

---

## Phase 4: Route Handlers and Controllers (Priority: HIGH)

### 4.1 Technique Routes

- [ ] **4.1.1** Create `api/routes/techniques.routes.ts`
  - `POST /unit-completion` → validateGrid → TechniqueController.unitCompletion
  - `POST /hidden-singles` → validateHiddenSingles → TechniqueController.hiddenSingles
  - `POST /naked-singles` → validateGrid → TechniqueController.nakedSingles
- [ ] **4.1.2** Create `api/controllers/TechniqueController.ts`
  - `unitCompletion(req, res, next)` — extracts grid + options, calls SudokuApiService, returns JSON
  - `hiddenSingles(req, res, next)` — extracts grid + targetNumber + options, calls service, returns JSON
  - `nakedSingles(req, res, next)` — extracts grid + options, calls service, returns JSON
  - All methods wrapped in try/catch, errors forwarded to `next(error)`

### 4.2 Solve Route

- [ ] **4.2.1** Create `api/routes/solve.routes.ts`
  - `POST /solve` → validateGrid, validateSolveOptions → SolveController.solve
- [ ] **4.2.2** Create `api/controllers/SolveController.ts`
  - `solve(req, res, next)` — extracts grid + options, calls SudokuApiService.executeSolve, returns JSON

### 4.3 Puzzle Routes

- [ ] **4.3.1** Create `api/routes/puzzles.routes.ts`
  - `GET /` → PuzzleController.listPuzzles (returns name, difficulty, description for each; no grids)
  - `GET /:name` → PuzzleController.getPuzzle (returns full puzzle including grid)
- [ ] **4.3.2** Create `api/controllers/PuzzleController.ts`
  - `listPuzzles(req, res, next)` — uses PuzzleLoader, returns `{ puzzles: [...], count }`
  - `getPuzzle(req, res, next)` — uses PuzzleLoader.getPuzzleByName, returns 404 if not found

### 4.4 Validate Route

- [ ] **4.4.1** Add `POST /validate` to solve routes or create separate `api/routes/validate.routes.ts`
- [ ] **4.4.2** Controller calls SudokuApiService.validateGrid, returns ValidationResponse

### 4.5 Mount All Routes

- [ ] **4.5.1** In `api/server.ts`, mount:
  - `app.use('/api/techniques', techniqueRoutes)`
  - `app.use('/api', solveRoutes)` — for `/api/solve` and `/api/validate`
  - `app.use('/api/puzzles', puzzleRoutes)`
- [ ] **4.5.2** Verify all endpoints respond (can use curl or Postman at this stage)

---

## Phase 5: API Documentation (Priority: MEDIUM)

### 5.1 OpenAPI / Swagger Setup

- [ ] **5.1.1** Install dependencies: `npm install swagger-jsdoc swagger-ui-express` and `npm install -D @types/swagger-jsdoc @types/swagger-ui-express`
- [ ] **5.1.2** Create `api/swagger.ts` — configure swagger-jsdoc with OpenAPI 3.0 spec
- [ ] **5.1.3** Add JSDoc/OpenAPI annotations to all route handlers (request/response schemas)
- [ ] **5.1.4** Mount Swagger UI at `/api-docs`
- [ ] **5.1.5** Verify Swagger UI loads and shows all endpoints with correct schemas

### 5.2 Postman Collection (Optional)

- [ ] **5.2.1** Create `api/postman/SudokuSolverAPI.postman_collection.json`
- [ ] **5.2.2** Include example requests for all endpoints
- [ ] **5.2.3** Include example environment variables (base URL, port)

---

## Phase 6: Testing (Priority: HIGH)

### 6.1 Unit Tests — GridValidator

- [ ] **6.1.1** Create `api/tests/gridValidator.test.ts`
- [ ] **6.1.2** Test: Valid 9x9 grid passes validation
- [ ] **6.1.3** Test: Null/undefined grid fails
- [ ] **6.1.4** Test: Grid with wrong row count fails
- [ ] **6.1.5** Test: Grid with wrong column count in any row fails
- [ ] **6.1.6** Test: Grid with non-integer value fails
- [ ] **6.1.7** Test: Grid with value > 9 or < 0 fails
- [ ] **6.1.8** Test: Constraint validation detects duplicate in row
- [ ] **6.1.9** Test: Constraint validation detects duplicate in column
- [ ] **6.1.10** Test: Constraint validation detects duplicate in block

### 6.2 Unit Tests — SudokuApiService

- [ ] **6.2.1** Create `api/tests/sudokuApiService.test.ts`
- [ ] **6.2.2** Test: executeUnitCompletion returns correct changes for a grid with completable rows
- [ ] **6.2.3** Test: executeUnitCompletion returns changed=false for grid with no completable units
- [ ] **6.2.4** Test: executeHiddenSingles with targetNumber returns changes for specific digit
- [ ] **6.2.5** Test: executeHiddenSingles without targetNumber scans all 9 digits
- [ ] **6.2.6** Test: executeNakedSingles returns correct changes
- [ ] **6.2.7** Test: executeSolve returns SOLVED for Easy Scan Grid
- [ ] **6.2.8** Test: executeSolve returns STUCK_ON_ADVANCED_LOGIC for Minimal Clues
- [ ] **6.2.9** Test: gridBefore is not mutated in any response
- [ ] **6.2.10** Test: All responses include timestamp and durationMs

### 6.3 Integration Tests — API Endpoints

- [ ] **6.3.1** Create `api/tests/api.integration.test.ts`
- [ ] **6.3.2** Test: `POST /api/techniques/unit-completion` with valid grid returns 200
- [ ] **6.3.3** Test: `POST /api/techniques/unit-completion` with invalid grid returns 400 with structured error
- [ ] **6.3.4** Test: `POST /api/techniques/unit-completion` with missing grid returns 400
- [ ] **6.3.5** Test: `POST /api/techniques/hidden-singles` with targetNumber=5 returns 200
- [ ] **6.3.6** Test: `POST /api/techniques/hidden-singles` with targetNumber=10 returns 422
- [ ] **6.3.7** Test: `POST /api/techniques/hidden-singles` without targetNumber returns 200 (scans all)
- [ ] **6.3.8** Test: `POST /api/techniques/naked-singles` with valid grid returns 200
- [ ] **6.3.9** Test: `POST /api/solve` with Easy Scan Grid returns status=SOLVED
- [ ] **6.3.10** Test: `POST /api/solve` with Minimal Clues returns status=STUCK_ON_ADVANCED_LOGIC
- [ ] **6.3.11** Test: `POST /api/solve` with Empty Grid returns status=STUCK, 0 changes
- [ ] **6.3.12** Test: `POST /api/validate` with valid grid returns valid=true
- [ ] **6.3.13** Test: `POST /api/validate` with conflicting grid returns valid=false with conflicts
- [ ] **6.3.14** Test: `GET /api/puzzles` returns all puzzles with name and difficulty
- [ ] **6.3.15** Test: `GET /api/puzzles/Easy%20Scan%20Grid` returns puzzle with grid
- [ ] **6.3.16** Test: `GET /api/puzzles/NonExistent` returns 404 with available puzzle names
- [ ] **6.3.17** Test: `GET /health` returns status=ok
- [ ] **6.3.18** Test: Rate limiting returns 429 after exceeding limit

### 6.4 Performance Tests

- [ ] **6.4.1** Test: Unit Completion endpoint responds in <50ms
- [ ] **6.4.2** Test: Hidden Singles endpoint responds in <100ms
- [ ] **6.4.3** Test: Naked Singles endpoint responds in <150ms
- [ ] **6.4.4** Test: Solve endpoint responds in <500ms

---

## Phase 7: Configuration and Deployment (Priority: MEDIUM)

### 7.1 Environment Configuration

- [ ] **7.1.1** Create `.env.example` with documented variables:
  - `PORT`, `NODE_ENV`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, `CORS_ORIGIN`, `LOG_LEVEL`
- [ ] **7.1.2** Install `dotenv`: `npm install dotenv`
- [ ] **7.1.3** Load `.env` in `api/server.ts`
- [ ] **7.1.4** Add `.env` to `.gitignore`

### 7.2 Docker Support (Optional)

- [ ] **7.2.1** Create `Dockerfile` with multi-stage build (build → runtime)
- [ ] **7.2.2** Create `docker-compose.yml` for local development
- [ ] **7.2.3** Create `.dockerignore` (node_modules, .git, dist, audit_logs)
- [ ] **7.2.4** Verify `docker compose up` starts API successfully

### 7.3 Request Size Limiting

- [ ] **7.3.1** Configure `express.json({ limit: '100kb' })` to prevent large payloads

---

## Phase 8: Documentation and Completion

- [ ] **8.1** Create implementation log: `DOCS/.implementation/IMPL_LOG_[date]_REST_API_Wrapper.md`
- [ ] **8.2** Update `CLAUDE.md` — Add REST API section with endpoints, example curl commands, environment variables
- [ ] **8.3** Update `DOCS/.design/DESIGN_REST_API_Wrapper.md` status from "Approved" to "Implemented"
- [ ] **8.4** Update `DOCS/.planning/BACKLOG.md` — Mark BACKLOG-009 as completed
- [ ] **8.5** Update `DOCS/.design/README.md` — Update status of REST API design document
- [ ] **8.6** Update `package.json` description and scripts documentation
- [ ] **8.7** Document any deviations from the design document in the implementation log

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Express.js 4.x | Industry standard, lightweight, consistent with Web UI plan |
| Validation | Custom middleware + GridValidator | Avoids adding Joi/Zod dependency for simple grid validation |
| Change detection | Before/after grid diff | Works without modifying solver internals |
| API versioning | Not in MVP (future: `/api/v1/`) | Premature for a POC; add when breaking changes needed |
| Authentication | Not in MVP | No sensitive data; add JWT if needed later |
| Testing | Supertest + Jest | Standard for Express API testing |
| Documentation | Swagger/OpenAPI 3.0 | Industry standard, interactive documentation |
| CORS | `cors` middleware | Simple configuration, supports frontend integration |
| Security | Helmet + rate limiting | Covers OWASP basics without over-engineering |

---

## Dependencies Between Phases

```
Phase 1 (Setup) ──→ Phase 2 (Validation) ──→ Phase 3 (Service) ──→ Phase 4 (Routes)
                                                                          │
                                                                          ├──→ Phase 5 (Docs)
                                                                          │
                                                                          ├──→ Phase 6 (Testing)
                                                                          │
                                                                          ├──→ Phase 7 (Config/Deploy)
                                                                          │
                                                                          └──→ Phase 8 (Documentation)
```

Phases 5, 6, 7, 8 can be worked on in parallel once Phase 4 is complete.

---

## Files to Create

| File | Purpose |
|------|---------|
| `api/server.ts` | Express server entry point |
| `api/types/api.types.ts` | All TypeScript interfaces |
| `api/routes/techniques.routes.ts` | Technique endpoint routing |
| `api/routes/solve.routes.ts` | Solve endpoint routing |
| `api/routes/puzzles.routes.ts` | Puzzle listing endpoint routing |
| `api/controllers/TechniqueController.ts` | Technique request handlers |
| `api/controllers/SolveController.ts` | Solve request handler |
| `api/controllers/PuzzleController.ts` | Puzzle request handler |
| `api/services/SudokuApiService.ts` | Core business logic and change tracking |
| `api/middleware/validation.middleware.ts` | Request validation middleware |
| `api/middleware/error.middleware.ts` | Global error handler |
| `api/utils/gridValidator.ts` | Grid structure and constraint validation |
| `api/utils/responseFormatter.ts` | Response formatting helpers |
| `api/swagger.ts` | OpenAPI/Swagger configuration |
| `api/tests/gridValidator.test.ts` | Unit tests for grid validation |
| `api/tests/sudokuApiService.test.ts` | Unit tests for API service |
| `api/tests/api.integration.test.ts` | Integration tests for all endpoints |
| `.env.example` | Environment variable documentation |

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add express, cors, helmet, express-rate-limit, supertest, swagger deps; add `api` script |
| `.gitignore` | Add `.env` |
| `CLAUDE.md` | Add REST API section |

---

## Notes for Implementing Agent

- **Do not modify the existing solver classes** (`SudokuSolver`, `SudokuOrchestrator`, `PuzzleLoader`). The API wraps them via `SudokuApiService`.
- The design document shows `api/` at the same level as `app_src/` inside `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/`. Follow this convention.
- The solve endpoint currently **cannot provide per-algorithm statistics** without either modifying the orchestrator or implementing a step tracker (like the Web UI's `SolveStepTracker` or the Audit Trail's `AuditLogger`). For MVP, return zeroed statistics with a TODO comment. These will be populated when the Audit Trail (BACKLOG-008) is integrated.
- The design document mentions `Joi` or `Zod` for validation. For simplicity, a custom `GridValidator` is recommended instead — the validation rules are straightforward (9x9 grid, values 0-9) and don't warrant an additional dependency.
- **Port conflicts**: The Web UI design also uses port 3000. If both features coexist, use `PORT` env var or default to different ports (API: 3001, Web: 3000). Or consolidate into a single Express server.
- The `ChangeTracker` helper's `inferReason()` method starts basic (`"Cell [r,c] set to v"`). It can be enhanced later when the Audit Trail provides richer context.
- Supertest requires the Express `app` to be exported (not just started with `listen`). Structure `server.ts` accordingly.
- All endpoints return JSON. Set `Content-Type: application/json` consistently.

---

**Estimated Total Effort:** 24-32 hours across all phases
