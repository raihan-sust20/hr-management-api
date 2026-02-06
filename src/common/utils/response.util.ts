import { Response } from 'express';
import { IApiResponse, IPaginationMeta } from '../types/common.type';
import { HTTP_STATUS, ErrorCode } from '../constants/http-status.constant';

export class ResponseUtil {
  public static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HTTP_STATUS.OK
  ): Response<IApiResponse<T>> {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  public static successWithPagination<T>(
    res: Response,
    message: string,
    data: T,
    meta: IPaginationMeta,
    statusCode: number = HTTP_STATUS.OK
  ): Response<IApiResponse<T>> {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(response);
  }

  public static created<T>(
    res: Response,
    message: string,
    data?: T
  ): Response<IApiResponse<T>> {
    return this.success(res, message, data, HTTP_STATUS.CREATED);
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCode,
    details?: unknown
  ): Response<IApiResponse> {
    const response: IApiResponse = {
      success: false,
      message,
      error: {
        code: errorCode || 'INTERNAL_ERROR',
        details,
      },
    };
    return res.status(statusCode).json(response);
  }

  public static badRequest(
    res: Response,
    message: string,
    details?: unknown
  ): Response<IApiResponse> {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }

  public static unauthorized(res: Response, message: string = 'Unauthorized'): Response<IApiResponse> {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  public static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response<IApiResponse> {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }

  public static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response<IApiResponse> {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }

  public static conflict(res: Response, message: string, details?: unknown): Response<IApiResponse> {
    return this.error(res, message, HTTP_STATUS.CONFLICT, 'DUPLICATE_ENTRY', details);
  }

  public static internalError(
    res: Response,
    message: string = 'Internal server error',
    details?: unknown
  ): Response<IApiResponse> {
    return this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', details);
  }
}
