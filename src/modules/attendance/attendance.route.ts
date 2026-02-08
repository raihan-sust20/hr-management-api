import { Router } from 'express';
import { container } from 'tsyringe';
import { AttendanceController } from './attendance.controller';
import { ValidationMiddleware } from '../../common/middlewares/validation.middleware';
import { AuthMiddleware } from '../../common/middlewares/auth.middleware';
import { attendanceValidation } from './attendance.validation';

const router = Router();
const attendanceController = container.resolve(AttendanceController);

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management endpoints
 */

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Create or update employee attendance
 *     description: |
 *       Records employee check-in time for a specific date. If an attendance record already exists
 *       for the employee on the given date, it updates the check-in time instead of creating a duplicate.
 *       
 *       **Business Rules:**
 *       - Date cannot be in the future
 *       - Check-in time cannot be in the future
 *       - Check-in time must be on the same date as the attendance date
 *       - Check-in time must be within business hours (6:00 AM - 10:00 PM UTC by default)
 *       - Cannot create attendance more than 7 days in the past
 *       - Employee must exist in the system
 *       - Only one check-in record per employee per day (enforced by database constraint)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - date
 *               - check_in_time
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: ID of the employee checking in
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-08"
 *                 description: Attendance date in YYYY-MM-DD format (cannot be in future)
 *               check_in_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-08T09:30:00.000Z"
 *                 description: |
 *                   Check-in timestamp in ISO 8601 format (UTC timezone).
 *                   Must be within business hours (6 AM - 10 PM UTC) and on the same date as the attendance date.
 *           examples:
 *             createNew:
 *               summary: Create new attendance record
 *               value:
 *                 employee_id: 1
 *                 date: "2026-02-08"
 *                 check_in_time: "2026-02-08T09:30:00.000Z"
 *             updateExisting:
 *               summary: Update existing check-in time
 *               value:
 *                 employee_id: 1
 *                 date: "2026-02-08"
 *                 check_in_time: "2026-02-08T10:15:00.000Z"
 *     responses:
 *       201:
 *         description: Attendance recorded successfully (created or updated)
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
 *                   example: Attendance recorded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                       description: Attendance record ID
 *                     employee_id:
 *                       type: integer
 *                       example: 1
 *                       description: Employee ID
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2026-02-08"
 *                       description: Attendance date
 *                     check_in_time:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-08T09:30:00.000Z"
 *                       description: Check-in timestamp in ISO 8601 format
 *       400:
 *         description: Bad request - Validation error
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
 *                   example: Date cannot be in the future
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *             examples:
 *               futureDate:
 *                 summary: Future date not allowed
 *                 value:
 *                   success: false
 *                   message: "Date cannot be in the future"
 *                   error:
 *                     code: VALIDATION_ERROR
 *               outsideBusinessHours:
 *                 summary: Outside business hours
 *                 value:
 *                   success: false
 *                   message: "Check-in time must be within business hours (6:00 - 22:00 UTC)"
 *                   error:
 *                     code: VALIDATION_ERROR
 *               dateMismatch:
 *                 summary: Check-in date doesn't match attendance date
 *                 value:
 *                   success: false
 *                   message: "Check-in time must be on the same date as the attendance date"
 *                   error:
 *                     code: VALIDATION_ERROR
 *               retroactiveLimit:
 *                 summary: Exceeded retroactive limit
 *                 value:
 *                   success: false
 *                   message: "Cannot create attendance more than 7 days in the past"
 *                   error:
 *                     code: VALIDATION_ERROR
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
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
 *         description: Validation error - Invalid input format
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
 *                                 example: check_in_time
 *                               message:
 *                                 type: string
 *                                 example: Check-in time must be in ISO 8601 format
 */
router.post(
  '/',
  AuthMiddleware.authenticate(),
  ValidationMiddleware.validateBody(attendanceValidation.createOrUpdateAttendance),
  attendanceController.createOrUpdate
);

export default router;
