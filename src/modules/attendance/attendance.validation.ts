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
};
