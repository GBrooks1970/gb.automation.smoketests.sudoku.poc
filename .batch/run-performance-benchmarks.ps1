# run-performance-benchmarks.ps1
#
# Runs reporting-only performance benchmarks for all active Stacks and writes
# generated artifacts under .results/performance/.
#
# Usage (from repository root):
#   .\.batch\run-performance-benchmarks.ps1

param(
  [int]$Iterations = 10,
  [int]$WarmupIterations = 2
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $repoRoot ".results/performance"
$summaryFile = Join-Path $outDir "summary.md"
$failures = [System.Collections.Generic.List[string]]::new()

New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$env:BENCHMARK_ITERATIONS = "$Iterations"
$env:BENCHMARK_WARMUP_ITERATIONS = "$WarmupIterations"

function Invoke-BenchmarkStep {
  param(
    [string]$Name,
    [string]$WorkingDirectory,
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "=== $Name ==="
  Push-Location $WorkingDirectory
  try {
    & $Command
    if ($LASTEXITCODE -ne 0) {
      $failures.Add("${Name}: exit code $LASTEXITCODE")
    }
  } catch {
    $failures.Add("${Name}: $($_.Exception.Message)")
  } finally {
    Pop-Location
  }
}

Invoke-BenchmarkStep `
  -Name "DEMOAPP001 TypeScript benchmark" `
  -WorkingDirectory (Join-Path $repoRoot "demo-apps/demoapp001-typescript-cypress") `
  -Command { npm run benchmark }

Invoke-BenchmarkStep `
  -Name "DEMOAPP002 Python benchmark" `
  -WorkingDirectory (Join-Path $repoRoot "demo-apps/demoapp002-python-pytest") `
  -Command { python -m tooling.performance.benchmark }

Invoke-BenchmarkStep `
  -Name "DEMOAPP003 C# benchmark" `
  -WorkingDirectory $repoRoot `
  -Command { dotnet run --project demo-apps/demoapp003-csharp-specflow/tooling/performance/DemoApp003.Performance.csproj --configuration Release }

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# Performance Benchmark Summary")
$lines.Add("")
$lines.Add("**Generated:** $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))")
$lines.Add("**Iterations:** $Iterations")
$lines.Add("**Warmup iterations:** $WarmupIterations")
$lines.Add("**Mode:** Reporting only; no threshold gate is applied.")
$lines.Add("")
$lines.Add("| Stack | Latest JSON artifact | Latest Markdown artifact |")
$lines.Add("|-------|----------------------|--------------------------|")

foreach ($stack in @("DEMOAPP001", "DEMOAPP002", "DEMOAPP003")) {
  $stackDir = Join-Path $outDir $stack
  $latestJson = Get-ChildItem -Path $stackDir -Filter "*.json" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  $latestMd = Get-ChildItem -Path $stackDir -Filter "*.md" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  $jsonPath = if ($latestJson) { $latestJson.FullName.Substring($repoRoot.Length).TrimStart('\','/').Replace('\','/') } else { "(missing)" }
  $mdPath = if ($latestMd) { $latestMd.FullName.Substring($repoRoot.Length).TrimStart('\','/').Replace('\','/') } else { "(missing)" }
  $lines.Add("| $stack | `$jsonPath` | `$mdPath` |")
}

if ($failures.Count -gt 0) {
  $lines.Add("")
  $lines.Add("## Failures")
  foreach ($failure in $failures) {
    $lines.Add("- $failure")
  }
}

$lines | Out-File -FilePath $summaryFile -Encoding utf8

Write-Host ""
Write-Host "Performance summary: $summaryFile"

if ($failures.Count -gt 0) {
  Write-Host "Performance benchmarks: FAIL"
  exit 1
}

Write-Host "Performance benchmarks: PASS"
exit 0
