import { Ability } from '@serenity-js/core';
import { PuzzleLoader, Puzzle } from '../../../app_src/PuzzleLoader';
import * as path from 'path';

/**
 * Ability: LoadPuzzles
 *
 * Wraps PuzzleLoader to give an actor access to the puzzle data source.
 * The path is resolved once at construction; all queries are read-only and
 * surface any captured loader failure rather than masking it with empty results.
 */
export class LoadPuzzles extends Ability {
  private loader: PuzzleLoader | null = null;
  private lastError: Error | null = null;

  static from(filePath: string): LoadPuzzles {
    return new LoadPuzzles(filePath);
  }

  constructor(filePath: string) {
    super();
    try {
      this.loader = new PuzzleLoader(path.resolve(filePath));
    } catch (e) {
      this.lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  getByName(name: string): Puzzle | undefined {
    return this.requireLoader().getPuzzleByName(name);
  }

  getByIndex(index: number): Puzzle | undefined {
    return this.requireLoader().getPuzzleByIndex(index);
  }

  getByDifficulty(difficulty: string): Puzzle[] {
    return this.requireLoader().getPuzzlesByDifficulty(difficulty);
  }

  getAll(): Puzzle[] {
    return this.requireLoader().getAllPuzzles();
  }

  getCount(): number {
    return this.requireLoader().getPuzzleCount();
  }

  getError(): Error | null {
    return this.lastError;
  }

  private requireLoader(): PuzzleLoader {
    if (this.lastError !== null) {
      throw this.lastError;
    }

    if (this.loader === null) {
      throw new Error('PuzzleLoader is not initialised');
    }

    return this.loader;
  }
}
