import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LearnerProgressService } from '../services/learner-progress.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CourseStatus } from '@app/shared/enums/course.enum';

@Controller('learner-progresses')
export class LearnerProgressController {
  constructor(
    private readonly learnerProgressService: LearnerProgressService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Learner Progresses'],
    summary: 'Get all learner progresses',
    description: 'Retrieve all learner progress data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of learner progresses retrieved successfully',
  })
  @UseGuards(AuthGuard)
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return this.learnerProgressService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
  }

  @Get('/coaches')
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
  @UseGuards(AuthGuard)
  async getProgressForCourse(@Query('courseStatus') courseStatus: string) {
    return this.learnerProgressService.getProgressForCourse(
      courseStatus as CourseStatus,
    );
  }

  @Get('/coaches/details')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Learner Progresses'],
    summary: 'Get detailed learner progress for a specific user and course',
    description:
      'Retrieve detailed learner progress data for the specified user and course',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Learner progress details retrieved successfully',
  })
  @UseGuards(AuthGuard)
  async getLearnerProgressDetails(
    @Query('userId') userId: number,
    @Query('courseId') courseId: number,
  ) {
    return this.learnerProgressService.getLearnerProgressDetails(
      userId,
      courseId,
    );
  }
}
