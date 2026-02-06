import { Request } from 'express';
import { ITokenPayload } from './common.type';

export interface IAuthRequest extends Request {
  user?: ITokenPayload;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Augment Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export interface IRequestWithUser extends Request {
  user: ITokenPayload;
}
