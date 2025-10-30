import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { HttpStatus } from '@nestjs/common';

export class UploadFileDto {
  file: Express.Multer.File;

  constructor(partial: Partial<UploadFileDto>) {
    if (!partial.file) {
      throw new CustomRpcException('File is required', HttpStatus.BAD_REQUEST);
    }
    partial.file.buffer = Buffer.isBuffer(partial.file.buffer)
      ? partial.file.buffer
      : Buffer.from(partial.file.buffer);

    Object.assign(this, partial);
  }
}

export class UploadLearnerVideoDto {
  lessonId: number;
  sessionId?: number;
  duration: number;
  tags?: string[];
}
