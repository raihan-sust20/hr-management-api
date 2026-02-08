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
