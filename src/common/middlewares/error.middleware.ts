import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.constant';
import logger from '../../config/logger.config';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public isOperational: boolean;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: string = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode: string = ERROR_CODES.INTERNAL_ERROR;
  let message = 'Internal server error';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;

    // Log operational errors at info level
    if (err.isOperational) {
      logger.info('Operational error', {
        message: err.message,
        errorCode: err.errorCode,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      });
    } else {
      // Log programming errors at error level
      logger.error('Programming error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    // Unexpected errors
    logger.error('Unexpected error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      message = 'An unexpected error occurred';
    } else {
      message = err.message;
      details = { stack: err.stack };
    }
  }

  ResponseUtil.error(res, message, statusCode, errorCode as any, details);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
};
