import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';
import { VideoMsgPattern } from '@app/shared/msg_patterns/video.msg_pattern';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class VideoService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @Inject('VIDEO_SERVICE') private readonly videoService: ClientProxy,
  ) {}

  async uploadVideo(
    data: UploadVideoDto,
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    },
  ) {
    const pattern = { cmd: VideoMsgPattern.UPLOAD_VIDEO };
    const payload = { userId: this.request.user.id, data, files };

    const response = await lastValueFrom(
      this.videoService.send<CustomApiResponse<void>>(pattern, payload),
    );
    return response;
  }
}
