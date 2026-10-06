---
version: 1
created: 2026-10-06T22:48Z
project: gb.automation.smoketests.sudoku.poc
type: implementation-plan
item: TRIAGE-13 / BACKLOG-079
status: approved
approved: 2026-10-06 by GBrooks1970; implement and open a project PR, owner merges
delivered: not yet
language: en-GB
---

# Implementation plan: TRIAGE-13 visualiser playhead preservation

**Goal.** Returning from tutor redraws the visualiser at its preserved paused index so
the grid, current event, statistics and counter agree. Complete the required DR-039 audit
using the explicitly approved, exact seven-day braces exception and compatible proxy-addr fix.

## Evidence gathered before planning

The clean isolated repair branch and fetched main both point to `0782709bc38e5fe6ce704102b0963d98664c1e2c`.
Source inspection confirms `switchMode` redraws step zero while `player.currentIndex()` retains
the paused index. Historical TRIAGE-11 native evidence reproduced that mismatch at step 1 of 51.
The initial attempt passed locked restore and build, captured a draft patch, then restored the
tracked project tree after the dependency audit failed. Those probes are retained under
`.results/triage-13/`; they did not deliver a repair.

| Finding | Consequence for the plan |
|---|---|
| The player already exports `currentIndex()` | Reuse that API; preserve pause/resume behaviour. |
| proxy-addr 2.0.8 fits Express's existing `^2.0.7` range | Apply the saved lock-only patch, then run `npm ci`. |
| braces GHSA-vfj7-8cjw-p6xm has no patched release in the captured registry evidence | Apply only the owner-approved demoapp001 exception for 6–12 October 2026 inclusive. |
| DR-019 requires dot-prefixed DOCS directories | Keep this plan and its index in `DOCS/.implementation-plans/`, adapting the portfolio default path. |

## Steps

1. Save this plan, `_index.md` and the shared template at `DOCS/.templates/implementation-plan.template.md`.
2. Apply the preserved changes to `demo-apps/demoapp001-typescript-cypress/app_src/server/public/js/app.js`
   and `package-lock.json` in that Stack: import `currentIndex`, redraw with that index, and lock
   proxy-addr 2.0.8. Do not change dependency manifest ranges.
3. Update `.github/dependency-audit-policy.json` with the exact braces advisory/package/Stack
   exception, owner and approver GBrooks1970, introduced 2026-10-06, expiry 2026-10-12.
   Keep the high threshold and fourteen-day maximum unchanged.
4. Extend `tests/component/player-module.contract.test.ts` with real app/grid/player module
   probes over controlled DOM, fetch and timer seams. Cover first, middle, final, no-data,
   repeated round-trips and coherent playback resumption.
5. Track the approved repair as BACKLOG-079 in `DOCS/.planning/backlog.md`, preserving existing
   items and counts, and record user-visible behaviour and bounded dependency governance in `CHANGELOG.md`.
6. Run the gates below; record exact results before resolving BACKLOG-079 and committing.
   Update the separate root worklist only after acceptance and publication checks succeed.

## Verification

- A controlled original-redraw variant must fail the new middle-step consistency assertion.
- First, middle and final round-trips must preserve grid values/classes, event selection,
  per-technique statistics, counter and player index; resumption must use one interval and
  advance from the preserved index. No-data and repeated switches must remain safe.
- Native in-app browser checks against the real Express server must confirm the same user flow
  and capture screenshots/state plus browser errors.
- Node 24 locked restore, build, lint, formatting, changed-JavaScript syntax, component/BDD,
  API/OpenAPI, existing coverage floors, `check:web`, `check:pages`, seven repository
  parity/governance checks, governed dependency audit and CI evidence contract must pass.
- Python/C# local suites are unchanged and will rely on the all-Stack project PR CI.
  All applicable PR CI jobs must pass; Pages deployment requires the owner's subsequent merge.

## Delivery

Use `codex/sudoku-triage-13-visualiser-playhead` in the owned isolated checkout. Stage exact paths,
commit and open a project PR; the owner merges. Keep the root worklist as separate control state.
No other triage item, solver/API contract, dependency exception or branch cleanup is selected.

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Paused redraw | Preserve index or reset all playback state | Preserve the existing index | Action TRIAGE-13, 2026-10-06 |
| Unpatched braces audit blocker | Exact bounded exception, breaking dependency change, or remain blocked | Exact demoapp001 exception through 12 October | Dependency-exception decision approved, 2026-10-06 |

## Outcome

Local implementation and acceptance completed on 2026-10-06. The planned app redraw,
six focused regressions, compatible proxy-addr lock and exact approved exception are in place.
No solver/API, workflow, threshold, manifest-range or coverage-floor changes were needed.
The recorded backlog is BACKLOG-079; BACKLOG-078 stays Open and unscheduled.

Locked restore, build/lint/format, 113 component tests, 55 BDD scenarios / 309 steps, API,
eight OpenAPI checks, web/Pages checks and selected-module coverage passed. Coverage was
80.11% lines / 91.94% branches / 80.17% functions against 70% / 85% / 75% floors.
The original-redraw negative control was detected. Native browser first/middle/final,
no-data and repeated round-trips preserved the UI; resume advanced from step 1 to step 2,
and no console errors were captured. The governed audit passed as `excepted` with one
approved braces finding and zero unexcepted findings. Exact logs, durations and screenshot
are retained in `.results/triage-13/resumed-20261006/`.

App formatting initially rejected line endings; normalisation and a recheck passed.
All seven final repository parity/governance checks passed (23020 ms), including dependency
policy and evidence negative controls. The DEMOAPP001 evidence contract passed 6/6 files
(2628 ms). Project PR publication is pending in this pre-commit record. Python/C# local
suites rely on all-Stack PR CI; the owner merges the PR.
