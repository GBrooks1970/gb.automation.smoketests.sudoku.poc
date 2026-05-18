# Memory Key Parity Checker — Template

**Template for:** `.batch/check-memory-key-parity` (PowerShell) or equivalent  
**Governed by:** `reference-architecture.md` Section 8.1  
**When to use:** When adding or extending the automated Memory key parity checker for this project

---

## Purpose

This template describes the required behaviour of a Memory key parity checker as mandated by RA Section 8.1. Adapt it to the project language (PowerShell, Bash, Python, etc.) and the specific `memory-keys` file format of each Stack.

The checker MUST be a standalone script that can run locally and in CI without interactive input.

---

## Required behaviour

1. **Single-Stack mode (one Stack active):** Verify that every constant in the Stack's `memory-keys` file has a constant name that equals its string value exactly. Report any mismatch as a `NAME_VALUE_MISMATCH` error.

2. **Multi-Stack mode (two or more Stacks active):** In addition to the name=value check, verify that the set of constant names in every Stack's `memory-keys` file is identical to the canonical baseline (usually the first Stack). Report any additional or missing keys as a `SET_MISMATCH` error.

3. **Exit behaviour:**
   - Exit `0` if all checks pass.
   - Exit `1` if any `NAME_VALUE_MISMATCH` or `SET_MISMATCH` error is found.
   - Print a summary to stdout regardless of result.

---

## PowerShell template

```powershell
# check-memory-key-parity.ps1
# Usage: .\check-memory-key-parity.ps1
# Exit 0 = all keys pass parity; Exit 1 = one or more failures

param()

$ErrorActionPreference = 'Stop'

# ── Configuration ────────────────────────────────────────────────────────────
# Add each Stack's memory-keys file path here.
$Stacks = @(
    @{ Name = 'DEMOAPP001'; Path = 'demo-apps/demoapp001-typescript-cypress/tests/screenplay/support/memory-keys.ts' }
    # @{ Name = 'DEMOAPP002'; Path = 'demo-apps/demoapp002-python-pytest/tests/screenplay/support/memory_keys.py' }
)

# ── Helpers ──────────────────────────────────────────────────────────────────

function Get-MemoryKeys {
    param([string]$FilePath)
    # Matches:  export const KEY_NAME = 'KEY_NAME';   (TypeScript)
    # Adapt the regex for other languages (Python: KEY = 'KEY', C#: public const string KEY = "KEY";)
    $pattern = "(?m)^\s*export\s+const\s+(\w+)\s*=\s*'(\w+)'"
    $content = Get-Content $FilePath -Raw
    $matches  = [regex]::Matches($content, $pattern)
    $keys = [ordered]@{}
    foreach ($m in $matches) {
        $keys[$m.Groups[1].Value] = $m.Groups[2].Value
    }
    return $keys
}

# ── Main ─────────────────────────────────────────────────────────────────────

$overallPass = $true
$baseline    = $null
$baselineName = $null

foreach ($stack in $Stacks) {
    Write-Host ""
    Write-Host "Checking $($stack.Name): $($stack.Path)"

    if (-not (Test-Path $stack.Path)) {
        Write-Host "  ERROR: file not found — $($stack.Path)"
        $overallPass = $false
        continue
    }

    $keys = Get-MemoryKeys -FilePath $stack.Path

    # Name = Value check
    foreach ($name in $keys.Keys) {
        if ($name -ne $keys[$name]) {
            Write-Host "  NAME_VALUE_MISMATCH: $name = '$($keys[$name])' (expected '$name')"
            $overallPass = $false
        } else {
            Write-Host "  OK: $name = '$($keys[$name])'"
        }
    }

    # Set parity check (multi-Stack)
    if ($null -eq $baseline) {
        $baseline     = $keys
        $baselineName = $stack.Name
    } else {
        $baselineSet = $baseline.Keys | Sort-Object
        $currentSet  = $keys.Keys     | Sort-Object
        $missing  = $baselineSet | Where-Object { $_ -notin $currentSet }
        $extra    = $currentSet  | Where-Object { $_ -notin $baselineSet }

        foreach ($k in $missing) {
            Write-Host "  SET_MISMATCH: '$k' is in $baselineName but missing from $($stack.Name)"
            $overallPass = $false
        }
        foreach ($k in $extra) {
            Write-Host "  SET_MISMATCH: '$k' is in $($stack.Name) but not in $baselineName"
            $overallPass = $false
        }
    }
}

Write-Host ""
if ($overallPass) {
    Write-Host "Memory key parity: PASS"
    exit 0
} else {
    Write-Host "Memory key parity: FAIL — one or more mismatches found (see above)"
    exit 1
}
```

---

## Adapting for other languages

| Language | Pattern to match | Example |
|---------|-----------------|---------|
| TypeScript | `export const KEY = 'KEY'` | `export const SOLVE_RESULT = 'SOLVE_RESULT'` |
| Python | `KEY = 'KEY'` | `SOLVE_RESULT = 'SOLVE_RESULT'` |
| C# | `public const string KEY = "KEY"` | `public const string SOLVE_RESULT = "SOLVE_RESULT"` |
| Java | `public static final String KEY = "KEY"` | `public static final String SOLVE_RESULT = "SOLVE_RESULT"` |

Adjust the `Get-MemoryKeys` regex in the template to match the syntax of each language's `memory-keys` file.

---

## Integration into CI

Add the checker as a step after the test suite gate (per RA Section 9.4):

```yaml
# Example: GitHub Actions step
- name: Memory key parity check
  run: pwsh -File .batch/check-memory-key-parity.ps1
```

The step MUST fail the pipeline on exit code 1. No additional configuration is required.
