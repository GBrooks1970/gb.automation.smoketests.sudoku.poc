# Implementation Log: BACKLOG-101 / TRIAGE-31 Map a malformed percent-escape in an API path to a client error, not 500

**Date:** 2026-11-11T08:25:00Z
**Session goal:** Update `errorHandler` in DEMOAPP001 (`demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts`) so Express route-parameter `URIError` decode failures (such as `GET /api/puzzles/%ZZ` and `GET /api/visualise/%ZZ`) return `400 INVALID_URL_ENCODING` instead of falling through to `500 INTERNAL_SERVER_ERROR`, align `docs/openapi.yaml` per DR-035, add must-fail integration and OpenAPI contract coverage, re-measure `demoapp001-openapi`, and verify all local and CI gates.
**Outcome:** Completed (PR #141 / `927e755`)

---

## 1. Primary Request and Intent

**What was asked:** Deliver the final triage item on the backlog — root worklist item **TRIAGE-31** (follow-on from TRIAGE-19 Decision 4, LOW priority), tracked in `DOCS/.planning/backlog.md` as **BACKLOG-101**. Under the owner-approved implementation plan (Decisions 1–4):
- Add must-fail API integration assertions (`GET /api/puzzles/%ZZ`, `GET /api/visualise/%ZZ`) in `tests/api/api.integration.ts` and an OpenAPI contract test in `tests/api/openapi.contract.test.ts` proving `500` failure before the fix.
- Add `isRouteDecodeError` in `app_src/server/app.ts` returning `400 INVALID_URL_ENCODING` while preserving `500 INTERNAL_SERVER_ERROR` for internal `URIError` or other unexpected failures.
- Update `docs/openapi.yaml` in the same change per DR-035 (`'400': $ref: '#/components/responses/BadRequest'` on `getPuzzleByName` and `getVisualise`, plus `INVALID_URL_ENCODING` in `ErrorResponse.properties.error.enum`).
- Re-measure `demoapp001-openapi` (`11 -> 12` tests) in `DOCS/.analysis/2026-10-07-component-execution-inventory.json`, align active OpenAPI currency claims and `.batch/test-documentation-currency.ps1` mutation anchors, and record in `CHANGELOG.md`.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Narrow `isRouteDecodeError` predicate (`error instanceof URIError && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500`) | Express 5's `decode_param` sets `.status = 400` and leaves `.statusCode = undefined`; matching Express 4xx `URIError` specifically avoids emitting undocumented 4xx statuses (e.g., `413 PayloadTooLargeError`) and keeps internal `URIError` mapped to `500` | None required (aligns middleware with DR-035) |
| Update `docs/openapi.yaml` and add live `400`/`500` OpenAPI contract test (`11 -> 12` tests) | DR-035 requires OpenAPI updates in the same change as new status/error codes; verifying both `400 INVALID_URL_ENCODING` and internal `URIError` `500` via `openapi-backend` closes the contract gap | None required |
| No Decision Record required | Aligns Express error middleware with DR-035 without changing validation boundaries or cross-Stack Gherkin contracts | None required |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-11-triage-31-malformed-percent-escape.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-11_triage-31-malformed-percent-escape.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts` | Added `isRouteDecodeError` handling in `errorHandler` returning HTTP `400 INVALID_URL_ENCODING` |
| `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml` | Added `'400': $ref: '#/components/responses/BadRequest'` to `getPuzzleByName` and `getVisualise`, updated `BadRequest` description, and added `INVALID_URL_ENCODING` to `ErrorResponse.properties.error.enum` |
| `demo-apps/demoapp001-typescript-cypress/tests/api/api.integration.ts` | Added `GET /api/puzzles/%ZZ` and `GET /api/visualise/%ZZ` 400 `INVALID_URL_ENCODING` integration checks |
| `demo-apps/demoapp001-typescript-cypress/tests/api/openapi.contract.test.ts` | Added 12th OpenAPI contract test covering live 400 `INVALID_URL_ENCODING` on both routes and `500 INTERNAL_SERVER_ERROR` preservation on internal `URIError` |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` | Re-measured `demoapp001-openapi` (`11 -> 12` tests) |
| `README.md`, `demoapp001/README.md`, `demoapp001/docs/README.md`, `demoapp001/docs/qa-strategy.md`, `.batch/test-documentation-currency.ps1` | Updated active OpenAPI count claims (`11 -> 12`) and currency mutation anchors |
| `CHANGELOG.md` | Added BACKLOG-101 entry under `[Unreleased] > Fixed` |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-101 Resolved (`0 Open / 0 In Progress / 124 Resolved / 124 Total`) |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-101 entry to Delivered with merge metadata |
| `DOCS/.implementation-logs/README.md` | Indexed new implementation log |

---

## 4. Verification

- **Pre-fix must-fail proof:** `npm run test:api` (exit 1) and `npm run verify:openapi` (`11/12` pass, `1` fail) both failed with `Error: expected 400 "Bad Request", got 500 "Internal Server Error"` on `GET /api/puzzles/%ZZ` before updating `app.ts` and `openapi.yaml`.
- **DEMOAPP001:** `npm run verify` (`tsc`, `eslint`, `prettier --check`, `test:api`, `redocly lint`, `12/12` OpenAPI contract tests, `115/115` component tests, `55` Cucumber scenarios / `309` steps) and `npm run test:coverage` (`115/115`; `80.01% lines / 92.01% branches / 80.17% functions`) PASS.
- **Governance & Parity:** `.batch/check-ra-header-currency.ps1` PASS (`v1.16`, `DR-001..DR-052`), `.batch/test-documentation-currency.ps1` PASS (`37/37`), and `.batch/run-parity-checks.ps1` PASS (all 8 parity gates).
- **CI:** Implementation PR [#141](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/141) (`1475b5e`) merged cleanly as `927e755` after all 5 required CI jobs passed (run `42986207472`: `DEMOAPP001 TypeScript Cypress` 3m58s, `DEMOAPP002 Python Pytest` 43s, `DEMOAPP003 C# Reqnroll` 1m24s, `Parity gate and evidence page` 11s, `Gate (all stacks green)` 3s).
