# DEMOAPP001_TYPESCRIPT_CYPRESS — Stack README

**Language:** TypeScript 5.x
**Framework:** Cucumber.js 12 + Serenity/JS 3.43.2
**Surface type:** @util
**Last updated:** 2026-05-15

---

## Prerequisites

- Node.js 16+
- npm 8+

---

## Setup

```bash
cd demo-apps/demoapp001-typescript-cypress
npm install
```

---

## Running Tests

```bash
npm test
```

Expected output (current baseline):

```text
43 scenarios (43 passed)
241 steps (241 passed)
```

Run by tag:

```bash
npm test -- --tags @util
npm test -- --tags @stack-demoapp001
```

---

## Project Structure

```text
demoapp001-typescript-cypress/
├── app_src/
├── tests/
│   ├── features/
│   └── screenplay/
│       ├── abilities/
│       ├── actors/
│       ├── tasks/
│       ├── questions/
│       ├── support/
│       └── step_definitions/
├── tooling/
└── docs/
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run full BDD suite |
| `npm start` | Run CLI demo app with ts-node |
| `npm run lint` | Lint TypeScript source |
| `npm run format` | Format TypeScript source |

---

## Updating Feature Files

Feature file content is owned by `features-shared/` (Canonical Feature Store). Do not author behavior changes directly in `tests/features/`.

See canonical update process in `../../CLAUDE.md`.

---

## Deeper Reading

- `docs/ARCHITECTURE.md` — layer model and dependency boundaries
- `docs/SCREENPLAY_GUIDE.md` — Actor/Ability/Task/Question implementation details
- `docs/QA_STRATEGY.md` — scope and coverage posture
- `../../DOCS/templates/stack-readme.template.md` — source template used
