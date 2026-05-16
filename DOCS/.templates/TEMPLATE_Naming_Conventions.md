# TEMPLATE — Naming Conventions

**Intended audience:** Any engineer or AI agent generating new names for files, directories, identifiers, or constants.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `REFERENCE_ARCHITECTURE.md` §10.9

---

## How to Use This Template

- Populate every category row. If a category does not apply to this project, write "N/A — [reason]".
- This document is authoritative. When a conflict arises between this document and any other source (code comments, AI memory, convention assumptions), this document wins.
- When a new naming pattern is introduced that is not covered here, update this document **before** using the new pattern.
- Deviations from the stated conventions MUST be recorded in `DECISION_REGISTER.md`.

---

```markdown
# Naming Conventions

**Project:** [Project name]
**Last Updated:** YYYY-MM-DD
**Status:** Adopted
**Authoritative for:** All Stacks, all document types

---

## Quick Reference

| Element | Convention |
|---------|-----------|
| [Element] | [Convention] |

---

## 1. Directory Names

| Scope | Convention | Separator | Example |
|-------|-----------|-----------|---------|
| [Scope] | [Case style] | [char] | [example/] |

---

## 2. File Names

| File type | Convention | Separator | Example |
|-----------|-----------|-----------|---------|
| [Type] | [Case style] | [char] | [file.ext] |

---

## 3. Stack Names

| Rule | Value |
|------|-------|
| Format | [e.g. UPPER_SNAKE_CASE] |
| Uniqueness | [Must be unique across the repository] |
| Allowed characters | [e.g. A–Z, 0–9, underscore] |
| Example | [DEMOAPP001_TYPESCRIPT_CYPRESS] |

---

## 4. Feature File Names

| Rule | Value |
|------|-------|
| Case | [e.g. PascalCase] |
| Word separator | [e.g. none / underscore] |
| Must match | [e.g. the primary scenario subject] |
| Example | [BasicSudokuSolverLogic.feature] |

---

## 5. Screenplay Component Names

| Component | Pattern | Example |
|-----------|---------|---------|
| Actor | [e.g. PascalCase noun phrase] | [AnAutomatedSolver] |
| Ability | [e.g. PascalCase verb phrase] | [UseSudokuSolver] |
| Task | [e.g. PascalCase verb phrase] | [SolvePuzzle] |
| Question | [e.g. PascalCase noun phrase] | [SolveStatus] |

---

## 6. Memory Key Names

| Rule | Value |
|------|-------|
| Case | [e.g. UPPER_SNAKE_CASE] |
| Word separator | [underscore] |
| Constant name equals string value | [YES — MUST be identical] |
| Namespaced for mixed surfaces | [e.g. CLI_LAST_EXIT_CODE, API_LAST_RESPONSE] |
| Defined in | [screenplay/support/memory-keys.ts] |

---

## 7. Step Definition Text

| Rule | Value |
|------|-------|
| Tense | [e.g. present simple] |
| Voice | [e.g. active] |
| Parameter placeholders | [e.g. {int}, {string}, {word}] |
| Over-specification policy | [No inline values — use parameters] |

---

## 8. Document Names

| Document type | Pattern | Fixed or date-prefixed |
|---------------|---------|----------------------|
| [Type] | [Pattern] | [Fixed / Date-prefixed] |

---

## 9. Decision Record IDs

| Rule | Value |
|------|-------|
| Format | DR-[NNN] (zero-padded to 3 digits) |
| Uniqueness | IDs MUST NOT be reused, even when superseded |
| Sequence | Sequential, starting at DR-001 |

---

## 10. Enforcement

| Convention category | Enforcement mechanism |
|--------------------|----------------------|
| [Category] | [ESLint rule / Code review / Convention-only] |
```
