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
