namespace DemoApp003.Sudoku;

public sealed record CellPosition(int Row, int Col);

public sealed record CellChange(
    CellPosition Cell,
    int OldValue,
    int NewValue,
    string? Reason = null);

public sealed record AuditEvent(
    int Iteration,
    string Algorithm,
    int? AlgorithmParam,
    IReadOnlyList<CellChange> Changes);

public sealed record AuditStatistics(
    int UnitCompletion,
    int HiddenSingles,
    int NakedSingles);

public sealed record AuditTrail(
    string PuzzleName,
    IReadOnlyList<IReadOnlyList<int>> InitialGrid,
    IReadOnlyList<IReadOnlyList<int>> FinalGrid,
    string Status,
    IReadOnlyList<AuditEvent> Events,
    int TotalChanges,
    AuditStatistics Statistics);

public sealed record AuditConfig(bool Enabled = false);
