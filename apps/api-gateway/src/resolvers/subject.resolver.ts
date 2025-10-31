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
import { SubjectService } from '../services/subject.service';
import { PaginatedGqlArgs } from '@app/shared/graphql/paginated-gql-args';
import {
  PaginatedSubject,
  Subject,
} from '@app/database/entities/subject.entity';

@Resolver(() => Subject)
export class SubjectResolver {
  constructor(private readonly subjectService: SubjectService) {}

  @Query(() => PaginatedSubject, { name: 'subjects' })
  @UseGuards(AuthGuard)
  async findSubjects(
    @Args() args: PaginatedGqlArgs,
    @PaginationParams()
    pagination: Pagination,
    @SortingParams() sort: Sorting,
    @FilteringParams() filter: Filtering,
  ): Promise<PaginatedSubject> {
    const subjects = await this.subjectService.findAll({
      pagination,
      sort,
      filter,
    } as FindOptions);
    return subjects;
  }

  @Query(() => Subject, { name: 'subject' })
  @UseGuards(AuthGuard)
  async findSubjectById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Subject> {
    const subject = this.subjectService.findOne(id);
    return subject;
  }
}
