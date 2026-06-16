# Annex - Validation Log

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Next: Screenplay Parity ->](SCREENPLAY_PARITY.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

This annex records the exact validation performed during the review. All commands were run from
the repository root or the noted stack directory. Docker was **not** started (out of scope per the
review instructions). No implementation files were modified; the only file written outside this
review directory was the gitignored parity report under `.results/`.

---

## Toolchain available on the review host

| Tool | Version |
|------|---------|
| Node.js | v20.19.5 (CI pins Node 20 for DEMOAPP001) |
| npm | 10.8.2 |
| Python | 3.13.1 (CI pins 3.13) |
| .NET SDK | 9.0.315 (CI pins .NET 8; net8.0 target built and tested fine under the 9.x SDK) |
| PowerShell | 7.5.5 (`pwsh`) |

## Gates resolved (per registry-row gates - multi-stack, no root package.json)

The project's registry row records "no root `package.json` - per `ci.yml`, three stack jobs plus
the `.batch/*.ps1` parity scripts; run the job(s) for the stack(s) touched." This is a review (no
stack touched), so all three stacks plus all three parity scripts were exercised.

| Command (dir) | Result |
|---------------|--------|
| `npm run build` (demoapp001-typescript-cypress) | PASS - `tsc` exit 0 |
| `npm run lint` (demoapp001-typescript-cypress) | PASS - eslint exit 0, no output |
| `npm run test:api` (demoapp001-typescript-cypress) | PASS - "API integration tests: PASS" |
| `npm test` (demoapp001-typescript-cypress) | PASS - 46 scenarios (46 passed) / 257 steps (257 passed) |
| `python -m pytest -q` (demoapp002-python-pytest) | PASS - 46 passed (one third-party `gherkin` DeprecationWarning, not project code) |
| `dotnet test` (demoapp003-csharp-specflow) | PASS - Failed: 0, Passed: 46, Total: 46 (net8.0) |
| `.batch/check-memory-key-parity.ps1` | PASS - all 6 keys OK in all three stacks; "Memory key parity: PASS" |
| `.batch/check-step-text-parity.ps1` | PASS - 177 step lines match per stack; "Step text parity: PASS" |
| `.batch/generate-feature-parity-report.ps1` | PASS - "Overall result: PASS" |

## Feature-body drift checks (tag-stripped diff vs canonical)

| Stack | Result |
|-------|--------|
| DEMOAPP001 | identical to canonical |
| DEMOAPP002 | identical to canonical |
| DEMOAPP003 | identical to canonical |

## Cross-check against the backlog baseline

The backlog ([DOCS/.planning/backlog.md](../../../.planning/backlog.md) line 36) claims:
"DEMOAPP001: 46 scenarios / 257 steps passing; DEMOAPP001 REST API integration PASS; DEMOAPP002:
46 pytest-bdd scenarios passing; DEMOAPP003: 46 SpecFlow scenarios passing; 3-Stack parity PASS."
**Every claim was independently reproduced in this review.** The backlog's declared baseline is
accurate.

## Notes

- The `.results/feature-parity/FEATURE_PARITY_*.md` artefact produced by the parity report is under
  the gitignored `.results/` tree; `git status` remained clean after all runs.
- The DEMOAPP002 pytest warning originates in the third-party `gherkin` package
  (`gherkin_line.py:79`, positional `maxsplit` deprecation), not in project code; informational
  only.
- The C# stack target is `net8.0`; it built and ran cleanly under the host's .NET 9 SDK, so the
  result is representative though the SDK major differs from CI's pinned .NET 8.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Next: Screenplay Parity ->](SCREENPLAY_PARITY.md)
