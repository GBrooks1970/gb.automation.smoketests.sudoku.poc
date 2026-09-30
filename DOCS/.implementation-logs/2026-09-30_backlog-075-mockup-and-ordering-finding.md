# Implementation Log: BACKLOG-075 Parity Page Mock-up, Prototype Gate and Execution-Order Finding

**Date:** 2026-09-30T18:05:00Z
**Session goal:** Build the clickable mock-up of the three-Stack parity evidence page from real local runs, get the owner's review, and record what the prototype gate found.
**Outcome:** Completed. The owner approved the design on 2026-09-30, with one addition (a light/dark theme toggle, as in Markdown Renderer), which was made before this log was written. Nothing in the repository's code, CI or features changed.

This log follows `2026-09-30_backlog-075-reqnroll-results-spike.md`, which is append-only and is not edited.

---

## 1. Primary Request and Intent

**What was asked:** BACKLOG-075's second acceptance criterion (DR-047, "Order of work"): a clickable mock-up built from a real local run of all three Stacks, reviewed by the owner before any CI change.

**Scope that emerged:**
- A prototype results-level gate, to produce real gate output for the page's "The gate fails when it should" section.
- Planted-failure cases in each of the three result formats, to check that non-passed statuses map.

---

## 2. Method

Scripts and outputs lived in the session scratchpad and were not committed. Results came from the local runs recorded in the spike log: DEMOAPP001 and DEMOAPP002 in place, DEMOAPP003 in the `mcr.microsoft.com/dotnet/sdk:10.0` container.

- **Data:** a builder read the three result files and the feature file, grouped the 55 executions into the feature file's 12 banner sections, and read the three step bindings from source (`hiddenSingles.steps.ts:66-71`, `test_basic_sudoku_solver_logic.py:183-186`, `BasicSudokuSolverLogicSteps.cs:153-158`).
- **Prototype gate:** a Python script (`parity.py`) loads the three formats and fails on: differing scenario counts, differing scenario keys or order, differing step text, or any scenario not passed. Keys are (scenario name, occurrence index).
- **Planted changes**, each in a copy with the real results untouched: one word of step text in the Python JSON ("new value" to "updated value"), one step set to failed in the TypeScript JSON, one in the Python JSON, and one step result set to `FAILED` in the Cucumber Messages file.
- **Page:** one self-contained HTML file, published as a private artifact for review. Its script was syntax-checked and smoke-run against a stub DOM. It was not viewed rendered, because the artifact host needs a sign-in the agent does not perform.

---

## 3. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|-------------|
| Order each Stack's results by feature-file order before comparing. For C# that means pickle order, not execution order. | See section 4. NUnit runs Reqnroll scenarios alphabetically, so execution order differs from feature order. | No. It refines the join rule in the spike log. |
| Include a theme toggle on the page that follows the viewer's setting until used, then flips light and dark. | Owner request, modelled on Markdown Renderer's toggle. | No |
| Approve the design as mocked. | Owner decision, 2026-09-30. | No |

---

## 4. Results

### Prototype gate runs
| Case | Exit | Output |
|------|------|--------|
| Clean (real results) | 0 | `scenarios: ts 55, py 55, cs 55` then `PARITY PASS` |
| Step text changed (Python copy) | 1 | `step text DIFFERS from TypeScript in Python: "Identify a Hidden Single in a row" step 6`, with counts still identical |
| Step failed, TypeScript copy | 1 | one scenario not passed, reported as `FAILED` |
| Step failed, Python copy | 1 | one scenario not passed, reported as `FAILED` |
| Step failed, C# copy | 1 | one scenario not passed, reported as `FAILED` |

The failures were planted in the result files. They prove the status mapping and the gate. They do not prove that a genuine failing test writes the expected shape in each format.

### Finding: Reqnroll execution order is alphabetical
The first clean run of the gate failed with `scenario keys or order differ` for C#. The cause: the Cucumber Messages file lists `testCaseStarted` in execution order, and NUnit ran the scenarios alphabetically (the first three were "Audit trail attributes changes to the correct algorithm", "Audit trail captures all cell changes for a solved puzzle" and "Complete a 3x3 block with only one missing value"). Feature order is carried by the `pickle` messages. Reading C# results by pickle order fixed it, and the clean run then passed. TypeScript and Python already report in feature order. The spike's comparison did not hit this because it read pickles. An adapter that walks execution order would fail a healthy run.

### Also observed
- `main` was red on the dependency audit when the mock-up was built. By 1170508 it is green again (CI run `36755560842`, Pages run `36755560902`) after PR #80 and BACKLOG-076.

---

## 5. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-logs/2026-09-30_backlog-075-mockup-and-ordering-finding.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `DOCS/.planning/backlog.md` | BACKLOG-075 second criterion ticked; adapter ordering requirement added |
| `DOCS/.implementation-logs/README.md` | Index entry |

No code, CI, feature, puzzle or Stack file changed. The mock-up and scripts are not in the repository.

---

## 6. Lessons Learned

- A gate that runs on real results finds adapter bugs that a file comparison does not. Run the clean case first.
- Do not assume execution order equals source order when a runner parallelises or sorts.
- A smoke run of the page script against a stub DOM caught a wrong keyword in the planted-step text (`Then` for `And`) that a syntax check could not.

---

## 7. Current State at End of Session

**Completed this session:**
- ✅ Mock-up built from real results and approved by the owner.
- ✅ Prototype gate run clean and against four planted changes, with real output.
- ✅ Execution-order requirement recorded.

**Left incomplete / deferred:**
- ⏸️ A genuine failing run per Stack (as opposed to planted statuses) has not been observed.
- ⏸️ The real gate, the fan-in job, the negative check and the page build (BACKLOG-075 criteria 3 to 7).
- ⏸️ Timings on the page are from one local Windows run; CI will supply the real ones.

**New backlog items generated:**
- None.

---

## 8. Next Steps

1. Implement the results-level gate and adapters following `loan-origination-parity`'s `tools/check-parity.mjs`, ordering results by feature-file order.
2. Add the fan-in report job and Pages artefact, with the negative check, then build the page from CI artefacts.
3. Observe a genuine failing scenario per format on a scratch branch before relying on status mapping.

---

*End of Implementation Log*
