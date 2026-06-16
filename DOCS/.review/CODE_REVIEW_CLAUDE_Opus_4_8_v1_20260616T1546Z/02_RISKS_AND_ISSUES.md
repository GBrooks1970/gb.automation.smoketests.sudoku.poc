# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

Findings are numbered high to low. There are no Critical or High findings; the suite, parity
gates, API, and governance are all in good order (see [ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md)).
The items below are credibility, standards, and hygiene issues. Each carries evidence, impact,
and a concrete remediation.

---

## Risk 1 (Low) - Root README mislabels the Python stack as "+ Flask"

**Description.** The "Design-First Approach" architecture diagram in the root README labels the
Python implementation `+ Flask`. The Python stack uses pytest-bdd and has no web framework; a
repository-wide search for `Flask` returns exactly one hit, this diagram. REST/web is a
DEMOAPP001-only **staged** surface (the capability matrix in the same README and in platform
spec section 6.1 marks Python REST/web as "roadmap").

**Evidence.**
- [README.md](../../../README.md) (line 37): the diagram's middle box reads "+ Flask" for the
  Python implementation (quoted here as ASCII; the source line uses box-drawing glyphs).
- `rg Flask` over the repo: only `README.md:37` matches.
- [README.md](../../../README.md) (lines 114-131): the Python section correctly states
  "pytest, pytest-bdd" with no Flask.
- [README.md](../../../README.md) (lines 160-170): capability matrix marks Python REST API and
  Web UI as roadmap, not present.

**Impact.** The first artefact a portfolio reviewer or new stack author reads contains a factual
inaccuracy about the toolchain. It contradicts the same document's own stack section and
capability matrix, and could mislead a learner into expecting a Flask service that does not exist.
Low severity because it is purely documentary and self-contradicted elsewhere in the file.

**Remediation.** Replace `+ Flask` with `+ pytest` (or `+ pytest-bdd`) so the diagram matches the
stack section. While editing, consider relabelling the generic three boxes to the actual stack
identifiers (TypeScript/Cucumber, Python/pytest-bdd, C#/SpecFlow) so the diagram and the prose
agree.

---

## Risk 2 (Low) - Root README understates the scenario count ("35+")

**Description.** The README's pedagogical section claims "35+ test scenarios". Every stack runs
**46 scenarios / 257 steps** (DEMOAPP001), and 46 scenarios each for DEMOAPP002 and DEMOAPP003,
as confirmed both by this review's local runs and by the backlog baseline.

**Evidence.**
- [README.md](../../../README.md) (line 241): `- **Gherkin Examples** - 35+ test scenarios demonstrating comprehensive coverage`
- Local run: DEMOAPP001 `npm test` -> `46 scenarios (46 passed) / 257 steps (257 passed)` (see
  [ANNEX/VALIDATION_LOG.md](ANNEX/VALIDATION_LOG.md)).
- [DOCS/.planning/backlog.md](../../.planning/backlog.md) (line 36): "DEMOAPP001: 46 scenarios /
  257 steps passing ... DEMOAPP002: 46 ... DEMOAPP003: 46".

**Impact.** Stale and self-deprecating: the suite is larger and stronger than the README admits.
A reviewer cross-checking the claim against a test run finds a mismatch, which erodes confidence
in the other (accurate) claims. Low severity.

**Remediation.** Update the line to "46 scenarios per stack (138 across all three)" or similar,
and consider deriving the number from the parity report rather than hard-coding it, so it cannot
drift again.

---

## Risk 3 (Low) - Root README is heavily non-ASCII against the project's own convention

**Description.** The project's governance (DR-020, Reference Architecture document-naming rules)
and the wider portfolio convention favour plain ASCII in authored artefacts; the review template
mandates ASCII for reviews. The root README is the one high-traffic document that departs from
this, using emoji status glyphs (check marks, warning signs, road, etc.) and box-drawing
characters in the architecture diagram.

**Evidence.**
- [README.md](../../../README.md) (lines 29-39): box-drawing diagram.
- [README.md](../../../README.md) (lines 93-170): emoji status markers and the matrix legend
  (`present`, `roadmap`, `not carried` are rendered as emoji).

**Impact.** Cosmetic and partly a matter of taste - emoji status tables read well on GitHub - but
it is an internal inconsistency: an agent or contributor who follows the README's style would
produce non-ASCII output that the project's other governance discourages. Low severity, flagged
for consistency rather than because the README is wrong to be readable.

**Remediation.** Either (a) accept the README as a deliberate exception and record that exception
in the naming-conventions doc so the inconsistency is intentional and documented, or (b) downgrade
the emoji to ASCII tokens (`[x]`, `[ ]`, `->`). Option (a) is the lower-effort, lower-risk choice
and keeps the README approachable.

---

## Risk 4 (Low) - Governance hygiene: out-of-order DR entries and a seconds-bearing date

**Description.** Two small governance-currency blemishes. First, in `decision-register.md` the
DR-035 entry is authored **before** the DR-034 entry, so the register is not in monotonic ID
order. Second, the root README's date metadata includes seconds, against the portfolio's
no-seconds timestamp convention.

**Evidence.**
- [decision-register.md](../../../decision-register.md): the "DR-035 - Validation layer
  boundaries" heading appears at an earlier line than the "DR-034 - Adopt v1.1 platform
  specification" heading (DR-035 at ~line 1832, DR-034 at ~line 1882). The register's own footer
  reads "Last entry: DR-035 (Accepted); DR-034 Accepted ... Next ID: DR-036."
- [README.md](../../../README.md) (line 9): `**Date:** 2026-01-30T20:00:00Z (core baseline); platform v1.1 accepted 2026-06-12 (DR-034)`.

**Impact.** Very low. An agent reading the register top-to-bottom encounters DR-035 before its
logically prior DR-034; both are Accepted and cross-reference each other, so there is no semantic
error, only ordering noise. The seconds-bearing date is a one-character convention drift.

**Remediation.** Reorder the two DR entries so IDs are monotonic (or add a one-line note at DR-035
explaining it was authored first), and drop the seconds from the README date. Neither needs a new
DR; both are editorial.

---

## Risk 5 (Informational) - CI has no aggregate required-check job; parity scripts are pwsh-only

**Description.** The CI workflow defines three independent stack jobs plus inline parity steps in
the DEMOAPP001 job. There is no single aggregate "all-green" job that branch protection can pin as
one required check, and the `.batch/*.ps1` parity scripts - though cross-platform via `pwsh` on
`ubuntu-latest` - require PowerShell to reproduce locally, which a pure-Node/Python/C# contributor
may not have.

**Evidence.**
- [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) (lines 11-109): three jobs
  (`demoapp001-typescript-cypress`, `demoapp002-python-pytest`, `demoapp003-csharp-specflow`); the
  three parity gates (lines 47-57) run only inside the DEMOAPP001 job via `shell: pwsh`.
- The parity gates therefore do not run if the DEMOAPP001 job is skipped or its earlier steps
  fail; they are not a standalone job.
- Action pins are current (SUD-08): `checkout@v5`, `setup-node@v5`, `setup-python@v6`,
  `setup-dotnet@v5`, `upload-artifact@v6` (lines 18-99).

**Impact.** Informational. Today the design is fine: `pull_request` makes all three jobs required
status checks, and the parity gates run on every PR. The two observations are forward-looking: (1)
without an aggregate job, branch protection must list all three jobs by name and keep them in sync
with any future renames; (2) local parity reproduction is coupled to having `pwsh` installed,
which the README's repository-level commands already assume.

**Remediation.** Optional. Consider (a) a lightweight `gate` job that `needs: [all three]` and
serves as the single required check, and (b) noting the `pwsh` prerequisite in the contributor
section of the README (it is currently only implied by the PowerShell command blocks). Neither is
required for current correctness.

---

## Deferred / quarantined coverage - assessment

The backlog names three `Open` items, all `Future` priority and all genuinely unimplemented
product ideas, not quarantined or silently-skipped tests:

- BACKLOG-014 Advanced Solving Techniques, BACKLOG-015 Interactive Sudoku Tutor, BACKLOG-016
  Puzzle Generator ([DOCS/.planning/backlog.md](../../.planning/backlog.md) lines 122-124).

There are **no `@pending` or skipped scenarios** in the canonical feature or any stack copy (the
solver's documented `STUCK_ON_ADVANCED_LOGIC` outcome is asserted as a *behaviour*, not used to
skip coverage - see the "Detect when puzzle requires advanced techniques" and "Handle empty grid
appropriately" scenarios). The `STUCK_ON_ADVANCED_LOGIC` ceiling (no Naked Pairs / X-Wing /
backtracking) is correctly documented as a design boundary in both the README and CLAUDE.md, not
hidden. The prior-review remediation stream (SUD-01..08) is fully closed; this review independently
re-confirms the SUD-01 early-solved-grid guard, SUD-03 deep-copy snapshots, SUD-04 validation
boundaries + OpenAPI, SUD-05 capability matrix, and SUD-06 C# loader documentation are all present
and consistent. No deferred-coverage risk.

---

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1546Z.md) | [Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_Sudoku_Solver_POC.md)
