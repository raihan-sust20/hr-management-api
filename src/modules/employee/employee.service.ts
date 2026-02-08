import { injectable, inject } from 'tsyringe';
import { EmployeeRepository } from './employee.repository';
import {
  ICreateEmployeeDto,
  IEmployeeResponseDto,
  ICreateEmployeeData,
  IEmployee,
  type IUpdateEmployeeDto,
  type IEmployeeListItemDto,
  type IListEmployeesQuery,
  type IPaginatedEmployeesResponse,
} from './employee.type';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../../common/constants/http-status.constant';
import fs from 'fs';
import path from 'path';
import { parseToInt } from '../../common/utils/general.util';

@injectable()
export class EmployeeService {
  constructor(@inject(EmployeeRepository) private employeeRepository: EmployeeRepository) {}

  public async createEmployee(
    createDto: ICreateEmployeeDto,
    photoFile: Express.Multer.File
  ): Promise<IEmployeeResponseDto> {
    // Validate that photo exists
    if (!photoFile) {
      throw new AppError(
        'Photo is required',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Calculate age from date of birth
    const age = this.calculateAge(new Date(createDto.date_of_birth));

    // Validate hiring eligibility
    this.validateHiringEligibility(
      new Date(createDto.date_of_birth),
      new Date(createDto.hiring_date)
    );

    // Prepare employee data
    const employeeData: ICreateEmployeeData = {
      name: createDto.name,
      age,
      designation: createDto.designation,
      hiring_date: new Date(createDto.hiring_date),
      date_of_birth: new Date(createDto.date_of_birth),
      salary: createDto.salary,
      photo_path: null, // Temporarily null, will update after getting ID
    };

    try {
      // Create employee record
      const employee = await this.employeeRepository.createEmployee(employeeData);

      // Rename and move photo file with employee ID
      const newPhotoPath = await this.handlePhotoUpload(photoFile, employee.id);

      // Update employee record with photo path
      const updatedEmployee = await this.employeeRepository.updatePhotoPath(
        employee.id,
        newPhotoPath
      );

      if (!updatedEmployee) {
        throw new AppError(
          'Failed to update employee photo',
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      // Return response with full photo URL
      return this.toEmployeeResponse(updatedEmployee);
    } catch (error) {
      // Clean up uploaded file if employee creation fails
      if (photoFile && photoFile.path) {
        this.deleteFile(photoFile.path);
      }
      throw error;
    }
  }

  public async updateEmployee(
    id: number,
    updateDto: IUpdateEmployeeDto,
    photoFile?: Express.Multer.File
  ): Promise<IEmployeeResponseDto> {
    // Fetch existing employee
    const existingEmployee = await this.employeeRepository.findByIdWithDetails(id);

    if (!existingEmployee) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    // Prepare update data
    const updateData: Partial<IEmployee> = {};

    // Update name if provided
    if (updateDto.name !== undefined) {
      updateData.name = updateDto.name;
    }

    // Update designation if provided
    if (updateDto.designation !== undefined) {
      updateData.designation = updateDto.designation;
    }

    // Update salary if provided
    if (updateDto.salary !== undefined) {
      updateData.salary = updateDto.salary;
    }

    // Handle date_of_birth update
    let newDateOfBirth: Date | undefined;
    if (updateDto.date_of_birth !== undefined) {
      newDateOfBirth = new Date(updateDto.date_of_birth);
      updateData.date_of_birth = newDateOfBirth;
      // Recalculate age
      updateData.age = this.calculateAge(newDateOfBirth);
    }

    // Handle hiring_date update
    let newHiringDate: Date | undefined;
    if (updateDto.hiring_date !== undefined) {
      newHiringDate = new Date(updateDto.hiring_date);
      updateData.hiring_date = newHiringDate;
    }

    // Validate dates if any date is being updated
    if (newDateOfBirth || newHiringDate) {
      this.validateUpdateDates(existingEmployee, newDateOfBirth, newHiringDate);
    }

    try {
      // Handle photo update if provided
      if (photoFile) {
        const newPhotoPath = await this.handlePhotoUpdate(
          photoFile,
          id,
          existingEmployee.photo_path
        );
        updateData.photo_path = newPhotoPath;
      }

      // Update employee record
      const updatedEmployee = await this.employeeRepository.updateEmployee(id, updateData);

      if (!updatedEmployee) {
        throw new AppError(
          'Failed to update employee',
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      // Return response with full photo URL
      return this.toEmployeeResponse(updatedEmployee);
    } catch (error) {
      // Clean up uploaded file if update fails
      if (photoFile && photoFile.path) {
        this.deleteFile(photoFile.path);
      }
      throw error;
    }
  }

  private async handlePhotoUpload(file: Express.Multer.File, employeeId: number): Promise<string> {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const newFileName = `employee-${employeeId}.jpg`;
    const newFilePath = path.join(uploadDir, newFileName);

    try {
      // Rename file to employee-{id}.jpg
      fs.renameSync(file.path, newFilePath);
      return newFileName;
    } catch (error) {
      throw new AppError(
        'Failed to save photo',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.FILE_UPLOAD_ERROR
      );
    }
  }

  private async handlePhotoUpdate(
    file: Express.Multer.File,
    employeeId: number,
    oldPhotoPath: string | null
  ): Promise<string> {
    const uploadDir = './uploads';
    const newFileName = `employee-${employeeId}.jpg`;
    const newFilePath = path.join(uploadDir, newFileName);

    try {
      // Delete old photo if exists
      if (oldPhotoPath) {
        const oldFilePath = path.join(uploadDir, oldPhotoPath);
        this.deletePhotoFile(oldFilePath);
      }

      // Rename new file to employee-{id}.jpg
      fs.renameSync(file.path, newFilePath);
      return newFileName;
    } catch (error) {
      throw new AppError(
        'Failed to update photo',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.FILE_UPLOAD_ERROR
      );
    }
  }

  private deletePhotoFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't throw - file deletion is not critical
      console.error('Failed to delete photo file:', error);
    }
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't throw - file cleanup is not critical
      console.error('Failed to delete temporary file:', error);
    }
  }

  private validateUpdateDates(
    existingEmployee: IEmployee,
    newDateOfBirth?: Date,
    newHiringDate?: Date
  ): void {
    // Determine which dates to use for validation
    const dobToValidate = newDateOfBirth || existingEmployee.date_of_birth;
    const hiringDateToValidate = newHiringDate || existingEmployee.hiring_date;

    // Calculate minimum hiring date (DOB + 18 years)
    const minHiringDate = new Date(dobToValidate);
    minHiringDate.setFullYear(minHiringDate.getFullYear() + 18);

    if (hiringDateToValidate < minHiringDate) {
      throw new AppError(
        'Employee must be at least 18 years old at the time of hiring',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age;
  }

  private validateHiringEligibility(dateOfBirth: Date, hiringDate: Date): void {
    // Calculate minimum hiring date (DOB + 18 years)
    const minHiringDate = new Date(dateOfBirth);
    minHiringDate.setFullYear(minHiringDate.getFullYear() + 18);

    if (hiringDate < minHiringDate) {
      throw new AppError(
        'Employee must be at least 18 years old at the time of hiring',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  private generatePhotoUrl(photoPath: string | null): string | null {
    if (!photoPath) return null;

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3000;
    const baseUrl = process.env.BASE_URL || `${protocol}://${host}:${port}`;

    return `${baseUrl}/uploads/${photoPath}`;
  }

  private toEmployeeResponse(employee: IEmployee): IEmployeeResponseDto {
    return {
      id: employee.id,
      name: employee.name,
      age: employee.age,
      designation: employee.designation,
      hiring_date: employee.hiring_date.toISOString().split('T')[0],
      date_of_birth: employee.date_of_birth.toISOString().split('T')[0],
      salary: employee.salary,
      photo_path: employee.photo_path,
      // photoUrl: this.generatePhotoUrl(employee.photo_path),
      created_at: employee.created_at,
      updated_at: employee.updated_at,
    };
  }

  public async listEmployees(query: IListEmployeesQuery): Promise<IPaginatedEmployeesResponse> {
    const page = parseToInt(query.page) || 1;
    const limit = Math.min(parseToInt(query.limit) || 20, 100);
    console.log('Listing employees with query:', { ...query, page, limit });

    const { data, total } = await this.employeeRepository.findAllWithFilters(query);

    const totalPages = Math.ceil(total / limit);

    // Convert to minimal list response (no photo URLs)
    const employees = data.map((emp) => this.toEmployeeListItem(emp));

    return {
      data: employees,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  private toEmployeeListItem(employee: IEmployee): IEmployeeListItemDto {
    return {
      id: employee.id,
      name: employee.name,
      age: employee.age,
      designation: employee.designation,
      hiring_date: employee.hiring_date.toISOString().split('T')[0],
      date_of_birth: employee.date_of_birth.toISOString().split('T')[0],
      salary: employee.salary,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
    };
  }
}
