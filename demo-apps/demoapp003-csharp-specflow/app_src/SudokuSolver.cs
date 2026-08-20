namespace DemoApp003.Sudoku;

public sealed class SudokuSolver
{
    private AuditLogger? _auditLogger;

    public SudokuSolver(string name, IReadOnlyList<IReadOnlyList<int>>? originalGrid = null)
    {
        Name = name;
        OriginalGrid = originalGrid is null ? GridHelpers.EmptyGrid() : GridHelpers.DeepCopy(originalGrid);
        Grid = GridHelpers.DeepCopy(OriginalGrid);
    }

    public string Name { get; }
    public int[][] OriginalGrid { get; }
    public int[][] Grid { get; }

    public void SetAuditLogger(AuditLogger logger) => _auditLogger = logger;

    /// <summary>
    /// Returns a deep-copy snapshot of the current working grid (v1.0 <c>getGrid</c>
    /// operation). Mutating the returned array never affects solver state.
    /// Prefer this over reading <see cref="Grid"/> directly wherever access is
    /// read-only. The public <see cref="Grid"/> property is retained for
    /// compatibility, but mutating it directly from outside the solver is
    /// deprecated — external mutation bypasses the solving algorithms and the
    /// audit trail.
    /// </summary>
    public int[][] GetGrid() => GridHelpers.DeepCopy(Grid);

    public bool UnitCompletion()
    {
        var changed = false;
        var changes = new List<CellChange>();

        for (var row = 0; row < Constants.GridSize; row++)
        {
            if (Grid[row].Count(cell => cell == Constants.EmptyCell) != 1)
            {
                continue;
            }

            var col = Array.IndexOf(Grid[row], Constants.EmptyCell);
            var missing = FindMissingDigit(Grid[row]);
            changes.Add(new CellChange(new CellPosition(row, col), Constants.EmptyCell, missing, $"Last empty cell in row {row}"));
            Grid[row][col] = missing;
            changed = true;
        }

        for (var col = 0; col < Constants.GridSize; col++)
        {
            var column = Enumerable.Range(0, Constants.GridSize).Select(row => Grid[row][col]).ToArray();
            if (column.Count(cell => cell == Constants.EmptyCell) != 1)
            {
                continue;
            }

            var row = Array.IndexOf(column, Constants.EmptyCell);
            var missing = FindMissingDigit(column);
            changes.Add(new CellChange(new CellPosition(row, col), Constants.EmptyCell, missing, $"Last empty cell in column {col}"));
            Grid[row][col] = missing;
            changed = true;
        }

        for (var blockRow = 0; blockRow < Constants.BlockSize; blockRow++)
        {
            for (var blockCol = 0; blockCol < Constants.BlockSize; blockCol++)
            {
                var emptyCells = GetBlockEmptyCells(blockRow, blockCol);
                if (emptyCells.Count != 1)
                {
                    continue;
                }

                var cell = emptyCells[0];
                var missing = FindMissingDigit(GetBlockValues(blockRow, blockCol));
                changes.Add(new CellChange(cell, Constants.EmptyCell, missing, $"Last empty cell in block ({blockRow},{blockCol})"));
                Grid[cell.Row][cell.Col] = missing;
                changed = true;
            }
        }

        if (_auditLogger?.IsEnabled() == true && changes.Count > 0)
        {
            _auditLogger.LogChange("UnitCompletion", changes);
        }

        return changed;
    }

    public bool HiddenSingles(int target)
    {
        var changed = false;
        var changes = new List<CellChange>();

        for (var row = 0; row < Constants.GridSize; row++)
        {
            if (IsInRow(target, row))
            {
                continue;
            }

            var candidates = new List<CellPosition>();
            for (var col = 0; col < Constants.GridSize; col++)
            {
                if (Grid[row][col] != Constants.EmptyCell)
                {
                    continue;
                }

                var blockRow = row / Constants.BlockSize;
                var blockCol = col / Constants.BlockSize;
                if (!IsInColumn(target, col) && !IsNumberInBlock(target, blockRow, blockCol))
                {
                    candidates.Add(new CellPosition(row, col));
                }
            }

            if (candidates.Count == 1)
            {
                var cell = candidates[0];
                changes.Add(new CellChange(cell, Constants.EmptyCell, target, $"Only valid location for {target} in row {row}"));
                Grid[cell.Row][cell.Col] = target;
                changed = true;
            }
        }

        for (var col = 0; col < Constants.GridSize; col++)
        {
            if (IsInColumn(target, col))
            {
                continue;
            }

            var candidates = new List<CellPosition>();
            for (var row = 0; row < Constants.GridSize; row++)
            {
                if (Grid[row][col] != Constants.EmptyCell)
                {
                    continue;
                }

                var blockRow = row / Constants.BlockSize;
                var blockCol = col / Constants.BlockSize;
                if (!IsInRow(target, row) && !IsNumberInBlock(target, blockRow, blockCol))
                {
                    candidates.Add(new CellPosition(row, col));
                }
            }

            if (candidates.Count == 1)
            {
                var cell = candidates[0];
                changes.Add(new CellChange(cell, Constants.EmptyCell, target, $"Only valid location for {target} in column {col}"));
                Grid[cell.Row][cell.Col] = target;
                changed = true;
            }
        }

        for (var blockRow = 0; blockRow < Constants.BlockSize; blockRow++)
        {
            for (var blockCol = 0; blockCol < Constants.BlockSize; blockCol++)
            {
                if (IsNumberInBlock(target, blockRow, blockCol))
                {
                    continue;
                }

                var candidates = GetBlockEmptyCells(blockRow, blockCol)
                    .Where(cell => !IsInRow(target, cell.Row) && !IsInColumn(target, cell.Col))
                    .ToList();

                if (candidates.Count == 1)
                {
                    var cell = candidates[0];
                    changes.Add(new CellChange(cell, Constants.EmptyCell, target, $"Only valid location for {target} in block ({blockRow},{blockCol})"));
                    Grid[cell.Row][cell.Col] = target;
                    changed = true;
                }
            }
        }

        if (_auditLogger?.IsEnabled() == true && changes.Count > 0)
        {
            _auditLogger.LogChange("HiddenSingles", changes, target);
        }

        return changed;
    }

    public bool NakedSingles()
    {
        var changed = false;
        var changes = new List<CellChange>();

        for (var row = 0; row < Constants.GridSize; row++)
        {
            for (var col = 0; col < Constants.GridSize; col++)
            {
                if (Grid[row][col] != Constants.EmptyCell)
                {
                    continue;
                }

                var possible = GetCellCandidates(row, col);
                if (possible.Count == 1)
                {
                    var value = possible.Single();
                    changes.Add(new CellChange(new CellPosition(row, col), Constants.EmptyCell, value, $"Only candidate remaining in cell [{row},{col}]"));
                    Grid[row][col] = value;
                    changed = true;
                }
            }
        }

        if (_auditLogger?.IsEnabled() == true && changes.Count > 0)
        {
            _auditLogger.LogChange("NakedSingles", changes);
        }

        return changed;
    }

    public bool NakedPairs()
    {
        var changed = false;
        var changes = new List<CellChange>();

        void ProcessUnit(IReadOnlyList<(int Row, int Col)> unitCells, string unitDesc)
        {
            var emptyCells = unitCells.Where(c => Grid[c.Row][c.Col] == Constants.EmptyCell).ToList();
            if (emptyCells.Count < 2)
            {
                return;
            }

            var cellCandidates = emptyCells.ToDictionary(
                c => c,
                c => GetCellCandidates(c.Row, c.Col));

            var pairCells = cellCandidates
                .Where(kvp => kvp.Value.Count == 2)
                .Select(kvp => kvp.Key)
                .ToList();

            var foundPairs = new List<((int Row, int Col) C1, (int Row, int Col) C2, HashSet<int> Candidates)>();
            for (var i = 0; i < pairCells.Count; i++)
            {
                var c1 = pairCells[i];
                var s1 = cellCandidates[c1];
                for (var j = i + 1; j < pairCells.Count; j++)
                {
                    var c2 = pairCells[j];
                    var s2 = cellCandidates[c2];
                    if (s1.SetEquals(s2))
                    {
                        foundPairs.Add((c1, c2, s1));
                    }
                }
            }

            foreach (var (c1, c2, pairSet) in foundPairs)
            {
                var pairList = pairSet.OrderBy(x => x).ToList();
                var d1 = pairList[0];
                var d2 = pairList[1];

                foreach (var cell in emptyCells)
                {
                    if (cell == c1 || cell == c2)
                    {
                        continue;
                    }

                    if (!cellCandidates.TryGetValue(cell, out var cands))
                    {
                        continue;
                    }

                    var eliminated = false;
                    if (cands.Remove(d1))
                    {
                        eliminated = true;
                    }
                    if (cands.Remove(d2))
                    {
                        eliminated = true;
                    }

                    if (eliminated && cands.Count == 1 && Grid[cell.Row][cell.Col] == Constants.EmptyCell)
                    {
                        var val = cands.Single();
                        changes.Add(new CellChange(
                            new CellPosition(cell.Row, cell.Col),
                            Constants.EmptyCell,
                            val,
                            $"Naked Pair [{d1},{d2}] in {unitDesc} eliminated candidates, leaving {val}"));
                        Grid[cell.Row][cell.Col] = val;
                        changed = true;
                    }
                }
            }
        }

        for (var row = 0; row < Constants.GridSize; row++)
        {
            var unit = Enumerable.Range(0, Constants.GridSize).Select(col => (row, col)).ToList();
            ProcessUnit(unit, $"row {row}");
        }

        for (var col = 0; col < Constants.GridSize; col++)
        {
            var unit = Enumerable.Range(0, Constants.GridSize).Select(row => (row, col)).ToList();
            ProcessUnit(unit, $"column {col}");
        }

        for (var br = 0; br < Constants.BlockSize; br++)
        {
            for (var bc = 0; bc < Constants.BlockSize; bc++)
            {
                var unit = (
                    from r in Enumerable.Range(br * Constants.BlockSize, Constants.BlockSize)
                    from c in Enumerable.Range(bc * Constants.BlockSize, Constants.BlockSize)
                    select (r, c)
                ).ToList();
                ProcessUnit(unit, $"block ({br},{bc})");
            }
        }

        if (_auditLogger?.IsEnabled() == true && changes.Count > 0)
        {
            _auditLogger.LogChange("NakedPairs", changes);
        }

        return changed;
    }

    public bool ApplyNakedPairs() => NakedPairs();

    public bool XWing()
    {
        var changed = false;
        var changes = new List<CellChange>();

        var cellCandidates = new Dictionary<(int Row, int Col), HashSet<int>>();
        for (var r = 0; r < Constants.GridSize; r++)
        {
            for (var c = 0; c < Constants.GridSize; c++)
            {
                if (Grid[r][c] == Constants.EmptyCell)
                {
                    cellCandidates[(r, c)] = GetCellCandidates(r, c);
                }
            }
        }

        void EliminateAndPlace(int r, int c, int digit, string patternDesc)
        {
            if (!cellCandidates.TryGetValue((r, c), out var cands) || !cands.Contains(digit))
            {
                return;
            }

            cands.Remove(digit);
            if (cands.Count == 1 && Grid[r][c] == Constants.EmptyCell)
            {
                var val = cands.Single();
                changes.Add(new CellChange(
                    new CellPosition(r, c),
                    Constants.EmptyCell,
                    val,
                    $"X-Wing {patternDesc} eliminated {digit}, leaving {val}"));
                Grid[r][c] = val;
                changed = true;
            }
        }

        for (var digit = 1; digit <= Constants.GridSize; digit++)
        {
            // 1. Row-based X-Wing
            var rowCandidates = new Dictionary<int, List<int>>();
            for (var r = 0; r < Constants.GridSize; r++)
            {
                var cols = new List<int>();
                for (var c = 0; c < Constants.GridSize; c++)
                {
                    if (Grid[r][c] == Constants.EmptyCell && cellCandidates.TryGetValue((r, c), out var cands) && cands.Contains(digit))
                    {
                        cols.Add(c);
                    }
                }
                if (cols.Count == 2)
                {
                    rowCandidates[r] = cols;
                }
            }

            var rowKeys = rowCandidates.Keys.ToList();
            for (var i = 0; i < rowKeys.Count; i++)
            {
                var r1 = rowKeys[i];
                var c1a = rowCandidates[r1][0];
                var c2a = rowCandidates[r1][1];
                for (var j = i + 1; j < rowKeys.Count; j++)
                {
                    var r2 = rowKeys[j];
                    var c1b = rowCandidates[r2][0];
                    var c2b = rowCandidates[r2][1];
                    if (c1a == c1b && c2a == c2b)
                    {
                        var c1 = c1a;
                        var c2 = c2a;
                        for (var r = 0; r < Constants.GridSize; r++)
                        {
                            if (r != r1 && r != r2 && Grid[r][c1] == Constants.EmptyCell)
                            {
                                EliminateAndPlace(r, c1, digit, $"for digit {digit} in rows {r1},{r2} columns {c1},{c2}");
                            }
                            if (r != r1 && r != r2 && Grid[r][c2] == Constants.EmptyCell)
                            {
                                EliminateAndPlace(r, c2, digit, $"for digit {digit} in rows {r1},{r2} columns {c1},{c2}");
                            }
                        }
                    }
                }
            }

            // 2. Column-based X-Wing
            var colCandidates = new Dictionary<int, List<int>>();
            for (var c = 0; c < Constants.GridSize; c++)
            {
                var rows = new List<int>();
                for (var r = 0; r < Constants.GridSize; r++)
                {
                    if (Grid[r][c] == Constants.EmptyCell && cellCandidates.TryGetValue((r, c), out var cands) && cands.Contains(digit))
                    {
                        rows.Add(r);
                    }
                }
                if (rows.Count == 2)
                {
                    colCandidates[c] = rows;
                }
            }

            var colKeys = colCandidates.Keys.ToList();
            for (var i = 0; i < colKeys.Count; i++)
            {
                var c1 = colKeys[i];
                var r1a = colCandidates[c1][0];
                var r2a = colCandidates[c1][1];
                for (var j = i + 1; j < colKeys.Count; j++)
                {
                    var c2 = colKeys[j];
                    var r1b = colCandidates[c2][0];
                    var r2b = colCandidates[c2][1];
                    if (r1a == r1b && r2a == r2b)
                    {
                        var r1 = r1a;
                        var r2 = r2a;
                        for (var c = 0; c < Constants.GridSize; c++)
                        {
                            if (c != c1 && c != c2 && Grid[r1][c] == Constants.EmptyCell)
                            {
                                EliminateAndPlace(r1, c, digit, $"for digit {digit} in columns {c1},{c2} rows {r1},{r2}");
                            }
                            if (c != c1 && c != c2 && Grid[r2][c] == Constants.EmptyCell)
                            {
                                EliminateAndPlace(r2, c, digit, $"for digit {digit} in columns {c1},{c2} rows {r1},{r2}");
                            }
                        }
                    }
                }
            }
        }

        if (_auditLogger?.IsEnabled() == true && changes.Count > 0)
        {
            _auditLogger.LogChange("XWing", changes);
        }

        return changed;
    }

    public bool ApplyXWing() => XWing();

    public bool IsValidPlacement(int row, int col, int value)
    {
        for (var c = 0; c < Constants.GridSize; c++)
        {
            if (c != col && Grid[row][c] == value)
            {
                return false;
            }
        }

        for (var r = 0; r < Constants.GridSize; r++)
        {
            if (r != row && Grid[r][col] == value)
            {
                return false;
            }
        }

        var blockRow = row / Constants.BlockSize * Constants.BlockSize;
        var blockCol = col / Constants.BlockSize * Constants.BlockSize;
        for (var r = blockRow; r < blockRow + Constants.BlockSize; r++)
        {
            for (var c = blockCol; c < blockCol + Constants.BlockSize; c++)
            {
                if ((r != row || c != col) && Grid[r][c] == value)
                {
                    return false;
                }
            }
        }

        return true;
    }

    public bool NoConstraintViolations()
    {
        for (var row = 0; row < Constants.GridSize; row++)
        {
            for (var col = 0; col < Constants.GridSize; col++)
            {
                var value = Grid[row][col];
                if (value != Constants.EmptyCell && !IsValidPlacement(row, col, value))
                {
                    return false;
                }
            }
        }

        return true;
    }

    public bool IsValidSolution()
    {
        var digits = Enumerable.Range(1, Constants.GridSize).ToHashSet();
        for (var index = 0; index < Constants.GridSize; index++)
        {
            if (!Grid[index].ToHashSet().SetEquals(digits))
            {
                return false;
            }

            if (!Enumerable.Range(0, Constants.GridSize).Select(row => Grid[row][index]).ToHashSet().SetEquals(digits))
            {
                return false;
            }
        }

        for (var blockRow = 0; blockRow < Constants.BlockSize; blockRow++)
        {
            for (var blockCol = 0; blockCol < Constants.BlockSize; blockCol++)
            {
                if (!GetBlockValues(blockRow, blockCol).ToHashSet().SetEquals(digits))
                {
                    return false;
                }
            }
        }

        return true;
    }

    private bool IsInRow(int value, int row) => Grid[row].Contains(value);

    private bool IsInColumn(int value, int col) => Grid.Any(row => row[col] == value);

    private bool IsNumberInBlock(int value, int blockRow, int blockCol)
    {
        var startRow = blockRow * Constants.BlockSize;
        var startCol = blockCol * Constants.BlockSize;
        for (var row = startRow; row < startRow + Constants.BlockSize; row++)
        {
            for (var col = startCol; col < startCol + Constants.BlockSize; col++)
            {
                if (Grid[row][col] == value)
                {
                    return true;
                }
            }
        }

        return false;
    }

    private List<CellPosition> GetBlockEmptyCells(int blockRow, int blockCol)
    {
        var cells = new List<CellPosition>();
        var startRow = blockRow * Constants.BlockSize;
        var startCol = blockCol * Constants.BlockSize;
        for (var row = startRow; row < startRow + Constants.BlockSize; row++)
        {
            for (var col = startCol; col < startCol + Constants.BlockSize; col++)
            {
                if (Grid[row][col] == Constants.EmptyCell)
                {
                    cells.Add(new CellPosition(row, col));
                }
            }
        }

        return cells;
    }

    private List<int> GetBlockValues(int blockRow, int blockCol)
    {
        var values = new List<int>();
        var startRow = blockRow * Constants.BlockSize;
        var startCol = blockCol * Constants.BlockSize;
        for (var row = startRow; row < startRow + Constants.BlockSize; row++)
        {
            for (var col = startCol; col < startCol + Constants.BlockSize; col++)
            {
                values.Add(Grid[row][col]);
            }
        }

        return values;
    }

    private HashSet<int> GetCellCandidates(int row, int col)
    {
        var candidates = Enumerable.Range(1, Constants.GridSize).ToHashSet();
        candidates.ExceptWith(Grid[row]);
        candidates.ExceptWith(Enumerable.Range(0, Constants.GridSize).Select(r => Grid[r][col]));

        var blockRow = row / Constants.BlockSize * Constants.BlockSize;
        var blockCol = col / Constants.BlockSize * Constants.BlockSize;
        for (var r = blockRow; r < blockRow + Constants.BlockSize; r++)
        {
            for (var c = blockCol; c < blockCol + Constants.BlockSize; c++)
            {
                candidates.Remove(Grid[r][c]);
            }
        }

        candidates.Remove(Constants.EmptyCell);
        return candidates;
    }

    private static int FindMissingDigit(IEnumerable<int> values)
    {
        var present = values.Where(value => value != Constants.EmptyCell).ToHashSet();
        for (var digit = 1; digit <= Constants.GridSize; digit++)
        {
            if (!present.Contains(digit))
            {
                return digit;
            }
        }

        throw new InvalidOperationException("No missing digit found - invalid sudoku state");
    }
}
