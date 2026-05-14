import { SudokuSolver } from "./SudokuSolver";
import { SudokuOrchestrator } from "./SudokuOrchestrator";
import { GRID_SIZE, BLOCK_SIZE, EMPTY_CELL } from "./constants";

/**
 * Handles Terminal Interaction and Formatting.
 * Follows the Single Responsibility Principle: Interface Only.
 */
export class SudokuCLI {
    private orchestrator: SudokuOrchestrator;

    constructor(private solver: SudokuSolver) {
        this.orchestrator = new SudokuOrchestrator(this.solver);
    }

    /**
     * Renders the 9x9 grid in a human-readable format.
     */
    public displayGrid(): void {
        console.log(`\n--${this.solver.name}----`);
        console.log("\n-------------------------");
        for (let i = 0; i < GRID_SIZE; i++) {
            let rowString = "| ";
            for (let j = 0; j < GRID_SIZE; j++) {
                const cellValue = this.solver.grid[i][j];
                rowString += (cellValue === EMPTY_CELL ? "." : cellValue) + " ";
                if ((j + 1) % BLOCK_SIZE === 0) rowString += "| ";
            }
            console.log(rowString);
            if ((i + 1) % BLOCK_SIZE === 0) console.log("-------------------------");
        }
    }

    /**
     * Executes the solve process and prints the results.
     */
    public run(): void {
        console.log("\nxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        console.log("Initial Puzzle:");
        this.displayGrid();

        console.log("\nSolving...");
        const status = this.orchestrator.solve();

        console.log(`\nResult: ${status}`);
        this.displayGrid();
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n");
    }
}
