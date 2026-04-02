@echo off
setlocal EnableDelayedExpansion

:: ---------------------------------------------------------------------------
:: run_solver_and_capture_output.bat
:: Runs the SudokuSolver (npm start) and pipes all output to a timestamped
:: file under .batch\output\.
::
:: Output file:  .batch\output\solver_output_YYYYMMDD_HHMMSS.txt
:: ---------------------------------------------------------------------------

:: Resolve the repo root and app directory relative to this script's location
set "REPO_ROOT=%~dp0.."
set "APP_DIR=%REPO_ROOT%\DEMOAPPS\DEMOAPP001_TYPESCRIPT_CYPRESS"
set "OUTPUT_DIR=%~dp0output"

:: Build a timestamp using PowerShell (locale-independent, works on Windows 11)
for /f %%T in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TIMESTAMP=%%T"

set "OUTPUT_FILE=%OUTPUT_DIR%\solver_output_%TIMESTAMP%.txt"

:: Ensure output directory exists
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo.
echo ==========================================================
echo  Sudoku Solver - Capturing Output
echo  Timestamp : %TIMESTAMP%
echo  Output    : %OUTPUT_FILE%
echo ==========================================================
echo.

:: Write a header into the output file
(
    echo Sudoku Solver Output
    echo Run timestamp : %TIMESTAMP%
    echo App directory : %APP_DIR%
    echo ============================================================
    echo.
) > "%OUTPUT_FILE%"

:: Run the solver from the app directory, piping stdout and stderr into the file
cd /d "%APP_DIR%"
npm start >> "%OUTPUT_FILE%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"

:: Append an exit status footer
(
    echo.
    echo ============================================================
    echo Exit code : %EXIT_CODE%
) >> "%OUTPUT_FILE%"

echo.
if %EXIT_CODE% EQU 0 (
    echo  [OK] Solver finished successfully.
) else (
    echo  [ERROR] Solver exited with code %EXIT_CODE%.
)
echo  Output saved to:
echo    %OUTPUT_FILE%
echo.

endlocal
exit /b %EXIT_CODE%
