# DEMOAPP002 Component-Test Coverage Baseline

**Work item:** SUD-25 / BACKLOG-064

**Captured:** 2026-07-27

**Runtime:** Python 3.13.14; coverage.py 7.15.2

**Status:** Diagnostic, report-only baseline; no coverage threshold is configured

## Purpose

This is the first lower-level Python evidence layer beneath the canonical pytest-bdd suite. It
targets production seams where direct inputs and outputs give more mutation-sensitive evidence than
repeating the user-facing Gherkin. The canonical 48-scenario suite remains the cross-Stack behaviour
contract; these tests do not replace it.

## Test inventory

| Production layer | Focused evidence | Test file |
|---|---|---|
| Puzzle loading | Valid `0`/`9` boundaries and query isolation; missing names/files; row/column shape; non-integer, boolean and out-of-range cells | `tests/component/test_puzzle_loader_boundaries.py` |
| Solver techniques | One minimal grid each for Unit Completion, Hidden Singles and Naked Singles | `tests/component/test_solver_techniques.py` |
| Orchestration | SUD-22 attempt order/immutability and fixpoint/no-progress checks, plus early-complete exit and changed-without-evidence guard | `tests/component/test_orchestration_attempts.py` |
| Validation mapping | Valid placement, row/column/block conflicts, clean/duplicate constraint states and complete/invalid solution results | `tests/component/test_validation_contract.py` |

The Stack-local commands are:

```bash
python -m pytest tests/component
python -m coverage run -m pytest tests/component
python -m coverage report
```

The default `python -m pytest` command retains both the component lane and full pytest-bdd suite.
CI runs the coverage commands as a named report-only step under Python 3.13 before that complete
test gate.

## Baseline

coverage.py collected branch and line data from 26 passing component tests. The scope is limited to
the three production modules named by SUD-25:

| Module | Statements covered | Line coverage | Branches covered | Branch coverage | Combined coverage |
|---|---:|---:|---:|---:|---:|
| `app_src/puzzle_loader.py` | 44 / 45 | 97.78% | 15 / 16 | 93.75% | 96.72% |
| `app_src/sudoku_orchestrator.py` | 46 / 56 | 82.14% | 15 / 22 | 68.18% | 78.21% |
| `app_src/sudoku_solver.py` | 163 / 188 | 86.70% | 106 / 116 | 91.38% | 88.49% |
| **Selected-module total** | **253 / 289** | **87.54%** | **136 / 154** | **88.31%** | **87.81%** |

These numbers are a starting observation, not a quality target. SUD-28 owns review of uncovered
branches, mutation evidence and any justified incremental floor.

## Exclusions and interpretation

- pytest-bdd and Screenplay bindings remain covered by the BDD/parity gates and are not counted as
  production component coverage.
- `app_src/__init__.py` and `app_src/constants.py` contain exports/value definitions rather than
  independent behaviour, so they are outside the selected-module total.
- `app_src/attempt.py` is exercised through the orchestrator contract, while `app_src/audit.py` has
  its own canonical audit scenarios; neither is an independent SUD-25 target.
- Puzzle catalogue data, generated output, performance tooling and third-party code are outside
  this focused baseline.
- A lower percentage is not a failure in this report-only phase. The uncovered statement and
  partial-branch locations emitted by `coverage report` guide SUD-28 rather than being hidden by an
  arbitrary threshold.

## Reproduction

From `demo-apps/demoapp002-python-pytest/` under the supported Python 3.13 runtime:

```bash
python -m pip install -c requirements-test.lock -e ".[test]"
python -m coverage run -m pytest tests/component
python -m coverage report
```

`pyproject.toml` enables branch collection and selects the three production modules through its
source/omit configuration. It intentionally contains no `fail_under` setting.
