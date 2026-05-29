import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import path from 'path';
import { ApiError } from './errors';
import { SolveStepTracker } from './SolveStepTracker';
import { SudokuApiService } from './SudokuApiService';
import { ErrorResponse } from './types';
import { parseGridRequest, parseHiddenSinglesRequest, parseSolveRequest } from './validation';

export function createApp(
  service: SudokuApiService = new SudokuApiService(),
  tracker: SolveStepTracker = new SolveStepTracker()
): express.Express {
  const app = express();

  app.use(corsHeaders);
  app.use(express.json({ limit: '100kb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post(
    '/api/techniques/unit-completion',
    route((req, res) => {
      const request = parseGridRequest(req.body);
      res.json(service.executeUnitCompletion(request.grid, request.options));
    })
  );

  app.post(
    '/api/techniques/hidden-singles',
    route((req, res) => {
      const request = parseHiddenSinglesRequest(req.body);
      res.json(service.executeHiddenSingles(request.grid, request.targetNumber, request.options));
    })
  );

  app.post(
    '/api/techniques/naked-singles',
    route((req, res) => {
      const request = parseGridRequest(req.body);
      res.json(service.executeNakedSingles(request.grid, request.options));
    })
  );

  app.post(
    '/api/solve',
    route((req, res) => {
      const request = parseSolveRequest(req.body);
      res.json(service.executeSolve(request.grid, request.options));
    })
  );

  app.post(
    '/api/validate',
    route((req, res) => {
      const request = parseGridRequest(req.body);
      res.json(service.validateGrid(request.grid));
    })
  );

  app.get(
    '/api/puzzles',
    route((_req, res) => {
      res.json(service.listPuzzles());
    })
  );

  app.get(
    '/api/puzzles/:name',
    route((req, res) => {
      res.json(service.getPuzzleByName(firstParam(req.params.name)));
    })
  );

  app.get(
    '/api/visualise/:name',
    route((req, res) => {
      res.json(tracker.trackSolve(decodeURIComponent(firstParam(req.params.name))));
    })
  );

  app.use((_req, _res, next) => {
    next(new ApiError(404, 'ROUTE_NOT_FOUND', 'Route not found'));
  });

  app.use(errorHandler);

  return app;
}

function corsHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

function route(handler: (req: Request, res: Response) => void): RequestHandler {
  return (req, res, next) => {
    try {
      handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

function errorHandler(
  error: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  const requestId = createRequestId();

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
      requestId,
    });
    return;
  }

  if (isJsonParseError(error)) {
    res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'Request body must be valid JSON',
      requestId,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    requestId,
  });
}

function isJsonParseError(error: unknown): error is SyntaxError & { status: number } {
  return error instanceof SyntaxError && 'status' in error;
}

function createRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function firstParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
