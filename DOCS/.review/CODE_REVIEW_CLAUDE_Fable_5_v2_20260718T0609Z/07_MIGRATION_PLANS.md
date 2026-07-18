# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

There is no large-scale migration outstanding: the two structural migrations the previous review
flagged are done (Reqnroll/.NET 10 via DR-036; RA-header-currency automation via BACKLOG-055).
What follows are the small, self-contained changes this review recommends, framed as the
template's migration plans.

## Plan 1: Extend static analysis to the test and tooling layers (Risk 1)

- **Scope:** DEMOAPP001 only (Python/C# Stacks have no linter by design at POC scope).
- **Steps:** widen the three npm scripts' globs to include `tests/**/*.ts` and `tooling/**/*.ts`;
  add an `eslint.config.js` `files` block for those globs with `parserOptions.project` set to
  `tsconfig.cucumber.json`; run `npm run lint` and `npm run format`, absorb the resulting
  (mostly formatting) changes; add `npm run format:check` as a CI step beside Lint.
- **Effort:** ~1 hour. **Risk:** low - style-only surface, no runtime behaviour touched.
- **Verify:** `npm run lint && npm run format:check && npm test` green; CI green on the branch.

## Plan 2: Close the governance-doc drift and widen the guard (Risk 2)

- **Scope:** `CLAUDE.md` + `.batch/check-ra-header-currency.ps1`.
- **Steps:** correct `CLAUDE.md` line 229 to "DR-001 through DR-036"; add `CLAUDE.md` to the
  guard's `$Targets`; optionally add a second assertion tying the documented DR range to the
  register footer's "Next ID: DR-037".
- **Effort:** ~30 minutes. **Risk:** low. **Verify:** `.batch/check-ra-header-currency.ps1`
  exits 0 with the new target; a deliberately stale citation makes it exit 1 (as the script's
  own negative test already demonstrates for the existing targets).

## Plan 3: Container and runtime currency (Risks 3-4)

- **Scope:** `docker-compose.yml` parity service image; DEMOAPP001 `.npmrc`.
- **Steps:** bump the parity-checks image to `powershell:7.5-ubuntu-24.04`; add `.npmrc` with
  `engine-strict=true` beside `package.json`.
- **Effort:** ~15 minutes combined. **Risk:** low. **Verify:** `docker compose run --rm
  parity-checks` where a Docker engine is available; `npm ci` on Node 24 succeeds and on Node 20
  now fails fast.

## Single Source of Truth for Features

N/A - already achieved. Canonical `features-shared/` + generated Stack copies + feature/step-text
parity gates are in place and passing; no consolidation work remains.

## Docker Compose for Local Development

N/A as new work - Compose already exists (`docker-compose.yml`: per-stack test services, an API
profile, a parity-checks service, a benchmark profile). The only change is the image bump in
Plan 3; no architectural migration is needed.

## GitHub Actions / Workflow

Largely complete and current: three per-stack jobs on current action majors (`checkout@v7`,
`setup-node@v7`, `setup-python@v6`, `setup-dotnet@v5`, `upload-artifact@v7`), read-only
permissions, no persisted credentials, four parity gates, and a fan-in `gate` job for branch
protection. The only workflow addition recommended here is `npm run format:check` (Plan 1); no
migration of the CI model itself is warranted.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md)
