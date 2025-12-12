/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    details: err.details,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: req.path,
    },
  });
};

export const createError = (message: string, statusCode: number = 500, details?: any): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};
