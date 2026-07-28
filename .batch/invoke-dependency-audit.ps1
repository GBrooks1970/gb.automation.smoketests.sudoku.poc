param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('demoapp001', 'demoapp002', 'demoapp003')]
    [string]$Stack,

    [string]$EvidenceRoot = (Join-Path (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path ".results/$Stack"),

    [string]$PolicyPath = (Join-Path (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path '.github/dependency-audit-policy.json')
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path
if (-not [IO.Path]::IsPathRooted($EvidenceRoot)) {
    $EvidenceRoot = Join-Path $repositoryRoot $EvidenceRoot
}
$EvidenceRoot = [IO.Path]::GetFullPath($EvidenceRoot)
if (-not [IO.Path]::IsPathRooted($PolicyPath)) {
    $PolicyPath = Join-Path $repositoryRoot $PolicyPath
}
$PolicyPath = [IO.Path]::GetFullPath($PolicyPath)
$auditDirectory = Join-Path $EvidenceRoot 'audit'
New-Item -ItemType Directory -Path $auditDirectory -Force | Out-Null
$nativeReport = Join-Path $auditDirectory 'dependency-audit-native.txt'
$stderrReport = Join-Path $auditDirectory 'dependency-audit-stderr.txt'

$configuration = @{
    demoapp001 = @{
        Tool = 'npm-audit'
        Command = 'npm'
        Arguments = @('audit', '--audit-level=high', '--json')
        WorkingDirectory = 'demo-apps/demoapp001-typescript-cypress'
    }
    demoapp002 = @{
        Tool = 'pip-audit'
        Command = 'python'
        Arguments = @('-m', 'pip_audit', '--local', '--skip-editable', '--format=json')
        WorkingDirectory = 'demo-apps/demoapp002-python-pytest'
    }
    demoapp003 = @{
        Tool = 'nuget-audit'
        Command = 'dotnet'
        Arguments = @('package', 'list', '--vulnerable', '--include-transitive', '--format', 'json', '--no-restore')
        WorkingDirectory = 'demo-apps/demoapp003-csharp-specflow'
    }
}[$Stack]

$nativeExitCode = 127
$stderrLines = [Collections.Generic.List[string]]::new()
$stdoutLines = @()
Push-Location (Join-Path $repositoryRoot $configuration.WorkingDirectory)
try {
    try {
        $stdoutLines = @(& $configuration.Command @($configuration.Arguments) 2> $stderrReport)
        $nativeExitCode = $LASTEXITCODE
    } catch {
        $stderrLines.Add($_.Exception.Message)
    }
} finally {
    Pop-Location
}

if (Test-Path -LiteralPath $stderrReport) {
    foreach ($line in Get-Content -LiteralPath $stderrReport -Encoding UTF8) {
        $stderrLines.Add($line)
    }
}
if ($stderrLines.Count -eq 0) {
    $stderrLines.Add('(no stderr output)')
}

$nativeText = $stdoutLines -join [Environment]::NewLine
if ([string]::IsNullOrWhiteSpace($nativeText)) {
    $nativeText = '(no stdout output)'
}
[IO.File]::WriteAllText($nativeReport, $nativeText + [Environment]::NewLine)
[IO.File]::WriteAllText($stderrReport, ($stderrLines -join [Environment]::NewLine) + [Environment]::NewLine)

& (Join-Path $PSScriptRoot 'evaluate-dependency-audit.ps1') `
    -Stack $Stack `
    -Tool $configuration.Tool `
    -NativeReport $nativeReport `
    -NativeExitCode $nativeExitCode `
    -EvidenceRoot $EvidenceRoot `
    -PolicyPath $PolicyPath
exit $LASTEXITCODE
