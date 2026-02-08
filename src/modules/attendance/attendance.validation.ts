import Joi from 'joi';

export const attendanceValidation = {
  createOrUpdateAttendance: Joi.object({
    employee_id: Joi.number().integer().positive().required().messages({
      'number.base': 'Employee ID must be a number',
      'number.integer': 'Employee ID must be an integer',
      'number.positive': 'Employee ID must be positive',
      'any.required': 'Employee ID is required',
    }),

    date: Joi.date().iso().max('now').required().messages({
      'date.base': 'Date must be a valid date',
      'date.format': 'Date must be in YYYY-MM-DD format',
      'date.max': 'Date cannot be in the future',
      'any.required': 'Date is required',
    }),

    check_in_time: Joi.date().iso().max('now').required().messages({
      'date.base': 'Check-in time must be a valid timestamp',
      'date.format': 'Check-in time must be in ISO 8601 format',
      'date.max': 'Check-in time cannot be in the future',
      'any.required': 'Check-in time is required',
    }),
  }),

  listAttendance: Joi.object({
    employee_id: Joi.number().integer().positive().optional().messages({
      'number.base': 'Employee ID must be a number',
      'number.integer': 'Employee ID must be an integer',
      'number.positive': 'Employee ID must be positive',
    }),

    date: Joi.date().iso().optional().messages({
      'date.base': 'Date must be a valid date',
      'date.format': 'Date must be in YYYY-MM-DD format',
    }),

    start_date: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in YYYY-MM-DD format',
    }),

    end_date: Joi.date().iso().optional().messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in YYYY-MM-DD format',
    }),

    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),

    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

    sortBy: Joi.string()
      .valid('date', 'check_in_time', 'employee_id')
      .default('date')
      .messages({
        'any.only': 'Sort by must be one of: date, check_in_time, employee_id',
      }),

    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'Sort order must be either asc or desc',
    }),
  }).custom((value, helpers) => {
    // Mutually exclusive: date vs date range
    if (value.date && (value.start_date || value.end_date)) {
      return helpers.error('any.invalid', {
        message: 'Cannot use date filter together with start_date/end_date range filter',
      });
    }

    // Both start_date and end_date required together
    if (value.start_date && !value.end_date) {
      return helpers.error('any.invalid', {
        message: 'end_date is required when start_date is provided',
      });
    }

    if (value.end_date && !value.start_date) {
      return helpers.error('any.invalid', {
        message: 'start_date is required when end_date is provided',
      });
    }

    // Validate date range: max 90 days
    if (value.start_date && value.end_date) {
      const startDate = new Date(value.start_date);
      const endDate = new Date(value.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
        return helpers.error('any.invalid', {
          message: 'Date range cannot exceed 90 days',
        });
      }

      if (startDate > endDate) {
        return helpers.error('any.invalid', {
          message: 'start_date must be before or equal to end_date',
        });
      }
    }

    return value;
  }),
};