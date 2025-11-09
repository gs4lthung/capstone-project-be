import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { EnrollmentService } from '../services/enrollment.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { Enrollment } from '@app/database/entities/enrollment.entity';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['Enrollments'],
    summary: 'Get all enrollments',
    description: 'Retrieve a list of all enrollments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of enrollments retrieved successfully',
  })
  async findAll(
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginateObject<Enrollment>> {
    return await this.enrollmentService.findAll({
      pagination,
      sort,
      filter,
    });
  }
}
