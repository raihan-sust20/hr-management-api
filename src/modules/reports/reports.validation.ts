import Joi from 'joi';

// Custom validation for month format (YYYY-MM)
const validateMonthFormat = (value: string, helpers: Joi.CustomHelpers) => {
  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  
  if (!monthRegex.test(value)) {
    return helpers.error('any.invalid', {
      message: 'Month must be in YYYY-MM format (e.g., 2025-01)',
    });
  }
  
  return value;
};

// Custom validation to ensure month is not in the future
const validateMonthNotFuture = (value: string, helpers: Joi.CustomHelpers) => {
  const [year, month] = value.split('-').map(Number);
  const inputDate = new Date(year, month - 1, 1);
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  if (inputDate > currentMonth) {
    return helpers.error('any.invalid', {
      message: 'Month cannot be in the future',
    });
  }
  
  return value;
};

export const reportsValidation = {
  attendanceReport: Joi.object({
    month: Joi.string()
      .required()
      .custom(validateMonthFormat)
      .custom(validateMonthNotFuture)
      .messages({
        'any.required': 'Month is required',
        'string.empty': 'Month cannot be empty',
      }),

    employee_id: Joi.number().integer().positive().optional().messages({
      'number.base': 'Employee ID must be a number',
      'number.integer': 'Employee ID must be an integer',
      'number.positive': 'Employee ID must be positive',
    }),

    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),

    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

    sortBy: Joi.string()
      .valid('name', 'employee_id', 'days_present', 'times_late')
      .default('name')
      .messages({
        'any.only': 'sortBy must be one of: name, employee_id, days_present, times_late',
      }),

    sortOrder: Joi.string().valid('asc', 'desc').default('asc').messages({
      'any.only': 'sortOrder must be either asc or desc',
    }),
  }),
};
