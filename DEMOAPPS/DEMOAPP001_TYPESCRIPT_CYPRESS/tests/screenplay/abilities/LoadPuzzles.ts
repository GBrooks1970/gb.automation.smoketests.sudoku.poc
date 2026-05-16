import { Ability } from '@serenity-js/core';
import { PuzzleLoader, Puzzle } from '../../../app_src/PuzzleLoader';
import * as path from 'path';

/**
 * Ability: LoadPuzzles
 *
 * Wraps PuzzleLoader to give an actor access to the puzzle data source.
 * The path is resolved once at construction; all queries are read-only.
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
      this.lastError = e as Error;
    }
  }

  getByName(name: string): Puzzle | undefined {
    return this.loader?.getPuzzleByName(name);
  }

  getByIndex(index: number): Puzzle | undefined {
    return this.loader?.getPuzzleByIndex(index);
  }

  getByDifficulty(difficulty: string): Puzzle[] {
    return this.loader?.getPuzzlesByDifficulty(difficulty) ?? [];
  }

  getAll(): Puzzle[] {
    return this.loader?.getAllPuzzles() ?? [];
  }

  getCount(): number { return this.loader?.getPuzzleCount() ?? 0; }
  getError(): Error | null { return this.lastError; }
}
