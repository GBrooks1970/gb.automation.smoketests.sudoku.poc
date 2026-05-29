# run-parity-checks.ps1
#
# Runs all repository parity gates in the same order as CI/local Compose.

param()

$ErrorActionPreference = 'Stop'

$checks = @(
  ".\.batch\check-memory-key-parity.ps1",
  ".\.batch\generate-feature-parity-report.ps1",
  ".\.batch\check-step-text-parity.ps1"
)

foreach ($check in $checks) {
  Write-Host ""
  Write-Host "=== $check ==="
  & $check
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

Write-Host ""
Write-Host "Parity checks: PASS"
exit 0
