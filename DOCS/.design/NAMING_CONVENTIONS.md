# Naming Conventions

**Project:** gb.automation.smoketests.sudoku.poc
**Last Updated:** 2026-05-14
**Status:** Adopted
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.9
**Template:** `DOCS/templates/TEMPLATE_Naming_Conventions.md`
**Authoritative for:** All Stacks, all document types, all code in this repository

> This document is the single source of truth for naming decisions.
> When a conflict arises between this document and any other source (code comments, AI memory, prior convention assumptions), this document wins.
> Deviations from stated conventions MUST be recorded in `DECISION_REGISTER.md`.

---

## Quick Reference

| Element | Convention | Example |
|---------|-----------|---------|
| TypeScript classes / interfaces / types | `PascalCase` | `SudokuSolver`, `Puzzle` |
| TypeScript methods / variables / params | `camelCase` | `unitCompletion()`, `blockRow` |
| TypeScript exported constants | `UPPER_SNAKE_CASE` | `GRID_SIZE`, `EMPTY_CELL` |
| Status return strings | `UPPER_SNAKE_CASE` | `"SOLVED"`, `"STUCK_ON_ADVANCED_LOGIC"` |
| TypeScript class files | `PascalCase` | `SudokuSolver.ts` |
| Config / ecosystem files | `kebab-case` | `tsconfig.json`, `eslint.config.js` |
| DOCS subdirectories | `snake_case` with leading dot | `.design/`, `.planning/` |
| DOCS document files | `PREFIX_Title_Case.md` | `DESIGN_Audit_Trail_Feature.md` |
| Feature files | `PascalCase` | `BasicSudokuSolverLogic.feature` |
| Screenplay Memory keys | `UPPER_SNAKE_CASE` (constant name = string value) | `SOLVE_RESULT = 'SOLVE_RESULT'` |
| Screenplay component classes | `PascalCase` verb/noun phrase | `UseSudokuSolver`, `SolvePuzzle` |
| Decision Record IDs | `DR-NNN` (zero-padded, sequential) | `DR-001`, `DR-042` |
| Stack names | `UPPER_SNAKE_CASE` | `DEMOAPP001_TYPESCRIPT_CYPRESS` |

---

## 1. TypeScript Source

### 1.1 Classes and Interfaces

| Element | Convention | Example |
|---------|-----------|---------|
| Class names | `PascalCase` | `SudokuSolver`, `PuzzleLoader` |
| Interface names | `PascalCase` | `Puzzle`, `PuzzleCollection` |
| Type aliases | `PascalCase` | `CellCoord`, `AlgorithmName` |

### 1.2 Methods and Functions

| Element | Convention | Example |
|---------|-----------|---------|
| Public methods | `camelCase` | `unitCompletion()`, `getAllPuzzles()` |
| Private methods | `camelCase` | `getCellCandidates()`, `findMissingDigit()` |
| Static factory methods | `camelCase` | `named()`, `from()`, `about()` |

### 1.3 Variables and Parameters

| Element | Convention | Example |
|---------|-----------|---------|
| Local variables | `camelCase` | `blockCells`, `colIndex`, `isProgressing` |
| Method parameters | `camelCase` | `blockRow`, `blockCol`, `filePath` |
| Class properties | `camelCase` | `origGrid`, `orchestrator` |
| Loop counters | `camelCase`; short form `r`, `c` only in 2–3-line scan loops | `row`, `col`; `r`, `c` (scan loops only) |

> **Single-letter rule:** `r` and `c` are acceptable only as iteration indices inside short scan loops (2–3 lines). Any variable that spans more than a few lines must use a descriptive name.

### 1.4 Constants

| Element | Convention | Example |
|---------|-----------|---------|
| Module-level exported constants | `UPPER_SNAKE_CASE` | `GRID_SIZE`, `BLOCK_SIZE`, `EMPTY_CELL`, `MAX_DIGIT` |
| Status return strings | `UPPER_SNAKE_CASE` | `"SOLVED"`, `"STUCK_ON_ADVANCED_LOGIC"` |

> All shared grid-dimension and sentinel constants are exported from `app_src/constants.ts`. Import the constant; do not repeat magic numbers.

### 1.5 Inline Object Types

Use descriptive property names on returned objects:
```typescript
// Correct
private getBlockEmptyCells(...): { row: number; col: number }[]
// Incorrect
private getBlockEmptyCells(...): { r: number; c: number }[]
```

---

## 2. Source Files

| File type | Convention | Separator | Example |
|-----------|-----------|-----------|---------|
| TypeScript class files | `PascalCase` matching primary export | None | `SudokuSolver.ts`, `PuzzleLoader.ts` |
| Entry point | `index.ts` (ecosystem exception) | — | `index.ts` |
| Config files | `kebab-case` (ecosystem default) | Hyphen | `tsconfig.json`, `eslint.config.js` |
| Gherkin step definition files (post-migration) | `camelCase.steps.ts` | `.steps.ts` suffix | `unitCompletion.steps.ts` |

---

## 3. Directories

| Scope | Convention | Separator | Example |
|-------|-----------|-----------|---------|
| Application source | `snake_case` | Underscore | `app_src/` |
| Test directory | `lowercase` | None | `tests/` |
| Screenplay subdirectories | `lowercase` | None | `abilities/`, `actors/`, `tasks/`, `questions/`, `support/` |
| DOCS type-specific subdirectories | `snake_case` with leading dot | Underscore | `.design/`, `.planning/`, `.algorithm/` |
| Stack root directories | `UPPER_SNAKE_CASE` | Underscore | `DEMOAPP001_TYPESCRIPT_CYPRESS/` |

> **Decision DR-001:** The leading dot on DOCS subdirectories is a documented divergence from the Reference Architecture.
> `app_src/` is grandfathered as-is. Future source folders should use `kebab-case` (e.g., `app-api/`).

---

## 4. Stack Names

| Rule | Value |
|------|-------|
| Format | `UPPER_SNAKE_CASE` |
| Pattern | `DEMOAPP[NNN]_[LANGUAGE]_[FRAMEWORK]` |
| Uniqueness | Must be unique across the repository |
| Allowed characters | A–Z, 0–9, underscore |
| Current stacks | `DEMOAPP001_TYPESCRIPT_CYPRESS` |

---

## 5. Documentation Files (DOCS/)

| Document type | Pattern | Example |
|---------------|---------|---------|
| Design documents | `DESIGN_Title_Case.md` | `DESIGN_Audit_Trail_Feature.md` |
| Analysis documents | `ANALYSIS_Title_Case_YYYYMMDD.md` | `ANALYSIS_Screenplay_BDD_Architecture_Alignment_20260514.md` |
| Algorithm documents | `ALGORITHM_Domain_Name.md` | `ALGORITHM_Sudoku_Basic_Solver.md` |
| How-to guides | `HOWTO_Title_Case.md` | `HOWTO_Debug_SudokuSolver.md` |
| Implementation logs | `IMPL_LOG_YYYY-MM-DD_Title_Case.md` | `IMPL_LOG_2026-01-30_Initial_Project_Creation.md` |
| Templates | `TEMPLATE_Title_Case.md` | `TEMPLATE_Decision_Record.md` |
| Code review output dirs | `CODE_REVIEW_Reviewer__Timestamp/` | `CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/` |

> **Separator:** Single underscore (`_`) between words. Double underscore (`__`) is reserved as the separator between reviewer name and timestamp in code-review folder names only.

---

## 6. Feature Files (Gherkin)

| Element | Convention | Example |
|---------|-----------|---------|
| Feature file names | `PascalCase` | `BasicSudokuSolverLogic.feature` |
| Scenario names | Title Case with articles | `"Complete a row with only one missing value"` |
| Step text — algorithm names | Title Case in quotes | `"Unit Completion"`, `"Hidden Singles"` |
| Example table column headers | `camelCase` | `gridState`, `row`, `col`, `value` |
| Example table values (state descriptors) | `camelCase` | `emptyGrid`, `has5InSameRow`, `noConflicts` |
| Example table values (result codes) | `UPPER_CASE` | `VALID`, `INVALID` |
| Surface tags | `@lowercase` | `@util`, `@cli`, `@api` |
| Stack tags | `@stack-[name]` | `@stack-demoapp001` |

---

## 7. Screenplay Components

| Component | Pattern | Factory method | Execution method | Example |
|-----------|---------|---------------|-----------------|---------|
| Actor | `PascalCase` noun / persona phrase | `named(label)` or Cast | — | `AnAutomatedSolver` |
| Ability | `PascalCase` verb phrase — what the actor CAN do | `using(config)` or `from(path)` | Retrieved via `actor.abilityTo(T)` | `UseSudokuSolver`, `LoadPuzzles` |
| Task | `PascalCase` verb phrase — what the actor DOES | Varies: `named()`, `called()`, `from()` | `performAs(actor)` | `SolvePuzzle`, `ApplyAlgorithm` |
| Question | `PascalCase` noun phrase — what the actor OBSERVES | `about()`, `current()`, `at()` | `answeredBy(actor)` | `SolveStatus`, `GridCell` |

---

## 8. Memory Keys

| Rule | Value |
|------|-------|
| Case | `UPPER_SNAKE_CASE` |
| Word separator | Underscore |
| Constant name equals string value | **MUST be identical** — `SOLVE_RESULT = 'SOLVE_RESULT'` |
| Surface namespacing (mixed surfaces) | Prefix with surface: `CLI_LAST_EXIT_CODE`, `API_LAST_RESPONSE` |
| Defined in | `tests/screenplay/support/memory-keys.ts` per Stack |
| Cross-stack parity | All Stacks MUST use identical string values for shared keys |

---

## 9. Decision Record IDs

| Rule | Value |
|------|-------|
| Format | `DR-NNN` (zero-padded to 3 digits) |
| Uniqueness | IDs MUST NOT be reused, even when superseded |
| Sequence | Sequential, starting at `DR-001` |
| Current next ID | `DR-008` |

---

## 10. Step Definition Text

| Rule | Value |
|------|-------|
| Tense | Present simple |
| Voice | Active |
| Parameter placeholders | `{int}`, `{string}`, `{word}`, `{float}` — no inline values |
| Over-specification | Steps must not name specific endpoints, literal values, or field names inline |
| Algorithm names | Always quoted with Title Case: `the "Unit Completion" algorithm` |

---

## 11. Enforcement

| Convention category | Enforcement mechanism |
|--------------------|----------------------|
| TypeScript identifiers (classes, methods, constants) | ESLint `@typescript-eslint/naming-convention` in `eslint.config.js` |
| TypeScript single-letter variables | ESLint rule (configured) |
| DOCS file names, Gherkin, JSON keys | Convention-only — enforced via code review |
| Memory key string-equals-constant rule | Code review + parity contract check |
| Decision Record IDs | Maintained manually in `DECISION_REGISTER.md` |
