# Implementation Log: BACKLOG-091 / TRIAGE-10 Align generator request and validation-error schemas with runtime

**Date:** 2026-11-09T20:50:00Z
**Session goal:** Align canonical OpenAPI 3.0.3 specification (`docs/openapi.yaml`) with DEMOAPP001 Express runtime for puzzle generation request and response schemas (string and numeric seeds via `oneOf`), document the four generator 400 validation error codes in `ErrorResponse.properties.error.enum`, add dedicated contract tests, update execution inventory from 8 to 11 OpenAPI tests, and maintain 100% green parity across all three Stacks.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-10 (adjacent contract drift, LOW priority), tracked in the project backlog as BACKLOG-091. Under the owner-approved implementation plan (Decisions 1–4):
- Update `GeneratePuzzleRequestBody.properties.seed` and `GeneratedPuzzleResponse.properties.seed` to `oneOf: [{type: string}, {type: integer}]` in `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml`.
- Enumerate the 4 generator validation error codes (`INVALID_DIFFICULTY`, `INVALID_CLUE_COUNT`, `INVALID_SYMMETRICAL_OPTION`, `INVALID_SEED`) in `ErrorResponse.properties.error.enum` and update `BadRequest` component description.
- Add 3 dedicated contract tests in `demo-apps/demoapp001-typescript-cypress/tests/api/openapi.contract.test.ts` (suite total: 11 tests) verifying request schema seed types, live generator 200 response with numeric seed, and live generator 400 error codes against schema.
- Re-measure `demoapp001-openapi` in `DOCS/.analysis/2026-10-07-component-execution-inventory.json` from 8 to 11 tests, updating all doc references and `.batch/test-documentation-currency.ps1`.
- Verify Redocly CLI lint, full component & BDD test suites, 7 parity checks, and all 28 then-assertion mutation controls.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| `oneOf` for `seed` in OpenAPI 3.0.3 | Accurately models runtime Mulberry32/Express PRNG seed acceptance of both string and numeric inputs/outputs without losing contract specificity | Under Decision 1 (no new DR required) |
| Enumerate generator error codes in `ErrorResponse` | Extends existing machine-readable error enum with runtime codes `INVALID_DIFFICULTY`, `INVALID_CLUE_COUNT`, `INVALID_SYMMETRICAL_OPTION`, `INVALID_SEED` | Under Decision 2 (no new DR required) |
| Add 3 dedicated contract tests (Option A) | Clean separation of concerns; provides explicit contract assertions for generator schemas; honest re-measurement of `demoapp001-openapi` from 8 to 11 tests | Under Decision 3 (no new DR required) |
| Isolation to DEMOAPP001 | Generator route and OpenAPI contract testing is specific to DEMOAPP001; canonical Gherkin, Python, and C# Stacks remain untouched | Under Decision 4 (no new DR required) |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-09-triage-10-generator-openapi-alignment.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-09_triage-10-generator-openapi-alignment.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml` | Added `oneOf` for string/integer seeds in request and response schemas; added 4 error codes to `ErrorResponse.properties.error.enum`; updated `BadRequest.description` |
| `demo-apps/demoapp001-typescript-cypress/tests/api/openapi.contract.test.ts` | Added 3 dedicated contract tests (request seed types, live 200 response with numeric seed, live 400 error codes) |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` | Updated `demoapp001-openapi` measured count from 8 to 11 tests, updated source SHA and hash |
| `README.md` | Updated OpenAPI measured test count claim from 8 to 11 |
| `demo-apps/demoapp001-typescript-cypress/README.md` | Updated OpenAPI measured test count claim from 8 to 11 |
| `demo-apps/demoapp001-typescript-cypress/docs/README.md` | Updated OpenAPI measured test count claim from 8 to 11 |
| `demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md` | Updated OpenAPI measured test count claim from 8 to 11 |
| `.batch/test-documentation-currency.ps1` | Updated Before/After negative control anchors for OpenAPI test counts |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-091 as Resolved (counts: 10 Open / 0 In Progress / 114 Resolved / 124 Total) |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-091 delivery outcome |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

---

## 4. Bugs and Errors Encountered

### OpenAPI validator request object format
- **Symptom:** `contract.validateRequest` TypeScript type error TS2345 when omitting `headers`, and ESLint naming-convention error when specifying `headers: { 'content-type': 'application/json' }`.
- **Root cause:** `openapi-backend` `Request` interface requires a `headers` object, but ESLint rules disallow kebab-case keys in object literals.
- **Fix:** Provided `headers: {}`, which satisfies TypeScript interface requirements and avoids ESLint naming-convention violations.

### Success response structure in PuzzleGenerator
- **Symptom:** `assert.equal(response.body.success, true)` failed (`undefined == true`).
- **Root cause:** `GeneratedPuzzle` response schema in `openapi.yaml` does not contain a `success` boolean field (only `ErrorResponse` has `success: false`).
- **Fix:** Removed assertion on `response.body.success` and asserted `response.body.seed`, `response.body.difficulty`, and schema validation via `assertContractResponse`.

---

## 5. Lessons Learned

- Contract tests should strictly validate against the actual OpenAPI schema definitions rather than assuming symmetrical envelope fields (`success: true`) across endpoints.
- Managing execution inventories (`DOCS/.analysis/2026-10-07-component-execution-inventory.json`) and currency scripts (`check-ra-header-currency.ps1`, `test-documentation-currency.ps1`) requires keeping documentation count claims strictly synchronized with test additions.
