# Migration Plans

[<- Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_GEMINI_v1_20260807T1409Z.md) | [Next: Annex ->](ANNEX/VALIDATION_LOG.md)

**Reviewer:** AI assistant (Gemini)  
**Date:** 2026-08-07T14:09Z  

## Plan 1: Single Source of Truth for Features

- **Current Status:** Complete. Canonical Gherkin specifications reside in `features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature`.
- **Strategy:** All feature modifications occur in `features-shared/` first and are propagated to demo applications.
- **Enforcement:** `.batch/check-step-text-parity.ps1` and `.batch/generate-feature-parity-report.ps1` assert step text and scenario count equality across TypeScript, Python, and C#.

## Plan 2: Docker Compose for Local Development

- **Current Status:** Complete. `docker-compose.yml` provides multi-container orchestration.
- **Services Defined:** `demoapp001-tests`, `demoapp002-tests`, `demoapp003-tests`, `parity-checks`, `demoapp001-api`, and `performance-benchmarks`.
- **Reproducibility:** Isolates test execution in Linux environments matching GitHub Actions CI (`ubuntu-latest` / PowerShell 7.5).

## Plan 3: GitHub Actions / Workflow CI Integration

- **Current Status:** Complete. Defined in `.github/workflows/ci.yml` and `.github/workflows/pages.yml`.
- **Pipeline Structure:** Separate jobs for TypeScript, Python, and C# stacks, culminating in a required aggregate `gate` fan-in job.
- **Evidence & Governance:** Emits JUnit, LCOV/Cobertura, and audit reports (`.results/`) retained for 7 days; enforces dependency vulnerability checks under DR-039.

---
[<- Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_GEMINI_v1_20260807T1409Z.md) | [Next: Annex ->](ANNEX/VALIDATION_LOG.md)
