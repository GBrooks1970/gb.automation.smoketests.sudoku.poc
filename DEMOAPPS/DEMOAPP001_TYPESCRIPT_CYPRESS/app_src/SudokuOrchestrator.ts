import { SudokuSolver } from "./SudokuSolver";
import { GRID_SIZE, EMPTY_CELL } from "./constants";

/**
 * Main Controller for Sudoku Logic.
 * Orchestrates the application of basic Sudoku solving techniques.
 *
 * This class implements the solving strategy outlined in ALGORITHM_Sudoku_Basic_Solver.txt
 * by coordinating three fundamental techniques in order of efficiency:
 *
 * 1. Unit Completion - Fastest: O(n) per unit, fills obvious single-empty-cell situations
 * 2. Hidden Singles - Medium: Scans for digits that can only go in one place per unit
 * 3. Naked Singles - Slowest: O(n²), examines each cell's remaining candidates
 *
 * The orchestrator repeats this cycle until either the puzzle is solved or no
 * further progress can be made (requiring advanced techniques like Naked Pairs, X-Wing, etc.)
 */
export class SudokuOrchestrator {
    constructor(private solver: SudokuSolver) {}

    /**
     * Solves the Sudoku puzzle using basic techniques.
     *
     * @returns "SOLVED" if the puzzle is complete, "STUCK_ON_ADVANCED_LOGIC" if basic techniques are insufficient
     */
    public solve(): string {
        let isProgressing = true;

        while (isProgressing) {
            let changedThisPass = false;

            // Step 1: Unit Completion (simplest technique - O(n) per unit)
            // Fills cells in rows/columns/blocks that have only one empty cell
            if (this.solver.unitCompletion()) {
                changedThisPass = true;
            }

            // Step 2: Hidden Singles (medium complexity - scan per digit)
            // For each digit 1-9, find units where that digit can only go in one place
            for (let digit = 1; digit <= GRID_SIZE; digit++) {
                if (this.solver.hiddenSingles(digit)) {
                    changedThisPass = true;
                }
            }

            // Step 3: Naked Singles (most complex - O(n²) cell examination)
            // Find cells that can only contain one digit after eliminating all "seen" values
            if (this.solver.nakedSingles()) {
                changedThisPass = true;
            }

            // Exit loop if no technique made any progress (puzzle stuck or complete)
            isProgressing = changedThisPass;
        }

        return this.isGridFull() ? "SOLVED" : "STUCK_ON_ADVANCED_LOGIC";
    }

    /**
     * Checks if the grid is completely filled.
     * @returns true if all cells contain non-zero values
     */
    public isGridFull(): boolean {
        return this.solver.grid.every(row => row.every(cell => cell !== EMPTY_CELL));
    }
}
