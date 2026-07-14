# DEMOAPP002 Python Pytest Stack

This Stack implements the shared Sudoku `@util` Gherkin contract with Python,
pytest, and pytest-bdd.

## Quick Start

```powershell
cd demo-apps/demoapp002-python-pytest
python -m pip install -e ".[test]"
python -m pytest
```

## Structure

```text
app_src/                 Python Sudoku subject implementation
tests/features/          Stack-local copy of the canonical Gherkin feature
tests/screenplay/        Screenplay-style abilities, tasks, questions, and steps
puzzles.json             Stack-local puzzle data used by PuzzleLoader
```

The feature body must stay in parity with
`features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`.

## Grid Access

`SudokuSolver.get_grid()` returns a deep-copy snapshot of the working grid
(the v1.0 `getGrid` operation) — prefer it wherever access is read-only. The
public `grid` attribute is retained for compatibility (test fixtures use it to
compose grid states), but mutating it directly from outside the solver is
**deprecated**: external mutation bypasses the solving algorithms and the
audit trail.

## License

This Python stack is part of the repository's [ISC-licensed](../../LICENSE) original project
material. Python dependencies retain their respective licence terms.
