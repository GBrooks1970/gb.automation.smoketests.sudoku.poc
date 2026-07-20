# check-ra-header-currency.ps1
#
# Guards against Reference Architecture (RA) governance-header drift.
# `decision-register.md`, `DOCS/.planning/backlog.md`, and `CLAUDE.md` declare which RA version
# governs them. This script keeps those declarations aligned with `DOCS/reference-architecture.md`
# and ensures CLAUDE.md's accepted decision range matches the decision register's Next ID footer.
#
# Exit 0 = PASS (RA citations and the accepted decision range are current)
# Exit 1 = FAIL (a citation/range is missing, unreadable, or stale)

param()

$ErrorActionPreference = 'Stop'

$RaPath = "$PSScriptRoot\..\DOCS\reference-architecture.md"
$DecisionRegisterPath = "$PSScriptRoot\..\decision-register.md"
$ClaudePath = "$PSScriptRoot\..\CLAUDE.md"
$Targets = @(
    @{ Name = 'decision-register.md';       Path = $DecisionRegisterPath }
    @{ Name = 'DOCS/.planning/backlog.md';  Path = "$PSScriptRoot\..\DOCS\.planning\backlog.md" }
    @{ Name = 'CLAUDE.md';                  Path = $ClaudePath }
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
    $headerMatch = [regex]::Match($content, '(?m)Governed by.{0,5}`(?:DOCS/)?reference-architecture\.md`\s*v([\d.]+)')

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
Write-Host "Accepted decision range"

$decisionRegisterContent = Get-Content $DecisionRegisterPath -Raw -Encoding UTF8
$nextIdMatch = [regex]::Match($decisionRegisterContent, '(?m)Next ID:\s*DR-(\d{3})')
if (-not $nextIdMatch.Success) {
    Write-Host "  FAIL  decision-register.md has no 'Next ID: DR-NNN' footer"
    $overallPass = $false
} elseif (-not (Test-Path $ClaudePath)) {
    Write-Host "  FAIL  CLAUDE.md not found at $ClaudePath"
    $overallPass = $false
} else {
    $latestAcceptedId = ([int]$nextIdMatch.Groups[1].Value - 1).ToString('000')
    $claudeContent = Get-Content $ClaudePath -Raw -Encoding UTF8
    $rangeMatches = [regex]::Matches($claudeContent, 'DR-(\d{3})\s+through\s+DR-(\d{3})')

    if ($rangeMatches.Count -eq 0) {
        Write-Host "  FAIL  CLAUDE.md has no 'DR-001 through DR-NNN' accepted-range statement"
        $overallPass = $false
    } else {
        foreach ($rangeMatch in $rangeMatches) {
            $firstId = $rangeMatch.Groups[1].Value
            $lastId = $rangeMatch.Groups[2].Value
            if ($firstId -eq '001' -and $lastId -eq $latestAcceptedId) {
                Write-Host "  OK    DR-$firstId through DR-$lastId matches decision-register.md"
            } else {
                Write-Host "  FAIL  DR-$firstId through DR-$lastId is stale; expected DR-001 through DR-$latestAcceptedId"
                $overallPass = $false
            }
        }
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
