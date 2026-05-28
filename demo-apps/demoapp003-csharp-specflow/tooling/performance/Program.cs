using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.Json;
using DemoApp003.Sudoku;

const string Stack = "DEMOAPP003";
var iterations = int.Parse(Environment.GetEnvironmentVariable("BENCHMARK_ITERATIONS") ?? "10", CultureInfo.InvariantCulture);
var warmupIterations = int.Parse(Environment.GetEnvironmentVariable("BENCHMARK_WARMUP_ITERATIONS") ?? "2", CultureInfo.InvariantCulture);
var puzzleNames = new[] { "Easy Scan Grid", "Logic Squeeze Grid", "Empty Grid" };

var records = new List<BenchmarkRecord>
{
    Measure("puzzle-loader", "all", iterations, warmupIterations, () =>
    {
        var loader = new PuzzleLoader(FindStackFile("puzzles.json"));
        if (loader.GetPuzzleCount() == 0)
        {
            throw new InvalidOperationException("No puzzles loaded");
        }
    }),
};

var loader = new PuzzleLoader(FindStackFile("puzzles.json"));
foreach (var puzzleName in puzzleNames)
{
    var puzzle = loader.GetPuzzleByName(puzzleName)
        ?? throw new InvalidOperationException($"Puzzle not found: {puzzleName}");
    records.Add(Measure("orchestrator-solve", puzzleName, iterations, warmupIterations, () => SolvePuzzle(puzzle)));
}

WriteResults(records);

static void SolvePuzzle(Puzzle puzzle)
{
    var solver = new SudokuSolver(puzzle.Name, puzzle.Grid);
    var orchestrator = new SudokuOrchestrator(solver);
    orchestrator.Solve();
}

static BenchmarkRecord Measure(
    string benchmarkName,
    string puzzleName,
    int iterations,
    int warmupIterations,
    Action action)
{
    for (var i = 0; i < warmupIterations; i++)
    {
        action();
    }

    var samples = new List<double>();
    var total = Stopwatch.StartNew();
    for (var i = 0; i < iterations; i++)
    {
        var sample = Stopwatch.StartNew();
        action();
        sample.Stop();
        samples.Add(sample.Elapsed.TotalMilliseconds);
    }

    total.Stop();
    var mean = samples.Average();
    var sorted = samples.OrderBy(value => value).ToArray();
    var variance = samples.Average(value => Math.Pow(value - mean, 2));

    return new BenchmarkRecord(
        Stack,
        benchmarkName,
        puzzleName,
        iterations,
        warmupIterations,
        total.Elapsed.TotalMilliseconds,
        mean,
        sorted[sorted.Length / 2],
        sorted[0],
        sorted[^1],
        Math.Sqrt(variance));
}

static void WriteResults(IReadOnlyList<BenchmarkRecord> records)
{
    var timestamp = DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ", CultureInfo.InvariantCulture);
    var repoRoot = FindRepoRoot();
    var outDir = Path.Combine(repoRoot, ".results", "performance", Stack);
    Directory.CreateDirectory(outDir);

    var jsonPath = Path.Combine(outDir, $"performance-{timestamp}.json");
    var csvPath = Path.Combine(outDir, $"performance-{timestamp}.csv");
    var mdPath = Path.Combine(outDir, $"performance-{timestamp}.md");

    var payload = new
    {
        generatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture),
        records,
    };

    File.WriteAllText(jsonPath, JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true }));
    File.WriteAllText(csvPath, ToCsv(records));
    File.WriteAllText(mdPath, ToMarkdown(records));

    Console.WriteLine($"Performance results written: {jsonPath}");
}

static string ToCsv(IReadOnlyList<BenchmarkRecord> records)
{
    var builder = new StringBuilder();
    builder.AppendLine("stack,benchmarkName,puzzleName,iterations,warmupIterations,durationMs,meanMs,medianMs,minMs,maxMs,stddevMs");
    foreach (var record in records)
    {
        builder.AppendLine(string.Join(
            ',',
            Quote(record.Stack),
            Quote(record.BenchmarkName),
            Quote(record.PuzzleName),
            record.Iterations,
            record.WarmupIterations,
            Format(record.DurationMs),
            Format(record.MeanMs),
            Format(record.MedianMs),
            Format(record.MinMs),
            Format(record.MaxMs),
            Format(record.StddevMs)));
    }

    return builder.ToString();
}

static string ToMarkdown(IReadOnlyList<BenchmarkRecord> records)
{
    var builder = new StringBuilder();
    builder.AppendLine("# DEMOAPP003 Performance Results");
    builder.AppendLine();
    builder.AppendLine("| Benchmark | Puzzle | Iterations | Mean ms | Median ms | Min ms | Max ms | Stddev ms |");
    builder.AppendLine("|-----------|--------|------------|---------|-----------|--------|--------|-----------|");
    foreach (var record in records)
    {
        builder.AppendLine(
            $"| {record.BenchmarkName} | {record.PuzzleName} | {record.Iterations} | {Format(record.MeanMs)} | {Format(record.MedianMs)} | {Format(record.MinMs)} | {Format(record.MaxMs)} | {Format(record.StddevMs)} |");
    }

    builder.AppendLine();
    builder.AppendLine("Reporting mode only: no threshold gate is applied.");
    return builder.ToString();
}

static string FindStackFile(string fileName) =>
    Path.Combine(FindRepoRoot(), "demo-apps", "demoapp003-csharp-specflow", fileName);

static string FindRepoRoot()
{
    var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (directory is not null)
    {
        if (Directory.Exists(Path.Combine(directory.FullName, ".git")))
        {
            return directory.FullName;
        }

        directory = directory.Parent;
    }

    throw new DirectoryNotFoundException("Could not find repository root");
}

static string Quote(string value) => JsonSerializer.Serialize(value);

static string Format(double value) => value.ToString("0.000", CultureInfo.InvariantCulture);

internal sealed record BenchmarkRecord(
    string Stack,
    string BenchmarkName,
    string PuzzleName,
    int Iterations,
    int WarmupIterations,
    double DurationMs,
    double MeanMs,
    double MedianMs,
    double MinMs,
    double MaxMs,
    double StddevMs);
