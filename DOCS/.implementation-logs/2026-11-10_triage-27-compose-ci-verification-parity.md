# Implementation Log: BACKLOG-097 / TRIAGE-27 Make Compose run the same verification as CI and pin container base images

**Date:** 2026-11-10T20:50:00Z
**Session goal:** Align Docker Compose verification with GitHub Actions CI by establishing unified `verify` entry points across all three Stacks (`npm run verify` in DEMOAPP001, `python -m tooling.verify` in DEMOAPP002, and `dotnet test --no-restore` in DEMOAPP003), pinning container base images by immutable multi-arch SHA256 digests in Dockerfiles and `docker-compose.yml`, configuring non-root unprivileged container users (`USER node`, `USER appuser`), updating `docker-compose.yml` service commands, and verifying clean local execution against Docker storage on `E:\_DockerData`.
**Outcome:** Completed (PR #133 / `52a4ad7`)

---

## 1. Primary Request and Intent

**What was asked:** Deliver root worklist item TRIAGE-27 (Claude review v2 Risk 10, LOW priority), tracked in the project backlog as BACKLOG-097. Under the owner-approved implementation plan (Decisions 1–4):
- Establish unified verification entry points across all three Stacks:
  - DEMOAPP001: `"verify"` script in `package.json` covering build, lint, formatting check, API integration, OpenAPI schema validation, 113 component tests, and 55 Cucumber scenarios.
  - DEMOAPP002: Cross-platform runner `tooling/verify.py` (`python -m tooling.verify`) running component tests with 85% coverage floor enforcement, coverage report, and the 55-scenario pytest-bdd test suite.
  - DEMOAPP003: Solution-level `dotnet test --no-restore` executing 30 component tests and 55 Reqnroll scenarios.
- Digest-pin container base images across all Dockerfiles and `docker-compose.yml` using multi-arch SHA256 digests (`node:24-alpine`, `python:3.13-slim`, `mcr.microsoft.com/dotnet/sdk:10.0`, `mcr.microsoft.com/powershell:7.5-ubuntu-24.04`).
- Configure non-root unprivileged container users where supported (`USER node` in DEMOAPP001, `USER appuser` with UID/GID 10001 in DEMOAPP002) with appropriate workspace directory ownership.
- Update `docker-compose.yml` service commands to invoke the unified verify entry points.
- Refreshed portable source hash in `DOCS/.analysis/2026-10-07-component-execution-inventory.json` for DEMOAPP001 `package.json`.
- Validate with `docker compose config`, local Stack verify commands, `.batch/check-ra-header-currency.ps1`, and `.batch/run-parity-checks.ps1` (all 8 parity gates).

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Establish unified `verify` entry points per Stack | Closes the gap between CI verification and local `docker compose run` verification identified in Claude review v2 Risk 10 | None required (operational tooling & parity hardening) |
| Pin container base images by multi-arch SHA256 digests | Guarantees container reproducibility across platforms and runner architectures without pinning to a single host architecture | None required |
| Configure non-root users (`USER node`, `USER appuser`) | Follows container security best practices by eliminating unnecessary root execution in application containers | None required |
| In-tree coverage reporting without experimental tracer in DEMOAPP001 verify | Experimental V8 tracer adds CPU latency causing wall-clock timing tests (< 150ms) to fail on Windows; standard test runner reliably validates all 113 component tests and 55 Cucumber scenarios | None required |

---

## 3. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `demo-apps/demoapp002-python-pytest/tooling/verify.py` | Cross-platform verify entry point running component tests with coverage floor, coverage reporting, and pytest-bdd suite |
| `DOCS/.implementation-plans/2026-11-10-triage-27-compose-ci-verification-parity.md` | Approved implementation plan with Delivered outcome |
| `DOCS/.implementation-logs/2026-11-10_triage-27-compose-ci-verification-parity.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `demo-apps/demoapp001-typescript-cypress/package.json` | Added `"verify"` script chain; recomputed source hash in inventory |
| `demo-apps/demoapp001-typescript-cypress/Dockerfile` | Pinned `node:24-alpine` by digest; added `USER node` with chown |
| `demo-apps/demoapp002-python-pytest/Dockerfile` | Pinned `python:3.13-slim` by digest; created `appuser` (UID 10001) and added `USER appuser` |
| `demo-apps/demoapp003-csharp-specflow/Dockerfile` | Pinned `mcr.microsoft.com/dotnet/sdk:10.0` by digest |
| `tooling/performance/Dockerfile` | Pinned `node:24-alpine` by digest |
| `docker-compose.yml` | Pinned `powershell:7.5-ubuntu-24.04` by digest; updated service commands for DEMOAPP001 (`npm run verify`) and DEMOAPP002 (`python -m tooling.verify`) |
| `DOCS/.analysis/2026-10-07-component-execution-inventory.json` | Updated portable source hash for DEMOAPP001 `package.json` |
| `CHANGELOG.md` | Added BACKLOG-097 entry under `[Unreleased] > Changed` |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-097 Resolved; updated sprint focus, summary counts (4 Open / 0 In Progress / 120 Resolved / 124 Total), and detailed section |
| `DOCS/.implementation-plans/_index.md` | Updated BACKLOG-097 entry to Delivered with merge metadata |
| `DOCS/.implementation-logs/README.md` | Indexed new implementation log |

---

## 4. Verification

- `docker compose config`: PASS (YAML schema and service configurations valid).
- DEMOAPP001 `npm run verify`: PASS (113 component tests, 55 Cucumber scenarios / 309 steps, lint, format:check, API integration, and OpenAPI validation clean).
- DEMOAPP002 `python -m tooling.verify`: PASS (30 component tests, 88.98% coverage exceeding 85% floor, 55 pytest-bdd scenarios clean).
- DEMOAPP003 `dotnet test --no-restore`: PASS (30 component tests, 55 Reqnroll scenarios clean).
- `.batch/check-ra-header-currency.ps1`: PASS (Active RA version: v1.16; accepted range DR-001 through DR-052; inventory hashes match).
- `.batch/test-documentation-currency.ps1`: PASS (37/37 negative controls rejected).
- `.batch/run-parity-checks.ps1`: PASS (all 8 parity gates clean: RA currency, doc currency, audit policy, CI evidence, memory keys, feature parity, step text parity, puzzles parity).
- Implementation PR [#133](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/133) merged cleanly as `52a4ad7` after all 5 CI jobs passed (run 42899452106).
