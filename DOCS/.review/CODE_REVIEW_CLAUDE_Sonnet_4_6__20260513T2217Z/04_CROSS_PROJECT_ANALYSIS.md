# Cross-Project Analysis

[<- Back to Project Reviews](03_PROJECT_REVIEWS/PROJECT_002_Design_and_Planning.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE Sonnet 4.6)
**Date:** 2026-05-13T22:17Z

---

## 1. Tool-Agnostic Tests

- **Gherkin Scenarios Remain Framework-Independent** - The 35+ scenarios still use standard
  Gherkin syntax. The camelCase example table updates in this cycle do not affect framework
  compatibility: `gridState` and `emptyGrid` are valid in Cucumber.js, SpecFlow, pytest-bdd,
  and all other Cucumber-compatible runners equally.
- **No Step Definitions Means No Framework Lock-In** - The framework choice remains open.
  This is still both the project's most significant weakness (nothing runs) and its greatest
  flexibility advantage.
- **ESLint Does Not Apply to Feature Files** - The `eslint.config.js` targets `app_src/**/*.ts`
  only. Gherkin example table formatting is enforced by convention (naming document) and code
  review, not by tooling.
- **Batch Runner Is Tool-Specific** - The `.bat` file is Windows-only. A `package.json` script
  (`npm run capture`) would be cross-platform. This is a minor portability note for future
  contributors on macOS or Linux.

## 2. Code-Agnostic Tests

- **Tests Continue to Specify Behaviour Not Implementation** - The renaming changes in the
  source code have zero impact on the feature file's language independence. Scenarios reference
  "Unit Completion" and "Hidden Singles" as domain concepts, not TypeScript method names.
- **Naming Conventions Document Enables Multi-Language Consistency** - `DESIGN_Naming_Conventions.md`
  notes that PascalCase for classes and camelCase for methods are the TypeScript-specific standard.
  For Python (BACKLOG-012) and C# (BACKLOG-013) implementations, equivalent conventions would
  need documenting. The template pattern established here is reusable.
- **Tech-Agnostic Specification Remains The Canonical Reference** - `DESIGN_Sudoku_Solver_Specification.md`
  has not been modified. It continues to be the correct reference for multi-language implementations.

## 3. Single Source of Truth - Features

- **Constants Introduce a Secondary Source of Truth** - `GRID_SIZE = 9` is now defined in
  `SudokuSolver.ts` and referenced in 3 files. If a future variant (e.g., 4x4 Sudoku) changes
  this value, ALL import sites must update. A dedicated `constants.ts` would make this a
  single-file change. The current arrangement is not a single source of truth for grid dimensions.
- **Naming Conventions Now Have a Single Source** - `DESIGN_Naming_Conventions.md` plus
  `eslint.config.js` together form the single source of truth for naming standards.
  The design document describes intent; the ESLint config enforces it. This is the correct
  dual-layer approach.
- **Hidden Singles Specification-Implementation Gap Persists** - The specification says "check
  rows, columns, AND blocks." The code checks blocks only. The algorithm documentation says
  the same. Three documents agree on the specification; the code deviates. This is the
  project's most persistent single-source-of-truth violation.

## 4. Single Source of Truth - Data

- **puzzles.json Remains the Sole Data Source** - Unchanged. Four puzzles with consistent
  schema. `PuzzleLoader` remains the sole access point.
- **Hardcoded 9 in PuzzleLoader Duplicates the Source of Truth** - The grid size validation
  in `PuzzleLoader` uses `puzzle.grid.length !== 9` rather than `!== GRID_SIZE`. Two places
  in the codebase now define what constitutes a valid grid size: `GRID_SIZE = 9` in
  `SudokuSolver.ts` and the literal `9` in `PuzzleLoader.ts`. This is the practical data
  validation cost of not having a central `constants.ts`.

## 5. API Contract Compliance

- **No API Exists** - The REST API remains designed but unimplemented. Unchanged from prior review.
- **Naming Convention Changes Are Compatible With API Design** - The REST API design uses
  `row`/`col` in its `GridPosition` and `CellChange` interfaces. The source code now uses
  the same `row`/`col` names in the `{row: number, col: number}` cell coordinate type.
  The code and API design are now more aligned in their naming.
- **Constants Can Feed API Validation** - When the REST API is implemented, `GRID_SIZE` and
  `BLOCK_SIZE` from `constants.ts` (once created) can be used to validate incoming grid
  dimensions, keeping validation consistent with the solver.

## 6. Documentation Alignment

- **CLAUDE.md Is Partially Stale** - The "Known Limitations" section still lists "Magic Numbers"
  as a limitation, but GRID_SIZE/BLOCK_SIZE/EMPTY_CELL have been extracted in 3 of 4 files.
  The "Planned Features" section lists BACKLOG-005 (constants) as planned, but it is now
  partially complete. CLAUDE.md needs a targeted update.
- **Naming Conventions Document Is Aligned With Code** - `DESIGN_Naming_Conventions.md`
  accurately reflects the current state of the code (it was written alongside the
  implementation changes). This is good practice: the document is authoritative because it
  was written at the same time as the code, not after.
- **Design Documents and Backlog Are Mutually Consistent** - The three feature design
  documents and their corresponding BACKLOG items (BACKLOG-008, BACKLOG-009, BACKLOG-018)
  reference each other correctly. The partially-completed BACKLOG-017 acceptance criteria
  reflect the design alignment work done in April 2026.

## 7. Logging Alignment

- **Console.log Usage Is Unchanged** - All direct `console.log()` calls remain in place.
  `SudokuCLI.ts` (9 calls) and `index.ts` (9 calls) are identical to prior reviews.
- **ESLint Config Does Not Flag Console Usage** - The current `eslint.config.js` has no
  `no-console` rule. If desirable, this could be added as a warning to guide developers
  toward the planned `IOutput` abstraction when it is implemented.
- **Naming Conventions Work Did Not Add Structured Logging** - No progress on BACKLOG-007
  (IOutput decoupling). The console coupling situation is unchanged.

## 8. Test Coverage Metrics

- **Coverage Is Unchanged At Zero Executable** - No test runner means no measurable coverage.
  The 35+ scenarios remain specifications only.
- **Output File Diff Is A Proxy For Regression Coverage** - The two bat output files
  (2026-04-02 and 2026-05-13) are byte-for-byte identical in solver output. This provides
  informal evidence that the naming and constants changes introduced no regressions. This is
  not a substitute for automated testing but is better than no check at all.
- **Estimated Theoretical Coverage Is Unchanged** - The scenario analysis from the prior review
  remains valid (unitCompletion ~80%, hiddenSingles ~60%, nakedSingles ~70%, PuzzleLoader ~90%,
  SudokuOrchestrator ~85%). No new scenarios were added.

## 9. Screenplay Parity

- **Not Applicable** - Unchanged from prior reviews. No Screenplay pattern implementation.
- **The Naming Improvements Support Future Screenplay Integration** - If Serenity.js is
  introduced, actor abilities like `PlacesDigit.inCell({row: 4, col: 4})` will align
  naturally with the code's `{row, col}` coordinate naming. The prior `{r, c}` naming
  would have required translation.

---

[<- Back to Project Reviews](03_PROJECT_REVIEWS/PROJECT_002_Design_and_Planning.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

*Reviewer: AI assistant (CLAUDE Sonnet 4.6)*
