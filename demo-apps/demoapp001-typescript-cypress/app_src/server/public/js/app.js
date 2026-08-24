// app.js — application orchestration: tabs, API calls, event wiring, and mode coordination

import { createGrid, renderGridAtStep } from './grid.js';
import {
  load as playerLoad,
  goFirst,
  goPrev,
  goNext,
  goLast,
  togglePlay,
  goTo,
  setSpeed,
  pause,
} from './player.js';
import { SudokuTutorController } from './tutor.js';

// ── App state ───────────────────────────────────────────────
let currentMode = 'visualiser'; // 'visualiser' | 'tutor'
let solveData = null; // VisualiseResult from API
let originalClues = null; // number[][] — cells that were pre-filled in the puzzle
let tutor = null;

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  tutor = new SudokuTutorController();
  tutor.init();

  createGrid(document.getElementById('sudoku-grid'), onCellClick);
  wireControls();
  await loadPuzzleList();
});

// ── Cell Click Handler ──────────────────────────────────────
function onCellClick(row, col) {
  if (currentMode === 'tutor' && tutor) {
    tutor.selectCell(row, col);
  }
}

// ── Control wiring ──────────────────────────────────────────
function wireControls() {
  // Tab Switching
  document.getElementById('tab-visualiser')?.addEventListener('click', () => {
    switchMode('visualiser');
  });

  document.getElementById('tab-tutor')?.addEventListener('click', () => {
    switchMode('tutor');
  });

  // Puzzle dropdown
  document.getElementById('puzzle-dropdown')?.addEventListener('change', (e) => {
    const puzzleName = e.target.value;
    if (puzzleName) {
      loadPuzzleData(puzzleName);
    }
  });

  // Visualiser playback buttons
  document.getElementById('btn-first')?.addEventListener('click', goFirst);
  document.getElementById('btn-prev')?.addEventListener('click', goPrev);
  document.getElementById('btn-play')?.addEventListener('click', togglePlay);
  document.getElementById('btn-next')?.addEventListener('click', goNext);
  document.getElementById('btn-last')?.addEventListener('click', goLast);

  // Speed slider
  const slider = document.getElementById('speed-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      const ms = Number(slider.value);
      const label = document.getElementById('speed-label');
      if (label) label.textContent = `${ms} ms`;
      setSpeed(ms);
    });
  }
}

// ── Mode Switching ──────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode;

  const tabVisualiser = document.getElementById('tab-visualiser');
  const tabTutor = document.getElementById('tab-tutor');
  const visualiserControls = document.getElementById('visualiser-controls');
  const tutorControls = document.getElementById('tutor-controls');
  const visualiserInfo = document.getElementById('visualiser-info');
  const tutorInfo = document.getElementById('tutor-info');

  if (mode === 'visualiser') {
    tabVisualiser?.classList.add('active');
    tabTutor?.classList.remove('active');

    visualiserControls?.classList.remove('hidden');
    tutorControls?.classList.add('hidden');
    visualiserInfo?.classList.remove('hidden');
    tutorInfo?.classList.add('hidden');

    if (tutor) tutor.stopAutoStep();

    if (solveData) {
      onStep(0);
    }
  } else {
    tabTutor?.classList.add('active');
    tabVisualiser?.classList.remove('active');

    tutorControls?.classList.remove('hidden');
    visualiserControls?.classList.add('hidden');
    tutorInfo?.classList.remove('hidden');
    visualiserInfo?.classList.add('hidden');

    pause(); // pause visualiser playback

    if (originalClues && tutor) {
      tutor.loadClues(originalClues);
    }
  }
}

// ── Puzzle list ─────────────────────────────────────────────
async function loadPuzzleList() {
  try {
    const res = await fetch('/api/puzzles');
    const data = await res.json();
    const dropdown = document.getElementById('puzzle-dropdown');
    data.puzzles.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = `${p.name} (${p.difficulty})`;
      dropdown.appendChild(opt);
    });
  } catch (err) {
    showError('Could not load puzzle list: ' + err.message);
  }
}

// ── Load Puzzle & Solve Data ────────────────────────────────
async function loadPuzzleData(puzzleName) {
  resetUI();
  showLoading(true);

  try {
    const encodedName = encodeURIComponent(puzzleName);
    const res = await fetch(`/api/visualise/${encodedName}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || res.statusText);
    }

    solveData = await res.json();
    originalClues = solveData.initialGrid.map((row) => [...row]);

    updatePuzzleMeta(solveData);
    buildEventLog(solveData.steps);
    renderStats(solveData);

    playerLoad(solveData.steps, onStep);

    if (tutor) {
      tutor.loadClues(originalClues);
    }
  } catch (err) {
    showError('Failed to load solve data: ' + err.message);
  } finally {
    showLoading(false);
  }
}

// ── Step callback (Visualiser Mode) ──────────────────────────
function onStep(stepIndex) {
  if (!solveData || currentMode !== 'visualiser') return;

  renderGridAtStep(
    solveData.initialGrid,
    solveData.steps,
    stepIndex,
    originalClues
  );
  highlightLogEntry(stepIndex);
  updateStatsProgress(stepIndex);
}

// ── Puzzle metadata ─────────────────────────────────────────
function updatePuzzleMeta(data) {
  const diffEl = document.getElementById('puzzle-difficulty');
  const descEl = document.getElementById('puzzle-description');
  if (diffEl) diffEl.textContent = data.difficulty.toUpperCase();
  if (descEl) descEl.textContent = data.description;
}

// ── Event log (Visualiser Mode) ──────────────────────────────
function buildEventLog(steps) {
  const list = document.getElementById('event-list');
  if (!list) return;
  list.innerHTML = '';

  steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.dataset.stepIndex = String(i + 1);
    li.textContent = formatStep(s);
    li.addEventListener('click', () => goTo(i + 1));
    list.appendChild(li);
  });

  if (steps.length === 0) {
    list.innerHTML =
      '<li class="placeholder">No steps — puzzle may already be complete or unsolvable with basic techniques.</li>';
  }
}

function formatStep(s) {
  const algo =
    s.algorithmParam !== undefined
      ? `${s.algorithm}(${s.algorithmParam})`
      : s.algorithm;
  return `${s.stepNumber} [${algo}] (${s.cell.row + 1},${s.cell.col + 1}): · → ${s.newValue}`;
}

function highlightLogEntry(stepIndex) {
  const list = document.getElementById('event-list');
  if (!list) return;
  list
    .querySelectorAll('li')
    .forEach((li) => li.classList.remove('current-step'));

  if (stepIndex > 0) {
    const target = list.querySelector(`[data-step-index="${stepIndex}"]`);
    if (target) {
      target.classList.add('current-step');
      target.scrollIntoView({ block: 'nearest' });
    }
  }
}

// ── Statistics panel (Visualiser Mode) ───────────────────────
function renderStats(data) {
  const { statistics, status } = data;
  const {
    totalSteps: total,
    totalIterations,
    stepsByAlgorithm: byAlgo,
  } = statistics;

  const content = document.getElementById('stats-content');
  if (!content) return;

  const statusBanner = document.createElement('div');
  statusBanner.id = 'status-banner';
  statusBanner.className = status === 'SOLVED' ? 'solved' : 'stuck';
  statusBanner.textContent =
    status === 'SOLVED' ? '✓ SOLVED' : '⚠ STUCK ON ADVANCED LOGIC';

  const summary = document.createElement('p');
  summary.innerHTML = `<strong>Total Steps:</strong> ${total}<br><strong>Iterations:</strong> ${totalIterations}`;
  summary.style.cssText = 'font-size:0.875rem;margin-bottom:10px;';

  content.innerHTML = '';
  content.appendChild(statusBanner);
  content.appendChild(summary);

  const bars = [
    { label: 'Unit Completion', key: 'unitCompletion', cls: 'unit-completion' },
    { label: 'Hidden Singles', key: 'hiddenSingles', cls: 'hidden-singles' },
    { label: 'Naked Singles', key: 'nakedSingles', cls: 'naked-singles' },
    { label: 'Naked Pairs', key: 'nakedPairs', cls: 'naked-pairs' },
    { label: 'X-Wing', key: 'xWing', cls: 'x-wing' },
  ];

  bars.forEach(({ label, key, cls }) => {
    const count = byAlgo[key] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

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

  const counts = {
    unitCompletion: 0,
    hiddenSingles: 0,
    nakedSingles: 0,
    nakedPairs: 0,
    xWing: 0,
  };
  const keyMap = {
    UnitCompletion: 'unitCompletion',
    HiddenSingles: 'hiddenSingles',
    NakedSingles: 'nakedSingles',
    NakedPairs: 'nakedPairs',
    XWing: 'xWing',
  };
  visible.forEach((s) => {
    if (keyMap[s.algorithm]) {
      counts[keyMap[s.algorithm]]++;
    }
  });

  const total = statistics.totalSteps;
  ['unitCompletion', 'hiddenSingles', 'nakedSingles', 'nakedPairs', 'xWing'].forEach((key) => {
    const row = document.querySelector(`[data-algo="${key}"]`);
    if (!row) return;
    const count = counts[key] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const strong = row.querySelector('.stat-label strong');
    if (strong) strong.textContent = `${count} (${pct}%)`;
    const bar = row.querySelector('.stat-bar');
    if (bar) bar.style.width = `${pct}%`;
  });
}

// ── Helpers ──────────────────────────────────────────────────
function resetUI() {
  solveData = null;
  originalClues = null;
  const blank = Array.from({ length: 9 }, () => Array(9).fill(0));
  renderGridAtStep(blank, [], 0, blank);
  const eventList = document.getElementById('event-list');
  const statsContent = document.getElementById('stats-content');
  const diffEl = document.getElementById('puzzle-difficulty');
  const descEl = document.getElementById('puzzle-description');

  if (eventList)
    eventList.innerHTML = '<li class="placeholder">Loading&hellip;</li>';
  if (statsContent)
    statsContent.innerHTML = '<p class="placeholder">Loading&hellip;</p>';
  if (diffEl) diffEl.textContent = '';
  if (descEl) descEl.textContent = '';
  hideError();
}

function showLoading(visible) {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.toggle('hidden', !visible);
}

function showError(msg) {
  const banner = document.getElementById('error-banner');
  if (banner) {
    banner.textContent = msg;
    banner.classList.remove('hidden');
  }
}

function hideError() {
  const banner = document.getElementById('error-banner');
  if (banner) banner.classList.add('hidden');
}
