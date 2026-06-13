import { SudokuSolver } from './SudokuSolver';
import { SudokuOrchestrator } from './SudokuOrchestrator';
import { IOutput } from './output/IOutput';
import { ConsoleOutput } from './output/ConsoleOutput';
import { GRID_SIZE, BLOCK_SIZE, EMPTY_CELL } from './constants';

export class SudokuCLI {
  private orchestrator: SudokuOrchestrator;
  private output: IOutput;

  constructor(
    private solver: SudokuSolver,
    output: IOutput = new ConsoleOutput()
  ) {
    this.orchestrator = new SudokuOrchestrator(this.solver);
    this.output = output;
  }

  public displayGrid(): void {
    this.output.write(`\n--${this.solver.name}----`);
    this.output.write('\n-------------------------');
    const grid = this.solver.getGrid();
    for (let i = 0; i < GRID_SIZE; i++) {
      let rowString = '| ';
      for (let j = 0; j < GRID_SIZE; j++) {
        const cellValue = grid[i][j];
        rowString += (cellValue === EMPTY_CELL ? '.' : cellValue) + ' ';
        if ((j + 1) % BLOCK_SIZE === 0) rowString += '| ';
      }
      this.output.write(rowString);
      if ((i + 1) % BLOCK_SIZE === 0) this.output.write('-------------------------');
    }
  }

  public run(): string {
    this.output.write('\nxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    this.output.write('Initial Puzzle:');
    this.displayGrid();

    this.output.write('\nSolving...');
    const status = this.orchestrator.solve();

    this.output.write(`\nResult: ${status}`);
    this.displayGrid();
    this.output.write('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n');

    return status;
  }
}
