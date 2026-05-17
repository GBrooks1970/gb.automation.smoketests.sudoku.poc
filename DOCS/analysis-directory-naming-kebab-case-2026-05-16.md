# Analysis: Renaming UPPER_CASE Directories to kebab-case

**Date:** 2026-05-16
**Author:** Claude Sonnet 4.6
**Subject:** `gb.automation.smoketests.sudoku.poc` — impact of converting UPPER_CASE directory names (e.g. `DEMOAPPS`, `DEMOAPP001_TYPESCRIPT_CYPRESS`) to kebab-case equivalents (e.g. `demo-apps`, `demoapp001-typescript-cypress`)
**Status:** ✅ MIG-13 Complete — all 5 phases done; PR #13 open for merge

---

## 1. Context

### 1.1 What is being proposed

Replace the UPPER_CASE and UPPER_SNAKE_CASE directory names in the repository root and under `DEMOAPPS/` with all-lowercase, hyphen-separated (kebab-case) names. The canonical example given is:

```
DEMOAPPS/                              →   demo-apps/
DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS →   demo-apps/demoapp001-typescript-cypress
```

The scope could extend further:
- `DOCS/` → `docs/`
- `features_shared/` (underscore) → `features-shared/` (hyphen)
- `.batch/`, `.results/`, `.review/` — already lowercase; no change required

### 1.2 Why this question arises

Kebab-case is the de-facto standard for directory names in the Node.js and TypeScript ecosystem. New practitioners joining the project, tooling defaults (create-react-app, Vite, nx, etc.), and modern CI/CD systems all default to lowercase-hyphenated paths. The current UPPER_CASE convention is conspicuous against this backdrop and can create friction when:

- Typing paths in a shell (requires Shift or CapsLock)
- Referencing paths in URLs or CI pipeline YAML
- Working on case-insensitive filesystems (macOS, Windows) where `DEMOAPPS` and `demoapps` are the same path but `git` on a case-sensitive remote (Linux CI) treats them as different

### 1.3 Current naming landscape

| Directory | Current style | Level | Purpose |
|-----------|---------------|-------|---------|
| `DEMOAPPS/` | UPPER_CASE | 1 | Stack group container |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` | UPPER_SNAKE_CASE | 2 | TypeScript Stack |
| `DOCS/` | UPPER_CASE | 1 | Documentation root |
| `features_shared/` | lower_snake_case | 1 | Canonical Feature Store |
| `.batch/` | dot + lowercase | 1 | Orchestration scripts |
| `.results/` | dot + lowercase | 1 | Test output |
| `.review/` | dot + lowercase | 1 | Future code reviews (v1.3) |
| `DOCS/.design/` | dot + lower | 2 | Design documents (authoritative) |
| `DOCS/.planning/` | dot + lower | 2 | Backlog and planning |
| `DOCS/planning/` | lowercase | 2 | RA v1.3 compatibility bridge |

---

## 2. Current Governance Status

### 2.1 What is already decided and recorded

Three Decision Register entries bear directly on directory naming:

| DR | Decision | Relevance |
|----|----------|-----------|
| **DR-001** (Accepted 2026-01-30) | DOCS subdirectories use a leading dot (`.design/`, `.planning/`, etc.) | Established convention for DOCS internals; not for Stack directories |
| **DR-013** (Accepted 2026-05-15) | Add RA-literal compatibility bridges (`DOCS/planning/`, `DOCS/design/`, etc.) | Bridge paths follow Reference Architecture literal names — lowercase |
| **DR-014** (Accepted 2026-05-15) | Root `.review/` for future code review outputs | Lowercase dot-prefix for root tooling dirs |

`DOCS/.design/NAMING_CONVENTIONS.md` documents the UPPER_SNAKE_CASE rule for Stack names. The `reference-architecture.md` v1.3 Section 4 directory blueprint shows Stack directories in `[STACK_NAME]` notation — which is illustrated in the project as `DEMOAPP001_TYPESCRIPT_CYPRESS`. The convention is deliberate and documented.

### 2.2 What is NOT yet decided

No Decision Register entry covers the UPPER_CASE rule for the Stack group container (`DEMOAPPS/`) or the top-level `DOCS/`. The Stack group directory naming was not the subject of a formal decision — it was adopted implicitly.

---

## 3. Impact Analysis

### 3.1 Blast radius by target directory

| Directory | References in codebase | Type of references | Change risk |
|-----------|------------------------|--------------------|-------------|
| `DEMOAPPS` | **65+** across 51 files | Markdown prose, relative paths in TS files, cucumber config, CI-style scripts, code review docs | High |
| `DEMOAPP001_TYPESCRIPT_CYPRESS` | **80+** across 44 files | Markdown prose, `require()` paths in `.ts` files, `tsconfig.json`, `package.json`, orchestration scripts, metrics output | Very high |
| `features_shared` | **25+** across 18 files | Markdown prose, `CLAUDE.md`, feature file paths in test runner config | Medium |
| `DOCS` | **50+** across 30+ files | Markdown links, all `## Authoritative References` tables | High |

**Total minimum changes: ~220 references across ~80 files.**

### 3.2 High-risk reference categories

**TypeScript source paths** — These require exact case on Linux CI even when a Windows/macOS dev machine is case-insensitive:

```typescript
// tests/screenplay/actors/SudokuActors.ts
const PUZZLES_PATH = path.resolve(__dirname, '../../../puzzles.json');
// The ../../.. traversal navigates through DEMOAPP001_TYPESCRIPT_CYPRESS
```

If the directory is renamed on disk but one file is missed, TypeScript compilation succeeds locally but fails on case-sensitive CI.

**Metrics output** — The orchestration runner currently emits:
```
DEMOAPP001_BDD_Tests=43
```
The metric key uses a short identifier, not the full directory name, so this is lower risk — but the runner scripts reference the full path.

**Gherkin feature file paths** — `cucumber.js` tooling config references the Stack path. Any mismatch breaks `npm test`.

**All documentation** — CLAUDE.md, DECISION_REGISTER.md, reference-architecture.md, BACKLOG.md, CHANGELOG.md, NAMING_CONVENTIONS.md, and all design/review documents contain inline references. These are prose risk (broken links, stale text) rather than runtime risk, but they degrade governance quality.

### 3.3 Case-sensitivity trap

The repository lives on a **Windows filesystem** (case-insensitive) and is pushed to GitHub (case-sensitive Linux CI). Renaming `DEMOAPPS` to `demo-apps` on Windows via `git mv` produces a correct rename on the remote. However, a partial rename (some files updated, some not) will work silently on Windows and fail on Linux CI with `ENOENT` or TypeScript path errors.

---

## 4. Consequences

### 4.1 Pros of adopting kebab-case

| # | Benefit | Significance |
|---|---------|--------------|
| 1 | **Ecosystem alignment** — Node.js, TypeScript, npm, and virtually all modern tooling default to lowercase-hyphenated paths. Practitioners join with zero friction. | Medium |
| 2 | **Shell ergonomics** — No Shift key required to type `demo-apps/demoapp001-typescript-cypress`. Tab-completion works without CapsLock. | Low–Medium |
| 3 | **Cross-platform safety** — Lowercase removes the risk of case-mismatch bugs between Windows dev and Linux CI. | Medium |
| 4 | **Consistency with existing lowercase dirs** — `features_shared`, `.batch`, `.results`, `.review` are already lowercase. UPPER_CASE is the outlier. | Medium |
| 5 | **CI/CD YAML friendliness** — Pipeline definitions, matrix strategies, and artifact paths are cleaner without uppercase escaping. | Low (no CI currently) |
| 6 | **Stack 2 readiness** — Establishing the convention now means Stack 2 (Python), Stack 3 (C#) directories are created correctly from day one. | Medium |

### 4.2 Cons of adopting kebab-case

| # | Cost | Significance |
|---|------|--------------|
| 1 | **220+ references to update** — Markdown prose, TypeScript paths, configs, and scripts across ~80 files. High mechanical cost with real risk of missed references. | High |
| 2 | **Git history disruption** — `git log --follow` breaks across the rename for all affected files. Blame and bisect are harder post-migration. | Medium |
| 3 | **Governance overhead** — The UPPER_SNAKE_CASE Stack name convention is in NAMING_CONVENTIONS.md and referenced in DECISION_REGISTER.md. Changing it requires a new DR entry and updates to both documents. | Medium |
| 4 | **Stack name parity risk** — The Reference Architecture §8.1 requires Memory key parity across Stacks. Stack names appear in Memory key prefixes and metric identifiers. Renaming during a single-Stack phase is lower risk than during multi-Stack operation, but must be done cleanly. | Medium |
| 5 | **Windows rename subtlety** — `git mv DEMOAPPS demo-apps` on Windows may need a two-step approach (rename to temp, rename to target) due to filesystem case-insensitivity. | Low–Medium |
| 6 | **Externally shared paths** — Any links in GitHub PRs, issues, or external documentation pointing to the old path structure become stale. | Low (current project scope) |
| 7 | **Disrupts in-flight work** — All feature branches must rebase after the rename commit to avoid merge conflicts at the path level. | Low–Medium |

---

## 5. Reference Architecture Position

The Reference Architecture v1.3 §4 shows the directory blueprint with `[STACK_NAME]` in UPPER_CASE notation and uses the example `DEMOAPP001_TYPESCRIPT_CYPRESS`. However, §4.3 explicitly states:

> "The group directory does not change the canonical Stack name. For example, `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/` still has the Stack name `DEMOAPP001_TYPESCRIPT_CYPRESS`."

This implies the Reference Architecture treats the Stack **name** (which appears in metrics, Memory keys, and the AI Agent Instruction File) as distinct from the **directory name**. In theory, the directory could be `demoapp001-typescript-cypress/` while the canonical Stack name for parity purposes remains `DEMOAPP001_TYPESCRIPT_CYPRESS`. This separation would require explicit documentation in NAMING_CONVENTIONS.md.

---

## 6. Conclusion

### 6.1 Summary position

The benefits of kebab-case are real but incremental — mainly ergonomics and ecosystem alignment. The costs are also real but finite — a one-time migration effort of moderate scope (~220 reference updates, governance document changes, a new Decision Register entry). The project currently has:

- **Zero CI/CD pipelines** — no immediate automation breakage
- **One Stack** — no cross-Stack parity contracts currently active in directory naming
- **Active development** — changes to feature branches would create merge friction

The strongest argument **for** renaming now is that Stack 2 is the next major milestone. Doing the rename before Stack 2 lands means Stack 2 is always created with the correct convention. Doing it after Stack 2 lands doubles the rename blast radius.

The strongest argument **against** renaming now is that the convention is documented, deliberate, and the project is in a stable post-MIG-08 governance state. A rename introduces churn at a moment when the focus should be on Stack 2 readiness (MIG-09 through MIG-12).

### 6.2 Recommendation: Structured adoption — rename before Stack 2 onboarding

**Rename `DEMOAPPS/` and `DEMOAPP001_TYPESCRIPT_CYPRESS/` to kebab-case as a deliberate, bounded migration sprint, scheduled immediately before Stack 2 onboarding begins.** Do NOT rename `DOCS/` — it is a standard project-level capitalized root with no ecosystem-friction issues and 50+ documentation references.

**Rationale:**
1. The case-sensitivity trap (Windows dev / Linux CI) is the strongest technical argument for the rename. With no CI today, the risk is latent but will become active as soon as a CI pipeline is wired.
2. Renaming before Stack 2 is cheaper than renaming after — the blast radius is bounded to the TypeScript Stack.
3. `features_shared` currently uses `lower_snake_case`. Migrating to `features-shared` (kebab) is optional but recommended for consistency.
4. `DOCS/` is a deliberate UPPER_CASE root. Its internal structure follows DR-001 dot-prefix convention. Leave it unchanged.
5. The rename provides an opportunity to formally document the going-forward convention for all future Stack directories.

---

## 7. Implementation Plan

### Phase 0 — Decision gate ✅ Complete 2026-05-16

1. **DR-016 created** in `DECISION_REGISTER.md`:
   - Records the decision to adopt kebab-case for Stack group and Stack directories
   - Distinguishes directory name (filesystem) from canonical Stack name (metrics, Memory keys, parity docs)
   - References this analysis document as evidence
   - Status: `Accepted` — 2026-05-16

2. **`DOCS/.design/NAMING_CONVENTIONS.md` updated**:
   - Quick Reference: split `Stack names` into `Stack filesystem directories (kebab-case)` and `Stack canonical name (UPPER_SNAKE_CASE)`
   - Section 3 Directories: `Stack root directories` row replaced with separate `Stack group container directory` and `Stack directory (filesystem)` rows, both kebab-case; DR-016 note added
   - Section 4 Stack Names: added directory-vs-canonical-name distinction table; clarifies that `DEMOAPP001_TYPESCRIPT_CYPRESS` is the canonical identifier, not the directory path
   - Section 9: `Current next ID` updated to `DR-017`

3. **`DOCS/.planning/BACKLOG.md` updated**:
   - MIG-04 and MIG-05 marked Resolved (2026-05-16, DR-015); Resolved Items table updated
   - MIG-13 added as Open with DR-016, Medium priority, scheduled Sprint 3
   - Summary counts updated: Open 19, In Progress 1, Resolved 14, Total 34
   - Sprint roadmap updated: MIG-13 added to Sprint 3; Sprint 2 updated to reflect MIG-04/05 done

**Acceptance criteria for MIG-13:**
- `DEMOAPPS/` renamed to `demo-apps/`
- `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` renamed to `demo-apps/demoapp001-typescript-cypress/`
- (Optional) `features_shared/` renamed to `features-shared/`
- All file references updated
- `npm test` passes: 43 scenarios, 241 steps
- No broken markdown links (checked via link-checker or manual audit)
- NAMING_CONVENTIONS.md and DR-016 committed in the same batch

---

### Phase 1 — Prepare ✅ Complete 2026-05-16

**Branch:** `refactor/kebab-case-directories` — created from `claude/sudoku-solver-design-f3NRI` HEAD (commit `1619187`).

**Baseline confirmed:** `npm test` run from `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` on branch prior to any rename.
```
43 scenarios (43 passed)
241 steps (241 passed)
0m02.934s
```

**File scan results:** `grep -rl "DEMOAPPS\|DEMOAPP001_TYPESCRIPT_CYPRESS\|features_shared"` across `*.ts`, `*.json`, `*.md`, `*.js`, `*.feature`, `*.ps1` (excluding `node_modules`, `.git`):
- **62 unique files** containing at least one reference
- **256 total reference lines** across those files

**Key finding from scan:** TypeScript source files inside the Stack use `__dirname`-relative path traversal (e.g. `path.resolve(__dirname, '../../../puzzles.json')`), so they are **NOT sensitive to the directory rename**. The `tooling/cucumber.js`, `tsconfig.json`, and `package.json` also use relative paths — they will work correctly after rename without any content change. The actual content-change scope is smaller than the original estimate.

#### Categorised file inventory

**Category A — Runtime critical** (content changes required; will break `npm test` if missed):

| File | References | What to change |
|------|-----------|----------------|
| `.batch/run-demoapp001.ps1` | 1 | `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS` → `demo-apps/demoapp001-typescript-cypress` |

**Category B — Development tooling** (will not break `npm test`; breaks local workflow):

| File | References | What to change |
|------|-----------|----------------|
| `.vscode/launch.json` | 3 | Path strings in debug config |
| `.claude/settings.local.json` | 5 | Absolute path strings in permission allowlist |

**Category C — Inside-Stack docs** (these files MOVE with the directory; self-references inside need updating):

| File | References |
|------|-----------|
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/README.md` | Multiple |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/architecture.md` | Multiple |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/qa-strategy.md` | Multiple |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/README.md` | Multiple |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/screenplay-guide.md` | Multiple |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tooling/README.md` | Multiple |

**Category D — Active governance and live documentation** (prose references; stale after rename; update for accuracy):

| File | Change type |
|------|------------|
| `CLAUDE.md` | Stack inventory, directory blueprint, risk register |
| `README.md` | Quick-start paths |
| `CHANGELOG.md` | Entry references |
| `DECISION_REGISTER.md` | DR prose references |
| `BACKLOG.md` (root) | Item references |
| `DOCS/.planning/BACKLOG.md` | Item detail paths |
| `DOCS/.design/NAMING_CONVENTIONS.md` | Examples in §3 |
| `DOCS/.design/DESIGN_Audit_Trail_Feature.md` | File path examples |
| `DOCS/.design/DESIGN_Naming_Conventions.md` | Path examples |
| `DOCS/.design/DESIGN_REST_API_Wrapper.md` | Path examples |
| `DOCS/.design/DESIGN_Screenplay_Migration.md` | Path references |
| `DOCS/.design/DESIGN_Web_UI_Solver_Visualisation.md` | Path references |
| `DOCS/.algorithm/ALGORITHM_Sudoku_Advanced_Solver.md` | Path references |
| `DOCS/.algorithm/ALGORITHM_Sudoku_Basic_Solver.md` | Path references |
| `DOCS/.algorithm/TEMPLATE_Algorithm.md` | Path references |
| `DOCS/.howto/HOWTO_Debug_SudokuSolver.md` | Path references |
| `DOCS/.howto/TEMPLATE_HowTo.md` | Path references |
| `DOCS/.implementation/IMPL_LOG_2026-01-30_Initial_Project_Creation.md` | Path references |
| `DOCS/.implementation/IMPL_LOG_2026-05-14_Sprint2_Naming_Conventions_And_Testing.md` | Path references |
| `DOCS/.planning/TODO_Audit_Trail_Feature.md` | Path references |
| `DOCS/.planning/TODO_Hidden_Singles_Complete_Implementation.md` | Path references |
| `DOCS/.planning/TODO_REST_API_Wrapper.md` | Path references |
| `DOCS/.planning/TODO_Web_UI_Solver_Visualisation.md` | Path references |
| `DOCS/architecture/orchestration-design.md` | Path references |
| `DOCS/architecture/screenplay-parity-contract.md` | Path references |
| `DOCS/architecture/subject-app-contract.md` | Path references |
| `DOCS/ref-arch-alignment_2026-05-14.md` | Path references |
| `DOCS/ref-arch-alignment_2026-05-15.md` | Path references |
| `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md` | Self-references to old paths |

**Category E — Templates** (update examples for future consistency):

| File |
|------|
| `DOCS/templates/TEMPLATE_Algorithm.md` |
| `DOCS/templates/TEMPLATE_Naming_Conventions.md` |
| `DOCS/templates/TEMPLATE_Readme.md` |
| `DOCS/templates/TEMPLATE_Screenplay_Guide.md` |
| `DOCS/templates/TEMPLATE_Stack_Architecture.md` |
| `DOCS/templates/TEMPLATE_Stack_Readme.md` |
| `DOCS/templates/algorithm.template.md` |
| `DOCS/templates/naming-conventions.template.md` |
| `DOCS/templates/readme.template.md` |
| `DOCS/templates/screenplay-guide.template.md` |
| `DOCS/templates/stack-architecture.template.md` |
| `DOCS/templates/stack-readme.template.md` |

**Category F — Historical review outputs (DO NOT CHANGE):**
Per `reference-architecture.md` v1.3 §10.7, review outputs are read-only once written. These files must not be edited.

| File |
|------|
| `DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_6__20260330T1630Z/07_MIGRATION_PLANS.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/01_EXECUTIVE_SUMMARY.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/02_RISKS_AND_ISSUES.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_5__20260130T2040Z/07_MIGRATION_PLANS.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/02_RISKS_AND_ISSUES.md` |
| `DOCS/.review/CODE_REVIEW_CLAUDE_Sonnet_4_6__20260513T2217Z/03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md` |
| `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z/01_EXECUTIVE_SUMMARY.md` |
| `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z/02_RISKS_AND_ISSUES.md` |
| `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex__20260330T0000Z/03_PROJECT_REVIEWS/PROJECT_001_DEMOAPP001_TypeScript.md` |

**Category G — No content change required** (canonical Stack name references remain correct):

| File | Reason |
|------|--------|
| `DOCS/reference-architecture.md` | References `DEMOAPP001_TYPESCRIPT_CYPRESS` as the canonical Stack name, which is unchanged by DR-016 |
| `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/tests/screenplay/**.ts` | Comment-only references to `DEMOAPP001` as an identifier, not a path |

#### Revised scope summary

| Category | Files | Action |
|----------|-------|--------|
| A — Runtime critical | 1 | Must update (Phase 3, first) |
| B — Dev tooling | 2 | Should update (Phase 3) |
| C — Inside-Stack docs | 6 | Update (moves with directory) |
| D — Active documentation | 29 | Update (Phase 3) |
| E — Templates | 12 | Update (Phase 3) |
| F — Historical reviews | 11 | **DO NOT CHANGE** |
| G — No change needed | ~4 | Skip |
| **Total requiring edits** | **~50** | |

---

### Phase 2 — Filesystem rename ✅ Complete 2026-05-16

Three `git mv` renames executed on `refactor/kebab-case-directories`:

```bash
git mv "DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS" "DEMOAPPS/demoapp001-typescript-cypress"
git mv "DEMOAPPS" "demo-apps"
git mv "features_shared" "features-shared"
```

**Rename verification:** `git diff --cached --name-status` confirmed every file shows `R100` (100% rename similarity — pure rename, no delete+add, full history preserved).

**Result structure:**
```
demo-apps/
  demoapp001-typescript-cypress/   ← was DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS
features-shared/                   ← was features_shared
```

**npm test from new path (pre-content-change validation):**
```
43 scenarios (43 passed)
241 steps (241 passed)
0m02.618s
```
`npm test` passed from `demo-apps/demoapp001-typescript-cypress/` **before any content edits** — confirming the Phase 1 finding: all TypeScript source uses `__dirname`-relative paths and is completely rename-safe. No content changes are needed to the TypeScript source to make tests pass.

---

### Phase 3 — Reference updates ✅ Complete 2026-05-16

**Approach used:** Category-by-category working from runtime-critical outward. TypeScript source files were confirmed rename-safe in Phase 2 (they use `__dirname`-relative paths), so no TS edits were needed.

**Files updated by category:**

| Category | Files updated | Key changes |
|----------|--------------|-------------|
| A — Runtime critical | 1 | `.batch/run-demoapp001.ps1`: stack path |
| B — Dev tooling | 2 | `.vscode/launch.json` (3 refs), `.claude/settings.local.json` (5 refs) |
| C — Inside-Stack docs | 6 | `cd` commands, directory trees, `features_shared` → `features-shared` |
| D — Governance | CLAUDE.md, README.md, CHANGELOG.md, DECISION_REGISTER.md, BACKLOG files + 22 DOCS/ files | All path refs, DR range updated DR-016, MIG status current |
| E — Templates | 12 | `features_shared` → `features-shared` in all template examples |

**Files deliberately NOT changed:**
- `DOCS/.review/**` — historical review outputs, read-only per RA §10.7
- `DOCS/reference-architecture.md` — uses `features_shared` as an illustrative (non-normative) example name; canonical Stack name refs unchanged throughout
- `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md` — historical references in body text describing the OLD state and the migration commands are preserved as-is

**Validation results:**

```
npm test (demo-apps/demoapp001-typescript-cypress/):
  43 scenarios (43 passed)
  241 steps (241 passed)

npm run build: success (exit 0)

.batch/run-demoapp001.ps1 smoke-test:
  BuildExitCode: 0 | TestExitCode: 0 | OverallExitCode: 0
  Metrics written to .results/.metrics/DEMOAPP001_20260516T133812Z.*
```

**Final stale-reference scan:** 0 unintentional stale references. Remaining grep hits are all intentional historical text (DR-016 rename table, MIG-13 checked-off criteria, analysis doc body text).

---

### Phase 4 — Validation ✅ Complete 2026-05-16

#### P4-1 — npm test

```
43 scenarios (43 passed)
241 steps (241 passed)
0m02.565s (executing steps: 0m02.380s)
```
All 43 scenarios pass from `demo-apps/demoapp001-typescript-cypress/`. Zero compilation errors, zero `ENOENT` path errors.

#### P4-2 — npm run build

```
> tsc
BUILD_EXIT: 0
```
TypeScript compilation succeeds. All `__dirname`-relative imports resolve correctly after the rename.

#### P4-3 — Markdown link audit

**Method:** Extracted all relative markdown link targets from the four focus files; tested each against the filesystem.

**Link targets verified as existing:**

| Link target | Status |
|-------------|--------|
| `demo-apps/demoapp001-typescript-cypress/README.md` | ✅ OK |
| `demo-apps/demoapp001-typescript-cypress/tests/features/BasicSudokuSolverLogic.feature` | ✅ OK |
| `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` | ✅ OK |
| `DOCS/.design/NAMING_CONVENTIONS.md` | ✅ OK |
| `DOCS/.planning/BACKLOG.md` | ✅ OK |
| `DOCS/ref-arch-alignment_2026-05-15.md` | ✅ OK |
| `DOCS/architecture/screenplay-parity-contract.md` | ✅ OK |
| `DOCS/architecture/subject-app-contract.md` | ✅ OK |
| `DOCS/architecture/orchestration-design.md` | ✅ OK |
| `.review/README.md` | ✅ OK |

**Stale-link check:** grep for `](DEMOAPPS`, `](features_shared`, `](DEMOAPP001_TYPESCRIPT_CYPRESS` in all four focus files → **0 matches**. No broken links.

#### P4-4 — Orchestration batch script

```powershell
.\.batch\run-demoapp001.ps1
```

Output:
```
BuildExitCode:  0
TestExitCode:   0
OverallExitCode: 0
MetricsTxt: .results\.metrics\DEMOAPP001_20260516T150640Z.txt
MetricsMd:  .results\.metrics\DEMOAPP001_20260516T150640Z.md
```

Metrics content confirms:
```
DEMOAPP001_BDD_ExitCode=0
DEMOAPP001_BDD_Tests=43
DEMOAPP001_BDD_Passed=43
DEMOAPP001_BDD_Failed=0
DEMOAPP001_Build_ExitCode=0
OverallExitCode=0
```

The script correctly locates the Stack at `demo-apps/demoapp001-typescript-cypress/`, builds, runs tests, and writes timestamped metric files to `.results/.metrics/`.

#### Phase 4 verdict: PASS

All four validation gates pass. The migration is complete and production-ready. Phase 5 (PR and merge) is the remaining step.

---

### Phase 5 — Merge and communicate ✅ Complete 2026-05-16

**PR #13:** [refactor: rename Stack directories to kebab-case (MIG-13)](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/13)
- Base: `main` ← Head: `refactor/kebab-case-directories`
- Commits: 5 (Phase 1 preparation, Phase 2 filesystem rename, .gitignore update, Phase 3 reference updates, Phase 4 validation record)
- PR description links to `DOCS/analysis-directory-naming-kebab-case-2026-05-16.md` and DR-016
- Test plan in PR body summarises all four Phase 4 validation gates

**Rebase note** (included in PR description): Any branches based on paths inside the old `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` directory should be rebased onto this PR's merge commit before continuing work.

**Note on parallel branches:** At time of PR creation, `claude/sudoku-solver-design-f3NRI` is at `main` HEAD — no rebase needed for that branch.

---

### Estimated effort

| Phase | Effort |
|-------|--------|
| Phase 0 — Decision gate | 1 hour |
| Phase 1 — Prepare | 30 minutes |
| Phase 2 — Filesystem rename | 30 minutes |
| Phase 3 — Reference updates | 3–4 hours |
| Phase 4 — Validation | 1 hour |
| Phase 5 — Merge | 30 minutes |
| **Total** | **~6–7 hours** |

---

## Appendix A — Files with the highest reference counts

These files require the most careful attention during Phase 3:

| File | Estimated references to update |
|------|-------------------------------|
| `CLAUDE.md` | 20–30 |
| `DECISION_REGISTER.md` | 10–15 |
| `DOCS/.design/NAMING_CONVENTIONS.md` | 5–10 |
| `DOCS/.planning/BACKLOG.md` | 8–12 |
| `CHANGELOG.md` | 10–15 |
| `README.md` | 5–8 |
| All `DOCS/.design/DESIGN_*.md` | 3–5 each |
| All `DOCS/.review/**/*.md` | 2–5 each |
| `tooling/cucumber.js` | 3–5 |
| `tsconfig.json` | 2–4 |
| TypeScript `.ts` Screenplay files | 1–2 each (via `__dirname` traversal) |

## Appendix B — Directories explicitly NOT in scope

| Directory | Reason for exclusion |
|-----------|----------------------|
| `DOCS/` | UPPER_CASE is conventional for documentation roots; 50+ prose references; no ecosystem friction |
| `.batch/` | Already lowercase dot-prefix; no change needed |
| `.results/` | Already lowercase dot-prefix; no change needed |
| `.review/` | Already lowercase dot-prefix; no change needed |
| `DOCS/.design/`, `DOCS/.planning/`, etc. | Governed by DR-001 (dot-prefix convention); already lowercase |
| `DOCS/planning/`, `DOCS/design/`, etc. | RA v1.3 compatibility bridges governed by DR-013 |

---

*This document is an analysis artefact. The binding decision must be recorded in `DECISION_REGISTER.md` as DR-016 before any file changes are made.*
