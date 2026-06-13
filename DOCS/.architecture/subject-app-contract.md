# Subject Application Contract

**Last updated:** 2026-05-28
**Subject application:** Sudoku solver and orchestration classes in active Stack `app_src/` directories

---

## 1. Surface Type Inventory

| Stack | Surface | Entry point | Notes |
|-------|---------|-------------|-------|
| DEMOAPP001_TYPESCRIPT_CYPRESS | @util | TypeScript class imports from `app_src/` | Current production test surface |
| DEMOAPP001_TYPESCRIPT_CYPRESS | @api | `npm run start:api` (`app_src/server/index.ts`) | Express REST API wrapper |
| DEMOAPP002_PYTHON_PYTEST | @util | Python imports from `app_src/` | Python Stack parity surface |
| DEMOAPP003_CSHARP_SPECFLOW | @util | C# imports from `app_src/` | C# SpecFlow parity surface |
| DEMOAPP001_TYPESCRIPT_CYPRESS (future mode) | @cli | `npm start` (`app_src/index.ts`) | Potential future parity mode |

---

## 2. @util Surface Contract

A `@util` surface tests logic in-process without spawning a live application process.

| Requirement | Status | Notes |
|-------------|--------|-------|
| Subject classes importable directly | ✅ | DEMOAPP001 uses `ts-node`; DEMOAPP002 uses Python imports from `app_src/`; DEMOAPP003 uses C# project references |
| Public methods deterministic for given inputs | ✅ | Solver/orchestrator behavior is deterministic in all active Stacks |
| No global mutable state shared between scenarios | ✅ | New actor ability instances per scenario and solver deep-copy semantics |
| Each scenario creates fresh instances | ✅ | `InitialiseGrid` and `LoadPuzzleByName` create fresh solver state in both active Stacks |

---

## 3. @cli Surface Contract

| Requirement (RA §6.3) | Status | Notes |
|-----------------------|--------|-------|
| Invokable as single command | ✅ | `npm start` |
| Documented argument/option interface | ✅ | `--help`, `--timeout <ms>`, `--timeout=<ms>` |
| Exit code 0 for success, non-zero for failure | ✅ | Exit 0 only when all puzzles are `SOLVED`; otherwise exit 1 |
| Human-readable output to stdout | ✅ | CLI prints grids and solve status |
| Error detail to stderr | ✅ | Runtime and timeout errors routed to `console.error` |
| Deterministic output for given inputs | ✅ | Output is deterministic for fixed puzzle data |
| Documented time bound | ✅ | Optional runtime limit via `--timeout` |

---

## 4. @api Surface Contract

| Requirement | Status | Notes |
|-------------|--------|-------|
| Invokable as single server command | ✅ | `npm run start:api`; `PORT` env var defaults to 3000 |
| Health check endpoint | ✅ | `GET /health` |
| Technique endpoints | ✅ | `POST /api/techniques/unit-completion`, `/hidden-singles`, `/naked-singles` |
| Full solve endpoint | ✅ | `POST /api/solve` uses `AuditLogger` for step/change tracking |
| Puzzle endpoints | ✅ | `GET /api/puzzles`, `GET /api/puzzles/:name` |
| Validation endpoint | ✅ | `POST /api/validate` reports grid conflicts |
| Request validation and error responses | ✅ | Invalid requests return structured JSON error payloads |
| OpenAPI contract | ✅ | `demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml` (DR-035); validation layering per `validation-boundaries.md` |
| API integration checks | ✅ | `npm run test:api` |

---

## 5. @ui Surface Contract

Not applicable for current project scope.

---

## 6. Known Gaps

No active contract gaps remain for the current @util surfaces, DEMOAPP001 @api surface, and the documented @cli baseline.

---

## 7. Compliance Sign-Off

| Item | Verified by | Date |
|------|-------------|------|
| Surface contract documented for active @util mode | GitHub Copilot | 2026-05-15 |
| CLI baseline contract hardened (`--help`, timeout, exit codes, stderr) | GitHub Copilot | 2026-05-15 |
| DEMOAPP002 Python @util parity surface added | Codex | 2026-05-19 |
| DEMOAPP001 REST API wrapper surface added | Codex | 2026-05-20 |
| DEMOAPP003 C# @util parity surface added | Codex | 2026-05-28 |

---

Template source: `../templates/subject-app-contract.template.md`
