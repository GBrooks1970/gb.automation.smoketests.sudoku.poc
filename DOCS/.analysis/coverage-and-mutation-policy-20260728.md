# Coverage Floors and Focused Mutation Trial

**Work item:** SUD-28 / BACKLOG-067

**Date:** 2026-07-28

**Decision:** DR-038

## Outcome

The three component baselines from SUD-24, SUD-25 and SUD-26 now protect their deliberately selected
production scopes with blocking, conservative CI floors. The thresholds are regression guardrails,
not coverage targets:

| Stack | Selected production scope | Measured baseline | Enforced floor |
|---|---|---:|---:|
| DEMOAPP001 TypeScript | Loader, solver, orchestrator, API service and request validation | 73.23% lines / 87.67% branches / 79.59% functions | 70% lines / 85% branches / 75% functions |
| DEMOAPP002 Python | Loader, solver and orchestrator; branch collection enabled | 87.81% combined (87.54% lines / 88.31% branches) | 85% combined |
| DEMOAPP003 C# | Loader, solver and orchestrator | 86.03% lines / 84.91% branches | 80% lines / 80% branches |

Generated code, third-party code, bindings and capability layers outside each baseline remain
excluded for the reasons recorded in the three Stack-local baseline documents. Increasing a floor
should follow evidence from new tests or a fresh mutation review. Lowering a floor requires an
explicit amendment to DR-038; changing filters to conceal a regression is not an acceptable fix.

## Focused mutation trial

DEMOAPP001 provides the reproducible command:

```bash
npm run test:mutation-trial
```

The script first proves the two focused test files pass, then copies the Stack into an operating-
system temporary directory for each mutation, links the existing dependency directory, mutates the
copy, runs only the relevant component contract, and removes the copy. Production files in the
working tree are never edited.

The Node 24.18.0 trial killed all 10 mutations:

| Mutant | Change | Killing contract |
|---|---|---|
| ORCH-REMOVE-UNIT | Remove the Unit Completion attempt | Exact orchestration-order component test |
| ORCH-REMOVE-HIDDEN | Remove all Hidden Singles attempts | Exact orchestration-order component test |
| ORCH-REMOVE-NAKED | Remove the Naked Singles attempt | Exact orchestration-order component test |
| ORCH-REORDER-UNIT | Move Unit Completion after Hidden Singles | Exact orchestration-order component test |
| ORCH-REORDER-HIDDEN | Move Hidden Singles after Naked Singles | Exact orchestration-order component test |
| ORCH-REORDER-NAKED | Move Naked Singles before Unit Completion | Exact orchestration-order component test |
| LOADER-ALLOW-NON-INTEGER | Accept non-integer numeric cells | Loader boundary component test |
| LOADER-ALLOW-ABOVE-MAX | Accept cells above 9 | Loader boundary component test |
| LOADER-SKIP-ROW-COUNT | Remove exact row-count validation | Loader dimension component test |
| LOADER-SKIP-COLUMN-COUNT | Remove exact column-count validation | Loader dimension component test |

No material mutant survived, so no production or component-test change was required. The trial is
kept as callable evidence but is not a permanent CI gate: its narrow deterministic purpose is to
challenge the ordering and loader boundaries behind the review finding without introducing the
cost and churn of an indiscriminate mutation score.

## Threshold negative controls

Each enforcement path was also run with a deliberately impossible 99% floor against the same
coverage data. TypeScript exited 1 for unmet native Node thresholds, Python `coverage report
--fail-under=99` exited 2, and the C# summary helper threw for its unmet line floor. These controls
prove the configured gates fail closed rather than merely printing a percentage.
