---
version: 1
created: 2026-10-07T06:27Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-078 / TRIAGE-14
status: approved
approved: 2026-10-07 by GBrooks1970, "action proposed sequence"; implement and open focused project and separate root worklist PRs, owner merges
delivered: not yet
language: en-GB
---

# Implementation plan: BACKLOG-078 exact Then assertions

**Goal.** Make the stated digit and position determine whether a Then assertion passes in
all three Stacks. Wrong expectations must fail in the real native runners while canonical
feature text, 55 scenarios / 309 steps per Stack, solver behaviour and coverage floors stay intact.

## Evidence gathered before planning

Read-only source inspection at project main `aeea19a53421867e82d1d3e9f18218b618fa66e3`
identified 16 affected parameterised Then patterns, with 48 implementations across the Stacks.
BACKLOG-078 records earlier captured wrong-digit and wrong-row mutations that passed everywhere.
The manifest-selected handover v6 is historical: current backlog is 1 Open / 0 In Progress /
101 Resolved / 102 Total. The owner selected this Medium-priority item ahead of TRIAGE-08.
Source inspection changed no tracked file. Locked dependency restoration and fresh native audits
ran in the isolated checkout; their captured evidence is under `.results/backlog-078/20261007/`.

| Finding | Consequence for the plan |
|---|---|
| Unit Completion and Hidden Singles use progress or digit membership | Assert the newly filled fixture target and its stated value and unit. |
| Negative Hidden Single row assertions ignore row identity | Check the prepared row and its unchanged snapshot. |
| Naked Pairs ignores block coordinates; exact-cell assertions lack prior-empty evidence | Check prepared target membership and the empty-to-stated-digit transition. |
| TypeScript ignores two count parameters; valid-digit checks only prove non-zero values | Consume counts and use the existing valid-solution Question. |
| Existing GridSnapshot, TargetCell and GridCell Questions expose the required observations | Preserve their signatures, existing Memory keys/shapes and Ability interfaces; no DR is required. |
| Node 24.18.0, Python 3.13.1 and .NET 10.0.401 are available | Run the native acceptance mutations and supported local gates in all three Stacks. |
| Fresh governed audits: TypeScript excepted, Python/NuGet zero findings | Keep the exact braces exception through 12 October inclusive; no pin or policy change belongs to this item. |

## Steps

1. Save this plan and its row in `DOCS/.implementation-plans/_index.md`. Use the existing
   `DOCS/.templates/implementation-plan.template.md`; retain this approved body and append Outcome.
   Document the full assertion inventory in
   `DOCS/.analysis/2026-10-07-backlog-078-then-assertion-inventory.md`.
2. Relevant setup Tasks publish a deep snapshot after fixture construction under `GRID_SNAPSHOT`
   and the Given-owned intended target under `TARGET_CELL`. Reuse their current producers and
   keys. Change these files:
   - `demo-apps/demoapp001-typescript-cypress/tests/screenplay/tasks/InitialiseGrid.ts`
   - `demo-apps/demoapp001-typescript-cypress/tests/screenplay/tasks/SetupGridState.ts`
   - `demo-apps/demoapp002-python-pytest/tests/screenplay/tasks/__init__.py`
   - `demo-apps/demoapp003-csharp-specflow/tests/screenplay/tasks/Tasks.cs`
3. Strengthen the 16 patterns consistently. Require the prepared target to be empty in the
   snapshot, to contain the stated digit afterwards, and to belong to the stated row, column
   or block. Consume the three-cell count and prove all three fixture transitions; consume
   the 81-cell count and validate the solution. Negative row checks compare the prepared row
   with the snapshot. Change:
   - TypeScript `tests/screenplay/step_definitions/unitCompletion.steps.ts`,
     `hiddenSingles.steps.ts`, `nakedSingles.steps.ts`, `nakedPairs.steps.ts`,
     `orchestration.steps.ts`; add `tests/screenplay/support/grid-assertions.ts` in DEMOAPP001.
   - Python `tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py` in DEMOAPP002.
   - C# `tests/screenplay/step_definitions/BasicSudokuSolverLogicSteps.cs` in DEMOAPP003.
   Keep step definitions on the Actor/Task/Question path. Do not add candidate-observation APIs,
   change fixtures, or widen the solver/API or Question contracts.
4. Add `.batch/test-then-assertion-mutations.ps1`: run positive controls and bounded wrong-digit,
   row, column, block and count mutations against each Stack's native runner. Change canonical
   expectations first and propagate the identical mutation to selected Stack copies. Preserve
   original bytes, restore in `finally`, verify hashes, and keep mutation results separate from
   canonical CI evidence. A failed tool invocation, missing result or zero tests cannot count
   as a killed mutation. Retain logs, native results, exact counts and durations.
5. Add one scoped mutation-control step per Stack to `.github/workflows/ci.yml`, before the
   normal full Test step. Use existing supported runtimes and locked installations; keep the
   original full-suite, coverage, audit, parity, evidence and Pages gates.
6. Update `DOCS/.planning/backlog.md` and `CHANGELOG.md` after acceptance. Record the exact
   execution evidence and append this plan's Outcome. Resolve BACKLOG-078 only after all
   applicable local gates and native acceptance pass; PR CI remains the publication check.
7. Select TRIAGE-14 / BACKLOG-078 in the separate root
   `WORKLIST_gb.automation.smoketests.sudoku.poc.md`, preserving every existing ID and history.
   After project validation/publication, record completion and publish the root change separately.

## Verification

- Every affected pattern has a documented disposition and consistent three-Stack implementation.
- The recorded wrong missing digit 3 to 4 and Hidden Single row 3 to 4 must fail in each native
  runner after the repair. Other controls cover column/block identity, generic placement,
  explicit-cell placement, negative rows and bound counts. Positive selected scenarios must pass.
- Each negative run must execute its intended scenario and fail an assertion, not setup,
  compilation, parsing or dependency restoration. All feature files must restore byte-for-byte.
- DEMOAPP001: Node 24 locked restore, build, lint, formatting, component suite, Cucumber CI
  55/309, API/OpenAPI, existing 70/85/75 coverage floors, web/Pages checks and governed audit.
- DEMOAPP002: Python 3.13 constrained editable install, pip check, component/full pytest suite,
  Cucumber/JUnit evidence, existing 85% coverage floor and governed audit.
- DEMOAPP003: .NET 10 locked restore, component coverage with existing 80/80 floors,
  55 Reqnroll scenarios, TRX/Cucumber Messages evidence and governed NuGet audit.
- Seven repository parity/governance checks, every Stack evidence contract, parity-page tool
  tests, real-results parity gate and page build/negative checks. PR CI must pass all three
  Stacks, parity and aggregate gate; Pages deploy is verified after the owner's later merge.

## Delivery

Use `codex/sudoku-backlog-078-exact-assertions` in the owned isolated project checkout. Stage
exact paths, commit and open a focused project PR. The owner merges. Publish only the worklist
in a separate root PR and make its dependency on project acceptance explicit. Preserve shared
checkouts and historical branches. TRIAGE-08/09/10 and braces remediation remain separate.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Next item | BACKLOG-078 or default TRIAGE-08 | Strengthen native assurance before finalising documentation claims | "action proposed sequence", GBrooks1970, 2026-10-07 |
| Assertion design | Existing Questions/keys or expanded contracts | Existing observations and fixture targets | Routine implementation within approved scope; no signature/key change |
| Publication | Focused project PR plus separate worklist closure | Keep independent repository histories | Approved proposed sequence, 2026-10-07; owner retains merge authority |

## Outcome

**Local completion snapshot, 2026-10-07, before commit/PR publication.** The 16 patterns /
48 bindings and setup observations were delivered in the planned 12 test-layer files. Existing
Questions, Abilities, keys/shapes, fixtures, canonical feature text and solver/API are unchanged;
no DR was needed. Native controls and the three CI hooks retain evidence under each existing
Stack artefact root. The [inventory](../.analysis/2026-10-07-backlog-078-then-assertion-inventory.md)
records every disposition. BACKLOG-078 is locally Resolved: 0 Open / 0 In Progress / 102 Resolved.

| Captured acceptance | Result |
|---|---|
| Native mutation controls | Each Stack: 15 positives, 22 killed mutations, original feature hashes restored. Totals 45 positives / 66 killed. Native command durations TS 224669 ms, Python 36637 ms, C# 149987 ms. |
| DEMOAPP001 | 113 component tests, 30969.8472 ms; 55 scenarios / 309 steps, 6.306 s (command 20242 ms); 8 OpenAPI checks. Build/lint/format, API, web/Pages scripts PASS. |
| TypeScript selected-module coverage | 80.11% lines / 91.94% branches / 80.17% functions; unchanged 70/85/75 floors. 113 tests, 58949.8103 ms, one local worker; default CI concurrency unchanged. |
| DEMOAPP002 | 30 component tests in 0.80 s; full 85 tests in 2.03 s; 88.98% coverage with unchanged 85% floor. Constrained isolated install and pip check PASS. |
| DEMOAPP003 | .NET 10.0.401 locked restore; 28 component tests in 539 ms, 55 Reqnroll scenarios (runner reports 1 s). 545/622 lines (87.62%) and 275/320 branches (85.94%), unchanged 80/80 floors. |
| Fresh audits | TypeScript excepted: 2 unique findings / 1 approved blocking braces exception / 0 unexcepted. Python/NuGet zero findings. Exact exception still ends 12 October inclusive; fast-uri remains TRIAGE-09. |
| Repository/evidence publication checks | Seven parity/governance checks, all three evidence contracts, parity tool tests, real-results gate and page build/negative controls PASS. |

Initial control-runner trials exposed native exit-code leakage and PowerShell scalar/array
counting; both were corrected. The accepted full three-Stack run above uses the final runner.
Positive scenarios are batched in one native invocation per Stack to avoid repeated startup;
each negative still executes exactly one scenario and must fail its assertion. Failed trials
and final evidence are retained separately under ignored `.results/backlog-078/20261007/`.

A separate scoped probe changed only a Pair Then candidate string from `2, 7, 4` to `1, 7, 4`.
Python still passed its one selected scenario (exit 0, 2762 ms); original feature bytes were
restored. No candidate-observation API was added. Root TRIAGE-15 records this separate follow-on.

Independent source/control review passed after correcting CI evidence retention and Python
setup consistency. The older loader/orchestrator mutation trial and native browser interaction
were not rerun: this item changes test assertions, not production/UI behaviour. New native
acceptance controls are the selected mutation evidence. PR/head CI and owner merge publication
remain later events; project and root worklist histories stay separate.
