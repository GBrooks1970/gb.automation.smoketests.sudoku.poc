# Project Review: DEMOAPP002 Python/pytest-bdd

[Previous: DEMOAPP001 TypeScript](PROJECT_001_DEMOAPP001_TypeScript.md) | [Back to Index](../00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md) | [Next: DEMOAPP003 CSharp](PROJECT_003_DEMOAPP003_CSharp.md)

**Reviewer:** AI assistant (GPT-5.3 Codex)  
**Date:** 2026-05-30T08:23Z

## Specification Alignment

- Uses 9x9 lists of integers and `EMPTY_CELL` constants, matching v1.0's grid model.
- Preserves original and working grids by deep-copying input into `orig_grid` and `grid`: `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` (lines 10-17).
- Implements Unit Completion across rows, columns, and blocks: `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` (lines 22-70).
- Implements row, column, and block Hidden Singles, surpassing v1.0's block-based detailed algorithm: `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` (lines 72-142).
- Implements Naked Singles and candidate elimination from row, column, and block: `demo-apps/demoapp002-python-pytest/app_src/sudoku_solver.py` (lines 144-165 and 237-248).
- Orchestrator follows the required loop order and status strings but does not pre-check solved state before invoking algorithms: `demo-apps/demoapp002-python-pytest/app_src/sudoku_orchestrator.py` (lines 16-36).
- Loader maps puzzle metadata to a frozen dataclass with name, difficulty, description, and grid: `demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py` (lines 11-17 and 29-39).

## Areas Followed Well

- Python's `deepcopy` usage is a strong direct implementation of the v1.0 deep-copy requirement.
- Loader validation explicitly checks row count, column count, integer type, and 0-9 range.
- Solver helper methods mirror the v1.0 row, column, block, candidate, and block-empty-cell helper operations.
- The implementation is straightforward, idiomatic Python, and easy for learners to compare with TypeScript and CSharp.
- The README clearly states this stack implements the shared Sudoku `@util` Gherkin contract.

## Areas Not Followed or Beyond v1.0

- As in TypeScript, direct public access to `grid` replaces a formal `getGrid` snapshot operation.
- There is no CLI display component comparable to v1.0's Display component; this stack is focused on util tests and subject implementation.
- There is no Python REST/web surface; this is acceptable but should be shown in a parity matrix as intentionally behind TypeScript on optional product surfaces.
- Already-solved grid handling returns the correct status only after a no-change algorithm pass.
- The loader assumes required metadata keys exist and will raise raw key errors if missing, whereas v1.0 only explicitly validates the grid.

## Test Coverage and Approach

- `pyproject.toml` configures pytest and pytest-bdd with markers for the shared util surface and DEMOAPP002 stack.
- The stack-local feature file is in parity with the shared feature body after normalizing stack tags.
- The test suite inherits the expanded shared contract, including algorithm-level, orchestration, loader, immutability, integration, edge case, and audit scenarios.

## Design Quality Assessment

The Python stack is a strong parity implementation of the solver core. It is smaller than the TypeScript project, which makes it useful as a minimal readable baseline. The main gap against v1.0 is the lack of a display surface, but this appears intentional because the stack is organized around in-process util BDD tests.

---

[Previous: DEMOAPP001 TypeScript](PROJECT_001_DEMOAPP001_TypeScript.md) | [Back to Index](../00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md) | [Next: DEMOAPP003 CSharp](PROJECT_003_DEMOAPP003_CSharp.md)
