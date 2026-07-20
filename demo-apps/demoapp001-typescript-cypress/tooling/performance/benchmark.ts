import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';
import { performance } from 'perf_hooks';
import { Puzzle, PuzzleLoader } from '../../app_src/PuzzleLoader';
import { SudokuOrchestrator } from '../../app_src/SudokuOrchestrator';
import { SudokuSolver } from '../../app_src/SudokuSolver';
import { createApp } from '../../app_src/server/app';

interface BenchmarkRecord {
  stack: string;
  benchmarkName: string;
  puzzleName: string;
  iterations: number;
  warmupIterations: number;
  durationMs: number;
  meanMs: number;
  medianMs: number;
  minMs: number;
  maxMs: number;
  stddevMs: number;
}

const STACK = 'DEMOAPP001';
const ITERATIONS = Number(process.env.BENCHMARK_ITERATIONS ?? '10');
const WARMUP_ITERATIONS = Number(process.env.BENCHMARK_WARMUP_ITERATIONS ?? '2');
const PUZZLES = ['Easy Scan Grid', 'Logic Squeeze Grid', 'Empty Grid'];

async function main(): Promise<void> {
  const records: BenchmarkRecord[] = [];

  records.push(
    await measure('puzzle-loader', 'all', () => {
      const loader = new PuzzleLoader('../puzzles.json');
      if (loader.getPuzzleCount() === 0) throw new Error('No puzzles loaded');
    })
  );

  const loader = new PuzzleLoader('../puzzles.json');
  for (const puzzleName of PUZZLES) {
    const puzzle = loader.getPuzzleByName(puzzleName);
    if (!puzzle) throw new Error(`Puzzle not found: ${puzzleName}`);
    records.push(await measure('orchestrator-solve', puzzleName, () => solvePuzzle(puzzle)));
  }

  const app = createApp();
  records.push(
    await measure('api-visualise', 'Easy Scan Grid', async () => {
      await request(app).get('/api/visualise/Easy%20Scan%20Grid').expect(200);
    })
  );

  writeResults(records);
}

async function measure(
  benchmarkName: string,
  puzzleName: string,
  action: () => void | Promise<void>
): Promise<BenchmarkRecord> {
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await action();
  }

  const samples: number[] = [];
  const started = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const sampleStarted = performance.now();
    await action();
    samples.push(performance.now() - sampleStarted);
  }
  const durationMs = performance.now() - started;

  return toRecord(benchmarkName, puzzleName, durationMs, samples);
}

function solvePuzzle(puzzle: Puzzle): void {
  const solver = new SudokuSolver(puzzle.name, puzzle.grid);
  const orchestrator = new SudokuOrchestrator(solver);
  orchestrator.solve();
}

function toRecord(
  benchmarkName: string,
  puzzleName: string,
  durationMs: number,
  samples: number[]
): BenchmarkRecord {
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length;

  return {
    stack: STACK,
    benchmarkName,
    puzzleName,
    iterations: ITERATIONS,
    warmupIterations: WARMUP_ITERATIONS,
    durationMs,
    meanMs: mean,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1],
    stddevMs: Math.sqrt(variance),
  };
}

function writeResults(records: BenchmarkRecord[]): void {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const outDir = path.resolve(process.cwd(), '../../.results/performance', STACK);
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `performance-${timestamp}.json`);
  const csvPath = path.join(outDir, `performance-${timestamp}.csv`);
  const mdPath = path.join(outDir, `performance-${timestamp}.md`);

  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)
  );
  fs.writeFileSync(csvPath, toCsv(records));
  fs.writeFileSync(mdPath, toMarkdown(records));

  console.log(`Performance results written: ${jsonPath}`);
}

function toCsv(records: BenchmarkRecord[]): string {
  const columns = [
    'stack',
    'benchmarkName',
    'puzzleName',
    'iterations',
    'warmupIterations',
    'durationMs',
    'meanMs',
    'medianMs',
    'minMs',
    'maxMs',
    'stddevMs',
  ];
  return [
    columns.join(','),
    ...records.map((record) =>
      columns
        .map((column) => JSON.stringify(record[column as keyof BenchmarkRecord] ?? ''))
        .join(',')
    ),
  ].join('\n');
}

function toMarkdown(records: BenchmarkRecord[]): string {
  return [
    '# DEMOAPP001 Performance Results',
    '',
    '| Benchmark | Puzzle | Iterations | Mean ms | Median ms | Min ms | Max ms | Stddev ms |',
    '|-----------|--------|------------|---------|-----------|--------|--------|-----------|',
    ...records.map(
      (record) =>
        `| ${record.benchmarkName} | ${record.puzzleName} | ${record.iterations} | ${format(record.meanMs)} | ${format(record.medianMs)} | ${format(record.minMs)} | ${format(record.maxMs)} | ${format(record.stddevMs)} |`
    ),
    '',
    'Reporting mode only: no threshold gate is applied.',
  ].join('\n');
}

function format(value: number): string {
  return value.toFixed(3);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
