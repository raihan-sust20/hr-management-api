import jwt, { type SignOptions } from 'jsonwebtoken';
import { ITokenPayload, ITokenPair } from '../types/common.type';

export class JwtUtil {
  private static accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
  private static refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  private static accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
  private static refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  public static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    } as SignOptions);
  }

  public static generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    } as SignOptions);
  }

  public static generateTokenPair(payload: ITokenPayload): ITokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  public static verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  public static verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  public static decodeToken(token: string): ITokenPayload | null {
    try {
      return jwt.decode(token) as ITokenPayload;
    } catch (error) {
      return null;
    }
  }
}
