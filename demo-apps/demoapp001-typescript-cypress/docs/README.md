# DEMOAPP001_TYPESCRIPT_CYPRESS — Stack README

**Language:** TypeScript 5.x
**Framework:** Cucumber.js 12 + Serenity/JS 3.43.2
**Surface type:** @util
**Last updated:** 2026-05-19

---

## Prerequisites

- Node.js 20+
- npm 8+
- Java Runtime Environment on `PATH` for Serenity BDD HTML report generation

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
46 scenarios (46 passed)
257 steps (257 passed)
```

Run by tag:

```bash
npm test -- --tags @util
npm test -- --tags @stack-demoapp001
```

---

## Living Documentation

`npm test` records Serenity BDD JSON reports under `.results/serenity/`.

Generate the HTML living documentation report through the Stack runner:

```powershell
pwsh -File ..\..\.batch\run-demoapp001.ps1
```

After a successful run, open:

```text
demo-apps/demoapp001-typescript-cypress/.results/serenity/index.html
```

To regenerate only the HTML report from existing Serenity JSON output:

```bash
npx serenity-bdd run --source .results/serenity --destination .results/serenity --features tests/features --project DEMOAPP001
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

- `docs/architecture.md` — layer model and dependency boundaries
- `docs/screenplay-guide.md` — Actor/Ability/Task/Question implementation details
- `docs/qa-strategy.md` — scope and coverage posture
- `../../DOCS/.templates/stack-readme.template.md` — source template used
