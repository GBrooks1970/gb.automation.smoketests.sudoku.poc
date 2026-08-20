using DemoApp003.Sudoku;

namespace DemoApp003.ComponentTests;

[TestFixture]
public sealed class SolverTechniqueContractTests
{
    private static readonly int[][] SolvedExceptOne =
    [
        [5, 3, 4, 6, 7, 8, 9, 1, 0],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    [Test]
    public void UnitCompletionFillsASingleMissingCell()
    {
        var solver = new SudokuSolver("unit completion", SolvedExceptOne);

        Assert.That(solver.UnitCompletion(), Is.True);
        Assert.That(solver.GetGrid()[0][8], Is.EqualTo(2));
    }

    [Test]
    public void HiddenSinglesPlacesADigitAtItsOnlyRowCandidate()
    {
        var grid = EmptyGrid();
        grid[3] = [1, 2, 3, 4, 0, 5, 7, 8, 9];
        var solver = new SudokuSolver("hidden single", grid);

        Assert.That(solver.HiddenSingles(6), Is.True);
        Assert.That(solver.GetGrid()[3][4], Is.EqualTo(6));
    }

    [Test]
    public void NakedSinglesFillsACellWithOneRemainingCandidate()
    {
        var grid = EmptyGrid();
        grid[4][0] = 1;
        grid[4][1] = 2;
        grid[4][2] = 3;
        grid[0][4] = 4;
        grid[1][4] = 5;
        grid[2][4] = 6;
        grid[3][3] = 7;
        grid[3][5] = 8;
        var solver = new SudokuSolver("naked single", grid);

        Assert.That(solver.NakedSingles(), Is.True);
        Assert.That(solver.GetGrid()[4][4], Is.EqualTo(9));
    }

    [Test]
    public void NakedPairsEliminatesCandidatesInARowToPlaceASingle()
    {
        var grid = EmptyGrid();
        grid[0] = [0, 0, 0, 1, 3, 5, 6, 8, 9];
        grid[4][0] = 4;
        grid[5][1] = 4;
        var solver = new SudokuSolver("naked pair row", grid);

        Assert.That(solver.NakedPairs(), Is.True);
        Assert.That(solver.GetGrid()[0][2], Is.EqualTo(4));
    }

    [Test]
    public void NakedPairsReturnsFalseWhenNoNakedPairsExist()
    {
        var grid = EmptyGrid();
        var solver = new SudokuSolver("no naked pairs", grid);

        Assert.That(solver.NakedPairs(), Is.False);
    }

    private static int[][] EmptyGrid() =>
        Enumerable.Range(0, Constants.GridSize)
            .Select(_ => new int[Constants.GridSize])
            .ToArray();
}
