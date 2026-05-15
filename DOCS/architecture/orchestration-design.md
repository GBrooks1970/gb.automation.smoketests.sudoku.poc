# Orchestration Design

**Last updated:** 2026-05-15
**Scope:** DEMOAPP001 @util execution lifecycle (build -> test -> metrics)

---

## 1. Purpose

This document defines how the Stack should be orchestrated for deterministic, repeatable execution in local development and automation runs. The current lifecycle is optimized for @util testing with no external process startup.

---

## 2. Current Lifecycle

1. Build subject app and test TypeScript artifacts:
   - `npm run build`
2. Execute full behavior suite:
   - `npm test`
3. Capture run outcome:
   - process exit code from test command
4. Persist run metrics (Phase 7 target):
   - key-value file under `.results/.metrics/`
   - markdown summary under `.results/.metrics/`

---

## 3. Orchestration Requirements

- Commands MUST run from `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/`.
- Test execution MUST use `tooling/cucumber.js` as explicit config.
- Feature source of truth remains `features_shared/` with propagated stack-local copy.
- A failed build MUST stop downstream test and metric publishing.
- Metrics generation is mandatory once Phase 7 script is added.

---

## 4. Proposed Script Contract (Phase 7)

Script location:
- `.batch/run-demoapp001.ps1`

Input parameters (initial):
- Optional tag filter (default all scenarios)
- Optional output prefix for metrics artifacts

Outputs:
- `.results/.metrics/DEMOAPP001_<timestamp>.txt`
- `.results/.metrics/DEMOAPP001_<timestamp>.md`

Required key-value metrics (minimum):
- `DEMOAPP001_BUILD_EXIT_CODE`
- `DEMOAPP001_TEST_EXIT_CODE`
- `DEMOAPP001_SCENARIOS_TOTAL`
- `DEMOAPP001_SCENARIOS_PASSED`
- `DEMOAPP001_STEPS_TOTAL`
- `DEMOAPP001_STEPS_PASSED`
- `DEMOAPP001_PENDING_TOTAL`
- `DEMOAPP001_DURATION_MS`

---

## 5. Failure Handling

- Build failure: mark orchestration failed, skip tests, still emit metrics with failure reason.
- Test failure: mark orchestration failed, emit metrics and markdown summary.
- Script-level exception: write fallback error summary and non-zero exit code.

---

## 6. Traceability

- Phase 7 backlog item: NEW-015
- Alignment reference: `DOCS/ref-arch-alignment_2026-05-14.md`
- Governing architecture: `DOCS/REFERENCE_ARCHITECTURE.md`
