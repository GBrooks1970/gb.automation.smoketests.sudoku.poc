import * as assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';

const browserDirectory = path.resolve(__dirname, '../../app_src/server/public/js');

function runModuleProbe(body: string): string {
  // SourceTextModule uses Node's ES-module linker without evaluating the browser
  // DOM during linking. Behaviour probes evaluate the unchanged player source
  // with controlled DOM/timer seams. Its flag stays in this child process.
  const source = String.raw`
    const assert = require('node:assert/strict');
    const { readFileSync } = require('node:fs');
    const path = require('node:path');
    const { createContext, SourceTextModule } = require('node:vm');
    const directory = process.argv[2];
    const elements = new Map();
    function element(id) {
      if (!elements.has(id)) elements.set(id, { disabled: false, textContent: '' });
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
    const context = createContext({
      document: { getElementById: element },
      setInterval: clock.setInterval.bind(clock),
      clearInterval: clock.clearInterval.bind(clock),
    });
    const modules = new Map();
    function moduleAt(filename) {
      if (modules.has(filename)) return modules.get(filename);
      const module = new SourceTextModule(readFileSync(filename, 'utf8'), {
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
      await module.link(resolveImport);
      await module.evaluate();
      return module.namespace;
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
