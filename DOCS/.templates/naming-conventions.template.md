# TEMPLATE — Naming Conventions

**Intended audience:** Any engineer or AI agent generating new names for files, directories, identifiers, or constants.
**Template version:** 1.0 (2026-05-14)
**Governed by:** `reference-architecture.md` §10.9

---

## How to Use This Template

- Replace every `[REQUIRED]` placeholder before publishing.
- Populate every category row. If a category does not apply to this project, write "N/A — [reason]".
- This document is authoritative. When a conflict arises between this document and any other source (code comments, AI memory, convention assumptions), this document wins.
- When a new naming pattern is introduced that is not covered here, update this document **before** using the new pattern.
- Deviations from the stated conventions MUST be recorded in `decision-register.md`.

---

```markdown
# Naming Conventions

**Project:** [Project name] [REQUIRED]
**Last Updated:** YYYY-MM-DD [REQUIRED]
**Status:** Adopted [REQUIRED]
**Governed by:** [Reference document and section] [REQUIRED]
**Template:** `DOCS/.templates/naming-conventions.template.md` [REQUIRED]
**Authoritative for:** All Stacks, all document types [REQUIRED]

---

## Quick Reference

| Element | Convention |
|---------|-----------|
| [Element] [REQUIRED] | [Convention] [REQUIRED] |

---

## 1. Directory Names

| Scope | Convention | Separator | Example |
|-------|-----------|-----------|---------|
| [Scope] [REQUIRED] | [Case style] [REQUIRED] | [char or N/A] [REQUIRED] | [example/] [REQUIRED] |

---

## 2. File Names

| File type | Convention | Separator | Example |
|-----------|-----------|-----------|---------|
| [Type] [REQUIRED] | [Case style] [REQUIRED] | [char or N/A] [REQUIRED] | [file.ext] [REQUIRED] |

---

## 3. Stack Names

| Rule | Value |
|------|-------|
| Format | [e.g. UPPER_SNAKE_CASE] [REQUIRED] |
| Uniqueness | [Must be unique across the repository] [REQUIRED] |
| Allowed characters | [e.g. A-Z, 0-9, underscore] [REQUIRED] |
| Example | [DEMOAPP001_TYPESCRIPT_CYPRESS] [REQUIRED] |

---

## 4. Feature File Names

| Rule | Value |
|------|-------|
| Case | [e.g. PascalCase] [REQUIRED] |
| Word separator | [e.g. none / underscore] [REQUIRED] |
| Must match | [e.g. the primary scenario subject] [REQUIRED] |
| Example | [BasicSudokuSolverLogic.feature] [REQUIRED] |

---

## 5. Screenplay Component Names

| Component | Pattern | Example |
|-----------|---------|---------|
| Actor | [e.g. PascalCase noun phrase] [REQUIRED] | [AnAutomatedSolver] [REQUIRED] |
| Ability | [e.g. PascalCase verb phrase] [REQUIRED] | [UseSudokuSolver] [REQUIRED] |
| Task | [e.g. PascalCase verb phrase] [REQUIRED] | [SolvePuzzle] [REQUIRED] |
| Question | [e.g. PascalCase noun phrase] [REQUIRED] | [SolveStatus] [REQUIRED] |

---

## 6. Memory Key Names

| Rule | Value |
|------|-------|
| Case | [e.g. UPPER_SNAKE_CASE] [REQUIRED] |
| Word separator | [underscore] [REQUIRED] |
| Constant name equals string value | [YES - MUST be identical] [REQUIRED] |
| Namespaced for mixed surfaces | [e.g. CLI_LAST_EXIT_CODE, API_LAST_RESPONSE] [REQUIRED] |
| Defined in | [screenplay/support/memory-keys.ts] [REQUIRED] |

---

## 7. Step Definition Text

| Rule | Value |
|------|-------|
| Tense | [e.g. present simple] [REQUIRED] |
| Voice | [e.g. active] [REQUIRED] |
| Parameter placeholders | [e.g. {int}, {string}, {word}] [REQUIRED] |
| Over-specification policy | [No inline values - use parameters] [REQUIRED] |

---

## 8. Tag Names

| Tag type | Convention | Example |
|----------|------------|---------|
| Canonical scope tags | [pattern] [REQUIRED] | [@util] [REQUIRED] |
| Lifecycle tags | [pattern] [REQUIRED] | [@pending] [REQUIRED] |
| Stack tags | [pattern] [REQUIRED] | [@stack-demoapp001] [REQUIRED] |

---

## 9. Document Names

| Document type | Pattern | Fixed or date-prefixed |
|---------------|---------|----------------------|
| [Type] [REQUIRED] | [Pattern] [REQUIRED] | [Fixed / Date-prefixed] [REQUIRED] |

---

## 10. Generated Artifact Names

| Artifact | Pattern | Excluded from manual naming rules |
|----------|---------|-----------------------------------|
| [Artifact type] [REQUIRED] | [Pattern] [REQUIRED] | Yes / No [REQUIRED] |

---

## 11. Decision Record IDs

| Rule | Value |
|------|-------|
| Format | DR-[NNN] (zero-padded to 3 digits) |
| Uniqueness | IDs MUST NOT be reused, even when superseded |
| Sequence | Sequential, starting at DR-001 |

---

## 12. Enforcement

| Convention category | Enforcement mechanism |
|--------------------|----------------------|
| [Category] [REQUIRED] | [ESLint rule / Code review / Convention-only] [REQUIRED] |
```
