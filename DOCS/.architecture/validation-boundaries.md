# Validation Boundaries

**Last updated:** 2026-06-13
**Status:** Authoritative for validation layer responsibilities (platform specification v1.1 §2.2, row 4)
**Sources:** review `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` Risk 4 (worklist item SUD-04); decision DR-035; v1.0 specification §7 (`DOCS/.design/sudoku-solver-specification.md`)

---

## 1. Purpose

The v1.0 specification makes **structure validation mandatory** (§7.1) and **constraint
validation optional** (§7.3). The platform implements that split deliberately, but until this
document existed the split was implicit in code. This document states which validation each
layer performs. The description applies **identically to all three stacks** — DEMOAPP001
(TypeScript), DEMOAPP002 (Python), DEMOAPP003 (C#) — except where a layer exists in only one
stack (the REST API and Web UI are DEMOAPP001 staged surfaces; see platform specification
v1.1 §6).

Terminology:

- **Structure validation** — shape and range: exactly 9 rows, exactly 9 columns per row,
  every cell an integer 0–9 (v1.0 §7.1).
- **Constraint validation** — Sudoku legality: no duplicate non-zero digit in any row,
  column, or block (v1.0 §7.3).

---

## 2. Layer Responsibilities

| Layer | Structure validation | Constraint validation | Stacks |
|-------|---------------------|----------------------|--------|
| Puzzle loader (`PuzzleLoader`) | **Yes — mandatory, fail-fast** on load | **No** (explicitly deferred — see §5) | All three |
| Solver (`SudokuSolver`) | No — assumes structurally valid input | **Query only** — exposes a constraint check; does not gate solving on it | All three |
| Orchestrator | No | No — runs algorithms on the grid as given | All three |
| REST API request parsing | **Yes** — re-validates untrusted HTTP input on every grid-accepting endpoint | No | DEMOAPP001 only |
| REST API validation endpoint | n/a (input is structure-validated first) | **Yes — on demand** via `POST /api/validate` | DEMOAPP001 only |

### 2.1 Loader — structure only

Each stack's loader validates every puzzle at load time and throws on the first failure,
using the v1.0 §7.1 wording (`must have exactly 9 rows`, `must have exactly 9 columns`,
`has invalid value at [r][c]: v`):

| Stack | File | Integer enforcement |
|-------|------|--------------------|
| DEMOAPP001 | `demo-apps/demoapp001-typescript-cypress/app_src/PuzzleLoader.ts` | Explicit `Number.isInteger(cell)` check |
| DEMOAPP002 | `demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py` | Explicit `isinstance(cell, int)` check |
| DEMOAPP003 | `demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs` | Typed deserialization — `System.Text.Json` into `int[][]` rejects non-integer JSON before the range check runs |

The DEMOAPP003 difference is a mechanism difference, not a responsibility difference: integer
enforcement happens at deserialization rather than in an explicit cell check, so a non-integer
numeric shape surfaces as a `System.Text.Json.JsonException` at load time rather than as the
v1.0 §7.1 message. Worklist item SUD-06 (review Risk 6, Low) **resolved this by documentation**
(the lower-risk of the two offered options): the DEMOAPP003 README "Puzzle Validation" section
states typed deserialization is the C# integer-validation mechanism and notes the resulting
error-surface difference. The loader was deliberately **not** changed to wrap the exception into
the v1.0 wording — that would add C#-only behaviour the other stacks do not have, for a Low-severity
cosmetic difference in an internal fixture-load path.

**Cross-stack parity rule:** the three loaders MUST keep identical validation rules and error
wording (after language idiom). A change to one loader's validation is a change to all three.

### 2.2 Solver — constraint query, not a gate

Each solver exposes a constraint check over the current working grid:

| Stack | Method |
|-------|--------|
| DEMOAPP001 | `SudokuSolver.noConstraintViolations()` |
| DEMOAPP002 | `SudokuSolver.no_constraint_violations()` |
| DEMOAPP003 | `SudokuSolver.NoConstraintViolations()` |

The method returns `true` when no row, column, or block contains a duplicate non-zero digit.
It is a **query** used by tests (Screenplay Questions in all three stacks) and available to
callers; the solver and orchestrator do **not** invoke it before solving. This matches v1.0
§7.3, which marks constraint validation optional.

### 2.3 Consequence: structurally valid but contradictory grids

A grid can pass structure validation while already violating Sudoku constraints (e.g. two 5s
in one row). Per v1.0, solving behaviour for such input is **undefined**: the deterministic
techniques will simply make no progress or produce arbitrary-but-deterministic placements, and
the orchestrator reports `SOLVED` or `STUCK_ON_ADVANCED_LOGIC` as usual. Callers who need
legality assurance must ask for it explicitly — via the solver constraint query in-process, or
`POST /api/validate` over HTTP. This is the documented, intentional behaviour (review Risk 4).

---

## 3. REST API Validation (DEMOAPP001)

The Express REST API (`app_src/server/`) treats HTTP input as untrusted and re-validates
structure on every grid-accepting endpoint, independent of the loader:

- `parseGrid` / `validateGridFormat` (`app_src/server/validation.ts`) enforce the same
  shape/range/integer rules as the loader. Failures return structured errors:
  `400 MISSING_GRID`, `400 INVALID_GRID_FORMAT` (with field-level detail), `400 INVALID_JSON`.
- `POST /api/techniques/hidden-singles` additionally validates the optional `targetNumber`
  (integer 1–9) — failures return `422 INVALID_TARGET_NUMBER`.
- `POST /api/validate` is the **constraint-validation surface**: it reports duplicate
  conflicts per row, column, and block with cell coordinates. Technique and solve endpoints do
  **not** constraint-validate their input (§2.3 applies).

The authoritative HTTP contract — paths, request/response schemas, and error codes — is the
OpenAPI document at `../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml`
(adopted by DR-035). The design rationale lives in `../.design/rest-api-wrapper.md`.

---

## 4. Web UI (DEMOAPP001)

The Web UI consumes the REST API and performs no validation of its own beyond basic input
affordances; all validation guarantees come from the API layer (§3).

---

## 5. Strict Loader Mode — Explicitly Deferred

The review (Risk 4) suggested considering an **optional strict mode** on loaders that would
perform duplicate-constraint validation at load time.

**Decision (user, 2026-06-12; recorded as DR-035): not adopted — explicitly deferred, not
open.** The loaders remain structure-only:

- `puzzles.json` is curated fixture data, already exercised by the test suites and
  constraint-checkable via the solver query and `POST /api/validate`;
- a strict mode would blur the layer split this document exists to state (loader = structure;
  solver/API = constraints) and add a behavioural switch all three stacks would have to keep
  in parity for no test benefit.

Revisiting this requires a new decision-register entry superseding DR-035's deferral; it is
not an open question to be picked up in passing.

---

## 6. Related Documents

- `DOCS/.design/sudoku-solver-specification.md` — v1.0 §7 validation rules (core baseline)
- `DOCS/.design/sudoku-solver-platform-specification.md` — v1.1 §2.2 row 4 defers layer
  responsibilities to this document
- `DOCS/.design/rest-api-wrapper.md` — REST API design
- `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml` — authoritative HTTP contract
- `decision-register.md` — DR-035
