using DemoApp003.Specs.Screenplay.Support;
using DemoApp003.Sudoku;

namespace DemoApp003.Specs.Screenplay.Abilities;

public sealed class UseSudokuSolver : IAbility
{
    private SudokuSolver _solver = new("test");
    private bool _auditEnabled;

    public bool AlgorithmMadeProgress { get; private set; }
    public string Result { get; private set; } = "";
    public CellPosition TargetCell { get; private set; } = new(0, 0);
    public int TargetValue { get; private set; }
    public int[][] GridSnapshot { get; private set; } = [];
    public string ValidationResult { get; private set; } = "";
    public IReadOnlyList<SudokuSolver> MultipleSolvers { get; private set; } = [];
    public Exception? SolverError { get; private set; }
    public AuditTrail? LastAuditTrail { get; private set; }

    // Orchestration-ordering instrumentation (SUD-20 / BACKLOG-051): a solve run that always
    // captures the audit event sequence so orchestration step definitions can assert real
    // algorithm ordering and no-execution counts instead of inferring them from the overall
    // solve status. Deliberately separate from `LastAuditTrail`, which governs the opt-in audit
    // trail feature and must stay unaffected — the "Solver without audit logging produces no
    // trail" scenario asserts `LastAuditTrail` is `null` after a plain solve.
    public IReadOnlyList<AuditEvent> LastOrderingEvents { get; private set; } = [];
    public int LastOrderingIterations { get; private set; }

    public void Initialise(string name, IReadOnlyList<IReadOnlyList<int>>? grid = null)
    {
        _solver = new SudokuSolver(name, grid);
        LastAuditTrail = null;
    }

    public SudokuSolver GetSolver() => _solver;

    public void ApplyUnitCompletion() => AlgorithmMadeProgress = _solver.UnitCompletion();

    public void ApplyHiddenSingles(int target) => AlgorithmMadeProgress = _solver.HiddenSingles(target);

    public void ApplyNakedSingles() => AlgorithmMadeProgress = _solver.NakedSingles();

    public void SolvePuzzle()
    {
        var orchestrator = new SudokuOrchestrator(_solver);
        Result = orchestrator.Solve();
        LastAuditTrail = null;
    }

    public void SolvePuzzleWithAudit()
    {
        var orchestrator = new SudokuOrchestrator(_solver, new AuditConfig(Enabled: _auditEnabled));
        Result = orchestrator.Solve();
        LastAuditTrail = orchestrator.GetAuditTrail();
    }

    public bool IsGridFull() => new SudokuOrchestrator(_solver).IsGridFull();

    public void EnableAudit() => _auditEnabled = true;

    /// <summary>
    /// Runs the full solving loop with audit instrumentation always on, capturing the raw event
    /// sequence and iteration count for algorithm-ordering assertions (SUD-20 / BACKLOG-051).
    /// Behaviour-neutral: SudokuSolver's algorithms only conditionally log to the audit logger,
    /// they never branch on whether one is attached, so the returned status and final grid are
    /// identical to a plain SolvePuzzle() call.
    /// </summary>
    public void SolvePuzzleTrackingOrder()
    {
        var orchestrator = new SudokuOrchestrator(_solver, new AuditConfig(Enabled: true));
        Result = orchestrator.Solve();
        var trail = orchestrator.GetAuditTrail();
        LastOrderingEvents = trail?.Events ?? [];
        LastOrderingIterations = trail?.TotalIterations ?? 0;
    }

    public void SetTargetCell(int row, int col) => TargetCell = new CellPosition(row, col);

    public void SetTargetValue(int value) => TargetValue = value;

    public void TakeSnapshot() => GridSnapshot = _solver.GetGrid();

    public void StoreSnapshot(IReadOnlyList<IReadOnlyList<int>> grid) => GridSnapshot = GridHelpers.DeepCopy(grid);

    public void ReinitialiseFromSnapshot() => Initialise(_solver.Name, GridSnapshot);

    public void ValidateAndStore(int row, int col, int value)
    {
        ValidationResult = _solver.IsValidPlacement(row, col, value) ? "VALID" : "INVALID";
    }

    public void SetMultipleSolvers(IReadOnlyList<SudokuSolver> solvers) => MultipleSolvers = solvers;

    public void SetSolverError(Exception error) => SolverError = error;
}
