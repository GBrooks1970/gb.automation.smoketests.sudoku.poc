# DEMOAPP001_TYPESCRIPT_CYPRESS — QA Strategy

**Stack:** DEMOAPP001_TYPESCRIPT_CYPRESS
**Surface type:** @util
**Last updated:** 2026-07-28

---

## 1. What Is Tested

This Stack tests behavioural correctness through the `@util` surface and adds focused component,
REST integration, executable OpenAPI and coverage/mutation evidence beneath the shared BDD contract.

| Category | Scenarios | Coverage goal |
|----------|-----------|---------------|
| Unit Completion | 5 | 100% of defined scenarios |
| Hidden Singles | 5 | 100% of defined scenarios |
| Naked Singles | 4 | 100% of defined scenarios |
| Naked Pairs | 4 | 100% of defined scenarios |
| X-Wing | 3 | 100% of defined scenarios |
| Constraint validation | 3 | 100% of defined scenarios |
| Orchestration loop | 7 | 100% of defined scenarios |
| Puzzle loading | 7 | 100% of defined scenarios |
| Grid initialization and invariants | 5 | 100% of defined scenarios |
| Integration flow | 4 | 100% of defined scenarios |
| Edge cases and error handling | 5 | 100% of defined scenarios |
| Audit trail | 3 | 100% of defined scenarios |

---

## 2. Technique Coverage

| Technique | Applied to |
|-----------|------------|
| Equivalence Partitioning | Valid vs invalid placement, puzzle retrieval success vs not-found |
| Boundary Value Analysis | Empty grid, minimal clues, index-based puzzle access boundaries |
| Decision Table | Scenario Outline-driven algorithm target/value combinations |
| State Transition | Initialise -> apply algorithm -> solve -> observe status transitions |
| Error Guessing | Invalid puzzle structures, missing puzzle names, no-progress solver states |

---

## 3. Explicitly Out of Scope

- Complex chain techniques (for example Swordfish, forcing chains, backtracking) — intentionally excluded from current solver scope.
- CLI process contract assertions (exit code, stdout/stderr formatting) — this Stack is @util, not @cli.
- Performance benchmarking under large puzzle volumes — functional behavior has priority in this pedagogical stack.

---

## 4. Test Data Strategy

- Setup: Tasks initialise each scenario with explicit grid state or named puzzle.
- Isolation: Each scenario uses fresh actor ability state; grids are deep-copied by solver constructor.
- Teardown: Scenario-scoped actor and ability lifecycle clears state between scenarios via Serenity/Cucumber orchestration.
- External data: `puzzles.json` is the authoritative puzzle fixture file for loader scenarios.

---

## 5. Coverage Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Scenarios | 55 | 55 |
| Steps | 309 | — |
| Focused component tests | 20 | All passing |
| OpenAPI contract tests | 4 | All passing |
| Selected-scope coverage | 73.23% lines / 87.67% branches / 79.59% functions | 70% / 85% / 75% floors |
| Focused mutation trial | 10/10 killed | No material survivor |
| Pass rate | 100% | 100% |
| Scenarios tagged @pending | 0 | 0 |

---

## 6. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Documentation counts drift after canonical feature changes | Medium | Medium | Derive counts from the canonical feature in the currency guard |
| Hidden Singles behavior regression in row/column loops | Medium | High | Keep dedicated hidden-singles scenarios and protect method internals with step-level checks |
| Direct step-to-production coupling reintroduced in future edits | Low | High | Enforce code review rule: steps must only call Tasks/Questions |

---

## 7. Related Documents

- `docs/architecture.md` — five-layer model and dependencies
- `docs/screenplay-guide.md` — Screenplay implementation details
- `docs/component-test-coverage-baseline.md` — selected scope, exclusions, baseline and floors
- `../../DOCS/.analysis/coverage-and-mutation-policy-20260728.md` — cross-Stack coverage/mutation policy
- `../../DOCS/.planning/backlog.md` — migration backlog and deferred work
- `../../DOCS/.templates/qa-strategy.template.md` — source template used
