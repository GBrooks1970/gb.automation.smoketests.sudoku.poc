import { SudokuSolver } from "./SudokuSolver";
import { SudokuCLI } from "./SudokuCLI";
import { PuzzleLoader } from "./PuzzleLoader";

/**
 * Main entry point for the Sudoku Solver CLI application.
 * Loads puzzles from puzzles.json and solves them using the basic algorithm.
 */

try {
    // Load puzzles from JSON file
    const loader = new PuzzleLoader("../puzzles.json");

    console.log("\n===========================================");
    console.log("    SUDOKU SOLVER - Basic Algorithm Demo");
    console.log("===========================================");
    console.log(`\nLoaded ${loader.getPuzzleCount()} puzzles from puzzles.json`);
    console.log("Available puzzles:", loader.listPuzzleNames().join(", "));
    console.log("\n===========================================\n");

    // Option 1: Solve all puzzles
    console.log(">>> Solving ALL puzzles...\n");
    const allPuzzles = loader.getAllPuzzles();
    allPuzzles.forEach(puzzle => {
        const solver = new SudokuSolver(puzzle.name, puzzle.grid);
        const app = new SudokuCLI(solver);
        console.log(`\n[${puzzle.difficulty.toUpperCase()}] ${puzzle.description}`);
        app.run();
    });

    // Option 2: Solve specific puzzles by name (commented out)
    /*
    console.log(">>> Solving SPECIFIC puzzles...\n");
    const easyPuzzle = loader.getPuzzleByName("Easy Scan Grid");
    if (easyPuzzle) {
        const solver = new SudokuSolver(easyPuzzle.name, easyPuzzle.grid);
        const app = new SudokuCLI(solver);
        app.run();
    }
    */

    // Option 3: Solve puzzles by difficulty (commented out)
    /*
    console.log(">>> Solving EASY puzzles only...\n");
    const easyPuzzles = loader.getPuzzlesByDifficulty("easy");
    easyPuzzles.forEach(puzzle => {
        const solver = new SudokuSolver(puzzle.name, puzzle.grid);
        const app = new SudokuCLI(solver);
        app.run();
    });
    */

} catch (error) {
    console.error("Error loading or solving puzzles:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}