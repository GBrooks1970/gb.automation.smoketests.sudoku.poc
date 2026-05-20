# Comprehensive Structural Review

**Project:** `gb.automation.smoketests.sudoku.poc`
**Reviewer:** AI assistant (CLAUDE Sonnet 4.6)
**Review Date:** 2026-05-18
**Reference Architecture:** v1.13 (accepted 2026-05-18)
**Active Stack:** `DEMOAPP001_TYPESCRIPT_CYPRESS`
**Format:** GitHub-flavored Markdown

---

## Table of Contents

1. [First-Pass Structural Observations](#first-pass-structural-observations)
2. [Risks and Issues (High to Low)](#risks-and-issues-high-to-low)
3. [Overall Summary](#overall-summary)
4. [Future Work](#future-work)

---

## First-Pass Structural Observations

### What Works Well

- **Layer separation is fully realised.** The five-layer RA model (Feature -> Steps -> Tasks/Questions -> Abilities -> Subject App) is implemented end-to-end. Step definitions are thin -- they call `actor.attemptsTo()` and `actor.answer()` and make a single assertion. No business logic leaks into Layer 2.

- **Canonical Feature Store is properly established.** `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature` is the single source of truth. The Stack-local copy in `tests/features/` carries the `@stack-demoapp001` addition without touching canonical content.

- **Memory key parity rule is satisfied.** All six constants in [memory-keys.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/support/memory-keys.ts) satisfy the `CONSTANT_NAME = 'CONSTANT_NAME'` identity rule required by RA §8.1.

- **Decision register is thorough and authoritative.** DR-001 through DR-028 cover every structural choice including documented divergences from the RA blueprint (dot-prefix convention, DR-001), Stack directory naming (DR-016), and review output location (DR-014). The register is the project's strongest governance artefact.

- **Orchestration script meets the RA §9.2 metrics contract.** [run-demoapp001.ps1](../.batch/run-demoapp001.ps1) produces both a key-value `.txt` file and a markdown `.md` summary, names both with a UTC timestamp, and emits `OverallExitCode`. Retention cleanup correctly preserves markdown summaries while purging old log files.

- **Full template inventory is present.** All 17 required templates listed in RA Appendix A exist under `DOCS/.templates/`. Template mandate compliance is complete.

- **Stack-level documentation set is complete.** `docs/architecture.md`, `docs/screenplay-guide.md`, `docs/qa-strategy.md`, and `docs/README.md` all exist per RA §10.2.

- **Automated parity tooling for criteria 1 and 2 exists.** `.batch/generate-feature-parity-report.ps1` handles criterion 1 (feature file presence and body parity). `.batch/check-memory-key-parity.ps1` handles criterion 2.

- **All 43 scenarios pass. Zero `@pending` items.** The current Stack is at 100% implementation with 241 steps.

### What Raises Concern

- **The `UseSudokuSolver` Ability has grown well beyond its RA-specified scope.** At 399 lines it is part ability, part test-fixture library, part validation engine. This is the most significant structural concern in the codebase.

- **No CI/CD pipeline exists.** The RA mandates CI gates (§9.4). This is an acknowledged Open item (BACKLOG-004) but it means every RA gate requirement (build, lint, test, parity) exists only as a local manual step with no enforcement on pull requests.

- **Step-text parity is not automated.** RA §8.4 criterion 3 is designated MUST be automated per DR-027. BACKLOG-022 is Open. There is no script that diffs individual step text between canonical and Stack-local files.

- **The feature parity report's summary line terminology does not match the RA §9.4 CI gate specification.** The RA says a pipeline MUST fail if `Overall result: DRIFT` or `Overall result: MISSING` appears. The report script writes `Overall result: PASS` or `Overall result: FAIL`. A text-based CI gate written against the RA's specified strings would never trigger.

- **Serenity/JS reporters are not configured.** The `crew: []` in [configure.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/support/configure.ts) produces no living documentation output. The framework is used only for the Screenplay pattern; its primary differentiator (HTML living-doc reports) is absent.

- **Two metadata fields in governance documents are stale.** The `decision-register.md` header shows `Last Updated: 2026-05-16` while DR-021 through DR-028 date to 2026-05-18. The backlog header references `reference-architecture.md v1.9 Section 10.1` while the governing version is v1.13.

---

## Risks and Issues (High to Low)

---

### Risk 1 -- No CI/CD Pipeline (Critical)

**Nature:** RA §9.4 requires CI gates for every Stack. Without a pipeline, none of the following are enforced on pull requests: build (`npm run build`), lint (`npm run lint`), test (`npm test`), feature parity report (`.batch/generate-feature-parity-report.ps1`), or memory key parity check. The `OverallExitCode` contract exists only in a script that no automated system invokes.

**Current state:** BACKLOG-004 is `Open`. No `.github/workflows/` directory exists.

**Impact:** Any broken build or test regression can be merged to the main branch without detection. Feature parity drift between `features-shared/` and the Stack-local copy cannot be caught automatically. All RA-mandated gates are purely local and voluntary.

**Required refactor:**

Create `.github/workflows/ci.yml` implementing the four gates required by RA §9.4 in order:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  demoapp001:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: demo-apps/demoapp001-typescript-cypress
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: demo-apps/demoapp001-typescript-cypress/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Gate 1 -- Build
        run: npm run build

      - name: Gate 2 -- Lint
        run: npm run lint

      - name: Gate 2b -- Format check
        run: npm run format:check

      - name: Gate 3 -- Test suite
        run: npm test

      - name: Gate 4 -- Feature parity report
        shell: pwsh
        working-directory: ${{ github.workspace }}
        run: |
          .\.batch\generate-feature-parity-report.ps1
          if ($LASTEXITCODE -ne 0) { exit 1 }

      - name: Gate 4b -- Memory key parity
        shell: pwsh
        working-directory: ${{ github.workspace }}
        run: .\.batch\check-memory-key-parity.ps1

      - name: Upload metrics artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-metrics-${{ github.run_number }}
          path: .results/
          retention-days: 7
```

Close BACKLOG-004 once merged and add the CI badge to `README.md`.

---

### Risk 2 -- `UseSudokuSolver` Ability Layer Violation (High)

**Nature:** RA §3.2 defines an Ability as a component that "encapsulates the tool or client used to interact with the Subject Application" and "exposes a minimal, stable interface that Tasks can call." The current [UseSudokuSolver.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/abilities/UseSudokuSolver.ts) contains the following categories of logic that do not belong in an Ability:

- **Grid manipulation helpers** (lines 118-258): `setupAlmostCompleteColumn`, `setupAlmostCompleteBlock`, `setupMultipleEmpties`, `setupRowMissingDigit`, `setupColumnMissingDigit`, `setupBlockFourEmpties`, `setupHiddenSingleInBlock`, `setupDigitInRow`, `setupTargetCell`, `addValuesToRow`, `addValuesToColumn`, `addValuesToBlock`, `setupThreeCandidates`, `setupThreeNakedSingles`, `setupNamedGridState`, `setupWithDuplicateInRow`, `setupMultipleSolvers` -- these are test fixture builders, not ability interface calls.

- **Duplicate validation logic** (lines 312-365): `isValidPlacement` and `isValidSolution` replicate constraint-checking logic that already lives in the subject application. When solver logic changes, this copy can silently diverge.

- **Compound operations** (lines 372-385): `solveFirstAndCheckIsolation` mixes test assertion intent with Ability invocation, blurring the Task/Question boundary.

The Ability currently holds 17 private state fields and 40+ public methods. By comparison, a well-bounded Ability should have roughly one-to-one correspondence with the subject application's public interface.

**Impact:** Any change to test scenario setup requires modifying the Ability class rather than Task files, making the Ability a coupling point between scenarios. The private state fields (`_multipleSolvers`, `_gridSnapshot`, `_targetCell`) interleave with Memory keys, creating two competing state channels.

**Required refactor:**

Move setup helpers to a dedicated module, keeping the Ability slim:

```text
tests/screenplay/
  abilities/
    UseSudokuSolver.ts          <-- keep: solver lifecycle, algorithm invocations, accessors only
  fixtures/
    GridFixtures.ts             <-- new: all setupXxx() methods as pure functions
  tasks/
    SetupGridState.ts           <-- already exists; call GridFixtures from here, not Ability
```

The Ability should expose only:

```typescript
// Core lifecycle
initialise(name: string, grid?: number[][]): void
getSolver(): SudokuSolver

// Algorithm invocations
applyUnitCompletion(): void
applyHiddenSingles(target: number): void
applyNakedSingles(): void
solvePuzzle(): void

// Accessors (read-only state)
get algorithmMadeProgress(): boolean
get result(): string
```

All grid mutation helpers become pure functions in `GridFixtures.ts` that accept a `SudokuSolver` reference from the Task. Validation helpers (`isValidPlacement`, `isValidSolution`) should be delegated to the subject application or moved to a test-specific utility module, not live inside the Ability.

---

### Risk 3 -- Step-Text Parity Checker Absent (High)

**Nature:** RA §8.4 criterion 3 states that Gherkin step text in Stack-local feature files must match canonical text exactly, and that this MUST be verified by an automated tool (DR-027). BACKLOG-022 is `Open`. The feature parity report script compares whole-file bodies, but does not diff individual step lines within a scenario. A step text change in the canonical file that propagates incorrectly to the Stack-local copy (or not at all) would not be detected.

**Impact:** Step text drift is the highest-frequency silent parity failure at scale. With two or more Stacks, one Stack's step definitions can fall out of sync with canonical step text and all tests can still pass because step matching is framework-internal.

**Required refactor:**

Create `.batch/check-step-text-parity.ps1`:

```powershell
# Extracts all non-tag, non-blank lines from a .feature file.
function Get-StepLines($path) {
  Get-Content $path | Where-Object { $_ -notmatch '^\s*@' -and $_.Trim() -ne '' }
}

$canonical = Get-ChildItem "features-shared" -Recurse -Filter "*.feature"
$drift = $false

foreach ($cf in $canonical) {
  $stackCopy = Get-ChildItem "demo-apps/demoapp001-typescript-cypress/tests/features" `
    -Recurse -Filter $cf.Name | Select-Object -First 1

  if (-not $stackCopy) {
    Write-Host "MISSING: $($cf.Name)"
    $drift = $true
    continue
  }

  $canonLines = Get-StepLines $cf.FullName
  $stackLines = Get-StepLines $stackCopy.FullName

  $diff = Compare-Object $canonLines $stackLines
  if ($diff) {
    Write-Host "DRIFT in $($cf.Name):"
    $diff | ForEach-Object { Write-Host "  $($_.SideIndicator) $($_.InputObject)" }
    $drift = $true
  }
}

exit $(if ($drift) { 1 } else { 0 })
```

Wire this into the CI pipeline as Gate 4c alongside the feature parity report.

---

### Risk 4 -- Feature Parity Report Terminology Mismatch with RA CI Gate Spec (Medium)

**Nature:** RA §9.4 specifies: "The CI pipeline MUST fail if `Overall result: DRIFT` or `Overall result: MISSING` appears in the report output." The [generate-feature-parity-report.ps1](../.batch/generate-feature-parity-report.ps1) script (line 78) writes `Overall result: PASS` or `Overall result: FAIL`. The strings `DRIFT` and `MISSING` appear only in the per-file table, not in the summary line. A text-scanning CI gate written literally against the RA specification would never trigger.

**Impact:** Latent defect. When CI is wired (Risk 1 remediated), any text-based gate implementation following the RA spec literally will not work. Only an exit-code-based gate would function correctly. This is low-severity now but will cause confusion when CI is authored.

**Required refactor:**

Update the summary line in `generate-feature-parity-report.ps1` to use the RA-specified terminology when drift is present:

```powershell
# Replace:
$lines.Add("${b}Overall result:${b} $(if ($overallPass) { 'PASS' } else { 'FAIL' })")

# With:
if ($overallPass) {
  $lines.Add("${b}Overall result:${b} PASS")
} elseif ($missing -gt 0) {
  $lines.Add("${b}Overall result:${b} MISSING")
} else {
  $lines.Add("${b}Overall result:${b} DRIFT")
}
```

Also update the `Write-Host` summary at the bottom to emit the matching string:

```powershell
$summaryResult = if ($overallPass) { 'PASS' } elseif ($missing -gt 0) { 'MISSING' } else { 'DRIFT' }
Write-Host "Overall result: $summaryResult"
```

---

### Risk 5 -- `BACKLOG.md` Filename Violates DR-020 (Medium)

**Nature:** DR-020 mandates kebab-case for all authored documents, with three fixed exceptions: `README.md`, `CHANGELOG.md`, `CLAUDE.md`. The backlog file is stored at `DOCS/.planning/BACKLOG.md` (uppercase) but the CLAUDE.md, the RA, the backlog header itself, and the naming-conventions document all reference it as `DOCS/.planning/backlog.md` (lowercase). The authoritative path field inside the file states `DOCS/.planning/backlog.md`.

**Impact:** On a case-sensitive filesystem (Linux CI runners), path references to `DOCS/.planning/backlog.md` in scripts or documentation will fail to resolve. This is a latent defect that becomes a real failure when the CI pipeline (Risk 1) runs on an Ubuntu runner.

**Required refactor:**

Rename the file using `git mv`:

```powershell
git mv "DOCS/.planning/BACKLOG.md" "DOCS/.planning/backlog.md"
```

Verify no other references use the uppercase form:

```powershell
Select-String -Recurse -Pattern "BACKLOG\.md" -Include "*.md","*.ps1","*.yml" .
```

---

### Risk 6 -- Serenity/JS Reporters Not Configured (Medium)

**Nature:** The [configure.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/support/configure.ts) file sets `crew: []`, meaning Serenity/JS produces no reports beyond what Cucumber emits natively. Serenity/JS's primary value proposition is its HTML living documentation (the Serenity BDD report). The project has adopted the Screenplay pattern and Serenity/JS as the framework, but is receiving none of its output artefact benefits.

**Impact:** No living documentation is produced. Test failures produce only Cucumber's native text output rather than Serenity's richer contextual failure reports. This is particularly relevant for onboarding future Stack authors and demonstrating pedagogical content.

**Required refactor:**

Install the Serenity reporter packages and configure them:

```bash
npm install --save-dev @serenity-js/serenity-bdd
```

Update `configure.ts`:

```typescript
import { configure, ArtifactArchiver } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { SudokuActors } from '../actors/SudokuActors';

configure({
  crew: [
    ArtifactArchiver.storingArtifactsAt('.results/serenity'),
    new SerenityBDDReporter(),
  ],
  actors: SudokuActors,
});
```

Add the Serenity BDD report generation step to the orchestration script. Report output should be written to `.results/serenity/` and gitignored like `.results/`.

---

### Risk 7 -- Decision Register Metadata Fields Are Stale (Medium)

**Nature:** The `decision-register.md` header reads `Last Updated: 2026-05-16`. DR-021 through DR-028 were all added on 2026-05-18. Any tooling or agent that reads the header to determine currency will see an incorrect date. Similarly, the backlog header references `reference-architecture.md v1.9 Section 10.1` when the active RA is v1.13.

**Impact:** Low functional impact now. Medium risk for agents (including future AI assistants) that use header metadata to determine whether to trust cached knowledge versus re-reading documents.

**Required refactor:**

In [decision-register.md](../decision-register.md), update:

```markdown
**Last Updated:** 2026-05-18
```

In [DOCS/.planning/backlog.md](../DOCS/.planning/backlog.md), update:

```markdown
**Governed by:** `reference-architecture.md` v1.13 Section 10.1
```

---

### Risk 8 -- DR-010 Not Marked as Superseded (Medium)

**Nature:** DR-010 formally accepted `DOCS/.review/` as the code review output location. DR-014 subsequently moved this to the repository-root `.review/`. However, DR-010 remains marked `Status: Accepted` with no forward reference to DR-014. Per RA §10.6: "A `Superseded` entry MUST contain a forward reference to its replacement."

**Impact:** The decision register contains two accepted decisions pointing to different code review locations. An agent reading the register in order would see DR-010 as valid authority for `DOCS/.review/`.

**Required refactor:**

Update DR-010's status field:

```markdown
**Status:** Superseded by DR-014 -- 2026-05-16
```

Add a forward reference note to DR-010's Consequences section identifying DR-014 as the replacement and the reason (v1.3 compliance migration to root `.review/`).

---

### Risk 9 -- Magic String Actor Name in Step Definitions (Low)

**Nature:** The string `'Solver'` is repeated across all 10+ step definition files as the argument to `actorCalled('Solver')`. This string is not extracted to a shared constant. If the actor persona name ever changes, it must be located and updated manually across every step definition file.

**Impact:** Low probability of change, but high blast radius when changed. The actor name is semantically significant to Serenity/JS -- it appears in reports and stack traces.

**Required refactor:**

Create `tests/screenplay/support/actors.ts`:

```typescript
export const SOLVER_ACTOR = 'Solver';
```

Replace all `actorCalled('Solver')` occurrences across step definition files:

```typescript
import { SOLVER_ACTOR } from '../support/actors';
// ...
actorCalled(SOLVER_ACTOR)
```

---

### Risk 10 -- `isValidPlacement` Logic Duplication (Low)

**Nature:** [UseSudokuSolver.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/abilities/UseSudokuSolver.ts) lines 312-328 contain a private `isValidPlacement` method that implements the same row/column/block constraint check that already exists within `SudokuSolver`'s internal logic. The `isValidSolution` method (lines 341-365) similarly reimplements full grid validation.

**Impact:** When solver constraint logic changes, this private copy in the Ability does not update automatically. Validation tests could pass while the solver applies different constraint rules internally.

**Required refactor:**

Expose `isValidPlacement(row, col, value)` on `SudokuSolver` in `app_src/` and delegate from the Ability:

```typescript
// In SudokuSolver.ts (app_src)
isValidPlacement(row: number, col: number, value: number): boolean {
  // existing constraint logic, extracted from internal usage
}
```

```typescript
// In UseSudokuSolver.ts
validateAndStore(row: number, col: number, value: number): void {
  this._validationResult = this.getSolver().isValidPlacement(row, col, value)
    ? 'VALID' : 'INVALID';
}
```

---

### Risk 11 -- Context-Only Step Accepts Discarded Parameter (Low)

**Nature:** In [unitCompletion.steps.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/unitCompletion.steps.ts) line 27:

```typescript
Given('the missing digit is {int}', async (_digit: number) => {
  // Context only -- digit is determined by grid setup
});
```

The step accepts a digit value from the Gherkin (`And the missing digit is 7`) but ignores it. The "missing 7" is hardcoded in `setupAlmostCompleteColumn()` inside the Ability. The Gherkin implies parameterisation that does not exist.

**Impact:** If a test author changes the Gherkin to `And the missing digit is 5`, nothing changes in execution. This is a silent no-op that misleads future scenario authors about the step's actual behaviour.

**Required refactor:**

Pass the digit through to `setupAlmostCompleteColumn` so the grid is built around the specified missing digit, making the step genuinely parameterised. This requires the Ability helper to accept the missing value rather than hardcoding `[1,2,3,4,5,6,8,9]`.

---

### Risk 12 -- Sprint Roadmap Is Materially Stale (Low)

**Nature:** The Sprint Roadmap table in the backlog shows Sprint 6+ listing "RA-001 through RA-006" as `Open`, while all ten RA items (RA-001 through RA-010) are `Resolved`. Sprint 2 and Sprint 3 statuses list items that have been resolved. Dates for Sprints 2 and 3 are past their end dates relative to 2026-05-18.

**Impact:** Low functional impact. Any agent or stakeholder reading the roadmap to determine current focus will receive misleading information.

**Required refactor:**

Mark Sprint 2 and Sprint 3 as `Completed`. Update Sprint 4 and Sprint 5 with accurate current open items. Remove all RA items from the Sprint 6+ row.

---

## Overall Summary

### Design and Structural Quality

**Strengths:**

- The five-layer RA model is genuinely implemented, not just documented. Steps are thin, Tasks carry business logic, Questions are side-effect-free, and Abilities isolate the framework boundary. This is not common in real projects and is the most significant positive finding of this review.

- The decision register is the project's most valuable artefact. With 28 entries covering every structural choice, documented divergences (DR-001 dot-prefix, DR-003 in-process surface), and supersession chains, it provides full provenance for every current rule. No other comparable project at this scale maintains this discipline.

- The governance loop -- backlog -> decision register -> reference architecture -- is fully closed. Every RA migration item (MIG-01 through MIG-13) and every RA improvement item (RA-001 through RA-010) traces to a DR entry and a backlog status change. The project governs itself according to its own published rules.

- Parity tooling (criteria 1 and 2) exists and is wired into the orchestration script. Feature presence and memory key parity are automatically verifiable today. This is ahead of most single-Stack projects.

- The subject application is correctly designed for `@util` testing: deterministic, importable, stateless across instantiations, and deep-copies its input grid. `SudokuSolver.origGrid` preservation is a textbook implementation of the RA §6.0 requirement.

**Weaknesses:**

- The Ability layer has grown past its RA contract. `UseSudokuSolver` is functioning simultaneously as an Ability, a test fixture library, and a validation engine. At 399 lines with 17 private fields and 40+ methods, it is the largest file in the Screenplay layer and absorbs changes that should be distributed across Tasks and fixture utilities.

- Serenity/JS reporting is not active. The project's tooling choice (Serenity/JS over plain Cucumber) was made specifically to produce living documentation. With `crew: []`, the output is identical to plain Cucumber. The framework investment is not being realised.

- No CI pipeline means no automated enforcement of any RA-mandated gate. The three automated parity tools exist but are run manually. Their value is contingent on discipline rather than structure.

### Main Highlights

- **43 scenarios, 241 steps, all passing.** The implementation is complete and stable. Zero `@pending` gaps is an exceptional state for a project still building its governance layer.

- **RA v1.13 is the most complete version of the reference architecture yet.** Ten structural improvements (RA-001 through RA-010) have been incorporated since v1.3, covering `@util` surface formal definition, CI/CD requirements, automated parity enforcement, feature change governance, test data management, naming convention correction, document name conflict resolution, retention policy correction, parity verification method table, and shared packages directory rules.

- **The dot-prefix convention (DR-001) is the project's most visible deviation from RA defaults.** It is well-reasoned, consistently applied, and formally documented. Any tooling authored against RA-literal paths (`DOCS/architecture/`, `DOCS/planning/`) will need configuration adjustment.

- **BACKLOG-022 (step-text parity checker) is the most actionable open item** after CI/CD. It is a short script (see Risk 3 remediation) that closes a MUST-level RA gap.

### Compliance to Reference Architecture v1.13

| RA Section | Requirement | Status | Notes |
|------------|-------------|--------|-------|
| §4 Directory structure | Required layout | Compliant (via DR-001 mapping) | Dot-prefix divergence documented |
| §4.4 Shared packages | Optional, rules if used | Not applicable | No `packages/` directory used |
| §5.1 Canonical feature store | Single source of truth | Compliant | `features-shared/` established |
| §5.2 Feature distribution | Stack copies with local tags | Compliant | Body parity verified by script |
| §5.3 Tag taxonomy | `@util`, `@stack-demoapp001` | Compliant | |
| §5.5 Feature change governance | Breaking change gate | Compliant (documented) | Only one Stack active |
| §5.6 Test data management | Stack-local data, read-only | Compliant | `puzzles.json` is Stack-local and read-only |
| §6.0 `@util` surface contract | In-process, deterministic | Compliant | |
| §8.1 Memory key parity | Name equals value | Compliant | 6 keys, all verified |
| §8.2 Step definition shape | Parameterised | Mostly compliant | Risk 11: one context-only step |
| §8.4 Parity verification | Automated for criteria 1-3 | Partial | Criterion 3 not yet automated (BACKLOG-022) |
| §9.2 Metrics collection | Two formats, timestamped | Compliant | |
| §9.3 Results archival | 7-day retention, summaries preserved | Compliant | |
| §9.4 CI/CD pipeline gates | Four required gates | Non-compliant | BACKLOG-004 Open |
| §10.1 Repo-level documents | README, CHANGELOG, backlog, DR | Compliant | |
| §10.2 Stack-level docs | 4 required docs | Compliant | All present |
| §10.3 Architecture documents | 4 cross-cutting specs | Compliant | Under `DOCS/.architecture/` |
| §10.4 AI agent instruction file | CLAUDE.md with required sections | Compliant | |
| §10.5 Template mandate | All templates present | Compliant | 17 templates present |
| §10.6 Decision register | 5-field entries, immutable once accepted | Mostly compliant | DR-010 not marked Superseded (Risk 8) |
| §10.7 Code review directory | Root `.review/` | Compliant | Per DR-014 |
| §10.8 Implementation logs | Under `DOCS/.implementation-logs/` | Compliant | Per DR-017, DR-019 |
| §10.9 Naming conventions | `DOCS/.design/naming-conventions.md` | Compliant | kebab-case (DR-020) |

**Overall compliance grade: High.** Two MUST-level gaps exist: §9.4 (CI/CD) and §8.4 criterion 3 (step-text parity automation). Both are tracked in the backlog. All other MUST requirements are met.

### Pedagogical Content and Value

This repository is an unusually strong pedagogical artefact for the following reasons:

- **The Reference Architecture is self-improving.** The project contains its own architecture document that has been revised 13 times through a formal decision process. Readers can trace every architectural change from v1.0 to v1.13 through the decision register. This is a rare example of an architecture that governs itself.

- **The decision register teaches decision-making, not just decisions.** Each entry includes Context, Decision, Consequences, and Alternatives Considered. Reading the register from DR-001 to DR-028 is a tutorial in how to navigate technical trade-offs in a BDD automation project.

- **The five-layer implementation is clean enough to use as a reference.** The step definitions, Tasks, Questions, and Abilities each do exactly one thing. A learner reading [unitCompletion.steps.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/step_definitions/unitCompletion.steps.ts) alongside [ApplyAlgorithm.ts](../demo-apps/demoapp001-typescript-cypress/tests/screenplay/tasks/ApplyAlgorithm.ts) can understand the Layer 2 to Layer 3 boundary in under five minutes.

- **The subject application is an ideal teaching vehicle.** Sudoku solving with three deterministic algorithms provides enough complexity for meaningful test scenarios without the noise of a real business domain.

- **The parity scripts demonstrate real governance tooling.** Learners can run `.batch/generate-feature-parity-report.ps1` and see immediately whether their feature files are in sync.

**Limitation:** The Ability layer violation (Risk 2) is the one area that a learner should be cautioned against replicating. The current `UseSudokuSolver` is a practical compromise that evolved under real project pressure, but it teaches the wrong lesson about the Ability boundary.

---

## Future Work

### Potential Future Work

**Near-term (Sprint 4-5):**

- **BACKLOG-004 -- GitHub Actions CI/CD.** Highest-priority gap. Remediation provided in Risk 1 above.

- **BACKLOG-022 -- Step-text parity checker.** Second-highest parity gap. Script template provided in Risk 3 above.

- **BACKLOG-008 -- Audit Trail Feature.** Design document exists in `DOCS/.design/audit-trail-feature.md`. Adding `AuditLogger` and `AuditFormatter` would enable a new Gherkin scenario group covering solver step recording.

- **BACKLOG-007 -- Decouple Console Output.** The `IOutput` interface extraction prepares the codebase for the REST API wrapper. Low effort, high structural value.

- **Serenity/JS reporter configuration** (Risk 6 remediation). Enabling the Serenity BDD HTML report makes the project's living documentation visible.

**Medium-term (Sprint 5-6):**

- **BACKLOG-009 -- REST API Wrapper.** Introduces the `@api` surface type and a second Ability (`CallAnApi`), providing the first test of multi-surface support.

- **BACKLOG-020 -- Python Stack (DEMOAPP002).** The canonical feature files are ready. Onboarding Python activates the multi-Stack parity model, requiring the memory key parity checker to compare two Stacks.

- **BACKLOG-018 -- Web UI Solver Visualisation.** Natural extension of the REST API. Introduces the `@ui` surface type.

**Long-term:**

- **BACKLOG-021 -- C# Stack (DEMOAPP003).** Completes the three-language parity demonstration.

- **BACKLOG-011 -- Performance Benchmarking Suite.** With three Stacks, performance comparison across languages is a natural artefact of the parity model.

- **BACKLOG-014 -- Advanced Solving Techniques.** Naked Pairs, X-Wing, and Swordfish require new Gherkin scenarios (breaking changes per §5.5) and would test the feature change governance process under real conditions.

### Potential Legacy Debt Work

- **Ability layer refactor (Risk 2).** `UseSudokuSolver` must be split before a second Stack is onboarded. The Python equivalent of the current file would be a 400-line class full of grid setup functions, making parity comparison meaningless.

- **Context-only step fix (Risk 11).** The `the missing digit is {int}` step should be made genuinely parameterised before the feature file is consumed by a second Stack. If left as a no-op, the Python Stack will implement the same no-op and the pattern propagates.

- **Feature parity report terminology (Risk 4).** The script output mismatch with the RA CI gate spec must be resolved before CI is wired. Fixing it post-CI requires updating the CI gate configuration at the same time.

- **DR-010 supersession marker (Risk 8).** A five-minute edit to the decision register. Left unfixed, it becomes a point of confusion for every new agent or contributor who reads the register in sequence.

- **Sprint roadmap accuracy (Risk 12).** Each sprint closure should include a roadmap update.

- **`DOCS/.architecture/` path vs RA blueprint path.** The RA blueprint shows `DOCS/architecture/` (no dot). As the RA adds more normative references to specific paths under `DOCS/architecture/`, each new RA version must be checked for path mismatches with the dot-prefix convention. Consider whether DR-001 is worth the ongoing reconciliation cost as the RA matures.

---

*Review produced against Reference Architecture v1.13, accepted 2026-05-18. All section references are to `DOCS/reference-architecture.md`. Risks are numbered in order of highest-to-lowest severity. Remediation steps provided for each risk are normative suggestions; those citing a MUST-level RA clause are compliance requirements.*
