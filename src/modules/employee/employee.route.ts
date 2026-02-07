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
  ValidationMiddleware.validateBody(employeeValidation.createEmployee),
  UploadMiddleware.uploadJpegOnly(),
  employeeController.create
);

export default router;
