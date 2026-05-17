# TEMPLATE — Backlog

**Intended audience:** Project leads, developers, AI agents managing work items.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `reference-architecture.md` §10.1

---

## How to Use This Template

- Replace every `[REQUIRED]` placeholder before publishing.
- Every work item MUST identify: affected Stack(s), nature of the gap, and priority.
- Use the status values exactly: `Open`, `In Progress`, `Resolved`.
- `Resolved` items MUST NOT be deleted — retain them as a record.
- Any item that resolves into a structural choice MUST produce a `DECISION_REGISTER.md` entry before it is marked `Resolved`.
- If a gap between Stacks exists and is not listed here, it is a defect, not a decision.

---

```markdown
# Backlog

**Project:** [Project name] [REQUIRED]
**Last Updated:** YYYY-MM-DDTHH:MMZ [REQUIRED]
**Governed by:** [Reference document and section] [REQUIRED]
**Authoritative path:** [path/to/backlog.md] [REQUIRED]
**Compatibility path:** [path/to/bridge.md or N/A] [REQUIRED]
**Status:** Active [REQUIRED]

---

## Purpose

[Describe what work this backlog tracks and which Stacks or product surfaces it governs.] [REQUIRED]

---

## Summary

| Status | Count |
|--------|-------|
| Open | [n] [REQUIRED] |
| In Progress | [n] [REQUIRED] |
| Resolved | [n] [REQUIRED] |
| **Total** | **[n]** [REQUIRED] |

---

## Migration Items

| ID | Title | Stack(s) | Nature of Gap | Priority | Status | Decision Record |
|----|-------|----------|---------------|----------|--------|-----------------|
| [MIG-NN] [REQUIRED] | [Title] [REQUIRED] | [Stack name or All] [REQUIRED] | [Gap type] [REQUIRED] | High / Medium / Low [REQUIRED] | Open / In Progress / Resolved [REQUIRED] | [DR-NNN or Pending or None required] [REQUIRED] |

---

## Active Product and Technical Work

| ID | Title | Stack(s) | Nature of Gap | Priority | Status |
|----|-------|----------|---------------|----------|--------|
| [ID] [REQUIRED] | [Title] [REQUIRED] | [Stack name or All] [REQUIRED] | [Parity gap / Tech debt / Feature / Infrastructure] [REQUIRED] | High / Medium / Low / Future [REQUIRED] | Open / In Progress [REQUIRED] |

---

## Active Item Details

### [ID]: [Title] [REQUIRED]

**Priority:** High / Medium / Low / Future [REQUIRED]
**Status:** Open / In Progress [REQUIRED]
**Stack(s):** [Stack name or All] [REQUIRED]
**Nature of Gap:** [Parity gap / Tech debt / Feature / Infrastructure] [REQUIRED]

[Brief context and implementation notes.] [REQUIRED]

Acceptance criteria:

- [ ] [Observable completion criterion] [REQUIRED]
- [ ] [Validation command or evidence required before closure] [REQUIRED]

---

## Resolved Items

| ID | Title | Stack(s) | Resolved | Notes |
|----|-------|----------|----------|-------|
| [ID] [REQUIRED] | [Title] [REQUIRED] | [Stack name or All] [REQUIRED] | YYYY-MM-DD [REQUIRED] | [Decision record, validation evidence, or residual tracking note] [REQUIRED] |

---

## Sprint Roadmap

| Sprint | Dates | Focus | Key Items | Status |
|--------|-------|-------|-----------|--------|
| [Sprint] [REQUIRED] | [date range] [REQUIRED] | [Theme] [REQUIRED] | [IDs] [REQUIRED] | Open / In Progress / Resolved [REQUIRED] |

---

## Maintenance Rules

1. Keep item statuses exactly `Open`, `In Progress`, or `Resolved`. [REQUIRED]
2. Update the summary counts whenever an item status changes. [REQUIRED]
3. Do not delete resolved items. [REQUIRED]
4. Add a Decision Register entry before closing any item that resolves into a structural choice. [REQUIRED]

---

**Next Review Date:** YYYY-MM-DD [REQUIRED]
**Backlog Owner:** [Role or team] [REQUIRED]
```
