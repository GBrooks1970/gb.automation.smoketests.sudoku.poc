# Implementation Log: BACKLOG-089 / TRIAGE-20 Real Then observations, no-op disposal and tautology replacement

**Date:** 2026-11-09T16:45:00Z
**Session goal:** Give empty Then steps real observations, dispose of no-op and tautological bindings across all three Stacks (DEMOAPP001 TS, DEMOAPP002 Python, DEMOAPP003 C#), align missing-file loading, and add 3 new mutation controls.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-20 (Claude review v2 Risk 3 recommendations 1-2, MEDIUM priority), recorded in project backlog as BACKLOG-089. Under the owner-approved implementation plan, eliminate empty/no-op/tautological step definition bindings across all three Stacks:
- `"no errors should occur"`: assert `LAST_ERROR` is null in Actor Memory.
- `"the main loop should exit"`: assert orchestration loop exit using DR-037 attempt events (`lastAttemptIterations == 1`, all attempts `changed == false`, result `STUCK_ON_ADVANCED_LOGIC`).
- `"the move should be validated against row, column, and block constraints"`: assert `PlacementValidity` is `'VALID'` or `'INVALID'`.
- `"no digits violate row, column, or block rules"`: assert `GridCell.isValidSolution()`.
- Dispose Python `pass` steps (~381, 599, 609, 816).
- Replace tautological `count >= 0` assertion with deterministic check `count == 1`.
- Align missing puzzle file scenario across Stacks to assert loader error capture before simulating missing file error.
- Add 3 new planted Then mutations to `.batch/test-then-assertion-mutations.ps1` (total 25 mutations per Stack), confirming all are killed.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Standardize on `LAST_ERROR` null check for `"no errors should occur"` | Aligns with existing Screenplay memory pattern across all three Stacks; safe `try/catch` in TS Serenity `ErrorThrown` query returns `null` instead of throwing `LogicError` when no note exists | No |
| DR-037 attempt events for `"the main loop should exit"` | Proves the solver loop executed and terminated without progress when given a stuck grid snapshot | No |
| Multi-constraint validity verification for `"the move should be validated against row, column, and block constraints"` | Proves `isValidPlacement` ran and evaluated row, column, and block constraints without modifying the canonical feature | No |
| Replace `count >= 0` with `count == 1` | "Easy Scan Grid" is the sole easy puzzle in `puzzles.json`; `count == 1` deterministically checks the collection | No |
| Retain candidate-qualified Givens for TRIAGE-15 | Hand-off candidate inspection to TRIAGE-15 (BACKLOG-090) under formal Decision Record | No |
| Expand mutation harness to 25 mutations | Added 3 new planted mutation controls in `.batch/test-then-assertion-mutations.ps1` (`puzzles-array-count`, `main-loop-progress`, `no-errors-planted`) | No |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-plans/2026-11-09-triage-20-real-then-observations.md` | Approved implementation plan, with Outcome |
| `DOCS/.implementation-logs/2026-11-09_triage-20-real-then-observations.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `.batch/test-then-assertion-mutations.ps1` | Added 3 new mutation controls (total 25); made Windows junction linkType robust across PowerShell 5.1 and pwsh |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/questions/ErrorThrown.ts` | Handled unset Serenity note safely by returning `null` |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/constraintValidation.steps.ts` | Asserted `PlacementValidity.ofLastAttempt()` is `'VALID'` or `'INVALID'` |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/edgeCases.steps.ts` | Implemented real loop exit and solver creation error assertions |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/integration.steps.ts` | Asserted `ErrorThrown.last()` is `null` |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts` | Asserted `GridCell.isValidSolution()` |
| `demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/puzzleLoader.steps.ts` | Aligned loader error assertions and replaced `count >= 0` with `assert.strictEqual(count, 1)` |
| `demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py` | Disposed `pass` steps and implemented real observations across all 8 target step definitions |
| `demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs` | Replaced empty step methods with real observations and replaced `Count() >= 0` with `EqualTo(1)` |
| `DOCS/.planning/backlog.md` | BACKLOG-089 marked Resolved (counts: 12 Open / 0 In Progress / 112 Resolved / 124 Total) |
| `DOCS/.implementation-plans/_index.md` | Recorded BACKLOG-089 delivery |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

---

## 4. Bugs and Errors Encountered

### Serenity/JS `Notepad.get()` throws on missing note
- **Symptom:** In scenarios where no error was recorded, `actor.answer(ErrorThrown.last())` threw `LogicError: Note of 'LAST_ERROR' cannot be retrieved because it's never been recorded`.
- **Root cause:** Serenity/JS `Notepad.get(key)` enforces note presence.
- **Fix:** In `ErrorThrown.ts`, wrapped `actor.answer(notes<SudokuNotes>().get(LAST_ERROR))` in `try/catch` to return `null` on missing note, matching the question's return contract.

### Python `result` property vs method
- **Symptom:** `TypeError: 'str' object is not callable` at `ability.result()`.
- **Root cause:** In Python's `UseSudokuSolver`, `result` is decorated with `@property`.
- **Fix:** Accessed as `ability.result == "STUCK_ON_ADVANCED_LOGIC"`.

### PowerShell 5.1 `$IsWindows` undefined
- **Symptom:** When running `.batch/test-then-assertion-mutations.ps1` under Windows PowerShell 5.1, `NewItemSymbolicLinkElevationRequired` occurred.
- **Root cause:** `$IsWindows` is only defined in PowerShell Core (`pwsh`).
- **Fix:** Checked `$PSVersionTable.PSEdition -eq 'Desktop' -or $env:OS -like '*Windows*' -or $IsWindows` to ensure junction linking on Windows regardless of PowerShell host.

---

## 5. Lessons Learned

- Screenplay memory questions should safely return default/null when an optional memory slot has not been recorded, avoiding unnecessary exceptions in positive Then assertions.
- Cross-platform PowerShell automation scripts running on Windows should guard against version differences between Windows PowerShell 5.1 and modern PowerShell 7+ (`pwsh`).
