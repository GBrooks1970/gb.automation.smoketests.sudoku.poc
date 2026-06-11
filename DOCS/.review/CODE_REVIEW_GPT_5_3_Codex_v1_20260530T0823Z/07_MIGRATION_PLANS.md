# Migration Plans

[Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md)

**Reviewer:** AI assistant (GPT-5.3 Codex)  
**Date:** 2026-05-30T08:23Z

## Plan 1: Specification v1.0 to v1.1/v2.0

1. Keep v1.0 as the historical core-solver baseline.
2. Add an updated specification that explicitly includes row, column, and block Hidden Singles.
3. Define required versus optional stack surfaces: core solver, tests, display, audit, REST, web, performance.
4. Add a traceability matrix from requirements to implementation files and shared scenarios.
5. Update root README version/status metadata to reference the newer spec.
6. Mark v1.0 limitations clearly to avoid future false-positive drift reports.

## Plan 2: Core Solver Encapsulation

1. Add grid snapshot methods in all three solvers.
2. Return defensive copies from snapshot methods.
3. Gradually update tests, API services, and UI adapters to read through snapshot methods.
4. Keep direct grid access temporarily where test setup requires it.
5. Document direct grid mutation as test-support or internal-only behaviour.
6. Consider immutable views or private setters in a later cleanup.

## Plan 3: Orchestrator Behaviour Alignment

1. Add an early complete-grid check before the progress loop in all orchestrators.
2. Add/confirm tests that solved grids do not produce audit iterations or algorithm calls.
3. Preserve result strings exactly: `SOLVED` and `STUCK_ON_ADVANCED_LOGIC`.
4. Ensure audit trails for already-solved grids remain well-defined.
5. Run all stack test suites after the change.
6. Update docs if iteration counts or audit semantics change.

## Plan 4: Capability Parity Governance

1. Create a stack capability matrix in shared docs.
2. Classify TypeScript REST/web as either reference-only or future parity target.
3. Record Python and CSharp API/web decisions explicitly.
4. Add parity checks for shared feature bodies and puzzle schema drift.
5. Keep Docker Compose services aligned with the matrix.
6. Review the matrix in future code reviews before flagging stack differences as defects.

---

[Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z.md)
