using DemoApp003.Sudoku;

namespace DemoApp003.Specs.Screenplay.Fixtures;

public static class GridFixtures
{
    public static void SetupAlmostCompleteColumn(SudokuSolver solver, int col, int missingDigit)
    {
        var values = DigitsExcept(missingDigit);
        for (var index = 0; index < values.Length; index++)
        {
            solver.Grid[index + 1][col] = values[index];
        }

        solver.Grid[0][col] = Constants.EmptyCell;
    }

    public static void SetupAlmostCompleteBlock(SudokuSolver solver, int blockRow, int blockCol, int missingDigit)
    {
        var values = DigitsExcept(missingDigit);
        var index = 0;
        for (var row = blockRow * Constants.BlockSize; row < (blockRow + 1) * Constants.BlockSize; row++)
        {
            for (var col = blockCol * Constants.BlockSize; col < (blockCol + 1) * Constants.BlockSize; col++)
            {
                solver.Grid[row][col] = index < values.Length ? values[index] : Constants.EmptyCell;
                index++;
            }
        }
    }

    public static void SetupMultipleEmpties(SudokuSolver solver)
    {
        for (var row = 0; row < Constants.GridSize; row++)
        {
            for (var col = 0; col < Constants.GridSize; col++)
            {
                solver.Grid[row][col] = (row + col) % 2 == 0
                    ? ((row * 3 + col + 1) % 9) + 1
                    : Constants.EmptyCell;
            }
        }
    }

    public static void SetupRowMissingDigit(SudokuSolver solver, int rowIndex, int target)
    {
        var digits = DigitsExcept(target);
        var index = 0;
        for (var col = 0; col < Constants.GridSize; col++)
        {
            if (col == 4)
            {
                solver.Grid[rowIndex][col] = Constants.EmptyCell;
            }
            else
            {
                solver.Grid[rowIndex][col] = digits[index++];
            }
        }
    }

    public static void SetupColumnMissingDigit(SudokuSolver solver, int colIndex, int target)
    {
        var digits = DigitsExcept(target);
        var index = 0;
        for (var row = 0; row < Constants.GridSize; row++)
        {
            if (row == 4)
            {
                solver.Grid[row][colIndex] = Constants.EmptyCell;
            }
            else
            {
                solver.Grid[row][colIndex] = digits[index++];
            }
        }
    }

    public static void SetupRowColumnConstraints(SudokuSolver solver, int count, int rowIndex, int target)
    {
        const int candidateCol = 4;
        var usedRows = new HashSet<int>();
        var blocked = 0;

        for (var col = 0; col < Constants.GridSize && blocked < count; col++)
        {
            if (col == candidateCol)
            {
                continue;
            }

            var row = BlockingRow(col, rowIndex, candidateCol, usedRows);
            solver.Grid[row][col] = target;
            usedRows.Add(row);
            blocked++;
        }
    }

    public static void SetupColumnRowConstraints(SudokuSolver solver, int count, int colIndex, int target)
    {
        const int candidateRow = 4;
        var usedCols = new HashSet<int>();
        var blocked = 0;

        for (var row = 0; row < Constants.GridSize && blocked < count; row++)
        {
            if (row == candidateRow)
            {
                continue;
            }

            var col = BlockingCol(row, candidateRow, colIndex, usedCols);
            solver.Grid[row][col] = target;
            usedCols.Add(col);
            blocked++;
        }
    }

    public static void SetupBlockFourEmpties(SudokuSolver solver)
    {
        solver.Grid[0][0] = 1;
        solver.Grid[1][0] = 2;
        solver.Grid[2][0] = 3;
        solver.Grid[2][1] = 6;
        solver.Grid[2][2] = 7;
    }

    public static void SetupHiddenSingleInBlock(SudokuSolver solver, int target)
    {
        solver.Grid[0][5] = target;
        solver.Grid[3][1] = target;
    }

    public static void SetupDigitInRow(SudokuSolver solver, int rowIndex, int digit) =>
        solver.Grid[rowIndex][5] = digit;

    public static void ClearCell(SudokuSolver solver, int row, int col) =>
        solver.Grid[row][col] = Constants.EmptyCell;

    public static void SetupThreeCandidates(SudokuSolver solver)
    {
        solver.Grid[0][1] = 1;
        solver.Grid[0][2] = 3;
        solver.Grid[0][3] = 4;
        solver.Grid[1][0] = 6;
        solver.Grid[2][0] = 7;
        solver.Grid[4][0] = 9;
    }

    public static void SetupThreeNakedSingles(SudokuSolver solver)
    {
        var solution = new[]
        {
            new[] { 5, 3, 4, 6, 7, 8, 9, 1, 2 },
            new[] { 6, 7, 2, 1, 9, 5, 3, 4, 8 },
            new[] { 1, 9, 8, 3, 4, 2, 5, 6, 7 },
            new[] { 8, 5, 9, 7, 6, 1, 4, 2, 3 },
            new[] { 4, 2, 6, 8, 5, 3, 7, 9, 1 },
            new[] { 7, 1, 3, 9, 2, 4, 8, 5, 6 },
            new[] { 9, 6, 1, 5, 3, 7, 2, 8, 4 },
            new[] { 2, 8, 7, 4, 1, 9, 6, 3, 5 },
            new[] { 3, 4, 5, 2, 8, 6, 1, 7, 9 },
        };

        for (var row = 0; row < Constants.GridSize; row++)
        {
            for (var col = 0; col < Constants.GridSize; col++)
            {
                solver.Grid[row][col] = solution[row][col];
            }
        }

        solver.Grid[0][0] = Constants.EmptyCell;
        solver.Grid[4][4] = Constants.EmptyCell;
        solver.Grid[8][8] = Constants.EmptyCell;
    }

    public static void SetupNamedGridState(SudokuSolver solver, string gridState)
    {
        if (gridState == "has5InSameRow")
        {
            solver.Grid[0][5] = 5;
        }
        else if (gridState == "has3InSameCol")
        {
            solver.Grid[5][0] = 3;
        }
        else if (gridState == "has7InSameBlock")
        {
            solver.Grid[0][0] = 7;
        }
        else if (gridState == "has1InRowAndCol")
        {
            solver.Grid[8][0] = 1;
            solver.Grid[0][8] = 1;
        }
        else if (gridState == "fullyConstrained")
        {
            solver.Grid[3][0] = 8;
        }
    }

    public static void SetupWithDuplicateInRow(SudokuSolver solver, int rowIndex, int value)
    {
        solver.Grid[rowIndex][0] = value;
        solver.Grid[rowIndex][1] = value;
    }

    public static void AddValuesToRow(SudokuSolver solver, int row, int excludeCol, IReadOnlyList<int> values)
    {
        var placed = 0;
        for (var col = 0; col < Constants.GridSize && placed < values.Count; col++)
        {
            if (col != excludeCol && solver.Grid[row][col] == Constants.EmptyCell)
            {
                solver.Grid[row][col] = values[placed++];
            }
        }
    }

    public static void AddValuesToColumn(SudokuSolver solver, int col, int excludeRow, IReadOnlyList<int> values)
    {
        var placed = 0;
        for (var row = 0; row < Constants.GridSize && placed < values.Count; row++)
        {
            if (row != excludeRow && solver.Grid[row][col] == Constants.EmptyCell)
            {
                solver.Grid[row][col] = values[placed++];
            }
        }
    }

    public static void AddValuesToBlock(
        SudokuSolver solver,
        int targetRow,
        int targetCol,
        int excludeRow,
        int excludeCol,
        IReadOnlyList<int> values)
    {
        var blockStartRow = targetRow / Constants.BlockSize * Constants.BlockSize;
        var blockStartCol = targetCol / Constants.BlockSize * Constants.BlockSize;
        var placed = 0;
        for (var row = blockStartRow; row < blockStartRow + Constants.BlockSize && placed < values.Count; row++)
        {
            for (var col = blockStartCol; col < blockStartCol + Constants.BlockSize && placed < values.Count; col++)
            {
                if ((row != excludeRow || col != excludeCol) && solver.Grid[row][col] == Constants.EmptyCell)
                {
                    solver.Grid[row][col] = values[placed++];
                }
            }
        }
    }

    public static IReadOnlyList<SudokuSolver> CreateSolversFromPuzzles(int count, IReadOnlyList<Puzzle> puzzles) =>
        puzzles.Take(count).Select(puzzle => new SudokuSolver(puzzle.Name, puzzle.Grid)).ToArray();

    private static int[] DigitsExcept(int missingDigit) =>
        Enumerable.Range(1, Constants.GridSize).Where(digit => digit != missingDigit).ToArray();

    private static int BlockingRow(int col, int candidateRow, int candidateCol, HashSet<int> usedRows)
    {
        var candidateBlockRow = candidateRow / Constants.BlockSize;
        var candidateBlockCol = candidateCol / Constants.BlockSize;
        var colSharesCandidateBlock = col / Constants.BlockSize == candidateBlockCol;
        var allowedRows = Enumerable.Range(0, Constants.GridSize)
            .Where(row => row != candidateRow && (!colSharesCandidateBlock || row / Constants.BlockSize != candidateBlockRow))
            .ToArray();

        return allowedRows.FirstOrDefault(row => !usedRows.Contains(row), allowedRows[0]);
    }

    private static int BlockingCol(int row, int candidateRow, int candidateCol, HashSet<int> usedCols)
    {
        var candidateBlockRow = candidateRow / Constants.BlockSize;
        var candidateBlockCol = candidateCol / Constants.BlockSize;
        var rowSharesCandidateBlock = row / Constants.BlockSize == candidateBlockRow;
        var allowedCols = Enumerable.Range(0, Constants.GridSize)
            .Where(col => col != candidateCol && (!rowSharesCandidateBlock || col / Constants.BlockSize != candidateBlockCol))
            .ToArray();

        return allowedCols.FirstOrDefault(col => !usedCols.Contains(col), allowedCols[0]);
    }
}
