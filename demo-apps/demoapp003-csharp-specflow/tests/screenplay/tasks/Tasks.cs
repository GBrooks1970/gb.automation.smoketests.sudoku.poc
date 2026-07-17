using DemoApp003.Specs.Screenplay.Abilities;
using DemoApp003.Specs.Screenplay.Fixtures;
using DemoApp003.Specs.Screenplay.Support;
using DemoApp003.Sudoku;

namespace DemoApp003.Specs.Screenplay.Tasks;

public static class InitialiseGrid
{
    public static ITask Empty() =>
        new DelegateTask(actor => actor.AbilityTo<UseSudokuSolver>().Initialise("test"));

    public static ITask WithRowValues(int row, IReadOnlyList<int> values) =>
        new DelegateTask(actor =>
        {
            var grid = GridHelpers.EmptyGrid();
            grid[row] = values.ToArray();
            actor.AbilityTo<UseSudokuSolver>().Initialise("test", grid);
        });

    public static ITask FromPuzzleNamed(string name) =>
        new DelegateTask(actor =>
        {
            var puzzle = actor.AbilityTo<LoadPuzzles>().GetByName(name)
                ?? throw new InvalidOperationException($"Puzzle not found: \"{name}\"");
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise(puzzle.Name, puzzle.Grid);
            var snapshot = GridHelpers.DeepCopy(ability.GetSolver().OriginalGrid);
            ability.StoreSnapshot(snapshot);
            actor.Remember(MemoryKeys.GRID_SNAPSHOT, snapshot);
        });

    public static ITask WithGrid(string name, IReadOnlyList<IReadOnlyList<int>> grid) =>
        new DelegateTask(actor => actor.AbilityTo<UseSudokuSolver>().Initialise(name, grid));

    public static ITask WithCompleteGrid(IReadOnlyList<IReadOnlyList<int>> grid) =>
        new DelegateTask(actor => actor.AbilityTo<UseSudokuSolver>().Initialise("complete", grid));

    public static ITask WithDuplicateInRow(int rowIndex, int value) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise("duplicate");
            GridFixtures.SetupWithDuplicateInRow(ability.GetSolver(), rowIndex, value);
        });
}

public static class ApplyAlgorithm
{
    public static ITask UnitCompletion() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.ApplyUnitCompletion();
            actor.Remember(MemoryKeys.ALGORITHM_PROGRESS, ability.AlgorithmMadeProgress);
        });

    public static ITask HiddenSingles(int digit) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.ApplyHiddenSingles(digit);
            actor.Remember(MemoryKeys.ALGORITHM_PROGRESS, ability.AlgorithmMadeProgress);
        });

    public static ITask NakedSingles() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.ApplyNakedSingles();
            actor.Remember(MemoryKeys.ALGORITHM_PROGRESS, ability.AlgorithmMadeProgress);
        });
}

public static class SetupGridState
{
    public static ITask AlmostCompleteColumn(int col, int missingDigit) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupAlmostCompleteColumn(ability.GetSolver(), col, missingDigit);
            ability.TakeSnapshot();
        });

    public static ITask AlmostCompleteBlock(int blockRow, int blockCol, int missingDigit) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupAlmostCompleteBlock(ability.GetSolver(), blockRow, blockCol, missingDigit);
            ability.TakeSnapshot();
        });

    public static ITask WithMultipleEmpties() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupMultipleEmpties(ability.GetSolver());
            ability.TakeSnapshot();
        });

    public static ITask RowMissingDigit(int rowIndex, int target) =>
        new DelegateTask(actor => GridFixtures.SetupRowMissingDigit(actor.AbilityTo<UseSudokuSolver>().GetSolver(), rowIndex, target));

    public static ITask RowColumnConstraints(int count, int rowIndex, int target) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupRowColumnConstraints(ability.GetSolver(), count, rowIndex, target);
            ability.TakeSnapshot();
        });

    public static ITask ColumnMissingDigit(int colIndex, int target) =>
        new DelegateTask(actor => GridFixtures.SetupColumnMissingDigit(actor.AbilityTo<UseSudokuSolver>().GetSolver(), colIndex, target));

    public static ITask ColumnRowConstraints(int count, int colIndex, int target) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupColumnRowConstraints(ability.GetSolver(), count, colIndex, target);
            ability.TakeSnapshot();
        });

    public static ITask BlockFourEmpties() =>
        new DelegateTask(actor => GridFixtures.SetupBlockFourEmpties(actor.AbilityTo<UseSudokuSolver>().GetSolver()));

    public static ITask HiddenSingleInBlock(int target) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupHiddenSingleInBlock(ability.GetSolver(), target);
            ability.TakeSnapshot();
        });

    public static ITask DigitInRow(int rowIndex, int digit) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.SetupDigitInRow(ability.GetSolver(), rowIndex, digit);
            ability.TakeSnapshot();
        });

    public static ITask WithMultipleCandidates() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise("test");
            ability.TakeSnapshot();
        });

    public static ITask TargetCell(int row, int col) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            GridFixtures.ClearCell(ability.GetSolver(), row, col);
            ability.SetTargetCell(row, col);
            actor.Remember(MemoryKeys.TARGET_CELL, new CellPosition(row, col));
        });

    public static ITask ValuesInRow(IReadOnlyList<int> values) =>
        new DelegateTask(actor =>
        {
            var target = actor.Recall<CellPosition>(MemoryKeys.TARGET_CELL) ?? new CellPosition(0, 0);
            GridFixtures.AddValuesToRow(actor.AbilityTo<UseSudokuSolver>().GetSolver(), target.Row, target.Col, values);
        });

    public static ITask ValuesInColumn(IReadOnlyList<int> values) =>
        new DelegateTask(actor =>
        {
            var target = actor.Recall<CellPosition>(MemoryKeys.TARGET_CELL) ?? new CellPosition(0, 0);
            GridFixtures.AddValuesToColumn(actor.AbilityTo<UseSudokuSolver>().GetSolver(), target.Col, target.Row, values);
        });

    public static ITask ValuesInBlock(IReadOnlyList<int> values) =>
        new DelegateTask(actor =>
        {
            var target = actor.Recall<CellPosition>(MemoryKeys.TARGET_CELL) ?? new CellPosition(0, 0);
            GridFixtures.AddValuesToBlock(
                actor.AbilityTo<UseSudokuSolver>().GetSolver(),
                target.Row,
                target.Col,
                target.Row,
                target.Col,
                values);
        });

    public static ITask ThreeCandidates() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise("test");
            GridFixtures.SetupThreeCandidates(ability.GetSolver());
            ability.TakeSnapshot();
            ability.SetTargetCell(0, 0);
            actor.Remember(MemoryKeys.TARGET_CELL, new CellPosition(0, 0));
        });

    public static ITask ThreeNakedSingles() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise("test");
            GridFixtures.SetupThreeNakedSingles(ability.GetSolver());
            ability.TakeSnapshot();
        });

    public static ITask Named(string gridState) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise("test");
            GridFixtures.SetupNamedGridState(ability.GetSolver(), gridState);
            ability.TakeSnapshot();
        });

    public static ITask FromSpecificGrid(IReadOnlyList<IReadOnlyList<int>> grid) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.StoreSnapshot(grid);
            actor.Remember(MemoryKeys.GRID_SNAPSHOT, GridHelpers.DeepCopy(grid));
        });

    public static ITask MultipleSolvers(int count) =>
        new DelegateTask(actor =>
        {
            var puzzles = actor.AbilityTo<LoadPuzzles>().GetAll();
            actor.AbilityTo<UseSudokuSolver>().SetMultipleSolvers(GridFixtures.CreateSolversFromPuzzles(count, puzzles));
        });

    public static ITask NoProgress() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise("stuck");
            ability.TakeSnapshot();
        });

    public static ITask RunAllAlgorithmsIndividually() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.TakeSnapshot();
            ability.ApplyUnitCompletion();
            for (var digit = 1; digit <= Constants.GridSize; digit++)
            {
                ability.ApplyHiddenSingles(digit);
            }
            ability.ApplyNakedSingles();
        });
}

public static class SetTargetCell
{
    public static ITask At(int row, int col) =>
        new DelegateTask(actor =>
        {
            actor.AbilityTo<UseSudokuSolver>().SetTargetCell(row, col);
            actor.Remember(MemoryKeys.TARGET_CELL, new CellPosition(row, col));
        });
}

public static class AttemptPlacement
{
    public static ITask OfValue(int value) =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.SetTargetValue(value);
            var target = ability.TargetCell;
            ability.ValidateAndStore(target.Row, target.Col, value);
            actor.Remember(MemoryKeys.VALIDATION_RESULT, ability.ValidationResult);
        });
}

public static class LoadPuzzleByName
{
    public static ITask AndInitialise(string name) =>
        new DelegateTask(actor =>
        {
            var puzzle = actor.AbilityTo<LoadPuzzles>().GetByName(name)
                ?? throw new InvalidOperationException($"Puzzle not found: \"{name}\"");
            actor.AbilityTo<UseSudokuSolver>().Initialise(puzzle.Name, puzzle.Grid);
        });

    public static ITask AndInitialiseOrDefault(string name) =>
        new DelegateTask(actor =>
        {
            var puzzle = actor.AbilityTo<LoadPuzzles>().GetByName(name);
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise(puzzle?.Name ?? "notfound", puzzle?.Grid);
        });
}

public static class LoadPuzzleByIndex
{
    public static ITask AndInitialise(int index) =>
        new DelegateTask(actor =>
        {
            var puzzle = actor.AbilityTo<LoadPuzzles>().GetByIndex(index);
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.Initialise(puzzle?.Name ?? "notfound", puzzle?.Grid);
        });
}

public static class LoadPuzzlesByDifficulty
{
    public static ITask AndStore(string difficulty) =>
        new DelegateTask(actor =>
        {
            var puzzles = actor.AbilityTo<LoadPuzzles>().GetByDifficulty(difficulty);
            actor.AbilityTo<UseSudokuSolver>().SetMultipleSolvers(GridFixtures.CreateSolversFromPuzzles(puzzles.Count, puzzles));
        });
}

public static class SolvePuzzle
{
    public static ITask WithCurrentGrid() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.SolvePuzzle();
            actor.Remember(MemoryKeys.SOLVE_RESULT, ability.Result);
        });

    public static ITask WithCurrentGridAndAudit() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.SolvePuzzleWithAudit();
            actor.Remember(MemoryKeys.SOLVE_RESULT, ability.Result);
        });

    // SUD-20 / BACKLOG-051: same solve, but always captures the audit event sequence so
    // orchestration Then-steps can assert real algorithm ordering / no-execution counts.
    public static ITask WithCurrentGridTrackingOrder() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.SolvePuzzleTrackingOrder();
            actor.Remember(MemoryKeys.SOLVE_RESULT, ability.Result);
        });
}

public static class EnableAuditLogging
{
    public static ITask ForCurrentSolver() =>
        new DelegateTask(actor => actor.AbilityTo<UseSudokuSolver>().EnableAudit());
}

public static class SimulateError
{
    public static ITask ForInvalidRowCount(int rows) =>
        new DelegateTask(actor =>
        {
            var error = new InvalidDataException("Puzzle \"test\" (index 0) must have exactly 9 rows");
            actor.AbilityTo<UseSudokuSolver>().SetSolverError(error);
            actor.Remember(MemoryKeys.LAST_ERROR, error);
        });

    public static ITask ForInvalidCellValue(int value) =>
        new DelegateTask(actor =>
        {
            var error = new InvalidDataException($"Puzzle \"Bad\" has invalid value at [0][0]: {value}");
            actor.AbilityTo<UseSudokuSolver>().SetSolverError(error);
            actor.Remember(MemoryKeys.LAST_ERROR, error);
        });

    public static ITask ForMissingFile() =>
        new DelegateTask(actor =>
        {
            var error = actor.AbilityTo<LoadPuzzles>().GetError() ?? new FileNotFoundException("Puzzle file not found");
            actor.AbilityTo<UseSudokuSolver>().SetSolverError(error);
            actor.Remember(MemoryKeys.LAST_ERROR, error);
        });
}

public static class CheckAlgorithmProgress
{
    public static ITask UnitCompletionOnSnapshot() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.ReinitialiseFromSnapshot();
            ability.ApplyUnitCompletion();
            actor.Remember(MemoryKeys.ALGORITHM_PROGRESS, ability.AlgorithmMadeProgress);
        });

    public static ITask NakedSinglesOnSnapshot() =>
        new DelegateTask(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            ability.ReinitialiseFromSnapshot();
            ability.ApplyNakedSingles();
            actor.Remember(MemoryKeys.ALGORITHM_PROGRESS, ability.AlgorithmMadeProgress);
        });

    public static ITask ReinitFromSnapshot() =>
        new DelegateTask(actor => actor.AbilityTo<UseSudokuSolver>().ReinitialiseFromSnapshot());
}
