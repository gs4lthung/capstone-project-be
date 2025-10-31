import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { EnrollmentService } from '../services/enrollment.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import {
  PaginatedEnrollment,
  Enrollment,
} from '@app/database/entities/enrollment.entity';

@Resolver(() => Enrollment)
export class EnrollmentResolver {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Query(() => PaginatedEnrollment, { name: 'enrollments' })
  @UseGuards(AuthGuard)
  async findEnrollments(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedEnrollment> {
    const enrollments = await this.enrollmentService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return enrollments;
  }

  @Query(() => Enrollment, { name: 'enrollment' })
  @UseGuards(AuthGuard)
  async findEnrollmentById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Enrollment> {
    const enrollment = this.enrollmentService.findOne(id);
    return enrollment;
  }
}
