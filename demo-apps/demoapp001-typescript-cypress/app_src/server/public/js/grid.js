// grid.js — creates and updates the 9x9 Sudoku grid DOM

export const ALGORITHM_CLASS = {
  UnitCompletion: 'unit-completion',
  HiddenSingles: 'hidden-singles',
  NakedSingles: 'naked-singles',
  NakedPairs: 'naked-pairs',
  XWing: 'x-wing',
};

/** Returns the set of border CSS classes for a cell at (r, c). */
export function borderClasses(r, c) {
  const classes = [];
  if (c === 2 || c === 5) classes.push('border-right');
  if (r === 2 || r === 5) classes.push('border-bottom');
  return classes;
}

/**
 * Builds the 9×9 table once and appends it to `container`.
 * Accepts an optional cell click callback for interactive/tutor mode.
 *
 * @param {HTMLElement} container
 * @param {function(number, number): void} [onCellClick]
 */
export function createGrid(container, onCellClick) {
  container.innerHTML = '';
  const table = document.createElement('table');
  for (let r = 0; r < 9; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 9; c++) {
      const td = document.createElement('td');
      td.id = `cell-${r}-${c}`;
      td.dataset.row = String(r);
      td.dataset.col = String(c);
      borderClasses(r, c).forEach((cls) => td.classList.add(cls));

      if (typeof onCellClick === 'function') {
        td.addEventListener('click', () => onCellClick(r, c));
      }

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);
}

/**
 * Renders the grid at `stepIndex` steps applied to `initialGrid` (Visualiser Mode).
 *
 * @param {number[][]} initialGrid  - The unsolved 9×9 grid (zeros = empty)
 * @param {object[]}   steps        - The flat step array from the API
 * @param {number}     stepIndex    - How many steps to apply (0 = initial state)
 * @param {number[][]} originalClues - The unsolved grid (same as initialGrid, used to distinguish original cells)
 */
export function renderGridAtStep(initialGrid, steps, stepIndex, originalClues) {
  const grid = initialGrid.map((row) => [...row]);
  const cellAlgo = {};

  for (let i = 0; i < stepIndex; i++) {
    const s = steps[i];
    grid[s.cell.row][s.cell.col] = s.newValue;
    cellAlgo[`${s.cell.row}-${s.cell.col}`] = s.algorithm;
  }

  const lastStep = stepIndex > 0 ? steps[stepIndex - 1] : null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const td = document.getElementById(`cell-${r}-${c}`);
      if (!td) continue;

      const value = grid[r][c];

      // Text
      td.textContent = value === 0 ? '' : String(value);

      // Reset to border classes only
      td.className = borderClasses(r, c).join(' ');

      // Colour class
      if (originalClues[r][c] !== 0) {
        td.classList.add('original-clue');
      } else {
        const algo = cellAlgo[`${r}-${c}`];
        if (algo && ALGORITHM_CLASS[algo]) {
          td.classList.add(ALGORITHM_CLASS[algo]);
        }
      }

      // Highlight the cell changed in the current step
      if (lastStep && lastStep.cell.row === r && lastStep.cell.col === c) {
        td.classList.add('highlight');
      }
    }
  }
}

/**
 * Renders the grid in Interactive Tutor Mode.
 *
 * @param {number[][]} currentGrid
 * @param {number[][]} originalClues
 * @param {Map<string, { value: number, technique: string }>} appliedHints
 * @param {object|null} activeHint - TutorHintResponse from /api/tutor/hint
 * @param {{ row: number, col: number }|null} selectedCell
 */
export function renderTutorGrid(
  currentGrid,
  originalClues,
  appliedHints = new Map(),
  activeHint = null,
  selectedCell = null
) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const td = document.getElementById(`cell-${r}-${c}`);
      if (!td) continue;

      const value = currentGrid[r][c];
      td.textContent = value === 0 ? '' : String(value);

      // Base classes
      const classes = [...borderClasses(r, c)];

      // Cell type styling
      if (originalClues && originalClues[r][c] !== 0) {
        classes.push('original-clue');
      } else if (appliedHints.has(`${r}-${c}`)) {
        classes.push('tutor-applied');
        const hintInfo = appliedHints.get(`${r}-${c}`);
        if (hintInfo && ALGORITHM_CLASS[hintInfo.technique]) {
          classes.push(ALGORITHM_CLASS[hintInfo.technique]);
        }
      } else if (value !== 0) {
        classes.push('user-input');
      }

      // Selection state
      if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
        classes.push('selected-cell');
      }

      // Tutor Unit Highlighting
      if (activeHint && activeHint.highlightUnits) {
        for (const unit of activeHint.highlightUnits) {
          if (unit.type === 'row' && unit.index === r) {
            classes.push('hint-unit-row');
          } else if (unit.type === 'col' && unit.index === c) {
            classes.push('hint-unit-col');
          } else if (unit.type === 'block') {
            const blockIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
            if (blockIndex === unit.index) {
              classes.push('hint-unit-block');
            }
          }
        }
      }

      // Tutor Target / Secondary Cell Highlighting
      if (activeHint) {
        if (
          activeHint.move &&
          activeHint.move.cell.row === r &&
          activeHint.move.cell.col === c
        ) {
          classes.push('hint-target');
        } else if (
          activeHint.highlightCells &&
          activeHint.highlightCells.some(
            (cell) => cell.row === r && cell.col === c
          )
        ) {
          classes.push('hint-secondary');
        }
      }

      td.className = classes.join(' ');
    }
  }
}
