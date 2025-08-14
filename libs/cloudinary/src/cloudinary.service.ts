import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { ExceptionUtils } from '@app/shared/utils/exception.util';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    prefix: string,
    postfix: string,
    file: Express.Multer.File,
  ): Promise<CloudinaryResponse> {
    try {
      if (!file.buffer) {
        throw new Error('File buffer is empty');
      }

      const actualBuffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer);

      return new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: `${prefix}:${postfix}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        streamifier.createReadStream(actualBuffer).pipe(uploadStream);
      });
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
