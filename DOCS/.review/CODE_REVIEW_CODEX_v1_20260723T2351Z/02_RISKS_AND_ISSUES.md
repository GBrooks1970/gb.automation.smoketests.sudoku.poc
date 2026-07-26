[Review index](00_CODE_REVIEW_CODEX_v1_20260723T2351Z.md) > Risks and Issues

# Risks and Issues

Findings are ordered by user impact and confidence. Review action identifiers are local to this immutable review; they are not authoritative backlog IDs.

## R1 - Orchestration Specifications Can Give False Confidence (High)

**Risk description:** The canonical feature says that techniques are attempted in the correct order, that solving spans multiple iterations with progress, and that `Logic Squeeze Grid` requires all three techniques. The bindings do not consistently observe those behaviours. Most reduce the claim to a final `SOLVED` status, while the available audit records successful changes rather than attempted calls.

**Evidence:**

- [BasicSudokuSolverLogic.feature lines 134-147 and 242-247](../../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature) names ordering, iteration progress, and all-three-technique requirements.
- [TypeScript orchestration.steps.ts lines 103-123](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts) conditionally checks Unit Completion only if such an audit event exists. Its comments acknowledge that audit records changes, not attempts.
- [TypeScript orchestration.steps.ts lines 175-205](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/orchestration.steps.ts) ranks logged changes, then binds iteration/progress wording to a solved-state check.
- [TypeScript integration.steps.ts lines 54-56](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/integration.steps.ts), [Python test_basic_sudoku_solver_logic.py lines 364-368 and 682-684](../../../demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py), and [C# BasicSudokuSolverLogicSteps.cs lines 308-312 and 602-604](../../../demo-apps/demoapp003-csharp-specflow/tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs) accept the named behaviours by checking only the final result.
- [puzzles.json lines 20-22](../../../demo-apps/demoapp002-python-pytest/puzzles.json) describes `Logic Squeeze Grid` as requiring all three techniques.
- A review probe recorded only `HiddenSingles` and `NakedSingles` events for that puzzle. Replacing Python `unit_completion` with a no-op still produced `SOLVED` in two iterations.
- The authoritative [backlog](../../../DOCS/.planning/backlog.md) marks BACKLOG-051 resolved on the basis that status inference was replaced by real event assertions. The current observation model still cannot prove attempts.

**Impact:** A deletion, omission, or reordering of an algorithm call can remain green. The suite therefore overstates the evidence for its central orchestration design and weakens the portfolio's value as a demonstration of executable specification.

**Recommendation:**

1. Instrument algorithm attempts at the orchestrator boundary in all stacks, independently of whether a technique changes a cell.
2. Assert the exact order for each iteration: Unit Completion, Hidden Single rows 1-9, Hidden Single columns 1-9, Hidden Single boxes 1-9, then Naked Single.
3. Assert iteration count greater than one and at least one change in every non-terminal iteration.
4. Either replace `Logic Squeeze Grid` with a puzzle proven to receive changes from all three techniques, or narrow the feature wording to the behaviour that the current fixture actually demonstrates.
5. Make the canonical feature change first and preserve step-text parity across all bindings.

## R2 - Python Accepts Boolean Puzzle Cells (Medium)

**Risk description:** Python uses `isinstance(cell, int)` for cell validation. In Python, `bool` is a subclass of `int`, so JSON `true` and `false` are accepted as valid cell values. The contract requires integer values from 0 to 9, and the other stacks reject booleans.

**Evidence:**

- [Python puzzle_loader.py line 67](../../../demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py) accepts `bool` through the integer type check.
- [TypeScript PuzzleLoader.ts lines 61-65](../../../demo-apps/demoapp001-typescript-cypress/app_src/PuzzleLoader.ts) uses `Number.isInteger`, while C# deserialises into `int[][]`; neither accepts a JSON boolean as an integer cell.
- [validation-boundaries.md lines 21-24 and 44-60](../../../DOCS/.architecture/validation-boundaries.md) requires integer cells from 0 to 9 and describes identical cross-stack enforcement.
- A temporary-file probe using an otherwise valid 9x9 puzzle with one `true` cell returned `ACCEPTED_BOOLEAN_CELL`.

**Impact:** The same canonical input has different validity depending on implementation language. A boolean is also silently treated numerically during solving, concealing malformed external data.

**Recommendation:** Change the Python guard to an exact integer check, for example `type(cell) is int`, and add a canonical loader scenario for a boolean cell. Implement matching step bindings in all stacks so the boundary remains executable and parity-protected.

## R3 - Live Documentation Is Materially Stale or Conflicting (Medium)

**Risk description:** Several documents describe an earlier project state without marking it historical. The conflicts affect repository visibility, framework/test maturity, dependency examples, REST design status, review discoverability, and backlog detail.

**Evidence:**

- [README.md lines 11-17](../../../README.md) says the repository remains private; GitHub reports it as public.
- [demoapp001 README lines 338 and 408-409](../../../demo-apps/demoapp001-typescript-cypress/README.md) says there are `35+` tests and describes the test runner as planned, while the current suite has 46 scenarios and 257 step executions.
- [demoapp001 README lines 253-260](../../../demo-apps/demoapp001-typescript-cypress/README.md) shows dependency metadata that no longer matches [package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json).
- [TypeScript qa-strategy.md lines 60-63](../../../demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md) reports 43 scenarios and 241 steps and omits the current audit scenarios.
- [rest-api-wrapper.md lines 55, 95-98, 1274-1300, and 1373-1388](../../../DOCS/.design/rest-api-wrapper.md) contains aspirational rate-limiting/Jest/dependency choices and unchecked implementation plans despite the REST API being recorded as delivered elsewhere.
- [DOCS/.review/README.md](../../../DOCS/.review/README.md) still cites reference architecture v1.14 and omits newer reviews; [DOCS/README.md](../../../DOCS/README.md) has the same review-index drift.
- The detailed BACKLOG-021 text still describes .NET 8/SpecFlow, although the current stack is .NET 10/Reqnroll. The resolved-item listing also omits BACKLOG-058 and BACKLOG-059 even though the summary counts include them.

**Impact:** A new contributor cannot reliably determine which design is current, how mature each stack is, or where the latest assurance evidence lives. This undercuts the backlog's claim that documentation currency debt is resolved.

**Recommendation:** Run a single governed currency sweep across the root/stack READMEs, QA strategy, REST design, backlog detail, and both review indexes. Mark superseded proposals explicitly and point to the OpenAPI document as the implemented contract. Extend the existing currency guard to check RA versions, review index membership, current framework/runtime names, and scenario-count statements where feasible.

## R4 - Test Pyramid and Coverage Claims Lack Evidence (Medium)

**Risk description:** The root documentation describes a unit/integration/BDD test pyramid, but the collected suites are predominantly BDD acceptance scenarios. CI does not collect or enforce coverage, and the REST API test does not validate responses against the OpenAPI contract.

**Evidence:**

- [README.md lines 217 and 248-252](../../../README.md) describes unit, integration, and comprehensive BDD layers.
- [TypeScript package.json](../../../demo-apps/demoapp001-typescript-cypress/package.json) exposes Cucumber and a custom API integration script, but no unit-test or coverage script.
- [Python pyproject.toml](../../../demo-apps/demoapp002-python-pytest/pyproject.toml) configures pytest/pytest-bdd; local collection and execution produced the same 46 feature scenarios, not a separate lower-level suite.
- [C# test project](../../../demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj) references a coverage collector, but [ci.yml lines 123-129](../../../.github/workflows/ci.yml) runs a plain `dotnet test` without coverage collection or a threshold.
- [api.integration.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/api/api.integration.ts) exercises useful happy and selected error paths but does not validate the implemented response bodies against [openapi.yaml](../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml).

**Impact:** Scenario breadth can be mistaken for fault-detection depth. The R1 false-positive behaviour demonstrates the practical consequence: many passing scenarios do not guarantee mutation-sensitive component correctness.

**Recommendation:** Add focused unit/component suites for loaders, solver candidates, orchestrator call sequencing, and API service/validation logic. Collect per-stack coverage as diagnostic evidence, set justified thresholds only after a baseline, and add OpenAPI linting plus response-contract validation. Keep Gherkin focused on user-observable behaviour rather than duplicating lower-level cases.

## R5 - CI Security and Evidence Gates Are Asymmetric (Low)

**Risk description:** The CI design has good least-privilege controls, but dependency audits and durable test results are not equivalent across the stacks.

**Evidence:**

- [ci.yml lines 72-79](../../../.github/workflows/ci.yml) uploads a TypeScript artefact; the Python and C# jobs do not publish comparable test results.
- The workflow does not run `npm audit`, `pip-audit`, or a NuGet vulnerability check.
- Local npm audit reported zero known vulnerabilities. Python audit was unavailable because `pip-audit` is not installed. The NuGet audit was inconclusive under the host's unsupported .NET 9 SDK for a .NET 10 target.
- [requirements-test.lock](../../../demo-apps/demoapp002-python-pytest/requirements-test.lock) pins Python versions but does not include hashes. npm and NuGet use lock files.
- Positive controls include workflow `contents: read`, `persist-credentials: false`, locked restores, and a final all-jobs-success gate.

**Impact:** A green build does not preserve equivalent evidence for test outcomes and known-vulnerability posture across languages. Investigation quality differs depending on which stack fails.

**Recommendation:** Add stack-native dependency audits under the supported runtimes, publish JUnit/TRX and audit summaries for every stack, and retain the current fan-in gate. If Python hash locking is adopted, generate and verify hashes through the existing dependency-update process rather than editing them manually.

## Backlog Coverage Note

R1-R5 were not present as open items in the reviewed backlog. The review scope permits only immutable review artefacts, so no backlog IDs have been invented and no existing resolved item has been silently reopened. The project owner should triage these findings in a separate authorised change.

---

Review: CODE_REVIEW_CODEX_v1_20260723T2351Z | Reviewer: AI assistant (Codex, GPT-5) | Generated: 2026-07-23T23:51Z
