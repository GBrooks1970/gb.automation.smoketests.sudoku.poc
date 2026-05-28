# generate-feature-parity-report.ps1
#
# Compares canonical feature files in features-shared/ against their Stack-local
# copies and writes a FEATURE_PARITY_[YYYYMMDDTHHMMZ].md report to
# .results/feature-parity/ per RA v1.3 Section 9.2.
#
# Usage (from repository root):
#   .\.batch\generate-feature-parity-report.ps1
#
# Exit code: 0 if all Stack-local copies are in parity; 1 if any non-PASS result is detected.

param(
  [string]$CanonicalRoot = "features-shared",
  [string[]]$StackRoot   = @(
    "demo-apps/demoapp001-typescript-cypress/tests/features",
    "demo-apps/demoapp002-python-pytest/tests/features",
    "demo-apps/demoapp003-csharp-specflow/tests/features"
  )
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$canonical  = Join-Path $repoRoot $CanonicalRoot
$outDir     = Join-Path $repoRoot ".results/feature-parity"
$timestamp  = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmZ')
$reportFile = Join-Path $outDir "FEATURE_PARITY_${timestamp}.md"

New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$canonicalFeatures = Get-ChildItem -Path $canonical -Recurse -Filter "*.feature"
$results = [System.Collections.Generic.List[hashtable]]::new()
$overallPass = $true

foreach ($stackRootEntry in $StackRoot) {
  $stack = Join-Path $repoRoot $stackRootEntry

  if (-not (Test-Path -LiteralPath $stack)) {
    foreach ($cf in $canonicalFeatures) {
      $results.Add(@{
        StackRoot     = $stackRootEntry
        CanonicalPath = $cf.FullName.Substring($repoRoot.Length).TrimStart('\','/')
        StackPath     = "(stack root not found)"
        Status        = 'MISSING'
        Notes         = 'Stack-local feature root not found'
      })
    }
    $overallPass = $false
    continue
  }

  $stackFeatures = Get-ChildItem -Path $stack -Recurse -Filter "*.feature"

  foreach ($cf in $canonicalFeatures) {
    # Stack-local copies are flat (filename only, no subdirectory replication)
    $fileName  = $cf.Name
    $stackFile = $stackFeatures | Where-Object { $_.Name -eq $fileName } | Select-Object -First 1

    $entry = @{
      StackRoot     = $stackRootEntry
      CanonicalPath = $cf.FullName.Substring($repoRoot.Length).TrimStart('\','/')
      StackPath     = if ($stackFile) { $stackFile.FullName.Substring($repoRoot.Length).TrimStart('\','/') } else { "(not found)" }
      Status        = ''
      Notes         = ''
    }

    if (-not $stackFile) {
      $entry.Status = 'MISSING'
      $entry.Notes  = 'Stack-local copy not found by filename'
      $overallPass  = $false
    } else {
      # Compare non-tag lines (tag lines carry stack-local additions)
      $canonLines = (Get-Content $cf.FullName) | Where-Object { $_ -notmatch '^\s*@' }
      $stackLines = (Get-Content $stackFile.FullName) | Where-Object { $_ -notmatch '^\s*@' }

      $canonBody = ($canonLines -join "`n").Trim()
      $stackBody = ($stackLines -join "`n").Trim()

      if ($canonBody -eq $stackBody) {
        $entry.Status = 'IN_PARITY'
        $entry.Notes  = 'Bodies match after tag-line exclusion'
      } else {
        $entry.Status = 'DRIFT'
        $entry.Notes  = 'Body mismatch after tag-line exclusion'
        $overallPass  = $false
      }
    }

    $results.Add($entry)
  }
}

$inParity = @($results | Where-Object { $_.Status -eq 'IN_PARITY' }).Count
$missing  = @($results | Where-Object { $_.Status -eq 'MISSING'   }).Count
$drift    = @($results | Where-Object { $_.Status -eq 'DRIFT'     }).Count

$overallResult = if ($missing -gt 0) {
  'MISSING'
} elseif ($drift -gt 0) {
  'DRIFT'
} else {
  'PASS'
}

# Build markdown report
$b = '**'
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# Feature Parity Report")
$lines.Add("")
$lines.Add("${b}Generated:${b} $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mmZ'))")
$lines.Add("${b}Canonical root:${b} ``$CanonicalRoot``")
$lines.Add("${b}Stack roots:${b} ``$($StackRoot -join '`, `')``")
$lines.Add("${b}Overall result:${b} $overallResult")
$lines.Add("")
$lines.Add("---")
$lines.Add("")
$lines.Add("## Feature File Status")
$lines.Add("")
$lines.Add("| Status | Stack root | Canonical path | Stack path | Notes |")
$lines.Add("|--------|------------|---------------|-----------|-------|")

foreach ($r in $results) {
  $icon = switch ($r.Status) {
    'IN_PARITY' { 'PASS' }
    'MISSING'   { 'MISSING' }
    'DRIFT'     { 'DRIFT' }
    default     { $r.Status }
  }
  $lines.Add("| $icon | $($r.StackRoot) | $($r.CanonicalPath) | $($r.StackPath) | $($r.Notes) |")
}

$lines.Add("")
$lines.Add("---")
$lines.Add("")
$lines.Add("## Summary")
$lines.Add("")
$lines.Add("| Result    | Count |")
$lines.Add("|-----------|-------|")
$lines.Add("| IN_PARITY | $inParity |")
$lines.Add("| DRIFT     | $drift |")
$lines.Add("| MISSING   | $missing |")
$lines.Add("")
$lines.Add("_Report written by \`.batch\generate-feature-parity-report.ps1\`. Governed by RA v1.3 Section 9.2._")

$lines | Out-File -FilePath $reportFile -Encoding utf8

Write-Host "Parity report: $reportFile"
Write-Host "Overall result: $overallResult"

exit $(if ($overallPass) { 0 } else { 1 })
