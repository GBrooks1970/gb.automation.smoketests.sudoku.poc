# Implementation Log: BACKLOG-075 Reqnroll Results Spike and Cross-Stack Comparison

**Date:** 2026-09-30T17:06:18Z
**Session goal:** Decide how DEMOAPP003 (Reqnroll) supplies per-scenario results for the DR-047 parity evidence page, and check that all three Stacks' results can be compared.
**Outcome:** Completed. Reqnroll's direct Cucumber Messages output is the chosen source; the TRX fallback is rejected. Nothing in the repository's code, CI or features changed.

---

## 1. Primary Request and Intent

**What was asked:** Run the first BACKLOG-075 acceptance criterion: decide whether Reqnroll 3.3.4 emits Cucumber-compatible results or the C# Stack must fall back to matching TRX results by scenario title, and record the outcome before any CI change (DR-047, "Results format"). A follow-up asked for the cross-Stack comparison of the three result formats.

**Scope that emerged:**
- A comparison of all three Stacks' real result files, to find what an adapter must normalise.
- A check that the absolute-path output option works, because CI writes evidence to `.results/demoapp003/`.

---

## 2. Method

All runs were local and read-only with respect to the repository. Scripts and outputs lived in the session scratchpad and were not committed.

- **DEMOAPP003:** the Stack was copied without `bin/` and `obj/` and run in `mcr.microsoft.com/dotnet/sdk:10.0` (digest `sha256:35d40304542c8689331f8cab17c65926cdf48fe711e289321d71924b230a7d29`), because the host has only .NET 5 and 8 SDKs. The only change was a new `tests/reqnroll.json` enabling the `message` formatter. Reqnroll 3.3.4 on .NET 10.0.12 (Linux).
- **DEMOAPP001:** `npx cucumber-js --config tooling/cucumber.js --format json:<scratch>` on Node 24.18.0, in place.
- **DEMOAPP002:** `python -m pytest -p no:cacheprovider --cucumberjson=<scratch>` on Python 3.13.1 with pytest-bdd 8.1.0, in place.
- **Feature files:** the four committed copies (`features-shared/` and one per Stack) have the same md5, `7e0ef0aa9898fdfd6560d51a95d2a38a`, read from git blobs with and without CRLF stripped.

---

## 3. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|-------------|
| Use Reqnroll's Cucumber Messages (`message` formatter, ndjson) as the DEMOAPP003 source for the parity page. | It produced complete, per-execution results on the first run. Pickle IDs keep outline rows distinct, which TRX title matching cannot. | No. DR-047 delegates this choice to the spike record. |
| Reject the TRX title-matching fallback. | 12 outline rows share names: "Validate moves against Sudoku constraints" occurs 8 times (outline at line 167) and "Reject JSON boolean puzzle cell values on load" twice (line 248). Title matching would collapse distinct executions and a rename would break the match silently. | No |
| Join results across Stacks by (scenario name, occurrence index in feature order). | Line numbers disagree across Stacks (see section 4). This key was identical for all three Stacks. The build must also fail if order or counts diverge. | No |

---

## 4. Results

### Runs
| Stack | Output | Scenarios | Steps | Outcome |
|-------|--------|-----------|-------|---------|
| DEMOAPP001 | `cucumber.json` | 55 | 309 (after dropping hidden hooks) | all passed, 4.26 s wall |
| DEMOAPP002 | pytest-bdd `--cucumberjson` | 55 | 309 | all passed |
| DEMOAPP003 | Cucumber Messages ndjson | 55 | 309 pickle steps | all passed, 55/55 in 5 s (2 s on the later rerun) |

### Reqnroll output
- 1,098 messages, about 443 KB, protocol 30.1.0. Counts: 55 pickles, 55 test cases, 364 step results (all `PASSED`, including hook steps), 145 step definitions with C# class and method, one `testRunFinished` with `success: true`.
- An absolute `outputFilePath` (`/workspace/out/evidence/reqnroll.ndjson`) wrote the file where asked. No `.csproj` change was needed.

### Agreement across Stacks
- Scenario-name multisets are identical for all three pairs.
- Name plus ordered step text is identical for all three pairs once normalised.
- Scenario order is identical; step keywords match between DEMOAPP001 and DEMOAPP002.

### Normalisation an adapter needs
1. **Hidden hooks (DEMOAPP001):** its JSON has 364 steps because of one hidden `After` hook per scenario with no name. Filter `hidden: true`.
2. **Outline rows:** DEMOAPP001 and DEMOAPP003 report the example-row line (176 to 183 for the 8-row outline). DEMOAPP002 reports line 167, the outline's own line, for every row, and identifies rows by pytest test ID with parameters.
3. **Paths and durations:** feature paths are `tests\features\...`, `features\...` and `features/...`, so compare file names. Durations are nanoseconds, nanoseconds and a `{seconds, nanos}` object, so convert to milliseconds.
4. **Tags:** feature-level tags (`@util`) are not inherited in DEMOAPP002's output. Not needed by the plan.

Local sums of step durations were 2,886 ms, 282 ms and 805 ms for DEMOAPP001, 002 and 003. These come from one run on a Windows host and are not a Stack comparison.

---

## 5. Files Created or Significantly Modified

### Created
| File | Purpose |
|------|---------|
| `DOCS/.implementation-logs/2026-09-30_backlog-075-reqnroll-results-spike.md` | This log |

### Modified
| File | Change summary |
|------|---------------|
| `DOCS/.planning/backlog.md` | BACKLOG-075 first criterion ticked with a pointer to this log |
| `DOCS/.implementation-logs/README.md` | Index entry |

No code, CI, feature, puzzle or Stack file changed.

---

## 6. Lessons Learned

- A title-based fallback would have been wrong by design here, because outline rows share names. Check for duplicate keys before choosing a join.
- Line numbers are not portable across Cucumber implementations for outline rows.
- The host's .NET SDKs can hide a `net10.0` requirement. The container matched CI's `dotnet-version: "10.0.x"`.
- The file-level md5 checked from git blobs is the reliable figure; working-tree hashes on Windows can differ through line-ending conversion.

---

## 7. Current State at End of Session

**Completed this session:**
- ✅ Reqnroll results-format decision, with evidence.
- ✅ Cross-Stack comparison of real results from all three Stacks.

**Left incomplete / deferred:**
- ⏸️ Failure case: only passing runs were observed. The mock-up should plant one failing scenario per format and check that non-passed statuses map.
- ⏸️ Default-branch CI is red on the dependency audit (DEMOAPP001 axios, DEMOAPP002 urllib3); this log does not address it, and it blocks verifying a green fan-in job.

**New backlog items generated:**
- None. The dependency-audit failures may warrant their own item if the owner wants them fixed.

---

## 8. Next Steps

1. Build the clickable mock-up from these real outputs, reusing the `loan-origination-parity` template, and review it with the owner before any CI change.
2. Include a planted failure per format in the mock-up run.
3. Then the results-level gate, fan-in job and negative check (BACKLOG-075 remaining criteria).

---

*End of Implementation Log*
