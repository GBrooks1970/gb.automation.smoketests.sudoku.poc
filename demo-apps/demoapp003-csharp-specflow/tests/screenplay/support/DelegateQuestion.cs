namespace DemoApp003.Specs.Screenplay.Support;

public sealed class DelegateQuestion<T>(Func<Actor, T> resolver) : IQuestion<T>
{
    public T AnsweredBy(Actor actor) => resolver(actor);
}
