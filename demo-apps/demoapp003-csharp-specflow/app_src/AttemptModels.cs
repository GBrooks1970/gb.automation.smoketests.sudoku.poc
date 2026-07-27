namespace DemoApp003.Sudoku;

/// <summary>
/// Immutable, deterministic evidence for one orchestration invocation.
/// Unlike <see cref="AuditEvent"/>, unchanged attempts are retained and no timestamp is recorded.
/// </summary>
public sealed record AttemptEvent(
    int Iteration,
    int Sequence,
    string Technique,
    bool Changed,
    IReadOnlyList<CellChange> Changes,
    int? Parameter = null,
    string? Unit = null,
    int? Index = null);
