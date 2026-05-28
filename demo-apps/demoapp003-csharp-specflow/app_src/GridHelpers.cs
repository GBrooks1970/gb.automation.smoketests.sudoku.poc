namespace DemoApp003.Sudoku;

public static class GridHelpers
{
    public static int[][] EmptyGrid() =>
        Enumerable.Range(0, Constants.GridSize)
            .Select(_ => Enumerable.Repeat(Constants.EmptyCell, Constants.GridSize).ToArray())
            .ToArray();

    public static int[][] DeepCopy(IReadOnlyList<IReadOnlyList<int>> grid) =>
        grid.Select(row => row.ToArray()).ToArray();
}
