import { CandidateElimination, CellCoordinate } from './types';

export class RationaleGenerator {
  static forUnitCompletion(
    unitType: 'row' | 'col' | 'block',
    unitIndex: number,
    missingDigit: number,
    targetCell: CellCoordinate,
    existingDigits?: number[]
  ): string {
    const unitLabel = this.formatUnitName(unitType, unitIndex);
    const cellLabel = `(${targetCell.row + 1}, ${targetCell.col + 1})`;
    if (existingDigits && existingDigits.length > 0) {
      const sortedDigits = [...existingDigits].sort((a, b) => a - b).join(', ');
      return `${unitLabel} contains 8 filled digits [${sortedDigits}]. The only missing digit to complete the unit is ${missingDigit} at cell ${cellLabel}.`;
    }
    return `${unitLabel} has only one empty cell remaining. The missing digit to complete the unit is ${missingDigit} at cell ${cellLabel}.`;
  }

  static forHiddenSingles(
    unitType: 'row' | 'col' | 'block',
    unitIndex: number,
    digit: number,
    targetCell: CellCoordinate
  ): string {
    const unitLabel = this.formatUnitName(unitType, unitIndex);
    const cellLabel = `(${targetCell.row + 1}, ${targetCell.col + 1})`;
    return `In ${unitLabel}, digit ${digit} has only one valid placement remaining at cell ${cellLabel} because all other empty cells in this unit are restricted by peers.`;
  }

  static forNakedSingles(targetCell: CellCoordinate, digit: number): string {
    const cellLabel = `(${targetCell.row + 1}, ${targetCell.col + 1})`;
    return `Cell ${cellLabel} has only one candidate remaining: ${digit}. All other digits (1-9) are eliminated by peers in its row, column, or 3x3 block.`;
  }

  static forNakedPairs(
    unitType: 'row' | 'col' | 'block',
    unitIndex: number,
    pairCells: [CellCoordinate, CellCoordinate],
    pairDigits: number[],
    eliminations: CandidateElimination[],
    placedCell?: { cell: CellCoordinate; digit: number }
  ): string {
    const unitLabel = this.formatUnitName(unitType, unitIndex);
    const cell1 = `(${pairCells[0].row + 1}, ${pairCells[0].col + 1})`;
    const cell2 = `(${pairCells[1].row + 1}, ${pairCells[1].col + 1})`;
    const digitsStr = `{${pairDigits.join(', ')}}`;

    let rationale = `Cells ${cell1} and ${cell2} form a Naked Pair with candidates ${digitsStr} in ${unitLabel}. These digits cannot appear in any other cell in this unit.`;

    if (eliminations.length > 0) {
      const elimStr = eliminations
        .map((e) => `(${e.row + 1}, ${e.col + 1}) [eliminated: ${e.eliminatedDigits.join(', ')}]`)
        .join(', ');
      rationale += ` Eliminated candidates from: ${elimStr}.`;
    }

    if (placedCell) {
      rationale += ` This elimination enables placing digit ${placedCell.digit} at cell (${placedCell.cell.row + 1}, ${placedCell.cell.col + 1}).`;
    }

    return rationale;
  }

  static forXWing(
    orientation: 'row' | 'col',
    primaryLines: [number, number],
    crossLines: [number, number],
    digit: number,
    eliminations: CandidateElimination[],
    placedCell?: { cell: CellCoordinate; digit: number }
  ): string {
    const lineType = orientation === 'row' ? 'Row' : 'Column';
    const crossType = orientation === 'row' ? 'Column' : 'Row';
    const p1 = primaryLines[0] + 1;
    const p2 = primaryLines[1] + 1;
    const c1 = crossLines[0] + 1;
    const c2 = crossLines[1] + 1;

    let rationale = `Candidate ${digit} appears exactly twice in ${lineType}s ${p1} and ${p2} at ${crossType}s ${c1} and ${c2}, forming an X-Wing pattern. Therefore, candidate ${digit} is eliminated from all other cells in ${crossType}s ${c1} and ${c2}.`;

    if (eliminations.length > 0) {
      const elimStr = eliminations.map((e) => `(${e.row + 1}, ${e.col + 1})`).join(', ');
      rationale += ` Eliminated from: ${elimStr}.`;
    }

    if (placedCell) {
      rationale += ` This deduction unlocks digit ${placedCell.digit} at cell (${placedCell.cell.row + 1}, ${placedCell.cell.col + 1}).`;
    }

    return rationale;
  }

  static forSolved(): string {
    return 'The puzzle is already completely and correctly solved!';
  }

  static forStuck(): string {
    return 'No further progress can be made using the available basic and intermediate techniques (Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, X-Wing). Further solving requires advanced techniques or candidate chains.';
  }

  static forInvalid(message?: string): string {
    return (
      message ||
      'The grid contains conflicting digits violating Sudoku rules in row, column, or 3x3 block.'
    );
  }

  private static formatUnitName(unitType: 'row' | 'col' | 'block', unitIndex: number): string {
    switch (unitType) {
      case 'row':
        return `Row ${unitIndex + 1}`;
      case 'col':
        return `Column ${unitIndex + 1}`;
      case 'block':
        return `Block ${unitIndex + 1}`;
    }
  }
}
