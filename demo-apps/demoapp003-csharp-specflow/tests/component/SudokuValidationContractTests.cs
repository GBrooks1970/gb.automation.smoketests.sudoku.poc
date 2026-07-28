using DemoApp003.Sudoku;

namespace DemoApp003.ComponentTests;

[TestFixture]
public sealed class SudokuValidationContractTests
{
    private static readonly int[][] SolvedGrid =
    [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    [TestCase(-1, -1, true)]
    [TestCase(0, 4, false)]
    [TestCase(4, 0, false)]
    [TestCase(1, 1, false)]
    public void PlacementValidationMapsRowColumnAndBlockConflicts(
        int conflictRow,
        int conflictColumn,
        bool expected)
    {
        var grid = EmptyGrid();
        if (conflictRow >= 0)
        {
            grid[conflictRow][conflictColumn] = 5;
        }

        var solver = new SudokuSolver("placement validation", grid);

        Assert.That(solver.IsValidPlacement(0, 0, 5), Is.EqualTo(expected));
    }

    [TestCase(false, true)]
    [TestCase(true, false)]
    public void ConstraintValidationMapsCleanAndDuplicateGrids(bool hasDuplicate, bool expected)
    {
        var grid = EmptyGrid();
        if (hasDuplicate)
        {
            grid[0][0] = 5;
            grid[0][1] = 5;
        }

        var solver = new SudokuSolver("constraint validation", grid);

        Assert.That(solver.NoConstraintViolations(), Is.EqualTo(expected));
    }

    [TestCase(true)]
    [TestCase(false)]
    public void SolutionValidationMapsCompleteAndInvalidGrids(bool isCompleteSolution)
    {
        var grid = SolvedGrid.Select(row => row.ToArray()).ToArray();
        if (!isCompleteSolution)
        {
            grid[0][0] = grid[0][1];
        }

        var solver = new SudokuSolver("solution validation", grid);

        Assert.That(solver.IsValidSolution(), Is.EqualTo(isCompleteSolution));
    }

    private static int[][] EmptyGrid() =>
        Enumerable.Range(0, Constants.GridSize)
            .Select(_ => new int[Constants.GridSize])
            .ToArray();
}
