# Recommendations

[<- Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (Codex GPT-6)

## Recommended Refactors

- **First:** remediate the locked runtime parser and reconcile the expired exception separately (S-01/S-02); keep the policy threshold unchanged.
- **Next:** distinguish explicit file lookup from default discovery (S-03), preserving successful custom and default file loading.
- **Next:** make the C# evidence adapter validate complete test-case structure before deriving a pass (S-04).
- **Then:** align generator seed/error contracts and advanced Given fidelity within existing TRIAGE-10/15 scope (S-05/S-06).

## Next Steps

- For dependency work, capture before/after full and production audits, prove the selected patched transitive versions, and rerun native API and solver lanes.
- For S-03, require failure for absent explicit absolute/relative paths and success for valid custom/default inputs in all three languages.
- For S-04, require partial, missing-terminal, duplicate and unknown step-result fixtures to fail while complete normal/retry cases pass.
- Keep review registration as a separate coordinated integration change: update both shared review indexes only when authorised to publish, then rerun the currency guard. This review intentionally leaves them untouched.

## Future Project Ideas

- A shared malformed-input contract covering loader selection and parser boundaries would add more value than another near-duplicate happy path.
- An evidence-parser fuzz corpus could explore missing/out-of-order/retried message structures with explicit invariants.
- Extend tutor/generator parity to another language only if teaching or product scope requires it; preserve the honest TypeScript-only capability boundary meanwhile.

No estimates or approvals are implied. These are prioritised review recommendations, not backlog changes or an implementation plan accepted by the owner.

---

[<- Previous](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CODEX_v3_20261105T0858Z.md) | [Next ->](06_ARCHITECTURE_ASSESSMENT.md)
