# DEMOAPP003_CSHARP_SPECFLOW — Architecture

**Stack:** DEMOAPP003_CSHARP_SPECFLOW
**Language:** C# / .NET 8
**Framework:** SpecFlow 3.9 + NUnit
**Surface type:** @util
**Last updated:** 2026-05-28

## 1. Purpose

This Stack proves the shared Sudoku Gherkin contract can be implemented in C# without changing canonical feature text. It mirrors the TypeScript and Python @util surface by importing solver classes in-process and driving them through Screenplay-style components.

## 2. Five-Layer Model

| Layer | Role | Implementation |
|-------|------|----------------|
| 1 — Feature Files | Gherkin specs | `tests/features/` copied from `features-shared/` |
| 2 — Step Definitions | Maps steps to Screenplay | `tests/screenplay/step_definitions/` |
| 3 — Screenplay | Actor, Tasks, Questions | `tests/screenplay/` |
| 4 — Abilities | Wrap subject application | `tests/screenplay/abilities/` |
| 5 — Subject Application | Solver code under test | `app_src/` |

## 3. Component Dependency Graph

SpecFlow binding methods call `actor.AttemptsTo(...)` or `actor.Answer(...)`; Tasks and Questions retrieve `UseSudokuSolver` or `LoadPuzzles`; Abilities are the only Screenplay components that directly hold subject-application objects.

## 4. Key Design Decisions

| Decision | Rationale | DR Reference |
|----------|-----------|--------------|
| Use SpecFlow + NUnit for C# BDD execution | Keeps C# tied to the canonical Gherkin contract | DR-032 |
| Keep the Stack @util-only | Matches current parity scope and avoids adding a process lifecycle | DR-003, DR-032 |
| Port solver behavior directly before adding new capability | Preserves cross-stack behavioral parity | DR-004, DR-032 |

## 5. Known Constraints

- The C# Stack does not expose API, UI, or CLI surfaces.
- Benchmarking is reporting-only; no timing thresholds are enforced.
- Feature content must remain aligned with `features-shared/`.

## 6. Directory Structure

```text
demoapp003-csharp-specflow/
├── app_src/
├── tests/
│   ├── features/
│   └── screenplay/
├── tooling/performance/
└── docs/
```

## 7. External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| SpecFlow.NUnit | 3.9.74 | Gherkin-to-NUnit execution |
| SpecFlow.Tools.MsBuild.Generation | 3.9.74 | Feature code generation |
| NUnit | 3.14.0 | Assertions and test runtime |

## 8. Related Documents

- `DOCS/.architecture/screenplay-parity-contract.md`
- `DOCS/.architecture/subject-app-contract.md`
- `decision-register.md`
