# Naming Conventions Compatibility Bridge

**Status:** Compatibility bridge
**Authoritative source:** [`../.design/NAMING_CONVENTIONS.md`](../.design/NAMING_CONVENTIONS.md)
**Decision:** `DR-013`

`REFERENCE_ARCHITECTURE.md` v1.3 names this literal path as the naming conventions location. This repository's authoritative naming conventions remain in `DOCS/.design/NAMING_CONVENTIONS.md` under the DR-001 dot-prefix convention.

Update the authoritative naming conventions document first. This bridge exists so agents and validation checks that expect the v1.3 path can discover the correct source.
