---
version: 1
created: 2026-11-10T17:18:00Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-097 / TRIAGE-27
status: approved
language: en-GB
---

# Implementation plan: BACKLOG-097 / TRIAGE-27 Make Compose run the same verification as CI and pin container base images

**Goal.** Eliminate the verification and reproducibility gap between Docker Compose and GitHub Actions CI by establishing a single, unified `verify` entry point per Stack callable by both CI and `docker-compose.yml`; pinning all container base images by immutable multi-platform SHA256 digest; introducing non-root container users (`USER`) where toolchains permit; updating `docker-compose.yml` service commands; and validating execution against Docker storage on `E:\_DockerData`.

Source: Root worklist item **TRIAGE-27** (Claude review v2 Risk 10, LOW priority), tracked in the project backlog as **BACKLOG-097**.

---

## Evidence gathered before planning

Audited on 2026-11-10 on branch `worklist/triage-27-compose-ci-verification-parity` cut from `main` @ `e8d5c10`:

### 1. Existing Compose vs CI Verification Gap (Claude Review v2 Risk 10)
- `docker-compose.yml` line 7 currently defines `demoapp001-tests` command as:
  `sh -lc "npm run build && npm run lint && npm run test:api && npm test"`
  This completely omits `npm run format:check` (Prettier formatting check), `npm run verify:openapi` (Redocly OpenAPI contract linting and validation), and coverage floors (`npm run test:coverage`), all of which CI runs in `.github/workflows/ci.yml` (lines 41–66).
- `docker-compose.yml` line 23 defines `demoapp002-tests` command as bare `python -m pytest`, omitting the component coverage floor check (`python -m coverage run -m pytest tests/component && python -m coverage report`, fail_under 85%).
- `docker-compose.yml` line 28 defines `demoapp003-tests` command as `dotnet test --no-restore`, which builds and runs both `DemoApp003.ComponentTests` (30 tests) and `DemoApp003.Specs` (55 scenarios), but has no dedicated verify alias.

### 2. Floating Docker Base Image Tags
- `demo-apps/demoapp001-typescript-cypress/Dockerfile`: `FROM node:24-alpine` (floating tag, runs as root).
- `demo-apps/demoapp002-python-pytest/Dockerfile`: `FROM python:3.13-slim` (floating tag, runs as root).
- `demo-apps/demoapp003-csharp-specflow/Dockerfile`: `FROM mcr.microsoft.com/dotnet/sdk:10.0` (floating tag, runs as root).
- `docker-compose.yml` line 31: `image: mcr.microsoft.com/powershell:7.5-ubuntu-24.04` (floating tag).
- `tooling/performance/Dockerfile`: `FROM mcr.microsoft.com/dotnet/sdk:10.0` (floating tag).

### 3. Inspected Multi-Platform Image Digests (Docker Buildx)
Using `docker buildx imagetools inspect`, the active multi-platform index/manifest digests were captured:
- `node:24-alpine`: `sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8`
- `python:3.13-slim`: `sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90`
- `mcr.microsoft.com/dotnet/sdk:10.0`: `sha256:212fe4cb74627d5adf9817a4088906ae3edff1bd853bb27565d4b46731efe61e`
- `mcr.microsoft.com/powershell:7.5-ubuntu-24.04`: `sha256:042240d57ec9e47e511033b92625a8d95875ee5860af3015992c248b58a8be81`

### 4. Non-Root User Capabilities
- `node:24-alpine` provides a built-in unprivileged `node` user (UID/GID 1000). Setting `USER node` after `chown -R node:node /workspace` is fully supported.
- `python:3.13-slim` (Debian slim) supports creating a dedicated non-root user `appuser` (`useradd -m -u 1000 appuser && chown -R appuser:appuser /workspace`), enabling editable install and `.coverage` writing without root privileges.
- `mcr.microsoft.com/dotnet/sdk:10.0` provides an `app` user (UID 1654); toolchain compatibility with locked-mode restore and in-container compilation will be evaluated.

### 5. Docker Storage Compliance (`AGENTS.md`)
- Per workspace operational rules, all Docker compose image building, caching, and data operations use `E:\_DockerData\DockerDesktopWSL` on the `E:` drive.

---

## Decisions for Owner Review

### Decision 1: Establish Unified Verify Entry Points per Stack
- **Details:**
  - **DEMOAPP001:** Add `"verify": "npm run build && npm run lint && npm run format:check && npm run test:api && npm run verify:openapi && npm run test:coverage && npm test"` in `package.json`. Both `docker-compose.yml` (`demoapp001-tests`) and local developers invoke `npm run verify`.
  - **DEMOAPP002:** Add `tooling/verify.py` invoked as `python -m tooling.verify` (consistent with existing `python -m tooling.performance.benchmark`). It runs:
    1. `python -m coverage run -m pytest tests/component`
    2. `python -m coverage report` (enforcing `fail_under = 85` floor)
    3. `python -m pytest` (full suite including 55 Gherkin scenarios)
  - **DEMOAPP003:** Retain `dotnet test --no-restore` as the verified solution entry point (runs both `DemoApp003.ComponentTests` 30 tests and `DemoApp003.Specs` 55 scenarios).
- **Rationale:** Guarantees that running tests via Docker Compose enforces the exact same build, lint, formatting, contract, coverage floor, and behavioral tests as CI.
- **Recommendation:** Approve as proposed.

### Decision 2: Pin Docker Base Images by Multi-Platform SHA256 Digest
- **Details:** Pin all Docker base images to immutable multi-platform index digests:
  - DEMOAPP001: `FROM node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8`
  - DEMOAPP002: `FROM python:3.13-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90`
  - DEMOAPP003 & Performance: `FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:212fe4cb74627d5adf9817a4088906ae3edff1bd853bb27565d4b46731efe61e`
  - Parity Checks service: `image: mcr.microsoft.com/powershell:7.5-ubuntu-24.04@sha256:042240d57ec9e47e511033b92625a8d95875ee5860af3015992c248b58a8be81`
- **Rationale:** Prevents build drift and irreproducible environments across developer machines and future CI environments.
- **Recommendation:** Approve as proposed.

### Decision 3: Configure Non-Root Container Users Where Toolchain Allows
- **Details:**
  - In DEMOAPP001 Dockerfile: set `USER node`.
  - In DEMOAPP002 Dockerfile: add `useradd -m -u 1000 appuser`, ensure `/workspace` permissions, and set `USER appuser`.
  - In DEMOAPP003 Dockerfile: configure non-root user `app` if toolchain allows, or keep documented root if locked-mode SDK caching requires it.
- **Rationale:** Adheres to container security best practices and eliminates running test containers as root.
- **Recommendation:** Approve as proposed.

### Decision 4: Update `docker-compose.yml` Service Commands
- **Details:** Update service commands:
  - `demoapp001-tests`: `command: npm run verify`
  - `demoapp002-tests`: `command: python -m tooling.verify`
  - `demoapp003-tests`: `command: dotnet test --no-restore`
  - `parity-checks`: digest-pinned PowerShell image
- **Rationale:** Direct alignment between Compose and CI verification scopes.
- **Recommendation:** Approve as proposed.

---

## Acceptance Criteria

1. **Unified Verify Entry Points:** Each Stack provides an entry point that runs the complete verification suite including coverage floors.
2. **Compose Alignment:** `docker-compose.yml` service commands invoke the unified verification commands.
3. **Digest Pinning:** All 4 Dockerfiles (`demoapp001`, `demoapp002`, `demoapp003`, `tooling/performance`) and `docker-compose.yml` pin base images by multi-platform SHA256 digest.
4. **Non-Root User:** Non-root `USER` is configured where the toolchain permits.
5. **Validation:** `docker compose config` validates cleanly; all local parity gates (8/8) and documentation currency negative controls (37/37) pass.

---

## Execution Plan

### Phase 1: Backlog & Tracking Setup
1. Mark BACKLOG-097 as `In Progress` in `DOCS/.planning/backlog.md` (Summary: 4 Open / 1 In Progress / 119 Resolved / 124 Total).
2. Commit implementation plan and index update in `worklist/triage-27-compose-ci-verification-parity`.

### Phase 2: Implement Verify Entry Points
1. Add `"verify"` script to `demo-apps/demoapp001-typescript-cypress/package.json`.
2. Add `demo-apps/demoapp002-python-pytest/tooling/verify.py` and verify execution via `python -m tooling.verify`.
3. Verify `dotnet test --no-restore` in `demo-apps/demoapp003-csharp-specflow`.

### Phase 3: Update Dockerfiles and Compose
1. Update `demo-apps/demoapp001-typescript-cypress/Dockerfile` with digest and `USER node`.
2. Update `demo-apps/demoapp002-python-pytest/Dockerfile` with digest and `USER appuser`.
3. Update `demo-apps/demoapp003-csharp-specflow/Dockerfile` with digest.
4. Update `tooling/performance/Dockerfile` with digest.
5. Update `docker-compose.yml` with pinned digests and updated service commands.

### Phase 4: Validation & Parity Gates
1. Run `docker compose config`.
2. Run `.batch/check-ra-header-currency.ps1`.
3. Run `.batch/run-parity-checks.ps1` (all 8 parity gates).
4. Run native Stack verify commands locally.

### Phase 5: Implementation PR & CI
1. Commit changes to `worklist/triage-27-compose-ci-verification-parity`.
2. Push branch and open Implementation PR for BACKLOG-097 / TRIAGE-27.
3. Monitor CI checks to green and merge with `--match-head-commit`.

### Phase 6: Outcome PR & Worklist Closure
1. Fast-forward local `main`.
2. Cut `worklist/triage-27-outcome` branch.
3. Mark BACKLOG-097 as `Resolved` in `DOCS/.planning/backlog.md` (Summary: 4 Open / 0 In Progress / 120 Resolved / 124 Total).
4. Author implementation log `DOCS/.implementation-logs/2026-11-10_triage-27-compose-ci-verification-parity.md` and index.
5. Update implementation plan status to `delivered`.
6. Open Outcome PR, monitor CI to green, merge with `--match-head-commit`.
7. Update root `WORKLIST_gb.automation.smoketests.sudoku.poc.md` with merge SHAs.

---

## Risk Analysis & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Single-arch digest breaks cross-platform runners | Build failure on ARM/AMD runners | Medium | Use multi-platform index/manifest list digests (e.g. from `docker buildx imagetools inspect`), which resolve to appropriate architecture automatically. |
| Non-root user lacks write permissions in container | Test failure (e.g. coverage file creation) | Medium | Explicitly ensure workspace ownership (`chown -R ...`) before switching `USER`. |
| Out-of-tree evidence paths in Compose verify | Script failure | Low | Use in-tree coverage validation (`test:coverage` rather than `test:coverage:ci`) in `npm run verify` so it does not depend on `../../.results` existing. |
| Parity checks or currency checks break | Gate failure | Low | No Gherkin features, step definitions, or RA normative text modified. Currency guard verified locally. |
