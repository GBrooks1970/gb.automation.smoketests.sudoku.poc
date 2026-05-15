# CLAUDE.md - AI Assistant Guide

This document provides essential context for AI assistants working with this repository.

## Project Overview

**gb.automation.smoketests.sudoku.poc** is a TypeScript-based Sudoku solver application designed as a pedagogical tool for test automation. It implements three fundamental solving techniques and serves as a reference implementation for demonstrating clean architecture, testing patterns, and algorithm design.

### Purpose
- Demonstrate TypeScript application architecture
- Provide a testable codebase for automation testing practice
- Educational resource for understanding Sudoku solving algorithms

## Repository Structure

```
gb.automation.smoketests.sudoku.poc/
├── DEMOAPPS/
│   └── DEMOAPP001_TYPESCRIPT_CYPRESS/
│       ├── app_src/                    # TypeScript source files
│       │   ├── index.ts                # Entry point - orchestrates puzzle loading and solving
│       │   ├── SudokuSolver.ts         # Core solving algorithms (3 techniques)
│       │   ├── SudokuOrchestrator.ts   # Coordinates solving strategy
│       │   ├── SudokuCLI.ts            # Terminal interface and display
│       │   └── PuzzleLoader.ts         # Loads puzzles from JSON files
│       ├── tests/
│       │   ├── features/
│       │   │   └── BasicSudokuSolverLogic.feature  # Stack-local Gherkin test scenarios
│       │   └── screenplay/               # Screenplay Pattern layer (BDD automation)
│       │       ├── abilities/             # Actor capabilities (what actors can do)
│       │       ├── actors/                # Actor definitions and personas
│       │       ├── questions/             # Questions (state queries for assertions)
│       │       ├── step_definitions/      # Gherkin step definitions (*.steps.ts)
│       │       ├── support/               # Screenplay runtime support and memory keys
│       │       └── tasks/                 # Tasks (what actors do in each step)
│       ├── cucumber.js                # Cucumber.js configuration for test runner
│       ├── puzzles.json                # Collection of test puzzles
│       ├── package.json                # Node.js dependencies and scripts
│       └── tsconfig.json               # TypeScript configuration
├── features_shared/
│   └── util-tests/sudoku-solver/
│       └── BasicSudokuSolverLogic.feature  # Canonical Gherkin feature file (multi-Stack)
├── DOCS/
│   ├── templates/                      # v1.2-compliant document templates (Appendix A)
│   │   ├── *.template.md               # Lowercase template filenames per v1.2 contract
│   │   │   ├── readme.template.md
│   │   │   ├── backlog.template.md
│   │   │   ├── decision-record.template.md
│   │   │   ├── code-review.template.md
│   │   │   └── ... (14 total templates)
│   │   └── TEMPLATE_*.md               # Legacy uppercase filenames (retained for transition)
│   ├── .design/                        # Design documents (dot-prefix convention)
│   │   ├── README.md
│   │   ├── DESIGN_*.md
│   │   └── ANALYSIS_*.md
│   ├── .implementation/                # Implementation logs and session records
│   │   ├── README.md
│   │   └── IMPL_LOG_*.md
│   ├── .planning/                      # Project planning and backlog
│   │   ├── README.md
│   │   └── BACKLOG.md                  # Single source of truth for parity-gap work
│   ├── .review/                        # Code review outputs (dot-prefix convention)
│   │   ├── README.md
│   │   ├── code-review-template.md
│   │   └── CODE_REVIEW_*__*/           # Review bundle directories
│   ├── .algorithm/                     # Language-agnostic algorithm documentation
│   │   ├── README.md
│   │   └── ALGORITHM_*.md
│   ├── REFERENCE_ARCHITECTURE.md       # v1.2 reference baseline (authoritative)
│   ├── ref-arch-alignment_*.md         # Compliance analysis documents
│   └── README.md
├── DECISION_REGISTER.md                # Immutable decision record (DR-001 through DR-011)
├── BACKLOG.md                          # [LEGACY] Redirects to DOCS/.planning/BACKLOG.md
├── CHANGELOG.md                        # Project changelog
├── CLAUDE.md                           # AI assistant guide (this file)
├── README.md                           # Project README
└── .gitignore
```

## Tech Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 16+
- **Transpilation**: ts-node (development), tsc (production build)
- **Target**: ES2020, CommonJS modules

## Development Commands

All commands must be run from the demo app directory:

```bash
cd DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS
```

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Run solver with ts-node (development) |
| `npm run build` | Compile TypeScript to JavaScript (outputs to dist/) |
| `npm run run` | Run compiled JavaScript from dist/ |

## Architecture Patterns

### Single Responsibility Principle
Each class has one responsibility:
- **SudokuSolver**: Contains solving algorithms only
- **SudokuOrchestrator**: Coordinates algorithm execution order
- **SudokuCLI**: Handles terminal display only
- **PuzzleLoader**: Handles data loading and validation only

### Class Relationships
```
PuzzleLoader → loads → Puzzle[]
                           ↓
                    SudokuSolver
                           ↓
                  SudokuOrchestrator
                           ↓
                      SudokuCLI
```

## Solving Algorithms

The solver implements three techniques applied in order of efficiency:

1. **Unit Completion** (`SudokuSolver.unitCompletion()`)
   - Fills cells in rows/columns/blocks with only one empty space
   - Complexity: O(n) per unit
   - Location: `app_src/SudokuSolver.ts:24`

2. **Hidden Singles** (`SudokuSolver.hiddenSingles(target)`)
   - Finds where a digit must go within a row, column, or 3x3 block
   - Called 9 times (once per digit 1-9)
   - Location: `app_src/SudokuSolver.ts:80`
   - **Note**: Current implementation only checks blocks, not rows/columns

3. **Naked Singles** (`SudokuSolver.nakedSingles()`)
   - Finds cells that can only contain one digit by elimination
   - Complexity: O(n²)
   - Location: `app_src/SudokuSolver.ts:112`

### Solver Return Values
- `"SOLVED"` - Puzzle completely solved
- `"STUCK_ON_ADVANCED_LOGIC"` - Basic techniques insufficient

## Key Interfaces and Types

```typescript
// Puzzle structure (from PuzzleLoader.ts)
interface Puzzle {
    name: string;
    difficulty: string;
    description: string;
    grid: number[][];  // 9x9 array, 0 = empty cell
}

// Grid representation
// - 9x9 number array
// - Values 1-9 are filled cells
// - Value 0 represents empty cells
```

## File Conventions

### Naming
- Classes use PascalCase: `SudokuSolver`, `PuzzleLoader`
- Files match their primary class: `SudokuSolver.ts`
- Test files use `.feature` extension for Gherkin specs

### Code Style
- Strict TypeScript (`strict: true` in tsconfig)
- JSDoc comments for public methods
- Helper methods are private

## Puzzle Data Format

Puzzles are stored in `puzzles.json`:

```json
{
  "puzzles": [
    {
      "name": "Easy Scan Grid",
      "difficulty": "easy",
      "description": "Description text",
      "grid": [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        // ... 9 rows total
      ]
    }
  ]
}
```

### Available Test Puzzles
| Name | Difficulty | Expected Result |
|------|------------|-----------------|
| Easy Scan Grid | easy | SOLVED |
| Logic Squeeze Grid | medium | SOLVED |
| Minimal Clues | hard | SOLVED |
| Crosshatch Challenge | medium | SOLVED |
| Empty Grid | test | STUCK_ON_ADVANCED_LOGIC |

## Testing Approach

Tests are specified in Gherkin format at:
`DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/BasicSudokuSolverLogic.feature`

Test categories include:
- Unit Completion algorithm tests
- Hidden Singles algorithm tests
- Naked Singles algorithm tests
- Constraint validation tests
- Orchestration/main loop tests
- PuzzleLoader tests
- Grid initialization tests
- Integration tests
- Edge cases and error handling

## Planned Features

### Audit Trail Feature (Design Complete)
Design document: `DOCS/.design/DESIGN_Audit_Trail_Feature.md`

Will add:
- Logging of every cell change during solving
- Algorithm attribution for each change
- JSON export of solving process
- Statistics on algorithm effectiveness

Files to be created:
- `app_src/audit/AuditLogger.ts`
- `app_src/audit/AuditTypes.ts`
- `app_src/audit/AuditFormatter.ts`

## Stack Inventory

| Stack name | Language | Framework | Surface type | Entry point |
|-----------|----------|-----------|-------------|-------------|
| `DEMOAPP001_TYPESCRIPT_CYPRESS` | TypeScript 5.x | Cucumber.js v12 + ts-node | `@util` (in-process class testing) | `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` |

Future stacks (not yet implemented):
- Python Stack — `pytest-bdd`, `@util` surface, Sprint 4
- C# Stack — SpecFlow, `@util` surface, Sprint 5

---

## Canonical Feature Update Procedure

When adding or modifying a Gherkin scenario, follow these steps in order:

1. Update or create the feature file in `features_shared/util-tests/sudoku-solver/` (the Canonical Feature Store — **not** inside the Stack directory).
2. Copy the updated file to `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/features/` (the Stack-local copy).
3. Add Stack-specific tags to the local copy only (e.g., `@stack-demoapp001`). Do **not** add Stack tags to the canonical file.
4. Implement or update step definitions in `tests/screenplay/step_definitions/` to cover any new steps.
5. Run `npm test` — all existing scenarios must remain green.
6. If a scenario cannot yet be implemented, tag it `@pending` in the local copy and add a backlog item to `BACKLOG.md`.
7. If the change represents a structural decision, record it in `DECISION_REGISTER.md` before marking the work complete.

> **Note:** `features_shared/` was created in Phase 1 (DR-007). The canonical file is `features_shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`. The Stack-local copy is `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/features/BasicSudokuSolverLogic.feature`.

---

## Risk Register

Known fragile areas. Check these before making changes.

| Risk | Area | What to check |
|------|------|--------------|
| Step definition coupling | `tests/screenplay/step_definitions/*.steps.ts` | These are TypeScript source files compiled via ts-node at test runtime. Each .steps.ts file defines step definitions for a feature domain. Any changes must be made to the .ts source; do not edit generated files. Verify all step definitions match canonical feature file after changes. |
| Grid deep-copy assumption | `SudokuSolver` constructor | The `grid` property is a deep copy of `origGrid`. Any code that passes a grid reference instead of a copy will silently mutate the original puzzle. Always verify deep-copy semantics when changing the constructor or factory method. |
| Hidden Singles — all three units | `SudokuSolver.hiddenSingles()` | The algorithm now checks rows, columns, AND blocks. Earlier code reviews flagged it as blocks-only. Verify the row and column loops are intact after any change to this method. |
| Memory key parity | `tests/screenplay/support/memory-keys.ts` | Constant names MUST equal their string values exactly (e.g., `SOLVE_RESULT = 'SOLVE_RESULT'`). This rule is non-negotiable per DECISION_REGISTER.md and Reference Architecture v1.2 §8. Use grep to verify parity when adding new memory keys. |
| Over-specified step text | `BasicSudokuSolverLogic.feature` | Several steps contain inline array literals. These cannot be shared across Stacks without modification. See NEW-012 in BACKLOG.md. |
| Feature file sync | `features_shared/util-tests/sudoku-solver/` + `tests/features/` | Two files must stay in sync. Always update the canonical file first, then propagate to the Stack-local copy. Do NOT edit the Stack-local copy directly for content changes. Tag additions (`@stack-*`) in the local copy only. |

---

## v1.2 Parity Rules Summary

**Governed by:** Reference Architecture v1.2 (adopted via DR-009, 2026-05-15)

Per RA v1.2 §8 (Multi-Stack Orchestration), the following rules apply across all Stacks (DEMOAPP001_TYPESCRIPT_CYPRESS and future Stack 2, Stack 3):

| Rule | Applies To | Reference |
|------|-----------|-----------|
| **Decision Register Supremacy** | All Stacks | DR-XXX entries supersede any restatement elsewhere. DECISION_REGISTER.md is authoritative. |
| **Template Filename Contract** | All Stacks | Appendix A (RA v1.2): All templates named as lowercase `*.template.md` (e.g., `readme.template.md`, `backlog.template.md`). |
| **Backlog Status Taxonomy** | All Stacks | §10.1: Status values are exactly `Open`, `In Progress`, or `Resolved`. No emoji or mixed terminology. Single source of truth at BACKLOG.md. |
| **Review Output Shape** | All Stacks | §10.7: Code reviews follow multi-file bundle with 7 required sections (00_INDEX through 07_MIGRATION_PLANS). Naming: `CODE_REVIEW_{Reviewer}__{YYYYMMDDTHHMMZ}/`. |
| **Memory Key Parity** | All Stacks | §8: Screenplay memory key constant names MUST equal string values exactly. Enables safe refactoring across language boundaries. |
| **Orchestration Archival** | All Stacks | §9.3: Markdown metric summaries are preserved during cleanup; log files removed per retention policy. |
| **Directory Conventions** | All Stacks | §5.2: Dot-prefix for DOCS subdirectories (DOCS/.review/, DOCS/.design/, etc.). User-facing deliverables at root or top-level DOCS/. |

**Non-Normative Latitude (MAY-level):**
- Review directory placement: RA v1.2 shows example at root `.review/` but DOCS/.review/ is compliant per §10.7 MAY-level latitude. Current Stack 1 uses DOCS/.review/ per DR-010. Stacks 2+ can diverge per documented decision.

---

## Authoritative References

> When a rule in this file conflicts with a rule in `DECISION_REGISTER.md`, `DECISION_REGISTER.md` wins.

| Document | Authority for |
|----------|--------------|
| `DECISION_REGISTER.md` | All structural and process decisions — supersedes any restatement here. Current: DR-001 through DR-011. |
| `DOCS/REFERENCE_ARCHITECTURE.md` | The v1.2 reference standard for all Stacks. Adopted via DR-009 (2026-05-15). |
| `DOCS/.planning/BACKLOG.md` | Multi-Stack parity work tracking. Single source of truth for Open/In Progress/Resolved items. Status taxonomy per v1.2 §10.1. |
| `DOCS/templates/` | v1.2-compliant template definitions. Lowercase filenames per Appendix A (readme.template.md, backlog.template.md, etc.). |

---

## Common Tasks for AI Assistants

### Adding a New Puzzle
1. Edit `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/puzzles.json`
2. Add puzzle object with name, difficulty, description, and 9x9 grid
3. Run `npm start` to test

### Adding a New Solving Algorithm
1. Add method to `SudokuSolver` class
2. Integrate into `SudokuOrchestrator.solve()` loop
3. Add corresponding test scenarios to feature file
4. Update algorithm documentation in `DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md`

### Modifying Display Output
- Edit `SudokuCLI.ts` - all terminal output is handled here
- `displayGrid()` renders the 9x9 grid
- `run()` orchestrates the solve and output flow

## Known Limitations

1. **No Advanced Techniques**: Cannot solve puzzles requiring Naked Pairs, X-Wing, etc.
2. **No Backtracking**: Does not implement trial-and-error for hard puzzles
3. **No Screenplay Layer**: Step definitions are procedural (`SudokuWorld`); Screenplay migration is designed but not yet implemented (see `BACKLOG.md` NEW-007 through NEW-011)

## Git Workflow

- Main development happens on feature branches
- Commit messages should be descriptive
- No CI/CD pipeline currently configured

## Important Notes

- The `origGrid` property in SudokuSolver preserves the original puzzle state
- The `grid` property is the working copy that gets modified during solving
- Deep copies are used to prevent mutation of original data
- The solver is stateless between puzzle instances

---

## Design Documents

Comprehensive design documents for features, analysis reports, planning artifacts, and refactoring strategies are maintained in the [DOCS/.design](../DOCS/.design/) directory.

**Template:**
- [TEMPLATE_Design_Document.md](../DOCS/.design/TEMPLATE_Design_Document.md) - Comprehensive template for design/analysis/planning/refactor documents

**Document Types:**
- **Design Documents (DESIGN_*.md)** - Complete architectural and implementation designs
- **Analysis Documents (ANALYSIS_*.md)** - Problem investigation and research
- **Planning Documents (PLAN_*.md)** - Project planning and task breakdown
- **Refactoring Documents (REFACTOR_*.md)** - Detailed refactoring strategies

**When to Use:**
- Before implementing significant new features
- When refactoring major components
- For architectural changes affecting multiple parts
- When documenting complex algorithms or data structures
- For feasibility studies and technology evaluations

**Existing Design Documents:**
- [DESIGN_Sudoku_Solver_Specification.md](../DOCS/.design/DESIGN_Sudoku_Solver_Specification.md) - Core solver design (tech-agnostic)
- [DESIGN_Audit_Trail_Feature.md](../DOCS/.design/DESIGN_Audit_Trail_Feature.md) - Audit logging system
- [DESIGN_REST_API_Wrapper.md](../DOCS/.design/DESIGN_REST_API_Wrapper.md) - REST API specification

---

## Implementation Logs

Detailed implementation logs documenting development sessions, bugs fixed, and lessons learned are maintained in the [DOCS/.implementation](../DOCS/.implementation/) directory.

**Available Logs:**
- [IMPL_LOG_2026-01-30_Initial_Project_Creation.md](../DOCS/.implementation/IMPL_LOG_2026-01-30_Initial_Project_Creation.md) - Initial project setup, algorithm fixes, and documentation restructuring

---

## Code Reviews

A comprehensive code review template is available for conducting thorough reviews of the codebase. The template provides a structured approach for assessing design quality, identifying risks, and providing actionable recommendations.

**Template:**
- [code-review-template.md](../DOCS/.review/code-review-template.md) - Comprehensive code review framework for test automation projects

**Review Structure:**
- Role: Senior Test Automation Architect / Senior Software Engineer
- Deliverables: Executive summary, risks/issues, project reviews, cross-cutting analyses, recommendations, architecture assessment, migration plans
- Output: Structured markdown files in `DOCS/.review/CODE_REVIEW_{Reviewer}__{UTC_TIMESTAMP}/` directory

**When to Use:**
- Initial codebase assessment
- Pre-release quality checks
- Architecture reviews
- Post-implementation retrospectives
- Knowledge transfer to new team members

**Available Reviews:**
- [CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z](../DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/) - Comprehensive code review conducted 2026-01-30

---

## Project Planning

Project planning artifacts, including the product backlog, sprint plans, and roadmap documents are maintained in the [DOCS/.planning](../DOCS/.planning/) directory.

**Core Documents:**
- [BACKLOG.md](../DOCS/.planning/BACKLOG.md) - Product backlog with prioritized work items, sprint planning, and progress tracking
- [README.md](../DOCS/.planning/README.md) - Planning process guide and backlog management

**Backlog Structure:**
- **Current Sprint:** Active sprint backlog items
- **High Priority:** Critical items for next 1-4 sprints
- **Medium Priority:** Important items for next 3-6 sprints
- **Low Priority:** Nice-to-have items for later
- **Future Enhancements:** Ideas and long-term vision

**Status Indicators:**
- 🔴 Not Started - Item in backlog, not yet assigned
- 🟡 In Progress - Actively being worked on
- 🟢 Completed - Done and verified
- ⏸️ Blocked - Waiting on dependencies
- 📋 Planned - Future work, not prioritized
- 💡 Idea - Concept stage, needs design

**Workflow:**
1. Code reviews and design documents generate backlog items
2. Weekly backlog refinement prioritizes and estimates items
3. Bi-weekly sprint planning commits items to sprint
4. Completed items documented in implementation logs
5. Sprint retrospectives refine process and estimates

**Integration:**
- **From Code Reviews:** Risks and recommendations become backlog items
- **From Design Docs:** Approved designs become implementation backlog items
- **To Implementation Logs:** Completed backlog items documented with details
- **To Testing:** Acceptance criteria inform test scenarios
