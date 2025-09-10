import { Video } from '@app/database/entities/video.entity';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';
import { AwsService } from '@app/aws';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
@Injectable()
export class VideoServiceService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly awsService: AwsService,
  ) {}
  async uploadVideo(
    userId: number,
    data: UploadVideoDto,
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    },
  ): Promise<CustomApiResponse<void>> {
    try {
      const video = files.video[0];
      const thumbnail = files.video_thumbnail[0];
      const videoRes = await this.awsService.uploadFileToPublicBucket({
        file: {
          ...video,
          buffer: fs.readFileSync(video.path as fs.PathOrFileDescriptor),
        },
      });

      const thumbnailRes = await this.awsService.uploadFileToPublicBucket({
        file: {
          ...thumbnail,
          buffer: fs.readFileSync(thumbnail.path as fs.PathOrFileDescriptor),
        },
      });

      await this.videoRepository.save({
        user: { id: userId },
        publicUrl: videoRes.url,
        thumbnailUrl: thumbnailRes.url,
        ...data,
      });

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'VIDEO.UPLOAD_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
