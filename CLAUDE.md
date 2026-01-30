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
│       │   └── BasicSudokuSolverLogic.feature  # Gherkin test specifications
│       ├── puzzles.json                # Collection of test puzzles
│       ├── package.json                # Node.js dependencies and scripts
│       └── tsconfig.json               # TypeScript configuration
├── DOCS/
│   ├── .design/                        # Design documents directory
│   │   ├── README.md                   # Design documents guide
│   │   ├── TEMPLATE_Design_Document.md # Template for design/analysis/planning/refactor
│   │   ├── DESIGN_Sudoku_Solver_Specification.md  # Tech-agnostic specification
│   │   ├── DESIGN_Audit_Trail_Feature.md       # Design doc for audit trail feature
│   │   └── DESIGN_REST_API_Wrapper.md          # Design doc for REST API wrapper
│   ├── .implementation/                # Implementation logs directory
│   │   ├── README.md                   # Implementation logs guide
│   │   ├── TEMPLATE_Implementation_Log.md  # Template for new logs
│   │   └── IMPL_LOG_2026-01-30_Initial_Project_Creation.md
│   ├── .review/                        # Code review templates and outputs
│   │   ├── README.md                   # Code review directory guide
│   │   └── code-review-template.md     # Comprehensive code review template
│   └── ALGORITHM_Sudoku_Basic_Solver.md    # Algorithm documentation
├── README.md                           # Project README
├── CLAUDE.md                           # AI assistant guide (this file)
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
   - Finds where a digit must go within a 3x3 block
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
| Minimal Clues | hard | STUCK_ON_ADVANCED_LOGIC |
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

## Common Tasks for AI Assistants

### Adding a New Puzzle
1. Edit `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/puzzles.json`
2. Add puzzle object with name, difficulty, description, and 9x9 grid
3. Run `npm start` to test

### Adding a New Solving Algorithm
1. Add method to `SudokuSolver` class
2. Integrate into `SudokuOrchestrator.solve()` loop
3. Add corresponding test scenarios to feature file
4. Update algorithm documentation in `DOCS/ALGORITHM_Sudoku_Basic_Solver.md`

### Modifying Display Output
- Edit `SudokuCLI.ts` - all terminal output is handled here
- `displayGrid()` renders the 9x9 grid
- `run()` orchestrates the solve and output flow

## Known Limitations

1. **Hidden Singles**: Only checks 3x3 blocks, not rows/columns (incomplete implementation)
2. **No Advanced Techniques**: Cannot solve puzzles requiring Naked Pairs, X-Wing, etc.
3. **No Backtracking**: Does not implement trial-and-error for hard puzzles
4. **No Test Runner Configured**: Feature file exists but test framework not set up

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
