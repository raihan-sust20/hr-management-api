import { injectable } from 'tsyringe';
import { BaseRepository } from '../../common/utils/base.repository';
import { IAttendance } from './attendance.type';

@injectable()
export class AttendanceRepository extends BaseRepository<IAttendance> {
  protected tableName = 'attendance';

  /**
   * Find attendance record by employee ID and date
   */
  public async findByEmployeeAndDate(
    employeeId: number,
    date: Date
  ): Promise<IAttendance | undefined> {
    const result = await this.table
      .where({
        employee_id: employeeId,
        date: date,
      })
      .first();

    return result as IAttendance | undefined;
  }

  /**
   * Create new attendance record
   */
  public async createAttendance(
    employeeId: number,
    date: Date,
    checkInTime: Date
  ): Promise<IAttendance> {
    const [result] = await this.table
      .insert({
        employee_id: employeeId,
        date: date,
        check_in_time: checkInTime,
      })
      .returning('*');

    return result as IAttendance;
  }

  /**
   * Update check-in time for existing attendance record
   */
  public async updateCheckInTime(
    employeeId: number,
    date: Date,
    checkInTime: Date
  ): Promise<IAttendance | undefined> {
    const [result] = await this.table
      .where({
        employee_id: employeeId,
        date: date,
      })
      .update({
        check_in_time: checkInTime,
      })
      .returning('*');

    return result as IAttendance | undefined;
  }
}
