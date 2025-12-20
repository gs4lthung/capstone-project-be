import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import {
  CreateCourtDto,
  UpdateCourtDto,
} from '@app/shared/dtos/courts/court.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';

@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Get all active courts',
    description: 'Retrieve a list of all active courts (isActive = true)',
  })
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return await this.courtService.findAll({
      pagination,
      sort,
      filter,
    });
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Get all courts (including inactive)',
    description:
      'Retrieve a list of all courts including both active and inactive courts',
  })
  async findAllIncludingInactive(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ) {
    return await this.courtService.findAllIncludingInactive({
      pagination,
      sort,
      filter,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Get court by ID',
    description: 'Retrieve a specific court by its ID',
  })
  async findOne(@Param('id') id: number) {
    return await this.courtService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Create a new court',
    description: 'Create a new court',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo sân thành công',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async create(@Body() data: CreateCourtDto) {
    return await this.courtService.create(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Update a court',
    description: 'Update a court',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật sân thành công',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCourtDto,
  ) {
    return await this.courtService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Delete a court',
    description: 'Delete a court',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa sân thành công',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.courtService.delete(id);
  }
}
