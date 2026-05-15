# TEMPLATE — Screenplay Guide

**Intended audience:** Developers implementing or extending Screenplay components in a specific Stack.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.2
**Produces:** `[STACK_NAME]/docs/SCREENPLAY_GUIDE.md`

---

## How to Use This Template

- Complete this document after the Screenplay Foundation (Phase 2) is implemented.
- Update Memory Keys and component examples whenever a new Ability, Task, or Question is added.
- This document is the onboarding reference for new developers on this Stack.

---

```markdown
# [STACK_NAME] — Screenplay Guide

**Stack:** [STACK_NAME] [REQUIRED]
**Language:** [Language] [REQUIRED]
**Screenplay library:** [e.g. @serenity-js/core | pytest-bdd + dataclass | SpecFlow] [REQUIRED]
**Last updated:** YYYY-MM-DD

---

## 1. Actor Setup [REQUIRED]

[Describe how the Actor is created and reset per scenario. Include the Cast/fixture setup.]

```[language]
// How an Actor is created for this Stack
[code example]
```

**Lifecycle:** [When is the Actor created? When is Memory cleared?]

---

## 2. Abilities [REQUIRED]

[One subsection per Ability. Include factory method signature and what the Ability wraps.]

### [AbilityName]

**Wraps:** [What production class or tool does this Ability encapsulate?]
**Factory:** `[ClassName.factoryMethod(config)]`
**Retrieved via:** `actor.abilityTo([ClassName])`

```[language]
// Ability definition
[code example]
```

---

## 3. Tasks [REQUIRED]

[One subsection per Task. Include factory method and what the Task does in business terms.]

### [TaskName]

**Purpose:** [What does the Actor accomplish?]
**Factory:** `[ClassName.factoryMethod(...)]`
**Uses ability:** `[AbilityName]`
**Writes to Memory:** `[MEMORY_KEY]` (if applicable)

```[language]
// Task usage in a step definition
await actor.attemptsTo(
  [TaskName].[factory]([params])
);
```

---

## 4. Questions [REQUIRED]

[One subsection per Question. Include what state it reads and what it returns.]

### [QuestionName]

**Purpose:** [What observable state does this Question retrieve?]
**Factory:** `[ClassName.factoryMethod(...)]`
**Reads from Memory:** `[MEMORY_KEY]` (if applicable)
**Returns:** `[TypeName]`

```[language]
// Question usage in a step definition
const result = await actor.answer([QuestionName].[factory]());
expect(result).toBe([expected]);
```

---

## 5. Memory Keys [REQUIRED]

All Memory keys are defined in `tests/screenplay/support/memory-keys.[ext]`.

| Constant | String value | Written by | Read by |
|----------|-------------|-----------|---------|
| `SOLVE_RESULT` | `'SOLVE_RESULT'` | [Task] | [Question] |
| `[KEY]` | `'[KEY]'` | [Task] | [Question] |

> **Rule:** Constant name MUST equal its string value exactly (RA §8.1).

---

## 6. Adding a New Scenario [REQUIRED]

1. Update the canonical feature file in `features_shared/`.
2. Propagate to the Stack-local copy in `tests/features/` (add `@stack-[name]` if not present).
3. Identify which Task and Question the new steps need.
4. If new components are needed, implement Ability → Task → Question in that order.
5. Add a step definition file (or add to an existing one) delegating to `actor.attemptsTo()` / `actor.answer()`.
6. Run the test suite — new scenario should pass.

---

## 7. Step Definition Conventions

- Each step file owns one scenario category (e.g., `unitCompletion.steps.[ext]`).
- Steps MUST NOT contain assertion logic — delegate to Questions.
- Steps MUST NOT instantiate production classes directly — use Abilities.
- Step text MUST match the canonical feature file exactly.
```
