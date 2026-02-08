import { injectable } from 'tsyringe';
import { BaseRepository } from '../../common/utils/base.repository';
import { IAttendance, IListAttendanceQuery } from './attendance.type';
import { parseToInt } from '../../common/utils/general.util';

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

  /**
   * Update check-in time by attendance ID
   */
  public async updateCheckInTimeById(
    id: number,
    checkInTime: Date
  ): Promise<IAttendance | undefined> {
    const [result] = await this.table
      .where({ id })
      .update({
        check_in_time: checkInTime,
      })
      .returning('*');

    return result as IAttendance | undefined;
  }

  /**
   * Find all attendance records with filters and pagination
   */
  public async findAllWithFilters(
    query: IListAttendanceQuery
  ): Promise<{ data: IAttendance[]; total: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';

    // Base query with INNER JOIN to exclude deleted employees
    let baseQuery = this.db('attendance').innerJoin(
      'employees',
      'attendance.employee_id',
      'employees.id'
    );

    // Apply filters
    if (query.employee_id) {
      baseQuery = baseQuery.where('attendance.employee_id', query.employee_id);
    }

    if (query.date) {
      const filterDate = new Date(query.date);
      baseQuery = baseQuery.where('attendance.date', filterDate);
    }

    if (query.start_date && query.end_date) {
      const startDate = new Date(query.start_date);
      const endDate = new Date(query.end_date);
      baseQuery = baseQuery.whereBetween('attendance.date', [startDate, endDate]);
    }

    // Get total count
    const totalResult = await baseQuery.clone().count<{ count: string }>('attendance.id as count');
    const total = parseToInt(totalResult[0].count);

    // Get paginated data
    const data = await baseQuery
      .clone()
      .select(
        'attendance.id',
        'attendance.employee_id',
        'attendance.date',
        'attendance.check_in_time'
      )
      .orderBy(`attendance.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return { data: data as IAttendance[], total };
  }
}
