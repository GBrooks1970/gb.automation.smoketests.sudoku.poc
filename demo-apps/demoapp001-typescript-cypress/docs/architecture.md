# DEMOAPP001_TYPESCRIPT_CYPRESS — Architecture

**Stack:** DEMOAPP001_TYPESCRIPT_CYPRESS
**Language:** TypeScript 5.x
**Framework:** Cucumber.js 12 + Serenity/JS 3.43.2
**Surface type:** @util
**Last updated:** 2026-05-15

---

## 1. Purpose

This Stack verifies Sudoku solver behavior through an in-process util surface, using Gherkin scenarios as the behavioral contract. It exists to provide a clean, Screenplay-structured reference implementation that is portable to future Python and C# Stacks.

---

## 2. Five-Layer Model

| Layer | Role | Implementation |
|-------|------|---------------|
| 1 — Feature Files | Gherkin specs | `tests/features/` (copied from `features-shared/`) |
| 2 — Step Definitions | Maps steps to Screenplay | `tests/screenplay/step_definitions/` |
| 3 — Screenplay | Actor, Tasks, Questions | `tests/screenplay/` |
| 4 — Abilities | Wraps subject application | `tests/screenplay/abilities/` |
| 5 — Subject Application | Software under test | `app_src/` |

---

## 3. Component Dependency Graph

```text
Feature Files (tests/features)
  -> Step Definitions (tests/screenplay/step_definitions)
      -> Actor attemptsTo(Task) / answer(Question)
          -> Tasks and Questions (tests/screenplay/tasks, questions)
              -> Abilities (UseSudokuSolver, LoadPuzzles)
                  -> Subject Application (SudokuSolver, SudokuOrchestrator, PuzzleLoader)
```

This Stack enforces downward-only dependency flow: step definitions do not instantiate production classes directly.

---

## 4. Key Design Decisions

| Decision | Rationale | DR Reference |
|----------|-----------|-------------|
| Dot-prefixed DOCS convention at repository level | Keeps project-wide documentation grouped and visually distinct | DR-001 |
| Use @util surface for DEMOAPP001 | Current objective is deterministic, in-process logic testing without CLI process lifecycle overhead | DR-003 |
| Canonical feature ownership in features-shared | Enforces one behavioral source across all Stacks | DR-007 |
| Serenity/JS Abilities extend base Ability class | Required by Serenity/JS v3 API contracts for Actor ability resolution | DR-008 |

---

## 5. Known Constraints

- No @cli execution in this Stack: tests validate logic by direct class interaction through Abilities.
- Advanced Sudoku techniques (backtracking, X-Wing, naked pairs) are intentionally out of scope.
- Feature text includes some over-specified literal values; this is currently preserved by DR-005.

---

## 6. Directory Structure

```text
demoapp001-typescript-cypress/
├── app_src/
├── tests/
│   ├── features/
│   └── screenplay/
│       ├── abilities/
│       ├── actors/
│       ├── tasks/
│       ├── questions/
│       ├── support/
│       └── step_definitions/
├── tooling/
└── docs/
```

---

## 7. External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @cucumber/cucumber | ^12.8.3 | BDD runner and step binding |
| @serenity-js/core | ^3.43.2 | Screenplay Actor/Ability/Activity runtime |
| @serenity-js/cucumber | ^3.43.2 | Cucumber integration for Serenity/JS |
| @serenity-js/assertions | ^3.43.2 | Assertion DSL |
| ts-node | ^10.9.0 | Run TypeScript directly in test runtime |
| typescript | ^5.0.0 | Compile and type-check TypeScript |

---

## 8. Related Documents

- `docs/screenplay-guide.md` — Screenplay implementation details
- `docs/qa-strategy.md` — scope, test design, and coverage posture
- `docs/README.md` — setup and execution quick-start
- `../../decision-register.md` — authoritative structural decisions
- `../../DOCS/.templates/stack-architecture.template.md` — source template used
