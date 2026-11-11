---
version: 1
created: 2026-11-11T08:10:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-101 / TRIAGE-31
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-101 / TRIAGE-31 Map a malformed percent-escape in an API path to a client error, not 500

**Goal.** Update `errorHandler` in DEMOAPP001 (`demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts`) so that route-parameter URL decode failures (`URIError` with Express 4xx `status`, triggered by requests such as `GET /api/puzzles/%ZZ` and `GET /api/visualise/%ZZ`) return a documented `400` client error with a stable machine-readable error code (`INVALID_URL_ENCODING`) instead of falling through to `500 INTERNAL_SERVER_ERROR`, while preserving `500 INTERNAL_SERVER_ERROR` for unexpected server failures. Update `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml` in the same change per DR-035, add must-fail API integration tests and OpenAPI contract assertions, re-measure `demoapp001-openapi` if contract tests are expanded, and verify all DEMOAPP001 and repository parity gates.

Source: Root worklist item **TRIAGE-31** (follow-on from TRIAGE-19 Decision 4, LOW priority, owner-approved on 2026-11-08), tracked in `DOCS/.planning/backlog.md` as **BACKLOG-101**.

---

## Evidence gathered before planning

Audited on 2026-11-11 on branch `worklist/triage-31-malformed-percent-escape` cut from `main` @ `0153a7f`:

### 1. Live Probe & Express 5 Runtime Behaviour
Probed directly against `createApp()` under Node `v24.18.0` and Express 5 (`express@^5.2.1`):
- `GET /api/puzzles/%ZZ` returns HTTP **500** with `{ success: false, error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred', requestId }`.
- `GET /api/visualise/%ZZ` returns HTTP **500** with `{ success: false, error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred', requestId }`.
- Non-parameter routes (`GET /%ZZ`, `GET /api/%ZZ`) bypass Express static middleware cleanly and return HTTP **404** `ROUTE_NOT_FOUND`. `/api/puzzles/:name` and `/api/visualise/:name` are the only two parameterised routes in `app.ts`.
- Inspecting the error object forwarded by Express 5's router (`decode_param`) to Express error middleware on `GET /api/puzzles/%ZZ` confirms:
  - `error instanceof URIError` (`constructorName: 'URIError'`)
  - `error.status === 400` (`error.statusCode === undefined` — Express sets `status`, not `statusCode`, on route parameter `URIError` instances)
  - `error.message === "Failed to decode param '%ZZ'"`

### 2. Current `errorHandler` (`app_src/server/app.ts` lines 147–186)
- Checks `if (error instanceof ApiError)` -> responds with `error.statusCode` and `error.code`.
- Checks `if (isJsonParseError(error))` (`error instanceof SyntaxError && 'status' in error`) -> responds with `400 INVALID_JSON` (`'Request body must be valid JSON'`).
- Falls through to `500 INTERNAL_SERVER_ERROR` (`'An unexpected error occurred'`) for all other errors, including Express `URIError` route-parameter decode failures.

### 3. OpenAPI Contract (`demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml`)
- `/api/puzzles/{name}` (`getPuzzleByName`, lines 210–227) and `/api/visualise/{name}` (`getVisualise`, lines 229–246) currently declare `'200'`, `'404'` (`PuzzleNotFound`), and `'500'` (`InternalError`), with no `'400'` response entry.
- `components.responses.BadRequest` (lines 324–334) and `components.schemas.ErrorResponse.properties.error.enum` (lines 687–702) enumerate all documented `error` codes (`MISSING_GRID`, `INVALID_GRID_FORMAT`, `INVALID_JSON`, `INVALID_TARGET_NUMBER`, `PUZZLE_NOT_FOUND`, `ROUTE_NOT_FOUND`, `AUDIT_TRAIL_UNAVAILABLE`, `INTERNAL_SERVER_ERROR`, and the four generator validation codes).
- Under DR-035 decision 2, introducing a `400` response on `/api/puzzles/{name}` and `/api/visualise/{name}` plus a new error code requires updating `docs/openapi.yaml` in the same change.
- `redocly.yaml` disables only `no-server-example.com` and `operation-4xx-response`; adding `'400': $ref: '#/components/responses/BadRequest'` on both paths and `INVALID_URL_ENCODING` in `ErrorResponse` complies with Redocly lint and `openapi-backend`.

### 4. Test & Execution Inventory Scope
- `tests/api/api.integration.ts` currently exercises `GET /api/puzzles/100%25` (line 119) and `GET /api/visualise/100%25` / `Easy%2520Scan%2520Grid` (lines 273–278), both expecting `404 PUZZLE_NOT_FOUND`. This file is not fingerprinted in `DOCS/.analysis/2026-10-07-component-execution-inventory.json`.
- `tests/api/openapi.contract.test.ts` IS fingerprinted under `demoapp001-openapi` (`11` measured tests) in `DOCS/.analysis/2026-10-07-component-execution-inventory.json`. Adding an OpenAPI contract test asserting live `400` conformance for `getPuzzleByName` and `getVisualise` will require re-measuring `demoapp001-openapi` (`11 -> 12` tests) and aligning the `11 OpenAPI` currency claims and `.batch/test-documentation-currency.ps1` mutation anchors (`README.md`, `demoapp001/README.md`, `demoapp001/docs/README.md`, `demoapp001/docs/qa-strategy.md`).

---

## Proposed Changes

1. **Must-Fail API Integration & Contract Tests (Red Before Fix):**
   - `demo-apps/demoapp001-typescript-cypress/tests/api/api.integration.ts`:
     - In `puzzleEndpoints()`: assert `GET /api/puzzles/%ZZ` returns `400` with `error === 'INVALID_URL_ENCODING'`.
     - In `visualiseEndpoint()`: assert `GET /api/visualise/%ZZ` returns `400` with `error === 'INVALID_URL_ENCODING'`.
   - `demo-apps/demoapp001-typescript-cypress/tests/api/openapi.contract.test.ts`:
     - Add contract test validating live `GET /api/puzzles/%ZZ` and `GET /api/visualise/%ZZ` return `400` with `error === 'INVALID_URL_ENCODING'` and conform to `getPuzzleByName` and `getVisualise` OpenAPI schemas, while unexpected internal `URIError` / `Error` still returns `500 INTERNAL_SERVER_ERROR`.
   - Run `npm run test:api` and `npm run test:openapi` against unchanged `app.ts` / `openapi.yaml` to capture the empirical must-fail red baseline (500 returned instead of 400).

2. **Express Error Handler Update (`app_src/server/app.ts`):**
   - Add `isRouteDecodeError(error: unknown): error is URIError & { status: number }` matching `error instanceof URIError && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500`.
   - Handle it in `errorHandler` by returning `res.status(error.status).json({ success: false, error: 'INVALID_URL_ENCODING', message: 'Invalid URL percent-encoding in request path', requestId })`.
   - Preserve `500 INTERNAL_SERVER_ERROR` for all unexpected errors (including any `URIError` thrown internally without an Express router 4xx `status`).

3. **OpenAPI Specification (`docs/openapi.yaml`) & Execution Inventory:**
   - Add `'400': $ref: '#/components/responses/BadRequest'` to `/api/puzzles/{name}` (`getPuzzleByName`) and `/api/visualise/{name}` (`getVisualise`).
   - Add `INVALID_URL_ENCODING` to `ErrorResponse.properties.error.enum` and update `components.responses.BadRequest.description`.
   - Re-measure `demoapp001-openapi` (`11 -> 12` tests) in `DOCS/.analysis/2026-10-07-component-execution-inventory.json`, align active OpenAPI count claims and `.batch/test-documentation-currency.ps1` mutation anchors (`11 -> 12`), and record under `[Unreleased] > Fixed` in `CHANGELOG.md`.

---

## Key Decisions for Owner Review

### Decision 1: Error-Matching Strategy in `errorHandler`
- **Option A (Recommended):** Narrowly match Express route-parameter `URIError` carrying a 4xx `.status` property (`isRouteDecodeError`), sibling to `isJsonParseError`, mapping to `400 INVALID_URL_ENCODING`, while preserving `500 INTERNAL_SERVER_ERROR` for internal `URIError` or other unexpected errors.
- **Option B:** Generic pass-through of any error object carrying a 4xx `status`/`statusCode` property. *Rejected:* Could emit undocumented 4xx statuses (e.g., `413 PayloadTooLargeError`) outside the OpenAPI `ErrorResponse` contract without dedicated schema entries.

### Decision 2: OpenAPI Contract Coverage & `demoapp001-openapi` Inventory
- **Option A (Recommended):** Update `docs/openapi.yaml` (add `'400'` on both `getPuzzleByName` and `getVisualise`, plus `INVALID_URL_ENCODING` in `ErrorResponse.properties.error.enum`) **and** add `tests/api/openapi.contract.test.ts` assertions proving live `400` schema conformance on both routes (re-measuring `demoapp001-openapi` from `11` to `12` tests, following TRIAGE-10 precedent).
- **Option B:** Update `docs/openapi.yaml` and add tests only in `tests/api/api.integration.ts` without modifying `openapi.contract.test.ts`. *Rejected:* Leaves the newly added `400` responses unverified by `openapi-backend`.

### Decision 3: No Decision Record Required
- **Recommendation:** Confirm no Decision Record is required (`None expected` in `DOCS/.planning/backlog.md`). Aligns Express error middleware with DR-035 and updates OpenAPI in the same change without changing validation boundaries (`DOCS/.architecture/validation-boundaries.md`) or cross-Stack Gherkin contracts.

### Decision 4: Two-Stage Delivery and Verification Protocol
- **Recommendation:** Execute in two standard stages:
  1. Implementation PR (`worklist/triage-31-malformed-percent-escape`): Mark `BACKLOG-101` `In Progress`, capture must-fail red baseline on unchanged `app.ts` / `openapi.yaml`, implement `errorHandler` + OpenAPI + API/OpenAPI tests + re-measure `demoapp001-openapi` and currency claims, verify all DEMOAPP001 gates and all 8 parity gates, merge on all-green CI.
  2. Outcome PR (`worklist/triage-31-outcome`): Mark `BACKLOG-101` `Resolved` (`0 Open / 0 In Progress / 124 Resolved / 124 Total`), mark plan `delivered`, author implementation log, merge on all-green CI, and tick `- [x] TRIAGE-31` in root worklist.

---

## Test & Verification Plan

1. **Must-fail baseline (pre-fix):** `npm run test:api` and `npm run test:openapi` fail on `GET /api/puzzles/%ZZ` and `GET /api/visualise/%ZZ` returning `500` instead of `400`.
2. **DEMOAPP001 gates:** `npm run build`, `npm run lint`, `npm run format:check`, `npm run test:api`, `npm run verify:openapi` (`redocly lint` + `12/12` OpenAPI contract tests), `npm run test:coverage` (`115/115` with 70%/85%/75% floors), `npm test` (`115` component + `55` scenarios / `309` steps).
3. **Repository parity & currency gates:** `.batch/check-ra-header-currency.ps1`, `.batch/test-documentation-currency.ps1` (`37/37`), `.batch/run-parity-checks.ps1` (all 8 parity gates).
4. **CI Verification:** All 5 required CI jobs (`DEMOAPP001 TypeScript Cypress`, `DEMOAPP002 Python Pytest`, `DEMOAPP003 C# Reqnroll`, `Parity gate and evidence page`, `Gate (all stacks green)`) pass completely green.
