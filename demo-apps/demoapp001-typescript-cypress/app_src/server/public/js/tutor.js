// tutor.js — interactive tutor controller: state, API calls, hint rendering, and editing

import { renderTutorGrid } from './grid.js';

export class SudokuTutorController {
  constructor() {
    this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.originalClues = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.appliedHints = new Map(); // key: 'r-c' -> { value, technique }
    this.activeHint = null;
    this.selectedCell = null;
    this.isAutoPlaying = false;
    this.autoPlayTimer = null;
  }

  /**
   * Initializes the tutor view with event listeners and initial blank state.
   */
  init() {
    this.wireEvents();
    this.render();
  }

  wireEvents() {
    document
      .getElementById('btn-get-hint')
      ?.addEventListener('click', () => this.requestHint());
    document
      .getElementById('btn-apply-hint')
      ?.addEventListener('click', () => this.applyHint());
    document
      .getElementById('btn-auto-step')
      ?.addEventListener('click', () => this.toggleAutoStep());
    document
      .getElementById('btn-reset-puzzle')
      ?.addEventListener('click', () => this.resetToClues());
    document
      .getElementById('btn-clear-grid')
      ?.addEventListener('click', () => this.clearGrid());

    // Wire Keypad buttons
    const keypad = document.getElementById('digit-keypad');
    if (keypad) {
      keypad.querySelectorAll('button[data-digit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const digit = Number(btn.dataset.digit);
          this.inputDigit(digit);
        });
      });
    }

    // Keyboard navigation & entry on document
    document.addEventListener('keydown', (e) => {
      // Only handle if in tutor mode and not focused on input/select
      const tutorContainer = document.getElementById('tutor-controls');
      if (!tutorContainer || tutorContainer.classList.contains('hidden')) return;
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        this.inputDigit(Number(e.key));
        e.preventDefault();
      } else if (
        e.key === '0' ||
        e.key === 'Backspace' ||
        e.key === 'Delete'
      ) {
        this.inputDigit(0);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        this.moveSelection(-1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        this.moveSelection(1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        this.moveSelection(0, -1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        this.moveSelection(0, 1);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (this.activeHint && this.activeHint.move) {
          this.applyHint();
        } else {
          this.requestHint();
        }
        e.preventDefault();
      }
    });
  }

  loadClues(clues) {
    this.stopAutoStep();
    this.originalClues = clues.map((row) => [...row]);
    this.grid = clues.map((row) => [...row]);
    this.appliedHints.clear();
    this.activeHint = null;
    this.selectedCell = null;
    this.render();
    this.renderTutorPanel(null);
  }

  clearGrid() {
    this.stopAutoStep();
    this.originalClues = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.appliedHints.clear();
    this.activeHint = null;
    this.selectedCell = { row: 0, col: 0 };
    this.render();
    this.renderTutorPanel(null);
  }

  resetToClues() {
    this.stopAutoStep();
    this.grid = this.originalClues.map((row) => [...row]);
    this.appliedHints.clear();
    this.activeHint = null;
    this.render();
    this.renderTutorPanel(null);
  }

  selectCell(row, col) {
    this.selectedCell = { row, col };
    this.render();
  }

  moveSelection(dRow, dCol) {
    if (!this.selectedCell) {
      this.selectedCell = { row: 0, col: 0 };
    } else {
      const nextRow = (this.selectedCell.row + dRow + 9) % 9;
      const nextCol = (this.selectedCell.col + dCol + 9) % 9;
      this.selectedCell = { row: nextRow, col: nextCol };
    }
    this.render();
  }

  inputDigit(digit) {
    if (!this.selectedCell) return;
    const { row, col } = this.selectedCell;

    // Disallow modifying original puzzle clues
    if (this.originalClues[row][col] !== 0) {
      return;
    }

    this.grid[row][col] = digit;
    this.appliedHints.delete(`${row}-${col}`);
    this.activeHint = null;
    this.render();
    this.renderTutorPanel(null);
  }

  async requestHint() {
    try {
      this.setLoading(true);
      const res = await fetch('/api/tutor/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: this.grid }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const hint = await res.json();
      this.activeHint = hint;

      if (hint.move) {
        this.selectedCell = {
          row: hint.move.cell.row,
          col: hint.move.cell.col,
        };
      }

      this.render();
      this.renderTutorPanel(hint);
      return hint;
    } catch (err) {
      this.renderError(err.message);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  applyHint() {
    if (!this.activeHint || !this.activeHint.move) return;

    const { cell } = this.activeHint.move;
    const digit = this.activeHint.move.digit ?? this.activeHint.move.value;
    this.grid[cell.row][cell.col] = digit;
    this.appliedHints.set(`${cell.row}-${cell.col}`, {
      value: digit,
      technique: this.activeHint.technique || 'Unknown',
    });

    const previousTechnique = this.activeHint.technique;
    this.activeHint = null;
    this.render();

    // Show applied feedback
    const rationaleEl = document.getElementById('tutor-rationale');
    if (rationaleEl) {
      rationaleEl.innerHTML = `<em>Applied move: <strong>(${cell.row + 1}, ${cell.col + 1}) = ${digit}</strong> via <strong>${previousTechnique}</strong>. Click 'Get Hint' for the next step.</em>`;
    }

    const applyBtn = document.getElementById('btn-apply-hint');
    if (applyBtn) applyBtn.disabled = true;
  }

  async toggleAutoStep() {
    if (this.isAutoPlaying) {
      this.stopAutoStep();
    } else {
      this.isAutoPlaying = true;
      const autoBtn = document.getElementById('btn-auto-step');
      if (autoBtn) {
        autoBtn.textContent = 'Pause Auto-Play';
        autoBtn.classList.add('accent-btn');
      }
      this.runAutoStepLoop();
    }
  }

  stopAutoStep() {
    this.isAutoPlaying = false;
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    const autoBtn = document.getElementById('btn-auto-step');
    if (autoBtn) {
      autoBtn.textContent = 'Auto-Play Hints';
      autoBtn.classList.remove('accent-btn');
    }
  }

  async runAutoStepLoop() {
    if (!this.isAutoPlaying) return;

    const hint = await this.requestHint();
    if (!hint || hint.status !== 'HINT_AVAILABLE' || !hint.move) {
      this.stopAutoStep();
      return;
    }

    this.autoPlayTimer = setTimeout(() => {
      if (!this.isAutoPlaying) return;
      this.applyHint();
      this.autoPlayTimer = setTimeout(() => this.runAutoStepLoop(), 400);
    }, 600);
  }

  render() {
    renderTutorGrid(
      this.grid,
      this.originalClues,
      this.appliedHints,
      this.activeHint,
      this.selectedCell
    );
  }

  renderTutorPanel(hint) {
    const statusBadge = document.getElementById('tutor-status-badge');
    const techniqueBadge = document.getElementById('tutor-technique-badge');
    const targetSummary = document.getElementById('tutor-target-summary');
    const rationale = document.getElementById('tutor-rationale');
    const eliminations = document.getElementById('tutor-eliminations');
    const applyBtn = document.getElementById('btn-apply-hint');

    if (!hint) {
      if (statusBadge) {
        statusBadge.textContent = 'READY';
        statusBadge.className = 'badge badge-hint-available';
      }
      if (techniqueBadge) techniqueBadge.textContent = 'Awaiting Hint';
      if (targetSummary) {
        targetSummary.textContent = 'Click "Get Hint" for next logical move';
      }
      if (rationale) {
        rationale.textContent =
          'Select a cell or click "Get Hint / Next Move" to receive step-by-step pedagogical deductions based on deterministic Sudoku techniques.';
      }
      if (eliminations) eliminations.classList.add('hidden');
      if (applyBtn) applyBtn.disabled = true;
      return;
    }

    // Set Status Badge
    if (statusBadge) {
      statusBadge.textContent = hint.status.replace(/_/g, ' ');
      if (hint.status === 'HINT_AVAILABLE') {
        statusBadge.className = 'badge badge-hint-available';
      } else if (hint.status === 'SOLVED') {
        statusBadge.className = 'badge badge-solved';
      } else if (hint.status === 'STUCK_ON_ADVANCED_LOGIC') {
        statusBadge.className = 'badge badge-stuck';
      } else {
        statusBadge.className = 'badge badge-invalid';
      }
    }

    // Set Technique Badge
    if (techniqueBadge) {
      techniqueBadge.textContent = hint.technique || 'Analysis';
    }

    // Set Target Summary
    if (targetSummary) {
      if (hint.move) {
        const digit = hint.move.digit ?? hint.move.value;
        targetSummary.innerHTML = `Target: <strong>Row ${hint.move.cell.row + 1}, Col ${hint.move.cell.col + 1}</strong> &rarr; <span style="color:#059669;font-size:1.2rem;">${digit}</span>`;
      } else if (hint.status === 'SOLVED') {
        targetSummary.textContent = '✓ Puzzle Completely Solved!';
      } else if (hint.status === 'STUCK_ON_ADVANCED_LOGIC') {
        targetSummary.textContent = '⚠ Advanced Logic Required';
      } else {
        targetSummary.textContent = '⚠ Grid Validation Issue';
      }
    }

    // Set Rationale
    if (rationale) {
      rationale.textContent = hint.rationale;
    }

    // Set Eliminations (if any)
    if (eliminations) {
      if (hint.eliminations && hint.eliminations.length > 0) {
        eliminations.classList.remove('hidden');
        const listHtml = hint.eliminations
          .map(
            (e) =>
              `<span class="elimination-tag">Cell (${e.row + 1},${e.col + 1}) &ne; [${e.eliminatedDigits.join(',')}]</span>`
          )
          .join(' ');
        eliminations.innerHTML = `<strong>Candidate Eliminations:</strong><br>${listHtml}`;
      } else {
        eliminations.classList.add('hidden');
      }
    }

    // Update Apply Button
    if (applyBtn) {
      applyBtn.disabled = !(hint.status === 'HINT_AVAILABLE' && hint.move);
    }
  }

  setLoading(visible) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.classList.toggle('hidden', !visible);
      loadingEl.textContent = visible ? 'Evaluating next hint...' : '';
    }
  }

  renderError(msg) {
    const banner = document.getElementById('error-banner');
    if (banner) {
      banner.textContent = `Tutor error: ${msg}`;
      banner.classList.remove('hidden');
      setTimeout(() => banner.classList.add('hidden'), 5000);
    }
  }
}
