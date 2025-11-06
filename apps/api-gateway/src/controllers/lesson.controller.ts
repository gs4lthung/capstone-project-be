import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import {
  CreateLessonRequestDto,
  UpdateLessonDto,
} from '@app/shared/dtos/lessons/lesson.dto';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Lessons'],
    summary: 'Get all lessons',
    description: 'Retrieve a list of all available lessons',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of lessons retrieved successfully',
  })
  @UseGuards(AuthGuard)
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return await this.lessonService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
  }

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
  async createSubject(
    @Param('id') id: number,
    @Body() data: CreateLessonRequestDto,
  ) {
    return this.lessonService.create(id, data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Lessons'],
    summary: 'Update a lesson',
    description: 'Update a lesson',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lesson updated successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async updateLesson(@Param('id') id: number, @Body() data: UpdateLessonDto) {
    return this.lessonService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Lessons'],
    summary: 'Delete a lesson',
    description: 'Delete a lesson',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lesson deleted successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async deleteLesson(@Param('id') id: number) {
    return this.lessonService.delete(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Lessons'],
    summary: 'Restore a deleted lesson',
    description: 'Restore a deleted lesson',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lesson restored successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async restoreLesson(@Param('id') id: number) {
    return this.lessonService.restore(id);
  }
}
