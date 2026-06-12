namespace DemoApp003.Sudoku;

public sealed class SudokuOrchestrator
{
    private readonly SudokuSolver _solver;
    private readonly AuditLogger? _auditLogger;

    public SudokuOrchestrator(SudokuSolver solver, AuditConfig? auditConfig = null)
    {
        _solver = solver;
        if (auditConfig?.Enabled == true)
        {
            _auditLogger = new AuditLogger(solver.Name, solver.OriginalGrid, auditConfig);
            solver.SetAuditLogger(_auditLogger);
        }
    }

    public string Solve()
    {
        // Already-solved inputs return SOLVED immediately without executing any
        // algorithms (v1.0 edge case; shared Gherkin contract "Stop execution
        // when puzzle is completely solved").
        if (IsGridFull())
        {
            return "SOLVED";
        }

        var isProgressing = true;
        while (isProgressing)
        {
            var changedThisPass = false;
            _auditLogger?.StartIteration();

            if (_solver.UnitCompletion())
            {
                changedThisPass = true;
            }

            for (var digit = 1; digit <= Constants.GridSize; digit++)
            {
                if (_solver.HiddenSingles(digit))
                {
                    changedThisPass = true;
                }
            }

            if (_solver.NakedSingles())
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
}
