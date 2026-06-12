using DemoApp003.Specs.Screenplay.Abilities;
using DemoApp003.Specs.Screenplay.Support;
using DemoApp003.Sudoku;

namespace DemoApp003.Specs.Screenplay.Questions;

public static class AlgorithmMadeProgress
{
    public static IQuestion<bool> AfterLastCall() =>
        new DelegateQuestion<bool>(actor => actor.Recall(MemoryKeys.ALGORITHM_PROGRESS, false));
}

public static class SolveStatus
{
    public static IQuestion<string> Current() =>
        new DelegateQuestion<string>(actor => actor.Recall(MemoryKeys.SOLVE_RESULT, "") ?? "");
}

public static class PlacementValidity
{
    public static IQuestion<string> OfLastAttempt() =>
        new DelegateQuestion<string>(actor => actor.Recall(MemoryKeys.VALIDATION_RESULT, "") ?? "");
}

public static class ErrorThrown
{
    public static IQuestion<Exception?> Last() =>
        new DelegateQuestion<Exception?>(actor => actor.Recall<Exception>(MemoryKeys.LAST_ERROR));
}

public static class GridCell
{
    public static IQuestion<int> At(int row, int col) =>
        new DelegateQuestion<int>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Grid[row][col]);

    public static IQuestion<bool> ContainsValue(int value) =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Grid.Any(row => row.Contains(value)));

    public static IQuestion<bool> AllFilled() =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Grid.All(row => row.All(cell => cell != Constants.EmptyCell)));

    public static IQuestion<bool> InRow(int row, int value) =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Grid[row].Contains(value));

    public static IQuestion<bool> InColumn(int col, int value) =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Grid.Any(row => row[col] == value));

    public static IQuestion<bool> MatchesSnapshot() =>
        new DelegateQuestion<bool>(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            return GridsEqual(ability.GetSolver().Grid, ability.GridSnapshot);
        });

    public static IQuestion<bool> OrigMatchesSnapshot() =>
        new DelegateQuestion<bool>(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            return GridsEqual(ability.GetSolver().OriginalGrid, ability.GridSnapshot);
        });

    public static IQuestion<bool> WorkingDiffersFromOrig() =>
        new DelegateQuestion<bool>(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            return !GridsEqual(ability.GetSolver().Grid, ability.GetSolver().OriginalGrid);
        });

    public static IQuestion<bool> IsValidSolution() =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().IsValidSolution());

    public static IQuestion<bool> HasEmptyCells() =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Grid.Any(row => row.Any(cell => cell == Constants.EmptyCell)));

    public static IQuestion<bool> IsGridFull() =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().IsGridFull());

    public static IQuestion<bool> NoConstraintViolations() =>
        new DelegateQuestion<bool>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().NoConstraintViolations());

    public static IQuestion<bool> IsDeepCopy() =>
        new DelegateQuestion<bool>(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            return !ReferenceEquals(ability.GetSolver().Grid, ability.GridSnapshot)
                && GridsEqual(ability.GetSolver().Grid, ability.GridSnapshot);
        });

    private static bool GridsEqual(IReadOnlyList<IReadOnlyList<int>> left, IReadOnlyList<IReadOnlyList<int>> right) =>
        left.Count == right.Count
        && left.Zip(right).All(pair => pair.First.SequenceEqual(pair.Second));
}

public static class GridSnapshot
{
    public static IQuestion<int[][]> Current() =>
        new DelegateQuestion<int[][]>(actor => GridHelpers.DeepCopy(actor.Recall<int[][]>(MemoryKeys.GRID_SNAPSHOT, []) ?? []));
}

public static class TargetCell
{
    public static IQuestion<CellPosition> Current() =>
        new DelegateQuestion<CellPosition>(actor => actor.Recall(MemoryKeys.TARGET_CELL, new CellPosition(0, 0)) ?? new CellPosition(0, 0));
}

public static class CurrentSolver
{
    public static IQuestion<string> Name() =>
        new DelegateQuestion<string>(actor => actor.AbilityTo<UseSudokuSolver>().GetSolver().Name);

    public static IQuestion<bool> HasValidGrid() =>
        new DelegateQuestion<bool>(actor =>
        {
            var grid = actor.AbilityTo<UseSudokuSolver>().GetSolver().OriginalGrid;
            return grid.Length == Constants.GridSize && grid.All(row => row.Length == Constants.GridSize);
        });
}

public static class LoadedPuzzleCount
{
    public static IQuestion<int> Current() =>
        new DelegateQuestion<int>(actor => actor.AbilityTo<LoadPuzzles>().GetCount());
}

public static class LoadedPuzzles
{
    public static IQuestion<IReadOnlyList<Puzzle>> All() =>
        new DelegateQuestion<IReadOnlyList<Puzzle>>(actor => actor.AbilityTo<LoadPuzzles>().GetAll());
}

public static class MultipleSolvers
{
    public static IQuestion<int> Count() =>
        new DelegateQuestion<int>(actor => actor.AbilityTo<UseSudokuSolver>().MultipleSolvers.Count);

    public static IQuestion<bool> AreIndependent() =>
        new DelegateQuestion<bool>(actor =>
        {
            var solvers = actor.AbilityTo<UseSudokuSolver>().MultipleSolvers;
            for (var index = 0; index < solvers.Count - 1; index++)
            {
                if (ReferenceEquals(solvers[index].Grid, solvers[index + 1].Grid))
                {
                    return false;
                }
            }

            return true;
        });

    public static IQuestion<bool> IsolationVerified() =>
        new DelegateQuestion<bool>(actor =>
        {
            var ability = actor.AbilityTo<UseSudokuSolver>();
            var solvers = ability.MultipleSolvers;
            if (solvers.Count < 3)
            {
                return false;
            }

            var snap1 = solvers[1].GetGrid();
            var snap2 = solvers[2].GetGrid();

            ability.Initialise(solvers[0].Name, solvers[0].OriginalGrid);
            ability.SolvePuzzle();
            actor.Remember(MemoryKeys.ALGORITHM_PROGRESS, false);

            return GridsEqual(solvers[1].Grid, snap1) && GridsEqual(solvers[2].Grid, snap2);
        });

    private static bool GridsEqual(IReadOnlyList<IReadOnlyList<int>> left, IReadOnlyList<IReadOnlyList<int>> right) =>
        left.Count == right.Count
        && left.Zip(right).All(pair => pair.First.SequenceEqual(pair.Second));
}

public static class AuditTrailQuestion
{
    public static IQuestion<AuditTrail?> Current() =>
        new DelegateQuestion<AuditTrail?>(actor => actor.AbilityTo<UseSudokuSolver>().LastAuditTrail);
}
