# check-memory-key-parity.ps1
# Verifies Memory key parity for all active Stacks per RA Section 8.1.
# Exit 0 = PASS (all keys satisfy: constant name == string value, and sets are identical across Stacks)
# Exit 1 = FAIL (one or more NAME_VALUE_MISMATCH or SET_MISMATCH errors)
#
# Stack identifier mapping (DR-016):
#   DEMOAPP001 -> DEMOAPP001_TYPESCRIPT_CYPRESS
#   DEMOAPP002 -> DEMOAPP002_PYTHON_PYTEST

param()

$ErrorActionPreference = 'Stop'

# ── Configuration ────────────────────────────────────────────────────────────
# Each Stack entry: Name (short identifier) + Path to memory-keys file
$Stacks = @(
    @{
        Name    = 'DEMOAPP001'
        Path    = "$PSScriptRoot\..\demo-apps\demoapp001-typescript-cypress\tests\screenplay\support\memory-keys.ts"
        Pattern = "(?m)^\s*export\s+const\s+(\w+)\s*=\s*'(\w+)'"
    }
    @{
        Name    = 'DEMOAPP002'
        Path    = "$PSScriptRoot\..\demo-apps\demoapp002-python-pytest\tests\screenplay\support\memory_keys.py"
        Pattern = "(?m)^\s*(\w+)\s*=\s*['""](\w+)['""]"
    }
)

# ── Helpers ──────────────────────────────────────────────────────────────────

function Get-MemoryKeys {
    param([string]$FilePath, [string]$Pattern)
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $found   = [regex]::Matches($content, $Pattern)
    $keys    = [ordered]@{}
    foreach ($m in $found) {
        $keys[$m.Groups[1].Value] = $m.Groups[2].Value
    }
    return $keys
}

# ── Main ─────────────────────────────────────────────────────────────────────

$overallPass  = $true
$baseline     = $null
$baselineName = $null

Write-Host ""
Write-Host "=== Memory Key Parity Check (RA Section 8.1) ==="

foreach ($stack in $Stacks) {
    Write-Host ""
    Write-Host "Stack: $($stack.Name)"
    Write-Host "File:  $($stack.Path)"

    if (-not (Test-Path $stack.Path)) {
        Write-Host "  ERROR: memory-keys file not found"
        $overallPass = $false
        continue
    }

    $keys = Get-MemoryKeys -FilePath $stack.Path -Pattern $stack.Pattern

    if ($keys.Count -eq 0) {
        Write-Host "  WARNING: no memory key constants found — check pattern or file content"
    }

    foreach ($name in $keys.Keys) {
        $value = $keys[$name]
        if ($name -ne $value) {
            Write-Host "  FAIL  NAME_VALUE_MISMATCH: const $name = '$value'  (expected '$name')"
            $overallPass = $false
        } else {
            Write-Host "  OK    $name = '$value'"
        }
    }

    if ($null -eq $baseline) {
        $baseline     = $keys
        $baselineName = $stack.Name
    } else {
        $baselineSet = @($baseline.Keys | Sort-Object)
        $currentSet  = @($keys.Keys     | Sort-Object)
        $missing  = $baselineSet | Where-Object { $_ -notin $currentSet }
        $extra    = $currentSet  | Where-Object { $_ -notin $baselineSet }

        foreach ($k in $missing) {
            Write-Host "  FAIL  SET_MISMATCH: '$k' present in $baselineName but missing from $($stack.Name)"
            $overallPass = $false
        }
        foreach ($k in $extra) {
            Write-Host "  FAIL  SET_MISMATCH: '$k' present in $($stack.Name) but not in $baselineName"
            $overallPass = $false
        }
    }
}

Write-Host ""
Write-Host "================================================="
if ($overallPass) {
    Write-Host "Memory key parity: PASS"
    exit 0
} else {
    Write-Host "Memory key parity: FAIL"
    exit 1
}
