# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](03_PROJECT_REVIEWS/PROJECT_001_SUDOKU.md)

**Reviewer:** AI assistant (Codex GPT-6)

Severity is relative to this portfolio application: HIGH blocks dependable execution/publication or affects a reachable runtime dependency; MEDIUM is a bounded functional or assurance defect. No critical finding is claimed.

## S-01 - HIGH - Vulnerable production body parser is still locked

- **Risk description:** `body-parser` 2.3.0 is locked and used through Express JSON parsing with default decompression. A fresh production-only npm audit reports one high and one moderate affected package.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/package-lock.json](../../../demo-apps/demoapp001-typescript-cypress/package-lock.json) (line 1504); [demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/app.ts) (line 32). The [maintainer-reviewed advisory](https://github.com/advisories/GHSA-27r3-jxmh-p828) identifies this version range and fixes 2.4.0 / 1.20.9. Full and production audit output is retained in `ANNEX/AUDIT_RESULTS.json`.
- **Impact:** a compressed request with trailing bytes can terminate an affected API process according to the advisory. Applicability to this middleware configuration is a source-based inference; no crash exploit was executed. The static Pages visualisation does not run this Express process, so this is not a claim that the public static site is exploitable.
- **Recommendation:** update the compatible lock resolution to a patched parser, verify the installed graph, and rerun API/OpenAPI, component and BDD checks. Keep any parser regression isolated in a disposable child process. Do not use an indiscriminate major-version `npm audit fix --force`.
- **Classification:** current dependency risk, distinct from the historical braces exception.

## S-02 - HIGH - Expired exception now blocks the governed audit

- **Risk description:** the policy still carries an exception ending 2026-10-12; the review date is 2026-11-05.
- **Evidence:** [.github/dependency-audit-policy.json](../../../.github/dependency-audit-policy.json) (line 15); [.batch/evaluate-dependency-audit.ps1](../../../.batch/evaluate-dependency-audit.ps1) (line 238); CI invokes the governed audit at [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) (line 93). The isolated command returned exit 1: `Policy error: Exception 1 expired on 2026-10-12`.
- **Impact:** a fresh governed lane cannot pass with this policy. Its `blocking=0 unexcepted=0` summary is not a clean security result because policy evaluation failed. The fresh npm audit does not list braces; retaining an obsolete exception is itself sufficient to fail policy validation.
- **Recommendation:** remove or reconcile the obsolete exception against the current advisory feed and owner policy, then deal with all remaining fresh findings. If any exception is still needed, obtain the policy's required bounded owner decision; never silently extend its date. Require both policy controls and the real audit to pass.
- **Classification:** operational policy defect confirmed by a current command, not an assertion about a remote CI run.

## S-03 - MEDIUM - Explicit missing C# fixture silently loads another file

- **Risk description:** `ResolvePuzzlePath` searches ancestor `puzzles.json` files even when an explicit absolute filename was supplied and does not exist.
- **Evidence:** [demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs](../../../demo-apps/demoapp003-csharp-specflow/app_src/PuzzleLoader.cs) (line 41). TypeScript and Python reject missing paths directly: [demo-apps/demoapp001-typescript-cypress/app_src/PuzzleLoader.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/PuzzleLoader.ts) (line 36); [demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py](../../../demo-apps/demoapp002-python-pytest/app_src/puzzle_loader.py) (line 26). The isolated native probe requested a guaranteed absent absolute file; it loaded five fallback puzzles and failed the expected `FileNotFoundException` assertion.
- **Impact:** a typo or missing configured fixture can test the default data and yield misleading success. This is a data-selection and cross-stack behaviour defect; the ordinary default fixture suite still passes.
- **Recommendation:** treat explicit paths as authoritative and fail if absent. Keep ancestor discovery only for the documented default, if desired. Add absolute/relative missing-path controls, valid custom-file controls and matching three-stack expectations.
- **Classification:** newly confirmed functional defect.

## S-04 - MEDIUM - C# parity accepts incomplete step-result evidence

- **Risk description:** the Messages adapter takes visible steps from `pickle.steps`, but derives status from whatever `testStepFinished` records happen to exist. It never proves that every expected test-case step finished.
- **Evidence:** [tools/parity-page/adapters.mjs](../../../tools/parity-page/adapters.mjs) (line 52); [tools/parity-page/check-parity.mjs](../../../tools/parity-page/check-parity.mjs) (line 42). A probe of the committed fixtures removed 72 of 85 C# step-result records, leaving one per execution. Both the complete baseline and the modified fixture returned `PARITY PASS` for 13 executions and 72 visible steps. Existing negative tests cover failed results, not this absence: [tools/parity-page/tests/check-parity.test.mjs](../../../tools/parity-page/tests/check-parity.test.mjs) (line 67).
- **Impact:** truncated or incompletely emitted evidence can look complete. This weakens the gate's claim about executed steps; it does not prove the current .NET test job or current published page is falsely green.
- **Recommendation:** validate testCase/testStep IDs, one terminal result per required step, and test-case completion for the selected attempt. Reject missing/duplicate/unknown records and interrupted runs; preserve deliberate retry semantics. Add a negative fixture with one missing final step and another with only a hook result.
- **Classification:** newly reproduced evidence-integrity defect.

## S-05 - MEDIUM - Generator seed input contract disagrees with runtime

- **Risk description:** the request schema permits only a string seed while the parser deliberately accepts a number or string. Even the schema description says both.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml](../../../demo-apps/demoapp001-typescript-cypress/docs/openapi.yaml) (line 815); [demo-apps/demoapp001-typescript-cypress/app_src/server/validation.ts](../../../demo-apps/demoapp001-typescript-cypress/app_src/server/validation.ts) (line 340). The backlog explicitly keeps generator request/error drift as separate TRIAGE-10 work. [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 8).
- **Impact:** generated clients and schema validators reject inputs the runtime accepts. Passing eight OpenAPI examples does not prove all accepted request shapes agree with the schema.
- **Recommendation:** decide the intended seed type at the contract, align parser and schema, and test string/numeric/invalid seeds plus the generator's relevant 400/422 error shapes. The generated response seed is converted to a string; no response-seed mismatch is alleged.
- **Classification:** corroborated known root candidate (TRIAGE-10), not a newly discovered untracked blocker.

## S-06 - MEDIUM - Advanced Givens ignore their advertised parameters

- **Risk description:** several Naked Pair and X-Wing step bindings accept coordinates/candidate text but construct a fixed fixture or do nothing, irrespective of those arguments.
- **Evidence:** [demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/nakedPairs.steps.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/nakedPairs.steps.ts) (line 13); [demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/xWing.steps.ts](../../../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/xWing.steps.ts) (line 12); [demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py](../../../demo-apps/demoapp002-python-pytest/tests/screenplay/step_definitions/test_basic_sudoku_solver_logic.py) (line 891). BACKLOG-078 improved exact Then digit/position checks, but explicitly kept the Given/candidate scope separate. [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 48); [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 8).
- **Impact:** changing a Given's row, digit or candidates need not change the arranged state. Business-readable examples can drift from the actual precondition while retaining a green result. No claim is made that the current fixed examples are wrong.
- **Recommendation:** either parameterise fixture construction or assert the requested parameters equal the supported fixture precondition. Add wrong-Given mutation controls across the stacks, alongside the existing Then controls.
- **Classification:** known TRIAGE-15 candidate; retain its existing scope and do not count it as unresolved BACKLOG-078.

---

[<- Previous](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](03_PROJECT_REVIEWS/PROJECT_001_SUDOKU.md)
