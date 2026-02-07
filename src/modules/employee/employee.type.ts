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
  photoUrl: string | null;
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
