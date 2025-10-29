import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateLessonRequestDto } from '@app/shared/dtos/lessons/lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('subjects/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Lessons'],
    summary: 'Create a new lesson',
    description: 'Create a new lesson',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subject created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('video'))
  async createSubject(
    @Param('id') id: number,
    @UploadedFile() videoFile: Express.Multer.File,
    @Body() data: CreateLessonRequestDto,
  ) {
    return this.lessonService.create(id, videoFile, data);
  }
}
