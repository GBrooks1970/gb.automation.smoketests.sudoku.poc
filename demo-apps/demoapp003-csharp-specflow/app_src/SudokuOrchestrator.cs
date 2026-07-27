namespace DemoApp003.Sudoku;

public sealed class SudokuOrchestrator
{
    private readonly SudokuSolver _solver;
    private readonly AuditLogger? _auditLogger;
    private readonly Action<AttemptEvent>? _attemptObserver;
    private int _attemptSequence;

    public SudokuOrchestrator(
        SudokuSolver solver,
        AuditConfig? auditConfig = null,
        Action<AttemptEvent>? attemptObserver = null)
    {
        _solver = solver;
        _attemptObserver = attemptObserver;
        if (auditConfig?.Enabled == true)
        {
            _auditLogger = new AuditLogger(solver.Name, solver.OriginalGrid, auditConfig);
            solver.SetAuditLogger(_auditLogger);
        }
    }

    public string Solve()
    {
        _attemptSequence = 0;

        // Already-solved inputs return SOLVED immediately without executing any
        // algorithms (v1.0 edge case; shared Gherkin contract "Stop execution
        // when puzzle is completely solved").
        if (IsGridFull())
        {
            return "SOLVED";
        }

        var isProgressing = true;
        var iteration = 0;
        while (isProgressing)
        {
            iteration += 1;
            var changedThisPass = false;
            _auditLogger?.StartIteration();

            if (RunAttempt(iteration, "UnitCompletion", _solver.UnitCompletion))
            {
                changedThisPass = true;
            }

            for (var digit = 1; digit <= Constants.GridSize; digit++)
            {
                if (RunAttempt(iteration, "HiddenSingles", () => _solver.HiddenSingles(digit), digit))
                {
                    changedThisPass = true;
                }
            }

            if (RunAttempt(iteration, "NakedSingles", _solver.NakedSingles))
            {
                changedThisPass = true;
            }

            isProgressing = changedThisPass;
        }

        return IsGridFull() ? "SOLVED" : "STUCK_ON_ADVANCED_LOGIC";
    }

    public bool IsGridFull() =>
        _solver.Grid.All(row => row.All(cell => cell != Constants.EmptyCell));

    public AuditTrail? GetAuditTrail()
    {
        if (_auditLogger is null)
        {
            return null;
        }

        var status = IsGridFull() ? "SOLVED" : "STUCK_ON_ADVANCED_LOGIC";
        return _auditLogger.GetTrail(_solver.Grid, status);
    }

    private bool RunAttempt(int iteration, string technique, Func<bool> invoke, int? parameter = null)
    {
        if (_attemptObserver is null)
        {
            return invoke();
        }

        var before = _solver.GetGrid();
        var changed = invoke();
        var changes = DiffGrid(before, _solver.GetGrid());
        if (changed != (changes.Count > 0))
        {
            throw new InvalidOperationException(
                $"{technique} returned changed={changed} but produced {changes.Count} cell changes");
        }

        _attemptSequence += 1;
        _attemptObserver(new AttemptEvent(
            Iteration: iteration,
            Sequence: _attemptSequence,
            Technique: technique,
            Changed: changed,
            Changes: changes,
            Parameter: parameter));
        return changed;
    }

    private static IReadOnlyList<CellChange> DiffGrid(
        IReadOnlyList<IReadOnlyList<int>> before,
        IReadOnlyList<IReadOnlyList<int>> after)
    {
        var changes = new List<CellChange>();
        for (var row = 0; row < Constants.GridSize; row++)
        {
            for (var col = 0; col < Constants.GridSize; col++)
            {
                if (before[row][col] != after[row][col])
                {
                    changes.Add(new CellChange(
                        new CellPosition(row, col),
                        before[row][col],
                        after[row][col]));
                }
            }
        }

        return Array.AsReadOnly(changes.ToArray());
    }
}
