# Architecture Assessment

[<- Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

---

## Test Pyramid

- **Alignment.** Each Stack has a fast component layer (113 / 30 / 28 tests), a BDD acceptance layer (55 scenarios each), and in DEMOAPP001 an HTTP layer (API integration plus 8 OpenAPI contract tests). The component layer outnumbers BDD only in DEMOAPP001. In Python and C# the BDD layer is the larger one (55 against 30 / 28), so those two Stacks have more of an hourglass shape.
- **Alignment.** "BDD" here runs in process (`@util`), so the acceptance layer is cheap. The entire local DEMOAPP001 BDD run took about 4 s and pytest about 0.6 s. That makes the inverted ratio in Python and C# a cost-neutral choice, not a smell.
- **Gap.** The web UI (tutor and visualiser) is covered by controller and module contract tests plus static drift and self-containment checks (`check:pages`, `check:web`). The backlog records that native browser interaction is not exercised (TRIAGE-07 row). That is appropriate for the stated scope, but there is no browser-level smoke test.

## SOLID Principles

- **SRP: aligned.** Loader, solver, orchestrator, audit, CLI and HTTP layers are separate units in every Stack. The API service and the tutor service are separate classes.
- **OCP: partial.** Adding a technique requires editing `SudokuSolver` and the orchestrator's fixed sequence ([SudokuOrchestrator.ts](demo-apps/demoapp001-typescript-cypress/app_src/SudokuOrchestrator.ts) line 59 onward). A technique registry or strategy list would be the textbook OCP form. The current explicit sequence is easier for the target audience to read, so this is a deliberate KISS trade-off, not a defect.
- **LSP: N/A.** There are no inheritance hierarchies of note apart from `UseSudokuSolver extends Ability` (a framework requirement, DR-008).
- **ISP: mostly aligned.** `IOutput`, `IAbility`, `ITask` and `IQuestion` are narrow. `UseSudokuSolver` in TypeScript has grown into a broad state holder (target cell, snapshots, validation result, multiple solvers, audit, attempt events), and it would split naturally into two or three Abilities.
- **DIP: partial.** `createApp(service, tracker, tutorService)` injects its collaborators, which is good. `SudokuApiService` and `SolveStepTracker` default to `new PuzzleLoader('../puzzles.json')` in their constructors. Defaults are acceptable, but they hard-wire the file location.

## KISS (Keep It Simple, Stupid)

- **Aligned.** The solver code is plain loops over a 9x9 array, with no frameworks in the core and pedagogical doc comments on each technique.
- **Aligned.** Each Stack has one runner and one feature file, with no tag matrix.
- **Gap.** The governance layer is the opposite of simple: 16 scripts, a 2,717-line decision register, and dated "Update" paragraphs stacked at the top of the backlog. It is justified by the parity goal, but the backlog's summary area now needs a reader to parse seven dated paragraphs to learn the current state, and it still missed the expiry.

## YAGNI (You Aren't Gonna Need It)

- **Aligned.** API and web are staged in DEMOAPP001 only, with Python and C# deliberately not built yet (DR-034).
- **Watch item.** The puzzle generator (uniqueness oracle, difficulty grader, PRNG, clue removal) and the tutor are substantial DEMOAPP001-only features beyond the core teaching goal. They are well tested, but they enlarge the dependency and audit surface that now blocks CI.
- **Aligned.** No speculative abstraction layers (no DI container, no plugin system).

## REST + OpenAPI

- **Aligned.** The OpenAPI 3.0 document is the authority (DR-035), lint-clean, with real-response contract tests. The routes are nouns plus actions (`/api/techniques/{name}`, `/api/puzzles/{name}`, `/api/visualise/{name}`). A consistent error envelope carries a `requestId`.
- **Gap.** The double decode turns a client error into a 500 on one route (Risk 4), and the contract's per-path `500` entries accept that silently.
- **Gap.** Technique execution is modelled as `POST /api/techniques/...` returning a computed result with no state change. That is RPC-over-HTTP, defensible for a calculator-style API, but a teaching repo could note why POST was chosen (a request body carries the grid) over `GET` with a query.
- **Known drift.** Generator schema drift against runtime is TRIAGE-10 (root worklist, not the backlog).

## ISTQB Strategies

- **Equivalence partitioning and boundary values.** These are present in the component layers (for example `test_puzzle_loader_boundaries.py`, `PuzzleLoaderContractTests.cs`, and JSON boolean-cell rejection from BACKLOG-062) and in canonical edge cases (empty grid, completed grid, missing file).
- **State transition testing.** The orchestration tests assert attempt-event sequences (DR-037) and solver statuses (`SOLVED`, `STUCK_ON_ADVANCED_LOGIC`), with real transitions from an empty to a filled cell verified by the BACKLOG-078 assertions.
- **Use case testing.** End-to-end "Solve an easy puzzle" scenarios per named puzzle.
- **Test-design quality gap.** Assertion strength is uneven (Risk 3). An ISTQB-minded reviewer would classify the empty Then steps as tests with no expected result, which by definition are not tests. The mutation controls are an excellent oracle-strength technique, and they should be extended to cover these bindings.
- **Not applied, but would add value.** A decision table for `isValidPlacement`, or property-based testing over the solver invariant "no technique introduces a violation".

## Pedagogical Comments

- **Aligned.** Each technique method carries a Goal/Technique doc comment ([SudokuSolver.ts](demo-apps/demoapp001-typescript-cypress/app_src/SudokuSolver.ts) lines 238-244, 355-364). Ability and Cast files explain design intent and DR references ([SudokuActors.ts](demo-apps/demoapp001-typescript-cypress/tests/screenplay/actors/SudokuActors.ts) lines 9-18).
- **Gap.** Comments inside empty step bodies ("Already configured by setupXWingRow", "Verifies the scenario completed without exceptions") explain why the step is empty but present that as acceptable. A pedagogical repo should instead flag them as known weak spots or remove them.
- **Gap.** The transient-elimination simplification (Risk 12) is not explained anywhere, although it is the most important "why does this puzzle get stuck" fact for a learner.

---

[<- Previous: Recommendations](05_RECOMMENDATIONS.md) | [Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Migration Plans ->](07_MIGRATION_PLANS.md)
