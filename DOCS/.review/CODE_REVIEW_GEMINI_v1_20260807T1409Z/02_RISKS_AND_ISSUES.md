# Risks and Issues

[<- Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_GEMINI_v1_20260807T1409Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)

**Reviewer:** AI assistant (Gemini)  
**Date:** 2026-08-07T14:09Z  

## Priority Risk Register

### Risk 1: Staged Multi-Stack Capability Asymmetry in HTTP/OpenAPI API Surface

- **Severity:** Medium
- **Risk Description:** DEMOAPP001 (TypeScript) features an Express REST API, OpenAPI 3.0 specification (`docs/openapi.yaml`), Redocly linting, and Supertest response validation (DR-035). DEMOAPP002 (Python) and DEMOAPP003 (C#) operate strictly as in-process `@util` surface implementations without local HTTP endpoints. While documented as a staged capability in §6.1 of [sudoku-solver-platform-specification.md](DOCS/.design/sudoku-solver-platform-specification.md), HTTP surface parity is currently asymmetric across stacks.
- **Evidence:**
  - [sudoku-solver-platform-specification.md](DOCS/.design/sudoku-solver-platform-specification.md) (line 125)
  - [demo-apps/demoapp001-typescript-cypress/app_src/api/server.ts](demo-apps/demoapp001-typescript-cypress/app_src/api/server.ts) (line 1)
  - [demo-apps/demoapp002-python-pytest/README.md](demo-apps/demoapp002-python-pytest/README.md) (line 15)
  - [demo-apps/demoapp003-csharp-specflow/README.md](demo-apps/demoapp003-csharp-specflow/README.md) (line 15)
- **Impact Analysis:** Cross-stack HTTP API contract testing cannot be performed against Python or C# stacks, restricting public API demo capabilities to TypeScript.
- **Refactor Recommendation:** Retain the current staged capability matrix per governance, but draft reference OpenAPI wrappers for Python (FastAPI) and C# (ASP.NET Core Minimal API) in `DOCS/.design/` for future roadmap implementation.

---

### Risk 2: Multi-Stack Parity Tooling Relies Exclusively on PowerShell (`pwsh`)

- **Severity:** Medium
- **Risk Description:** Cross-stack parity verification scripts (`.batch/check-memory-key-parity.ps1`, `.batch/check-step-text-parity.ps1`, `.batch/check-ra-header-currency.ps1`, `.batch/generate-feature-parity-report.ps1`) are written in PowerShell. Developers on Linux/macOS environments who do not have `pwsh 7+` installed locally must rely on Docker Compose to execute parity gates.
- **Evidence:**
  - [.batch/run-parity-checks.ps1](.batch/run-parity-checks.ps1) (line 1)
  - [README.md](README.md) (line 324)
  - [docker-compose.yml](docker-compose.yml) (line 35)
- **Impact Analysis:** Minor developer workflow friction for non-Windows contributors attempting to run fast local pre-commit checks without Docker.
- **Refactor Recommendation:** Author a lightweight cross-platform Python or Node.js script in `tooling/` that implements step-text and memory-key regex checking natively without shell dependencies.

---

### Risk 3: Long-Standing Open Backlog Items Parked in "Future" State

- **Severity:** Low
- **Risk Description:** Three core solver and product enhancement items — BACKLOG-014 (Advanced Solving Techniques), BACKLOG-015 (Interactive Sudoku Tutor), and BACKLOG-016 (Puzzle Generator) — remain Open in [DOCS/.planning/backlog.md](DOCS/.planning/backlog.md) without targeted milestone schedules.
- **Evidence:**
  - [DOCS/.planning/backlog.md](DOCS/.planning/backlog.md) (lines 435-437)
  - [sudoku-solver-specification.md](DOCS/.design/sudoku-solver-specification.md) (§7)
- **Impact Analysis:** Future product ideas sit alongside resolved backlog items; could cause mild ambiguity regarding solver capabilities for hard/expert puzzles.
- **Refactor Recommendation:** Maintain items as Open per governance (DR-040 explicitly bounds static evidence away from BACKLOG-014..016), but mark them with explicit `[Parked-Future]` status indicators in `DOCS/.planning/backlog.md`.

---

### Risk 4: Lack of Automated Mutation Testing in Python and C# Stacks

- **Severity:** Low
- **Risk Description:** DEMOAPP001 (TypeScript) includes a 10/10 killed mutation trial (DR-038), whereas DEMOAPP002 (Python) and DEMOAPP003 (C#) enforce line/branch coverage floors (85% combined and 80% respectively) without automated mutation test tools (`mutmut` or `Stryker.NET`) in CI.
- **Evidence:**
  - [DOCS/.analysis/coverage-and-mutation-policy-20260728.md](DOCS/.analysis/coverage-and-mutation-policy-20260728.md) (line 1)
  - [decision-register.md](decision-register.md) (DR-038)
  - [.github/workflows/ci.yml](.github/workflows/ci.yml) (lines 114-220)
- **Impact Analysis:** Coverage floors confirm code execution but do not verify assertion sensitivity against logic mutations in Python and C#.
- **Refactor Recommendation:** Add diagnostic mutation test steps using `mutmut` (Python) and `Stryker.NET` (C#) to complement the TypeScript mutation baseline.

---

### Risk 5: Historical Proposal Documents Retained Beside Active Standards

- **Severity:** Informational
- **Risk Description:** `DOCS/.design/rest-api-wrapper.md` remains in the design directory as a historical proposal, while `docs/openapi.yaml` and Express REST implementation in DEMOAPP001 are governed by DR-035.
- **Evidence:**
  - [DOCS/.design/rest-api-wrapper.md](DOCS/.design/rest-api-wrapper.md) (line 1)
  - [README.md](README.md) (line 97)
  - [decision-register.md](decision-register.md) (DR-035)
- **Impact Analysis:** Minor documentation overlap for reviewers comparing historical proposals against active OpenAPI specifications.
- **Refactor Recommendation:** Update header notice in `rest-api-wrapper.md` to explicitly state it is superseded as implementation authority by DR-035 and `docs/openapi.yaml`.

---
[<- Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_GEMINI_v1_20260807T1409Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)
