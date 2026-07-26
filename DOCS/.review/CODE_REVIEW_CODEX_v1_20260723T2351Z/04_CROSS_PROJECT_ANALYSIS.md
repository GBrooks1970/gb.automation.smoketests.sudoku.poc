[Review index](00_CODE_REVIEW_CODEX_v1_20260723T2351Z.md) > Cross-Project Analysis

# Cross-Project Analysis

This repository contains one product implemented in three framework/language stacks. "Cross-project" therefore means comparison of the TypeScript, Python, and C# projects and their shared governance layer.

## Tool-Agnostic Tests - Can Tests Run Across Frameworks?

The scenarios are conceptually tool-agnostic. A single canonical feature is copied into each framework, and the parity script compares the executable text. The bindings use the same Screenplay vocabulary and memory keys while respecting native framework lifecycle mechanisms.

| Concern | TypeScript | Python | C# | Assessment |
|---------|------------|--------|----|------------|
| BDD runner | Cucumber | pytest-bdd | Reqnroll | Equivalent intent |
| Actor lifecycle | Serenity stage | Per-scenario fixture | Scenario hook | Isolated |
| Solver execution | In-process | In-process | In-process | Deterministic |
| External waits | None | None | None | Strong |
| Shared data access | Stack-local copy | Stack-local copy | Stack-local copy | Safe with parity gate |
| Boundary typing | `Number.isInteger` | `isinstance(..., int)` | Typed `int[][]` | Python boolean gap |

The important limitation is not portability but assertion semantics. Equivalent weak bindings have propagated across frameworks, so parity alone can preserve the same false positive three times.

## Single Source of Truth - Feature File and Data Consistency

- The canonical [BasicSudokuSolverLogic.feature](../../../features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature) is the governance source.
- Feature parity passed across all three copies.
- Step-text parity passed with 177 extracted step lines in each stack.
- Memory-key parity passed for all six governed keys.
- The three `puzzles.json` files share SHA-256 `DB32871059B1BF99017BDBD34F98E91B0E36E103659F419EECCB3CA48E9994AA`.
- The parity scheme protects text and bytes, not semantic adequacy. The `Logic Squeeze Grid` description is consistently overstated in all copies.

The governance design is strong, but it needs semantic contract tests at the canonical boundary. R1 and R2 are examples that exact-copy gates cannot detect.

## Screenplay Parity - Consistency Across Stack Implementations

All three stacks expose actors, abilities, tasks, questions, and shared memory concepts. This is a credible demonstration of tool-agnostic Screenplay design. The implementation structure differs idiomatically without losing the common model.

The orchestration step bindings are also consistently weak:

- "multiple iterations", "progress was made", and "completely solved" collapse to the same final-status assertion in Python and C#.
- TypeScript adds audit checks in places, but audit entries represent changes rather than attempts and therefore cannot fully prove call order.
- The all-three-techniques step resolves to `SOLVED` in all stacks.

The next parity target should be behavioural evidence, not more textual mirroring: an agreed attempt-event schema and invariant assertions exercised in every stack.

## Documentation Alignment - Consistency and Completeness

| Document area | Alignment | Main issue |
|---------------|-----------|------------|
| Reference architecture and memory keys | Strong | Existing currency gate passes |
| Root project status | Weak | Private/public claim is stale |
| Stack READMEs | Weak | Test maturity/counts and dependencies are stale |
| QA strategies | Mixed | TypeScript scenario/step totals lag |
| API contract | Strong in OpenAPI | Design proposal is not clearly reconciled |
| Backlog summary | Strong arithmetic | Detailed technology and resolved-list text drifts |
| Review indexes | Weak | Recent review directories are omitted |

Documentation quantity is not the concern; authority and freshness are. Each topic needs one clearly marked live source, with proposals and historical records labelled accordingly.

## Test Coverage Metrics - Quantitative Assessment

| Metric | Result | Interpretation |
|--------|--------|----------------|
| Canonical scenarios | 46 per stack | Broad acceptance coverage |
| Canonical step lines | 177 per stack | Textual parity |
| TypeScript step executions | 257 reported | High execution volume |
| Python local run | 46 passed in 1.08s | Fast deterministic feedback |
| Pending/quarantined canonical scenarios | 0 found | No hidden deferral |
| Distinct lower-level unit suites | 0 evidenced | Pyramid claim unsupported |
| Enforced coverage thresholds | 0 | Fault-detection depth unknown |
| Contract-schema validation | 0 evidenced | OpenAPI drift can escape |
| Known npm vulnerabilities | 0 reported | Positive current lock-file result |

Counting scenarios and steps is useful for parity, but it is not a coverage substitute. Future reporting should distinguish requirements coverage, structural code coverage, mutation score, and contract coverage.

## Cross-Stack Adoption Decision

The repository remains a good reference for parity governance, deterministic Screenplay implementation, and multi-language BDD structure. It should not be presented as proof of algorithm call-order testing or a mature test pyramid until R1 and R4 are resolved. The recommended adoption posture is "use with documented constraints", not rejection.

---

Review: CODE_REVIEW_CODEX_v1_20260723T2351Z | Reviewer: AI assistant (Codex, GPT-5) | Generated: 2026-07-23T23:51Z
