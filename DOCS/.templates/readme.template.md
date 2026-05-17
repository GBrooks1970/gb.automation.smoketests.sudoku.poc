# TEMPLATE — Root README

**Intended audience:** Any developer, QA engineer, or AI agent opening the repository for the first time.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.1
**Produces:** `README.md` at the repository root

---

## How to Use This Template

- Replace every `[REQUIRED]` placeholder before publishing.
- Keep the Quick-Start section accurate. It is the highest-traffic section.
- Update the Stack table whenever a new Stack is added (RA §11, Phase 7).
- Update `CHANGELOG.md` when the README is substantially revised.

---

```markdown
# [Project Name] [REQUIRED]

> [One-sentence description of what this project does and why it exists.] [REQUIRED]

---

## What Is This?

[2–4 sentences. Describe the subject application, the test automation approach, and the intended audience of the project.] [REQUIRED]

---

## Repository Structure

[REQUIRED — update when structure changes]

```
repository-root/
├── features-shared/          # Canonical Feature Store — Gherkin only
├── [STACK_NAME]/             # One directory per Stack
├── DOCS/                     # Project-wide documentation
├── README.md                 # This file
├── CHANGELOG.md              # Version history
├── BACKLOG.md                # Backlog summary (detail: DOCS/.planning/backlog.md)
└── DECISION_REGISTER.md      # Structural and process decisions
```

---

## Stacks

[REQUIRED — one row per Stack]

| Stack | Language | Framework | Surface | Entry point |
|-------|----------|-----------|---------|-------------|
| [STACK_NAME] | [Language] | [Framework] | [@util / @cli / @api] | `[path/to/stack/]` |

---

## Quick Start — [STACK_NAME] [REQUIRED — repeat block per Stack]

**Prerequisites:**
- [Runtime and version, e.g. Node.js 16+]
- [Package manager, e.g. npm 8+]

**Steps:**
```bash
cd [STACK_NAME]
[install command]
[test command]
```

**Expected output:**
```
[N] scenarios ([N] passed)
[N] steps ([N] passed)
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [DECISION_REGISTER.md](DECISION_REGISTER.md) | Structural decisions |
| [DOCS/README.md](DOCS/README.md) | Full documentation index |
| [DOCS/.design/naming-conventions.md](DOCS/.design/naming-conventions.md) | Naming standards |

---

## Contributing

[Optional: describe branching strategy, PR process, or link to CONTRIBUTING.md]

---

*For architecture details see [DOCS/README.md](DOCS/README.md).*
```
