import { IBaseEntity } from '../../common/types/common.type';

// Database entity interface
export interface IEmployee extends IBaseEntity {
  name: string;
  age: number;
  designation: string;
  hiring_date: Date;
  date_of_birth: Date;
  salary: number;
  photo_path: string | null;
}

// DTO for creating employee (request payload - no age, no photo_path)
export interface ICreateEmployeeDto {
  name: string;
  designation: string;
  hiring_date: string; // Date string in format YYYY-MM-DD
  date_of_birth: string; // Date string in format YYYY-MM-DD
  salary: number;
}

// DTO for updating employee (all fields optional - partial update)
export interface IUpdateEmployeeDto {
  name?: string;
  designation?: string;
  hiring_date?: string; // Date string in format YYYY-MM-DD
  date_of_birth?: string; // Date string in format YYYY-MM-DD
  salary?: number;
  // Note: photo handled separately via multipart, not in DTO
  // Note: age is auto-calculated from date_of_birth if provided
}

// Response DTO with full photo URL
export interface IEmployeeResponseDto {
  id: number;
  name: string;
  age: number;
  designation: string;
  hiring_date: string;
  date_of_birth: string;
  salary: number;
  photo_path: string | null;
  // photoUrl: string | null;
  created_at: Date;
  updated_at: Date;
}

// Internal DTO for repository (includes calculated age and photo_path)
export interface ICreateEmployeeData {
  name: string;
  age: number;
  designation: string;
  hiring_date: Date;
  date_of_birth: Date;
  salary: number;
  photo_path: string | null;
}

// Query parameters for listing employees
export interface IListEmployeesQuery {
  page?: number;
  limit?: number;
  name?: string; // Search by name (ILIKE)
  sortBy?: 'name' | 'age' | 'designation' | 'hiring_date' | 'date_of_birth' | 'salary' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Minimal employee response for list (no photo URL)
export interface IEmployeeListItemDto {
  id: number;
  name: string;
  age: number;
  designation: string;
  hiring_date: string;
  date_of_birth: string;
  salary: number;
  created_at: Date;
  updated_at: Date;
}

// Paginated response
export interface IPaginatedEmployeesResponse {
  data: IEmployeeListItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
