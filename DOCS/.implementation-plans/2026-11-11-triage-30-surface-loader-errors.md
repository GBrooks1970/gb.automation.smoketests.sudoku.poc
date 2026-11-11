---
version: 1
created: 2026-11-11T00:12:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-100 / TRIAGE-30
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-100 / TRIAGE-30 Surface loader errors from the TypeScript and Python LoadPuzzles abilities

**Goal.** Update `LoadPuzzles` in DEMOAPP001 (`demo-apps/demoapp001-typescript-cypress/tests/screenplay/abilities/LoadPuzzles.ts`) and DEMOAPP002 (`demo-apps/demoapp002-python-pytest/tests/screenplay/abilities/load_puzzles.py`) so that all five query getters (`getAll`/`getByName`/`getByIndex`/`getByDifficulty`/`getCount` and their Python equivalents `get_all`/`get_by_name`/`get_by_index`/`get_by_difficulty`/`get_count`) rethrow/reraise the captured loader error instead of returning empty results (`undefined`/`None`, `[]`, `0`), while `getError()`/`get_error()` continue returning the captured error without throwing — matching DEMOAPP003's `LoadPuzzles.cs` (BACKLOG-086 / TRIAGE-18).

Source: Root worklist item **TRIAGE-30** (follow-on from TRIAGE-18 Decision 6, LOW priority, owner-approved on 2026-11-08), tracked in `DOCS/.planning/backlog.md` as **BACKLOG-100**.

---

## Evidence gathered before planning

Audited on 2026-11-11 on branch `worklist/triage-30-surface-loader-errors` cut from `main` @ `e3cbe5d` (and locally executed component baselines on Node `v24.18.0` and Python `3.13.1`):

### 1. Current `LoadPuzzles` Ability Behaviour
- **DEMOAPP001 (`tests/screenplay/abilities/LoadPuzzles.ts`):**
  - Lines 19–26: The constructor catches any exception thrown by `new PuzzleLoader(path.resolve(filePath))` into `this.lastError`.
  - Lines 28–46: Every getter uses optional chaining with empty defaults:
    - `getByName(name)` → `this.loader?.getPuzzleByName(name)` (`undefined`)
    - `getByIndex(index)` → `this.loader?.getPuzzleByIndex(index)` (`undefined`)
    - `getByDifficulty(difficulty)` → `this.loader?.getPuzzlesByDifficulty(difficulty) ?? []`
    - `getAll()` → `this.loader?.getAllPuzzles() ?? []`
    - `getCount()` → `this.loader?.getPuzzleCount() ?? 0`
  - Lines 47–49: `getError()` returns `this.lastError`.
- **DEMOAPP002 (`tests/screenplay/abilities/load_puzzles.py`):**
  - Lines 11–17: `__init__` catches any `Exception` thrown by `PuzzleLoader(file_path)` into `self._last_error`.
  - Lines 19–32: Every getter returns an empty value if `self._loader` is `None`:
    - `get_by_name(name)` → `None`
    - `get_by_index(index)` → `None`
    - `get_by_difficulty(difficulty)` → `[]`
    - `get_all()` → `[]`
    - `get_count()` → `0`
  - Lines 34–35: `get_error()` returns `self._last_error`.
- **DEMOAPP003 Reference (`demoapp003/tests/screenplay/abilities/LoadPuzzles.cs`):**
  - Uses a private `Loader()` guard that invokes `ExceptionDispatchInfo.Capture(_error).Throw()` whenever `_error` is non-null, and every getter (`GetAll`, `GetByName`, `GetByDifficulty`, `GetByIndex`, `GetCount`) calls `Loader()`, while `GetError()` returns `_error` directly.

### 2. Call-Site Impact & BDD Parity Audit
- Checked every reference to `LoadPuzzles` in `demoapp001/tests/` and `demoapp002/tests/`:
  - Normal scenarios construct `LoadPuzzles` with the anchored `puzzles.json` path; construction succeeds cleanly and `lastError` / `_last_error` is null/None.
  - Negative loader scenarios (`Validate puzzle grid dimensions on load`, `Validate puzzle grid values on load`, `Reject JSON boolean puzzle cell values on load`, `Handle missing puzzle file gracefully`) inspect `getError()` / `get_error()` directly or via `SimulateError` (`puzzleLoader.steps.ts` lines 64, 108; `SimulateError.ts` line 30; `test_basic_sudoku_solver_logic.py` lines 592, 633; `tests/screenplay/tasks/__init__.py` line 554). None of those scenarios call the 5 query getters on a failed loader.
  - Therefore, rethrowing in the 5 getters preserves all 55 scenarios / 309 steps per Stack while ensuring any Screenplay Task or Question querying a broken `LoadPuzzles` ability surfaces `"Puzzle file not found"` (or the real parse/validation error) instead of misleading empty results.

### 3. Baseline Component Suites & Currency Inventory Impact
- Measured locally before changes:
  - DEMOAPP001 `npm run test:component` (Node v24.18.0): `tests 113, pass 113, fail 0`.
  - DEMOAPP002 `.venv/Scripts/python.exe -m pytest tests/component` (Python 3.13.1): `30 passed in 0.61s`.
- Governance impact: `DOCS/.analysis/2026-10-07-component-execution-inventory.json` records exact counts and LF-normalised SHA256 fingerprints for `demoapp001-component` (`tests/component/*.test.ts`) and `demoapp002-component` (`tests/component/*.py`). Adding component contract tests in `tests/component/` requires re-measuring those two inventory records (at the code commit SHA) and aligning active count claims across:
  - `README.md` (lines 233–234)
  - `CLAUDE.md` (lines 130, 147)
  - `demo-apps/demoapp001-typescript-cypress/README.md` (line 379)
  - `demo-apps/demoapp001-typescript-cypress/docs/README.md` (line 42)
  - `demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md` (line 71)
  - `demo-apps/demoapp002-python-pytest/README.md` (line 47)
  - `demo-apps/demoapp002-python-pytest/tooling/verify.py` (line 4 docstring)
  - `.batch/test-documentation-currency.ps1` (mutation anchor strings referencing `113` in lines 118, 124, 129, 130, 132)

---

## Proposed Changes

### 1. Focused Must-Fail Component Controls (Red Before Fix)
Create focused ability contract test suites in each Stack:
- **DEMOAPP001:** `demo-apps/demoapp001-typescript-cypress/tests/component/load-puzzles-ability.contract.test.ts`
  - Test 1 (`surfaces missing-file error across every getter while preserving getError`): builds `LoadPuzzles.from(missingPath)`, verifies `loader.getError()?.message` matches `/Puzzle file not found/` without throwing, and asserts each of `getAll()`, `getByName('Easy Scan Grid')`, `getByIndex(0)`, `getByDifficulty('easy')`, and `getCount()` throws `/Puzzle file not found/`.
  - Test 2 (`delegates every getter cleanly and returns null getError when load succeeds`): verifies valid `puzzles.json` load returns `getError() === null`, `getCount() > 0`, non-empty `getAll()`, `getByName(...)`, `getByIndex(0)`, and `getByDifficulty('easy')`.
- **DEMOAPP002:** `demo-apps/demoapp002-python-pytest/tests/component/test_load_puzzles_ability.py`
  - Test 1 (`test_missing_file_surfaces_loader_error_from_every_getter_while_preserving_get_error`): builds `LoadPuzzles.from_path(missing_path)`, verifies `isinstance(loader.get_error(), FileNotFoundError)` with `"Puzzle file not found"`, and asserts each of `get_all()`, `get_by_name("Easy Scan Grid")`, `get_by_index(0)`, `get_by_difficulty("easy")`, and `get_count()` raises `FileNotFoundError` matching `"Puzzle file not found"`.
  - Test 2 (`test_valid_puzzle_file_delegates_getters_and_clears_error`): verifies valid `puzzles.json` load returns `get_error() is None`, `get_count() > 0`, non-empty `get_all()`, `get_by_name(...)`, `get_by_index(0)`, and `get_by_difficulty("easy")`.
- Run both suites **before** editing `LoadPuzzles.ts` / `load_puzzles.py` to capture the empirical must-fail red baseline (missing-file getter assertions fail because `[]`/`undefined`/`None`/`0` are returned instead of raising).

### 2. Surface Errors in `LoadPuzzles` Abilities (Green After Fix)
- **DEMOAPP001 (`demo-apps/demoapp001-typescript-cypress/tests/screenplay/abilities/LoadPuzzles.ts`):**
  - Normalize captured catch value: `this.lastError = e instanceof Error ? e : new Error(String(e));`
  - Add `private requireLoader(): PuzzleLoader` which throws `this.lastError` if non-null (and asserts non-null `this.loader`).
  - Delegate all five getters (`getByName`, `getByIndex`, `getByDifficulty`, `getAll`, `getCount`) through `this.requireLoader()`.
  - Keep `getError(): Error | null` returning `this.lastError` without throwing.
- **DEMOAPP002 (`demo-apps/demoapp002-python-pytest/tests/screenplay/abilities/load_puzzles.py`):**
  - Add `def _require_loader(self) -> PuzzleLoader:` which raises `self._last_error` if not `None` (and verifies `self._loader is not None`).
  - Delegate all five getters (`get_by_name`, `get_by_index`, `get_by_difficulty`, `get_all`, `get_count`) through `self._require_loader()`.
  - Keep `get_error(self) -> Exception | None:` returning `self._last_error` without raising.

### 3. Re-measure Execution Inventory & Update Currency Claims
- Commit code + tests first so the inventory `sourceSha` references a real commit.
- Re-run `demoapp001-component` and `demoapp002-component` governed commands to capture updated test counts (`115` and `32` respectively), duration metrics, output SHA256 hashes, and updated SHA256 fingerprints in `DOCS/.analysis/2026-10-07-component-execution-inventory.json`.
- Update active count claims in `README.md`, `CLAUDE.md`, `demoapp001/README.md`, `demoapp001/docs/README.md`, `demoapp001/docs/qa-strategy.md`, `demoapp002/README.md`, `demoapp002/tooling/verify.py`, and `.batch/test-documentation-currency.ps1`.
- Add changelog entry under `[Unreleased] > Fixed` in `CHANGELOG.md`.

---

## Key Decisions for Owner Review

### Decision 1: Placement of the Focused Missing-Path Ability Checks
- **Recommendation:** Place the focused checks as dedicated contract test files inside `tests/component/` (`tests/component/load-puzzles-ability.contract.test.ts` and `tests/component/test_load_puzzles_ability.py`), covering all five getters + `getError()`/`get_error()` + happy-path delegation, and re-measure the `demoapp001-component` and `demoapp002-component` inventory records (matching the TRIAGE-18 precedent).
- **Alternative:** Run a standalone one-off script outside `tests/component/` to avoid touching execution inventory counts. *Rejected:* One-off checks do not remain wired into CI (`npm test`, `npm run verify`, `python -m pytest`, `python -m tooling.verify`), leaving future regressions unguarded.

### Decision 2: Direct Rethrow vs Wrapped Error
- **Recommendation:** Rethrow/reraise the exact captured error directly (`throw this.lastError;` / `raise self._last_error`) via a single private guard helper (`requireLoader` / `_require_loader`), matching DEMOAPP003's `LoadPuzzles.cs`.
- **Alternative:** Wrap in a custom `AbilityLoadError`. *Rejected:* Changes exception type (`FileNotFoundError` / `SyntaxError` / `Error`) and contradicts acceptance ("raises the real 'Puzzle file not found' error").

### Decision 3: No Decision Record Required
- **Recommendation:** Confirm no Decision Record is required (tracked as `None expected` in `DOCS/.planning/backlog.md`). Aligns TypeScript and Python `LoadPuzzles` abilities with C# `LoadPuzzles.cs` without altering DR-035's validation boundary or Screenplay memory keys.

### Decision 4: Two-Stage Delivery and Verification Protocol
- **Recommendation:** Execute in two standard stages:
  1. Implementation PR (`worklist/triage-30-surface-loader-errors`): Mark BACKLOG-100 `In Progress`, capture must-fail red baseline on unchanged abilities, apply `LoadPuzzles.ts` and `load_puzzles.py` changes, verify Stack builds/linters/formatters/API/OpenAPI/component/BDD/coverage gates, re-measure execution inventory and update currency claims, pass all 8 parity gates and 37 currency controls, merge on all-green CI.
  2. Outcome PR (`worklist/triage-30-outcome`): Mark BACKLOG-100 `Resolved` (1 Open / 0 In Progress / 123 Resolved / 124 Total), mark plan `delivered`, author implementation log, merge on all-green CI, and tick `- [x] TRIAGE-30` in root worklist.

---

## Test & Verification Plan

1. **Must-fail baseline (pre-fix):** Run `node --test -r ts-node/register tests/component/load-puzzles-ability.contract.test.ts` and `.\.venv\Scripts\python.exe -m pytest tests/component/test_load_puzzles_ability.py` against unmodified `LoadPuzzles.ts` / `load_puzzles.py`; confirm missing-file getter tests fail.
2. **DEMOAPP001 gates:** `npm run build`, `npm run lint`, `npm run format:check`, `npm run test:api`, `npm run verify:openapi`, `npm run test:coverage` (including component count 115), `npm test` (115 component + 55 scenarios / 309 steps).
3. **DEMOAPP002 gates:** `.venv\Scripts\python.exe -m pytest tests/component` (32 passed), `.venv\Scripts\python.exe -m pytest` (32 component + 55 pytest-bdd scenarios = 87 passed); CI runs full `coverage` 85% floor and `pip-audit`.
4. **Repository parity & currency gates:** `.batch/check-ra-header-currency.ps1`, `.batch/test-documentation-currency.ps1` (37/37), `.batch/run-parity-checks.ps1` (all 8 parity gates: RA currency, doc currency, audit policy, CI evidence, memory keys, feature parity, step text parity, puzzles parity).
5. **CI Verification:** All 5 required CI jobs (`DEMOAPP001 TypeScript Cypress`, `DEMOAPP002 Python Pytest`, `DEMOAPP003 C# Reqnroll`, `Parity gate and evidence page`, `Gate (all stacks green)`) pass completely green.
