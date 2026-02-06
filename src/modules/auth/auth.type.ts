import { IBaseEntity } from '../../common/types/common.type';

// Database entity interface
export interface IHrUser extends IBaseEntity {
  email: string;
  password_hash: string;
  name: string;
}

// DTO for creating a user (without auto-generated fields)
export interface ICreateUserDto {
  email: string;
  password: string;
  name: string;
}

// DTO for user registration
export interface IRegisterDto {
  email: string;
  password: string;
  name: string;
}

// DTO for user login
export interface ILoginDto {
  email: string;
  password: string;
}

// Response DTO (without sensitive data like password_hash)
export interface IUserResponseDto {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// DTO for updating user
export interface IUpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
}

// Login response with tokens
export interface ILoginResponse {
  user: IUserResponseDto;
  accessToken: string;
  refreshToken: string;
}

// Refresh token request
export interface IRefreshTokenDto {
  refreshToken: string;
}

// Refresh token response
export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
