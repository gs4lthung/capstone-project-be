import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  HttpStatus,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { LearnerVideoService } from '../services/learner-video.service';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { UploadLearnerVideoDto } from '@app/shared/dtos/files/file.dto';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '@app/shared/enums/user.enum';

@Controller('learner-videos')
export class LearnerVideoController {
  constructor(private readonly learnerVideoService: LearnerVideoService) {}

  @Post()
  @UseGuards(AuthGuard)
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

  @Get(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async getLearnerVideoById(@Param('id') id: number) {
    return this.learnerVideoService.findOneFull(id);
  }

  @Post(':learnerVideoId/ai-feedback')
  @UseGuards(AuthGuard, RoleGuard)
  @CheckRoles(UserRole.COACH)
  async saveAiFeedback(
    @Param('learnerVideoId') learnerVideoId: number,
    @Body('text') aiText: any,
  ) {
    return this.learnerVideoService.saveAiFeedback(learnerVideoId, aiText);
  }
}
