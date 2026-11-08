# Implementation plans

Plans are written before implementation and retain their approved scope. DR-019's DOCS
directory convention adapts the portfolio default to this dot-prefixed location.

| Item | Plan | Approval | Outcome |
|---|---|---|---|
| BACKLOG-086 / TRIAGE-18 | [Anchor DEMOAPP003 fixture data and authoritative loader paths](2026-11-08-triage-18-csharp-fixture-path.md) | Owner approved as recommended, 2026-11-08 | Not yet delivered; project PR to follow |
| BACKLOG-084 / TRIAGE-16 | [Real blocking counts when the audit policy has errors](2026-11-06-triage-16-audit-blocking-counts.md) | Owner approved as recommended, 2026-11-06 | Delivered in PR #105 / `ddc2540`; both new controls failed before the fix, policy controls 15/15, PR, dispatch and main CI green, Pages deployed |
| BACKLOG-083 | [Weekly scheduled dependency audit](2026-11-06-backlog-083-weekly-dependency-audit.md) | Owner approved as recommended, 2026-11-06 | Delivered in PR #103 / `99111e0`; dispatch run green, expired-exception control red, no Pages deployment from the audit workflow |
| BACKLOG-082 | [Restore green CI under DR-039](2026-11-06-backlog-082-dependency-audit-green.md) | Owner approved as recommended, 2026-11-06 | Delivered in PR #101 / `624a4af`; PR and main CI green, Pages deployed |
| BACKLOG-081 / TRIAGE-08 | [Active documentation currency](2026-10-07-triage-08-documentation-currency.md) | Owner selected next recommended item, 2026-10-07 | Native inventory, eight active guides, 37 currency controls and local acceptance passed; project PR publication follows this snapshot |
| BACKLOG-080 / TRIAGE-09 | [Compatible fast-uri remediation](2026-10-07-triage-09-fast-uri.md) | Owner selected recommended lock remediation, 2026-10-07 | Lock-only repair and local acceptance passed; project PR publication follows this snapshot |
| BACKLOG-078 / TRIAGE-14 | [Exact Then assertions](2026-10-07-backlog-078-exact-assertions.md) | Owner selected proposed sequence, 2026-10-07 | Native acceptance and existing local gates passed; PR publication pending at this snapshot |
| TRIAGE-13 / BACKLOG-079 | [Visualiser playhead preservation](2026-10-06-triage-13-visualiser-playhead.md) | Owner approved repair and exact dependency exception, 2026-10-06 | All local gates and native acceptance passed; PR publication pending |
