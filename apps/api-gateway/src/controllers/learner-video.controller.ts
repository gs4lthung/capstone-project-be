import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  HttpStatus,
  HttpCode,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { LearnerVideoService } from '../services/learner-video.service';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { UploadLearnerVideoDto } from '@app/shared/dtos/files/file.dto';
import { SaveAiFeedbackDto } from '@app/shared/dtos/ai-feedback/ai-feedback.dto';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '@app/shared/enums/user.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('learner-videos')
export class LearnerVideoController {
  constructor(private readonly learnerVideoService: LearnerVideoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Learner Videos'],
    summary: 'Upload a learner video',
    description: 'Upload a video for learner practice',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Learner video uploaded successfully',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.LEARNER)
  @UseInterceptors(FileInterceptor('video'))
  async uploadLearnerVideo(
    @UploadedFile() videoFile: Express.Multer.File,
    @Body() data: UploadLearnerVideoDto,
    @Req() req: CustomApiRequest,
  ) {
    const result = await this.learnerVideoService.upload(videoFile, data, {
      id: Number(req.user.id),
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'LEARNER_VIDEO.UPLOAD_SUCCESS',
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async getLearnerVideos(
    @Query('lessonId') lessonId?: number,
    @Query('sessionId') sessionId?: number,
    @Query('userId') userId?: number,
  ) {
    return this.learnerVideoService.findAll({ lessonId, sessionId, userId });
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Learner Videos'],
    summary: 'Get learner videos by user',
    description:
      'Get all learner videos for a specific user, optionally filtered by session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of learner videos',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.LEARNER)
  async getLearnerVideosByUser(
    @Param('userId') userId: number,
    @Query('sessionId') sessionId?: number,
  ) {
    return this.learnerVideoService.findAll({ userId, sessionId });
  }

  @Get(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async getLearnerVideoById(@Param('id') id: number) {
    return this.learnerVideoService.findOneFull(id);
  }

  @Post(':learnerVideoId/ai-feedback')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Learner Videos'],
    summary: 'Save AI feedback for learner video',
    description:
      'Save AI-generated feedback and analysis results for a learner video',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AI feedback saved successfully',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async saveAiFeedback(
    @Param('learnerVideoId') learnerVideoId: number,
    @Body() aiFeedback: SaveAiFeedbackDto,
  ) {
    return this.learnerVideoService.saveAiFeedback(learnerVideoId, aiFeedback);
  }

  @Post(':learnerVideoId/overlay-video/:coachVideoId')
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.LEARNER)
  @UseInterceptors(FileInterceptor('overlayVideo'))
  async uploadOverlayVideo(
    @Param('learnerVideoId') learnerVideoId: number,
    @Param('coachVideoId') coachVideoId: number,
  ) {
    return this.learnerVideoService.generateOverlayVideo(
      learnerVideoId,
      coachVideoId,
    );
  }
}
