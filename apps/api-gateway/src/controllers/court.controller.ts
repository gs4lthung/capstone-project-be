import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { ApiOperation } from '@nestjs/swagger';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';

@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Courts'],
    summary: 'Get all courts',
    description: 'Retrieve a list of all available courts',
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
}
