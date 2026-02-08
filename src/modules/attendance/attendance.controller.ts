import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { AttendanceService } from './attendance.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { ICreateAttendanceDto, IListAttendanceQuery } from './attendance.type';
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

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: IListAttendanceQuery = req.query;

      const result = await this.attendanceService.listAttendance(query);

      ResponseUtil.successWithPagination(
        res,
        'Attendance records retrieved successfully',
        result.data,
        result.meta,
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateDto: IUpdateAttendanceDto = req.body;

      const attendance = await this.attendanceService.updateAttendance(id, updateDto);

      ResponseUtil.success(res, 'Attendance updated successfully', attendance, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  };
}
