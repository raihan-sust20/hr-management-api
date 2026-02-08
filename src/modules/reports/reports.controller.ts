import { Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ReportsService } from './reports.service';
import { IAuthRequest } from '../../common/types/express.type';
import { ResponseUtil } from '../../common/utils/response.util';
import { IAttendanceReportQuery } from './reports.type';

@injectable()
export class ReportsController {
  constructor(@inject(ReportsService) private reportsService: ReportsService) {}

  public getAttendanceReport = async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const query: IAttendanceReportQuery = req.query;

      const result = await this.reportsService.getMonthlyAttendanceReport(query);

      return ResponseUtil.successWithPagination(
        res,
        'Attendance report retrieved successfully',
        result.data,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  };
}
