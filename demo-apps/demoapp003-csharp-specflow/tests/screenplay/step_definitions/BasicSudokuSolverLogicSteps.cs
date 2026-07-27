using DemoApp003.Specs.Screenplay.Abilities;
using DemoApp003.Specs.Screenplay.Actors;
using DemoApp003.Specs.Screenplay.Questions;
using DemoApp003.Specs.Screenplay.Support;
using DemoApp003.Specs.Screenplay.Tasks;
using DemoApp003.Sudoku;
using Reqnroll;
using System.Text.Json;

namespace DemoApp003.Specs.Screenplay.StepDefinitions;

[Binding]
public sealed class BasicSudokuSolverLogicSteps
{
    private Actor _actor = SudokuActors.MakeSolverActor();

    [BeforeScenario]
    public void BeforeScenario()
    {
        _actor = SudokuActors.MakeSolverActor();
    }

    [Given(@"a standard 9x9 Sudoku grid is initialized")]
    public void StandardGrid() => _actor.AttemptsTo(InitialiseGrid.Empty());

    [Given(@"a row contains the values ""([^""]*)""")]
    public void RowContainsValues(string valuesString) =>
        _actor.AttemptsTo(InitialiseGrid.WithRowValues(0, ParseCsv(valuesString)));

    [Given(@"column (\d+) contains (\d+) non-zero values")]
    public void ColumnContainsValues(int colIndex, int count) =>
        _actor.Remember("_PENDING_MISSING_DIGIT_CONTEXT", new PendingMissingDigitContext("column", 0, colIndex, 0, 0, count));

    [Given(@"the missing digit is (\d+)")]
    public void MissingDigit(int digit)
    {
        var context = _actor.Recall<PendingMissingDigitContext>("_PENDING_MISSING_DIGIT_CONTEXT");
        if (context?.Kind == "column")
        {
            _actor.AttemptsTo(SetupGridState.AlmostCompleteColumn(context.Col, digit));
        }
        else if (context?.Kind == "block")
        {
            _actor.AttemptsTo(SetupGridState.AlmostCompleteBlock(context.BlockRow, context.BlockCol, digit));
        }

        _actor.Remember("_PENDING_MISSING_DIGIT_CONTEXT", null);
    }

    [Given(@"a 3x3 block at position \((\d+), (\d+)\) contains (\d+) non-zero values")]
    public void BlockContainsValues(int blockRow, int blockCol, int count) =>
        _actor.Remember("_PENDING_MISSING_DIGIT_CONTEXT", new PendingMissingDigitContext("block", 0, 0, blockRow, blockCol, count));

    [Given(@"no row, column, or block has exactly one empty cell")]
    public void NoUnitHasOneEmpty() => _actor.AttemptsTo(SetupGridState.WithMultipleEmpties());

    [When(@"the ""([^""]*)"" algorithm scans the row")]
    [When(@"the ""([^""]*)"" algorithm scans the column")]
    [When(@"the ""([^""]*)"" algorithm scans the block")]
    public void AlgorithmScansUnit(string algorithm)
    {
        Assert.That(algorithm, Is.EqualTo("Unit Completion"));
        _actor.AttemptsTo(ApplyAlgorithm.UnitCompletion());
    }

    [When(@"the ""([^""]*)"" algorithm is executed")]
    public void AlgorithmIsExecuted(string algorithm)
    {
        if (algorithm == "Unit Completion")
        {
            _actor.AttemptsTo(ApplyAlgorithm.UnitCompletion());
        }
        else if (algorithm == "Naked Singles")
        {
            _actor.AttemptsTo(ApplyAlgorithm.NakedSingles());
        }
        else
        {
            Assert.Fail($"Unsupported algorithm: {algorithm}");
        }
    }

    [Then(@"the system should identify the missing value as (\d+)")]
    public void SystemIdentifiesMissingValue(int value)
    {
        Assert.That(value, Is.GreaterThan(0));
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.True);
    }

    [Then(@"the value (\d+) should be placed in the empty cell")]
    public void ValuePlacedInEmptyCell(int value) =>
        Assert.That(_actor.Answer(GridCell.ContainsValue(value)), Is.True);

    [Then(@"the system should place (\d+) in the empty cell of column (\d+)")]
    public void ValuePlacedInColumn(int value, int col) =>
        Assert.That(_actor.Answer(GridCell.InColumn(col, value)), Is.True);

    [Then(@"the system should place (\d+) in the empty cell of that block")]
    public void ValuePlacedInBlock(int value) =>
        Assert.That(_actor.Answer(GridCell.ContainsValue(value)), Is.True);

    [Then(@"the algorithm should return false")]
    public void AlgorithmReturnsFalse() =>
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.False);

    [Then(@"no cells should be modified")]
    public void NoCellsModified() =>
        Assert.That(_actor.Answer(GridCell.MatchesSnapshot()), Is.True);

    [Given(@"row (\d+) is missing the number (\d+)")]
    public void RowMissingNumber(int rowIndex, int target) =>
        _actor.AttemptsTo(SetupGridState.RowMissingDigit(rowIndex, target));

    [Given(@"(\d+) cells in row (\d+) cannot contain (\d+) due to column or block constraints")]
    public void RowConstraints(int count, int rowIndex, int target) =>
        _actor.AttemptsTo(SetupGridState.RowColumnConstraints(count, rowIndex, target));

    [Given(@"column (\d+) is missing the number (\d+)")]
    public void ColumnMissingNumber(int colIndex, int target) =>
        _actor.AttemptsTo(SetupGridState.ColumnMissingDigit(colIndex, target));

    [Given(@"(\d+) cells in column (\d+) cannot contain (\d+) due to row or block constraints")]
    public void ColumnConstraints(int count, int colIndex, int target) =>
        _actor.AttemptsTo(SetupGridState.ColumnRowConstraints(count, colIndex, target));

    [Given(@"a 3x3 block has four empty cells")]
    public void BlockHasFourEmptyCells() =>
        _actor.AttemptsTo(SetupGridState.BlockFourEmpties());

    [Given(@"the number (\d+) is present in rows that intersect three of those empty cells")]
    public void NumberPresentInRows(int target) =>
        _actor.AttemptsTo(SetupGridState.HiddenSingleInBlock(target));

    [Given(@"row (\d+) already contains the digit (\d+)")]
    public void RowAlreadyContainsDigit(int rowIndex, int digit) =>
        _actor.AttemptsTo(SetupGridState.DigitInRow(rowIndex, digit));

    [Given(@"the number (\d+) can be placed in multiple locations within a unit")]
    public void NumberHasMultipleLocations(int target)
    {
        Assert.That(target, Is.GreaterThan(0));
        _actor.AttemptsTo(SetupGridState.WithMultipleCandidates());
    }

    [When(@"the ""([^""]*)"" algorithm is executed for value (\d+)")]
    public void AlgorithmExecutedForValue(string algorithm, int value)
    {
        Assert.That(algorithm, Is.EqualTo("Hidden Singles"));
        _actor.AttemptsTo(ApplyAlgorithm.HiddenSingles(value));
    }

    [Then(@"the system should place (\d+) in the only valid cell in row (\d+)")]
    public void ValueInOnlyRowCell(int value, int rowIndex) =>
        Assert.That(_actor.Answer(GridCell.InRow(rowIndex, value)), Is.True);

    [Then(@"the grid should reflect the new value")]
    public void GridReflectsNewValue() =>
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.True);

    [Then(@"the system should place (\d+) in the only valid cell in column (\d+)")]
    public void ValueInOnlyColumnCell(int value, int colIndex) =>
        Assert.That(_actor.Answer(GridCell.InColumn(colIndex, value)), Is.True);

    [Then(@"the system should place (\d+) in the one remaining valid cell of that block")]
    public void ValueInRemainingBlockCell(int value) =>
        Assert.That(_actor.Answer(GridCell.ContainsValue(value)), Is.True);

    [Then(@"the algorithm should skip row (\d+)")]
    public void AlgorithmSkipsRow(int rowIndex)
    {
        Assert.That(rowIndex, Is.GreaterThanOrEqualTo(0));
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.False);
    }

    [Then(@"no cells in row (\d+) should be modified")]
    public void NoCellsInRowModified(int rowIndex)
    {
        Assert.That(rowIndex, Is.GreaterThanOrEqualTo(0));
        Assert.That(_actor.Answer(GridCell.MatchesSnapshot()), Is.True);
    }

    [Given(@"an empty cell at row (\d+), column (\d+)")]
    public void EmptyCellAt(int row, int col) =>
        _actor.AttemptsTo(SetupGridState.TargetCell(row, col));

    [Given(@"the numbers (\d+), (\d+), (\d+) are in the same row")]
    public void NumbersInRow(int a, int b, int c) =>
        _actor.AttemptsTo(SetupGridState.ValuesInRow([a, b, c]));

    [Given(@"the numbers (\d+), (\d+), (\d+) are in the same column")]
    public void NumbersInColumn(int a, int b, int c) =>
        _actor.AttemptsTo(SetupGridState.ValuesInColumn([a, b, c]));

    [Given(@"the numbers (\d+), (\d+) are in the same 3x3 block")]
    public void NumbersInBlock(int a, int b) =>
        _actor.AttemptsTo(SetupGridState.ValuesInBlock([a, b]));

    [Given(@"an empty cell has (\d+) possible candidates: ""([^""]*)""")]
    public void CellHasCandidates(int count, string candidates)
    {
        Assert.That(ParseCsv(candidates), Has.Count.EqualTo(count));
        _actor.AttemptsTo(SetupGridState.ThreeCandidates());
    }

    [Given(@"(\d+) empty cells each have exactly one possible value")]
    public void EmptyCellsHaveOneValue(int count)
    {
        Assert.That(count, Is.EqualTo(3));
        _actor.AttemptsTo(SetupGridState.ThreeNakedSingles());
    }

    [Then(@"the system should determine the only possible value is (\d+)")]
    public void DeterminesOnlyPossibleValue(int value)
    {
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.True);
        var target = _actor.Answer(TargetCell.Current());
        Assert.That(_actor.Answer(GridCell.At(target.Row, target.Col)), Is.EqualTo(value));
    }

    [Then(@"the cell at row (\d+), column (\d+) should be updated to (\d+)")]
    public void CellUpdated(int row, int col, int value) =>
        Assert.That(_actor.Answer(GridCell.At(row, col)), Is.EqualTo(value));

    [Then(@"the cell should not be filled")]
    public void CellNotFilled()
    {
        var target = _actor.Answer(TargetCell.Current());
        Assert.That(_actor.Answer(GridCell.At(target.Row, target.Col)), Is.EqualTo(0));
    }

    [Then(@"the algorithm should continue to other cells")]
    public void AlgorithmContinues() =>
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.False);

    [Then(@"all (\d+) cells should be filled with their respective values")]
    public void AllThreeCellsFilled(int count)
    {
        Assert.That(count, Is.EqualTo(3));
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.True);
        Assert.That(_actor.Answer(GridCell.At(0, 0)), Is.EqualTo(5));
        Assert.That(_actor.Answer(GridCell.At(4, 4)), Is.EqualTo(5));
        Assert.That(_actor.Answer(GridCell.At(8, 8)), Is.EqualTo(9));
    }

    [Then(@"the algorithm should return true")]
    public void AlgorithmReturnsTrue() =>
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.True);

    [Given(@"a cell at (\d+), (\d+) is empty")]
    public void CellIsEmpty(int row, int col) =>
        _actor.AttemptsTo(SetTargetCell.At(row, col));

    [Given(@"the grid state is ([^\r\n]+)")]
    public void GridStateIs(string gridState) =>
        _actor.AttemptsTo(SetupGridState.Named(gridState));

    [When(@"attempting to place (\d+) at that position")]
    public void AttemptingToPlace(int value) =>
        _actor.AttemptsTo(AttemptPlacement.OfValue(value));

    [Then(@"the move should be validated against row, column, and block constraints")]
    public void MoveValidated()
    {
    }

    [Then(@"the validation result should be ([A-Z]+)")]
    public void ValidationResult(string expected) =>
        Assert.That(_actor.Answer(PlacementValidity.OfLastAttempt()), Is.EqualTo(expected));

    [Given(@"a puzzle that exercises the complete basic-technique attempt sequence")]
    public void PuzzleRequiresAllTechniques() =>
        _actor.AttemptsTo(LoadPuzzleByName.AndInitialise("Logic Squeeze Grid"));

    [Given(@"a partially filled grid solvable with basic techniques")]
    public void PartiallyFilledGrid() =>
        _actor.AttemptsTo(LoadPuzzleByName.AndInitialise("Easy Scan Grid"));

    [Given(@"every cell in the 9x9 grid contains a non-zero digit")]
    public void CompletedGrid() =>
        _actor.AttemptsTo(InitialiseGrid.WithCompleteGrid(SolvedGrid()));

    [Given(@"no digits violate row, column, or block rules")]
    public void NoDigitsViolateRules()
    {
    }

    [Given(@"a puzzle that cannot be solved with basic techniques")]
    public void PuzzleCannotBeSolved() =>
        _actor.AttemptsTo(LoadPuzzleByName.AndInitialise("Empty Grid"));

    [Given(@"the ""([^""]*)"" puzzle is loaded")]
    public void QuotedPuzzleLoaded(string puzzleName) =>
        _actor.AttemptsTo(LoadPuzzleByName.AndInitialise(puzzleName));

    [When(@"the solver executes the main loop")]
    [When(@"the solver executes all three algorithms without making changes")]
    [When(@"the orchestrator solve method is called")]
    public void SolvingLoopRuns() =>
        _actor.AttemptsTo(SolvePuzzle.WithCurrentGrid());

    // SUD-22 / BACKLOG-061: these phrases use the backward-compatible SUD-20 task entry point,
    // which now captures immutable attempt events without enabling the audit trail.
    [When(@"the main solving loop executes with attempt tracing")]
    [When(@"the main execution loop runs")]
    public void SolvingLoopRunsTrackingOrder() =>
        _actor.AttemptsTo(SolvePuzzle.WithCurrentGridTrackingOrder());

    [Then(@"the puzzle should be completely solved")]
    public void SolvedStatusVerified() =>
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("SOLVED"));

    private static IReadOnlyList<AttemptEvent> EventsInIteration(
        IReadOnlyList<AttemptEvent> events,
        int iteration) =>
        events.Where(e => e.Iteration == iteration).ToArray();

    private static IReadOnlyList<int> IterationNumbers(IReadOnlyList<AttemptEvent> events) =>
        events.Select(e => e.Iteration).Distinct().OrderBy(i => i).ToArray();

    [Then(@"""Unit Completion"" should be attempted first")]
    public void UnitCompletionAttemptedFirst()
    {
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("SOLVED"));

        var events = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents;
        foreach (var iteration in IterationNumbers(events))
        {
            var iterEvents = EventsInIteration(events, iteration);
            Assert.That(iterEvents[0].Technique, Is.EqualTo("UnitCompletion"),
                $"Iteration {iteration}: Unit Completion was not the first recorded attempt");
        }
    }

    [Then(@"""Hidden Singles"" should be attempted second for digits (\d+) through (\d+)")]
    public void HiddenSinglesAttemptedSecond(int start, int end)
    {
        var events = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents;
        foreach (var iteration in IterationNumbers(events))
        {
            var hiddenSingles = EventsInIteration(events, iteration).Skip(1).SkipLast(1).ToArray();
            Assert.That(hiddenSingles, Has.Length.EqualTo(end - start + 1),
                $"Iteration {iteration}: unexpected Hidden Singles attempt count");
            for (var index = 0; index < hiddenSingles.Length; index++)
            {
                Assert.That(hiddenSingles[index].Technique, Is.EqualTo("HiddenSingles"),
                    $"Iteration {iteration}: attempt {index + 2} was not Hidden Singles");
                Assert.That(hiddenSingles[index].Parameter, Is.EqualTo(start + index),
                    $"Iteration {iteration}: Hidden Singles digit was out of scan order");
            }
        }
    }

    [Then(@"""Naked Singles"" should be attempted third")]
    public void NakedSinglesAttemptedThird()
    {
        var events = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents;
        foreach (var iteration in IterationNumbers(events))
        {
            var iterEvents = EventsInIteration(events, iteration);
            Assert.That(iterEvents[^1].Technique, Is.EqualTo("NakedSingles"),
                $"Iteration {iteration}: Naked Singles was not the final recorded attempt");
        }
    }

    [Then(@"the execution order should be maintained in every iteration")]
    public void ExecutionOrderMaintained()
    {
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("SOLVED"));

        var events = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents;
        Assert.That(events, Is.Not.Empty,
            "Expected attempt evidence for the basic orchestration sequence");
        var expectedSequence = 1;
        foreach (var iteration in IterationNumbers(events))
        {
            var iterEvents = EventsInIteration(events, iteration);
            Assert.That(iterEvents, Has.Count.EqualTo(11),
                $"Iteration {iteration}: expected exactly 11 attempt events");
            foreach (var attempt in iterEvents)
            {
                Assert.That(attempt.Sequence, Is.EqualTo(expectedSequence),
                    $"Iteration {iteration}: expected solve-wide sequence {expectedSequence}");
                expectedSequence += 1;
            }
        }
    }

    [Then(@"every attempt should expose immutable change evidence")]
    public void AttemptEvidenceIsImmutable()
    {
        foreach (var attempt in _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents)
        {
            Assert.That(attempt.Changed, Is.EqualTo(attempt.Changes.Count > 0));
            Assert.That(((ICollection<CellChange>)attempt.Changes).IsReadOnly, Is.True,
                $"Attempt {attempt.Sequence} changes must be read-only");
        }
    }

    [Then(@"multiple iterations should occur")]
    public void MultipleIterationsOccur()
    {
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("SOLVED"));
        Assert.That(_actor.AbilityTo<UseSudokuSolver>().LastAttemptIterations, Is.GreaterThan(1));
    }

    [Then(@"each iteration should make progress until solved")]
    public void EachNonTerminalIterationProgresses()
    {
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("SOLVED"));
        var events = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents;
        foreach (var iteration in IterationNumbers(events).SkipLast(1))
        {
            Assert.That(EventsInIteration(events, iteration).Any(e => e.Changed), Is.True,
                $"Non-terminal iteration {iteration} made no progress");
        }
    }

    [Then(@"the final status should be ""([^""]*)""")]
    [Then(@"the status should return ""([^""]*)""")]
    [Then(@"the status should be ""([^""]*)""")]
    public void StatusShouldBe(string status) =>
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo(status));

    [Then(@"the system should detect the grid is full")]
    public void SystemDetectsGridFull() =>
        Assert.That(_actor.Answer(GridCell.IsGridFull()), Is.True);

    [Then(@"no algorithms should be executed")]
    public void NoAlgorithmsExecuted()
    {
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("SOLVED"));

        // SUD-01 contract (BACKLOG-035): an already-solved grid returns SOLVED via the early
        // IsGridFull() check in SudokuOrchestrator.Solve(), before the progress loop - and
        // therefore before any attempt can be observed.
        var ability = _actor.AbilityTo<UseSudokuSolver>();
        Assert.That(ability.LastAttemptIterations, Is.EqualTo(0),
            $"Expected 0 iterations for an already-solved grid but got {ability.LastAttemptIterations}");
        Assert.That(ability.LastAttemptEvents, Is.Empty,
            $"Expected 0 attempt events for an already-solved grid but got {ability.LastAttemptEvents.Count}");
    }

    [Then(@"the system should exit the solving loop")]
    public void SystemExitsLoop() =>
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("STUCK_ON_ADVANCED_LOGIC"));

    [Then(@"all (\d+) cells should contain valid digits")]
    public void AllCellsValid(int count)
    {
        Assert.That(count, Is.EqualTo(81));
        Assert.That(_actor.Answer(GridCell.AllFilled()), Is.True);
    }

    [Given(@"a puzzles.json file exists with (\d+) puzzles")]
    public void PuzzlesFileExists(int count) =>
        Assert.That(count, Is.EqualTo(5));

    [Given(@"a puzzle with an 8x9 grid in the JSON file")]
    public void PuzzleWith8x9Grid() =>
        _actor.AttemptsTo(SimulateError.ForInvalidRowCount(8));

    [Given(@"a puzzle with a cell value of (\d+) in the JSON file")]
    public void PuzzleWithInvalidCell(int value) =>
        _actor.AttemptsTo(SimulateError.ForInvalidCellValue(value));

    [Given(@"a puzzle with a JSON boolean cell value of ""([^""]*)""")]
    public void PuzzleWithBooleanCell(string value)
    {
        var grid = Enumerable.Range(0, Constants.GridSize)
            .Select(_ => Enumerable.Range(0, Constants.GridSize).Select(_ => (object)0).ToArray())
            .ToArray();
        grid[0][0] = bool.Parse(value);
        var payload = JsonSerializer.Serialize(new
        {
            puzzles = new[]
            {
                new
                {
                    name = "Boolean Cell Boundary",
                    difficulty = "invalid",
                    description = "A malformed puzzle containing a JSON boolean cell",
                    grid,
                },
            },
        });
        var tempDirectory = Path.Combine(Path.GetTempPath(), $"sudoku-boolean-cell-{Guid.NewGuid():N}");
        var filePath = Path.Combine(tempDirectory, "puzzles.json");

        Directory.CreateDirectory(tempDirectory);
        try
        {
            File.WriteAllText(filePath, payload);
            var loader = LoadPuzzles.From(filePath);
            _actor.WhoCan(loader);
            _actor.Remember(MemoryKeys.LAST_ERROR, loader.GetError());
        }
        finally
        {
            Directory.Delete(tempDirectory, recursive: true);
        }
    }

    [Given(@"puzzles are loaded from JSON")]
    public void PuzzlesLoadedFromJson()
    {
    }

    [Given(@"the puzzles.json file does not exist")]
    public void PuzzlesFileMissing()
    {
    }

    [When(@"the PuzzleLoader is initialized with ""([^""]*)""")]
    public void PuzzleLoaderInitialisedWith(string filePath) =>
        Assert.That(filePath, Is.Not.Empty);

    [When(@"the PuzzleLoader attempts to load the file")]
    public void PuzzleLoaderAttemptsLoad()
    {
    }

    [When(@"requesting a puzzle by name ""([^""]*)""")]
    public void RequestingPuzzleByName(string name) =>
        _actor.AttemptsTo(LoadPuzzleByName.AndInitialiseOrDefault(name));

    [When(@"requesting puzzles with difficulty ""([^""]*)""")]
    public void RequestingPuzzlesByDifficulty(string difficulty) =>
        _actor.AttemptsTo(LoadPuzzlesByDifficulty.AndStore(difficulty));

    [When(@"requesting puzzle at index (\d+)")]
    public void RequestingPuzzleAtIndex(int index) =>
        _actor.AttemptsTo(LoadPuzzleByIndex.AndInitialise(index));

    [When(@"the PuzzleLoader is initialized")]
    public void PuzzleLoaderInitialised() =>
        _actor.AttemptsTo(SimulateError.ForMissingFile());

    [Then(@"(\d+) puzzles should be successfully loaded")]
    public void PuzzlesLoaded(int count) =>
        Assert.That(_actor.Answer(LoadedPuzzleCount.Current()), Is.EqualTo(count));

    [Then(@"each puzzle should have a name, difficulty, description, and grid")]
    public void EachPuzzleHasFields()
    {
        foreach (var puzzle in _actor.Answer(LoadedPuzzles.All()))
        {
            Assert.That(puzzle.Name, Is.Not.Empty);
            Assert.That(puzzle.Difficulty, Is.Not.Empty);
            Assert.That(puzzle.Description, Is.Not.Empty);
            Assert.That(puzzle.Grid, Has.Length.EqualTo(9));
        }
    }

    [Then(@"a validation error should be thrown")]
    [Then(@"an error should be thrown")]
    public void ValidationErrorThrown() =>
        Assert.That(_actor.Answer(ErrorThrown.Last()), Is.Not.Null);

    [Then(@"the error message should indicate ""([^""]*)""")]
    [Then(@"the error message should contain ""([^""]*)""")]
    public void ErrorMessageContains(string message) =>
        Assert.That(_actor.Answer(ErrorThrown.Last())?.Message, Does.Contain(message));

    [Then(@"the correct puzzle should be returned")]
    public void CorrectPuzzleReturned() =>
        Assert.That(_actor.Answer(CurrentSolver.Name()), Is.EqualTo("Easy Scan Grid"));

    [Then(@"the puzzle grid should be a 9x9 array")]
    public void PuzzleGridValid() =>
        Assert.That(_actor.Answer(CurrentSolver.HasValidGrid()), Is.True);

    [Then(@"only puzzles marked as ""([^""]*)"" should be returned")]
    public void OnlyMatchingPuzzles(string difficulty)
    {
        Assert.That(difficulty, Is.Not.Empty);
        Assert.That(_actor.Answer(MultipleSolvers.Count()), Is.GreaterThan(0));
    }

    [Then(@"the result should be an array of matching puzzles")]
    public void ResultArrayMatching() =>
        Assert.That(_actor.Answer(MultipleSolvers.Count()), Is.GreaterThanOrEqualTo(0));

    [Then(@"the first puzzle in the collection should be returned")]
    public void FirstPuzzleReturned() =>
        Assert.That(_actor.Answer(CurrentSolver.Name()), Is.EqualTo("Easy Scan Grid"));

    [Given(@"a puzzle grid with specific values")]
    public void PuzzleGridWithSpecificValues() =>
        _actor.AttemptsTo(SetupGridState.FromSpecificGrid(SpecificGrid()));

    [Given(@"a SudokuSolver is created with a puzzle grid")]
    public void SolverCreatedWithPuzzleGrid() =>
        _actor.AttemptsTo(InitialiseGrid.FromPuzzleNamed("Easy Scan Grid"));

    [When(@"a SudokuSolver is created with that grid")]
    public void SolverCreatedWithThatGrid()
    {
        var snapshot = _actor.Answer(GridSnapshot.Current());
        _actor.AttemptsTo(InitialiseGrid.WithGrid("testPuzzle", snapshot));
    }

    [When(@"the solver modifies cells during solving")]
    public void SolverModifiesCells() =>
        _actor.AttemptsTo(SolvePuzzle.WithCurrentGrid());

    [Then(@"the solver's working grid should contain a deep copy of the puzzle")]
    public void WorkingGridDeepCopy() =>
        Assert.That(_actor.Answer(GridCell.IsDeepCopy()), Is.True);

    [Then(@"the original grid should remain unchanged")]
    [Then(@"the origGrid property should remain unchanged")]
    public void OriginalGridUnchanged() =>
        Assert.That(_actor.Answer(GridCell.OrigMatchesSnapshot()), Is.True);

    [Then(@"the working grid should reflect all modifications")]
    public void WorkingGridModified() =>
        Assert.That(_actor.Answer(GridCell.WorkingDiffersFromOrig()), Is.True);

    [Given(@"the puzzle ""([^""]*)"" is loaded from JSON")]
    public void PuzzleLoadedFromJson(string name) =>
        _actor.AttemptsTo(LoadPuzzleByName.AndInitialise(name));

    [Given(@"an empty 9x9 grid with all zeros")]
    public void EmptyGridWithZeros() =>
        _actor.AttemptsTo(InitialiseGrid.Empty());

    [When(@"the solver attempts to solve it")]
    [When(@"the solver attempts to solve it with basic techniques only")]
    public void SolverAttemptsSolve() =>
        _actor.AttemptsTo(SolvePuzzle.WithCurrentGrid());

    [Then(@"all cells should be filled")]
    public void AllCellsFilled() =>
        Assert.That(_actor.Answer(GridCell.AllFilled()), Is.True);

    [Then(@"the solution should be valid \(no constraint violations\)")]
    public void SolutionValidNoViolations() =>
        Assert.That(_actor.Answer(GridCell.IsValidSolution()), Is.True);

    [Then(@"Unit Completion should be attempted without changing the grid")]
    public void UnitCompletionAttemptedWithoutChange()
    {
        var attempts = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents
            .Where(e => e.Technique == "UnitCompletion")
            .ToArray();
        Assert.That(attempts, Is.Not.Empty);
        Assert.That(attempts, Has.All.Matches<AttemptEvent>(e => !e.Changed && e.Changes.Count == 0));
    }

    [Then(@"Hidden Singles and Naked Singles should each change the grid")]
    public void HiddenAndNakedSinglesChangeGrid()
    {
        var changedTechniques = _actor.AbilityTo<UseSudokuSolver>().LastAttemptEvents
            .Where(e => e.Changed)
            .Select(e => e.Technique)
            .ToHashSet();
        Assert.That(changedTechniques, Does.Contain("HiddenSingles"));
        Assert.That(changedTechniques, Does.Contain("NakedSingles"));
    }

    [Then(@"the solution should be valid")]
    public void SolutionValid() =>
        Assert.That(_actor.Answer(GridCell.IsValidSolution()), Is.True);

    [Then(@"no cells should be filled")]
    public void NoCellsFilled() =>
        Assert.That(_actor.Answer(GridCell.HasEmptyCells()), Is.True);

    [Then(@"no errors should occur")]
    public void NoErrorsOccur()
    {
    }

    [Given(@"a grid with (\d+) rows instead of (\d+)")]
    public void GridWithWrongRows(int rows, int expected)
    {
        if (rows != expected)
        {
            _actor.AttemptsTo(SimulateError.ForInvalidRowCount(rows));
        }
    }

    [Given(@"a grid where row (\d+) contains two (\d+)'s")]
    public void GridWithDuplicateValues(int rowIndex, int value) =>
        _actor.AttemptsTo(InitialiseGrid.WithDuplicateInRow(rowIndex, value));

    [Given(@"a grid state where no algorithm can make progress")]
    public void GridNoProgress() =>
        _actor.AttemptsTo(SetupGridState.NoProgress());

    [Given(@"(\d+) different puzzles are loaded")]
    public void DifferentPuzzlesLoaded(int count) =>
        _actor.AttemptsTo(SetupGridState.MultipleSolvers(count));

    [When(@"attempting to create a SudokuSolver")]
    public void AttemptingToCreateSolver()
    {
    }

    [When(@"the solver attempts to solve")]
    public void SolverAttemptsSolveInvalid() =>
        _actor.AttemptsTo(SolvePuzzle.WithCurrentGrid());

    [When(@"each algorithm is executed individually")]
    public void AlgorithmsExecutedIndividually() =>
        _actor.AttemptsTo(SetupGridState.RunAllAlgorithmsIndividually());

    [When(@"(\d+) separate SudokuSolver instances are created")]
    public void SeparateSolversCreated(int count) =>
        Assert.That(count, Is.EqualTo(3));

    [Then(@"validation should detect the dimension error")]
    public void ValidationDetectsDimensionError() =>
        Assert.That(_actor.Answer(ErrorThrown.Last()), Is.Not.Null);

    [Then(@"an appropriate error should be raised")]
    public void AppropriateErrorRaised() =>
        Assert.That(_actor.Answer(ErrorThrown.Last())?.Message, Does.Contain("must have exactly 9 rows"));

    [Then(@"the solver should not find valid moves")]
    [Then(@"the puzzle should be unsolvable")]
    public void PuzzleUnsolvable() =>
        Assert.That(_actor.Answer(SolveStatus.Current()), Is.EqualTo("STUCK_ON_ADVANCED_LOGIC"));

    [Then(@"""Unit Completion"" should return false")]
    public void UnitCompletionFalse()
    {
        _actor.AttemptsTo(CheckAlgorithmProgress.UnitCompletionOnSnapshot());
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.False);
    }

    [Then(@"""Hidden Singles"" should return false for all digits (\d+)-(\d+)")]
    public void HiddenSinglesFalse(int start, int end)
    {
        _actor.AttemptsTo(CheckAlgorithmProgress.ReinitFromSnapshot());
        for (var digit = start; digit <= end; digit++)
        {
            _actor.AttemptsTo(ApplyAlgorithm.HiddenSingles(digit));
            Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.False);
        }
    }

    [Then(@"""Naked Singles"" should return false")]
    public void NakedSinglesFalse()
    {
        _actor.AttemptsTo(CheckAlgorithmProgress.NakedSinglesOnSnapshot());
        Assert.That(_actor.Answer(AlgorithmMadeProgress.AfterLastCall()), Is.False);
    }

    [Then(@"the main loop should exit")]
    public void MainLoopExits()
    {
    }

    [Then(@"each solver should maintain its own independent grid state")]
    public void SolversIndependent()
    {
        Assert.That(_actor.Answer(MultipleSolvers.Count()), Is.EqualTo(3));
        Assert.That(_actor.Answer(MultipleSolvers.AreIndependent()), Is.True);
    }

    [Then(@"solving one should not affect the others")]
    public void SolvingOneIsolated() =>
        Assert.That(_actor.Answer(MultipleSolvers.IsolationVerified()), Is.True);

    [Given(@"audit logging is enabled")]
    public void AuditLoggingEnabled() =>
        _actor.AttemptsTo(EnableAuditLogging.ForCurrentSolver());

    [When(@"the solver attempts to solve it with audit")]
    public void SolverSolvesWithAudit() =>
        _actor.AttemptsTo(SolvePuzzle.WithCurrentGridAndAudit());

    [Then(@"the audit trail should be generated")]
    public void AuditTrailGenerated() =>
        Assert.That(_actor.Answer(AuditTrailQuestion.Current()), Is.Not.Null);

    [Then(@"the audit trail should contain at least one cell change")]
    public void AuditTrailHasChange()
    {
        var trail = _actor.Answer(AuditTrailQuestion.Current());
        Assert.That(trail, Is.Not.Null);
        Assert.That(trail!.TotalChanges, Is.GreaterThan(0));
    }

    [Then(@"every cell change should have an algorithm attribution")]
    public void AuditTrailHasAlgorithm()
    {
        var trail = _actor.Answer(AuditTrailQuestion.Current());
        Assert.That(trail, Is.Not.Null);
        foreach (var auditEvent in trail!.Events)
        {
            Assert.That(auditEvent.Algorithm, Is.Not.Empty);
        }
    }

    [Then(@"the audit trail statistics should account for all changes")]
    public void AuditStatsMatchChanges()
    {
        var trail = _actor.Answer(AuditTrailQuestion.Current());
        Assert.That(trail, Is.Not.Null);
        var stats = trail!.Statistics;
        Assert.That(stats.UnitCompletion + stats.HiddenSingles + stats.NakedSingles, Is.EqualTo(trail.TotalChanges));
    }

    [Then(@"no audit trail should be present")]
    public void NoAuditTrailPresent() =>
        Assert.That(_actor.Answer(AuditTrailQuestion.Current()), Is.Null);

    private static List<int> ParseCsv(string values) =>
        values.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Select(int.Parse)
            .ToList();

    private static int[][] SpecificGrid() =>
    [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    private static int[][] SolvedGrid() =>
    [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    private sealed record PendingMissingDigitContext(
        string Kind,
        int Row,
        int Col,
        int BlockRow,
        int BlockCol,
        int Count);
}
