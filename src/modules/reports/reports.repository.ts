import { injectable, inject } from 'tsyringe';
import { Knex } from 'knex';
import DatabaseConfig from '../../config/database.config';
import { IAttendanceReportQuery, IAttendanceReportItem } from './reports.type';
import { parseToInt } from '../../common/utils/general.util';

@injectable()
export class ReportsRepository {
  protected db: Knex;

  constructor(@inject(DatabaseConfig) protected dbConfig: DatabaseConfig) {
    this.db = dbConfig.getConnection();
  }

  /**
   * Get monthly attendance report
   */
  public async getMonthlyAttendanceReport(
    query: IAttendanceReportQuery
  ): Promise<{ data: IAttendanceReportItem[]; total: number }> {
    const page = parseToInt(query.page) || 1;
    const limit = Math.min(parseToInt(query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder || 'asc';

    // Parse month to get date range
    const [year, month] = query.month.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // Base query with LEFT JOIN
    let baseQuery = this.db('employees as e')
      .leftJoin('attendance as a', function () {
        this.on('e.id', '=', 'a.employee_id')
          .andOnBetween('a.date', [startDate, endDate]);
      })
      .select(
        'e.id as employee_id',
        'e.name',
        this.db.raw('COUNT(a.id) as days_present'),
        this.db.raw(`
          SUM(
            CASE 
              WHEN EXTRACT(HOUR FROM a.check_in_time) * 60 + 
                   EXTRACT(MINUTE FROM a.check_in_time) > 585 
              THEN 1 
              ELSE 0 
            END
          ) as times_late
        `)
      )
      .groupBy('e.id', 'e.name');

    // Apply employee_id filter if provided
    if (query.employee_id) {
      baseQuery = baseQuery.where('e.id', query.employee_id);
    }

    // Get total count before pagination
    const countQuery = baseQuery.clone();
    const totalResult = await this.db
      .from(this.db.raw(`(${countQuery.toQuery()}) as subquery`))
      .count('* as count');
    const total = parseToInt(totalResult[0].count);

    // Map sortBy to actual column names
    const sortColumnMap: { [key: string]: string } = {
      name: 'e.name',
      employee_id: 'e.id',
      days_present: 'days_present',
      times_late: 'times_late',
    };

    const sortColumn = sortColumnMap[sortBy] || 'e.name';

    // Apply sorting and pagination
    const data = await baseQuery
      .orderBy(sortColumn, sortOrder)
      .limit(limit)
      .offset(offset);

    // Convert BigInt to number for times_late
    const formattedData = data.map((row) => ({
      employee_id: row.employee_id,
      name: row.name,
      days_present: parseToInt(row.days_present),
      times_late: parseToInt(row.times_late),
    }));

    return { data: formattedData, total };
  }

  /**
   * Get total working days in a month (days with at least one attendance record)
   */
  public async getWorkingDaysInMonth(month: string): Promise<number> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const result = await this.db('attendance')
      .countDistinct('date as count')
      .whereBetween('date', [startDate, endDate])
      .first();

    return parseToInt(result?.count || 0);
  }

  /**
   * Check if employee exists
   */
  public async employeeExists(employeeId: number): Promise<boolean> {
    const result = await this.db('employees').where('id', employeeId).first();
    return !!result;
  }
}
