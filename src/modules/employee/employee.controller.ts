import { Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { EmployeeService } from './employee.service';
import { IAuthRequest } from '../../common/types/express.type';
import { ResponseUtil } from '../../common/utils/response.util';
import { ICreateEmployeeDto } from './employee.type';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../../common/constants/http-status.constant';

@injectable()
export class EmployeeController {
  constructor(@inject(EmployeeService) private employeeService: EmployeeService) {}

  public create = async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      // Validate that file exists
      if (!req.file) {
        throw new AppError(
          'Photo is required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const createDto: ICreateEmployeeDto = req.body;
      const photoFile = req.file;

      const employee = await this.employeeService.createEmployee(createDto, photoFile);

      return ResponseUtil.created(res, 'Employee created successfully', employee);
    } catch (error) {
      next(error);
    }
  };
}
