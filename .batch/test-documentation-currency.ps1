# test-documentation-currency.ps1
#
# Runs controlled stale-document mutations against an isolated tracked-file fixture and proves the
# currency guard fails closed. The repository working tree is never modified.

param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path
$guardPath = Join-Path $PSScriptRoot 'check-ra-header-currency.ps1'
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
    'demo-apps/demoapp003-csharp-specflow/tests/DemoApp003.Specs.csproj'
)

function New-CurrencyFixture {
    $fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) "sudoku-currency-$([guid]::NewGuid())"
    New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

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

    return $fixtureRoot
}

$baselineOutput = & $guardPath -RepositoryRoot $repositoryRoot *>&1
if ($LASTEXITCODE -ne 0) {
    $baselineOutput | Write-Host
    throw 'Documentation currency baseline must pass before negative controls run'
}

$mutations = @(
    @{ Name = 'private visibility'; File = 'README.md'; Before = 'This repository is public.'; After = 'This repository remains private.' }
    @{ Name = 'stale scenario count'; File = 'demo-apps/demoapp001-typescript-cypress/docs/qa-strategy.md'; Before = '| Scenarios | 52 | 52 |'; After = '| Scenarios | 43 | 43 |' }
    @{ Name = 'stale C# runtime'; File = 'demo-apps/demoapp003-csharp-specflow/README.md'; Before = '.NET SDK 10.0'; After = '.NET SDK 8.0' }
    @{ Name = 'active historical REST proposal'; File = 'DOCS/.design/rest-api-wrapper.md'; Before = '**Status:** Historical design proposal'; After = '**Status:** Active implementation authority' }
    @{ Name = 'missing review index entry'; File = 'DOCS/README.md'; Before = 'CODE_REVIEW_CODEX_v1_20260723T2351Z'; After = 'OMITTED_REVIEW_20260723' }
    @{ Name = 'stale TypeScript dependency'; File = 'demo-apps/demoapp001-typescript-cypress/README.md'; Before = '| `@cucumber/cucumber` | `^12.8.3` |'; After = '| `@cucumber/cucumber` | `^11.0.0` |' }
)

foreach ($mutation in $mutations) {
    $fixtureRoot = New-CurrencyFixture
    try {
        $target = Join-Path $fixtureRoot ($mutation.File -replace '/', [IO.Path]::DirectorySeparatorChar)
        $content = Get-Content -LiteralPath $target -Raw -Encoding UTF8
        if (-not $content.Contains($mutation.Before)) {
            throw "Mutation anchor not found for $($mutation.Name)"
        }
        [IO.File]::WriteAllText($target, $content.Replace($mutation.Before, $mutation.After))

        $mutationOutput = & $guardPath -RepositoryRoot $fixtureRoot *>&1
        if ($LASTEXITCODE -eq 0) {
            $mutationOutput | Write-Host
            throw "Currency guard accepted controlled mutation: $($mutation.Name)"
        }
        Write-Host "  OK    rejected $($mutation.Name)"
    } finally {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Host "Documentation currency negative controls: PASS ($($mutations.Count)/$($mutations.Count) rejected)"
exit 0
