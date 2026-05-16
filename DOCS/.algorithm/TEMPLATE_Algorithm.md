# [Algorithm Name]

**Version:** v[X.Y]
**Date:** YYYY-MM-DDTHH:MM:SSZ
**Domain:** [e.g., Sudoku Solving / Graph Traversal / Data Parsing]
**Status:** [Draft | In Review | Approved | Implemented | Deprecated]

> One-sentence description of what this algorithm or algorithm family does.

---

## Overview

[2–4 paragraphs covering:]
- What problem this algorithm solves
- Where it fits in the larger system
- How it relates to other algorithms in this project (link if applicable)
- Any prerequisites or dependencies (e.g., candidate tracking must be set up first)

---

## Technique Summary

| # | Technique Name | Complexity | Difficulty to Detect | Frequency |
|---|---------------|------------|---------------------|-----------|
| 1 | [Technique 1] | O(n) | Easy | Very Common |
| 2 | [Technique 2] | O(n²) | Moderate | Occasional |
| 3 | [Technique 3] | O(n³) | Hard | Rare |

---

## Prerequisites

[Describe any state, data structures, or algorithms that must be in place before these techniques can be applied. Delete section if none.]

```
FUNCTION SetUp():
    // Initialize any required state
    RETURN state
```

---

## 1. [Technique Name]

*Also known as: [Alternate name if any]*

### Goal

[One sentence — what does this technique achieve?]

### Technique

[Explain the logical rule in plain English. Why does this work? What constraint does it exploit?]

### Why "[Technique Name]"?

[Explain the naming if it's non-obvious.]

### Example

```
[Concrete worked example using a grid, list, or diagram.
Show the before state, identify the pattern, and show what changes.]
```

### Pseudocode

```
FUNCTION TechniqueName(inputs):
    // Step 1: [Description]
    FOR each [unit / cell / element]:
        IF [condition]:
            [action]
            RETURN TRUE

    RETURN FALSE
```

### Complexity

- **Time**: O([complexity]) — [brief justification]
- **Space**: O([complexity]) — [brief justification]
- **Detection**: [Easy / Moderate / Difficult / Very Difficult]

### Edge Cases

- [Edge case 1: How handled]
- [Edge case 2: How handled]

### Implementation Reference

- [Language]: [`ClassName.methodName()`](../../DEMOAPPS/.../FileName.ts#L00)
- Called [N times / per iteration / etc.]

---

## 2. [Next Technique Name]

[Repeat the structure above for each technique in this document.]

---

## Execution Order

[If multiple techniques are applied in sequence, explain the ordering strategy here.]

```
FUNCTION MainLoop():
    WHILE [not done]:
        IF [Technique 1](): CONTINUE
        IF [Technique 2](): CONTINUE
        IF [Technique 3](): CONTINUE
        BREAK  // No progress — stuck

    RETURN "SOLVED" or "STUCK"
```

**Why this order?**
- [Technique 1] is cheapest — always try first
- [Technique 2] handles cases [Technique 1] misses
- [Technique 3] is most expensive — use only as last resort

---

## Complexity Analysis Summary

| Technique | Time Complexity | Space Complexity | Detection Difficulty |
|-----------|-----------------|------------------|---------------------|
| [Technique 1] | O(n) | O(1) | Easy |
| [Technique 2] | O(n²) | O(n) | Moderate |
| [Technique 3] | O(n³) | O(n) | Hard |

**Overall per iteration**: O([dominant complexity])

---

## Coverage and Limitations

### What This Algorithm Handles

- [Input category 1: Why it's handled]
- [Input category 2: Why it's handled]

### What This Algorithm Cannot Handle

- [Limitation 1: What more advanced technique is needed]
- [Limitation 2: What more advanced technique is needed]

---

## Testing

The algorithm is tested in:

- **Feature File**: [link to .feature file]
- **Test Data**: [link to test data file]
- **Specific Scenarios**: [e.g., "Scenario: Hidden Singles in a block with 8 filled digits"]

---

## Implementation Notes

[Optional — only if the pseudocode differs meaningfully from the implementation, or there are known constraints that affect the code.]

- [Note 1: e.g., "Current implementation only checks blocks, not rows/columns"]
- [Note 2: e.g., "Returns after first change to restart the main loop"]

---

## References

- [External resource 1: title and URL]
- [External resource 2: title and URL]
- [Related algorithm doc: link]
- [Implementation file: link]

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v0.1 | YYYY-MM-DD | [Name] | Initial draft |
| v1.0 | YYYY-MM-DD | [Name] | Approved |

---

*End of Algorithm Document*
