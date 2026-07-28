param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('demoapp001', 'demoapp002', 'demoapp003')]
    [string]$Stack,

    [string]$EvidenceRoot = (Join-Path (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path ".results/$Stack"),

    [switch]$ListRequired
)

$ErrorActionPreference = 'Stop'

$contracts = @{
    demoapp001 = @(
        @{ Path = 'test-results/cucumber.json'; Kind = 'json' }
        @{ Path = 'test-results/cucumber-junit.xml'; Kind = 'xml'; Root = 'testsuite' }
        @{ Path = 'coverage/lcov.info'; Kind = 'lcov' }
        @{ Path = 'coverage/component-coverage.txt'; Kind = 'text' }
    )
    demoapp002 = @(
        @{ Path = 'test-results/pytest-junit.xml'; Kind = 'xml'; Root = 'testsuites' }
        @{ Path = 'coverage/coverage.xml'; Kind = 'xml'; Root = 'coverage' }
        @{ Path = 'coverage/component-coverage.txt'; Kind = 'text' }
    )
    demoapp003 = @(
        @{ Path = 'test-results/component.trx'; Kind = 'xml'; Root = 'TestRun' }
        @{ Path = 'test-results/reqnroll.trx'; Kind = 'xml'; Root = 'TestRun' }
        @{ Path = 'coverage/coverage.cobertura.xml'; Kind = 'xml'; Root = 'coverage' }
        @{ Path = 'coverage/component-coverage.txt'; Kind = 'text' }
    )
}

$contract = $contracts[$Stack]
if ($ListRequired) {
    $contract.Path
    exit 0
}

$overallPass = $true
Write-Host "=== CI evidence contract: $Stack ==="

foreach ($entry in $contract) {
    $path = Join-Path $EvidenceRoot ($entry.Path -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-Host "  FAIL  missing $($entry.Path)"
        $overallPass = $false
        continue
    }

    $file = Get-Item -LiteralPath $path
    if ($file.Length -eq 0) {
        Write-Host "  FAIL  empty $($entry.Path)"
        $overallPass = $false
        continue
    }

    try {
        $content = Get-Content -LiteralPath $path -Raw -Encoding UTF8
        switch ($entry.Kind) {
            'json' {
                $document = $content | ConvertFrom-Json
                if (@($document).Count -eq 0) {
                    throw 'JSON document has no records'
                }
            }
            'xml' {
                [xml]$document = $content
                if ($null -eq $document.DocumentElement) {
                    throw 'XML document has no root element'
                }
                if ($entry.Root -and $document.DocumentElement.LocalName -ne $entry.Root) {
                    throw "expected root '$($entry.Root)', found '$($document.DocumentElement.LocalName)'"
                }
            }
            'lcov' {
                if ($content -notmatch '(?m)^SF:.+$' -or $content -notmatch '(?m)^DA:\d+,\d+') {
                    throw 'LCOV document has no source or line records'
                }
            }
            'text' {
                if ([string]::IsNullOrWhiteSpace($content)) {
                    throw 'text evidence is blank'
                }
            }
        }
        Write-Host "  OK    $($entry.Path)"
    } catch {
        Write-Host "  FAIL  invalid $($entry.Path): $($_.Exception.Message)"
        $overallPass = $false
    }
}

if ($overallPass) {
    Write-Host "CI evidence contract: PASS ($($contract.Count)/$($contract.Count) files)"
    exit 0
}

Write-Host 'CI evidence contract: FAIL'
exit 1
