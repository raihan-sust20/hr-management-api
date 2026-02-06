import Joi from 'joi';
import { commonSchemas } from '../../common/middlewares/validation.middleware';

export const authValidation = {
  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};
