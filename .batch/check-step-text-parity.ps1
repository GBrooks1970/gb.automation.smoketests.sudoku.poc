# check-step-text-parity.ps1
#
# Verifies RA Section 8.4 criterion 3: Stack-local Gherkin step text must
# match the canonical feature file step text exactly, excluding tag lines and
# non-step Gherkin structure.
#
# Usage (from repository root):
#   .\.batch\check-step-text-parity.ps1
#
# Exit code: 0 if all Stack-local step text is in parity; 1 otherwise.

param(
  [string]$CanonicalRoot = "features-shared",
  [string[]]$StackRoot   = @(
    "demo-apps/demoapp001-typescript-cypress/tests/features",
    "demo-apps/demoapp002-python-pytest/tests/features",
    "demo-apps/demoapp003-csharp-specflow/tests/features"
  )
)

$ErrorActionPreference = 'Stop'

$repoRoot  = Split-Path -Parent $PSScriptRoot
$canonical = Join-Path $repoRoot $CanonicalRoot

function ConvertTo-RepoRelativePath {
  param([string]$FilePath)

  $fullPath = (Resolve-Path -LiteralPath $FilePath).Path
  return $fullPath.Substring($repoRoot.Length).TrimStart('\', '/').Replace('\', '/')
}

function Get-GherkinSteps {
  param([string]$FilePath)

  $steps = [System.Collections.Generic.List[object]]::new()
  $currentContext = '(feature)'
  $lines = Get-Content -LiteralPath $FilePath -Encoding UTF8

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()

    if ($trimmed -match '^(Background|Scenario|Scenario Outline):\s*(.*)$') {
      $currentContext = $trimmed
      continue
    }

    if ($trimmed -match '^(Given|When|Then|And|But|\*)\s+.+$') {
      $steps.Add([pscustomobject]@{
        Position   = $steps.Count + 1
        LineNumber = $i + 1
        Context    = $currentContext
        Text       = $trimmed
      }) | Out-Null
    }
  }

  return @($steps)
}

if (-not (Test-Path -LiteralPath $canonical)) {
  Write-Host "ERROR: canonical feature root not found: $canonical"
  exit 1
}

$canonicalFeatures = @(Get-ChildItem -Path $canonical -Recurse -Filter "*.feature")

if ($canonicalFeatures.Count -eq 0) {
  Write-Host "ERROR: no canonical feature files found under $canonical"
  exit 1
}

$overallPass = $true

Write-Host ""
Write-Host "=== Step Text Parity Check (RA Section 8.4 criterion 3) ==="

foreach ($stackRootEntry in $StackRoot) {
  $stack = Join-Path $repoRoot $stackRootEntry

  Write-Host ""
  Write-Host "Stack root: $stackRootEntry"

  if (-not (Test-Path -LiteralPath $stack)) {
    Write-Host "  MISSING: Stack feature root not found: $stack"
    $overallPass = $false
    continue
  }

  $stackFeatures = @(Get-ChildItem -Path $stack -Recurse -Filter "*.feature")

  foreach ($canonicalFeature in $canonicalFeatures) {
    $fileName = $canonicalFeature.Name
    $stackFeature = $stackFeatures | Where-Object { $_.Name -eq $fileName } | Select-Object -First 1

    Write-Host ""
    Write-Host "Feature: $(ConvertTo-RepoRelativePath -FilePath $canonicalFeature.FullName)"

    if (-not $stackFeature) {
      Write-Host "  MISSING: Stack-local feature file not found by filename: $fileName"
      $overallPass = $false
      continue
    }

    $canonicalSteps = @(Get-GherkinSteps -FilePath $canonicalFeature.FullName)
    $stackSteps = @(Get-GherkinSteps -FilePath $stackFeature.FullName)
    $maxSteps = [Math]::Max($canonicalSteps.Count, $stackSteps.Count)
    $featurePass = $true

    for ($i = 0; $i -lt $maxSteps; $i++) {
      $canonicalStep = if ($i -lt $canonicalSteps.Count) { $canonicalSteps[$i] } else { $null }
      $stackStep = if ($i -lt $stackSteps.Count) { $stackSteps[$i] } else { $null }
      $position = $i + 1

      if ($null -eq $canonicalStep) {
        Write-Host "  EXTRA_STEP at Stack step $position"
        Write-Host "    Stack line $($stackStep.LineNumber) [$($stackStep.Context)]: $($stackStep.Text)"
        $featurePass = $false
        $overallPass = $false
        continue
      }

      if ($null -eq $stackStep) {
        Write-Host "  MISSING_STEP at canonical step $position"
        Write-Host "    Canonical line $($canonicalStep.LineNumber) [$($canonicalStep.Context)]: $($canonicalStep.Text)"
        $featurePass = $false
        $overallPass = $false
        continue
      }

      if ($canonicalStep.Text -ne $stackStep.Text) {
        Write-Host "  DRIFT at step $position"
        Write-Host "    Canonical line $($canonicalStep.LineNumber) [$($canonicalStep.Context)]: $($canonicalStep.Text)"
        Write-Host "    Stack line     $($stackStep.LineNumber) [$($stackStep.Context)]: $($stackStep.Text)"
        $featurePass = $false
        $overallPass = $false
      }
    }

    if ($featurePass) {
      Write-Host "  PASS: $($canonicalSteps.Count) step lines match"
    }
  }
}

Write-Host ""
Write-Host "==========================================================="
if ($overallPass) {
  Write-Host "Step text parity: PASS"
  exit 0
}

Write-Host "Step text parity: DRIFT"
exit 1
