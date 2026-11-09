---
version: 1
created: 2026-11-09T19:45:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-091 / TRIAGE-10
status: delivered
language: en-GB
---

# Implementation plan: BACKLOG-091 / TRIAGE-10 Align generator request and validation-error schemas with runtime

**Goal.** Align the OpenAPI specification (`demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml`) with the live Express runtime implementation (`app_src/server/validation.ts` and `app_src/generator/`) for puzzle generation requests, responses, and validation error handling. Represent both string and numeric seeds in `GeneratePuzzleRequestBody` and `GeneratedPuzzleResponse`, enumerate the four generator validation error codes (`INVALID_DIFFICULTY`, `INVALID_CLUE_COUNT`, `INVALID_SYMMETRICAL_OPTION`, `INVALID_SEED`) in `ErrorResponse.properties.error.enum`, and add focused contract tests in `tests/api/openapi.contract.test.ts` to prove request/response schema parity without narrowing runtime parser behaviour.

Source: Root worklist item **TRIAGE-10** (adjacent contract drift, LOW priority), tracked in the project backlog as **BACKLOG-091**.

---

## Evidence gathered before planning

Audited on 2026-11-09 on branch `worklist/triage-10-openapi-generator-schema` cut from `main` @ `14e5b79`:

### 1. Runtime vs OpenAPI Contract Drift

The DEMOAPP001 Express runtime parser `parseGenerateOptions` in `app_src/server/validation.ts` (lines 290–346) implements the following behaviour:
- **Seed flexibility:** Accepts either string or number (`typeof body.seed !== 'string' && typeof body.seed !== 'number'`). The PRNG (`Mulberry32` in `app_src/generator/prng.ts`) explicitly accepts `number | string` (default 12345).
- **Generator 400 validation error codes:** Emits four distinct machine-readable error codes on validation failure:
  1. `INVALID_DIFFICULTY`: `'Difficulty must be one of: Easy, Medium, Hard, Expert'` (status 400)
  2. `INVALID_CLUE_COUNT`: `'clueCount must be an integer between 17 and 81'` (status 400)
  3. `INVALID_SYMMETRICAL_OPTION`: `'symmetrical option must be a boolean'` (status 400)
  4. `INVALID_SEED`: `'seed must be a string or number'` (status 400)

In contrast, `docs/openapi.yaml`:
- Declares `GeneratePuzzleRequestBody.properties.seed` as `type: string` only, even though its prose description says `"Seed string or number for 100% reproducible puzzle generation"`.
- Declares `GeneratedPuzzleResponse.properties.seed` as `type: string` only.
- In `ErrorResponse.properties.error.enum` (lines 685–695), completely omits all four generator validation error codes (`INVALID_DIFFICULTY`, `INVALID_CLUE_COUNT`, `INVALID_SYMMETRICAL_OPTION`, `INVALID_SEED`).
- In `components/responses/BadRequest.description` (lines 324–328), mentions only `MISSING_GRID`, `INVALID_GRID_FORMAT`, and `INVALID_JSON`.

### 2. Empirical Must-Fail Baselines (Captured 2026-11-09)

Probing the unpatched OpenAPI document with `openapi-backend` confirms active schema rejection of valid runtime payloads:

- **Must-Fail Probe 1 (Numeric Seed Request Validation):**
  Running `contract.validateRequest({ path: '/api/generator/generate', method: 'post', body: { seed: 12345 }, headers: { 'content-type': 'application/json' } })` yields:
  ```json
  [
    {
      "instancePath": "/requestBody/seed",
      "schemaPath": "#/properties/requestBody/properties/seed/type",
      "keyword": "type",
      "params": { "type": "string" },
      "message": "must be string"
    }
  ]
  ```
  Result: `valid: false`. The OpenAPI schema rejects numeric seeds that the Express app accepts.

- **Must-Fail Probe 2 (Generator Validation Error Codes Response Validation):**
  Running `contract.validateResponse({ success: false, error: <code>, message: '...' }, 'postGeneratePuzzle', 400)` for each of the four codes yields:
  ```
  INVALID_DIFFICULTY valid: false (must be equal to one of the allowed values)
  INVALID_CLUE_COUNT valid: false (must be equal to one of the allowed values)
  INVALID_SYMMETRICAL_OPTION valid: false (must be equal to one of the allowed values)
  INVALID_SEED valid: false (must be equal to one of the allowed values)
  ```
  Result: All four real error responses emitted by the server violate the OpenAPI schema.

---

## Decisions for Owner Review

### Decision 1: Seed Representation in `GeneratePuzzleRequestBody` and `GeneratedPuzzleResponse`
- **Options:**
  - *Option A (Recommended):* Use `oneOf: [{ type: string }, { type: integer }]` for `seed` in `GeneratePuzzleRequestBody` and `GeneratedPuzzleResponse`. This accurately models the integer/string seeds supported by `Mulberry32` and `validation.ts`, matches Redocly and Ajv OpenAPI 3.0.3 standards, and prevents ambiguous type coercions.
  - *Option B:* Use `anyOf: [{ type: string }, { type: integer }]`. Functionally identical for disjoint primitive types, but `oneOf` is the idiomatic OpenAPI schema pattern.
  - *Option C:* Use `type: number` instead of `integer`. Runtime does bitwise truncation (`seed >>> 0`), but integer is more precise for Sudoku PRNG seeds.
- **Recommendation:** Adopt Option A (`oneOf: [{ type: string }, { type: integer }]`).

### Decision 2: Enumerate Generator 400 Codes in `ErrorResponse` and Update `BadRequest`
- **Plan:**
  1. Add `INVALID_DIFFICULTY`, `INVALID_CLUE_COUNT`, `INVALID_SYMMETRICAL_OPTION`, and `INVALID_SEED` to `ErrorResponse.properties.error.enum` in `docs/openapi.yaml`.
  2. Update `components/responses/BadRequest.description` to document that 400 responses also encompass generator option validation errors (`INVALID_DIFFICULTY`, `INVALID_CLUE_COUNT`, `INVALID_SYMMETRICAL_OPTION`, `INVALID_SEED`).
- **Recommendation:** Approve as proposed.

### Decision 3: Contract Test Architecture & Inventory Scope
- **Options:**
  - *Option A (Recommended):* Add dedicated contract tests in `tests/api/openapi.contract.test.ts`:
    1. A test validating that OpenAPI request schema accepts both string and numeric seeds (`12345`), and rejects invalid types (`boolean`, `array`).
    2. A test asserting that live Express generator requests with numeric seeds return 200 and satisfy `postGeneratePuzzle` response schema.
    3. A test asserting that live Express requests with invalid generator options return 400 with the exact error codes and satisfy `postGeneratePuzzle` 400 response schema.
    4. Re-measure the `demoapp001-openapi` suite in `DOCS/.analysis/2026-10-07-component-execution-inventory.json` (increasing measured count from 8 to 11 tests), and update active count claims in `README.md`, `CLAUDE.md`, and `DOCS/.planning/backlog.md` (exactly as performed in TRIAGE-18 for C# component count).
  - *Option B:* Inline the new checks into the existing 8 tests (e.g. into `OpenAPI accepts representative success responses` and `OpenAPI accepts representative client-error responses`), keeping the test count at 8. Only refresh the source SHA256 of `openapi.contract.test.ts` in `inventory.json`.
- **Recommendation:** Adopt Option A for clean separation of concerns, explicit contract test coverage for generator validation, and honest execution inventory re-measurement.

### Decision 4: Scope Boundary (DEMOAPP001 Only, No BDD Changes)
- **Plan:**
  - This work is strictly isolated to DEMOAPP001 (`demo-apps/demoapp001-typescript-cypress`) OpenAPI specification and contract tests.
  - No changes to canonical Gherkin (`features-shared/`), no changes to Python (DEMOAPP002) or C# (DEMOAPP003).
  - All 55 BDD scenarios (309 steps) across all three Stacks and all 7 repository parity gates must remain completely green.
- **Recommendation:** Approve as proposed.

---

## Execution Steps (Post-Approval)

1. **Backlog Transition:** Mark BACKLOG-091 as `In Progress` in `DOCS/.planning/backlog.md` (10 Open / 1 In Progress / 113 Resolved / 124 Total).
2. **Schema Updates:** Update `docs/openapi.yaml` per Decisions 1 and 2.
3. **Contract Tests:** Add focused request and response contract tests in `tests/api/openapi.contract.test.ts` per Decision 3.
4. **Local Verification:**
   - Run `npm run verify:openapi` (Redocly linting + contract tests).
   - Run `npm test` in DEMOAPP001 (113 component + 55 BDD scenarios / 309 steps).
   - Re-measure `demoapp001-openapi` in `DOCS/.analysis/2026-10-07-component-execution-inventory.json` and update count claims in `README.md`, `CLAUDE.md`, and `DOCS/.planning/backlog.md`.
   - Run `.batch/check-ra-header-currency.ps1` and `.batch/check-documentation-currency.ps1`.
   - Run 7 parity checks (`.batch/test-feature-file-parity.ps1`, etc.).
5. **PR & Merge:**
   - Push branch `worklist/triage-10-openapi-generator-schema` and open PR.
   - Verify all 5 CI jobs pass.
   - Merge on all-green, fast-forward `main`, and deliver outcome PR.


---

## Outcome (Delivered 2026-11-09)

- **PR:** [#118](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/118)
- **Merge Commit on main:** 803cd2- **Delivered Scope:**
  - \docs/openapi.yaml\: Represented both string and numeric PRNG seeds using \oneOf: [{type: string}, {type: integer}]\ in \GeneratePuzzleRequestBody\ and \GeneratedPuzzleResponse\.
  - Added four missing generator 400 validation error codes (\INVALID_DIFFICULTY\, \INVALID_CLUE_COUNT\, \INVALID_SYMMETRICAL_OPTION\, \INVALID_SEED\) to \ErrorResponse.properties.error.enum\, and updated \BadRequest\ component description.
  - Added 3 dedicated contract tests in \demo-apps/demoapp001-typescript-cypress/tests/api/openapi.contract.test.ts\ (total 11 tests) verifying seed request types, live Express 200 response with numeric seed, and live Express 400 responses with the 4 generator validation error codes.
  - Re-measured \demoapp001-openapi\ in \DOCS/.analysis/2026-10-07-component-execution-inventory.json\ from 8 to 11 tests, updating all doc references and \.batch/test-documentation-currency.ps1\.
- **Verification Evidence:**
  - Redocly CLI lint: PASS (0 errors, 0 warnings).
  - DEMOAPP001 tests: PASS (113 component + 11 openapi + 55 BDD scenarios / 309 steps).
  - Parity gates: PASS (7/7 gates clean).
  - Then-assertion mutations: PASS (28/28 killed).
  - GitHub Actions CI (PR run 42695824590): all 5 required jobs passed green.
