using System.Runtime.ExceptionServices;
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

    public IReadOnlyList<Puzzle> GetAll() => Loader().GetAllPuzzles();

    public Puzzle? GetByName(string name) => Loader().GetPuzzleByName(name);

    public IReadOnlyList<Puzzle> GetByDifficulty(string difficulty) =>
        Loader().GetPuzzlesByDifficulty(difficulty);

    public Puzzle? GetByIndex(int index) => Loader().GetPuzzleByIndex(index);

    public int GetCount() => Loader().GetPuzzleCount();

    public Exception? GetError() => _error;

    // A failed load surfaces as the original loader error, not as empty results.
    private PuzzleLoader Loader()
    {
        if (_error is not null)
        {
            ExceptionDispatchInfo.Capture(_error).Throw();
        }

        return _loader!;
    }
}
