export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: IErrorDetails;
  meta?: IPaginationMeta;
}

export interface IErrorDetails {
  code: string;
  details?: unknown;
  stack?: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IBaseEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ITokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export enum UserRole {
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  EMPLOYEE = 'employee',
}

export interface IUploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}