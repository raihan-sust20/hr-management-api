import { EmployeeService } from '../../../modules/employee/employee.service';
import { EmployeeRepository } from '../../../modules/employee/employee.repository';
import { ICreateEmployeeDto } from '../../../modules/employee/employee.type';
import { AppError } from '../../../common/middlewares/error.middleware';
import path from 'path';

// Mock the repository
const mockEmployeeRepository = {
  createEmployee: jest.fn(),
  updatePhotoPath: jest.fn(),
  findByIdWithDetails: jest.fn(),
  updateEmployee: jest.fn(),
  findAllWithFilters: jest.fn(),
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

  describe('updateEmployee', () => {
    const existingEmployee = {
      id: 1,
      name: 'John Doe',
      age: 29,
      designation: 'Software Engineer',
      hiring_date: new Date('2023-06-15'),
      date_of_birth: new Date('1995-03-20'),
      salary: 75000,
      photo_path: 'employee-1.jpg',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update employee with partial data (name and salary only)', async () => {
      const updateDto = {
        name: 'John Doe Updated',
        salary: 85000,
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.updateEmployee.mockResolvedValue({
        ...existingEmployee,
        name: updateDto.name,
        salary: updateDto.salary,
      });

      const result = await employeeService.updateEmployee(1, updateDto);

      expect(result).toHaveProperty('name', 'John Doe Updated');
      expect(result).toHaveProperty('salary', 85000);
      expect(mockEmployeeRepository.findByIdWithDetails).toHaveBeenCalledWith(1);
      expect(mockEmployeeRepository.updateEmployee).toHaveBeenCalled();
    });

    it('should throw 404 error if employee not found', async () => {
      const updateDto = { name: 'Test' };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(undefined);

      await expect(employeeService.updateEmployee(999, updateDto)).rejects.toThrow(AppError);
      await expect(employeeService.updateEmployee(999, updateDto)).rejects.toThrow(
        'Employee not found'
      );
      expect(mockEmployeeRepository.updateEmployee).not.toHaveBeenCalled();
    });

    it('should recalculate age when date_of_birth is updated', async () => {
      const updateDto = {
        date_of_birth: '1990-01-01', // Different DOB
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.updateEmployee.mockResolvedValue({
        ...existingEmployee,
        date_of_birth: new Date('1990-01-01'),
        age: 35, // Recalculated age
      });

      const result = await employeeService.updateEmployee(1, updateDto);

      expect(result.date_of_birth).toBe('1990-01-01');
      expect(result.age).toBeGreaterThanOrEqual(34);
      expect(result.age).toBeLessThanOrEqual(35);
    });

    it('should validate hiring eligibility when updating date_of_birth', async () => {
      const updateDto = {
        date_of_birth: '2010-01-01', // Too young for existing hiring date
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);

      await expect(employeeService.updateEmployee(1, updateDto)).rejects.toThrow(AppError);
      await expect(employeeService.updateEmployee(1, updateDto)).rejects.toThrow(
        'Employee must be at least 18 years old at the time of hiring'
      );
    });

    it('should validate hiring eligibility when updating hiring_date', async () => {
      const updateDto = {
        hiring_date: '2010-01-01', // Before employee was 18
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);

      await expect(employeeService.updateEmployee(1, updateDto)).rejects.toThrow(AppError);
      await expect(employeeService.updateEmployee(1, updateDto)).rejects.toThrow(
        'Employee must be at least 18 years old at the time of hiring'
      );
    });

    it('should validate when updating both dates together', async () => {
      const updateDto = {
        date_of_birth: '2005-01-01',
        hiring_date: '2020-01-01', // Only 15 years old at hiring
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);

      await expect(employeeService.updateEmployee(1, updateDto)).rejects.toThrow(AppError);
      await expect(employeeService.updateEmployee(1, updateDto)).rejects.toThrow(
        'Employee must be at least 18 years old at the time of hiring'
      );
    });

    it('should update photo and delete old photo file', async () => {
      const updateDto = {};

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.updateEmployee.mockResolvedValue({
        ...existingEmployee,
        photo_path: 'employee-1.jpg', // New photo with same name
      });

      const result = await employeeService.updateEmployee(1, updateDto, mockFile);

      expect(result).toHaveProperty('photo_path', 'employee-1.jpg');
      expect(mockEmployeeRepository.updateEmployee).toHaveBeenCalled();
    });

    it('should keep existing photo if no new photo provided', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.updateEmployee.mockResolvedValue({
        ...existingEmployee,
        name: 'Updated Name',
      });

      const result = await employeeService.updateEmployee(1, updateDto);

      expect(result).toHaveProperty('photo_path', 'employee-1.jpg');
      expect(result).toHaveProperty('name', 'Updated Name');
    });

    it('should update multiple fields together', async () => {
      const updateDto = {
        name: 'Complete Update',
        designation: 'Senior Engineer',
        salary: 95000,
      };

      mockEmployeeRepository.findByIdWithDetails.mockResolvedValue(existingEmployee);
      mockEmployeeRepository.updateEmployee.mockResolvedValue({
        ...existingEmployee,
        ...updateDto,
      });

      const result = await employeeService.updateEmployee(1, updateDto);

      expect(result).toHaveProperty('name', 'Complete Update');
      expect(result).toHaveProperty('designation', 'Senior Engineer');
      expect(result).toHaveProperty('salary', 95000);
    });
  });

  describe('listEmployees', () => {
    const mockEmployees = [
      {
        id: 1,
        name: 'Alice Johnson',
        age: 32,
        designation: 'Senior Software Engineer',
        hiring_date: new Date('2021-03-15'),
        date_of_birth: new Date('1992-05-20'),
        salary: 95000,
        photo_path: 'employee-1.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Bob Smith',
        age: 28,
        designation: 'Software Engineer',
        hiring_date: new Date('2023-01-10'),
        date_of_birth: new Date('1996-03-15'),
        salary: 75000,
        photo_path: 'employee-2.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should list employees with default pagination', async () => {
      mockEmployeeRepository.findAllWithFilters.mockResolvedValue({
        data: mockEmployees,
        total: 2,
      });

      const result = await employeeService.listEmployees({});

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(result.data[0]).not.toHaveProperty('photo_path');
      expect(result.data[0]).not.toHaveProperty('photoUrl');
      expect(mockEmployeeRepository.findAllWithFilters).toHaveBeenCalledWith({});
    });

    it('should list employees with custom pagination', async () => {
      mockEmployeeRepository.findAllWithFilters.mockResolvedValue({
        data: [mockEmployees[0]],
        total: 50,
      });

      const result = await employeeService.listEmployees({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
    });

    it('should enforce max limit of 100', async () => {
      mockEmployeeRepository.findAllWithFilters.mockResolvedValue({
        data: mockEmployees,
        total: 200,
      });

      const result = await employeeService.listEmployees({ limit: 200 });

      expect(result.meta.limit).toBe(100);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should filter by name', async () => {
      mockEmployeeRepository.findAllWithFilters.mockResolvedValue({
        data: [mockEmployees[0]],
        total: 1,
      });

      const result = await employeeService.listEmployees({ name: 'alice' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Alice Johnson');
      expect(mockEmployeeRepository.findAllWithFilters).toHaveBeenCalledWith({ name: 'alice' });
    });

    it('should return empty array when no results', async () => {
      mockEmployeeRepository.findAllWithFilters.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await employeeService.listEmployees({ name: 'nonexistent' });

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it('should not include photo_path or photoUrl in list response', async () => {
      mockEmployeeRepository.findAllWithFilters.mockResolvedValue({
        data: mockEmployees,
        total: 2,
      });

      const result = await employeeService.listEmployees({});

      result.data.forEach((employee) => {
        expect(employee).not.toHaveProperty('photo_path');
        expect(employee).not.toHaveProperty('photoUrl');
        expect(employee).toHaveProperty('id');
        expect(employee).toHaveProperty('name');
        expect(employee).toHaveProperty('age');
        expect(employee).toHaveProperty('designation');
        expect(employee).toHaveProperty('salary');
      });
    });
  });
});
