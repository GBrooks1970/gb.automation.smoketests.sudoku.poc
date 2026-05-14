import * as fs from "fs";
import * as path from "path";
import { GRID_SIZE, EMPTY_CELL, MAX_DIGIT } from "./constants";

/**
 * Represents a single puzzle with metadata
 */
export interface Puzzle {
    name: string;
    difficulty: string;
    description: string;
    grid: number[][];
}

/**
 * Structure of the puzzles.json file
 */
interface PuzzleCollection {
    puzzles: Puzzle[];
}

/**
 * Utility class for loading Sudoku puzzles from JSON files.
 * Follows the Single Responsibility Principle: Data Loading Only.
 */
export class PuzzleLoader {
    private puzzles: Puzzle[] = [];

    /**
     * Loads puzzles from the specified JSON file
     * @param filePath Path to the JSON file (relative to project root or absolute)
     */
    constructor(filePath: string = "../puzzles.json") {
        const resolvedPath = path.resolve(__dirname, filePath);

        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Puzzle file not found: ${resolvedPath}`);
        }

        const fileContent = fs.readFileSync(resolvedPath, "utf-8");
        const data: PuzzleCollection = JSON.parse(fileContent);

        this.puzzles = data.puzzles;
        this.validatePuzzles();
    }

    /**
     * Validates that all loaded puzzles have valid 9x9 grids
     */
    private validatePuzzles(): void {
        this.puzzles.forEach((puzzle, index) => {
            if (!puzzle.grid || puzzle.grid.length !== GRID_SIZE) {
                throw new Error(`Puzzle "${puzzle.name}" (index ${index}) must have exactly 9 rows`);
            }

            puzzle.grid.forEach((row, rowIndex) => {
                if (row.length !== GRID_SIZE) {
                    throw new Error(
                        `Puzzle "${puzzle.name}" row ${rowIndex} must have exactly 9 columns`
                    );
                }

                row.forEach((cell, colIndex) => {
                    if (!Number.isInteger(cell) || cell < EMPTY_CELL || cell > MAX_DIGIT) {
                        throw new Error(
                            `Puzzle "${puzzle.name}" has invalid value at [${rowIndex}][${colIndex}]: ${cell}`
                        );
                    }
                });
            });
        });
    }

    /**
     * Gets all loaded puzzles
     */
    public getAllPuzzles(): Puzzle[] {
        return [...this.puzzles];
    }

    /**
     * Gets a puzzle by its name
     * @param name The name of the puzzle to retrieve
     * @returns The puzzle if found, undefined otherwise
     */
    public getPuzzleByName(name: string): Puzzle | undefined {
        return this.puzzles.find(p => p.name === name);
    }

    /**
     * Gets puzzles by difficulty level
     * @param difficulty The difficulty level (e.g., "easy", "medium", "hard")
     */
    public getPuzzlesByDifficulty(difficulty: string): Puzzle[] {
        return this.puzzles.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    /**
     * Gets a puzzle by index
     * @param index Zero-based index of the puzzle
     */
    public getPuzzleByIndex(index: number): Puzzle | undefined {
        return this.puzzles[index];
    }

    /**
     * Gets the total number of loaded puzzles
     */
    public getPuzzleCount(): number {
        return this.puzzles.length;
    }

    /**
     * Lists all puzzle names
     */
    public listPuzzleNames(): string[] {
        return this.puzzles.map(p => p.name);
    }
}
