# Implementation Log: REST API Wrapper (BACKLOG-009)

**Date:** 2026-05-20T15:43:51Z
**Session goal:** Resolve BACKLOG-009 by adding a DEMOAPP001 Express REST API wrapper around the Sudoku solver.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Action the recommended next tasks, validating and committing each completed task.

**Scope that emerged:**

- Add a runnable Express API server under DEMOAPP001.
- Use existing solver, puzzle loader, and audit trail infrastructure rather than duplicating solver behavior.
- Add endpoint-level integration checks covering all BACKLOG-009 API endpoints.
- Update backlog, subject application contract, README guidance, CLAUDE.md, and changelog to reflect the new active API surface.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Keep the API under `app_src/server/` | The REST design names `app_src/server/index.ts` as the shared Express entry point, and keeping it under `app_src/` makes it part of normal TypeScript build/lint validation | No |
| Use `AuditLogger` for API solve tracking | BACKLOG-009 requires step tracking; the audit feature already records algorithm attribution, cell changes, iterations, and statistics | No |
| Use explicit in-repo request validation instead of adding a schema library | The request shapes are small and stable; manual validation keeps dependencies minimal while still producing structured errors | No |
| Add a small Supertest integration script instead of a separate Jest stack | The project does not currently use Jest. `npm run test:api` gives endpoint coverage without introducing another test runner | No |

---

## 3. Files Created or Significantly Modified

### Created

| File | Purpose |
|------|---------|
| `app_src/server/app.ts` | Express app factory, routes, CORS headers, error middleware |
| `app_src/server/index.ts` | API server entry point using `PORT` or 3000 |
| `app_src/server/SudokuApiService.ts` | API service layer over solver, orchestrator, puzzle loader, and audit logger |
| `app_src/server/types.ts` | Request/response and API contract types |
| `app_src/server/errors.ts` | Structured API error class |
| `app_src/server/validation.ts` | Grid parsing, request option parsing, and validation conflict reporting |
| `tests/api/api.integration.ts` | Supertest checks for health, puzzle, validate, technique, solve, and error endpoints |

### Modified

| File | Change summary |
|------|---------------|
| `package.json`, `package-lock.json` | Added Express/Supertest dependencies and `start:api`, `test:api` scripts |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-009 resolved; updated counts, roadmap, and acceptance criteria |
| `DOCS/.architecture/subject-app-contract.md` | Added active DEMOAPP001 `@api` surface contract |
| `README.md`, `CLAUDE.md`, `demo-apps/demoapp001-typescript-cypress/README.md`, `demo-apps/demoapp001-typescript-cypress/docs/README.md` | Documented API status and commands |
| `CHANGELOG.md` | Added BACKLOG-009 entry under Unreleased |

### Deleted

| File | Reason |
|------|--------|
| None | Not applicable |

---

## 4. Bugs and Errors Encountered

### Strict TypeScript parameter narrowing

**Symptom:** `npm run build` failed because Express 5 route params are typed as `string | string[]`, and `targetNumber` was still `unknown` after record narrowing.

**Root cause:** The initial route and validation code relied on implicit narrowing that strict TypeScript does not allow.

**Fix:** Added a `firstParam()` helper for route params and explicit `typeof targetNumber === 'number'` validation before numeric comparisons.

---

## 5. Lessons Learned

- Express 5 type definitions are stricter than the older Express 4 patterns often used in examples.
- The existing `AuditLogger` is a good API boundary: it avoids a second delta tracker and keeps future Web UI playback aligned with solver-side audit data.
- A lightweight integration script was enough for endpoint coverage without adding a full test framework.

---

## 6. Current State at End of Session

**Completed this session:**

- BACKLOG-009 REST API wrapper is implemented.
- API endpoints are covered by `npm run test:api`.
- DEMOAPP001 build, lint, formatting, and Cucumber suite pass.
- DEMOAPP002 pytest suite and repository parity gates pass in final validation.

**Left incomplete / deferred:**

- BACKLOG-018 Web UI Solver Visualisation remains the next API-dependent product task.
- Swagger/OpenAPI documentation remains design-level only because it is not part of BACKLOG-009's active acceptance criteria.

**New backlog items generated:**

- None.

---

## 7. Next Steps

1. Start BACKLOG-018 and consume the new API server rather than creating a second server.
2. Consider OpenAPI generation only if the API begins to need external consumer documentation beyond the current design doc.

---

*End of Implementation Log*
