import { HttpStatus } from '@nestjs/common';
import * as path from 'path';
import { CustomRpcException } from '../customs/custom-rpc-exception';
import * as multer from 'multer';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { CustomApiRequest } from '../customs/custom-api-request';

export class FileUtils {
  static logger = new Logger(FileUtils.name);

  static fileFilter(
    req: Request,
    file: { fieldname: string; mimetype: string; originalname: string },
    cb: (arg0: CustomRpcException, arg1: boolean) => void,
  ) {
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const allowedVideoTypes =
      /mp4|avi|flv|wmv|mp3|quicktime|mov|x-matroska|mkv/;

    let allowedTypes: RegExp, formatMessage: string;

    if (file.fieldname === 'video') {
      allowedTypes = allowedVideoTypes;
      formatMessage = 'Allowed formats: mp3, mp4, avi, flv, wmv, mov, mkv';
    } else {
      allowedTypes = allowedImageTypes;
      formatMessage = 'Allowed formats: jpeg, jpg, png, gif';
    }

    const isMimeTypeValid = allowedTypes.test(file.mimetype);
    const isExtensionValid = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (isMimeTypeValid && isExtensionValid) {
      return cb(null, true);
    }

    const errorMessage = `Invalid format. ${formatMessage}`;

    cb(new CustomRpcException(errorMessage, HttpStatus.BAD_GATEWAY), false);
  }

  static fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const customReq = req as unknown as CustomApiRequest;

      let destination = '/uploads';

      switch (file.fieldname) {
        case 'avatar':
          destination = `uploads/users/${customReq.user.id}/avatar`;
          break;
        case 'video':
          destination = `uploads/users/${customReq.user.id}/videos`;
          break;
        case 'video_thumbnail':
          destination = `uploads/users/${customReq.user.id}/videos/thumbnails`;
          break;
        case 'credential_image':
          destination = `uploads/users/${customReq.user.id}/credentials`;
          break;
      }

      fs.mkdir(destination, { recursive: true }, (err) => {
        if (err) {
          FileUtils.logger.error(
            `Failed to create directory ${destination}: ${err.message}`,
          );
          return cb(err, destination);
        }
        cb(null, destination);
      });
    },

    filename: (req, file, cb) => {
      const baseName = req.headers['content-length'] + '_' + Date.now();
      const extension = path.extname(file.originalname);
      let fileName = '';

      switch (file.fieldname) {
        case 'avatar':
          fileName = `avatar_${baseName}${extension}`;
          break;
        case 'video':
          fileName = `video_${baseName}${extension}`;
          break;
        case 'video_thumbnail':
          fileName = `video_thumbnail_${baseName}${extension}`;
          break;
        case 'credential_image':
          fileName = `credential_image_${baseName}${extension}`;
          break;
      }

      cb(null, fileName);
    },
  });

  static excludeFileFromPath(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return path.dirname(filePath);
  }

  static convertFilePathToExpressFilePath(
    filePath: string | Error,
  ): fs.PathOrFileDescriptor {
    if (filePath instanceof Error) {
      throw filePath;
    }
    return filePath;
  }

  static getFileFromFolder(folderPath: string): Express.Multer.File[] {
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }

    return fs.readdirSync(folderPath).map((file) => {
      const filePath = path.join(folderPath, file);
      return {
        buffer: fs.readFileSync(filePath),
        originalname: file,
        path: filePath,
      } as Express.Multer.File;
    });
  }

  static deleteFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    fs.unlinkSync(filePath);
  }

  static deleteFilesInFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }

    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
}
