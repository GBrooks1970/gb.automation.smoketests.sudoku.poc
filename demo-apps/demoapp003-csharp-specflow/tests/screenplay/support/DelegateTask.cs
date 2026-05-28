namespace DemoApp003.Specs.Screenplay.Support;

public sealed class DelegateTask(Action<Actor> action) : ITask
{
    public void PerformAs(Actor actor) => action(actor);
}
