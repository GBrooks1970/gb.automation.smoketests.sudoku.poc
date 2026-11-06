# Recommendations

[<- Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

---

## Recommended Refactors

- **Make the audit summary truthful under policy errors (Risk 2).** In [.batch/evaluate-dependency-audit.ps1](.batch/evaluate-dependency-audit.ps1) (line 290), always classify findings, and let only the final `status` reflect policy errors. Add one negative control asserting "policy error + high finding => blocking >= 1".
- **Bind or reword parameter-blind steps, and give the three empty Then steps real observations (Risk 3).** Use `LAST_ERROR` for "no errors should occur" and the DR-037 attempt events for "the main loop should exit". For the X-Wing and Naked Pair Givens, either select fixtures from their parameters or remove the numbers from the canonical text, under a DR. TRIAGE-15 already scopes half of this, so widen it to include the empty Then bodies.
- **Anchor DEMOAPP003 fixture data and stop swallowing loader errors (Risk 5).** Copy `puzzles.json` to the output, pass an absolute path from `SudokuActors.cs`, bound or remove the upward walk in [app_src/PuzzleLoader.cs](demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs) (lines 41-63), and rethrow the captured error from `LoadPuzzles` getters.
- **Remove the double decode on `/api/visualise/:name` (Risk 4)** and add a `%25` integration case to both name routes.
- **Run the mutation controls on a temporary copy (Risk 9)**, reusing the GUID-temp-fixture pattern already in `test-documentation-currency.ps1`.

## Next Steps

1. **Unblock CI (Risks 1, 2), one PR.** Remove the expired exception. Bring the DEMOAPP001 lockfile up to date (body-parser, fast-uri, qs, follow-redirects as far as patched releases allow). Refresh `requirements-test.lock` for certifi/filelock/msgpack. For anything still unpatched, take a fresh owner-approved, at most 14-day DR-039 exception. Run all three audit lanes locally with `.batch/invoke-dependency-audit.ps1 -EvidenceRoot <temp>` before pushing. Then rebase or close Dependabot PRs #95-#97.
2. **Record the state honestly (Risk 6).** Add an `Open` backlog item for the step above, and list TRIAGE-10 and TRIAGE-15 as backlog candidates so the canonical backlog matches the root worklist. Ask the registry owner to correct `registry.yml` line 134.
3. **Add a weekly scheduled audit run, plus job timeouts and concurrency (Risk 8)**, so time-bound policy cannot lapse silently again.
4. **Quick documentation fixes (Risks 7, 11).** Feature narrative to five techniques (under a DR). CLAUDE.md Stack-tag line and "Add a Puzzle" to all three copies. A `puzzles.json` hash check in `run-parity-checks.ps1`. A one-line legacy-name note in the root README. Untrack `.claude/settings.local.json`.
5. **Index this review (and the parallel Codex v3 review) in `DOCS/.review/README.md` and `DOCS/README.md`** when they are committed, otherwise `check-ra-header-currency.ps1` stays red.

## Future Project Ideas

- **Persistent candidate grid (Risk 12).** Model pencil marks as first-class state, so Naked Pairs and X-Wing eliminations compound. Then add Swordfish and XY-Wing as a parity exercise. This would be an excellent teaching increment because each Stack must evolve its Screenplay Questions to expose candidates.
- **Scenario-level parity diff on the parity page.** Show, per scenario, which Then bindings carry a real assertion in each Stack (static analysis of empty bodies). That turns Risk 3 into a visible, gated metric.
- **Port the REST API to DEMOAPP002 (FastAPI) and DEMOAPP003 (minimal API) against the same OpenAPI document**, and run one contract suite against all three. The staged-capability roadmap already anticipates this, and it would make the repo a strong contract-testing exemplar.
- **Property-based tests on the solver** (fast-check / Hypothesis / FsCheck). Assert that no technique ever produces a constraint violation on generated valid partial grids. This complements the example-based Gherkin and fits the multi-Stack theme.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
