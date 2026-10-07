---
version: 1
created: 2026-10-07T15:55Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: BACKLOG-081 / TRIAGE-08
status: approved
approved: 2026-10-07 by GBrooks1970, "proceed to next recommended item"; bounded documentation/currency repair and focused project PR, owner merges
delivered: not yet
language: en-GB
---

# Implementation plan: TRIAGE-08 active documentation currency

**Goal.** Reconcile active capability and assurance claims with the implemented five-technique
deterministic solver and native test inventory, then extend existing currency checks to reject
the identified drift. This closes September review R5 without changing product behaviour.

## Evidence gathered before planning

Read-only inspection ran in the owned isolated checkout at fetched main
`eaaeb79a9ec7d9bb4c5eb6338a956e4308efceee`. Two independent surveys inspected active docs,
the review, solver orchestration and existing currency tooling. No tracked file was changed.

| Finding | Consequence for the plan |
|---|---|
| All three orchestrators invoke Unit Completion, Hidden Singles, Naked Singles, Naked Pairs and X-Wing | Correct contradictory three-technique and unsupported-technique claims in active docs. |
| Difficulty labels do not guarantee completion; the deterministic core stops when the five supported methods cannot progress | Describe the measured solver boundary rather than inventing difficulty success rates; distinguish generator uniqueness search from the core. |
| Retained 7 October native evidence reports 113 TS component/eight OpenAPI tests, 30 Python components and 28 C# components | Rerun these suites and retain an execution-backed inventory; do not infer parameterised counts from source declarations. |
| Eight active documents contain stale claims, while dated baselines and reviews describe their original snapshots | Correct the eight active documents; explicitly date retained coverage/mutation observations and preserve immutable history. |
| Existing currency checks cover versions and Gherkin counts but not these contradictions or component counts | Extend the two existing scripts and keep their CI wiring. |
| Existing negative controls accept any non-zero exit and clean a computed temporary path | Require a passing fixture baseline, precise diagnostics and unique mutation anchors; verify resolved containment before recursive cleanup. |
| The canonical backlog has 103 resolved IDs; BACKLOG-081 is free | Allocate only BACKLOG-081 and preserve every existing item. |

## Steps

1. File this plan and its row in `DOCS/.implementation-plans/_index.md`, then specify
   BACKLOG-081 acceptance in `DOCS/.planning/backlog.md` before implementation.
2. Run the native TypeScript component/OpenAPI, Python component and C# component suites.
   Retain commands, output, UTC timing and result counts under ignored
   `.results/triage-08/20261007/`. Create
   `DOCS/.analysis/2026-10-07-component-execution-inventory.json` with measured counts,
   runtime/command provenance, source SHA, output hashes and sorted test-path fingerprints.
   Normalise line endings for portable fingerprints; include collection-defining configuration.
3. Correct `README.md`, `CLAUDE.md`, DEMOAPP001 `README.md`, `docs/README.md`,
   `docs/architecture.md`, `docs/qa-strategy.md`, and DEMOAPP003 `docs/README.md` and
   `docs/qa-strategy.md`. State all five techniques, supported no-progress boundary, accurate
   individual API endpoint scope and current execution-backed counts. Label dated coverage
   and mutation figures historical without changing their percentages or existing floors.
4. Extend `.batch/check-ra-header-currency.ps1` to protect the bounded claims in their active
   sections and compare native inventory fingerprints/counts with docs. It performs static
   currency checks, not native test execution or a new coverage policy. Extend
   `.batch/test-documentation-currency.ps1` with a positive fixture baseline and isolated
   mutations for technique, boundary, count, historical-label and inventory-source drift;
   require each expected named diagnostic and validate temporary-path containment on cleanup.
5. Run the modified guard/control scripts and the existing repository governance/parity
   checks. Check new relative links, corrected active claims, PowerShell syntax, exact scope
   and preservation of historical records. All-Stack PR CI runs the unchanged product gates.
6. On acceptance, resolve BACKLOG-081, update `CHANGELOG.md`, append this plan's Outcome
   and update its index row. Commit exact project paths, push and create a focused project PR.
   Record its implementation evidence in the separate root worklist for independent publication.

## Verification

- Fresh native execution proves component counts and eight OpenAPI tests; inventory records
  zero failures/skips and matching source fingerprints, including newly added/removed files.
- Real and isolated baseline currency checks pass; planted stale claims, unsupported-technique
  text, backtracking, incorrect counts, lost historical labels and test-source drift must fail
  with the intended diagnostic. Existing six controls remain meaningful.
- Seven existing governance/parity checks, PowerShell parse checks and new relative links pass.
- Application/test sources, dependency locks/policy, feature text, workflow, coverage floors,
  immutable reports and historical baseline documents match the base.
- Exact PR-head CI passes all three Stacks, parity and aggregate gate. Pages is verified after
  the owner's later merge. Native browser/Docker checks are unnecessary for documentation tooling.

## Delivery

Use `codex/sudoku-triage-08-doc-currency` from fetched main in the owned isolated project
checkout. Open one project PR; the owner merges. Keep the separate root worklist out of the
project commit and report its support-repository diff for its own publication flow. Preserve
shared checkouts and historical branches. TRIAGE-10/15, Python/C# tutor/generator parity,
dependency remediation and broader coverage-policy changes remain separately scoped.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Next item | TRIAGE-08 or separate outstanding candidates | Active claim/currency reconciliation | "proceed to next recommended item", GBrooks1970, 2026-10-07 |
| Evidence | Native measured inventory or source-declaration counting | Native counts with portable source fingerprints | Routine implementation within the approved bounded recommendation |
| Publication | Focused project PR and separate root state | Preserve repository boundaries | Project loop authorised; owner retains merge authority; root publication reported separately |

## Outcome

**Local completion snapshot, 2026-10-07, before commit/PR publication.** Delivered the planned
eight active-document repairs, the [native execution inventory](../.analysis/2026-10-07-component-execution-inventory.json)
and the two existing currency-script extensions. No product or workflow change was needed.

| Native lane | Captured outcome | Command duration |
|---|---|---:|
| TypeScript component | 113 passed; zero failures/skips | 33,109 ms |
| OpenAPI verification | Eight passed; lint passed; zero failures/skips | 43,206 ms |
| Python component | 30 passed; zero failures/skips | 9,288 ms |
| C# component | 28 passed; zero failures/skips | 36,554 ms |
| TypeScript BDD | 55 scenarios / 309 steps passed | 25,199 ms |
| Python full suite | 85 passed (55 BDD + 30 component) | 5,060 ms |
| C# Reqnroll | 55 passed; zero failures/skips | 18,296 ms |
| Logged currency controls | 37/37 mutations rejected with the intended diagnostic; isolated and LF-normalised baselines passed | 48,276 ms |

The first four runner durations were 31,638.1744 / 7,595.1412 / 3,490 / 356 ms; command timing
includes startup/tooling. BDD runner evidence reports 5.983 s for TypeScript, 2.26 s for Python
and a rounded 1 s for C#. Python has one pre-existing Gherkin deprecation warning.

Seven repository governance/parity checks passed, including the extended currency guard/controls,
13 dependency-policy controls and 21 CI-evidence controls. New relative links, PowerShell syntax,
scope, all 103 preserved canonical IDs and the native output/source hashes passed acceptance.
Two independent reviews checked documentation and tooling. Review caught and corrected selector
metadata, missing optional C# ancestor configuration locations and additive contradictory-count
handling before the final logged acceptance. These refined the planned fingerprints/guards;
they did not expand the approved item. An initial local backlog-check helper omitted two legacy
suffixed IDs; its parser was corrected and the final preservation/count check passed.

The committed inventory carries exact native commands, UTC starts, source SHA, six output hashes
and 29 source entries. LF-normalised fingerprints match across line endings. It remains a measured
snapshot: the guard checks collection currency and does not run the native suites itself. The guard
runs in CI; the isolated controls run through the existing local aggregate parity script.
Logs and timings remain ignored under `.results/triage-08/20261007/`. An earlier successful console
control run had no stopwatch/log; only the final captured run supplies the duration above.

Coverage percentages/floors, historical baseline documents, immutable reports, product/test sources,
locks/policy, features and workflow are unchanged. Build/lint/format, full coverage, live governed
audits and native Then mutation controls use all-Stack PR CI. Docker, native browser flows and the
historical loader/orchestrator mutation trial were not rerun. The exact braces exception still ends
12 October inclusive. TRIAGE-10/15 and the older handover/registry lifecycle refresh remain separate.
The root worklist is independent control state; project PR publication follows this validated
snapshot and the owner retains merge authority.
