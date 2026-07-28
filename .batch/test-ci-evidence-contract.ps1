$ErrorActionPreference = 'Stop'

$checker = Join-Path $PSScriptRoot 'check-ci-evidence.ps1'
$fixtures = @{
    'cucumber.json' = '[{"name":"fixture"}]'
    'cucumber-junit.xml' = '<testsuite name="fixture" tests="1" />'
    'pytest-junit.xml' = '<testsuites><testsuite name="fixture" tests="1" /></testsuites>'
    'coverage.xml' = '<coverage line-rate="1" branch-rate="1" />'
    'component.trx' = '<TestRun name="component" />'
    'reqnroll.trx' = '<TestRun name="reqnroll" />'
    'coverage.cobertura.xml' = '<coverage line-rate="1" branch-rate="1" />'
    'lcov.info' = "TN:`nSF:app_src/fixture.ts`nDA:1,1`nend_of_record`n"
    'component-coverage.txt' = 'fixture coverage summary'
    'dependency-audit-native.txt' = '{"fixture":"native audit output"}'
}

$mutationCount = 0
foreach ($stack in @('demoapp001', 'demoapp002', 'demoapp003')) {
    $root = Join-Path ([IO.Path]::GetTempPath()) "sudoku-ci-evidence-$stack-$([guid]::NewGuid())"
    try {
        $required = @(& $checker -Stack $stack -ListRequired)
        foreach ($relativePath in $required) {
            $path = Join-Path $root ($relativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
            New-Item -ItemType Directory -Path (Split-Path -Parent $path) -Force | Out-Null
            if ([IO.Path]::GetFileName($path) -eq 'dependency-audit-summary.json') {
                $auditSummary = [ordered]@{
                    schemaVersion = 1
                    generatedAt = '2026-07-28T12:00:00Z'
                    stack = $stack
                    tool = "fixture-$stack"
                    status = 'pass'
                    toolStatus = 'success'
                    threshold = 'high'
                    findingCount = 0
                    unexceptedFindingCount = 0
                } | ConvertTo-Json
                [IO.File]::WriteAllText($path, $auditSummary)
            } else {
                [IO.File]::WriteAllText($path, $fixtures[[IO.Path]::GetFileName($path)])
            }
        }

        $baselineOutput = & $checker -Stack $stack -EvidenceRoot $root *>&1
        if ($LASTEXITCODE -ne 0) {
            $baselineOutput | Write-Host
            throw "$stack baseline evidence fixture must pass"
        }

        foreach ($relativePath in $required) {
            $path = Join-Path $root ($relativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
            $content = Get-Content -LiteralPath $path -Raw -Encoding UTF8
            Remove-Item -LiteralPath $path -Force

            $mutationOutput = & $checker -Stack $stack -EvidenceRoot $root *>&1
            if ($LASTEXITCODE -eq 0) {
                $mutationOutput | Write-Host
                throw "$stack evidence contract accepted missing $relativePath"
            }

            [IO.File]::WriteAllText($path, $content)
            $mutationCount += 1
            Write-Host "  OK    $stack rejected missing $relativePath"
        }
    } finally {
        if (Test-Path -LiteralPath $root) {
            Remove-Item -LiteralPath $root -Recurse -Force
        }
    }
}

Write-Host "CI evidence negative controls: PASS ($mutationCount/$mutationCount missing files rejected)"
exit 0
