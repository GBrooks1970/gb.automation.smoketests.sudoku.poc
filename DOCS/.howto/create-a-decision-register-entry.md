# How To: Create a Decision Register Entry

**Difficulty:** Intermediate
**Time to complete:** 15–20 minutes
**Last verified:** 2026-05-17

---

## What you will achieve

By the end of this guide you will have added a correctly structured Decision Register (DR) entry to `decision-register.md`, with all five mandatory fields complete and the ID correctly sequenced.

---

## Before you start

**You need:**
- [ ] A clear structural or process decision that needs to be recorded
- [ ] The `DOCS/.templates/decision-record.template.md` template

**You should know:**
- What makes a decision "structural" (see Section 1 below)
- That decisions are **immutable once Accepted** — you cannot edit the Context, Decision, or Alternatives fields after acceptance

---

## Section 1: When does a decision need a DR entry?

A Decision Register entry is required when you make a choice that affects:

| Category | Examples |
|----------|---------|
| **Directory or file naming conventions** | Adopting kebab-case for docs (DR-020), dot-prefix for DOCS subdirs (DR-001) |
| **Technology choices** | Choosing Cucumber.js + Serenity/JS (DR-002), TypeScript as the Stack language |
| **Architectural patterns** | Screenplay pattern memory model (DR-015), @util surface for DEMOAPP001 (DR-003) |
| **Governance processes** | Code review directory location (DR-014), DOCS path compatibility strategy (DR-013) |
| **Any rule stated in CLAUDE.md or design docs** | The DR is the authoritative source; CLAUDE.md just restates it |

**A DR is NOT required for:**
- Adding a puzzle to `puzzles.json`
- Adding a Gherkin scenario (unless it introduces a new Memory key or step contract change)
- Renaming a variable within a function
- Updating documentation prose

**If in doubt:** if someone could ask "why did we do it that way?" and the answer would shape future decisions, write a DR.

---

## Steps

### Step 1: Find the next available DR ID

Open [`decision-register.md`](../../decision-register.md) and scroll to the very bottom. The footer line tells you the next ID:

```
*Last entry: DR-020. Next ID: DR-021.*
```

Your entry will be `DR-021` (or whatever the footer currently shows).

---

### Step 2: Copy the template

Open [`DOCS/.templates/decision-record.template.md`](../.templates/decision-record.template.md).

The template body (inside the fenced code block) is the entry format. Do not copy the template instructions — only the content inside the ` ```markdown ``` ` fence.

---

### Step 3: Fill in the five mandatory fields

Paste the template into `decision-register.md` immediately before the `## Proposed Decisions` section (which must always remain the last section before Superseded/Deprecated). Fill in every `[REQUIRED]` field:

**`### Context [REQUIRED]`**

2–5 sentences of prose (no bullet lists). Answer: *Why did this need to be decided? What would happen without a decision?*

```markdown
### Context [REQUIRED]

The project's implementation logs were stored in DOCS/.implementation/ under
the DR-001 dot-prefix convention. Reference Architecture v1.3 §10.8 requires
the path DOCS/implementation-logs/ with YYYY-MM-DD_slug.md naming. DR-013
explicitly deferred the path decision to MIG-09. Without a formal decision,
the two paths would continue to coexist and confuse future agents.
```

**`### Decision [REQUIRED]`**

1–3 sentences. Start with an active verb. State exactly what was chosen.

```markdown
### Decision [REQUIRED]

Make DOCS/implementation-logs/ the authoritative implementation-log directory.
Move existing logs from DOCS/.implementation/ and rename them to the v1.3
YYYY-MM-DD_short-session-topic.md format.
```

**`### Status [REQUIRED]`**

Set to `Proposed` initially. Change to `Accepted` only after the work is validated. Include the date.

```markdown
### Status [REQUIRED]

`Accepted` — 2026-05-16
```

**`### Consequences [REQUIRED]`**

List intended outcomes AND known trade-offs. Be honest about costs.

```markdown
### Consequences [REQUIRED]

**Outcomes:**
- DOCS/implementation-logs/ is the single authoritative location.
- v1.3 §10.8 path and naming requirements are fully satisfied.

**Trade-offs:**
- DOCS/.implementation/ remains as an archive, creating a second directory.
- Existing links to the old path are stale but still resolve to the archive.
```

**`### Alternatives Considered [REQUIRED]`**

At least one alternative. Say specifically why it was rejected — not just "it was worse."

```markdown
### Alternatives Considered [REQUIRED]

**Alternative: Keep DOCS/.implementation/ as authoritative; document naming only**
- Description: Rename files in place without changing the directory.
- Rejected because: DR-013 explicitly created the compatibility bridge path to
  be resolved by MIG-09. Keeping the non-literal path would leave a permanent
  divergence.
```

---

### Step 4: Add the entry to decision-register.md

Open `decision-register.md`.

Find the `## Proposed Decisions` section near the bottom. **Insert your new entry immediately above this section**, after the last `---` separator in the Accepted Decisions section:

```markdown
---

## DR-021 — [Short title, 5–10 words]

**Date:** 2026-05-17
**Status:** Accepted — 2026-05-17

### Context [REQUIRED]
...

### Decision [REQUIRED]
...

### Status [REQUIRED]
`Accepted` — 2026-05-17

### Consequences [REQUIRED]
...

### Alternatives Considered [REQUIRED]
...

### Related Decisions
- DR-001 — [how it relates]

---
```

---

### Step 5: Update the footer

Scroll to the very last line of `decision-register.md` and update it:

```
*Last entry: DR-021. Next ID: DR-022.*
```

---

### Step 6: Update CLAUDE.md if the decision affects a rule stated there

If your decision changes or adds a rule that appears in CLAUDE.md (parity rules, risk register, or architecture baseline), update those sections too. The Decision Register is authoritative; CLAUDE.md is a restatement that must stay in sync.

---

### Step 7: If the decision supersedes an earlier one

Add `**Supersedes:** DR-[NNN]` to your new entry's header (just below the date/status lines).

Then update the superseded entry to add:

```markdown
**Superseded by:** DR-[NNN] (2026-05-17) — [brief reason]
```

Decisions are immutable — only the `Status` and forward/back reference lines may change after acceptance.

---

## Verify it worked

- [ ] `decision-register.md` footer shows the updated `Last entry` and `Next ID`
- [ ] Your entry has all five `[REQUIRED]` fields filled — no placeholder text remains
- [ ] Status is `Accepted` with a date
- [ ] If the decision supersedes another, both entries carry back/forward references
- [ ] If CLAUDE.md restates the rule, it reflects the new decision

---

## Common problems

### I am not sure whether this decision is structural enough for a DR

**Guideline:** If the decision would cause a parity failure, a broken link, or a confused future contributor if it were reversed without trace, write the DR.

When in doubt, write a lightweight DR. A short entry is always better than a missing one.

---

### Two entries have the same ID

**Cause:** Two changes were made in parallel, or the footer was not updated after a prior entry.
**Fix:** Renumber the later entry to the next available ID and update the footer.

---

### The Alternatives Considered section is thin

**Cause:** The decision seemed obvious, so no alternatives were formally considered.
**Fix:** Even if you only considered one approach, write: "Alternative: [the obvious alternative] — Rejected because: [specific reason]." Documenting that you considered the alternative prevents future contributors from re-raising it as if it were an open question.

---

## What to do next

- If your decision resolves a backlog item, mark that item `Resolved` in `DOCS/.planning/backlog.md` and add a reference to the DR in the resolved items table.
- If your decision changes a naming convention, update `DOCS/.design/naming-conventions.md` to reflect the new rule.
