# Cross-Project Analysis

[<- Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (Claude Opus 5.5)
**Date:** 2026-11-05T14:25Z

This is a single-project repository, so "cross-project" here means cross-cutting analysis within the repo: the three Stacks against each other, and the Stacks against CI, the `.batch/` governance scripts, `tools/parity-page/`, Docker and the documentation.

---

## Tool-Agnostic Tests

- Strong. The same feature bytes run under Cucumber.js, pytest-bdd and Reqnroll (MD5-identical copies), and the step-text parity script confirms each runner binds the canonical text (PASS locally).
- The parity page compares what was executed, using each runner's native result format (Cucumber JSON, pytest `--cucumberjson`, Reqnroll Cucumber Messages NDJSON). It does not trust declarations ([tools/parity-page/adapters.mjs](tools/parity-page/adapters.mjs)). The 21 tool tests pass.
- There is one gap. Parity proves that all three runners executed and passed the same scenarios. It cannot prove that they verified the same thing, because three Then bindings are empty in every Stack (Risk 3). Equal emptiness passes parity.
- DEMOAPP001's isolation is tool-coupled (it depends on the Serenity adapter), whereas DEMOAPP002 and DEMOAPP003 manage the actor lifecycle explicitly. Both approaches are valid; the difference is worth a sentence in the parity contract.

## Code-Agnostic Tests

- The specification and the Gherkin are genuinely language-neutral. Behaviour is phrased in Sudoku terms (rows, units, candidates), with no class or method names, apart from a handful of steps such as "When the PuzzleLoader is initialized" and "attempting to create a SudokuSolver", which leak implementation nouns.
- Attempt-event evidence (DR-037, [DOCS/.design/orchestration-attempt-events.md](DOCS/.design/orchestration-attempt-events.md)) gives an implementation-neutral observation channel for orchestration order. That is good practice that the empty "main loop should exit" step could reuse.
- The production solvers are near line-for-line ports (TS 633 lines, C# 658, Python 453). Being near-identical helps teaching, but it also means a design limitation is replicated as well: transient eliminations (Risk 12).

## Single Source of Truth

- Features: enforced. Canonical `features-shared/`, byte-identical Stack copies, and feature-parity and step-text checks in CI.
- Puzzle data: duplicated three times, byte-identical today but not gated, and [CLAUDE.md](CLAUDE.md) "Add a Puzzle" names only the DEMOAPP001 copy (Risk 7).
- Project state: the backlog says 0 Open, the registry says one item is open, and CI says everything is blocked. Three sources disagree (Risk 6).
- Governance wording: CLAUDE.md and DR text describe Stack tags that the byte-identical policy has removed (Risk 7).

## API Contract Compliance

- DEMOAPP001 ships OpenAPI 3.0 ([docs/openapi.yaml](demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml)) as the implementation authority (DR-035). Redocly lint passes, and 8 response-contract tests validate real responses through `openapi-backend` + `ajv-formats`.
- Routes are resource-oriented with typed error envelopes (`success`, `error`, `message`, `requestId`).
- Defect: `/api/visualise/{name}` returns 500 for a valid percent-encoded name (Risk 4). The contract lists `500` for that path, so the contract test cannot catch it.
- Known drift, already triaged as TRIAGE-10 in the root worklist: generator request and validation-error schemas against runtime. It is not in the project backlog.
- Python and C# have no API surface, and that is by design (staged capability).

## Screenplay Parity

- Memory keys and step text: machine-checked and passing.
- Structural parity is uneven. TypeScript has one file per Task and per Question, and per-technique step files. Python and C# use single large modules (Tasks 604 / 527 lines; steps 1,011 / 966 lines), which makes side-by-side reading harder than it needs to be.
- Fixture loading differs: anchored paths in TypeScript and Python, cwd-walk plus a swallowed exception in C# (Risk 5).
- No-op Given/When steps are more common in Python (12 `pass` bodies found) than in TypeScript, which tends to put a comment in an empty arrow function. The verification semantics are the same in both.

## Batch File Design

- `.batch/` holds 16 PowerShell 7 scripts with clear single purposes: check-*, test-* (negative controls), invoke/evaluate (audit) and run-* (orchestration). Each one I ran exits non-zero on failure and prints `OK` / `FAIL` lines. Controls write to GUID-named temporary directories and refuse recursive cleanup outside them ([.batch/test-documentation-currency.ps1](.batch/test-documentation-currency.ps1) lines 50-56), which is careful work.
- Exception: [.batch/test-then-assertion-mutations.ps1](.batch/test-then-assertion-mutations.ps1) mutates tracked files in place (Risk 9).
- [.batch/check-ra-header-currency.ps1](.batch/check-ra-header-currency.ps1) (lines 421-422) requires every `DOCS/.review/CODE_REVIEW_*` folder to be listed in both `DOCS/.review/README.md` and `DOCS/README.md`. Observed locally, it fails on the untracked parallel review `CODE_REVIEW_CODEX_v3_20261105T0858Z`, and it will equally fail on this review folder until both indexes are updated. This is by design, not a defect, but committing any review requires those two index edits in the same PR.
- `run_solver_and_capture_output.bat` is the only `.bat` file. Its `.batch/output/*.txt` outputs are git-ignored, and five stale outputs from April-May 2026 remain on disk locally. That is harmless.

## Documentation Alignment

- Numeric claims are aligned. README, CLAUDE.md, DEMOAPP001 docs and the execution inventory all state 113 / 8 / 30 / 28 / 55, and all were reproduced (see [ANNEX/VALIDATION_EVIDENCE.md](ANNEX/VALIDATION_EVIDENCE.md)).
- Narrative drift: the canonical feature header says three techniques (Risk 7). The README coverage table deliberately keeps the 2026-07-27/28 measured baselines, which are labelled historical, so that is not drift.
- State drift: the backlog's "0 Open" and its 2026-10-07 status line do not mention the 2026-10-12 expiry. The registry note is stale (Risk 6).
- The CHANGELOG `[Unreleased]` section is current to BACKLOG-081. There is no tagged release, which is fine for a POC.

## Logging Alignment

- All three Stacks implement the same audit-trail model (AuditLogger / AuditTypes / audit.py), and the canonical feature checks it ("audit trail" scenarios pass in all three Stacks).
- Script output follows one convention across `.batch/` (`OK`/`FAIL` lines, a final `PASS`/`FAIL` banner, exit code), which makes CI logs easy to grep. That is how this review extracted the audit failure lines.
- The audit summary JSON under-reports blocking findings when a policy error is present (Risk 2), which is the one logging inaccuracy found.
- The API logs only a startup line. No request logging exists, which is acceptable for a local demo. `requestId` is returned to the client but not logged server-side, so it cannot be correlated.

## Test Coverage Metrics

| Lane | Count (observed, this review) | Floor / note |
|---|---|---|
| DEMOAPP001 component | 113 / 113 pass | Selected-module floors 70% lines / 85% branches / 75% functions (coverage not re-measured locally) |
| DEMOAPP001 BDD | 55 scenarios / 309 steps pass | Serenity adapter required |
| DEMOAPP001 OpenAPI | 8 / 8 pass; lint valid | - |
| DEMOAPP001 API integration | PASS | supertest, in process |
| DEMOAPP002 | 85 passed (55 BDD + 30 component) | 85% combined floor (coverage not installed in local venv; not re-measured) |
| DEMOAPP003 component | 28 / 28 pass | 80% / 80% floors (not re-measured) |
| DEMOAPP003 Reqnroll | 38 / 55 with out-of-tree build output; 55 / 55 in CI default layout (run 41307055984) | See Risk 5 |
| Parity tool | 21 / 21 pass | node --test |
| Audit policy controls | 13 / 13 pass | - |

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_gb.automation.smoketests.sudoku.poc.md) | [Back to Index](00_CODE_REVIEW_Claude_v2_20261105T1425Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
