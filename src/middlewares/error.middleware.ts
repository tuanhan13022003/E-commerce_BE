import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '@/config/env';

/**
 * Custom Error class for application errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorMiddleware = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    });
  }

  // Custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
  }

  // Log unexpected errors in development
  if (env.NODE_ENV === 'development') {
    console.error('Unexpected error:', error);
  }

  // Generic server error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
