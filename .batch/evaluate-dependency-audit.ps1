param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('demoapp001', 'demoapp002', 'demoapp003')]
    [string]$Stack,

    [Parameter(Mandatory = $true)]
    [ValidateSet('npm-audit', 'pip-audit', 'nuget-audit')]
    [string]$Tool,

    [Parameter(Mandatory = $true)]
    [string]$NativeReport,

    [Parameter(Mandatory = $true)]
    [int]$NativeExitCode,

    [Parameter(Mandatory = $true)]
    [string]$EvidenceRoot,

    [string]$PolicyPath = (Join-Path (Resolve-Path -LiteralPath "$PSScriptRoot\..").Path '.github/dependency-audit-policy.json'),

    [datetime]$AsOfDate = (Get-Date).ToUniversalTime()
)

$ErrorActionPreference = 'Stop'
$severityRanks = @{
    info = 0
    low = 1
    moderate = 2
    medium = 2
    high = 3
    critical = 4
    unknown = 5
}

function Get-ExactPolicyDate {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Record,
        [Parameter(Mandatory = $true)]
        [string]$Field,
        [Parameter(Mandatory = $true)]
        [int]$Index
    )

    $value = [string]$Record.$Field
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Exception $Index must define $Field"
    }

    $parsed = [datetime]::MinValue
    if (-not [datetime]::TryParseExact(
        $value,
        'yyyy-MM-dd',
        [Globalization.CultureInfo]::InvariantCulture,
        [Globalization.DateTimeStyles]::AssumeUniversal,
        [ref]$parsed
    )) {
        throw "Exception $Index has invalid $Field '$value'; expected yyyy-MM-dd"
    }
    return $parsed.Date
}

function Add-Finding {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [Collections.Generic.List[object]]$Target,
        [Parameter(Mandatory = $true)]
        [string]$Id,
        [Parameter(Mandatory = $true)]
        [string]$Package,
        [string]$InstalledVersion = '',
        [string]$Severity = 'unknown',
        [string]$AdvisoryUrl = ''
    )

    $normalisedSeverity = $Severity.ToLowerInvariant()
    if (-not $severityRanks.ContainsKey($normalisedSeverity)) {
        $normalisedSeverity = 'unknown'
    }

    $key = "$($Id.ToLowerInvariant())|$($Package.ToLowerInvariant())"
    if ($Target | Where-Object { $_.key -eq $key }) {
        return
    }

    $Target.Add([pscustomobject]@{
        key = $key
        id = $Id
        package = $Package
        installedVersion = $InstalledVersion
        severity = $normalisedSeverity
        advisoryUrl = $AdvisoryUrl
    })
}

function Convert-NpmAuditReport {
    param([Parameter(Mandatory = $true)][object]$Document)

    if ($null -eq $Document.auditReportVersion -or $null -eq $Document.vulnerabilities) {
        throw 'npm audit output does not contain the expected auditReportVersion/vulnerabilities schema'
    }

    $result = [Collections.Generic.List[object]]::new()
    foreach ($property in $Document.vulnerabilities.PSObject.Properties) {
        $vulnerability = $property.Value
        foreach ($via in @($vulnerability.via)) {
            if ($via -is [string]) {
                continue
            }
            $url = [string]$via.url
            $id = if ($url -match '/(GHSA-[^/?#]+)$') { $Matches[1] } else { "npm-$([string]$via.source)" }
            Add-Finding -Target $result -Id $id -Package ([string]$property.Name) -Severity ([string]$via.severity) -AdvisoryUrl $url
        }
    }
    return $result
}

function Convert-PipAuditReport {
    param([Parameter(Mandatory = $true)][object]$Document)

    if ($null -eq $Document.dependencies) {
        throw 'pip-audit output does not contain the expected dependencies schema'
    }

    $result = [Collections.Generic.List[object]]::new()
    foreach ($dependency in @($Document.dependencies)) {
        foreach ($vulnerability in @($dependency.vulns)) {
            if ($null -eq $vulnerability) {
                continue
            }
            $id = [string]$vulnerability.id
            if ([string]::IsNullOrWhiteSpace($id)) {
                $id = 'pip-audit-unknown'
            }
            Add-Finding -Target $result -Id $id -Package ([string]$dependency.name) -InstalledVersion ([string]$dependency.version) -Severity 'unknown'
        }
    }
    return $result
}

function Convert-NuGetAuditReport {
    param([Parameter(Mandatory = $true)][object]$Document)

    if ($null -eq $Document.version -or $null -eq $Document.projects) {
        throw 'NuGet audit output does not contain the expected version/projects schema'
    }

    $result = [Collections.Generic.List[object]]::new()
    foreach ($project in @($Document.projects)) {
        foreach ($framework in @($project.frameworks)) {
            if ($null -eq $framework) {
                continue
            }
            foreach ($collectionName in @('topLevelPackages', 'transitivePackages')) {
                foreach ($package in @($framework.$collectionName)) {
                    if ($null -eq $package) {
                        continue
                    }
                    foreach ($vulnerability in @($package.vulnerabilities)) {
                        if ($null -eq $vulnerability) {
                            continue
                        }
                        $url = [string]$vulnerability.advisoryurl
                        $id = if ($url -match '/(GHSA-[^/?#]+)$') { $Matches[1] } else { $url }
                        if ([string]::IsNullOrWhiteSpace($id)) {
                            $id = 'nuget-audit-unknown'
                        }
                        Add-Finding -Target $result -Id $id -Package ([string]$package.id) -InstalledVersion ([string]$package.resolvedVersion) -Severity ([string]$vulnerability.severity) -AdvisoryUrl $url
                    }
                }
            }
        }
    }
    return $result
}

$auditDirectory = Join-Path $EvidenceRoot 'audit'
New-Item -ItemType Directory -Path $auditDirectory -Force | Out-Null
$summaryPath = Join-Path $auditDirectory 'dependency-audit-summary.json'
$policyErrors = [Collections.Generic.List[string]]::new()
$activeExceptions = [Collections.Generic.List[object]]::new()
$findings = [Collections.Generic.List[object]]::new()
$toolStatus = 'success'
$parseError = $null

try {
    $policy = Get-Content -LiteralPath $PolicyPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($policy.schemaVersion -ne 1) {
        throw "Unsupported dependency-audit policy schemaVersion '$($policy.schemaVersion)'"
    }
    $threshold = ([string]$policy.blockAtOrAbove).ToLowerInvariant()
    if (-not $severityRanks.ContainsKey($threshold)) {
        throw "Unsupported blockAtOrAbove severity '$threshold'"
    }
    if ([int]$policy.maximumExceptionDays -lt 1) {
        throw 'maximumExceptionDays must be a positive integer'
    }

    $exceptionIndex = 0
    foreach ($exception in @($policy.exceptions)) {
        $exceptionIndex += 1
        try {
            foreach ($field in @('kind', 'stack', 'owner', 'reason', 'approvedBy')) {
                if ([string]::IsNullOrWhiteSpace([string]$exception.$field)) {
                    throw "Exception $exceptionIndex must define $field"
                }
            }
            if ([string]$exception.stack -notin @('demoapp001', 'demoapp002', 'demoapp003')) {
                throw "Exception $exceptionIndex has unsupported stack '$($exception.stack)'"
            }
            if ([string]$exception.kind -notin @('vulnerability', 'outage')) {
                throw "Exception $exceptionIndex has unsupported kind '$($exception.kind)'"
            }
            if ($exception.kind -eq 'vulnerability') {
                foreach ($field in @('id', 'package')) {
                    if ([string]::IsNullOrWhiteSpace([string]$exception.$field)) {
                        throw "Vulnerability exception $exceptionIndex must define $field"
                    }
                }
            }
            if ($exception.kind -eq 'outage' -and [string]::IsNullOrWhiteSpace([string]$exception.tool)) {
                throw "Outage exception $exceptionIndex must define tool"
            }
            if ($exception.kind -eq 'outage' -and [string]$exception.tool -notin @('npm-audit', 'pip-audit', 'nuget-audit')) {
                throw "Outage exception $exceptionIndex has unsupported tool '$($exception.tool)'"
            }

            $introducedOn = Get-ExactPolicyDate -Record $exception -Field introducedOn -Index $exceptionIndex
            $expiresOn = Get-ExactPolicyDate -Record $exception -Field expiresOn -Index $exceptionIndex
            $duration = ($expiresOn - $introducedOn).Days + 1
            if ($duration -lt 1 -or $duration -gt [int]$policy.maximumExceptionDays) {
                throw "Exception $exceptionIndex spans $duration days; maximum is $($policy.maximumExceptionDays)"
            }
            if ($introducedOn -gt $AsOfDate.Date) {
                throw "Exception $exceptionIndex begins in the future on $($exception.introducedOn)"
            }
            if ($expiresOn -lt $AsOfDate.Date) {
                throw "Exception $exceptionIndex expired on $($exception.expiresOn)"
            }
            $activeExceptions.Add($exception)
        } catch {
            $policyErrors.Add($_.Exception.Message)
        }
    }
} catch {
    $policyErrors.Add($_.Exception.Message)
    $threshold = 'unknown'
    $policy = [pscustomobject]@{ maximumExceptionDays = 0; exceptions = @() }
}

try {
    $rawReport = Get-Content -LiteralPath $NativeReport -Raw -Encoding UTF8
    $document = $rawReport | ConvertFrom-Json
    $parsedFindings = switch ($Tool) {
        'npm-audit' { Convert-NpmAuditReport -Document $document }
        'pip-audit' { Convert-PipAuditReport -Document $document }
        'nuget-audit' { Convert-NuGetAuditReport -Document $document }
    }
    foreach ($finding in @($parsedFindings)) {
        $findings.Add($finding)
    }
    if ($NativeExitCode -ne 0 -and $findings.Count -eq 0) {
        throw "$Tool exited $NativeExitCode without reporting a vulnerability"
    }
} catch {
    $toolStatus = 'outage'
    $parseError = $_.Exception.Message
}

foreach ($exception in @($activeExceptions | Where-Object { $_.stack -eq $Stack })) {
    if ($exception.kind -eq 'vulnerability') {
        $matchingFinding = $findings | Where-Object {
            ([string]$exception.id).Equals($_.id, [StringComparison]::OrdinalIgnoreCase) -and
            ([string]$exception.package).Equals($_.package, [StringComparison]::OrdinalIgnoreCase)
        } | Select-Object -First 1
        if (-not $matchingFinding) {
            $policyErrors.Add("Active vulnerability exception '$($exception.id)' no longer matches a reported finding")
        }
    } elseif ($exception.tool -ne $Tool -or $toolStatus -ne 'outage') {
        $policyErrors.Add("Active outage exception '$($exception.tool)' does not match the current audit outage")
    }
}

$blockingFindings = [Collections.Generic.List[object]]::new()
$exceptedFindings = [Collections.Generic.List[object]]::new()
$unexceptedFindings = [Collections.Generic.List[object]]::new()
$appliedExceptions = [Collections.Generic.List[object]]::new()

if ($toolStatus -eq 'success' -and $policyErrors.Count -eq 0) {
    foreach ($finding in $findings) {
        if ($severityRanks[$finding.severity] -lt $severityRanks[$threshold]) {
            continue
        }
        $blockingFindings.Add($finding)
        $matched = $activeExceptions | Where-Object {
            $_.kind -eq 'vulnerability' -and
            $_.stack -eq $Stack -and
            ([string]$_.id).Equals($finding.id, [StringComparison]::OrdinalIgnoreCase) -and
            ([string]$_.package).Equals($finding.package, [StringComparison]::OrdinalIgnoreCase)
        } | Select-Object -First 1
        if ($matched) {
            $exceptedFindings.Add($finding)
            $appliedExceptions.Add($matched)
        } else {
            $unexceptedFindings.Add($finding)
        }
    }
}

if ($toolStatus -eq 'outage' -and $policyErrors.Count -eq 0) {
    $outageException = $activeExceptions | Where-Object {
        $_.kind -eq 'outage' -and $_.stack -eq $Stack -and $_.tool -eq $Tool
    } | Select-Object -First 1
    if ($outageException) {
        $appliedExceptions.Add($outageException)
    }
}

$status = 'pass'
if ($policyErrors.Count -gt 0 -or $unexceptedFindings.Count -gt 0) {
    $status = 'fail'
} elseif ($toolStatus -eq 'outage' -and $appliedExceptions.Count -eq 0) {
    $status = 'fail'
} elseif ($appliedExceptions.Count -gt 0) {
    $status = 'excepted'
}

$summary = [ordered]@{
    schemaVersion = 1
    generatedAt = $AsOfDate.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    stack = $Stack
    tool = $Tool
    status = $status
    toolStatus = $toolStatus
    nativeExitCode = $NativeExitCode
    threshold = $threshold
    findingCount = $findings.Count
    blockingFindingCount = $blockingFindings.Count
    exceptedFindingCount = $exceptedFindings.Count
    unexceptedFindingCount = $unexceptedFindings.Count
    findings = @($findings | Select-Object id, package, installedVersion, severity, advisoryUrl)
    appliedExceptions = @($appliedExceptions | Select-Object kind, stack, id, package, tool, owner, reason, approvedBy, introducedOn, expiresOn)
    policyErrors = @($policyErrors)
    toolError = $parseError
}

[IO.File]::WriteAllText($summaryPath, ($summary | ConvertTo-Json -Depth 8) + [Environment]::NewLine)

Write-Host "Dependency audit: stack=$Stack tool=$Tool status=$status findings=$($findings.Count) blocking=$($blockingFindings.Count) unexcepted=$($unexceptedFindings.Count)"
if ($parseError) {
    Write-Host "  Tool error: $parseError"
}
foreach ($errorMessage in $policyErrors) {
    Write-Host "  Policy error: $errorMessage"
}
foreach ($finding in $unexceptedFindings) {
    Write-Host "  Unexcepted: $($finding.id) $($finding.package) [$($finding.severity)]"
}

if ($status -eq 'fail') {
    exit 1
}
exit 0
