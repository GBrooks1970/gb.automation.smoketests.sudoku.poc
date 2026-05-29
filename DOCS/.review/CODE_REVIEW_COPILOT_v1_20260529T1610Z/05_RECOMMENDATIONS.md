# Recommendations

---

## Recommendation 1 (High Priority) -- Resolve Python Stack Documentation Deficit

* **Action**: Scaffolding local `/docs` folder for the Python pytest-bdd stack.
* **Details**: Create the following files directly inside `demo-apps/demoapp002-python-pytest/docs/`:
  - `README.md`
  - `architecture.md`
  - `qa-strategy.md`
  - `screenplay-guide.md`
  To preserve reference parity, the architecture description should document how a custom `Actor` structure mimics Serenity/JS interactions. The screenplay guide should showcase Pythonic BDD step bindings utilizing decorators and parameterized matches.
* **Benefits**: Restores full structural documentation parity across all active stacks. Newly hired Python QA professionals can get up-to-speed immediately without needing to refer to C# or TypeScript folders for architectural guidance.

---

## Recommendation 2 (Medium Priority) -- Integrate Parity Checks into GitHub Actions CI

* **Action**: Append parity verification steps into `.github/workflows/ci.yml`.
* **Details**: Register standard verification steps inside the CI workflow runner. These should execute:
  1. `.batch/check-memory-key-parity.ps1`
  2. `.batch/check-step-text-parity.ps1`
  Because GitHub Actions runners can natively execute PowerShell Core scripts on standard virtual machines (both Ubuntu and Windows runners), these scripts can be launched with negligible processing overhead.
* **Benefits**: Mitigates risk of unnoticed behavioral or structural drift on remote branch pushes, ensuring that violations of the Reference Architecture's strict screenplay rules break the build.

---

## Recommendation 3 (Low Priority) -- Centralize Test Puzzle Storage

* **Action**: Relocate duplicate `puzzles.json` files to a single canonical folder.
* **Details**: Refactor the multiple identical puzzle files into a single root folder, e.g., `puzzles-shared/puzzles.json`. Adjust local paths or update stack-level Dockerfile build context configurations to copy this file during image extraction. Alternatively, write a small PowerShell utility inside `.batch/` to synchronize modifications from the canonical store out to local stack copies.
* **Benefits**: Removes redundant static information duplicates, eliminating maintenance risk and ensuring that new test puzzle specifications are instantly available to all active stacks.
