# TODO: Docker Compose for Local Development

**Created:** 2026-05-24T00:00:00Z
**Last Updated:** 2026-05-28T00:00:00Z
**Backlog Reference:** BACKLOG-010 (Docker Compose for Local Development)
**Stack(s):** DEMOAPP001_TYPESCRIPT_CYPRESS, DEMOAPP002_PYTHON_PYTEST, DEMOAPP003_CSHARP_SPECFLOW
**Status:** In Progress

> Updated 2026-05-28: Compose files and Stack Dockerfiles exist, and `docker compose config` passes. Runtime verification is still pending because the local Docker Desktop Linux engine was unavailable in this session.

---

## Current Outcomes

| Done | Status | Outcome | Evidence |
|------|--------|---------|----------|
| [x] | Complete | Root Compose file exists | `docker-compose.yml` |
| [x] | Complete | Build contexts exclude generated artifacts | Root and Stack `.dockerignore` files |
| [x] | Complete | DEMOAPP001 test service is defined | `demoapp001-tests` runs build, lint, API integration, and Cucumber tests |
| [x] | Complete | DEMOAPP001 API/Web service is defined | `demoapp001-api` profile exposes port 3000 and runs `npm run start:api` |
| [x] | Complete | DEMOAPP002 test service is defined | `demoapp002-tests` runs `python -m pytest` |
| [x] | Complete | DEMOAPP003 test service is defined | `demoapp003-tests` runs `dotnet test --no-restore` |
| [x] | Complete | Repository parity service is defined | `parity-checks` runs `.batch/run-parity-checks.ps1` |
| [x] | Complete | Benchmark Compose profile is defined | `performance-benchmarks` under `--profile benchmark` |
| [x] | Complete | Local workflow is documented | Root `README.md`, `CLAUDE.md`, and implementation log |
| [ ] | Blocked | Container runtime verification | `docker compose run --rm demoapp001-tests` cannot connect to `dockerDesktopLinuxEngine` |

---

## Verification

| Done | Status | Command / Check | Result |
|------|--------|-----------------|--------|
| [x] | Complete | `docker compose config` | PASS |
| [x] | Complete | `docker compose --profile api config` | PASS |
| [x] | Complete | `docker compose --profile benchmark config` | PASS |
| [ ] | Blocked | `docker compose run --rm demoapp001-tests` | Fails before build: Docker Desktop Linux engine pipe is unavailable |
| [ ] | Pending | `docker compose run --rm demoapp002-tests` | Requires Docker runtime |
| [ ] | Pending | `docker compose run --rm demoapp003-tests` | Requires Docker runtime |
| [ ] | Pending | `docker compose run --rm parity-checks` | Requires Docker runtime |
| [ ] | Pending | `docker compose --profile api up demoapp001-api` and `/health` check | Requires Docker runtime |
| [ ] | Pending | `docker compose --profile benchmark run --rm performance-benchmarks` | Requires Docker runtime |

---

## Remaining Work To Resolve BACKLOG-010

1. Start Docker Desktop or another Docker Engine with Compose v2.
2. Run the pending Compose test, parity, API, and benchmark services.
3. Confirm generated artifacts remain ignored.
4. Update `DOCS/.planning/backlog.md` from `In Progress` to `Resolved` after runtime verification passes.
