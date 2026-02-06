import { injectable, inject } from 'tsyringe';
import { AuthRepository } from './auth.repository';
import {
  IRegisterDto,
  ILoginDto,
  ILoginResponse,
  IUserResponseDto,
  IRefreshTokenResponse,
} from './auth.type';
import { JwtUtil } from '../../common/utils/jwt.util';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../../common/constants/http-status.constant';
import { ITokenPayload } from '../../common/types/common.type';

@injectable()
export class AuthService {
  constructor(@inject(AuthRepository) private authRepository: AuthRepository) {}

  public async login(loginDto: ILoginDto): Promise<ILoginResponse> {
    // Find user by email
    const user = await this.authRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new AppError(
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isPasswordValid = await this.authRepository.verifyPassword(
      loginDto.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new AppError(
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const tokens = JwtUtil.generateTokenPair(tokenPayload);

    // Return user data without password_hash
    const userResponse = this.toUserResponse(user);

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private toUserResponse(user: any): IUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
