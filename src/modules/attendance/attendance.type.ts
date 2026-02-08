// Database entity matching the attendance table schema
export interface IAttendance {
  id: number;
  employee_id: number;
  date: Date;
  check_in_time: Date;
}

// Request DTO for creating/updating attendance
export interface ICreateAttendanceDto {
  employee_id: number;
  date: string; // YYYY-MM-DD format
  check_in_time: string; // ISO 8601 timestamp
}

// Response DTO
export interface IAttendanceResponseDto {
  id: number;
  employee_id: number;
  date: string; // YYYY-MM-DD format
  check_in_time: string; // ISO 8601 timestamp
}

// Query parameters for listing attendance
export interface IListAttendanceQuery {
  employee_id?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'check_in_time' | 'employee_id';
  sortOrder?: 'asc' | 'desc';
}

// List item DTO (same as response DTO - minimal)
export interface IAttendanceListItemDto {
  id: number;
  employee_id: number;
  date: string;
  check_in_time: string;
}

// Paginated response
export interface IPaginatedAttendanceResponse {
  data: IAttendanceListItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
