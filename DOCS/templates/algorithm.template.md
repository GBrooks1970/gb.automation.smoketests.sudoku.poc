# TEMPLATE — Algorithm Document

**Intended audience:** Any engineer or AI agent implementing or reviewing an algorithm in this project.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` Appendix A
**Produces:** `DOCS/.algorithm/ALGORITHM_[Domain]_[Name].md`

> This lowercase file is the canonical template. Legacy convenience copies may exist under dot-prefixed documentation folders, but new algorithm documents should start from this file.

---

## How to Use This Template

- Algorithm documents are language-agnostic. Pseudocode must be readable without TypeScript/Python knowledge.
- Write the document BEFORE implementing a non-trivial algorithm (design-first).
- Add an implementation reference link once the code exists.
- Register the new document in `DOCS/.algorithm/README.md` and `DOCS/README.md`.

---

```markdown
# [Algorithm Name] [REQUIRED]

**Version:** v[X.Y] [REQUIRED]
**Date:** YYYY-MM-DDTHH:MM:SSZ [REQUIRED]
**Domain:** [e.g. Sudoku Solving / Graph Traversal / Data Parsing] [REQUIRED]
**Status:** [Draft | In Review | Approved | Implemented | Deprecated] [REQUIRED]

> [One-sentence description of what this algorithm or algorithm family does.] [REQUIRED]

---

## Overview [REQUIRED]

[2–4 paragraphs covering:]
- What problem this algorithm solves
- Where it fits in the larger system
- How it relates to other algorithms (link if applicable)
- Any prerequisites or dependencies

---

## Technique Summary [REQUIRED]

| # | Technique Name | Complexity | Difficulty to Detect | Frequency |
|---|---------------|------------|---------------------|-----------|
| 1 | [Technique 1] | O(?) | Easy / Moderate / Hard | Common / Occasional / Rare |

---

## 1. [Technique Name] [REQUIRED — repeat per technique]

### Goal
[One sentence — what does this technique achieve?]

### Technique
[Explain the logical rule in plain English. Why does it work?]

### Example
```
[Concrete worked example — show before state, pattern, and result]
```

### Pseudocode
```
FUNCTION TechniqueName(inputs):
    FOR each [unit]:
        IF [condition]:
            [action]
            RETURN TRUE
    RETURN FALSE
```

### Complexity
- **Time**: O([complexity]) — [brief justification]
- **Space**: O([complexity])
- **Detection**: [Easy / Moderate / Difficult]

### Implementation Reference
- [Language]: [`ClassName.method()`](../../DEMOAPPS/.../FileName.ts#L00)

---

## Complexity Analysis Summary [REQUIRED]

| Technique | Time | Space | Detection |
|-----------|------|-------|-----------|
| [Technique] | O(?) | O(?) | [Level] |

---

## Coverage and Limitations [REQUIRED]

### Handles
- [Input category: why it's handled]

### Cannot Handle
- [Limitation: what more advanced technique is needed]

---

## Testing [REQUIRED]

- **Feature File**: [link]
- **Test Data**: [link]

---

## References [REQUIRED]

- [External resource: title and URL]
- [Related algorithm doc: link]
- [Implementation file: link]

---

## Document History [REQUIRED]

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v0.1 | YYYY-MM-DD | [Name] | Initial draft |
| v1.0 | YYYY-MM-DD | [Name] | Approved |
```
