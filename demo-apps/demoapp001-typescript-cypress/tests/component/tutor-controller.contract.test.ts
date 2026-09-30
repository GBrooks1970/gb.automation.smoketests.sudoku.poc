import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { Script } from 'node:vm';
import { TutorHintResponse } from '../../app_src/server/types';

interface TutorController {
  grid: number[][];
  originalClues: number[][];
  activeHint: TutorHintResponse | null;
  appliedHints: Map<string, { value: number; technique: string }>;
  selectedCell: { row: number; col: number } | null;
  isAutoPlaying: boolean;
  loadClues(grid: number[][]): void;
  clearGrid(): void;
  resetToClues(): void;
  selectCell(row: number, col: number): void;
  inputDigit(digit: number): void;
  requestHint(): Promise<TutorHintResponse | null>;
  applyHint(): boolean;
  toggleAutoStep(): Promise<void>;
  stopAutoStep(): void;
  setLoading(visible: boolean): void;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

class FakeClassList {
  private classes = new Set<string>(['hidden']);

  add(value: string): void {
    this.classes.add(value);
  }

  remove(value: string): void {
    this.classes.delete(value);
  }

  contains(value: string): boolean {
    return this.classes.has(value);
  }

  toggle(value: string, force: boolean): void {
    if (force) this.add(value);
    else this.remove(value);
  }
}

class FakeElement {
  textContent = '';
  innerHTML = '';
  className = '';
  disabled = true;
  dataset: Record<string, string> = {};
  classList = new FakeClassList();
}

class FakeClock {
  private now = 0;
  private nextId = 1;
  private jobs = new Map<number, { at: number; callback: () => unknown }>();

  setTimeout = (callback: () => unknown, delay: number): number => {
    const id = this.nextId++;
    this.jobs.set(id, { at: this.now + delay, callback });
    return id;
  };

  clearTimeout = (id: number): void => {
    this.jobs.delete(id);
  };

  get pendingCount(): number {
    return this.jobs.size;
  }

  async advance(milliseconds: number): Promise<void> {
    const finish = this.now + milliseconds;
    for (;;) {
      const next = [...this.jobs.entries()]
        .filter(([, job]) => job.at <= finish)
        .sort((left, right) => left[1].at - right[1].at)[0];
      if (!next) break;
      const [id, job] = next;
      this.jobs.delete(id);
      this.now = job.at;
      job.callback();
      await settle();
    }
    this.now = finish;
    await settle();
  }
}

interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
}

interface FetchOptions {
  method: string;
  body: string;
  signal: AbortSignal;
}

function harness() {
  const elements = new Map<string, FakeElement>();
  const element = (id: string): FakeElement => {
    if (!elements.has(id)) elements.set(id, new FakeElement());
    return elements.get(id)!;
  };
  const requests: {
    url: string;
    options: FetchOptions;
    response: ReturnType<typeof deferred<FetchResponse>>;
  }[] = [];
  const clock = new FakeClock();
  const sourcePath = path.resolve(__dirname, '../../app_src/server/public/js/tutor.js');
  const source = readFileSync(sourcePath, 'utf8');

  // Execute the production browser controller. Only module plumbing is adapted;
  // fetch, rendering, DOM and timers are controlled seams, not a real browser.
  const script = new Script(
    source
      .replace(/^import \{ renderTutorGrid \} from '\.\/grid\.js';\r?$/m, '')
      .replace('export class SudokuTutorController', 'class SudokuTutorController') +
      '\nSudokuTutorController;',
    { filename: sourcePath }
  );
  const Controller = script.runInNewContext({
    AbortController,
    console,
    document: { getElementById: element },
    renderTutorGrid: () => undefined,
    fetch: (url: string, options: FetchOptions) => {
      const response = deferred<FetchResponse>();
      requests.push({ url, options, response });
      // Deliberately allow late completion even after abort to prove the guards
      // independently of the transport's cancellation behaviour.
      return response.promise;
    },
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
  }) as new () => TutorController;

  const controller = new Controller();
  const resolveHint = (index: number, hint: TutorHintResponse): void => {
    requests[index].response.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => hint,
    });
  };
  return { controller, clock, requests, element, resolveHint };
}

function emptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array<number>(9).fill(0));
}

function boardSnapshot(controller: TutorController): number[][] {
  // Cross-realm VM arrays have different prototypes; compare their plain data.
  return JSON.parse(JSON.stringify(controller.grid)) as number[][];
}

function moveHint(row = 0, col = 0, digit = 3): TutorHintResponse {
  return {
    success: true,
    status: 'HINT_AVAILABLE',
    technique: 'UnitCompletion',
    move: { cell: { row, col }, digit, previousValue: 0 },
    rationale: 'Controlled API response for controller lifecycle tests.',
    eliminations: [],
    highlightCells: [{ row, col }],
  };
}

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

const mutations: { name: string; mutate(controller: TutorController): void }[] = [
  { name: 'clear', mutate: (controller) => controller.clearGrid() },
  {
    name: 'edit',
    mutate: (controller) => {
      controller.selectCell(8, 8);
      controller.inputDigit(6);
    },
  },
  {
    name: 'load',
    mutate: (controller) => {
      const clues = emptyGrid();
      clues[5][5] = 4;
      controller.loadClues(clues);
    },
  },
  { name: 'reset', mutate: (controller) => controller.resetToClues() },
];

test('controller seam: a current hint submits a snapshot and applies exactly one placement', async () => {
  const h = harness();
  const pending = h.controller.requestHint();
  assert.equal(h.requests[0].url, '/api/tutor/hint');
  assert.equal(h.requests[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(h.requests[0].options.body), { grid: emptyGrid() });
  assert.ok(h.requests[0].options.signal instanceof AbortSignal);

  h.resolveHint(0, moveHint());
  assert.equal((await pending)?.status, 'HINT_AVAILABLE');
  assert.equal(h.element('btn-apply-hint').disabled, false);
  assert.equal(h.controller.applyHint(), true);
  assert.equal(h.controller.grid[0][0], 3);
  assert.equal(h.controller.appliedHints.get('0-0')?.value, 3);
  assert.equal(h.controller.activeHint, null);
  assert.equal(h.element('btn-apply-hint').disabled, true);
  assert.equal(h.controller.applyHint(), false);
});

for (const mutation of mutations) {
  test(`controller seam: ${mutation.name} aborts pending hints and discards their late completion`, async () => {
    const h = harness();
    const clues = emptyGrid();
    clues[0][8] = 9;
    h.controller.loadClues(clues);
    const pending = h.controller.requestHint();
    mutation.mutate(h.controller);
    const afterMutation = boardSnapshot(h.controller);
    assert.equal(h.requests[0].options.signal.aborted, true);

    h.resolveHint(0, moveHint());
    assert.equal(await pending, null);
    assert.equal(h.controller.activeHint, null);
    assert.equal(h.controller.applyHint(), false);
    assert.deepEqual(boardSnapshot(h.controller), afterMutation);
    assert.equal(h.element('btn-apply-hint').disabled, true);
    assert.equal(h.element('tutor-status-badge').textContent, 'READY');
    assert.equal(h.element('loading').classList.contains('hidden'), true);
    assert.equal(h.element('error-banner').classList.contains('hidden'), true);
  });

  test(`controller seam: ${mutation.name} invalidates an already displayed hint`, async () => {
    const h = harness();
    const pending = h.controller.requestHint();
    h.resolveHint(0, moveHint());
    await pending;
    mutation.mutate(h.controller);
    const afterMutation = boardSnapshot(h.controller);

    assert.equal(h.controller.activeHint, null);
    assert.equal(h.controller.applyHint(), false);
    assert.deepEqual(boardSnapshot(h.controller), afterMutation);
    assert.equal(h.element('btn-apply-hint').disabled, true);
  });
}

test('controller seam: an older response cannot replace a newer hint on an unchanged grid', async () => {
  const h = harness();
  const older = h.controller.requestHint();
  const newer = h.controller.requestHint();
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.resolveHint(1, moveHint(1, 1, 4));
  await newer;
  h.resolveHint(0, moveHint());

  assert.equal(await older, null);
  assert.equal(h.controller.activeHint?.move?.digit, 4);
  assert.equal(h.controller.applyHint(), true);
  assert.equal(h.controller.grid[0][0], 0);
  assert.equal(h.controller.grid[1][1], 4);
});

test('controller seam: delayed JSON from an older request cannot replace a newer hint', async () => {
  const h = harness();
  const older = h.controller.requestHint();
  const parsed = deferred<TutorHintResponse>();
  h.requests[0].response.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => parsed.promise,
  });
  await settle();
  const newer = h.controller.requestHint();
  h.resolveHint(1, moveHint(2, 2, 5));
  await newer;
  parsed.resolve(moveHint());

  assert.equal(await older, null);
  assert.equal(h.controller.activeHint?.move?.digit, 5);
  assert.equal(h.controller.applyHint(), true);
  assert.equal(h.controller.grid[0][0], 0);
  assert.equal(h.controller.grid[2][2], 5);
});

test('controller seam: editing during JSON parsing discards the parsed hint', async () => {
  const h = harness();
  const pending = h.controller.requestHint();
  const parsed = deferred<TutorHintResponse>();
  h.requests[0].response.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => parsed.promise,
  });
  await settle();
  mutations[1].mutate(h.controller);
  parsed.resolve(moveHint());

  assert.equal(await pending, null);
  assert.equal(h.controller.activeHint, null);
  assert.equal(h.controller.grid[8][8], 6);
  assert.equal(h.controller.grid[0][0], 0);
});

test('controller seam: stale failures and cleanup cannot hide a newer request or show an error', async () => {
  const h = harness();
  const older = h.controller.requestHint();
  const newer = h.controller.requestHint();
  h.requests[0].response.reject(new Error('stale network error'));

  assert.equal(await older, null);
  assert.equal(h.element('loading').classList.contains('hidden'), false);
  assert.equal(h.element('error-banner').classList.contains('hidden'), true);
  h.resolveHint(1, moveHint());
  await newer;
  assert.equal(h.element('loading').classList.contains('hidden'), true);
});

for (const completion of ['clear', 'complete'] as const) {
  test(`controller seam: hint ${completion} preserves an overlapping puzzle-loading indicator`, async () => {
    const h = harness();
    const loading = h.element('loading');
    loading.dataset.puzzleLoading = 'true';
    const pending = h.controller.requestHint();
    assert.equal(loading.classList.contains('hidden'), false);
    assert.match(loading.textContent, /puzzle/i);

    if (completion === 'clear') h.controller.clearGrid();
    h.resolveHint(0, moveHint());
    await pending;
    assert.equal(loading.classList.contains('hidden'), false);
    assert.match(loading.textContent, /puzzle/i);

    loading.dataset.puzzleLoading = 'false';
    h.controller.setLoading(false);
    assert.equal(loading.classList.contains('hidden'), true);
  });
}

test('app/controller seam: beginning a puzzle load invalidates hints before awaiting puzzle fetch', async () => {
  const h = harness();
  const pendingHint = h.controller.requestHint();
  const puzzleResponse = deferred<FetchResponse>();
  let invalidatedBeforeFetch = false;
  const appSourcePath = path.resolve(__dirname, '../../app_src/server/public/js/app.js');
  const appSource = readFileSync(appSourcePath, 'utf8');

  // Exercise the real app load/reset functions with module imports stubbed.
  // This verifies controller coordination, not native module linkage or DOM layout.
  const loadPuzzle = new Script(
    appSource.replace(/^import[\s\S]*?;\r?$/gm, '') + '\ntutor = injectedTutor; loadPuzzleData;',
    { filename: appSourcePath }
  ).runInNewContext({
    injectedTutor: h.controller,
    document: { addEventListener: () => undefined, getElementById: h.element },
    renderGridAtStep: () => undefined,
    fetch: () => {
      invalidatedBeforeFetch = h.requests[0].options.signal.aborted;
      return puzzleResponse.promise;
    },
  }) as (name: string) => Promise<void>;

  const pendingPuzzle = loadPuzzle('Another puzzle');
  assert.equal(invalidatedBeforeFetch, true);
  h.resolveHint(0, moveHint());
  assert.equal(await pendingHint, null);
  assert.equal(h.controller.activeHint, null);
  assert.deepEqual(boardSnapshot(h.controller), emptyGrid());
  assert.equal(h.element('loading').classList.contains('hidden'), false);

  // A controlled failed puzzle fetch completes the app flow without exercising
  // unrelated visualiser rendering or claiming a real API/browser outcome.
  puzzleResponse.resolve({
    ok: false,
    status: 503,
    statusText: 'Unavailable',
    json: async () => ({ message: 'Controlled puzzle-load failure.' }),
  });
  await pendingPuzzle;
  assert.equal(h.element('loading').classList.contains('hidden'), true);
});

test('app/controller seam: puzzle-loading completion preserves an overlapping hint request', async () => {
  const h = harness();
  const appSourcePath = path.resolve(__dirname, '../../app_src/server/public/js/app.js');
  const appSource = readFileSync(appSourcePath, 'utf8');
  const showPuzzleLoading = new Script(
    appSource.replace(/^import[\s\S]*?;\r?$/gm, '') + '\nshowLoading;',
    { filename: appSourcePath }
  ).runInNewContext({
    document: { addEventListener: () => undefined, getElementById: h.element },
  }) as (visible: boolean) => void;

  const pendingHint = h.controller.requestHint();
  showPuzzleLoading(true);
  showPuzzleLoading(false);
  assert.equal(h.element('loading').classList.contains('hidden'), false);
  assert.match(h.element('loading').textContent, /hint/i);

  h.resolveHint(0, moveHint());
  await pendingHint;
  assert.equal(h.element('loading').classList.contains('hidden'), true);
});

test('controller seam: applying rejects a target changed since the submitted snapshot', async () => {
  const h = harness();
  const pending = h.controller.requestHint();
  h.resolveHint(0, moveHint());
  await pending;
  // Simulate a competing owner changing state without using the editor method.
  h.controller.grid[0][0] = 8;

  assert.equal(h.controller.applyHint(), false);
  assert.equal(h.controller.grid[0][0], 8);
  assert.equal(h.controller.appliedHints.size, 0);
  assert.equal(h.element('btn-apply-hint').disabled, true);
});

test('controller seam: applying rejects unrelated grid changes after hint receipt', async () => {
  const h = harness();
  const pending = h.controller.requestHint();
  h.resolveHint(0, moveHint());
  await pending;
  h.controller.grid[8][8] = 6;

  assert.equal(h.controller.applyHint(), false);
  assert.equal(h.controller.grid[0][0], 0);
  assert.equal(h.controller.grid[8][8], 6);
});

test('controller seam: a hint cannot overwrite an original clue', async () => {
  const h = harness();
  const clues = emptyGrid();
  clues[0][0] = 7;
  h.controller.loadClues(clues);
  const pending = h.controller.requestHint();
  h.resolveHint(0, moveHint());
  await pending;

  assert.equal(h.controller.applyHint(), false);
  assert.equal(h.controller.grid[0][0], 7);
  assert.equal(h.controller.appliedHints.size, 0);
});

test('controller seam: applying rejects previousValue that differs from the submitted target', async () => {
  const h = harness();
  const pending = h.controller.requestHint();
  h.resolveHint(0, {
    ...moveHint(),
    move: { cell: { row: 0, col: 0 }, digit: 3, previousValue: 8 },
  });
  await pending;

  assert.equal(h.controller.applyHint(), false);
  assert.deepEqual(boardSnapshot(h.controller), emptyGrid());
  assert.equal(h.controller.appliedHints.size, 0);
});

for (const [label, row, col, digit] of [
  ['negative row', -1, 0, 3],
  ['column outside grid', 0, 9, 3],
  ['fractional coordinate', 0.5, 0, 3],
  ['zero digit', 0, 0, 0],
  ['digit outside range', 0, 0, 10],
  ['fractional digit', 0, 0, 1.5],
] as const) {
  test(`controller seam: applying rejects ${label} without changing the board`, async () => {
    const h = harness();
    const pending = h.controller.requestHint();
    h.resolveHint(0, moveHint(row, col, digit));
    await pending;

    assert.equal(h.controller.applyHint(), false);
    assert.deepEqual(boardSnapshot(h.controller), emptyGrid());
    assert.equal(h.controller.appliedHints.size, 0);
  });
}

test('controller seam: pausing auto-play aborts a pending hint and prevents late scheduling', async () => {
  const h = harness();
  void h.controller.toggleAutoStep();
  assert.equal(h.requests.length, 1);
  assert.equal(h.controller.isAutoPlaying, true);
  await h.controller.toggleAutoStep();
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.resolveHint(0, moveHint());
  await settle();
  await h.clock.advance(2000);

  assert.equal(h.controller.isAutoPlaying, false);
  assert.equal(h.controller.activeHint, null);
  assert.equal(h.controller.grid[0][0], 0);
  assert.equal(h.requests.length, 1);
  assert.equal(h.clock.pendingCount, 0);
});

test('controller seam: an old auto-play continuation cannot apply or stop a restarted run', async () => {
  const h = harness();
  void h.controller.toggleAutoStep();
  h.controller.stopAutoStep();
  void h.controller.toggleAutoStep();
  assert.equal(h.requests.length, 2);
  h.resolveHint(0, moveHint());
  await settle();
  assert.equal(h.controller.isAutoPlaying, true);
  assert.equal(h.clock.pendingCount, 0);
  h.resolveHint(1, moveHint(1, 1, 4));
  await settle();
  await h.clock.advance(600);

  assert.equal(h.controller.grid[0][0], 0);
  assert.equal(h.controller.grid[1][1], 4);
  h.controller.stopAutoStep();
  await h.clock.advance(1000);
  assert.equal(h.requests.length, 2);
});

for (const cancelAt of [599, 600]) {
  test(`controller seam: cancelling auto-play at ${cancelAt}ms prevents further timer work`, async () => {
    const h = harness();
    void h.controller.toggleAutoStep();
    h.resolveHint(0, moveHint());
    await settle();
    await h.clock.advance(cancelAt);
    const beforeStop = boardSnapshot(h.controller);
    h.controller.stopAutoStep();
    await h.clock.advance(2000);

    assert.deepEqual(boardSnapshot(h.controller), beforeStop);
    assert.equal(h.controller.grid[0][0], cancelAt === 600 ? 3 : 0);
    assert.equal(h.requests.length, 1);
    assert.equal(h.clock.pendingCount, 0);
  });
}

test('controller seam: editing while auto-play awaits a response cancels that run', async () => {
  const h = harness();
  void h.controller.toggleAutoStep();
  mutations[1].mutate(h.controller);
  h.resolveHint(0, moveHint());
  await settle();
  await h.clock.advance(2000);

  assert.equal(h.controller.isAutoPlaying, false);
  assert.equal(h.controller.grid[8][8], 6);
  assert.equal(h.controller.grid[0][0], 0);
  assert.equal(h.requests.length, 1);
  assert.equal(h.clock.pendingCount, 0);
});

test('controller seam: a manual request supersedes pending auto-play without reviving it', async () => {
  const h = harness();
  void h.controller.toggleAutoStep();
  const manual = h.controller.requestHint();
  h.resolveHint(1, moveHint(1, 1, 4));
  await manual;
  h.resolveHint(0, moveHint());
  await settle();
  await h.clock.advance(2000);

  assert.equal(h.controller.isAutoPlaying, false);
  assert.equal(h.controller.activeHint?.move?.digit, 4);
  assert.deepEqual(boardSnapshot(h.controller), emptyGrid());
  assert.equal(h.requests.length, 2);
  assert.equal(h.clock.pendingCount, 0);
});

for (const status of ['SOLVED', 'STUCK_ON_ADVANCED_LOGIC', 'INVALID_GRID'] as const) {
  test(`controller seam: terminal ${status} stops auto-play and preserves its result panel`, async () => {
    const h = harness();
    void h.controller.toggleAutoStep();
    h.resolveHint(0, {
      success: true,
      status,
      technique: 'None',
      move: null,
      eliminations: [],
      rationale: `Controlled ${status} outcome.`,
      highlightCells: [],
    });
    await settle();
    await h.clock.advance(2000);

    assert.equal(h.controller.isAutoPlaying, false);
    assert.equal(h.element('tutor-status-badge').textContent, status.replace(/_/g, ' '));
    assert.equal(h.element('btn-apply-hint').disabled, true);
    assert.equal(h.clock.pendingCount, 0);
    assert.equal(h.requests.length, 1);
  });
}
