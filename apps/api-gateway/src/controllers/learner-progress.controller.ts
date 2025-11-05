import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { LearnerProgressService } from '../services/learner-progress.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('learner-progresses')
export class LearnerProgressController {
  constructor(
    private readonly learnerProgressService: LearnerProgressService,
  ) {}

  @Get('courses/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Learner Progresses'],
    summary: 'Get learner progresses for a specific course',
    description: 'Retrieve learner progress data for the specified course',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Learner progresses retrieved successfully',
  })
  async getProgressForCourse(@Param('id') courseId: number) {
    return this.learnerProgressService.getProgressForCourse(courseId);
  }
}
