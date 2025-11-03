import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PaginationParams } from '@app/shared/decorators/pagination-params.decorator';
import { Pagination } from '@app/shared/interfaces/pagination.interface';
import { SortingParams } from '@app/shared/decorators/sorting-params.decorator';
import { Sorting } from '@app/shared/interfaces/sorting.interface';
import { FilteringParams } from '@app/shared/decorators/filtering-params.decorator';
import { Filtering } from '@app/shared/interfaces/filtering.interface';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CourseService } from '../services/course.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import { Course, PaginatedCourse } from '@app/database/entities/course.entity';
import { Session } from '@app/database/entities/session.entity';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}
  @Query(() => PaginatedCourse, { name: 'courses' })
  @UseGuards(AuthGuard)
  async findCourses(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedCourse> {
    console.log('Args received in findCourses:', {
      args,
      pagination,
      sort,
      filter,
    });
    const courses = await this.courseService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return courses;
  }

  @Query(() => Course, { name: 'course' })
  @UseGuards(AuthGuard)
  async findCourseById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Course> {
    const course = this.courseService.findOne(id);
    return course;
  }
}
