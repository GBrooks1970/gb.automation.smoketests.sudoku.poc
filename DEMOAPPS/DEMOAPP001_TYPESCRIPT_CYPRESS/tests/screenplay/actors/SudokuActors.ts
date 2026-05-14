import { Actor, Cast } from '@serenity-js/core';
import { UseSudokuSolver } from '../abilities/UseSudokuSolver';
import { LoadPuzzles } from '../abilities/LoadPuzzles';
import * as path from 'path';

const PUZZLES_PATH = path.resolve(__dirname, '../../../puzzles.json');

/**
 * SudokuActors: Cast implementation for the DEMOAPP001 Screenplay layer.
 *
 * Responsible for equipping each Actor with the right Abilities.
 * Single actor persona: "Solver" — recreated fresh per scenario via
 * Serenity/JS automatic crew reset.
 *
 * Design note: all Ability configuration lives here. Adding a new Ability
 * (e.g., WriteAuditLog) only requires changing this file.
 */
export const SudokuActors: Cast = {
  prepare(actor: Actor): Actor {
    return actor.whoCan(
      new UseSudokuSolver(),
      LoadPuzzles.from(PUZZLES_PATH),
    );
  },
};
