# Annex: Validation Log

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T06:09Z

Exact commands run during this review and their results. Per the portfolio registry deviation,
Stack defaults were run inside each Stack's own directory, never at the repo root. Nothing was
started that requires heavyweight infrastructure (no full Docker application stack, no long E2E).

## Environment

- OS: Windows 11; shell PowerShell 7.5.8.
- Node: v20.19.5 (local machine; note this is below the declared `>=24 <25` floor - see Risk 4).
- Python: 3.13.1.
- .NET SDKs available: 8.0.204, 8.0.400, 9.0.316 (no 10.0.x - DEMOAPP003 not run locally, I-2).
- PowerShell (pwsh): 7.5.8.

## Repository state

- `git status --short`: clean (before review artefacts were written).
- `git log --oneline -1`: `b696da3 Merge pull request #33 ... worklist/sud-17-19-20-remediation`.
- Branch: `main`.

## Parity gates (repo root, via `.batch/run-parity-checks.ps1`)

Result: **PASS** (exit 0). Individual gates:

- RA header currency: PASS - `decision-register.md` and `DOCS/.planning/backlog.md` both cite the
  active RA v1.15.
- Memory key parity: PASS - 6 keys x 3 Stacks all OK.
- Feature parity: PASS - `Overall result: PASS` (report written to
  `.results/feature-parity/FEATURE_PARITY_20260718T0029Z.md`).
- Step text parity: PASS - 177 step lines matched per Stack (DEMOAPP001/002/003).

## DEMOAPP001 (demo-apps/demoapp001-typescript-cypress/)

- `npm test` (cucumber-js): **46 scenarios (46 passed) / 257 steps (257 passed)**, ~16.7s. Exit 0.
- `npm run test:api`: **API integration tests: PASS.** Exit 0.
- `npm audit`: **found 0 vulnerabilities.** Exit 0. (Confirms v1 Risk 2 closed.)

## DEMOAPP002 (demo-apps/demoapp002-python-pytest/)

- `python -m pytest`: **46 passed, 1 warning** (~3.5s). Exit 0. The warning is the upstream
  `gherkin` `DeprecationWarning` under Python 3.13 (I-4; third-party, cosmetic).

## DEMOAPP003 (demo-apps/demoapp003-csharp-specflow/)

- Not run: no local .NET 10 SDK (highest available is 9.0.316; Stack targets `net10.0`). Reviewed
  statically. CI (`dotnet-version: "10.0.x"`) is the authoritative gate for this Stack. The
  backlog records the same constraint for the SUD-20 delivery (backlog.md lines 207-212).

## Static checks performed (not scripted)

- Confirmed root `LICENSE` (ISC) exists and `package.json`/`pyproject.toml`/csproj all declare
  ISC (v1 Risk 4 closed).
- Confirmed `ci.yml` uses `node-version: 24`, read-only `permissions`, `persist-credentials:
  false`, and a fan-in `gate` job (v1 Risk 3 closed; strengths recorded).
- Confirmed CHANGELOG current through BACKLOG-051/054/055 + P-04/P-07 (v1 Risk 5 closed).
- Confirmed the SUD-20 tracked-order path and Then-step invariants across all three Stacks by
  reading `orchestration.steps.ts`, `test_basic_sudoku_solver_logic.py`,
  `BasicSudokuSolverLogicSteps.cs`, the three `UseSudokuSolver` abilities, and `SudokuSolver.ts`
  `hiddenSingles()` (structural-soundness finding, I-3).
- `CLAUDE.md` line 15 vs line 229 DR-range contradiction confirmed by direct read (Risk 2).
- ESLint/Prettier `app_src/`-only scope confirmed in `package.json` and `eslint.config.js`
  (Risk 1). No `.npmrc` present in the Stack directory (Risk 4).
- `docker-compose.yml` parity service image `powershell:7.4-ubuntu-22.04` confirmed (Risk 3).

## Note on the caller's coupling caveat

The task instructed that where validation would build inside a sibling project's working tree
(registry coupling note), the static source should be reviewed instead of running that build gate.
No such cross-tree build arose for this project - all gates and suites run entirely within this
repository's own tree - so no build gate was skipped on coupling grounds. DEMOAPP003 was the only
suite not executed, and that was a local-SDK limitation (I-2), not a coupling avoidance.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z.md)
