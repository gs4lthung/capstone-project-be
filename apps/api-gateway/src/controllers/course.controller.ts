import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateCourseRequestDto } from '@app/shared/dtos/course/course.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';

@Controller('courses')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);
  constructor(private readonly courseService: CourseService) {}

  @Post('subjects/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Create a new course creation request',
    description: 'Create a new course creation request with given data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createCourse(
    @Param('id') subjectId: number,
    @Body() data: CreateCourseRequestDto,
  ) {
    return this.courseService.createCourseCreationRequest(subjectId, data);
  }

  @Patch('requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Approve a course creation request',
    description: 'Approve a course creation request with given ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course creation request approved successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async approveCourseCreationRequest(
    @Param('id') id: number,
  ): Promise<CustomApiResponse<void>> {
    return this.courseService.approveCourseCreationRequest(id);
  }

  @Patch(':id/learners/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Cancel learner enrollment in a course',
    description:
      'Allows a learner to cancel their enrollment in a specific course',
  })
  @UseGuards(AuthGuard)
  async cancelLearnerEnrollment(
    @Param('id') courseId: number,
  ): Promise<CustomApiResponse<void>> {
    return this.courseService.learnerCancelCourse(courseId);
  }
}
