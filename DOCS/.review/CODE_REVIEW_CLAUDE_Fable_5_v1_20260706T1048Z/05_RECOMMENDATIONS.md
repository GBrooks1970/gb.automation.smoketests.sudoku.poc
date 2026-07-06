# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:48Z

Prioritised improvements. Action items raised here should be tracked in
`DOCS/.planning/backlog.md` per the template rule; the next free ID after
BACKLOG-047 is BACKLOG-048.

## Recommended Refactors

- **(Risk 2) Clear the npm audit high.** `npm audit fix` in
  `demo-apps/demoapp001-typescript-cypress/` (lockfile-only; `form-data`
  4.0.5 -> patched), then `npm ci && npm run build && npm run lint &&
  npm run test:api && npm test`. Smallest change, clears the only standing
  security signal. Suggested BACKLOG-048.
- **(Risk 3) Bump CI Node 20 -> 22 LTS.** One line in
  [ci.yml](../../../.github/workflows/ci.yml) (line 23) plus `@types/node`
  `^20` -> `^22` and the demoapp001 Dockerfile base image if it pins 20.
  Suggested BACKLOG-049.
- **(Risk 1) Decide the SpecFlow/Reqnroll position.** Structural, so DR
  required. Recommended: migrate DEMOAPP003 to Reqnroll (package swap +
  namespace change + regenerate the feature code-behind), then schedule
  `net8.0` -> `net10.0` before .NET 8 EOL (2026-11-10). Alternative: a DR that
  documents the freeze and its support boundary. Suggested BACKLOG-050.
- **(Risk 7) Strengthen the ordering / no-execution assertions.** Use the
  audit trail (0 iterations / 0 events for the already-solved scenario, event
  sequence for ordering). Canonical-feature-first procedure applies; propagate
  to all three stacks in one change. Suggested BACKLOG-051 (Low, unhurried).

## Next Steps

- Add a LICENSE file (or rewrite the README licence section) and align
  `package.json` / `pyproject.toml` metadata (Risk 4).
- Fold the documentation-currency fixes into one docs PR: CHANGELOG entries
  for SUD-09..13 + BACKLOG-010 correction (Risk 5), decision-register header
  RA v1.14 -> v1.15 (Risk 6), README repository tree refresh (Risk 8), and the
  stale "Next Review Date" in the backlog footer (I-3).
- Consider a two-line header-currency grep in `.batch/run-parity-checks.ps1`
  (assert the register and backlog headers cite the active RA version) - this
  class of drift has now recurred three times (BACKLOG-028, SUD-11, Risk 6).
- Reconcile this review's findings into the backlog per the template rule
  ("add action items before closing the session") - the review itself is
  read-only once merged.

## Future Project Ideas

- **Reqnroll as a fourth-stack case study:** rather than replacing DEMOAPP003
  in place, a `demoapp004-csharp-reqnroll` onboarding would exercise the RA's
  onboard-a-new-stack how-to and prove the parity gates catch nothing - then
  retire the SpecFlow stack. More work, more pedagogical value; the in-place
  migration is the pragmatic default.
- **Puzzle-data parity check:** extend the parity script family to diff the
  three `puzzles.json` copies (or hoist to a shared `data/` location per RA
  section 5.6) before BACKLOG-016 (Puzzle Generator) starts writing new data.
- **BACKLOG-014/015/016 remain the product roadmap** (advanced techniques ->
  tutor -> generator, in dependency order). BACKLOG-014's acceptance criteria
  already encode the canonical-first and parity constraints correctly; no
  change recommended.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1048Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
