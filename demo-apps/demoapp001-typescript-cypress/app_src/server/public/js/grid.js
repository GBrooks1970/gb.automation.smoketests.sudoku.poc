// grid.js — creates and updates the 9x9 Sudoku grid DOM

const ALGORITHM_CLASS = {
  UnitCompletion: 'unit-completion',
  HiddenSingles:  'hidden-singles',
  NakedSingles:   'naked-singles',
};

/** Returns the set of border CSS classes for a cell at (r, c). */
function borderClasses(r, c) {
  const classes = [];
  if (c === 2 || c === 5) classes.push('border-right');
  if (r === 2 || r === 5) classes.push('border-bottom');
  return classes;
}

/**
 * Builds the 9×9 table once and appends it to `container`.
 * Call this once on page load.
 */
export function createGrid(container) {
  const table = document.createElement('table');
  for (let r = 0; r < 9; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 9; c++) {
      const td = document.createElement('td');
      td.id = `cell-${r}-${c}`;
      borderClasses(r, c).forEach((cls) => td.classList.add(cls));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);
}

/**
 * Renders the grid at `stepIndex` steps applied to `initialGrid`.
 *
 * @param {number[][]} initialGrid  - The unsolved 9×9 grid (zeros = empty)
 * @param {object[]}   steps        - The flat step array from the API
 * @param {number}     stepIndex    - How many steps to apply (0 = initial state)
 * @param {number[][]} originalClues - The unsolved grid (same as initialGrid, used to distinguish original cells)
 */
export function renderGridAtStep(initialGrid, steps, stepIndex, originalClues) {
  // Build grid state at stepIndex by applying the first stepIndex steps
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
        if (algo) td.classList.add(ALGORITHM_CLASS[algo]);
      }

      // Highlight the cell changed in the current step
      if (lastStep && lastStep.cell.row === r && lastStep.cell.col === c) {
        td.classList.add('highlight');
      }
    }
  }
}
