# Sudoku Solver POC — Public-Readiness Audit

**Date:** 2026-07-14

**Portfolio item:** P-07

**Baseline:** private repository `GBrooks1970/gb.automation.smoketests.sudoku.poc`, `main` at
`6aeb748`

**Scope:** current tree, all Git refs/history, GitHub PR/issue metadata, credentials/test data,
licence, generated/large artefacts, README claims and links, CI safety, dependency
health/licences, and clean multi-stack bootstrap

**Visibility changed:** **No**

## Decision

**CONDITIONAL GO for publication; NO-GO for a visibility change until the owner clears both gates
below.** The technical and legal repository blockers found by this audit are remediated on the
audit branch, but publication remains a separate action.

1. **Personal-email exposure:** four unique author/committer addresses occur in history across
   `users.noreply.github.com`, `github.com`, `anthropic.com`, and `gmail.com`. One address is a
   non-noreply personal Gmail address. Values are deliberately not copied into this report, but
   raw history would become public. The owner must explicitly accept that exposure or separately
   authorise a history rewrite. This audit does not rewrite published history.
2. **Visibility approval:** the owner must explicitly name
   `GBrooks1970/gb.automation.smoketests.sudoku.poc` and approve making it public. Merging the
   audit/remediation PR is not that approval.

Calculator's audit and decision are independent. After approval, the publication step must make
only this repository public and execute the [Publication runbook](#publication-runbook).

## Evidence Summary

| Area | Evidence | Result |
|---|---|---|
| Current tree | Baseline: 348 tracked files. Strong signature scans covered private-key headers, AWS/GitHub/OpenAI/Slack tokens, and JWTs. Ignore rules and tracked paths were inspected for environments, dependency/build output, reports, caches, logs, keys, and generated code. | **Pass after remediation:** zero real credential matches; temporary/build/report paths are ignored; the tracked generated Reqnroll/SpecFlow code-behind was removed. |
| Git history | All 192 baseline commits and 11 branch refs were scanned. Eight apparent OpenAI-token matches all resolve to old `#risk-*` Markdown anchors, not credentials. Filename and object inventories covered every ref. | **Conditional:** zero real secret/sensitive-filename hits and zero blobs ≥1 MiB; largest blob 171,216 bytes. One personal Gmail address requires the owner decision above. |
| GitHub metadata | Thirty PR/issue records, with zero issue comments, review comments, commit comments, or reviews, were scanned for the same strong signatures. | **Pass:** zero matches. |
| Test data and endpoints | Source, puzzle fixtures, feature examples, API configuration, Docker configuration, and agent settings were inspected. The Express SUT binds locally; fixtures contain deterministic Sudoku grids and descriptive names. | **Pass:** no credentials, personal/production data, live third-party SUT, or scanning target. |
| Licence | Canonical `LICENSE`, package/project metadata, README boundary, and GitHub REST licence detection were cross-checked. | **Pass:** GitHub identifies ISC; original material is aligned across TypeScript, Python, and C#. Installed dependency metadata has no unknown or strong-copyleft flags. |
| Generated/large artefacts | Tracked/history names, ignore rules, LFS/submodules, Git object sizes, and build behaviour were checked. | **Pass after remediation:** no submodules, LFS objects, archives, build/report output, or ≥1 MiB history blobs. BDD code-behind is now generated under ignored `obj/`. |
| README and claims | Stack/runtime names, repository tree, test counts, capability matrix, commands, internal targets, and licence/publication language were checked against code and validation. | **Pass after remediation:** Node 24, Python 3.13, Reqnroll/.NET 10, locked restore commands, structure, and private/publication status are explicit. |
| CI safety | Triggers, workflow permissions, expressions, actions, checkout credentials, dependency inputs, job isolation, aggregate gate, and retention were inspected. The prior default-branch run [29331095955](https://github.com/GBrooks1970/gb.automation.smoketests.sudoku.poc/actions/runs/29331095955) passed at `6aeb748`. | **Pass after remediation:** PR/default-branch/manual only, `contents: read`, current action majors, no workflow secrets, persisted checkout credentials disabled, seven-day validation artefacts, and a fan-in gate. |
| Dependencies | Baseline: one high dev-only npm advisory; Python audit zero; NuGet audit zero but SpecFlow was EOL and .NET 8 near end of support. Current official baselines and direct dependencies were rechecked. | **Pass after remediation:** npm/Python/NuGet scans report zero known vulnerabilities; Node 24 LTS; Reqnroll 3.3.4 and .NET 10 LTS; npm, Python constraints, and NuGet locks committed. |
| Dependency licences | The resolved npm lock contains 377 packages declaring MIT/ISC/Apache/BSD/BlueOak/CC attribution-family terms with none unknown. The Python environment contains 15 third-party distributions under MIT/BSD/Apache/PSF terms. The Reqnroll test graph contains 23 NuGet packages: 20 MIT and 3 BSD-3-Clause. | **Pass:** no unknown or strong-copyleft dependency licence was found. Third-party terms remain independent of the root ISC licence. |
| Bootstrap | A disposable authenticated GitHub clone of this audit branch ran locked TypeScript, Python, and .NET 10 restores; 46 scenarios per Stack (138 total), API integration, build/lint/format, three parity gates, vulnerability scans, and reporting-only benchmarks. The tree remained clean. | **Pass:** application/test/parity bootstrap is reproducible. Anonymous repository cloning remains a mandatory post-publication check. |

## Remediation Included With This Audit

- moved DEMOAPP001 from EOL Node 20 to Node 24 LTS in package metadata, CI, and containers;
- refreshed compatible npm dependencies, clearing the only advisory, and marked the demo package
  private to prevent accidental npm publication;
- committed Python test constraints and NuGet lockfiles, then used locked/constrained restore paths
  in documentation, CI, and containers;
- migrated DEMOAPP003 from discontinued SpecFlow/.NET 8 to Reqnroll 3.3.4, NUnit 4, and .NET 10
  LTS; DR-036 retains the existing Stack ID/path as an explicit legacy integration identifier;
- moved Reqnroll code-behind into ignored intermediate output and removed the tracked generated
  `.feature.cs` file;
- updated GitHub actions where newer majors exist, enforced read-only workflow permissions,
  disabled persisted checkout credentials, and made artefact retention explicitly seven days;
- applied the configured TypeScript formatter and reconciled the July review, backlog, changelog,
  decision-register metadata, repository map, active runtime claims, and restore instructions.

## Accepted or Non-Blocking Conditions

- BACKLOG-051's stronger ordering/no-execution assertions and BACKLOG-014..016's future product
  ideas remain useful project work, not publication blockers.
- `DEMOAPP003_CSHARP_SPECFLOW`, its directory, and solution name remain as stable legacy
  identifiers. Active docs state that the runtime is Reqnroll; DR-036 owns that deliberate trade-off.
- The pinned Python graph retains `gherkin-official` 29 because pytest-bdd 8 requires `<30`; its
  Python 3.13 deprecation warning is upstream and non-failing.
- Direct NuGet packages are current. Registry tools report newer versions for some transitive
  packages selected by Reqnroll/NUnit; those are not independently overridden without an owning
  direct dependency or advisory.
- Docker Compose configuration parses, but this audit environment's Docker Linux engine was not
  running, so container image builds were not repeated. All three equivalent host-toolchain paths
  and reporting-only benchmarks passed; prior project governance already records BACKLOG-010 as
  resolved.
- There are no tags/releases, branch protection, or repository rulesets. None blocks source
  publication. A public ruleset requiring `Gate (all stacks green)`, plus secret scanning and push
  protection where available, is recommended during publication.

## Publication Runbook

Do not run this section without explicit owner approval for this repository and a recorded decision
on the historical email exposure.

1. Confirm the audit/remediation PR is merged and `main` CI is green.
2. Record the owner's email-exposure decision and explicit Sudoku visibility approval in the
   portfolio P-07 close-out.
3. Make **only** `GBrooks1970/gb.automation.smoketests.sudoku.poc` public.
4. From an unauthenticated environment, verify repository/README/licence visibility, clone the
   repository, and repeat the documented Node 24, Python 3.13, .NET 10, and parity bootstrap.
5. Verify Actions history/logs and the ISC licence are anonymously visible; verify the workflow
   remains read-only for fork pull requests.
6. Configure/review a `main` ruleset requiring `Gate (all stacks green)` and enable GitHub secret
   scanning and push protection where the public-repository settings offer them.
7. Only after those checks pass, add Sudoku's repository/CI links to the public landing card and
   close P-07 at portfolio level. Do not infer or change Calculator visibility.

## Audit Limitations

- Pattern scanning reduces credential risk but cannot prove arbitrary prose contains no sensitive
  fact. Manual inspection was combined with scans and matched values were not copied here.
- Anonymous access cannot be tested while the repository is private. The authenticated clean-clone
  result validates the committed layout; the post-public anonymous repeat is mandatory.
- The Dockerfiles and Compose model were statically/configuration validated, but container builds
  require a running Linux engine and were not repeated in this audit environment.
- npm, PyPI, NuGet, GitHub action, Node, .NET, and advisory state is time-sensitive; this report
  records evidence as of 2026-07-14.
