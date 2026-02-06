import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from './error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.constant';

export class UploadMiddleware {
  private static uploadPath = process.env.UPLOAD_PATH || './uploads';
  private static maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

  // Ensure upload directory exists
  static {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  private static storage: StorageEngine = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      cb(null, UploadMiddleware.uploadPath);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
  });

  private static imageFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.FILE_UPLOAD_ERROR
        )
      );
    }
  };

  private static documentFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX files are allowed.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.FILE_UPLOAD_ERROR
        )
      );
    }
  };

  public static uploadImage() {
    return multer({
      storage: this.storage,
      fileFilter: this.imageFilter,
      limits: {
        fileSize: this.maxFileSize,
      },
    }).single('photo');
  }

  public static uploadImages(maxCount: number = 10) {
    return multer({
      storage: this.storage,
      fileFilter: this.imageFilter,
      limits: {
        fileSize: this.maxFileSize,
      },
    }).array('photos', maxCount);
  }

  public static uploadDocument() {
    return multer({
      storage: this.storage,
      fileFilter: this.documentFilter,
      limits: {
        fileSize: this.maxFileSize,
      },
    }).single('document');
  }

  public static uploadDocuments(maxCount: number = 10) {
    return multer({
      storage: this.storage,
      fileFilter: this.documentFilter,
      limits: {
        fileSize: this.maxFileSize,
      },
    }).array('documents', maxCount);
  }

  public static uploadAny() {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: this.maxFileSize,
      },
    }).any();
  }
}
