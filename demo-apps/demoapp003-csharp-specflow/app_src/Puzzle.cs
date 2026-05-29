namespace DemoApp003.Sudoku;

public sealed class Puzzle
{
    public string Name { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public string Description { get; set; } = "";
    public int[][] Grid { get; set; } = [];
}
