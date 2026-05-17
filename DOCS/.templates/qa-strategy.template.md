# TEMPLATE — QA Strategy

**Intended audience:** QA leads, architects, and stakeholders reviewing test scope for a specific Stack.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `reference-architecture.md` §10.2
**Produces:** `[STACK_NAME]/docs/qa-strategy.md`

---

## How to Use This Template

- Author this document alongside the Stack Architecture document.
- "Explicitly out of scope" is as important as what is tested — be specific.
- Update coverage targets when new scenario categories are added.

---

```markdown
# [STACK_NAME] — QA Strategy

**Stack:** [STACK_NAME] [REQUIRED]
**Surface type:** [@util | @cli | @api | @ui] [REQUIRED]
**Last updated:** YYYY-MM-DD

---

## 1. What Is Tested [REQUIRED]

[Describe what this Stack is responsible for testing. Be specific about the layer and the boundary.]

| Category | Scenarios | Coverage goal |
|----------|-----------|--------------|
| [Category 1] | [N] | [100% / happy path only / etc.] |
| [Category 2] | [N] | [Coverage goal] |

---

## 2. Technique Coverage [REQUIRED]

[List the test design techniques applied and where.]

| Technique | Applied to |
|-----------|-----------|
| Equivalence Partitioning | [Which scenarios or categories] |
| Boundary Value Analysis | [Which scenarios or categories] |
| Decision Table | [Scenario Outline with Examples] |
| State Transition | [Which state sequences are exercised] |
| Error Guessing | [Known edge cases explicitly covered] |

---

## 3. Explicitly Out of Scope [REQUIRED]

[What this Stack does NOT test, and why. This section prevents scope creep and sets expectations.]

- **[Out of scope item 1]** — [Reason: not this Stack's responsibility / covered elsewhere / deferred]
- **[Out of scope item 2]** — [Reason]
- **[Out of scope item 3]** — [Reason]

---

## 4. Test Data Strategy [REQUIRED]

[How is test data set up, isolated, and cleaned up?]

- **Setup:** [How state is initialised before each scenario]
- **Isolation:** [How scenarios avoid sharing state]
- **Teardown:** [Memory cleared via Actor.forget() / fixture teardown / etc.]
- **External data:** [puzzles.json / API fixtures / database / etc.]

---

## 5. Coverage Metrics [REQUIRED]

[Current state of coverage — update after each sprint.]

| Metric | Value | Target |
|--------|-------|--------|
| Scenarios | [N] | [N] |
| Steps | [N] | — |
| Pass rate | [N]% | 100% |
| Scenarios tagged @pending | [N] | 0 |

---

## 6. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How addressed] |

---

## 7. Related Documents

- [`docs/architecture.md`](architecture.md) — layer model and component dependencies
- [`docs/screenplay-guide.md`](screenplay-guide.md) — how components are implemented
- [`DOCS/.planning/backlog.md`](../../DOCS/.planning/backlog.md) — known gaps and pending work
```
