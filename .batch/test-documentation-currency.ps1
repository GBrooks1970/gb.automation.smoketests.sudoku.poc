# test-documentation-currency.ps1
#
# Runs controlled stale-document mutations against an isolated tracked-file fixture and proves the
# currency guard rejects the intended claim. Every isolated fixture must pass before mutation;
# a parser/setup failure cannot stand in for the expected named currency diagnostic.
# The guard runs in CI; these controls also run in the local aggregate parity gate.

param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path
$guardPath = Join-Path $PSScriptRoot 'check-ra-header-currency.ps1'
$inventoryFile = 'DOCS/.analysis/2026-10-07-component-execution-inventory.json'
$inventory = Get-Content -LiteralPath (Join-Path $repositoryRoot $inventoryFile) -Raw -Encoding UTF8 | ConvertFrom-Json
$sourcePaths = @($inventory.suites | ForEach-Object { $_.sources.path })
$testSource = @($sourcePaths | Where-Object { $_ -like '*/tests/component/*.test.ts' } | Sort-Object)[0]
$fixtureFiles = @(
    '.github/workflows/ci.yml',
    'CLAUDE.md',
    'README.md',
    'decision-register.md',
    'DOCS/reference-architecture.md',
    'DOCS/README.md',
    'DOCS/.design/rest-api-wrapper.md',
    'DOCS/.planning/backlog.md',
    'DOCS/.review/README.md',
    'features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature',
    'demo-apps/demoapp001-typescript-cypress/package.json',
    'demo-apps/demoapp001-typescript-cypress/README.md',
    'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md',
    'demo-apps/demoapp002-python-pytest/README.md',
    'demo-apps/demoapp003-csharp-specflow/README.md',
    'demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj',
    'demo-apps/demoapp001-typescript-cypress/docs/README.md',
    'demo-apps/demoapp001-typescript-cypress/docs/architecture.md',
    'demo-apps/demoapp003-csharp-specflow/docs/README.md',
    'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md',
    $inventoryFile
)
$fixtureFiles = @($fixtureFiles + $sourcePaths | Sort-Object -Unique)

function Remove-CurrencyFixture {
    param([string]$FixtureRoot)
    $resolved = (Resolve-Path -LiteralPath $FixtureRoot).Path
    $temporary = (Resolve-Path -LiteralPath ([IO.Path]::GetTempPath())).Path.TrimEnd('\', '/')
    $parent = (Split-Path -Parent $resolved).TrimEnd('\', '/')
    $leaf = Split-Path -Leaf $resolved
    $comparison = if ([IO.Path]::DirectorySeparatorChar -eq '\') { [StringComparer]::OrdinalIgnoreCase } else { [StringComparer]::Ordinal }
    $item = Get-Item -LiteralPath $resolved
    if (-not $comparison.Equals($parent, $temporary) -or
        $leaf -notmatch '^sudoku-currency-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' -or
        -not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Refusing recursive cleanup outside the generated temporary fixture: $resolved"
    }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}

function New-CurrencyFixture {
    $fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) "sudoku-currency-$([guid]::NewGuid())"
    New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

    try {
        foreach ($relativePath in $fixtureFiles) {
            $source = Join-Path $repositoryRoot ($relativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
            $destination = Join-Path $fixtureRoot ($relativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
            New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
            Copy-Item -LiteralPath $source -Destination $destination
        }
        Get-ChildItem -LiteralPath (Join-Path $repositoryRoot 'DOCS/.review') -Directory |
            Where-Object { $_.Name -like 'CODE_REVIEW_*' } |
            ForEach-Object {
                New-Item -ItemType Directory -Path (Join-Path $fixtureRoot "DOCS/.review/$($_.Name)") -Force | Out-Null
            }
    } catch {
        Remove-CurrencyFixture $fixtureRoot
        throw
    }
    return $fixtureRoot
}

function Assert-CurrencyBaseline {
    param([string]$Root)
    $output = & $guardPath -RepositoryRoot $Root *>&1
    if ($LASTEXITCODE -ne 0) {
        $output | Write-Host
        throw "Documentation currency baseline must pass before controls run: $Root"
    }
}

Assert-CurrencyBaseline $repositoryRoot

$portableFixture = New-CurrencyFixture
try {
    Assert-CurrencyBaseline $portableFixture
    foreach ($relative in $sourcePaths | Sort-Object -Unique) {
        $target = Join-Path $portableFixture $relative
        $text = [IO.File]::ReadAllText($target).Replace("`r`n", "`n").Replace("`r", "`n")
        [IO.File]::WriteAllText($target, $text, [Text.UTF8Encoding]::new($false))
    }
    Assert-CurrencyBaseline $portableFixture
    Write-Host '  OK    portable LF-normalised source fingerprints'
} finally {
    Remove-CurrencyFixture $portableFixture
}

$mutations = @(
    @{ Name = 'private visibility'; File = 'README.md'; Before = 'This repository is public.'; After = 'This repository remains private.'; Diagnostic = 'public repository status' }
    @{ Name = 'stale scenario count'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Before = '| Scenarios | 55 | 55 |'; After = '| Scenarios | 43 | 43 |'; Diagnostic = 'TypeScript QA scenario count' }
    @{ Name = 'stale C# runtime'; File = 'demo-apps/demoapp003-csharp-specflow/README.md'; Before = '.NET SDK 10.0'; After = '.NET SDK 8.0'; Diagnostic = 'C# supported runtime' }
    @{ Name = 'active historical REST proposal'; File = 'DOCS/.design/rest-api-wrapper.md'; Before = '**Status:** Historical design proposal'; After = '**Status:** Active implementation authority'; Diagnostic = 'historical REST design marker' }
    @{ Name = 'missing review index entry'; File = 'DOCS/README.md'; Before = '| [CODE_REVIEW_CODEX_v1_20260723T2351Z](.review/CODE_REVIEW_CODEX_v1_20260723T2351Z/) | Codex | 2026-07-23 | B+ |'; After = '| OMITTED_REVIEW_20260723 | Codex | 2026-07-23 | B+ |'; Diagnostic = 'DOCS/README.md omits CODE_REVIEW_CODEX_v1_20260723T2351Z' }
    @{ Name = 'stale TypeScript dependency'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = '| `@cucumber/cucumber` | `^12.8.3` |'; After = '| `@cucumber/cucumber` | `^11.0.0` |'; Diagnostic = 'TypeScript README does not match package.json for @cucumber/cucumber' }
    @{ Name = 'root technique count'; File = 'README.md'; Before = 'implements five deterministic Sudoku solving techniques'; After = 'implements three deterministic Sudoku solving techniques'; Diagnostic = 'root five-technique overview' }
    @{ Name = 'root omitted technique'; File = 'README.md'; Before = '**X-Wing** - Eliminates parallel line candidates in rows/columns'; After = '**Swordfish** - Eliminates parallel line candidates in rows/columns'; Diagnostic = 'root five-technique overview' }
    @{ Name = 'root unsupported-technique contradiction'; File = 'README.md'; Before = '## Solving Capabilities'; After = "## Solving Capabilities`nPuzzles requiring advanced techniques (Naked Pairs, X-Wing, etc.) will return STUCK_ON_ADVANCED_LOGIC."; Diagnostic = 'root solver boundary' }
    @{ Name = 'root backtracking contradiction'; File = 'README.md'; Before = '## Solving Capabilities'; After = "## Solving Capabilities`nThe core solver uses backtracking."; Diagnostic = 'root solver boundary' }
    @{ Name = 'root no-progress boundary'; File = 'README.md'; Before = 'when empty cells remain and none of the five'; After = 'whenever a puzzle has a Hard or Expert label, even if one of the five'; Diagnostic = 'root solver boundary' }
    @{ Name = 'root component count'; File = 'README.md'; Before = 'DEMOAPP001 has 113 component tests and 8 OpenAPI contract tests'; After = 'DEMOAPP001 has 20 component tests and 8 OpenAPI contract tests'; Diagnostic = 'root measured counts' }
    @{ Name = 'root contradictory component count'; File = 'README.md'; Before = '## Key Design Principles'; After = "## Key Design Principles`nDEMOAPP001 has 20 component tests."; Diagnostic = 'root measured counts' }
    @{ Name = 'root coverage historical label'; File = 'README.md'; Before = '| Stack | Historical measured baseline | CI floor |'; After = '| Stack | Measured baseline | CI floor |'; Diagnostic = 'root historical coverage and mutation labels' }
    @{ Name = 'root coverage capture date'; File = 'README.md'; Before = '| TypeScript / Node 24 | 2026-07-27:'; After = '| TypeScript / Node 24 |'; Diagnostic = 'root historical coverage and mutation labels' }
    @{ Name = 'root mutation historical label'; File = 'README.md'; Before = 'Historical mutation observation (2026-07-28): the focused Node 24 trial'; After = 'Current mutation observation: the focused Node 24 trial'; Diagnostic = 'root historical coverage and mutation labels' }
    @{ Name = 'assistant guide technique count'; File = 'CLAUDE.md'; Before = 'implements five deterministic techniques'; After = 'implements three deterministic techniques'; Diagnostic = 'assistant guide five techniques' }
    @{ Name = 'assistant guide component count'; File = 'CLAUDE.md'; Before = 'Run 113 component tests, then 55 Cucumber/Serenity Screenplay scenarios'; After = 'Run 20 component tests, then 55 Cucumber/Serenity Screenplay scenarios'; Diagnostic = 'assistant guide component counts' }
    @{ Name = 'TypeScript technique summary'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = 'Implement five deterministic solving techniques:'; After = 'Implement three deterministic solving techniques:'; Diagnostic = 'TypeScript implemented techniques' }
    @{ Name = 'TypeScript contradictory three-technique summary'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = 'Implement five deterministic solving techniques:'; After = "The solver implements three fundamental solving techniques. Implement five deterministic solving techniques:"; Diagnostic = 'TypeScript implemented techniques' }
    @{ Name = 'TypeScript omitted pipeline technique'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = '  4. Try Naked Pairs'; After = ''; Diagnostic = 'TypeScript five-technique pipeline' }
    @{ Name = 'TypeScript backtracking contradiction'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = '## Current Limitations'; After = "## Current Limitations`nThe solver uses backtracking."; Diagnostic = 'TypeScript solver boundary' }
    @{ Name = 'TypeScript component count'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = '113 focused component tests and 8 OpenAPI response-contract tests'; After = '20 focused component tests and 8 OpenAPI response-contract tests'; Diagnostic = 'TypeScript measured counts' }
    @{ Name = 'TypeScript guide component count'; File = 'demo-apps/demoapp001-typescript-cypress/docs/README.md'; Before = '113 component tests (113 passed)'; After = '20 component tests (20 passed)'; Diagnostic = 'TypeScript guide execution counts' }
    @{ Name = 'TypeScript architecture contradiction'; File = 'demo-apps/demoapp001-typescript-cypress/docs/architecture.md'; Before = '## 5. Known Constraints'; After = "## 5. Known Constraints`nThe solver uses backtracking."; Diagnostic = 'TypeScript architecture boundary' }
    @{ Name = 'TypeScript QA component count'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Before = '| Focused component tests | 113 |'; After = '| Focused component tests | 20 |'; Diagnostic = 'TypeScript QA measured counts and historical labels' }
    @{ Name = 'TypeScript QA coverage historical label'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Before = '| Historical coverage baseline (2026-07-27) |'; After = '| Selected-scope coverage |'; Diagnostic = 'TypeScript QA measured counts and historical labels' }
    @{ Name = 'TypeScript QA mutation historical label'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Before = '| Historical mutation observation (2026-07-28) |'; After = '| Mutation trial |'; Diagnostic = 'TypeScript QA measured counts and historical labels' }
    @{ Name = 'C# guide execution count'; File = 'demo-apps/demoapp003-csharp-specflow/docs/README.md'; Before = 'Expected output: 83 tests passing across the solution'; After = 'Expected output: 55 tests passing across the solution'; Diagnostic = 'C# guide execution counts' }
    @{ Name = 'C# QA omitted techniques'; File = 'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md'; Before = '| Solver algorithms | Unit Completion, Hidden Singles, Naked Singles, Naked Pairs, X-Wing |'; After = '| Solver algorithms | Unit Completion, Hidden Singles, Naked Singles |'; Diagnostic = 'C# QA implemented techniques' }
    @{ Name = 'C# QA obsolete advanced-technique exclusion'; File = 'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md'; Before = '## 3. Explicitly Out of Scope'; After = "## 3. Explicitly Out of Scope`n- Advanced techniques are excluded; see BACKLOG-014."; Diagnostic = 'C# QA solver boundary' }
    @{ Name = 'C# QA component count'; File = 'demo-apps/demoapp003-csharp-specflow/docs/qa-strategy.md'; Before = '| Focused component tests | 28 |'; After = '| Focused component tests | 24 |'; Diagnostic = 'C# QA measured counts' }
    @{ Name = 'changed test-source fingerprint'; File = $testSource; Mode = 'append'; Diagnostic = 'execution inventory demoapp001-component' }
    @{ Name = 'added component test file'; File = 'demo-apps/demoapp001-typescript-cypress/tests/component/currency-added.test.ts'; Mode = 'add'; Diagnostic = 'execution inventory demoapp001-component' }
    @{ Name = 'removed component test file'; File = $testSource; Mode = 'remove'; Diagnostic = 'execution inventory demoapp001-component' }
    @{ Name = 'added Python collection configuration'; File = 'demo-apps/demoapp002-python-pytest/tests/conftest.py'; Mode = 'add'; Diagnostic = 'execution inventory demoapp002-component' }
    @{ Name = 'added C# ancestor collection configuration'; File = 'demo-apps/demoapp003-csharp-specflow/tests/Directory.Build.props'; Mode = 'add'; Diagnostic = 'execution inventory demoapp003-component' }
)

foreach ($mutation in $mutations) {
    $fixtureRoot = New-CurrencyFixture
    try {
        Assert-CurrencyBaseline $fixtureRoot
        $target = Join-Path $fixtureRoot ($mutation.File -replace '/', [IO.Path]::DirectorySeparatorChar)
        if ($mutation.Mode -eq 'add') {
            if (Test-Path -LiteralPath $target) { throw "Added-file control already exists: $target" }
            [IO.File]::WriteAllText($target, '# isolated added-source control', [Text.UTF8Encoding]::new($false))
        } elseif ($mutation.Mode -eq 'remove') {
            Remove-Item -LiteralPath $target
        } else {
            $content = Get-Content -LiteralPath $target -Raw -Encoding UTF8
            if ($mutation.Mode -eq 'append') {
                $changed = $content + "`n// isolated fingerprint drift`n"
            } else {
                $anchors = [regex]::Matches($content, [regex]::Escape($mutation.Before)).Count
                if ($anchors -ne 1) { throw "Expected one mutation anchor for $($mutation.Name), found $anchors" }
                $changed = $content.Replace($mutation.Before, $mutation.After)
            }
            [IO.File]::WriteAllText($target, $changed, [Text.UTF8Encoding]::new($false))
        }

        $mutationOutput = & $guardPath -RepositoryRoot $fixtureRoot *>&1
        $diagnostic = '(?m)^\s*FAIL\s+' + [regex]::Escape($mutation.Diagnostic) + '(?:\s+-|\s*$)'
        if ($LASTEXITCODE -ne 1 -or ($mutationOutput | Out-String) -notmatch $diagnostic) {
            $mutationOutput | Write-Host
            throw "Expected exit 1 and named diagnostic '$($mutation.Diagnostic)' for $($mutation.Name)"
        }
        Write-Host "  OK    rejected $($mutation.Name) with $($mutation.Diagnostic)"
    } finally {
        Remove-CurrencyFixture $fixtureRoot
    }
}

Write-Host "Documentation currency negative controls: PASS ($($mutations.Count)/$($mutations.Count) rejected)"
exit 0
