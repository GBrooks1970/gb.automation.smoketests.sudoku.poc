# gb.automation.smoketests.sudoku.poc
Sudoku Solver App with pedagogical test automation projects

## Overview

This repository demonstrates a TypeScript-based Sudoku solver implementing three fundamental solving techniques:

1. **Unit Completion** - Fills cells in rows/columns/blocks with only one empty space
2. **Hidden Singles** - Finds where a digit must go within a unit
3. **Naked Singles** - Finds cells that can only contain one digit

The implementation follows clean architecture principles with separated concerns:
- [SudokuSolver.ts](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuSolver.ts) - Core solving algorithms
- [SudokuOrchestrator.ts](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuOrchestrator.ts) - Coordinates solving strategy
- [SudokuCLI.ts](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/SudokuCLI.ts) - Terminal interface and display
- [PuzzleLoader.ts](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/PuzzleLoader.ts) - Loads puzzles from JSON files
- [index.ts](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/index.ts) - Entry point that orchestrates puzzle loading and solving
- [puzzles.json](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/puzzles.json) - Collection of Sudoku puzzles with metadata

For algorithm details, see [ALGORITHM_Sudoku_Basic_Solver.md](DOCS/ALGORITHM_Sudoku_Basic_Solver.md)

## Running the Sudoku Solver

### Prerequisites
- Node.js (v16 or higher)

### Quick Start

1. Navigate to the demo app directory:
   ```bash
   cd DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the solver:
   ```bash
   npm start
   ```

The application will load all puzzles from `puzzles.json` and solve them sequentially.

### Alternative: Build and Run

To compile TypeScript to JavaScript and run the compiled version:

```bash
npm run build   # Compiles to dist/
npm run run     # Runs compiled JavaScript
```

## Managing Puzzles

### Puzzle File Structure

Puzzles are stored in [puzzles.json](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/puzzles.json) with the following structure:

```json
{
  "puzzles": [
    {
      "name": "Easy Scan Grid",
      "difficulty": "easy",
      "description": "Description of the puzzle",
      "grid": [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        ...9 rows total, each with 9 values (0 = empty)
      ]
    }
  ]
}
```

### Adding New Puzzles

1. Open `puzzles.json`
2. Add a new puzzle object to the `puzzles` array
3. Ensure the grid is exactly 9x9 with values 0-9 (0 = empty cell)
4. Run `npm start` to solve all puzzles including your new one

### Using PuzzleLoader in Code

The `PuzzleLoader` class provides flexible ways to load puzzles:

```typescript
import { PuzzleLoader } from "./PuzzleLoader";

const loader = new PuzzleLoader("../puzzles.json");

// Get all puzzles
const all = loader.getAllPuzzles();

// Get by name
const puzzle = loader.getPuzzleByName("Easy Scan Grid");

// Get by difficulty
const easyPuzzles = loader.getPuzzlesByDifficulty("easy");

// Get by index
const first = loader.getPuzzleByIndex(0);
```

See [index.ts](DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/index.ts) for usage examples.
