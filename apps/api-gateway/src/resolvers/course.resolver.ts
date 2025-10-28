import { Course } from '@app/database/entities/course.entity';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CourseService } from '../services/course.service';
import { PaginatedCourse } from '@app/shared/dtos/course/course.dto';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import { AuthGuard } from '../guards/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}
  @Query(() => PaginatedCourse, { name: 'courses' })
  @UseGuards(AuthGuard)
  async findRequests(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedCourse> {
    const requests = await this.courseService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return requests;
  }
}
