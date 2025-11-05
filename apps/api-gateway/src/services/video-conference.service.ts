import { AgoraService } from '@app/agora';
import { VideoConference } from '@app/database/entities/video-conference.entity';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { VideoConferenceResponseDto } from '@app/shared/dtos/video-conferences/video-conference.dto';
import {
  BadGatewayException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class VideoConferenceService {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(VideoConference)
    private readonly videoConferenceRepository: Repository<VideoConference>,
    private readonly agoraService: AgoraService,
  ) {}

  async findByCourseId(
    courseId: number,
  ): Promise<CustomApiResponse<VideoConferenceResponseDto>> {
    const videoConference = await this.videoConferenceRepository.findOne({
      where: { course: { id: courseId } },
    });
    if (!videoConference)
      throw new BadGatewayException(
        'Video conference not found for this course',
      );

    const vcToken = this.agoraService.generateRtcToken(
      videoConference.channelName,
      this.request.user.id as number,
      'publisher',
      4 * 3600, // 4 hours
    );

    return new CustomApiResponse<VideoConferenceResponseDto>(
      HttpStatus.OK,
      'Video conference retrieved successfully',
      {
        id: videoConference.id,
        channelName: videoConference.channelName,
        vcToken: vcToken,
      },
    );
  }
}
