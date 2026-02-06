import { Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthService } from './auth.service';
import { IAuthRequest } from '../../common/types/express.type';
import { ResponseUtil } from '../../common/utils/response.util';
import { IRegisterDto, ILoginDto, IRefreshTokenDto } from './auth.type';

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private authService: AuthService) {}

  public login = async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const loginDto: ILoginDto = req.body;
      const result = await this.authService.login(loginDto);

      return ResponseUtil.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  };
}
