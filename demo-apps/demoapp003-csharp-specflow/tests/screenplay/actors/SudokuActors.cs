using DemoApp003.Specs.Screenplay.Abilities;
using DemoApp003.Specs.Screenplay.Support;

namespace DemoApp003.Specs.Screenplay.Actors;

public static class SudokuActors
{
    public const string SolverActor = "Solver";

    public static Actor MakeSolverActor() =>
        Actor.Named(SolverActor).WhoCan(new UseSudokuSolver(), LoadPuzzles.From("puzzles.json"));
}
