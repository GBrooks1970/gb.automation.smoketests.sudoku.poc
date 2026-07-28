using System.Text.Json;
using DemoApp003.Sudoku;

namespace DemoApp003.ComponentTests;

[TestFixture]
public sealed class PuzzleLoaderContractTests
{
    private readonly List<string> _temporaryFiles = [];

    [TearDown]
    public void DeleteTemporaryFiles()
    {
        foreach (var file in _temporaryFiles.Where(File.Exists))
        {
            File.Delete(file);
        }

        _temporaryFiles.Clear();
    }

    [Test]
    public void LoadsIntegerBoundariesAndExposesPuzzleQueries()
    {
        var grid = EmptyGrid();
        grid[0][1] = 9;
        var loader = new PuzzleLoader(WritePuzzle(grid));

        Assert.Multiple(() =>
        {
            Assert.That(loader.GetPuzzleCount(), Is.EqualTo(1));
            Assert.That(loader.GetPuzzleByName("Boundary Grid")?.Grid[0][1], Is.EqualTo(9));
            Assert.That(loader.GetPuzzleByName("boundary grid"), Is.Null);
            Assert.That(loader.GetPuzzlesByDifficulty("EASY"), Has.Count.EqualTo(1));
            Assert.That(loader.GetPuzzleByIndex(0)?.Name, Is.EqualTo("Boundary Grid"));
            Assert.That(loader.GetPuzzleByIndex(-1), Is.Null);
            Assert.That(loader.GetPuzzleByIndex(1), Is.Null);
        });
    }

    [Test]
    [NonParallelizable]
    public void RejectsMissingPuzzleFile()
    {
        var originalDirectory = Directory.GetCurrentDirectory();
        var isolatedDirectory = Directory.CreateTempSubdirectory("sudoku-loader-missing-");

        try
        {
            Directory.SetCurrentDirectory(isolatedDirectory.FullName);

            Assert.That(
                () => new PuzzleLoader($"missing-puzzles-{Guid.NewGuid():N}.json"),
                Throws.TypeOf<FileNotFoundException>().With.Message.Contains("Puzzle file not found"));
        }
        finally
        {
            Directory.SetCurrentDirectory(originalDirectory);
            isolatedDirectory.Delete(recursive: true);
        }
    }

    [Test]
    public void RejectsIncorrectRowCount()
    {
        var grid = EmptyGrid()[..^1];

        Assert.That(
            () => new PuzzleLoader(WritePuzzle(grid)),
            Throws.TypeOf<InvalidDataException>().With.Message.Contains("exactly 9 rows"));
    }

    [Test]
    public void RejectsIncorrectColumnCount()
    {
        var grid = EmptyGrid();
        grid[0] = grid[0][..^1];

        Assert.That(
            () => new PuzzleLoader(WritePuzzle(grid)),
            Throws.TypeOf<InvalidDataException>().With.Message.Contains("exactly 9 columns"));
    }

    [TestCase(-1)]
    [TestCase(10)]
    public void RejectsOutOfRangeCells(int invalidCell)
    {
        var grid = EmptyGrid();
        grid[0][0] = invalidCell;

        Assert.That(
            () => new PuzzleLoader(WritePuzzle(grid)),
            Throws.TypeOf<InvalidDataException>().With.Message.Contains("has invalid value"));
    }

    [TestCase(1.5)]
    [TestCase("1")]
    [TestCase(true)]
    [TestCase(false)]
    public void TypedDeserialisationRejectsNonIntegerCells(object invalidCell)
    {
        var grid = EmptyGrid();
        grid[0][0] = invalidCell;

        Assert.That(
            () => new PuzzleLoader(WritePuzzle(grid)),
            Throws.TypeOf<JsonException>());
    }

    private string WritePuzzle(object[][] grid)
    {
        var path = Path.Combine(Path.GetTempPath(), $"sudoku-component-{Guid.NewGuid():N}.json");
        var document = new
        {
            puzzles = new[]
            {
                new
                {
                    name = "Boundary Grid",
                    difficulty = "easy",
                    description = "Focused loader boundary fixture",
                    grid,
                },
            },
        };

        File.WriteAllText(path, JsonSerializer.Serialize(document));
        _temporaryFiles.Add(path);
        return path;
    }

    private static object[][] EmptyGrid() =>
        Enumerable.Range(0, Constants.GridSize)
            .Select(_ => Enumerable.Repeat<object>(Constants.EmptyCell, Constants.GridSize).ToArray())
            .ToArray();
}
