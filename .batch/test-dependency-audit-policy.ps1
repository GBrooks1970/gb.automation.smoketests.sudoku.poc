$ErrorActionPreference = 'Stop'

$evaluator = Join-Path $PSScriptRoot 'evaluate-dependency-audit.ps1'
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) "sudoku-dependency-audit-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
$asOfDate = [datetime]'2026-07-28T12:00:00Z'
$checkCount = 0

function Write-JsonFixture {
    param([string]$Path, [object]$Value)
    New-Item -ItemType Directory -Path (Split-Path -Parent $Path) -Force | Out-Null
    [IO.File]::WriteAllText($Path, ($Value | ConvertTo-Json -Depth 12) + [Environment]::NewLine)
}

function New-Policy {
    param([object[]]$Exceptions = @())
    return [ordered]@{
        schemaVersion = 1
        blockAtOrAbove = 'high'
        maximumExceptionDays = 14
        exceptions = $Exceptions
    }
}

function Invoke-Control {
    param(
        [string]$Name,
        [string]$Stack,
        [string]$Tool,
        [object]$Report,
        [int]$NativeExitCode,
        [object]$Policy,
        [int]$ExpectedExitCode,
        [string]$ExpectedStatus
    )

    $caseRoot = Join-Path $fixtureRoot $Name
    $reportPath = Join-Path $caseRoot 'native.json'
    $policyPath = Join-Path $caseRoot 'policy.json'
    $evidenceRoot = Join-Path $caseRoot 'evidence'
    Write-JsonFixture -Path $reportPath -Value $Report
    Write-JsonFixture -Path $policyPath -Value $Policy

    $output = & $evaluator -Stack $Stack -Tool $Tool -NativeReport $reportPath `
        -NativeExitCode $NativeExitCode -EvidenceRoot $evidenceRoot -PolicyPath $policyPath `
        -AsOfDate $asOfDate *>&1
    $actualExitCode = $LASTEXITCODE
    if ($actualExitCode -ne $ExpectedExitCode) {
        $output | Write-Host
        throw "$Name expected exit $ExpectedExitCode, received $actualExitCode"
    }

    $summary = Get-Content -LiteralPath (Join-Path $evidenceRoot 'audit/dependency-audit-summary.json') -Raw | ConvertFrom-Json
    if ($summary.status -ne $ExpectedStatus) {
        throw "$Name expected status $ExpectedStatus, received $($summary.status)"
    }
    $script:checkCount += 1
    Write-Host "  OK    $Name -> $ExpectedStatus"
}

$npmClean = @{ auditReportVersion = 2; vulnerabilities = @{} }
$npmHigh = @{
    auditReportVersion = 2
    vulnerabilities = @{
        'brace-expansion' = @{
            via = @(@{
                source = 1124334
                url = 'https://github.com/advisories/GHSA-mh99-v99m-4gvg'
                severity = 'high'
            })
        }
    }
}
$pipClean = @{ dependencies = @(@{ name = 'pytest'; version = '9.1.1'; vulns = @() }); fixes = @() }
$pipUnknown = @{
    dependencies = @(@{ name = 'fixture-package'; version = '1.0.0'; vulns = @(@{ id = 'PYSEC-2099-1'; fix_versions = @('1.0.1') }) })
    fixes = @()
}
$nugetClean = @{ version = 1; projects = @(@{ path = '/src/app.csproj' }) }
$nugetHigh = @{
    version = 1
    projects = @(@{
        path = '/src/app.csproj'
        frameworks = @(@{
            framework = 'net10.0'
            topLevelPackages = @(@{
                id = 'Fixture.Package'
                resolvedVersion = '1.0.0'
                vulnerabilities = @(@{ severity = 'High'; advisoryurl = 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc' })
            })
        })
    })
}
$activeVulnerabilityException = @{
    kind = 'vulnerability'; stack = 'demoapp001'; id = 'GHSA-mh99-v99m-4gvg'; package = 'brace-expansion'
    owner = 'project-owner'; reason = 'Fixture verifies exact matching'; approvedBy = 'pull-request-review'
    introducedOn = '2026-07-28'; expiresOn = '2026-08-03'
}
$activeOutageException = @{
    kind = 'outage'; stack = 'demoapp001'; tool = 'npm-audit'
    owner = 'project-owner'; reason = 'Fixture verifies bounded registry outage'; approvedBy = 'pull-request-review'
    introducedOn = '2026-07-28'; expiresOn = '2026-07-29'
}

try {
    Invoke-Control 'npm-clean' demoapp001 npm-audit $npmClean 0 (New-Policy) 0 pass
    Invoke-Control 'pip-clean' demoapp002 pip-audit $pipClean 0 (New-Policy) 0 pass
    Invoke-Control 'nuget-clean' demoapp003 nuget-audit $nugetClean 0 (New-Policy) 0 pass
    Invoke-Control 'npm-unexcepted-high' demoapp001 npm-audit $npmHigh 1 (New-Policy) 1 fail
    Invoke-Control 'npm-active-exception' demoapp001 npm-audit $npmHigh 1 (New-Policy @($activeVulnerabilityException)) 0 excepted
    Invoke-Control 'pip-unknown-fails-closed' demoapp002 pip-audit $pipUnknown 1 (New-Policy) 1 fail
    Invoke-Control 'nuget-unexcepted-high' demoapp003 nuget-audit $nugetHigh 0 (New-Policy) 1 fail

    $expired = $activeVulnerabilityException.Clone()
    $expired.introducedOn = '2026-07-01'
    $expired.expiresOn = '2026-07-10'
    Invoke-Control 'expired-exception' demoapp001 npm-audit $npmHigh 1 (New-Policy @($expired)) 1 fail

    $overlong = $activeVulnerabilityException.Clone()
    $overlong.expiresOn = '2026-08-31'
    Invoke-Control 'overlong-exception' demoapp001 npm-audit $npmHigh 1 (New-Policy @($overlong)) 1 fail

    Invoke-Control 'unexcepted-outage' demoapp001 npm-audit @{ error = 'registry unavailable' } 1 (New-Policy) 1 fail
    Invoke-Control 'bounded-outage-exception' demoapp001 npm-audit @{ error = 'registry unavailable' } 1 (New-Policy @($activeOutageException)) 0 excepted

    Invoke-Control 'stale-active-exception' demoapp001 npm-audit $npmClean 0 (New-Policy @($activeVulnerabilityException)) 1 fail

    $missingOwner = $activeVulnerabilityException.Clone()
    $missingOwner.owner = ''
    Invoke-Control 'missing-owner' demoapp001 npm-audit $npmHigh 1 (New-Policy @($missingOwner)) 1 fail
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Host "Dependency audit policy controls: PASS ($checkCount/$checkCount)"
exit 0
