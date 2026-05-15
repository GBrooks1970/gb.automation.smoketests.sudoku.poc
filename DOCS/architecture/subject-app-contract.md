# Subject Application Contract

**Last updated:** 2026-05-15
**Subject application:** Sudoku solver and orchestration classes in `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/app_src/`

---

## 1. Surface Type Inventory

| Stack | Surface | Entry point | Notes |
|-------|---------|-------------|-------|
| DEMOAPP001_TYPESCRIPT_CYPRESS | @util | TypeScript class imports from `app_src/` | Current production test surface |
| DEMOAPP001_TYPESCRIPT_CYPRESS (future mode) | @cli | `npm start` (`app_src/index.ts`) | Potential future parity mode |

---

## 2. @util Surface Contract

A `@util` surface tests logic in-process without spawning a live application process.

| Requirement | Status | Notes |
|-------------|--------|-------|
| Subject classes importable directly | ✅ | Tests execute with `ts-node` and import from `app_src/` through Abilities |
| Public methods deterministic for given inputs | ✅ | Solver/orchestrator behavior is deterministic in current suite |
| No global mutable state shared between scenarios | ✅ | New actor ability instances per scenario and solver deep-copy semantics |
| Each scenario creates fresh instances | ✅ | `InitialiseGrid` and `LoadPuzzleByName` create fresh solver state |

---

## 3. @cli Surface Contract

| Requirement (RA §6.3) | Status | Notes |
|-----------------------|--------|-------|
| Invokable as single command | ✅ | `npm start` |
| Documented argument/option interface | ❌ | No formal CLI argument contract or `--help` yet |
| Exit code 0 for success, non-zero for failure | ❌ | Current implementation does not enforce exit code map |
| Human-readable output to stdout | ✅ | CLI prints grids and solve status |
| Error detail to stderr | ❌ | Errors are not consistently routed to `console.error` |
| Deterministic output for given inputs | ✅ | Output is deterministic for fixed puzzle data |
| Documented time bound | ❌ | No timeout parameter or formal run bound |

---

## 4. @api Surface Contract

Not applicable for current project scope.

---

## 5. @ui Surface Contract

Not applicable for current project scope.

---

## 6. Known Gaps

| Requirement | Gap | Mitigation / Deferred to |
|-------------|-----|--------------------------|
| @cli documented argument interface | Missing help/options contract | Phase 8 (CLI hardening) |
| @cli exit code mapping | Missing success/failure code policy | Phase 8 (CLI hardening) |
| @cli stderr routing | Missing dedicated error channel | Phase 8 (CLI hardening) |
| @cli time-bound behavior | Missing timeout contract | Phase 8 (CLI hardening) |

---

## 7. Compliance Sign-Off

| Item | Verified by | Date |
|------|-------------|------|
| Surface contract documented for active @util mode | GitHub Copilot | 2026-05-15 |
| Known CLI gaps recorded and deferred | GitHub Copilot | 2026-05-15 |

---

Template source: `../templates/TEMPLATE_Subject_App_Contract.md`
