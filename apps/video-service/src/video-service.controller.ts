import { Controller } from '@nestjs/common';
import { VideoServiceService } from './video-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';

@Controller()
export class VideoServiceController {
  constructor(private readonly videoServiceService: VideoServiceService) {}

  @MessagePattern({ cmd: 'upload_video' })
  async uploadVideo({
    userId,
    data,
    files,
  }: {
    userId: number;
    data: UploadVideoDto;
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    };
  }) {
    return this.videoServiceService.uploadVideo(userId, data, files);
  }
}
