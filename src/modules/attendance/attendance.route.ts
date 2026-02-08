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

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: List attendance records with filters
 *     description: |
 *       Retrieve attendance records with optional filtering by employee, date, or date range.
 *       Results are paginated and sortable.
 *       
 *       **Filter Rules:**
 *       - Can filter by single date OR date range (mutually exclusive)
 *       - When using date range, both start_date and end_date are required
 *       - Maximum date range is 90 days
 *       - Cannot query attendance older than 3 months
 *       - Only shows attendance for active employees (deleted employees excluded)
 *       
 *       **Default Behavior:**
 *       - If no filters provided, returns all attendance records (paginated)
 *       - Default sort: by date descending
 *       - Default pagination: 20 records per page
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by specific employee ID
 *         example: 1
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD). Mutually exclusive with start_date/end_date.
 *         example: "2026-02-08"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for range filter (YYYY-MM-DD). Requires end_date. Mutually exclusive with date.
 *         example: "2026-02-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for range filter (YYYY-MM-DD). Requires start_date. Mutually exclusive with date.
 *         example: "2026-02-08"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of records per page (max 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, check_in_time, employee_id]
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
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
 *                   example: Attendance records retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       employee_id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2026-02-08"
 *                       check_in_time:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-02-08T09:30:00.000Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                       description: Total number of records matching the filter
 *                     totalPages:
 *                       type: integer
 *                       example: 8
 *                       description: Total number of pages
 *       400:
 *         description: Bad request - Invalid filter combination or date range
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
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *             examples:
 *               mutuallyExclusive:
 *                 summary: Date and date range used together
 *                 value:
 *                   success: false
 *                   message: "Cannot use date filter together with start_date/end_date range filter"
 *                   error:
 *                     code: VALIDATION_ERROR
 *               missingEndDate:
 *                 summary: start_date without end_date
 *                 value:
 *                   success: false
 *                   message: "end_date is required when start_date is provided"
 *                   error:
 *                     code: VALIDATION_ERROR
 *               rangeExceeded:
 *                 summary: Date range exceeds 90 days
 *                 value:
 *                   success: false
 *                   message: "Date range cannot exceed 90 days"
 *                   error:
 *                     code: VALIDATION_ERROR
 *               tooOld:
 *                 summary: Query date older than 3 months
 *                 value:
 *                   success: false
 *                   message: "Cannot query attendance older than 3 months"
 *                   error:
 *                     code: VALIDATION_ERROR
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error - Invalid query parameter format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  AuthMiddleware.authenticate(),
  ValidationMiddleware.validateQuery(attendanceValidation.listAttendance),
  attendanceController.list
);

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     summary: Update attendance check-in time
 *     description: |
 *       Updates the check-in time for an existing attendance record.
 *       Only the check-in time can be updated; employee_id and date cannot be changed.
 *       
 *       **Business Rules:**
 *       - Only check_in_time can be updated (employee_id and date are immutable)
 *       - Attendance record must exist
 *       - Employee must still exist (not deleted)
 *       - Check-in time cannot be in the future
 *       - Check-in time must be within business hours (6:00 AM - 10:00 PM UTC)(configurable via environment variables)
 *       - Check-in time must be on the same date as the attendance record's date
 *       - Cannot update attendance older than 30 days (configurable via environment variables)
 *       
 *       **Use Case:**
 *       This endpoint is used for correcting mistakes in check-in times for existing attendance records.
 *       To change the employee or date, delete the record and create a new one using POST.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Attendance record ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - check_in_time
 *             properties:
 *               check_in_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-08T10:30:00.000Z"
 *                 description: |
 *                   New check-in timestamp in ISO 8601 format (UTC timezone).
 *                   Must be within business hours (6 AM - 10 PM UTC) and on the same date as the attendance record.
 *           examples:
 *             correctCheckIn:
 *               summary: Correct check-in time
 *               value:
 *                 check_in_time: "2026-02-08T10:30:00.000Z"
 *     responses:
 *       200:
 *         description: Attendance updated successfully
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
 *                   example: Attendance updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     employee_id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2026-02-08"
 *                     check_in_time:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-02-08T10:30:00.000Z"
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
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *             examples:
 *               futureCheckIn:
 *                 summary: Check-in time in future
 *                 value:
 *                   success: false
 *                   message: "Check-in time cannot be in the future"
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
 *               tooOld:
 *                 summary: Attendance too old to edit
 *                 value:
 *                   success: false
 *                   message: "Cannot update attendance older than 30 days"
 *                   error:
 *                     code: VALIDATION_ERROR
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Not found - Attendance record or employee not found
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
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: NOT_FOUND
 *             examples:
 *               attendanceNotFound:
 *                 summary: Attendance record not found
 *                 value:
 *                   success: false
 *                   message: "Attendance record not found"
 *                   error:
 *                     code: NOT_FOUND
 *               employeeDeleted:
 *                 summary: Employee has been deleted
 *                 value:
 *                   success: false
 *                   message: "Cannot update attendance: Employee not found"
 *                   error:
 *                     code: NOT_FOUND
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
router.put(
  '/:id',
  AuthMiddleware.authenticate(),
  ValidationMiddleware.validateParams(attendanceValidation.attendanceId),
  ValidationMiddleware.validateBody(attendanceValidation.updateAttendance),
  attendanceController.update
);

export default router;