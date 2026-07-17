# check-ra-header-currency.ps1
#
# Guards against Reference Architecture (RA) governance-header drift.
# `decision-register.md` and `DOCS/.planning/backlog.md` each declare, in their own header, which
# RA version they are governed by ("Governed by: `reference-architecture.md` v<version>"). That
# declaration has fallen out of date with the active RA version three times (BACKLOG-028, SUD-11,
# review CLAUDE_Fable_5 v1 Risk 6) because nothing asserted the two stayed in sync with
# `DOCS/reference-architecture.md`'s own `**Version:**` header. This script is that assertion.
#
# Exit 0 = PASS (both governed-by headers cite the active RA version)
# Exit 1 = FAIL (a header is missing, unreadable, or cites a stale/non-active RA version)

param()

$ErrorActionPreference = 'Stop'

$RaPath = "$PSScriptRoot\..\DOCS\reference-architecture.md"
$Targets = @(
    @{ Name = 'decision-register.md';       Path = "$PSScriptRoot\..\decision-register.md" }
    @{ Name = 'DOCS/.planning/backlog.md';  Path = "$PSScriptRoot\..\DOCS\.planning\backlog.md" }
)

Write-Host ""
Write-Host "=== RA Header Currency Guard ==="

if (-not (Test-Path $RaPath)) {
    Write-Host "  ERROR: reference architecture file not found at $RaPath"
    exit 1
}

$raContent = Get-Content $RaPath -Raw -Encoding UTF8
$raMatch = [regex]::Match($raContent, '(?m)^\*\*Version:\*\*\s*([\d.]+)\s*$')
if (-not $raMatch.Success) {
    Write-Host "  ERROR: could not find a '**Version:** <n>' header in $RaPath"
    exit 1
}
$activeVersion = $raMatch.Groups[1].Value
Write-Host "Active RA version (from DOCS/reference-architecture.md): v$activeVersion"

$overallPass = $true

foreach ($target in $Targets) {
    Write-Host ""
    Write-Host "File: $($target.Name)"

    if (-not (Test-Path $target.Path)) {
        Write-Host "  FAIL  file not found: $($target.Path)"
        $overallPass = $false
        continue
    }

    $content = Get-Content $target.Path -Raw -Encoding UTF8
    $headerMatch = [regex]::Match($content, '(?m)Governed by.{0,5}`reference-architecture\.md`\s*v([\d.]+)')

    if (-not $headerMatch.Success) {
        Write-Host "  FAIL  no 'Governed by: `reference-architecture.md` v<version>' header found"
        $overallPass = $false
        continue
    }

    $citedVersion = $headerMatch.Groups[1].Value
    if ($citedVersion -eq $activeVersion) {
        Write-Host "  OK    cites v$citedVersion (matches active v$activeVersion)"
    } else {
        Write-Host "  FAIL  cites v$citedVersion but the active RA version is v$activeVersion"
        $overallPass = $false
    }
}

Write-Host ""
Write-Host "================================================="
if ($overallPass) {
    Write-Host "RA header currency: PASS"
    exit 0
} else {
    Write-Host "RA header currency: FAIL"
    exit 1
}
