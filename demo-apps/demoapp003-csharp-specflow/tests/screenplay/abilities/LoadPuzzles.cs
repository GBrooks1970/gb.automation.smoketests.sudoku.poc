using DemoApp003.Specs.Screenplay.Support;
using DemoApp003.Sudoku;

namespace DemoApp003.Specs.Screenplay.Abilities;

public sealed class LoadPuzzles : IAbility
{
    private readonly PuzzleLoader? _loader;
    private readonly Exception? _error;

    private LoadPuzzles(string filePath)
    {
        try
        {
            _loader = new PuzzleLoader(filePath);
        }
        catch (Exception ex)
        {
            _error = ex;
        }
    }

    public static LoadPuzzles From(string filePath) => new(filePath);

    public IReadOnlyList<Puzzle> GetAll() => _loader?.GetAllPuzzles() ?? [];

    public Puzzle? GetByName(string name) => _loader?.GetPuzzleByName(name);

    public IReadOnlyList<Puzzle> GetByDifficulty(string difficulty) =>
        _loader?.GetPuzzlesByDifficulty(difficulty) ?? [];

    public Puzzle? GetByIndex(int index) => _loader?.GetPuzzleByIndex(index);

    public int GetCount() => _loader?.GetPuzzleCount() ?? 0;

    public Exception? GetError() => _error;
}
