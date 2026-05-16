# Logging Design

**Last updated:** 2026-05-15
**Scope:** Test execution logging and future structured metrics logging for DEMOAPP001

---

## 1. Objectives

- Provide human-readable run output for fast diagnosis.
- Preserve machine-readable execution facts for trend tracking and compliance.
- Keep logging responsibilities separate from production solver logic.

---

## 2. Current Logging Behavior

Runtime and test logging currently rely on:
- Cucumber pretty formatter output to console.
- Serenity/JS integration for Screenplay execution context.
- Standard command exit codes from `npm test` and `npm run build`.

Current limitations:
- No persisted run log artifacts by default.
- No structured metrics files yet.
- No standardized naming convention for execution artifacts outside manual runs.

---

## 3. Target Logging Model

### 3.1 Console Output

- Keep concise human-readable scenario and step summary.
- Keep failures with full scenario/step context and stack trace.
- Avoid noisy debug output in normal runs.

### 3.2 Structured Metrics

Generate two artifacts per orchestrated run (Phase 7):
- Key-value metrics text file for tooling ingestion.
- Markdown summary for human review.

Storage path:
- `.results/.metrics/`

Filename pattern:
- `DEMOAPP001_<UTC_TIMESTAMP>.txt`
- `DEMOAPP001_<UTC_TIMESTAMP>.md`

---

## 4. Data Contract for Metrics

Required fields:
- Build exit code
- Test exit code
- Scenario totals, passed, failed, pending
- Step totals, passed, failed, pending
- Duration milliseconds
- Stack name, surface tag, commit hash (if available)

Optional fields:
- Tag filter used
- Environment metadata (Node version, OS)

---

## 5. Retention and Governance

- `.results/` should be gitignored for local runs unless explicitly archived.
- CI retention policy (future): keep latest N artifacts per branch.
- Any change to metric keys should be recorded in `DECISION_REGISTER.md`.

---

## 6. Implementation Plan

1. Implement `.batch/run-demoapp001.ps1` orchestration script (Phase 7).
2. Parse test output and write structured metrics.
3. Add `.results/` policy to `.gitignore`.
4. Update alignment report and backlog status after validation.

---

## 7. Traceability

- Alignment gap: RA §9 and §10.3 logging design requirement
- Backlog item: NEW-015
- Related design: `DOCS/architecture/orchestration-design.md`
