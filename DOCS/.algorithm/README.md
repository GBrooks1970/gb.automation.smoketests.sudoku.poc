# .algorithm — Algorithm Documentation

**Purpose:** Language-agnostic pseudocode specifications for every algorithm implemented in this project.

Algorithm documents are the canonical reference for *what* an algorithm does and *why* it works. They are implementation-independent — the pseudocode must be understandable without knowledge of TypeScript, Node, or any specific library.

---

## Naming Convention

```
ALGORITHM_<Domain>_<Name>.md
```

Examples:
- `ALGORITHM_Sudoku_Basic_Solver.md`
- `ALGORITHM_Sudoku_Advanced_Solver.md`

---

## When to Write an Algorithm Document

- Before implementing a non-trivial algorithm (design-first)
- When an existing algorithm is poorly understood by the team
- When documenting a technique that was adapted from external literature

---

## Document Contents

Each algorithm document must include:

| Section | Required | Purpose |
|---------|----------|---------|
| Overview | Yes | Brief description and context |
| Goal | Per technique | What problem it solves |
| Technique | Per technique | Human-readable explanation |
| Example | Per technique | Concrete worked example |
| Pseudocode | Per technique | Language-agnostic steps |
| Complexity | Per technique | Time and space analysis |
| Implementation Reference | Yes | Link to source file(s) |
| Testing | Yes | Link to feature files / test data |
| References | Yes | External sources |

Use the [TEMPLATE_Algorithm.md](TEMPLATE_Algorithm.md) to start a new document.

---

## Available Documents

| Document | Algorithms Covered | Status |
|----------|--------------------|--------|
| [ALGORITHM_Sudoku_Basic_Solver.md](ALGORITHM_Sudoku_Basic_Solver.md) | Unit Completion, Hidden Singles, Naked Singles, Main Loop | v1.0 |
| [ALGORITHM_Sudoku_Advanced_Solver.md](ALGORITHM_Sudoku_Advanced_Solver.md) | Naked/Hidden Pairs & Triples, X-Wing, Swordfish, Jellyfish, XY-Wing, Simple Coloring, Forcing Chains | Draft |

---

## Maintenance Notes

- Algorithm documents are **not** implementation logs — do not record what changed or when.
- Keep pseudocode in sync with the actual implementation. If the code diverges, update the pseudocode.
- When adding a new document, add a row to the table above **and** to [DOCS/README.md](../README.md).
