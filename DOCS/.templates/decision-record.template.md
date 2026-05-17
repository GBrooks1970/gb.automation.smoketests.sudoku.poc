# TEMPLATE — Decision Record

**Intended audience:** Any engineer or AI agent recording a structural or process decision.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `decision-register.md` rules — see §10.6 of `reference-architecture.md`

---

## How to Use This Template

1. Copy this file. Do **not** edit it in place.
2. Assign the next sequential `DR-NNN` ID from `decision-register.md`.
3. Fill in all five `[REQUIRED]` fields. Leave no field empty.
4. Set **Status** to `Proposed`. Change to `Accepted` only after review.
5. Append the completed entry to `decision-register.md` under the correct status section.
6. If this decision supersedes an earlier one, update the earlier entry's Status to `Superseded` and add a forward reference.

> **Immutability rule:** Once `Accepted`, the Context, Decision, and Alternatives fields are frozen. Only Status and the forward/back reference fields may change after acceptance.

---

```markdown
## DR-[NNN] — [Short title, 5–10 words]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded | Deprecated
**Supersedes:** DR-[NNN] (if applicable — delete line if not)
**Superseded by:** DR-[NNN] (populated only when this entry is superseded — delete line if not)

### Context [REQUIRED]

<!-- The situation, constraint, or question that made a decision necessary.
     Answer: Why did this need to be decided? What would happen without a decision?
     2–5 sentences. No bullet lists — write prose. -->

### Decision [REQUIRED]

<!-- The choice that was made, stated plainly and unambiguously.
     Answer: What exactly was decided?
     Start with an active verb: "Use ...", "Adopt ...", "Defer ...", "Reject ..."
     1–3 sentences. -->

### Status [REQUIRED]

`Accepted` — [date accepted, e.g. 2026-05-14]

<!-- Change this field as the decision moves through its lifecycle.
     Add a note when status changes: "Superseded 2026-08-01 by DR-042." -->

### Consequences [REQUIRED]

<!-- What becomes true as a result of this decision?
     Include BOTH intended outcomes and known trade-offs.
     Use bullet points. Be honest about costs. -->

**Outcomes:**
- [What this enables or improves]

**Trade-offs:**
- [What this makes harder, slower, or more complex]

**Compliance note (if applicable):**
- [How this interacts with the Reference Architecture — aligned / documented divergence]

### Alternatives Considered [REQUIRED]

<!-- What was evaluated and why it was not chosen.
     At least one alternative. If none were formally considered, say so and explain why. -->

**Alternative: [Name]**
- Description: [What it would have meant]
- Rejected because: [Specific reason — not just "it was worse"]

**Alternative: [Name]**
- Description: [What it would have meant]
- Rejected because: [Specific reason]

### Related Decisions

- [DR-NNN: title] — [how it relates]

---
```
