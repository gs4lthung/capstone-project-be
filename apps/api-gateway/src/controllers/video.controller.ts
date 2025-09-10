import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UploadVideoDto } from '@app/shared/dtos/videos/video.dto';
import { VideoService } from '../services/video.service';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}
  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'video_thumbnail', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: FileSizeLimitEnum.VIDEO,
        },
      },
    ),
  )
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Video'],
    summary: 'Upload Video',
    description: 'Upload a new video',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Video uploaded successfully',
  })
  async uploadVideo(
    @Body() data: UploadVideoDto,
    @UploadedFiles()
    files: {
      video: Express.Multer.File[];
      video_thumbnail: Express.Multer.File[];
    },
  ) {
    return this.videoService.uploadVideo(data, files);
  }
}
