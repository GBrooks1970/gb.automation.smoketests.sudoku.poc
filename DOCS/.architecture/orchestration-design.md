# Orchestration Design

**Last updated:** 2026-05-16
**Scope:** DEMOAPP001 @util execution lifecycle (build → test → metrics → parity)

---

## 1. Purpose

This document defines how the Stack should be orchestrated for deterministic, repeatable execution in local development and automation runs. The current lifecycle is optimized for @util testing with no external process startup.

---

## 2. Current Lifecycle

1. Build subject app and test TypeScript artifacts:
   - `npm run build` (from `demo-apps/demoapp001-typescript-cypress/`)
2. Execute full behavior suite:
   - `npm test`
3. Capture run outcome:
   - process exit code from test command
4. Persist run metrics:
   - key-value file: `.results/.metrics/DEMOAPP001_<timestamp>.txt`
   - markdown summary: `.results/.metrics/DEMOAPP001_<timestamp>.md`

The orchestration script is `.batch/run-demoapp001.ps1`.

---

## 3. Orchestration Requirements

- Commands MUST run from `demo-apps/demoapp001-typescript-cypress/`.
- Test execution MUST use `tooling/cucumber.js` as explicit config.
- Feature source of truth remains `features-shared/` with propagated stack-local copy.
- A failed build MUST stop downstream test and metric publishing.
- Metrics are written on every run regardless of test outcome.

---

## 4. Script Contract

**Script:** `.batch/run-demoapp001.ps1`

**Input parameters:**
- `$Tags` (optional): Cucumber tag filter (default: all scenarios)
- `$Suite` (optional): label used in metric key prefix (default: `BDD`)
- `$RetentionDays` (optional): log retention window in days (default: 7)

**Outputs:**
- `.results/.metrics/DEMOAPP001_<timestamp>.txt` — key-value metrics
- `.results/.metrics/DEMOAPP001_<timestamp>.md` — markdown summary (preserved beyond retention)
- `.results/logs/DEMOAPP001_build_<timestamp>.log`
- `.results/logs/DEMOAPP001_test_<timestamp>.log`

**Metric key format:**

```
DEMOAPP001_BDD_ExitCode=<0|non-zero>
DEMOAPP001_BDD_Tests=<count>
DEMOAPP001_BDD_Passed=<count>
DEMOAPP001_BDD_Failed=<count>
DEMOAPP001_BDD_Skipped=<count>
DEMOAPP001_BDD_Duration=<seconds>
DEMOAPP001_BDD_Log=<path>
DEMOAPP001_Build_ExitCode=<0|non-zero>
OverallExitCode=<0|non-zero>
```

The `DEMOAPP001` prefix is the Stack short identifier. See Section 6 for the full Stack name mapping.

---

## 5. Feature Parity Validation (RA v1.3 §9.2)

Feature parity validation checks that each canonical feature file in `features-shared/` has an up-to-date Stack-local copy. It is run separately from the main test run.

**Script:** `.batch/generate-feature-parity-report.ps1`

**How it works:**
1. For each `.feature` file under `features-shared/`, locate the Stack-local copy by filename.
2. Compare non-tag lines (tag-only lines carry Stack-local additions and are excluded).
3. Report status as `IN_PARITY`, `DRIFT`, or `MISSING`.
4. Write the report to `.results/feature-parity/FEATURE_PARITY_<timestamp>.md`.
5. Exit 0 if all files are `IN_PARITY`; exit 1 if any `DRIFT` or `MISSING`.

**Output path:** `.results/feature-parity/FEATURE_PARITY_[YYYYMMDDTHHMMZ].md`

**When to run:**
- After any change to a canonical feature file in `features-shared/`.
- After any change to a Stack-local feature copy.
- Before closing a MIG item that involves Gherkin changes.

**Stack-local path convention:** Stack-local feature files are stored flat in the Stack's `tests/features/` directory. They do not replicate the canonical `features-shared/` subdirectory structure.

---

## 6. Stack Identifier Mapping (MIG-12)

The metric key prefix uses the Stack short identifier. The mapping to full Stack names is:

| Short identifier (metrics) | Full canonical Stack name | Filesystem directory |
|---------------------------|--------------------------|---------------------|
| `DEMOAPP001` | `DEMOAPP001_TYPESCRIPT_CYPRESS` | `demo-apps/demoapp001-typescript-cypress/` |

When additional Stacks are onboarded, each MUST be assigned a distinct short identifier and both the mapping table above and the orchestration script MUST be updated.

---

## 7. Failure Handling

- Build failure: mark orchestration failed, skip tests, still emit metrics with failure reason.
- Test failure: mark orchestration failed, emit metrics and markdown summary.
- Script-level exception: write fallback error summary and non-zero exit code.

---

## 8. Results Retention (RA v1.3 §9.3)

- Default retention: 7 calendar days.
- `.results/logs/` — purge files older than retention threshold.
- `.results/.metrics/*.txt` — purge files older than retention threshold.
- `.results/.metrics/*.md` — **preserve** permanently for historical analysis.
- `.results/feature-parity/` — retain alongside metrics (same policy as `.txt` metrics).

---

## 9. Traceability

- Governing architecture: `DOCS/reference-architecture.md` v1.3
- Alignment report: `DOCS/.analysis/ref-arch-alignment_2026-05-15.md`
- Stack identifier decision: DR-016
- Feature parity process decision: MIG-10 (accepted 2026-05-16)
