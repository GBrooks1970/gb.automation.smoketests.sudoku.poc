# Risks and Issues

Numbered high to low priority.

---

## Risk 1 -- Python Stack Documentation Deficit

* **Risk Description**: The Python pytest-bdd Stack (`demoapp002-python-pytest`) does not have a local `docs/` subdirectory. In contrast, both the TypeScript (`demoapp001`) and C# (`demoapp003`) stacks provide robust local directories documenting their architecture, QA strategies, and screenplay-guides.
* **Evidence**: Absence of any directory matching `demo-apps/demoapp002-python-pytest/docs/`.
* **Impact**: Decreases codebase navigability for pure Python QA engineers. A new engineer looking at the Python stack as their starting point lacks a local screenplay-guide and architecture description, violating complete multi-stack document distribution parity.
* **Recommendation**: Create a `docs/` folder in `demo-apps/demoapp002-python-pytest/` enclosing:
  - `README.md`
  - `architecture.md`
  - `qa-strategy.md`
  - `screenplay-guide.md`
  These should mirror the structured contents found in [demo-apps/demoapp003-csharp-specflow/docs/README.md](demo-apps/demoapp003-csharp-specflow/docs/README.md) and [demo-apps/demoapp001-typescript-cypress/docs/README.md](demo-apps/demoapp001-typescript-cypress/docs/README.md).

---

## Risk 2 -- CI Parity Verification Deficit

* **Risk Description**: The repository has solid local PowerShell verification mechanisms, specifically `.batch/check-memory-key-parity.ps1` and `.batch/check-step-text-parity.ps1`. These scripts successfully validate cross-cutting rules. However, they are run only inside the containerized `parity-checks` service and are not verified as standard automation steps in `.github/workflows/ci.yml`.
* **Evidence**: Inspection of `.github/workflows/ci.yml` shows compile, lint, and Cypress test segments, but lacks dedicated steps running these parity scripts directly.
* **Impact**: If a developer pushes a code modification directly to the default branch that violates memory key naming rules or alters step text in one of the local feature files without using Docker compose, the standard CI pipeline will pass without failing on structural drift.
* **Recommendation**: Add a dedicated validation step in the GitHub Actions configuration to invoke both `.batch/check-memory-key-parity.ps1` and `.batch/check-step-text-parity.ps1`.

---

## Risk 3 -- Host Resource Starvation under Heavy WSL Operations

* **Risk Description**: Standard WSL2 instances have heavy memory footprints. Under resource-constrained situations (e.g. host machines with low free physical RAM), image building via BuildKit or heavy package installations (like standard `node:20-bookworm` container layers) can result in silent compiler crashes, input/output errors, or completely frozen WSL engines.
* **Evidence**: Physical host check returned only ~721 MB out of 16 GB of free virtual memory during compilation runs, causing Node services to hang and WSL pipes to silently collapse before switching to Node Alpine.
* **Impact**: Intermittent local setup failures and pipeline timeouts that are environment-dependent rather than codebase-driven, affecting developer workflows.
* **Recommendation**: Ensure developers are instructed (via [CLAUDE.md](CLAUDE.md) and root `README.md`) to run `wsl --shutdown` to flush Virtual Machine filesystem allocations if they encounter unresponsive Docker builds. Maintain strict use of Alpine bases (`node:20-alpine`) and minimal Python/dotnet environments to limit container overhead.
