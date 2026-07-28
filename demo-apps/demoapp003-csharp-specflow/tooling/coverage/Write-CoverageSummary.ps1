param(
    [Parameter(Mandatory = $true)]
    [string]$CoverageDirectory,

    [ValidateRange(0, 100)]
    [double]$MinimumLinePercent = 0,

    [ValidateRange(0, 100)]
    [double]$MinimumBranchPercent = 0
)

$resolvedDirectory = Resolve-Path -LiteralPath $CoverageDirectory -ErrorAction Stop
$report = Get-ChildItem -LiteralPath $resolvedDirectory -Recurse -Filter 'coverage.cobertura.xml' |
    Sort-Object LastWriteTimeUtc |
    Select-Object -Last 1

if ($null -eq $report) {
    throw "No coverage.cobertura.xml report found under $resolvedDirectory"
}

[xml]$coverage = Get-Content -LiteralPath $report.FullName -Raw
$summary = $coverage.coverage

$linesCovered = [int]$summary.'lines-covered'
$linesValid = [int]$summary.'lines-valid'
$branchesCovered = [int]$summary.'branches-covered'
$branchesValid = [int]$summary.'branches-valid'

$linePercent = if ($linesValid -eq 0) { 0 } else { 100 * $linesCovered / $linesValid }
$branchPercent = if ($branchesValid -eq 0) { 0 } else { 100 * $branchesCovered / $branchesValid }

Write-Output 'DEMOAPP003 component coverage policy'
Write-Output ("Lines: {0}/{1} ({2:F2}%)" -f $linesCovered, $linesValid, $linePercent)
Write-Output ("Branches: {0}/{1} ({2:F2}%)" -f $branchesCovered, $branchesValid, $branchPercent)
Write-Output ("Cobertura: {0}" -f $report.FullName)

if ($linePercent -lt $MinimumLinePercent) {
    throw ("Line coverage {0:F2}% is below the required {1:F2}% floor" -f $linePercent, $MinimumLinePercent)
}

if ($branchPercent -lt $MinimumBranchPercent) {
    throw ("Branch coverage {0:F2}% is below the required {1:F2}% floor" -f $branchPercent, $MinimumBranchPercent)
}

Write-Output ("Coverage floors satisfied: lines >= {0:F2}%, branches >= {1:F2}%" -f $MinimumLinePercent, $MinimumBranchPercent)
