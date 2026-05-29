# Migration Plans

Actionable transition steps to resolve identified structural and documentation gaps.

---

## Phase 1: Resolving the Python Stack Documentation Gap (High Priority)

### Step 1.1 -- Scaffolding Local Python Docs Directory
* Create the target folder [demo-apps/demoapp002-python-pytest/docs/](demo-apps/demoapp002-python-pytest/docs/) if it does not exist.
* Author `README.md` to index the local documentation ecosystem.

### Step 1.2 -- Porting Architecture Specs
* Create `architecture.md` modeling the inner flow of the custom screenplayer loop (`Actor`, `ITask`, `IQuestion`). Use Mermaid diagrams to illustrate the workflow.

### Step 1.3 -- Porting Screenplay Guides and QA Requirements
* Create `screenplay-guide.md` specifying how Python pytest-bdd bindings link Gherkin step expressions to Actor activities.
* Create `qa-strategy.md` outlining validation requirements and custom exceptions.

---

## Phase 2: Standardizing CI Parity Checking (Medium Priority)

### Step 2.1 -- Script Validation Verification
* Confirm that `.batch/check-memory-key-parity.ps1` and `.batch/check-step-text-parity.ps1` execute cleanly with exit code `0` on base Windows/Linux terminals without requiring Docker.

### Step 2.2 -- Appending CI Steps
* Modify `.github/workflows/ci.yml` to insert a dedicated checking step under the verification node:
  ```yaml
  - name: Run Cross-Stack Memory Key Parity Check
    shell: pwsh
    run: ./.batch/check-memory-key-parity.ps1

  - name: Run Cross-Stack Step Text Parity Check
    shell: pwsh
    run: ./.batch/check-step-text-parity.ps1
  ```

### Step 2.3 -- Testing G Actions Parity Verification
* Push modifications to a test branch to verify the CI pipeline executes, reports, and alerts correctly on any mismatch.

---

## Phase 3: Optimizing Test Puzzles Storage (Low Priority)

### Step 3.1 -- Consolidation of Shared Files
* Create a shared root file location: `puzzles-shared/puzzles.json`.
* Populate it with the consolidated list of test puzzles.

### Step 3.2 -- Setting Up Sync Mechanism
* Create a lightweight PowerShell script `.batch/sync-shared-puzzles.ps1` to automatically replicate `puzzles-shared/puzzles.json` out to:
  - `demo-apps/demoapp001-typescript-cypress/puzzles.json`
  - `demo-apps/demoapp002-python-pytest/puzzles.json`
  - `demo-apps/demoapp003-csharp-specflow/puzzles.json`
* Run this script during pre-install phases (or include a check in the parity-verifiers) to ensure local puzzle definitions do not drift from the single source of truth.
