import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { AttendanceService } from './attendance.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { ICreateAttendanceDto } from './attendance.type';
import { HTTP_STATUS } from '../../common/constants/http-status.constant';

@injectable()
export class AttendanceController {
  constructor(@inject(AttendanceService) private attendanceService: AttendanceService) {}

  public createOrUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createDto: ICreateAttendanceDto = req.body;

      const attendance = await this.attendanceService.createOrUpdateAttendance(createDto);

      ResponseUtil.success(
        res,
        'Attendance recorded successfully',
        attendance,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  };
}
