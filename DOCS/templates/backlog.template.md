# TEMPLATE — Backlog

**Intended audience:** Project leads, developers, AI agents managing work items.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.1

---

## How to Use This Template

- The root `BACKLOG.md` is the single authoritative backlog index.
- Every work item MUST identify: affected Stack(s), nature of the gap, and priority.
- Use the status values exactly: `Open`, `In Progress`, `Resolved`.
- `Resolved` items MUST NOT be deleted — retain them as a record.
- Any item that resolves into a structural choice MUST produce a `DECISION_REGISTER.md` entry before it is marked `Resolved`.
- If a gap between Stacks exists and is not listed here, it is a defect, not a decision.

---

```markdown
# Backlog

**Project:** [Project name]
**Last Updated:** YYYY-MM-DDTHH:MMZ
**Status:** Active

---

## Summary

| Metric | Count |
|--------|-------|
| Open | [n] |
| In Progress | [n] |
| Resolved (this sprint) | [n] |

---

## Current Sprint — [Sprint Name] ([date range])

**Sprint Goal:** [One sentence]

### Open

| ID | Title | Stack(s) | Priority | Est. |
|----|-------|----------|----------|------|
| [ID] | [Title] | [Stack name or ALL] | High / Med / Low | [hours/days] |

### In Progress

| ID | Title | Stack(s) | Owner | Started |
|----|-------|----------|-------|---------|
| [ID] | [Title] | [Stack] | [Name/AI] | YYYY-MM-DD |

---

## Backlog — High Priority

| ID | Title | Stack(s) | Nature of Gap | Priority |
|----|-------|----------|--------------|----------|
| [ID] | [Title] | [Stack] | [Parity gap / Tech debt / Feature] | High |

---

## Backlog — Medium Priority

| ID | Title | Stack(s) | Nature of Gap | Priority |
|----|-------|----------|--------------|----------|

---

## Backlog — Low Priority / Ideas

| ID | Title | Stack(s) | Notes |
|----|-------|----------|-------|

---

## Resolved

| ID | Title | Stack(s) | Resolved | Decision Record |
|----|-------|----------|----------|----------------|
| [ID] | [Title] | [Stack] | YYYY-MM-DD | [DR-NNN or —] |
```
