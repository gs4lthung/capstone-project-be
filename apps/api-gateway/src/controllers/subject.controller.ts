import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SubjectService } from '../services/subject.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from '@app/shared/dtos/subjects/subject.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { PaginatedSubject } from '@app/database/entities/subject.entity';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Subjects'],
    summary: 'Get all subjects',
    description: 'Get all subjects',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subjects',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async findAllSubjects(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedSubject> {
    return this.subjectService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Subjects'],
    summary: 'Create a new subject',
    description: 'Create a new subject',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subject created successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async createSubject(@Body() data: CreateSubjectDto) {
    return this.subjectService.create(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Subjects'],
    summary: 'Update a subject',
    description: 'Update a subject',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject updated successfully',
  })
  async updateSubject(@Body() data: UpdateSubjectDto, @Param('id') id: number) {
    return this.subjectService.update(id, data);
  }
}
