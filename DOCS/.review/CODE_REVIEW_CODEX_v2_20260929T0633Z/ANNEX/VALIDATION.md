# Validation and Evidence

[<- Back to Index](../00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Index ->](../00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md)

**Reviewer:** AI assistant (Codex GPT-6)
**Date:** 2026-09-29T06:33Z

## Baseline and Scope

Review evidence was gathered on 2026-09-29 against local HEAD `d1b991f75ba02291c50d1f39388f96790ebf5fe1`. Initial `git status --short` was empty. `git log --oneline -10`, file mapping and fetched-upstream diff were inspected. Upstream `aab4ed98f0cc0ac9647ed30ff1991a43ffd516b4` differs only in js-yaml override/lock updates. No pulls or branch changes occurred.

The gate source is the registry's CI-stack-job instruction, not a root npm command. This was a deliberately partial lightweight execution of those gates, not a complete CI reproduction.

## Commands and Results

| Command / scope | Result |
|---|---|
| Node / Python / dotnet version | v24.18.0 / Python 3.13.1 / SDK 9.0.318 |
| TypeScript: npx tsc --noEmit | PASS, exit 0 |
| TypeScript: npm run lint | PASS, exit 0 |
| TypeScript: npm run format:check | PASS, exit 0 |
| TypeScript: npm run test:component | PASS, 49/49; reported duration 11827.0115 ms |
| TypeScript: npm run test:api | PASS, API integration tests: PASS |
| TypeScript: npm run verify:openapi | PASS, lint and 4/4 tests; test duration 7281.0375 ms |
| TypeScript: npx cucumber-js --config tooling/cucumber.js --dry-run --format summary | PASS binding check; 55 scenarios / 309 steps skipped; 0m00.372s |
| Python: python -m pytest -q -p no:cacheprovider | PASS: progress completed 72 + 13 = 85 tests; Gherkin maxsplit deprecation warning |
| Root: .batch/check-ra-header-currency.ps1 | PASS before review creation and after index integration; 55 scenarios / 309 steps derived |
| Root: .batch/check-memory-key-parity.ps1 | PASS, six keys across three stacks |
| Root: .batch/check-step-text-parity.ps1 | PASS, 217 source step lines per stack |
| TypeScript: npm audit --json | FAIL, exit 1; one high js-yaml advisory |
| TypeScript: npm outdated --json | Exit 1 listing 16 development packages with newer releases; informational |
| Python: python -m pip_audit --version | UNAVAILABLE: No module named pip_audit |
| C#: dotnet list package --vulnerable --include-transitive --no-restore | UNAVAILABLE: SDK 9 rejects --no-restore; supported SDK 10 absent |
| Controlled generator/grader probes | Defects reproduced; see below |
| Controlled tutor-controller VM probe | Stale response applied after clear; see below |

Python test and pip-audit availability commands ran sequentially in one shell; the shell's final exit 1 belongs to missing pip_audit, not pytest. No clean dependency restore was performed. Installed-package provenance may therefore differ from a fresh locked CI environment.

## npm Audit Evidence

The returned report contains:

```json
{
  "name": "js-yaml",
  "severity": "high",
  "title": "js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources",
  "url": "https://github.com/advisories/GHSA-2883-xcg3-v3hh",
  "range": ">=4.0.0 <4.3.2"
}
```

Metadata: info 0, low 0, moderate 0, high 1, critical 0, total 1; fixAvailable true. Lockfile line 3105 is 4.3.1 at local HEAD; fetched upstream changes it to 4.3.2. The audit result is time-bound and is not a fresh scan of upstream.

Python lock constraints include pip-audit 2.10.1 and the C# project uses Reqnroll.NUnit 3.3.4 on net10.0. Manual inspection does not substitute for unavailable vulnerability scans. No CVE was invented or inferred from package age.

## Reproduction Evidence

### R2: Real service and API

From the TypeScript stack, load ts-node/register and call the service with:
```javascript
new PuzzleGeneratorService().generatePuzzle({
  seed: 'review-proof', difficulty: 'Expert', clueCount: 81, maxAttempts: 1
});
```

Observed: `{"difficulty":"Easy","clueCount":81}`. A Supertest request to `POST /api/generator/generate` with the same seed/difficulty/clueCount returned `HTTP 200 Easy 81`. The public parser ignores maxAttempts, so the HTTP path uses the service default ten attempts. This confirms the defect at both boundaries; no source files were modified.

### R3: Controlled seam

Temporarily replace `SudokuTutorService.prototype.getHint` within one Node process to return an XWing placement followed by SOLVED, invoke `gradePuzzle`, then restore the method. Observed:

```json
{"difficulty":"Easy","highestTechnique":"UnitCompletion","solveSteps":1,"isSolvable":true,"usedTechniques":["XWing"]}
```

This isolates the token-classification defect. It is not a real puzzle's measured solving history.

### R4: Controlled controller state

Load the actual tutor controller source in a Node VM after replacing only the ES-module import/export wrapper in memory; supply no-op rendering/document access and a deferred fetch. Request a hint for row `[1,2,0,4,5,6,7,8,9]`, call `clearGrid()`, resolve the old UnitCompletion response for cell (0,2), then call `applyHint()`.

Observed: `{"cell02":3,"filledCells":1}`. The cleared grid accepted an old move. No browser was launched; this is controller logic evidence, not visual/browser validation.

## Skipped and Unavailable

- Full TypeScript BDD execution and C# tests were not run; C# requires .NET 10.
- Coverage floors, mutation trial, CI evidence-policy negative controls and full feature-report generation were not rerun.
- No Docker, heavyweight infrastructure, browser E2E, fresh GitHub CI query or live Pages check was performed.
- pip-audit was absent, NuGet audit unavailable, and no dependencies/toolchains were installed.
- Dedicated full-history secret scanning and exhaustive transitive licence/legal assessment were not performed.

## Review QA and Publication Follow-Up

The bundle is ASCII-only and includes all required files/section headings, attribution, metadata, breadcrumb/footer navigation and source links with line references. Links and line bounds were checked after writing.

The documentation guard passed before the bundle and again after authorised navigation-only registration in `DOCS/.review/README.md` and `DOCS/README.md`. Both indexes link directly to the new bundle index. Integration is complete; no backlog, implementation or older review changes were made.

---

[<- Previous: Section](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md) | [Next: Index ->](../00_CODE_REVIEW_CODEX_v2_20260929T0633Z.md)
