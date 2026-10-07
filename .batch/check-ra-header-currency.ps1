# check-ra-header-currency.ps1
#
# Guards stable governance and live-documentation facts. Repository content is the source for
# architecture/decision ranges, manifests are the source for supported runtimes/dependencies, the
# canonical feature is the source for scenario/step counts, and the review directories are the
# source for review-index membership.
# Native component/OpenAPI counts come from the dated execution inventory. Fingerprints only
# detect collection/source drift; they do not constitute another native execution. To refresh,
# rerun the four recorded commands, retain zero-failure/skip outputs and UTC timings, update the
# inventory's exact output hashes and LF-normalised source hashes, then reconcile active claims.
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

function Get-PortableSourceHash {
    param([string]$Path)
    $text = [IO.File]::ReadAllText($Path).Replace("`r`n", "`n").Replace("`r", "`n")
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($text)
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        return [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-', '').ToLowerInvariant()
    } finally {
        $sha.Dispose()
    }
}

function Test-ExecutionInventory {
    $inventoryPath = Get-RepositoryPath 'DOCS/.analysis/2026-10-07-component-execution-inventory.json'
    $byId = @{}
    try {
        $inventory = Get-Content -LiteralPath $inventoryPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($inventory.schemaVersion -ne 1 -or @($inventory.suites).Count -ne 4) {
            throw 'Expected schema version 1 and four native suite records'
        }
    } catch {
        Write-Host "  FAIL  execution inventory metadata - $($_.Exception.Message)"
        $script:OverallPass = $false
        return $byId
    }

    $ts = 'demo-apps/demoapp001-typescript-cypress'
    $py = 'demo-apps/demoapp002-python-pytest'
    $cs = 'demo-apps/demoapp003-csharp-specflow'
    $definitions = @(
        @{ Id = 'demoapp001-component'; Directory = "$ts/tests/component"; Pattern = '*.test.ts'; Recursive = $false; Configuration = @("$ts/package.json", "$ts/tsconfig.json"); Optional = @() }
        @{ Id = 'demoapp001-openapi'; Directory = "$ts/tests/api"; Pattern = 'openapi.contract.test.ts'; Recursive = $false; Configuration = @("$ts/package.json", "$ts/tsconfig.json", "$ts/redocly.yaml"); Optional = @() }
        @{ Id = 'demoapp002-component'; Directory = "$py/tests/component"; Pattern = '*.py'; Recursive = $true; Configuration = @("$py/pyproject.toml"); Optional = @("$py/conftest.py", "$py/tests/conftest.py", "$py/tests/component/conftest.py") }
        @{ Id = 'demoapp003-component'; Directory = "$cs/tests/component"; Pattern = '*.cs'; Recursive = $true; Configuration = @("$cs/tests/component/DemoApp003.ComponentTests.csproj"); Optional = @('Directory.Build.props', 'Directory.Build.targets', 'demo-apps/Directory.Build.props', 'demo-apps/Directory.Build.targets', "$cs/Directory.Build.props", "$cs/Directory.Build.targets", "$cs/tests/Directory.Build.props", "$cs/tests/Directory.Build.targets", "$cs/tests/component/Directory.Build.props", "$cs/tests/component/Directory.Build.targets") }
    )

    foreach ($definition in $definitions) {
        $name = "execution inventory $($definition.Id)"
        try {
            $suiteRecords = @($inventory.suites | Where-Object { $_.id -ceq $definition.Id })
            if ($suiteRecords.Count -ne 1) { throw 'Expected exactly one suite record' }
            $suite = $suiteRecords[0]
            $startedUtc = if ($suite.startedUtc -is [DateTime]) { $suite.startedUtc.ToUniversalTime().ToString('o') } else { [string]$suite.startedUtc }
            if ($suite.tests -le 0 -or $suite.passed -ne $suite.tests -or $suite.failed -ne 0 -or $suite.skipped -ne 0 -or
                $suite.sourceSha -notmatch '^[a-f0-9]{40}$' -or $startedUtc -notmatch '^\d{4}-\d{2}-\d{2}T.+Z$' -or
                $suite.commandDurationMs -le 0 -or $suite.runnerDurationMs -le 0 -or [string]::IsNullOrWhiteSpace($suite.runtime) -or
                [string]::IsNullOrWhiteSpace($suite.command.executable) -or @($suite.command.arguments).Count -eq 0) {
                throw 'Incomplete native provenance or a non-passing recorded suite'
            }
            $null = [DateTimeOffset]::Parse($startedUtc)
            if (@($suite.outputs).Count -eq 0) { throw 'No retained native output hashes' }
            foreach ($output in $suite.outputs) {
                if ($output.path -notmatch '^\.results/[^\\]+$' -or $output.path -match '(^|/)\.\.(/|$)' -or $output.sha256 -notmatch '^[a-f0-9]{64}$') {
                    throw 'Invalid portable native output reference/hash'
                }
            }
            if ($suite.collection.directory -cne $definition.Directory -or $suite.collection.pattern -cne $definition.Pattern -or
                $suite.collection.recursive -ne $definition.Recursive -or (@($suite.collection.excludedDirectories) -join "`n") -cne "bin`nobj" -or
                (@($suite.collection.configuration) -join "`n") -cne ($definition.Configuration -join "`n") -or
                (@($suite.collection.optionalConfiguration) -join "`n") -cne ($definition.Optional -join "`n")) {
                throw 'Collection definition differs from the governed native inventory scope'
            }

            $directory = Get-RepositoryPath $definition.Directory
            if (-not (Test-Path -LiteralPath $directory -PathType Container)) { throw 'Collection directory is missing' }
            $paths = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
            foreach ($file in Get-ChildItem -LiteralPath $directory -Recurse:$($definition.Recursive) -File -Filter $definition.Pattern) {
                $relative = $file.FullName.Substring($RepositoryRoot.Length).TrimStart('\', '/').Replace('\', '/')
                if ($relative -notmatch '(^|/)(bin|obj)(/|$)') { $null = $paths.Add($relative) }
            }
            foreach ($configuration in $definition.Configuration) {
                if (-not (Test-Path -LiteralPath (Get-RepositoryPath $configuration) -PathType Leaf)) { throw "Missing collection configuration: $configuration" }
                $null = $paths.Add($configuration)
            }
            foreach ($configuration in $definition.Optional) {
                if (Test-Path -LiteralPath (Get-RepositoryPath $configuration) -PathType Leaf) { $null = $paths.Add($configuration) }
            }
            $ordered = [string[]]@($paths)
            [Array]::Sort($ordered, [StringComparer]::Ordinal)
            if (($ordered -join "`n") -cne (@($suite.sources.path) -join "`n")) {
                throw 'Source/configuration inventory differs; refresh native measurement after added/removed files'
            }
            foreach ($source in $suite.sources) {
                if ($source.sha256 -notmatch '^[a-f0-9]{64}$' -or
                    (Get-PortableSourceHash (Get-RepositoryPath $source.path)) -cne $source.sha256) {
                    throw "Source fingerprint drift: $($source.path); refresh native measurement"
                }
            }
            $byId[$definition.Id] = [int]$suite.tests
            Write-Host "  OK    $name ($($suite.tests) measured tests; portable sources match)"
        } catch {
            Write-Host "  FAIL  $name - $($_.Exception.Message)"
            $script:OverallPass = $false
        }
    }
    return $byId
}

function Test-ScopedClaims {
    param([string]$Name, [string]$RelativePath, [string]$Heading, [string[]]$Required, [string[]]$Forbidden = @(), [hashtable[]]$ObservedCounts = @())
    $path = Get-RepositoryPath $RelativePath
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "  FAIL  $Name - missing $RelativePath"
        $script:OverallPass = $false
        return
    }
    $content = Get-Content -LiteralPath $path -Raw -Encoding UTF8
    $headingMatch = [regex]::Match($content, "(?m)^$Heading\s*$")
    $section = ''
    if ($headingMatch.Success) {
        $level = [regex]::Match($headingMatch.Value, '^#+').Length
        $tail = $content.Substring($headingMatch.Index + $headingMatch.Length)
        $next = [regex]::Match($tail, "(?m)^#{1,$level}\s+")
        $section = if ($next.Success) { $tail.Substring(0, $next.Index) } else { $tail }
    }
    $valid = $headingMatch.Success
    foreach ($pattern in $Required) { $valid = $valid -and [regex]::IsMatch($section, $pattern) }
    foreach ($pattern in $Forbidden) { $valid = $valid -and -not [regex]::IsMatch($section, $pattern) }
    foreach ($countClaim in $ObservedCounts) {
        foreach ($observed in [regex]::Matches($section, $countClaim.Pattern)) {
            $valid = $valid -and [int]$observed.Groups[1].Value -eq [int]$countClaim.Expected
        }
    }
    if ($valid) {
        Write-Host "  OK    $Name"
    } else {
        Write-Host "  FAIL  $Name - missing, stale or contradictory active-section claim in $RelativePath"
        $script:OverallPass = $false
    }
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

Write-Host ''
Write-Host 'Execution-backed active capability and assurance claims'
$nativeCounts = Test-ExecutionInventory
$tsComponents = $nativeCounts['demoapp001-component']
$openApiTests = $nativeCounts['demoapp001-openapi']
$pyComponents = $nativeCounts['demoapp002-component']
$csComponents = $nativeCounts['demoapp003-component']
$techniques = @('Unit Completion', 'Hidden Singles', 'Naked Singles', 'Naked Pairs', 'X-Wing')
$techniquePatterns = @($techniques | ForEach-Object { [regex]::Escape($_) })
$inventoryLink = '2026-10-07-component-execution-inventory\.json'
$unsupported = @('(?i)Puzzles requiring advanced techniques\s*\([^)]*(?:Naked Pairs|X-Wing)', '(?i)(?:Naked Pairs|X-Wing)[^\r\n.]{0,80}(?:not supported|unsupported)', '(?im)^\s*(?:The )?(?:core )?solver (?:uses|supports|implements) backtracking\b')
$threeTechniqueClaim = '(?i)\bthree (?:fundamental|deterministic|basic)(?: solving)? (?:techniques|algorithms)'

Test-ScopedClaims 'root five-technique overview' 'README.md' '## Overview' (@('implements five deterministic Sudoku solving techniques') + $techniquePatterns)
Test-ScopedClaims 'root solver boundary' 'README.md' '## Solving Capabilities' (@('(?s)STUCK_ON_ADVANCED_LOGIC.*?when empty cells remain and none of the five\s+techniques makes further progress', 'The core solver uses no backtracking or brute-force search\.', 'difficulty label does not guarantee either outcome') + $techniquePatterns) $unsupported
Test-ScopedClaims 'root measured counts' 'README.md' '## Key Design Principles' @("DEMOAPP001 has $tsComponents component tests and $openApiTests OpenAPI contract tests", "DEMOAPP002 has $pyComponents component tests", "DEMOAPP003 has $csComponents component tests", $inventoryLink) -ObservedCounts @(
    @{ Pattern = '(?i)DEMOAPP001 has\s+(\d+)\s+component tests'; Expected = $tsComponents }
    @{ Pattern = '(?i)DEMOAPP001 has\s+\d+\s+component tests and\s+(\d+)\s+OpenAPI'; Expected = $openApiTests }
    @{ Pattern = '(?i)DEMOAPP001 has\s+(\d+)\s+OpenAPI'; Expected = $openApiTests }
    @{ Pattern = '(?i)DEMOAPP002 has\s+(\d+)\s+component tests'; Expected = $pyComponents }
    @{ Pattern = '(?i)DEMOAPP003 has\s+(\d+)\s+component tests'; Expected = $csComponents }
)
Test-ScopedClaims 'root historical coverage and mutation labels' 'README.md' '## Key Design Principles' @('Historical measured baseline', '\| TypeScript / Node \d+ \| 2026-07-27:', '\| Python [\d.]+ \| 2026-07-27:', '\| C# / \.NET \d+ \| 2026-07-28:', 'Historical mutation observation \(2026-07-28\)')
Test-ScopedClaims 'assistant guide five techniques' 'CLAUDE.md' '## Subject Application' (@('implements five deterministic techniques') + $techniquePatterns)
Test-ScopedClaims 'assistant guide component counts' 'CLAUDE.md' '## Development Commands' @("Run $tsComponents component tests, then $($counts.Scenarios) Cucumber/Serenity", "Run $pyComponents component tests plus $($counts.Scenarios) pytest-bdd scenarios \($($pyComponents + $counts.Scenarios) total\)", "Run $csComponents component tests plus $($counts.Scenarios) Reqnroll tests \($($csComponents + $counts.Scenarios) total\)", $inventoryLink) -ObservedCounts @(
    @{ Pattern = '(?m)^\| `npm test` \| Run (\d+) component tests'; Expected = $tsComponents }
    @{ Pattern = '(?m)^\| `python -m pytest` \| Run (\d+) component tests'; Expected = $pyComponents }
    @{ Pattern = '(?m)^\| `dotnet test --no-restore` \| Run (\d+) component tests'; Expected = $csComponents }
)
Test-ScopedClaims 'TypeScript implemented techniques' 'demo-apps/demoapp001-typescript-cypress/README.md' '#### 2\. SudokuSolver.*' (@('Implement five deterministic solving techniques') + $techniquePatterns) @($threeTechniqueClaim)
Test-ScopedClaims 'TypeScript five-technique pipeline' 'demo-apps/demoapp001-typescript-cypress/README.md' '#### 3\. SudokuOrchestrator.*' @('(?m)^\s+4\. Try Naked Pairs\s*$', '(?m)^\s+5\. Try X-Wing\s*$') @($threeTechniqueClaim)
Test-ScopedClaims 'TypeScript solver boundary' 'demo-apps/demoapp001-typescript-cypress/README.md' '## Current Limitations' @('\*\*No Backtracking\*\*', '(?s)STUCK_ON_ADVANCED_LOGIC.*?when empty cells remain and none of the five techniques makes further\s+progress', 'difficulty labels do not guarantee completion') $unsupported
Test-ScopedClaims 'TypeScript measured counts' 'demo-apps/demoapp001-typescript-cypress/README.md' '## Testing' @("$tsComponents focused component tests and $openApiTests OpenAPI response-contract tests", $inventoryLink, 'Historical mutation\s+observation \(2026-07-28\)') -ObservedCounts @(@{ Pattern = '(\d+)\s+(?:focused\s+)?component tests'; Expected = $tsComponents }, @{ Pattern = '(\d+)\s+OpenAPI\b'; Expected = $openApiTests })
Test-ScopedClaims 'TypeScript guide execution counts' 'demo-apps/demoapp001-typescript-cypress/docs/README.md' '## Running Tests' @("$tsComponents component tests \($tsComponents passed\)", "$openApiTests OpenAPI contract tests \($openApiTests passed\)", "$($counts.Scenarios) scenarios \($($counts.Scenarios) passed\)", "$($counts.Steps) steps \($($counts.Steps) passed\)", $inventoryLink) -ObservedCounts @(@{ Pattern = '(\d+)\s+component tests'; Expected = $tsComponents }, @{ Pattern = '(\d+)\s+OpenAPI\b'; Expected = $openApiTests })
Test-ScopedClaims 'TypeScript architecture boundary' 'demo-apps/demoapp001-typescript-cypress/docs/architecture.md' '## 5\. Known Constraints' (@('deterministic core implements', 'Swordfish, XY-Wing, forcing chains and backtracking are outside that solver scope') + $techniquePatterns) $unsupported
Test-ScopedClaims 'TypeScript QA measured counts and historical labels' 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md' '## 5\. Coverage Metrics' @("\| Focused component tests \| $tsComponents \|", "\| OpenAPI contract tests \| $openApiTests \|", 'Historical coverage baseline \(2026-07-27\)', 'Historical mutation observation \(2026-07-28\)', $inventoryLink) -ObservedCounts @(@{ Pattern = '(?m)^\| Focused component tests \| (\d+) \|'; Expected = $tsComponents }, @{ Pattern = '(?m)^\| OpenAPI contract tests \| (\d+) \|'; Expected = $openApiTests })
Test-ScopedClaims 'C# guide execution counts' 'demo-apps/demoapp003-csharp-specflow/docs/README.md' '## Running Tests' @("$($csComponents + $counts.Scenarios) tests passing", "$($counts.Scenarios) generated Reqnroll tests plus $csComponents\s+focused component tests", $inventoryLink) -ObservedCounts @(@{ Pattern = '(\d+) tests passing'; Expected = $csComponents + $counts.Scenarios }, @{ Pattern = '(\d+)\s+focused component tests'; Expected = $csComponents })
Test-ScopedClaims 'C# QA implemented techniques' 'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md' '## 1\. What Is Tested' $techniquePatterns
Test-ScopedClaims 'C# QA solver boundary' 'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md' '## 3\. Explicitly Out of Scope' @('Swordfish, XY-Wing, forcing chains and backtracking.*excluded from the deterministic solver scope') (@('BACKLOG-014') + $unsupported)
Test-ScopedClaims 'C# QA measured counts' 'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md' '## 5\. Coverage Metrics' @("\| Scenarios \| $($counts.Scenarios) \|", "\| Focused component tests \| $csComponents \|", $inventoryLink) -ObservedCounts @(@{ Pattern = '(?m)^\| Focused component tests \| (\d+) \|'; Expected = $csComponents })

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
