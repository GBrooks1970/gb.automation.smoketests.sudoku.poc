# Implementation Log: P-04 ISC Licence Alignment

**Date:** 2026-07-14T11:56:46Z
**Session goal:** Implement the owner-approved P-04/D-06 ISC licence consistently across the multi-stack repository.
**Outcome:** Completed

---

## 1. Primary Request and Intent

**What was asked:** Continue the approved portfolio licensing rollout after Calculator D-05 merged.

**Scope that emerged:**
- Add a canonical root ISC licence and repair the root README's missing link.
- Preserve the existing TypeScript `ISC` signal and align Python and .NET project metadata.
- Clarify the licence boundary in each stack README and the root changelog.
- Keep repository visibility private and dependency licences separate.

---

## 2. Key Technical Decisions Made This Session

| Decision | Rationale | DR created? |
|----------|-----------|-------------|
| Use ISC across original repository material | Implements approved D-06 and preserves the only pre-existing machine-readable project signal in the TypeScript package | No — owner-approved legal metadata, not architecture |
| Add metadata to every .NET project | Keeps the app, test, and performance project surfaces consistent | No |
| Use the SPDX expression `ISC` in Python and .NET metadata | Aligns all ecosystems on the same unambiguous identifier | No |
| Leave dependency and container terms untouched | A repository licence does not relicense external packages or images | No |
| Keep GitHub visibility private | D-06 authorises licensing alignment, not publication | No |

---

## 3. Files Created or Significantly Modified

### Created

| File | Purpose |
|------|---------|
| `LICENSE` | Canonical ISC terms with project copyright |
| `DOCS/.implementation-logs/2026-07-14_p04-isc-licence-alignment.md` | Delivery evidence for D-06 |

### Modified

| File | Change summary |
|------|---------------|
| `README.md` and three stack READMEs | Repaired/added ISC links and clarified scope |
| Python `pyproject.toml` | Added `ISC` project licence expression |
| Three C# `.csproj` files | Added `PackageLicenseExpression` = `ISC` |
| `CHANGELOG.md` | Recorded P-04/D-06 delivery |
| `DOCS/.implementation-logs/README.md` | Indexed this implementation log |

### Deleted

| File | Reason |
|------|--------|
| None | No deletion required |

---

## 4. Bugs and Errors Encountered

### Upstream Python deprecation warning

**Symptom:** The Python suite passed but emitted one `DeprecationWarning` from the installed
`gherkin` package about positional `maxsplit`.
**Root cause:** The warning is in third-party pytest-bdd transitive code, not this repository.
**Fix:** No project change; the warning is non-blocking and predates this legal-metadata tranche.

---

## 5. Lessons Learned

- A multi-stack repository needs one authoritative root grant plus consistent ecosystem metadata.
- Dependency licence fields in lockfiles and package references are evidence about dependencies, not the project.
- Existing machine-readable intent is the safest starting point when the owner approves alignment.

---

## 6. Current State at End of Session

**Completed this session:**
- ✅ Canonical ISC root terms and repaired README link.
- ✅ TypeScript, Python, and .NET metadata aligned to `ISC`.
- ✅ Root and stack-level scope wording added.
- ✅ TypeScript build, lint, API integration, and Cucumber suite: 46/46 scenarios, 257/257 steps.
- ✅ Python editable build and pytest suite: 46/46 tests.
- ✅ .NET restore and test suite: 46/46 tests.
- ✅ Memory-key, feature, and 177-step-text parity gates.
- ✅ Docker Compose configuration validation.
- ✅ `git diff --check` reported no whitespace errors.

**Left incomplete / deferred:**
- ⏸️ GitHub licence detection can only be confirmed on the default branch after merge.
- ⏸️ Repository publication remains outside D-06 and was not performed.

**New backlog items generated:**
- None.

---

## 7. Next Steps

1. Publish an isolated draft PR and let the repository CI repeat all stack checks.
2. After merge, verify GitHub detects ISC on `main`.

---

*End of Implementation Log*
