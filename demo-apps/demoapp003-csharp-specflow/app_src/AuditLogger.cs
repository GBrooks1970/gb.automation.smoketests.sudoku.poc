namespace DemoApp003.Sudoku;

public sealed class AuditLogger
{
    private readonly string _puzzleName;
    private readonly int[][] _initialGrid;
    private readonly AuditConfig _config;
    private readonly List<AuditEvent> _events = [];
    private int _currentIteration;

    public AuditLogger(string puzzleName, IReadOnlyList<IReadOnlyList<int>> initialGrid, AuditConfig config)
    {
        _puzzleName = puzzleName;
        _initialGrid = GridHelpers.DeepCopy(initialGrid);
        _config = config;
    }

    public bool IsEnabled() => _config.Enabled;

    public void StartIteration() => _currentIteration++;

    public void LogChange(string algorithm, IReadOnlyList<CellChange> changes, int? algorithmParam = null)
    {
        if (!IsEnabled() || changes.Count == 0)
        {
            return;
        }

        _events.Add(new AuditEvent(_currentIteration, algorithm, algorithmParam, changes.ToArray()));
    }

    public AuditTrail GetTrail(IReadOnlyList<IReadOnlyList<int>> finalGrid, string status)
    {
        var totalChanges = _events.Sum(item => item.Changes.Count);
        var statistics = new AuditStatistics(
            UnitCompletion: CountChanges("UnitCompletion"),
            HiddenSingles: CountChanges("HiddenSingles"),
            NakedSingles: CountChanges("NakedSingles"));

        return new AuditTrail(
            _puzzleName,
            _initialGrid,
            GridHelpers.DeepCopy(finalGrid),
            status,
            _events.ToArray(),
            totalChanges,
            statistics);
    }

    private int CountChanges(string algorithm) =>
        _events.Where(item => item.Algorithm == algorithm).Sum(item => item.Changes.Count);
}
