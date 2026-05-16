param(
  [string]$Tags = "",
  [string]$Suite = "BDD",
  [int]$RetentionDays = 7
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$stackDir = Join-Path $repoRoot 'demo-apps/demoapp001-typescript-cypress'
$resultsRoot = Join-Path $repoRoot '.results'
$metricsDir = Join-Path $resultsRoot '.metrics'
$logsDir = Join-Path $resultsRoot 'logs'

New-Item -ItemType Directory -Path $metricsDir -Force | Out-Null
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

$timestamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')

# Stack short identifier used in metric key prefixes (DR-016 / MIG-12).
# Full canonical Stack name:  DEMOAPP001_TYPESCRIPT_CYPRESS
# Filesystem directory:       demo-apps/demoapp001-typescript-cypress/
# See DOCS/architecture/orchestration-design.md Section 6 for the full mapping.
$stackName = 'DEMOAPP001'

$buildLog = Join-Path $logsDir ("${stackName}_build_${timestamp}.log")
$testLog = Join-Path $logsDir ("${stackName}_test_${timestamp}.log")
$metricsTxt = Join-Path $metricsDir ("${stackName}_${timestamp}.txt")
$metricsMd = Join-Path $metricsDir ("${stackName}_${timestamp}.md")

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

$buildExitCode = 1
$testExitCode = 1
$overallExitCode = 1
$testsTotal = 0
$testsPassed = 0
$testsFailed = 0
$testsSkipped = 0
$durationSeconds = 0

Push-Location $stackDir
try {
  # Build step
  $buildOutput = & npm run build 2>&1
  $buildOutput | Out-File -FilePath $buildLog -Encoding utf8
  $buildExitCode = $LASTEXITCODE

  if ($buildExitCode -eq 0) {
    # Test step
    $testCommand = 'npm test'
    if (-not [string]::IsNullOrWhiteSpace($Tags)) {
      $testCommand = "npm test -- --tags $Tags"
    }

    $testOutput = Invoke-Expression "$testCommand 2>&1"
    $testOutput | Out-File -FilePath $testLog -Encoding utf8
    $testExitCode = $LASTEXITCODE

    $scenarioLine = $testOutput | Where-Object { $_ -match '\d+ scenarios \(' } | Select-Object -Last 1

    if ($scenarioLine) {
      if ($scenarioLine -match '^(\d+) scenarios') {
        $testsTotal = [int]$Matches[1]
      }
      if ($scenarioLine -match '(\d+) passed') {
        $testsPassed = [int]$Matches[1]
      }
      if ($scenarioLine -match '(\d+) failed') {
        $testsFailed = [int]$Matches[1]
      }
      if ($scenarioLine -match '(\d+) skipped') {
        $testsSkipped = [int]$Matches[1]
      }
      if ($scenarioLine -match '(\d+) pending') {
        $testsSkipped += [int]$Matches[1]
      }
      if ($scenarioLine -match '(\d+) undefined') {
        $testsSkipped += [int]$Matches[1]
      }
      if ($scenarioLine -match '(\d+) ambiguous') {
        $testsSkipped += [int]$Matches[1]
      }
    }
  }
}
finally {
  Pop-Location
}

$stopwatch.Stop()
$durationSeconds = [math]::Round($stopwatch.Elapsed.TotalSeconds, 3)

$overallExitCode = if ($buildExitCode -eq 0 -and $testExitCode -eq 0) { 0 } else { 1 }

$kvLines = @(
  "${stackName}_${Suite}_ExitCode=$testExitCode"
  "${stackName}_${Suite}_Tests=$testsTotal"
  "${stackName}_${Suite}_Passed=$testsPassed"
  "${stackName}_${Suite}_Failed=$testsFailed"
  "${stackName}_${Suite}_Skipped=$testsSkipped"
  "${stackName}_${Suite}_Duration=$durationSeconds"
  "${stackName}_${Suite}_Log=$testLog"
  "${stackName}_Build_ExitCode=$buildExitCode"
  "OverallExitCode=$overallExitCode"
)
$kvLines | Out-File -FilePath $metricsTxt -Encoding utf8

$mdLines = @(
  "| Stack | Suite | Exit | Tests | Passed | Failed | Skipped | Duration |"
  "|-------|-------|------|-------|--------|--------|---------|----------|"
  "| ${stackName} | ${Suite} | ${testExitCode} | ${testsTotal} | ${testsPassed} | ${testsFailed} | ${testsSkipped} | ${durationSeconds}s |"
  "",
  "BuildExitCode: ${buildExitCode}",
  "OverallExitCode: ${overallExitCode}",
  "Log: ${testLog}"
)
$mdLines | Out-File -FilePath $metricsMd -Encoding utf8

# Retention cleanup for logs/metrics older than retention threshold
# Per RA v1.3 §9.3: Preserve markdown metric summary files, purge old log files
$cutoff = (Get-Date).ToUniversalTime().AddDays(-$RetentionDays)

# Remove old log files (no preservation required)
Get-ChildItem -Path $logsDir -File | Where-Object { $_.LastWriteTimeUtc -lt $cutoff } | Remove-Item -Force -ErrorAction SilentlyContinue

# Remove old .txt metric files but PRESERVE markdown summaries for historical analysis
Get-ChildItem -Path $metricsDir -Filter "*.txt" | Where-Object { $_.LastWriteTimeUtc -lt $cutoff } | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "BuildExitCode: $buildExitCode"
Write-Host "TestExitCode: $testExitCode"
Write-Host "OverallExitCode: $overallExitCode"
Write-Host "MetricsTxt: $metricsTxt"
Write-Host "MetricsMd: $metricsMd (preserved for historical archival)"
Write-Host "TestLog: $testLog"

exit $overallExitCode
