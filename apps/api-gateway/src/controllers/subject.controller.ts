import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
  @UseGuards(AuthGuard)
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<any> {
    return this.subjectService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Subjects'],
    summary: 'Get subject by id',
    description: 'Get a subject by its id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject details',
  })
  @UseGuards(AuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id);
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
    description: 'Tạo môn học thành công',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async create(@Body() data: CreateSubjectDto) {
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
    description: 'Cập nhật môn học thành công',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async update(@Body() data: UpdateSubjectDto, @Param('id') id: number) {
    return this.subjectService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Subjects'],
    summary: 'Delete a subject',
    description: 'Delete a subject',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject deleted successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async delete(@Param('id') id: number) {
    return this.subjectService.delete(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Subjects'],
    summary: 'Restore a deleted subject',
    description: 'Restore a deleted subject',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject restored successfully',
  })
  @CheckRoles(UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async restore(@Param('id') id: number) {
    return this.subjectService.restore(id);
  }
}
