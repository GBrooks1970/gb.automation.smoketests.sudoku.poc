# Implementation Log: Python pytest Stack Onboarding

**Date:** 2026-05-19T18:13:08Z
**Session goal:** Resolve BACKLOG-020 by adding the DEMOAPP002 Python pytest-bdd Stack against the canonical Sudoku Gherkin contract.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Update the sprint roadmap so BACKLOG-020 leads the current work, then action BACKLOG-020 with validation and a commit after completion.

**Scope that emerged:**
- Create the Python Stack directory and project configuration.
- Port the Sudoku subject implementation needed for executable `@util` parity.
- Add Python Screenplay-style abilities, tasks, questions, actor memory, and pytest-bdd step definitions.
- Extend parity gates so DEMOAPP002 is checked with DEMOAPP001.
- Update planning and architecture docs to stop describing DEMOAPP002 as only planned.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| Implement a small local Python Screenplay layer rather than introducing a heavier framework | pytest-bdd covers Gherkin execution; the RA contract requires Actor, Ability, Task, Question, and Memory shapes, which are small enough to express directly in Python | No |
| Keep DEMOAPP002 on the current `@util` surface | BACKLOG-020 is a Stack parity item, not an API/UI product-surface item | No |
| Extend existing parity scripts to include DEMOAPP002 by default | Once a second Stack exists, default parity validation should not silently check only DEMOAPP001 | No |

---

## 3. Files Created or Significantly Modified

### Created

| File | Purpose |
|------|---------|
| `demo-apps/demoapp002-python-pytest/pyproject.toml` | Python project and pytest-bdd configuration |
| `demo-apps/demoapp002-python-pytest/app_src/` | Python Sudoku solver, orchestrator, puzzle loader, constants, and audit support |
| `demo-apps/demoapp002-python-pytest/tests/features/BasicSudokuSolverLogic.feature` | Stack-local feature copy tagged `@stack-demoapp002` |
| `demo-apps/demoapp002-python-pytest/tests/screenplay/` | Python Screenplay-style abilities, tasks, questions, fixtures, actor support, and step definitions |

### Modified

| File | Change summary |
|------|---------------|
| `.batch/check-memory-key-parity.ps1` | Added DEMOAPP002 memory-key extraction |
| `.batch/generate-feature-parity-report.ps1` | Added multi-Stack default feature parity reporting |
| `.batch/check-step-text-parity.ps1` | Added multi-Stack default step-text parity checks |
| `.github/workflows/ci.yml` | Added DEMOAPP002 Python pytest job |
| `DOCS/.planning/backlog.md` | Marked BACKLOG-020 resolved and refreshed the sprint roadmap |
| `DOCS/.architecture/screenplay-parity-contract.md` | Marked DEMOAPP002 as current and documented Python ability lookup shape |
| `DOCS/.architecture/subject-app-contract.md` | Added DEMOAPP002 to the active `@util` surface inventory |
| `CLAUDE.md`, `README.md` | Updated stack inventory and usage guidance |

### Deleted

| File | Reason |
|------|--------|
| None | Not applicable |

---

## 4. Bugs and Errors Encountered

### pytest-bdd Tag Marker Warnings

**Symptom:** The Python test run passed but emitted warnings for `@util` and `@stack-demoapp002`.
**Root cause:** pytest-bdd maps Gherkin tags to pytest markers, and the Python project had not registered those markers.
**Fix:** Added marker declarations to `pyproject.toml`.

---

## 5. Lessons Learned

- BACKLOG-020's acceptance criteria required an executable Python subject, so the work naturally overlapped the older future BACKLOG-012 idea. BACKLOG-012 remains open for any broader Python product-surface expansion outside this `@util` parity slice.
- Default parity commands must expand as soon as a second Stack exists; otherwise validation output can look green while ignoring the new Stack.

---

## 6. Current State at End of Session

**Completed this session:**
- DEMOAPP002 Python pytest-bdd Stack created.
- 46 canonical pytest-bdd scenarios pass locally.
- Memory key parity, feature parity, and step-text parity pass across DEMOAPP001 and DEMOAPP002.
- CI now includes a DEMOAPP002 Python pytest job.

**Left incomplete / deferred:**
- BACKLOG-009 remains the next Sprint 4 item.
- BACKLOG-012 remains open pending clarification of whether any Python work beyond `@util` parity is still desired.

**New backlog items generated:**
- None.

---

## 7. Next Steps

1. Action BACKLOG-009 REST API wrapper.
2. Reconcile BACKLOG-012 once the expected Python product surface is clarified.

---

*End of Implementation Log*
