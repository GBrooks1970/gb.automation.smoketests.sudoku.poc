# TEMPLATE -- Comprehensive Repository Structural Review

**Intended audience:** The reviewer (AI or human) conducting a full structural audit of the repository against the current Reference Architecture.
**Template version:** 1.0 (2026-05-18)
**Governed by:** `reference-architecture.md` v1.14 §10.7
**Produces:** `DOCS/.review/YYYY-MM-DD_repository-structural-review.md`

> This template governs single-file comprehensive structural reviews. For multi-file bundle reviews
> (executive summary, risks, recommendations as separate files), use `code-review.template.md`.
>
> Review outputs are **read-only** once written. Action items raised MUST be tracked in
> `DOCS/.planning/backlog.md` or `decision-register.md` before closing the session.
> Future reviews supersede, not edit, prior reviews.

---

## How to Use This Template

1. Name the output file: `DOCS/.review/YYYY-MM-DD_repository-structural-review.md`
   - Use today's UTC date.
   - Use `repository-structural-review` as the slug unless the review is scoped to a specific area,
     in which case use a descriptive slug (e.g. `YYYY-MM-DD_screenplay-layer-review.md`).
2. Read these documents before writing: `DOCS/reference-architecture.md` (current version),
   `decision-register.md`, `DOCS/.planning/backlog.md`, and the CLAUDE.md.
3. Review the repository as if encountering it for the first time. Do not carry assumptions from
   prior reviews into the current one.
4. Fill in every `[REQUIRED]` field. Remove `[REQUIRED]` markers from the output.
5. Populate the compliance table from the current RA version. Add or remove rows to match the
   current RA section list.
6. After writing, raise new backlog items for every Risk-level finding that is not already tracked.

---

## Output File Structure

```
DOCS/.review/
  YYYY-MM-DD_repository-structural-review.md   # This review (single file)
```

---

## Header Block [REQUIRED]

```markdown
# Comprehensive Structural Review

**Project:** `[repository name]` [REQUIRED]
**Reviewer:** AI assistant (CLAUDE [model]) [REQUIRED]
**Review Date:** YYYY-MM-DD [REQUIRED]
**Reference Architecture:** v[N.NN] (accepted YYYY-MM-DD) [REQUIRED]
**Active Stack(s):** `[STACK_NAME]` [REQUIRED]
**Format:** GitHub-flavored Markdown
```

---

## Table of Contents [REQUIRED]

```markdown
## Table of Contents

1. [First-Pass Structural Observations](#first-pass-structural-observations)
2. [Risks and Issues (High to Low)](#risks-and-issues-high-to-low)
3. [Overall Summary](#overall-summary)
4. [Future Work](#future-work)
```

---

## Section 1 -- First-Pass Structural Observations [REQUIRED]

Write this section as if encountering the repository for the first time.
Do not reference prior review sessions, prior findings, or known history.
State what is visible in the current state of the code and documentation.

```markdown
## First-Pass Structural Observations

### What Works Well

[3-8 bullet points. Each bullet covers one specific positive structural property.
Be precise: cite the file, layer, or rule that is correctly implemented.
Avoid generic praise. Examples of good bullets:
- "The five-layer RA model is implemented end-to-end. Steps are thin..."
- "Memory key constants in [memory-keys.ts](path) satisfy the name=value identity rule..."
Minimum 3 bullets. Maximum 8.] [REQUIRED]

### What Raises Concern

[3-8 bullet points. Each bullet identifies one structural concern visible from first inspection.
Do not enumerate every risk here -- save detail for Section 2.
This section flags patterns, not instances. Examples:
- "The Ability class has grown beyond its RA-specified scope..."
- "No CI/CD pipeline exists..."
Minimum 3 bullets. Maximum 8.] [REQUIRED]
```

---

## Section 2 -- Risks and Issues (High to Low) [REQUIRED]

Number risks from highest to lowest severity. Use one of: Critical, High, Medium, Low.
Every risk MUST have all four subsections. Do not omit any.

```markdown
## Risks and Issues (High to Low)

---

### Risk [N] -- [Short title] ([Severity: Critical | High | Medium | Low])

**Nature:** [What is the structural problem? Cite RA section or DR entry if applicable.
Include file paths and line numbers where the evidence is visible.] [REQUIRED]

**Current state:** [Backlog ID and status, or "No backlog item -- see Required refactor below."] [REQUIRED]

**Impact:** [What happens if this is not addressed? Quantify blast radius where possible.
State whether the impact is immediate or latent.] [REQUIRED]

**Required refactor:** [Concrete remediation steps. Include code snippets or commands where
they make the action unambiguous. Reference the RA section or DR entry that the fix satisfies.] [REQUIRED]

---
```

**Severity guidance:**

| Severity | Definition |
|----------|------------|
| Critical | MUST-level RA requirement violated with immediate risk of regression or merge failure |
| High | MUST-level RA requirement violated with latent risk, or structural pattern that will block the next planned milestone |
| Medium | SHOULD-level RA requirement or a compliance gap that is tracked but not resolved |
| Low | Minor governance inconsistency, naming violation, or pattern-level concern with low blast radius |

**Minimum risk count:** 3. There is no maximum, but risks below Low severity should be noted in
Section 3 (Summary) rather than enumerated here.

---

## Section 3 -- Overall Summary [REQUIRED]

```markdown
## Overall Summary

### Design and Structural Quality

**Strengths:** [3-5 bullets on the highest-value structural properties. These should be the
top findings from Section 1, elevated into a concise assessment.] [REQUIRED]

**Weaknesses:** [3-5 bullets on the most significant structural deficits. These should correspond
to the Critical and High risks from Section 2.] [REQUIRED]

### Main Highlights

[3-5 bullet points on the most important single facts about the current project state.
Examples: scenario count, RA version, most actionable open item, most visible governance artefact.
These should be the points a stakeholder would want to know after a two-minute briefing.] [REQUIRED]

### Compliance to Reference Architecture v[N.NN] [REQUIRED]

[Reproduce the compliance table below. Populate every row for the current RA version.
Add rows for any RA sections not listed if the current RA version includes them.
Remove rows for RA sections that do not apply to this project's surface types.]

| RA Section | Requirement | Status | Notes |
|------------|-------------|--------|-------|
| §4 Directory structure | Required layout | [Compliant / Non-compliant / Partial / N/A] | |
| §4.4 Shared packages | Optional, rules if used | | |
| §5.1 Canonical feature store | Single source of truth | | |
| §5.2 Feature distribution | Stack copies with local tags | | |
| §5.3 Tag taxonomy | Surface and stack tags | | |
| §5.5 Feature change governance | Breaking change gate | | |
| §5.6 Test data management | Stack-local data, read-only | | |
| §6.0 `@util` surface contract | In-process, deterministic | | |
| §8.1 Memory key parity | Name equals value | | |
| §8.2 Step definition shape | Parameterised | | |
| §8.4 Parity verification | Automated for criteria 1-3 | | |
| §9.2 Metrics collection | Two formats, timestamped | | |
| §9.3 Results archival | Retention policy | | |
| §9.4 CI/CD pipeline gates | Four required gates | | |
| §10.1 Repo-level documents | README, CHANGELOG, backlog, DR | | |
| §10.2 Stack-level docs | 4 required docs per Stack | | |
| §10.3 Architecture documents | 4 cross-cutting specs | | |
| §10.4 AI agent instruction file | Required sections present | | |
| §10.5 Template mandate | All templates present | | |
| §10.6 Decision register | 5-field entries, immutable | | |
| §10.7 Code review directory | `DOCS/.review/` | | |
| §10.8 Implementation logs | Under `DOCS/.implementation-logs/` | | |
| §10.9 Naming conventions | `DOCS/.design/naming-conventions.md` | | |

**Overall compliance grade:** [High / Medium / Low] [REQUIRED]
[One sentence stating the number of MUST-level gaps and whether they are tracked.] [REQUIRED]

### Pedagogical Content and Value [REQUIRED]

[3-5 bullets assessing the repository's value as a learning resource.
Consider: clarity of the Screenplay layer for a new reader, quality of the decision register
as a tutorial in decision-making, suitability of the subject application as a teaching vehicle,
presence and quality of living documentation, and any areas that teach incorrect patterns.
Include a Limitation bullet if any area actively teaches the wrong lesson.] [REQUIRED]
```

---

## Section 4 -- Future Work [REQUIRED]

```markdown
## Future Work

### Potential Future Work

[Organise by time horizon: Near-term (current and next sprint), Medium-term (2-3 sprints),
Long-term (roadmap). For each item, cite the backlog ID if one exists. Summarise the work
in one sentence -- do not reproduce full acceptance criteria here.] [REQUIRED]

**Near-term:**
- [BACKLOG-NNN -- Title. One sentence description.] [REQUIRED -- at least 2 items]

**Medium-term:**
- [BACKLOG-NNN -- Title. One sentence description.] [REQUIRED -- at least 2 items]

**Long-term:**
- [BACKLOG-NNN -- Title. One sentence description.] [REQUIRED -- at least 1 item]

### Potential Legacy Debt Work

[List structural debts that will compound over time if not addressed.
Each item should: name the debt, state why it compounds (e.g. "before second Stack onboarding"),
and reference the Risk number from Section 2 if applicable.
Minimum 3 items.] [REQUIRED]
```

---

## Closing Note [REQUIRED]

```markdown
*Review produced against Reference Architecture v[N.NN], accepted YYYY-MM-DD.
All section references are to `DOCS/reference-architecture.md`.
Risks are numbered in order of highest-to-lowest severity.
Remediation steps provided for each risk are normative suggestions; those citing a MUST-level
RA clause are compliance requirements.*
```

---

## Reviewer Attribution

**Format:** `AI assistant (CLAUDE [model])` or `[First name, Role]`
**Output format:** Markdown with GitHub-flavored extensions; fenced code blocks with language identifiers; ASCII only; no emojis; dash (`-`) for bullet lists.

---

## Comparability Rules

To ensure future reviews are directly comparable to this one and to prior reviews:

1. **Section order is fixed.** Sections 1-4 MUST appear in the order defined here. Do not add, remove, or reorder sections.
2. **Compliance table columns are fixed.** The four columns (`RA Section`, `Requirement`, `Status`, `Notes`) MUST be present. Status values MUST be one of: `Compliant`, `Non-compliant`, `Partial`, `Not applicable`.
3. **Risk severity labels are fixed.** Use exactly: `Critical`, `High`, `Medium`, `Low`. Do not introduce new labels.
4. **Risk subsection names are fixed.** Each risk MUST have exactly: `Nature`, `Current state`, `Impact`, `Required refactor`.
5. **Backlog IDs MUST be cited** for every risk that has a corresponding backlog item. If no backlog item exists, state "No backlog item" and create one before closing the review session.
6. **The header block fields are fixed.** All six header fields MUST be present with their exact labels.
7. **Pedagogical assessment is REQUIRED** in every review. This is the primary differentiator of this review format from a standard code review.
