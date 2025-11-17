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
  Get,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import {
  CreateCourseRequestDto,
  UpdateCourseDto,
} from '@app/shared/dtos/course/course.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Course } from '@app/database/entities/course.entity';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeLimitEnum } from '@app/shared/enums/file.enum';

@Controller('courses')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);
  constructor(private readonly courseService: CourseService) {}

  @Get('available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Get available courses',
    description: 'Retrieve a list of all available courses',
  })
  async getAvailableCourses(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('province') province: number,
    @Query('district') district: number,
  ): Promise<PaginateObject<Course>> {
    const courses = await this.courseService.findAvailableCourses(
      page,
      size,
      province,
      district,
    );
    return courses;
  }

  @Get('coach')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Get courses for coach',
    description:
      'Retrieve a list of courses created by the authenticated coach',
  })
  @UseGuards(AuthGuard)
  async getCoursesForCoach(
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<PaginateObject<Course>> {
    return await this.courseService.findCoachCourses(page, size);
  }

  @Get('learner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Get courses for learner',
    description: 'Retrieve a list of courses available to the learner',
  })
  @UseGuards(AuthGuard)
  async getCoursesForLearner(
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<PaginateObject<Course>> {
    return await this.courseService.findLearnerCourses(page, size);
  }

  @Get('learner/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Get learner course by ID',
    description:
      'Retrieve a specific course that belongs to the authenticated learner',
  })
  @UseGuards(AuthGuard)
  async getLearnerCourseById(@Param('id') id: number): Promise<Course> {
    return await this.courseService.findLearnerCourse(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Get all courses',
    description: 'Retrieve a list of all available courses',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of courses retrieved successfully',
  })
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginateObject<Course>> {
    return await this.courseService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Get course by ID',
    description: 'Retrieve a specific course by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async findOne(@Param('id') id: number): Promise<Course> {
    return await this.courseService.findOne(id);
  }

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
  @UseInterceptors(
    FileInterceptor('course_image', {
      limits: { fileSize: FileSizeLimitEnum.IMAGE },
    }),
  )
  async createCourse(
    @Param('id') subjectId: number,
    @Body() data: CreateCourseRequestDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.courseService.createCourseCreationRequest(
      subjectId,
      data,
      file,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Update an existing course creation request',
    description: 'Update an existing course creation request with given data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course creation request updated successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(
    FileInterceptor('course_image', {
      limits: { fileSize: FileSizeLimitEnum.IMAGE },
    }),
  )
  async updateCourseCreationRequest(
    @Param('id') id: number,
    @Body() data: UpdateCourseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.courseService.update(id, data, file);
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

  @Patch('requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courses'],
    summary: 'Reject a course creation request',
    description: 'Reject a course creation request with given ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course creation request rejected successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async rejectCourseCreationRequest(
    @Param('id') id: number,
    @Body('reason') reason: string,
  ): Promise<CustomApiResponse<void>> {
    return this.courseService.rejectCourseCreationRequest(id, reason);
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
  async learnerCancelEnrollment(
    @Param('id') courseId: number,
  ): Promise<CustomApiResponse<void>> {
    return this.courseService.learnerCancelCourse(courseId);
  }
}
