# Implementation Log: BACKLOG-070 Supported-Runtime Dependency Audits

**Date:** 2026-07-28T14:06:55Z  
**Session goal:** Complete SUD-31 / BACKLOG-070 by adding blocking dependency audits for every supported Stack, with one tested and bounded exception policy.  
**Outcome:** Completed and merged in PR #50. The post-merge `main` workflow is green and all current audits report zero findings.

---

## 1. Primary Request and Intent

**What was asked:**  
Deliver the final extended-worklist item, SUD-31, so Node 24, Python 3.13 and .NET 10 dependencies are audited in CI, actionable high/critical findings block the aggregate gate, short-lived exceptions are governed, and equivalent audit evidence is retained for all three Stacks.

**Scope that emerged:**  
The implementation also had to preserve the existing structured-evidence contract from SUD-30, remediate a newly observed Node advisory instead of excepting it, normalise three incompatible scanner formats, distinguish audit-tool outages from dependency findings, and add negative controls for policy and evidence drift. BACKLOG-070 was reconciled to `Resolved`; no additional backlog item was generated.

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|---|---|---|
| Block high, critical and unknown-severity findings, and fail closed for invalid reports or unexcepted scanner outages. | A green Gate must mean that dependency risk was evaluated successfully, not that a scanner silently failed or returned an unclassified result. | Yes — DR-039 |
| Permit only exact, approved exceptions with Stack and advisory/package or tool identity, owner, reason, approver, introduction date and expiry date; cap the inclusive validity window at 14 days. | Exact matching prevents broad suppressions, while the short maximum lifetime forces rapid remediation and leaves an auditable ownership trail. | Yes — DR-039 |
| Remediate `GHSA-mh99-v99m-4gvg` by constraining transitive `brace-expansion` to patched version 5.0.8. | A supported patched version was available, so an exception would have concealed avoidable high-severity debt. | No — implements DR-039 |
| Pin `pip-audit` 2.10.1 in the governed Python test environment and audit the constraint-resolved Python 3.13 installation. | This makes the scanner reproducible and ensures it inspects the environment CI actually validates. | No — implements DR-039 |
| Retain each scanner's native result and a common normalised JSON summary inside the existing seven-day Stack evidence artefact. | Native output supports investigation; the common summary gives the cross-Stack evidence checker one deterministic contract without discarding source detail. | No — extends the SUD-30 evidence design under DR-039 |

## 3. Files Created or Significantly Modified

### Created

- `.batch/evaluate-dependency-audit.ps1` — validates native scanner output against DR-039 and emits the normalised summary.
- `.batch/invoke-dependency-audit.ps1` — invokes the Stack-specific scanner while preserving finding-versus-tool-failure semantics.
- `.batch/test-dependency-audit-policy.ps1` — exercises 13 positive and negative policy controls.
- `.github/dependency-audit-policy.json` — declares the blocking threshold and the bounded exception registry; the registry is currently empty.

### Modified

- `.github/workflows/ci.yml` — runs each audit in its supported runtime, retains native and normalised output, and keeps the aggregate Gate fail closed.
- `.batch/check-ci-evidence.ps1` — requires and validates each Stack's audit evidence.
- `.batch/test-ci-evidence-contract.ps1` — expands missing-evidence controls from 11 to 17 required-file omissions.
- `.batch/run-parity-checks.ps1` — adds the dependency-audit policy suite to parity validation.
- `demo-apps/demoapp001-typescript-cypress/package.json` and `package-lock.json` — add the npm audit command and patched transitive constraint.
- `demo-apps/demoapp002-python-pytest/pyproject.toml` and `requirements-test.lock` — govern `pip-audit` 2.10.1 and its locked dependencies.
- `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `DOCS/.architecture/orchestration-design.md`, all three Stack `README.md` files, `DOCS/.planning/backlog.md`, and `decision-register.md` — document the audit contract, evidence, resolved backlog state and DR-039.

### Deleted

- None.

## 4. Bugs and Errors Encountered

### Parallel Docker validation exceeded the wrapper ceiling

Running all resource-heavy Stack validations concurrently exceeded the five-minute command wrapper while the containers competed for resources. The lanes were rerun separately, after which all three completed successfully. The timeout was environmental contention, not a failing test or weakened gate.

### Evidence paths changed meaning after changing directory

The first audit invocation accepted relative evidence paths and then changed location into a Stack directory, causing an invalid output path and exit 127. The wrapper now normalises evidence paths before `Push-Location`; the policy and real Stack runs confirm the corrected behaviour.

### Scanner formats contained legitimate null or skipped records

`pip-audit` can report an editable-package skip, and NuGet output can omit framework fields. Early normalisation treated those shapes as findings or dereferenced missing values. Explicit shape checks and null guards now preserve legitimate scanner semantics while still failing closed on malformed reports.

### PowerShell reused typed variables across XML and JSON parsing

The evidence checker initially reused a strongly inferred variable for different document types, which produced a conversion error. Distinct variables now keep XML, JSON and summary parsing isolated, and all 17 missing-file controls pass.

## 5. Lessons Learned

- Dependency assurance must test scanner failure modes as deliberately as vulnerability findings; otherwise an outage can look green.
- Normalise evidence paths before changing working directory in a reusable PowerShell wrapper.
- Treat native audit schemas as versioned external contracts: accept documented null/skip shapes, but reject unknown or malformed data explicitly.
- Prefer remediation to exception whenever a supported patch exists; a bounded policy is an emergency control, not a routine suppression mechanism.
- Run resource-heavy Docker lanes sequentially on this workstation when the command wrapper has a fixed ceiling.

## 6. Current State at End of Session

**Completed this session:**

- SUD-31 / BACKLOG-070 implemented in commit `95b2178` and merged by PR #50 as merge commit `f514b1d`.
- PR CI run `30365914556` completed successfully across DEMOAPP001, DEMOAPP002, DEMOAPP003 and the aggregate Gate.
- Post-merge `main` CI run `30366333328` completed successfully at `f514b1d`.
- Node 24: build, type-aware lint, formatting, REST API and OpenAPI checks passed; 16 component tests and 48 Cucumber scenarios / 267 steps passed; selected-module coverage remained 73.23% lines, 87.67% branches and 79.59% functions; `npm audit` reported zero findings.
- Python 3.13: `pip check`, 26 component tests and 74 total tests passed; selected-module coverage was 87.81% combined; `pip-audit` reported zero findings.
- .NET 10: locked restore, 24 component tests and 48 Reqnroll scenarios passed; selected-type coverage remained 86.03% lines and 84.91% branches; NuGet audit reported zero findings.
- PowerShell parsing, actionlint, Docker Compose configuration, documentation currency, 13 dependency-policy controls, 17 evidence-omission controls and all parity gates passed.

**Left incomplete / deferred:**

- No SUD-31 implementation work remains. BACKLOG-014, BACKLOG-015 and BACKLOG-016 remain deliberately parked future product/solver ideas and were outside this task.

**New backlog items generated:**

- None.

## 7. Next Steps

1. Merge this append-only implementation-log PR after its docs-only CI completes.
2. Keep the empty exception registry empty unless a real, time-bounded and explicitly approved incident meets every DR-039 field and matching rule.
3. Begin future implementation only after deriving a fresh worklist from the three parked product/solver items or from new evidence.

---

*Session logged: 2026-07-28. Author: Codex.*

*End of Implementation Log*
