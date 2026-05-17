# TEMPLATE — Implementation Log

**Intended audience:** The engineer writing the log during or immediately after a development session.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.8
**Produces:** `DOCS/.implementation-logs/YYYY-MM-DD_short-session-topic.md`

> Logs are **append-only**. Once written, do not edit past entries.
> Any structural decision recorded in a log MUST also produce a `DECISION_REGISTER.md` entry.

---

## How to Use This Template

- Name the file: `YYYY-MM-DD_short-session-topic.md` (DR-017, DR-019)
- Write during or immediately after the session — not retrospectively days later.
- Use plain, honest prose. Record what happened, including failures and blind alleys.
- At the end, check: does anything here constitute a structural decision? If yes, create the DR entry.

---

```markdown
# Implementation Log: [Brief Description of Work] [REQUIRED]

**Date:** YYYY-MM-DDTHH:MM:SSZ [REQUIRED]
**Session goal:** [One sentence — what was the main objective?] [REQUIRED]
**Outcome:** [Completed / Partial / Blocked] [REQUIRED]

---

## 1. Primary Request and Intent [REQUIRED]

**What was asked:** [Describe the original request that initiated this session]

**Scope that emerged:**
- [Additional work identified during the session]
- [Related items that were pulled in]

---

## 2. Key Technical Decisions Made This Session

[List decisions made during this session that affected design, naming, architecture, or process. Each one that is structural MUST produce a DR entry.]

| Decision | Rationale | DR created? |
|----------|-----------|------------|
| [Decision] | [Why] | DR-[NNN] / No |

---

## 3. Files Created or Significantly Modified [REQUIRED]

### Created
| File | Purpose |
|------|---------|
| [path/file.ext] | [What it does] |

### Modified
| File | Change summary |
|------|---------------|
| [path/file.ext] | [What changed and why] |

### Deleted
| File | Reason |
|------|--------|
| [path/file.ext] | [Why removed] |

---

## 4. Bugs and Errors Encountered

### [Bug/Error Title]
**Symptom:** [What was observed]
**Root cause:** [Why it happened]
**Fix:** [What was changed]

---

## 5. Lessons Learned

[What would you do differently? What was confirmed as the right approach? What surprised you?]

- [Lesson 1]
- [Lesson 2]

---

## 6. Current State at End of Session [REQUIRED]

**Completed this session:**
- ✅ [Item]

**Left incomplete / deferred:**
- ⏸️ [Item — why deferred]

**New backlog items generated:**
- [Item — add to DOCS/.planning/backlog.md]

---

## 7. Next Steps

[What should the next session start with?]

1. [Step]
2. [Step]

---

*End of Implementation Log*
```
