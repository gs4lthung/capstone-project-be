import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from '../services/video.service';
import { CreateVideoDto, UpdateVideoDto } from '@app/shared/videos/video.dto';
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
    return this.videoService.getVideoByLesson(id);
  }

  @Get('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Get videos by session id',
    description: 'Get all videos of a session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of videos',
  })
  @UseGuards(AuthGuard)
  async getVideosBySession(@Param('id') id: number) {
    return this.videoService.getVideoBySession(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Get video by id',
    description: 'Get a video by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video details',
  })
  @UseGuards(AuthGuard)
  async getVideoById(@Param('id') id: number) {
    return this.videoService.getVideoById(id);
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

  @Post('sessions/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Upload video for a session',
    description: 'Upload video for a session',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Video uploaded successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('video'))
  async uploadSessionVideo(
    @Param('id') id: number,
    @UploadedFile() videoFile: Express.Multer.File,
    @Body() data: CreateVideoDto,
  ) {
    return this.videoService.createSessionVideo(id, data, videoFile);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Update an existing video',
    description: 'Update an existing video with given data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video updated successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('video'))
  async updateVideo(
    @Param('id') id: number,
    @Body() data: UpdateVideoDto,
    @UploadedFile() videoFile?: Express.Multer.File,
  ) {
    return this.videoService.updateVideo(id, data, videoFile);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Videos'],
    summary: 'Delete a video',
    description: 'Delete a video by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video deleted successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async deleteVideo(@Param('id') id: number) {
    return this.videoService.deleteVideo(id);
  }
}
