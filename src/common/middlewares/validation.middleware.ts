import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.constant';

export type ValidationSource = 'body' | 'query' | 'params';

export interface IValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
  convert?: boolean;
}

export class ValidationMiddleware {
  public static validate(
    schema: Joi.ObjectSchema,
    source: ValidationSource = 'body',
    options: IValidationOptions = {}
  ) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const validationOptions: Joi.ValidationOptions = {
        abortEarly: options.abortEarly ?? false,
        stripUnknown: options.stripUnknown ?? true,
        allowUnknown: options.allowUnknown ?? false,
        convert: true,
      };

      const input = { ...req[source] }; // ✅ universal fix

      const { error, value } = schema.validate(input, validationOptions);

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return next(
          new AppError(
            'Validation failed',
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            ERROR_CODES.VALIDATION_ERROR,
            true,
            { errors }
          )
        );
      }

      Object.assign(req[source], value); // ✅ safe write-back
      next();
    };
  }

  public static validateBody(schema: Joi.ObjectSchema, options?: IValidationOptions) {
    return this.validate(schema, 'body', options);
  }

  public static validateQuery(schema: Joi.ObjectSchema, options?: IValidationOptions) {
    return this.validate(schema, 'query', options);
  }

  public static validateParams(schema: Joi.ObjectSchema, options?: IValidationOptions) {
    return this.validate(schema, 'params', options);
  }
}

// Common validation schemas
export const commonSchemas = {
  id: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  email: Joi.string().email().lowercase().trim(),

  password: Joi.string().min(8).max(128),
};
