# How To: Run the Orchestration Script and Interpret Its Output

**Difficulty:** Beginner
**Time to complete:** 10 minutes
**Last verified:** 2026-05-17

---

## What you will achieve

By the end of this guide you will know how to run the batch orchestration script, what each output file contains, how to read the pass/fail signal, and how to run optional extras like tag-filtered tests and the feature parity report.

---

## Before you start

**You need:**
- [ ] PowerShell 7+ (pwsh) — run `pwsh --version` to confirm
- [ ] Node.js 16+ and npm installed
- [ ] Dependencies installed — `npm install` from `demo-apps/demoapp001-typescript-cypress/`

**You should know:**
- How to open a PowerShell terminal
- What "exit code 0" means (success)

---

## The script in one sentence

`.batch/run-demoapp001.ps1` builds the TypeScript source, runs the full Cucumber/Serenity test suite, and writes timestamped metrics to `.results/`. It is the single command that CI will eventually run (BACKLOG-004).

---

## Steps

### Step 1: Run from the repository root

Always run the script from the repository root — not from inside the stack directory:

```powershell
cd d:\__GB_DEV\_GitHub\gb.automation.smoketests.sudoku.poc
.\.batch\run-demoapp001.ps1
```

**You should see** (healthy run):

```
BuildExitCode: 0
TestExitCode: 0
OverallExitCode: 0
MetricsTxt: D:\...\DEMOAPP001_20260517T123456Z.txt
MetricsMd:  D:\...\DEMOAPP001_20260517T123456Z.md (preserved for historical archival)
TestLog:    D:\...\DEMOAPP001_test_20260517T123456Z.log
```

`OverallExitCode: 0` is the canonical pass signal. Any non-zero value means either the build or the tests failed.

---

### Step 2: Understand the output files

The script writes to three locations under `.results/` (gitignored):

```
.results/
├── .metrics/
│   ├── DEMOAPP001_20260517T123456Z.txt   ← key-value metrics (purged after 7 days)
│   └── DEMOAPP001_20260517T123456Z.md    ← markdown summary (preserved indefinitely)
└── logs/
    ├── DEMOAPP001_build_20260517T123456Z.log  ← full npm run build output
    └── DEMOAPP001_test_20260517T123456Z.log   ← full Cucumber output
```

**What each file tells you:**

| File | Use it to |
|------|-----------|
| `*.txt` metrics | Machine-read in CI pipelines; check `OverallExitCode` |
| `*.md` metrics | Human-readable summary; preserved long-term for trend analysis |
| `build_*.log` | Diagnose TypeScript compilation errors |
| `test_*.log` | Diagnose failing scenarios; find specific Cucumber error output |

**Sample `.txt` metrics file:**

```
DEMOAPP001_BDD_ExitCode=0
DEMOAPP001_BDD_Tests=43
DEMOAPP001_BDD_Passed=43
DEMOAPP001_BDD_Failed=0
DEMOAPP001_BDD_Skipped=0
DEMOAPP001_BDD_Duration=11.23
DEMOAPP001_BDD_Log=D:\...\DEMOAPP001_test_20260517T123456Z.log
DEMOAPP001_Build_ExitCode=0
OverallExitCode=0
```

---

### Step 3: Run with a tag filter

To run only a subset of scenarios, pass a Cucumber tag expression:

```powershell
.\.batch\run-demoapp001.ps1 -Tags "@util"
```

```powershell
.\.batch\run-demoapp001.ps1 -Tags "@stack-demoapp001 and not @pending"
```

The `-Tags` value is passed directly to `cucumber-js --tags`. All standard Cucumber tag expression syntax applies.

---

### Step 4: Diagnose a failure

If `OverallExitCode` is non-zero:

**Build failure (`BuildExitCode` non-zero):**
```powershell
# Read the build log
Get-Content .results\logs\DEMOAPP001_build_*.log | Select-Object -Last 30
```
Look for TypeScript compilation errors. Fix the source and re-run.

**Test failure (`TestExitCode` non-zero):**
```powershell
# Read the test log — find the failed scenario
Get-Content .results\logs\DEMOAPP001_test_*.log | Select-String "failed|Error|AssertionError" | Select-Object -First 20
```
The test log contains the full Cucumber output including the failing scenario name, step text, and error message.

---

### Step 5: Run the feature parity report

The parity report is a separate script — it checks that the canonical `features-shared/` files match the Stack-local copies:

```powershell
.\.batch\generate-feature-parity-report.ps1
```

**You should see:**

```
Parity report: D:\...\FEATURE_PARITY_20260517T1234Z.md
Overall result: PASS
```

Run this report whenever you:
- Add or change a Gherkin scenario
- Suspect the canonical and Stack-local files have drifted

The report is written to `.results/feature-parity/` (gitignored) and is also preserved for review.

---

### Step 6: Check retention behaviour

The script automatically purges files older than 7 days from `.results/logs/` and `.results/.metrics/*.txt`. Markdown metric summaries (`.md`) are preserved indefinitely.

To change the retention window:
```powershell
.\.batch\run-demoapp001.ps1 -RetentionDays 14
```

---

## Verify it worked

- [ ] `OverallExitCode: 0` printed at the end of the script output
- [ ] A timestamped `.txt` and `.md` file exist under `.results/.metrics/`
- [ ] `DEMOAPP001_BDD_Tests=43` and `DEMOAPP001_BDD_Passed=43` appear in the `.txt` file

---

## Common problems

### `pwsh: command not found` or `The term '.batch\run-demoapp001.ps1' is not recognized`

**Cause:** PowerShell 7 (pwsh) is not installed, or you are in the wrong directory.
**Fix 1:** Install PowerShell 7 from [aka.ms/powershell](https://aka.ms/powershell).
**Fix 2:** Confirm you are running from the repository root — the `.batch/` directory must be in the current folder.

---

### `BuildExitCode: 1` — TypeScript compilation fails

**Cause:** A source file has a type error or import error introduced since the last successful build.
**Fix:** Read `.results/logs/DEMOAPP001_build_*.log`. Find the error line (`error TS...`) and fix the TypeScript source. Re-run the script.

---

### `TestExitCode: 1` but build succeeded

**Cause:** One or more Cucumber scenarios are failing.
**Fix:** Open the test log. Search for `failed` to find the failing scenario. Read the error and stack trace. Re-run `npm test` directly from `demo-apps/demoapp001-typescript-cypress/` for a faster feedback loop while debugging.

---

### `.results/` directory grows very large

**Cause:** The retention policy is not running (e.g., system clock drift, script not run regularly).
**Fix:** Run the script with a shorter retention window: `.\.batch\run-demoapp001.ps1 -RetentionDays 1`. The markdown summaries are always preserved; only logs and `.txt` files are purged.

---

## What to do next

- If the test log shows a failing scenario, see [add-a-gherkin-scenario.md](add-a-gherkin-scenario.md) to understand step definition and Screenplay wiring.
- If you are setting up CI, the script exit code (`$LASTEXITCODE`) can be used directly in GitHub Actions YAML as the step exit code.
- See [`DOCS/.architecture/orchestration-design.md`](../.architecture/orchestration-design.md) for the full orchestration design spec including the metrics key format and Stack identifier mapping.
