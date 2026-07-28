# DEMOAPP001 Component-Test Coverage Baseline

**Work item:** SUD-24 / BACKLOG-063

**Captured:** 2026-07-27

**Runtime:** Node.js 24.18.0

**Status:** Diagnostic, report-only baseline; no coverage threshold is configured

## Purpose

This is the first lower-level TypeScript evidence layer beneath the canonical Cucumber suite. It
targets production seams where direct inputs and outputs give more mutation-sensitive evidence than
repeating the user-facing Gherkin. The canonical 48-scenario suite remains the cross-Stack behaviour
contract; these tests do not replace it.

## Test inventory

| Production layer | Focused evidence | Test file |
|---|---|---|
| Puzzle loading | Valid `0`/`9` boundaries and query paths; missing file; row/column shape; non-integer, boolean and out-of-range cells | `tests/component/puzzle-loader.contract.test.ts` |
| Solver techniques | One minimal grid each for Unit Completion, Hidden Singles and Naked Singles | `tests/component/solver-techniques.contract.test.ts` |
| Orchestration | SUD-22 attempt order/immutability plus SUD-24 early-complete exit and changed-without-evidence guard | `tests/component/orchestration.contract.test.ts` |
| API validation and service | `400` missing/malformed grid, `422` target digit, constraint conflicts, `SOLVED`/`STUCK_ON_ADVANCED_LOGIC` response mapping and `404` puzzle lookup | `tests/component/api-service.contract.test.ts` |

The Stack-local commands are:

```bash
npm run test:component
npm run test:coverage
```

`npm test` runs the component lane before the full Cucumber suite. CI also runs
`npm run test:coverage` as a named report-only step and retains its raw output in the existing
`demoapp001-validation-results` artefact.

## Baseline

Node's native `--experimental-test-coverage` report was collected from 16 passing component tests.
Coverage is deliberately limited to the five production modules named by SUD-24:

| Module | Line coverage | Branch coverage | Function coverage |
|---|---:|---:|---:|
| `app_src/PuzzleLoader.ts` | 96.58% | 87.18% | 86.96% |
| `app_src/SudokuSolver.ts` | 65.95% | 91.03% | 84.00% |
| `app_src/SudokuOrchestrator.ts` | 97.62% | 91.67% | 100.00% |
| `app_src/server/SudokuApiService.ts` | 43.56% | 70.00% | 21.43% |
| `app_src/server/validation.ts` | 80.07% | 83.93% | 91.67% |
| **Selected-module total** | **73.23%** | **87.67%** | **79.59%** |

These numbers are a starting observation, not a quality target. SUD-28 owns review of uncovered
branches, mutation evidence and any justified incremental floor.

## Exclusions and interpretation

- Cucumber, Serenity/JS and Screenplay bindings remain covered by the BDD/parity gates and are not
  counted as production component coverage.
- Express routing/middleware and OpenAPI response conformance remain outside this selected-module
  coverage total; SUD-27 now validates real success and error responses in the API contract lane.
- Browser UI assets, CLI process behaviour, performance tooling, generated output and third-party
  code are outside this focused baseline.
- Audit helpers and other production modules may execute indirectly, but they are not included in
  the selected-module total because SUD-24 did not inventory them as independent component targets.
- A lower percentage is not a failure in this report-only phase. The uncovered-line lists in the
  raw Node report are retained to guide SUD-28 rather than being hidden by an arbitrary threshold.

## Reproduction

From `demo-apps/demoapp001-typescript-cypress/` under the supported Node 24 runtime:

```bash
npm ci
npm run test:coverage
```

The coverage command contains include filters only. It intentionally contains none of Node's
`--test-coverage-lines`, `--test-coverage-branches` or `--test-coverage-functions` threshold flags.
