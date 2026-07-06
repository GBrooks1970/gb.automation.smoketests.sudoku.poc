# Sudoku Solver POC - Project Review

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z

Single-repository review: this file covers the whole repo (three stacks +
shared assets). Per the template's single-repository customisation, no
additional project files are invented.

## Architecture and Design (3-5 bullets)

- The layering is textbook and consistently applied: canonical Gherkin
  (`features-shared/`) -> thin step definitions -> Screenplay Tasks/Questions ->
  Abilities -> subject application (`app_src/`), in all three languages. Step
  glue delegates through `actor.attemptsTo()` / `actor.answer()`
  ([orchestration.steps.ts](../../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts))
  with the actor persona centralised (`SOLVER_ACTOR`, BACKLOG-030).
- The subject application separates Solver (technique primitives), Orchestrator
  (loop + audit lifecycle), PuzzleLoader (structure validation only, DR-035),
  and output/CLI/API adapters. The
  [SudokuOrchestrator.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts)
  early-exit guard (lines 42-44, SUD-01) is present and identically phrased in
  [sudoku_orchestrator.py](../../../../demo-apps/demoapp002-python-pytest/app_src/sudoku_orchestrator.py)
  (lines 20-21) - deliberate cross-stack traceability.
- Deep-copy semantics are handled correctly at both ends: constructor copies
  `origGrid` -> working grid, and the v1.0 `getGrid` snapshot operation returns
  deep copies in all three stacks (`getGrid`/`get_grid`/`GetGrid`, SUD-03),
  with public-member mutation explicitly documented as deprecated
  ([SudokuSolver.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts)
  (lines 23-34)).
- The C# Screenplay support layer hand-rolls the pattern honestly
  (`IAbility`/`ITask`/`IQuestion<T>`, `DelegateTask`/`DelegateQuestion`) rather
  than pretending SpecFlow provides it - good pedagogy for readers comparing
  what a framework gives you (Serenity/JS) versus what you build (C#/Python).
- Design-first is real here: the platform specification v1.1 (DR-034),
  validation-boundaries doc (DR-035), and OpenAPI contract
  ([openapi.yaml](../../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml))
  predate or accompany the code they govern.

## Code Quality (3-5 bullets)

- Solver code is clean, small, and idiomatic per language; pedagogical comments
  explain *why* (e.g. the Hidden vs Naked Singles naming rationale in
  [SudokuSolver.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts)
  (lines 108-120)) without drowning the code.
- Constants are centralised (`GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`) in all
  three stacks; no magic numbers observed in technique code.
- Build hygiene verified live: `npm run build` (tsc), `npm run lint` (eslint
  flat config), and `npm run test:api` all pass; Python is warning-clean but
  for one upstream deprecation; `dotnet test` builds warning-free.
- Minor: `findMissingDigit` throws a generic `Error` on invalid state
  ([SudokuSolver.ts](../../../../demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts)
  (line 368)) where the server layer has typed errors
  (`app_src/server/errors.ts`) - acceptable at the `@util` surface, worth
  aligning if error taxonomy ever matters to scenarios.

## Test Coverage (3-5 bullets)

- 46 canonical scenarios per stack, 138 total, all passing locally during this
  review (DEMOAPP001 46/257 steps in ~7s; DEMOAPP002 46 in 1.4s; DEMOAPP003
  46/46 in ~1s). Coverage spans techniques, constraint validation,
  orchestration, loader, deep-copy semantics, integration puzzles, edge cases,
  and the audit trail - a genuinely balanced spread for the surface.
- The feature file is business-readable, well-sectioned, and uses Scenario
  Outlines where data-driven (constraint validation table of 8 cases -
  boundary/equivalence thinking visible,
  [BasicSudokuSolverLogic.feature](../../../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature)
  (lines 112-128)).
- API coverage exists (`npm run test:api`, exercised in CI) plus an OpenAPI
  contract; UI visualisation is served but has no automated UI test - accepted
  staging per the capability matrix (platform spec section 6.1), not silent debt.
- Weak spots are the vacuous ordering/no-execution assertions (Risk 7) - the
  only place where scenario text overstates what the glue checks.
- No `@pending` or quarantined scenarios exist in the canonical store or any
  stack copy - deferred coverage lives in the backlog (BACKLOG-014/015/016)
  rather than as skipped tests. That is the right way round.

## Documentation (3-5 bullets)

- The DOCS system is unusually complete: reference architecture (v1.15),
  platform spec (v1.1), algorithm specs, how-tos, templates, implementation
  logs, analysis reports, and eight prior review streams - all reconciled into
  the backlog. `CLAUDE.md` is accurate against the tree (verified during
  mapping).
- The backlog is the genuine source of truth and its claims verified true
  (suite counts, parity status, resolved streams). Counts (3 Open / 66
  Resolved / 69 total) are internally consistent with the item tables.
- Drift exists at the edges: CHANGELOG a stream behind and contradicting
  BACKLOG-010's state (Risk 5), decision-register header on RA v1.14 (Risk 6),
  README tree stale (Risk 8), licence claim unbacked (Risk 4).
- The README's emoji/box-drawing formatting is a *governed* exception
  (SUD-12, naming-conventions section 5.1), so it is compliance, not drift -
  a nice example of documenting an exception instead of leaving a contradiction.

## Strengths

- Full three-stack execution evidence, reproduced locally; parity enforced by
  three automated gates plus a CI fan-in `gate` job.
- Governance loop (review -> worklist -> backlog reconciliation -> DR) has now
  run twice end-to-end and shows in the artefacts.
- High pedagogical value: same pattern in three ecosystems, framework-provided
  vs hand-built Screenplay contrast, spec-first with traceable IDs.

## Weaknesses

- Dependency lifecycle blind spot: SpecFlow EOL and Node 20 EOL both
  unrecorded (Risks 1, 3); one fixable high `npm audit` advisory (Risk 2).
- Peripheral document currency keeps regressing (CHANGELOG, register header,
  README tree, licence) even though the core docs are excellent.
- A handful of Then-steps assert weaker than their Gherkin text (Risk 7).

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
