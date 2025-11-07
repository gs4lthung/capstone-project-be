import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from '../services/video.service';
import { CreateVideoDto } from '@app/shared/videos/video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('lessons/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Get videos by lesson id',
    description: 'Get all videos of a lesson',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of videos',
  })
  @UseGuards(AuthGuard)
  async getVideosByLesson(@Param('id') id: number) {
    return this.videoService.getVideosByLesson(id);
  }

  @Post('lessons/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Create a new lesson video',
    description: 'Create a new lesson video',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lesson video created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('video'))
  async createLessonVideo(
    @Param('id') id: number,
    @UploadedFile() videoFile: Express.Multer.File,
    @Body() data: CreateVideoDto,
  ) {
    return this.videoService.createLessonVideo(id, data, videoFile);
  }
}
