import * as assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';

const browserDirectory = path.resolve(__dirname, '../../app_src/server/public/js');

function runModuleProbe(body: string, originalRedraw = false): string {
  // Real modules run with controlled DOM, fetch and timer seams. The flag stays
  // in this child process; these probes do not claim a native browser outcome.
  // Only the explicitly labelled drift control substitutes the old redraw.
  const source = String.raw`
    const assert = require('node:assert/strict');
    const { readFileSync } = require('node:fs');
    const path = require('node:path');
    const { createContext, SourceTextModule } = require('node:vm');
    const directory = process.argv[2];
    const elements = new Map();
    class Element {
      constructor(tagName = 'div') {
        this.tagName = tagName.toUpperCase();
        this.children = [];
        this.dataset = {};
        this.style = {};
        this.disabled = false;
        this.textContent = '';
        this.value = '';
        this.classes = new Set();
        this.listeners = new Map();
        this.classList = {
          add: value => this.classes.add(value),
          remove: value => this.classes.delete(value),
          contains: value => this.classes.has(value),
          toggle: (value, force) => force ? this.classes.add(value) : this.classes.delete(value),
        };
      }
      set id(value) { this.identifier = value; elements.set(value, this); }
      get id() { return this.identifier; }
      set className(value) { this.classes = new Set(value.split(/\s+/).filter(Boolean)); }
      get className() { return [...this.classes].join(' '); }
      set innerHTML(value) {
        this.children = [];
        this.markup = value;
        this.statistics = null;
        // Only the statistics markup used by renderStats needs nested nodes.
        if (value.includes('class="stat-label"')) {
          this.statistics = { count: new Element('strong'), bar: new Element('div') };
          this.statistics.count.textContent = value.match(/<strong>(.*?)<\/strong>/)[1];
          this.statistics.bar.style.width = value.match(/style="width:([^"]+)"/)[1];
        }
      }
      get innerHTML() { return this.markup || ''; }
      appendChild(child) { this.children.push(child); }
      addEventListener(type, listener) {
        this.listeners.set(type, [...(this.listeners.get(type) || []), listener]);
      }
      fire(type) {
        if (type === 'click' && this.disabled) return;
        for (const listener of this.listeners.get(type) || []) listener({ target: this });
      }
      querySelectorAll(selector) {
        const descendants = this.children.flatMap(child => [child, ...child.descendants()]);
        if (selector === 'li') return descendants.filter(child => child.tagName === 'LI');
        if (selector === 'button[data-digit]') return [];
        const attribute = selector.match(/^\[data-(step-index|algo)="([^"]+)"\]$/);
        assert.ok(attribute, 'Unexpected DOM-seam selector: ' + selector);
        const key = attribute[1] === 'step-index' ? 'stepIndex' : 'algo';
        return descendants.filter(child => child.dataset[key] === attribute[2]);
      }
      querySelector(selector) {
        if (selector === '.stat-label strong') return this.statistics?.count || null;
        if (selector === '.stat-bar') return this.statistics?.bar || null;
        return this.querySelectorAll(selector)[0] || null;
      }
      descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
      scrollIntoView() {}
    }
    function element(id) {
      if (!elements.has(id)) new Element().id = id;
      return elements.get(id);
    }
    const clock = {
      now: 0,
      nextId: 1,
      jobs: new Map(),
      setInterval(callback, delay) {
        const id = this.nextId++;
        this.jobs.set(id, { callback, delay, at: this.now + delay });
        return id;
      },
      clearInterval(id) {
        this.jobs.delete(id);
      },
      advance(milliseconds) {
        const finish = this.now + milliseconds;
        for (;;) {
          const next = [...this.jobs.entries()]
            .filter(([, job]) => job.at <= finish)
            .sort((left, right) => left[1].at - right[1].at)[0];
          if (!next) break;
          const [, job] = next;
          this.now = job.at;
          job.at += job.delay;
          job.callback();
        }
        this.now = finish;
      },
    };
    const fixture = {
      difficulty: 'test', description: 'Controlled replay response, not solver evidence',
      status: 'STUCK_ON_ADVANCED_LOGIC',
      initialGrid: Array.from({ length: 9 }, () => Array(9).fill(0)),
      steps: [
        { stepNumber: 1, algorithm: 'UnitCompletion', cell: { row: 0, col: 0 }, newValue: 1 },
        { stepNumber: 2, algorithm: 'HiddenSingles', cell: { row: 0, col: 1 }, newValue: 2 },
        { stepNumber: 3, algorithm: 'NakedSingles', cell: { row: 1, col: 0 }, newValue: 3 },
      ],
      statistics: { totalSteps: 3, totalIterations: 1,
        stepsByAlgorithm: { unitCompletion: 1, hiddenSingles: 1, nakedSingles: 1,
          nakedPairs: 0, xWing: 0 } },
    };
    fixture.initialGrid[8][8] = 9;
    const requests = [];
    const documentListeners = new Map();
    const document = {
      getElementById: id => id.startsWith('cell-') ? elements.get(id) || null : element(id),
      createElement: tagName => new Element(tagName),
      addEventListener: (type, listener) => documentListeners.set(type, listener),
      querySelector: selector => element('stats-content').querySelector(selector),
    };
    const context = createContext({
      document,
      setInterval: clock.setInterval.bind(clock),
      clearInterval: clock.clearInterval.bind(clock),
      fetch: async url => {
        requests.push(url);
        const payload = url === '/api/puzzles'
          ? { puzzles: [{ name: 'Module fixture', difficulty: 'test' }] }
          : url === '/api/visualise/Module%20fixture' ? fixture : null;
        assert.ok(payload, 'Unexpected fetch-seam URL: ' + url);
        return { ok: true, json: async () => payload };
      },
    });
    const modules = new Map();
    function moduleAt(filename) {
      if (modules.has(filename)) return modules.get(filename);
      let source = readFileSync(filename, 'utf8');
      if (${originalRedraw} && path.basename(filename) === 'app.js') {
        assert.ok(source.includes('onStep(currentIndex());'), 'Drift control must replace the fixed redraw');
        source = source.replace('onStep(currentIndex());', 'onStep(0);');
      }
      const module = new SourceTextModule(source, {
        context,
        identifier: filename,
      });
      modules.set(filename, module);
      return module;
    }
    const resolveImport = (specifier, parent) => {
      assert.ok(specifier.startsWith('./'), 'browser modules must resolve local imports');
      return moduleAt(path.resolve(path.dirname(parent.identifier), specifier));
    };
    async function player() {
      const module = moduleAt(path.join(directory, 'player.js'));
      if (module.status === 'unlinked') await module.link(resolveImport);
      if (module.status === 'linked') await module.evaluate();
      return module.namespace;
    }
    async function bootstrapApp() {
      const module = moduleAt(path.join(directory, 'app.js'));
      await module.link(resolveImport);
      await module.evaluate();
      await documentListeners.get('DOMContentLoaded')();
      return player();
    }
    async function loadReplay() {
      const dropdown = element('puzzle-dropdown');
      dropdown.value = 'Module fixture';
      dropdown.fire('change');
      // The actual change handler starts an async load but returns no promise.
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(element('error-banner').textContent, '');
      assert.deepEqual(requests, ['/api/puzzles', '/api/visualise/Module%20fixture']);
    }
    function assertReplay(api, index) {
      const expectedCells = [['', '', ''], ['1', '', ''], ['1', '2', ''], ['1', '2', '3']][index];
      const expectedGrid = Array(81).fill('');
      [expectedGrid[0], expectedGrid[1], expectedGrid[9]] = expectedCells;
      expectedGrid[80] = '9';
      const grid = Array.from({ length: 81 }, (_, i) => element('cell-' + Math.floor(i / 9) + '-' + i % 9));
      assert.deepEqual(grid.map(cell => cell.textContent), expectedGrid,
        'visualiser grid must match the retained playhead');
      const highlight = [null, 'cell-0-0', 'cell-0-1', 'cell-1-0'][index];
      assert.deepEqual(grid.filter(cell => cell.classList.contains('highlight')).map(cell => cell.id),
        highlight ? [highlight] : []);
      assert.equal(element('cell-8-8').classList.contains('original-clue'), true);
      const events = element('event-list').querySelectorAll('li')
        .filter(event => event.classList.contains('current-step')).map(event => event.dataset.stepIndex);
      assert.deepEqual(events, index ? [String(index)] : []);
      const counts = [[0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]][index];
      ['unitCompletion', 'hiddenSingles', 'nakedSingles', 'nakedPairs', 'xWing'].forEach((key, i) => {
        const row = document.querySelector('[data-algo="' + key + '"]');
        assert.equal(row.querySelector('.stat-label strong').textContent, counts[i] ? '1 (33%)' : '0 (0%)');
        assert.equal(row.querySelector('.stat-bar').style.width, counts[i] ? '33%' : '0%');
      });
      assert.equal(element('step-counter').textContent, 'Step ' + index + ' of 3');
      assert.equal(api.currentIndex(), index);
    }
    function roundTrip(api, index) {
      element('tab-tutor').fire('click');
      assert.equal(api.isPlaying(), false);
      assert.equal(api.currentIndex(), index);
      assert.equal(clock.jobs.size, 0);
      clock.advance(1200);
      element('tab-visualiser').fire('click');
      assertReplay(api, index);
      assert.equal(api.isPlaying(), false);
      assert.equal(element('btn-play').textContent, '▶');
      assert.equal(clock.jobs.size, 0);
    }
    function loadSteps(api, count) {
      const observations = [];
      api.load(Array.from({ length: count }, () => ({})), index => observations.push(index));
      return observations;
    }
    (async () => {
      ${body}
    })().catch(error => {
      process.stderr.write(error.stack);
      process.exitCode = 1;
    });
  `;
  const result = spawnSync(
    process.execPath,
    ['--experimental-vm-modules', '--input-type=commonjs', '-', browserDirectory],
    { input: source, encoding: 'utf8', timeout: 10_000 }
  );
  assert.ifError(result.error);
  assert.equal(
    result.status,
    0,
    `The production browser module probe must pass:\n${result.stderr}`
  );
  return result.stdout;
}

test('browser modules: the real application graph links without missing named exports', () => {
  const linked = runModuleProbe(String.raw`
    await moduleAt(path.join(directory, 'app.js')).link(resolveImport);
    process.stdout.write(JSON.stringify([...modules.keys()].map(file => path.basename(file)).sort()));
  `);
  assert.deepEqual(JSON.parse(linked), ['app.js', 'grid.js', 'player.js', 'tutor.js']);
});

test('player timer seam: pause cancels playback and preserves the current step and controls', () => {
  runModuleProbe(String.raw`
    const api = await player();
    const observations = loadSteps(api, 4);
    api.togglePlay();
    clock.advance(500);
    assert.equal(api.currentIndex(), 1);
    assert.equal(api.isPlaying(), true);
    assert.equal(clock.jobs.size, 1);

    api.pause();
    assert.equal(api.isPlaying(), false);
    assert.equal(clock.jobs.size, 0);
    assert.equal(element('btn-play').textContent, '▶');
    assert.equal(element('btn-play').disabled, false);
    assert.equal(element('btn-prev').disabled, false);
    assert.equal(element('btn-next').disabled, false);
    assert.equal(element('step-counter').textContent, 'Step 1 of 4');
    clock.advance(2500);
    assert.equal(api.currentIndex(), 1);
    assert.deepEqual(observations, [0, 1]);
  `);
});

test('player timer seam: restarting after pause resumes once at the selected speed', () => {
  runModuleProbe(String.raw`
    const api = await player();
    const observations = loadSteps(api, 5);
    api.togglePlay();
    clock.advance(1000);
    api.pause();
    assert.equal(api.currentIndex(), 2);
    api.setSpeed(200);
    assert.equal(clock.jobs.size, 0);
    api.togglePlay();
    assert.equal(api.isPlaying(), true);
    assert.equal(clock.jobs.size, 1);
    clock.advance(199);
    assert.equal(api.currentIndex(), 2);
    clock.advance(1);
    assert.equal(api.currentIndex(), 3);
    assert.deepEqual(observations, [0, 1, 2, 3]);

    api.pause();
    clock.advance(600);
    assert.equal(api.currentIndex(), 3);
    api.togglePlay();
    assert.equal(clock.jobs.size, 1);
    clock.advance(200);
    assert.equal(api.currentIndex(), 4);
    assert.deepEqual(observations, [0, 1, 2, 3, 4]);
    api.pause();
  `);
});

test('player timer seam: pause is safe and idempotent before data and while already stopped', () => {
  runModuleProbe(String.raw`
    const api = await player();
    api.pause();
    api.pause();
    assert.equal(api.isPlaying(), false);
    assert.equal(api.currentIndex(), 0);
    assert.equal(clock.jobs.size, 0);
    assert.equal(element('btn-play').disabled, true);
    assert.equal(element('step-counter').textContent, 'Step 0 of 0');

    const observations = loadSteps(api, 3);
    api.goNext();
    api.pause();
    api.pause();
    clock.advance(2000);
    assert.equal(api.currentIndex(), 1);
    assert.equal(api.isPlaying(), false);
    assert.equal(clock.jobs.size, 0);
    assert.deepEqual(observations, [0, 1]);
  `);
});

test('player timer seam: pause remains safe after playback finishes', () => {
  runModuleProbe(String.raw`
    const api = await player();
    const observations = loadSteps(api, 2);
    api.togglePlay();
    clock.advance(1500);
    assert.equal(api.currentIndex(), 2);
    assert.equal(api.isPlaying(), false);
    assert.equal(clock.jobs.size, 0);
    api.pause();
    api.pause();
    api.togglePlay();
    clock.advance(2000);
    assert.equal(api.currentIndex(), 2);
    assert.equal(api.isPlaying(), false);
    assert.equal(clock.jobs.size, 0);
    assert.equal(element('btn-next').disabled, true);
    assert.equal(element('btn-play').textContent, '▶');
    assert.deepEqual(observations, [0, 1, 2]);
  `);
});

for (const [name, index] of [
  ['initial', 0],
  ['middle', 1],
  ['final', 3],
] as const) {
  test(`app DOM/fetch/timer seams: ${name} playhead survives the actual tab round-trip`, () => {
    runModuleProbe(String.raw`
      const api = await bootstrapApp();
      await loadReplay();
      if (${index} === 1) {
        element('btn-play').fire('click');
        clock.advance(500);
        assert.equal(api.isPlaying(), true);
      } else if (${index} === 3) {
        element('btn-last').fire('click');
      }
      assertReplay(api, ${index});
      roundTrip(api, ${index});
      if (${index} === 3) {
        element('btn-play').fire('click');
        clock.advance(1000);
        assert.equal(api.isPlaying(), false);
        assert.equal(clock.jobs.size, 0);
        assertReplay(api, 3);
      }
    `);
  });
}

test('app DOM/fetch/timer seams: switching without solve data keeps the blank stopped state', () => {
  runModuleProbe(String.raw`
    const api = await bootstrapApp();
    for (let i = 0; i < 2; i++) {
      element('tab-tutor').fire('click');
      element('tab-visualiser').fire('click');
    }
    assert.equal(api.currentIndex(), 0);
    assert.equal(api.isPlaying(), false);
    assert.equal(clock.jobs.size, 0);
    assert.equal(element('step-counter').textContent, 'Step 0 of 0');
    assert.equal(element('btn-play').disabled, true);
    assert.equal(element('error-banner').textContent, '');
    assert.deepEqual(requests, ['/api/puzzles']);
    const cells = [...elements.values()].filter(node => node.tagName === 'TD');
    assert.equal(cells.length, 81);
    assert.ok(cells.every(cell => cell.textContent === ''));
    assert.equal(element('event-list').querySelectorAll('li')
      .filter(event => event.classList.contains('current-step')).length, 0);
  `);
});

test('app DOM/fetch/timer seams: repeated tab switches resume one coherent playback interval', () => {
  runModuleProbe(String.raw`
    const api = await bootstrapApp();
    await loadReplay();
    element('btn-next').fire('click');
    for (let i = 0; i < 3; i++) roundTrip(api, 1);
    const speed = element('speed-slider');
    speed.value = '200';
    speed.fire('input');
    element('btn-play').fire('click');
    assert.equal(api.isPlaying(), true);
    assert.equal(clock.jobs.size, 1);
    clock.advance(199);
    assertReplay(api, 1);
    clock.advance(1);
    assertReplay(api, 2);
    assert.equal(clock.jobs.size, 1);
    clock.advance(200);
    assertReplay(api, 3);
    clock.advance(200);
    assert.equal(api.isPlaying(), false);
    assert.equal(clock.jobs.size, 0);
  `);
});

test('app redraw drift control: the original step-zero redraw fails the same retained-grid assertion', () => {
  assert.throws(
    () =>
      runModuleProbe(
        String.raw`
          const api = await bootstrapApp();
          await loadReplay();
          element('btn-next').fire('click');
          assertReplay(api, 1);
          roundTrip(api, 1);
        `,
        true
      ),
    /visualiser grid must match the retained playhead/
  );
});
