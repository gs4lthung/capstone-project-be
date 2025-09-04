import { CloudinaryService } from '@app/cloudinary';
import { Video } from '@app/database/entities/video.entity';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';
@Injectable()
export class VideoServiceService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async uploadVideo(
    userId: number,
    data: UploadVideoDto,
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    },
  ) {
    try {
      const video = files.video[0];
      const thumbnail = files.video_thumbnail[0];
      const videoRes = await this.cloudinaryService.uploadFile({
        file: {
          ...video,
          buffer: fs.readFileSync(video.path as fs.PathOrFileDescriptor),
        },
      });
      console.log('Video uploaded to Cloudinary:', videoRes);

      const thumbnailRes = await this.cloudinaryService.uploadFile({
        file: {
          ...thumbnail,
          buffer: fs.readFileSync(thumbnail.path as fs.PathOrFileDescriptor),
        },
      });
      console.log('Thumbnail uploaded to Cloudinary:', thumbnailRes);

      await this.videoRepository.save({
        user: { id: userId },
        publicUrl: videoRes.url,
        thumbnailUrl: thumbnailRes.url,
        ...data,
      });

      return 'Video uploaded successfully';
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
