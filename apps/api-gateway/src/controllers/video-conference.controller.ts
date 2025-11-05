import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VideoConferenceService } from '../services/video-conference.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VideoConferenceResponseDto } from '@app/shared/dtos/video-conferences/video-conference.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { AuthGuard } from '../guards/auth.guard';

@Controller('video-conferences')
export class VideoConferenceController {
  constructor(
    private readonly videoConferenceService: VideoConferenceService,
  ) {}

  @Get('courses/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video conference retrieved successfully',
  })
  @UseGuards(AuthGuard)
  async getByCourseId(
    @Param('id') courseId: number,
  ): Promise<CustomApiResponse<VideoConferenceResponseDto>> {
    return await this.videoConferenceService.findByCourseId(courseId);
  }
}
