# TEMPLATE — Changelog

**Intended audience:** Any engineer or AI agent recording a release or notable change.
**Template version:** 1.0 (2026-05-14)
**Format:** Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## How to Use This Template

- Add new entries at the **top** of the changelog (newest first).
- Use `[Unreleased]` for changes not yet tagged.
- On release: rename `[Unreleased]` to `[vX.Y.Z] — YYYY-MM-DD`.
- Use the change-type labels exactly as shown. Omit any section with no entries.
- Never delete old entries. The changelog is append-only.

---

```markdown
# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Added
- [New feature, file, or capability introduced]

### Changed
- [Modification to existing behaviour]

### Fixed
- [Bug correction]

### Removed
- [Feature, file, or capability that was deleted]

### Deprecated
- [Feature that will be removed in a future version]

### Security
- [Vulnerability fixed or security posture improved]

---

## [vX.Y.Z] — YYYY-MM-DD

### Added
- [Entry]

### Changed
- [Entry]

---
```

## Change-Type Guidance for This Project

| Type | Use when |
|------|----------|
| **Added** | New source file, algorithm, test scenario, design doc, or tool |
| **Changed** | Refactor, rename, restructured directory, updated design |
| **Fixed** | Bug in algorithm, broken test, wrong constant value |
| **Removed** | Deleted file, deprecated class, removed dependency |
| **Deprecated** | Class or feature marked for removal in a future sprint |
| **Security** | Dependency vulnerability patched |
