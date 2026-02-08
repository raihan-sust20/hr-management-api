import { injectable, inject } from 'tsyringe';
import { ReportsRepository } from './reports.repository';
import {
  IAttendanceReportQuery,
  IPaginatedAttendanceReportResponse,
  IAttendanceReportData,
} from './reports.type';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../../common/constants/http-status.constant';

@injectable()
export class ReportsService {
  constructor(@inject(ReportsRepository) private reportsRepository: ReportsRepository) {}

  public async getMonthlyAttendanceReport(
    query: IAttendanceReportQuery
  ): Promise<IPaginatedAttendanceReportResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    // Validate employee exists if employee_id is provided
    if (query.employee_id) {
      const employeeExists = await this.reportsRepository.employeeExists(query.employee_id);
      if (!employeeExists) {
        throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
    }

    // Get working days in month
    const totalWorkingDays = await this.reportsRepository.getWorkingDaysInMonth(query.month);

    // Get attendance report data
    const { data, total } = await this.reportsRepository.getMonthlyAttendanceReport(query);

    const totalPages = Math.ceil(total / limit);

    // Build response
    const reportData: IAttendanceReportData = {
      month: query.month,
      total_working_days: totalWorkingDays,
      summary: data,
      total_employees: total,
    };

    return {
      data: reportData,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
