// player.js — manages step-playback state and controls

let _steps        = [];
let _stepIndex    = 0;
let _isPlaying    = false;
let _playInterval = null;
let _playSpeed    = 500;
let _onStep       = null;   // callback(stepIndex) invoked on every step change

// ── Public API ──────────────────────────────────────────────

/** Load new solve data and reset to step 0. */
export function load(steps, onStep) {
  _steps     = steps;
  _stepIndex = 0;
  _onStep    = onStep;
  _isPlaying = false;
  clearInterval(_playInterval);
  _playInterval = null;
  _syncControls();
  _onStep(0);
}

export function goFirst()  { _goTo(0); }
export function goPrev()   { _goTo(Math.max(0, _stepIndex - 1)); }
export function goNext()   { _goTo(Math.min(_steps.length, _stepIndex + 1)); }
export function goLast()   { _goTo(_steps.length); }
export function goTo(i)    { _goTo(i); }

export function togglePlay() {
  if (_isPlaying) {
    _pause();
  } else {
    _play();
  }
}

export function setSpeed(ms) {
  _playSpeed = ms;
  if (_isPlaying) {
    // Restart interval at new speed
    clearInterval(_playInterval);
    _playInterval = setInterval(_advance, _playSpeed);
  }
}

export function currentIndex() { return _stepIndex; }
export function totalSteps()   { return _steps.length; }
export function isPlaying()    { return _isPlaying; }

// ── Internal ────────────────────────────────────────────────

function _goTo(i) {
  if (_isPlaying) _pause();
  _stepIndex = i;
  _syncControls();
  _onStep(_stepIndex);
}

function _play() {
  if (_stepIndex >= _steps.length) return; // already at end
  _isPlaying = true;
  _syncControls();
  _playInterval = setInterval(_advance, _playSpeed);
}

function _pause() {
  clearInterval(_playInterval);
  _playInterval = null;
  _isPlaying = false;
  _syncControls();
}

function _advance() {
  if (_stepIndex >= _steps.length) {
    _pause();
    return;
  }
  _stepIndex++;
  _syncControls();
  _onStep(_stepIndex);
}

function _syncControls() {
  const atStart = _stepIndex === 0;
  const atEnd   = _stepIndex >= _steps.length;
  const hasData = _steps.length > 0;

  _btn('btn-first').disabled = atStart || !hasData;
  _btn('btn-prev').disabled  = atStart || !hasData;
  _btn('btn-next').disabled  = atEnd   || !hasData;
  _btn('btn-last').disabled  = atEnd   || !hasData;
  _btn('btn-play').disabled  = !hasData;
  _btn('btn-play').textContent = _isPlaying ? '⏸' : '▶'; // ⏸ or ▶

  const counter = document.getElementById('step-counter');
  if (counter) counter.textContent = `Step ${_stepIndex} of ${_steps.length}`;
}

function _btn(id) {
  return document.getElementById(id);
}
