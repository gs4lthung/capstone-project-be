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
          fileName = `${baseName}${extension}`;
          break;
      }

      cb(null, fileName);
    },
  });
}
