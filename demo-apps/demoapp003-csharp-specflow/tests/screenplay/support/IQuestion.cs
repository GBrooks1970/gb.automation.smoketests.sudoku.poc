namespace DemoApp003.Specs.Screenplay.Support;

public interface IQuestion<out T>
{
    T AnsweredBy(Actor actor);
}
