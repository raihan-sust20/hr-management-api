import { Router } from 'express';
import { container } from 'tsyringe';
import { EmployeeController } from './employee.controller';
import { ValidationMiddleware } from '../../common/middlewares/validation.middleware';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';
import { UploadMiddleware } from '../../common/middlewares/upload.middleware';
import { employeeValidation } from './employee.validation';

const router = Router();
const employeeController = container.resolve(EmployeeController);

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designation
 *               - hiring_date
 *               - date_of_birth
 *               - salary
 *               - photo
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: John Doe
 *                 description: Employee full name (minimum 2 characters)
 *               designation:
 *                 type: string
 *                 example: Software Engineer
 *                 description: Employee job title/designation
 *               hiring_date:
 *                 type: string
 *                 format: date
 *                 example: 2023-06-15
 *                 description: Date of hiring (must be in the past, employee must be 18+ at hiring)
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1995-03-20
 *                 description: Employee date of birth (age will be auto-calculated)
 *               salary:
 *                 type: number
 *                 format: decimal
 *                 example: 75000.00
 *                 description: Employee salary (must be positive)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Employee photo (JPEG only, max 5MB)
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employee created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     age:
 *                       type: number
 *                       example: 29
 *                       description: Auto-calculated from date_of_birth
 *                     designation:
 *                       type: string
 *                       example: Software Engineer
 *                     hiring_date:
 *                       type: string
 *                       format: date
 *                       example: 2023-06-15
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: 1995-03-20
 *                     salary:
 *                       type: number
 *                       example: 75000.00
 *                     photo_path:
 *                       type: string
 *                       example: employee-1.jpg
 *                     photoUrl:
 *                       type: string
 *                       example: http://localhost:3000/uploads/employee-1.jpg
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (missing photo, invalid file type)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     details:
 *                       type: object
 *                       properties:
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               field:
 *                                 type: string
 *                                 example: hiring_date
 *                               message:
 *                                 type: string
 *                                 example: Employee must be at least 18 years old at the time of hiring
 */
router.post(
  '/',
  AuthMiddleware.authenticate(),
  UploadMiddleware.uploadJpegOnly(),
  ValidationMiddleware.validateBody(employeeValidation.createEmployee),
  employeeController.create
);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: List all employees with pagination and filters
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search employees by name (case-insensitive partial match)
 *         example: john
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, age, designation, hiring_date, date_of_birth, salary, created_at]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employees retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Alice Johnson
 *                       age:
 *                         type: number
 *                         example: 32
 *                       designation:
 *                         type: string
 *                         example: Senior Software Engineer
 *                       hiring_date:
 *                         type: string
 *                         format: date
 *                         example: 2021-03-15
 *                       date_of_birth:
 *                         type: string
 *                         format: date
 *                         example: 1992-05-20
 *                       salary:
 *                         type: number
 *                         example: 95000.00
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 20
 *                     total:
 *                       type: number
 *                       example: 50
 *                     totalPages:
 *                       type: number
 *                       example: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  AuthMiddleware.authenticate(),
  ValidationMiddleware.validateQuery(employeeValidation.listEmployees),
  employeeController.list
);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get a single employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employee retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     age:
 *                       type: number
 *                       example: 29
 *                       description: Auto-calculated from date_of_birth
 *                     designation:
 *                       type: string
 *                       example: Software Engineer
 *                     hiring_date:
 *                       type: string
 *                       format: date
 *                       example: 2023-06-15
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: 1995-03-20
 *                     salary:
 *                       type: number
 *                       example: 75000.00
 *                     photo_path:
 *                       type: string
 *                       example: employee-1.jpg
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Employee not found
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: NOT_FOUND
 *       422:
 *         description: Validation error (invalid ID format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  AuthMiddleware.authenticate(),
  ValidationMiddleware.validateParams(employeeValidation.employeeId),
  employeeController.getById
);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update employee details
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Alice Johnson Updated
 *                 description: Employee full name (optional)
 *               designation:
 *                 type: string
 *                 example: Lead Software Engineer
 *                 description: Employee job title/designation (optional)
 *               hiring_date:
 *                 type: string
 *                 format: date
 *                 example: 2023-06-15
 *                 description: Date of hiring (optional, must be in past, employee must be 18+ at hiring)
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1995-03-20
 *                 description: Employee date of birth (optional, age will be auto-recalculated)
 *               salary:
 *                 type: number
 *                 format: decimal
 *                 example: 105000.00
 *                 description: Employee salary (optional, must be positive)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Employee photo (optional, JPEG only, max 5MB, replaces existing photo)
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employee updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Alice Johnson Updated
 *                     age:
 *                       type: number
 *                       example: 29
 *                       description: Auto-calculated from date_of_birth
 *                     designation:
 *                       type: string
 *                       example: Lead Software Engineer
 *                     hiring_date:
 *                       type: string
 *                       format: date
 *                       example: 2023-06-15
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: 1995-03-20
 *                     salary:
 *                       type: number
 *                       example: 105000.00
 *                     photo_path:
 *                       type: string
 *                       example: employee-1.jpg
 *                     photoUrl:
 *                       type: string
 *                       example: http://localhost:3000/uploads/employee-1.jpg
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (invalid data, validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     details:
 *                       type: object
 *                       properties:
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               field:
 *                                 type: string
 *                                 example: hiring_date
 *                               message:
 *                                 type: string
 *                                 example: Employee must be at least 18 years old at the time of hiring
 */
router.put(
  '/:id',
  AuthMiddleware.authenticate(),
  UploadMiddleware.uploadJpegOnly(),
  ValidationMiddleware.validateParams(employeeValidation.employeeId),
  ValidationMiddleware.validateBody(employeeValidation.updateEmployee),
  employeeController.update
);

export default router;