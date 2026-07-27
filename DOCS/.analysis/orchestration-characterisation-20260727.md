# Orchestration Characterisation - 2026-07-27

**Worklist:** SUD-21 / BACKLOG-060
**Repository baseline:** `bc178cc273d8d713c48b53282d88d66ce686597f`
**Decision:** DR-037
**Purpose:** Persistent pre-instrumentation evidence for SUD-22

---

## Method

Each production `SudokuOrchestrator` was run with audit logging enabled against the identical five
Stack-local `puzzles.json` files. TypeScript ran under Node 24.18.0, Python under 3.13.1, and C#
was built/run with .NET SDK 10.0.302. All three stacks produced the same status, final grid,
iteration count and per-technique cell-change counts shown below.

The audit trail records successful changes, not attempts. The pre-SUD-22 counts in this baseline
are therefore explicitly **inferred from the current loop contract**, rather than from the
dedicated trace that SUD-22 subsequently implemented:

- Unit Completion: one attempt per iteration;
- Hidden Singles: nine attempts per iteration, target digits 1 through 9;
- Naked Singles: one attempt per iteration.

This distinction is intentional. The baseline preserves what is true today without presenting an
inferred call sequence as observed runtime evidence.

## Baseline

Columns containing three numbers use `Unit Completion / Hidden Singles / Naked Singles` order.

| Puzzle | Status | Iterations | Inferred attempts | Changed events | Cell changes |
|---|---|---:|---:|---:|---:|
| Easy Scan Grid | `SOLVED` | 3 | 3 / 27 / 3 | 1 / 14 / 2 | 6 / 34 / 11 |
| Logic Squeeze Grid | `SOLVED` | 2 | 2 / 18 / 2 | 0 / 9 / 1 | 0 / 37 / 8 |
| Minimal Clues | `SOLVED` | 8 | 8 / 72 / 8 | 2 / 21 / 5 | 3 / 44 / 17 |
| Crosshatch Challenge | `SOLVED` | 3 | 3 / 27 / 3 | 1 / 12 / 1 | 5 / 31 / 13 |
| Empty Grid | `STUCK_ON_ADVANCED_LOGIC` | 1 | 1 / 9 / 1 | 0 / 0 / 0 | 0 / 0 / 0 |

For every non-empty puzzle, the cell-change total equals the initial empty-cell count. The Empty
Grid records the expected final no-progress iteration and no cell changes.

## Result Grids

The complete 9x9 results are stored as row-delimited digit strings to make drift review concise
and exact:

```text
Easy Scan Grid
534678912/672195348/198342567/859761423/426853791/713924856/961537284/287419635/345286179

Logic Squeeze Grid
435269781/682571493/197834562/826195347/374682915/951743628/519326874/248957136/763418259

Minimal Clues
264715839/137892645/598436271/423178596/816549723/759623418/375281964/982364157/641957382

Crosshatch Challenge
483921657/967345821/251876493/548132976/729564138/136798245/372689514/814253769/695417382

Empty Grid
000000000/000000000/000000000/000000000/000000000/000000000/000000000/000000000/000000000
```

## Fixture Mutation Probe

A test-only probe replaced one technique at a time with an unchanged/no-op result while leaving the
other two production methods intact.

| Puzzle | Unit Completion removed | Hidden Singles removed | Naked Singles removed |
|---|---|---|---|
| Easy Scan Grid | `SOLVED` | `SOLVED` | `SOLVED` |
| Logic Squeeze Grid | `SOLVED` | `SOLVED` | `SOLVED` |
| Minimal Clues | `SOLVED` | `STUCK_ON_ADVANCED_LOGIC` | `SOLVED` |
| Crosshatch Challenge | `SOLVED` | `SOLVED` | `SOLVED` |
| Empty Grid | `STUCK_ON_ADVANCED_LOGIC` | `STUCK_ON_ADVANCED_LOGIC` | `STUCK_ON_ADVANCED_LOGIC` |

The probe proves that no current fixture supports the causal statement "requires all three
techniques". `Logic Squeeze Grid` also records no Unit Completion changes. DR-037 therefore chooses
the worklist's recommended narrower claim rather than inventing an unverified replacement fixture.

## SUD-22 Compatibility Baseline

SUD-22 preserved:

- every status and result grid above;
- the current iteration and cell-change counts unless a separately approved behavioural decision
  explains a change;
- the existing change-only audit trail shape;
- zero attempts for an already-solved input, as already required by SUD-01;
- exact feature, step-text and memory-key parity across all three stacks.

SUD-22 now observes attempt counts from emitted immutable events rather than inferring them from
iterations. Its focused observer-spy tests fail when an expected call is removed or reordered;
the three existing Hidden Singles scenarios protect its internal row, column and box passes.
