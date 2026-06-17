# Naming Conventions

**Project:** gb.automation.smoketests.sudoku.poc
**Last Updated:** 2026-06-17 (SUD-12 / BACKLOG-046 - root README content-formatting exception recorded; review Risk 3)
**Status:** Adopted
**Governed by:** `reference-architecture.md` §10.9
**Template:** `DOCS/.templates/naming-conventions.template.md`
**Authoritative for:** All Stacks, all document types, all code in this repository

> This document is the single source of truth for naming decisions.
> When a conflict arises between this document and any other source (code comments, AI memory, prior convention assumptions), this document wins.
> Deviations from stated conventions MUST be recorded in `decision-register.md`.

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
| DOCS subdirectories | dot + `kebab-case` | `.design/`, `.planning/`, `.architecture/`, `.templates/`, `.implementation-logs/` |
| DOCS document files | `kebab-case.md` (DR-020) | `audit-trail-feature.md`, `reference-architecture.md` |
| Feature files | `PascalCase` | `BasicSudokuSolverLogic.feature` |
| Screenplay Memory keys | `UPPER_SNAKE_CASE` (constant name = string value) | `SOLVE_RESULT = 'SOLVE_RESULT'` |
| Screenplay component classes | `PascalCase` verb/noun phrase | `UseSudokuSolver`, `SolvePuzzle` |
| Decision Record IDs | `DR-NNN` (zero-padded, sequential) | `DR-001`, `DR-042` |
| Stack filesystem directories | `kebab-case` | `demo-apps/`, `demoapp001-typescript-cypress/` |
| Stack canonical name (metrics, parity) | `UPPER_SNAKE_CASE` | `DEMOAPP001_TYPESCRIPT_CYPRESS` |

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
| DOCS type-specific subdirectories | dot + `kebab-case` | Hyphen | `.analysis/`, `.design/`, `.planning/`, `.algorithm/`, `.architecture/`, `.templates/`, `.implementation-logs/`, `.review/`, `.howto/` |
| Stack group container directory | `kebab-case` | Hyphen | `demo-apps/` |
| Stack directory (filesystem) | `kebab-case` | Hyphen | `demoapp001-typescript-cypress/` |

> **Decision DR-001:** The leading dot on DOCS subdirectories is the project-local convention, a documented divergence from the Reference Architecture.
> **Decision DR-019:** The dot-prefix convention (DR-001) is extended to ALL DOCS type-specific subdirectories without exception. No plain-name subdirectories exist. Bridge directories (`planning/`, `design/`) removed. `architecture/`, `templates/`, and `implementation-logs/` renamed to `.architecture/`, `.templates/`, `.implementation-logs/`. Supersedes DR-013 and DR-017.
> **Decision DR-016:** Stack filesystem directories use `kebab-case`. The canonical Stack name (used in metrics and parity docs) is separate and remains `UPPER_SNAKE_CASE` — see Section 4.
> `app_src/` is grandfathered as-is. Future source folders should use `kebab-case` (e.g., `app-api/`).

---

## 4. Stack Names

The **canonical Stack name** is an identifier, not a filesystem path. It is used in metrics output, Memory key prefixes, parity documentation, the AI Agent Instruction File, and Stack tags. It MUST NOT be confused with the Stack's filesystem directory name (Section 3).

| Rule | Value |
|------|-------|
| Format | `UPPER_SNAKE_CASE` |
| Pattern | `DEMOAPP[NNN]_[LANGUAGE]_[FRAMEWORK]` |
| Uniqueness | Must be unique across the repository |
| Allowed characters | A–Z, 0–9, underscore |
| Current canonical names | `DEMOAPP001_TYPESCRIPT_CYPRESS`, `DEMOAPP002_PYTHON_PYTEST`, `DEMOAPP003_CSHARP_SPECFLOW` |

**Directory vs. canonical name (DR-016):**

| Element | Convention | Example |
|---------|-----------|---------|
| Filesystem directory name | `kebab-case` (Section 3) | `demo-apps/demoapp003-csharp-specflow/` |
| Canonical Stack name | `UPPER_SNAKE_CASE` (this section) | `DEMOAPP003_CSHARP_SPECFLOW` |
| Short Stack identifier (metrics) | `UPPER_SNAKE_CASE`, prefix of canonical name | `DEMOAPP003` |
| Stack tag (Gherkin) | `@stack-[lowercase-short-id]` | `@stack-demoapp003` |

The filesystem directory and the canonical name are separate concerns. A contributor working on the filesystem sees `demoapp003-csharp-specflow/`; a contributor reading metrics, Memory keys, or parity contracts sees `DEMOAPP003_CSHARP_SPECFLOW`.

---

## 5. Documentation Files (DOCS/)

All authored document filenames use `kebab-case.md` (DR-020). Three permanent exceptions where tooling locks the filename: `README.md`, `CHANGELOG.md`, `CLAUDE.md`. Generated artefacts in `.results/` are exempt.

| Document type | Pattern (DR-020) | Example |
|---------------|-----------------|---------|
| Design documents | `feature-name.md` | `audit-trail-feature.md` |
| Analysis documents | `DOCS/.analysis/analysis-topic-YYYYMMDD.md` | `analysis-docs-subdirectory-cleanup-20260516.md` |
| Algorithm documents | `domain-name.md` | `sudoku-basic-solver.md` |
| How-to guides | `verb-subject.md` | `debug-sudoku-solver.md` |
| Implementation logs | `YYYY-MM-DD_short-session-topic.md` (DR-017) | `2026-01-30_initial-project-creation.md` |
| Planning / TODO docs | `todo-feature-name.md` | `todo-audit-trail-feature.md` |
| Templates | `kebab-purpose.template.md` | `decision-record.template.md` |
| Code review output dirs | `CODE_REVIEW_[AGENT]_v[N]_[UTC]/` | `CODE_REVIEW_CLAUDE_SONNET_v1_20260513T2217Z/` |

**Permanent exceptions (fixed filename, tooling dependency):**

| File | Reason |
|------|--------|
| `README.md` | GitHub/npm ecosystem — rendered automatically by exact name |
| `CHANGELOG.md` | CI tooling (standard-version, semantic-release) generates this exact filename |
| `CLAUDE.md` | Anthropic Claude Code tooling looks up by exact name |

### 5.1 Root README content-formatting exception

The three exceptions above concern the *filename* only. There is one governed exception covering
document *content* as well:

| Document | Exception | Rationale |
|----------|-----------|-----------|
| Root `README.md` | May use rich formatting — emoji status glyphs (e.g. ✅, ⬜) and Unicode box-drawing characters in diagrams — in deliberate departure from the ASCII-only expectation that applies to all other authored docs | It is the project's primary human-facing / GitHub-landing document; GitHub renders these glyphs natively and they aid quick visual scanning for first-time readers |

All **other** authored documents under `DOCS/` and the repository root remain ASCII text with
kebab-case filenames per DR-020 (and the dot + kebab-case subdirectory rule, DR-019). This exception
is scoped to the root `README.md` alone; it does not extend to design, architecture, planning,
analysis, how-to, algorithm, template, or decision-register documents, which stay ASCII so they
remain diff-friendly, grep-stable, and portable across editors and CI runners.

This records the README's known divergence (raised as Risk 3 in the CLAUDE_Opus_4_8 v1 code review)
as an intentional, governed exception rather than an inconsistency, so the README and this document
no longer contradict each other. No new decision record is required: DR-020 already reserves the
README as an exception surface; this entry states the content-formatting scope of that exception.

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
| Current next ID | `DR-033` |

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
| Decision Record IDs | Maintained manually in `decision-register.md` |
