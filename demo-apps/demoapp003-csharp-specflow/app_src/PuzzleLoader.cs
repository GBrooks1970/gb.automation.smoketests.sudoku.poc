using System.Text.Json;

namespace DemoApp003.Sudoku;

public sealed class PuzzleLoader
{
    private readonly List<Puzzle> _puzzles;

    public PuzzleLoader(string filePath = "puzzles.json")
    {
        var resolvedPath = ResolvePuzzlePath(filePath);
        if (!File.Exists(resolvedPath))
        {
            throw new FileNotFoundException($"Puzzle file not found: {resolvedPath}");
        }

        var content = File.ReadAllText(resolvedPath);
        var data = JsonSerializer.Deserialize<PuzzleCollection>(
            content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        _puzzles = data?.Puzzles ?? [];
        ValidatePuzzles();
    }

    public IReadOnlyList<Puzzle> GetAllPuzzles() => _puzzles.ToArray();

    public Puzzle? GetPuzzleByName(string name) =>
        _puzzles.FirstOrDefault(puzzle => puzzle.Name == name);

    public IReadOnlyList<Puzzle> GetPuzzlesByDifficulty(string difficulty) =>
        _puzzles
            .Where(puzzle => string.Equals(puzzle.Difficulty, difficulty, StringComparison.OrdinalIgnoreCase))
            .ToArray();

    public Puzzle? GetPuzzleByIndex(int index) =>
        index >= 0 && index < _puzzles.Count ? _puzzles[index] : null;

    public int GetPuzzleCount() => _puzzles.Count;

    // An explicit path is authoritative: a rooted path is used as given, and a relative path is
    // resolved once against the assembly directory (as the TypeScript and Python loaders anchor to
    // their own location). There is no directory search and no fallback file.
    private static string ResolvePuzzlePath(string filePath) =>
        Path.IsPathRooted(filePath)
            ? filePath
            : Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, filePath));

    private void ValidatePuzzles()
    {
        for (var index = 0; index < _puzzles.Count; index++)
        {
            var puzzle = _puzzles[index];
            if (puzzle.Grid.Length != Constants.GridSize)
            {
                throw new InvalidDataException(
                    $"Puzzle \"{puzzle.Name}\" (index {index}) must have exactly 9 rows");
            }

            for (var rowIndex = 0; rowIndex < puzzle.Grid.Length; rowIndex++)
            {
                var row = puzzle.Grid[rowIndex];
                if (row.Length != Constants.GridSize)
                {
                    throw new InvalidDataException(
                        $"Puzzle \"{puzzle.Name}\" row {rowIndex} must have exactly 9 columns");
                }

                for (var colIndex = 0; colIndex < row.Length; colIndex++)
                {
                    var cell = row[colIndex];
                    if (cell < Constants.EmptyCell || cell > Constants.MaxDigit)
                    {
                        throw new InvalidDataException(
                            $"Puzzle \"{puzzle.Name}\" has invalid value at [{rowIndex}][{colIndex}]: {cell}");
                    }
                }
            }
        }
    }

    private sealed class PuzzleCollection
    {
        public List<Puzzle> Puzzles { get; set; } = [];
    }
}
