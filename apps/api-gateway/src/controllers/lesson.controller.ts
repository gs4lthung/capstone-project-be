import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateLessonRequestDto } from '@app/shared/dtos/lessons/lesson.dto';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Lessons'],
    summary: 'Get all lessons',
    description: 'Get all lessons',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lessons',
  })
  @UseGuards(AuthGuard)
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<any> {
    return this.lessonService.findAll({
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
    description: 'Lesson created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createSubject(
    @Param('id') id: number,
    @Body() data: CreateLessonRequestDto,
  ) {
    return this.lessonService.create(id, data);
  }
}
