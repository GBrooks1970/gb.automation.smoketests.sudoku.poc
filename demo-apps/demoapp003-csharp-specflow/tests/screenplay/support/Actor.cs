namespace DemoApp003.Specs.Screenplay.Support;

public sealed class Actor
{
    private readonly Dictionary<Type, IAbility> _abilities = [];
    private readonly Dictionary<string, object?> _memory = [];

    private Actor(string name) => Name = name;

    public string Name { get; }

    public static Actor Named(string name) => new(name);

    public Actor WhoCan(params IAbility[] abilities)
    {
        foreach (var ability in abilities)
        {
            _abilities[ability.GetType()] = ability;
        }

        return this;
    }

    public void AttemptsTo(params ITask[] tasks)
    {
        foreach (var task in tasks)
        {
            task.PerformAs(this);
        }
    }

    public T Answer<T>(IQuestion<T> question) => question.AnsweredBy(this);

    public TAbility AbilityTo<TAbility>()
        where TAbility : class, IAbility
    {
        if (_abilities.TryGetValue(typeof(TAbility), out var ability))
        {
            return (TAbility)ability;
        }

        throw new InvalidOperationException($"{Name} does not have ability {typeof(TAbility).Name}");
    }

    public void Remember(string key, object? value) => _memory[key] = value;

    public T? Recall<T>(string key, T? defaultValue = default)
    {
        if (!_memory.TryGetValue(key, out var value) || value is null)
        {
            return defaultValue;
        }

        return (T)value;
    }

    public void ForgetAll() => _memory.Clear();
}
