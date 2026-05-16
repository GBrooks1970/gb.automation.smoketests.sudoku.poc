# TODO: Audit Trail Feature

**Created:** 2026-02-12T00:00:00Z
**Last Updated:** 2026-04-02T00:00:00Z
**Design Document:** [DESIGN_Audit_Trail_Feature.md](../DOCS/.design/DESIGN_Audit_Trail_Feature.md)
**Backlog Reference:** BACKLOG-008 (Implement Audit Trail Feature)
**Estimated Effort:** 20-30 hours

---

## Overview

Implementation task list for a comprehensive audit trail system that logs every change made to the Sudoku grid during solving. The audit trail captures deltas at each step, providing full traceability of how the solver arrived at the solution — including algorithm attribution, timestamps, iteration tracking, and statistics.

---

## Prerequisites

- [ ] **Review design document** — Read `DOCS/.design/DESIGN_Audit_Trail_Feature.md` thoroughly before starting.
- [ ] **BACKLOG-017: Unify Feature Design Overlap** — Complete first. The `AuditTypes.ts` `CellChange` interface defined here becomes the **shared data model** consumed by the REST API (`ChangeTracker`) and Web UI (`SolveStepTracker`). The interface must be agreed before implementation to avoid post-hoc refactoring in BACKLOG-009 and BACKLOG-018.
- [ ] **BACKLOG-007: Decouple Console Output with DI** — Recommended (not blocking). If implemented, audit output can use the `IOutput` interface. If not, audit can write directly to console and files.
- [ ] **Existing solver code is unmodified** — Verify `SudokuSolver.ts`, `SudokuOrchestrator.ts` compile and `npm start` runs before starting.

---

## Phase 1: Core Audit Infrastructure (Priority: HIGH)

### 1.1 Create Type Definitions

- [ ] **1.1.1** Create directory `demo-apps/demoapp001-typescript-cypress/app_src/audit/`
- [ ] **1.1.2** Create `app_src/audit/AuditTypes.ts` with the following interfaces:
  - `AuditConfig` — enabled, outputToFile, outputToConsole, includeGridSnapshots, filePath, verbosityLevel
  - `CellChange` — `cell: { row: number; col: number }`, oldValue, newValue, `reason?` — **this is the shared cross-feature base interface**; the Web UI's `SolveStep` (`web/SolveStepTracker.ts`) extends it, and the REST API's `ChangeTracker` returns it. Define it once here.
  - `AuditEvent` — eventId, timestamp, iteration, algorithm, algorithmParameter, cellChanges[], gridSnapshotAfter?
  - `AuditTrail` — puzzleName, startTime, endTime, totalDurationMs, initialGrid, finalGrid, status, totalIterations, totalChanges, events[], statistics
  - `AuditStatistics` — changesByAlgorithm, iterationsByAlgorithm, averageChangesPerIteration
- [ ] **1.1.3** Export all interfaces from `app_src/audit/index.ts` barrel file — ensure `CellChange` is a named export so downstream consumers (`web/SolveStepTracker.ts`, `api/services/SudokuApiService.ts`) can import it directly

### 1.2 Create AuditLogger Class

- [ ] **1.2.1** Create `app_src/audit/AuditLogger.ts`
- [ ] **1.2.2** Implement constructor accepting puzzleName, initialGrid (deep copy), and optional Partial<AuditConfig>
- [ ] **1.2.3** Implement `startIteration()` — increments iteration counter
- [ ] **1.2.4** Implement `logChange(algorithm, cellChanges[], gridSnapshot?)` — creates AuditEvent, appends to events array, assigns eventId and timestamp
- [ ] **1.2.5** Implement `endIteration()` — marks iteration boundary
- [ ] **1.2.6** Implement `isEnabled()` — returns config.enabled
- [ ] **1.2.7** Implement `getChangeCount()` — returns total cell changes logged
- [ ] **1.2.8** Implement `getStatistics()` — computes AuditStatistics from events array
- [ ] **1.2.9** Implement `getTrail()` — assembles and returns full AuditTrail object
- [ ] **1.2.10** Implement `exportToFile(filePath?)` — async, writes JSON to `audit_logs/` directory
- [ ] **1.2.11** Implement `exportToConsole(format?)` — prints summary or detailed format to console
- [ ] **1.2.12** Ensure disabled config results in no-op (zero overhead when disabled)

### 1.3 Modify SudokuSolver to Track Changes

- [ ] **1.3.1** Add optional `auditLogger?: AuditLogger` private property to `SudokuSolver`
- [ ] **1.3.2** Add `setAuditLogger(logger: AuditLogger): void` public method
- [ ] **1.3.3** Modify `unitCompletion()` — before placing each digit, record CellChange with `{ cell, oldValue: 0, newValue, reason }`. After all changes, call `auditLogger.logChange('UnitCompletion', changes)`
  - Reason for row: `"Last empty cell in row {r}"`
  - Reason for column: `"Last empty cell in column {c}"`
  - Reason for block: `"Last empty cell in block ({br},{bc})"`
- [ ] **1.3.4** Modify `hiddenSingles(target)` — record CellChange with reason `"Only valid location for {target} in block ({br},{bc})"`. Call `auditLogger.logChange('HiddenSingles', changes)`
- [ ] **1.3.5** Modify `nakedSingles()` — record CellChange with reason `"Only candidate remaining"`. Call `auditLogger.logChange('NakedSingles', changes)`
- [ ] **1.3.6** Ensure all logging is behind `if (this.auditLogger)` guard so existing behaviour is unchanged when no logger is set

### 1.4 Integrate with SudokuOrchestrator

- [ ] **1.4.1** Add optional `auditConfig?: Partial<AuditConfig>` to `SudokuOrchestrator` constructor
- [ ] **1.4.2** In constructor: if auditConfig.enabled, create AuditLogger instance and call `solver.setAuditLogger()`
- [ ] **1.4.3** In `solve()`: call `auditLogger.startIteration()` at start of each while-loop pass
- [ ] **1.4.4** In `solve()`: call `auditLogger.endIteration()` at end of each while-loop pass
- [ ] **1.4.5** After solve loop: call `auditLogger.finalize(status)` with final grid state
- [ ] **1.4.6** Add `getAuditTrail(): AuditTrail | undefined` public method
- [ ] **1.4.7** Verify existing `SudokuOrchestrator` constructor signature remains backwards-compatible (auditConfig is optional)

### 1.5 Verify Phase 1

- [ ] **1.5.1** Run `npm start` — confirm existing CLI behaviour is unchanged (no audit output by default)
- [ ] **1.5.2** Manually enable audit in `index.ts` (temporary), run solver, verify AuditTrail JSON is populated
- [ ] **1.5.3** Verify events contain correct algorithm attribution for Easy Scan Grid
- [ ] **1.5.4** Verify statistics match expected cell change counts

---

## Phase 2: Output Formatting (Priority: MEDIUM)

### 2.1 Create AuditFormatter

- [ ] **2.1.1** Create `app_src/audit/AuditFormatter.ts`
- [ ] **2.1.2** Implement `static formatSummary(trail: AuditTrail): string` — returns boxed console summary (puzzle name, status, duration, iteration count, changes by algorithm with percentages)
- [ ] **2.1.3** Implement `static formatDetailed(trail: AuditTrail): string` — returns iteration-by-iteration text log:
  ```
  === ITERATION 1 ===
  [UnitCompletion] Cell [0,2]: 0 → 4
    Reason: Last empty cell in row 0
  [HiddenSingles(1)] Cell [2,0]: 0 → 1
    Reason: Only valid location for 1 in block (0,0)
  ```
- [ ] **2.1.4** Implement `static formatJson(trail: AuditTrail): string` — returns pretty-printed JSON

### 2.2 JSON File Export

- [ ] **2.2.1** Create `audit_logs/` directory with `.gitkeep`
- [ ] **2.2.2** Add `audit_logs/` to `.gitignore` (except `.gitkeep`)
- [ ] **2.2.3** Implement file naming: `{PuzzleName}_{ISO-timestamp}.json` (sanitise puzzle name for filesystem)
- [ ] **2.2.4** Use async `fs.promises.writeFile` for non-blocking I/O
- [ ] **2.2.5** Handle file write errors gracefully (log warning, don't crash solver)

### 2.3 Verify Phase 2

- [ ] **2.3.1** Enable audit with file output, run solver, verify JSON file created in `audit_logs/`
- [ ] **2.3.2** Validate JSON file is parseable and matches AuditTrail interface
- [ ] **2.3.3** Enable console summary output, verify formatted output matches design spec
- [ ] **2.3.4** Enable detailed output, verify iteration-by-iteration log is correct

---

## Phase 3: Configuration & Integration (Priority: MEDIUM)

### 3.1 Update Entry Point

- [ ] **3.1.1** Modify `app_src/index.ts` to accept audit configuration
- [ ] **3.1.2** Add audit config block with sensible defaults (enabled: false by default)
- [ ] **3.1.3** Pass auditConfig to SudokuOrchestrator constructor
- [ ] **3.1.4** After solve: if trail exists, call `AuditFormatter.formatSummary()` and print

### 3.2 Environment Variable Support

- [ ] **3.2.1** Read `SUDOKU_AUDIT_ENABLED` (boolean) from `process.env`
- [ ] **3.2.2** Read `SUDOKU_AUDIT_PATH` (string) from `process.env`
- [ ] **3.2.3** Read `SUDOKU_AUDIT_VERBOSITY` (minimal|standard|detailed) from `process.env`
- [ ] **3.2.4** Environment variables override config file / code defaults

### 3.3 Configuration File Support (Optional)

- [ ] **3.3.1** Create `audit_config.json` with default settings
- [ ] **3.3.2** Load config file in index.ts if present, fall back to defaults if not

### 3.4 Verify Phase 3

- [ ] **3.4.1** Run `npm start` with no env vars — audit should be disabled, no output
- [ ] **3.4.2** Run `SUDOKU_AUDIT_ENABLED=true npm start` — audit summary should print
- [ ] **3.4.3** Run with `SUDOKU_AUDIT_VERBOSITY=detailed` — detailed log should print
- [ ] **3.4.4** Run with `SUDOKU_AUDIT_PATH=./custom_dir` — JSON files should write to custom directory

---

## Phase 4: Testing & Validation (Priority: HIGH)

### 4.1 Unit Tests

- [ ] **4.1.1** Create `tests/audit/AuditLogger.test.ts`
- [ ] **4.1.2** Test: Logger captures all cell changes when enabled
- [ ] **4.1.3** Test: Logger is no-op when disabled (config.enabled = false)
- [ ] **4.1.4** Test: Statistics are calculated correctly (counts per algorithm, averageChangesPerIteration)
- [ ] **4.1.5** Test: getTrail() returns complete AuditTrail with all fields populated
- [ ] **4.1.6** Test: Event IDs are sequential
- [ ] **4.1.7** Test: Timestamps are valid ISO 8601 strings
- [ ] **4.1.8** Test: Iteration numbers increment correctly

### 4.2 Formatter Tests

- [ ] **4.2.1** Create `tests/audit/AuditFormatter.test.ts`
- [ ] **4.2.2** Test: formatSummary() contains puzzle name, status, change counts
- [ ] **4.2.3** Test: formatDetailed() contains iteration headers and cell change entries
- [ ] **4.2.4** Test: formatJson() produces valid JSON that deserialises to AuditTrail

### 4.3 Integration Tests

- [ ] **4.3.1** Create `tests/audit/AuditIntegration.test.ts`
- [ ] **4.3.2** Test: Easy Scan Grid produces complete audit trail with status SOLVED
- [ ] **4.3.3** Test: Minimal Clues produces audit trail with status STUCK_ON_ADVANCED_LOGIC
- [ ] **4.3.4** Test: Empty Grid produces audit trail with 0 events
- [ ] **4.3.5** Test: All cell changes in trail, when applied to initialGrid, produce finalGrid
- [ ] **4.3.6** Test: statistics.totalChanges equals events.flatMap(e => e.cellChanges).length

### 4.4 File I/O Tests

- [ ] **4.4.1** Test: exportToFile() creates a valid JSON file
- [ ] **4.4.2** Test: exportToFile() handles missing directory gracefully (creates it)
- [ ] **4.4.3** Test: exportToFile() handles write permission errors gracefully

### 4.5 Performance Tests

- [ ] **4.5.1** Benchmark: Solve Easy Scan Grid with audit disabled, record time
- [ ] **4.5.2** Benchmark: Solve Easy Scan Grid with audit enabled, record time
- [ ] **4.5.3** Assert: Overhead is <5% (as per design spec)

### 4.6 Update Gherkin Feature File

- [ ] **4.6.1** Add audit trail scenarios to `tests/BasicSudokuSolverLogic.feature`:
  - Scenario: Generate complete audit trail for solved puzzle
  - Scenario: Audit trail tracks algorithm attribution correctly
  - Scenario: Audit trail disabled by default
  - Scenario: Performance with audit logging enabled

---

## Phase 5: Documentation

- [ ] **5.1** Create implementation log: `DOCS/.implementation/IMPL_LOG_[date]_Audit_Trail_Feature.md`
- [ ] **5.2** Update `CLAUDE.md` — Add audit trail section with configuration options and usage examples
- [ ] **5.3** Update `DOCS/.design/DESIGN_Audit_Trail_Feature.md` status from "Approved" to "Implemented"
- [ ] **5.4** Update `DOCS/.planning/BACKLOG.md` — Mark BACKLOG-008 as completed
- [ ] **5.5** Update `DOCS/.design/README.md` — Update status of audit trail design document
- [ ] **5.6** Document any deviations from the design document in the implementation log

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Logger injection | `setAuditLogger()` method on SudokuSolver | Avoids constructor signature changes, backwards-compatible |
| Change detection | Inside each algorithm method | More accurate than before/after grid diff; captures per-algorithm reasons |
| File output | Async fs.promises | Non-blocking, won't slow solver |
| Config approach | Optional constructor param + env vars | Flexible, zero-overhead when disabled |
| Formatter | Static methods on AuditFormatter | Stateless formatting, easy to test |
| Grid snapshots | Optional per AuditConfig | Saves memory for standard usage; available for deep debugging |

---

## Dependencies Between Phases

```
Phase 1 (Core Infrastructure)
├── 1.1 Types ──→ 1.2 AuditLogger ──→ 1.3 Solver Hooks ──→ 1.4 Orchestrator Integration
│                                                                      │
│                                                                      ▼
│                                                              Phase 1.5 (Verify)
│
├── Phase 2 (Formatting) ─── depends on Phase 1
│   ├── 2.1 AuditFormatter
│   └── 2.2 File Export
│
├── Phase 3 (Configuration) ─── depends on Phase 1
│   ├── 3.1 Entry Point Update
│   ├── 3.2 Env Vars
│   └── 3.3 Config File
│
├── Phase 4 (Testing) ─── depends on Phases 1, 2, 3
│   ├── 4.1-4.4 Unit/Integration/IO Tests
│   └── 4.5 Performance Tests
│
└── Phase 5 (Documentation) ─── depends on Phase 4
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `app_src/audit/AuditTypes.ts` | TypeScript interfaces for audit data |
| `app_src/audit/AuditLogger.ts` | Core audit logging class |
| `app_src/audit/AuditFormatter.ts` | Console and text output formatting |
| `app_src/audit/index.ts` | Barrel export for audit module |
| `audit_logs/.gitkeep` | Placeholder for audit log output directory |
| `audit_config.json` | Default audit configuration file |
| `tests/audit/AuditLogger.test.ts` | Unit tests for AuditLogger |
| `tests/audit/AuditFormatter.test.ts` | Unit tests for AuditFormatter |
| `tests/audit/AuditIntegration.test.ts` | Integration tests |

## Files to Modify

| File | Changes |
|------|---------|
| `app_src/SudokuSolver.ts` | Add auditLogger property, setAuditLogger() method, logging hooks in all 3 algorithms |
| `app_src/SudokuOrchestrator.ts` | Add auditConfig param, create logger, call startIteration/endIteration |
| `app_src/index.ts` | Add audit configuration, print summary |
| `package.json` | Add fs-extra dependency (if needed), test scripts |
| `.gitignore` | Add `audit_logs/*.json` |
| `CLAUDE.md` | Add audit trail documentation |

---

## Notes for Implementing Agent

- The **existing solver classes must remain backwards-compatible**. All audit additions are optional (guarded by `if (this.auditLogger)` checks).
- The `AuditLogger` should be **injectable but not required**. When no logger is set, the solver behaves exactly as before.
- The design document specifies `fs-extra` as a dependency, but `fs.promises` (built into Node.js) should suffice. Avoid adding unnecessary dependencies.
- If the test runner (BACKLOG-002) is not yet configured, create test files in the expected structure but note they may not run until the runner is set up.
- The **Audit Trail and Web UI features have overlapping step-tracking concerns**. If the Web UI's `SolveStepTracker` is implemented first, the audit trail can potentially reuse its approach. However, the audit trail is designed to be embedded inside the solver (more granular) while the step tracker wraps outside.
- Performance overhead must stay under 5%. Profile the `logChange()` method if tests show degradation.

---

**Estimated Total Effort:** 20-30 hours across all phases
