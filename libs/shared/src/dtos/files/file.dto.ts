import { BadRequestException } from '@nestjs/common';

export class UploadFileDto {
  file: Express.Multer.File;

  constructor(partial: Partial<UploadFileDto>) {
    if (!partial.file) {
      throw new BadRequestException('File is required');
    }
    partial.file.buffer = Buffer.isBuffer(partial.file.buffer)
      ? partial.file.buffer
      : Buffer.from(partial.file.buffer);

    Object.assign(this, partial);
  }
}

export class UploadLearnerVideoDto {
  sessionId?: number;
  coachVideoId?: number;
  duration: number;
  tags?: string[];
}
