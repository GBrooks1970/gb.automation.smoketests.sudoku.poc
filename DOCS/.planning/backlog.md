# Project Backlog

**Project:** Sudoku Solver POC
**Last Updated:** 2026-10-07 — resolved BACKLOG-081 / TRIAGE-08 after active documentation reconciliation, native inventory, precise currency controls and repository checks. The exact DR-039 braces exception remains approved through 2026-10-12 inclusive.
**Governed by:** `reference-architecture.md` v1.15 Section 10.1
**Template:** `DOCS/.templates/backlog.template.md`
**Authoritative path:** `DOCS/.planning/backlog.md`
**Status:** BACKLOG-081 / TRIAGE-08 is Resolved on local acceptance under its filed plan; all-Stack PR CI remains its publication check. BACKLOG-080 / TRIAGE-09 is published through merged PR #92 with all seven exact-merge jobs passing; BACKLOG-078 / TRIAGE-14 and BACKLOG-079 / TRIAGE-13 are published through merged PRs #91/#90. BACKLOG-075 is resolved and live at `/parity/`; historical closures remain intact. TRIAGE-10/15 remain separate root worklist items.

---

## Purpose

This backlog tracks product, technical debt, and Reference Architecture migration work required to keep current and future Stacks in parity.

Per v1.15 Section 10.1:

- Every tracked item uses exactly one status: `Open`, `In Progress`, or `Resolved`.
- Resolved items are retained as a record that the gap existed.
- Structural choices must be recorded in `decision-register.md` before the related work is closed.

---

## Summary

| Status | Count |
|--------|-------|
| Open | 0 |
| In Progress | 0 |
| Resolved | 104 |
| **Total** | **104** |

**Update (2026-10-07, TRIAGE-08):** The owner selected active capability and assurance currency.
The [filed plan](../.implementation-plans/2026-10-07-triage-08-documentation-currency.md)
preceded implementation. Eight active documents now agree with the five-technique deterministic
solver; the native inventory records 113/30/28 component tests and eight OpenAPI tests with
source fingerprints. All three BDD lanes passed 55 scenarios; 37 precise currency mutations,
the portable-source positive control and all seven governance/parity checks passed. Historical
coverage/mutation observations, prior IDs and separately scoped TRIAGE-10/15 are preserved.

**Update (2026-10-07, TRIAGE-09):** The owner selected a compatible fast-uri repair.
The [filed plan](../.implementation-plans/2026-10-07-triage-09-fast-uri.md) preceded the
lock update from 3.1.7 to 3.1.8. Only version, tarball URL and integrity changed; all parent
ranges and policy stayed identical. Fresh audit removes GHSA-hrr3-gc8f-f4qj and retains only
the existing braces exception. Native before/after controls, 113 component tests, 55 BDD
scenarios / 309 steps, eight OpenAPI tests, coverage and existing gates passed.

**Update (2026-10-07, BACKLOG-078):** Owner instructed "action proposed sequence" to strengthen
Then assertions across all three Stacks. The [filed plan](../.implementation-plans/2026-10-07-backlog-078-exact-assertions.md)
uses existing observations. All three Stacks passed 15 positive scenarios and killed 22 planted
wrong expectations each; byte-exact feature restoration, existing coverage floors and repository
gates passed. BACKLOG-078 is Resolved on this local acceptance; PR CI is the publication check.

**Update (2026-10-06, TRIAGE-13):** Owner selected BACKLOG-079 to preserve the visualiser
playhead on a tutor round-trip and approved the exact DR-039 braces exception through
2026-10-12 inclusive. Local implementation and native acceptance checks passed. BACKLOG-078
remains Open and unscheduled; the existing item history is preserved.

**Update (2026-09-30, TRIAGE-11):** Added the separately authorised BACKLOG-077 browser
pause-contract repair as Resolved. BACKLOG-075 remains Open: 1 Open / 0 In Progress /
99 Resolved / 100 Total. The adjacent visualiser redraw inconsistency is an unapproved
portfolio worklist candidate (TRIAGE-13), not an additional resolved project item.

**Update (2026-09-30, TRIAGE-12):** Recomputed unique tracked IDs from canonical status tables,
dated resolved rows and status-bearing detail records, including detail-only BACKLOG-007,
BACKLOG-008, BACKLOG-017 and BACKLOG-023. The inherited 96-item roll-up understated the
pre-repair inventory of 97 resolved items; adding BACKLOG-076 makes 98 resolved items. The separate accepted BACKLOG-075 remains
Open, making 99 total items.
Historical closure evidence is retained; this corrects the summary rather than reopening work.

**Update (2026-09-07):** Reconciled stale roll-up rows for BACKLOG-014, BACKLOG-015,
BACKLOG-016 and BACKLOG-071 against their resolved detail records and delivery evidence. The latest
default-branch [CI run 33996955690](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/33996955690)
and [Pages run 33996955729](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/33996955729)
both passed at `7af3dca`; this was a documentation reconciliation, not an implementation status change.

| Area | Current state |
|------|---------------|
| Recorded execution baseline (2026-08-24) | DEMOAPP001: Node 24, 49 component tests plus 55 scenarios / 309 steps passing, REST API integration PASS, 4 OpenAPI contract tests passing, Web UI smoke check PASS; selected-module coverage 81.46% lines / 91.74% branches / 80.17% functions with 70% / 85% / 75% floors; focused mutation trial 10/10 killed. DEMOAPP002: Python 3.13, 85 tests (55 pytest-bdd + 30 component) passing; selected-module coverage 88.98% combined with an 85% floor. DEMOAPP003: .NET 10, 83 tests (55 Reqnroll + 28 component) passing; selected-type coverage 87.62% lines / 85.94% branches with 80% / 80% floors. 3-Stack parity PASS. |
| TRIAGE-05 execution evidence (2026-09-30) | Node 24.18.0: 57 component tests passing; 55 BDD scenarios / 309 steps passing; REST API integration PASS; 4 OpenAPI contract tests passing; build/lint/format PASS. Existing selected-module coverage: 81.46% lines / 91.94% branches / 80.17% functions, all floors passed with one local test worker. Seven repository parity/governance checks PASS. Dependency audit PASS under DR-039 with zero blocking findings and one moderate fast-uri finding, recorded as portfolio TRIAGE-09. Python/C# suites, browser smoke and mutation trial were not rerun for this DEMOAPP001 classification change. |
| TRIAGE-06 execution evidence (2026-09-30) | Node 24.18.0: 66 component tests passing; 55 BDD scenarios / 309 steps passing; REST API integration PASS; 8 OpenAPI contract tests passing; build/lint/format and check:pages/check:web scripts PASS. Existing selected-module coverage: 80.11% lines / 91.94% branches / 80.17% functions, unchanged floors passed with one local test worker. Seven repository parity/governance checks and six-file CI evidence contract PASS. Dependency audit PASS under DR-039 with zero blocking findings and the same moderate fast-uri finding (TRIAGE-09). Python/C# suites, real-browser smoke and mutation trial were not rerun locally; all-Stack CI remains the publication check. |
| TRIAGE-07 execution evidence (2026-09-30) | Node 24.18.0: 102 component tests passing, including 36 VM controller/app-coordination cases; 55 BDD scenarios / 309 steps passing; API integration and 8 OpenAPI tests PASS; build/lint/format and explicit changed-JavaScript syntax/format checks PASS. Existing selected-module coverage: 80.11% lines / 91.94% branches / 80.17% functions, unchanged floors passed with one local test worker; this does not measure browser-controller line coverage. Seven parity/governance checks, six-file CI evidence and check:pages/served-asset/API check:web scripts PASS. Required audit PASS with zero blocking findings and the existing moderate fast-uri finding (TRIAGE-09). Native browser startup was attempted and blocked by the pre-existing missing pause export (TRIAGE-11); native controller interaction is unverified. Python/C# suites and mutation trial were not rerun locally; all-Stack CI remains the publication check. |
| Active Reference Architecture | v1.15 |
| Active platform specification | `sudoku-solver-platform-specification.md` v1.1 (Accepted, DR-034); `sudoku-solver-specification.md` v1.0 is the original core baseline |
| Active Stacks | `DEMOAPP001_TYPESCRIPT_CYPRESS` (dir: `demo-apps/demoapp001-typescript-cypress/`), `DEMOAPP002_PYTHON_PYTEST` (dir: `demo-apps/demoapp002-python-pytest/`), `DEMOAPP003_CSHARP_SPECFLOW` (dir: `demo-apps/demoapp003-csharp-specflow/`) |
| Current sprint focus | BACKLOG-081 / TRIAGE-08 locally Resolved and ready for all-Stack PR CI; BACKLOG-078/079/080 are published; TRIAGE-10/15 are separate |
| Highest parity risks | RA-001 through RA-006 all Resolved — RA v1.9 structural gaps closed |

---

## Reference Architecture Migration Items

| ID | Title | Stack(s) | Nature of Gap | Priority | Status | Decision Record |
|----|-------|----------|---------------|----------|--------|-----------------|
| MIG-01 | Adopt Reference Architecture v1.3 and create DR-012 | All | Governance baseline | High | Resolved | DR-012 |
| MIG-02 | Add RA-literal DOCS path bridges | All | Documentation path compatibility | High | Resolved | DR-013 |
| MIG-03 | Align code review output location and naming | All | Review output compliance | High | Resolved | DR-014, DR-029 |
| BACKLOG-010 | Docker Compose for Local Development | All | Local development infrastructure | Low | Resolved | |
| BACKLOG-011 | Performance Benchmarking Suite | All | Performance regression detection | Low | Resolved | |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | Future Stack implementation | Future | Resolved | |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | Future Stack implementation | Future | Resolved | |
| BACKLOG-014 | Advanced Solving Techniques | DEMOAPP001 and future Stacks | Solver capability | Future | Resolved | |
| BACKLOG-015 | Interactive Sudoku Tutor | Future product surface | Product idea | Future | Resolved | |
| BACKLOG-016 | Puzzle Generator | Future product surface | Product idea | Future | Resolved | DR-043 |
| MIG-04 | Wire Screenplay runtime state through Actor Memory | DEMOAPP001 and future Stacks | Screenplay parity contract | High | Resolved | DR-015 |
| MIG-05 | Remove direct Ability calls from step definitions | DEMOAPP001 and future Stacks | Layer 2 thinness | High | Resolved | DR-015 |
| MIG-06 | Refresh AI agent guide for v1.3 | All | Agent guidance currency | Medium | Resolved | DR-012, DR-013, DR-014, DR-029 |
| MIG-07 | Reconcile backlog against v1.3 state | All | Planning currency | Medium | Resolved | None required |
| MIG-08 | Complete template mandate details | All | Template compliance | Medium | Resolved | None required |
| MIG-09 | Normalize implementation-log location and naming policy | All | Documentation path and naming | Medium | Resolved | DR-017 |
| MIG-10 | Add feature parity validation report process | All | Generated parity artifacts | Medium | Resolved | None required |
| MIG-11 | Parameterize over-specified canonical Gherkin steps | All | Gherkin portability | Low | Resolved | DR-018 |
| MIG-12 | Decide metrics Stack identifier policy | All | Multi-Stack reporting | Low | Resolved | DR-016 |
| MIG-13 | Rename Stack filesystem directories to kebab-case | DEMOAPP001 and future Stacks | Directory naming alignment | Medium | Resolved | DR-016 |

---

## Reference Architecture Improvement Items

Raised by structural review `DOCS/.review/2026-05-18_reference-architecture-structural-review.md`.
Items are improvements to `reference-architecture.md` v1.3 itself, not project implementation work.

| ID | Title | Risk (review) | Severity | Priority | Status | Decision Record |
|----|-------|---------------|----------|----------|--------|-----------------|
| RA-001 | Define `@util` surface type formally in RA Sections 6 and 7 | Risk 1 | Critical | High | Resolved | DR-021 |
| RA-002 | Add CI/CD pipeline requirements section to RA (Section 9.4) | Risk 2 | High | High | Resolved | DR-022 |
| RA-003 | Define automated Memory key parity enforcement mechanism | Risk 3 | High | High | Resolved | DR-023 |
| RA-004 | Define Canonical Feature Store change governance (Section 5.5) | Risk 4 | High | High | Resolved | DR-024 |
| RA-005 | Correct `features_shared/` underscore naming throughout RA | Risk 5 | Medium | Medium | Resolved | None required |
| RA-006 | Resolve uppercase doc name conflict in RA Sections 10.1 and 10.2 | Risk 7 | Medium | Medium | Resolved | DR-025 |
| RA-007 | Add test data management specification to RA (Section 5.6) | Risk 8 | Medium | Medium | Resolved | DR-026 |
| RA-008 | Replace CHANGELOG.md retention policy rule with decision-register.md (Section 9.3) | Risk 9 | Low | Low | Resolved | None required |
| RA-009 | Add verification method column to parity criteria (Section 8.4) | Risk 10 | Low | Low | Resolved | DR-027 |
| RA-010 | Specify shared `packages/` directory rules in RA (Section 4.4) | Risk 11 | Low | Low | Resolved | DR-028 |

---

## Code Review Remediation Items (GPT-5.3-Codex review, 2026-05-30)

Raised by `DOCS/.review/CODE_REVIEW_GPT_5_3_Codex_v1_20260530T0823Z/` (Risks 1–6, plus its Next
Steps). The review postdated this backlog by one day, so the remediation was tracked and delivered
through the portfolio worklist `WORKLIST_gb.automation.smoketests.sudoku.poc.md` (items SUD-01..08)
and is reconciled here as the authoritative record. All **Resolved 2026-06-13**.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-035 | SUD-01 | Early solved-grid check before the progress loop (already-solved input returns `SOLVED` without invoking algorithms) | All | Risk 2 | High | Resolved | None required |
| BACKLOG-036 | SUD-02 | Draft v1.1 solver-platform specification evolving the v1.0 baseline | All (docs) | Risk 1 | High | Resolved | DR-034 |
| BACKLOG-037 | SUD-03 | Deep-copy grid snapshot methods (`getGrid`/`get_grid`/`GetGrid`); public `grid` retained, direct mutation deprecated | All | Risk 3 | Medium | Resolved | None required |
| BACKLOG-038 | SUD-04 | Document validation-layer boundaries (loader = structure; solver/API = constraints) + author DEMOAPP001 OpenAPI contract | DEMOAPP001 (docs) | Risk 4 | Medium | Resolved | DR-035 |
| BACKLOG-039 | SUD-05 | Stack capability matrix — core/BDD parity required, API/web staged as roadmap for DEMOAPP002/003 | All (docs) | Risk 5 | Medium | Resolved | None required |
| BACKLOG-040 | SUD-06 | Document C# loader integer validation (typed `System.Text.Json` deserialization as the integer-type gate) | DEMOAPP003 (docs) | Risk 6 | Low | Resolved | None required |
| BACKLOG-041 | SUD-07 | Accept v1.1 spec post-merge — DR-034 flipped to Accepted, root README version/status metadata updated | All (docs) | Next Step 2 | Medium | Resolved | DR-034 |
| BACKLOG-042 | SUD-08 | Bump GitHub Actions to Node-24-compatible versions (`checkout@v5`/`setup-node@v5`/`setup-python@v6`/`setup-dotnet@v5`/`upload-artifact@v6`) ahead of the 2026-06-16 cutover | CI | Currency | Medium | Resolved | None required |

Delivery: SUD-01/02 in PR #18; SUD-03/04 in PR #19; SUD-07/08 in PR #20; SUD-05/06 in PR #21.
All three stacks remained green (46 scenarios each) with memory-key / feature / step-text parity
passing at each step; CI ran green on the new Node-24 action pins. Docs-only items were verified by
link/anchor resolution and stale-claim greps. The structural decisions are recorded as DR-034 (v1.1
platform spec) and DR-035 (validation boundaries + OpenAPI), both Accepted.

---

## Code Review Remediation Items (CLAUDE_Opus_4_8 review, 2026-06-16)

Raised by `DOCS/.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z/` (Risks 1–5; all
Low/editorial or Informational — no Critical/High/Medium findings). Tracked and delivered through
the portfolio worklist `WORKLIST_gb.automation.smoketests.sudoku.poc.md` (items SUD-09..13) and
reconciled here as the authoritative record.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-043 | SUD-09 | Fix root README "+ Flask" mislabel of the Python stack (diagram boxes relabelled to the real toolchains: TypeScript/Cucumber, Python/pytest-bdd, C#/SpecFlow) | All (docs) | Risk 1 | Low | Resolved | None required |
| BACKLOG-044 | SUD-10 | Update stale root README "35+ test scenarios" claim to the true figure (46 scenarios per stack / 138 across all three; DEMOAPP001 = 46/257 steps) | All (docs) | Risk 2 | Low | Resolved | None required |
| BACKLOG-045 | SUD-11 | Governance hygiene: add an ordering note at DR-035 explaining it was authored before DR-034 (IDs sequential, on-page order reversed); drop seconds from the root README date metadata per the no-seconds convention (`2026-01-30T20:00:00Z` -> `2026-01-30T20:00Z`) | All (docs) | Risk 4 | Low | Resolved | None required (editorial) |
| BACKLOG-046 | SUD-12 | README ASCII-vs-emoji policy — option (a) documented exception: record in `DOCS/.design/naming-conventions.md` §5.1 that the root README is a deliberate, governed exception permitted rich formatting (emoji status glyphs + box-drawing diagram) as the primary human-facing doc, while all other authored docs stay ASCII/kebab-case per DR-020; README and naming-conventions no longer contradict | All (docs) | Risk 3 | Low | Resolved | None required (DR-020 already reserves README) |
| BACKLOG-047 | SUD-13 | CI aggregate `gate` job + `pwsh` prerequisite note — option (b) DO IT: add a lightweight `gate` job to `.github/workflows/ci.yml` with `needs: [demoapp001-typescript-cypress, demoapp002-python-pytest, demoapp003-csharp-specflow]` running a trivial step, to serve as a single fan-in required status check that branch protection can pin; add a `pwsh` (PowerShell 7+) prerequisite note to the README contributor section for reproducing the `.batch/*.ps1` parity gates locally | CI + docs | Risk 5 | Informational | Resolved | None required (no structural change; gate is a CI convenience) |

---

## Code Review and P-07 Reconciliation (CLAUDE_Fable_5, 2026-07-06; P-07, 2026-07-14)

The review's dependency/runtime and documentation findings were re-tested rather than copied
forward. P-07 then extended the evidence to the complete Git history, GitHub metadata, licence,
artefacts, CI safety, dependency licences, and clean bootstrap. The independent audit record is
[`2026-07-14_p07-public-readiness-audit.md`](../.implementation-logs/2026-07-14_p07-public-readiness-audit.md).

| ID | Title | Stack(s) | Review/audit evidence | Priority | Status | Decision Record |
|----|-------|----------|-----------------------|----------|--------|-----------------|
| BACKLOG-048 | Clear dependency advisories and make bootstrap inputs reproducible | All | Review Risk 2 plus P-07 dependency/bootstrap audit | Medium | Resolved | None required |
| BACKLOG-049 | Replace EOL Node 20 and refresh CI action/runtime safety | DEMOAPP001 + CI/containers | Review Risk 3 plus P-07 CI audit | Medium | Resolved | None required |
| BACKLOG-050 | Replace EOL SpecFlow/.NET 8 maintenance boundary | DEMOAPP003 | Review Risk 1 | Medium | Resolved | DR-036 |
| BACKLOG-051 | Strengthen orchestration ordering and no-execution assertions | All | Review Risk 7 | Low | Resolved | Not required — canonical Gherkin unchanged |
| BACKLOG-052 | Reconcile documentation and governance currency | All (docs) | Review Risks 5, 6, 8 and I-3 | Low | Resolved | None required |
| BACKLOG-053 | Complete independent Sudoku publication-readiness audit | All + GitHub metadata/history | Portfolio P-07 | Medium | Resolved | Publication remains a separate owner decision |
| BACKLOG-054 | Reconcile SUD-17 licence closure (root LICENSE + manifest metadata) | All | Review Risk 4 (LOW) plus portfolio P-04 licence audit | Low | Resolved | None required (D-06 recorded in portfolio `PORTFOLIO_P04_DECISION_MATRIX_2026-07-14.md`) |
| BACKLOG-055 | Add RA header-currency guard to `.batch/run-parity-checks.ps1` | All (tooling) | Review "Next Steps" (consider-level); drift recurred 3x (BACKLOG-028, SUD-11, Risk 6) | Low | Resolved | None required |

Resolution evidence:

- BACKLOG-048: npm audit is zero after a compatible lock refresh; Python test constraints and
  NuGet lockfiles now make all three restore inputs repeatable; Python and NuGet scans report no
  known vulnerabilities.
- BACKLOG-049: Node 24 LTS is enforced in package metadata, CI, and containers; current action
  majors are used where available, checkout credentials are not persisted, and workflow
  permissions are read-only.
- BACKLOG-050: Reqnroll 3.3.4 + NUnit 4 on .NET 10 LTS passes all 46 scenarios. Generated
  code-behind moved to ignored `obj/`; DR-036 preserves the old Stack ID/path as explicit legacy
  integration identifiers.
- BACKLOG-052: CHANGELOG/review-stream currency, decision-register v1.15 metadata, root README
  structure/runtime claims, and this backlog's stale review date are reconciled.
- BACKLOG-053: the audit is a conditional technical go. Publication still requires an explicit
  historical-email decision and repository-specific visibility approval; private status is not a
  defect.
- BACKLOG-054: SUD-17 (worklist, derived 2026-07-06) asked for a root MIT `LICENSE` per a
  2026-07-07 user decision recorded at the time. The portfolio-wide P-04 licence audit (2026-07-14)
  re-examined every project's licence position and instead approved and delivered **ISC** for this
  project as decision D-06 (`PORTFOLIO_P04_DECISION_MATRIX_2026-07-14.md`: "Preserves the only
  existing machine-readable project signal and extends it consistently across the root/multi-stack
  documentation"), delivered via [PR #30](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/30)
  (`docs: align ISC licensing across stacks`, merged 2026-07-14T12:03Z, CI green). D-06 therefore
  supersedes the worklist's MIT default. Root `LICENSE`, `demoapp001`'s `package.json`
  (`"license": "ISC"`), `demoapp002`'s `pyproject.toml` (`license = "ISC"`), and the README licence
  section are already mutually consistent on ISC; re-verified 2026-07-17 (`npm audit` in
  `demo-apps/demoapp001-typescript-cypress/` still reports 0 vulnerabilities as a sanity check, no
  licence-affecting change made). No DR is required in this project's own `decision-register.md`
  per the review's own finding (Risk 4, LOW) — the structural decision is recorded at the portfolio
  level in D-06. This entry exists only to close the loop between the worklist and the backlog; no
  further licence file or metadata change is made by this item.
- BACKLOG-055: added `.batch/check-ra-header-currency.ps1`, which reads the active RA version from
  `DOCS/reference-architecture.md`'s `**Version:**` header and asserts that both
  `decision-register.md`'s and `DOCS/.planning/backlog.md`'s own "Governed by" headers cite that
  same version, failing (exit 1) on any mismatch or missing header. Wired as the first step in
  `.batch/run-parity-checks.ps1` and as a new "RA header currency" CI step (before "Memory key
  parity") in the DEMOAPP001 job of `.github/workflows/ci.yml`, since that job is where the other
  cross-stack parity gates already run. Verified locally: passes on current `main` state (both
  headers cite v1.15, matching `DOCS/reference-architecture.md`); a negative test with an injected
  stale `v1.14` citation in `decision-register.md` correctly failed (exit 1) before being reverted.
  This guard must run after SUD-18 lands the v1.15 header fix, which it already has (BACKLOG-052).
- BACKLOG-051: the orchestration `Then`-step bodies for "Execute solving techniques in correct
  order" and "Stop execution when puzzle is completely solved" (`orchestration.steps.ts` lines
  ~89-147 pre-change, and the Python/C# mirrors) previously only re-checked the overall `SOLVED`
  status, which the review correctly identified as not actually testing ordering or non-execution.
  A new solve path (`solvePuzzleTrackingOrder()`/`solve_puzzle_tracking_order()`/
  `SolvePuzzleTrackingOrder()`) always captures the audit event sequence — deliberately kept
  separate from the opt-in audit-trail feature (`lastAuditTrail`) so "Solver without audit logging
  produces no trail" stays unaffected — and is wired only into the two When-steps these two
  scenarios use. The Then-steps now assert real, always-true invariants derived from the actual
  event data (verified empirically against every current puzzle fixture before writing the
  assertions): Unit Completion, when logged, is always an iteration's first event; Hidden Singles
  digits appear in strictly ascending 1-9 order after Unit Completion; Naked Singles, when logged,
  is always an iteration's last event; and the already-solved-grid scenario shows exactly 0
  iterations and 0 audit events (the SUD-01/BACKLOG-035 contract). DEMOAPP003's `AuditTrail` record
  gained a `TotalIterations` field (previously only exposed via TS `totalIterations`/Python
  `total_iterations`) to support the last check with parity across all three stacks. Canonical
  Gherkin text is unchanged, so no DR is required per the review's own criterion ("only if the
  canonical behavioural contract changes structurally"). Verified: all three 46-scenario suites
  green (DEMOAPP001 locally; DEMOAPP002 locally; DEMOAPP003 via a net9.0 scratch-copy compile/test
  check, since the sandboxed dev environment only has .NET SDKs up to 9.0.316 and this Stack
  targets net10.0 — CI (`dotnet-version: "10.0.x"`) is authoritative for the real target); all
  parity gates PASS.

---

## Code Review Remediation Items (CLAUDE_Fable_5 v2, 2026-07-18)

Raised by
`DOCS/.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0609Z/` and tracked through the portfolio
worklist extension (TRIAGE-01..04). Items are added here when completed so this authoritative
backlog retains their final status and verification evidence.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-056 | TRIAGE-01 | Extend lint and formatting gates across DEMOAPP001 test/tooling TypeScript | DEMOAPP001 + CI | Risk 1 | Low | Resolved | None required |
| BACKLOG-057 | TRIAGE-02 | Reconcile CLAUDE.md's accepted DR range and extend the governance-currency guard | All (docs/tooling) | Risk 2 | Low | Resolved | None required |
| BACKLOG-058 | TRIAGE-03 | Align the local parity-check container with CI's PowerShell and Ubuntu versions | All (tooling) | Risk 3 | Low | Resolved | None required |
| BACKLOG-059 | TRIAGE-04 | Enforce DEMOAPP001's declared Node 24 engine range during npm installs | DEMOAPP001 | Risk 4 | Low | Resolved | None required |

Resolution evidence:

- BACKLOG-056: ESLint and Prettier now cover `app_src/**/*.ts`, `tests/**/*.ts`, and
  `tooling/**/*.ts`; the type-aware ESLint block uses `tsconfig.cucumber.json`, with the
  established Screenplay PascalCase factories and uppercase Memory properties represented in the
  naming rules. CI now runs `npm run format:check` beside lint. The 37 newly covered files were
  formatted. Local verification: clean `npm ci` (0 vulnerabilities; expected Node-20 engine
  warnings because the project requires Node 24), build, lint, format check, API integration tests,
  46 scenarios / 257 steps, and all repository parity checks PASS. Node-24 CI is authoritative.
- BACKLOG-057: removed CLAUDE.md's duplicate stale DR range, leaving the Authority Order as the
  single accepted-range statement. The RA header-currency guard now checks CLAUDE.md alongside the
  decision register and backlog, accepts its `DOCS/reference-architecture.md` citation, derives
  the latest accepted DR from the decision register's `Next ID` footer, and rejects stale ranges.
  Verified with a current-state PASS and an injected `DR-001 through DR-035` negative test that
  failed before the correct `DR-001 through DR-036` range was restored. No DR required.
- BACKLOG-058: the Compose `parity-checks` service now pins
  `mcr.microsoft.com/powershell:7.5-ubuntu-24.04`, matching the shell/OS pair used by CI instead of
  the PowerShell 7.4 / Ubuntu 22.04 lineage. `docker compose config --quiet` and
  `docker compose run --rm parity-checks` both pass on the local Docker Linux engine; the container
  reports PASS for RA currency, Memory-key, feature, and step-text parity. No DR required.
- BACKLOG-059: DEMOAPP001 now has a Stack-local `.npmrc` with `engine-strict=true`, enforcing its
  declared `node >=24 <25` range at install time. On local Node 20.19.5 / npm 10.8.2, `npm ci`
  fails immediately with `EBADENGINE` and exit 1. In an isolated Node 24.18.0 / npm 11.16.0
  container, a clean `npm ci` reports 0 vulnerabilities, then build, lint, format check, API
  integration, and all 46 scenarios / 257 steps pass. No DR required.

---

## Code Review Remediation Items (Codex v1, 2026-07-23)

Raised by `DOCS/.review/CODE_REVIEW_CODEX_v1_20260723T2351Z/` and tracked through the portfolio
worklist extension SUD-21..31. Items are added here when completed; BACKLOG-060..070 were reserved
against the free range after BACKLOG-059 and must still be checked immediately before each write.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-060 | SUD-21 | Characterise orchestration fixtures and define an immutable attempt-event contract | All (tests/fixtures + docs/design) | R1 | High | Resolved | DR-037 |
| BACKLOG-061 | SUD-22 | Instrument immutable attempt events and make orchestration specifications mutation-sensitive | All (code + tests + docs) | R1 | High | Resolved | DR-037 |
| BACKLOG-062 | SUD-23 | Reject JSON boolean cells consistently at loader and REST boundaries | All (code + tests) | R2 | Medium | Resolved | None required |
| BACKLOG-063 | SUD-24 | Add a focused TypeScript component lane and first coverage baseline | DEMOAPP001 (tests + CI + docs) | R4 | Medium | Resolved | None required |
| BACKLOG-064 | SUD-25 | Add a focused Python component lane and first coverage baseline | DEMOAPP002 (tests + CI + docs) | R4 | Medium | Resolved | None required |
| BACKLOG-065 | SUD-26 | Add a focused C# component lane and first coverage baseline | DEMOAPP003 (tests + CI + docs) | R4 | Medium | Resolved | None required |
| BACKLOG-066 | SUD-27 | Make the implemented OpenAPI contract executable through linting and response validation | DEMOAPP001 (tests + CI + docs) | R4 | Medium | Resolved | None required |
| BACKLOG-067 | SUD-28 | Convert measured component baselines into coverage policy and run a focused mutation trial | All (tests + CI + docs) | R4 | Medium | Resolved | DR-038 |
| BACKLOG-068 | SUD-29 | Restore current documentation authority and extend stable currency checks | All (docs + tooling) | R3 | Medium | Resolved | None required |
| BACKLOG-069 | SUD-30 | Publish equivalent structured test and coverage evidence for every CI Stack | All (CI + tooling + docs) | R5 | Low | Resolved | None required |
| BACKLOG-070 | SUD-31 | Add blocking supported-runtime dependency audits and a bounded exception policy | All (CI + tooling + docs) | R5 | Low | Resolved | DR-039 |

Resolution evidence:

- BACKLOG-060: `DOCS/.analysis/orchestration-characterisation-20260727.md` records matching
  TypeScript/Node 24, Python 3.13 and C#/.NET 10 results for all five puzzles: final grids,
  iterations, inferred current-loop attempt counts, changed-event counts and cell-change counts.
  It proves that `Logic Squeeze Grid` changes cells through Hidden Singles and Naked Singles but
  records zero Unit Completion changes; a test-only mutation probe still solves it when any one
  technique is disabled. DR-037 therefore adopts the narrower fixture claim and approves
  `DOCS/.design/orchestration-attempt-events.md` as the language-neutral SUD-22 contract. The
  contract separates deterministic immutable attempt events from the existing change-only audit
  response. Production orchestration and canonical Gherkin remain unchanged in SUD-21; SUD-22 owns
  instrumentation and the same-change canonical/three-Stack executable-specification update.
- BACKLOG-061: every orchestrator call now emits an optional, deterministic attempt event after
  invocation, including unchanged calls, a solve-wide sequence, iteration, Hidden Singles digit,
  changed flag and immutable before/after cell evidence. Observer spies in each Stack assert the
  exact eleven-attempt sequence and terminal-progress behaviour; the existing focused Hidden
  Singles row/column/box scenarios continue to protect its three internal passes. Canonical
  Gherkin now asserts exact order, more than one iteration, progress in every non-terminal pass,
  immutable evidence, and the truthful `Logic Squeeze Grid` behaviour: Unit Completion is
  attempted without changes while Hidden Singles and Naked Singles both change the grid. The
  existing audit payload and result grids remain unchanged. Verification: TypeScript Node 24
  (2 component tests + 46 scenarios / 259 steps), Python 3.13 (48 tests), C# .NET 10 (48 tests),
  API integration and all repository parity gates PASS. BACKLOG-051 remains historical evidence
  of the earlier change-only ordering assertions; this item closes the residual observability gap.
- BACKLOG-062: DEMOAPP002's loader now uses an exact `type(cell) is int` boundary, rejecting JSON
  `true` and `false` instead of accepting Python's `bool` subtype. A canonical two-example scenario
  uses the same otherwise-valid 9x9 malformed puzzle in the TypeScript, Python and C# real-loader
  bindings without asserting language-specific exception text. Focused Python tests cover both
  booleans and unchanged integer boundaries; DEMOAPP001 API integration covers both booleans across
  all five grid-accepting POST endpoints. Verification: TypeScript Node 24 (2 component tests + 48
  scenarios / 267 steps), Python 3.13 (53 tests), C# .NET 10 (50 tests), API integration and all
  repository parity gates PASS. The existing integer-only contract, error wording and REST status
  codes are unchanged, so no DR or validation-boundary contract update was required.
- BACKLOG-063: DEMOAPP001 now exposes `test:component` as a 16-test lower-level lane distinct from
  the 48-scenario Cucumber contract. Focused tests exercise loader shape/type/range/query boundaries;
  minimal Unit Completion, Hidden Singles and Naked Singles grids; SUD-22 attempt evidence plus the
  early-complete and inconsistent-change orchestration seams; and API `400`/`404`/`422`, constraint
  and `SOLVED`/`STUCK_ON_ADVANCED_LOGIC` mappings. `test:coverage` uses Node 24's native coverage
  with explicit production-module includes and no threshold flags. The first diagnostic baseline is
  73.23% lines / 87.67% branches / 79.59% functions across `PuzzleLoader`, `SudokuSolver`,
  `SudokuOrchestrator`, `SudokuApiService` and server validation; per-module values, exclusions and
  reproduction are recorded in `demo-apps/demoapp001-typescript-cypress/docs/component-test-coverage-baseline.md`.
  CI retains the raw report in its existing validation artefact. No DR was required because this is
  report-only evidence; SUD-28 owns mutation review and any justified threshold. Verification:
  Node 24 build, lint, format, API integration, 16 component tests, 48 scenarios / 267 steps and all
  repository parity gates PASS; Python 53 and .NET 10 50-test regression suites remain green.
- BACKLOG-064: DEMOAPP002 now exposes 26 focused tests under `tests/component`, distinct from the
  48-scenario pytest-bdd contract. Direct tests exercise loader type/range/dimension/query and
  missing-file boundaries; minimal Unit Completion, Hidden Singles and Naked Singles grids;
  SUD-22 attempt order, fixpoint/no-progress, early-complete and inconsistent-change seams; and
  placement/constraint/solution validation mappings. coverage.py 7.15.2 is governed by the Python
  3.13 constraints lock; branch collection selects `puzzle_loader`, `sudoku_solver` and
  `sudoku_orchestrator`, with explicit exclusions and no `fail_under` setting. The first diagnostic
  baseline is 87.54% lines / 88.31% branches (87.81% combined); reproduction and per-module values
  are recorded in `demo-apps/demoapp002-python-pytest/docs/component-test-coverage-baseline.md`.
  CI emits the report under Python 3.13 before the complete test gate. No DR was required because
  this is report-only evidence; SUD-28 owns mutation review and any justified threshold.
  Verification: clean Python 3.13 install and dependency check, 26 component / 74 total tests,
  Node 24 build/lint/format/API/coverage plus 48 scenarios / 267 steps, .NET 10 50 tests, and all
  host/container repository parity gates PASS.
- BACKLOG-065: DEMOAPP003 now has a separate `DemoApp003.ComponentTests` NUnit project with 24
  focused tests, while `DemoApp003.Specs` remains a 48-test Reqnroll project. Direct tests exercise
  loader type/range/dimension/query and true missing-file boundaries; minimal Unit Completion,
  Hidden Singles and Naked Singles grids; SUD-22 exact attempt order, immutable change evidence,
  fixpoint/no-progress and early-complete seams; and placement/constraint/solution validation. The
  C# Stack has no service/API surface, so direct solver validation covers the equivalent in-process
  contract. coverlet.collector 10.0.1 selects `PuzzleLoader`, `SudokuSolver` and
  `SudokuOrchestrator` under .NET 10, and a PowerShell helper prints the latest Cobertura totals.
  The first diagnostic baseline is 388/451 lines (86.03%) and 180/212 branches (84.91%);
  reproduction, per-type values and exclusions are recorded in
  `demo-apps/demoapp003-csharp-specflow/docs/component-test-coverage-baseline.md`. CI collects the
  report before running Reqnroll. No DR was required because production behaviour and the canonical
  contract are unchanged; SUD-28 owns mutation review and any justified threshold. Verification:
  .NET 10 locked restore, 24 component / 72 solution tests, Node 24 and Python 3.13 regression
  suites, and all host/container repository parity gates PASS.
- BACKLOG-066: DEMOAPP001 now pins Redocly CLI 2.41.0, OpenAPI Backend 5.19.0 and ajv-formats 3.0.1
  in the Node 24 lockfile. `openapi:lint` checks `docs/openapi.yaml` against the committed
  recommended rules; the
  document now declares the repository's ISC licence and its deliberately unauthenticated public
  demo surface explicitly. `test:openapi` validates real Supertest response bodies for health,
  technique and solve success; `400`, `404` and `422` client errors; and an injected unexpected
  `500` failure against their operation/status schemas, including date-time formats. Its focused
  negative control removes the required health timestamp and proves the validator rejects the
  drift. `verify:openapi` runs both checks as a required CI step after the existing API integration
  lane. No DR was required: DR-035 already governs the implemented OpenAPI authority, and neither
  endpoints nor response behaviour changed. Verification: clean Node 24 install, build, lint,
  format, API integration, 4 OpenAPI contract tests, 16 component tests, coverage and 48 scenarios /
  267 steps; Python 3.13 74 tests; .NET 10 24 component + 48 Reqnroll tests; and host/container
  parity gates all PASS.
- BACKLOG-067: DR-038 converts the three report-only baselines into Stack-specific regression
  guardrails without changing their deliberately selected production scopes: Node 24 enforces 70%
  lines / 85% branches / 75% functions, coverage.py enforces 85% combined with branch collection,
  and the C# Cobertura helper enforces 80% lines / 80% branches. Deliberate 99% negative controls
  prove all three enforcement paths fail closed. The reproducible DEMOAPP001 mutation tool makes an
  isolated temporary Stack copy for each change and killed all 10 focused mutants: removal and
  reordering of each Unit Completion, Hidden Singles and Naked Singles call plus weakened integer,
  range, row and column loader guards. No survivor required extra tests. The root test-pyramid claim
  now states measured component/API/BDD evidence instead of generic unit/integration labels. Exact
  results and exclusions are recorded in
  `DOCS/.analysis/coverage-and-mutation-policy-20260728.md`. Verification: Node 24 trial 10/10 and
  16-test coverage lane PASS; Python 3.13 26-test coverage lane PASS; .NET 10 24-test coverage lane
  PASS; full Stack and host/container parity gates PASS.
- BACKLOG-068: active root and Stack documentation now records public repository visibility,
  Node 24, Python 3.13, Reqnroll/.NET 10, the derived 48-scenario / 267-step baseline, exact manifest
  versions and the complete merged review inventory. The REST API wrapper proposal is marked as
  historical and points to the implemented OpenAPI contract governed by DR-035. BACKLOG-021's
  migration history is retained while its current state is explicit, and BACKLOG-058/059 are again
  discoverable in the resolved index. The extended currency guard derives execution/runtime facts,
  checks manifest and review-index claims, and rejects six isolated stale mutations covering
  visibility, counts, runtime, authority, review inventory and dependency versions. No DR was
  required because existing authorities and implementation remained unchanged. Verification:
  documentation guard plus all six negative controls, Node 24 build/lint/format/API/OpenAPI/
  component/coverage/BDD gates, Python 3.13 dependency/coverage/full-suite gates, .NET 10 locked
  restore/component/coverage/Reqnroll gates, and host/container parity all PASS.
- BACKLOG-069: DEMOAPP001 emits Cucumber JSON/JUnit plus LCOV and its component summary;
  DEMOAPP002 emits pytest JUnit plus Cobertura XML and its component summary; DEMOAPP003 emits
  separate component/Reqnroll TRX plus fixed-name Cobertura XML and its component summary. Each
  Stack verifies its required non-empty native files and uploads a clearly named `*-ci-evidence`
  artefact under `if: always()`, seven-day retention and `if-no-files-found: error`. The TypeScript
  artefact continues to retain feature-parity output. A shared checker parses JSON/XML/LCOV, and 11
  isolated missing-file controls prove every required path fails closed. Existing read-only
  permissions, disabled persisted credentials, supported runtimes, coverage/OpenAPI gates and the
  aggregate fan-in are unchanged; SUD-31 retains dependency-audit and exception-policy scope. No DR
  was required because evidence formats and retention are CI implementation details, not a new
  normative assurance policy. Verification: Node 24 build/lint/format/API/OpenAPI, 16 component
  tests plus 48 Cucumber scenarios / 267 steps; Python 3.13 dependency check, 26 component coverage
  tests plus 74 total tests; .NET 10 locked restore, 24 component coverage tests plus 48 Reqnroll
  tests; all 11 real evidence files; 11/11 missing-file controls; and host/container parity PASS.
- BACKLOG-070: DR-039 now runs lock-aware `npm audit` under Node 24, governed `pip-audit` 2.10.1
  against the Python 3.13 constraint-resolved environment, and the supported NuGet vulnerability
  command after .NET 10 locked restore. Each Stack retains native output plus the same normalised
  summary in its existing seven-day evidence artefact. High/critical and unknown-severity findings,
  invalid reports, unexcepted outages, expired/overlong/malformed/unmatched exceptions and missing
  evidence fail closed; exact exceptions require Stack plus advisory/package or tool, owner, reason,
  approver and introduction/expiry dates, with a maximum 14-day inclusive window. Thirteen policy
  controls and 17 required-file omissions protect those rules. The 2026-07-23 high-severity
  GHSA-mh99-v99m-4gvg finding was re-tested and remediated by constraining transitive
  `brace-expansion` to patched 5.0.8, leaving the registry empty. Verification: zero findings from
  Node 24 npm, Python 3.13 `pip-audit` and .NET 10 NuGet; TypeScript build/lint/format/API/OpenAPI,
  16 component tests, coverage and 48 scenarios / 267 steps; Python dependency check, 26 component
  / 74 total tests and coverage; .NET locked restore, 24 component / 48 Reqnroll tests and coverage;
  PowerShell parse, actionlint, Compose config, documentation, evidence and all parity gates PASS.

---

## September 2026 Review Remediation

The owner-approved portfolio worklist extension dated 2026-09-30 governs the new residual defects
from `DOCS/.review/CODE_REVIEW_CODEX_v2_20260929T0633Z/`. These are new records, not reopened
BACKLOG-015/016 closures. Allocate each subsequent candidate during its own iteration.

| ID | Worklist | Title | Stack(s) | Review risk | Priority | Status | Decision Record |
|----|----------|-------|----------|-------------|----------|--------|-----------------|
| BACKLOG-072 | TRIAGE-05 | Share technique vocabulary and exhaustively grade every supported technique | DEMOAPP001 | R3 | Medium | Resolved | DR-044 |
| BACKLOG-073 | TRIAGE-06 | Reject exhausted target-difficulty generation with an explicit bounded failure | DEMOAPP001 | R2 | Medium | Resolved | DR-045 |
| BACKLOG-074 | TRIAGE-07 | Reject stale asynchronous tutor hints after grid or request changes | DEMOAPP001 | R4 | Medium | Resolved | DR-046 |

## Owner-Authorised Work

| ID | Title | Stack(s) | Priority | Status | Decision Record |
|----|-------|----------|----------|--------|-----------------|
| BACKLOG-075 | Publish a three-stack parity evidence page at `/parity/` | All | Medium | Resolved | DR-047 |
| BACKLOG-078 | Strengthen weak Then-step assertions in all three Stacks | All | Medium | Resolved | None required (existing contracts) |

## Supported-runtime CI Restoration (2026-09-30)

| ID | Worklist | Title | Stack(s) | Priority | Status | Decision Record |
|----|----------|-------|----------|----------|--------|-----------------|
| BACKLOG-076 | TRIAGE-12 | Restore supported-runtime dependency audits with patched locks | DEMOAPP001 / DEMOAPP002 | High | Resolved | DR-039 (existing policy) |

## Owner-Selected Browser Contract Repair (2026-09-30)

| ID | Worklist | Title | Stack(s) | Priority | Status | Decision Record |
|----|----------|-------|----------|----------|--------|-----------------|
| BACKLOG-077 | TRIAGE-11 | Restore native browser startup through the visualiser pause export | DEMOAPP001 | Medium | Resolved | DR-042 (existing UI contract; no new structural choice) |

## Product and Technical Work

### Owner-selected visualiser consistency repair (2026-10-06)

| ID | Worklist item | Title | Stack(s) | Priority | Status | Decision Record |
|----|---------------|-------|----------|----------|--------|-----------------|
| BACKLOG-079 | TRIAGE-13 | Preserve the paused visualiser playhead after leaving tutor | DEMOAPP001 | Medium | Resolved | DR-042 (existing UI contract), DR-039 (approved bounded audit exception) |

| ID | Title | Stack(s) | Nature of Gap | Priority | Status |
|----|-------|----------|---------------|----------|--------|
| BACKLOG-009 | Implement REST API Wrapper | DEMOAPP001 API surface | Feature implementation | Medium | Resolved |
| BACKLOG-018 | Implement Web UI Solver Visualisation | DEMOAPP001 future UI surface | Feature implementation | Medium | Resolved |
| BACKLOG-021 | C# Screenplay-style Step Definitions | DEMOAPP003 | Future Stack parity | Medium | Resolved |
| BACKLOG-010 | Docker Compose for Local Development | All | Local development infrastructure | Low | Resolved |
| BACKLOG-011 | Performance Benchmarking Suite | All | Performance regression detection | Low | Resolved |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | Future Stack implementation | Future | Resolved |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | Future Stack implementation | Future | Resolved |
| BACKLOG-014 | Advanced Solving Techniques | DEMOAPP001 and future Stacks | Solver capability | Future | Resolved |
| BACKLOG-015 | Interactive Sudoku Tutor | Future product surface | Product idea | Future | Resolved |
| BACKLOG-016 | Puzzle Generator | Future product surface | Product idea | Future | Resolved |
| BACKLOG-071 | Static browser-only visualisation evidence on Pages (LAND-09D) | DEMOAPP001 evidence surface | Public evidence publication | Low | Resolved |
| BACKLOG-051 | Strengthen orchestration ordering/no-execution assertions | All | Test assertion fidelity | Low | Resolved |
| BACKLOG-032 | Refactor Python Questions to read from Actor memory | DEMOAPP002 | Screenplay parity (Risk 1) | High | Resolved |
| BACKLOG-033 | Extract side effects from MultipleSolvers.isolation_verified() | DEMOAPP002 | Screenplay anti-pattern (Risk 2) | High | Resolved |
| BACKLOG-034 | Resolve BACKLOG-012 as stale duplicate of BACKLOG-020 | All | Backlog governance (Risk 4) | Medium | Resolved |

---

## Active Item Details

### BACKLOG-079: Preserve the paused visualiser playhead after leaving tutor

**Status:** Resolved 2026-10-06 on local validation and native browser acceptance;
all-Stack PR CI remains the publication check.
**Stack:** DEMOAPP001
**Priority:** Medium
**Authority:** Owner selected TRIAGE-13 on 2026-10-06 and approved its dependency-exception decision the same day.
**Decision:** Reuse the existing player index under DR-042; no solver, API or cross-Stack contract changes.

The app redraws `onStep(0)` when returning from tutor although playback retains its paused
index. TRIAGE-11 native evidence observed step 1 of 51 with an empty first-move cell and
no highlighted event; resuming then advanced from the retained index. The focused repair
redraws `onStep(currentIndex())`.

The required supported-runtime audit discovered critical proxy-addr GHSA-jqcg-44mw-7w3h
and unpatched high-severity braces GHSA-vfj7-8cjw-p6xm. The approved prerequisite is the
compatible proxy-addr 2.0.8 lock and one exact demoapp001/braces exception, owned and
approved by GBrooks1970, introduced 2026-10-06 and expiring 2026-10-12 inclusive.
The high threshold and fourteen-day maximum stay unchanged; remove the exception on
upstream remediation. The existing moderate fast-uri finding remains TRIAGE-09.

Acceptance criteria:

- [x] First, middle and final visualiser/tutor round-trips preserve the grid, current event,
      statistics, counter and paused index consistently.
- [x] Playback resumes coherently from that index, with no duplicate interval; no-data and
      repeated round-trips remain safe.
- [x] Focused real-module regressions reject the original redraw behaviour.
- [x] Native browser verification confirms the user flow and records browser errors.
- [x] Applicable Node, API/OpenAPI, coverage, web/Pages, repository parity, audit and CI
      evidence gates pass; all-Stack PR CI is the publication check.

Implementation plan: [TRIAGE-13](../.implementation-plans/2026-10-06-triage-13-visualiser-playhead.md).

Node 24.18.0 / npm 11.16.0 locked restore passed (410 packages, 145544 ms). The focused
player/app file passed 11 tests (10717.0229 ms), including six new cases and the original-redraw
negative control. Full component tests passed 113/113 (74560.2244 ms); BDD passed 55 scenarios /
309 steps (8.213 s wall-clock in Cucumber). API integration, eight OpenAPI contract checks,
build/lint/format, explicit app syntax/format and `check:web`/`check:pages` passed. App formatting
initially rejected line endings; Prettier normalised them and its recheck passed without a
semantic change beyond the planned import/redraw.

Selected-module coverage passed at 80.11% lines / 91.94% branches / 80.17% functions, with
unchanged 70% / 85% / 75% floors and one local test worker (113 tests; 162886.1023 ms).
This floor does not claim browser-controller line coverage. Governed audit passed as
`excepted`: two unique findings, one blocking braces finding covered by the approved exception,
zero unexcepted findings; fast-uri remains moderate. Native browser checks on the real Express
app used Easy Scan Grid (51 placements): initial, playing/paused middle, repeated, final and
no-data round-trips, then coherent resumption from step 1 to step 2. All 81 cell values/classes,
event selection, technique counts/bar widths and counter were compared; no browser console
errors were captured. Evidence is retained under `.results/triage-13/resumed-20261006/`.
All seven repository parity/governance checks passed (23020 ms), including policy/evidence
negative controls; the DEMOAPP001 CI evidence contract passed 6/6 files (2628 ms).
Python/C# local suites and the unrelated mutation trial were not rerun; all-Stack PR CI remains
required, and Pages deployment follows the owner's merge.

---

### BACKLOG-075: Three-stack parity evidence page

**Status:** Resolved 2026-09-30 — the page is live at `/parity/`; scope and boundary set by DR-047.
**Stack:** All (DEMOAPP001, DEMOAPP002, DEMOAPP003)
**Priority:** Medium
**Decision:** DR-047. DR-040 stays in force for the visualisation and is not superseded.
**Plan:** [`todo-parity-evidence-page.md`](todo-parity-evidence-page.md) (slices S1 to S5; decisions D1 to D4 answered by the owner on 2026-09-30).
**Source:** `portfolio-docs/PORTFOLIO_SUDOKU_PARITY_EVIDENCE_PAGE_FEASIBILITY_2026-09-30.md` in `GBrooks1970/test-automation-portfolio` (gaps G3-G6; its 'DR-044' is DR-047 here).

Acceptance criteria:

- [x] Spike: decide whether Reqnroll 3.3.4 emits Cucumber-compatible results or the C# Stack falls back to matching TRX results by scenario title; record the outcome before any CI change. **Done 2026-09-30:** direct Cucumber Messages output chosen, TRX fallback rejected because 12 outline rows share names; 55 scenarios / 309 steps agree across all three Stacks after normalisation. See `DOCS/.implementation-logs/2026-09-30_backlog-075-reqnroll-results-spike.md`.
- [x] Clickable mock-up built from a real local run of all three Stacks, reviewed by the owner before CI changes. **Done 2026-09-30:** built from real results of all three Stacks (55 scenarios / 309 steps each) with a prototype gate run clean and against four planted changes; the owner approved the design, adding a light/dark toggle as in Markdown Renderer. See `DOCS/.implementation-logs/2026-09-30_backlog-075-mockup-and-ordering-finding.md`.
- [x] A results-level gate verifies that each Stack executed the same scenarios with the same step text and all passed. Adapters must order results by feature-file order (for C#, pickle order): NUnit runs Reqnroll scenarios alphabetically, so execution order differs from feature order.
- [x] A fan-in report job runs after the Stack jobs and the gate, publishes from `main` only with deploy-only Pages permissions, and ships the visualisation and `/parity/` in one Pages artefact.
- [x] The build fails unless the gate is shown to fail against a planted one-word step-text change in a temporary copy of one Stack's results.
- [x] Every result, snippet and timing is read from run artefacts or step-definition sources; nothing is typed by hand.
- [x] No change to the solver, feature files, puzzle data, REST API or any Stack's behaviour; `scripts/check-pages.cjs` and the visualisation are untouched.

Pre-restoration constraint (2026-09-30, before BACKLOG-076): default-branch CI was red because the dependency audit blocked new advisories
(DEMOAPP001 axios, five high; DEMOAPP002 urllib3, three), so the `gate` job was skipped. Resolve or
except them under DR-039 before the fan-in job can be verified green.
The separate BACKLOG-076 repair supplies local restoration evidence and requires all-Stack CI before publication.

**Resolution (2026-09-30):** Slices S1 to S4 merged as PRs #83, #86, #87 and #88. The results-level gate reads each Stack's own results and compares them with the feature file's expansion (55 executions, 309 steps per Stack); the `parity` job in `ci.yml` runs the tool tests, the gate and the page builder, whose negative check runs the real gate on copies carrying a planted step-text change and a failed step in each of the three formats; `gate` waits for `parity`; and `pages-build` and `pages-deploy` publish one Pages artefact from `main` only, with deploy-only permissions, replacing `pages.yml`. `main` run `36786863220` at `ab92c23` passed all seven jobs, including deploy. The live `/parity/` returns 200 and carries that run and commit; the site root is byte-identical to before (md5 `83469e225423e8c43cd9e1abc6f4acf3`). No solver, feature, puzzle, REST API or Stack behaviour changed; the only file added under a Stack's `tests/` folder is DEMOAPP003's `reqnroll.json`, which enables a results formatter. `scripts/check-pages.cjs` and the visualisation are untouched. See `DOCS/.implementation-logs/2026-09-30_backlog-075-parity-page-build-and-publication.md`.

---

### BACKLOG-077: Browser module linking and visualiser pause contract

**Status:** Resolved 2026-09-30 on local validation and native browser acceptance checks;
supported-runtime all-Stack PR CI remains the publication check.
**Stack:** DEMOAPP001
**Priority:** Medium
**Nature of Gap:** Browser module contract defect, discovered during TRIAGE-07 verification.
**Authority:** Owner selected TRIAGE-11 ahead of TRIAGE-08 on 2026-09-30.
**Decision:** Existing DR-042 guided UI contract; restoring the intended pause API is not a
new structural choice or a change to the HTTP, solver or cross-Stack contracts.

The production app imported and called `pause`, while the player exposed only private `_pause`.
The initial Node ES-module-link regression failed (0/1 tests, 4675.122 ms) with
`The requested module './player.js' does not provide an export named 'pause'`.
The repair exports `pause()` as a delegate to the existing implementation; it stops the
interval and updates controls without moving the playhead.

Acceptance criteria:

- [x] The real app/grid/player/tutor ES-module graph links without rewriting imports or exports.
- [x] Controlled player probes verify interval cancellation, index/control preservation,
      restart at the selected speed, idempotent stopped/empty use and completion safety.
- [x] Native browser startup, puzzle loading, mode-switch pause, resumed playback and a live
      tutor hint/application pass without browser errors.
- [x] Applicable locked restore, static, component/BDD, API/OpenAPI, coverage, parity,
      dependency audit and evidence gates pass without policy or workflow changes.
- [x] Preserve historical closures and separate the newly observed redraw inconsistency
      as portfolio TRIAGE-13; do not implement that candidate here.

Local Node 24.18.0: focused regression 5/5 (3132.5342 ms). The new test file uses a tightly
scoped Node subprocess for native ES-module linking/evaluation; its VM flag does not change
suite or CI commands. Player behaviour probes use a minimal DOM and controlled interval
clock. This evidence is distinct from native browser verification and does not claim browser
controller line coverage.

Clean `npm ci`, build/lint/format, changed-player syntax, API integration and eight OpenAPI
tests (7139.4206 ms) passed. `npm run test:ci` passed 107 component tests (22320.801 ms),
55 BDD scenarios / 309 steps (5.308 s). Existing selected-module coverage passed at
80.11% lines / 91.94% branches / 80.17% functions (107 tests, 74012.2612 ms) with one
local worker to avoid the previously observed Windows contention. Scopes, floors, timing
assertions and default CI concurrency are unchanged. All seven repository parity/governance
checks, `check:web` served-asset/API checks and `check:pages` five-puzzle drift checks passed.
The governed audit passed with zero blocking findings and the existing one moderate fast-uri
finding (TRIAGE-09); the six-file CI evidence contract passed.

Native in-app browser checks used the actual Express app at `http://127.0.0.1:3111/`.
Easy Scan Grid loaded 51 replay steps. Switching to tutor changed the play control from
pause to play at Step 1 of 51; that index stayed fixed for 2200 ms against a 2000 ms
playback interval. Resuming advanced to Step 2, and manual pause again held for 2200 ms.
The live HiddenSingles hint for row 1, column 8 applied digit 1 and disabled Apply Move.
No browser errors were recorded. Ignored evidence is `.results/triage-11/browser-verification.json`
and `tutor-working.png` (completed 2026-09-30T19:25:08.440Z), with gate logs in the same directory.

The browser also exposed a separate, pre-existing redraw mismatch: returning to visualiser
calls `onStep(0)` while the paused counter/index remains 1, clearing the first move and current
event highlight until playback resumes. This is TRIAGE-13, awaiting owner selection.
Python/C# native suites and the optional mutation trial were not rerun locally for this
DEMOAPP001 repair; supported-runtime all-Stack CI remains the publication check.

### BACKLOG-078: Strengthen weak Then-step assertions in all three Stacks

**Status:** Resolved 2026-10-07 — owner selected the proposed sequence; all three native runners detect wrong digit/position/count expectations and existing gates pass. All-Stack PR CI remains the publication check. Originally recorded Open and unscheduled on 2026-09-30.
**Stack:** All (DEMOAPP001, DEMOAPP002, DEMOAPP003)
**Priority:** Medium
**Decision:** None required: existing Question/Ability signatures and Memory keys/shapes are preserved. DR-015 and the Screenplay parity contract remain in force.
**Source:** the genuine failing-run check for BACKLOG-075, recorded on [PR #83](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/83#issuecomment-5918686933).

Evidence (local mutation runs on 2026-09-30, reverted, nothing committed). In each run all three Stacks stayed green:

- Changing the expected missing value in `Complete a row with only one missing value` from 3 to 4. The steps `the system should identify the missing value as {int}` and `the value {int} should be placed in the empty cell` cannot fail on it: the first only checks that the algorithm made progress (and, in Python and C#, that the value is greater than 0), and the second uses `GridCell.containsValue`, which a digit already in the row satisfies.
- Changing `the system should place 6 in the only valid cell in row 3` to row 4 in `Identify a Hidden Single in a row`. `GridCell.inRow` was satisfied.

A step whose bound assertion fails on a clearly impossible value (10) does fail in all three Stacks, so the harness itself reports failures correctly.

Acceptance criteria:

- [x] List every Then step whose assertion cannot fail on a wrong digit, row or column, with the Stack bindings for each.
- [x] Strengthen those assertions so the stated digit and position are checked, in all three Stacks in the same change set.
- [x] A mutation check (changing one expected digit or position in the canonical feature) fails in every Stack. Record the mutations used.
- [x] Step text, scenario counts and the parity gates are unchanged (55 scenarios, 309 steps per Stack), and existing gates and coverage floors pass.
- [x] A decision record exists first if the Screenplay question contract changes — no contract signature/key change was needed.

**Delivery evidence (2026-10-07, before PR publication):**

- [Inventory](../.analysis/2026-10-07-backlog-078-then-assertion-inventory.md): 16 parameterised
  patterns / 48 bindings, Given-owned targets, original-empty evidence, negative-row identity,
  block membership and consumed counts. Questions, Abilities, fixtures and solver/API are unchanged.
- Native controls: each Stack passed 15 positive scenarios and killed 22 mutations (45 positives /
  66 killed total). The recorded 3 to 4 missing digit and row 3 to 4 fail everywhere. Controls also
  cover generic/column/block digits, column identity, negative rows, explicit-cell/X-Wing positions,
  Pair row/column/both block coordinates and three-/81-cell counts. Native results require the
  intended executed scenario and an assertion failure; all feature hashes restore. Sum of native
  command durations: TypeScript 224669 ms, Python 36637 ms, C# 149987 ms.
- Node 24.18.0: locked restore, build/lint/format, API, 8 OpenAPI checks, web/Pages scripts PASS;
  113 component tests (30969.8472 ms); 55 scenarios / 309 steps (6.306 s, command 20242 ms).
  Selected-module coverage 80.11% lines / 91.94% branches / 80.17% functions, unchanged floors
  70/85/75, 113 tests (58949.8103 ms), one local test worker; CI retains default concurrency.
- Python 3.13.1: constrained isolated install and pip check PASS; 30 component tests (0.80 s),
  full 85 tests (2.03 s); 88.98% coverage against the unchanged 85% floor.
- .NET 10.0.401: locked restore PASS; 28 component tests (539 ms) plus 55 Reqnroll scenarios
  (runner reports 1 s); coverage 545/622 lines (87.62%) and 275/320 branches (85.94%), unchanged
  80/80 floors. Canonical TRX, Cucumber Messages and Cobertura evidence retained.
- Fresh governed audits PASS: TypeScript `excepted`, 2 unique findings, 1 approved braces
  exception, 0 unexcepted; Python/NuGet zero findings. The exact braces exception ends
  2026-10-12 inclusive; fast-uri / TRIAGE-09 remains separate. No lock/policy change was made.
- Seven repository governance/parity checks, all three evidence contracts, parity tool tests,
  real-results gate and page build/negative controls PASS. CI runs the new native controls before
  normal suite output and retains their evidence in the existing Stack artefacts.
- Changing only the Pair Then candidate qualifier from `2, 7, 4` to `1, 7, 4` still passed one
  selected Python scenario (native exit 0, 2762 ms), with features restored. Candidate-observation
  APIs are outside this approved digit/position repair; the separate root TRIAGE-15 records it.
- The plan's [Outcome](../.implementation-plans/2026-10-07-backlog-078-exact-assertions.md#outcome)
  records execution and publication boundaries. Independent source/control review passed.

---

### BACKLOG-076: Restore supported-runtime dependency audits

**Status:** Resolved 2026-09-30 — TRIAGE-12; owner instructed restoration of Sudoku's `main`.
**Stack:** DEMOAPP001 / DEMOAPP002
**Priority:** High (blocking supported-runtime audit)
**Decision:** DR-039 remains unchanged; this compatible lock repair introduces no structural rule.

BACKLOG-075 is the separate accepted parity evidence-page item from
[PR #78](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/78), still Open
with its results spike complete. This restoration uses BACKLOG-076 and preserves that scope.

Source: [merge CI 36735157683](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/36735157683)
at `e85e62c756c8ebcf3f0ec5fe244edfc34ca276c6` failed on urllib3 2.7.0 findings
`CVE-2026-97687` and `CVE-2026-97689`, rejected the Python audit evidence and skipped the
aggregate gate. The original audit reports patched version 2.8.0 for both findings.
This record is separate from the unimplemented browser, schema and documentation candidates.

Subsequent [main CI 36743999304](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/36743999304)
at `76c87a0984b200f871e1951796ec9cf82b17fdc8` also failed DEMOAPP001's audit on five high
Axios advisories. Restoring `main` therefore requires both supported-runtime audit repairs.

Acceptance criteria:

- [x] Constrained Python 3.13 restoration resolves urllib3 2.8.0 with Requests unchanged and passes `pip check`.
- [x] Native and governed Python audits pass without exceptions or policy/workflow changes.
- [x] Python component coverage, the full pytest suite and the five-file CI evidence contract pass.
- [x] Compatible Node 24 locked restoration, static/API/OpenAPI/component/BDD/coverage gates,
      governed audit and six-file evidence contract pass without changing manifest ranges or floors.
- [x] Existing repository parity/governance checks pass; retain all-Stack CI as the required publication check.
- [x] Record exact commands, counts and runtime evidence; retain historical reports and product closures.

The [upstream proxy-TLS advisory](https://github.com/urllib3/urllib3/security/advisories/GHSA-8988-9cw3-xx77)
and [chunk-size buffering advisory](https://github.com/urllib3/urllib3/security/advisories/GHSA-vxq7-64xx-v4gw)
both specify 2.8.0. A fresh before-audit also reported `CVE-2026-97688`, fixed by that same
version. Requests 2.34.2's installed metadata permits `urllib3>=1.26,<3`; its pin and all
other constraints are unchanged.

Local evidence: Python 3.13.1; constrained editable installation and `python -m pip check`
passed with urllib3 2.8.0. `python -m coverage run -m pytest tests/component` passed 30 tests
(1.28 s); `python -m coverage report` passed at 88.98% against the unchanged 85% floor, and
`python -m coverage xml` emitted native evidence. The full `python -m pytest --junitxml=...`
suite passed 85 tests (2.14 s; one existing Gherkin deprecation warning). The governed
`.batch/invoke-dependency-audit.ps1 -Stack demoapp002` reported zero findings, zero blocking
findings and no exceptions; `.batch/check-ci-evidence.ps1 -Stack demoapp002` passed 5/5 files.
The combined Python gates took 31.7343106 s. All seven `.batch/run-parity-checks.ps1` gates
passed, including the existing policy and evidence negative controls.

The isolated venv's bootstrap pip was updated from 24.3.1 to 26.2.1 to match the original CI
audit inventory; this is local environment setup, not a tracked dependency or global change.
Captured ignored evidence is under `.results/triage-12/` and `.results/demoapp002/`.
Serenity 3.44.1 pins Axios 1.18.1 exactly. A targeted lock-only refresh of assertions, core,
cucumber and serenity-bdd to 3.48.0 within their existing `^3.43.2` ranges supplies the upstream
parents' Axios 1.20.0 pin. [Axios 1.20.0](https://github.com/axios/axios/releases/tag/v1.20.0)
contains the fixes; no override or manifest change is needed. Changed transitive entries belong
to that Serenity dependency graph. Its Node 24 engine floor is now 24.15.0; local 24.18.0
satisfies it and the CI/Pages setup-node steps select the latest Node 24.

Node 24.18.0 locked restore and dependency-tree checks, build/lint/format, API integration and
eight OpenAPI tests (7976.3095 ms) passed. `npm run test:ci` passed 102 component tests
(16530.224 ms) and 55 BDD scenarios / 309 steps (5.803 s). Existing selected-module coverage
passed at 80.11% / 91.94% / 80.17% (lines/branches/functions; 102 tests, 55107.3232 ms) with
one local worker to avoid the previously observed Windows contention; assertions, floors and
default CI concurrency are unchanged. The governed audit passed with zero blocking findings
and the existing one moderate fast-uri finding (TRIAGE-09). The six-file evidence contract
passed; the combined coverage/suite/audit/evidence gates took 97.2353661 s. Ignored native
evidence is under `.results/demoapp001/` and `.results/triage-12/`.

C# native suites, browser interaction and the optional mutation trial were not rerun locally
for these dependency changes. Supported-runtime all-Stack CI remains the publication check.
No audit exception, policy change, workflow change or coverage relaxation was introduced.

Publication update (2026-09-30): [PR #80](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/pull/80)
merged as `1170508ad9cebfd16fb60e85dd1d9166f3cf1d6e`. Exact-merge
[CI 36755560842](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/36755560842)
passed all three Stack jobs and the aggregate gate;
[Pages 36755560902](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/36755560902)
passed at the same merge SHA. The earlier local-only validation record above is retained.

### BACKLOG-074: Tutor request ownership and stale hint rejection

**Status:** Resolved 2026-09-30 — TRIAGE-07 / September review R4.
**Stack:** DEMOAPP001
**Priority:** Medium
**Decision:** DR-046, implementing DR-042's guided move flow without changing the HTTP contract.

Acceptance criteria:

- [x] Grid revision and request sequence guard hint receipt and application.
- [x] Invalidated requests are aborted; stale responses, errors and cleanup are discarded.
- [x] Application checks the target against the submitted snapshot and preserves original clues.
- [x] Controller tests cover clear, edit, load, reset, response ordering and auto-play cancellation.
- [x] Applicable static, component, API/OpenAPI, BDD, coverage, parity and audit gates pass; distinguish VM controller evidence from native browser verification.

Evidence: 36 labelled `tutor-controller.contract.test.ts` cases execute the production controller
and focused app functions with a deferred transport/JSON seam, injected renderer, minimal DOM and
fake clock (focused run: 36/36, 3088.2539 ms). They prove cancellation across clear/edit/load/reset,
response ordering, JSON decoding, target/snapshot/previous-value boundaries, auto-play pause/restart,
both timer windows and shared loading ownership. Deliberately completing aborted transports
proves guards beyond abort alone. Independent source/contract review found no remaining R4 defect.

`npm run test:ci` passed 102 component tests (20992.1686 ms) and 55 BDD scenarios / 309 steps
(7.158 s); eight OpenAPI tests passed (9449.2927 ms). Existing selected-module coverage passed
102/102 tests (88618.3138 ms) at 80.11% lines / 91.94% branches / 80.17% functions using one
local worker; modules, floors, timing assertions and CI concurrency are unchanged. Build, lint,
format, explicit changed-JavaScript syntax/format, parity, API, audit and six-file evidence checks
pass. `check:pages` and `check:web` served-asset/API checks pass. Python/C# native suites were
not rerun locally; rely on supported-runtime PR CI. The optional mutation trial was not rerun.

Native in-app browser startup at 2026-09-30T14:07:28.381Z failed with
`SyntaxError: The requested module './player.js' does not provide an export named 'pause'`.
This pre-existing independent module-link defect is portfolio TRIAGE-11, not an R4 fix; the
changed controller's native browser flow is unverified. VM tests do not conceal that limitation.
The immutable September review remains intact, with this backlog record supplying R4 status.

### BACKLOG-073: Exact target generation and bounded exhaustion

**Status:** Resolved 2026-09-30 — TRIAGE-06 / September review R2.
**Stack:** DEMOAPP001
**Priority:** Medium
**Decision:** DR-045, implementing DR-043's exact-tier and bounded 422 contract.

Acceptance criteria:

- [x] One five-attempt policy returns success only for solvable candidates at the exact requested tier.
- [x] Exhaustion throws a typed domain failure mapped to the documented HTTP 422 response.
- [x] Real service/API tests cover exact tiers, retry success and exhaustion, including Expert with 81 clues.
- [x] Preserve valid untargeted generation, seed repeatability and uniqueness.
- [x] Static, component, API/OpenAPI, BDD, coverage, parity and supported-runtime audit gates pass.

Evidence: nine new `generator-exhaustion.contract.test.ts` cases include real seeded exact
Easy/Medium/Hard/Expert targets, an impossible Expert/81-clue target, fourth-attempt success,
and an untargeted retry after an unsolved candidate; separate labelled seams verify that an
unsolved Expert marker never qualifies and invalid budgets fail before construction. API
integration proves all exact tiers, uniqueness and native exhaustion. Eight OpenAPI tests pass
(9339.7592 ms), including native exhaustion plus labelled construction/untargeted/unexpected
error mappings. `npm run test:ci` passed 66 component tests and 55 scenarios / 309 steps
(5.800 s). Coverage passed 66/66 (77264.7056 ms) with the existing selected modules, thresholds
and assertions unchanged; `--test-concurrency=1` precedes file arguments to avoid the Windows
timing contention observed during TRIAGE-05. Seven parity/governance checks and the six-file
CI evidence contract pass. The required audit reports one moderate fast-uri finding and no
blocking findings; no dependency change is folded into this item. The immutable September
review is retained, and this record supplies R2's remediation status. Newly noticed existing
generator request/400-error schema drift is recorded separately as portfolio TRIAGE-10.

### BACKLOG-072: Shared technique vocabulary and exact difficulty grading

**Status:** Resolved 2026-09-30 — TRIAGE-05 / September review R3.
**Stack:** DEMOAPP001
**Priority:** Medium
**Decision:** DR-044, preserving DR-043's accepted tier contract.

Acceptance criteria:

- [x] Tutor and grader consume one production technique vocabulary and type, with exhaustive mapping.
- [x] Exact grade assertions cover Unit Completion, Hidden Singles, Naked Singles, Naked Pairs and XWing.
- [x] A real unique X-Wing fixture reaches completion and is classified Expert, alongside labelled seam tests.
- [x] Preserve the tutor `XWing` token and generator `X-Wing` display label; document DR-043 tier corrections.
- [x] All applicable DEMOAPP001 supported-runtime gates and repository parity checks pass.

Evidence: `difficulty-grader.contract.test.ts` contains seven labelled classification seams;
`difficulty-grader.real-grid.test.ts` independently proves one solution, 57 real tutor placements,
XWing at zero-based step 34 and exact Expert grading. `npm run test:ci` passed 57 component tests
(15153.887 ms) and 55 BDD scenarios / 309 steps (5.208 s). Selected-module coverage passed all
unchanged floors (57/57, 61310.1507 ms) with `--test-concurrency=1` before the file arguments;
default concurrent coverage had exceeded the existing clue-removal 150 ms timing assertion on
this Windows host. No assertion or budget was weakened. Build, lint, formatting, API/OpenAPI,
parity and audit passed. Locked `brace-expansion` 5.0.9 -> 5.0.12 to clear the blocking audit;
the remaining moderate fast-uri advisory is a separate worklist candidate. The historical review
bundle is immutable; this backlog record supplies R3's remediation status.

### BACKLOG-051: Strengthen orchestration ordering and no-execution assertions

**Priority:** Low
**Status:** Resolved
**Stack(s):** All three parity Stacks
**Nature of Gap:** Some orchestration `Then` steps infer algorithm ordering or no execution from
the overall result rather than asserting the audit event sequence directly.
**Resolution:** SUD-20 (2026-07-17). A dedicated tracked-order solve path in all three Stacks
always captures the audit event sequence for the two affected scenarios only, leaving every other
scenario's solve path (and the opt-in audit-trail feature) untouched. The `Then`-steps now assert
real invariants derived from the actual event data instead of the overall `SOLVED` status. No DR
required — canonical Gherkin unchanged.

Acceptance criteria:

- [x] Assert zero audit iterations/events for the already-solved scenario in all three Stacks.
- [x] Assert the algorithm event order for a fixture that requires all three techniques (option:
      soften Gherkin text — not needed; real assertions on the actual event data sufficed).
- [x] Change `features-shared/` first, propagate the canonical feature, and keep feature/step-text
      parity green (no Gherkin change was needed; parity confirmed green regardless).
- [x] Run all three 46-scenario suites and all parity gates.
- [x] Add a decision record only if the canonical behavioural contract changes structurally (it did
      not — no DR added).

---

### RA-001: Define `@util` surface type formally in RA Sections 6 and 7

**Priority:** High
**Status:** Resolved
**Severity:** Critical (review Risk 1)
**Nature of Gap:** RA specification gap — `@util` tag appears in Sections 5.3 and Appendix B but has no corresponding surface contract (Section 6), Ability definition (Section 7), or orchestration lifecycle (Section 9.1)
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 1
**Resolution:** DR-021 — RA v1.4 adds Section 6.0 (`@util` surface contract), Section 7.0 (canonical Ability), Section 8.1 minimum Memory keys, Section 9.1 lifecycle, Appendix B checklist block. RA version bumped to v1.4 (2026-05-18).

Acceptance criteria:

- [x] Section 6.0 added: `@util` surface contract specifying in-process subject application requirements
- [x] Section 7.0 added: canonical `@util` Ability definition (`UseSubjectDirectly` or equivalent)
- [x] Section 9.1 updated: `@util` orchestration lifecycle added alongside API/UI/CLI lifecycles
- [x] Minimum Memory key set for `@util` surface documented in Section 8.1
- [x] Appendix B compliance checklist references the new `@util` surface contract section
- [x] RA version bumped and a DR entry created recording the addition

---

### RA-002: Add CI/CD pipeline requirements section to RA

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 2)
**Nature of Gap:** RA mandates orchestration and metrics but provides no CI/CD pipeline specification — pipeline gate requirements, required exit code handling, and artifact retention in CI context are undefined
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 2
**Resolution:** DR-022 — RA v1.5 adds Section 9.4 (CI/CD Pipeline Requirements): required gate sequence, `OverallExitCode` contract, feature parity as mandatory gate, CI artifact retention, multi-Stack pipeline isolation. RA version bumped to v1.5 (2026-05-18).

Acceptance criteria:

- [x] Section 9.4 added: CI/CD pipeline requirements covering required gates (build, test, parity report)
- [x] Exit code contract specified: `OverallExitCode` must block merge on non-zero
- [x] Feature parity report designated as required CI gate (not optional)
- [x] Artifact retention in CI context addressed (same policy as Section 9.3 or explicitly different)
- [x] RA version bumped and a DR entry created

---

### RA-003: Define automated Memory key parity enforcement mechanism

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 3)
**Nature of Gap:** Section 8.1 mandates identical Memory key constants across Stacks but provides no automated verification mechanism — manual checklist only, insufficient for multi-Stack projects
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 3
**Resolution:** DR-023 — RA v1.6 adds "Automated enforcement" subsection to Section 8.1 (multi-Stack MUST provide checker, single-Stack MAY use checklist). Appendix A updated with `memory-key-check.template.md`. Template created at `DOCS/.templates/memory-key-check.template.md`. Script created at `.batch/check-memory-key-parity.ps1`. DEMOAPP001 and DEMOAPP002 pass: all 6 constants verified OK per Stack. The GitHub Actions CI workflow runs the memory-key parity gate.

Acceptance criteria:

- [x] Section 8.1 updated: normative requirement for an automated memory-key checker in multi-Stack projects
- [x] Appendix A updated: `memory-key-check.template.md` added (script or CI step template)
- [x] Project implementation: `.batch/check-memory-key-parity.ps1` created for DEMOAPP001 baseline
- [x] CI gate: memory key checker integrated into CI pipeline
- [x] RA version bumped and a DR entry created

---

### RA-004: Define Canonical Feature Store change governance

**Priority:** High
**Status:** Resolved
**Severity:** High (review Risk 4)
**Nature of Gap:** Section 5 defines feature propagation process but no change approval process — no specification for who can modify canonical features, what review is required, or how breaking changes are coordinated across Stacks
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 4
**Resolution:** DR-024 — RA v1.7 adds Section 5.5 (Feature Change Governance): breaking vs non-breaking classification table, breaking change gate sequence (MUST), `@pending` one-sprint resolution deadline with two-sprint escalation to defect, canonical file protection rules. RA version bumped to v1.7 (2026-05-18).

Acceptance criteria:

- [x] Section 5.5 added: Feature Change Governance covering non-breaking vs breaking change classification
- [x] Breaking change definition provided: addition, removal, or modification to step text or scenario structure
- [x] Review gate requirement for breaking changes stated normatively (MUST)
- [x] `@pending` resolution deadline policy added (maximum sprint horizon before gap becomes a defect)
- [x] RA version bumped and a DR entry created

---

### RA-005: Correct `features_shared/` underscore naming throughout RA

**Priority:** Medium
**Status:** Resolved
**Severity:** Medium (review Risk 5)
**Nature of Gap:** RA uses `features_shared/` (underscore) throughout Sections 4, 5, 5.2, 5.3, and 11 — any project adopting kebab-case naming diverges from RA examples immediately without a reconciliation path; agents reading the RA produce non-compliant paths
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 5
**Resolution:** RA v1.8 — all 8 occurrences of `features_shared/` replaced with `features-shared/`. Section 4 intro note added clarifying blueprint names are illustrative defaults. Section 4.3 note added clarifying Stack directory name vs canonical Stack name distinction. No DR required (editorial correction, no normative rule change).

Acceptance criteria:

- [x] All `features_shared/` occurrences in the RA replaced with `features-shared/` (hyphen) as the illustrative default
- [x] Section 4 note added: directory names in the blueprint are illustrative; projects document their chosen names in `naming-conventions.md`
- [x] Section 4.3 updated to reflect the same note for Stack directory names
- [x] RA version bumped (no DR required — editorial correction, not a normative rule change)

---

### RA-006: Resolve uppercase document name conflict in RA Sections 10.1 and 10.2

**Priority:** Medium
**Status:** Resolved
**Severity:** Medium (review Risk 7)
**Nature of Gap:** Section 10.2 mandates `ARCHITECTURE.md`, `SCREENPLAY_GUIDE.md`, `QA_STRATEGY.md` as uppercase fixed names, but Section 10.9 mandates a naming conventions document that allows kebab-case — following both requirements simultaneously is impossible; this project has `architecture.md`, `qa-strategy.md`, `screenplay-guide.md` per DR-020
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 7
**Resolution:** DR-025 — RA v1.9 introduces FIXED vs convention-governed name-type distinction. Section 10.1 updated (README.md, CHANGELOG.md FIXED; others convention-governed). Section 10.2 updated: uppercase fixed names removed, replaced with convention-governed roles with kebab-case illustrative defaults and migration note. Appendix A name-type column added. This project's DR-020 kebab-case docs now explicitly in compliance.

Acceptance criteria:

- [x] Section 10.1 table updated: `README.md` and `CHANGELOG.md` explicitly marked `FIXED` (ecosystem standard); other documents marked as convention-governed
- [x] Section 10.2 updated: Stack-level document names changed from fixed uppercase to "project convention per Section 10.9"
- [x] Appendix A `Governs` column updated to show convention-governed output paths with note
- [x] RA version bumped and a DR entry created (this is a normative rule change — ARCHITECTURE.md was previously REQUIRED)

---

### RA-007: Add test data management specification to RA

**Priority:** Medium
**Status:** Resolved
**Severity:** Medium (review Risk 8)
**Nature of Gap:** The RA defines behavioral contracts (Gherkin feature files) and orchestration contracts (lifecycle, metrics) but provides no guidance on test data. For projects where test data is the primary input to the system under test (e.g. `puzzles.json`), there is no specification for: where test data lives (Stack, canonical store, or shared package), how test data is versioned alongside feature files, data isolation between scenarios, or data-driven testing patterns beyond parameterised step text.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 8
**Resolution:** DR-026 — RA v1.10 adds Section 5.6 (Test Data Management): location rules table (Stack-local vs shared), inline literal prohibition (MUST NOT), scenario isolation MUST (deep copy or in-memory), shared data versioning treated as breaking change, Scenario Outline guidance for data-driven scenarios. DEMOAPP001 `puzzles.json` confirmed compliant — Stack-local, read-only during test execution.

Acceptance criteria:

- [x] Section 5.6 added: Test Data Management covering data location rules (Stack-local vs shared), versioning, scenario isolation (MUST NOT modify shared data — operate on a copy or in-memory representation), and data-driven Scenario Outline guidance
- [x] Shared test data path documented: MUST live under `packages/` or a dedicated `data/` directory and be referenced in `DOCS/architecture/subject-app-contract.md`
- [x] Inline literal prohibition restated normatively: test data MUST NOT be embedded in canonical feature files (links to Section 5.4 parameterised steps)
- [x] RA version bumped and a DR entry created

---

### RA-008: Replace CHANGELOG.md retention policy rule with decision-register.md

**Priority:** Low
**Status:** Resolved
**Severity:** Low (review Risk 9)
**Nature of Gap:** Section 9.3 requires that a change to the test result retention policy be recorded in `CHANGELOG.md`. CHANGELOG.md is intended for release notes and notable changes visible to project consumers. A retention window change is an operational configuration concern for the build system operator, not a release note. In practice this rule will either be silently ignored (policy changes without a changelog entry) or the changelog accumulates operational noise that obscures actual feature changes.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 9
**Resolution:** RA v1.11 — Section 9.3 bullet updated: `CHANGELOG.md` replaced with `decision-register.md`. Retention policy changes now MUST be recorded as a DR entry with the new window, reason, and effective date. No DR required (editorial correction to a low-stakes rule).

Acceptance criteria:

- [x] Section 9.3 updated: `CHANGELOG.md` reference replaced with `decision-register.md` — any change to the retention policy MUST be recorded as a DR entry documenting the new window, the reason, and the effective date
- [x] RA version bumped (no DR required — editorial correction to a low-stakes rule)

---

### RA-009: Add verification method column to parity criteria (Section 8.4)

**Priority:** Low
**Status:** Resolved
**Severity:** Low (review Risk 10)
**Nature of Gap:** Section 8.4 defines five criteria for declaring a Stack in parity but specifies no verification method for any of them. Appendix B provides a manual checklist. Neither specifies whether verification is manual, scripted, or a CI gate. The current project has automated coverage for criterion 1 (feature parity report) and criterion 2 (memory key parity check), but criteria 3–5 remain manual-only. A checklist filled in manually is subject to human error and is insufficient as a parity gate at scale.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 10
**Resolution:** DR-027 — RA v1.12 replaces Section 8.4 numbered list with a verification method table (criterion, description, method, automated/manual). Normative statement added: criteria 1, 2, and 3 MUST be verified by automated tools. Criterion 3 (step-text diff) has no dedicated script yet — tracked as BACKLOG-022. DR-027 required (new MUST language).

Acceptance criteria:

- [x] Section 8.4 updated: verification method column added to the parity criteria table (automated parity report, automated memory-key checker, automated step-text diff, manual against parity-contract.md, manual backlog scan)
- [x] Normative statement added: criteria 1, 2, and 3 MUST be verified by an automated tool before a Stack is declared in parity; manual checklist alone is insufficient
- [x] RA version bumped and DR-027 created (new MUST language requires a DR entry)

---

### RA-010: Specify shared `packages/` directory rules in RA (Section 4.4)

**Priority:** Low
**Status:** Resolved
**Severity:** Low (review Risk 11)
**Nature of Gap:** Section 4 shows `packages/` as "Shared code packages (OPTIONAL)" with no further specification. In a multi-Stack project, shared utilities (e.g. a common PuzzleLoader or shared assertion helper) will naturally emerge. There is no guidance on what is appropriate to place there, how shared packages relate to the parity contract, whether they count as part of the Stack or the project, or how package interface changes are versioned and propagated across Stacks.
**Review evidence:** `DOCS/.review/2026-05-18_reference-architecture-structural-review.md` Risk 11
**Resolution:** DR-028 — RA v1.13 adds Section 4.4 (Shared Packages Directory): independent versioning MUST, MUST NOT include Stack-specific code or test runner imports, public interface changes treated as breaking changes (Section 5.5 gate), DR entry MUST, parity verification run MUST. Shared package failures are project-level breaking changes — must be resolved before Stack is declared in parity. DEMOAPP001 has no packages/ usage; compliant. DR-028 recorded.

Acceptance criteria:

- [x] Section 4.4 added: Shared Packages — each package independently versioned; MUST NOT contain Stack-specific code or test runner imports; subject application source MUST NOT live in `packages/` unless a pure utility library with no Stack-specific dependencies; any change to a shared package's public interface MUST produce a DR entry and a parity verification run against all dependent Stacks
- [x] RA version bumped and a DR entry created (this is a normative rule change introducing MUST requirements for a previously unconstrained area)

---

### BACKLOG-004: Setup GitHub Actions CI/CD

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** CI automation

Acceptance criteria:

- [x] `.github/workflows/ci.yml` created
- [x] Build step runs `npm ci` and `npm run build`
- [x] Lint step runs `npm run lint`
- [x] Test step runs `npm test`
- [x] PR status checks visible in GitHub
- [x] `README.md` updated with CI badge

Resolution:

- GitHub Actions workflow `CI` now runs on `pull_request`, `push`, and manual dispatch. The DEMOAPP001 job installs with `npm ci`, runs build/lint/test, executes parity gates, and uploads validation artifacts. PR status checks are configured by the `pull_request` trigger and will be visible in GitHub after the branch is pushed.

### BACKLOG-017: Unify Feature Design Overlap

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All planned app surfaces
**Nature of Gap:** Design consistency

Acceptance criteria:

- [x] Shared `CellChange` interface specified as single definition
- [x] `SolveStep extends CellChange` inheritance documented
- [x] Single Express server approach explicitly documented in REST API design document
- [x] Design documents updated with cross-references
- [x] TODO task lists updated to reflect shared foundations
- [x] No contradictions between the three designs

### BACKLOG-007: Decouple Console Output

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** CLI/API extensibility

Acceptance criteria:

- [x] `app_src/output/IOutput.ts` interface created with `write(message: string): void`
- [x] `app_src/output/ConsoleOutput.ts` implementation created
- [x] `SudokuCLI` accepts an `IOutput` constructor parameter with `ConsoleOutput` default
- [x] `SudokuSolver.named()` removed or used in `index.ts`
- [x] Default CLI behavior unchanged
- [x] `npm test` remains green

### BACKLOG-008: Implement Audit Trail Feature

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/audit-trail-feature.md`

Acceptance criteria:

- [x] `app_src/audit/AuditTypes.ts` with shared audit interfaces
- [x] `app_src/audit/AuditLogger.ts` with iteration tracking and change recording
- [x] `app_src/audit/AuditFormatter.ts` with JSON export and console summary
- [x] Optional `SudokuSolver.setAuditLogger()` integration
- [x] Algorithm attribution for each cell change recorded
- [x] Less than 5% solver performance overhead (logging is conditional on enabled flag)
- [x] Gherkin coverage added for audit scenarios (3 new scenarios, 46/46 pass)

### BACKLOG-009: Implement REST API Wrapper

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001 API surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/rest-api-wrapper.md`

Acceptance criteria:

- [x] Express.js server
- [x] Technique endpoints for unit-completion, hidden-singles, and naked-singles
- [x] Solve endpoint with step tracking using AuditLogger
- [x] Puzzle endpoints: list and get by name
- [x] Validate endpoint
- [x] Request validation and error handling middleware
- [x] API tests for all endpoints

Resolution:

- DEMOAPP001 now exposes an Express REST API under `app_src/server/`, started with `npm run start:api`. The API includes all technique endpoints, `POST /api/solve` with `AuditLogger` events/statistics, puzzle list/get endpoints, `POST /api/validate`, CORS headers, structured validation/error middleware, and `npm run test:api` endpoint coverage.

### BACKLOG-018: Implement Web UI Solver Visualisation

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001 future UI surface
**Nature of Gap:** Feature implementation

Design reference: `DOCS/.design/web-ui-solver-visualisation.md`

Acceptance criteria:

- [x] `SolveStepTracker` adapter over `AuditLogger`
- [x] HTML grid display with algorithm color coding
- [x] Step-by-step playback controls
- [x] Event log panel with current step highlighting
- [x] Statistics panel
- [x] Served from the REST API Express server

Resolution:

- `SolveStepTracker` wraps `SudokuOrchestrator` + `AuditLogger`, flattening `AuditEvent[]` into a `SolveStep[]` with per-cell `stepNumber`, `iteration`, `algorithm`, and `algorithmParam`. New `GET /api/visualise/:name` endpoint returns `VisualiseResult` (initialGrid, finalGrid, steps, statistics). Static files served from `app_src/server/public/` via `express.static`. Vanilla ES-module frontend: `grid.js` renders the 9×9 grid with algorithm colour-coding and a pulsing highlight on the current cell; `player.js` manages step-index state, play/pause interval, and speed control; `app.js` orchestrates puzzle selection, API calls, the scrollable click-to-jump event log, and live statistics percentage bars. `npm run start:web` starts the combined server. 46/46 Screenplay scenarios remain green.

### BACKLOG-020: Python Screenplay-style Step Definitions

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP002
**Nature of Gap:** Future Stack parity

Acceptance criteria:

- [x] `demo-apps/demoapp002-python-pytest/` directory created
- [x] Python solver implementation follows the solver specification
- [x] `UseSudokuSolver` and `LoadPuzzles` abilities implemented
- [x] Tasks and Questions implemented in Python-appropriate style
- [x] All canonical Gherkin scenarios pass
- [x] Python project configuration present

Resolution:

- DEMOAPP002 now contains a Python solver, orchestrator, puzzle loader, audit support, pytest-bdd project configuration, a Stack-local feature copy tagged `@stack-demoapp002`, and Screenplay-style abilities, tasks, questions, actor memory, and step definitions. Local validation passes 46 canonical pytest-bdd scenarios. Memory key parity, feature parity, and step-text parity now include DEMOAPP002.

### BACKLOG-021: C# Screenplay-style Step Definitions

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP003
**Nature of Gap:** Future Stack parity

Acceptance criteria:

- [x] `demo-apps/demoapp003-csharp-specflow/` directory created
- [x] C# solver implementation follows the solver specification
- [x] Screenplay-style `IAbility`, `ITask`, and `IQuestion<T>` interfaces defined
- [x] `UseSudokuSolver` and `LoadPuzzles` abilities implemented
- [x] All canonical Gherkin scenarios pass
- [x] `dotnet test` runs the C# BDD Stack (originally SpecFlow; current runtime Reqnroll)

Resolution:

- DEMOAPP003 originally delivered the canonical `@util` contract with .NET 8, SpecFlow and NUnit,
  as recorded by DR-032. It has since migrated to .NET 10, Reqnroll 3.3.4 and NUnit 4 while
  retaining the stable `DEMOAPP003_CSHARP_SPECFLOW` identifier/path (DR-036). The current Stack has
  48 passing Reqnroll tests plus 24 focused component tests; solver behaviour and parity are
  unchanged by the framework/runtime migration.

### BACKLOG-022: Implement step-text parity checker (Section 8.4 criterion 3)

**Priority:** High
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Parity automation — Section 8.4 criterion 3 (step Gherkin text matches canonical exactly) is designated MUST be automated per DR-027, but no script exists. The feature parity report checks scenario presence; it does not diff individual step text within a scenario.

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 3

Acceptance criteria:

- [x] Script created (e.g. `.batch/check-step-text-parity.ps1`) that diffs step text in Stack-local feature files against canonical feature files
- [x] Any step text divergence exits non-zero and reports the differing lines
- [x] Script integrated as a CI gate per Section 9.4
- [x] No DR required unless the implementation reveals a structural gap

Resolution:

- `.batch/check-step-text-parity.ps1` now verifies Stack-local step text against canonical feature files and reports differing line numbers. `.github/workflows/ci.yml` includes an initial step-text parity gate; BACKLOG-004 expands that workflow into the full build/lint/test CI pipeline.

---

### MIG-13: Rename Stack filesystem directories to kebab-case

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001 and future Stacks
**Nature of Gap:** Directory naming alignment
**Decision Record:** DR-016
**Scheduled:** Sprint 3 (before Stack 2 onboarding)

Analysis reference: `DOCS/.analysis/analysis-directory-naming-kebab-case-2026-05-16.md`

Acceptance criteria:

- [x] `DEMOAPPS/` renamed to `demo-apps/` using `git mv`
- [x] `DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/` renamed to `demo-apps/demoapp001-typescript-cypress/` using `git mv`
- [x] `features_shared/` renamed to `features-shared/`
- [x] TypeScript `__dirname`-relative paths confirmed rename-safe; `npm run build` exit 0 (Phase 4)
- [x] `tooling/cucumber.js`, `tsconfig.json`, `package.json` use relative paths — no edits needed; `npm test` 43/43 (Phase 4)
- [x] `.batch/run-demoapp001.ps1` updated and smoke-tested; BuildExitCode=0 TestExitCode=0 (Phase 4)
- [x] All markdown documentation updated; 0 stale-path links in focus files (Phase 4)
- [x] `naming-conventions.md`, `CLAUDE.md`, `CHANGELOG.md`, `decision-register.md` updated (Phase 3)
- [x] DR-016 referenced in commit message (Phase 2 commit)

**Resolution:** All acceptance criteria completed across Phases 2-4 (directory and `features-shared/`
renames via `git mv`, build/test green, documentation updated). The Migration table and the Summary
counts already recorded this as Resolved; the stale `Status: Open` in this detail block was
corrected on 2026-06-19. No count change — MIG-13 was never part of the Open=3 set.

### BACKLOG-023: Refactor UseSudokuSolver Ability to remove fixture and validation logic

**Priority:** High
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Ability layer violation (RA §3.2)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 2

The `UseSudokuSolver` Ability (399 lines, 17 private fields, 40+ methods) contains grid manipulation
helpers, a duplicate `isValidPlacement` constraint checker, and compound operations that belong in
Tasks or a dedicated fixtures module. RA §3.2 requires the Ability to expose a minimal, stable
interface. This must be resolved before DEMOAPP002 onboarding, otherwise the Python Stack will
inherit the same overloaded pattern.

Acceptance criteria:

- [x] `tests/screenplay/fixtures/GridFixtures.ts` created containing all `setupXxx()` helper functions as pure functions accepting a `SudokuSolver` argument
- [x] `UseSudokuSolver` retains only: `initialise()`, `getSolver()`, `applyUnitCompletion()`, `applyHiddenSingles()`, `applyNakedSingles()`, `solvePuzzle()`, and read-only accessors
- [x] `isValidPlacement()` exposed on `SudokuSolver` in `app_src/`; Ability delegates to it rather than duplicating the logic
- [x] `isValidSolution()` moved to a test utility module or delegates to subject application
- [x] `solveFirstAndCheckIsolation()` compound operation moved to the relevant Task or Question
- [x] All existing Tasks updated to call `GridFixtures` functions directly rather than Ability setup methods
- [x] `npm test` remains green at 43 scenarios / 241 steps
- [x] `screenplay-parity-contract.md` updated to reflect the slimmed Ability interface

---

### BACKLOG-024: Make "the missing digit is {int}" step genuinely parameterised

**Priority:** Low
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Step definition shape (RA §8.2)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 11

The step `Given('the missing digit is {int}', ...)` in `unitCompletion.steps.ts` accepts a digit
parameter from the Gherkin but discards it. The missing digit is hardcoded in
`setupAlmostCompleteColumn()`. This violates the implicit contract of a parameterised step and
will propagate to future Stacks as a silent no-op. Must be resolved before DEMOAPP002 onboarding.

Acceptance criteria:

- [x] `setupAlmostCompleteColumn(col, missingDigit)` updated to accept the missing digit and build the column accordingly rather than hardcoding `[1,2,3,4,5,6,8,9]`
- [x] `unitCompletion.steps.ts` passes the `digit` parameter through to the grid setup method
- [x] Canonical feature file updated if the step text changes (per feature update procedure in `CLAUDE.md`)
- [x] Stack-local feature copy updated to match
- [x] `npm test` remains green
- [x] No DR required unless the step text change is a breaking canonical feature change

Resolution:

- The missing digit step now applies the supplied digit to the pending column or block unit-completion fixture. Feature text was unchanged, so canonical and Stack-local feature files remain in parity.

---

### BACKLOG-025: Fix feature parity report summary terminology to match RA CI gate spec

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Parity tooling compliance (RA §9.4)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 4

RA §9.4 states the CI pipeline MUST fail if `Overall result: DRIFT` or
`Overall result: MISSING` appears in the report output. The script
`.batch/generate-feature-parity-report.ps1` writes `Overall result: PASS` or
`Overall result: FAIL` at the summary level. Text-based CI gates written
against the RA-specified strings would never trigger. Exit-code-based gates
work correctly, but the terminology mismatch is a latent defect that will
cause confusion when CI is authored (BACKLOG-004).

Acceptance criteria:

- [x] `generate-feature-parity-report.ps1` updated: summary line writes `PASS`, `DRIFT`, or `MISSING` (not `FAIL`)
- [x] The `Write-Host "Overall result: ..."` console line updated to match
- [x] Script exit code behaviour unchanged (non-zero on any non-PASS result)
- [x] No DR required (editorial correction to a tooling script)

Resolution:

- `.batch/generate-feature-parity-report.ps1` now reports aggregate `PASS`, `DRIFT`, or `MISSING` while preserving non-zero exit behavior for any non-PASS result.

---

### BACKLOG-026: Normalize planning backlog filename to comply with DR-020

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Document naming violation (DR-020)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 5

DR-020 mandates kebab-case for all authored documents (exceptions: `README.md`,
`CHANGELOG.md`, `CLAUDE.md`). The planning backlog file was exposed on disk with
uppercase filename casing while references in CLAUDE.md, the RA, and the file's
own header use `DOCS/.planning/backlog.md` (lowercase). On Linux CI runners
(case-sensitive), mismatched path casing can fail to resolve.

**Resolution:** The file casing was normalized to `DOCS/.planning/backlog.md`
using a temporary intermediate `git mv` because Windows is case-insensitive.
Editable non-review uppercase references were updated; review outputs under
`DOCS/.review/` remain read-only per RA §10.7 and `DOCS/.review/README.md`.

Acceptance criteria:

- [x] Planning backlog filename normalized to `DOCS/.planning/backlog.md` via `git mv`
- [x] Editable non-review uppercase references updated via search
- [x] `npm test` remains green
- [x] No DR required (corrects a naming violation, not a normative rule change)

---

### BACKLOG-027: Configure Serenity/JS reporters to produce living documentation

**Priority:** Medium
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Framework investment unrealised

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 6

`tests/screenplay/support/configure.ts` sets `crew: []`. Serenity/JS's primary
differentiator over plain Cucumber is its HTML living documentation report.
Without reporters in the crew, test output is identical to plain Cucumber and
the framework investment is not realised. This is especially relevant for
demonstrating pedagogical content to new Stack authors.

Acceptance criteria:

- [x] `@serenity-js/serenity-bdd` installed as a dev dependency
- [x] `configure.ts` updated: `crew` includes `ArtifactArchiver.storingArtifactsAt('.results/serenity')` and the documented `@serenity-js/serenity-bdd` reporter class-description config
- [x] `.results/serenity/` added to `.gitignore`
- [x] Orchestration script (`.batch/run-demoapp001.ps1`) updated to invoke the Serenity BDD CLI to generate the HTML report after the test run
- [x] `npm test` remains green with reporters active
- [x] Stack `docs/README.md` updated with instructions for viewing the report

Resolution:

- Serenity BDD reporting is active for DEMOAPP001. `npm test` now emits Serenity JSON reports, `.batch/run-demoapp001.ps1` generates `.results/serenity/index.html` after the test run, generated Stack-local `.results/` output is ignored, and the Stack README documents viewing instructions plus the Java runtime prerequisite; no DR required.

---

### BACKLOG-028: Correct stale metadata in decision-register.md and backlog.md headers

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Governance document currency

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 7

`decision-register.md` header shows `Last Updated: 2026-05-16` while DR-021
through DR-028 were added on 2026-05-18. The `backlog.md` header previously
referenced `reference-architecture.md v1.9 Section 10.1` (now corrected to
v1.13 in this session). Stale metadata misleads agents that use header fields
to determine document currency.

**Resolution:** `decision-register.md` header metadata now reflects the current
accepted governance state: `Last Updated` is 2026-05-18 and the governing
Reference Architecture version is v1.13. Current governance document headers
were checked for stale RA version metadata.

Acceptance criteria:

- [x] `decision-register.md` `**Last Updated:**` field set to `2026-05-18`
- [x] Verify no other header metadata fields in governance documents reference superseded RA versions
- [x] No DR required (metadata correction, not a normative rule change)

---

### BACKLOG-029: Mark DR-010 as Superseded by DR-014 in decision register

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Decision register governance (RA §10.6)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 8

DR-010 formally accepted `DOCS/.review/` as the code review output location.
DR-014 subsequently moved this to repository-root `.review/`. DR-010 remained
`Status: Accepted` with no forward reference to DR-014. Per RA §10.6, a
superseded entry MUST contain a forward reference to its replacement. An agent
reading the register in order would see DR-010 as valid authority.

Acceptance criteria:

- [x] DR-010 `**Status:**` field updated to: `Superseded by DR-014 -- 2026-05-16`
- [x] A forward reference note added to DR-010's Consequences section identifying DR-014 as the replacement
- [x] DR-014 verified to contain a back reference to DR-010 (add one if missing)
- [x] No new DR required (corrects governance record, not a normative rule change)

Resolution:

- DR-010 now records DR-014 as its superseding decision, with a forward reference in Consequences. DR-014 already contained the required back reference to DR-010. DR-014 was later superseded by DR-029, which restores `DOCS/.review/` as the single authoritative review output location.

---

### BACKLOG-030: Extract actor name 'Solver' to shared constant across step definitions

**Priority:** Low
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** Magic string risk (RA §8.2)

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 9

The string `'Solver'` is used as the argument to `actorCalled('Solver')` in
every step definition file without being extracted to a shared constant. If
the actor persona name changes, it must be located and updated manually across
all step definition files. The name is semantically significant to Serenity/JS
(it appears in reports and stack traces).

Acceptance criteria:

- [x] `tests/screenplay/support/actors.ts` created: `export const SOLVER_ACTOR = 'Solver';`
- [x] All `actorCalled('Solver')` occurrences in step definition files replaced with `actorCalled(SOLVER_ACTOR)` (importing from `actors.ts`)
- [x] `npm test` remains green
- [x] No DR required

Resolution:

- Step definitions now use `SOLVER_ACTOR` from `tests/screenplay/support/actors.ts`, centralising the Serenity actor persona name without changing report semantics; no DR required.

---

### BACKLOG-031: Update sprint roadmap to reflect resolved items

**Priority:** Low
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Planning document currency

Review evidence: `DOCS/.review/2026-05-18_repository-structural-review.md` Risk 12

The sprint roadmap in `DOCS/.planning/backlog.md` shows Sprint 6+ listing
"RA-001 through RA-006 (Open)" while all ten RA items are Resolved. Sprint 2
and Sprint 3 statuses list items already resolved and have dates past their
end date. Any agent or stakeholder reading the roadmap to determine current
focus receives misleading information.

Acceptance criteria:

- [x] Sprint 2 and Sprint 3 rows marked `Completed` with a note of completion date
- [x] Sprint 6+ row updated to remove resolved RA items; replaced with accurate current open items
- [x] Sprint 4 and Sprint 5 rows reviewed for accuracy against current open items
- [x] No DR required

Resolution:

- Sprint roadmap rows now reflect current resolved work and the remaining open backlog. Sprint 2 and Sprint 3 are marked completed on 2026-05-19; Sprint 4 and Sprint 5 remove resolved items; Sprint 6+ no longer references resolved RA items.

---

### BACKLOG-032: Refactor Python Questions to read from Actor memory

**Priority:** High
**Status:** Resolved
**Stack(s):** DEMOAPP002
**Nature of Gap:** Screenplay parity (RA Section 3.5 -- Memory contract)

Review evidence: `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/02_RISKS_AND_ISSUES.md` Risk 1

Resolution:

- FALSE POSITIVE. Cross-check against `tests/screenplay/questions/GridCell.ts` confirmed that
  the TypeScript `matchesSnapshot()`, `origMatchesSnapshot()`, and `isDeepCopy()` methods also
  read `ability.gridSnapshot` directly. The Python implementation is correct parity. No code
  changes required. Review artifacts corrected 2026-05-19.

---

### BACKLOG-033: Extract side effects from MultipleSolvers.isolation_verified()

**Priority:** High
**Status:** Resolved
**Stack(s):** DEMOAPP002
**Nature of Gap:** Screenplay anti-pattern (Questions must be side-effect free)

Review evidence: `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/02_RISKS_AND_ISSUES.md` Risk 2

Resolution:

- FALSE POSITIVE. Cross-check against `tests/screenplay/questions/MultipleSolvers.ts` confirmed
  that the TypeScript `isolationVerified()` Question also calls `ability.initialise()`,
  `ability.solvePuzzle()`, and writes `ALGORITHM_PROGRESS = false` to notes inside its resolver.
  The Python implementation is a faithful translation. No code changes required. Review artifacts
  corrected 2026-05-19.

---

### BACKLOG-034: Resolve BACKLOG-012 as stale duplicate of BACKLOG-020

**Priority:** Medium
**Status:** Resolved
**Stack(s):** All
**Nature of Gap:** Backlog governance (stale Open item)

Review evidence: `DOCS/.review/CODE_REVIEW_CLAUDE_v1_20260519T1948Z/02_RISKS_AND_ISSUES.md` Risk 4

Resolution:

- BACKLOG-012 status updated to `Resolved` (duplicate of BACKLOG-020 which resolved the Python
  Stack on 2026-05-19). Summary count table updated. No DR required.

---

### BACKLOG-014: Advanced Solving Techniques

**Priority:** Future
**Status:** Resolved (Delivered via SUD-32 design/DR-041, SUD-33 Naked Pairs, SUD-34 X-Wing; all 3 Stacks in parity)
**Stack(s):** DEMOAPP001, DEMOAPP002, DEMOAPP003 (3-Stack parity complete)
**Nature of Gap:** Solver capability — the solver implements deterministic basic techniques (Unit Completion, Hidden Singles, Naked Singles) plus advanced techniques (Naked Pairs, X-Wing) across all 3 Stacks, returning `STUCK_ON_ADVANCED_LOGIC` only when further advanced human logic or brute-force is required.

Design reference: `DOCS/.design/advanced-solving-techniques.md` (authored in SUD-32, DR-041)
Algorithm reference: `DOCS/.algorithm/naked-pairs.md` and `DOCS/.algorithm/x-wing.md` (authored in SUD-32, DR-041)

Resolution details:
- SUD-32: Authored design specification and algorithm references; created DR-041 establishing the deterministic 13-attempt solving sequence and audit attribution.
- SUD-33: Implemented Naked Pairs across TypeScript, Python, and C# stacks; added 4 canonical BDD scenarios and component tests.
- SUD-34: Implemented X-Wing across TypeScript, Python, and C# stacks; added 3 canonical BDD scenarios and component tests; updated baseline to 55 scenarios / 304 steps per Stack (165 total).

Acceptance criteria:

- [x] Design doc authored at `DOCS/.design/advanced-solving-techniques.md` listing the techniques in
      scope, their ordering relative to the existing three, and the deterministic (no-guessing) boundary
- [x] An algorithm specification added under `DOCS/.algorithm/` for each new technique (`naked-pairs.md`, `x-wing.md`)
- [x] New `SudokuSolver` methods implement at least Naked Pairs and X-Wing (further techniques optional
      per the design doc), with no trial-and-error/backtracking unless explicitly decided in a DR
- [x] `SudokuOrchestrator.solve()` integrates the new techniques after the existing three; an
      already-solved or simply-solvable grid is unaffected (preserves the SUD-01 early-exit guard)
- [x] Canonical Gherkin coverage added in `features-shared/` first, then propagated to all three Stack
      copies; new step definitions / Screenplay components added per Stack
- [x] Algorithm attribution for each cell change recorded through the existing `AuditLogger`
- [x] `npm test`, `python -m pytest`, and `dotnet test` green; memory-key, feature, and step-text parity PASS
- [x] A decision-register entry recorded if any structural choice (e.g. enabling backtracking, a new
      result string) is made before the item is closed (DR-041)

---

### BACKLOG-015: Interactive Sudoku Tutor

**Priority:** Future
**Status:** Resolved 2026-08-24 — delivered via SUD-35 (design & DR-042), SUD-36 (hint engine & REST API contract), and SUD-37 (guided tutor Web UI & smoke checks)
**Stack(s):** DEMOAPP001 first (future-Stack parity per the SUD-05 capability matrix)
**Nature of Gap:** Product idea — the existing Web UI (BACKLOG-018, Resolved) *replays* a completed
solve read-only. There is no interactive mode that guides a user through their own grid, suggests the
next deterministic move, and explains which technique applies and why.

Design reference: `DOCS/.design/interactive-sudoku-tutor.md` (authored in SUD-35, DR-042)

Builds on the resolved audit trail (BACKLOG-008), `SolveStepTracker` / Web UI (BACKLOG-018), and the
REST API (BACKLOG-009). Consumes the deterministic technique hierarchy and audit stream from
BACKLOG-014 (advanced techniques). Per the SUD-05 capability matrix this is a DEMOAPP001 surface first;
Python/C# remain roadmap.

Acceptance criteria:

- [x] Design doc authored at `DOCS/.design/interactive-sudoku-tutor.md` defining the tutor surface,
      its tag (e.g. an extension of the existing `@web` / API surface), and the user interaction model
- [x] A "next move" hint engine that, given a partial grid, returns the next deterministic step, the
      technique name, and a human-readable rationale — sourced from the existing solver + `AuditLogger`,
      not a second solving implementation
- [x] Interactive guided-mode UI served from the existing Express server (`npm run start:web`),
      reusing the grid / event-log / statistics components where possible
- [x] Behavioural coverage added (canonical-feature-first if the tutor logic is testable at the `@util`
      surface; otherwise API/UI-level tests as the design doc specifies)
- [x] A decision-register entry recorded for the new surface contract before the item is closed (DR-042)
- [x] Capability matrix (platform spec §6.1) updated to record tutor support per Stack

---

### BACKLOG-016: Puzzle Generator

**Priority:** Future
**Status:** Resolved 2026-08-24 — delivered via SUD-38..41; design doc `DOCS/.design/puzzle-generator.md`, `DR-043`, `Mulberry32` PRNG, bounded solution construction engine, `UniquenessOracle`, 180-degree symmetrical clue removal, technique-based difficulty grading, Express REST API `POST /api/generator/generate` with OpenAPI contract, and 49 component + API integration tests.
**Stack(s):** DEMOAPP001 first (future-Stack parity per the SUD-05 capability matrix)
**Nature of Gap:** Product idea — the project only *consumes* fixed puzzles from `puzzles.json`. There
is no capability to generate new valid puzzles (a complete solution reduced to a uniquely-solvable
clue set) with a target difficulty.

Design reference: `DOCS/.design/puzzle-generator.md` (Approved, DR-043)

Difficulty grading is naturally expressed in terms of which techniques a puzzle requires, so the
difficulty dimension depends on BACKLOG-014. Generated puzzles must satisfy the existing loader and
validation-boundary rules (DR-035) and the `puzzles.json` schema.

Acceptance criteria:

- [x] Design doc authored at `DOCS/.design/puzzle-generator.md` covering the generation strategy
      (full-solution construction then clue removal), the uniqueness guarantee, and the difficulty model (DR-043)
- [x] Generator produces a complete valid solution and removes cells while preserving a unique solution
- [x] Difficulty rating derived from the solving techniques a puzzle requires (links to BACKLOG-014);
      puzzles tagged with a difficulty consistent with the existing `puzzles.json` `difficulty` field
- [x] Generated puzzles validate through the existing `PuzzleLoader` (structure) and solver/API
      (constraints) per `validation-boundaries.md`; output conforms to the `puzzles.json` schema
- [x] Behavioural coverage added per the design doc (canonical-feature-first where applicable)
- [x] A decision-register entry recorded for the new capability before the item is closed
- [x] Capability matrix (platform spec §6.1) updated to record generator support per Stack

---

### BACKLOG-071: Static browser-only visualisation evidence on Pages (LAND-09D)

**Priority:** Low
**Status:** Resolved 2026-08-04 — delivered via PRs #52 (planning, `619016f`) + #53 (impl, `4e504b3`);
Pages [run 30926946232](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/30926946232)
green; live at <https://gbrooks1970.github.io/gb.automation.smoketests.sudoku.poc/> and linked from
the portfolio landing page (portfolio PR #27, `19a8797`), closing LAND-09D and the LAND-09 programme.
**Stack(s):** DEMOAPP001 only (an evidence surface, not a parity capability)
**Nature of Gap:** Public evidence publication — the DEMOAPP001 Web UI Solver Visualisation
(BACKLOG-018) runs only against the live Express REST API (`/api/puzzles`, `/api/visualise/:name`),
so it cannot be hosted on GitHub Pages as-is. The portfolio landing page's **LAND-09D** slice asks
for a static, browser-only rendering of the existing visualisation, backed by precomputed solve
payloads, so a visitor can see it without cloning or running the server.

**Origin and authority:** Portfolio landing **LAND-09D** (the final public-evidence slice, READY once
LAND-09C closed 2026-08-04). Per the LAND-09 cross-repository delivery contract the landing item does
not by itself authorise implementation here — this backlog entry plus **DR-040** are that
authorisation, and DR-040 records the decision boundary below.

**Decision boundary (see DR-040) — this item does NOT:**
- absorb **BACKLOG-014** (advanced solving techniques), **BACKLOG-015** (the interactive tutor) or
  **BACKLOG-016** (the puzzle generator); those remain Open and independently scoped;
- change the solver, orchestrator, `puzzles.json`, the REST API or any Stack's behaviour;
- claim three-stack parity — it is explicitly a single-Stack (DEMOAPP001 TypeScript) evidence surface;
- introduce a running service, backend or live API on Pages.

**Viability gate (DR-040 precondition) — PASSED 2026-08-04:** a throwaway proof precomputed all five
`VisualiseResult` payloads offline by reusing `SolveStepTracker.trackSolve()` /
`SudokuApiService.listPuzzles()`, then served the existing `grid.js` / `player.js` with a relative-fetch
client from static files only (no server). The viewer populated the dropdown, rendered the 9×9 grid
(30 clues at step 0 → 81 filled at step 51/51, SOLVED) and the 51-step event log, with no console
errors. Static browser-only publication is therefore viable.

Acceptance criteria (for the implementation, not this planning item):

- [x] A deterministic in-repo precompute step reuses the maintained solve/visualise logic to emit a
      static `puzzles.json` list and one `VisualiseResult` payload per puzzle; a check validates the
      fixture provenance and schema and prevents drift from the current visualisation contract.
- [x] A static viewer reuses the maintained grid/player/presentation behaviour, loading payloads from
      relative static assets on the Pages base path with no API/server; the page labels itself a
      browser-only DEMOAPP001 TypeScript visualisation, not an interactive tutor, hosted solver, live
      API or three-stack parity demonstration.
- [x] Accessibility, keyboard playback, error handling, desktop/390px layout and a clean browser
      console are covered by automated and/or rendered checks before target Pages publication.
- [x] A `pages.yml` workflow deploys the static viewer on push to `main` after the checks pass, with
      deploy-only Pages permissions and no deployment on pull requests.
- [x] Repository Pages configured for GitHub Actions publication; the canonical public URL documented.
- [x] A separate portfolio landing PR adds the verified URL as a `demo` action; exact target and
      landing merge CI/Pages evidence and the verified public URL are recorded before this item is
      Resolved and LAND-09D (and the LAND-09 programme) are marked DONE.

**Update (2026-09-07):** Checked the acceptance criteria that were delivered by project PRs #52/#53
and portfolio landing PR #27 but left unchecked when BACKLOG-071 was marked Resolved. The public
viewer returned HTTP 200 and Pages run 33996955729 passed at current `main`.

---

### BACKLOG-080: Compatible fast-uri advisory remediation (TRIAGE-09)

**Priority:** Low
**Status:** Resolved
**Stack(s):** DEMOAPP001
**Nature of Gap:** The fresh Node 24 audit reports moderate GHSA-hrr3-gc8f-f4qj in
fast-uri 3.1.7, shared by three Ajv 8.20.0 parents with compatible `^3.0.1` ranges.
**Owner authority:** "proceed as recommended", 2026-10-07, selecting TRIAGE-09 ahead of
TRIAGE-08. [Filed implementation plan](../.implementation-plans/2026-10-07-triage-09-fast-uri.md).
**Decision Record:** Existing DR-039; no structural change or new exception.

Acceptance criteria:

- [x] Lock fast-uri 3.1.8 within existing parent ranges; no other dependency graph change.
- [x] Reproducible Node 24 `npm ci` and installed resolution verified.
- [x] Upstream host-normalisation control fails on 3.1.7 and passes on 3.1.8.
- [x] DEMOAPP001 static, API/OpenAPI, component/BDD, existing coverage and publication checks pass.
- [x] Fresh governed audit removes the fast-uri finding with zero unexcepted blockers.
- [x] Preserve the exact braces exception through 2026-10-12 inclusive and all separate items.

**Local delivery evidence (2026-10-07):** Node 24.18.0 / npm 11.16.0 locked restore passed
in 84,516 ms and left the lock's SHA-256 unchanged. Complete parsed graph comparison proves
only fast-uri's three metadata fields changed; `npm ls fast-uri --all` shows 3.1.8 through all
three Ajv 8.20.0 parents. The intended URI assertion failed on 3.1.7 (`A.com` versus `a.com`,
native exit 1, 350 ms) and all five assertions passed on 3.1.8 (256 ms). The fast-uri advisory
absence check separately fails on the captured before audit and passes afterwards. Fresh
governed audit reports one finding, one approved braces exception and zero unexcepted blockers.

The normal suite passed 113 component tests (20,171.4968 ms) plus 55 scenarios / 309 steps
(6.206 s). Coverage passed 113 tests (101,395.955 ms) with 80.11% lines / 91.94% branches /
80.17% functions under unchanged 70/85/75 floors and one local worker. API integration, eight
OpenAPI tests (7,588.5197 ms), build/lint/format, web/Pages scripts and all seven repository
parity/governance checks passed. Results are retained under `.results/triage-09/20261007/`.
Unchanged Python/C# suites and native Then mutation controls are left to all-Stack PR CI;
Docker, live browser flows and the optional older loader/orchestrator mutation trial were not
rerun. No solver, feature, API/schema, manifest, CI, policy or coverage-floor change was made.

The first URI-control tool invocation failed to load its module due to external argument
forwarding; it is retained and explicitly excluded from acceptance. The corrected native
assertion failure and final positive run above are the accepted controls. The manifest-selected
v6 handover and registry's unscheduled BACKLOG-078 note are historical/non-current;
their separate lifecycle refresh is outside TRIAGE-09.

---

### BACKLOG-081: Active capability and assurance documentation currency (TRIAGE-08)

**Status:** Resolved 2026-10-07 on local acceptance; all-Stack PR CI remains the publication check.
**Priority:** Low
**Stack(s):** All (active documentation and repository tooling)
**Source:** September review R5; owner selected the next recommended item on 2026-10-07.
**Plan:** [Filed implementation plan](../.implementation-plans/2026-10-07-triage-08-documentation-currency.md)

**Acceptance:** Active documentation consistently states the five implemented techniques and
the deterministic solver's supported no-progress boundary. Current component/OpenAPI counts
come from native execution inventory with portable source fingerprints; dated coverage and
mutation figures remain explicitly historical. Narrow currency guards and precise isolated
negative controls reject the identified drift. Preserve immutable reports, product behaviour,
coverage floors and separately scoped TRIAGE-10/15.

**Local delivery evidence (2026-10-07):** Eight active documents describe all five techniques,
the supported deterministic no-progress boundary, current native counts and the three individual
technique API endpoints. The [execution inventory](../.analysis/2026-10-07-component-execution-inventory.json)
records 113 TypeScript component tests, eight OpenAPI tests, 30 Python components and 28 C#
components, all passing with zero failures/skips. Command durations were 33,109 / 43,206 /
9,288 / 36,554 ms respectively. All three BDD lanes also passed: TypeScript 55 scenarios /
309 steps (5.983 s runner, 25,199 ms command), Python 85 total tests (55 BDD + 30 component,
2.26 s runner, 5,060 ms command), C# 55 Reqnroll tests (18,296 ms command). Python emits one
pre-existing Gherkin deprecation warning; it is not a failure.

The static guard rejects contradictory active claims, wrong counts and changed collection
sources/configuration. The logged currency controls passed 37/37 intended mutations in
48,276 ms, requiring each isolated baseline, a unique anchor, exit 1 and its named diagnostic;
the LF-normalisation positive control passed. Temporary cleanup checks resolved containment.
All seven governance/parity checks passed, including 13 dependency-policy and 21 CI-evidence
controls. PowerShell parse, new links, source/output hashes and independent review passed.
All 103 earlier canonical IDs/statuses remain unchanged; only BACKLOG-081 was added.

Native evidence and timings are retained under `.results/triage-08/20261007/`; the committed
inventory records commands, UTC starts, source SHA and hashes. Build/lint/format, full coverage,
governed live audits and native Then mutation controls use unchanged all-Stack PR CI. Docker,
native browser flows and the historical loader/orchestrator mutation trial were not rerun.
Product/test sources, locks/policy, features, workflow, coverage floors, immutable reports and
dated baseline documents match the base. The v6 handover and registry's older BACKLOG-078 note
remain separately scoped lifecycle records. The root worklist is separate control state.

## Resolved Items

| ID | Title | Stack(s) | Resolved | Notes |
|----|-------|----------|----------|-------|
| BACKLOG-081 | Active capability and assurance documentation currency (TRIAGE-08) | All | 2026-10-07 | Eight active guides reconciled; native 113/30/28 component and eight OpenAPI inventory, five-technique/no-progress claims, historical labels, 37 precise currency controls and seven repository gates; existing history preserved; PR CI is the publication check |
| BACKLOG-080 | Compatible fast-uri advisory remediation (TRIAGE-09) | DEMOAPP001 | 2026-10-07 | fast-uri 3.1.7 to 3.1.8, three-field lock-only change; reproducible restore, native URI/advisory controls, 113 component + 55 BDD / 309 steps, eight OpenAPI tests, existing coverage and gates; only approved braces exception remains; PR CI is the publication check |
| BACKLOG-078 | Exact digit and position Then assertions (TRIAGE-14) | All | 2026-10-07 | 16 patterns / 48 bindings; 45 native positives, 66 killed mutations, byte-exact restoration; 113 TS component + 55 BDD, 85 Python, 28 C# component + 55 Reqnroll; unchanged coverage floors and existing contracts; PR CI is the publication check |
| BACKLOG-075 | Three-stack parity evidence page at `/parity/` | All | 2026-09-30 | DR-047; PRs #83, #86, #87, #88; results-level gate, parity job, one Pages artefact; `main` run 36786863220 green incl. deploy; live page verified |
| BACKLOG-076 | Restore supported-runtime dependency audits (TRIAGE-12) | DEMOAPP001 / DEMOAPP002 | 2026-09-30 | urllib3 2.8.0 and Serenity 3.48.0 / Axios 1.20.0; Python 85 tests, 88.98% coverage, zero audit findings, 5/5 evidence; Node 102 component + 55 BDD, existing floors, zero blocking findings, 6/6 evidence; DR-039 retained; all-Stack CI is the publication check |
| BACKLOG-074 | Tutor request ownership and stale hint rejection (TRIAGE-07) | DEMOAPP001 | 2026-09-30 | DR-046; 36 controlled controller cases; 102 component + 55 BDD scenarios and 8 OpenAPI tests green; native browser startup blocked separately by TRIAGE-11 |
| BACKLOG-073 | Exact target generation and bounded exhaustion (TRIAGE-06) | DEMOAPP001 | 2026-09-30 | DR-045; real exact-tier and Expert/81-clue failure regressions, typed 422 mapping, 66 component + 55 BDD scenarios and 8 OpenAPI tests green |
| BACKLOG-072 | Shared technique vocabulary and exact difficulty grading (TRIAGE-05) | DEMOAPP001 | 2026-09-30 | DR-044; all five DR-043 tiers, real unique 57-move XWing completion regression, 57 component + 55 BDD scenarios green; compatible brace-expansion lock repair cleared blocking audit |
| BACKLOG-001 | Complete Hidden Singles Implementation | DEMOAPP001 | 2026-05-14 | Rows, columns, and blocks now checked |
| BACKLOG-002 | Implement Automated Test Runner | DEMOAPP001 | 2026-05-14 | Cucumber test runner established |
| BACKLOG-003 | Create Implementation Logs | All | 2026-05-14 | Initial implementation logs created |
| BACKLOG-005-NEW | Centralize Constants in constants.ts | DEMOAPP001 | 2026-05-14 | Grid constants centralized |
| BACKLOG-006-COMPLETE | Add Prettier to ESLint Setup | DEMOAPP001 | 2026-05-14 | Formatting baseline established |
| BACKLOG-019 | Migrate TypeScript Tests to Screenplay Pattern | DEMOAPP001 | 2026-05-15 | Screenplay layer implemented and green |
| MIG-01 | Adopt Reference Architecture v1.3 and create DR-012 | All | 2026-05-15 | DR-012 |
| MIG-02 | Add RA-literal DOCS path bridges | All | 2026-05-15 | DR-013 |
| MIG-03 | Align code review output location and naming | All | 2026-05-15 | DR-014; updated by DR-029 |
| MIG-06 | Refresh AI agent guide for v1.3 | All | 2026-05-15 | `CLAUDE.md` current; updated by DR-029 |
| MIG-07 | Reconcile backlog against v1.3 state | All | 2026-05-15 | This update |
| MIG-08 | Complete template mandate details | All | 2026-05-15 | Required annotations added; current docs use lowercase template references |
| MIG-04 | Wire Screenplay runtime state through Actor Memory | DEMOAPP001 | 2026-05-16 | TakeNotes wired; all 6 Memory keys runtime-active; DR-015 |
| MIG-05 | Remove direct Ability calls from step definitions | DEMOAPP001 | 2026-05-16 | All step files thin; 8 new Tasks, 5 new Questions; DR-015 |
| MIG-13 | Rename Stack filesystem directories to kebab-case | DEMOAPP001 and future Stacks | 2026-05-16 | R100 renames via git mv; ~50 files updated; 43/43 pass; PR #13; DR-016 |
| MIG-09 | Normalize implementation-log location and naming policy | All | 2026-05-16 | Log files moved to `DOCS/.implementation-logs/` with v1.3 naming; archive in `.implementation/`; DR-017 |
| MIG-10 | Add feature parity validation report process | All | 2026-05-16 | `.batch/generate-feature-parity-report.ps1` created; reports write to `.results/feature-parity/`; orchestration-design updated |
| MIG-11 | Parameterize over-specified canonical Gherkin steps | All | 2026-05-16 | Two scenarios converted to Scenario Outlines with Examples; step defs parameterized; 43/43 pass; parity PASS; DR-018 |
| MIG-12 | Decide metrics Stack identifier policy | All | 2026-05-16 | Short identifier `DEMOAPP001` documented in run script (DR-016 ref) and orchestration-design Section 6; stale RA v1.2 comment corrected |
| BACKLOG-026 | Normalize planning backlog filename to lowercase | All | 2026-05-19 | `DOCS/.planning/backlog.md` filesystem casing normalized; editable non-review references updated; no DR required |
| BACKLOG-028 | Correct stale governance document metadata | All | 2026-05-19 | `decision-register.md` header updated to `Last Updated: 2026-05-18` and RA v1.13 governance; no DR required |
| BACKLOG-029 | Mark DR-010 as Superseded by DR-014 in decision register | All | 2026-05-19 | DR-010 status and forward reference updated; DR-014 back reference verified; no DR required |
| BACKLOG-025 | Fix feature parity report summary terminology to match RA CI gate spec | All | 2026-05-19 | Feature parity report summary and console output now emit `PASS`, `DRIFT`, or `MISSING`; non-PASS exit remains non-zero; no DR required |
| BACKLOG-022 | Implement step-text parity checker (Section 8.4 criterion 3) | All | 2026-05-19 | `.batch/check-step-text-parity.ps1` added with non-zero drift exit and line reporting; initial CI gate added; no DR required |
| BACKLOG-004 | Setup GitHub Actions CI/CD | DEMOAPP001 | 2026-05-19 | `CI` workflow added for DEMOAPP001 build, lint, tests, parity gates, and artifact upload; README badge added |
| BACKLOG-031 | Update sprint roadmap to reflect resolved items | All | 2026-05-19 | Sprint roadmap refreshed to remove resolved items, mark completed rows, and show current open work; no DR required |
| BACKLOG-024 | Make "the missing digit is {int}" step genuinely parameterised | DEMOAPP001 | 2026-05-19 | Missing digit parameter now drives column/block unit-completion fixture setup; feature text unchanged and parity retained; no DR required |
| BACKLOG-030 | Extract actor name 'Solver' to shared constant across step definitions | DEMOAPP001 | 2026-05-19 | Shared `SOLVER_ACTOR` constant added and step definitions use `actorCalled(SOLVER_ACTOR)`; no DR required |
| BACKLOG-027 | Configure Serenity/JS reporters to produce living documentation | DEMOAPP001 | 2026-05-19 | Serenity BDD reporter and artifact archiver configured; runner generates HTML living documentation after tests; no DR required |
| BACKLOG-020 | Python Screenplay-style Step Definitions | DEMOAPP002 | 2026-05-19 | DEMOAPP002 Python pytest-bdd Stack created; 46 canonical scenarios pass; parity gates include DEMOAPP002; no DR required |
| BACKLOG-012 | Implement Python Version | DEMOAPP002 | 2026-05-19 | Duplicate of BACKLOG-020; Python Stack completed by BACKLOG-020. Closed as stale per BACKLOG-034. |
| BACKLOG-032 | Refactor Python Questions to read from Actor memory | DEMOAPP002 | 2026-05-19 | False positive -- TypeScript GridCell Questions use ability.gridSnapshot directly in the same pattern; no action required. |
| BACKLOG-033 | Extract side effects from MultipleSolvers.isolation_verified() | DEMOAPP002 | 2026-05-19 | False positive -- TypeScript MultipleSolvers.isolationVerified() has identical mutations by design; no action required. |
| BACKLOG-034 | Resolve BACKLOG-012 as stale duplicate of BACKLOG-020 | All | 2026-05-19 | BACKLOG-012 closed, resolved items table updated; no DR required. |
| BACKLOG-009 | Implement REST API Wrapper | DEMOAPP001 | 2026-05-20 | Express API server added with technique, solve, puzzle, validation, request validation/error middleware, and API integration tests; no DR required. |
| BACKLOG-018 | Implement Web UI Solver Visualisation | DEMOAPP001 | 2026-05-20 | SolveStepTracker adapter, GET /api/visualise/:name endpoint, and vanilla ES-module frontend (grid, player, event log, statistics) served from existing Express server; no DR required. |
| BACKLOG-021 | C# Screenplay-style Step Definitions | DEMOAPP003 | 2026-05-28 | DEMOAPP003 C# SpecFlow Stack added with 46 canonical scenarios passing; parity scripts include C#; DR-032. |
| BACKLOG-013 | Implement C# Version | DEMOAPP003 | 2026-05-28 | Covered by BACKLOG-021; closed as duplicate/umbrella following the BACKLOG-012/BACKLOG-020 precedent. |
| BACKLOG-011 | Performance Benchmarking Suite | All | 2026-05-28 | Reporting-only benchmark harnesses added for DEMOAPP001/002/003 with root aggregation script and `.results/performance/` artifacts; no timing threshold gate. |
| BACKLOG-010 | Docker Compose for Local Development | All | 2026-05-29 | Integrated Alpine, slim, and SDK-based multi-stack Compose services, parity validation loops, and aggregated benchmarking runtimes; DR-033 |
| BACKLOG-035 | Early solved-grid check (SUD-01) | All | 2026-06-13 | `isGridFull`-style guard before the progress loop in all three orchestrators; already-solved input returns `SOLVED` with 0 iterations/0 events; 46×3 green, parity PASS; PR #18 |
| BACKLOG-036 | v1.1 solver-platform specification (SUD-02) | All | 2026-06-13 | `sudoku-solver-platform-specification.md` v1.1 evolves the v1.0 core baseline; DR-034; PR #18 |
| BACKLOG-037 | Deep-copy grid snapshot methods (SUD-03) | All | 2026-06-13 | `getGrid`/`get_grid`/`GetGrid` return deep copies; read-only call sites converted; public `grid` retained, direct mutation deprecated in stack docs; PR #19 |
| BACKLOG-038 | Validation-layer boundaries + OpenAPI contract (SUD-04) | DEMOAPP001 | 2026-06-13 | `validation-boundaries.md` (loader=structure, solver/API=constraints; strict mode deferred); DEMOAPP001 `openapi.yaml` (9 paths, 19 schemas); DR-035; PR #19 |
| BACKLOG-039 | Stack capability matrix (SUD-05) | All | 2026-06-13 | 7×3 matrix in platform spec §6.1 + README mirror; core/BDD parity required, API/web roadmap for DEMOAPP002/003; PR #21 |
| BACKLOG-040 | C# loader integer validation docs (SUD-06) | DEMOAPP003 | 2026-06-13 | DEMOAPP003 README documents typed `System.Text.Json` deserialization as the integer-type gate before the v1.0 §7.1 range check; `PuzzleLoader.cs` untouched; PR #21 |
| BACKLOG-041 | Accept v1.1 spec post-merge (SUD-07) | All | 2026-06-13 | DR-034 flipped Proposed→Accepted; root README + DOCS indexes present v1.1 as platform authority with v1.0 as core baseline; CLAUDE.md DR range corrected; PR #20 |
| BACKLOG-042 | Node-24 GitHub Actions bump (SUD-08) | CI | 2026-06-13 | `ci.yml` action pins bumped to Node-24 majors ahead of the 2026-06-16 cutover; CI green on the new pins, no deprecation warnings; PR #20 |
| BACKLOG-043 | Fix root README "+ Flask" mislabel (SUD-09) | All | 2026-06-17 | Architecture diagram Python box no longer reads "+ Flask"; all three boxes relabelled to real toolchains (TypeScript/Cucumber, Python/pytest-bdd, C#/SpecFlow); `git grep Flask` returns no source hits; review CLAUDE_Opus_4_8 v1 Risk 1; no DR required |
| BACKLOG-044 | Update stale README "35+ test scenarios" count (SUD-10) | All | 2026-06-17 | README pedagogical section now states the true figure (46 scenarios per stack / 138 across all three; DEMOAPP001 = 46/257 steps), consistent with backlog baseline line 36 and CLAUDE.md; `grep "35+"` over README returns no stale-count hit; review CLAUDE_Opus_4_8 v1 Risk 2; no DR required |
| BACKLOG-045 | Governance ordering/date hygiene (SUD-11) | All | 2026-06-17 | DR-035 ordering note and root README no-seconds date convention reconciled. |
| BACKLOG-046 | Govern the root README rich-formatting exception (SUD-12) | All | 2026-06-17 | Naming conventions explicitly permit the root README's emoji/box-drawing presentation. |
| BACKLOG-047 | CI aggregate gate + local pwsh prerequisite (SUD-13) | CI + docs | 2026-06-19 | Fan-in gate job and local parity prerequisite documented. |
| BACKLOG-048 | Dependency advisories and reproducible restore inputs | All | 2026-07-14 | Zero known npm/Python/NuGet vulnerabilities; npm, Python constraints, and NuGet lock inputs committed. |
| BACKLOG-049 | Node 24 and CI runtime/action safety | DEMOAPP001 + CI | 2026-07-14 | Node 24 LTS, read-only workflow permissions, non-persisted checkout credentials, and current action majors. |
| BACKLOG-050 | Reqnroll/.NET 10 migration | DEMOAPP003 | 2026-07-14 | 46/46 scenarios pass on Reqnroll 3.3.4, NUnit 4, and .NET 10; DR-036. |
| BACKLOG-052 | Documentation/governance currency reconciliation | All | 2026-07-14 | Fable Risks 5/6/8 and I-3 reconciled across active docs. |
| BACKLOG-053 | Sudoku P-07 publication-readiness audit | All | 2026-07-14 | Conditional technical go; owner email/visibility gates remain outside implementation. |
| BACKLOG-054 | SUD-17 licence closure reconciliation | All | 2026-07-17 | Portfolio D-06 approved and delivered ISC (PR #30), superseding the worklist's MIT default; root/manifest metadata already consistent; no DR required. |
| BACKLOG-055 | RA header-currency parity guard (SUD-19) | All (tooling) | 2026-07-17 | `.batch/check-ra-header-currency.ps1` asserts decision-register.md/backlog.md cite the active RA version; wired into run-parity-checks.ps1 and CI; PASS on current main. |
| BACKLOG-051 | Orchestration ordering/no-execution assertions (SUD-20) | All | 2026-07-17 | Tracked-order solve path in all three Stacks; real audit-event assertions replace SOLVED-status inference; 46×3 green, all parity gates PASS; no DR (Gherkin unchanged). |
| BACKLOG-056 | DEMOAPP001 test/tooling static-analysis coverage (TRIAGE-01) | DEMOAPP001 + CI | 2026-07-20 | ESLint/Prettier cover app, tests, and tooling; CI runs format checking; 46 scenarios / 257 steps and parity gates PASS. |
| BACKLOG-057 | CLAUDE.md governance-currency guard (TRIAGE-02) | All (docs/tooling) | 2026-07-20 | Removed the stale duplicate DR range; guard now checks CLAUDE.md's RA citation and DR-001..latest range against the decision register. |
| BACKLOG-058 | Parity container PowerShell/Ubuntu alignment (TRIAGE-03) | All (tooling) | 2026-07-20 | Compose parity image aligned with CI on PowerShell 7.5 / Ubuntu 24.04; host/container parity PASS. |
| BACKLOG-059 | Node 24 engine enforcement (TRIAGE-04) | DEMOAPP001 | 2026-07-20 | `engine-strict=true` now rejects unsupported npm installs; clean Node 24 install and gates PASS. |
| BACKLOG-060 | Orchestration characterisation and attempt-event contract (SUD-21) | All | 2026-07-27 | Cross-stack baseline captured; DR-037 approved immutable attempt events; `Logic Squeeze Grid` claim narrowed without changing solve behaviour. |
| BACKLOG-061 | Immutable orchestration attempt instrumentation (SUD-22) | All | 2026-07-27 | Optional attempt observers, exact-order/progress contract tests and canonical three-Stack assertions implemented; change-only audit compatibility retained. |
| BACKLOG-062 | Cross-Stack JSON boolean-cell rejection (SUD-23) | All | 2026-07-27 | Exact Python integer validation, canonical `true`/`false` real-loader coverage in all Stacks, and all DEMOAPP001 grid POST boundaries reject booleans; public contract unchanged. |
| BACKLOG-063 | TypeScript component lane and coverage baseline (SUD-24) | DEMOAPP001 | 2026-07-27 | 16 focused component tests; Node 24 report-only baseline of 73.23% lines / 87.67% branches across five selected production modules; no threshold before SUD-28. |
| BACKLOG-064 | Python component lane and coverage baseline (SUD-25) | DEMOAPP002 | 2026-07-27 | 26 focused component tests; Python 3.13 report-only baseline of 87.54% lines / 88.31% branches across three selected production modules; no threshold before SUD-28. |
| BACKLOG-065 | C# component lane and coverage baseline (SUD-26) | DEMOAPP003 | 2026-07-28 | 24 focused component tests in a separate NUnit project; .NET 10 report-only baseline of 86.03% lines / 84.91% branches across three selected production types; no threshold before SUD-28. |
| BACKLOG-066 | Executable OpenAPI contract gate (SUD-27) | DEMOAPP001 | 2026-07-28 | Redocly lint plus 4 real-response schema checks cover representative 2xx/4xx/5xx paths and an intentional drift control under Node 24 CI; DR-035 authority retained. |
| BACKLOG-067 | Coverage floors and focused mutation policy (SUD-28) | All | 2026-07-28 | Conservative Stack-specific CI floors enforced; 10/10 focused loader/orchestrator mutants killed; all negative controls fail closed; DR-038. |
| BACKLOG-068 | Documentation currency and stable drift guard (SUD-29) | All | 2026-07-28 | Active docs reconciled to public/current runtime, count, manifest, authority and review facts; derived guard plus six isolated stale mutations pass; no DR required. |
| BACKLOG-069 | Symmetric structured CI evidence (SUD-30) | All | 2026-07-28 | Native test and coverage evidence retained for all Stacks under aligned fail-closed uploads; 11/11 required-file negative controls pass; no DR required. |
| BACKLOG-070 | Supported-runtime dependency audits and bounded exceptions (SUD-31) | All | 2026-07-28 | Node 24 npm, Python 3.13 `pip-audit` and .NET 10 NuGet audits block under DR-039; common retained summaries, 13 policy controls and 17/17 evidence omissions pass; current findings zero. |
| BACKLOG-071 | Static browser-only visualisation evidence on Pages (LAND-09D, DR-040) | DEMOAPP001 | 2026-08-04 | Viability gate passed; static viewer reuses `grid.js`/`player.js` verbatim over precomputed payloads (`build:pages`/`check:pages`, `pages.yml`); live at <https://gbrooks1970.github.io/gb.automation.smoketests.sudoku.poc/> (PRs #52 `619016f` + #53 `4e504b3`, Pages run 30926946232) and linked from the portfolio landing page. A dev/test-tooling audit advisory that surfaced during CI (brace-expansion override `5.0.8`→`^5.0.9`, fast-uri `3.1.5`) was cleared under DR-039; `npm audit` = 0, 48/48 scenarios pass. |
| BACKLOG-014 | Advanced Solving Techniques (SUD-32..34) | All | 2026-08-20 | Designed, governed (DR-041), and implemented Naked Pairs and X-Wing techniques across all 3 Stacks; canonical feature updated to 55 scenarios / 309 steps (165 scenarios across 3 Stacks); 20 TS / 30 Py / 28 C# component tests; audit attribution & parity gates PASS. |
| BACKLOG-015 | Interactive Sudoku Tutor (SUD-35..37) | DEMOAPP001 | 2026-08-24 | Designed (DR-042), governed, implemented next-move hint engine, POST /api/tutor/hint endpoint with OpenAPI contract, guided interactive tutor Web UI, and smoke test coverage; 3-Stack parity maintained. |
| BACKLOG-016 | Sudoku Puzzle Generator (SUD-38..41) | DEMOAPP001 | 2026-08-24 | Designed (DR-043), governed, implemented Mulberry32 PRNG, grid-validator, bounded solution construction engine, UniquenessOracle, 180-degree symmetrical clue-reduction engine, technique-based difficulty grader, REST API POST /api/generator/generate with OpenAPI contract, and 49 component + API integration tests; 3-Stack parity maintained. |


---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items | Status |
|--------|-------|-------|-----------|--------|
| 2 | 2026-05-14 to 2026-05-27 | Close persistent risks and governance drift | MIG-04, MIG-05, MIG-08, BACKLOG-004 | Completed 2026-05-19 |
| 3 | 2026-05-19 | Directory rename and output decoupling | MIG-13, BACKLOG-007, BACKLOG-017 | Completed 2026-05-19 |
| 4 | 2026-05-20 | API foundation and Web UI completion | BACKLOG-009, BACKLOG-018 | Completed 2026-05-20 |
| 5 | 2026-05-28 onward | C# Stack, local Compose, and benchmarking | BACKLOG-021, BACKLOG-013, BACKLOG-010, BACKLOG-011 | Completed 2026-05-29 |
| 6+ | 2026-07-28 to 2026-08-24 | Codex review remediation followed by approved product increments | SUD-21..41 worklist; BACKLOG-014, BACKLOG-015, BACKLOG-016 | Completed 2026-08-24; project resting |

---

## Maintenance Rules

1. Keep item statuses exactly `Open`, `In Progress`, or `Resolved`.
2. Update the summary counts whenever an item status changes.
3. Do not delete resolved items.
4. Add a Decision Register entry before closing any item that resolves into a structural choice.
5. Update `DOCS/.analysis/ref-arch-alignment_2026-05-15.md` when Reference Architecture migration status changes.
6. Keep `DOCS/.planning/backlog.md` as a bridge only unless DR-013 is superseded.

---

**Next Review Date:** 2026-10-14
**Backlog Owner:** Project Lead / Development Team
