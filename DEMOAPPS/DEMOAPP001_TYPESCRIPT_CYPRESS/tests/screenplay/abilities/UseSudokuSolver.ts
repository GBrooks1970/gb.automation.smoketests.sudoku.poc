import { Ability } from '@serenity-js/core';
import { SudokuSolver } from '../../../app_src/SudokuSolver';
import { SudokuOrchestrator } from '../../../app_src/SudokuOrchestrator';

/**
 * Ability: UseSudokuSolver
 *
 * Encapsulates the lifetime of a SudokuSolver + SudokuOrchestrator pair.
 * An actor that HAS this ability can initialise grids, apply algorithms,
 * and run the full solving loop.
 *
 * Design note: Abilities are the only place in the Screenplay layer that
 * directly imports production classes. This is the Dependency Inversion boundary.
 *
 * Note: extends Ability (base class) as required by @serenity-js/core 3.x.
 */
export class UseSudokuSolver extends Ability {
  private solver: SudokuSolver | null = null;
  private lastAlgorithmChanged: boolean = false;
  private solveResult: string = '';

  constructor() { super(); }

  initialise(name: string, grid?: number[][]): void {
    this.solver = new SudokuSolver(name, grid);
    this.lastAlgorithmChanged = false;
    this.solveResult = '';
  }

  getSolver(): SudokuSolver {
    if (!this.solver) throw new Error('Solver not initialised — call InitialiseGrid first');
    return this.solver;
  }

  applyUnitCompletion(): void {
    this.lastAlgorithmChanged = this.getSolver().unitCompletion();
  }

  applyHiddenSingles(target: number): void {
    this.lastAlgorithmChanged = this.getSolver().hiddenSingles(target);
  }

  applyNakedSingles(): void {
    this.lastAlgorithmChanged = this.getSolver().nakedSingles();
  }

  solvePuzzle(): void {
    const orchestrator = new SudokuOrchestrator(this.getSolver());
    this.solveResult = orchestrator.solve();
  }

  get algorithmMadeProgress(): boolean { return this.lastAlgorithmChanged; }
  get result(): string { return this.solveResult; }
}
