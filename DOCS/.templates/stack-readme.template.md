# TEMPLATE — Stack README

**Intended audience:** Any developer setting up and running a specific Stack for the first time.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `reference-architecture.md` §10.2
**Produces:** `[STACK_NAME]/docs/README.md`

---

## How to Use This Template

- This is the entry point for developers new to this Stack.
- Keep Prerequisites and Quick Start accurate — they are run against constantly.
- Link to `architecture.md` and `screenplay-guide.md` for deeper context.

---

```markdown
# [STACK_NAME] — Stack README

**Language:** [Language and version] [REQUIRED]
**Framework:** [Framework and version] [REQUIRED]
**Surface type:** [@util | @cli | @api | @ui] [REQUIRED]
**Last updated:** YYYY-MM-DD

---

## Prerequisites [REQUIRED]

- [Runtime: e.g. Node.js 16+ / Python 3.10+ / .NET 8+]
- [Package manager: e.g. npm 8+ / pip / dotnet]
- [Any other requirement]

---

## Setup [REQUIRED]

```bash
cd [STACK_NAME]
[install dependencies command]
```

---

## Running Tests [REQUIRED]

```bash
[test command]
```

**Expected output:**
```
[N] scenarios ([N] passed)
[N] steps ([N] passed)
```

**Run by tag:**
```bash
[test command] --tags @util
[test command] --tags @stack-[name]
```

---

## Project Structure

```
[STACK_NAME]/
├── [subject-app-src]/        # Subject application source
├── tests/
│   ├── features/             # Stack-local Gherkin (from features-shared/)
│   ├── step_definitions/     # Thin step definitions
│   └── screenplay/           # Actor, Abilities, Tasks, Questions
├── tooling/                  # Test runner configuration
└── docs/                     # This file lives here
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `[build command]` | Compile/build subject application |
| `[test command]` | Run full test suite |
| `[lint command]` | Lint source files |
| `[format command]` | Format source files |

---

## Updating Feature Files

Feature files are owned by `features-shared/` (Canonical Feature Store). Do **not** edit `tests/features/` directly for content changes.

See the canonical feature update procedure in [`CLAUDE.md`](../../CLAUDE.md).

---

## Deeper Reading

- [`docs/architecture.md`](architecture.md) — layer model, dependency graph
- [`docs/screenplay-guide.md`](screenplay-guide.md) — Screenplay components guide
- [`docs/qa-strategy.md`](qa-strategy.md) — what is and is not tested
```
