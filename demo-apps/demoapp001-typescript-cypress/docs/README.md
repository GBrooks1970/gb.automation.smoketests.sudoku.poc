# DEMOAPP001_TYPESCRIPT_CYPRESS — Stack README

**Language:** TypeScript 5.x
**Framework:** Cucumber.js 12 + Serenity/JS 3.43.2
**Surface types:** @util, @api
**Last updated:** 2026-07-28

---

## Prerequisites

- Node.js 24 LTS
- npm (bundled with Node.js 24)
- Java Runtime Environment on `PATH` for Serenity BDD HTML report generation

---

## Setup

```bash
cd demo-apps/demoapp001-typescript-cypress
npm ci
```

---

## Running Tests

```bash
npm test
npm run test:component
npm run test:coverage
npm run test:api
npm run verify:openapi
```

Expected output (current baseline):

```text
16 component tests (16 passed)
48 scenarios (48 passed)
267 steps (267 passed)
API integration tests: PASS
4 OpenAPI contract tests (4 passed)
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
│   └── server/
├── tests/
│   ├── api/
│   ├── component/
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
| `npm test` | Run the component lane and the full BDD suite |
| `npm run test:component` | Run all focused lower-level component tests |
| `npm run test:coverage` | Run component tests with report-only native Node coverage |
| `npm run test:orchestration` | Run the focused attempt-observer contract tests |
| `npm run test:api` | Run REST API integration checks |
| `npm run openapi:lint` | Lint the implemented OpenAPI document with the committed Redocly rules |
| `npm run test:openapi` | Validate real success/error responses and the intentional drift control against OpenAPI |
| `npm run verify:openapi` | Run the blocking OpenAPI lint and response-contract gate |
| `npm start` | Run CLI demo app with ts-node |
| `npm run start:api` | Start Express REST API on `PORT` or 3000 |
| `npm run lint` | Lint TypeScript source |
| `npm run format` | Format TypeScript source |

---

## Updating Feature Files

Feature file content is owned by `features-shared/` (Canonical Feature Store). Do not author behavior changes directly in `tests/features/`.

See canonical update process in `../../CLAUDE.md`.

---

## Deeper Reading

- `docs/architecture.md` — layer model and dependency boundaries
- `docs/openapi.yaml` — implemented REST API authority, linted and response-validated in CI
- [component-test-coverage-baseline.md](component-test-coverage-baseline.md) — SUD-24 component inventory, baseline and exclusions
- `docs/screenplay-guide.md` — Actor/Ability/Task/Question implementation details
- `docs/qa-strategy.md` — scope and coverage posture
- `../../DOCS/.templates/stack-readme.template.md` — source template used
