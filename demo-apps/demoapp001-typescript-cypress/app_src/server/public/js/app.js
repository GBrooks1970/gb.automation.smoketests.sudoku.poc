// app.js — application orchestration: API calls, event wiring, rendering

import { createGrid, renderGridAtStep } from './grid.js';
import {
  load as playerLoad,
  goFirst, goPrev, goNext, goLast, togglePlay, goTo,
  setSpeed, currentIndex, totalSteps, isPlaying,
} from './player.js';

// ── App state ───────────────────────────────────────────────
let solveData    = null;   // VisualiseResult from API
let originalClues = null;  // number[][] — cells that were pre-filled in the puzzle

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  createGrid(document.getElementById('sudoku-grid'));
  wireControls();
  await loadPuzzleList();
});

// ── Control wiring ──────────────────────────────────────────
function wireControls() {
  document.getElementById('puzzle-dropdown').addEventListener('change', (e) => {
    if (e.target.value) loadSolveData(e.target.value);
  });

  document.getElementById('btn-first').addEventListener('click', goFirst);
  document.getElementById('btn-prev').addEventListener('click',  goPrev);
  document.getElementById('btn-play').addEventListener('click',  togglePlay);
  document.getElementById('btn-next').addEventListener('click',  goNext);
  document.getElementById('btn-last').addEventListener('click',  goLast);

  const slider = document.getElementById('speed-slider');
  slider.addEventListener('input', () => {
    const ms = Number(slider.value);
    document.getElementById('speed-label').textContent = `${ms} ms`;
    setSpeed(ms);
  });
}

// ── Puzzle list ─────────────────────────────────────────────
async function loadPuzzleList() {
  try {
    const res  = await fetch('/api/puzzles');
    const data = await res.json();
    const dropdown = document.getElementById('puzzle-dropdown');
    data.puzzles.forEach((p) => {
      const opt = document.createElement('option');
      opt.value       = p.name;
      opt.textContent = `${p.name} (${p.difficulty})`;
      dropdown.appendChild(opt);
    });
  } catch (err) {
    showError('Could not load puzzle list: ' + err.message);
  }
}

// ── Solve + visualise ────────────────────────────────────────
async function loadSolveData(puzzleName) {
  resetUI();
  showLoading(true);

  try {
    const encodedName = encodeURIComponent(puzzleName);
    const res  = await fetch(`/api/visualise/${encodedName}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || res.statusText);
    }

    solveData     = await res.json();
    originalClues = solveData.initialGrid.map((row) => [...row]);

    updatePuzzleMeta(solveData);
    buildEventLog(solveData.steps);
    renderStats(solveData);

    playerLoad(solveData.steps, onStep);
  } catch (err) {
    showError('Failed to load solve data: ' + err.message);
  } finally {
    showLoading(false);
  }
}

// ── Step callback ────────────────────────────────────────────
function onStep(stepIndex) {
  if (!solveData) return;

  renderGridAtStep(solveData.initialGrid, solveData.steps, stepIndex, originalClues);
  highlightLogEntry(stepIndex);
  updateStatsProgress(stepIndex);
}

// ── Puzzle metadata ─────────────────────────────────────────
function updatePuzzleMeta(data) {
  document.getElementById('puzzle-difficulty').textContent = data.difficulty.toUpperCase();
  document.getElementById('puzzle-description').textContent = data.description;
}

// ── Event log ────────────────────────────────────────────────
function buildEventLog(steps) {
  const list = document.getElementById('event-list');
  list.innerHTML = '';

  steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.dataset.stepIndex = i + 1;
    li.textContent = formatStep(s);
    li.addEventListener('click', () => goTo(i + 1));
    list.appendChild(li);
  });

  if (steps.length === 0) {
    list.innerHTML = '<li class="placeholder">No steps — puzzle may already be complete or unsolvable with basic techniques.</li>';
  }
}

function formatStep(s) {
  const algo = s.algorithmParam !== undefined
    ? `${s.algorithm}(${s.algorithmParam})`
    : s.algorithm;
  return `${s.stepNumber} [${algo}] (${s.cell.row},${s.cell.col}): · → ${s.newValue}`;
}

function highlightLogEntry(stepIndex) {
  const list = document.getElementById('event-list');
  list.querySelectorAll('li').forEach((li) => li.classList.remove('current-step'));

  if (stepIndex > 0) {
    const target = list.querySelector(`[data-step-index="${stepIndex}"]`);
    if (target) {
      target.classList.add('current-step');
      target.scrollIntoView({ block: 'nearest' });
    }
  }
}

// ── Statistics panel ─────────────────────────────────────────
function renderStats(data) {
  const { statistics, status } = data;
  const { totalSteps: total, totalIterations, stepsByAlgorithm: byAlgo } = statistics;

  const content = document.getElementById('stats-content');

  const statusBanner = document.createElement('div');
  statusBanner.id = 'status-banner';
  statusBanner.className = status === 'SOLVED' ? 'solved' : 'stuck';
  statusBanner.textContent = status === 'SOLVED' ? '✓ SOLVED' : '⚠ STUCK ON ADVANCED LOGIC';

  const summary = document.createElement('p');
  summary.innerHTML = `<strong>Total Steps:</strong> ${total}<br><strong>Iterations:</strong> ${totalIterations}`;
  summary.style.cssText = 'font-size:0.875rem;margin-bottom:10px;';

  content.innerHTML = '';
  content.appendChild(statusBanner);
  content.appendChild(summary);

  const bars = [
    { label: 'Unit Completion', key: 'unitCompletion', cls: 'unit-completion' },
    { label: 'Hidden Singles',  key: 'hiddenSingles',  cls: 'hidden-singles'  },
    { label: 'Naked Singles',   key: 'nakedSingles',   cls: 'naked-singles'   },
  ];

  bars.forEach(({ label, key, cls }) => {
    const count = byAlgo[key];
    const pct   = total > 0 ? Math.round((count / total) * 100) : 0;

    const row = document.createElement('div');
    row.className = 'stat-row';
    row.dataset.algo = key;
    row.innerHTML = `
      <div class="stat-label">
        <span>${label}</span>
        <strong>${count} (${pct}%)</strong>
      </div>
      <div class="stat-bar-bg">
        <div class="stat-bar ${cls}" style="width:${pct}%"></div>
      </div>`;
    content.appendChild(row);
  });
}

function updateStatsProgress(stepIndex) {
  if (!solveData) return;
  const { steps, statistics } = solveData;
  const visible = steps.slice(0, stepIndex);

  const counts = { unitCompletion: 0, hiddenSingles: 0, nakedSingles: 0 };
  const keyMap = { UnitCompletion: 'unitCompletion', HiddenSingles: 'hiddenSingles', NakedSingles: 'nakedSingles' };
  visible.forEach((s) => counts[keyMap[s.algorithm]]++);

  const total = statistics.totalSteps;
  ['unitCompletion', 'hiddenSingles', 'nakedSingles'].forEach((key) => {
    const row = document.querySelector(`[data-algo="${key}"]`);
    if (!row) return;
    const count = counts[key];
    const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
    row.querySelector('.stat-label strong').textContent = `${count} (${pct}%)`;
    row.querySelector('.stat-bar').style.width = `${pct}%`;
  });
}

// ── Helpers ──────────────────────────────────────────────────
function resetUI() {
  solveData     = null;
  originalClues = null;
  const blank = Array.from({ length: 9 }, () => Array(9).fill(0));
  renderGridAtStep(blank, [], 0, blank);
  document.getElementById('event-list').innerHTML = '<li class="placeholder">Loading&hellip;</li>';
  document.getElementById('stats-content').innerHTML = '<p class="placeholder">Loading&hellip;</p>';
  document.getElementById('puzzle-difficulty').textContent = '';
  document.getElementById('puzzle-description').textContent = '';
  hideError();
}

function showLoading(visible) {
  document.getElementById('loading').classList.toggle('hidden', !visible);
}

function showError(msg) {
  const banner = document.getElementById('error-banner');
  banner.textContent = msg;
  banner.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-banner').classList.add('hidden');
}
