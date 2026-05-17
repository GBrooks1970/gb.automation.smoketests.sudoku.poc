# Naming Conventions — Project Standard

**Document type:** Design  
**Status:** Adopted  
**Date adopted:** 2026-05-13  
**Scope:** All code and documentation in this repository

---

## 1. Rationale

This document records the naming conventions adopted for the project following a
full audit of the codebase conducted in May 2026. The chosen conventions align with
the TypeScript community standard, minimise friction for any TypeScript developer
joining the project, and are enforced automatically by the ESLint rule
`@typescript-eslint/naming-convention` configured in
`demo-apps/demoapp001-typescript-cypress/eslint.config.js`.

---

## 2. TypeScript Source

### 2.1 Classes and Interfaces

| Element | Convention | Example |
|---------|-----------|---------|
| Class names | `PascalCase` | `SudokuSolver`, `PuzzleLoader` |
| Interface names | `PascalCase` | `Puzzle`, `PuzzleCollection` |
| Type aliases | `PascalCase` | `CellCoord` |

### 2.2 Methods and Functions

| Element | Convention | Example |
|---------|-----------|---------|
| Public methods | `camelCase` | `unitCompletion()`, `getAllPuzzles()` |
| Private methods | `camelCase` | `getCellCandidates()`, `findMissingDigit()` |
| Static methods | `camelCase` | `named()` |

### 2.3 Variables and Parameters

| Element | Convention | Example |
|---------|-----------|---------|
| Local variables | `camelCase` | `blockCells`, `colIndex`, `isProgressing` |
| Method parameters | `camelCase` | `blockRow`, `blockCol`, `filePath` |
| Class properties | `camelCase` | `origGrid`, `orchestrator` |
| Loop counters (tight inner loops) | `camelCase` acceptable short form | `r`, `c` only inside 2–3-line scan loops |

> **Rule on single-letter variables:** Single-letter names (`r`, `c`) are acceptable
> only as iteration indices inside short scan loops (2–3 lines). Any variable that
> spans more than a few lines, or that represents a meaningful position in the
> algorithm, must use a descriptive name (`row`, `col`, `blockRow`, `blockCol`).

### 2.4 Constants

| Element | Convention | Example |
|---------|-----------|---------|
| Module-level exported constants | `UPPER_SNAKE_CASE` | `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL` |
| String return values (status codes) | `UPPER_SNAKE_CASE` | `"SOLVED"`, `"STUCK_ON_ADVANCED_LOGIC"` |

> All shared grid-dimension and sentinel constants are exported from
> `app_src/SudokuSolver.ts` and imported where needed. Do **not** repeat magic
> numbers — import the constant.

### 2.5 Inline Object Types

When a method returns a lightweight coordinate object, use descriptive property names:

```typescript
// Correct
private getBlockEmptyCells(...): {row: number, col: number}[]

// Incorrect — single-letter property names on returned objects
private getBlockEmptyCells(...): {r: number, c: number}[]
```

---

## 3. Source Files

| Element | Convention | Example |
|---------|-----------|---------|
| TypeScript class files | `PascalCase` matching primary export | `SudokuSolver.ts`, `PuzzleLoader.ts` |
| Entry point | `index.ts` (Node/TS standard exception) | `index.ts` |
| Config files | `kebab-case` (ecosystem default) | `tsconfig.json`, `package.json`, `eslint.config.js` |

---

## 4. Folders

| Scope | Convention | Example |
|-------|-----------|---------|
| Application source folder | `snake_case` | `app_src/` |
| Test folder | lowercase | `tests/` |
| DOCS sub-folders | `snake_case` with leading dot | `.design/`, `.planning/`, `.review/` |

> The `app_src` folder name is grandfathered as-is. Future source folders should use
> `kebab-case` to align with the broader ecosystem (e.g., a future `app-api/`).

---

## 5. Documentation Files (DOCS/)

| Document type | Pattern | Example |
|---------------|---------|---------|
| Design documents | `DESIGN_Title_Case.md` | `audit-trail-feature.md` |
| Analysis documents | `ANALYSIS_Title_Case.md` | `ANALYSIS_Performance_Benchmarks.md` |
| Planning documents | `PLAN_Title_Case.md` | `PLAN_Q3_Roadmap.md` |
| Refactoring strategies | `REFACTOR_Title_Case.md` | `REFACTOR_Solver_Architecture.md` |
| How-to guides | `HOWTO_Title_Case.md` | `debug-sudoku-solver.md` |
| Implementation logs | `IMPL_LOG_YYYY-MM-DD_Title_Case.md` | `IMPL_LOG_2026-01-30_Initial_Project_Creation.md` |
| Backlog | `BACKLOG.md` (single file) | — |
| Code review output | `CODE_REVIEW_Reviewer__Timestamp/` | `CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/` |
| Templates | `TEMPLATE_Title_Case.md` | `TEMPLATE_Design_Document.md` |

> **Separator convention:** Use a single underscore (`_`) between words. The double
> underscore (`__`) is reserved as the separator between the reviewer name and the
> timestamp in code-review folder names.

---

## 6. JSON Data Files

| Element | Convention | Example |
|---------|-----------|---------|
| JSON keys | `camelCase` | `name`, `difficulty`, `grid` |
| Puzzle name values | Title Case | `"Easy Scan Grid"`, `"Logic Squeeze Grid"` |
| Difficulty values | lowercase | `"easy"`, `"medium"`, `"hard"`, `"test"` |

---

## 7. Gherkin Feature Files

| Element | Convention | Example |
|---------|-----------|---------|
| Feature file names | `PascalCase` | `BasicSudokuSolverLogic.feature` |
| Scenario names | Title Case with articles | `"Complete a row with only one missing value"` |
| Example table column headers | `camelCase` | `gridState`, `row`, `col`, `value` |
| Example table values (state descriptors) | `camelCase` | `emptyGrid`, `has5InSameRow`, `noConflicts` |
| Example table values (result codes) | `UPPER_CASE` | `VALID`, `INVALID` |
| Quoted algorithm names in steps | Title Case | `"Unit Completion"`, `"Hidden Singles"` |

---

## 8. Enforcement

The `@typescript-eslint/naming-convention` ESLint rule in
[eslint.config.js](../../demo-apps/demoapp001-typescript-cypress/eslint.config.js)
enforces rules 2.1–2.4 automatically. Run the linter with:

```bash
cd demo-apps/demoapp001-typescript-cypress
npm run lint
```

Rules for DOCS files, Gherkin files, and JSON keys are convention-only and not
currently enforced by tooling. Code review is the enforcement mechanism for those.

---

## 9. Quick Reference

```
Classes / Interfaces / Types  →  PascalCase
Methods / Variables / Params  →  camelCase
Module-level constants        →  UPPER_SNAKE_CASE
Status return strings         →  UPPER_SNAKE_CASE
Source files (class files)    →  PascalCase  (index.ts is the only exception)
DOCS files                    →  PREFIX_Title_Case.md
JSON keys                     →  camelCase
Gherkin table headers         →  camelCase
```
