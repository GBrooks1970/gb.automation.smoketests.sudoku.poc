# Annex - Screenplay and Cross-Stack Parity

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Validation Log](VALIDATION_LOG.md) | [Back to Index ->](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

Detailed evidence for the three-stack Screenplay and parity claims made in
[04_CROSS_PROJECT_ANALYSIS.md](../04_CROSS_PROJECT_ANALYSIS.md).

---

## Memory key parity (RA Section 8.1)

`check-memory-key-parity.ps1` enforces two rules: each constant's name equals its string value,
and the key set is identical across stacks. Result: PASS. All six keys present and OK in all three
stacks:

```text
SOLVE_RESULT, ALGORITHM_PROGRESS, LAST_ERROR, TARGET_CELL, GRID_SNAPSHOT, VALIDATION_RESULT
```

Source files:
- DEMOAPP001 `tests/screenplay/support/memory-keys.ts`
- DEMOAPP002 `tests/screenplay/support/memory_keys.py`
- DEMOAPP003 `tests/screenplay/support/MemoryKeys.cs`

## Step-text parity (RA Section 8.4 criterion 3)

`check-step-text-parity.ps1` tokenises each feature file (ignoring tags and non-step structure)
and compares step lines positionally against the canonical feature, reporting drift with line
numbers. Result: PASS - 177 step lines match for each of the three stacks.

## Feature presence parity

`generate-feature-parity-report.ps1` checks scenario presence between canonical and stack copies.
Result: "Overall result: PASS". Combined with the tag-stripped byte-diff (all three identical),
there is no feature drift on either axis (presence or step text).

## Orchestrator equivalence (manual cross-read)

The three orchestrators are line-for-line behavioural equivalents, including the SUD-01
already-solved-grid early exit:

- TS [SudokuOrchestrator.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts)
  (lines 38-78): `if (this.isGridFull()) return 'SOLVED';` then the unit-completion ->
  hidden-singles(1..9) -> naked-singles loop until no progress.
- Python [sudoku_orchestrator.py](../../../demo-apps/demoapp002-python-pytest/app_src/sudoku_orchestrator.py)
  (lines 16-42): identical guard and loop.
- C# [SudokuOrchestrator.cs](../../../demo-apps/demoapp003-csharp-specflow/app_src/SudokuOrchestrator.cs)
  (lines 18-56): identical guard and loop.

The technique application order (Unit Completion, then Hidden Singles for digits 1-9, then Naked
Singles) is the same in all three and is itself asserted by the "Execute solving techniques in
correct order" canonical scenario.

## Screenplay layering

- Step definitions delegate through the actor (`actor.attemptsTo(...)` / `actor.answer(...)`)
  rather than calling Abilities directly (MIG-05, DR-015); the slimmed Ability interface is the
  result of BACKLOG-023.
- Abilities, Tasks, and Questions are separated into their own directories in each stack
  (`tests/screenplay/{abilities,tasks,questions,support}`).
- Two earlier cross-stack "anti-pattern" findings (BACKLOG-032 Python Questions reading Actor
  memory; BACKLOG-033 side effects in `isolation_verified()`) were confirmed **false positives**
  because the TypeScript reference implementation exhibits the identical, intentional pattern
  (`GridCell.ts`, `MultipleSolvers.ts`). This is recorded in the backlog and is good evidence of
  disciplined parity reasoning rather than reflexive "fix on sight".

## Validation-boundary parity

Per [validation-boundaries.md](../../.architecture/validation-boundaries.md): loaders perform
structure validation (mandatory, fail-fast); solvers expose a constraint *query* but do not gate
solving on it; the REST API re-validates structure on every grid endpoint and offers constraint
validation only via `POST /api/validate`. The one mechanism difference (C# integer enforcement via
typed deserialization vs explicit per-cell checks in TS/Python) is documented in the DEMOAPP003
README and in section 2.1 of the boundaries doc - a mechanism, not a behaviour, difference
(SUD-06).

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Validation Log](VALIDATION_LOG.md) | [Back to Index ->](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md)
