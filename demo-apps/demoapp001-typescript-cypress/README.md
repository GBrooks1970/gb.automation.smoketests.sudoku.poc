# DEMOAPP001: TypeScript + Node.js Implementation

> **TypeScript/Node.js implementation of the tech-agnostic Sudoku Solver specification**

**Version:** v1.0
**Date:** 2026-01-30T20:00:00Z

This demo application implements the [Sudoku Solver Design Specification](../../DOCS/.design/sudoku-solver-specification.md) using TypeScript and Node.js, demonstrating clean architecture principles and modern JavaScript development practices.

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Language** | TypeScript | 5.x | Type-safe JavaScript with compile-time checks |
| **Runtime** | Node.js | 24 LTS | JavaScript runtime environment |
| **Compiler** | TypeScript Compiler (tsc) | 5.x | Transpiles TypeScript to JavaScript |
| **Dev Runner** | ts-node | 10.x | Direct TypeScript execution for development |
| **Module System** | CommonJS | ES2020 | Node.js module compatibility |
| **Testing** | Gherkin/BDD | - | Behavior-driven test specifications |
| **Package Manager** | npm | - | Dependency management |

---

## Quick Start

### Prerequisites

- Node.js 24 LTS
- npm (comes with Node.js)

### Installation & Running

```bash
# 1. Navigate to this demo app
cd demo-apps/demoapp001-typescript-cypress

# 2. Install dependencies
npm ci

# 3. Run the solver
npm start
```

### CLI Options

```bash
# Show help
npm start -- --help

# Enforce max runtime in milliseconds
npm start -- --timeout 10000
npm start -- --timeout=10000
```

Exit code contract:
- `0` when all puzzles finish with `SOLVED`
- `1` when any puzzle returns `STUCK_ON_ADVANCED_LOGIC`, timeout is exceeded, or an input/runtime error occurs

**Expected Output:**
```
===========================================
    SUDOKU SOLVER - Basic Algorithm Demo
===========================================

Loaded 4 puzzles from puzzles.json
Available puzzles: Easy Scan Grid, Logic Squeeze Grid, Minimal Clues, Empty Grid

>>> Solving ALL puzzles...

[EASY] Solvable with basic techniques
Initial Puzzle:
-------------------------
| 5 3 . | . 7 . | . . . |
...
Result: SOLVED
```

---

## Project Structure

```
demoapp001-typescript-cypress/
├── app_src/                          # TypeScript source code
│   ├── index.ts                      # Entry point - orchestrates solving workflow
│   ├── SudokuSolver.ts               # Core solving algorithms (3 techniques)
│   ├── SudokuOrchestrator.ts         # Coordinates algorithm execution strategy
│   ├── SudokuCLI.ts                  # Terminal display and user interface
│   └── PuzzleLoader.ts               # Loads and validates puzzles from JSON
│
├── tests/                            # Test specifications
│   └── features/
│       └── BasicSudokuSolverLogic.feature # Gherkin/BDD test scenarios
│
├── dist/                             # Compiled JavaScript output (generated)
│
├── puzzles.json                      # Test puzzle collection
├── package.json                      # npm dependencies and scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── README.md                         # This file
```

---

## Architecture Overview

This implementation follows the **Single Responsibility Principle** with four main components:

```
┌─────────────────┐
│  PuzzleLoader   │  Loads puzzles.json and validates structure
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SudokuSolver   │  Contains the 3 solving algorithms
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SudokuOrchestrator │  Coordinates algorithm execution order
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SudokuCLI     │  Renders grid to terminal
└─────────────────┘
```

### Component Responsibilities

#### 1. PuzzleLoader ([PuzzleLoader.ts](app_src/PuzzleLoader.ts))

**Purpose:** Load and validate Sudoku puzzles from JSON files.

**Key Methods:**
- `getAllPuzzles()` - Returns all loaded puzzles
- `getPuzzleByName(name)` - Retrieves specific puzzle by name
- `getPuzzlesByDifficulty(level)` - Filters puzzles by difficulty
- `getPuzzleByIndex(index)` - Gets puzzle by position

**Features:**
- Validates grid dimensions (9×9)
- Validates cell values (0-9)
- Throws descriptive errors for invalid data

#### 2. SudokuSolver ([SudokuSolver.ts](app_src/SudokuSolver.ts))

**Purpose:** Implement the three fundamental solving techniques.

**State:**
- `origGrid` - Immutable copy of original puzzle
- `grid` - Working copy modified during solving

**Public Methods:**
| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `unitCompletion()` | None | boolean | Fills units with one empty cell |
| `hiddenSingles(digit)` | number (1-9) | boolean | Places digit in blocks where it has one valid location |
| `nakedSingles()` | None | boolean | Fills cells with only one candidate |
| `getGrid()` | None | number[][] | Deep-copy snapshot of the working grid (v1.0 `getGrid` operation) |

**Returns:** `true` if at least one cell was modified, `false` otherwise (algorithm methods)

**Implementation Details:**
- Deep copies original grid to preserve immutability
- Each algorithm is independently callable for unit testing
- Helper methods for row/column/block validation

**Grid access policy:** prefer `getGrid()` wherever access is read-only — it
returns a deep copy that can never alter solver state. The public `grid`
member is retained for compatibility (test fixtures use it to compose grid
states), but mutating it directly from outside the solver is **deprecated**:
external mutation bypasses the solving algorithms and the audit trail.

#### 3. SudokuOrchestrator ([SudokuOrchestrator.ts](app_src/SudokuOrchestrator.ts))

**Purpose:** Coordinate algorithm execution in optimal order.

**Solving Strategy:**
```
LOOP until no progress:
  1. Try Unit Completion (fastest)
  2. Try Hidden Singles for digits 1-9 (medium speed)
  3. Try Naked Singles (slowest, most thorough)

  If no algorithm made changes → EXIT

Return "SOLVED" or "STUCK_ON_ADVANCED_LOGIC"
```

**Key Method:**
- `solve()` - Returns `"SOLVED"` or `"STUCK_ON_ADVANCED_LOGIC"`

#### 4. SudokuCLI ([SudokuCLI.ts](app_src/SudokuCLI.ts))

**Purpose:** Handle terminal display and user interface.

**Key Methods:**
- `displayGrid()` - Renders 9×9 grid with block separators
- `run()` - Executes the full solve-and-display workflow

**Display Format:**
```
--Puzzle Name----
-------------------------
| 5 3 . | . 7 . | . . . |
| 6 . . | 1 9 5 | . . . |
| . 9 8 | . . . | . 6 . |
-------------------------
...
```

---

## npm Scripts

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm start` | Run solver with ts-node | Development (fastest) |
| `npm run start:api` | Run Express REST API with ts-node | API development |
| `npm run build` | Compile TypeScript to JavaScript | Prepare for production |
| `npm run run` | Run compiled JavaScript | Production execution |
| `npm run test:api` | Run REST API integration checks | API validation |

---

## Configuration Files

### `tsconfig.json` - TypeScript Compiler Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",           // Modern JavaScript features
    "module": "commonjs",          // Node.js compatibility
    "outDir": "./dist",            // Compiled output directory
    "rootDir": "./app_src",        // Source directory
    "strict": true,                // Strict type checking
    "esModuleInterop": true,       // Better CommonJS/ES module interop
    "skipLibCheck": true,          // Skip type checking of .d.ts files
    "forceConsistentCasingInFileNames": true
  },
  "include": ["app_src/**/*", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

### `package.json` - Dependencies

```json
{
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.0.0",     // Node.js type definitions
    "ts-node": "^10.9.0",         // TypeScript execution
    "typescript": "^5.0.0"        // TypeScript compiler
  }
}
```

---

## Puzzle Data Format

Puzzles are stored in `puzzles.json`:

```json
{
  "puzzles": [
    {
      "name": "Easy Scan Grid",
      "difficulty": "easy",
      "description": "Solvable with basic techniques",
      "grid": [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        // ... 9 rows total, each with 9 values
      ]
    }
  ]
}
```

**Grid Format:**
- **9×9 array** of integers
- **0** = empty cell
- **1-9** = filled cell with that digit

### Included Test Puzzles

| Name | Difficulty | Expected Result | Description |
|------|------------|-----------------|-------------|
| Easy Scan Grid | easy | SOLVED | Tests Unit Completion and Hidden Singles |
| Logic Squeeze Grid | medium | SOLVED | Requires all three techniques |
| Minimal Clues | hard | STUCK | 17 clues - requires advanced techniques |
| Empty Grid | test | STUCK | Test case for failure detection |

---

## Adding New Puzzles

1. Open `puzzles.json`
2. Add a new object to the `puzzles` array:
   ```json
   {
     "name": "My Custom Puzzle",
     "difficulty": "medium",
     "description": "Optional description",
     "grid": [
       [0, 0, 0, 0, 0, 0, 0, 0, 0],
       // ... 8 more rows
     ]
   }
   ```
3. Run `npm start` to test your puzzle

---

## Testing

### Test Specifications

Test scenarios are defined in [BasicSudokuSolverLogic.feature](tests/features/BasicSudokuSolverLogic.feature) using Gherkin syntax (BDD).

**Test Coverage:**
- ✅ Unit Completion (rows, columns, blocks)
- ✅ Hidden Singles (rows, columns, blocks)
- ✅ Naked Singles
- ✅ Orchestration logic
- ✅ PuzzleLoader functionality
- ✅ Grid initialization
- ✅ Integration tests
- ✅ Edge cases

**Total Scenarios:** 35+ comprehensive test cases

**Example Scenario:**
```gherkin
Scenario: Complete a row with only one missing value
  Given a row contains the values [1, 2, 0, 4, 5, 6, 7, 8, 9]
  When the "Unit Completion" algorithm scans the row
  Then the system should identify the missing value as 3
  And the value 3 should be placed in the empty cell
```

---

## TypeScript-Specific Implementation Notes

### Type Safety

All grid operations are strongly typed:

```typescript
interface Puzzle {
    name: string;
    difficulty: string;
    description: string;
    grid: number[][];
}

interface CellCoordinate {
    row: number;
    col: number;
}
```

### Deep Copy Implementation

The solver creates a deep copy to preserve the original grid:

```typescript
constructor(
  public readonly name: string,
  public readonly origGrid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))
) {
  // Deep copy the original grid to the working grid
  this.grid = origGrid.map(row => [...row]);
}
```

### Error Handling

The PuzzleLoader validates data and throws descriptive errors:

```typescript
if (!puzzle.grid || puzzle.grid.length !== 9) {
    throw new Error(`Puzzle "${puzzle.name}" must have exactly 9 rows`);
}
```

---

## Known Limitations

As per the design specification:

1. **Hidden Singles**: Current implementation only checks 3×3 blocks, not rows or columns
   - **Impact:** May miss some hidden singles in rows/columns
   - **Status:** Documented in [sudoku-basic-solver.md](../../DOCS/.algorithm/sudoku-basic-solver.md)

2. **No Advanced Techniques**: Cannot solve puzzles requiring Naked Pairs, X-Wing, etc.
   - **By Design:** This is intentional to keep the solver simple and educational

3. **No Test Runner**: Feature file exists but Cucumber/Jest integration not configured
   - **Status:** Planned enhancement

---

## Future Enhancements

Based on the design documents in `/DOCS`:

### 1. Audit Trail Feature ([audit-trail-feature.md](../../DOCS/.design/audit-trail-feature.md))

**Status:** Design complete, implementation pending

**Features:**
- Log every cell change with algorithm attribution
- Export to JSON file
- Console output (summary and detailed modes)
- Performance statistics

**Example Output:**
```json
{
  "puzzleName": "Easy Scan Grid",
  "status": "SOLVED",
  "totalChanges": 51,
  "events": [
    {
      "eventId": 1,
      "algorithm": "UnitCompletion",
      "cellChanges": [{"row": 0, "col": 2, "oldValue": 0, "newValue": 4}]
    }
  ]
}
```

### 2. REST API Wrapper ([rest-api-wrapper.md](../../DOCS/.design/rest-api-wrapper.md))

**Status:** Implemented

**Features:**
- Express.js REST API
- Individual endpoints for each technique
- Full solve endpoint
- JSON request/response with deltas
- Puzzle list/get endpoints
- Grid validation endpoint

**Endpoints:**
- `POST /api/techniques/unit-completion`
- `POST /api/techniques/hidden-singles`
- `POST /api/techniques/naked-singles`
- `POST /api/solve`
- `GET /api/puzzles`
- `GET /api/puzzles/:name`
- `POST /api/validate`

---

## Development Workflow

### Building for Production

```bash
npm run build   # Transpiles TypeScript to dist/
```

Generated JavaScript can be run with:
```bash
node dist/index.js
```

### Type Checking

```bash
npx tsc --noEmit   # Check types without compiling
```

### File Watching (Development)

For automatic recompilation on file changes:
```bash
npx tsc --watch
```

---

## Troubleshooting

### Issue: `ts-node: command not found`

**Solution:** Install dependencies:
```bash
npm ci
```

### Issue: Module resolution errors

**Solution:** Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Issue: Grid not displaying correctly

**Cause:** Original grid not being copied to working grid

**Check:** `SudokuSolver` constructor properly deep-copies the grid

---

## References

- [Parent README](../../README.md) - Repository overview
- [Design Specification](../../DOCS/.design/sudoku-solver-specification.md) - Tech-agnostic spec
- [Algorithm Details](../../DOCS/.algorithm/sudoku-basic-solver.md) - Algorithm explanations
- [Test Scenarios](tests/features/BasicSudokuSolverLogic.feature) - BDD test specifications

---

## Questions or Issues?

- Check the [tech-agnostic specification](../../DOCS/.design/sudoku-solver-specification.md) first
- Review [algorithm documentation](../../DOCS/.algorithm/sudoku-basic-solver.md) for technique details
- Examine the [test scenarios](tests/features/BasicSudokuSolverLogic.feature) for expected behaviors

---

## License

This TypeScript stack is part of the repository's [ISC-licensed](../../LICENSE) original project
material. npm dependencies retain their respective licence terms.
