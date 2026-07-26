[Review index](../00_CODE_REVIEW_CODEX_v1_20260723T2351Z.md) > Annex > Validation Log

# Validation Log

## Review Environment

| Tool | Version |
|------|---------|
| Node.js | 20.19.5 |
| npm | 10.8.2 |
| Python | 3.13.1 |
| .NET SDK | 9.0.316 |
| PowerShell | 7.6.3 |
| Docker | 29.0.1 |

The TypeScript project requires Node `>=24 <25` with `engine-strict=true`. The C# project targets .NET 10. Unsupported local runtimes were not bypassed.

## Source and Branch Baseline

```text
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c review/gb-automation-smoketests-sudoku-poc-codex-v1
```

Reviewed default-branch commit:

```text
40812e551ef5b9a8666139d57452ddd641f87caa
```

GitHub reported the repository as public. The latest `main` CI run at the reviewed commit completed successfully:

```text
https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/29759645338
```

## Executed Checks

### Repository parity

Command:

```powershell
pwsh -NoLogo -NoProfile -File .\.batch\run-parity-checks.ps1
```

Result: PASS

```text
Reference-architecture currency: PASS
Memory-key parity: PASS (6 keys across 3 stacks)
Feature parity: PASS
Step-text parity: PASS (177 step lines per stack)
```

The generated feature-parity report was written under ignored `.results/` and is not part of the review commit.

### Python suite

Command:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Working directory: `demoapp002-python-pytest-bdd`

Result: PASS

```text
46 passed, 1 warning in 1.08s
```

The warning originated in the Gherkin dependency's positional `maxsplit` use, not project code.

### TypeScript dependency audit

Command:

```powershell
npm audit --package-lock-only --audit-level=low
```

Working directory: `demoapp001-ts-cypress`

Result: PASS

```text
found 0 vulnerabilities
```

### Puzzle-data parity

SHA-256 was calculated for each stack-local `puzzles.json`.

Result: PASS

```text
DB32871059B1BF99017BDBD34F98E91B0E36E103659F419EECCB3CA48E9994AA
```

All three files produced the same digest.

### Live-source secret scan

A targeted regular-expression scan covered live tracked source/configuration while excluding lock files, archived reviews, and generated results.

Result: PASS

```text
No candidate credentials or secrets found.
```

### Python boolean boundary probe

A temporary puzzle catalogue was generated outside the repository with one valid cell replaced by JSON `true`, then loaded through `PuzzleLoader`.

Result: FAIL

```text
ACCEPTED_BOOLEAN_CELL
```

The temporary directory was automatically removed.

### Algorithm-participation probe

`Logic Squeeze Grid` was solved with audit inspection, then solved again after replacing the Python `unit_completion` method with a no-op for the lifetime of the process.

Result: FAIL against the scenario claim

```text
EVENT_ALGORITHMS=HiddenSingles,NakedSingles
ITERATIONS=2
STATUS_WITH_UNIT_COMPLETION_DISABLED=SOLVED
```

No repository file was changed by the probe.

## Skipped or Inconclusive Checks

### TypeScript full suite

Status: SKIPPED

Reason: the host provides Node 20.19.5 while [package.json](../../../../demo-apps/demoapp001-typescript-cypress/package.json) requires Node 24 and `.npmrc` enforces the range. The supported-runtime CI result was inspected instead of bypassing the gate.

### C# full suite

Status: SKIPPED

Reason: the host provides .NET SDK 9.0.316 while the project targets .NET 10. The supported-runtime CI result was inspected instead.

### Python vulnerability audit

Status: SKIPPED

Command attempted:

```powershell
.\.venv\Scripts\python.exe -m pip_audit
```

Reason: `pip-audit` is not installed in the governed project environment. No package was installed during this read-only evidence pass.

### NuGet vulnerability audit

Status: INCONCLUSIVE

Corrected command:

```powershell
dotnet list .\demoapp003-csharp-specflow.csproj package --vulnerable --include-transitive
```

Reason: execution under the unsupported .NET 9 host failed with `Sequence contains no matching element`. This is not evidence of a vulnerability or a clean audit.

### Docker Compose configuration

Status: INCONCLUSIVE

Command:

```powershell
docker compose config --quiet
```

Reason: the command exceeded the 30-second review timeout. No heavyweight container build or workload was started.

## Assurance Interpretation

The local environment fully supports the governance parity checks and Python stack. TypeScript and C# correctness is supported by the successful default-branch CI run, but their tests were not independently reproduced locally. Dependency assurance is strongest for npm, unavailable for Python in the governed environment, and inconclusive for NuGet on the unsupported host SDK. Those limitations are reflected in the grade and R5 rather than reported as passing checks.

---

Review: CODE_REVIEW_CODEX_v1_20260723T2351Z | Reviewer: AI assistant (Codex, GPT-5) | Generated: 2026-07-23T23:51Z
