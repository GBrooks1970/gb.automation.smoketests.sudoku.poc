param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('demoapp001', 'demoapp002', 'demoapp003')]
    [string]$Stack,
    [string]$PythonCommand = 'python',
    [string]$EvidenceRoot = '.results/then-assertion-mutations',
    [string[]]$MutationIds = @()
)

# BACKLOG-078: real runner controls, isolated evidence, byte-exact feature restoration.
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath "$PSScriptRoot/..").Path
if (-not [IO.Path]::IsPathRooted($EvidenceRoot)) { $EvidenceRoot = Join-Path $repoRoot $EvidenceRoot }
$EvidenceRoot = [IO.Path]::GetFullPath((Join-Path $EvidenceRoot $Stack))
New-Item -ItemType Directory -Path $EvidenceRoot -Force | Out-Null
$featureRelative = 'tests/features/BasicSudokuSolverLogic.feature'
$stackDirectory = @{
    demoapp001 = 'demo-apps/demoapp001-typescript-cypress'
    demoapp002 = 'demo-apps/demoapp002-python-pytest'
    demoapp003 = 'demo-apps/demoapp003-csharp-specflow'
}[$Stack]
$stackRoot = Join-Path $repoRoot $stackDirectory
$canonicalPath = Join-Path $repoRoot 'features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature'
$stackFeature = Join-Path $stackRoot $featureRelative
$originals = @{}
foreach ($path in @($canonicalPath, $stackFeature)) { $originals[$path] = [IO.File]::ReadAllBytes($path) }
$utf8 = [Text.UTF8Encoding]::new($false)
$records = [Collections.Generic.List[object]]::new()
$summaryPath = Join-Path $EvidenceRoot 'summary.json'
$success = $false

$row = @{ Title='Complete a row with only one missing value'; Python='complete_a_row_with_only_one_missing_value'; CSharp='CompleteARowWithOnlyOneMissingValue' }
$column = @{ Title='Complete a column with only one missing value'; Python='complete_a_column_with_only_one_missing_value'; CSharp='CompleteAColumnWithOnlyOneMissingValue' }
$block = @{ Title='Complete a 3x3 block with only one missing value'; Python='complete_a_3x3_block_with_only_one_missing_value'; CSharp='CompleteA3X3BlockWithOnlyOneMissingValue' }
$hiddenRow = @{ Title='Identify a Hidden Single in a row'; Python='identify_a_hidden_single_in_a_row'; CSharp='IdentifyAHiddenSingleInARow' }
$hiddenColumn = @{ Title='Identify a Hidden Single in a column'; Python='identify_a_hidden_single_in_a_column'; CSharp='IdentifyAHiddenSingleInAColumn' }
$hiddenBlock = @{ Title='Identify a Hidden Single in a 3x3 block'; Python='identify_a_hidden_single_in_a_3x3_block'; CSharp='IdentifyAHiddenSingleInA3X3Block' }
$negativeRow = @{ Title='Hidden Singles returns false when digit already exists in unit'; Python='hidden_singles_returns_false_when_digit_already_exists_in_unit'; CSharp='HiddenSinglesReturnsFalseWhenDigitAlreadyExistsInUnit' }
$naked = @{ Title='Identify a Naked Single by elimination'; Python='identify_a_naked_single_by_elimination'; CSharp='IdentifyANakedSingleByElimination' }
$multiple = @{ Title='Naked Singles finds multiple cells in one pass'; Python='naked_singles_finds_multiple_cells_in_one_pass'; CSharp='NakedSinglesFindsMultipleCellsInOnePass' }
$pairRow = @{ Title='Identify a Naked Pair in a row and eliminate candidates to place a single'; Python='identify_a_naked_pair_in_a_row_and_eliminate_candidates_to_place_a_single'; CSharp='IdentifyANakedPairInARowAndEliminateCandidatesToPlaceASingle' }
$pairColumn = @{ Title='Identify a Naked Pair in a column and eliminate candidates to place a single'; Python='identify_a_naked_pair_in_a_column_and_eliminate_candidates_to_place_a_single'; CSharp='IdentifyANakedPairInAColumnAndEliminateCandidatesToPlaceASingle' }
$pairBlock = @{ Title='Identify a Naked Pair in a 3x3 block and eliminate candidates to place a single'; Python='identify_a_naked_pair_in_a_3x3_block_and_eliminate_candidates_to_place_a_single'; CSharp='IdentifyANakedPairInA3X3BlockAndEliminateCandidatesToPlaceASingle' }
$xWingRow = @{ Title='Detect X-Wing in rows and eliminate candidate from columns to place a single'; Python='detect_xwing_in_rows_and_eliminate_candidate_from_columns_to_place_a_single'; CSharp='DetectX_WingInRowsAndEliminateCandidateFromColumnsToPlaceASingle' }
$xWingColumn = @{ Title='Detect X-Wing in columns and eliminate candidate from rows to place a single'; Python='detect_xwing_in_columns_and_eliminate_candidate_from_rows_to_place_a_single'; CSharp='DetectX_WingInColumnsAndEliminateCandidateFromRowsToPlaceASingle' }
$easy = @{ Title='Solve an easy puzzle end-to-end'; Python='solve_an_easy_puzzle_endtoend'; CSharp='SolveAnEasyPuzzleEnd_To_End' }

$mutations = @(
    @{ Id='unit-missing-digit'; Scenario=$row; Old='| 1, 2, 0, 4, 5, 6, 7, 8, 9 | 3       |'; New='| 1, 2, 0, 4, 5, 6, 7, 8, 9 | 4       |' },
    @{ Id='unit-empty-digit'; Scenario=$row; Old='And the value <missing> should be placed in the empty cell'; New='And the value 4 should be placed in the empty cell' },
    @{ Id='unit-column-digit'; Scenario=$column; Old='Then the system should place 7 in the empty cell of column 0'; New='Then the system should place 2 in the empty cell of column 0' },
    @{ Id='unit-column-position'; Scenario=$column; Old='Then the system should place 7 in the empty cell of column 0'; New='Then the system should place 7 in the empty cell of column 1' },
    @{ Id='unit-block-digit'; Scenario=$block; Old='Then the system should place 4 in the empty cell of that block'; New='Then the system should place 5 in the empty cell of that block' },
    @{ Id='hidden-row-digit'; Scenario=$hiddenRow; Old='Then the system should place 6 in the only valid cell in row 3'; New='Then the system should place 5 in the only valid cell in row 3' },
    @{ Id='hidden-row-position'; Scenario=$hiddenRow; Old='Then the system should place 6 in the only valid cell in row 3'; New='Then the system should place 6 in the only valid cell in row 4' },
    @{ Id='hidden-column-digit'; Scenario=$hiddenColumn; Old='Then the system should place 2 in the only valid cell in column 5'; New='Then the system should place 3 in the only valid cell in column 5' },
    @{ Id='hidden-column-position'; Scenario=$hiddenColumn; Old='Then the system should place 2 in the only valid cell in column 5'; New='Then the system should place 2 in the only valid cell in column 4' },
    @{ Id='hidden-block-digit'; Scenario=$hiddenBlock; Old='Then the system should place 5 in the one remaining valid cell of that block'; New='Then the system should place 6 in the one remaining valid cell of that block' },
    @{ Id='skip-row-position'; Scenario=$negativeRow; Old='Then the algorithm should skip row 0'; New='Then the algorithm should skip row 1' },
    @{ Id='unchanged-row-position'; Scenario=$negativeRow; Old='And no cells in row 0 should be modified'; New='And no cells in row 1 should be modified' },
    @{ Id='naked-single-digit'; Scenario=$naked; Old='Then the system should determine the only possible value is 9'; New='Then the system should determine the only possible value is 8' },
    @{ Id='explicit-cell-position'; Scenario=$naked; Old='And the cell at row 4, column 4 should be updated to 9'; New='And the cell at row 4, column 5 should be updated to 9' },
    @{ Id='naked-count'; Scenario=$multiple; Old='Then all 3 cells should be filled with their respective values'; New='Then all 2 cells should be filled with their respective values' },
    @{ Id='pair-row-position'; Scenario=$pairRow; Old='Then the cell in row 0 with candidates "2, 7, 4" should be updated to 4'; New='Then the cell in row 1 with candidates "2, 7, 4" should be updated to 4' },
    @{ Id='pair-column-position'; Scenario=$pairColumn; Old='Then the cell in column 0 with candidates "3, 8, 5" should be updated to 5'; New='Then the cell in column 1 with candidates "3, 8, 5" should be updated to 5' },
    @{ Id='pair-block-row'; Scenario=$pairBlock; Old='Then the cell in block (0, 0) with candidates "1, 6, 9" should be updated to 9'; New='Then the cell in block (1, 0) with candidates "1, 6, 9" should be updated to 9' },
    @{ Id='pair-block-column'; Scenario=$pairBlock; Old='Then the cell in block (0, 0) with candidates "1, 6, 9" should be updated to 9'; New='Then the cell in block (0, 1) with candidates "1, 6, 9" should be updated to 9' },
    @{ Id='xwing-row-position'; Scenario=$xWingRow; Old='Then the cell at row 7, column 1 should be updated to 3'; New='Then the cell at row 7, column 2 should be updated to 3' },
    @{ Id='xwing-column-position'; Scenario=$xWingColumn; Old='Then the cell at row 1, column 7 should be updated to 3'; New='Then the cell at row 2, column 7 should be updated to 3' },
    @{ Id='valid-digit-count'; Scenario=$easy; Old='And all 81 cells should contain valid digits'; New='And all 80 cells should contain valid digits' }
)
if ($MutationIds.Count -gt 0) {
    foreach ($id in $MutationIds) { if ($id -notin $mutations.Id) { throw "Unknown mutation ID: $id" } }
    $mutations = @($mutations | Where-Object { $_.Id -in $MutationIds })
}

function Restore-Features {
    foreach ($path in $originals.Keys) { [IO.File]::WriteAllBytes($path, $originals[$path]) }
}
function Invoke-Scenario([string]$Id, [hashtable]$Scenario, [bool]$ExpectedFailure) {
    $resultPath = Join-Path $EvidenceRoot "$Id.result"
    $logPath = Join-Path $EvidenceRoot "$Id.log"
    if (Test-Path -LiteralPath $resultPath) { Remove-Item -LiteralPath $resultPath }
    $selected = @(if ($Scenario.ContainsKey('Items')) { $Scenario.Items } else { $Scenario })
    $expectedTests = $selected.Count
    if ($Stack -eq 'demoapp001') {
        $command = 'npx'
        $namePattern = '^(' + (($selected | ForEach-Object { [regex]::Escape($_.Title) }) -join '|') + ')$'
        $commandArgs = @('--no-install','cucumber-js','--config','tooling/cucumber.js','--name',$namePattern,'--format',"json:$resultPath")
    } elseif ($Stack -eq 'demoapp002') {
        $command = $PythonCommand
        $commandArgs = @('-m','pytest','tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py','-k',($selected.Python -join ' or '),"--junitxml=$resultPath")
    } else {
        $command = 'dotnet'
        $filter = ($selected | ForEach-Object { 'Name~'+$_.CSharp }) -join '|'
        $commandArgs = @('test','tests/DemoApp003.Specs.csproj','--no-restore','--filter',$filter,'--logger',"trx;LogFileName=$resultPath")
    }
    $watch = [Diagnostics.Stopwatch]::StartNew()
    Push-Location $stackRoot
    try { & $command @commandArgs *> $logPath; $exitCode = $LASTEXITCODE }
    finally { Pop-Location; $watch.Stop() }
    if (-not (Test-Path -LiteralPath $resultPath)) { throw "$Id produced no native result; see $logPath" }
    $tests = 0; $failed = 0; $errors = 0; $assertionText = ''
    if ($Stack -eq 'demoapp001') {
        $report = Get-Content -LiteralPath $resultPath -Raw | ConvertFrom-Json
        $scenarios = @($report.elements | Where-Object { $_.type -eq 'scenario' })
        $tests = $scenarios.Count
        foreach ($scenarioResult in $scenarios) {
            $failures = @($scenarioResult.steps | Where-Object { $_.result.status -eq 'failed' })
            if ($failures.Count -gt 0) { $failed++ }
            $assertionText += ($failures.result.error_message -join "`n")
            if (@($scenarioResult.steps | Where-Object { $_.result.status -in @('undefined','ambiguous','pending') }).Count -gt 0) { $errors++ }
            if (-not $ExpectedFailure -and @($scenarioResult.steps | Where-Object { $_.result.status -ne 'passed' }).Count -gt 0) { $errors++ }
        }
    } elseif ($Stack -eq 'demoapp002') {
        [xml]$report = Get-Content -LiteralPath $resultPath -Raw
        $tests = [int]$report.testsuites.testsuite.tests
        $failed = [int]$report.testsuites.testsuite.failures
        $errors = [int]$report.testsuites.testsuite.errors
        if (-not $ExpectedFailure) { $errors += [int]$report.testsuites.testsuite.skipped }
        $assertionText = $report.testsuites.testsuite.testcase.failure.InnerText
    } else {
        [xml]$report = Get-Content -LiteralPath $resultPath -Raw
        $tests = [int]$report.TestRun.ResultSummary.Counters.executed
        $failed = [int]$report.TestRun.ResultSummary.Counters.failed
        $errors = [int]$report.TestRun.ResultSummary.Counters.error
        if (-not $ExpectedFailure) { $errors += [int]$report.TestRun.ResultSummary.Counters.notExecuted }
        $assertionText = $report.TestRun.Results.UnitTestResult.Output.ErrorInfo.Message
    }
    $record = [pscustomobject]@{ Id=$Id; Scenario=($selected.Title -join '; '); ExpectedFailure=$ExpectedFailure; NativeExitCode=$exitCode; Tests=$tests; Failed=$failed; Errors=$errors; DurationMs=$watch.ElapsedMilliseconds; Log=$logPath; Result=$resultPath }
    $records.Add($record)
    $records | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $EvidenceRoot 'runs.json')
    if ($tests -ne $expectedTests -or $errors -ne 0) { throw "$Id must execute $expectedTests selected scenarios without runner errors or skipped positives; tests=$tests errors=$errors" }
    if ($ExpectedFailure) {
        if ($exitCode -ne 1 -or $failed -ne 1 -or $assertionText -notmatch '(?i)AssertionError|AssertionException|Expected|assert ') {
            throw "$Id did not fail its bound assertion; exit=$exitCode failed=$failed; see $logPath"
        }
        Write-Output "$Stack $Id KILLED tests=$tests durationMs=$($watch.ElapsedMilliseconds)"
    } else {
        if ($exitCode -ne 0 -or $failed -ne 0) { throw "$Id positive control failed; see $logPath" }
        Write-Output "$Stack $Id PASS tests=$tests durationMs=$($watch.ElapsedMilliseconds)"
    }
}

try {
    # One positive execution for each selected scenario prevents a pre-existing red suite
    # from being mistaken for proof that its assertion detects a planted wrong expectation.
    $seen = @{}
    $positives = [Collections.Generic.List[hashtable]]::new()
    foreach ($mutation in $mutations) {
        if (-not $seen.ContainsKey($mutation.Scenario.Title)) {
            $positives.Add($mutation.Scenario)
            $seen[$mutation.Scenario.Title] = $true
        }
    }
    Restore-Features
    Invoke-Scenario 'positive-controls' @{ Items=$positives.ToArray() } $false
    foreach ($mutation in $mutations) {
        Restore-Features
        foreach ($path in @($canonicalPath, $stackFeature)) {
            $text = $utf8.GetString($originals[$path])
            $matches = [regex]::Matches($text, [regex]::Escape($mutation.Old)).Count
            if ($matches -ne 1) { throw "$($mutation.Id) must match once in $path; found $matches" }
            [IO.File]::WriteAllText($path, $text.Replace($mutation.Old, $mutation.New), $utf8)
        }
        Invoke-Scenario $mutation.Id $mutation.Scenario $true
    }
    $success = $true
} finally {
    Restore-Features
    $restored = $true
    foreach ($path in $originals.Keys) {
        $actual = [IO.File]::ReadAllBytes($path)
        $expectedHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($originals[$path]))
        $actualHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($actual))
        if ($actualHash -ne $expectedHash) { $restored = $false }
    }
    $positiveCount = ($records | Where-Object { -not $_.ExpectedFailure } | Measure-Object -Property Tests -Sum).Sum
    [pscustomobject]@{ Stack=$Stack; Success=($success -and $restored); FeaturesRestored=$restored; PositiveControls=$positiveCount; Mutations=@($records | Where-Object { $_.ExpectedFailure }).Count; ExpectedMutations=$mutations.Count; Runs=$records } | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $summaryPath
    if (-not $restored) { throw 'Feature restoration failed' }
}
Write-Output "$Stack Then assertion controls PASS: $($mutations.Count) mutations killed; features restored byte-for-byte"
exit 0
