import { Router } from 'express';
import { container } from 'tsyringe';
import { ReportsController } from './reports.controller';
import { ValidationMiddleware } from '../../common/middlewares/validation.middleware';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';
import { reportsValidation } from './reports.validation';

const router = Router();
const reportsController = container.resolve(ReportsController);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting and analytics endpoints
 */

/**
 * @swagger
 * /reports/attendance:
 *   get:
 *     summary: Get monthly attendance summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-(0[1-9]|1[0-2])$'
 *         description: Month in YYYY-MM format (e.g., 2025-01)
 *         example: 2025-01
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         description: Optional filter by employee ID
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, employee_id, days_present, times_late]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Attendance report retrieved successfully
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
 *                   example: Attendance report retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     month:
 *                       type: string
 *                       example: 2025-01
 *                     total_working_days:
 *                       type: number
 *                       example: 22
 *                       description: Number of days with at least one attendance record
 *                     summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employee_id:
 *                             type: number
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: Alice Johnson
 *                           days_present:
 *                             type: number
 *                             example: 20
 *                             description: Number of days employee was present
 *                           times_late:
 *                             type: number
 *                             example: 3
 *                             description: Number of times employee checked in after 09:45:00
 *                     total_employees:
 *                       type: number
 *                       example: 15
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
 *                       example: 15
 *                     totalPages:
 *                       type: number
 *                       example: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Employee not found (when employee_id filter is used)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error (invalid month format or future month)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/attendance',
  AuthMiddleware.authenticate(),
  ValidationMiddleware.validateQuery(reportsValidation.attendanceReport),
  reportsController.getAttendanceReport
);

export default router;
