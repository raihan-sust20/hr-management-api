import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types/express.type';
import { JwtUtil } from '../utils/jwt.util';
import { AppError } from './error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.constant';

export class AuthMiddleware {
  public static authenticate() {
    return (req: IAuthRequest, _res: Response, next: NextFunction): void => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AppError(
            'No token provided',
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED
          );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
          throw new AppError(
            'No token provided',
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED
          );
        }

        try {
          const decoded = JwtUtil.verifyAccessToken(token);
          req.user = decoded;
          next();
        } catch (error) {
          throw new AppError(
            'Invalid or expired token',
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.INVALID_TOKEN
          );
        }
      } catch (error) {
        next(error);
      }
    };
  }

  public static optionalAuth() {
    return (req: IAuthRequest, _res: Response, next: NextFunction): void => {
      try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);

          if (token) {
            try {
              const decoded = JwtUtil.verifyAccessToken(token);
              req.user = decoded;
            } catch (error) {
              // Silently fail for optional auth
            }
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
