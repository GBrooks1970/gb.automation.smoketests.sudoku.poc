# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

Per the project's template rule, action items arising from this review should be tracked in
`DOCS/.planning/backlog.md`. Suggested next IDs: BACKLOG-056 onwards (register footer says next
DR ID is DR-037; none of these items needs a DR).

## Recommended Refactors

- (Risk 1 -> suggest BACKLOG-056) Extend ESLint/Prettier scope to `tests/**/*.ts` and
  `tooling/**/*.ts` in DEMOAPP001; add a `files` block in `eslint.config.js` using
  `tsconfig.cucumber.json`; wire `npm run format:check` into CI beside Lint.
- (Risk 2 -> suggest BACKLOG-057) Fix `CLAUDE.md` line 229 to "DR-001 through DR-036" and add
  `CLAUDE.md` to `check-ra-header-currency.ps1`'s `$Targets`; optionally assert the DR range
  against the register footer's "Next ID".
- (Risk 3 -> suggest BACKLOG-058) Bump the compose `parity-checks` image to
  `mcr.microsoft.com/powershell:7.5-ubuntu-24.04`.
- (Risk 4 -> suggest BACKLOG-059) Add `.npmrc` with `engine-strict=true` in the DEMOAPP001
  Stack directory (or document the Node 24 floor in the Stack README prerequisites).
- (I-1, opportunistic) Replace `innerHTML` interpolation with `textContent`/DOM construction in
  `app.js` next time the web UI is touched.

## Next Steps

- Raise the four backlog items above and schedule the first two (both under an hour each);
  Risks 3-4 can ride along with any adjacent change.
- Add one line to the DEMOAPP003 README stating that local execution requires a .NET 10 SDK and
  that CI is the authoritative gate where only older SDKs are installed (I-2).
- Consider recording the structural soundness of the SUD-20 ordering assertions (02, I-3) in
  the backlog's BACKLOG-051 entry, upgrading "verified empirically" to the stronger guarantee -
  it changes future maintenance posture (new fixtures cannot break the assertion).
- Nothing else: the backlog's "no open technical debt" claim survived scrutiny, and publication
  remains a separate owner decision per BACKLOG-053 (correctly out of review scope).

## Future Project Ideas

- The parked product futures remain the right shape: advanced techniques (BACKLOG-014) would
  exercise the ordering-invariant machinery further; the puzzle generator (BACKLOG-016) would
  make the fixture set adversarial rather than curated.
- If API parity for Python/C# is ever promoted from roadmap, the OpenAPI contract already
  exists as the cross-stack contract test source - consider contract-testing (e.g. schemathesis
  or equivalent) rather than re-writing endpoint tests per Stack.
- A tiny mutation-testing pass on `SudokuSolver` (any one Stack) would be a high-credibility
  pedagogical annex: the ordering invariants and per-digit scans are exactly where mutants
  survive naive suites.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
