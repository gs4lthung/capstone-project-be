import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { UploadFileDto } from '@app/shared/dtos/files/file.dto';

@Injectable()
export class CloudinaryService {
  async uploadFile(data: UploadFileDto): Promise<CloudinaryResponse> {
    try {
      console.log(data.file);
      return new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: data.file.path.replace(/\\/g, '/'),
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        streamifier.createReadStream(data.file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
