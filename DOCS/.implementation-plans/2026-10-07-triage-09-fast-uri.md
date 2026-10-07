---
version: 1
created: 2026-10-07T08:17Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-080 / TRIAGE-09
status: approved
approved: 2026-10-07 by GBrooks1970, "proceed as recommended"; compatible fast-uri lock remediation and focused project PR, owner merges
delivered: not yet
language: en-GB
---

# Implementation plan: TRIAGE-09 compatible fast-uri remediation

**Goal.** Clear GHSA-hrr3-gc8f-f4qj through a reproducible DEMOAPP001 fast-uri
3.1.7 to 3.1.8 lock update within the existing Ajv dependency ranges.

## Evidence gathered before planning

Read-only inspection and a fresh supported-runtime audit ran in the owned isolated checkout
at main `92a0dd1937e4e049239b2e55fa5d174b455a3a58`. No tracked file was changed.
Audit evidence is retained under `.results/triage-09/20261007/before/`.

| Finding | Consequence for the plan |
|---|---|
| Current lock has one shared dev-only fast-uri 3.1.7 entry; the worklist's 3.1.5 is historical | Use the live lock as the baseline and retain historical records. |
| Three Ajv 8.20.0 parents require fast-uri ^3.0.1 | Lock 3.1.8 without upgrading parents or adding a direct dependency/override. |
| [Maintainer advisory](https://github.com/fastify/fast-uri/security/advisories/GHSA-hrr3-gc8f-f4qj) and [release](https://github.com/fastify/fast-uri/releases/tag/v3.1.8) identify 3.1.8 as patched | Verify percent-encoded host normalisation and fresh advisory removal. |
| Node 24.18.0 / npm 11.16.0 are available | Run locked restoration and the touched Stack's supported gates locally. |
| Fresh audit reports fast-uri moderate and one approved braces high finding | Preserve DR-039 and the exact braces exception through 12 October inclusive. |
| Manifest-selected handover v6 records an older 93-item baseline; current backlog has 102 resolved items | Use the canonical backlog and reserve free BACKLOG-080 for this owner-selected work. |

## Steps

1. File this plan and its row in `DOCS/.implementation-plans/_index.md`; specify BACKLOG-080
   and acceptance in `DOCS/.planning/backlog.md` before changing the dependency lock.
2. Run `npm update fast-uri --package-lock-only --ignore-scripts --no-audit --no-fund` in
   `demo-apps/demoapp001-typescript-cypress/`. Inspect `package-lock.json`: accept only the
   fast-uri 3.1.8 version, tarball URL and integrity change. Reject unrelated lock churn.
3. Restore with `npm ci`. Verify installed resolution, lock graph equality outside fast-uri,
   manifest/policy equality, and targeted upstream URI regression checks. Retain logs,
   durations and positive/negative control evidence in the ignored results directory.
4. Run DEMOAPP001 build, lint, format, API/OpenAPI, component/BDD, existing coverage floors,
   web/Pages, governed audit and evidence checks. Run repository parity/governance gates.
   Existing native Then controls run in PR CI; unchanged Python/C# suites use all-Stack CI.
5. After acceptance, resolve BACKLOG-080, update `CHANGELOG.md`, append this plan's Outcome,
   and update its index row. Preserve all existing IDs and dated delivery evidence.
6. Commit exact project paths, push and open one focused project PR. Record the commit,
   outcome and PR in the separate root `WORKLIST_gb.automation.smoketests.sudoku.poc.md`.
   Report that root diff separately for its own publication flow.

## Verification

- Only fast-uri's three lock metadata fields change; all parents, manifest ranges, other locks,
  feature text, CI, coverage floors and the dependency policy match the base.
- An isolated upstream host-normalisation assertion must fail against 3.1.7 and pass against
  installed 3.1.8; equivalent encoded/literal hosts compare equal and normalisation is idempotent.
- `npm ci` succeeds without modifying the lock; installed fast-uri references resolve to 3.1.8.
- Fresh governed audit excludes GHSA-hrr3-gc8f-f4qj and has no unexcepted blocking finding.
- Existing DEMOAPP001 static, API/OpenAPI, 113-component/55-scenario suite, coverage, web/Pages
  and evidence gates pass; seven repository governance/parity checks and new relative links pass.
- Exact PR-head CI must pass all three Stacks, parity and aggregate gate. Pages deployment is
  verified after the owner's later merge.

## Delivery

Use `codex/sudoku-triage-09-fast-uri`, based on fetched main, in the owned isolated project
checkout. Open a focused project PR; the owner merges. Keep the root worklist outside the
project commit and report its uncommitted support-repository diff separately. Preserve shared
checkouts and historical branches. TRIAGE-08/10/15 and braces remediation remain separate.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Next item | TRIAGE-09 or default TRIAGE-08 | Compatible fast-uri remediation | "proceed as recommended", GBrooks1970, 2026-10-07 |
| Resolution | Compatible lock patch or broader dependency upgrade | fast-uri 3.1.8 only within existing ranges | Included in the approved bounded recommendation |
| Publication | Focused project PR and separate root control state | Preserve independent repository boundaries | Project loop authorised; owner retains merge authority; root publication reported separately |

## Outcome

**Local completion snapshot, 2026-10-07, before commit/PR publication.** Delivered exactly
the compatible fast-uri 3.1.7 to 3.1.8 lock update. Only its version, tarball URL and integrity
changed; complete parsed graph comparison, unchanged manifest/policy and installed parent
resolution checks passed. No expanded dependency update or structural decision was needed.

| Check | Captured outcome | Command duration |
|---|---|---:|
| Targeted lock update | PASS; three metadata fields | 5,767 ms |
| Complete lock graph | PASS; all three parents unchanged | 249 ms |
| Node 24 locked restore | PASS; lock SHA-256 unchanged | 84,516 ms |
| Installed dependency tree | PASS; all Ajv paths use 3.1.8 | 4,983 ms |
| URI before control | Intended assertion failed on 3.1.7, native exit 1 | 350 ms |
| URI after control | Five assertions passed on 3.1.8 | 256 ms |
| Advisory absence before/after | Assertion fails before / passes after | 1,357 / 1,236 ms |
| Build / lint / formatting | PASS | 18,272 / 36,741 / 27,420 ms |
| API / OpenAPI | PASS; eight contract tests | 12,132 / 20,733 ms |
| Component coverage | 113 passed; 80.11% lines / 91.94% branches / 80.17% functions | 103,651 ms |
| Normal suite | 113 component + 55 scenarios / 309 steps passed | 43,149 ms |
| Web / Pages scripts | PASS | 7,429 / 7,764 ms |
| Governed dependency audit | One approved braces finding; fast-uri absent; zero unexcepted blockers | 19,406 ms |
| Seven governance/parity checks | PASS, including existing negative controls | 16,381 ms |

Test-reported durations differ from complete command duration: normal component suite
20,171.4968 ms, BDD 6.206 s, coverage suite 101,395.955 ms and OpenAPI 7,588.5197 ms.
Existing 70/85/75 coverage floors passed with one local coverage worker; CI concurrency is
unchanged. Native logs and control dispositions are retained under `.results/triage-09/20261007/`.

One initial control invocation failed module loading due to external PowerShell argument
forwarding. That attempt was retained and excluded; the corrected native assertion control
was run before the lock update and its same-script positive control passed after restoration.
This was a tooling correction, not a plan or dependency-scope change.

Unchanged Python/C# suites and existing native Then controls are left to all-Stack PR CI.
Docker, live browser flows and the optional older loader/orchestrator mutation trial were not
rerun. The exact braces exception still ends 12 October inclusive. The manifest-selected v6
handover and registry's BACKLOG-078 note predate accepted work; refresh is separately scoped.
The root worklist is separate uncommitted control state, never part of this project commit.
Project PR publication follows this validated snapshot; the owner retains merge authority.
