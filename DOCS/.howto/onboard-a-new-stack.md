# How To: Onboard a New Language Stack

**Difficulty:** Advanced
**Time to complete:** 4–8 hours (spread across multiple sessions)
**Last verified:** 2026-05-17

---

## What you will achieve

By the end of this guide you will have a working second Stack (`DEMOAPP002_PYTHON_PYTEST` is used as the worked example throughout) that:
- Has its own directory under `demo-apps/` following project naming conventions
- Implements the same Gherkin scenarios as DEMOAPP001, in Python with pytest-bdd
- Uses the Screenplay pattern with the same six Memory key constants
- Passes the feature parity report against `features-shared/`
- Is registered in `CLAUDE.md`, `decision-register.md`, and the backlog

This guide implements `REFERENCE_ARCHITECTURE.md` v1.3 §11 (the 8-phase onboarding checklist) with project-specific conventions applied.

---

## Before you start

**You need:**
- [ ] Python 3.10+ and pip installed (for a Python Stack)
- [ ] A clear decision on which language and test framework you are adding
- [ ] Node.js 16+ still working — DEMOAPP001 must remain green throughout

**You should know:**
- The Screenplay pattern (read `demo-apps/demoapp001-typescript-cypress/docs/screenplay-guide.md`)
- How `features-shared/` is the canonical feature store and why both copies must stay in sync
- How to write a Decision Register entry — see [create-a-decision-register-entry.md](create-a-decision-register-entry.md)

---

## Conventions that apply to this project

Before writing a line of code, understand the project-specific conventions that the Reference Architecture leaves as project-local decisions:

| Convention | Rule | Decision |
|-----------|------|---------|
| Stack directory name | `kebab-case` | e.g. `demo-apps/demoapp002-python-pytest/` (DR-016) |
| Canonical Stack name | `UPPER_SNAKE_CASE` | e.g. `DEMOAPP002_PYTHON_PYTEST` |
| Stack short identifier | Prefix of canonical name | e.g. `DEMOAPP002` |
| Stack Gherkin tag | `@stack-demoappNNN` | e.g. `@stack-demoapp002` |
| Memory key format | `CONSTANT_NAME = 'CONSTANT_NAME'` | Constant name equals string value exactly (DR-015) |
| Document naming | kebab-case | All authored docs (DR-020) |
| DOCS subdirectories | dot + kebab-case | All DOCS type-specific dirs (DR-019) |

---

## Phase 1 — Record the decision

### Step 1.1: Create DR-021 (or next available ID)

Before creating any files, write a Decision Register entry for the new Stack decision. See [create-a-decision-register-entry.md](create-a-decision-register-entry.md).

The entry must cover:
- **Context:** why this language was chosen for Stack 2
- **Decision:** the canonical Stack name, filesystem directory, language, and test framework
- **Consequences:** what this enables (parity across languages) and the trade-offs (maintenance overhead of a second language)
- **Alternatives:** other languages or frameworks considered

---

### Step 1.2: Add the Stack to CLAUDE.md

Open `CLAUDE.md`. In the Stack Inventory section, add a row to the "Planned future Stacks" table and move it to the active table once the Stack is working:

```markdown
| `DEMOAPP002_PYTHON_PYTEST` | Python 3.10+ | pytest-bdd | `@util` | `demo-apps/demoapp002-python-pytest/` |
```

---

## Phase 2 — Create the directory structure

### Step 2.1: Create the Stack directory

```powershell
mkdir demo-apps/demoapp002-python-pytest
```

Inside it, create the required subdirectories following `REFERENCE_ARCHITECTURE.md` §4:

```
demo-apps/demoapp002-python-pytest/
├── app_src/                    # Subject application source (Python port of SudokuSolver)
├── tests/
│   ├── features/               # Stack-local feature files (copied from features-shared/)
│   └── screenplay/
│       ├── abilities/          # UseSudokuSolver, LoadPuzzles
│       ├── actors/             # Actor setup
│       ├── tasks/              # Task implementations
│       ├── questions/          # Question implementations
│       └── support/            # memory-keys.py
├── docs/                       # Stack-level documentation
├── tooling/                    # pytest.ini or pyproject.toml
└── puzzles.json                # (copy from DEMOAPP001 or symlink)
```

---

## Phase 3 — Port the subject application

### Step 3.1: Implement SudokuSolver in Python

The Python solver must implement the same three techniques as the TypeScript solver:
- `unit_completion() -> bool`
- `hidden_singles(target: int) -> bool`
- `naked_singles() -> bool`

Read `DOCS/.algorithm/sudoku-basic-solver.md` for the authoritative pseudocode — implement from the spec, not by copying the TypeScript source. The algorithms are language-agnostic.

The solver contract:
- `grid`: `list[list[int]]` — working copy, modified during solving
- `orig_grid`: `list[list[int]]` — read-only original
- Empty cell sentinel: `0` (matches `EMPTY_CELL` constant in DEMOAPP001)

### Step 3.2: Implement SudokuOrchestrator in Python

```python
def solve(self) -> str:
    is_progressing = True
    while is_progressing:
        changed = False
        if self.solver.unit_completion():
            changed = True
        for digit in range(1, 10):
            if self.solver.hidden_singles(digit):
                changed = True
        if self.solver.naked_singles():
            changed = True
        is_progressing = changed
    return 'SOLVED' if self._is_grid_full() else 'STUCK_ON_ADVANCED_LOGIC'
```

The return strings must match DEMOAPP001 exactly: `'SOLVED'` and `'STUCK_ON_ADVANCED_LOGIC'`.

---

## Phase 4 — Implement the Screenplay layer

### Step 4.1: Define Memory keys

Create `tests/screenplay/support/memory_keys.py`:

```python
# Constant name MUST equal string value exactly (DR-015, RA §8.1)
SOLVE_RESULT       = 'SOLVE_RESULT'
ALGORITHM_PROGRESS = 'ALGORITHM_PROGRESS'
LAST_ERROR         = 'LAST_ERROR'
TARGET_CELL        = 'TARGET_CELL'
GRID_SNAPSHOT      = 'GRID_SNAPSHOT'
VALIDATION_RESULT  = 'VALIDATION_RESULT'
```

These six constants must be identical to the TypeScript constants in DEMOAPP001. Do not rename, shorten, or recase them.

### Step 4.2: Implement the Actor

The Actor must:
- Be created fresh per scenario
- Hold a Memory dictionary cleared between scenarios
- Expose `attempts_to(task)`, `answer(question)`, `remember(key, value)`, `recall(key)`

```python
class Actor:
    def __init__(self, name: str):
        self.name = name
        self._abilities = {}
        self._memory = {}

    def who_can(self, *abilities) -> 'Actor':
        for ability in abilities:
            self._abilities[type(ability)] = ability
        return self

    def ability_to(self, ability_type):
        return self._abilities[ability_type]

    def attempts_to(self, *tasks):
        for task in tasks:
            task.perform_as(self)

    def answer(self, question):
        return question.answered_by(self)

    def remember(self, key: str, value):
        self._memory[key] = value

    def recall(self, key: str):
        return self._memory.get(key)

    def forget(self):
        self._memory.clear()
```

### Step 4.3: Implement Abilities, Tasks, and Questions

Follow the same structure as DEMOAPP001:
- **Ability:** `UseSudokuSolver` — holds the `SudokuSolver` instance
- **Tasks:** `InitialiseGrid`, `SolvePuzzle`, `ApplyAlgorithm` — write Memory after performing action
- **Questions:** `SolveStatus`, `AlgorithmMadeProgress` — read from Memory

Tasks write to Memory using `actor.remember(KEY, value)`. Questions read using `actor.recall(KEY)`.

---

## Phase 5 — Copy and tag feature files

### Step 5.1: Copy the canonical feature file

```powershell
Copy-Item `
  features-shared/util-tests/sudoku-solver/BasicSudokuSolverLogic.feature `
  demo-apps/demoapp002-python-pytest/tests/features/BasicSudokuSolverLogic.feature
```

### Step 5.2: Add the Stack tag

Open the copied file and change the top line from:

```gherkin
@util
```

to:

```gherkin
@util @stack-demoapp002
```

Do not change anything else in the file body.

### Step 5.3: Run the parity report

```powershell
.\.batch\generate-feature-parity-report.ps1 `
  -StackRoot "demo-apps/demoapp002-python-pytest/tests/features"
```

**Expected:** `Overall result: PASS`

---

## Phase 6 — Write step definitions

Create step definition files in `tests/screenplay/` following pytest-bdd conventions. Each step must delegate to `actor.attempts_to(Task)` or `actor.answer(Question)` — no direct Ability calls, no inline logic.

Configure pytest to pick up your feature files. A minimal `pyproject.toml`:

```toml
[tool.pytest.ini_options]
addopts = "--tb=short"

[tool.pytest-bdd]
features = "tests/features"
```

---

## Phase 7 — Write Stack-level documentation

Create the four required Stack documents under `docs/`:

| File | Template |
|------|---------|
| `docs/architecture.md` | `DOCS/.templates/stack-architecture.template.md` |
| `docs/screenplay-guide.md` | `DOCS/.templates/screenplay-guide.template.md` |
| `docs/qa-strategy.md` | `DOCS/.templates/qa-strategy.template.md` |
| `docs/README.md` | `DOCS/.templates/stack-readme.template.md` |

Fill in all `[REQUIRED]` fields. Reference the DEMOAPP001 docs for the expected level of detail.

Update the root `README.md` to include the new Stack in the Stacks table.

---

## Phase 8 — Verify parity

Before closing the onboarding sprint:

```powershell
# 1. Feature parity report must pass
.\.batch\generate-feature-parity-report.ps1 -StackRoot "demo-apps/demoapp002-python-pytest/tests/features"

# 2. All canonical scenarios must pass in the new Stack
cd demo-apps/demoapp002-python-pytest
python -m pytest tests/ -v

# 3. DEMOAPP001 must still be green
cd D:\_CLAUDE_COWORK\PROJ001\claude-outputs\test-automation-portfolio\gb.automation.smoketests.sudoku.poc
.\.batch\run-demoapp001.ps1
```

Check the parity contract at `DOCS/.architecture/screenplay-parity-contract.md`:
- All 6 Memory key constants match the canonical values exactly
- Task factory method names follow the documented contract
- Question factory method names follow the documented contract
- Gherkin step text matches the canonical feature file exactly

Any gap found must be recorded as a backlog item in `DOCS/.planning/backlog.md` with status `Open` before marking onboarding complete.

---

## Verify it worked

- [ ] `decision-register.md` has a DR entry for this Stack
- [ ] `CLAUDE.md` Stack inventory updated
- [ ] Feature parity report: `PASS`
- [ ] All canonical scenarios pass in the new Stack
- [ ] DEMOAPP001 still passes: `OverallExitCode=0`
- [ ] Four Stack-level docs authored and `[REQUIRED]` fields filled
- [ ] `DOCS/.planning/backlog.md` lists any known gaps as `Open` items

---

## Common problems

### Memory key constant value does not match

**Cause:** The Python constant was renamed (e.g., `SOLVE_RESULT = 'solve_result'`).
**Fix:** The constant name and its string value must be identical: `SOLVE_RESULT = 'SOLVE_RESULT'`. This is a hard rule in RA §8.1 and DR-015.

---

### Feature parity shows `DRIFT` immediately after copy

**Cause:** The copy introduced a line-ending change (CRLF vs LF), or a tag was accidentally added to the body.
**Fix:** Check `git diff` on the Stack-local feature file against the canonical. Only the first line (the tag line) should differ.

---

### pytest-bdd step definition does not match the Gherkin step

**Cause:** pytest-bdd uses a different pattern format than Cucumber expressions.
**Fix:** Map `{int}` and `{string}` Cucumber expressions to the pytest-bdd equivalent (`\d+` regex or `parsers.parse()`). The step text must remain identical to the canonical feature file.

---

## What to do next

- Add the new Stack to the orchestration script (`.batch/run-all-stacks.ps1` — currently planned as NEW-015 in the backlog).
- Set the Stack's metrics prefix to `DEMOAPP002` in the orchestration script per the identifier mapping in `DOCS/.architecture/orchestration-design.md` Section 6.
- Once the Stack is green, update the Sprint Roadmap in `DOCS/.planning/backlog.md`.
