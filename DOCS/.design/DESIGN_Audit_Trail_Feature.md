# Audit Trail Feature Design Document

**Version:** v1.1
**Date:** 2026-04-02T00:00:00Z
**Previous Version:** v1.0 (2026-01-30)

## Overview

This document outlines the design for implementing a comprehensive audit trail system that logs every change made to the Sudoku grid during the solving process. The audit trail will capture deltas (changes) at each step, providing full traceability of how the solver arrived at the solution.

## Goals

1. **Transparency**: Provide complete visibility into the solver's decision-making process
2. **Debugging**: Enable developers to identify where and why the solver made specific moves
3. **Educational**: Help users understand Sudoku solving techniques by showing step-by-step reasoning
4. **Testing**: Support automated testing by verifying expected solver behavior
5. **Performance Analysis**: Track which algorithms are most effective for different puzzle types

## Requirements

### Functional Requirements

1. Log every cell change with:
   - Cell coordinates (row, column)
   - Previous value
   - New value
   - Algorithm that made the change
   - Timestamp
   - Iteration number

2. Support multiple output formats:
   - JSON file (primary)
   - Console output (optional, human-readable)
   - Structured log format (optional)

3. Include context information:
   - Puzzle name/identifier
   - Initial grid state
   - Final grid state
   - Total solving time
   - Number of iterations
   - Success/failure status

4. Minimal performance overhead
5. Easy to enable/disable
6. Thread-safe for potential future concurrent solving

### Non-Functional Requirements

1. **Performance**: <5% overhead when enabled
2. **Storage**: Efficient JSON format, ~10-50KB per puzzle
3. **Compatibility**: Works with existing codebase without breaking changes
4. **Extensibility**: Easy to add new audit event types

---

## Architecture Design

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SudokuOrchestrator                       │
│  - Orchestrates solving                                     │
│  - Manages AuditLogger instance                             │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      AuditLogger                            │
│  - Records all changes                                      │
│  - Manages audit trail state                                │
│  - Exports to JSON/Console                                  │
└────────────────────────┬────────────────────────────────────┘
                         │ contains
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuditEvent (Interface)                   │
│  - timestamp, iteration, algorithm                          │
│  - cellChanges[], gridSnapshot (optional)                   │
└─────────────────────────────────────────────────────────────┘
                         │ contains
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 CellChange (Interface)                      │
│  - row, col, oldValue, newValue, reason                     │
└─────────────────────────────────────────────────────────────┘
```

### Class Diagram

```typescript
interface AuditConfig {
    enabled: boolean;
    outputToFile: boolean;
    outputToConsole: boolean;
    includeGridSnapshots: boolean;
    filePath?: string;
    verbosityLevel: 'minimal' | 'standard' | 'detailed';
}

interface CellChange {
    cell: { row: number; col: number };
    oldValue: number;
    newValue: number;
    reason?: string; // e.g., "only valid candidate", "last empty in row"
}
// NOTE: CellChange is the shared cross-feature base interface.
// The Web UI's SolveStep (DESIGN_Web_UI_Solver_Visualisation.md §5.1) extends
// CellChange directly. Import from app_src/audit/AuditTypes.ts — do not redefine.

interface AuditEvent {
    eventId: number; // uuid
    timestamp: string; // ISO 8601
    iteration: number;
    algorithm: 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';
    algorithmParameter?: number; // e.g., target digit for HiddenSingles
    cellChanges: CellChange[];
    gridSnapshotAfter?: number[][]; // Optional, for detailed mode
}

interface AuditTrail {
    puzzleName: string;
    startTime: string;
    endTime: string;
    totalDurationMs: number;
    initialGrid: number[][];
    finalGrid: number[][];
    status: 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC';
    totalIterations: number;
    totalChanges: number;
    events: AuditEvent[];
    statistics: AuditStatistics;
}

interface AuditStatistics {
    changesByAlgorithm: {
        unitCompletion: number;
        hiddenSingles: number;
        nakedSingles: number;
    };
    iterationsByAlgorithm: {
        unitCompletion: number;
        hiddenSingles: number;
        nakedSingles: number;
    };
    averageChangesPerIteration: number;
}
```

---

## Implementation Strategy

### Phase 1: Core Audit Infrastructure (Priority: HIGH)

**Files to Create:**
- `app_src/audit/AuditLogger.ts` - Core audit logging class
- `app_src/audit/AuditTypes.ts` - TypeScript interfaces
- `app_src/audit/AuditFormatter.ts` - Output formatting utilities

**Files to Modify:**
- `app_src/SudokuSolver.ts` - Add hooks for change tracking
- `app_src/SudokuOrchestrator.ts` - Integrate AuditLogger
- `package.json` - Add any new dependencies (e.g., `fs-extra`)

#### 1.1 Create AuditLogger Class

```typescript
// app_src/audit/AuditLogger.ts
export class AuditLogger {
    private config: AuditConfig;
    private events: AuditEvent[] = [];
    private currentIteration: number = 0;
    private eventIdCounter: number = 0;
    private startTime: Date;
    private puzzleName: string;
    private initialGrid: number[][];

    constructor(puzzleName: string, initialGrid: number[][], config?: Partial<AuditConfig>);

    // Core logging methods
    public startIteration(): void;
    public logChange(algorithm: string, cellChanges: CellChange[], gridSnapshot?: number[][]): void;
    public endIteration(): void;

    // Export methods
    public async exportToFile(filePath?: string): Promise<void>;
    public exportToConsole(format?: 'summary' | 'detailed'): void;
    public getTrail(): AuditTrail;

    // Utility methods
    public isEnabled(): boolean;
    public getChangeCount(): number;
    public getStatistics(): AuditStatistics;
}
```

#### 1.2 Modify SudokuSolver to Track Changes

**Strategy**: Use a **wrapper pattern** to avoid modifying every algorithm:

```typescript
// app_src/SudokuSolver.ts
export class SudokuSolver {
    private auditLogger?: AuditLogger;

    public setAuditLogger(logger: AuditLogger): void {
        this.auditLogger = logger;
    }

    // Modify existing methods to log changes
    public unitCompletion(): boolean {
        const changesMade: CellChange[] = [];
        let changed = false;

        // Check all rows
        for (let r = 0; r < 9; r++) {
            const empties = this.grid[r].filter(cell => cell === 0);
            if (empties.length === 1) {
                const colIndex = this.grid[r].indexOf(0);
                const missing = this.findMissingDigit(this.grid[r]);

                // Log the change
                if (this.auditLogger) {
                    changesMade.push({
                        cell: {row: r, col: colIndex},
                        oldValue: 0,
                        newValue: missing,
                        reason: `Last empty cell in row ${r}`
                    });
                }

                this.grid[r][colIndex] = missing;
                changed = true;
            }
        }

        // Similar for columns and blocks...

        // Log all changes for this algorithm call
        if (this.auditLogger && changesMade.length > 0) {
            this.auditLogger.logChange('UnitCompletion', changesMade);
        }

        return changed;
    }

    // Similar modifications for hiddenSingles() and nakedSingles()
}
```

#### 1.3 Integrate with SudokuOrchestrator

```typescript
// app_src/SudokuOrchestrator.ts
export class SudokuOrchestrator {
    private auditLogger?: AuditLogger;

    constructor(private solver: SudokuSolver, auditConfig?: Partial<AuditConfig>) {
        if (auditConfig?.enabled) {
            this.auditLogger = new AuditLogger(
                solver.name,
                solver.origGrid,
                auditConfig
            );
            solver.setAuditLogger(this.auditLogger);
        }
    }

    public solve(): string {
        if (this.auditLogger) {
            this.auditLogger.startSolving();
        }

        let isProgressing = true;
        let iteration = 0;

        while (isProgressing) {
            iteration++;
            if (this.auditLogger) {
                this.auditLogger.startIteration();
            }

            let changedThisPass = false;

            // Step 1: Unit Completion
            if (this.solver.unitCompletion()) {
                changedThisPass = true;
            }

            // Step 2: Hidden Singles
            for (let digit = 1; digit <= 9; digit++) {
                if (this.solver.hiddenSingles(digit)) {
                    changedThisPass = true;
                }
            }

            // Step 3: Naked Singles
            if (this.solver.nakedSingles()) {
                changedThisPass = true;
            }

            if (this.auditLogger) {
                this.auditLogger.endIteration();
            }

            isProgressing = changedThisPass;
        }

        const status = this.isGridFull() ? "SOLVED" : "STUCK_ON_ADVANCED_LOGIC";

        if (this.auditLogger) {
            await this.auditLogger.finalize(status);
        }

        return status;
    }

    public getAuditTrail(): AuditTrail | undefined {
        return this.auditLogger?.getTrail();
    }
}
```

### Phase 2: Output Formatting (Priority: MEDIUM)

#### 2.1 JSON File Output

**File Structure:**
```
audit_logs/
  ├── Easy_Scan_Grid_2026-01-26_19-30-45.json
  ├── Logic_Squeeze_Grid_2026-01-26_19-30-50.json
  └── summary.json
```

**JSON Format Example:**
```json
{
  "puzzleName": "Easy Scan Grid",
  "startTime": "2026-01-26T19:30:45.123Z",
  "endTime": "2026-01-26T19:30:45.456Z",
  "totalDurationMs": 333,
  "initialGrid": [[5,3,0,0,7,0,0,0,0], ...],
  "finalGrid": [[5,3,4,6,7,8,9,1,2], ...],
  "status": "SOLVED",
  "totalIterations": 12,
  "totalChanges": 51,
  "events": [
    {
      "eventId": 1,
      "timestamp": "2026-01-26T19:30:45.125Z",
      "iteration": 1,
      "algorithm": "UnitCompletion",
      "cellChanges": [
        {
          "row": 0,
          "col": 2,
          "oldValue": 0,
          "newValue": 4,
          "reason": "Last empty cell in row 0"
        }
      ]
    },
    {
      "eventId": 2,
      "timestamp": "2026-01-26T19:30:45.130Z",
      "iteration": 1,
      "algorithm": "HiddenSingles",
      "algorithmParameter": 1,
      "cellChanges": [
        {
          "row": 2,
          "col": 0,
          "oldValue": 0,
          "newValue": 1,
          "reason": "Only valid location for 1 in block (0,0)"
        }
      ]
    }
  ],
  "statistics": {
    "changesByAlgorithm": {
      "unitCompletion": 15,
      "hiddenSingles": 28,
      "nakedSingles": 8
    },
    "iterationsByAlgorithm": {
      "unitCompletion": 12,
      "hiddenSingles": 108,
      "nakedSingles": 12
    },
    "averageChangesPerIteration": 4.25
  }
}
```

#### 2.2 Console Output Format

**Summary Format (Default):**
```
┌─────────────────────────────────────────────────────────────┐
│           SUDOKU SOLVER - AUDIT TRAIL SUMMARY               │
├─────────────────────────────────────────────────────────────┤
│ Puzzle: Easy Scan Grid                                      │
│ Status: SOLVED                                              │
│ Duration: 333ms                                             │
│ Iterations: 12                                              │
│ Total Changes: 51                                           │
├─────────────────────────────────────────────────────────────┤
│ Changes by Algorithm:                                       │
│   • Unit Completion:  15 (29.4%)                           │
│   • Hidden Singles:   28 (54.9%)                           │
│   • Naked Singles:     8 (15.7%)                           │
├─────────────────────────────────────────────────────────────┤
│ Audit log saved to:                                         │
│   audit_logs/Easy_Scan_Grid_2026-01-26_19-30-45.json      │
└─────────────────────────────────────────────────────────────┘
```

**Detailed Format (verbose):**
```
=== ITERATION 1 ===
[UnitCompletion] Row 0, Cell [0,2]: 0 → 4
  Reason: Last empty cell in row 0

[HiddenSingles(1)] Block (0,0), Cell [2,0]: 0 → 1
  Reason: Only valid location for 1 in block (0,0)

[HiddenSingles(5)] Row 3, Cell [3,4]: 0 → 5
  Reason: Only valid location for 5 in row 3

=== ITERATION 2 ===
[NakedSingles] Cell [4,4]: 0 → 9
  Reason: Only candidate remaining (eliminated 1,2,3,4,5,6,7,8)
...
```

### Phase 3: Configuration & Integration (Priority: MEDIUM)

#### 3.1 Update index.ts for CLI Integration

```typescript
// app_src/index.ts
try {
    const loader = new PuzzleLoader("../puzzles.json");

    // Audit configuration
    const auditConfig: Partial<AuditConfig> = {
        enabled: true,
        outputToFile: true,
        outputToConsole: true,
        includeGridSnapshots: false,
        filePath: './audit_logs',
        verbosityLevel: 'standard'
    };

    const allPuzzles = loader.getAllPuzzles();
    allPuzzles.forEach(puzzle => {
        const solver = new SudokuSolver(puzzle.name, puzzle.grid);
        const orchestrator = new SudokuOrchestrator(solver, auditConfig);

        console.log(`\n[${puzzle.difficulty.toUpperCase()}] ${puzzle.description}`);

        const status = orchestrator.solve();

        // Export audit trail
        const trail = orchestrator.getAuditTrail();
        if (trail) {
            console.log(AuditFormatter.formatSummary(trail));
        }
    });
} catch (error) {
    console.error("Error:", error);
}
```

#### 3.2 Configuration File Support

**Create:** `audit_config.json`
```json
{
  "enabled": true,
  "outputToFile": true,
  "outputToConsole": true,
  "includeGridSnapshots": false,
  "filePath": "./audit_logs",
  "verbosityLevel": "standard"
}
```

### Phase 4: Testing & Validation (Priority: HIGH)

#### 4.1 Unit Tests

**Create:** `tests/audit/AuditLogger.test.ts`

Test cases:
- ✓ Logger captures all cell changes
- ✓ Statistics are calculated correctly
- ✓ JSON export is valid and parseable
- ✓ Console output formats correctly
- ✓ Performance overhead is <5%
- ✓ Works with disabled config (no-op)
- ✓ Handles concurrent puzzle solving
- ✓ File writing handles errors gracefully

#### 4.2 Integration Tests

**Add to:** `tests/BasicSudokuSolverLogic.feature`

```gherkin
Feature: Audit Trail Logging

  Scenario: Generate complete audit trail for solved puzzle
    Given the "Easy Scan Grid" puzzle is loaded
    And audit logging is enabled
    When the solver attempts to solve it
    Then an audit trail should be generated
    And the audit trail should contain all cell changes
    And the audit file should be valid JSON
    And the statistics should match the solving results

  Scenario: Audit trail tracks algorithm attribution correctly
    Given a puzzle requiring all three algorithms
    And audit logging is enabled
    When the solver runs
    Then each change should be attributed to the correct algorithm
    And the statistics should show counts for each algorithm

  Scenario: Performance with audit logging enabled
    Given audit logging is enabled
    When solving 10 puzzles
    Then the total time should be <5% slower than without logging
```

---

## File Structure

```
demo-apps/demoapp001-typescript-cypress/
├── app_src/
│   ├── audit/
│   │   ├── AuditLogger.ts          # Core audit logger
│   │   ├── AuditTypes.ts           # TypeScript interfaces
│   │   ├── AuditFormatter.ts       # Console/text formatters
│   │   └── index.ts                # Barrel export
│   ├── SudokuSolver.ts             # Modified: add audit hooks
│   ├── SudokuOrchestrator.ts       # Modified: integrate logger
│   └── index.ts                    # Modified: configure audit
├── audit_logs/                      # Generated audit files
│   └── .gitkeep
├── audit_config.json                # Audit configuration
├── tests/
│   └── audit/
│       ├── AuditLogger.test.ts
│       └── AuditIntegration.test.ts
└── package.json                     # Add fs-extra dependency
```

---

## Configuration Options

### AuditConfig Interface

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `false` | Master switch for audit logging |
| `outputToFile` | boolean | `true` | Save audit trail to JSON file |
| `outputToConsole` | boolean | `false` | Print summary to console |
| `includeGridSnapshots` | boolean | `false` | Include full grid state after each change (verbose) |
| `filePath` | string | `"./audit_logs"` | Directory for audit log files |
| `verbosityLevel` | enum | `"standard"` | `"minimal"` \| `"standard"` \| `"detailed"` |

### Environment Variable Support

```bash
# Enable audit logging via environment variable
SUDOKU_AUDIT_ENABLED=true
SUDOKU_AUDIT_PATH=./custom_audit_logs
SUDOKU_AUDIT_VERBOSITY=detailed

npm start
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Snapshots**: Only capture grid snapshots when explicitly requested
2. **Batch Writes**: Buffer changes and write to file at end, not per-change
3. **Conditional Logic**: Use early returns when logging is disabled
4. **Minimal Cloning**: Only deep-copy grid when absolutely necessary
5. **Async File I/O**: Use async file operations to not block solver

### Performance Targets

| Operation | Target | Measurement Method |
|-----------|--------|-------------------|
| Change logging | <1ms per change | Micro-benchmark |
| JSON export | <50ms per puzzle | Integration test |
| Total overhead | <5% | Compare solve times with/without audit |

---

## Security Considerations

1. **File System Access**: Validate and sanitize file paths
2. **Disk Space**: Implement max file size limits and rotation
3. **Sensitive Data**: No sensitive data in this context, but plan for future
4. **Error Handling**: Gracefully handle file write failures without crashing solver

---

## Future Enhancements

### Phase 5: Advanced Features (FUTURE)

1. **Replay Functionality**: Load audit trail and replay solving steps
2. **Visual Diff Tool**: HTML visualization showing grid changes over time
3. **Performance Profiling**: Track time spent in each algorithm
4. **Comparison Tool**: Compare audit trails from different solver versions
5. **Export Formats**: Support CSV, HTML, Markdown output
6. **Streaming Output**: Real-time streaming for long-running solves
7. **Cloud Storage**: Optional upload to cloud storage (S3, Azure Blob)

---

## Implementation Checklist

### Phase 1 (Core Infrastructure)
- [ ] Create `AuditTypes.ts` with all interfaces
- [ ] Implement `AuditLogger` class
- [ ] Add audit hooks to `SudokuSolver.unitCompletion()`
- [ ] Add audit hooks to `SudokuSolver.hiddenSingles()`
- [ ] Add audit hooks to `SudokuSolver.nakedSingles()`
- [ ] Integrate `AuditLogger` in `SudokuOrchestrator`
- [ ] Add `fs-extra` dependency to `package.json`

### Phase 2 (Output Formatting)
- [ ] Implement JSON file export
- [ ] Create `AuditFormatter` for console output
- [ ] Add summary format
- [ ] Add detailed format
- [ ] Create `audit_logs/` directory structure

### Phase 3 (Configuration)
- [ ] Update `index.ts` with audit config
- [ ] Create `audit_config.json` file
- [ ] Add environment variable support
- [ ] Update README with audit instructions

### Phase 4 (Testing)
- [ ] Write unit tests for `AuditLogger`
- [ ] Write integration tests
- [ ] Update feature file with audit scenarios
- [ ] Performance benchmarking
- [ ] Validate JSON schema

### Documentation
- [ ] Update README.md with audit feature section
- [ ] Add audit examples to documentation
- [ ] Create troubleshooting guide
- [ ] Document configuration options

---

## Example Usage

### Basic Usage (Code)

```typescript
import { SudokuSolver } from "./SudokuSolver";
import { SudokuOrchestrator } from "./SudokuOrchestrator";
import { PuzzleLoader } from "./PuzzleLoader";

// Load puzzle
const loader = new PuzzleLoader("../puzzles.json");
const puzzle = loader.getPuzzleByName("Easy Scan Grid");

// Create solver with audit enabled
const solver = new SudokuSolver(puzzle.name, puzzle.grid);
const orchestrator = new SudokuOrchestrator(solver, {
    enabled: true,
    outputToFile: true,
    outputToConsole: true
});

// Solve and get audit trail
const status = orchestrator.solve();
const trail = orchestrator.getAuditTrail();

console.log(`Status: ${status}`);
console.log(`Total changes: ${trail.totalChanges}`);
console.log(`Audit saved to: audit_logs/${puzzle.name}_${timestamp}.json`);
```

### CLI Usage

```bash
# Enable audit with default settings
SUDOKU_AUDIT_ENABLED=true npm start

# Enable with custom path and detailed output
SUDOKU_AUDIT_ENABLED=true \
SUDOKU_AUDIT_PATH=./my_audits \
SUDOKU_AUDIT_VERBOSITY=detailed \
npm start
```

---

## Acceptance Criteria

✅ **Must Have (MVP)**
- [ ] All cell changes are logged with algorithm attribution
- [ ] JSON file export works correctly
- [ ] Console summary output is readable
- [ ] Performance overhead is <5%
- [ ] Works seamlessly with existing code (no breaking changes)
- [ ] Can be disabled with zero overhead

✅ **Should Have**
- [ ] Configuration file support
- [ ] Environment variable support
- [ ] Statistics calculation
- [ ] Error handling for file I/O

✅ **Nice to Have**
- [ ] Grid snapshots in detailed mode
- [ ] HTML visualization export
- [ ] Replay functionality

---

## Conclusion

This design provides a comprehensive, extensible audit trail system that:
1. Seamlessly integrates with existing solver architecture
2. Provides multiple output formats for different use cases
3. Maintains high performance with minimal overhead
4. Supports future enhancements and extensions
5. Enables debugging, testing, and educational use cases

The phased implementation approach allows for incremental development and testing, with Phase 1 providing immediate value and later phases adding enhanced capabilities.
