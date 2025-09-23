import { Controller } from '@nestjs/common';
import { VideoServiceService } from './video-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { VideoMsgPattern } from '@app/shared/msg_patterns/video.msg_pattern';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';

@Controller()
export class VideoServiceController {
  constructor(private readonly videoServiceService: VideoServiceService) {}

  @MessagePattern({ cmd: VideoMsgPattern.UPLOAD_VIDEO })
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
  }): Promise<CustomApiResponse<void>> {
    return this.videoServiceService.uploadVideo(userId, data, files);
  }
}
