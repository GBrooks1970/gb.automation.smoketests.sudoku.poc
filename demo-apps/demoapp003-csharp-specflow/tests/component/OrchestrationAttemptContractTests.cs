using DemoApp003.Sudoku;

namespace DemoApp003.ComponentTests;

[TestFixture]
public sealed class OrchestrationAttemptContractTests
{
    private static readonly int[][] EmptyGrid =
        Enumerable.Range(0, Constants.GridSize)
            .Select(_ => new int[Constants.GridSize])
            .ToArray();

    private static readonly int[][] SolvedExceptOne =
    [
        [5, 3, 4, 6, 7, 8, 9, 1, 0],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    private static readonly int[][] SolvedGrid =
        SolvedExceptOne.Select(row => row.ToArray()).ToArray();

    [Test]
    public void ObserverRecordsEveryUnchangedAttemptInExactOrder()
    {
        var events = new List<AttemptEvent>();
        var solver = new SudokuSolver("empty", EmptyGrid);

        var result = new SudokuOrchestrator(solver, attemptObserver: events.Add).Solve();

        Assert.That(result, Is.EqualTo("STUCK_ON_ADVANCED_LOGIC"));
        Assert.That(events.Select(e => (e.Technique, e.Parameter)), Is.EqualTo(ExpectedIteration()));
        Assert.That(events.Select(e => e.Iteration), Is.EqualTo(Enumerable.Repeat(1, 12)));
        Assert.That(events.Select(e => e.Sequence), Is.EqualTo(Enumerable.Range(1, 12)));
        Assert.That(events, Has.All.Matches<AttemptEvent>(e => !e.Changed && e.Changes.Count == 0));
    }

    [Test]
    public void ObserverRecordsImmutableChangesAndNonTerminalProgress()
    {
        var events = new List<AttemptEvent>();
        var solver = new SudokuSolver("one missing", SolvedExceptOne);

        var result = new SudokuOrchestrator(solver, attemptObserver: events.Add).Solve();

        Assert.That(result, Is.EqualTo("SOLVED"));
        Assert.That(events.Select(e => e.Iteration).Distinct(), Is.EqualTo(new[] { 1, 2 }));
        Assert.That(events.Where(e => e.Iteration == 1).Any(e => e.Changed), Is.True);
        Assert.That(events.Where(e => e.Iteration == 2), Has.All.Matches<AttemptEvent>(e => !e.Changed));

        var changedEvent = events.First(e => e.Changed);
        Assert.That(changedEvent.Changes, Is.EqualTo(new[]
        {
            new CellChange(new CellPosition(0, 8), 0, 2),
        }));
        var changesCollection = (ICollection<CellChange>)changedEvent.Changes;
        Assert.That(
            () => changesCollection.Add(new CellChange(new CellPosition(8, 8), 0, 1)),
            Throws.TypeOf<NotSupportedException>());
    }

    [Test]
    public void CompletedGridExitsBeforeAnySolvingAttempt()
    {
        SolvedGrid[0][8] = 2;
        var events = new List<AttemptEvent>();
        var solver = new SudokuSolver("complete", SolvedGrid);

        var result = new SudokuOrchestrator(solver, attemptObserver: events.Add).Solve();

        Assert.That(result, Is.EqualTo("SOLVED"));
        Assert.That(events, Is.Empty);
    }

    private static IReadOnlyList<(string Technique, int? Parameter)> ExpectedIteration() =>
    [
        ("UnitCompletion", null),
        .. Enumerable.Range(1, 9).Select(digit => ("HiddenSingles", (int?)digit)),
        ("NakedSingles", null),
        ("NakedPairs", null),
    ];
}
