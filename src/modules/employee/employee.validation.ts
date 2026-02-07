import Joi from 'joi';

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Custom validation for hiring eligibility
const validateHiringEligibility = (value: string, helpers: Joi.CustomHelpers) => {
  const dateOfBirth = helpers.state.ancestors[0].date_of_birth;

  if (!dateOfBirth) {
    return value;
  }

  const dob = new Date(dateOfBirth);
  const hiringDate = new Date(value);

  // Calculate minimum hiring date (DOB + 18 years)
  const minHiringDate = new Date(dob);
  minHiringDate.setFullYear(minHiringDate.getFullYear() + 18);

  if (hiringDate < minHiringDate) {
    return helpers.error('date.invalid');
  }

  return value;
};

// Custom validation to ensure hiring_date is in the past
const validatePastDate = (value: string, helpers: Joi.CustomHelpers) => {
  const inputDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates

  if (inputDate > today) {
    return helpers.error('date.future');
  }

  return value;
};

// Custom validation for date of birth (must result in age 18-70)
const validateDateOfBirth = (value: string, helpers: Joi.CustomHelpers) => {
  const age = calculateAge(new Date(value));

  if (age < 18) {
    return helpers.error('age.less');
  }

  if (age > 70) {
    return helpers.error('age.more');
  }

  return value;
};

// Custom validation for date consistency in updates
const validateUpdateDatesConsistency = (value: any, helpers: Joi.CustomHelpers) => {
  const { date_of_birth, hiring_date } = value;

  // If both dates are provided, validate them together
  if (date_of_birth && hiring_date) {
    const dob = new Date(date_of_birth);
    const hireDate = new Date(hiring_date);

    const minHiringDate = new Date(dob);
    minHiringDate.setFullYear(minHiringDate.getFullYear() + 18);

    if (hireDate < minHiringDate) {
      return helpers.error('any.invalid', {
        message: 'Employee must be at least 18 years old at the time of hiring',
      });
    }
  }

  return value;
};

export const employeeValidation = {
  createEmployee: Joi.object({
    name: Joi.string().min(2).trim().required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty',
    }),

    designation: Joi.string().trim().required().messages({
      'any.required': 'Designation is required',
      'string.empty': 'Designation cannot be empty',
    }),

    date_of_birth: Joi.date().iso().required().custom(validateDateOfBirth).messages({
      'any.required': 'Date of birth is required',
      'date.format': 'Date of birth must be in YYYY-MM-DD format',
      'age.less': 'Employee must be at least 18 years old',
      'age.more': 'Employee must be 70 years old or younger',
    }),

    hiring_date: Joi.date()
      .iso()
      .required()
      .custom(validatePastDate)
      .custom(validateHiringEligibility)
      .messages({
        'any.required': 'Hiring date is required',
        'date.format': 'Hiring date must be in YYYY-MM-DD format',
        'date.invalid': 'Employee must be at least 18 years old at the time of hiring',
        'date.future': 'Hiring date must be in the past or today',
      }),

    salary: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Salary must be a number',
      'number.positive': 'Salary must be a positive number',
      'any.required': 'Salary is required',
    }),
  }),

  updateEmployee: Joi.object({
    name: Joi.string().min(2).trim().optional().messages({
      'string.min': 'Name must be at least 2 characters long',
    }),

    designation: Joi.string().trim().optional(),

    date_of_birth: Joi.date().iso().optional().custom(validateDateOfBirth).messages({
      'date.format': 'Date of birth must be in YYYY-MM-DD format',
    }),

    hiring_date: Joi.date().iso().optional().custom(validatePastDate).messages({
      'date.format': 'Hiring date must be in YYYY-MM-DD format',
    }),

    salary: Joi.number().positive().precision(2).optional().messages({
      'number.base': 'Salary must be a number',
      'number.positive': 'Salary must be a positive number',
    }),
  })
    .min(1)
    .custom(validateUpdateDatesConsistency)
    .messages({
      'object.min': 'At least one field must be provided for update',
      'any.invalid': 'Employee must be at least 18 years old at the time of hiring',
    }),

  employeeId: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Employee ID must be a number',
      'number.positive': 'Employee ID must be positive',
      'any.required': 'Employee ID is required',
    }),
  }),
};
