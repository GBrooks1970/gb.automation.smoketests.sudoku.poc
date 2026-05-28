from __future__ import annotations

import csv
import json
import math
import os
import statistics
import time
from pathlib import Path
from typing import Callable

from app_src import Puzzle, PuzzleLoader, SudokuOrchestrator, SudokuSolver

STACK = "DEMOAPP002"
ITERATIONS = int(os.environ.get("BENCHMARK_ITERATIONS", "10"))
WARMUP_ITERATIONS = int(os.environ.get("BENCHMARK_WARMUP_ITERATIONS", "2"))
PUZZLES = ["Easy Scan Grid", "Logic Squeeze Grid", "Empty Grid"]


def main() -> None:
    records: list[dict] = []

    records.append(measure("puzzle-loader", "all", load_puzzles))

    loader = PuzzleLoader("../puzzles.json")
    for puzzle_name in PUZZLES:
        puzzle = loader.get_puzzle_by_name(puzzle_name)
        if puzzle is None:
            raise RuntimeError(f"Puzzle not found: {puzzle_name}")
        records.append(measure("orchestrator-solve", puzzle_name, lambda p=puzzle: solve_puzzle(p)))

    write_results(records)


def load_puzzles() -> None:
    loader = PuzzleLoader("../puzzles.json")
    if loader.get_puzzle_count() == 0:
        raise RuntimeError("No puzzles loaded")


def solve_puzzle(puzzle: Puzzle) -> None:
    solver = SudokuSolver(puzzle.name, puzzle.grid)
    orchestrator = SudokuOrchestrator(solver)
    orchestrator.solve()


def measure(benchmark_name: str, puzzle_name: str, action: Callable[[], None]) -> dict:
    for _ in range(WARMUP_ITERATIONS):
        action()

    samples: list[float] = []
    started = time.perf_counter()
    for _ in range(ITERATIONS):
        sample_started = time.perf_counter()
        action()
        samples.append((time.perf_counter() - sample_started) * 1000)
    duration_ms = (time.perf_counter() - started) * 1000

    mean_ms = statistics.fmean(samples)
    return {
        "stack": STACK,
        "benchmarkName": benchmark_name,
        "puzzleName": puzzle_name,
        "iterations": ITERATIONS,
        "warmupIterations": WARMUP_ITERATIONS,
        "durationMs": duration_ms,
        "meanMs": mean_ms,
        "medianMs": statistics.median(samples),
        "minMs": min(samples),
        "maxMs": max(samples),
        "stddevMs": math.sqrt(statistics.fmean((sample - mean_ms) ** 2 for sample in samples)),
    }


def write_results(records: list[dict]) -> None:
    timestamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    out_dir = Path.cwd().parents[1] / ".results" / "performance" / STACK
    out_dir.mkdir(parents=True, exist_ok=True)

    json_path = out_dir / f"performance-{timestamp}.json"
    csv_path = out_dir / f"performance-{timestamp}.csv"
    md_path = out_dir / f"performance-{timestamp}.md"

    json_path.write_text(
        json.dumps({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "records": records}, indent=2),
        encoding="utf-8",
    )

    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)

    md_path.write_text(to_markdown(records), encoding="utf-8")
    print(f"Performance results written: {json_path}")


def to_markdown(records: list[dict]) -> str:
    lines = [
        "# DEMOAPP002 Performance Results",
        "",
        "| Benchmark | Puzzle | Iterations | Mean ms | Median ms | Min ms | Max ms | Stddev ms |",
        "|-----------|--------|------------|---------|-----------|--------|--------|-----------|",
    ]
    for record in records:
        lines.append(
            f"| {record['benchmarkName']} | {record['puzzleName']} | {record['iterations']} | "
            f"{record['meanMs']:.3f} | {record['medianMs']:.3f} | {record['minMs']:.3f} | "
            f"{record['maxMs']:.3f} | {record['stddevMs']:.3f} |"
        )
    lines.extend(["", "Reporting mode only: no threshold gate is applied."])
    return "\n".join(lines)


if __name__ == "__main__":
    main()
