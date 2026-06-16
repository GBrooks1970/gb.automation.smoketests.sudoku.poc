# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Next: Validation Log ->](ANNEX/VALIDATION_LOG.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

The template's three standard migration plans are assessed against this repo's actual state. Two
are already delivered (status reported, not proposed); one is a small, optional forward step.

---

## Plan 1 - Single Source of Truth for Features (DELIVERED; maintenance only)

- **Status: already in place.** `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`
  is the canonical source; the three stack copies are propagations carrying only a local stack tag.
- This review confirmed the three stack bodies are byte-identical to the canonical (tag-stripped
  diff) and that the feature-parity report runs PASS.
- The documented update procedure (CLAUDE.md "Canonical Feature Update Procedure") keeps
  propagation disciplined: edit canonical first, copy to stack, keep tags scoped.
- Step-text parity is gated in CI (`check-step-text-parity.ps1`, 177 lines/stack match), so drift
  is caught mechanically.
- **Remaining work:** none structural. Optional: derive the README scenario count from the parity
  report so docs cannot drift from the feature store (Risk 2).
- **Risk if neglected:** low - the gate already prevents silent feature drift.

## Plan 2 - Docker Compose for Local Development (DELIVERED)

- **Status: already in place** (BACKLOG-010, DR-033). The repo ships a multi-stack Compose setup
  with per-stack test services, a parity-checks service, an API profile, and a benchmark profile
  (documented in README "Repository-Level Commands" and CLAUDE.md).
- Compose covers Alpine/slim/SDK-based images across the three stacks and aggregates parity and
  benchmarking runs.
- This review did **not** start Docker (out of scope per instructions), so the Compose services
  were not exercised here; their existence and wiring are confirmed from the manifests and docs.
- **Remaining work:** none required. If pursued, a CI smoke of `docker compose config` would
  guard the manifest against drift, but it is optional.
- **Risk if neglected:** low - Compose is a developer convenience, not a correctness gate.

## Plan 3 - GitHub Actions / CI Workflow (DELIVERED; one optional hardening)

- **Status: in place and current** (BACKLOG-004, SUD-08). Three stack jobs on `pull_request` /
  `push(main,master)` / `workflow_dispatch`; DEMOAPP001 runs build/lint/test:api/test plus the
  three parity gates; action pins are Node-24-compatible majors.
- Local reproducibility is good: each job mirrors the documented per-stack commands, and the parity
  gates are runnable locally via `pwsh`.
- **Optional hardening (Risk 5):** add a single aggregate `gate` job (`needs:` all three) as the
  one stable required check, and document the `pwsh` prerequisite for local parity reproduction.
- **Secrets/artefacts:** the workflow uses no secrets (all public, no registry push from CI) and
  uploads validation artefacts with `if: always()` + `if-no-files-found: ignore` - a clean,
  low-risk artefact strategy.
- **Image strategy:** CI uses hosted `ubuntu-latest` with language setup actions and dependency
  caching (npm, pip) keyed on lockfiles; no custom images to maintain. Sound.
- **Risk if neglected:** low - the current design is correct; the aggregate job is convenience, not
  a fix.

---

## Migration verdict

All three standard migration targets are already delivered and verified (features SSOT, Docker
Compose, CI). There is no migration backlog; the only forward items are the optional CI aggregate
gate and the documentation fixes in Risks 1-5. This reinforces the close-project recommendation in
[05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md).

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Next: Validation Log ->](ANNEX/VALIDATION_LOG.md)
