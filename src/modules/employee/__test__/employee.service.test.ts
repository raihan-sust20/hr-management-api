import { EmployeeService } from '../../../modules/employee/employee.service';
import { EmployeeRepository } from '../../../modules/employee/employee.repository';
import { ICreateEmployeeDto } from '../../../modules/employee/employee.type';
import { AppError } from '../../../common/middlewares/error.middleware';
import path from 'path';

// Mock the repository
const mockEmployeeRepository = {
  createEmployee: jest.fn(),
  updatePhotoPath: jest.fn(),
} as unknown as jest.Mocked<EmployeeRepository>;

// Mock fs module
jest.mock('fs', () => ({
  renameSync: jest.fn(),
  unlinkSync: jest.fn(),
  existsSync: jest.fn(() => true),
}));

describe('EmployeeService', () => {
  let employeeService: EmployeeService;

  const mockFile: Express.Multer.File = {
    fieldname: 'photo',
    originalname: 'test-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'uploads',
    filename: 'test-1234567890.jpg',
    path: 'uploads/test-1234567890.jpg',
    size: 1024000,
    stream: {} as any,
    buffer: Buffer.from(''),
  };

  beforeEach(() => {
    employeeService = new EmployeeService(mockEmployeeRepository);
    jest.clearAllMocks();
  });

  describe('createEmployee', () => {
    const validDto: ICreateEmployeeDto = {
      name: 'John Doe',
      designation: 'Software Engineer',
      hiring_date: '2023-06-15',
      date_of_birth: '1995-03-20',
      salary: 75000,
    };

    it('should create employee successfully with valid data', async () => {
      const mockEmployee = {
        id: 1,
        name: validDto.name,
        age: 29,
        designation: validDto.designation,
        hiring_date: new Date('2023-06-15'),
        date_of_birth: new Date('1995-03-20'),
        salary: validDto.salary,
        photo_path: 'employee-1.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);
      mockEmployeeRepository.updatePhotoPath.mockResolvedValue({
        ...mockEmployee,
        photo_path: 'employee-1.jpg',
      });

      const result = await employeeService.createEmployee(validDto, mockFile);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('age', 29);
      expect(result).toHaveProperty('photo_path', 'employee-1.jpg');
      expect(result).toHaveProperty('photoUrl');
      expect(result.photoUrl).toContain('employee-1.jpg');
      expect(mockEmployeeRepository.createEmployee).toHaveBeenCalled();
      expect(mockEmployeeRepository.updatePhotoPath).toHaveBeenCalledWith(1, 'employee-1.jpg');
    });

    it('should throw error if photo is missing', async () => {
      await expect(employeeService.createEmployee(validDto, null as any)).rejects.toThrow(
        AppError
      );
      await expect(employeeService.createEmployee(validDto, null as any)).rejects.toThrow(
        'Photo is required'
      );
      expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
    });

    it('should throw error if hiring date is before 18th birthday', async () => {
      const invalidDto: ICreateEmployeeDto = {
        name: 'Young Employee',
        designation: 'Intern',
        hiring_date: '2010-06-15',
        date_of_birth: '1995-03-20',
        salary: 40000,
      };

      await expect(employeeService.createEmployee(invalidDto, mockFile)).rejects.toThrow(AppError);
      await expect(employeeService.createEmployee(invalidDto, mockFile)).rejects.toThrow(
        'Employee must be at least 18 years old at the time of hiring'
      );
      expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
    });

    it('should calculate age correctly from date of birth', async () => {
      const mockEmployee = {
        id: 2,
        name: validDto.name,
        age: 29, // Should be calculated from date_of_birth
        designation: validDto.designation,
        hiring_date: new Date(validDto.hiring_date),
        date_of_birth: new Date(validDto.date_of_birth),
        salary: validDto.salary,
        photo_path: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);
      mockEmployeeRepository.updatePhotoPath.mockResolvedValue({
        ...mockEmployee,
        photo_path: 'employee-2.jpg',
      });

      const result = await employeeService.createEmployee(validDto, mockFile);

      // Age should be calculated (current year - birth year, adjusted for month/day)
      expect(result.age).toBeGreaterThanOrEqual(28);
      expect(result.age).toBeLessThanOrEqual(30);
    });

    it('should validate hiring date is after 18th birthday', async () => {
      // Employee born in 2005, hired in 2023 (18 years old) - should be valid
      const validYoungDto: ICreateEmployeeDto = {
        name: 'Young Employee',
        designation: 'Junior Developer',
        hiring_date: '2023-06-01',
        date_of_birth: '2005-03-01',
        salary: 50000,
      };

      const mockEmployee = {
        id: 3,
        name: validYoungDto.name,
        age: 18,
        designation: validYoungDto.designation,
        hiring_date: new Date(validYoungDto.hiring_date),
        date_of_birth: new Date(validYoungDto.date_of_birth),
        salary: validYoungDto.salary,
        photo_path: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);
      mockEmployeeRepository.updatePhotoPath.mockResolvedValue({
        ...mockEmployee,
        photo_path: 'employee-3.jpg',
      });

      const result = await employeeService.createEmployee(validYoungDto, mockFile);
      expect(result).toHaveProperty('id', 3);
    });
  });
});
