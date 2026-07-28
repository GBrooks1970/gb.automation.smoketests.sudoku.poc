# check-ra-header-currency.ps1
#
# Guards stable governance and live-documentation facts. Repository content is the source for
# architecture/decision ranges, manifests are the source for supported runtimes/dependencies, the
# canonical feature is the source for scenario/step counts, and the review directories are the
# source for review-index membership.
#
# Exit 0 = PASS (governance and live-documentation claims are current)
# Exit 1 = FAIL (a claim is missing, unreadable, or stale)

param(
    [string]$RepositoryRoot = (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path
)

$ErrorActionPreference = 'Stop'
$RepositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$script:OverallPass = $true

function Get-RepositoryPath {
    param([string]$RelativePath)
    return Join-Path $RepositoryRoot ($RelativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
}

function Test-RequiredClaim {
    param(
        [string]$Name,
        [string]$RelativePath,
        [string]$Pattern,
        [string]$Expected
    )

    $path = Get-RepositoryPath $RelativePath
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "  FAIL  $Name - file not found: $RelativePath"
        $script:OverallPass = $false
        return
    }

    $content = Get-Content -LiteralPath $path -Raw -Encoding UTF8
    if ([regex]::IsMatch($content, $Pattern)) {
        Write-Host "  OK    $Name"
    } else {
        Write-Host "  FAIL  $Name - expected $Expected in $RelativePath"
        $script:OverallPass = $false
    }
}

function Get-GherkinExecutionCounts {
    param([string]$Path)

    $scenarioCount = 0
    $stepCount = 0
    $backgroundSteps = 0
    $currentKind = $null
    $currentSteps = 0
    $exampleRows = 0
    $seenExampleHeader = $false
    $lines = Get-Content -LiteralPath $Path -Encoding UTF8

    foreach ($line in @($lines) + @('  Scenario: __CURRENCY_SENTINEL__')) {
        if ($line -match '^\s*Scenario(?: Outline)?:\s*(.+)$') {
            if ($null -ne $currentKind) {
                $executions = if ($currentKind -eq 'outline') { $exampleRows } else { 1 }
                $scenarioCount += $executions
                $stepCount += $currentSteps * $executions
            }

            if ($Matches[1] -eq '__CURRENCY_SENTINEL__') {
                break
            }

            $currentKind = if ($line -match '^\s*Scenario Outline:') { 'outline' } else { 'scenario' }
            $currentSteps = 0
            $exampleRows = 0
            $seenExampleHeader = $false
            continue
        }

        if ($line -match '^\s*(Given|When|Then|And|But|\*)\s+') {
            if ($null -eq $currentKind) {
                $backgroundSteps += 1
            } else {
                $currentSteps += 1
            }
            continue
        }

        if ($null -eq $currentKind) {
            continue
        }

        if ($line -match '^\s*Examples:') {
            $seenExampleHeader = $false
            continue
        }

        if ($line -match '^\s*\|') {
            if ($seenExampleHeader) {
                $exampleRows += 1
            } else {
                $seenExampleHeader = $true
            }
        }
    }

    $stepCount += $backgroundSteps * $scenarioCount
    return [pscustomobject]@{ Scenarios = $scenarioCount; Steps = $stepCount }
}

Write-Host ""
Write-Host "=== RA Header and Documentation Currency Guard ==="

$raPath = Get-RepositoryPath 'DOCS/reference-architecture.md'
$decisionRegisterPath = Get-RepositoryPath 'decision-register.md'
$claudePath = Get-RepositoryPath 'CLAUDE.md'
$raTargets = @(
    @{ Name = 'decision-register.md'; Path = $decisionRegisterPath }
    @{ Name = 'DOCS/.planning/backlog.md'; Path = Get-RepositoryPath 'DOCS/.planning/backlog.md' }
    @{ Name = 'CLAUDE.md'; Path = $claudePath }
)

if (-not (Test-Path -LiteralPath $raPath)) {
    Write-Host "  FAIL  reference architecture file not found: $raPath"
    exit 1
}

$raContent = Get-Content -LiteralPath $raPath -Raw -Encoding UTF8
$raMatch = [regex]::Match($raContent, '(?m)^\*\*Version:\*\*\s*([\d.]+)\s*$')
if (-not $raMatch.Success) {
    Write-Host "  FAIL  could not find a '**Version:** <n>' header in $raPath"
    exit 1
}

$activeVersion = $raMatch.Groups[1].Value
Write-Host "Active RA version: v$activeVersion"

foreach ($target in $raTargets) {
    if (-not (Test-Path -LiteralPath $target.Path)) {
        Write-Host "  FAIL  $($target.Name) - file not found"
        $script:OverallPass = $false
        continue
    }

    $content = Get-Content -LiteralPath $target.Path -Raw -Encoding UTF8
    $headerMatch = [regex]::Match($content, '(?m)Governed by.{0,5}`(?:DOCS/)?reference-architecture\.md`\s*v([\d.]+)')
    if ($headerMatch.Success -and $headerMatch.Groups[1].Value -eq $activeVersion) {
        Write-Host "  OK    $($target.Name) cites v$activeVersion"
    } else {
        Write-Host "  FAIL  $($target.Name) does not cite active v$activeVersion"
        $script:OverallPass = $false
    }
}

$decisionRegisterContent = Get-Content -LiteralPath $decisionRegisterPath -Raw -Encoding UTF8
$nextIdMatch = [regex]::Match($decisionRegisterContent, '(?m)Next ID:\s*DR-(\d{3})')
if (-not $nextIdMatch.Success) {
    Write-Host "  FAIL  decision-register.md has no 'Next ID: DR-NNN' footer"
    $script:OverallPass = $false
} else {
    $latestAcceptedId = ([int]$nextIdMatch.Groups[1].Value - 1).ToString('000')
    $claudeContent = Get-Content -LiteralPath $claudePath -Raw -Encoding UTF8
    $rangeMatches = [regex]::Matches($claudeContent, 'DR-(\d{3})\s+through\s+DR-(\d{3})')
    if ($rangeMatches.Count -eq 1 -and $rangeMatches[0].Groups[1].Value -eq '001' -and
        $rangeMatches[0].Groups[2].Value -eq $latestAcceptedId) {
        Write-Host "  OK    accepted range DR-001 through DR-$latestAcceptedId"
    } else {
        Write-Host "  FAIL  CLAUDE.md accepted range must be exactly DR-001 through DR-$latestAcceptedId"
        $script:OverallPass = $false
    }
}

$featurePath = Get-RepositoryPath 'features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature'
$counts = Get-GherkinExecutionCounts $featurePath
$allStackScenarios = 3 * $counts.Scenarios
Write-Host "Canonical feature execution: $($counts.Scenarios) scenarios / $($counts.Steps) steps per Stack"

$packageJsonPath = Get-RepositoryPath 'demo-apps/demoapp001-typescript-cypress/package.json'
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$nodeMajor = [regex]::Match($packageJson.engines.node, '>=\s*(\d+)').Groups[1].Value
$workflowContent = Get-Content -LiteralPath (Get-RepositoryPath '.github/workflows/ci.yml') -Raw -Encoding UTF8
$pythonVersion = [regex]::Match($workflowContent, 'python-version:\s*["'']?([\d.]+)').Groups[1].Value
[xml]$csharpProject = Get-Content -LiteralPath (Get-RepositoryPath 'demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj') -Raw -Encoding UTF8
$dotnetMajor = [regex]::Match([string]$csharpProject.Project.PropertyGroup.TargetFramework, 'net(\d+)\.0').Groups[1].Value

$claims = @(
    @{ Name = 'public repository status'; File = 'README.md'; Pattern = '(?m)^This repository is public\.'; Expected = "'This repository is public.'" }
    @{ Name = 'root capability scenario count'; File = 'README.md'; Pattern = [regex]::Escape("BDD/Screenplay parity ($($counts.Scenarios) scenarios)"); Expected = "$($counts.Scenarios) scenarios" }
    @{ Name = 'root three-Stack scenario total'; File = 'README.md'; Pattern = [regex]::Escape("$($counts.Scenarios) scenarios per Stack ($allStackScenarios across all three; DEMOAPP001 = $($counts.Scenarios) scenarios / $($counts.Steps) steps)"); Expected = 'canonical derived totals' }
    @{ Name = 'root Node runtime'; File = 'README.md'; Pattern = "Node $nodeMajor"; Expected = "Node $nodeMajor" }
    @{ Name = 'root Python runtime'; File = 'README.md'; Pattern = [regex]::Escape("Python $pythonVersion"); Expected = "Python $pythonVersion" }
    @{ Name = 'root .NET runtime'; File = 'README.md'; Pattern = [regex]::Escape(".NET $dotnetMajor"); Expected = ".NET $dotnetMajor" }
    @{ Name = 'TypeScript scenario/step count'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Pattern = [regex]::Escape("**Total Scenarios:** $($counts.Scenarios) scenarios / $($counts.Steps) steps"); Expected = 'canonical derived totals' }
    @{ Name = 'TypeScript QA scenario count'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Pattern = [regex]::Escape("| Scenarios | $($counts.Scenarios) | $($counts.Scenarios) |"); Expected = 'canonical derived scenario count' }
    @{ Name = 'TypeScript QA step count'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Pattern = [regex]::Escape("| Steps | $($counts.Steps) | — |"); Expected = 'canonical derived step count' }
    @{ Name = 'Python supported runtime'; File = 'demo-apps/demoapp002-python-pytest/README.md'; Pattern = [regex]::Escape("Python $pythonVersion"); Expected = "Python $pythonVersion" }
    @{ Name = 'Python BDD count'; File = 'demo-apps/demoapp002-python-pytest/README.md'; Pattern = [regex]::Escape("$($counts.Scenarios) canonical BDD scenarios"); Expected = 'canonical derived scenario count' }
    @{ Name = 'C# supported runtime'; File = 'demo-apps/demoapp003-csharp-specflow/README.md'; Pattern = [regex]::Escape(".NET SDK $dotnetMajor.0"); Expected = ".NET SDK $dotnetMajor.0" }
    @{ Name = 'C# Reqnroll count'; File = 'demo-apps/demoapp003-csharp-specflow/README.md'; Pattern = [regex]::Escape("$($counts.Scenarios) Reqnroll tests"); Expected = 'canonical derived scenario count' }
    @{ Name = 'assistant guide TypeScript baseline'; File = 'CLAUDE.md'; Pattern = [regex]::Escape("DEMOAPP001: $($counts.Scenarios) scenarios passed / $($counts.Steps) steps passed"); Expected = 'canonical derived totals' }
    @{ Name = 'assistant guide Python baseline'; File = 'CLAUDE.md'; Pattern = [regex]::Escape("DEMOAPP002: $($counts.Scenarios) pytest-bdd scenarios passed"); Expected = 'canonical derived scenario count' }
    @{ Name = 'assistant guide C# baseline'; File = 'CLAUDE.md'; Pattern = [regex]::Escape("DEMOAPP003: $($counts.Scenarios) Reqnroll tests passed"); Expected = 'canonical derived scenario count' }
    @{ Name = 'historical REST design marker'; File = 'DOCS/.design/rest-api-wrapper.md'; Pattern = '(?m)^\*\*Status:\*\* Historical design proposal'; Expected = 'historical design status' }
    @{ Name = 'implemented OpenAPI authority pointer'; File = 'DOCS/.design/rest-api-wrapper.md'; Pattern = [regex]::Escape('demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml'); Expected = 'implemented OpenAPI path' }
    @{ Name = 'DOCS index historical REST status'; File = 'DOCS/README.md'; Pattern = 'Historical proposal; implemented authority is OpenAPI'; Expected = 'historical REST/OpenAPI authority status' }
    @{ Name = 'current BACKLOG-021 resolution'; File = 'DOCS/.planning/backlog.md'; Pattern = [regex]::Escape("migrated to .NET $dotnetMajor, Reqnroll"); Expected = 'current .NET/Reqnroll migration note' }
)

Write-Host ""
Write-Host 'Stable live-documentation claims'
foreach ($claim in $claims) {
    Test-RequiredClaim $claim.Name $claim.File $claim.Pattern $claim.Expected
}

$typescriptReadme = Get-Content -LiteralPath (Get-RepositoryPath 'demo-apps/demoapp001-typescript-cypress/README.md') -Raw -Encoding UTF8
$npmDependencies = @('@cucumber/cucumber', '@serenity-js/core', 'express', '@redocly/cli', 'openapi-backend', 'typescript', 'ts-node')
foreach ($dependency in $npmDependencies) {
    $version = $packageJson.dependencies.PSObject.Properties[$dependency].Value
    if ($null -eq $version) {
        $version = $packageJson.devDependencies.PSObject.Properties[$dependency].Value
    }
    $expectedRow = '| ' + [char]96 + $dependency + [char]96 + ' | ' + [char]96 + $version + [char]96 + ' |'
    if ($null -ne $version -and $typescriptReadme.Contains($expectedRow)) {
        Write-Host "  OK    TypeScript manifest claim $dependency $version"
    } else {
        Write-Host "  FAIL  TypeScript README does not match package.json for $dependency"
        $script:OverallPass = $false
    }
}

$csharpReadme = Get-Content -LiteralPath (Get-RepositoryPath 'demo-apps/demoapp003-csharp-specflow/README.md') -Raw -Encoding UTF8
$csharpDependencies = @('Reqnroll.NUnit', 'NUnit', 'coverlet.collector')
foreach ($dependency in $csharpDependencies) {
    $reference = @($csharpProject.Project.ItemGroup.PackageReference) | Where-Object { $_.Include -eq $dependency } | Select-Object -First 1
    $expectedRow = '| ' + [char]96 + $dependency + [char]96 + ' | ' + [char]96 + $reference.Version + [char]96 + ' |'
    if ($null -ne $reference -and $csharpReadme.Contains($expectedRow)) {
        Write-Host "  OK    C# manifest claim $dependency $($reference.Version)"
    } else {
        Write-Host "  FAIL  C# README does not match its project manifest for $dependency"
        $script:OverallPass = $false
    }
}

Write-Host ""
Write-Host 'Review inventory'
$reviewRoot = Get-RepositoryPath 'DOCS/.review'
$reviewIndexes = @('DOCS/.review/README.md', 'DOCS/README.md')
$reviewDirectories = Get-ChildItem -LiteralPath $reviewRoot -Directory | Where-Object { $_.Name -like 'CODE_REVIEW_*' } | Sort-Object Name
foreach ($relativeIndex in $reviewIndexes) {
    $indexContent = Get-Content -LiteralPath (Get-RepositoryPath $relativeIndex) -Raw -Encoding UTF8
    foreach ($directory in $reviewDirectories) {
        if ($indexContent.Contains($directory.Name)) {
            Write-Host "  OK    $relativeIndex lists $($directory.Name)"
        } else {
            Write-Host "  FAIL  $relativeIndex omits $($directory.Name)"
            $script:OverallPass = $false
        }
    }
}

Write-Host ""
Write-Host "================================================="
if ($script:OverallPass) {
    Write-Host "RA/documentation currency: PASS"
    exit 0
}

Write-Host "RA/documentation currency: FAIL"
exit 1
