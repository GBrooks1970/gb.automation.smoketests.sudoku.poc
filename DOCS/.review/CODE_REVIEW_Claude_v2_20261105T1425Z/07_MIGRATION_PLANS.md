# Migration Plans

[<- Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: ANNEX - Validation Evidence ->](ANNEX/VALIDATION_EVIDENCE.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

---

## Single Source of Truth for Features

- **Current status.** Done for Gherkin. `features-shared/` is canonical, the three Stack copies are byte-identical, and feature-parity and step-text-parity scripts run in CI (both PASS locally for step text).
- **Extend to test data.** Promote `puzzles.json` to a shared location (for example `features-shared/util-tests/sudoku-solver/data/puzzles.json`), or keep the three copies but gate them with a SHA-256 equality check in `run-parity-checks.ps1`. RA Section 5.6 already requires shared data to be documented in `subject-app-contract.md` and versioned independently.
- **Reconcile the tag policy.** Decide in a DR between "byte-identical copies, no Stack tags" (current practice) and "Stack tags in copies" (CLAUDE.md line 215, decision register line 296). Then update the losing documents and the step-text parity rule's wording.
- **Reconcile the literal policy.** Amend RA Section 5.6 (line 445) to permit exact behavioural literals in canonical scenarios (the BACKLOG-078 practice), or move them to `Examples` tables. Pick one so the RA's MUST is true.
- **Fix the narrative.** Update the feature description (lines 3-5) to five techniques through the canonical change procedure, and propagate it.
- **Gate assertion strength.** Add a static check that fails when a Then binding body is empty in any Stack, with an allow-list recorded in a DR. That makes "same behaviour verified" part of the single source of truth, not just "same text bound".

## Docker Compose for Local Development

- **Current status.** [docker-compose.yml](docker-compose.yml) defines three Stack test services, a `parity-checks` PowerShell container, an `api` profile and a `benchmark` profile. Not run in this review (Docker was intentionally not started).
- **Align commands with CI.** Introduce one `verify` entry point per Stack (npm script / pytest invocation / dotnet command list) that CI and Compose both call, so Compose stops running a subset (Risk 10).
- **Pin images.** Use digest-pinned base images in the three Stack Dockerfiles and `tooling/performance/Dockerfile`. Let Dependabot `docker` updates refresh them.
- **Run as non-root.** Add `USER node` for Node. For Python and .NET, add an unprivileged user after restore.
- **Keep mutation controls out of bind-mounted runs.** The `parity-checks` service bind-mounts the repo (`./:/workspace`, line 34). Never add the in-place mutation script to that service until Risk 9 is fixed.
- **Expose the API safely.** Keep the `api` profile on localhost (`127.0.0.1:3000:3000`) rather than `3000:3000`, which binds all host interfaces.

## GitHub Actions/Workflow

- **Current status.** One `CI` workflow with three Stack jobs, a parity job, a gate, and gate-after main-only Pages build/deploy. Least-privilege permissions. Red on every run since the 2026-10-12 exception expiry. Last green `main` run is 37705857943 (2026-10-08). Three Dependabot PRs (#95-#97) are blocked.
- **Step 1 (unblock).** Land the Risk 1/2 PR described in [05_RECOMMENDATIONS.md](05_RECOMMENDATIONS.md) "Next Steps" item 1. Verify all seven jobs green on the PR, then on the merge commit, per the portfolio's merge-only-on-green rule.
- **Step 2 (liveness).** Add `schedule:` (weekly) so time-bound DR-039 exceptions and newly published advisories surface without a push. Optionally add a "days until expiry" warning to `test-dependency-audit-policy.ps1`.
- **Step 3 (hardening).** Pin all actions by SHA, add `timeout-minutes` to the three Stack jobs, and add PR-scoped `concurrency` with `cancel-in-progress`.
- **Step 4 (dependency automation in-repo).** Commit a `.github/dependabot.yml` covering `npm`, `pip`, `nuget`, `github-actions` and `docker` with grouped updates. That way update policy is reviewable in the repo, rather than living only in GitHub settings (inference: none is tracked today).
- **Step 5 (scope the Python audit).** Decide whether pip-audit should audit the auditor's own dependencies (`--local`), and record the decision as a DR-039 amendment. That will settle whether the 14 current `certifi`/`filelock`/`msgpack` findings are in scope.
- **Step 6 (evidence honesty).** Ship the evaluator change from Risk 2, so the uploaded `dependency-audit-summary.json` always shows real blocking counts.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: ANNEX - Validation Evidence ->](ANNEX/VALIDATION_EVIDENCE.md)
