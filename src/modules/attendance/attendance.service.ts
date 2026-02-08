import { injectable, inject } from 'tsyringe';
import { AttendanceRepository } from './attendance.repository';
import { EmployeeRepository } from '../employee/employee.repository';
import { ICreateAttendanceDto, IAttendanceResponseDto, IAttendance } from './attendance.type';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../../common/constants/http-status.constant';

@injectable()
export class AttendanceService {
  private readonly businessHoursStart: number;
  private readonly businessHoursEnd: number;
  private readonly retroactiveLimitDays: number;

  constructor(
    @inject(AttendanceRepository) private attendanceRepository: AttendanceRepository,
    @inject(EmployeeRepository) private employeeRepository: EmployeeRepository
  ) {
    // Load business hours from environment variables (default: 6 AM - 10 PM)
    this.businessHoursStart = parseInt(process.env.BUSINESS_HOURS_START || '6', 10);
    this.businessHoursEnd = parseInt(process.env.BUSINESS_HOURS_END || '22', 10);
    this.retroactiveLimitDays = parseInt(process.env.RETROACTIVE_LIMIT_DAYS || '7', 10);
  }

  public async createOrUpdateAttendance(
    createDto: ICreateAttendanceDto
  ): Promise<IAttendanceResponseDto> {
    // 1. Validate employee exists
    await this.validateEmployeeExists(createDto.employee_id);

    // 2. Parse and validate dates
    const attendanceDate = new Date(createDto.date);
    const checkInTime = new Date(createDto.check_in_time);

    // 3. Validate date is not in future
    this.validateDateNotInFuture(attendanceDate, 'Date');

    // 4. Validate check-in time is not in future
    this.validateDateNotInFuture(checkInTime, 'Check-in time');

    // 5. Validate check-in time is on same date as attendance date
    this.validateCheckInDateMatch(attendanceDate, checkInTime);

    // 6. Validate business hours
    this.validateBusinessHours(checkInTime);

    // 7. Validate retroactive limit
    this.validateRetroactiveLimit(attendanceDate);

    // 8. Check if attendance already exists for this employee and date
    const existingAttendance = await this.attendanceRepository.findByEmployeeAndDate(
      createDto.employee_id,
      attendanceDate
    );

    let attendance: IAttendance;

    if (existingAttendance) {
      // Update existing check-in time
      const updated = await this.attendanceRepository.updateCheckInTime(
        createDto.employee_id,
        attendanceDate,
        checkInTime
      );

      if (!updated) {
        throw new AppError(
          'Failed to update attendance',
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      attendance = updated;
    } else {
      // Create new attendance record
      attendance = await this.attendanceRepository.createAttendance(
        createDto.employee_id,
        attendanceDate,
        checkInTime
      );
    }

    return this.toAttendanceResponse(attendance);
  }

  private async validateEmployeeExists(employeeId: number): Promise<void> {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new AppError(
        'Employee not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }
  }

  private validateDateNotInFuture(date: Date, fieldName: string): void {
    const now = new Date();

    if (date > now) {
      throw new AppError(
        `${fieldName} cannot be in the future`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  private validateCheckInDateMatch(attendanceDate: Date, checkInTime: Date): void {
    const attendanceDateStr = this.formatDate(attendanceDate);
    const checkInDateStr = this.formatDate(checkInTime);

    if (attendanceDateStr !== checkInDateStr) {
      throw new AppError(
        'Check-in time must be on the same date as the attendance date',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  private validateBusinessHours(checkInTime: Date): void {
    const hours = checkInTime.getUTCHours();

    if (hours < this.businessHoursStart || hours >= this.businessHoursEnd) {
      throw new AppError(
        `Check-in time must be within business hours (${this.businessHoursStart}:00 - ${this.businessHoursEnd}:00 UTC)`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  private validateRetroactiveLimit(attendanceDate: Date): void {
    const now = new Date();
    const diffTime = now.getTime() - attendanceDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > this.retroactiveLimitDays) {
      throw new AppError(
        `Cannot create attendance more than ${this.retroactiveLimitDays} days in the past`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private toAttendanceResponse(attendance: IAttendance): IAttendanceResponseDto {
    return {
      id: attendance.id,
      employee_id: attendance.employee_id,
      date: this.formatDate(attendance.date),
      check_in_time: attendance.check_in_time.toISOString(),
    };
  }
}
