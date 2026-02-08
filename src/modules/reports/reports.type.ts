import { IBaseEntity } from '../../common/types/common.type';

// Query parameters for attendance report
export interface IAttendanceReportQuery {
  month?: string; // YYYY-MM format (required)
  employee_id?: number; // Optional filter
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'employee_id' | 'days_present' | 'times_late';
  sortOrder?: 'asc' | 'desc';
}

// Individual employee report item
export interface IAttendanceReportItem {
  employee_id: number;
  name: string;
  days_present: number;
  times_late: number;
}

// Report response data
export interface IAttendanceReportData {
  month: string;
  total_working_days: number;
  summary: IAttendanceReportItem[];
  total_employees: number;
}

// Paginated report response
export interface IPaginatedAttendanceReportResponse {
  data: IAttendanceReportData;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
