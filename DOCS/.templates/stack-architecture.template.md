# TEMPLATE — Stack Architecture

**Intended audience:** Engineers onboarding this Stack; architects auditing compliance.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `reference-architecture.md` §10.2
**Produces:** `[STACK_NAME]/docs/architecture.md`

---

## How to Use This Template

- Complete before writing any Screenplay components for this Stack.
- Update the dependency graph whenever a new Ability or library is added.
- Record every structural deviation in `DECISION_REGISTER.md` and reference the DR number here.

---

```markdown
# [STACK_NAME] — Architecture

**Stack:** [STACK_NAME] [REQUIRED]
**Language:** [Language and version] [REQUIRED]
**Framework:** [Test framework and version] [REQUIRED]
**Surface type:** [@util | @cli | @api | @ui] [REQUIRED]
**Last updated:** YYYY-MM-DD

---

## 1. Purpose [REQUIRED]

[2–3 sentences. What does this Stack test, and why does it exist?]

---

## 2. Five-Layer Model

[REQUIRED — describe the implementation of each layer for this Stack]

| Layer | Role | Implementation |
|-------|------|---------------|
| 1 — Feature Files | Gherkin specs | `tests/features/` (copied from `features-shared/`) |
| 2 — Step Definitions | Maps steps to Screenplay | `tests/screenplay/step_definitions/` |
| 3 — Screenplay | Actor, Tasks, Questions | `tests/screenplay/` |
| 4 — Abilities | Wraps subject application | `tests/screenplay/abilities/` |
| 5 — Subject Application | Software under test | `[path to subject app src]` |

---

## 3. Component Dependency Graph [REQUIRED]

```
[Draw or describe how components depend on each other]

Example:
Step Definitions
  → actor.attemptsTo(Task)
      → Task.performAs(actor)
          → actor.abilityTo(Ability).interact(...)
              → SubjectApplication
```

---

## 4. Key Design Decisions [REQUIRED]

| Decision | Rationale | DR Reference |
|----------|-----------|-------------|
| [Decision 1] | [Why chosen] | DR-[NNN] |
| [Decision 2] | [Why chosen] | DR-[NNN] |

---

## 5. Known Constraints [REQUIRED]

[List any constraints that affect this Stack specifically — technology limitations, scope boundaries, deliberate exclusions.]

- [Constraint 1: description and impact]
- [Constraint 2: description and impact]

---

## 6. Directory Structure

```
[STACK_NAME]/
├── [subject-app-src]/
├── tests/
│   ├── features/             # Stack-local feature files (from features-shared/)
│   ├── step_definitions/     # Thin step definitions
│   └── screenplay/
│       ├── abilities/
│       ├── actors/
│       ├── tasks/
│       ├── questions/
│       └── support/          # Memory keys, world setup
├── tooling/                  # Test runner config
└── docs/                     # This file lives here
```

---

## 7. External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [Package] | [x.y.z] | [What it does] |

---

## 8. Related Documents

- [`docs/screenplay-guide.md`](SCREENPLAY_GUIDE.md) — how Screenplay is implemented in this Stack
- [`docs/qa-strategy.md`](QA_STRATEGY.md) — what is and is not tested
- [`DECISION_REGISTER.md`](../../DECISION_REGISTER.md) — authoritative decisions
```
