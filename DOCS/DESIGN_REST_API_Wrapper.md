# REST API Wrapper for Sudoku Solver - Design Document

## Overview

This document outlines the design for a RESTful API that wraps the Sudoku Solver, providing HTTP endpoints to execute solving techniques individually or run the complete solving loop. The API will expose the three fundamental solving techniques (Unit Completion, Hidden Singles, Naked Singles) as separate endpoints and provide a main solve endpoint.

## Goals

1. **Modularity**: Enable calling individual solving techniques independently
2. **Transparency**: Return detailed before/after state deltas for each operation
3. **Flexibility**: Support both step-by-step execution and full solve operations
4. **Integration**: Easy integration with web frontends, testing tools, or automation scripts
5. **Stateless Design**: Each request is independent (with optional stateful session support)
6. **Educational**: Enable visualization and understanding of each technique

## Requirements

### Functional Requirements

1. **Technique Endpoints**: Individual endpoints for each solving technique
   - `/api/techniques/unit-completion`
   - `/api/techniques/hidden-singles`
   - `/api/techniques/naked-singles`

2. **Solve Endpoint**: Full solver orchestration
   - `/api/solve`

3. **Response Format**: JSON responses with:
   - Before/after grid states
   - Cell changes (deltas)
   - Success/failure status
   - Descriptive messages
   - Metadata (timestamp, duration, etc.)

4. **Grid Management**:
   - Accept grid as request body
   - Validate grid dimensions and values
   - Return modified grid

5. **Error Handling**:
   - Invalid grid format
   - Invalid cell values
   - Server errors

### Non-Functional Requirements

1. **Performance**: <100ms response time for technique endpoints, <500ms for solve endpoint
2. **Scalability**: Support concurrent requests from multiple clients
3. **Reliability**: 99.9% uptime with proper error handling
4. **Documentation**: OpenAPI/Swagger specification
5. **CORS**: Support cross-origin requests for web frontend integration
6. **Rate Limiting**: Prevent API abuse

---

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REST API Layer                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │Unit Complete │Hidden Singles│Naked Singles │  Solve   │ │
│  │  Endpoint    │   Endpoint   │   Endpoint   │ Endpoint │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴────┬─────┘ │
└─────────┼──────────────┼──────────────┼─────────────┼───────┘
          │              │              │             │
          ▼              ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│              SudokuApiService (Business Logic)              │
│  - Grid validation                                          │
│  - Technique execution                                      │
│  - Delta computation                                        │
│  - Response formatting                                      │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Existing Sudoku Solver Components              │
│  ┌─────────────────┬──────────────────┬──────────────────┐ │
│  │  SudokuSolver   │SudokuOrchestrator│  PuzzleLoader    │ │
│  └─────────────────┴──────────────────┴──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Validation**: Joi or Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Rate Limiting**: express-rate-limit
- **CORS**: cors middleware

---

## API Specification

### Base URL

```
http://localhost:3000/api
```

### API Endpoints

#### 1. Unit Completion Endpoint

**Endpoint**: `POST /api/techniques/unit-completion`

**Description**: Executes the Unit Completion algorithm on the provided grid.

**Request Body**:
```json
{
  "grid": [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    // ... 9 rows total
  ],
  "options": {
    "includeReason": true,
    "returnGridSnapshot": true
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "technique": "UnitCompletion",
  "changed": true,
  "message": "Found 2 cells to complete",
  "timestamp": "2026-01-27T10:30:45.123Z",
  "durationMs": 5,
  "changes": [
    {
      "cell": {"row": 0, "col": 2},
      "oldValue": 0,
      "newValue": 4,
      "reason": "Last empty cell in row 0"
    },
    {
      "cell": {"row": 5, "col": 8},
      "oldValue": 0,
      "newValue": 6,
      "reason": "Last empty cell in block (1,2)"
    }
  ],
  "gridBefore": [[5,3,0,...], ...],
  "gridAfter": [[5,3,4,...], ...]
}
```

**No Changes Response** (200 OK):
```json
{
  "success": true,
  "technique": "UnitCompletion",
  "changed": false,
  "message": "No units with exactly one empty cell found",
  "timestamp": "2026-01-27T10:30:45.123Z",
  "durationMs": 3,
  "changes": [],
  "gridBefore": [[5,3,4,...], ...],
  "gridAfter": [[5,3,4,...], ...]
}
```

---

#### 2. Hidden Singles Endpoint

**Endpoint**: `POST /api/techniques/hidden-singles`

**Description**: Executes the Hidden Singles algorithm for a specific target number.

**Request Body**:
```json
{
  "grid": [[...], ...],
  "targetNumber": 5,
  "options": {
    "includeReason": true,
    "returnGridSnapshot": true
  }
}
```

**Note**: If `targetNumber` is not provided, the algorithm will scan all digits 1-9.

**Success Response** (200 OK):
```json
{
  "success": true,
  "technique": "HiddenSingles",
  "changed": true,
  "message": "Placed 5 in 1 location",
  "timestamp": "2026-01-27T10:30:46.123Z",
  "durationMs": 4,
  "targetNumber": 5,
  "changes": [
    {
      "cell": {"row": 2, "col": 3},
      "oldValue": 0,
      "newValue": 5,
      "reason": "Only valid location for 5 in block (0,1)"
    }
  ],
  "gridBefore": [[...], ...],
  "gridAfter": [[...], ...]
}
```

**No Changes Response** (200 OK):
```json
{
  "success": true,
  "technique": "HiddenSingles",
  "changed": false,
  "message": "No hidden singles found for digit 5",
  "timestamp": "2026-01-27T10:30:46.123Z",
  "durationMs": 2,
  "targetNumber": 5,
  "changes": [],
  "gridBefore": [[...], ...],
  "gridAfter": [[...], ...]
}
```

---

#### 3. Naked Singles Endpoint

**Endpoint**: `POST /api/techniques/naked-singles`

**Description**: Executes the Naked Singles algorithm on the provided grid.

**Request Body**:
```json
{
  "grid": [[...], ...],
  "options": {
    "includeReason": true,
    "returnGridSnapshot": true
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "technique": "NakedSingles",
  "changed": true,
  "message": "Found 3 naked singles",
  "timestamp": "2026-01-27T10:30:47.123Z",
  "durationMs": 8,
  "changes": [
    {
      "cell": {"row": 4, "col": 4},
      "oldValue": 0,
      "newValue": 9,
      "reason": "Only candidate remaining after eliminating 1,2,3,4,5,6,7,8"
    },
    {
      "cell": {"row": 6, "col": 1},
      "oldValue": 0,
      "newValue": 2,
      "reason": "Only candidate remaining after eliminating 1,3,4,5,6,7,8,9"
    }
  ],
  "gridBefore": [[...], ...],
  "gridAfter": [[...], ...]
}
```

---

#### 4. Solve Endpoint

**Endpoint**: `POST /api/solve`

**Description**: Executes the full solving loop using all three techniques.

**Request Body**:
```json
{
  "grid": [[...], ...],
  "options": {
    "maxIterations": 100,
    "includeIterationHistory": false,
    "returnGridSnapshot": true
  }
}
```

**Success Response - Solved** (200 OK):
```json
{
  "success": true,
  "status": "SOLVED",
  "message": "Puzzle solved successfully",
  "timestamp": "2026-01-27T10:30:50.123Z",
  "durationMs": 45,
  "iterations": 12,
  "totalChanges": 51,
  "statistics": {
    "changesByAlgorithm": {
      "unitCompletion": 15,
      "hiddenSingles": 28,
      "nakedSingles": 8
    }
  },
  "gridBefore": [[5,3,0,0,7,0,0,0,0], ...],
  "gridAfter": [[5,3,4,6,7,8,9,1,2], ...],
  "iterationHistory": []
}
```

**Success Response - Stuck** (200 OK):
```json
{
  "success": true,
  "status": "STUCK_ON_ADVANCED_LOGIC",
  "message": "Basic techniques insufficient. Advanced techniques required.",
  "timestamp": "2026-01-27T10:30:51.123Z",
  "durationMs": 32,
  "iterations": 8,
  "totalChanges": 35,
  "statistics": {
    "changesByAlgorithm": {
      "unitCompletion": 10,
      "hiddenSingles": 20,
      "nakedSingles": 5
    }
  },
  "gridBefore": [[0,0,0,7,0,0,0,0,0], ...],
  "gridAfter": [[8,6,4,7,1,5,9,2,3], ...],
  "emptyCells": 46
}
```

---

#### 5. Validate Grid Endpoint

**Endpoint**: `POST /api/validate`

**Description**: Validates a grid without solving it.

**Request Body**:
```json
{
  "grid": [[...], ...]
}
```

**Success Response** (200 OK):
```json
{
  "valid": true,
  "message": "Grid is valid",
  "dimensions": "9x9",
  "emptyCells": 51,
  "conflicts": []
}
```

**Invalid Response** (200 OK):
```json
{
  "valid": false,
  "message": "Grid has conflicts",
  "dimensions": "9x9",
  "emptyCells": 51,
  "conflicts": [
    {
      "type": "duplicate_in_row",
      "row": 0,
      "value": 5,
      "cells": [{"row": 0, "col": 1}, {"row": 0, "col": 5}]
    }
  ]
}
```

---

#### 6. Load Puzzle Endpoint

**Endpoint**: `GET /api/puzzles`

**Description**: Lists available puzzles from puzzles.json.

**Success Response** (200 OK):
```json
{
  "puzzles": [
    {
      "name": "Easy Scan Grid",
      "difficulty": "easy",
      "description": "Solvable with basic techniques"
    },
    {
      "name": "Logic Squeeze Grid",
      "difficulty": "medium",
      "description": "Requires all three techniques"
    }
  ],
  "count": 4
}
```

**Endpoint**: `GET /api/puzzles/:name`

**Description**: Gets a specific puzzle by name.

**Success Response** (200 OK):
```json
{
  "name": "Easy Scan Grid",
  "difficulty": "easy",
  "description": "Solvable with basic techniques",
  "grid": [[5,3,0,0,7,0,0,0,0], ...]
}
```

---

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "INVALID_GRID_FORMAT",
  "message": "Grid must be a 9x9 array of numbers 0-9",
  "details": {
    "field": "grid",
    "receivedRows": 8,
    "expectedRows": 9
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "PUZZLE_NOT_FOUND",
  "message": "Puzzle 'Invalid Name' not found",
  "availablePuzzles": ["Easy Scan Grid", "Logic Squeeze Grid", ...]
}
```

#### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": "INVALID_TARGET_NUMBER",
  "message": "targetNumber must be between 1 and 9",
  "details": {
    "field": "targetNumber",
    "received": 10,
    "expected": "1-9"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "uuid-123-456"
}
```

---

## Data Models

### TypeScript Interfaces

```typescript
// Request Models
interface GridRequest {
  grid: number[][];
  options?: RequestOptions;
}

interface HiddenSinglesRequest extends GridRequest {
  targetNumber?: number; // 1-9, optional (if omitted, scan all)
}

interface SolveRequest extends GridRequest {
  options?: SolveOptions;
}

interface RequestOptions {
  includeReason?: boolean;
  returnGridSnapshot?: boolean;
}

interface SolveOptions extends RequestOptions {
  maxIterations?: number;
  includeIterationHistory?: boolean;
}

// Response Models
interface TechniqueResponse {
  success: boolean;
  technique: 'UnitCompletion' | 'HiddenSingles' | 'NakedSingles';
  changed: boolean;
  message: string;
  timestamp: string;
  durationMs: number;
  changes: CellChange[];
  gridBefore?: number[][];
  gridAfter?: number[][];
  targetNumber?: number; // For HiddenSingles
}

interface SolveResponse {
  success: boolean;
  status: 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC';
  message: string;
  timestamp: string;
  durationMs: number;
  iterations: number;
  totalChanges: number;
  statistics: Statistics;
  gridBefore?: number[][];
  gridAfter: number[][];
  emptyCells?: number;
  iterationHistory?: IterationSnapshot[];
}

interface CellChange {
  cell: { row: number; col: number };
  oldValue: number;
  newValue: number;
  reason?: string;
}

interface Statistics {
  changesByAlgorithm: {
    unitCompletion: number;
    hiddenSingles: number;
    nakedSingles: number;
  };
}

interface IterationSnapshot {
  iteration: number;
  algorithm: string;
  changesMade: number;
  gridState: number[][];
}

interface ValidationResponse {
  valid: boolean;
  message: string;
  dimensions: string;
  emptyCells: number;
  conflicts: Conflict[];
}

interface Conflict {
  type: 'duplicate_in_row' | 'duplicate_in_column' | 'duplicate_in_block';
  row?: number;
  col?: number;
  block?: { row: number; col: number };
  value: number;
  cells: { row: number; col: number }[];
}
```

---

## Implementation Strategy

### Phase 1: Core API Infrastructure (Priority: HIGH)

**Files to Create:**
- `api/server.ts` - Express server setup
- `api/routes/techniques.routes.ts` - Technique endpoints
- `api/routes/solve.routes.ts` - Solve endpoint
- `api/routes/puzzles.routes.ts` - Puzzle management endpoints
- `api/controllers/TechniqueController.ts` - Request handling
- `api/controllers/SolveController.ts` - Solve logic
- `api/services/SudokuApiService.ts` - Business logic
- `api/middleware/validation.middleware.ts` - Request validation
- `api/middleware/error.middleware.ts` - Error handling
- `api/utils/gridValidator.ts` - Grid validation utilities
- `api/utils/responseFormatter.ts` - Response formatting
- `api/types/api.types.ts` - TypeScript interfaces

**Files to Modify:**
- `package.json` - Add Express, CORS, validation dependencies

#### 1.1 Create Express Server

```typescript
// api/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { techniqueRoutes } from './routes/techniques.routes';
import { solveRoutes } from './routes/solve.routes';
import { puzzleRoutes } from './routes/puzzles.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // JSON parsing

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/techniques', techniqueRoutes);
app.use('/api', solveRoutes);
app.use('/api/puzzles', puzzleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Sudoku API Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
```

#### 1.2 Create SudokuApiService

```typescript
// api/services/SudokuApiService.ts
import { SudokuSolver } from '../../app_src/SudokuSolver';
import { SudokuOrchestrator } from '../../app_src/SudokuOrchestrator';
import { TechniqueResponse, SolveResponse, CellChange } from '../types/api.types';

export class SudokuApiService {
  /**
   * Executes Unit Completion technique
   */
  public static executeUnitCompletion(
    grid: number[][],
    includeReason: boolean = true
  ): TechniqueResponse {
    const startTime = Date.now();
    const gridBefore = grid.map(row => [...row]);

    const solver = new SudokuSolver('api-request', grid);
    const changeTracker = new ChangeTracker(solver.grid);

    const changed = solver.unitCompletion();
    const changes = changeTracker.getChanges(solver.grid, includeReason);

    return {
      success: true,
      technique: 'UnitCompletion',
      changed,
      message: changed
        ? `Found ${changes.length} cell(s) to complete`
        : 'No units with exactly one empty cell found',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      changes,
      gridBefore,
      gridAfter: solver.grid
    };
  }

  /**
   * Executes Hidden Singles technique
   */
  public static executeHiddenSingles(
    grid: number[][],
    targetNumber?: number,
    includeReason: boolean = true
  ): TechniqueResponse {
    const startTime = Date.now();
    const gridBefore = grid.map(row => [...row]);

    const solver = new SudokuSolver('api-request', grid);
    const changeTracker = new ChangeTracker(solver.grid);

    let changed = false;
    if (targetNumber) {
      changed = solver.hiddenSingles(targetNumber);
    } else {
      // Scan all digits 1-9
      for (let i = 1; i <= 9; i++) {
        if (solver.hiddenSingles(i)) {
          changed = true;
        }
      }
    }

    const changes = changeTracker.getChanges(solver.grid, includeReason);

    return {
      success: true,
      technique: 'HiddenSingles',
      changed,
      message: changed
        ? `Placed ${changes.length} digit(s)`
        : `No hidden singles found${targetNumber ? ` for digit ${targetNumber}` : ''}`,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      changes,
      gridBefore,
      gridAfter: solver.grid,
      targetNumber
    };
  }

  /**
   * Executes Naked Singles technique
   */
  public static executeNakedSingles(
    grid: number[][],
    includeReason: boolean = true
  ): TechniqueResponse {
    const startTime = Date.now();
    const gridBefore = grid.map(row => [...row]);

    const solver = new SudokuSolver('api-request', grid);
    const changeTracker = new ChangeTracker(solver.grid);

    const changed = solver.nakedSingles();
    const changes = changeTracker.getChanges(solver.grid, includeReason);

    return {
      success: true,
      technique: 'NakedSingles',
      changed,
      message: changed
        ? `Found ${changes.length} naked single(s)`
        : 'No naked singles found',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      changes,
      gridBefore,
      gridAfter: solver.grid
    };
  }

  /**
   * Executes full solve
   */
  public static executeSolve(
    grid: number[][],
    options: { maxIterations?: number; includeIterationHistory?: boolean } = {}
  ): SolveResponse {
    const startTime = Date.now();
    const gridBefore = grid.map(row => [...row]);

    const solver = new SudokuSolver('api-request', grid);
    const orchestrator = new SudokuOrchestrator(solver);

    const status = orchestrator.solve();
    const totalChanges = this.countChanges(gridBefore, solver.grid);

    return {
      success: true,
      status: status as 'SOLVED' | 'STUCK_ON_ADVANCED_LOGIC',
      message: status === 'SOLVED'
        ? 'Puzzle solved successfully'
        : 'Basic techniques insufficient. Advanced techniques required.',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      iterations: 0, // TODO: Track iterations in orchestrator
      totalChanges,
      statistics: {
        changesByAlgorithm: {
          unitCompletion: 0,
          hiddenSingles: 0,
          nakedSingles: 0
        }
      },
      gridBefore,
      gridAfter: solver.grid,
      emptyCells: status === 'STUCK_ON_ADVANCED_LOGIC'
        ? this.countEmptyCells(solver.grid)
        : undefined
    };
  }

  private static countChanges(before: number[][], after: number[][]): number {
    let count = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (before[r][c] !== after[r][c]) count++;
      }
    }
    return count;
  }

  private static countEmptyCells(grid: number[][]): number {
    return grid.flat().filter(cell => cell === 0).length;
  }
}

/**
 * Helper class to track changes between grid states
 */
class ChangeTracker {
  private before: number[][];

  constructor(grid: number[][]) {
    this.before = grid.map(row => [...row]);
  }

  public getChanges(after: number[][], includeReason: boolean): CellChange[] {
    const changes: CellChange[] = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.before[r][c] !== after[r][c]) {
          changes.push({
            cell: { row: r, col: c },
            oldValue: this.before[r][c],
            newValue: after[r][c],
            reason: includeReason ? this.inferReason(r, c, after[r][c]) : undefined
          });
        }
      }
    }

    return changes;
  }

  private inferReason(row: number, col: number, value: number): string {
    // TODO: Enhance with actual logic tracking
    return `Cell [${row},${col}] set to ${value}`;
  }
}
```

#### 1.3 Create Route Handlers

```typescript
// api/routes/techniques.routes.ts
import express from 'express';
import { TechniqueController } from '../controllers/TechniqueController';
import { validateGrid, validateHiddenSingles } from '../middleware/validation.middleware';

const router = express.Router();

router.post('/unit-completion', validateGrid, TechniqueController.unitCompletion);
router.post('/hidden-singles', validateHiddenSingles, TechniqueController.hiddenSingles);
router.post('/naked-singles', validateGrid, TechniqueController.nakedSingles);

export { router as techniqueRoutes };
```

```typescript
// api/controllers/TechniqueController.ts
import { Request, Response, NextFunction } from 'express';
import { SudokuApiService } from '../services/SudokuApiService';

export class TechniqueController {
  public static unitCompletion(req: Request, res: Response, next: NextFunction): void {
    try {
      const { grid, options } = req.body;
      const result = SudokuApiService.executeUnitCompletion(
        grid,
        options?.includeReason ?? true
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public static hiddenSingles(req: Request, res: Response, next: NextFunction): void {
    try {
      const { grid, targetNumber, options } = req.body;
      const result = SudokuApiService.executeHiddenSingles(
        grid,
        targetNumber,
        options?.includeReason ?? true
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public static nakedSingles(req: Request, res: Response, next: NextFunction): void {
    try {
      const { grid, options } = req.body;
      const result = SudokuApiService.executeNakedSingles(
        grid,
        options?.includeReason ?? true
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

#### 1.4 Create Validation Middleware

```typescript
// api/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { GridValidator } from '../utils/gridValidator';

export function validateGrid(req: Request, res: Response, next: NextFunction): void {
  const { grid } = req.body;

  if (!grid) {
    res.status(400).json({
      success: false,
      error: 'MISSING_GRID',
      message: 'Grid is required in request body'
    });
    return;
  }

  const validation = GridValidator.validate(grid);
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: 'INVALID_GRID_FORMAT',
      message: validation.message,
      details: validation.details
    });
    return;
  }

  next();
}

export function validateHiddenSingles(req: Request, res: Response, next: NextFunction): void {
  validateGrid(req, res, () => {
    const { targetNumber } = req.body;

    if (targetNumber !== undefined) {
      if (!Number.isInteger(targetNumber) || targetNumber < 1 || targetNumber > 9) {
        res.status(422).json({
          success: false,
          error: 'INVALID_TARGET_NUMBER',
          message: 'targetNumber must be an integer between 1 and 9',
          details: {
            field: 'targetNumber',
            received: targetNumber,
            expected: '1-9'
          }
        });
        return;
      }
    }

    next();
  });
}
```

---

### Phase 2: Documentation & Testing (Priority: HIGH)

#### 2.1 OpenAPI/Swagger Documentation

**Create**: `api/swagger.ts`

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sudoku Solver API',
      version: '1.0.0',
      description: 'REST API for Sudoku solving techniques',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./api/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
export const swaggerUiSetup = swaggerUi.setup(specs);
export const swaggerUiServe = swaggerUi.serve;
```

#### 2.2 Integration Tests

**Create**: `api/tests/api.integration.test.ts`

```typescript
import request from 'supertest';
import app from '../server';

describe('Technique Endpoints', () => {
  const sampleGrid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  describe('POST /api/techniques/unit-completion', () => {
    it('should execute unit completion successfully', async () => {
      const response = await request(app)
        .post('/api/techniques/unit-completion')
        .send({ grid: sampleGrid })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.technique).toBe('UnitCompletion');
      expect(response.body).toHaveProperty('changed');
      expect(response.body).toHaveProperty('changes');
      expect(response.body).toHaveProperty('gridAfter');
    });

    it('should return 400 for invalid grid', async () => {
      const response = await request(app)
        .post('/api/techniques/unit-completion')
        .send({ grid: [[1, 2, 3]] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_GRID_FORMAT');
    });
  });

  describe('POST /api/techniques/hidden-singles', () => {
    it('should execute hidden singles for specific digit', async () => {
      const response = await request(app)
        .post('/api/techniques/hidden-singles')
        .send({ grid: sampleGrid, targetNumber: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.technique).toBe('HiddenSingles');
      expect(response.body.targetNumber).toBe(1);
    });

    it('should return 422 for invalid target number', async () => {
      const response = await request(app)
        .post('/api/techniques/hidden-singles')
        .send({ grid: sampleGrid, targetNumber: 10 })
        .expect(422);

      expect(response.body.error).toBe('INVALID_TARGET_NUMBER');
    });
  });

  describe('POST /api/solve', () => {
    it('should solve puzzle successfully', async () => {
      const response = await request(app)
        .post('/api/solve')
        .send({ grid: sampleGrid })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(['SOLVED', 'STUCK_ON_ADVANCED_LOGIC']).toContain(response.body.status);
      expect(response.body).toHaveProperty('iterations');
      expect(response.body).toHaveProperty('totalChanges');
    });
  });
});
```

---

### Phase 3: Deployment & Configuration (Priority: MEDIUM)

#### 3.1 Environment Configuration

**Create**: `.env`
```
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
```

#### 3.2 Docker Support

**Create**: `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/api/server.js"]
```

**Create**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  sudoku-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

---

## File Structure

```
DEMOAPPS/DEMOAPP001_TYPESCRIPT_CYPRESS/
├── api/
│   ├── server.ts                           # Express server setup
│   ├── routes/
│   │   ├── techniques.routes.ts            # Technique endpoints
│   │   ├── solve.routes.ts                 # Solve endpoint
│   │   └── puzzles.routes.ts               # Puzzle management
│   ├── controllers/
│   │   ├── TechniqueController.ts
│   │   ├── SolveController.ts
│   │   └── PuzzleController.ts
│   ├── services/
│   │   └── SudokuApiService.ts             # Business logic
│   ├── middleware/
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── auth.middleware.ts (optional)
│   ├── utils/
│   │   ├── gridValidator.ts
│   │   └── responseFormatter.ts
│   ├── types/
│   │   └── api.types.ts                    # TypeScript interfaces
│   ├── tests/
│   │   ├── api.integration.test.ts
│   │   └── services.unit.test.ts
│   └── swagger.ts                          # API documentation
├── app_src/                                 # Existing solver code
├── .env                                     # Environment variables
├── Dockerfile
├── docker-compose.yml
└── package.json                             # Add Express dependencies
```

---

## Configuration Options

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | `3000` | Server port |
| `NODE_ENV` | string | `development` | Environment (development/production) |
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | Rate limit time window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | number | `100` | Max requests per window |
| `CORS_ORIGIN` | string | `*` | Allowed CORS origins |
| `LOG_LEVEL` | string | `info` | Logging level |

---

## Performance Considerations

### Targets

| Endpoint | Target Response Time | Complexity |
|----------|---------------------|------------|
| Unit Completion | <50ms | O(n) |
| Hidden Singles | <100ms | O(n) |
| Naked Singles | <150ms | O(n²) |
| Solve | <500ms | O(n² × iterations) |

### Optimization Strategies

1. **Grid Cloning**: Use efficient array spread operators
2. **Change Tracking**: Only compute deltas when requested
3. **Stateless Design**: No server-side session state
4. **Connection Pooling**: Reuse HTTP connections
5. **Compression**: Enable gzip compression for responses

---

## Security Considerations

1. **Input Validation**: Strict validation of all grid inputs
2. **Rate Limiting**: Prevent API abuse (100 requests per 15 minutes)
3. **CORS**: Configure allowed origins
4. **Helmet**: Security headers for common vulnerabilities
5. **Error Sanitization**: Don't expose stack traces in production
6. **Request Size Limits**: Limit JSON body size (100kb max)

---

## Implementation Checklist

### Phase 1 (Core API)
- [ ] Set up Express server with TypeScript
- [ ] Create route handlers for all endpoints
- [ ] Implement SudokuApiService
- [ ] Create validation middleware
- [ ] Create error handling middleware
- [ ] Add CORS and security middleware
- [ ] Implement grid validation utilities
- [ ] Create response formatting utilities
- [ ] Add all TypeScript interfaces

### Phase 2 (Documentation & Testing)
- [ ] Set up Swagger/OpenAPI documentation
- [ ] Write integration tests for all endpoints
- [ ] Write unit tests for SudokuApiService
- [ ] Add request/response examples to docs
- [ ] Create Postman collection

### Phase 3 (Deployment)
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Add environment variable support
- [ ] Configure logging
- [ ] Add health check endpoint
- [ ] Deploy to cloud platform (optional)

### Phase 4 (Enhancements)
- [ ] Add WebSocket support for real-time solving
- [ ] Add authentication (JWT)
- [ ] Add request/response caching
- [ ] Add metrics/monitoring (Prometheus)
- [ ] Add API versioning (/api/v1/)

---

## Example Usage

### Using cURL

```bash
# Unit Completion
curl -X POST http://localhost:3000/api/techniques/unit-completion \
  -H "Content-Type: application/json" \
  -d '{
    "grid": [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]],
    "options": {
      "includeReason": true,
      "returnGridSnapshot": true
    }
  }'

# Hidden Singles for digit 5
curl -X POST http://localhost:3000/api/techniques/hidden-singles \
  -H "Content-Type: application/json" \
  -d '{
    "grid": [[...], ...],
    "targetNumber": 5
  }'

# Full Solve
curl -X POST http://localhost:3000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "grid": [[...], ...]
  }'
```

### Using JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Execute Unit Completion
const unitCompletion = async (grid: number[][]) => {
  const response = await axios.post(`${API_BASE}/techniques/unit-completion`, {
    grid,
    options: {
      includeReason: true,
      returnGridSnapshot: true
    }
  });
  return response.data;
};

// Execute Full Solve
const solve = async (grid: number[][]) => {
  const response = await axios.post(`${API_BASE}/solve`, { grid });
  return response.data;
};
```

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] All three technique endpoints working correctly
- [ ] Solve endpoint returns solved grid or stuck status
- [ ] Proper error handling for invalid inputs
- [ ] Delta (before/after) in responses
- [ ] OpenAPI/Swagger documentation
- [ ] Response time <500ms for solve endpoint
- [ ] CORS support for frontend integration

### Should Have
- [ ] Rate limiting implemented
- [ ] Integration tests with >80% coverage
- [ ] Docker containerization
- [ ] Environment configuration
- [ ] Health check endpoint
- [ ] Request validation with descriptive errors

### Nice to Have
- [ ] WebSocket support for real-time solving
- [ ] Authentication/authorization
- [ ] Metrics and monitoring
- [ ] API versioning
- [ ] Response caching

---

## Conclusion

This REST API design provides a comprehensive, production-ready wrapper around the Sudoku Solver with:
1. Individual endpoints for each solving technique
2. Detailed before/after deltas in JSON responses
3. Full orchestrated solve endpoint
4. Robust validation and error handling
5. OpenAPI documentation
6. Docker deployment support
7. Security best practices (rate limiting, CORS, helmet)

The phased implementation allows for incremental development, with Phase 1 providing core functionality and later phases adding enterprise features.
