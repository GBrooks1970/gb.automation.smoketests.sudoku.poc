# check-puzzles-parity.ps1
#
# Verifies DR-050: puzzles.json fixture data must remain 100% byte-identical
# across all three Stacks (DEMOAPP001 TypeScript, DEMOAPP002 Python, DEMOAPP003 C#).
# Also executes negative controls on temporary copies to prove that single-copy
# drift or missing files fail closed.
#
# Usage (from repository root):
#   .\.batch\check-puzzles-parity.ps1
#
# Exit code: 0 if all live copies match and negative controls pass; 1 otherwise.

param(
  [switch]$SkipNegativeControls
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot

$stackPuzzles = [ordered]@{
  'demoapp001' = Join-Path $repoRoot 'demo-apps/demoapp001-typescript-cypress/puzzles.json'
  'demoapp002' = Join-Path $repoRoot 'demo-apps/demoapp002-python-pytest/puzzles.json'
  'demoapp003' = Join-Path $repoRoot 'demo-apps/demoapp003-csharp-specflow/puzzles.json'
}

function Get-FileSha256 {
  param([string]$FilePath)

  if (-not (Test-Path -LiteralPath $FilePath)) {
    return $null
  }

  $stream = [System.IO.File]::OpenRead($FilePath)
  try {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $sha.ComputeHash($stream)
    return -join ($hashBytes | ForEach-Object { $_.ToString('x2') })
  }
  finally {
    $stream.Dispose()
  }
}

function Test-PuzzlesCopiesParity {
  param(
    [hashtable]$PuzzlesMap,
    [switch]$Quiet
  )

  $hashes = @{}
  $allExist = $true

  foreach ($key in $PuzzlesMap.Keys) {
    $path = $PuzzlesMap[$key]
    if (-not (Test-Path -LiteralPath $path)) {
      if (-not $Quiet) {
        Write-Host "  MISSING: $key puzzle fixture not found at $path"
      }
      $allExist = $false
      continue
    }

    $hash = Get-FileSha256 -FilePath $path
    $hashes[$key] = $hash
    if (-not $Quiet) {
      Write-Host "  Stack: $key"
      Write-Host "    Path:   $path"
      Write-Host "    SHA256: $hash"
    }
  }

  if (-not $allExist) {
    return $false
  }

  $distinctHashes = @($hashes.Values | Select-Object -Unique)
  if ($distinctHashes.Count -ne 1) {
    if (-not $Quiet) {
      Write-Host "  DRIFT: puzzles.json copies do not match ($($distinctHashes.Count) distinct hashes found)"
    }
    return $false
  }

  return $true
}

Write-Host ""
Write-Host "=== Puzzles Fixture Parity Check (DR-050) ==="

# 1. Live parity check across the three Stacks
$livePass = Test-PuzzlesCopiesParity -PuzzlesMap $stackPuzzles

if (-not $livePass) {
  Write-Host "Puzzles parity: DRIFT"
  exit 1
}

Write-Host "Puzzles parity: PASS (3/3 copies match)"

# 2. Negative controls on temporary copies
if (-not $SkipNegativeControls) {
  $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "sudoku-puzzles-parity-$([System.Guid]::NewGuid())"
  $negativePass = $true
  $rejectedCount = 0

  try {
    New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

    # Copy files into temp directory
    $tempPuzzles = [ordered]@{}
    foreach ($key in $stackPuzzles.Keys) {
      $tempPath = Join-Path $tempRoot "$key.puzzles.json"
      Copy-Item -LiteralPath $stackPuzzles[$key] -Destination $tempPath -Force
      $tempPuzzles[$key] = $tempPath
    }

    # Control 1..3: Planted single-copy edit for each stack
    foreach ($targetKey in $stackPuzzles.Keys) {
      $savedContent = Get-Content -LiteralPath $tempPuzzles[$targetKey] -Raw -Encoding UTF8
      try {
        # Append a planted mutation comment / byte
        [System.IO.File]::AppendAllText($tempPuzzles[$targetKey], "`n// planted mutation for $targetKey`n", [System.Text.Encoding]::UTF8)
        $mutatedCheck = Test-PuzzlesCopiesParity -PuzzlesMap $tempPuzzles -Quiet
        if ($mutatedCheck -eq $false) {
          $rejectedCount++
          Write-Host "  OK    rejected single-copy mutation on $targetKey"
        } else {
          Write-Host "  FAIL  accepted single-copy mutation on $targetKey"
          $negativePass = $false
        }
      }
      finally {
        [System.IO.File]::WriteAllText($tempPuzzles[$targetKey], $savedContent, [System.Text.Encoding]::UTF8)
      }
    }

    # Control 4..6: Planted missing file for each stack
    foreach ($targetKey in $stackPuzzles.Keys) {
      $savedPath = $tempPuzzles[$targetKey]
      $backupPath = "$savedPath.bak"
      Move-Item -LiteralPath $savedPath -Destination $backupPath -Force
      try {
        $missingCheck = Test-PuzzlesCopiesParity -PuzzlesMap $tempPuzzles -Quiet
        if ($missingCheck -eq $false) {
          $rejectedCount++
          Write-Host "  OK    rejected missing file on $targetKey"
        } else {
          Write-Host "  FAIL  accepted missing file on $targetKey"
          $negativePass = $false
        }
      }
      finally {
        Move-Item -LiteralPath $backupPath -Destination $savedPath -Force
      }
    }

    Write-Host "Puzzles parity negative controls: $(if ($negativePass) { 'PASS' } else { 'FAIL' }) ($rejectedCount/6 rejected)"
    if (-not $negativePass) {
      exit 1
    }
  }
  finally {
    if (Test-Path -LiteralPath $tempRoot) {
      Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
}

Write-Host "================================================="
Write-Host "Puzzles fixture parity: PASS"
exit 0
